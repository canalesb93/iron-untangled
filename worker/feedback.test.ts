import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cleanSubject, countLinks, formatIssue, neutralize, resolveContext, sameOrigin, validate, type BundleLike, type Report } from './feedback.ts';
import worker, { type Env } from './index.ts';

const good = { chapter: 10, kind: 'travel', subject: 'x', message: 'They rode a cart here, not a train.', context: { hop: { at: 10, from: 's131', to: 's149' }, build: 'index-AbC123.js' } };
const ok = (x: unknown) => { const v = validate(x); assert.ok(v.ok, JSON.stringify(v)); return v.report; };
const bad = (x: unknown, code: string, field?: string) => { const v = validate(x); assert.equal(v.ok, false); if (!v.ok) { assert.equal(v.code, code); if (field) assert.equal(v.field, field); } };

test('validate: accepts a well-formed report', () => {
  const r = ok(good);
  assert.equal(r.chapter, 10);
  assert.deepEqual(r.context.hop, { at: 10, from: 's131', to: 's149' });
});

test('validate: rejects wrong shapes and sizes', () => {
  bad(null, 'bad_json');
  bad([], 'bad_json');
  bad({ ...good, chapter: -1 }, 'invalid', 'chapter');
  bad({ ...good, chapter: 2.5 }, 'invalid', 'chapter');
  bad({ ...good, chapter: '10' }, 'invalid', 'chapter');
  bad({ ...good, kind: 'toString' }, 'invalid', 'kind');
  bad({ ...good, kind: 'spam' }, 'invalid', 'kind');
  bad({ ...good, message: 'short' }, 'too_short', 'message');
  bad({ ...good, message: '          \n\n   ' }, 'too_short');
  bad({ ...good, message: 'a'.repeat(2001) }, 'too_long');
  bad({ ...good, message: 'line\n'.repeat(70) }, 'too_long');
  bad({ ...good, context: { entry: '../../etc' } }, 'invalid', 'context');
  bad({ ...good, context: { hop: { at: 11, from: 's1', to: 's2' } } }, 'invalid', 'context'); // later than the reader's chapter
  bad({ ...good, context: { build: 'a b' } }, 'invalid', 'context');
  bad({ ...good, subject: 'x'.repeat(201) }, 'invalid', 'subject');
});

test('validate: link spam', () => {
  assert.equal(countLinks('see https://a.example and www.b.example'), 2);
  ok({ ...good, message: 'The wiki says otherwise: https://example.org/wiki/page' });
  bad({ ...good, message: 'cheap http://a.example http://b.example' }, 'links');
  bad({ ...good, message: 'buy [url=x]now[/url] www.spam.example' }, 'links');
});

test('validate: honeypot is flagged, not an error', () => {
  const v = validate({ ...good, website: 'http://bot.example' });
  assert.ok(v.ok && v.honeypot);
  const w = validate({ ...good, website: '' });
  assert.ok(w.ok && !w.honeypot);
});

test('validate: strips hidden characters and normalises whitespace', () => {
  const r = ok({ ...good, message: '  a‮b​c\r\n\r\n\r\n\r\nnext line ok  ' });
  assert.equal(r.message, 'abc\n\nnext line ok');
});

test('neutralize: mentions, references and links are inert', () => {
  const s = neutralize('@octocat and @org/team, see #12, owner/repo#3, GH-4, mail me@example.com, https://x.example, www.y.example');
  assert.doesNotMatch(s, /@[\w]/);
  assert.doesNotMatch(s, /#\d/);
  assert.doesNotMatch(s, /GH-\d/i);
  assert.doesNotMatch(s, /https:\/\//);
  assert.doesNotMatch(s, /www\./);
  // the words survive, minus invisible joiners
  assert.equal(s.replace(/⁠/g, '').replace(/\\/g, ''), '@octocat and @org/team, see #12, owner/repo#3, GH-4, mail me@example.com, https://x.example, www.y.example');
});

test('neutralize: HTML and Markdown cannot inject', () => {
  const s = neutralize('</details><img src=x onerror=alert(1)>\n# Heading\n> quote\n- item\n1. item\n```\ncode\n[link](http://x)\n![img](y)\n**bold** _em_ ~~del~~ $x$ | a | b |\n    indented\n---');
  assert.doesNotMatch(s, /<|>/);
  assert.match(s, /&lt;\/details&gt;/);
  for (const line of s.split('\n')) assert.doesNotMatch(line, /^(#|>|-|\d+\.|\s)/, line);
  assert.doesNotMatch(s, /(^|[^\\])[`*_[\]|~$]/m);
});

const bundle: BundleLike = {
  chapters: [{ n: 10, title: 'A long ride' }],
  stations: [{ id: 's131', name: 'Halt', num: 7 }, { id: 's149', name: 'Market 9', num: 9 }, { id: 'evil', name: 'Bad #1 @you <b>' }],
  lines: [{ id: 'red', name: 'Plum Line' }],
  hops: [{ at: 10, from: 's131', to: 's149', via: 'unknown' }],
};
const rep = (over: Partial<Report>): Report => ({ chapter: 10, kind: 'travel', subject: '', message: 'Something is wrong here.', context: {}, ...over });

test('resolveContext: subjects come from the bundle, unknown ids are dropped', () => {
  assert.deepEqual(resolveContext(bundle, rep({ context: { hop: { at: 10, from: 's131', to: 's149' } } })), { subject: 'Halt 7 to Market 9', hop: { at: 10, from: 's131', to: 's149', via: 'unknown' } });
  assert.deepEqual(resolveContext(bundle, rep({ kind: 'line', context: { entry: 'red' } })), { subject: 'Plum Line', entry: 'red' });
  assert.deepEqual(resolveContext(bundle, rep({ context: { entry: 'later-secret', hop: { at: 9, from: 'a', to: 'b' } } })), { subject: null });
  assert.equal(resolveContext(bundle, rep({ kind: 'recap' })).subject, 'A long ride');
  assert.equal(resolveContext(bundle, rep({ context: { entry: 'evil' } })).subject, 'Bad 1 you b');
});

test('cleanSubject: short, no mention or reference syntax', () => {
  assert.equal(cleanSubject('  @x #1 <script> '), 'x 1 script');
  assert.equal([...cleanSubject('word '.repeat(40))].length, 60);
});

test('formatIssue: title, labels, spoiler fold, context ids', () => {
  const r = rep({ message: 'They rode a cart @octocat #5', context: { hop: { at: 10, from: 's131', to: 's149' }, build: 'index-AbC.js' } });
  const res = resolveContext(bundle, r);
  const i = formatIssue(r, res, { build: r.context.build, version: { id: 'v-1', tag: 'abc123' } });
  assert.equal(i.title, '[Ch 10] Travel: Halt 7 to Market 9');
  assert.deepEqual(i.labels, ['reader-report', 'chapter-10']);
  assert.match(i.body, /<details>\n<summary>Spoilers up to chapter 10<\/summary>\n\n/);
  assert.match(i.body, /trip `s131` → `s149` in chapter 10, via `unknown`/);
  assert.match(i.body, /client `index-AbC\.js` · worker tag `abc123` · worker version `v-1`/);
  // the reader's text sits inside the fold, neutralised
  const fold = i.body.slice(i.body.indexOf('<details>'), i.body.indexOf('</details>'));
  assert.match(fold, /They rode a cart @⁠octocat #⁠5/);
  assert.doesNotMatch(i.body.slice(0, i.body.indexOf('<details>')), /octocat/);
  assert.equal(formatIssue(rep({ kind: 'other' }), { subject: null }).title, '[Ch 10] Other report');
});

test('sameOrigin', () => {
  assert.ok(sameOrigin('https://site.example', 'same-origin', 'https://site.example/api/feedback'));
  assert.ok(!sameOrigin(null, null, 'https://site.example/api/feedback'));
  assert.ok(!sameOrigin('https://evil.example', null, 'https://site.example/api/feedback'));
  assert.ok(!sameOrigin('https://site.example', 'cross-site', 'https://site.example/api/feedback'));
  assert.ok(sameOrigin('https://www.site.example', null, 'https://site.example/api/feedback', ['https://www.site.example']));
});

// ── the handler end to end, with GitHub and the assets binding mocked ──
const SITE = 'https://site.example';
function env(over: Partial<Env> = {}): Env {
  return {
    ASSETS: { fetch: async (u) => String(typeof u === 'string' ? u : u.url).endsWith('/data/ch-10.json') ? Response.json(bundle) : new Response('nope', { status: 404 }) },
    GITHUB_TOKEN: 'test-token', GITHUB_REPO: 'canalesb93/iron-untangled', GITHUB_API: 'https://gh.stub',
    ...over,
  };
}
const req = (body: unknown, headers: Record<string, string> = {}) => new Request(`${SITE}/api/feedback`, {
  method: 'POST', body: typeof body === 'string' ? body : JSON.stringify(body),
  headers: { origin: SITE, 'content-type': 'application/json', 'sec-fetch-site': 'same-origin', 'cf-connecting-ip': '203.0.113.9', ...headers },
});
function stubGitHub(status = 201) {
  const calls: { url: string; init: RequestInit }[] = [];
  const real = globalThis.fetch;
  globalThis.fetch = (async (url: string, init: RequestInit) => { calls.push({ url, init }); return Response.json(status === 201 ? { number: 7, html_url: 'https://github.com/x/7' } : {}, { status }); }) as typeof fetch;
  return { calls, restore: () => { globalThis.fetch = real; } };
}

test('handler: files an issue', async () => {
  const gh = stubGitHub();
  try {
    const r = await worker.fetch(req(good), env());
    assert.equal(r.status, 201);
    assert.deepEqual(await r.json(), { ok: true, number: 7, url: 'https://github.com/x/7' });
    assert.equal(gh.calls.length, 1);
    assert.equal(gh.calls[0].url, 'https://gh.stub/repos/canalesb93/iron-untangled/issues');
    assert.equal((gh.calls[0].init.headers as Record<string, string>).authorization, 'Bearer test-token');
    const sent = JSON.parse(String(gh.calls[0].init.body));
    assert.equal(sent.title, '[Ch 10] Travel: Halt 7 to Market 9');
    assert.doesNotMatch(String(gh.calls[0].init.body), /203\.0\.113\.9/);
  } finally { gh.restore(); }
});

test('handler: refusals', async () => {
  const gh = stubGitHub();
  try {
    assert.equal((await worker.fetch(new Request(`${SITE}/api/feedback`), env())).status, 405);
    assert.equal((await worker.fetch(req(good, { origin: 'https://evil.example' }), env())).status, 403);
    assert.equal((await worker.fetch(req(good, { 'content-type': 'text/plain' }), env())).status, 415);
    assert.equal((await worker.fetch(req('x'.repeat(9000)), env())).status, 413);
    assert.equal((await worker.fetch(req('{nope'), env())).status, 400);
    assert.equal((await worker.fetch(req({ ...good, chapter: 11, context: {} }), env())).status, 400); // no such bundle
    const nc = await worker.fetch(req(good), env({ GITHUB_TOKEN: undefined }));
    assert.equal(nc.status, 503);
    assert.equal((await nc.json() as { error: string }).error, 'not_configured');
    const hp = await worker.fetch(req({ ...good, website: 'x' }), env());
    assert.equal(hp.status, 200);
    const limited = await worker.fetch(req(good), env({ FEEDBACK_RATE: { limit: async () => ({ success: false }) } }));
    assert.equal(limited.status, 429);
    assert.equal((await worker.fetch(new Request(`${SITE}/api/other`), env())).status, 404);
    assert.equal(gh.calls.length, 0, 'no issue filed for any refusal');
  } finally { gh.restore(); }
});

test('handler: rate-limit key is a hash, not the IP', async () => {
  const gh = stubGitHub();
  const keys: string[] = [];
  try {
    await worker.fetch(req(good), env({ FEEDBACK_RATE: { limit: async ({ key }) => { keys.push(key); return { success: true }; } } }));
    assert.equal(keys.length, 1);
    assert.match(keys[0], /^[0-9a-f]{32}$/);
    assert.ok(!keys[0].includes('203'));
  } finally { gh.restore(); }
});

test('handler: GitHub rejecting labels still files; GitHub down is a 502', async () => {
  let n = 0;
  const real = globalThis.fetch;
  globalThis.fetch = (async (_u: string, init: RequestInit) => { n++; const b = JSON.parse(String(init.body)); return b.labels ? Response.json({}, { status: 422 }) : Response.json({ number: 8 }, { status: 201 }); }) as typeof fetch;
  try {
    const r = await worker.fetch(req(good), env());
    assert.equal(r.status, 201);
    assert.equal(n, 2);
    globalThis.fetch = (async () => { throw new Error('down'); }) as typeof fetch;
    assert.equal((await worker.fetch(req(good), env())).status, 502);
  } finally { globalThis.fetch = real; }
});

/**
 * The Worker. Only `/api/*` reaches this script (see `assets.run_worker_first`
 * in wrangler.jsonc); every other request is served as a static asset exactly
 * as before, including the 404 page and public/_headers.
 *
 * POST /api/feedback files a reader's "report an inaccuracy" as a GitHub issue.
 * Nothing about the reader is logged or stored: the IP is only hashed into a
 * rate-limit key and never leaves this function otherwise.
 */
import { LIMITS, formatIssue, resolveContext, sameOrigin, validate, type BundleLike } from './feedback.ts';

interface RateLimit { limit(o: { key: string }): Promise<{ success: boolean }> }
interface Fetcher { fetch(input: Request | string, init?: RequestInit): Promise<Response> }
export interface Env {
  ASSETS: Fetcher;
  /** Secret: fine-grained token, Issues read and write, this repository only. */
  GITHUB_TOKEN?: string;
  /** "owner/name" */
  GITHUB_REPO?: string;
  /** Base URL of the GitHub REST API. A var so local runs can point at a stub. */
  GITHUB_API?: string;
  /** Extra allowed origins, comma separated (the site's own origin is always allowed). */
  ALLOWED_ORIGINS?: string;
  /** Per-visitor limit. */
  FEEDBACK_RATE?: RateLimit;
  /** Whole-site limit, a ceiling on issues per minute whoever sends them. */
  FEEDBACK_RATE_ALL?: RateLimit;
  CF_VERSION_METADATA?: { id?: string; tag?: string };
}

const HEADERS = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store',
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'strict-origin-when-cross-origin',
};
const json = (status: number, body: unknown, extra: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), { status, headers: { ...HEADERS, ...extra } });
const fail = (status: number, error: string, field?: string, extra?: Record<string, string>) => json(status, { ok: false, error, ...(field ? { field } : {}) }, extra);

async function hashKey(ip: string): Promise<string> {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`iron-untangled/feedback:${ip}`));
  return [...new Uint8Array(d).slice(0, 16)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** The reader's own chapter bundle, read through the assets binding (no network hop). */
async function bundleFor(env: Env, url: URL, ch: number): Promise<BundleLike | null> {
  try {
    const r = await env.ASSETS.fetch(new URL(`/data/ch-${String(ch).padStart(2, '0')}.json`, url.origin).toString());
    return r.ok ? (await r.json()) as BundleLike : null;
  } catch { return null; }
}

async function feedback(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') return fail(405, 'method_not_allowed', undefined, { allow: 'POST' });
  const extra = (env.ALLOWED_ORIGINS ?? '').split(',').map((s) => s.trim()).filter(Boolean);
  if (!sameOrigin(request.headers.get('origin'), request.headers.get('sec-fetch-site'), request.url, extra)) return fail(403, 'forbidden_origin');
  if (!(request.headers.get('content-type') ?? '').toLowerCase().startsWith('application/json')) return fail(415, 'unsupported_media_type');
  const declared = Number(request.headers.get('content-length') ?? '0');
  if (declared > LIMITS.body) return fail(413, 'too_large');
  // read at most LIMITS.body bytes, whatever Content-Length claimed
  const reader = request.body?.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  if (reader) for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > LIMITS.body) { await reader.cancel(); return fail(413, 'too_large'); }
    chunks.push(value);
  }
  let input: unknown;
  const raw = new Uint8Array(size);
  let at = 0;
  for (const c of chunks) { raw.set(c, at); at += c.byteLength; }
  try { input = JSON.parse(new TextDecoder().decode(raw)); } catch { return fail(400, 'bad_json'); }
  const v = validate(input);
  if (!v.ok) return fail(400, v.code, v.field);
  // a bot filled the hidden field: pretend it worked, file nothing
  if (v.honeypot) return json(200, { ok: true });
  if (!env.GITHUB_TOKEN || !env.GITHUB_REPO) return fail(503, 'not_configured');

  const ip = request.headers.get('cf-connecting-ip') ?? '';
  if (env.FEEDBACK_RATE && !(await env.FEEDBACK_RATE.limit({ key: await hashKey(ip) })).success) return fail(429, 'rate_limited', undefined, { 'retry-after': '60' });
  if (env.FEEDBACK_RATE_ALL && !(await env.FEEDBACK_RATE_ALL.limit({ key: 'all' })).success) return fail(429, 'rate_limited', undefined, { 'retry-after': '60' });

  const url = new URL(request.url);
  const bundle = await bundleFor(env, url, v.report.chapter);
  if (!bundle) return fail(400, 'invalid', 'chapter');
  const res = resolveContext(bundle, v.report);
  const issue = formatIssue(v.report, res, { build: v.report.context.build, version: env.CF_VERSION_METADATA });

  const api = (env.GITHUB_API ?? 'https://api.github.com').replace(/\/+$/, '');
  const post = (body: object) => fetch(`${api}/repos/${env.GITHUB_REPO}/issues`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${env.GITHUB_TOKEN}`,
      accept: 'application/vnd.github+json',
      'x-github-api-version': '2022-11-28',
      'content-type': 'application/json',
      'user-agent': 'iron-untangled-feedback',
    },
    body: JSON.stringify(body),
  });
  try {
    let r = await post(issue);
    // labels the token may not set: file the issue without them rather than lose it
    if (r.status === 422) r = await post({ title: issue.title, body: issue.body });
    if (r.status === 201) {
      const made = await r.json() as { number?: number; html_url?: string };
      return json(201, { ok: true, number: made.number, url: made.html_url });
    }
    // status only: never the request, the token or the reader's text
    console.warn(`feedback: GitHub answered ${r.status}`);
    return fail(502, 'upstream');
  } catch {
    console.warn('feedback: GitHub unreachable');
    return fail(502, 'upstream');
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url);
    if (pathname === '/api/feedback') return feedback(request, env);
    if (pathname.startsWith('/api/')) return fail(404, 'not_found');
    // not reachable with the current run_worker_first, but if routing ever
    // changes, defer to the assets exactly as a static-only deploy would
    return env.ASSETS.fetch(request);
  },
};

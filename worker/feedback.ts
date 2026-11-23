/**
 * Reader reports, the pure part: validation, neutralising untrusted text, and
 * turning a report into a GitHub issue. No Workers APIs here, so it runs
 * under `node --test` as well as in the Worker.
 */

export const KINDS = { travel: 'Travel', place: 'Place', line: 'Line', recap: 'Recap', person: 'Person', other: 'Other' } as const;
export type Kind = keyof typeof KINDS;

export const LIMITS = {
  /** Raw request body, in bytes. */
  body: 8192,
  messageMin: 10,
  messageMax: 2000,
  messageLines: 60,
  subjectMax: 60,
  /** Links allowed in a message before it counts as link spam. */
  links: 1,
  maxChapter: 200,
} as const;

export interface HopRef { at: number; from: string; to: string }
export interface Report {
  chapter: number;
  kind: Kind;
  /** Client-suggested subject; only used when the server cannot resolve one from app data. */
  subject: string;
  message: string;
  context: { entry?: string; hop?: HopRef; build?: string; view?: string };
}

export type Invalid = { ok: false; code: string; field?: string };
export type Valid = { ok: true; report: Report; honeypot: boolean };

const ID = /^[a-z0-9][a-z0-9_-]{0,47}$/i;
const BUILD = /^[\w.-]{1,64}$/;
const isInt = (n: unknown, lo: number, hi: number): n is number => typeof n === 'number' && Number.isInteger(n) && n >= lo && n <= hi;

/** Invisible and direction-changing characters that could hide or reorder text. */
const HIDDEN = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f-\u009f­؜ᅟᅠ឴឵᠎​-‏‪-‮⁠-⁯ㅤ︀-️﻿ﾠ￰-￿]/g;

/** Normalise free text: NFC, LF line ends, tabs to spaces, no hidden characters. */
export function clean(s: string): string {
  return s.normalize('NFC').replace(/\r\n?/g, '\n').replace(/\t/g, ' ').replace(HIDDEN, '');
}

/** URLs and bare domains-with-www, the things link spam is made of. */
export function countLinks(s: string): number {
  const urls = s.match(/\b(?:https?|ftp):\/\/|\bwww\.|\[url[=\]]|<a\s/gi) ?? [];
  return urls.length;
}

export function validate(input: unknown): Valid | Invalid {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return { ok: false, code: 'bad_json' };
  const o = input as Record<string, unknown>;
  // honeypot: a field people never see. Anything in it means a bot filled the form.
  const honeypot = o.website != null && o.website !== '';
  if (!isInt(o.chapter, 0, LIMITS.maxChapter)) return { ok: false, code: 'invalid', field: 'chapter' };
  if (typeof o.kind !== 'string' || !Object.hasOwn(KINDS, o.kind)) return { ok: false, code: 'invalid', field: 'kind' };
  if (typeof o.message !== 'string') return { ok: false, code: 'invalid', field: 'message' };
  const message = clean(o.message).split('\n').map((l) => l.trim()).join('\n').replace(/\n{3,}/g, '\n\n').trim();
  if ([...message].length < LIMITS.messageMin) return { ok: false, code: 'too_short', field: 'message' };
  if ([...message].length > LIMITS.messageMax) return { ok: false, code: 'too_long', field: 'message' };
  if (message.split('\n').length > LIMITS.messageLines) return { ok: false, code: 'too_long', field: 'message' };
  if (countLinks(message) > LIMITS.links) return { ok: false, code: 'links', field: 'message' };
  if (o.subject != null && (typeof o.subject !== 'string' || o.subject.length > 200)) return { ok: false, code: 'invalid', field: 'subject' };
  const context: Report['context'] = {};
  if (o.context != null) {
    if (typeof o.context !== 'object' || Array.isArray(o.context)) return { ok: false, code: 'invalid', field: 'context' };
    const c = o.context as Record<string, unknown>;
    if (c.entry != null) {
      if (typeof c.entry !== 'string' || !ID.test(c.entry)) return { ok: false, code: 'invalid', field: 'context' };
      context.entry = c.entry;
    }
    if (c.hop != null) {
      const h = c.hop as Record<string, unknown>;
      if (typeof h !== 'object' || !isInt(h.at, 0, LIMITS.maxChapter) || typeof h.from !== 'string' || typeof h.to !== 'string' || !ID.test(h.from) || !ID.test(h.to)) return { ok: false, code: 'invalid', field: 'context' };
      if (h.at > o.chapter) return { ok: false, code: 'invalid', field: 'context' };
      context.hop = { at: h.at, from: h.from, to: h.to };
    }
    if (c.build != null) {
      if (typeof c.build !== 'string' || !BUILD.test(c.build)) return { ok: false, code: 'invalid', field: 'context' };
      context.build = c.build;
    }
    if (c.view != null) {
      if (typeof c.view !== 'string' || !/^[a-z]{2,12}(\/[a-z]{2,12})?$/.test(c.view)) return { ok: false, code: 'invalid', field: 'context' };
      context.view = c.view;
    }
  }
  return { ok: true, honeypot, report: { chapter: o.chapter, kind: o.kind as Kind, subject: typeof o.subject === 'string' ? o.subject : '', message, context } };
}

/**
 * A short subject safe for an issue title: letters, digits, spaces and a few
 * harmless marks. No `#` or `@`, so a title can neither reference nor mention.
 */
export function cleanSubject(s: string): string {
  const t = clean(s).replace(/[^\p{L}\p{N} '’.,:&()/-]/gu, ' ').replace(/\s+/g, ' ').trim();
  const chars = [...t];
  return chars.length > LIMITS.subjectMax ? `${chars.slice(0, LIMITS.subjectMax - 1).join('').trimEnd()}…` : t;
}

/**
 * Make untrusted text inert in GitHub Markdown: no HTML, no formatting, no
 * @mentions, no issue or pull request references, no autolinks. The words
 * still read normally; a WORD JOINER (U+2060, invisible) is placed where
 * GitHub would otherwise see a mention, a reference or a link.
 */
export function neutralize(s: string): string {
  const WJ = '⁠';
  return clean(s).split('\n').map((raw) => {
    let l = raw.trim()
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      // inline syntax anywhere on the line: emphasis, code, links, images, tables, strikethrough, math, escapes
      .replace(/[\\`*_[\]|~$]/g, (c) => `\\${c}`)
      // line-start syntax: headings, quotes (already entities), lists, setext and rules
      .replace(/^([#+=-])/, '\\$1')
      .replace(/^(\d+)([.)])/, '$1\\$2');
    l = l
      .replace(/@(?=[\p{L}\p{N}_-])/gu, `@${WJ}`) // @user, @org/team, email addresses
      .replace(/#(?=\d)/g, `#${WJ}`) // #12, owner/repo#12
      .replace(/\b(GH)-(?=\d)/gi, `$1-${WJ}`) // GH-12
      .replace(/\b([a-z][a-z0-9+.-]*):\/\//gi, `$1${WJ}://`) // scheme://
      .replace(/\bwww\./gi, `www${WJ}.`);
    return l;
  }).join('\n');
}

/** Minimal slice of a chapter bundle (see scripts/slice.ts) that subjects are drawn from. */
export interface BundleLike {
  chapters?: { n: number; title?: string }[];
  stations?: { id: string; name: string; num?: number }[];
  lines?: { id: string; name: string }[];
  people?: { id: string; name: string }[];
  creatures?: { id: string; name: string }[];
  rules?: { id: string; title: string }[];
  questions?: { id: string; title: string }[];
  glossary?: { id: string; term: string }[];
  hops?: { at: number; from: string; to: string; via: string }[];
}

const stationLabel = (b: BundleLike, id: string) => {
  const s = b.stations?.find((x) => x.id === id);
  if (!s) return null;
  return s.num != null && !s.name.includes(String(s.num)) ? `${s.name} ${s.num}` : s.name;
};

export interface Resolved { subject: string | null; entry?: string; hop?: HopRef & { via: string } }

/**
 * The subject for the title, taken from the reader's own chapter bundle, so
 * it is app data the reader could already see, never their own words. Ids
 * that are not in that bundle are dropped.
 */
export function resolveContext(b: BundleLike, r: Report): Resolved {
  const out: Resolved = { subject: null };
  const h = r.context.hop;
  if (h) {
    const hop = b.hops?.find((x) => x.at === h.at && x.from === h.from && x.to === h.to);
    const a = hop && stationLabel(b, hop.from), z = hop && stationLabel(b, hop.to);
    if (hop && a && z) { out.hop = { ...h, via: hop.via }; out.subject = `${a} to ${z}`; }
  }
  const id = r.context.entry;
  if (id) {
    const name = stationLabel(b, id)
      ?? [b.lines, b.people, b.creatures].flatMap((xs) => xs ?? []).find((x) => x.id === id)?.name
      ?? [b.rules, b.questions].flatMap((xs) => xs ?? []).find((x) => x.id === id)?.title
      ?? b.glossary?.find((x) => x.id === id)?.term;
    if (name) { out.entry = id; out.subject ??= name; }
  }
  if (!out.subject && r.kind === 'recap') {
    const t = b.chapters?.find((c) => c.n === r.chapter)?.title;
    if (t) out.subject = t;
  }
  if (out.subject) out.subject = cleanSubject(out.subject) || null;
  return out;
}

export interface IssueMeta { build?: string; version?: { id?: string; tag?: string } }

export function formatIssue(r: Report, res: Resolved, meta: IssueMeta = {}): { title: string; body: string; labels: string[] } {
  const n = r.chapter;
  const kind = KINDS[r.kind];
  const subject = res.subject ?? null;
  const title = `[Ch ${n}] ${kind}${subject ? `: ${subject}` : ' report'}`;
  const code = (s: string) => `\`${s.replace(/`/g, '')}\``;
  const refs: string[] = [];
  if (res.hop) refs.push(`trip ${code(res.hop.from)} → ${code(res.hop.to)} in chapter ${res.hop.at}, via ${code(res.hop.via)}`);
  if (res.entry) refs.push(`entry ${code(res.entry)}`);
  const build = [meta.build ? `client ${code(meta.build)}` : '', meta.version?.tag ? `worker tag ${code(meta.version.tag)}` : '', meta.version?.id ? `worker version ${code(meta.version.id)}` : ''].filter(Boolean).join(' · ');
  const body = [
    'Filed by a reader through the app’s “Report an inaccuracy” form.',
    '',
    `- **What:** ${kind}`,
    `- **Chapter the reader was on:** ${n === 0 ? '0 (before chapter 1)' : n}`,
    `- **Refers to:** ${refs.length ? refs.join('; ') : 'nothing specific'}`,
    `- **Screen the reader was on:** ${r.context.view ? code(r.context.view) : 'not recorded'}`,
    `- **App build:** ${build || 'unknown'}`,
    '',
    '<details>',
    `<summary>Spoilers up to chapter ${n}</summary>`,
    '',
    ...(subject ? [`**About:** ${neutralize(subject)}`, ''] : []),
    neutralize(r.message),
    '',
    '</details>',
    '',
    '<sub>The reader’s text is untrusted and shown as plain text: mentions, references, links and formatting are disabled. No reader-identifying data is collected.</sub>',
  ].join('\n');
  return { title, body, labels: ['reader-report', `chapter-${n}`] };
}

/**
 * Same-origin check. Browsers always send Origin on a POST from fetch(); a
 * missing or foreign Origin, or a Sec-Fetch-Site other than same-origin,
 * means the request did not come from this site's own page.
 */
export function sameOrigin(origin: string | null, fetchSite: string | null, requestUrl: string, extra: string[] = []): boolean {
  if (!origin) return false;
  if (fetchSite && fetchSite !== 'same-origin') return false;
  const own = new URL(requestUrl).origin;
  return origin === own || extra.includes(origin);
}

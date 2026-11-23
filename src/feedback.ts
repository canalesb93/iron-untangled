/**
 * "Report an inaccuracy": the reader-facing form. It posts to /api/feedback,
 * which files a GitHub issue (worker/index.ts). If that endpoint is not
 * switched on or cannot be reached, the reader gets a prefilled GitHub issue
 * to post themselves instead.
 *
 * Openers are plain buttons with data-act="report" (handled in main.ts) and
 * optional data-kind, data-hop ("at:from:to"), data-entry and data-subject.
 * The subject is always app data the reader can already see.
 */
import './feedback.css';
import type { Bundle } from '../scripts/slice.ts';

const REPO = 'canalesb93/iron-untangled';
const MAX = 2000;
const MIN = 10;
const KINDS: [string, string][] = [
  ['travel', 'Travel: a trip, or what they rode'],
  ['place', 'A place or station'],
  ['line', 'A line'],
  ['recap', 'The chapter recap'],
  ['person', 'A person'],
  ['other', 'Something else'],
];

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
const build = (() => { try { const f = new URL(import.meta.url).pathname.split('/').pop() ?? ''; return /^[\w.-]{1,64}$/.test(f) ? f : undefined; } catch { return undefined; } })();

type Hop = Pick<Bundle['hops'][number], 'at' | 'from' | 'to'>;
const plainStation = (b: Bundle, id: string) => { const x = b.stations.find((q) => q.id === id); if (!x) return '?'; return x.num != null && !x.name.includes(String(x.num)) ? `${x.name} ${x.num}` : x.name; };
const hopAttrs = (b: Bundle, h: Hop) => `data-act="report" data-kind="travel" data-hop="${esc(`${h.at}:${h.from}:${h.to}`)}" data-subject="${esc(`${plainStation(b, h.from)} to ${plainStation(b, h.to)}`)}"`;

/** The note under a trip whose vehicle the app does not know (hops with via 'unknown'). */
export function hopAsk(b: Bundle, h: Hop): string {
  return `<li class="fb-ask"><i aria-hidden="true">?</i><span>We don’t know what they rode here: our sources don’t say. <button class="inline" ${hopAttrs(b, h)}>Know? Tell us</button></span></li>`;
}

/** The general entry point at the foot of the Chapter panel. */
export function reportFoot(): string {
  return `<p class="fb-foot">Spotted something wrong? <button class="inline" data-act="report" data-kind="recap">Report an inaccuracy</button></p>`;
}

/** The always-visible card under the notes panel. It says what a report would be about right now. */
export function reportCard(c: { kind: string; view: string; where: string; subject?: string; entry?: string }): string {
  return `<div class="rc-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 21V4m0 1h11l-2 4 2 4H5"/></svg></div>
    <div class="rc-text"><b>Spotted a mistake?</b><small>${c.subject ? `About <i>${esc(c.subject)}</i>` : esc(c.where)}</small></div>
    <button class="rc-go" data-act="report" data-kind="${esc(c.kind)}" data-view="${esc(c.view)}" data-where="${esc(c.where)}"${c.subject ? ` data-subject="${esc(c.subject)}"` : ''}${c.entry ? ` data-entry="${esc(c.entry)}"` : ''}>Report it</button>`;
}

/** A toast with an action, for a tapped trail whose vehicle is unknown. */
let toastTimer = 0;
export function reportToast(text: string, b: Bundle, h: Hop) {
  let t = document.querySelector<HTMLElement>('.fb-toast');
  if (!t) { t = document.createElement('div'); t.className = 'fb-toast'; t.setAttribute('role', 'status'); document.body.append(t); }
  t.innerHTML = `<span>${esc(text)}</span> <button ${hopAttrs(b, h)}>We don’t know what they rode. Tell us?</button>`;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => t.classList.remove('show'), 8000);
}

export interface ReportCtx { chapter: number; furthest: number; label: (n: number) => string }

let root: HTMLElement | null = null;
let opener: HTMLElement | null = null;

function close() {
  if (!root) return;
  root.hidden = true;
  root.innerHTML = '';
  const back = opener?.isConnected ? opener : document.querySelector<HTMLElement>('.tools [data-act="about"]');
  opener = null;
  back?.focus();
}

function focusables(el: HTMLElement) {
  return [...el.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), select, textarea, input:not([tabindex="-1"])')].filter((e) => e.offsetParent !== null || e === document.activeElement);
}

function githubUrl(d: { kind: string; chapter: number; message: string; subject: string; hop?: string; entry?: string; view?: string }) {
  const kind = KINDS.find(([k]) => k === d.kind)?.[0] ?? 'other';
  const title = `[Ch ${d.chapter}] ${kind[0].toUpperCase()}${kind.slice(1)}${d.subject ? `: ${d.subject}` : ' report'}`;
  const refs = [d.hop ? `trip \`${d.hop.split(':').slice(1).join('` → `')}\` in chapter ${d.hop.split(':')[0]}` : '', d.entry ? `entry \`${d.entry}\`` : ''].filter(Boolean).join('; ');
  const body = [
    `- **What:** ${kind}`,
    `- **Chapter I was on:** ${d.chapter}`,
    `- **Refers to:** ${refs || 'nothing specific'}`,
    `- **Screen I was on:** ${d.view ? `\`${d.view}\`` : 'not recorded'}`,
    `- **App build:** ${build ?? 'unknown'}`,
    '',
    '<details>',
    `<summary>Spoilers up to chapter ${d.chapter}</summary>`,
    '',
    d.message.slice(0, MAX),
    '',
    '</details>',
  ].join('\n');
  const q = new URLSearchParams({ title, body, labels: 'reader-report' });
  return `https://github.com/${REPO}/issues/new?${q}`;
}

/** Open the form. `trigger` is the button that asked for it; its data-* set the context. */
export function openReport(trigger: HTMLElement, ctx: ReportCtx) {
  opener = trigger.closest('.modal') ? null : trigger;
  document.querySelector('.fb-toast')?.classList.remove('show');
  if (!root) {
    root = document.createElement('div');
    root.className = 'modal fb-modal';
    root.hidden = true;
    document.body.append(root);
    root.addEventListener('keydown', (e) => {
      // keep keys inside the dialog: the map's arrow-key shortcuts must not fire while typing
      e.stopPropagation();
      if (e.key === 'Escape') { e.preventDefault(); close(); return; }
      if (e.key === 'Tab') {
        const f = focusables(root!);
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    root.addEventListener('click', (e) => {
      const t = e.target as HTMLElement;
      if (t === root || t.closest('[data-fb="close"]')) close();
    });
  }
  const d = trigger.dataset;
  const hop = d.hop && /^\d+:[\w-]+:[\w-]+$/.test(d.hop) ? d.hop : undefined;
  const subject = (d.subject ?? '').slice(0, 120);
  const view = d.view && /^[a-z]{2,12}(\/[a-z]{2,12})?$/.test(d.view) ? d.view : undefined;
  const where = (d.where ?? '').slice(0, 80);
  const kind = d.kind && KINDS.some(([k]) => k === d.kind) ? d.kind : 'other';
  const ch = Math.max(0, Math.min(ctx.chapter, ctx.furthest));
  const chOpts = Array.from({ length: ctx.furthest + 1 }, (_, n) => `<option value="${n}"${n === ch ? ' selected' : ''}>${esc(ctx.label(n))}${n === ctx.chapter ? ' (viewing now)' : ''}</option>`).join('');
  const about = hop
    ? `<p class="fb-about"><b>${esc(subject)}</b>, chapter ${esc(hop.split(':')[0])}. The map doesn’t know what they rode on this trip. If the book says, tell us what it was and where they got on and off.</p>`
    : subject ? `<p class="fb-about">About <b>${esc(subject)}</b>${where ? ` <span class="fb-where">· ${esc(where)}</span>` : ''}. We’ll attach this and your chapter to the report, so you don’t need to explain where you were.</p>` : '';

  root.innerHTML = `<div class="sheet fb-sheet" role="dialog" aria-modal="true" aria-labelledby="fb-title" aria-describedby="fb-public">
    <p class="eyebrow">Report an inaccuracy</p>
    <h2 id="fb-title">What did we get wrong?</h2>
    ${about}
    <form class="fb-form" novalidate>
      <label class="field">What’s wrong
        <select name="kind">${KINDS.map(([k, l]) => `<option value="${k}"${k === kind ? ' selected' : ''}>${esc(l)}</option>`).join('')}</select>
      </label>
      <label class="field">The chapter you’re on
        <select name="chapter">${chOpts}</select>
      </label>
      <label class="field">What should it say?
        <textarea name="message" rows="5" maxlength="${MAX}" required aria-describedby="fb-count fb-err" placeholder="What the app shows, and what the book says instead."></textarea>
      </label>
      <p class="fb-meta"><span id="fb-err" class="fb-err" aria-live="polite"></span><span id="fb-count" class="fb-count">0 / ${MAX}</span></p>
      <div class="fb-hp" aria-hidden="true"><label>Leave this empty <input name="website" type="text" tabindex="-1" autocomplete="off"></label></div>
      <p class="fine" id="fb-public">Reports are posted <b>publicly</b> as issues on GitHub, so please don’t include personal information. Your text is folded away under “Spoilers up to chapter …”, and we don’t record who sent it.</p>
      <div class="fb-status" role="status" aria-live="polite"></div>
      <div class="row"><button type="button" class="ghost" data-fb="close">Cancel</button><button type="submit" class="cta">Send report</button></div>
    </form>
  </div>`;
  root.hidden = false;

  const form = root.querySelector<HTMLFormElement>('form')!;
  const msg = form.elements.namedItem('message') as HTMLTextAreaElement;
  const count = root.querySelector<HTMLElement>('#fb-count')!;
  const err = root.querySelector<HTMLElement>('#fb-err')!;
  const status = root.querySelector<HTMLElement>('.fb-status')!;
  const submit = form.querySelector<HTMLButtonElement>('[type="submit"]')!;
  msg.addEventListener('input', () => { count.textContent = `${msg.value.length} / ${MAX}`; if (err.textContent) { err.textContent = ''; msg.removeAttribute('aria-invalid'); } });
  const invalid = (text: string) => { err.textContent = text; msg.setAttribute('aria-invalid', 'true'); msg.focus(); };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
      chapter: +(form.elements.namedItem('chapter') as HTMLSelectElement).value,
      kind: (form.elements.namedItem('kind') as HTMLSelectElement).value,
      subject,
      message: msg.value.trim(),
      website: (form.elements.namedItem('website') as HTMLInputElement).value,
    };
    if (data.message.length < MIN) return invalid(`Please write a little more (at least ${MIN} characters).`);
    const [at, from, to] = hop?.split(':') ?? [];
    // a trip after the chosen chapter cannot be referred to from it
    const ctxHop = hop && +at <= data.chapter ? { at: +at, from, to } : undefined;
    const body = { ...data, context: { ...(ctxHop ? { hop: ctxHop } : {}), ...(d.entry ? { entry: d.entry } : {}), ...(view ? { view } : {}), ...(build ? { build } : {}) } };
    const fallback = githubUrl({ ...data, hop: ctxHop ? hop : undefined, entry: d.entry, view });
    const offer = (why: string) => {
      status.className = 'fb-status warn';
      status.innerHTML = `<p>${why}</p><p><a class="fb-gh" href="${esc(fallback)}" target="_blank" rel="noopener">Post it on GitHub instead ↗</a></p><p class="fine">Opens GitHub in a new tab with your report filled in. Posting there needs a GitHub account.</p>`;
    };
    submit.disabled = true;
    submit.textContent = 'Sending…';
    status.className = 'fb-status';
    status.textContent = '';
    try {
      const r = await fetch('/api/feedback', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
      const j = await r.json().catch(() => ({})) as { ok?: boolean; error?: string; number?: number; url?: string };
      if (r.ok && j.ok) {
        const sheet = root!.querySelector<HTMLElement>('.sheet')!;
        sheet.innerHTML = `<p class="eyebrow">Report an inaccuracy</p>
          <h2 id="fb-title" tabindex="-1">Thank you. It’s filed.</h2>
          <p>${j.number ? `Your report is issue <b>#${j.number}</b> on GitHub.` : 'Your report has been sent.'} We’ll check it against the book and fix the map.</p>
          ${j.url ? `<p><a class="fb-gh" href="${esc(j.url)}" target="_blank" rel="noopener">See it on GitHub ↗</a></p>` : ''}
          <div class="row"><button type="button" class="cta" data-fb="close">Close</button></div>`;
        sheet.querySelector<HTMLElement>('h2')!.focus();
        return;
      }
      if (r.status === 400 && j.error === 'links') invalid('Please include at most one link.');
      else if (r.status === 400 && (j.error === 'too_short' || j.error === 'too_long')) invalid(j.error === 'too_short' ? `Please write a little more (at least ${MIN} characters).` : 'That’s a bit long. Please keep it under 2,000 characters and 60 lines.');
      else if (r.status === 429) { status.className = 'fb-status warn'; status.textContent = 'Too many reports from this connection just now. Please try again in a minute.'; }
      else if (r.status === 503 && j.error === 'not_configured') offer('Automatic reports aren’t switched on yet.');
      else offer('Sorry, that didn’t go through.');
    } catch {
      offer('Couldn’t reach the server.');
    } finally {
      if (submit.isConnected) { submit.disabled = false; submit.textContent = 'Send report'; }
    }
  });

  (form.elements.namedItem(hop || subject ? 'message' : 'kind') as HTMLElement).focus();
}

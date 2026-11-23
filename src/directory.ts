/**
 * The station directory: the floor as a spreadsheet, one row per station
 * number, filled in as the book reveals it. Everything shown comes from the
 * reader's own chapter bundle (rows, rule notes, inferred rows, goofs and
 * the credit are all computed at build time), so this module knows nothing
 * about the story and nothing about the numbering rules.
 */
import type { Bundle, DirItem, DirRow } from '../scripts/slice.ts';

const LAST = 436;
const COLS = 30;
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

/** Per-viewer view settings for this panel. */
const view = { inferred: true };

/** Colours arrive with the bundle, so this file names no kind of place. */
let key: Bundle['directory']['key'] = [];
const dot = (k: string, extra = '') => `<i class="dir-k${extra}" style="--k:${key.find((x) => x.kind === k)?.color ?? '#8a857a'}"></i>`;

function lineChip(name: string, b: Bundle): string {
  const l = b.lines.find((x) => x.name.toLowerCase() === name.toLowerCase());
  return `<span class="dir-line"${l ? ` style="--c:${l.color}"` : ''}><i></i>${esc(name)}</span>`;
}

function item(e: DirItem, b: Bundle, now: number): string {
  const fresh = now > 0 && e.since === now ? '<em class="badge new">New</em>' : '';
  const detail = [
    e.lines.length ? `<span class="dir-lines">${e.lines.map((l) => lineChip(l, b)).join('')}</span>` : '',
    e.has.length ? `<span class="dir-has"><b>Here</b>${e.has.map(esc).join(' · ')}</span>` : '',
    e.lives.length ? `<span class="dir-lives"><b>Lives here</b>${e.lives.map(esc).join(' · ')}</span>` : '',
    !e.has.length && !e.lives.length && e.note ? `<span class="dir-note">${esc(e.note)}</span>` : '',
    e.fits.map((f) => `<span class="dir-fits">Fits: ${esc(f)}</span>`).join(''),
  ].join('');
  return `<button class="dir-item" data-open="${e.id}" title="${e.onMap ? 'Open this place' : 'Open this entry'}">
      <span class="dir-name">${dot(e.kind)}<b>${esc(e.name)}</b>${fresh}<small>${esc(e.tag)}</small></span>
      ${detail}
    </button>`;
}

function inferredRow(r: DirRow): string {
  const inf = r.inferred!;
  return `<li class="dir-row dir-inf" id="dir-${r.n}"><span class="dir-n">${r.n}</span><div class="dir-items"><div class="dir-item">
      <span class="dir-name">${dot(inf.kind, ' inf')}<b>${esc(inf.tag)}</b><em class="dir-guess">inferred, not seen</em></span>
      ${inf.has.length ? `<span class="dir-has"><b>Should have</b>${inf.has.map(esc).join(' · ')}</span>` : ''}
      ${inf.why.map((w) => `<span class="dir-fits">From: ${esc(w)}</span>`).join('')}
    </div></div></li>`;
}

/** 1..436 as tiny cells: filled once a number is known, coloured by kind. */
function strip(rows: DirRow[]): string {
  const byN = new Map(rows.map((r) => [r.n, r]));
  let h = '';
  for (let n = 1; n <= LAST; n++) {
    const r = byN.get(n);
    if (!r) { h += '<i class="dc"></i>'; continue; }
    const k = r.items[0]?.kind ?? r.inferred!.kind;
    const title = r.items.length ? `${n}: ${r.items.map((x) => x.name).join(' / ')}` : `${n}: inferred`;
    h += `<button class="dc${r.items.length ? '' : ' inf'}${r.items.length > 1 ? ' multi' : ''}" data-dir-n="${n}" style="--k:${key.find((x) => x.kind === k)?.color ?? '#8a857a'}" title="${esc(title)}" aria-label="${esc(title)}"></button>`;
  }
  return `<div class="dir-strip" style="--cols:${COLS}" role="group" aria-label="Station numbers 1 to ${LAST}">${h}</div>`;
}

export function renderDirectory(b: Bundle, now: number): string {
  const d = b.directory;
  key = d.key;
  const seen = d.rows.filter((r) => r.items.length);
  const guesses = d.rows.filter((r) => r.inferred);
  const rows = d.rows.filter((r) => r.items.length || view.inferred);
  const kinds = new Set(rows.flatMap((r) => [...r.items.map((i) => i.kind), ...(r.inferred ? [r.inferred.kind] : [])]));
  const legendKinds = d.key.filter((k) => kinds.has(k.kind));

  let list = '';
  let prev = 0;
  for (const r of rows) {
    if (r.n > prev + 1) list += `<li class="dir-gap" aria-label="Numbers ${prev + 1} to ${r.n - 1} unknown"><span>…</span><small>${prev + 1 === r.n - 1 ? prev + 1 : `${prev + 1}–${r.n - 1}`}</small></li>`;
    list += r.items.length
      ? `<li class="dir-row" id="dir-${r.n}"><span class="dir-n">${r.n}</span><div class="dir-items">${[...r.items].sort((a, c) => a.since - c.since).map((e) => item(e, b, now)).join('')}</div></li>`
      : inferredRow(r);
    prev = r.n;
  }
  if (rows.length && prev < LAST) list += `<li class="dir-gap"><span>…</span><small>${prev + 1 === LAST ? LAST : `${prev + 1}–${LAST}`}</small></li>`;

  const goofs = d.goofs.length
    ? `<h3>Book goofs</h3>${d.goofs.map((g) => `<section class="dir-goof"><b>${esc(g.title)}</b>${now > 0 && g.since === now ? '<em class="badge new">New</em>' : ''}<p>${esc(g.text)}</p></section>`).join('')}`
    : '';
  const credit = d.credit
    ? `<section class="dir-credit"><h3>${esc(d.credit.title)}</h3><p>${esc(d.credit.text)}</p>
        <a href="${esc(d.credit.url)}" target="_blank" rel="noopener">Open the page on the fan wiki <span aria-hidden="true">↗</span></a>
        <small>Contains spoilers for the whole book. Fan text there is CC-BY-SA.</small></section>`
    : '';

  return `<section class="dir">
    <p class="lede sm">Every station number on the floor, filled in only as far as you’ve read. ${seen.length ? `<b>${seen.length}</b> of ${LAST} numbers seen so far.` : 'None seen yet.'}</p>
    ${strip(rows)}
    ${legendKinds.length ? `<div class="dir-key">${legendKinds.map((k) => `<span>${dot(k.kind)}${esc(k.label)}</span>`).join('')}${guesses.length && view.inferred ? `<span>${dot('stop', ' inf')}Inferred</span>` : ''}</div>` : ''}
    ${guesses.length ? `<button class="dir-toggle" data-dir-inferred aria-pressed="${view.inferred}">${view.inferred ? 'Hide' : 'Show'} ${guesses.length} rows the rules predict</button>` : ''}
    ${rows.length ? `<ol class="dir-list">${list}</ol>` : '<p class="empty">No station numbers yet. Keep reading.</p>'}
    ${goofs}
    ${credit}
  </section>`;
}

/** Strip taps and the inferred-rows toggle. Returns true when it handled the click. */
export function handleDirectoryClick(ev: Event, rerender: () => void): boolean {
  const t = ev.target as Element;
  if (t.closest('[data-dir-inferred]')) { view.inferred = !view.inferred; rerender(); return true; }
  const cell = t.closest<HTMLElement>('[data-dir-n]');
  if (!cell) return false;
  const row = document.getElementById(`dir-${cell.dataset.dirN}`);
  if (row) {
    row.scrollIntoView({ block: 'center', behavior: 'smooth' });
    row.classList.remove('flash');
    void row.offsetWidth;
    row.classList.add('flash');
  }
  return true;
}

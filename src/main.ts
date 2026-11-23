import './style.css';
import './directory.css';
import type { Bundle } from '../scripts/slice.ts';
import { TangleMap } from './map.ts';
import { avatar } from './portraits.ts';
import { handleDirectoryClick, renderDirectory } from './directory.ts';
import { hopAsk, openReport, reportCard, reportFoot, reportToast } from './feedback.ts';

type Tab = 'chapter' | 'journey' | 'cast' | 'codex' | 'sketch' | 'diagrams';
type Section = 'places' | 'lines' | 'people' | 'creatures' | 'rules' | 'questions' | 'terms' | 'journey' | 'diagrams' | 'directory';

const KEY = 'iron-tangle/v1';
const saved = (() => {
  try { return JSON.parse(localStorage.getItem(KEY) ?? 'null') as { furthest: number; view: number; tilt: boolean; legend?: boolean; focus?: boolean } | null; } catch { return null; }
})();
const state = {
  furthest: saved?.furthest ?? 0,
  view: saved?.view ?? 0,
  tilt: saved?.tilt ?? false,
  spot: saved?.focus ?? false, // “All” unless the reader chose “This chapter”
  legend: saved?.legend ?? false,
  tab: 'chapter' as Tab,
  section: 'places' as Section,
  open: null as string | null, // expanded codex entry
  folds: new Set<string>(),
  person: null as string | null, // profile open in the Who's where tab
  sheet: false, // mobile sheet open
  total: 35,
  labels: [] as string[],
};
const save = () => {
  try { localStorage.setItem(KEY, JSON.stringify({ furthest: state.furthest, view: state.view, tilt: state.tilt, legend: state.legend, focus: state.spot })); } catch { /* private mode */ }
};

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel)!;
const mobile = () => matchMedia('(max-width: 859px)').matches;
const chLabel = (n: number) => (n === 0 ? 'Not started' : state.labels[n - 1] ?? `Chapter ${n}`);
const stamp = (n: number) => (n === 0 ? 'BEFORE' : n === state.total ? 'EPI' : `CH ${n}`);

// ── data: one bundle per chapter, and never one the reader has not unsealed ──
const cache = new Map<number, Promise<Bundle>>();
function load(ch: number): Promise<Bundle> {
  if (ch > state.furthest) throw new Error('sealed');
  if (!cache.has(ch)) cache.set(ch, fetch(`/data/ch-${String(ch).padStart(2, '0')}.json`).then((r) => r.json()));
  return cache.get(ch)!;
}

// ── shell ──
/** The name, drawn as “Iron Tangle” with an “Un” written in. */
const WORDMARK = '<span class="wm" role="img" aria-label="Iron Untangled"><span aria-hidden="true">Iron <i class="wm-un">Un</i>tangled</span></span>';

$('#app').innerHTML = `
  <div id="map"></div>
  <header class="top">
    <div class="brand">
      <span class="roundel" aria-hidden="true"></span>
      <div><b>${WORDMARK}</b><small>A spoiler-safe map of the Iron Tangle</small></div>
    </div>
    <div class="tools">
      <button class="tool seg" data-act="spot" aria-pressed="false" title="Spotlight this chapter, or show everything known"><span><i class="lg">This chapter</i><i class="sm">Now</i></span><span>All</span></button>
      <button class="tool seg" data-act="tilt" aria-pressed="false" title="Tilt the map"><span>2D</span><span>3D</span></button>
      <button class="tool" data-act="fit" title="Show everything charted" aria-label="Show everything charted"><svg viewBox="0 0 24 24"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg></button>
      <button class="tool" data-act="party" title="Go to the party" aria-label="Go to the party"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3.2"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/></svg></button>
      <button class="tool" data-act="legend" aria-pressed="false" title="Map key" aria-label="Map key"><svg viewBox="0 0 24 24"><path d="M4 6h3M4 12h3M4 18h3M10 6h10M10 12h10M10 18h10"/></svg></button>
      <button class="tool" data-act="about" title="About this map" aria-label="About this map"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/></svg></button>
    </div>
  </header>
  <div class="side">
  <aside class="panel">
    <button class="grab" data-act="sheet" aria-label="Close notes"></button>
    <nav class="tabs" role="tablist"></nav>
    <div class="body"></div>
  </aside>
  <section class="rcard" aria-label="Report an inaccuracy"></section>
  </div>
  <footer class="rail">
    <div class="rail-now">
      <button class="step" data-act="prev" aria-label="Previous chapter"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg></button>
      <button class="chip" data-act="sheet">
        <span class="chip-no"></span><span class="chip-title"></span><span class="chip-where"></span>
      </button>
      <button class="step next" data-act="next" aria-label="Next chapter"><svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg></button>
    </div>
    <div class="track" role="group" aria-label="Chapters"></div>
  </footer>
  <div class="corner">
  <button class="caveat" data-act="about" title="Why the map is an interpretation"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/></svg><span>Fan interpretation, <b>not an official map</b></span></button>
  <a class="byline" href="https://github.com/canalesb93/iron-untangled" target="_blank" rel="noopener" aria-label="Open source on GitHub: help improve this map"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg><span>Open source · <b>help improve this map</b></span></a>
  </div>
  <aside class="legend" hidden></aside>
  <div class="pop" role="tooltip" hidden></div>
  <div class="tour" hidden></div>
  <div class="story" role="region" aria-label="Story mode" hidden></div>
  <div class="toast" role="status"></div>
  <div class="modal" hidden></div>`;

const map = new TangleMap($('#map'));
map.onSelected = (id) => highlightLegend(id);
map.onPerson = (id) => openPerson(id);
map.onTrail = (i) => {
  const h = bundle.hops[i];
  if (!h) return;
  const how = h.via === 'foot' ? 'on foot' : h.via === 'jump' ? 'through a gate' : `by ${rideOf(h.via).name}`;
  // the toast is plain text, so no markup here
  const plain = (id: string) => { const x = bundle.stations.find((q) => q.id === id); if (!x) return '?'; return x.num != null && !x.name.includes(String(x.num)) ? `${x.name} ${x.num}` : x.name; };
  const text = `Chapter ${h.at}: ${plain(h.from)} to ${plain(h.to)}, ${how}.`;
  if (h.via === 'unknown') reportToast(`Chapter ${h.at}: ${plain(h.from)} to ${plain(h.to)}.`, bundle, h); else toast(text);
};
$('.body').addEventListener('scroll', () => hideTerm(), { passive: true });
let bundle: Bundle;

function pads() {
  const m = mobile();
  const rail = $('.rail').getBoundingClientRect().height;
  document.documentElement.style.setProperty('--rail-h', `${Math.round(rail)}px`);
  map.setPad(m
    ? { left: 0, right: 0, top: 56, bottom: rail + (state.sheet ? innerHeight * 0.5 : 0) }
    : { left: 430, right: 0, top: 60, bottom: rail + 10 });
}
addEventListener('resize', pads);
document.addEventListener('toggle', (e) => { const d = e.target as HTMLDetailsElement; const id = d.dataset?.fold; if (id) { if (d.open) state.folds.add(id); else state.folds.delete(id); } }, true);

// ── rendering ──
function renderRail() {
  const k = bundle.chapters.find((c) => c.n === state.view);
  $('.chip-no').textContent = state.view === 0 ? 'Before chapter 1' : chLabel(state.view);
  $('.chip-title').textContent = k?.title ?? 'Nothing charted yet';
  $('.chip-where').textContent = k?.where ?? 'The fog is complete';
  ($('[data-act="prev"]') as HTMLButtonElement).disabled = state.view === 0;
  const next = $('[data-act="next"]') as HTMLButtonElement;
  next.disabled = state.view >= state.total;
  next.classList.toggle('seal', state.view === state.furthest && state.view < state.total);
  next.title = state.view === state.furthest ? 'I finished the next chapter' : 'Next chapter';
  let h = '';
  for (let n = 0; n <= state.total; n++) {
    const cls = n === state.view ? 'on' : n <= state.furthest ? 'read' : n === state.furthest + 1 ? 'nextup' : 'sealed';
    h += `<button class="tick ${cls}" data-ch="${n}" title="${esc(chLabel(n))}${n > state.furthest ? ' · sealed' : ''}" aria-label="${esc(chLabel(n))}${n > state.furthest ? ', sealed' : ''}"><i></i></button>`;
  }
  $('.track').innerHTML = h;
  renderLegend();
}

/**
 * The number line: every coloured line counts the same stations, so the whole
 * floor can be read as one straight track. Shows only numbers the reader knows.
 */
/** Little drawings that match the map's own marks, keyed by the bundle's legend keys. */
const SWATCH: Record<string, string> = {
  party: '<rect x="5" y="3" width="22" height="14" rx="7" fill="#fffdf6" stroke="#1d1e24" stroke-width="1.6"/><circle cx="12.5" cy="10" r="4" fill="#a8323a"/><circle cx="19.5" cy="10" r="4" fill="#6a3fa0"/>',
  car: '<rect x="5" y="2" width="22" height="13" rx="6.5" fill="#f2c230" stroke="#fff" stroke-width="1.4"/><circle cx="10" cy="16" r="2.2" fill="#1d1e24"/><circle cx="22" cy="16" r="2.2" fill="#1d1e24"/><circle cx="12.5" cy="8.5" r="3.4" fill="#a8323a"/><circle cx="19.5" cy="8.5" r="3.4" fill="#6a3fa0"/>',
  on: '<circle cx="16" cy="10" r="7.5" fill="#f2c230" stroke="#fff" stroke-width="1.5"/><path d="M16 14V7M13 9.5 16 6.5 19 9.5" fill="none" stroke="#1d1e24" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
  off: '<circle cx="16" cy="10" r="7" fill="#fffdf6" stroke="#f2c230" stroke-width="2.6"/><path d="M16 6V13M13 10.5 16 13.5 19 10.5" fill="none" stroke="#1d1e24" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
  seen: '<circle cx="16" cy="10" r="7" fill="#e9dfc8" stroke="#d2a85a" stroke-width="2"/><circle cx="16" cy="8" r="2.4" fill="#1d1e24"/><path d="M11.5 15c1-3.5 8-3.5 9 0" fill="#1d1e24"/>',
  now: '<path d="M3 10h26" stroke="#e5484d" stroke-width="9" opacity=".18" stroke-linecap="round"/><path d="M3 10h26" stroke="#e5484d" stroke-width="3" stroke-linecap="round"/>',
  ride: '<path d="M3 10h26" stroke="#efe6d0" stroke-width="9" stroke-linecap="round"/><path d="M3 10h26" stroke="#f2c230" stroke-width="5" stroke-linecap="round"/>',
  chart: '<path d="M3 10h26" stroke="#f2c230" stroke-width="3" stroke-dasharray="1 5" stroke-linecap="round"/>',
  leg: '<path d="M3 10h26" stroke="#1d1e24" stroke-width="3.5"/><path d="M3 10h26" stroke="#efe6d0" stroke-width="1.5" stroke-dasharray="1 5"/>',
  service: '<path d="M3 10h26" stroke="#5d6b7a" stroke-width="3.5" stroke-dasharray="7 4"/>',
  trail: '<path d="M3 13Q16 3 29 13" fill="none" stroke="#1d1e24" stroke-width="2" stroke-dasharray="1.5 4" stroke-linecap="round"/>',
  stop: '<circle cx="16" cy="10" r="4.5" fill="#efe6d0" stroke="#1d1e24" stroke-width="2.2"/>',
  transfer: '<g transform="translate(16 10) scale(.5)"><circle r="17" fill="#efe6d0" stroke="#1d1e24" stroke-width="5"/><path d="M-8-4.5H8M4-8.5 8-4.5 4-.5M8 4.5H-8M-4 .5-8 4.5-4 8.5" fill="none" stroke="#1d1e24" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/></g>',
  stairwell: '<rect x="9.5" y="3.5" width="13" height="13" rx="2.5" fill="#c9973a" stroke="#1d1e24" stroke-width="1.4"/><path d="M12.5 13.5h3v-3h3v-3h3" fill="none" stroke="#1d1e24" stroke-width="1.6"/>',
  ring: '<path d="M2 16Q16 0 30 16" fill="none" stroke="#a8802d" stroke-width="2" stroke-dasharray="5 4"/>',
  endline: '<rect x="9" y="7" width="14" height="6" rx="1.5" fill="#1d1e24"/>',
  depot: '<rect x="8" y="2" width="16" height="16" rx="3" fill="#1d1e24"/>',
  landmark: '<rect x="11" y="5" width="10" height="10" transform="rotate(45 16 10)" fill="#efe6d0" stroke="#1d1e24" stroke-width="2.2"/>',
  core: '<circle cx="16" cy="10" r="8" fill="#5c1206"/><circle cx="16" cy="10" r="5.5" fill="#ffb02e"/>',
  fog: '<rect x="2" y="2" width="28" height="16" rx="4" fill="#2a2d35"/><circle cx="11" cy="10" r="5" fill="#4a4e59"/><circle cx="20" cy="9" r="6" fill="#3d414b"/>',
};

/** Which map-key entry describes the thing with this id. */
function legendKeyFor(id: string | null): string | null {
  if (!id) return null;
  const s = bundle.stations.find((x) => x.id === id);
  if (s) return s.xy ? s.kind : s.ring != null ? 'ring' : null;
  const l = bundle.lines.find((x) => x.id === id);
  if (!l) return null;
  if (l.kind === 'named') return 'leg';
  if (l.kind === 'service') return 'service';
  return l.segs.some((g) => g.mode === 'ridden') ? 'ride' : 'chart';
}

function highlightLegend(id: string | null) {
  const key = legendKeyFor(id);
  document.querySelectorAll('.legend li.hl').forEach((e) => e.classList.remove('hl'));
  if (!key) return;
  const li = document.querySelector<HTMLElement>(`.legend li[data-key="${key === 'saferoom' ? 'transfer' : key}"]`);
  if (li) { li.classList.add('hl'); li.scrollIntoView({ block: 'nearest' }); }
}

function renderLegend() {
  const el = $('.legend');
  el.hidden = !state.legend || !bundle.legend.length;
  el.innerHTML = el.hidden ? '' : `<div class="legend-head"><b>Map key</b><button data-act="legend" aria-label="Hide the key">×</button></div>
    <ul>${bundle.legend.map((l) => `<li data-key="${l.key}"><svg viewBox="0 0 32 20" aria-hidden="true">${SWATCH[l.key] ?? ''}</svg><span>${esc(l.text)}</span></li>`).join('')}</ul>
    <p class="legend-note">A fan interpretation, not an official map. Positions and distances are our own reading of the book, not to scale.</p>`;
  $('[data-act="legend"].tool').setAttribute('aria-pressed', String(state.legend));
  highlightLegend(map.selectedId());
}

function stripHtml(): string {
  if (!bundle.rules.some((r) => r.id === 'one-way')) return '';
  const x = (n: number) => `${(Math.sqrt(Math.max(0, n - 10) / 426) * 100).toFixed(2)}%`;
  const last = bundle.hops.at(-1);
  const here = last ? bundle.stations.find((s) => s.id === last.to) : undefined;
  const nums = new Map<number, Bundle['stations'][number]>();
  for (const s of bundle.stations) if (s.num != null && !nums.has(s.num)) nums.set(s.num, s);
  const visited = new Set(bundle.hops.flatMap((h) => [h.from, h.to]).map((id) => bundle.stations.find((s) => s.id === id)?.num).filter((n): n is number => n != null));
  const stairs = [...nums.values()].filter((s) => s.kind === 'stairwell').map((s) => s.num!);
  const near = here?.num != null ? Math.max(-1, ...stairs.filter((n) => n <= here.num!)) : -1;
  let h = `<div class="strip"><div class="strip-head"><span></span><span class="strip-dir">trains only run this way <b>→</b></span></div><div class="strip-track">`;
  if (near > 0 && here?.num != null && near !== here.num) h += `<i class="strip-gap" style="left:${x(near)};width:calc(${x(here.num)} - ${x(near)})"></i>`;
  for (const [n, s] of [...nums].sort((a, b) => a[0] - b[0])) {
    const cls = s.kind === 'stairwell' ? 'st-stairs' : s.kind === 'endline' ? 'st-end' : visited.has(n) ? 'st-been' : 'st-known';
    const lab = s.kind === 'stairwell' || s.kind === 'endline' ? `<em>${n}</em>` : '';
    h += `<button class="strip-st ${cls}" style="left:${x(n)}" data-open="${s.id}" title="${esc(s.name)}${s.num != null && !s.name.includes(String(n)) ? ` (${n})` : ''}">${lab}</button>`;
  }
  if (here?.num != null) h += `<span class="strip-you" style="left:${x(here.num)}"><b>${here.num}</b></span>`;
  h += `</div><div class="strip-foot"><span>${stairs.length ? '<i class="key-stairs"></i>stairs down' : ''}</span>${here && here.num == null ? `<span class="strip-off">The party is off the line: ${esc(here.name)}</span>` : here ? '<span><i class="key-you"></i>the party</span>' : ''}</div>`;
  return `${h}</div>`;
}

interface Entry { id: string; name: string; tag?: string; since: number; notes: { at: number; text: string }[]; color?: string; onMap: boolean }
function entries(sec: Section): Entry[] {
  switch (sec) {
    case 'places': return bundle.stations.map((s) => ({ ...s, onMap: !!s.xy || s.ring != null }));
    case 'lines': return bundle.lines.map((l) => ({ ...l, onMap: l.segs.length + l.legs.length > 0 }));
    case 'people': return bundle.people.map((p) => ({ ...p, onMap: false }));
    case 'creatures': return bundle.creatures.map((c) => ({ ...c, tag: [c.rank === 'boss' ? 'Boss' : c.rank === 'mob' ? 'Monster' : 'Other', c.where].filter(Boolean).join(' · '), onMap: false }));
    case 'rules': return bundle.rules.map((r) => ({ ...r, name: r.title, tag: r.status, onMap: false }));
    case 'questions': return [...bundle.questions].sort((a, b) => Number(b.open) - Number(a.open) || a.since - b.since).map((q) => ({ id: q.id, name: q.title, tag: q.open ? 'Still open' : 'Answered', since: q.since, notes: q.notes, onMap: false }));
    case 'journey': case 'diagrams': case 'directory': return [];
    case 'terms': return [...bundle.glossary].sort((a, b) => a.term.localeCompare(b.term)).map((t) => ({ id: t.id, name: t.term, since: t.since, notes: [{ at: t.since, text: t.def }], onMap: false }));
  }
}
const SECTIONS: [Section, string][] = [['places', 'Places'], ['lines', 'Lines'], ['people', 'People'], ['creatures', 'Bestiary'], ['rules', 'How it works'], ['questions', 'Questions'], ['terms', 'Terms']];
const PILLS: [Section, string][] = [['places', 'Places'], ['directory', 'Directory'], ['lines', 'Lines'], ['creatures', 'Bestiary'], ['rules', 'How it works'], ['questions', 'Questions'], ['terms', 'Terms'], ['journey', 'Journey'], ['diagrams', 'Diagrams']];
const sectionOf = (id: string): Section | null => SECTIONS.map(([s]) => s).find((s) => entries(s).some((e) => e.id === id)) ?? null;

function badge(e: Entry) {
  if (state.view === 0) return '';
  if (e.since === state.view) return '<em class="badge new">New</em>';
  if (e.notes.some((n) => n.at === state.view)) return '<em class="badge upd">Updated</em>';
  return '';
}
function notes(e: Entry) {
  return `<ul class="notes">${e.notes.map((n) => `<li class="${n.at === state.view && state.view > 0 ? 'fresh' : ''}"><span class="stamp">${stamp(n.at)}</span><span>${gloss(esc(n.text), e.id)}</span></li>`).join('')}</ul>`;
}

/**
 * Underline the book's jargon in a block of already-escaped text, first
 * mention of each term only. Only terms in the reader's bundle are known.
 */
let glossRe: RegExp | null = null;
let glossFor: Bundle | null = null;
const glossIndex = new Map<string, string>();
function gloss(html: string, skip?: string): string {
  if (!bundle.glossary.length) return html;
  if (glossFor !== bundle) {
    glossFor = bundle;
    glossIndex.clear();
    for (const t of bundle.glossary) for (const w of [t.term, ...t.aliases]) glossIndex.set(w.toLowerCase(), t.id);
    const words = [...glossIndex.keys()].sort((a, b) => b.length - a.length).map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    glossRe = new RegExp(`(?<![\\w-])(${words.join('|')})(s|es)?(?![\\w-])`, 'gi');
  }
  const used = new Set<string>(skip ? [skip] : []);
  return html.replace(glossRe!, (m, w: string) => {
    const id = glossIndex.get(w.toLowerCase());
    if (!id || used.has(id)) return m;
    used.add(id);
    return `<button class="term" data-term="${id}">${m}</button>`;
  });
}

function showTerm(el: HTMLElement) {
  const t = bundle.glossary.find((g) => g.id === el.dataset.term);
  if (!t) return;
  const pop = $('.pop');
  pop.innerHTML = `<b>${esc(t.term)}</b><p>${esc(t.def)}</p><button class="inline" data-open="${t.id}">All terms</button>`;
  pop.hidden = false;
  const r = el.getBoundingClientRect(), w = Math.min(300, innerWidth - 24);
  pop.style.width = `${w}px`;
  pop.style.left = `${Math.max(12, Math.min(innerWidth - w - 12, r.left + r.width / 2 - w / 2))}px`;
  const below = r.bottom + 10 + pop.offsetHeight < innerHeight;
  pop.style.top = `${below ? r.bottom + 8 : r.top - pop.offsetHeight - 8}px`;
}
const hideTerm = () => { const p = $('.pop'); p.hidden = true; p.innerHTML = ''; };

function renderTabs() {
  const tabs: [Tab, string][] = [['chapter', 'Chapter'], ['cast', 'People'], ['codex', 'Reference']];
  if (state.tab !== 'chapter' && state.tab !== 'cast' && state.tab !== 'codex') state.tab = 'codex';
  requestAnimationFrame(() => $('.tabs [aria-selected="true"]')?.scrollIntoView({ block: 'nearest', inline: 'nearest' }));
  $('.tabs').innerHTML = tabs.map(([t, l]) => `<button role="tab" data-tab="${t}" aria-selected="${state.tab === t}">${l}</button>`).join('');
}

function renderChapter(): string {
  const read = bundle.chapters.filter((c) => c.n <= state.view);
  const k = read.at(-1);
  if (!k) {
    const known = bundle.people.filter((p) => p.group === 'party');
    return `<p class="eyebrow">Before chapter 1</p>
      <h1>Nothing is charted yet</h1>
      <p class="lede sm">The fog lifts as far as you’ve read.</p>
      <button class="cta" data-act="next">I’ve finished chapter 1</button>
      <h3>Who you’re travelling with</h3>
      <div class="crew-row">${known.map((p) => `<button class="crew-m" data-person="${p.id}">${avatar(p, 'av-md')}<b>${esc(p.name.replace(/^Princess /, ''))}</b></button>`).join('')}</div>`;
  }
  const fresh = SECTIONS.flatMap(([s]) => entries(s).filter((e) => e.since === k.n).map((e) => ({ ...e, s })));
  const upd = SECTIONS.flatMap(([s]) => entries(s).filter((e) => e.since < k.n && e.notes.some((n) => n.at === k.n)).map((e) => ({ ...e, s })));
  const chip = (e: Entry) => `<button class="link" data-open="${e.id}">${e.color ? `<i class="sw" style="background:${e.color}"></i>` : ''}${esc(e.name)}</button>`;
  const atEnd = state.view === state.furthest && state.view < state.total;
  const beats = k.beats ?? [];
  const beatsHtml = (() => { const g = gloss(beats.map((b) => esc(b)).join('\u0000')); return g.split('\u0000').map((b, i) => { const p = placesIn(beats[i] ?? ''); return `<li${p.length ? ` class="has-place" data-place="${p[0]}" title="Show on the map"` : ''}>${b}</li>`; }).join(''); })();
  const answered = bundle.questions.filter((q) => !q.open && q.notes.at(-1)?.at === state.view).length;
  const openQ = bundle.questions.filter((q) => q.open).length;
  const fold = (id: string, title: string, meta: string, body: string) => body ? `<details class="fold" data-fold="${id}"${state.folds.has(id) ? ' open' : ''}><summary><span>${title}</span><small>${meta}</small></summary><div class="fold-body">${body}</div></details>` : '';
  return `<p class="eyebrow">${esc(k.label)}${k.n < state.total ? ` of ${state.total - 1}` : ''}</p>
    <h1>${esc(k.title ?? '')}</h1>
    ${situation(k, read)}
    ${fold('beats', 'What happened', `${beats.length} events`, beats.length ? `<button class="play" data-act="story">▶ Walk me through it</button><ol class="beats">${beatsHtml}</ol>` : '')}
    ${fold('new', 'New this chapter', String(fresh.length + upd.length), fresh.length + upd.length ? `${fresh.length ? `<div class="chips">${fresh.map(chip).join('')}</div>` : ''}${upd.length ? `<p class="fold-sub">Learned more about</p><div class="chips">${upd.map(chip).join('')}</div>` : ''}` : '')}
    ${fold('qs', 'Questions', [answered ? `${answered} answered` : '', openQ ? `${openQ} open` : ''].filter(Boolean).join(' · '), questionsBlock())}
    ${atEnd ? `<button class="cta" data-act="next">I’ve finished ${esc(chLabel(state.view + 1).toLowerCase())}</button>` : ''}
    ${state.view < state.furthest ? `<p class="hint">Looking back. You’ve read through ${esc(chLabel(state.furthest).toLowerCase())}. <button class="inline" data-ch="${state.furthest}">Return</button></p>` : ''}
    ${reportFoot()}`;
}

/** Three plain answers: where are they, what are they trying to do, how far from the exit. */
function situation(k: Bundle['chapters'][number], read: Bundle['chapters']): string {
  const clock = [...read].reverse().find((c) => c.clock);
  const last = bundle.hops.at(-1);
  const here = last ? bundle.stations.find((s) => s.id === last.to) : undefined;
  const stairs = bundle.stations.filter((s) => s.kind === 'stairwell' && s.ring != null && s.num != null).map((s) => s.num!);
  let exit = '';
  if (stairs.length && here?.num != null) {
    const below = stairs.filter((n) => n <= here.num!);
    const near = below.length ? Math.max(...below) : null;
    if (stairs.includes(here.num)) exit = 'At a stairwell station';
    else if (near != null) exit = `Stairs <b>${here.num - near} stations back</b> (${near})`;
  }
  const row = (label: string, body: string) => body ? `<div class="sit-row"><small>${label}</small><p>${body}</p></div>` : '';
  const meta = [exit, clock ? `${esc(clock.clock!)}${clock.n < k.n ? ` <span class="sit-dim">(ch ${clock.n})</span>` : ''}` : ''].filter(Boolean);
  return `<section class="sit" aria-label="Situation">
    ${row('Where', `${esc(k.where ?? '')}${here?.num != null && !(k.where ?? '').includes(String(here.num)) ? ` <span class="sit-num">${here.num}</span>` : ''}`)}
    ${row('Goal', gloss(esc(k.goal ?? '')))}
    ${trip(k.n, true)}
    ${meta.length ? `<p class="sit-meta">${meta.join(' · ')}</p>` : ''}
  </section>`;
}

const stationName = (id: string) => { const x = bundle.stations.find((q) => q.id === id); if (!x) return '?'; return x.num != null && !x.name.includes(String(x.num)) ? `${esc(x.name)} <span class="j-num">${x.num}</span>` : esc(x.name); };
const isDark = (hex: string) => { const n = parseInt(hex.slice(1), 16); return ((n >> 16) & 255) * 0.299 + ((n >> 8) & 255) * 0.587 + (n & 255) * 0.114 < 90; };
function rideOf(via: string | undefined) {
  const l = bundle.lines.find((x) => x.id === via);
  return l ? { name: `the ${l.name}`, chip: `<span class="t-line"><i style="background:${l.color}"></i>${esc(l.name)}</span>`, color: l.color } : { name: 'a ride the book doesn’t name', chip: '<span class="t-line t-anon"><i></i>a ride</span>', color: '#8a8577' };
}

/**
 * One chapter's travel as plain events: got on, rode, got off, walked.
 * `card` = the compact row for the chapter tab; otherwise the journey list.
 */
function trip(n: number, card = false): string {
  const k = bundle.chapters.find((c) => c.n === n);
  const hops = bundle.hops.filter((h) => h.at === n);
  const before = bundle.chapters.find((c) => c.n === n - 1)?.aboard;
  const ev: string[] = [];
  const li = (cls: string, color: string, html: string) => ev.push(`<li class="t-${cls}${isDark(color) ? ' dk' : ''}" style="--c:${color}"><i></i><span>${html}</span></li>`);
  let lastWho = '';
  const names = (who?: string[]) => { const key = String(who ?? ''); if (key === lastWho) return ''; lastWho = key; return who?.length ? ` <em>· ${esc(who.map((id) => bundle.people.find((p) => p.id === id)?.name ?? '').filter(Boolean).join(', '))} only</em>` : ' <em>· everyone again</em>'; };
  hops.forEach((h, i) => {
    const note = h.note ? ` <em>· ${esc(h.note)}</em>` : '';
    if (h.via === 'foot' || h.via === 'jump') return li('walk', '#a09a8c', `${h.via === 'foot' ? 'On foot' : 'Through a gate'} to <b>${stationName(h.to)}</b>${names(h.who)}${note}`);
    const r = rideOf(h.via);
    if (h.board) li('on', r.color, `<u>Got on</u> ${r.chip} at <b>${stationName(h.from)}</b>${names(h.who)}`);
    else if (i === 0 || hops[i - 1].via !== h.via) li('ride', r.color, `Already riding ${r.chip} from <b>${stationName(h.from)}</b>${names(h.who)}`);
    if (h.off) li('off', r.color, `<u>Got off</u> at <b>${stationName(h.to)}</b>${note}`);
    else li('ride', r.color, `${i === hops.length - 1 ? 'Rode on to' : 'Passed'} <b>${stationName(h.to)}</b>, stayed aboard${note}`);
  });
  const here = bundle.hops.filter((h) => h.at <= n).at(-1)?.to;
  if (k?.boarded) { const r = rideOf(k.aboard); li('on', r.color, `<u>Got on</u> ${r.chip}${here ? ` at <b>${stationName(here)}</b>` : ''}`); }
  const r = k?.aboard ? rideOf(k.aboard) : null;
  const end = r ? `<span class="t-state t-riding" style="--c:${r.color}">Ends the chapter riding ${r.chip}</span>` : n > 0 && bundle.hops.some((h) => h.at <= n) ? `<span class="t-state">Ends the chapter off the trains</span>` : '';
  const unknownRide = hops.find((h) => h.via === 'unknown');
  if (unknownRide) ev.push(hopAsk(bundle, unknownRide));
  if (!card) return ev.length ? `<ol class="trip">${ev.join('')}</ol>` : '';
  if (!ev.length) {
    const still = r && before === k?.aboard ? `Still riding ${r.chip}` : end ? 'No travel this chapter' : '';
    return still ? `<div class="sit-row"><small>Travel</small><p class="t-none">${still}</p></div>` : '';
  }
  return `<div class="sit-row sit-trip"><small>Travel</small><div><ol class="trip">${ev.join('')}</ol>${end}</div></div>`;
}

/** The party's whole route so far, as a journey planner would print it. */
function renderJourney(): string {
  const chs = bundle.chapters.filter((c) => c.n <= state.view && (c.boarded || bundle.hops.some((h) => h.at === c.n)));
  if (!chs.length) return `<p class="empty">No travel yet.</p>`;
  const legs = chs.map((k) => `<li class="j-ch${k.n === state.view ? ' now' : ''}">
      <button class="j-head" data-ch="${k.n}"><span class="stamp">${stamp(k.n)}</span><b>${esc(k.title ?? '')}</b></button>
      ${trip(k.n)}
    </li>`).reverse().join('');
  const last = bundle.hops.at(-1);
  const cur = bundle.chapters.find((c) => c.n === state.view)?.aboard;
  return `<p class="lede sm">Every time they got on or off, newest first.${last ? ` Now ${cur ? `riding ${rideOf(cur).chip}, last stop` : 'at'} <b>${stationName(last.to)}</b>.` : ''}</p>
    <ol class="journey">${legs}</ol>`;
}

/** The mysteries the reader is carrying, and any this chapter settled. */
function questionsBlock(): string {
  const answered = bundle.questions.filter((q) => !q.open && q.notes.at(-1)?.at === state.view);
  const open = bundle.questions.filter((q) => q.open);
  if (!answered.length && !open.length) return '';
  const item = (q: Bundle['questions'][number], cls: string) => `<li class="${cls}"><button data-open="${q.id}"><b>${esc(q.title)}</b><small>${esc((q.notes.at(-1)?.text ?? '').replace(/^Answered: (.)/, (_, c: string) => c.toUpperCase()))}</small></button></li>`;
  return `${answered.length ? `<p class="fold-sub">Answered this chapter</p><ul class="qs">${answered.map((q) => item(q, 'q-done')).join('')}</ul>` : ''}
    ${open.length ? `<p class="fold-sub">Still open</p><ul class="qs">${open.map((q) => item(q, q.since === state.view ? 'q-open q-new' : 'q-open')).join('')}</ul>` : ''}`;
}

/** Where the travelling group is right now, in a few words. */
function partyNow(): string {
  const cur = bundle.chapters.find((c) => c.n === state.view)?.aboard;
  const last = bundle.hops.at(-1);
  if (cur) return `Riding ${rideOf(cur).chip}${last ? `, last stop <b>${stationName(last.to)}</b>` : ''}`;
  return last ? `Off the trains at <b>${stationName(last.to)}</b>` : '';
}

/** Who is where, as of this chapter. */
function renderCast(): string {
  if (state.person) return renderProfile(state.person);
  const groups: [string, string][] = [['party', 'Also with the party'], ['away', 'Elsewhere on the floor'], ['off', 'Off the floor'], ['unknown', 'Whereabouts unknown'], ['dead', 'Dead']];
  const ppl = bundle.people.filter((p) => p.status);
  const crew = ppl.filter((p) => p.status!.state === 'party' && !p.base).sort((p, q) => +(q.group === 'party') - +(p.group === 'party'));
  const rest = ppl.filter((p) => !crew.includes(p));
  const changed = rest.filter((p) => state.view > 0 && p.status!.at === state.view);
  const card = (p: Bundle['people'][number]) => `<button class="who g-${p.group} s-${p.status!.state}${state.view > 0 && p.status!.at === state.view ? ' moved' : ''}" data-person="${p.id}">
      ${avatar(p)}
      <span class="who-t"><b>${esc(p.name)}</b><small>${esc(p.status!.where ?? p.tag ?? '')}</small></span>
    </button>`;
  const now = partyNow();
  return `<p class="eyebrow">As of ${esc(chLabel(state.view).toLowerCase())}</p><h1>Who’s where</h1>
    <section class="crew-card">
      <small>Travelling together</small>
      <div class="crew-row">${crew.map((p) => `<button class="crew-m s-party" data-person="${p.id}">${avatar(p, 'av-md')}<b>${esc(p.name.replace(/^Princess /, ''))}</b></button>`).join('')}</div>
      ${now ? `<p class="crew-now">${now}</p>` : ''}
    </section>
    ${changed.length ? `<h3>Changed this chapter</h3><div class="who-list">${changed.map(card).join('')}</div>` : ''}
    ${groups.map(([g, l]) => { const xs = rest.filter((p) => p.status!.state === g && !changed.includes(p)); return xs.length ? `<h3>${l}</h3><div class="who-list">${xs.map(card).join('')}</div>` : ''; }).join('')}`;
}

const STATE_LABEL: Record<string, string> = { party: 'With the party', away: 'Elsewhere on the floor', off: 'Off the floor', unknown: 'Whereabouts unknown', dead: 'Dead' };
const GROUP_LABEL: Record<string, string> = { party: 'Party member', crawler: 'Crawler', npc: 'Lives in the dungeon', show: 'Part of the show', dungeon: 'The dungeon' };

/**
 * One person, as far as the reader knows. Location information is only ever
 * the latest stamped whereabouts, with how stale it is spelled out.
 */
function renderProfile(id: string): string {
  const p = bundle.people.find((x) => x.id === id);
  if (!p || !p.status) { state.person = null; return renderCast(); }
  const st = p.status;
  const place = st.stn ?? (st.where ? placesIn(st.where)[0] : undefined);
  const fresh = st.at === state.view && state.view > 0;
  const stale = state.view - st.at;
  const freshness = st.state === 'dead' ? `Since ${esc(chLabel(st.at).toLowerCase())}.`
    : fresh ? 'Updated this chapter.'
    : st.at === 0 ? 'As far as you know from the earlier books.'
    : `Nothing new on this since ${esc(chLabel(st.at).toLowerCase())}${stale > 4 ? `, ${stale} chapters ago` : ''}.`;
  const met = p.since === 0 ? 'Known from the earlier books' : `First appears in ${esc(chLabel(p.since).toLowerCase())}`;
  const riding = st.state === 'party' && !p.base;
  // one timeline: what happened to them and where they were, chapter by chapter
  const moves = p.trail.filter((w, i, a) => i === 0 || w.where !== a[i - 1].where || w.state !== a[i - 1].state);
  const chs = [...new Set([...p.notes.map((n) => n.at), ...moves.map((w) => w.at)])].sort((a, b) => b - a);
  const timeline = chs.map((n) => {
    const mv = moves.filter((w) => w.at === n), ns = p.notes.filter((x) => x.at === n);
    return `<li class="${n === state.view ? 'tl-now' : ''}"><button class="tl-ch" data-ch="${n}"${n === 0 ? ' disabled' : ''}>${n === 0 ? 'Before' : n === state.total ? 'Epilogue' : `Ch ${n}`}</button><div>
      ${mv.map((w) => `<p class="tl-move s-${w.state}"><i></i>${STATE_LABEL[w.state]}${w.where ? `: ${esc(w.where)}` : ''}</p>`).join('')}
      ${ns.map((x) => `<p>${gloss(esc(x.text))}</p>`).join('')}
    </div></li>`;
  }).join('');
  const all = bundle.people.filter((x) => x.status);
  const i = all.indexOf(p), prev = all[(i - 1 + all.length) % all.length], next = all[(i + 1) % all.length];
  return `<button class="back" data-person="">← Everyone</button>
    <header class="prof g-${p.group} s-${st.state}">
      ${avatar(p, 'av-xl')}
      <h1>${esc(p.name)}</h1>
      <p class="prof-tags">${(p.tag ?? '').split(' · ').filter(Boolean).map((t) => `<span>${esc(t)}</span>`).join('')}</p>
      <p class="prof-grp">${GROUP_LABEL[p.group] ?? ''} · ${met}</p>
    </header>
    <section class="prof-now s-${st.state}">
      <small>Right now</small>
      <b><i></i>${STATE_LABEL[st.state] ?? st.state}</b>
      ${riding && partyNow() ? `<p>${partyNow()}</p>` : st.where ? `<p>${gloss(esc(st.where))}</p>` : ''}
      ${riding ? '' : `<p class="prof-fresh">${freshness}</p>`}
      ${riding ? `<button class="inline" data-act="party">Show the party on the map</button>` : place && st.state !== 'off' && st.state !== 'dead' ? `<button class="inline" data-show="${place}">Show this place on the map</button>` : ''}
    </section>
    <h3>Their story so far</h3>
    <ol class="tl">${timeline}</ol>
    <nav class="prof-nav"><button data-person="${prev.id}">← ${esc(prev.name)}</button><button data-person="${next.id}">${esc(next.name)} →</button></nav>`;
}

function renderCodex(): string {
  const pills = `<div class="pills">${PILLS.filter(([s]) => s !== 'diagrams' || bundle.diagrams.length || bundle.sketch || stripHtml()).map(([s, l]) => `<button data-sec="${s}" aria-pressed="${state.section === s}">${l}</button>`).join('')}</div>`;
  if (state.section === 'people') state.section = 'places';
  if (state.section === 'journey') return pills + renderJourney();
  if (state.section === 'diagrams') return pills + renderDiagrams();
  if (state.section === 'directory') return pills + renderDirectory(bundle, state.view);
  const list = entries(state.section);
  const hidden = state.view < state.total;
  const groups: [string, Entry[]][] =
    [['', [...list].sort((a, b) => Number(b.since === state.view) - Number(a.since === state.view))]];
  const card = (e: Entry) => {
    const open = state.open === e.id;
    return `<article class="card${open ? ' open' : ''}" data-entry="${e.id}">
      <button class="card-head" data-open="${e.id}" aria-expanded="${open}">
        ${e.color ? `<i class="sw" style="background:${e.color}"></i>` : ''}
        <span class="card-name">${esc(e.name)}${badge(e)}</span>
        ${e.tag ? `<span class="card-tag">${esc(e.tag)}</span>` : ''}
      </button>
      ${open ? `<div class="card-body">${notes(e)}${e.onMap ? `<button class="inline" data-show="${e.id}">Show on map</button>` : ''}</div>` : ''}
    </article>`;
  };
  return `${pills}
    ${list.length ? '' : '<p class="empty">Nothing here yet. Keep reading.</p>'}
    ${groups.map(([l, xs]) => `${l ? `<h3>${l}</h3>` : ''}${xs.map(card).join('')}`).join('')}
    ${hidden ? `<p class="sealed-note"><span class="lock"></span>The rest is still in the fog</p>` : ''}`;
}

type Part = { key: string; text: string; at: number };
const INK = '#1d1e24', PAPER = '#efe6d0', GOLD = '#c9973a', DIM = '#b9ad90';
const callout = (n: number, x: number, y: number) => `<g transform="translate(${x} ${y})"><circle r="9" fill="#e5484d"/><text y="4" text-anchor="middle" font-size="11" font-weight="700" fill="#fff">${n}</text></g>`;

/** Twenty cars in two rows, engine first. Labelled cars are filled. */
function drawCars(parts: Part[]): string {
  const num = (k: string) => (/^c(\d+)$/.exec(k) ? +RegExp.$1 : 0);
  const marked = new Map(parts.filter((p) => num(p.key)).map((p, i) => [num(p.key), i]));
  const order = parts.map((p) => p.key);
  let g = '';
  for (let c = 1; c <= 20; c++) {
    const row = c <= 10 ? 0 : 1, col = row ? 20 - c : c - 1;
    const x = 14 + col * 32, y = 22 + row * 44;
    const on = marked.has(c);
    g += c === 1
      ? `<path d="M${x + 28} ${y}H${x + 8}Q${x} ${y} ${x} ${y + 9}V${y + 18}H${x + 28}Z" fill="${on ? GOLD : PAPER}" stroke="${INK}" stroke-width="1.6"/>`
      : `<rect x="${x}" y="${y}" width="28" height="18" rx="3" fill="${on ? GOLD : PAPER}" stroke="${INK}" stroke-width="1.6"/>`;
    g += `<text x="${x + 14}" y="${y + 13}" text-anchor="middle" font-size="9.5" font-weight="600" fill="${INK}">${c}</text>`;
    if (on) g += callout(order.indexOf(`c${c}`) + 1, x + 14, y - 9);
  }
  g += `<path d="M334 31v44" stroke="${DIM}" stroke-width="1.5" fill="none"/><text x="14" y="112" font-size="10.5" fill="#6b6556">Car 1 is the front. Top row left to right, then the bottom row back.</text>`;
  return `<svg viewBox="0 0 340 122">${g}</svg>`;
}

/** A transfer station in cross-section. Only parts the reader knows are drawn. */
function drawStation(parts: Part[]): string {
  const has = (k: string) => parts.some((p) => p.key === k);
  const n = (k: string) => parts.findIndex((p) => p.key === k) + 1;
  let g = `<rect x="0" y="0" width="340" height="210" fill="${PAPER}" rx="8"/>`;
  g += `<path d="M0 132H340" stroke="${DIM}" stroke-width="1"/>`;
  if (has('upstairs')) g += `<rect x="70" y="18" width="150" height="46" rx="5" fill="#fff8e6" stroke="${INK}" stroke-width="1.6"/><path d="M110 64v26M120 64v26" stroke="${INK}" stroke-width="1.2"/><text x="145" y="45" text-anchor="middle" font-size="11" fill="${INK}" font-weight="600">saferoom · shops</text>${callout(n('upstairs'), 70, 18)}`;
  if (has('club')) g += `<rect x="18" y="86" width="26" height="40" rx="3" fill="#7a3fd1" stroke="${INK}" stroke-width="1.4"/><circle cx="38" cy="107" r="2" fill="${PAPER}"/>${callout(n('club'), 18, 86)}`;
  if (has('platform')) g += `<rect x="50" y="118" width="210" height="14" fill="#d9ceb2" stroke="${INK}" stroke-width="1.4"/>${callout(n('platform'), 60, 118)}`;
  if (has('track')) {
    g += `<path d="M20 152H320" stroke="${INK}" stroke-width="2"/><path d="M20 158H320" stroke="#e5484d" stroke-width="1.6" stroke-dasharray="6 4" opacity=".7"/>`;
    g += `<rect x="120" y="134" width="120" height="16" rx="3" fill="#f2c230" stroke="${INK}" stroke-width="1.4"/><path d="M280 144h28" stroke="${INK}" stroke-width="1.5" marker-end="url(#ah2)"/>${callout(n('track'), 120, 140)}`;
  }
  if (has('behind')) g += `<path d="M268 96q18-24 46-14q14 18 4 40q-26 12-50-4z" fill="#cfc3a6" stroke="${INK}" stroke-width="1.4"/><rect x="284" y="98" width="18" height="14" fill="#8a8370" stroke="${INK}"/>${callout(n('behind'), 270, 92)}`;
  if (has('below')) g += `<path d="M110 172q60-14 130 0q8 18-10 28q-60 8-112 0q-16-10-8-28z" fill="#cfc3a6" stroke="${INK}" stroke-width="1.4"/><circle cx="214" cy="186" r="8" fill="none" stroke="#7a3fd1" stroke-width="2"/>${callout(n('below'), 112, 174)}`;
  return `<svg viewBox="0 0 340 210"><defs><marker id="ah2" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L8 4L0 8Z" fill="${INK}"/></marker></defs>${g}</svg>`;
}

/** A stairwell chamber from above: a ring of stairs inside a ring of exits. */
function drawChamber(parts: Part[]): string {
  const has = (k: string) => parts.some((p) => p.key === k);
  const n = (k: string) => parts.findIndex((p) => p.key === k) + 1;
  const cx = 170, cy = 112;
  let g = `<rect x="0" y="0" width="340" height="224" fill="${PAPER}" rx="8"/><circle cx="${cx}" cy="${cy}" r="96" fill="#e3d7ba" stroke="${INK}" stroke-width="1.8"/>`;
  if (has('floor')) g += `<circle cx="${cx}" cy="${cy}" r="70" fill="url(#hatch)" opacity=".8"/>`;
  if (has('exits')) for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 - Math.PI / 2, x = cx + 96 * Math.cos(a), y = cy + 96 * Math.sin(a);
    const special = has('special') && i === 3;
    g += `<rect x="-9" y="-5" width="18" height="10" rx="2" transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${(a * 180) / Math.PI + 90})" fill="${special ? '#7a5cc7' : INK}"/>`;
  }
  if (has('ring')) for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2, x = cx + 42 * Math.cos(a), y = cy + 42 * Math.sin(a);
    g += `<rect x="${(x - 10).toFixed(1)}" y="${(y - 10).toFixed(1)}" width="20" height="20" rx="3" fill="${GOLD}" stroke="${INK}" stroke-width="1.4"/><path d="M${(x - 5).toFixed(1)} ${(y + 5).toFixed(1)}h3.5v-3.5h3.5v-3.5h3.5" fill="none" stroke="${INK}" stroke-width="1.4"/>`;
  }
  if (has('ring')) g += callout(n('ring'), cx, cy);
  if (has('exits')) g += callout(n('exits'), cx - 96, cy);
  if (has('special')) { const a = (3 / 10) * Math.PI * 2 - Math.PI / 2; g += callout(n('special'), cx + 112 * Math.cos(a), cy + 112 * Math.sin(a)); }
  if (has('floor')) g += callout(n('floor'), cx + 52, cy + 52);
  return `<svg viewBox="0 0 340 224"><defs><pattern id="hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0v8" stroke="#5aa0ff" stroke-width="3"/></pattern></defs>${g}</svg>`;
}

const DRAWERS: Record<string, (p: Part[]) => string> = { cars: drawCars, station: drawStation, chamber: drawChamber };

function renderDiagrams(): string {
  const ds = bundle.diagrams;
  const card = (d: Bundle['diagrams'][number]) => `<section class="dia${d.since === state.view && state.view > 0 ? ' dia-new' : ''}">
      <h3 class="h-first">${esc(d.title)}${d.since === state.view && state.view > 0 ? ' <em class="badge new">New</em>' : ''}</h3>
      <div class="dia-art">${DRAWERS[d.shape]?.(d.parts) ?? ''}</div>
      <ol class="dia-key">${d.parts.map((p, i) => `<li class="${p.at === state.view && state.view > 0 ? 'fresh' : ''}"><span class="dia-n">${i + 1}</span><span>${gloss(esc(p.text))}</span></li>`).join('')}</ol>
    </section>`;
  const strip = stripHtml();
  return `${strip ? `<section class="dia"><h3 class="h-first">The number line</h3>${strip}</section>` : ''}
    ${ds.map(card).join('')}
    ${bundle.sketch ? `<section class="dia">${renderSketch()}</section>` : ''}`;
}

function renderSketch(): string {
  const { lede, rows } = bundle.sketch!;
  return `<h3 class="h-first">The book’s own sketch: the low stations</h3>
    <p class="lede">${esc(lede)}</p>
    <ol class="sketch">${rows.map((r) => `<li class="sk-${r.mark}"><span class="sk-n">${r.n}</span><i></i><span class="sk-t">${r.label ? `<b>${esc(r.label)}</b>` : ''}${r.notes.map((n) => `<small>${esc(n.text)}</small>`).join('')}</span></li>`).join('')}</ol>`;
}

function renderPanel(keepScroll = false) {
  renderTabs();
  const body = $('.body');
  const top = body.scrollTop;
  body.innerHTML = state.tab === 'chapter' ? renderChapter() : state.tab === 'cast' ? renderCast() : renderCodex();
  body.scrollTop = keepScroll ? top : 0;
  $('.panel').classList.toggle('up', state.sheet);
  $('.rcard').innerHTML = reportCard(reportContext());
}

/** What the reader is looking at right now, so a report can say what it is about without them explaining. */
function reportContext() {
  const named = (id: string | null | undefined) => {
    if (!id) return undefined;
    const hit = [bundle.stations, bundle.lines, bundle.people, bundle.creatures].flatMap((xs) => xs as { id: string; name: string }[]).find((x) => x.id === id);
    return hit?.name || undefined;
  };
  if (state.tab === 'cast') {
    const subject = named(state.person);
    return { kind: 'person', view: 'people', where: 'People', subject, entry: subject ? state.person! : undefined };
  }
  if (state.tab === 'codex') {
    const sec = String(state.section);
    const kind = sec === 'places' || sec === 'directory' ? 'place' : sec === 'lines' ? 'line' : sec === 'journey' ? 'travel' : 'other';
    const subject = named(state.open);
    return { kind, view: /^[a-z]{2,12}$/.test(sec) ? `reference/${sec}` : 'reference', where: `Reference · ${sec[0].toUpperCase()}${sec.slice(1)}`, subject, entry: subject ? state.open! : undefined };
  }
  return { kind: 'recap', view: 'chapter', where: `${chLabel(state.view)} notes`, subject: bundle.chapters.find((k) => k.n === state.view)?.title || undefined };
}

function toast(msg: string) {
  const t = $('.toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout((toast as unknown as { h?: number }).h);
  (toast as unknown as { h?: number }).h = window.setTimeout(() => t.classList.remove('show'), 4200);
}

// ── navigation ──
let goSeq = 0;
async function go(ch: number, opts: { instant?: boolean; announce?: boolean } = {}) {
  const prev = bundle;
  const seq = ++goSeq;
  state.view = Math.max(0, Math.min(ch, state.furthest));
  save();
  const next = await load(state.view);
  if (seq !== goSeq) return; // a newer navigation won
  bundle = next;
  hideTerm();
  storyStop();
  map.setBundle(bundle, opts.instant);
  state.open = null;
  if (state.person && !bundle.people.some((p) => p.id === state.person)) state.person = null;
  renderRail();
  renderPanel();
  pads();
  requestAnimationFrame(pads);
  const k = bundle.chapters.find((c) => c.n === state.view);
  if (state.view === state.total) map.fitAll(opts.instant);
  else if (map.fitChapter(opts.instant)) { if (!opts.instant) map.play(); }
  else if (k?.focus) map.focusOn(k.focus, opts.instant);
  else map.focusOn(undefined, opts.instant);
  if (opts.announce && prev) {
    const d = (a: unknown[], b: unknown[]) => a.length - b.length;
    const parts = [
      [d(bundle.stations, prev.stations), 'place'], [d(bundle.lines, prev.lines), 'line'],
      [d(bundle.people, prev.people), 'person'], [d(bundle.creatures, prev.creatures), 'creature'], [d(bundle.rules, prev.rules), 'rule'],
    ].filter(([n]) => (n as number) > 0).map(([n, w]) => `${n} ${n === 1 ? w : w === 'person' ? 'people' : `${w}s`}`);
    const extra = '';
    toast(parts.length ? `Fog lifted: ${parts.join(', ')}.${extra}` : `Chapter marked as read.${extra}`);
  }
}

/**
 * A short guided tour of the interface. Generic on purpose: it explains the
 * controls, never the story, and skips any step whose element isn't showing.
 */
interface Step { sel?: string; title: string; text: string; before?: () => void }
function tourSteps(): Step[] {
  const m = mobile();
  return [
    { title: 'A map that lifts its own fog', text: 'This map only shows what the book has told you so far. The dark cloud is everything you haven’t read yet. Drag to move around; pinch or scroll to zoom.' },
    { sel: '.party', title: 'This is the party', text: 'The faces show where Carl and company are at the end of the chapter you’re on. Inside a coloured car means they’re riding a train. When you change chapter they travel their route, and you see where they got on and off.' },
    m
      ? { sel: '.chip', title: 'The chapter notes', text: 'Tap here to open the notes: where they are, what they’re trying to do, and what happened.' }
      : { sel: '.sit', title: 'The situation, in plain words', text: 'Each chapter opens with where they are and what they’re trying to do. Open the sections below it for more.', before: () => { if (state.tab !== 'chapter') { state.tab = 'chapter'; renderPanel(); } } },
    { sel: '.tabs', title: 'People and reference', text: '“People” tracks every character and where they are. “Reference” has places, lines, monsters, rules, terms and diagrams, all as far as you’ve read.', before: () => { if (m) { state.sheet = true; renderPanel(true); pads(); } } },
    { sel: '.rail-now', title: 'Moving through the book', text: 'Finished a chapter? Press the red arrow and hold to lift the fog one chapter further. The back arrow and the dots let you revisit earlier chapters any time.', before: () => { if (m && state.sheet) { state.sheet = false; renderPanel(true); pads(); } } },
    { sel: '.tools', title: 'Map controls', text: '“This chapter / All” fades out older places. The list icon opens the map key. The crosshair jumps back to the party. The (i) button replays this tour.' },
  ];
}

function tour(i = 0) {
  const steps = tourSteps();
  const el = $('.tour');
  while (i < steps.length && steps[i].sel && !document.querySelector(steps[i].sel!)) i++;
  if (i >= steps.length) { el.hidden = true; el.innerHTML = ''; try { localStorage.setItem(KEY + ':toured', '1'); } catch { /* ignore */ } return; }
  const st = steps[i];
  st.before?.();
  setTimeout(() => {
    const target = st.sel ? document.querySelector(st.sel) : null;
    const r = target?.getBoundingClientRect();
    const pad = 8;
    const hole = r ? `left:${r.left - pad}px;top:${r.top - pad}px;width:${r.width + pad * 2}px;height:${r.height + pad * 2}px` : 'left:50%;top:50%;width:0;height:0';
    const total = steps.length;
    el.innerHTML = `<div class="tour-hole${r ? '' : ' none'}" style="${hole}"></div>
      <div class="tour-card" role="dialog" aria-label="Tour">
        <small>${i + 1} of ${total}</small><b>${esc(st.title)}</b><p>${esc(st.text)}</p>
        <div class="row"><button class="ghost" data-tour="end">Skip</button><button class="cta" data-tour="${i + 1}">${i + 1 < total ? 'Next' : 'Done'}</button></div>
      </div>`;
    el.hidden = false;
    const card = $('.tour-card', el);
    const w = Math.min(340, innerWidth - 24);
    card.style.width = `${w}px`;
    if (!r) { card.style.left = `${(innerWidth - w) / 2}px`; card.style.top = `${innerHeight / 2 - card.offsetHeight / 2}px`; return; }
    const below = r.bottom + 16 + card.offsetHeight < innerHeight;
    const above = r.top - 16 - card.offsetHeight > 0;
    let top = below ? r.bottom + 16 : above ? r.top - 16 - card.offsetHeight : Math.max(12, innerHeight - card.offsetHeight - 12);
    let left = Math.max(12, Math.min(innerWidth - w - 12, r.left + r.width / 2 - w / 2));
    if (!below && !above && r.right + 16 + w < innerWidth) { left = r.right + 16; top = Math.max(12, Math.min(innerHeight - card.offsetHeight - 12, r.top)); }
    card.style.left = `${left}px`;
    card.style.top = `${Math.max(12, Math.min(top, innerHeight - card.offsetHeight - 12))}px`;
  }, st.before ? 480 : 30);
}

/** Which mapped places a sentence talks about, by name or by station number. */
function placesIn(text: string): string[] {
  const t = text.toLowerCase();
  const out: string[] = [];
  const onMap = bundle.stations.filter((s) => s.xy);
  for (const s of onMap) {
    const named = !/^station \d+/i.test(s.name) && t.includes(s.name.toLowerCase().replace(/ station$/, ''));
    if (named && !out.includes(s.id)) out.push(s.id);
  }
  for (const m of t.matchAll(/station(?:s)? (\d+)/g)) {
    const n = +m[1];
    const s = onMap.find((x) => x.num === n && !/second/i.test(x.name)) ?? onMap.find((x) => x.num === n);
    if (s && !out.includes(s.id)) out.push(s.id);
  }
  return out;
}

/** Story mode: step through the chapter's beats, moving the map to each place mentioned. */
const story = { on: false, i: 0, timer: 0 };
function storyBeats() {
  const k = bundle.chapters.find((c) => c.n === state.view);
  return (k?.beats ?? []).map((b) => ({ text: b, places: placesIn(b) }));
}
function storyShow(i: number) {
  const beats = storyBeats();
  if (!beats.length) return storyStop();
  story.i = Math.max(0, Math.min(i, beats.length - 1));
  const b = beats[story.i];
  const el = $('.story');
  el.hidden = false;
  el.innerHTML = `<div class="story-top"><small>${esc(chLabel(state.view))} · ${story.i + 1} of ${beats.length}</small><button data-story="stop" aria-label="Stop">×</button></div>
    <p>${gloss(esc(b.text))}</p>
    <div class="story-nav"><button class="ghost" data-story="prev" ${story.i === 0 ? 'disabled' : ''}>Back</button>
    <div class="story-dots">${beats.map((_, j) => `<i class="${j === story.i ? 'on' : j < story.i ? 'done' : ''}"></i>`).join('')}</div>
    <button class="cta" data-story="${story.i + 1 < beats.length ? 'next' : 'stop'}">${story.i + 1 < beats.length ? 'Next' : 'Done'}</button></div>`;
  const id = b.places[0];
  const line = id ? undefined : bundle.lines.find((l) => (l.segs.length || l.legs.length) && b.text.toLowerCase().includes(l.name.toLowerCase()));
  map.select(id ?? line?.id ?? null);
  if (id) map.focusOn(id); else map.fitChapter() || map.focusOn(undefined);
  clearTimeout(story.timer);
}
function storyStart() {
  story.on = true;
  if (mobile() && state.sheet) { state.sheet = false; renderPanel(true); pads(); }
  storyShow(0);
}
function storyStop() {
  story.on = false;
  clearTimeout(story.timer);
  const el = $('.story');
  el.hidden = true;
  el.innerHTML = '';
  map.select(null);
}

function modal(html: string, onMount?: (el: HTMLElement) => void) {
  const m = $('.modal');
  m.innerHTML = `<div class="sheet" role="dialog" aria-modal="true">${html}</div>`;
  // the dialog is named by its heading, for screen readers
  const title = m.querySelector('h2');
  if (title) { title.id = 'sheet-title'; m.firstElementChild!.setAttribute('aria-labelledby', 'sheet-title'); }
  m.hidden = false;
  onMount?.(m);
}
let holdTimer = 0;
const closeModal = () => { clearTimeout(holdTimer); holdTimer = 0; $('.modal').hidden = true; $('.modal').innerHTML = ''; };

/** Unsealing is deliberate: press and hold. */
function askReveal(n: number) {
  const jump = n - state.furthest;
  modal(`
    <p class="eyebrow">Unseal</p>
    <h2>Have you finished ${esc(chLabel(n).toLowerCase())}?</h2>
    <p>${jump > 1 ? `This uncovers everything from ${jump} chapters at once, up to the end of ${esc(chLabel(n).toLowerCase())}.` : `This uncovers what the book reveals up to the end of ${esc(chLabel(n).toLowerCase())}, and nothing after it.`} You can always look back at earlier chapters.</p>
    <div class="row">
      <button class="ghost" data-act="close">Not yet</button>
      <button class="hold" data-n="${n}"><span>Hold to lift the fog</span><i></i></button>
    </div>`, (m) => {
    const b = $('.hold', m);
    const done = async () => { if (!b.isConnected) return; state.furthest = n; closeModal(); await go(n, { announce: true }); };
    const start = () => { if (holdTimer) return; b.classList.add('holding'); holdTimer = window.setTimeout(() => { holdTimer = 0; done(); }, 900); };
    const stop = () => { b.classList.remove('holding'); clearTimeout(holdTimer); holdTimer = 0; };
    b.addEventListener('pointerdown', start);
    for (const e of ['pointerup', 'pointerleave', 'pointercancel', 'blur']) b.addEventListener(e, stop);
    // keyboard: the key has to be held just as long
    b.addEventListener('keydown', (e) => { const k = (e as KeyboardEvent).key; if ((k === 'Enter' || k === ' ') && !(e as KeyboardEvent).repeat) start(); if (k === 'Enter' || k === ' ') e.preventDefault(); });
    b.addEventListener('keyup', stop);
    b.addEventListener('contextmenu', (e) => e.preventDefault());
  });
}

let pick = 0;
function welcome() {
  pick = 0;
  const cell = (n: number) => `<button class="pk${n === 0 ? ' on' : ''}" data-pick="${n}" aria-pressed="${n === 0}">${n === 0 ? 'Not started' : n === state.total ? 'End' : n}</button>`;
  modal(`
    <h2 class="sign" aria-label="Iron Untangled"><span class="sign-ring" aria-hidden="true"></span><span class="sign-bar" aria-hidden="true">Iron <i>Un</i>tangled</span></h2>
    <p class="lede">A spoiler-safe map of the Iron Tangle, the subway floor in <i>Dungeon Crawler Carl: The Dungeon Anarchist’s Cookbook</i>.</p>
    <ul class="what">
      <li><b>A map that fills in as you read.</b> Stations, lines and where the party is, only as far as your chapter.</li>
      <li><b>A recap for every chapter.</b> Who’s who, what happened, and the rules of the floor so far.</li>
      <li><b>Nothing from later.</b> Your browser never even downloads the chapters ahead of you.</li>
    </ul>
    <p class="field">Where are you in the book?</p>
    <p class="pick-hint">Pick the last chapter you finished. You can move on a chapter at a time as you read.</p>
    <div class="pick" role="group" aria-label="Last chapter you finished">${Array.from({ length: state.total + 1 }, (_, n) => cell(n)).join('')}</div>
    <div class="row tight"><button class="cta" data-act="begin">Open the map</button></div>
    <button class="whole" data-act="whole">Finished the book? Just view the whole map</button>
    <p class="fine">Assumes you’ve read books 1 and 2. An unofficial fan project: the map is our interpretation of the book, not an official layout, and most details are unverified.</p>`);
}

function about() {
  modal(`
    <p class="eyebrow">About</p>
    <h2>The Iron Tangle, as far as you’ve read</h2>
    <p class="caveat-box"><b>This is not an official map.</b> It is a fan interpretation of what the book describes. The book gives station numbers and line names but never says where anything sits, so the positions, distances and shapes of the lines are our own reading of it, drawn like a subway diagram rather than to scale.</p>
    <p><b>How reliable are the facts?</b> Treat them as mostly unverified. Station numbers, line names and who was where were gathered from chapter summaries and the fan wiki, not checked line by line against the book, so expect gaps and mistakes.</p>
    <p><b>Spoiler policy.</b> Every fact here is stamped with the chapter that reveals it. The site is built as one file per chapter, and your browser only ever downloads the file for a chapter you have unsealed. Nothing later is hidden in the page.</p>
    <p><b>Reading the map.</b> Solid lines have been ridden. Dotted lines are known about but not seen. Faint rings are station numbers shared by more than one line. The pulsing mark is the party.</p>
    <p><b>Spotted a mistake?</b> <button class="inline" data-act="report">Report an inaccuracy</button>. Reports are posted publicly on GitHub.</p>
    <p><b>Privacy.</b> No accounts and no cookies. Your reading progress is stored only in this browser. Cloudflare provides anonymous, aggregate traffic statistics. Anything you send with the report form is posted publicly on GitHub.</p>
    <p class="fine">Sources: the Dungeon Crawler Carl fan wiki, chapter-summaries.com, and fan maps by other readers for inspiration. All text is paraphrase. <i>Dungeon Crawler Carl</i> is by Matt Dinniman; this is an unofficial fan companion.</p>
    <a class="credit" href="https://www.threads.com/@canalesb93" target="_blank" rel="noopener" aria-label="Created by Ricardo Canales. Open @canalesb93 on Threads">
      <span class="credit-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 0 1 3.02.142c-.126-.742-.375-1.332-.75-1.757-.513-.586-1.308-.883-2.359-.89h-.029c-.844 0-1.992.232-2.721 1.32L7.734 7.847c.98-1.454 2.568-2.256 4.478-2.256h.044c3.194.02 5.097 1.975 5.287 5.388.108.046.216.094.321.142 1.49.7 2.58 1.761 3.154 3.07.797 1.82.871 4.79-1.548 7.158-1.85 1.81-4.094 2.628-7.277 2.65Zm1.003-11.69c-.242 0-.487.007-.739.021-1.836.103-2.98.946-2.916 2.143.067 1.256 1.452 1.839 2.784 1.767 1.224-.065 2.818-.543 3.086-3.71a10.5 10.5 0 0 0-2.215-.221z"/></svg></span>
      <span class="credit-text"><small>Created by</small><b>Ricardo Canales</b></span>
      <span class="credit-handle">@canalesb93</span>
      <svg class="credit-go" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8"/></svg>
    </a>
    <p class="oss"><a href="https://github.com/canalesb93/iron-untangled" target="_blank" rel="noopener">Open source. Found a mistake? Contributions welcome.</a></p>
    <div class="row"><button class="ghost danger" data-act="reset">Reset my progress</button><button class="ghost" data-act="tour">Show me around</button><button class="cta" data-act="close">Close</button></div>`);
}

function openPerson(id: string) {
  state.tab = 'cast';
  state.person = id;
  if (mobile()) state.sheet = true;
  renderPanel();
  pads();
  const p = bundle.people.find((x) => x.id === id);
  const place = p?.status?.stn ?? (p?.status?.where ? placesIn(p.status.where)[0] : undefined);
  map.select(place ?? null);
}

function openEntry(id: string, show = false) {
  const sec = sectionOf(id);
  if (!sec) return;
  if (sec === 'people') return openPerson(id);
  state.tab = 'codex';
  state.section = sec;
  state.open = id;
  if (mobile()) state.sheet = true;
  renderPanel();
  pads();
  map.select(id);
  if (show) map.focusOn(id);
  $(`[data-entry="${CSS.escape(id)}"]`)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}

map.onSelect = (id) => {
  if (id) openEntry(id);
  else { map.select(null); if (mobile() && state.sheet) { state.sheet = false; renderPanel(true); pads(); } }
};

document.addEventListener('click', (ev) => {
  if (state.tab === 'codex' && state.section === 'directory' && handleDirectoryClick(ev, () => renderPanel(true))) return;
  const pk = (ev.target as Element).closest<HTMLElement>('[data-pick]');
  if (pk) { pick = +pk.dataset.pick!; document.querySelectorAll('.pk').forEach((e) => { const on = e === pk; e.classList.toggle('on', on); e.setAttribute('aria-pressed', String(on)); }); $('.modal .cta').textContent = pick === 0 ? 'Open the map' : `Open the map at ${chLabel(pick).toLowerCase()}`; return; }
  const sb = (ev.target as Element).closest<HTMLElement>('[data-story]');
  if (sb) { const v = sb.dataset.story; if (v === 'stop') storyStop(); else storyShow(story.i + (v === 'next' ? 1 : -1)); return; }
  const bp = (ev.target as Element).closest<HTMLElement>('li[data-place]');
  if (bp && !(ev.target as Element).closest('[data-term]')) { map.select(bp.dataset.place!); map.focusOn(bp.dataset.place!); if (mobile()) { state.sheet = false; renderPanel(true); pads(); } return; }
  const tb = (ev.target as Element).closest<HTMLElement>('[data-tour]');
  if (tb) { const v = tb.dataset.tour!; if (v === 'end') tour(999); else tour(+v); return; }
  if ((ev.target as Element).closest('.tour')) return;
  const term = (ev.target as Element).closest<HTMLElement>('[data-term]');
  if (term) { showTerm(term); return; }
  if (!(ev.target as Element).closest('.pop')) hideTerm();
  const t = (ev.target as Element).closest<HTMLElement>('[data-act],[data-ch],[data-tab],[data-sec],[data-open],[data-show],[data-person]');
  if (!t) { if ((ev.target as Element).classList.contains('modal') && state.furthest + state.view > 0) closeModal(); return; }
  if (t.closest('#map')) return;
  const d = t.dataset;
  if (d.ch != null) {
    const n = +d.ch;
    if (n <= state.furthest) go(n); else askReveal(n);
  } else if (d.tab) { if (d.tab === 'cast' && state.tab === 'cast') state.person = null; state.tab = d.tab as Tab; renderPanel(); }
  else if (d.person != null) { if (d.person) openPerson(d.person); else { state.person = null; renderPanel(); map.select(null); } }
  else if (d.sec) { state.section = d.sec as Section; state.open = null; renderPanel(); }
  else if (d.show) { map.select(d.show); map.focusOn(d.show); if (mobile()) { state.sheet = false; renderPanel(true); pads(); } }
  else if (d.open) {
    if (state.tab === 'codex' && state.open === d.open) { state.open = null; map.select(null); renderPanel(true); }
    else openEntry(d.open);
  } else switch (d.act) {
    case 'prev': go(state.view - 1); break;
    case 'next': state.view < state.furthest ? go(state.view + 1) : state.view < state.total && askReveal(state.view + 1); break;
    case 'tilt': state.tilt = !state.tilt; save(); syncTilt(); break;
    case 'fit': map.fitAll(); break;
    case 'spot': state.spot = !state.spot; save(); syncSpot(); break;
    case 'legend': state.legend = !state.legend; save(); renderLegend(); break;
    case 'party': map.focusOn(undefined); break;
    case 'story': storyStart(); break;
    case 'about': about(); break;
    case 'report': closeModal(); openReport(t, { chapter: state.view, furthest: state.furthest, label: chLabel }); break;
    case 'tour': closeModal(); tour(); break;
    case 'close': closeModal(); break;
    case 'sheet': state.sheet = !state.sheet; renderPanel(true); pads(); break;
    case 'begin': {
      const n = pick;
      state.furthest = n; closeModal(); go(n, { instant: true }).then(() => setTimeout(() => tour(), 500));
      break;
    }
    case 'whole': {
      // the whole map spoils everything, so it takes a second, deliberate tap
      const w = t as HTMLElement;
      if (!w.classList.contains('armed')) { w.classList.add('armed'); w.textContent = 'This shows the entire book, ending included. Tap again to open'; break; }
      state.furthest = state.total; closeModal(); go(state.total, { instant: true });
      break;
    }
    case 'reset':
      if (confirm('Forget how far you have read and fog the whole map again?')) { localStorage.removeItem(KEY); location.reload(); }
      break;
  }
});
addEventListener('keydown', (e) => {
  if (story.on && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) { storyShow(story.i + (e.key === 'ArrowRight' ? 1 : -1)); e.stopImmediatePropagation(); return; }
  if (e.key === 'Escape') { storyStop(); hideTerm(); if (!$('.tour').hidden) tour(999); }
  if (!$('.modal').hidden) { if (e.key === 'Escape' && saved) closeModal(); return; }
  if (e.key === 'ArrowLeft') $('[data-act="prev"]').click();
  if (e.key === 'ArrowRight') $('[data-act="next"]').click();
});

function syncSpot() {
  map.setFocus(state.spot);
  $('[data-act="spot"]').setAttribute('aria-pressed', String(state.spot));
}

function syncTilt() {
  map.setTilt(state.tilt);
  $('[data-act="tilt"]').setAttribute('aria-pressed', String(state.tilt));
}

// ── boot ──
(async () => {
  const meta = await fetch('/data/meta.json').then((r) => r.json()) as { total: number; labels: string[] };
  state.total = meta.total;
  state.labels = meta.labels;
  state.furthest = Math.min(state.furthest, state.total);
  syncTilt();
  syncSpot();
  await go(Math.min(state.view, state.furthest), { instant: true });
  if (!saved) welcome();
})();

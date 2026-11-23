/**
 * Slicing: turn the full content into what a reader who has finished
 * chapter `ch` is allowed to know. Pure function, shared by the bundle
 * builder and the spoiler lint.
 */
import type { Content, Pattern, Stage, Station, StationKind } from '../content/types.ts';
import { along, place, radius } from './geometry.ts';

const upto = <T extends { at: number }>(xs: T[], ch: number): T[] =>
  xs.filter((x) => x.at <= ch);

const last = <T extends { at: number }>(xs: T[], ch: number): T | undefined =>
  upto(xs, ch).sort((a, b) => a.at - b.at).at(-1);

const texts = (xs: Stage[], ch: number) =>
  upto(xs, ch)
    .sort((a, b) => a.at - b.at)
    .map((s) => ({ at: s.at, text: s.text }));

export interface Bundle {
  ch: number;
  total: number;
  /** Labels only for chapters not yet read: never titles, beats or locations. */
  /** Map key: only the symbols this bundle actually draws, with plain wording for this chapter. */
  legend: { key: string; text: string }[];
  /** Jargon the reader has met, with plain definitions. */
  diagrams: { id: string; shape: string; title: string; since: number; parts: { key: string; text: string; at: number }[] }[];
  questions: { id: string; title: string; open: boolean; since: number; notes: { at: number; text: string }[] }[];
  glossary: { id: string; term: string; aliases: string[]; def: string; since: number }[];
  chapters: {
    n: number;
    label: string;
    title?: string;
    goal?: string;
    clock?: string;
    where?: string;
    beats?: string[];
    focus?: string;
    /** Still riding this at the end of the chapter. */
    aboard?: string;
    /** They got on during this chapter without the vehicle going anywhere yet. */
    boarded?: boolean;
  }[];
  lines: {
    id: string; name: string; kind: string; tag: string; color: string; since: number; notes: { at: number; text: string }[];
    /** Known stretches as flat x,y lists. */
    /** `fade`: which ends trail off because the reader doesn't know where the line goes next. */
    segs: { mode: 'ridden' | 'charted'; at: number; pts: number[]; fade?: [boolean, boolean] }[];
    /** Named routes through known stops. */
    legs: { at: number; closed: boolean; pts: number[] }[];
  }[];
  stations: {
    id: string; num?: number; name: string; kind: string; tag: string; glyph?: string; since: number; notes: { at: number; text: string }[];
    /** Position, absent for a ring nobody has visited yet. */
    xy?: [number, number];
    /** Radius of the ring, for numbers that exist on every line. */
    ring?: number;
  }[];
  sketch?: { lede: string; rows: { n: number; label?: string; mark: string; notes: { at: number; text: string }[] }[] };
  people: { id: string; name: string; group: string; tag?: string; since: number; notes: { at: number; text: string }[]; status?: { at: number; state: string; where?: string; stn?: string }; base?: boolean; trail: { at: number; state: string; where?: string }[] }[];
  creatures: { id: string; name: string; rank: string; where?: string; since: number; notes: { at: number; text: string }[] }[];
  rules: { id: string; title: string; status: string; since: number; notes: { at: number; text: string }[] }[];
  /** `board`: got on at `from`. `off`: got off at `to`. `who`: travellers, when not everyone. */
  hops: { at: number; from: string; to: string; via: string; note?: string; pts: number[]; board: boolean; off: boolean; who?: string[] }[];
  /** The station directory: one row per known number, plus what the rules reached so far imply. */
  directory: {
    rows: DirRow[];
    /** Colour key for the kinds these rows use (kinds are normalised: saferoom counts as transfer). */
    key: { kind: string; label: string; color: string }[];
    /** Continuity errors whose contradiction the reader can now see. */
    goofs: { id: string; title: string; text: string; since: number }[];
    /** Only in the final bundle. */
    credit?: { title: string; url: string; text: string };
  };
}

export interface DirItem {
  id: string; name: string; kind: string; tag: string; since: number; onMap: boolean;
  lines: string[]; has: string[]; lives: string[];
  /** Latest note, for rows without facts. */
  note?: string;
  /** Rules (already reached) that this row fits. */
  fits: string[];
}
export interface DirRow {
  n: number;
  items: DirItem[];
  /** Nobody has seen this number; a rule already reached says what it should be. */
  inferred?: { kind: string; tag: string; has: string[]; why: string[]; at: number };
}

const LINE_TAG = { colored: 'Coloured line', named: 'Named train', service: 'Staff track', special: 'Special' };
const STATION_TAG: Record<string, string> = {
  stop: 'Stop', transfer: 'Transfer station', stairwell: 'Stairwell station', saferoom: 'Saferoom',
  endline: 'End of the line', depot: 'Yard', landmark: 'Landmark', core: 'Landmark', cavern: 'Exit-only cavern',
};
/** Directory colours: close to the map's own marks, readable on the dark panel. */
const DIR_COLOR: Record<string, string> = {
  stop: '#8a857a', transfer: '#efe6d0', stairwell: '#c9973a', endline: '#e5484d', depot: '#6f8396', landmark: '#b98bb0', cavern: '#3d9bff',
};
const STATUS = { rumour: 'Rumour', theory: 'Theory', fact: 'Confirmed', debunked: 'Debunked' };

/** Does this station have a spot on the map yet? */
export const onMap = (s: Station, ch: number) => !!s.pos && (s.mapAt != null ? s.mapAt <= ch : !s.ring);

function legendFor(b: Omit<Bundle, 'legend'>): Bundle['legend'] {
  const out: Bundle['legend'] = [];
  const add = (key: string, text: string, when: unknown) => { if (when) out.push({ key, text }); };
  const kinds = new Set(b.stations.filter((s) => s.xy).map((s) => s.kind));
  const segs = b.lines.flatMap((l) => l.segs);
  const legs = b.lines.filter((l) => l.legs.length);
  const saferooms = b.rules.some((r) => r.id === 'transfers');
  add('party', 'The party, as of the end of this chapter', b.hops.length);
  add('now', 'Where they travelled this chapter', b.hops.some((h) => h.at === b.ch));
  add('car', 'The party is riding: the car takes the line’s colour', b.chapters.some((k) => k.n === b.ch && k.aboard));
  add('on', 'Got on here this chapter', b.hops.some((h) => h.at === b.ch && h.board) || b.chapters.some((k) => k.n === b.ch && k.boarded));
  add('off', 'Got off here this chapter', b.hops.some((h) => h.at === b.ch && h.off));
  add('seen', 'Someone else, where you last heard of them', b.people.some((p) => p.status?.state === 'away' && p.status.stn && b.ch - p.status.at <= 4));
  add('ride', 'Track the party has ridden', segs.some((s) => s.mode === 'ridden'));
  add('chart', 'Track they know about but haven’t seen', segs.some((s) => s.mode === 'charted'));
  add('leg', 'A named train’s route', legs.some((l) => l.kind === 'named'));
  add('service', 'Staff-only track', legs.some((l) => l.kind === 'service'));
  add('trail', 'A journey off the tracks', b.hops.some((h) => h.pts.length <= 4));
  add('stop', 'Station', kinds.has('stop'));
  add('transfer', saferooms ? 'Transfer station: lines meet, and there’s usually a saferoom' : 'Transfer station: where lines meet', kinds.has('transfer') || kinds.has('saferoom'));
  add('stairwell', 'Stairwell station: stairs to the next floor', kinds.has('stairwell'));
  add('ring', 'A station number shared by every coloured line', b.stations.some((s) => s.ring != null));
  add('endline', 'End of the line', kinds.has('endline'));
  add('depot', 'Trainyard', kinds.has('depot'));
  add('landmark', 'Not an ordinary station', kinds.has('landmark'));
  const core = b.stations.find((s) => s.kind === 'core' && s.xy);
  if (core) add('core', core.name, true);
  add('fog', 'Fog: what the book hasn’t shown you yet', b.ch < b.total);
  return out;
}

/**
 * Walk the journey in order and work out, for every leg, whether the party
 * got on at its start and off at its end. Uses nothing later than `ch`.
 */
function boarding(c: Content, ch: number) {
  const vehicle = (v: string) => v !== 'foot' && v !== 'jump';
  const hops = new Map<Content['hops'][number], { board: boolean; off: boolean }>();
  const inPlace = new Set<number>();
  let riding: string | null = null;
  for (const k of c.chapters.filter((x) => x.n <= ch)) {
    const hs = c.hops.filter((h) => h.at === k.n);
    hs.forEach((h, i) => {
      if (!vehicle(h.via)) { riding = null; hops.set(h, { board: false, off: false }); return; }
      const board = h.board ?? riding !== h.via;
      const next = hs[i + 1];
      const off = h.off ?? (next ? next.via !== h.via : k.aboard !== h.via);
      hops.set(h, { board, off });
      riding = off ? null : h.via;
    });
    if (k.aboard && riding == null) inPlace.add(k.n);
    riding = k.aboard ?? null;
  }
  return { hops, inPlace };
}

/**
 * The directory as of `ch`. Seen rows come from stations with a number;
 * annotations and inferred rows only from patterns whose lore stage is <= ch.
 */
function directory(c: Content, ch: number): Bundle['directory'] {
  const union = (xs: string[][]) => [...new Set(xs.flat())];
  const rules = c.patterns.filter((p) => p.at <= ch && c.rules.some((r) => r.id === p.rule && r.revealAt <= ch && r.stages.some((s) => s.at === p.at)));
  const byNum = new Map<number, DirItem[]>();
  for (const st of c.stations) {
    if (st.num == null || st.revealAt > ch) continue;
    const kind = last(st.kinds, ch)?.kind ?? 'stop';
    const fs = upto(st.facts ?? [], ch);
    const item: DirItem = {
      id: st.id, name: last(st.names ?? [], ch)?.text ?? st.name, kind, tag: STATION_TAG[kind] ?? 'Stop', since: st.revealAt,
      onMap: onMap(st, ch) || (!!st.ring && (st.ringAt ?? st.revealAt) <= ch),
      lines: union(fs.map((f) => f.lines ?? [])), has: union(fs.map((f) => f.has ?? [])), lives: union(fs.map((f) => f.lives ?? [])),
      note: fs.length ? undefined : texts(st.stages, ch).at(-1)?.text,
      fits: rules.map((p) => p.fits(st.num!, kind)).filter((x): x is string => !!x),
    };
    byNum.set(st.num, [...(byNum.get(st.num) ?? []), item]);
  }
  const rows: DirRow[] = [];
  const norm = (k: string) => (k === 'saferoom' ? 'transfer' : k === 'core' ? 'landmark' : k);
  for (let n = 1; n <= 436; n++) {
    const items = byNum.get(n);
    if (items) { rows.push({ n, items }); continue; }
    let sofar: { kind?: StationKind; tag?: string; has: string[] } = { has: [] };
    const used: Pattern[] = [];
    for (const p of rules) {
      const r = p.implies?.(n, sofar);
      if (!r) continue;
      used.push(p);
      sofar = { kind: sofar.kind ?? r.kind, tag: sofar.tag ?? r.tag, has: [...sofar.has, ...(r.has ?? [])] };
    }
    if (sofar.kind) rows.push({ n, items: [], inferred: { kind: sofar.kind, tag: sofar.tag ?? STATION_TAG[sofar.kind], has: sofar.has, why: used.map((p) => p.fits(n, sofar.kind!)).filter((x): x is string => !!x), at: Math.max(...used.map((p) => p.at)) } });
  }
  for (const r of rows) { for (const it of r.items) it.kind = norm(it.kind); if (r.inferred) r.inferred.kind = norm(r.inferred.kind); }
  const present = new Set(rows.flatMap((r) => [...r.items.map((i) => i.kind), ...(r.inferred ? [r.inferred.kind] : [])]));
  return {
    rows,
    key: Object.keys(DIR_COLOR).filter((k) => present.has(k)).map((k) => ({ kind: k, label: k === 'transfer' ? 'Transfer' : STATION_TAG[k], color: DIR_COLOR[k] })),
    goofs: c.goofs.filter((g) => g.revealAt <= ch).map((g) => ({ id: g.id, title: g.title, text: g.text, since: g.revealAt })),
    credit: ch >= c.credit.revealAt && ch === c.chapters.length ? { title: c.credit.title, url: c.credit.url, text: c.credit.text } : undefined,
  };
}

export function slice(c: Content, ch: number): Bundle {
  const b = sliceBody(c, ch);
  return { ...b, legend: legendFor(b) };
}

function sliceBody(c: Content, ch: number): Omit<Bundle, 'legend'> {
  const xyOf = (id: string) => {
    const st = c.stations.find((x) => x.id === id);
    if (!st) throw new Error(`unknown station ${id}`);
    return place(st, c.lines);
  };
  const seen = <T extends { revealAt: number }>(xs: T[]) => xs.filter((x) => x.revealAt <= ch);
  const rides = boarding(c, ch);
  return {
    ch,
    total: c.chapters.length,
    chapters: c.chapters.map((k) =>
      k.n <= ch
        ? { n: k.n, label: k.label, title: k.title, goal: k.goal, clock: k.clock, where: k.where, beats: k.beats, focus: k.focus, aboard: k.aboard, boarded: rides.inPlace.has(k.n) || undefined }
        : { n: k.n, label: k.label },
    ),
    lines: seen(c.lines).map((l) => ({
      id: l.id, name: l.name, kind: l.kind, tag: l.kind === 'colored' && !c.rules.some((r) => r.id === 'one-way' && r.revealAt <= ch) ? 'Train line' : LINE_TAG[l.kind], color: l.color, since: l.revealAt, notes: texts(l.stages, ch),
      segs: upto(l.spans ?? [], ch).map((sp) => ({ mode: sp.mode, at: sp.at, pts: along(l, sp.from, sp.to), fade: sp.mode === 'charted' ? [sp.from > 11, sp.to < 435] as [boolean, boolean] : undefined })),
      legs: upto(l.legs ?? [], ch)
        .filter((g) => g.until == null || ch < g.until)
        .map((g) => ({ at: g.at, closed: !!g.closed, pts: g.stops.flatMap((id) => (typeof id === 'string' ? xyOf(id) : id)) })),
    })),
    stations: seen(c.stations).map((s) => ({
      id: s.id, num: s.num, name: last(s.names ?? [], ch)?.text ?? s.name, kind: last(s.kinds, ch)?.kind ?? 'stop',
      tag: STATION_TAG[last(s.kinds, ch)?.kind ?? 'stop'] + (s.ring ? ' · on every coloured line' : ''), glyph: s.glyph,
      since: s.revealAt, notes: texts(s.stages, ch),
      xy: onMap(s, ch) ? place(s, c.lines) : undefined,
      ring: s.ring && s.num != null && (s.ringAt ?? s.revealAt) <= ch ? Math.round(radius(s.num)) : undefined,
    })),
    diagrams: c.diagrams.filter((d) => d.revealAt <= ch).map((d) => ({ id: d.id, shape: d.shape, title: d.title, since: d.revealAt, parts: d.parts.map((p) => ({ key: p.key, s: last(p.stages, ch) })).filter((p) => p.s).map((p) => ({ key: p.key, text: p.s!.text, at: p.s!.at })) })),
    questions: c.questions.filter((q) => q.revealAt <= ch).map((q) => ({ id: q.id, title: q.title, open: q.closedAt == null || q.closedAt > ch, since: q.revealAt, notes: texts(q.stages, ch) })),
    glossary: c.glossary.filter((t) => t.revealAt <= ch).map((t) => ({ id: t.id, term: t.term, aliases: t.aliases ?? [], def: t.def, since: t.revealAt })),
    sketch: c.sketch.revealAt <= ch
      ? { lede: c.sketch.lede, rows: c.sketch.rows.map((r) => ({ n: r.n, label: r.label, mark: r.mark, notes: texts(r.notes, ch) })) }
      : undefined,
    people: seen(c.people).map((p) => ({
      id: p.id, name: p.name, group: p.group, tag: last(p.tags, ch)?.text, since: p.revealAt, notes: texts(p.stages, ch),
      trail: [...(p.whereabouts ?? [])].filter((w) => w.at <= ch).sort((a, b) => a.at - b.at).map(({ at, state, where }) => ({ at, state, where })),
      base: p.base,
      status: (({ at, state, where, stn }: { at: number; state: string; where?: string; stn?: string }) => ({ at, state, where, stn: stn && c.stations.some((x) => x.id === stn && x.revealAt <= ch && onMap(x, ch)) ? stn : undefined }))(last(p.whereabouts ?? [], ch) ?? { at: p.revealAt, state: 'unknown', where: undefined }),
    })),
    creatures: seen(c.creatures).map((m) => ({
      id: m.id, name: m.name, rank: m.rank, where: last(m.where, ch)?.text, since: m.revealAt, notes: texts(m.stages, ch),
    })),
    rules: seen(c.rules).map((r) => ({
      id: r.id, title: r.title, status: STATUS[last(r.status, ch)?.value ?? 'theory'], since: r.revealAt, notes: texts(r.stages, ch),
    })),
    hops: upto(c.hops, ch).map((h) => {
      const { board, off } = rides.hops.get(h)!;
      const a = c.stations.find((x) => x.id === h.from)!, b = c.stations.find((x) => x.id === h.to)!;
      const l = c.lines.find((x) => x.id === h.via);
      const mid = l?.arm != null && a.num != null && b.num != null ? along(l, a.num, b.num) : [];
      return { at: h.at, from: h.from, to: h.to, via: h.via, note: h.note, pts: [...place(a, c.lines), ...mid, ...place(b, c.lines)], board, off, who: h.who };
    }),
    directory: directory(c, ch),
  };
}

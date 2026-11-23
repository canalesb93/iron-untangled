/**
 * Content schema. Everything a reader can see is tagged with the chapter at
 * which the book itself reveals it. The build step slices this into one
 * bundle per chapter, so a reader's browser never downloads text from a
 * chapter they have not reached.
 */

/** Position in the book: 0 = before starting, 1..N = "I have finished chapter N". */
export type Ch = number;

/** A piece of knowledge that becomes visible once `at` has been read. */
export interface Stage {
  at: Ch;
  text: string;
}

export interface Chapter {
  n: Ch;
  /** e.g. "Chapter 7" or "Epilogue" */
  label: string;
  /** Short non-spoiling evocative title of our own making (the book's chapters are untitled). */
  title: string;
  /** In-story clock if the chapter states it. */
  clock?: string;
  /** What the party is trying to do as of the end of this chapter, without hindsight. */
  goal?: string;
  /** Where the party is, in a few words. */
  where: string;
  /** Recap bullets, own words. Only shipped in bundles >= n. */
  beats: string[];
  /** Map camera focus: id of a station or line. */
  focus?: string;
  /** If the chapter ends with the party still riding something: the line id, or 'unknown' for an unnamed vehicle. */
  aboard?: string;
}

export type LineKind = 'colored' | 'named' | 'service' | 'special';

export interface Line {
  id: string;
  revealAt: Ch;
  /** Name shown once revealed. */
  name: string;
  kind: LineKind;
  /** CSS colour of the line on the map. */
  color: string;
  /** Knowledge, accumulating by chapter. */
  stages: Stage[];
  /** Words that must not appear in any bundle before revealAt (defaults to name). */
  secret?: string[];
  /** Colored lines: which of the twelve spiral arms this line occupies. */
  arm?: number;
  /** Colored lines: bend toward a neighbour so the two touch at a shared station. */
  kiss?: { n: number; deg: number }[];
  /** Colored lines: stretches of the line the reader knows about, by station number. */
  spans?: { at: Ch; from: number; to: number; mode: 'ridden' | 'charted' }[];
  /** Named routes: drawn through station positions rather than along an arm. */
  legs?: { at: Ch; until?: Ch; stops: string[]; closed?: boolean }[];
}

export type Pos =
  /** On a colored line at this station's number. */
  | { line: string; off?: number }
  /** Free placement: angle in degrees, radius from station number unless r is given. */
  | { deg: number; r?: number };

export type StationKind =
  | 'stop'
  | 'transfer'
  | 'stairwell'
  | 'saferoom'
  | 'endline'
  | 'depot'
  | 'landmark'
  | 'core'
  /** Where monsters leave the trains; only ever listed in the station directory. */
  | 'cavern';

export interface Station {
  id: string;
  revealAt: Ch;
  /** Station number if it has one. */
  num?: number;
  name: string;
  /** Later names replace earlier ones as the reader learns them. */
  names?: Stage[];
  /** Where it is drawn. Absent = never on the map, listed only in the station directory. */
  pos?: Pos;
  /** A number that exists on every colored line: drawn as a ring from revealAt. */
  ring?: boolean;
  /** Chapter from which the ring is drawn (defaults to revealAt). */
  ringAt?: Ch;
  /** Chapter from which the station has a spot on the map. Defaults to revealAt, or never for a ring. */
  mapAt?: Ch;
  /** A letter drawn inside the marker. */
  glyph?: string;
  /** Kind can change as the reader learns more: latest stage <= progress wins. */
  kinds: { at: Ch; kind: StationKind }[];
  stages: Stage[];
  secret?: string[];
  /** Spreadsheet-style facts for the station directory, accumulating by chapter. */
  facts?: StationFact[];
}

export interface StationFact {
  at: Ch;
  /** Lines and named trains that call here, by display name. */
  lines?: string[];
  /** What is there: saferoom, clubs, shops. */
  has?: string[];
  /** What lives there: monsters and people. */
  lives?: string[];
}

/** A continuity error in the book, shown from the chapter where the contradiction can be seen. */
export interface Goof {
  id: string;
  revealAt: Ch;
  title: string;
  text: string;
}

/**
 * A numbering rule the characters work out, tied to the lore.ts rule stage
 * that states it. Evaluated at build time only, so the client never carries it.
 */
export interface Pattern {
  id: string;
  /** lore.ts rule id */
  rule: string;
  /** must equal the chapter of the rule stage that states it */
  at: Ch;
  /** The note shown on a seen row the rule explains, or null if it does not. */
  fits: (n: number, kind: string) => string | null;
  /** What the rule implies about a number nobody has seen. */
  implies?: (n: number, sofar: { kind?: StationKind; has: string[] }) => { kind?: StationKind; tag?: string; has?: string[] } | null;
}

/** Credit for the community work, shown only once the whole book has been read. */
export interface Credit {
  revealAt: Ch;
  title: string;
  url: string;
  text: string;
}

export interface Person {
  id: string;
  revealAt: Ch;
  name: string;
  /** Short tag line that can evolve (race/class etc). */
  tags: Stage[];
  group: 'party' | 'crawler' | 'npc' | 'show' | 'dungeon';
  stages: Stage[];
  secret?: string[];
  /** Whereabouts by chapter: with the party, elsewhere, off the floor, dead, unknown. */
  whereabouts?: { at: Ch; state: 'party' | 'away' | 'off' | 'dead' | 'unknown'; where?: string; stn?: string }[];
  /** With the party but waits at base rather than travelling: never drawn in the travelling group. */
  base?: boolean;
}

export interface Creature {
  id: string;
  revealAt: Ch;
  name: string;
  /** 'mob' | 'boss' etc */
  rank: 'mob' | 'boss' | 'other';
  where: Stage[];
  stages: Stage[];
  secret?: string[];
}

/** A rule or deduction about how the floor works. */
export interface Rule {
  id: string;
  revealAt: Ch;
  title: string;
  /** theory = suspected by characters, fact = confirmed in text */
  status: { at: Ch; value: 'rumour' | 'theory' | 'fact' | 'debunked' }[];
  stages: Stage[];
  secret?: string[];
}

/** One hop of the party's journey, drawn on the map. */
export interface Hop {
  at: Ch;
  from: string;
  to: string;
  /** line id travelled, or 'foot' */
  via: string;
  note?: string;
  /** Who made this trip, when it was not the whole travelling party. */
  who?: string[];
  /** false = they were already aboard when this leg starts. Otherwise derived from the leg before. */
  board?: boolean;
  /** Override for whether they got off at `to`. Otherwise derived from the next leg and the chapter's `aboard`. */
  off?: boolean;
}

/** A term that must never appear before a chapter, independent of any entity. */
export interface Embargo {
  until: Ch;
  terms: string[];
  why: string;
}

/** Our redrawing of the book's own endgame sketch: one straight track of low stations. */
export interface Sketch {
  revealAt: Ch;
  lede: string;
  rows: { n: number; label?: string; mark: 'dot' | 'big' | 'x' | 'sq'; notes: Stage[] }[];
}

/** A piece of the book's jargon, explained. */
export interface Term {
  id: string;
  revealAt: Ch;
  term: string;
  aliases?: string[];
  def: string;
  secret?: string[];
}

/** A question the book raises, and the chapter that settles it. */
export interface Question {
  id: string;
  revealAt: Ch;
  closedAt?: Ch;
  title: string;
  stages: Stage[];
  secret?: string[];
}

/** A labelled cutaway drawing. The client draws `shape`; labels arrive per chapter. */
export interface Diagram {
  id: string;
  revealAt: Ch;
  shape: string;
  title: string;
  parts: { key: string; stages: Stage[] }[];
}

export interface Content {
  diagrams: Diagram[];
  questions: Question[];
  glossary: Term[];
  sketch: Sketch;
  chapters: Chapter[];
  lines: Line[];
  stations: Station[];
  people: Person[];
  creatures: Creature[];
  rules: Rule[];
  hops: Hop[];
  embargoes: Embargo[];
  goofs: Goof[];
  patterns: Pattern[];
  credit: Credit;
}

import type { Credit, Goof, Pattern, Station } from './types.ts';

/**
 * The station directory: the community's spreadsheet of the floor, one row
 * per station number. These are stations the book mentions but the map does
 * not draw (no `pos`). Facts come from the fan wiki's table, each tagged with
 * the chapter it cites, or later when the citation was uncertain. All text is
 * our own wording.
 */
export const directoryStations: Station[] = [
  {
    id: 's84r', revealAt: 1, num: 84, name: 'Rusalka Station',
    kinds: [{ at: 1, kind: 'stop' }],
    stages: [{ at: 1, text: 'The Red Line stop after the transfer station.' }],
    facts: [{ at: 1, lines: ['Red Line'] }],
  },
  {
    id: 's83c', revealAt: 3, num: 83, name: 'Station 83 (Orange and Indigo)',
    kinds: [{ at: 3, kind: 'transfer' }],
    stages: [{ at: 3, text: 'Yet another station 83, where the Orange and Indigo lines meet. Hekla’s group reports in from here.' }],
    facts: [{ at: 3, lines: ['Orange Line', 'Indigo Line'], has: ['Saferoom'], lives: ['Hekla’s group'] }],
  },
  {
    id: 's81y', revealAt: 4, num: 81, name: 'Station 81 (Yellow Line)',
    kinds: [{ at: 4, kind: 'stop' }],
    stages: [{ at: 4, text: 'An unnamed Yellow Line stop two before 83, a different station from the Red Line’s 81.' }],
    facts: [{ at: 4, lines: ['Yellow Line'], lives: ['Cave Mudge Bonkers or Shock Chompers'] }],
  },
  {
    id: 's82y', revealAt: 4, num: 82, name: 'Station 82 (Yellow Line)',
    kinds: [{ at: 4, kind: 'stop' }],
    stages: [{ at: 4, text: 'An unnamed Yellow Line stop just before 83.' }],
    facts: [{ at: 4, lines: ['Yellow Line'], lives: ['Cave Mudge Bonkers or Shock Chompers'] }],
  },
  {
    id: 's10', revealAt: 5, num: 10, name: 'Station 10',
    kinds: [{ at: 5, kind: 'depot' }],
    stages: [
      { at: 5, text: 'Where a conductor wakes up after every run: a yard, one number before the lines begin.' },
      { at: 17, text: 'The ring of lettered yards the coloured lines start from.' },
    ],
    facts: [{ at: 5, has: ['A yard'] }, { at: 17, has: ['Lettered Station and Repair Hubs'] }],
  },
  {
    id: 's86y', revealAt: 5, num: 86, name: 'Station 86 (Yellow Line)',
    kinds: [{ at: 5, kind: 'stop' }],
    stages: [{ at: 5, text: 'An unnamed Yellow Line stop passed on the ride.' }],
    facts: [{ at: 5, lines: ['Yellow Line'], lives: ['Snakeheads'] }],
  },
  {
    id: 's87y', revealAt: 5, num: 87, name: 'Station 87 (Yellow Line)',
    kinds: [{ at: 5, kind: 'stop' }],
    stages: [{ at: 5, text: 'Another Yellow Line stop passed on the ride.' }],
    facts: [{ at: 5, lines: ['Yellow Line'], lives: ['Snakeheads'] }],
  },
  {
    id: 's88y', revealAt: 5, num: 88, name: 'Mothman Station',
    kinds: [{ at: 5, kind: 'stop' }],
    stages: [{ at: 5, text: 'A Yellow Line stop passed on the ride.' }],
    facts: [{ at: 5, lines: ['Yellow Line'], lives: ['Skinned Mollies'] }],
  },
  {
    id: 's89y', revealAt: 5, num: 89, name: 'Station 89 (Yellow and Indigo)',
    kinds: [{ at: 5, kind: 'transfer' }],
    stages: [{ at: 5, text: 'A transfer station on the Yellow Line, shared with the Indigo Line.' }],
    facts: [{ at: 5, lines: ['Yellow Line', 'Indigo Line'], has: ['Saferoom'] }, { at: 6, has: ['Club Vanquisher entrance'] }],
  },
  {
    id: 's212y', revealAt: 7, num: 212, name: 'Station 212 (Yellow Line)',
    kinds: [{ at: 7, kind: 'stop' }],
    stages: [{ at: 7, text: 'An unnamed stop much further up the Yellow Line.' }],
    facts: [{ at: 7, lines: ['Yellow Line'], lives: ['Goateos'] }],
  },
  {
    id: 's271', revealAt: 15, num: 271, name: 'Station 271',
    kinds: [{ at: 15, kind: 'transfer' }],
    stages: [{ at: 15, text: 'A transfer station on the Camel Line, near where Imani and Elle are stranded.' }],
    facts: [{ at: 15, lines: ['Camel Line', 'Cobalt Line', 'The Eviscerator'], has: ['Saferoom', 'Desperado Club entrance'] }],
  },
  {
    id: 's272', revealAt: 15, num: 272, name: 'Station 272 (Camel Line)',
    kinds: [{ at: 15, kind: 'stop' }],
    stages: [{ at: 15, text: 'An unnamed Camel Line stop in the stretch where Imani and Elle’s group is stuck.' }],
    facts: [{ at: 15, lines: ['Camel Line'], lives: ['Gross Atomizers'] }],
  },
  {
    id: 's275', revealAt: 15, num: 275, name: 'Station 275 (Camel Line)',
    kinds: [{ at: 15, kind: 'cavern' }],
    stages: [{ at: 15, text: 'An exit-only cavern on the Camel Line, with its own Pooka and a Krakaren clone.' }],
    facts: [{ at: 15, lines: ['Camel Line'], has: ['Exit-only cavern'], lives: ['A Krakaren clone', 'A Pooka'] }],
  },
  {
    id: 's277', revealAt: 15, num: 277, name: 'Station 277',
    kinds: [{ at: 15, kind: 'transfer' }],
    stages: [{ at: 15, text: 'A transfer station a little beyond the stranded group.' }],
    facts: [{ at: 15, has: ['Saferoom'] }],
  },
  {
    id: 's13', revealAt: 17, num: 13, name: 'Station 13',
    kinds: [{ at: 17, kind: 'transfer' }],
    stages: [{ at: 17, text: 'A transfer station with a saferoom, one past the first stairwell station. The employee line calls here.' }],
    facts: [{ at: 17, lines: ['Employee Line'], has: ['Saferoom'] }],
  },
  {
    id: 's18', revealAt: 17, num: 18, name: 'Barren Station',
    kinds: [{ at: 17, kind: 'stop' }],
    stages: [{ at: 17, text: 'A low-numbered stop between the first two stairwell stations.' }],
  },
  {
    id: 's89t', revealAt: 17, num: 89, name: 'Station 89 (Tangerine)',
    kinds: [{ at: 17, kind: 'transfer' }],
    stages: [{ at: 17, text: 'A second station 89, on the Tangerine Line: the one known place to catch Escape Velocity.' }],
    facts: [{ at: 17, lines: ['Tangerine Line', 'Escape Velocity'], has: ['Saferoom', 'Club Vanquisher entrance'] }],
  },
  {
    id: 's50', revealAt: 18, num: 50, name: 'Station 50',
    kinds: [{ at: 18, kind: 'stop' }],
    stages: [{ at: 18, text: 'Passed on the employee line. No exit-only cavern here: just a tiny room opening onto nine platforms.' }],
    facts: [{ at: 18, lines: ['Employee Line'], has: ['A tiny room onto nine platforms'] }],
  },
  {
    id: 's58', revealAt: 18, num: 58, name: 'Station 58',
    kinds: [{ at: 18, kind: 'stop' }],
    stages: [{ at: 18, text: 'Passed on the employee line. Oddly, there are no monsters at all.' }],
    facts: [{ at: 18, lines: ['Employee Line'], lives: ['Nothing, oddly'] }],
  },
];

export const goofs: Goof[] = [
  {
    id: 'goof-102', revealAt: 21, title: 'The cavern at 102',
    text: 'Planning the rescue, Carl wonders why the crawlers trapped at 101 don’t just walk on to 102 and leave through its exit-only cavern. But the caverns sit at every fifth number, so the nearest would be 100, not 102.',
  },
];

const isPrime = (n: number) => { if (n < 2) return false; for (let d = 2; d * d <= n; d++) if (n % d === 0) return false; return true; };
const transferish = (k: string | undefined) => k === 'transfer' || k === 'saferoom';

/**
 * The numbering rules, each tied to the lore.ts stage where the characters
 * state it. Evaluated by scripts/slice.ts at build time; a bundle only ever
 * carries the output of rules whose chapter it has reached.
 */
export const patterns: Pattern[] = [
  {
    // lore: transfers @ 9, Elle's deduction (a theory)
    id: 'primes', rule: 'transfers', at: 9,
    fits: (n, k) => (transferish(k) && isPrime(n) ? 'Elle’s idea: transfer stations have prime numbers' : null),
    implies: (n) => (n >= 11 && n <= 434 && isPrime(n) ? { kind: 'transfer', tag: 'Transfer station, if Elle is right', has: ['Saferoom'] } : null),
  },
  {
    // lore: fifth @ 12, the caverns confirmed
    id: 'fifth', rule: 'fifth', at: 12,
    fits: (n, k) => (k === 'cavern' && n % 5 === 0 ? 'Every fifth station is an exit-only cavern' : null),
    implies: (n) => (n >= 15 && n <= 430 && n % 5 === 0 ? { kind: 'cavern', tag: 'Exit-only cavern, by the every-fifth rule', has: [] } : null),
  },
  {
    // lore: transfers @ 6, Bautista's pattern
    id: 'clubs', rule: 'transfers', at: 6,
    fits: (n, k) => (!transferish(k) ? null : n % 10 === 1 ? 'Bautista’s pattern: a transfer ending in 1 has a Desperado Club' : n % 10 === 9 ? 'Bautista’s pattern: a transfer ending in 9 has a Club Vanquisher' : null),
    implies: (n, sofar) => (!transferish(sofar.kind) ? null : n % 10 === 1 ? { has: ['Desperado Club entrance'] } : n % 10 === 9 ? { has: ['Club Vanquisher entrance'] } : null),
  },
];

export const credit: Credit = {
  revealAt: 35,
  title: 'How others untangled it',
  url: 'https://dungeon-crawler-carl.fandom.com/wiki/Untangling_the_Iron_Tangle',
  text: 'Readers worked this floor out in a shared spreadsheet long before this directory existed. The Dungeon Crawler Carl fan wiki’s page “Untangling the Iron Tangle” has their station-by-station table, a note on the book’s continuity slip, and several fan-drawn maps of the floor. Many of the rows here come from it. It contains spoilers for the whole book, so it is only linked once you have finished.',
};

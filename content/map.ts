import type { Hop, Line, Station } from './types.ts';

/**
 * The map is a schematic. Station numbers and line names are from the book;
 * the spiral arrangement is ours (the book never fixes compass positions).
 * Every colored line is a spiral arm running from the rim (station 11)
 * inward to station 435.
 */

export const lines: Line[] = [
  {
    id: 'red', revealAt: 1, name: 'Red Line', kind: 'colored', color: '#e5484d', arm: 0,
    kiss: [{ n: 83, deg: 10 }],
    spans: [
      { at: 1, from: 81, to: 82, mode: 'ridden' },
      { at: 2, from: 82, to: 83, mode: 'ridden' },
      { at: 2, from: 62, to: 150, mode: 'charted' },
      { at: 15, from: 11, to: 435, mode: 'charted' },
    ],
    stages: [
      { at: 1, text: 'The line the party wakes up on, in the last car of a twenty-car train.' },
      { at: 2, text: 'Like every coloured line it runs one way only, from station 11 up to station 435.' },
    ],
  },
  {
    id: 'yellow', revealAt: 4, name: 'Yellow Line', kind: 'colored', color: '#f2c230', arm: 1,
    kiss: [{ n: 83, deg: -10 }],
    spans: [
      { at: 4, from: 70, to: 160, mode: 'charted' },
      { at: 7, from: 70, to: 195, mode: 'charted' },
      { at: 15, from: 11, to: 435, mode: 'charted' },
      { at: 5, from: 83, to: 116, mode: 'ridden' },
      { at: 7, from: 116, to: 131, mode: 'ridden' },
    ],
    stages: [
      { at: 4, text: 'Meets the Red Line at station 83. The engine car is sealed and needs a Yellow Line key.' },
      { at: 5, text: 'Carries a staff break room in car 5 and a Reward Room in car 10. Its conductor says the full run takes about three days.' },
      { at: 7, text: 'The party picks up a Yellow Line station list on the way. Ridden as far as transfer station 131.' },
    ],
  },
  {
    id: 'azure', revealAt: 4, name: 'Azure Line', kind: 'colored', color: '#3d9bff', arm: 9,
    kiss: [{ n: 199, deg: 10 }],
    spans: [{ at: 4, from: 190, to: 208, mode: 'charted' }],
    stages: [{ at: 4, text: 'Known only by report: it meets the Brown Line at station 199, where Bautista’s group is.' }],
  },
  {
    id: 'brown', revealAt: 4, name: 'Brown Line', kind: 'colored', color: '#9a6a44', arm: 10,
    kiss: [{ n: 199, deg: -10 }],
    spans: [{ at: 4, from: 190, to: 208, mode: 'charted' }],
    stages: [{ at: 4, text: 'Known only by report: it meets the Azure Line at station 199.' }],
  },
  {
    id: 'ochre', revealAt: 10, name: 'Ochre Line', kind: 'colored', color: '#c98a2b', arm: 2,
    spans: [
      { at: 10, from: 143, to: 155, mode: 'charted' },
      { at: 12, from: 11, to: 435, mode: 'charted' },
    ],
    stages: [
      { at: 10, text: 'Where Carl lays his mines, at station 149. The third rail is live.' },
      { at: 11, text: 'Blocked at 149 by the derailed train.' },
      { at: 12, text: 'The engineer’s map shows the whole line. The distance between stations grows sharply toward the far end.' },
    ],
  },
  {
    id: 'mauve', revealAt: 4, name: 'Mauve Line', kind: 'colored', color: '#b98bb0', arm: 3,
    spans: [
      { at: 13, from: 276, to: 286, mode: 'charted' },
      { at: 14, from: 281, to: 283, mode: 'ridden' },
    ],
    stages: [
      { at: 4, text: 'Known only from the Nightmare Express map: it meets the Purple Line at the train’s first station 283.' },
      { at: 13, text: 'Serves station 281, where the maglev lets the party off.' },
    ],
  },
  {
    id: 'vermillion', revealAt: 21, name: 'Vermillion Line', kind: 'colored', color: '#ff5a36', arm: 5,
    spans: [
      { at: 21, from: 60, to: 110, mode: 'charted' },
      { at: 22, from: 60, to: 101, mode: 'ridden' },
    ],
    stages: [
      { at: 21, text: 'More than a thousand crawlers are trapped on it at station 101. The party has a captured Terminus-direct train with an engine at each end.' },
      { at: 22, text: 'Ridden up from the low stations, past the stairwell station at 72.' },
      { at: 24, text: 'Run in reverse away from 101, heading for station 75.' },
      { at: 27, text: 'Its engine is packed with explosives and sent toward station 36.' },
    ],
  },
  {
    id: 'sinopia', revealAt: 27, name: 'Sinopia Line', kind: 'colored', color: '#cb410b', arm: 12,
    spans: [{ at: 27, from: 75, to: 435, mode: 'charted' }],
    stages: [
      { at: 27, text: 'A test cart switches onto it at station 75 to prove the plan. Then a pair of rapid-response carts goes down it: the first clears the track into the Abyss, the second follows to carry a stranded group to a trainyard.' },
      { at: 28, text: 'With the Grullo rescue, about eight hundred stranded crawlers are moved toward defended stairwell stations.' },
    ],
  },
  {
    id: 'grullo', revealAt: 27, name: 'Grullo Line', kind: 'colored', color: '#a99a86', arm: 13,
    spans: [{ at: 27, from: 75, to: 435, mode: 'charted' }],
    stages: [{ at: 27, text: 'A pair of rapid-response carts is sent down it from station 75 toward a group stranded at its far end.' }],
  },
  {
    // Drawn just beside the Vermillion arm and bent to touch it at 75, so the
    // ride starts at the party's own station 75 (the carts are switched onto it there).
    id: 'mindaro', revealAt: 27, name: 'Mindaro Line', kind: 'colored', color: '#d9ee6e', arm: 4.5,
    kiss: [{ n: 75, deg: 11.25 }],
    spans: [
      { at: 27, from: 75, to: 435, mode: 'charted' },
      { at: 28, from: 75, to: 435, mode: 'ridden' },
    ],
    stages: [
      { at: 27, text: 'The third pair of rescue carts goes down it from station 75.' },
      { at: 28, text: 'The party rides a cart its whole length, past 432 and 433.' },
    ],
  },

  {
    id: 'camel', revealAt: 15, name: 'Camel Line', kind: 'colored', color: '#c19a6b', arm: 8,
    spans: [{ at: 15, from: 266, to: 280, mode: 'charted' }],
    stages: [{ at: 15, text: 'Where Imani and Elle’s group is stranded by wrecked trains, around stations 271 to 275.' }],
  },
  {
    id: 'mango', revealAt: 21, name: 'Mango Line', kind: 'colored', color: '#ffb347',
    stages: [{ at: 21, text: 'The line Tizquick worked as a conductor.' }],
  },
  {
    id: 'zomp', revealAt: 29, name: 'Zomp Line', kind: 'colored', color: '#39a78e', arm: 6,
    spans: [
      { at: 29, from: 20, to: 64, mode: 'charted' },
      { at: 29, from: 24, to: 59, mode: 'ridden' },
    ],
    stages: [{ at: 29, text: 'Ridden up past a Krakaren-infested station 24 to the saferoom at station 59.' }],
  },

  // ── named trains and service routes ──────────────────────────────────
  {
    id: 'nightmare', revealAt: 4, name: 'Nightmare Express', kind: 'named', color: '#1d1e24',
    legs: [
      { at: 15, stops: ['s83', 's283', 'cavern', 's436', 's283b', 's83b'], closed: true },
      { at: 19, stops: ['s60', 's41'] },
    ],
    stages: [
      { at: 4, text: 'A named train on a five-stop figure-eight, always in the same order: station 83 (Red and Yellow), a station 283 (Mauve and Purple), the oddly numbered 436 at the top of the eight, then a different 283 (Green and Yellow) and a different 83 (Tangerine and Plum) before it comes round again.' },
      { at: 14, text: 'A jet-black steam locomotive pulling dozens of cars, some of them open livestock cars of giant monsters. Boarded only from the caboose. Its stoker lives in the boiler.' },
      { at: 15, text: 'Just before 436 its route passes a switching cavern with three gates: Auxiliary Tracks, Station Repair and Recycle. The whole loop takes about an hour and a half.' },
      { at: 17, text: 'Goes through the Station Repair gate into Trainyard E and is routed into a service bay. It leaves on the employee line as a bare locomotive; its wrecked cars stay in the yard.' },
      { at: 19, text: 'Now the party’s own train. Parked near station 41.' },
      { at: 34, text: 'Loaded with explosives and ridden into the Abyss by its crew.' },
    ],
  },
  {
    id: 'dismemberment', revealAt: 12, name: 'Dismemberment Limited', kind: 'named', color: '#0f9d8c',
    legs: [{ at: 12, until: 13, stops: ['s149'] }, { at: 13, stops: ['s149', 's281'] }],
    stages: [{ at: 12, text: 'A white maglev on a short loop. The party boards at station 149 and takes on a quest to keep its operator alive.' },
      { at: 13, text: 'It lets the party off at station 281.' }],
  },
  {
    id: 'employee', revealAt: 17, name: 'Employee Line', kind: 'service', color: '#5d6b7a',
    legs: [
      { at: 17, stops: ['yard-e'] },
      { at: 18, stops: ['yard-e', 's24', 's36', 's48', 's60'] },
    ],
    stages: [
      { at: 17, text: 'A staff track out of the trainyards, with service entrances at the low-numbered stations. A yard turntable puts trains onto it.' },
      { at: 18, text: 'Calls at the stairwell stations 24, 36 and 48, then 60. Its other low-numbered stops don’t line up with the coloured lines.' },
      { at: 21, text: 'Each trainyard’s employee track ends at a Homeward Bound platform at station 60.' },
    ],
  },
  {
    id: 'escape-velocity', revealAt: 17, name: 'Escape Velocity', kind: 'named', color: '#7a5cc7',
    stages: [
      { at: 17, text: 'The named train crawlers were meant to find: it runs back to the stairwell stations, with one known connection at station 89.' },
      { at: 18, text: 'A platform at station 24 is labelled Escape Velocity III, so there is more than one.' },
    ],
  },
];

export const stations: Station[] = [
  // ── the opening: Red Line ────────────────────────────────────────────
  {
    id: 's81', revealAt: 1, num: 81, name: 'Sirin Station', pos: { line: 'red' },
    kinds: [{ at: 1, kind: 'stop' }],
    stages: [{ at: 1, text: 'The train’s first stop on the floor. Hundreds of Dreks swarm aboard.' }],
    facts: [{ at: 1, lines: ['Red Line'], lives: ['Dreks'] }],
  },
  {
    id: 's82', revealAt: 1, num: 82, name: 'Mora Station', pos: { line: 'red' },
    kinds: [{ at: 1, kind: 'stop' }],
    stages: [{ at: 1, text: 'Psycho Stickers board here. The next stop is a transfer station.' }],
    facts: [{ at: 1, lines: ['Red Line'], lives: ['Psycho Stickers'] }],
  },
  {
    id: 's83', revealAt: 1, num: 83, name: 'Station 83', pos: { line: 'red' },
    kinds: [{ at: 1, kind: 'transfer' }],
    stages: [
      { at: 1, text: 'The transfer station the party is racing toward.' },
      { at: 2, text: 'Has a saferoom upstairs and a shop run by Limp Richard. The party’s base.' },
      { at: 4, text: 'Red and Yellow lines meet here. It is also the Nightmare Express’s first stop.' },
    ],
    facts: [
      { at: 1, lines: ['Red Line'] },
      { at: 2, has: ['Saferoom', 'Limp Richard’s shop'], lives: ['Limp Richard', 'Wendita'] },
      { at: 4, lines: ['Yellow Line', 'Nightmare Express'] },
    ],
  },

  // ── rings: numbers that exist on every coloured line ─────────────────
  {
    id: 's12', revealAt: 2, num: 12, name: 'Station 12', pos: { deg: 0 }, ring: true,
    kinds: [{ at: 2, kind: 'stairwell' }],
    stages: [
      { at: 2, text: 'A stairwell station on every coloured line.' },
      { at: 22, text: 'Guarded by Jikininki and a ghoul generator.' },
      { at: 32, text: 'Its soul crystal has burned out.' },
    ],
    facts: [
      { at: 2, lines: ['Every coloured line'], has: ['Stairwells'] },
      { at: 17, lines: ['Escape Velocity', 'Employee Line'] },
      { at: 22, has: ['A ghoul generator'], lives: ['Jikininki'] },
    ],
  },
  {
    id: 's24', revealAt: 2, num: 24, name: 'Station 24', pos: { line: 'zomp' }, ring: true, mapAt: 18,
    kinds: [{ at: 2, kind: 'stairwell' }],
    stages: [
      { at: 2, text: 'A stairwell station on every coloured line.' },
      { at: 18, text: 'Seen from the employee line: five closed stairwells and ten platforms, one labelled for a named train.' },
      { at: 27, text: 'A dying crawler warns of millions of something here.' },
      { at: 29, text: 'Overrun by thousands of young Krakaren.' },
      { at: 32, text: 'Its Krakaren boss is removed on the way to the trainyard.' },
    ],
    facts: [
      { at: 2, lines: ['Every coloured line'], has: ['Stairwells'] },
      { at: 17, lines: ['Escape Velocity'] },
      { at: 18, lines: ['Employee Line'], has: ['Five stairwells, ten platforms'] },
      { at: 29, lives: ['Krakaren young'] },
    ],
  },
  {
    id: 's36', revealAt: 2, num: 36, name: 'Station 36', pos: { line: 'zomp' }, ring: true, mapAt: 18,
    kinds: [{ at: 2, kind: 'stairwell' }],
    stages: [
      { at: 2, text: 'A stairwell station on every coloured line.' },
      { at: 18, text: 'Laid out like 24: five stairwells, ten platforms.' },
      { at: 22, text: 'Wrath Ghouls gather here.' },
      { at: 25, text: 'Li Jun brings the rescued crawlers here.' },
      { at: 31, text: 'Where the party makes its stand. The floor opens and Krakaren climb up from the mirrored chamber below.' },
      { at: 34, text: 'The party’s way down.' },
    ],
    facts: [
      { at: 2, lines: ['Every coloured line'], has: ['Stairwells'] },
      { at: 17, lines: ['Escape Velocity'] },
      { at: 18, lines: ['Employee Line'], has: ['Five stairwells, ten platforms'] },
      { at: 22, lives: ['Wrath Ghouls'] },
    ],
  },
  {
    id: 's48', revealAt: 2, num: 48, name: 'Station 48', pos: { line: 'zomp' }, ring: true, mapAt: 18,
    kinds: [{ at: 2, kind: 'stairwell' }],
    stages: [
      { at: 2, text: 'A stairwell station on every coloured line.' },
      { at: 18, text: 'Laid out like 24 and 36.' },
      { at: 22, text: 'Festering Ghouls are merging here into a single province boss.' },
    ],
    facts: [
      { at: 2, lines: ['Every coloured line'], has: ['Stairwells'] },
      { at: 17, lines: ['Escape Velocity'] },
      { at: 18, lines: ['Employee Line'], has: ['Five stairwells, ten platforms'] },
      { at: 22, lives: ['Festering Ghouls, merging into a province boss'] },
    ],
  },
  {
    id: 's72', revealAt: 2, num: 72, name: 'Station 72', pos: { line: 'vermillion' }, ring: true, mapAt: 22,
    kinds: [{ at: 2, kind: 'stairwell' }],
    stages: [
      { at: 2, text: 'The last stairwell station on every coloured line, and the nearest one behind the party.' },
      { at: 22, text: 'Holds a generator driven by a soul crystal. It makes one Blister Ghoul for every living monster that dies on the floor.' },
      { at: 27, text: 'A group trying to shut down the generator dies in a huge blast. Carl suspects the soul crystal.' },
    ],
    facts: [
      { at: 2, lines: ['Every coloured line'], has: ['Stairwells'] },
      { at: 17, lines: ['Escape Velocity'] },
      { at: 22, has: ['A soul-crystal generator'], lives: ['Blister Ghouls'] },
    ],
  },
  {
    id: 's435', revealAt: 2, num: 435, name: 'Station 435', pos: { line: 'mindaro' }, ring: true, ringAt: 15, mapAt: 28,
    kinds: [{ at: 2, kind: 'endline' }],
    stages: [
      { at: 2, text: 'The last station on every coloured line.' },
      { at: 5, text: 'A conductor’s memory stops here and resumes back at the yard. A monster that stayed aboard came back as a skeleton.' },
      { at: 11, text: 'Train staff leave through an employee portal that wipes their memories. Only the engine goes on.' },
      { at: 18, text: 'That portal is bound to the life of the Kravyad who runs it.' },
      { at: 19, text: 'Bautista’s group is here. The Kravyad is threatening to kill itself.' },
      { at: 20, text: 'The Kravyad is dead and the portal is closed. More than 150 crawlers without hats are stranded.' },
      { at: 28, text: 'Emptied: the stranded crawlers leave through the Abyss wearing donated hats.' },
    ],
    facts: [
      { at: 2, lines: ['Every coloured line'] },
      { at: 11, has: ['A memory-wiping employee portal'], lives: ['A Kravyad'] },
    ],
  },

  // ── Yellow Line ──────────────────────────────────────────────────────
  {
    id: 's84', revealAt: 5, num: 84, name: 'Phantom Kangaroo Station', pos: { line: 'yellow' },
    kinds: [{ at: 5, kind: 'stop' }],
    stages: [{ at: 5, text: 'First stop after 83. Pollyslogs board here.' }],
    facts: [{ at: 5, lines: ['Yellow Line'], lives: ['Pollyslogs'] }],
  },
  {
    id: 's116', revealAt: 5, num: 116, name: 'Banshee Station', pos: { line: 'yellow' },
    kinds: [{ at: 5, kind: 'stop' }],
    stages: [
      { at: 5, text: 'Where the party jumps off a train full of fire ants.' },
      { at: 6, text: 'Caves behind the platform hold Red Cornets and a sealed room with two dormant automatons.' },
    ],
    facts: [
      { at: 5, lines: ['Yellow Line'] },
      { at: 6, has: ['Caves behind the platform', 'A sealed room of dormant robots'], lives: ['Red Cornets'] },
    ],
  },
  {
    id: 's131', revealAt: 6, num: 131, name: 'Station 131', pos: { line: 'yellow' },
    kinds: [{ at: 6, kind: 'transfer' }],
    stages: [
      { at: 6, text: 'The next transfer station up the Yellow Line. By Bautista’s rule it should have a Desperado Club.' },
      { at: 7, text: 'Reached. The party opens its fan boxes here.' },
      { at: 8, text: 'Its Desperado Club is where Carl and Donut meet Imani and Elle.' },
    ],
    facts: [
      { at: 6, lines: ['Yellow Line'] },
      { at: 7, has: ['Saferoom (an Arby’s)', 'Desperado Club entrance', 'Ford’s Fighting Supplies, a general store', 'Training guilds for longbow and for druids', 'A clothing shop for elves'] },
    ],
  },
  {
    id: 's199', revealAt: 4, num: 199, name: 'Station 199', pos: { line: 'azure' },
    kinds: [{ at: 4, kind: 'transfer' }],
    stages: [{ at: 4, text: 'Azure and Brown lines meet here. Bautista’s group reports in from it.' }],
    facts: [
      { at: 4, lines: ['Azure Line', 'Brown Line'], has: ['Saferoom'], lives: ['Bautista’s group'] },
      { at: 6, has: ['Club Vanquisher entrance'] },
    ],
  },

  // ── Ochre, Mauve ─────────────────────────────────────────────────────
  {
    id: 's149', revealAt: 10, num: 149, name: 'Station 149', pos: { line: 'ochre' },
    kinds: [{ at: 10, kind: 'transfer' }],
    stages: [
      { at: 10, text: 'An Ochre Line platform with a Club Vanquisher entrance beside it, as Bautista’s ending-in-9 rule predicts. Carl mines the track here.' },
      { at: 11, text: 'Site of the derailment.' },
      { at: 12, text: 'The Dismemberment Limited is boarded here.' },
    ],
    facts: [
      { at: 10, lines: ['Ochre Line'], has: ['Club Vanquisher entrance'] },
      { at: 11, has: ['Saferoom (a pho restaurant)', 'General store'], lives: ['Gore-Gore'] },
      { at: 12, lines: ['Dismemberment Limited'] },
    ],
  },
  {
    id: 's281', revealAt: 13, num: 281, name: 'Station 281', pos: { line: 'mauve' },
    kinds: [{ at: 13, kind: 'transfer' }],
    stages: [
      { at: 13, text: 'On the Mauve Line. Has a saferoom; the party rebuilds its workshop here.' },
    ],
    facts: [
      { at: 13, lines: ['Mauve Line', 'Dismemberment Limited'], has: ['Saferoom'] },
      { at: 23, has: ['Desperado Club entrance', 'The saferoom is a J.CO Donuts'], lives: ['Nodd, a Bopca shopkeeper'] },
    ],
  },
  {
    id: 's283', revealAt: 4, num: 283, name: 'Station 283', pos: { line: 'mauve' }, mapAt: 14,
    kinds: [{ at: 4, kind: 'transfer' }],
    stages: [
      { at: 4, text: 'The Nightmare Express’s second stop, far up the line, where the Mauve and Purple lines meet.' },
      { at: 14, text: 'On the Mauve Line. Where the Nightmare Express carries Carl off, leaving Donut and Katia behind.' },
      { at: 16, text: 'Overrun by monsters in withdrawal.' },
    ],
    facts: [
      { at: 4, lines: ['Nightmare Express', 'Mauve Line', 'Purple Line'], has: ['Saferoom'] },
      { at: 15, has: ['The saferoom is a mall food court'] },
      { at: 16, lives: ['Babababoons'] },
    ],
  },

  {
    id: 's283b', revealAt: 4, num: 283, name: 'Station 283 (second)', pos: { line: 'yellow' }, mapAt: 15,
    kinds: [{ at: 4, kind: 'transfer' }],
    secret: [],
    stages: [{ at: 4, text: 'A different station with the same number, where the Green and Yellow lines meet. The Nightmare Express’s fourth stop, just after 436.' }],
    facts: [{ at: 4, lines: ['Nightmare Express', 'Green Line', 'Yellow Line'], has: ['Saferoom'] }],
  },
  {
    id: 's83b', revealAt: 4, num: 83, name: 'Station 83 (second)', pos: { deg: 335 }, mapAt: 15,
    kinds: [{ at: 4, kind: 'transfer' }],
    secret: [],
    stages: [{ at: 4, text: 'Another station 83, where the Tangerine and Plum lines meet. The Nightmare Express’s fifth and last stop before it comes back round to the first 83.' }],
    facts: [{ at: 4, lines: ['Nightmare Express', 'Tangerine Line', 'Plum Line'], has: ['Saferoom'] }],
  },

  // ── the far end ──────────────────────────────────────────────────────
  {
    id: 's436', revealAt: 4, num: 436, name: 'Station 436', pos: { deg: 100, r: 215 }, mapAt: 15,
    names: [{ at: 15, text: 'Abyss Station' }],
    kinds: [{ at: 4, kind: 'landmark' }],
    stages: [
      { at: 4, text: 'One number past the end of the line. It is not a transfer station, yet a named train stops here.' },
      { at: 15, text: 'A stairway climbs from here for about an hour to the Abyss.' },
    ],
    facts: [
      { at: 4, lines: ['Nightmare Express'] },
      { at: 15, has: ['A stairway up to the Abyss'] },
    ],
  },
  {
    id: 'cavern', revealAt: 15, name: 'Switching Cavern', pos: { deg: 62, r: 420 },
    kinds: [{ at: 15, kind: 'landmark' }],
    stages: [
      { at: 15, text: 'A junction on the Nightmare Express route just before station 436, with three gates: Auxiliary Tracks, Station Repair and Recycle.' },
      { at: 16, text: 'Station Repair is a two-way portal. Recycle leads to the Abyss.' },
    ],
  },
  {
    id: 'abyss', revealAt: 15, name: 'The Abyss', pos: { deg: 0, r: 0 },
    kinds: [{ at: 15, kind: 'core' }],
    secret: ['The Abyss'],
    stages: [
      { at: 15, text: 'A vast burning pit ringed with one-way industrial portals. Passenger cars from every coloured line are dumped here, and Jikininki swarm over them.' },
      { at: 15, text: 'Each portal answers to a type of vehicle and a key. The conductor hat every crawler was given counts.' },
      { at: 28, text: 'Bautista’s group walks out through a portal here and arrives in a trainyard.' },
      { at: 30, text: 'In the floor’s hidden design it stands for the centre of the galaxy.' },
      { at: 33, text: 'A war god is dragged into it.' },
      { at: 34, text: 'The Nightmare Express makes its last run here.' },
    ],
  },
  {
    id: 's432', revealAt: 28, num: 432, name: 'Station 432', pos: { line: 'mindaro' },
    kinds: [{ at: 28, kind: 'stop' }],
    stages: [{ at: 28, text: 'Five crawlers are found on the track here. The cart’s portal is switched to send them to Trainyard E.' }],
    facts: [{ at: 28, lines: ['Mindaro Line'] }],
  },
  {
    id: 's433', revealAt: 17, num: 433, name: 'Terminus', pos: { line: 'mindaro' },
    kinds: [{ at: 17, kind: 'landmark' }],
    secret: ['Terminus', 'Station 433'],
    stages: [
      { at: 17, text: 'Looks like a station. It is one of six Station Mimics on the floor, and a trap.' },
      { at: 18, text: 'A city boss. It has swallowed part of Bautista’s group.' },
      { at: 28, text: 'Accidentally teleported out to Trainyard E.' },
      { at: 29, text: 'The recap reveals there was a hidden stairwell here.' },
    ],
    facts: [
      { at: 17, lives: ['A Station Mimic'] },
      { at: 28, lines: ['Mindaro Line'] },
    ],
  },

  // ── trainyards and the low stations ──────────────────────────────────
  {
    id: 'yard-e', revealAt: 17, name: 'Trainyard E', pos: { deg: 135, r: 1880 }, glyph: 'E',
    kinds: [{ at: 17, kind: 'depot' }],
    secret: ['Trainyard E', 'Yard E'],
    stages: [
      { at: 17, text: 'Station and Repair Hub E. Reached through the Station Repair gate. Fenced, with a turntable and service bays, and full of Festering Ghouls.' },
      { at: 28, text: 'Five crawlers are sent here. So, by accident, is a city-sized mimic.' },
      { at: 32, text: 'Its employee-line entrance is guarded by two mantaurs, and the displaced mimic makes a straight crossing too dangerous.' },
      { at: 33, text: 'The arena for Carl’s Death Challenge. Carl is dragged in first; Donut, Mongo, Li Na and Li Jun follow through the moving portal cart.' },
    ],
  },
  {
    id: 'yard-d', revealAt: 19, name: 'Trainyard D', pos: { deg: 112.5, r: 1880 }, glyph: 'D',
    kinds: [{ at: 19, kind: 'depot' }],
    secret: ['Trainyard D', 'Yard D'],
    stages: [{ at: 19, text: 'Breached. Imani’s group reaches it by riding the ghoul conveyor.' }],
  },
  {
    id: 'yard-h', revealAt: 28, name: 'Trainyard H', pos: { deg: 202.5, r: 1880 }, glyph: 'H',
    kinds: [{ at: 28, kind: 'depot' }],
    secret: ['Trainyard H', 'Yard H'],
    stages: [{ at: 28, text: 'Where Bautista’s group comes out after walking through the Abyss portal. The party comes through with them.' }],
  },
  {
    id: 's60', revealAt: 18, num: 60, name: 'Station 60', pos: { line: 'zomp', off: -11 },
    kinds: [{ at: 18, kind: 'landmark' }, { at: 21, kind: 'transfer' }],
    stages: [
      { at: 18, text: 'Said to be the employees’ residential district. It is an empty interchange. Madison is left here.' },
      { at: 21, text: 'Holds a selector that joins twelve Homeward Bound platforms, one for each trainyard’s employee track.' },
    ],
    facts: [
      { at: 18, lines: ['Every coloured line', 'Employee Line'], has: ['Meant to house the staff, with shops and restaurants; abandoned'] },
      { at: 21, has: ['Twelve Homeward Bound platforms'] },
    ],
  },
  {
    id: 's41', revealAt: 19, num: 41, name: 'Station 41', pos: { line: 'zomp', off: 9 },
    kinds: [{ at: 19, kind: 'transfer' }],
    stages: [{ at: 19, text: 'A transfer station with a saferoom and a Desperado Club. The Nightmare Express is parked here.' }],
    facts: [{ at: 19, has: ['Saferoom (Everest, a Greek café)', 'Desperado Club entrance'] }],
  },
  {
    id: 's101', revealAt: 21, num: 101, name: 'Station 101', pos: { line: 'vermillion' },
    kinds: [{ at: 21, kind: 'transfer' }],
    stages: [
      { at: 21, text: 'On the Vermillion Line. More than a thousand crawlers are trapped here.' },
      { at: 22, text: 'The rescue train arrives.' },
      { at: 23, text: 'Hekla dies here.' },
    ],
    facts: [{ at: 21, lines: ['Vermillion Line', 'Two stopped lines'], has: ['Saferoom', 'Desperado Club entrance'], lives: ['More than a thousand trapped crawlers'] }],
  },
  {
    id: 's75', revealAt: 24, num: 75, name: 'Station 75', pos: { line: 'vermillion' },
    kinds: [{ at: 24, kind: 'stop' }, { at: 25, kind: 'landmark' }],
    stages: [
      { at: 24, text: 'Where the reversing train plans to stop.' },
      { at: 25, text: 'A repair complex strewn with dead ghouls and hobgoblins. The armoury and repair shop are already looted. A bar, the Downward Dog, opens onto personal space but is no saferoom.' },
      { at: 26, text: 'The Interdiction Station. Its yard holds interdiction carts, including ten rapid-response carts.' },
    ],
    facts: [
      { at: 24, lines: ['Vermillion Line'] },
      { at: 25, has: ['Armoury (looted)', 'Repair shop (looted)', 'The Downward Dog, a bar'] },
      { at: 26, has: ['Interdiction carts'], lives: ['Growler Gary', 'Dead gnolls and hobgoblins'] },
    ],
  },
  {
    id: 's59', revealAt: 18, num: 59, name: 'Station 59', pos: { line: 'zomp' }, mapAt: 29,
    kinds: [{ at: 18, kind: 'transfer' }, { at: 29, kind: 'saferoom' }],
    stages: [
      { at: 18, text: 'Passed on the employee line: a big transfer station where twenty-seven lines meet, with a saferoom, a Club Vanquisher and a general store.' },
      { at: 29, text: 'The party’s base.' },
    ],
    facts: [
      { at: 18, lines: ['27 different lines', 'Employee Line'], has: ['Saferoom', 'Club Vanquisher entrance', 'General store'] },
      { at: 29, lines: ['Zomp Line'] },
    ],
  },
];

/** The party's movements. `via` is a line id, 'foot', or 'unknown' (route not given in our sources). */
export const hops: Hop[] = [
  { at: 1, from: 's81', to: 's82', via: 'red', board: false, note: 'In the rear car, heading for the transfer station' },
  { at: 2, from: 's82', to: 's83', via: 'red' },
  { at: 5, from: 's83', to: 's116', via: 'yellow', note: 'Past Phantom Kangaroo Station' },
  { at: 7, from: 's116', to: 's131', via: 'yellow' },
  { at: 10, from: 's131', to: 's149', via: 'unknown' },
  { at: 13, from: 's149', to: 's281', via: 'dismemberment' },
  { at: 14, from: 's281', to: 's283', via: 'mauve' },
  { at: 15, from: 's283', to: 'cavern', via: 'nightmare', who: ['carl'], note: 'The others stay at 283' },
  { at: 15, from: 'cavern', to: 's436', via: 'nightmare', who: ['carl'] },
  { at: 15, from: 's436', to: 'abyss', via: 'foot', who: ['carl'], note: 'An hour’s climb' },
  { at: 15, from: 'abyss', to: 's436', via: 'foot', who: ['carl'] },
  // The train keeps to its loop: from 436 the only way back to the first 283 is round the other three stops.
  { at: 15, from: 's436', to: 's283b', via: 'nightmare', who: ['carl'], note: 'On round the loop' },
  { at: 15, from: 's283b', to: 's83b', via: 'nightmare', who: ['carl'] },
  { at: 15, from: 's83b', to: 's83', via: 'nightmare', who: ['carl'] },
  { at: 15, from: 's83', to: 's283', via: 'nightmare', who: ['carl'] },
  { at: 16, from: 's283', to: 'cavern', via: 'nightmare' },
  { at: 17, from: 'cavern', to: 'yard-e', via: 'nightmare', off: false, note: 'The train itself goes through the Station Repair gate' },
  { at: 18, from: 'yard-e', to: 's24', via: 'employee', board: false, off: true, note: 'They get out for a look around' },
  { at: 18, from: 's24', to: 's36', via: 'employee' },
  { at: 18, from: 's36', to: 's48', via: 'employee' },
  { at: 18, from: 's48', to: 's60', via: 'employee' },
  { at: 19, from: 's60', to: 's41', via: 'nightmare', note: 'Turned around' },
  { at: 21, from: 's41', to: 's60', via: 'nightmare' },
  { at: 22, from: 's60', to: 's72', via: 'vermillion' },
  { at: 22, from: 's72', to: 's101', via: 'vermillion' },
  { at: 25, from: 's101', to: 's75', via: 'vermillion', note: 'In reverse' },
  { at: 28, from: 's75', to: 's433', via: 'mindaro', note: 'By rapid-response cart' },
  { at: 28, from: 's433', to: 's435', via: 'mindaro' },
  { at: 28, from: 's435', to: 'abyss', via: 'foot' },
  { at: 28, from: 'abyss', to: 'yard-h', via: 'jump', note: 'Through an Abyss portal with Bautista’s group' },
  { at: 29, from: 'yard-h', to: 's24', via: 'unknown', off: false, note: 'Between two interdiction carts, portals tuned to the Abyss' },
  { at: 29, from: 's24', to: 's59', via: 'zomp', board: false, note: 'Straight through station 24 by interdiction cart' },
  { at: 31, from: 's59', to: 's36', via: 'unknown', note: 'By cart' },
  { at: 32, from: 's36', to: 's24', via: 'unknown', note: 'By cart. Its portal removes station 24’s Krakaren boss in passing' },
  { at: 32, from: 's24', to: 'yard-e', via: 'unknown', note: 'On to the employee-line entrance, where a mantaur drags Carl through the cart’s portal' },
  { at: 34, from: 'yard-e', to: 's36', via: 'unknown', note: 'After sending the Nightmare off' },
];

import type { Creature, Embargo, Rule, Sketch } from './types.ts';

export const creatures: Creature[] = [
  {
    id: 'drek', revealAt: 1, name: 'Dreks', rank: 'mob',
    where: [{ at: 1, text: 'Red Line · board at Sirin Station' }],
    stages: [{ at: 1, text: 'Level 6. Knee-high and feral, arriving by the hundred.' }],
  },
  {
    id: 'jikininki', revealAt: 1, name: 'Jikininki', rank: 'mob',
    where: [{ at: 1, text: 'Car 15 of the party’s train' }, { at: 5, text: 'Car 15 of the trains' }, { at: 15, text: 'Train cars and the wreckage in the Abyss' }, { at: 22, text: 'Trains, the Abyss, and station 12' }],
    stages: [
      { at: 1, text: 'Level 17. Ghoulish janitors who lair in car 15. The party kills two of them there.' },
      { at: 5, text: 'Every train has them. New ones join on every run.' },
      { at: 15, text: 'They swarm over the cars dumped at the end of the line.' },
      { at: 22, text: 'A generator at station 12 turns them out.' },
    ],
  },
  {
    id: 'psycho-sticker', revealAt: 1, name: 'Psycho Stickers', rank: 'mob',
    where: [{ at: 1, text: 'Red Line · board at Mora Station' }],
    stages: [{ at: 1, text: 'Spined, ogre-sized things that board one stop before the transfer station.' }],
  },
  {
    id: 'bonker', revealAt: 4, name: 'Cave Mudge Bonkers', rank: 'mob',
    where: [{ at: 4, text: 'Yellow Line trains' }],
    stages: [{ at: 4, text: 'Level 19. Grey, pig-faced brutes with nailed clubs.' }],
  },
  {
    id: 'pollyslog', revealAt: 5, name: 'Pollyslogs', rank: 'mob',
    where: [{ at: 5, text: 'Yellow Line · Phantom Kangaroo Station' }],
    stages: [{ at: 5, text: 'Level 22. Big green fish-people with acid on their fingers.' }],
  },
  {
    id: 'fire-ants', revealAt: 5, name: 'Literal Fire Ants', rank: 'mob',
    where: [{ at: 5, text: 'A trapped suitcase in the Yellow Line Reward Room' }],
    stages: [{ at: 5, text: 'Level 1 each, and exactly what the name says. Enough of them empty a train.' }],
  },
  {
    id: 'cornet', revealAt: 6, name: 'Red Cornets', rank: 'mob',
    where: [{ at: 6, text: 'Caves behind Banshee Station' }],
    stages: [{ at: 6, text: 'Level 21. Skinless, eyeless, upright rabbits whose scream leaves you Queasy.' }],
  },
  {
    id: 'automaton', revealAt: 6, name: 'Dwarven Industrial Light-Duty Automatons', rank: 'other',
    where: [{ at: 6, text: 'Sealed rooms behind station platforms' }],
    stages: [
      { at: 6, text: 'Dormant industrial robots parked with a materials cart behind a hidden sigil. Carl scraps the pair he finds.' },
      { at: 16, text: 'They wake when the monsters go into withdrawal.' },
      { at: 18, text: 'Their job is to cart ghouls down a service conveyor to the trainyards.' },
    ],
  },
  {
    id: 'krakaren', revealAt: 10, name: 'Krakaren', rank: 'boss',
    where: [{ at: 10, text: 'An every-fifth station' }, { at: 12, text: 'Caverns at the every-fifth stations' }, { at: 31, text: 'Everywhere, and under the stairwell stations' }],
    stages: [
      { at: 10, text: 'A borough boss reported by Elle.' },
      { at: 12, text: 'It manufactures the vitamin shots the floor’s monsters are hooked on.' },
      { at: 27, text: 'Monsters dying in third-stage withdrawal burst into thousands of level-1 Krakaren young.' },
      { at: 29, text: 'The young have overrun a station 24.' },
      { at: 30, text: 'Mordecai explains that the whole Krakaren storyline is the showrunners’ propaganda.' },
      { at: 31, text: 'Juvenile clonelings pour up through the floors of the stairwell stations.' },
    ],
  },
  {
    id: 'gore-gore', revealAt: 11, name: 'Gore-Gore', rank: 'boss',
    where: [{ at: 11, text: 'Ochre Line engine car · fought at station 149' }],
    stages: [{ at: 11, text: 'Level 40 neighbourhood boss, a mantaur, and the Ochre Line’s engineer. A follower of Grull. Dies on the third rail.' }],
  },
  {
    id: 'grull', revealAt: 11, name: 'Grull', rank: 'other',
    where: [{ at: 33, text: 'Trainyard E' }],
    stages: [
      { at: 11, text: 'The god the Ochre Line’s engineer followed. Each punch from Carl’s gauntlet raised the odds of summoning him; it reached 10.5% and began a countdown before the fight ended.' },
      { at: 32, text: 'A summoned god stays for a number of seconds equal to its level plus its vessel’s: 290 seconds for Grull in a level-40 mantaur. It can be summoned again the moment it vanishes, and a new summoning can pull it out of its current vessel.' },
      { at: 33, text: 'Level 250 war god, making his debut with Prince Maestro as sponsor. He comes through the mantaur wearing Maestro’s face, and his arrival sets off a Death Challenge. He kills the mimic, then is pulled into the Abyss by a second summoning.' },
    ],
  },
  {
    id: 'flesher', revealAt: 12, name: 'Fleshers', rank: 'mob',
    where: [{ at: 12, text: 'Aboard the Dismemberment Limited' }],
    stages: [{ at: 12, text: 'Flying skins that wrap themselves around a skeleton. They come in the hundreds, led by a war mage called Dismember.' }],
  },
  {
    id: 'dismember', revealAt: 12, name: 'Dismember', rank: 'boss',
    where: [{ at: 12, text: 'Rear car of the Dismemberment Limited' }],
    stages: [{ at: 12, text: 'A war mage raising an army of Fleshers aboard the maglev and hunting its operator, Levi. Carl kills him by way of Donut’s Hole.' }],
  },
  {
    id: 'pooka', revealAt: 12, name: 'Pookas', rank: 'boss',
    where: [{ at: 12, text: 'Caverns at the every-fifth stations' }],
    stages: [{ at: 12, text: 'Neighbourhood bosses who hand each monster its dose, then send it home through a one-way portal.' }],
  },
  {
    id: 'babababoon', revealAt: 16, name: 'Babababoons', rank: 'mob',
    where: [{ at: 16, text: 'Station 283' }],
    stages: [{ at: 16, text: 'Level 17. The first monsters the party sees in second-stage withdrawal: twice as strong and past reasoning with.' }],
  },
  {
    id: 'festering', revealAt: 17, name: 'Festering Ghouls', rank: 'mob',
    where: [{ at: 17, text: 'The trainyards' }, { at: 22, text: 'The trainyards and station 48' }],
    secret: ['Festering'],
    stages: [
      { at: 17, text: 'Level 18. What Carl took for zombies. They are alive: a monster that dies in first-stage withdrawal gets up again as one of these.' },
      { at: 22, text: 'At station 48 they are fusing into a single province boss.' },
    ],
  },
  {
    id: 'mimic', revealAt: 17, name: 'Station Mimics', rank: 'boss',
    where: [{ at: 17, text: 'Six on the floor · one poses as Terminus' }, { at: 28, text: 'One is now loose in Trainyard E' }, { at: 33, text: 'The loose one is killed in Trainyard E' }],
    secret: ['Station Mimic', 'Mimic'],
    stages: [
      { at: 17, text: 'Monsters shaped like whole stations.' },
      { at: 18, text: 'City bosses. The one at Terminus has eaten crawlers by the dozen.' },
      { at: 28, text: 'It can only be hurt if more than half its mass is cut away at once.' },
      { at: 33, text: 'The displaced one, Mimic Rex, level 90, is the city boss of the Death Challenge arena. Grull kills it with a single axe stroke.' },
    ],
  },
  {
    id: 'kravyad', revealAt: 11, name: 'Kravyad', rank: 'other',
    where: [{ at: 11, text: 'Station 435' }],
    stages: [
      { at: 11, text: 'Whatever controls the employee portal at the end of the line.' },
      { at: 18, text: 'Blue, six-armed, serpent-bodied HR enforcers. The portal lives only as long as its Kravyad does.' },
      { at: 20, text: 'The one at Bautista’s station is killed by accident.' },
    ],
  },
  {
    id: 'wrath', revealAt: 18, name: 'Wrath Ghouls', rank: 'mob',
    where: [{ at: 22, text: 'Station 36' }],
    secret: ['Wrath Ghoul', 'Wrath'],
    stages: [{ at: 18, text: 'Another kind of ghoul, seen now and then.' }, { at: 22, text: 'Massing at station 36.' }],
  },
  {
    id: 'blister', revealAt: 22, name: 'Blister Ghouls', rank: 'mob',
    where: [{ at: 22, text: 'Station 72' }],
    secret: ['Blister Ghoul', 'Blister'],
    stages: [{ at: 22, text: 'Level 20, truly undead. A generator makes one for every living monster that dies anywhere on the floor.' }],
  },
  {
    id: 'province-boss', revealAt: 22, name: 'The Ghoul Amalgam', rank: 'boss',
    where: [{ at: 22, text: 'Station 48' }],
    secret: ['Amalgam', 'province boss'],
    stages: [
      { at: 22, text: 'A province boss forming from Festering Ghouls merging together.' },
      { at: 32, text: 'A second province boss, beneath station 36, is sent into the Abyss.' },
    ],
  },
  {
    id: 'razor-fox', revealAt: 27, name: 'Razor Fox', rank: 'mob',
    where: [{ at: 27, text: 'Station 75' }],
    stages: [{ at: 27, text: 'A third-stage Razor Fox the party sets aside to test Katia’s new sentinel form. It bursts before they can kill it, so no experience, and hatches thousands of level-1 Krakaren young, which Carl crushes and burns.' }],
  },
];

export const rules: Rule[] = [
  {
    id: 'clock', revealAt: 1, title: 'The clock',
    status: [{ at: 1, value: 'fact' }],
    stages: [
      { at: 1, text: 'Ten days until the floor collapses.' },
      { at: 3, text: 'On this floor only, the stairwells stay locked until six hours before collapse. Nobody leaves early.' },
      { at: 19, text: 'Four days and twenty hours remain.' },
      { at: 31, text: 'One day left. A self-destruct sequence is announced: stairwells open in eighteen hours, for a six-hour window. Emergency escape tunnels open now, with a warning that gravity may shift inside them.' },
    ],
  },
  {
    id: 'one-way', revealAt: 2, title: 'Coloured lines only go up',
    status: [{ at: 2, value: 'fact' }],
    stages: [
      { at: 2, text: 'Every coloured line runs one way, from station 11 to station 435. There is no train back.' },
      { at: 3, text: 'The same station number exists on different combinations of lines, so there are many station 83s.' },
      { at: 5, text: 'A full run takes about three days. Trains reset each time.' },
      { at: 12, text: 'Low-numbered stations are close together. Toward the far end they are many miles apart.' },
    ],
  },
  {
    id: 'stairs', revealAt: 2, title: 'Where the stairs are',
    status: [{ at: 2, value: 'fact' }],
    stages: [
      { at: 2, text: 'Stairwells are at stations 12, 24, 36, 48 and 72 on every coloured line. Everyone starts beyond them, so the puzzle is how to go backwards.' },
      { at: 15, text: 'Carl broadcasts four possible routes back, and a rumour of a train that runs in reverse.' },
      { at: 18, text: 'A stairwell station is a huge chamber with five stairwells in a ring and ten exits to platforms.' },
      { at: 22, text: 'Each is guarded: a ghoul generator at 12, Wrath Ghouls at 36, a forming province boss at 48, another generator at 72. What waits at 24 is not known.' },
      { at: 29, text: 'There was also a hidden stairwell at station 433.' },
    ],
  },
  {
    id: 'transfers', revealAt: 2, title: 'Transfer stations',
    status: [{ at: 2, value: 'fact' }],
    stages: [
      { at: 2, text: 'Saferooms and shops are found at transfer stations, where lines meet.' },
      { at: 6, text: 'Transfer stations ending in 1 have a Desperado Club entrance. Those ending in 9 have a Club Vanquisher.' },
      { at: 9, text: 'Elle notices that every known transfer station has a prime number. Imani wants more evidence.' },
      { at: 16, text: 'They are no longer safe: monsters in withdrawal invade them.' },
    ],
  },
  {
    id: 'bounties', revealAt: 3, title: 'Bounties',
    status: [{ at: 3, value: 'fact' }],
    stages: [{ at: 3, text: 'Killing a top-ten crawler pays out their bounty. A listed crawler who survives the floor keeps a tenth of their own.' }],
  },
  {
    id: 'platforms', revealAt: 4, title: 'Platforms are safe',
    status: [{ at: 4, value: 'fact' }],
    stages: [
      { at: 4, text: 'Monsters aboard a stopped train cannot attack a crawler standing on the platform.' },
      { at: 10, text: 'The third rail is live.' },
      { at: 12, text: 'When trains stall, monsters get out and walk the tracks.' },
    ],
  },
  {
    id: 'trains', revealAt: 1, title: 'Anatomy of a train',
    status: [{ at: 1, value: 'fact' }],
    stages: [
      { at: 1, text: 'Twenty cars, some of them special. Car 15 is a lair.' },
      { at: 4, text: 'The engine car is sealed and needs that line’s engineer key.' },
      { at: 5, text: 'Car 5 is a staff break room. Car 10 is a Reward Room: one numbered suitcase per crawler, once per line. Some are trapped. The conductor says the only time he knew an engineer to leave the engine car was after a wreck.' },
      { at: 11, text: 'Keys are colour-coded to their line. Only a derailment brings the engineer out.' },
      { at: 14, text: 'One Steam Engineer’s Key works on all four hundred steam trains.' },
    ],
  },
  {
    id: 'named', revealAt: 4, title: 'Named trains',
    status: [{ at: 4, value: 'fact' }],
    stages: [
      { at: 4, text: 'Besides the coloured lines there are trains with names, running their own routes.' },
      { at: 13, text: 'War mages ride several of them.' },
      { at: 14, text: 'Named trains run in loops, so unlike the coloured lines they come back round.' },
      { at: 17, text: 'One of them, Escape Velocity, was the intended way back to the stairwells.' },
    ],
  },
  {
    id: 'fifth', revealAt: 4, title: 'Every fifth station',
    status: [{ at: 4, value: 'rumour' }, { at: 6, value: 'theory' }, { at: 12, value: 'fact' }],
    stages: [
      { at: 4, text: 'Hekla’s people say the monsters get off the trains at every fifth station and vanish into caves.' },
      { at: 6, text: 'Carl’s guess: they are going there to collect something.' },
      { at: 10, text: 'One such station held three neighbourhood bosses and a borough boss.' },
      { at: 12, text: 'Confirmed. Each is an exit-only cavern where a Pooka hands out addictive, race-specific Rev-Up Vitamin Shots, made by a Krakaren. A one-way portal then returns each monster to its home station.' },
    ],
  },
  {
    id: 'end', revealAt: 5, title: 'What happens at the end of the line',
    status: [{ at: 5, value: 'rumour' }, { at: 11, value: 'fact' }],
    stages: [
      { at: 5, text: 'A conductor’s account: after 435 everything blurs and he wakes at the yard at station 10. Things he carried stay with him. A monster that stayed aboard came back as a skeleton.' },
      { at: 11, text: 'An engineer’s account: at 435 the crew leave by a memory-wiping employee portal. The engine alone goes through an abyss gate back to the depot and waits nine or ten hours for new cars. Passengers left aboard die in the deep cleaning.' },
      { at: 15, text: 'Seen first-hand: the cars are dropped into the Abyss. Trains are not looped. They are rebuilt.' },
    ],
  },
  {
    id: 'robots', revealAt: 6, title: 'The sealed rooms',
    status: [{ at: 6, value: 'theory' }, { at: 18, value: 'fact' }],
    stages: [
      { at: 6, text: 'Behind some platforms is a concrete room of dormant robots, hidden by a showrunner sigil. Their purpose is unknown.' },
      { at: 16, text: 'They switch on when withdrawal begins, and a sealed passage opens onto a long tunnel going down.' },
      { at: 18, text: 'The robots collect ghouls and send them down a service conveyor to the trainyards.' },
    ],
  },
  {
    id: 'cookbook', revealAt: 7, title: 'The Dungeon Anarchist’s Cookbook',
    status: [{ at: 7, value: 'fact' }],
    secret: ['Cookbook'],
    stages: [
      { at: 7, text: 'A unique item from the Prize Carousel. It looks like an ordinary book, but Carl’s Escape Plan skill shows hidden writing in it.' },
      { at: 8, text: 'This is the twenty-fourth edition; the first was awarded in the fifteenth season. Each holder adds to it for the next. The showrunners and the audience cannot read it; the System can. Reveal its contents and they are erased.' },
      { at: 34, text: 'Carl writes his entry for the twenty-fifth.' },
    ],
  },
  {
    id: 'withdrawal', revealAt: 12, title: 'Withdrawal',
    status: [{ at: 12, value: 'fact' }],
    stages: [
      { at: 12, text: 'A monster that misses its dose mutates. Every wrecked train means more missed doses.' },
      { at: 16, text: 'Stage two: strength doubles, reason goes, and the afflicted storm the transfer stations.' },
      { at: 17, text: 'A monster that dies in stage one rises as a Festering Ghoul.' },
      { at: 24, text: 'Third-stage monsters start to appear.' },
      { at: 27, text: 'Stage three turns anything into a bloated, tentacled thing that bursts into thousands of Krakaren young.' },
    ],
  },
  {
    id: 'portals', revealAt: 15, title: 'Portals and hats',
    status: [{ at: 15, value: 'fact' }],
    stages: [
      { at: 15, text: 'The Abyss portals are one-way and open only for the right kind of vehicle carrying a compatible key. Carl’s analysis lists three: the Ochre Line Engineer’s Key, the Steam Engineer’s Key, and the souvenir conductor hat every crawler was handed on arrival.' },
      { at: 19, text: 'Many crawlers sold or lost their hats long ago.' },
      { at: 25, text: 'Crawlers across the floor donate more than seven hundred hats and fifteen keys for the people stranded at the end of the line.' },
    ],
  },
  {
    id: 'yards', revealAt: 15, title: 'Where the trains come from',
    status: [{ at: 15, value: 'theory' }, { at: 17, value: 'fact' }],
    stages: [
      { at: 15, text: 'Through one portal Carl glimpses a fenced yard full of shambling figures.' },
      { at: 17, text: 'There are several trainyards, each a lettered Station and Repair Hub at the start of the lines.' },
      { at: 18, text: 'The homes the staff remember do not seem to exist. Their memories look implanted.' },
      { at: 17, text: 'Ghouls were meant to be carted to the yards and shipped to the Abyss on Terminus-direct trains. That chain has broken down, and the yards are filling.' },
      { at: 21, text: 'Twelve Homeward Bound platforms at station 60 point to at least twelve yards.' },
    ],
  },
  {
    id: 'ghouls', revealAt: 22, title: 'The ghoul economy',
    status: [{ at: 22, value: 'fact' }],
    stages: [
      { at: 22, text: 'Soul-crystal generators at the stairwell stations convert deaths into undead: every living (non-undead) monster that dies on the floor adds one more ghoul between the crawlers and the exit.' },
      { at: 27, text: 'A group trying to disable the generator at 72 dies in an enormous explosion. Carl suspects the soul crystal went off.' },
      { at: 31, text: 'Too many deaths at once overload the small soul crystals like fuses: two nearby generators explode.' },
    ],
  },
  {
    id: 'carts', revealAt: 26, title: 'Interdiction carts',
    status: [{ at: 26, value: 'fact' }],
    stages: [
      { at: 26, text: 'Battery carts at station 75 can be switched onto any line. Ten rapid-response carts run at five times train speed and carry a portal on the nose that can be aimed at a trainyard or the Abyss. Starting one takes two gnoll left hands.' },
      { at: 31, text: 'Hung nose-down over a hole, a cart’s portal makes a very good drain.' },
    ],
  },
  {
    id: 'shape', revealAt: 30, title: 'The shape of the Tangle',
    status: [{ at: 30, value: 'theory' }, { at: 31, value: 'fact' }],
    secret: ['Syndicate logo', 'galactic', 'galaxy'],
    stages: [
      { at: 30, text: 'Seen from above, the named trains’ loops draw the Syndicate’s logo, and the whole floor is a simplified map of the galaxy with the Abyss at its centre.' },
      { at: 30, text: 'Katia’s deduction: the map is only half the structure. Each line has a twin track running along its opposite side.' },
      { at: 31, text: 'Confirmed when the floors drop out of the stairwell chambers: the stairwell stations connect to that other half. Tilt the map into 3D to see it.' },
      { at: 32, text: 'Each line is a hollow tube with track on the outside, and the hollow is the emergency tunnel, nicknamed the noodle. Inside it, down is whichever wall is nearest.' },
    ],
  },
];

/**
 * A redrawing, in our own hand, of the single track diagram printed in the
 * book: the low stations from the yard to 75. Revealed once the book has
 * given all of it.
 */
const dot = (n: number) => ({ n, mark: 'dot' as const, notes: [] });
export const sketch: Sketch = {
  revealAt: 26,
  lede: 'Our redrawing of the diagram the book itself prints: a single track from the yard to station 75. There are many copies of this line, and not every line stops everywhere.',
  rows: [
    { n: 10, label: 'Trainyard', mark: 'sq', notes: [] },
    dot(11),
    { n: 12, label: 'Stairwell', mark: 'big', notes: [{ at: 26, text: 'Jikininki generator' }] },
    dot(13), dot(17), dot(19), dot(23),
    { n: 24, label: 'Stairwell', mark: 'big', notes: [{ at: 26, text: '????' }, { at: 29, text: 'Krakaren young' }] },
    dot(29), dot(31),
    { n: 36, label: 'Stairwell', mark: 'big', notes: [{ at: 26, text: 'Wrath Ghouls' }, { at: 31, text: 'Last stand' }] },
    dot(37), dot(41), dot(43), dot(47),
    { n: 48, label: 'Stairwell', mark: 'big', notes: [{ at: 26, text: 'Festering Ghouls, becoming a province boss' }] },
    dot(53), dot(59),
    { n: 60, label: 'Employee dorms', mark: 'x', notes: [{ at: 26, text: 'Empty.' }] },
    dot(61), dot(67), dot(71),
    { n: 72, label: 'Stairwell', mark: 'big', notes: [{ at: 26, text: 'Blister Ghoul generator' }, { at: 27, text: 'Big explosion. Crystal suspected' }] },
    dot(73),
    { n: 75, label: 'Interdiction', mark: 'dot', notes: [{ at: 26, text: 'Gnoll security, hobgoblin repair crews. Overrun.' }] },
  ],
};

/**
 * Free-standing terms that must not appear in any bundle before the given
 * chapter, wherever they might creep in.
 */
export const embargoes: Embargo[] = [
  { until: 3, terms: ['six hours'], why: 'stairwell lock announcement' },
  { until: 7, terms: ['Cookbook', 'Carousel', 'time-out', 'seven days'], why: 'the prize and Mordecai’s removal' },
  { until: 8, terms: ['player-killer', 'Frost Maiden', 'Obsidian', 'igneous'], why: 'club meeting and killing' },
  { until: 9, terms: ['prime'], why: 'Elle’s deduction' },
  { until: 9, terms: ['derail'], why: 'the plan' },
  { until: 10, terms: ['Krakaren', 'third rail'], why: 'first report of the borough boss' },
  { until: 11, terms: ['derailed', 'derailment', 'Gore-Gore', 'Grull', 'mantaur', 'Kravyad', 'Valtay', 'abyss'], why: 'derailment and the engineer’s account' },
  { until: 12, terms: ['vitamin', 'Rev-Up', 'Pooka', 'withdrawal', 'dose', 'maglev', 'Dismemberment', 'D’nadia', 'Formidable'], why: 'the drug system' },
  { until: 14, terms: ['Fire Brandy', 'stoker', 'boiler', 'Steam Engineer'], why: 'aboard the Nightmare Express' },
  { until: 15, terms: ['pit', 'hat', 'hats', 'trainyard', 'trainyards', 'rebuilt'], why: 'the end of the line seen first-hand' },
  { until: 17, terms: ['Festering', 'ghoul conveyor', 'Mimic', 'Mimics', 'Terminus', 'Escape Velocity', 'Widget', 'Madison'], why: 'trainyard revelations' },
  { until: 18, terms: ['Wrath', 'swallowed', 'implanted'], why: 'employee line tour' },
  { until: 20, terms: ['thirty'], why: 'the visitors' },
  { until: 21, terms: ['Homeward Bound', 'cowcatcher', 'Vermillion', 'Tizquick'], why: 'the rescue plan' },
  { until: 22, terms: ['Blister', 'soul crystal', 'soul-crystal', 'generator', 'generators', 'Silfa'], why: 'stairwell guardians' },
  { until: 23, terms: ['bait', 'kills Hekla', 'Hekla dies', 'Killed by Katia'], why: 'the death at 101' },
  { until: 25, terms: ['Loita', 'Downward Dog', 'Interdiction'], why: 'station 75' },
  { until: 26, terms: ['rapid-response', 'gnoll', 'Growler'], why: 'the carts' },
  { until: 27, terms: ['Sinopia', 'Grullo', 'Mindaro'], why: 'rescue lines' },
  { until: 29, terms: ['Zomp', 'hidden stairwell'], why: 'the return' },
  { until: 30, terms: ['Syndicate', 'galaxy', 'galactic', 'propaganda', 'twin', 'half of the floor'], why: 'the shape of the floor' },
  { until: 31, terms: ['other half'], why: 'confirmation' },
  { until: 31, terms: ['self-destruct', 'mirrored', 'cloneling', 'clonelings', 'last stand', 'Zhang', 'Tserendolgor'], why: 'the endgame begins' },
  { until: 32, terms: ['noodle', 'Prepotente', 'Miriam', 'Li Na'], why: 'the tunnels' },
  { until: 33, terms: ['Death Challenge', 'war god', 'impersonates'], why: 'the trainyard fight' },
  { until: 34, terms: ['last run', 'last train', 'Agatha', 'way down'], why: 'the exit' },
  { until: 35, terms: ['re-education', 'censoring', 'was Odette', 'desert', 'quadrant'], why: 'epilogue' },
];

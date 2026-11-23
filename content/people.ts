import type { Person } from './types.ts';

/**
 * revealAt 0 means the reader already knows this person from books 1 and 2.
 * Notes at 0 say only what a reader starting book 3 already knows.
 */
export const people: Person[] = [
  // ── the party ────────────────────────────────────────────────────────
  {
    id: 'carl', revealAt: 0, name: 'Carl', group: 'party',
    tags: [{ at: 0, text: 'Primal · Compensated Anarchist' }],
    stages: [
      { at: 0, text: 'Our narrator. Explosives, bare feet, and a growing grudge against the people running the show.' },
      { at: 1, text: 'Starts the floor with a 100,000-gold bounty on his head.' },
      { at: 3, text: 'Ranked sixth on the leaderboard.' },
      { at: 7, text: 'Picks the Dungeon Anarchist’s Cookbook from the Prize Carousel.' },
      { at: 11, text: 'Sponsored by the Valtay Corporation.' },
      { at: 14, text: 'Level 32. Holds the Steam Engineer’s Key.' },
      { at: 25, text: 'Ranked third.' },
      { at: 27, text: 'Level 35 after the explosive train goes off. Explosives Handling reaches 11.' },
      { at: 34, text: 'Level 41. Adds his own entry to the Cookbook.' },
    ],
  },
  {
    id: 'donut', revealAt: 0, name: 'Princess Donut', group: 'party',
    tags: [{ at: 0, text: 'Cat · Former Child Actor' }],
    stages: [
      { at: 0, text: 'Carl’s ex-girlfriend’s prize-winning cat, party leader in her own estimation, and the audience’s favourite.' },
      { at: 1, text: 'Her temporary class for this floor is Football Hooligan.' },
      { at: 3, text: 'Ranked seventh.' },
      { at: 8, text: 'Marked with a player-killer skull after a death in the Desperado Club.' },
      { at: 9, text: 'It was self-defence: she had been stabbed in the back.' },
      { at: 12, text: 'Level 28. Sponsored by Princess D’nadia of the Prism Kingdom.' },
      { at: 15, text: 'Level 30, with Charisma at 100.' },
      { at: 25, text: 'Ranked fourth.' },
    ],
  },
  {
    id: 'mongo', revealAt: 0, name: 'Mongo', group: 'party',
    tags: [{ at: 0, text: 'Mongoliensis · Donut’s pet' }],
    stages: [
      { at: 0, text: 'A feathered dinosaur, still growing.' },
      { at: 7, text: 'Level 15 and full-sized. Gains Earthquake. Donut’s fan box is a saddle for him.' },
    ],
  },
  {
    id: 'katia', revealAt: 0, name: 'Katia Grim', group: 'party',
    tags: [{ at: 0, text: 'Doppelganger · the party’s newest member' }],
    stages: [
      { at: 0, text: 'The newest member of the party, formerly with Hekla’s group. She can reshape her body, slowly.' },
      { at: 1, text: 'Her Pathfinder skill maps the train.' },
      { at: 6, text: 'The audience, Zev says, finds her boring.' },
      { at: 10, text: 'Learning to hold a likeness well enough to change her displayed name.' },
      { at: 12, text: 'Sponsored by Princess Formidable of the Skull Empire.' },
      { at: 12, text: 'Gore-Gore cut away real flesh, not just armour. Healing cannot restore it, and she can only reshape what she has left.' },
      { at: 13, text: 'Carries a backpack of raw metal as extra mass for her forms.' },
      { at: 21, text: 'Volunteers to be the rescue train’s cowcatcher.' },
      { at: 22, text: 'Rides spread across the front of the train as a spiked scoop. Shocked unconscious more than once, and found to have two hidden bolts in her.' },
      { at: 23, text: 'Kills Hekla by accident and collects her bounty. Level 24 before the cowcatcher run, she is now level 37.' },
      { at: 25, text: 'Ranked eighth. Her rewards for Hekla include the Enchanted Wrestling Belt of the Great Gorgo, whose Avalanche skill doubles her mass when she strikes on the move. The recap show presents Hekla’s death as deliberate.' },
      { at: 30, text: 'Deduces that the map is only half of the floor.' },
      { at: 33, text: 'Impersonates Carl during the Death Challenge.' },
    ],
  },
  {
    id: 'mordecai', revealAt: 0, name: 'Mordecai', group: 'party', base: true,
    tags: [{ at: 0, text: 'Manager · former crawler' }, { at: 2, text: 'Manager · currently a Grulke Infantry' }],
    stages: [
      { at: 0, text: 'The party’s manager and alchemist. His body changes with every floor.' },
      { at: 2, text: 'This floor’s form is a level-50 Grulke Infantry.' },
      { at: 7, text: 'Attacks the Prize Carousel’s host on sight and is removed from the game for seven days.' },
      { at: 29, text: 'Back from his time-out.' },
      { at: 30, text: 'Reads the floor’s hidden design from Katia’s map, and warns Carl off the Ring of Divine Suffering.' },
    ],
  },

  // ── the show ─────────────────────────────────────────────────────────
  {
    id: 'zev', revealAt: 0, name: 'Zev', group: 'show',
    tags: [{ at: 0, text: 'Kua-tin · the party’s PR agent' }],
    stages: [
      { at: 0, text: 'Handles the party’s publicity for the showrunners.' },
      { at: 13, text: 'Books Carl and Donut on Planet Beautiful.' },
      { at: 25, text: 'Visits to warn the party about Loita.' },
      { at: 35, text: 'Sent on a re-education retreat. Loita handles the party’s PR in the meantime.' },
    ],
  },
  {
    id: 'odette', revealAt: 35, name: 'Odette', group: 'show',
    tags: [{ at: 35, text: 'Talk-show host' }],
    stages: [
      { at: 35, text: 'The interview host from the earlier floors. Admits she was Hekla’s sponsor.' },
    ],
  },
  {
    id: 'maestro', revealAt: 33, name: 'Prince Maestro', group: 'show',
    secret: ['Maestro'],
    tags: [{ at: 33, text: 'Skull Empire royalty' }],
    stages: [
      { at: 33, text: 'The showman prince from the third floor. Alive, and the sponsor of the war god sent against Carl.' },
    ],
  },
  {
    id: 'valtay', revealAt: 11, name: 'The Valtay Corporation', group: 'show',
    tags: [{ at: 11, text: 'Carl’s sponsor' }],
    stages: [
      { at: 11, text: 'Signs on as Carl’s sponsor after the derailment.' },
      { at: 13, text: 'Their first gift is a neural implant that lets Carl analyse portals.' },
    ],
  },
  {
    id: 'dnadia', revealAt: 12, name: 'Princess D’nadia', group: 'show',
    tags: [{ at: 12, text: 'Prism Kingdom · Donut’s sponsor' }],
    stages: [{ at: 12, text: 'Sponsors Donut.' }, { at: 15, text: 'Sends Donut a pair of goggles.' }],
  },
  {
    id: 'formidable', revealAt: 12, name: 'Princess Formidable', group: 'show',
    tags: [{ at: 12, text: 'Skull Empire · Katia’s sponsor' }],
    stages: [{ at: 12, text: 'Sponsors Katia.' }],
  },
  {
    id: 'chaco', revealAt: 7, name: 'Chaco', group: 'show',
    tags: [{ at: 7, text: 'Former crawler champion · Prize Carousel host' }],
    stages: [{ at: 7, text: 'Hosts the Prize Carousel. Mordecai goes for his throat the moment he appears.' }],
  },
  {
    id: 'loita', revealAt: 25, name: 'Loita', group: 'show',
    tags: [{ at: 25, text: 'Bloom party' }],
    stages: [
      { at: 25, text: 'Hekla’s former PR representative, now with the ruling Bloom party. Zev warns she is trying to take over the party’s account.' },
      { at: 34, text: 'Announces herself as the floor ends.' },
      { at: 35, text: 'Takes over PR from Zev and starts censoring what the party may say.' },
    ],
  },

  // ── crawlers ─────────────────────────────────────────────────────────
  {
    id: 'brandon', revealAt: 0, name: 'Brandon', group: 'crawler',
    tags: [{ at: 0, text: 'Meadow Lark' }],
    stages: [
      { at: 0, text: 'One of the Meadow Lark carers who became Carl’s friends on the earlier floors.' },
      { at: 3, text: 'Died on the third floor, holding off monsters so others could leave. His last message asks Carl to find his brother.' },
    ],
  },
  {
    id: 'chris', revealAt: 0, name: 'Chris', group: 'crawler',
    tags: [{ at: 0, text: 'Meadow Lark · Brandon’s brother' }],
    stages: [
      { at: 0, text: 'Brandon’s brother.' },
      { at: 8, text: 'Alive. He chose a body of igneous rock and has left the group.' },
      { at: 20, text: 'Kills Frank in the Desperado Club and is banned from it.' },
    ],
  },
  {
    id: 'imani', revealAt: 0, name: 'Imani', group: 'crawler',
    tags: [{ at: 0, text: 'Meadow Lark' }, { at: 8, text: 'Obsidian Butterfly · Fire Spiritualist' }],
    stages: [
      { at: 0, text: 'A Meadow Lark nurse and one of the people Carl trusts most.' },
      { at: 3, text: 'Said to have escaped the third floor.' },
      { at: 6, text: 'Confirmed alive.' },
      { at: 8, text: 'Meets the party in the Desperado Club in her new form.' },
      { at: 12, text: 'With Elle, cracks the mystery of the every-fifth stations.' },
      { at: 19, text: 'Leads her group down the ghoul conveyor to a breached trainyard.' },
    ],
  },
  {
    id: 'elle', revealAt: 0, name: 'Elle', group: 'crawler',
    tags: [{ at: 0, text: 'Meadow Lark' }, { at: 8, text: 'Frost Maiden' }],
    stages: [
      { at: 0, text: 'A Meadow Lark resident with a sharp tongue.' },
      { at: 3, text: 'Said to have escaped the third floor.' },
      { at: 8, text: 'No longer in a wheelchair: she is now a Frost Maiden.' },
      { at: 9, text: 'Notices that every known transfer station is a prime number.' },
      { at: 10, text: 'Reports a borough boss at one of the every-fifth stations.' },
      { at: 33, text: 'Fights alongside the party in the trainyard.' },
    ],
  },
  {
    id: 'hekla', revealAt: 0, name: 'Hekla', group: 'crawler',
    tags: [{ at: 0, text: 'Leader of Brynhild’s Daughters' }],
    stages: [
      { at: 0, text: 'Leader of a large all-women party, and Katia’s former boss.' },
      { at: 4, text: 'In touch with Katia by message. Reports that monsters leave the trains at every fifth station.' },
      { at: 20, text: 'Appears inside the party’s personal space with about thirty followers.' },
      { at: 21, text: 'Proposes a joint rescue at station 101.' },
      { at: 22, text: 'Secretly shoots Katia with two invisible phased bolts that wipe memory and bleed her. Donut spots them through her goggles and blasts Hekla with a Magic Missile.' },
      { at: 23, text: 'Killed by Katia’s charge. She was ranked second on the floor.' },
      { at: 35, text: 'Her sponsor, it turns out, was Odette.' },
    ],
  },
  {
    id: 'eva', revealAt: 6, name: 'Eva Sigrid', group: 'crawler',
    tags: [{ at: 6, text: 'Brynhild’s Daughters' }, { at: 21, text: 'Half-Nagini / Half-Orc · Nimblefoot Enforcer' }],
    secret: ['Eva'],
    stages: [
      { at: 6, text: 'One of Hekla’s people. The two of them found a sealed robot room of their own.' },
      { at: 21, text: 'Level 27, with thirteen player-killer skulls (Hekla has none). Katia knew her before the dungeon as an economics professor in Reykjavik; Hekla had been Eva’s psychiatrist.' },
      { at: 22, text: 'Drives the rescue train.' },
      { at: 23, text: 'Admits that Katia was bait.' },
      { at: 24, text: 'Thrown from the train, alive. Said to be the Daughters’ new leader.' },
      { at: 27, text: 'Missing.' },
    ],
  },
  {
    id: 'silfa', revealAt: 22, name: 'Silfa', group: 'crawler',
    tags: [{ at: 22, text: 'Brynhild’s Daughters · healer' }],
    stages: [{ at: 22, text: 'A healer with the Daughters. Holds back healing on orders, then hides in the engineer apartment at station 101.' }, { at: 24, text: 'Says the group is coming apart.' }],
  },
  {
    id: 'bautista', revealAt: 4, name: 'Bautista', group: 'crawler',
    tags: [{ at: 4, text: 'Crawler' }, { at: 18, text: 'Crawler · leads a large group' }],
    stages: [
      { at: 4, text: 'Reports in from station 199.' },
      { at: 6, text: 'Shares the pattern for finding the two clubs.' },
      { at: 18, text: 'Part of his group of about four hundred has been swallowed by a mimic.' },
      { at: 19, text: 'Stuck at station 435.' },
      { at: 28, text: 'Leads about six hundred crawlers out through the Abyss.' },
      { at: 29, text: 'His stuffed figures summon the real thing, and their maker is now his sponsor. He gives Carl one, then his group splits off.' },
      { at: 34, text: 'Reports that a generator near his group has blown, clearing their way to the stairs.' },
    ],
  },
  {
    id: 'li-jun', revealAt: 21, name: 'Li Jun', group: 'crawler',
    tags: [{ at: 21, text: 'Crawler' }],
    stages: [
      { at: 21, text: 'Among those trapped at station 101.' },
      { at: 24, text: 'Joins the party in the cab.' },
      { at: 25, text: 'Drives the rest of the train and the larger group of rescued crawlers on toward station 36. One engine is uncoupled and left at 75.' },
      { at: 32, text: 'Joins Carl’s mission.' },
    ],
  },
  {
    id: 'li-na', revealAt: 32, name: 'Li Na', group: 'crawler',
    tags: [{ at: 32, text: 'Crawler' }],
    stages: [{ at: 32, text: 'Joins Carl’s mission with Li Jun and Zhang.' }],
  },
  {
    id: 'zhang', revealAt: 31, name: 'Zhang', group: 'crawler',
    tags: [{ at: 31, text: 'Crawler' }],
    stages: [{ at: 31, text: 'Uses the last charge of a shrinking wand so the rapid-response cart fits through station 36’s corridors.' }],
  },
  {
    id: 'tserendolgor', revealAt: 31, name: 'Tserendolgor', group: 'crawler',
    tags: [{ at: 31, text: 'Dog Soldier · Crisper' }],
    stages: [{ at: 31, text: 'Level 27. Fights at station 36.' }],
  },
  {
    id: 'lucia', revealAt: 8, name: 'Lucia Mar', group: 'crawler',
    tags: [{ at: 8, text: 'Crawler' }, { at: 13, text: 'Top-ranked crawler' }],
    stages: [{ at: 8, text: 'Banned for life from the Desperado Club, the club staff say.' }, { at: 13, text: 'Already near the stairwells, according to the recap.' }],
  },
  {
    id: 'quan', revealAt: 13, name: 'Quan Ch', group: 'crawler',
    tags: [{ at: 13, text: 'Top-ranked crawler' }],
    stages: [{ at: 13, text: 'Seen on the recap destroying an entire train.' }],
  },
  {
    id: 'prepotente', revealAt: 32, name: 'Prepotente', group: 'crawler',
    tags: [{ at: 32, text: 'Crawler' }],
    stages: [{ at: 32, text: 'Met in person at the twin station across from 36, where he had been keeping a boss asleep. Leaves with Miriam to find another boss.' }],
  },
  {
    id: 'miriam', revealAt: 32, name: 'Miriam Dom', group: 'crawler',
    tags: [{ at: 32, text: 'Crawler' }],
    stages: [{ at: 32, text: 'Met in person with Prepotente, whom she reins in. They leave to hunt another boss.' }],
  },
  {
    id: 'ji-hoon', revealAt: 9, name: 'Ji-Hoon', group: 'crawler',
    tags: [{ at: 9, text: 'Crawler · deceased' }],
    stages: [{ at: 9, text: 'Stabbed Donut in the back in the Desperado Club and died for it.' }],
  },
  {
    id: 'frank', revealAt: 19, name: 'Frank Q.', group: 'crawler',
    tags: [{ at: 19, text: 'Crawler' }],
    stages: [
      { at: 19, text: 'Level 17 and missing a hand. Gives Carl a ring with a curse attached, and a history involving Maggie and Yvette.' },
      { at: 20, text: 'Killed by Chris.' },
    ],
  },
  {
    id: 'donita', revealAt: 27, name: 'Donita Grace', group: 'crawler',
    tags: [{ at: 27, text: 'Crawler · deceased' }],
    stages: [{ at: 27, text: 'A message from her arrives after she is already marked deceased, warning of millions of something at station 24.' }],
  },
  {
    id: 'agatha', revealAt: 34, name: 'Agatha', group: 'crawler',
    tags: [{ at: 34, text: 'Human · level 8 · no class' }],
    stages: [{ at: 34, text: 'Familiar from the first floor. Turns up out of nowhere and pushes her shopping cart down the stairwell.' }],
  },

  // ── people of the dungeon ────────────────────────────────────────────
  {
    id: 'limp-richard', revealAt: 2, name: 'Limp Richard', group: 'npc',
    tags: [{ at: 2, text: 'Mole Man · shopkeeper' }],
    stages: [{ at: 2, text: 'Runs the shop at station 83.' }, { at: 4, text: 'Trades books with Carl.' }],
  },
  {
    id: 'wendita', revealAt: 2, name: 'Wendita', group: 'npc',
    tags: [{ at: 2, text: 'Bopca Protector' }],
    stages: [{ at: 2, text: 'Runs the saferoom at station 83.' }],
  },
  {
    id: 'vernon', revealAt: 5, name: 'Vernon', group: 'npc',
    tags: [{ at: 5, text: 'Yellow Line conductor' }],
    stages: [{ at: 5, text: 'Explains as much of his endless shift as he can remember. Killed by fire ants.' }],
  },
  {
    id: 'pierre', revealAt: 5, name: 'Pierre', group: 'npc',
    tags: [{ at: 5, text: 'Yellow Line porter' }],
    stages: [{ at: 5, text: 'Works the Yellow Line train with Vernon.' }],
  },
  {
    id: 'astrid', revealAt: 9, name: 'Astrid', group: 'npc',
    tags: [{ at: 9, text: 'Bloodlust Sprite · Desperado Club assistant manager' }],
    stages: [{ at: 9, text: 'Level 125. Deals with the killing on the dance floor.' }],
  },
  {
    id: 'igor', revealAt: 9, name: 'Igor', group: 'npc',
    tags: [{ at: 9, text: 'Crocodilian · club guard' }],
    stages: [{ at: 9, text: 'Level 45. Says Larracos, the club’s lower area, is the capital of the disputed lands and connects to the factions that will fight on the ninth floor.' }],
  },
  {
    id: 'bomo-sledge', revealAt: 8, name: 'Bomo and The Sledge', group: 'npc',
    tags: [{ at: 8, text: 'Hired guards' }],
    secret: ['Bomo', 'The Sledge'],
    stages: [{ at: 8, text: 'Bodyguards the party hires in the Desperado Club.' }],
  },
  {
    id: 'levi', revealAt: 12, name: 'Levi the Seventh', group: 'npc',
    tags: [{ at: 12, text: 'Operator of the Dismemberment Limited' }],
    secret: ['Levi'],
    stages: [{ at: 12, text: 'A troll Flesher sharing a body with a hobgoblin symbiote. The party takes a quest to keep him alive.' }],
  },
  {
    id: 'fire-brandy', revealAt: 14, name: 'Fire Brandy', group: 'npc',
    tags: [{ at: 14, text: 'Firewoman of the Nightmare Express' }],
    stages: [
      { at: 14, text: 'Lives in the locomotive’s boiler and keeps it running.' },
      { at: 34, text: 'Chooses to ride the train into the Abyss.' },
    ],
  },
  {
    id: 'widget', revealAt: 17, name: 'Widget', group: 'npc',
    tags: [{ at: 17, text: 'Grease Gremlin · technician' }],
    stages: [{ at: 17, text: 'Explains what the ghouls are and how the yards were meant to work. Dies in the yard.' }],
  },
  {
    id: 'madison', revealAt: 17, name: 'Madison', group: 'npc',
    tags: [{ at: 17, text: 'Human · HR' }],
    stages: [
      { at: 17, text: 'An HR worker rescued outside the yard. She handles benefits for the Kravyad and the six Station Mimics, and warns that Terminus is one of them. Talks about a home in the staff district. Rides along with the party.' },
      { at: 18, text: 'Left at station 60, where the home she remembers does not exist.' },
      { at: 31, text: 'Reported killed.' },
    ],
  },
  {
    id: 'tizquick', revealAt: 21, name: 'Tizquick', group: 'npc',
    tags: [{ at: 21, text: 'Conductor' }],
    stages: [
      { at: 21, text: 'Found at station 60, grieving a daughter who existed only in his implanted memories.' },
      { at: 34, text: 'Knowing now that his daughter was never real, he stays aboard with Fire Brandy to make sure the train blows before it hits bottom.' },
    ],
  },
  {
    id: 'growler-gary', revealAt: 26, name: 'Growler Gary', group: 'npc',
    tags: [{ at: 26, text: 'Gnoll · bartender at the Downward Dog' }],
    stages: [{ at: 26, text: 'Level 25. An invisible boundary keeps him inside the bar, so he survived the fall of station 75, and he keeps regenerating, which turns out to be useful to someone who needs gnoll hands.' }],
  },
];

type W = { at: number; state: 'party' | 'away' | 'off' | 'dead' | 'unknown'; where?: string; stn?: string };
const P = (at: number, where?: string, stn?: string): W => ({ at, state: 'party', where, stn });
const A = (at: number, where?: string, stn?: string): W => ({ at, state: 'away', where, stn });
const O = (at: number, where?: string, stn?: string): W => ({ at, state: 'off', where, stn });
const D = (at: number, where?: string, stn?: string): W => ({ at, state: 'dead', where, stn });
const U = (at: number, where?: string, stn?: string): W => ({ at, state: 'unknown', where, stn });

/**
 * Where each person is, as far as the reader knows at each chapter. "party"
 * means with Carl. Every entry describes the end of its chapter only.
 */
export const whereabouts: Record<string, W[]> = {
  carl: [P(0)],
  donut: [P(0), A(14, 'Left behind at station 283 when Carl was carried off', 's283'), P(15)],
  katia: [P(0), A(14, 'Left behind at station 283 when Carl was carried off', 's283'), P(15)],
  mongo: [P(0), A(14, 'With Donut at station 283', 's283'), P(15)],
  mordecai: [P(0, 'Waiting in the saferooms'), O(7, 'Removed from the game for seven days'), P(29, 'Back from his time-out')],
  zev: [O(0, 'With the show, off-world')],
  odette: [O(35, 'With the show, off-world')],
  maestro: [O(33, 'Off-world')],
  valtay: [O(11, 'Off-world')],
  dnadia: [O(12, 'Off-world')],
  formidable: [O(12, 'Off-world')],
  chaco: [O(7, 'With the show')],
  loita: [O(25, 'With the show, off-world')],
  brandon: [U(0, 'Last seen on the third floor'), D(3, 'Died on the third floor')],
  chris: [U(0, 'Last seen on the third floor'), A(8, 'Somewhere on this floor, on his own'), A(20, 'Banned from the Desperado Club')],
  imani: [U(0, 'Last seen on the third floor'), A(6, 'Alive, somewhere on this floor'), A(8, 'Met in the Desperado Club at station 131', 's131'), A(10, 'Scouting an every-fifth station'), A(15, 'Stranded by wrecked trains'), A(19, 'Reached a breached trainyard')],
  elle: [U(0, 'Last seen on the third floor'), A(6, 'Alive, somewhere on this floor'), A(8, 'Met in the Desperado Club at station 131', 's131'), A(10, 'Scouting an every-fifth station'), A(15, 'Stranded by wrecked trains'), A(19, 'Reached a breached trainyard'), P(33, 'Fighting beside the party')],
  hekla: [A(0, 'Leading her own party'), A(20, 'Waiting inside the party’s personal space'), P(21, 'Allied with the party for the rescue'), D(23, 'Killed at station 101')],
  eva: [A(6, 'With Hekla’s group'), P(21, 'Part of the rescue'), A(24, 'Thrown from the train, alive'), U(27, 'Missing')],
  silfa: [P(22, 'On the rescue train'), A(25, 'With what is left of the Daughters')],
  bautista: [A(4, 'Station 199', 's199'), A(19, 'Stuck at station 435', 's435'), A(28, 'Out through an Abyss portal into Trainyard H', 'yard-h'), A(29, 'Back from the far end')],
  'li-jun': [A(21, 'Trapped at station 101', 's101'), P(24, 'In the engine cab with the party'), A(25, 'Taking the rescued crawlers to station 36', 's36'), P(32, 'On Carl’s mission')],
  'li-na': [P(32, 'On Carl’s mission')],
  zhang: [A(31, 'Fighting at station 36', 's36'), P(32, 'On Carl’s mission')],
  tserendolgor: [A(31, 'Fighting at station 36', 's36')],
  lucia: [U(8, 'Whereabouts unknown; banned from the Desperado Club'), A(13, 'Near the stairwells, per the recap')],
  quan: [A(13, 'Somewhere on the floor, wrecking trains')],
  prepotente: [A(32, 'Met in person')],
  miriam: [A(32, 'Met in person')],
  'ji-hoon': [D(9, 'Killed in the Desperado Club')],
  frank: [A(19, 'The Desperado Club'), D(20, 'Killed in the Desperado Club')],
  donita: [D(27, 'Marked deceased when her warning arrived')],
  agatha: [A(34, 'Heading down the stairs')],
  'limp-richard': [A(2, 'His shop at station 83', 's83')],
  wendita: [A(2, 'The saferoom at station 83', 's83')],
  vernon: [A(5, 'Yellow Line train'), D(5, 'Killed by fire ants')],
  pierre: [A(5, 'Yellow Line train')],
  astrid: [A(9, 'The Desperado Club')],
  igor: [A(9, 'The Desperado Club')],
  'bomo-sledge': [A(8, 'Hired guards in the Desperado Club')],
  levi: [P(12, 'Aboard his maglev, under the party’s protection'), A(13, 'Back on his route')],
  'fire-brandy': [A(14, 'In the Nightmare Express’s boiler'), P(19, 'Keeping the party’s train running'), D(34, 'Rode the last train into the Abyss')],
  widget: [D(17, 'Died in the trainyard')],
  madison: [P(17, 'Riding along with the party'), A(18, 'Left at station 60', 's60'), D(31, 'Reported killed')],
  tizquick: [A(21, 'Station 60', 's60'), D(34, 'Rode the last train into the Abyss')],
  'growler-gary': [A(26, 'Behind the bar at station 75', 's75')],
};

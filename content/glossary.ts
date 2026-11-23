import type { Term } from './types.ts';

/**
 * The book's jargon, in plain words. `revealAt` 0 means the reader knows it
 * from books 1 and 2. Definitions say only what is true and known by then.
 */
export const glossary: Term[] = [
  { id: 't-crawler', revealAt: 0, term: 'Crawler', aliases: ['crawlers'], def: 'A person in the dungeon. Everyone who went down into it is a crawler, playing whether they like it or not.' },
  { id: 't-floor', revealAt: 0, term: 'Floor', aliases: ['floors'], def: 'The dungeon is a stack of floors, each with its own theme and a countdown. When the countdown ends the floor collapses, and anyone still on it dies. The only way on is the stairs down.' },
  { id: 't-collapse', revealAt: 0, term: 'Collapse', def: 'The end of a floor’s countdown. Crawlers who have not gone down the stairs by then are killed.' },
  { id: 't-stairwell', revealAt: 0, term: 'Stairwell', aliases: ['stairwells', 'stairs'], def: 'Stairs to the next floor. Reaching them in time is the point of every floor.' },
  { id: 't-saferoom', revealAt: 0, term: 'Saferoom', aliases: ['saferooms'], def: 'A rest stop monsters cannot enter, usually with food, a bathroom and a shopkeeper.' },
  { id: 't-personal-space', revealAt: 0, term: 'Personal space', aliases: ['personal spaces'], def: 'A private room crawlers can step into from a saferoom. It can be upgraded with workbenches and furniture, and shared by a party.' },
  { id: 't-boss', revealAt: 0, term: 'Neighbourhood boss', aliases: ['neighbourhood bosses', 'borough boss', 'city boss'], def: 'Bosses come in ranks, from weakest upward: neighbourhood, then borough, then city, and bigger still. Killing one pays better loot.' },
  { id: 't-box', revealAt: 0, term: 'Fan box', aliases: ['fan boxes', 'Benefactor Box', 'loot box', 'loot boxes'], def: 'Prize boxes crawlers earn. Fan boxes come from audience popularity; others come from achievements.' },
  { id: 't-show', revealAt: 0, term: 'The show', aliases: ['recap show', 'the recap', 'the audience', 'viewers'], def: 'Everything in the dungeon is broadcast to an audience off-world. Crawlers get interviews, rankings and fans, and popularity matters.' },
  { id: 't-system', revealAt: 0, term: 'The System', aliases: ['System'], def: 'The dungeon’s controlling AI. It makes the announcements, hands out achievements and enforces the rules, sometimes in its own way.' },
  { id: 't-class', revealAt: 0, term: 'Class', def: 'A crawler’s chosen profession, which decides their skills. Some floors offer a temporary extra class.' },
  { id: 't-bounty', revealAt: 0, term: 'Bounty', def: 'A reward on a crawler’s head, paid to whoever kills them.' },
  { id: 't-transfer', revealAt: 1, term: 'Transfer station', def: 'A station where two or more train lines meet.' },
  { id: 't-colored', revealAt: 2, term: 'Coloured line', aliases: ['coloured lines'], def: 'An ordinary subway line, named after a colour. All of them run the same direction, from station 11 up to 435.' },
  { id: 't-named', revealAt: 4, term: 'Named train', aliases: ['named trains'], def: 'A train with a name instead of a colour, running its own route rather than a coloured line.' },
  { id: 't-engineer-key', revealAt: 4, term: 'Engineer’s key', aliases: ['engineer key', 'engineer keys', 'key'], def: 'A key that opens a train’s sealed engine car. Each line has its own.' },
  { id: 't-reward-room', revealAt: 5, term: 'Reward Room', def: 'A train car of numbered suitcases. Each crawler can take one per line. Some are trapped.' },
  { id: 't-desperado', revealAt: 6, term: 'Desperado Club', aliases: ['the club'], def: 'A members-only club for crawlers, with bars, a casino and dance floors. Not every crawler has a pass.' },
  { id: 't-vanquisher', revealAt: 6, term: 'Club Vanquisher', def: 'Another members-only crawler club, found at different stations from the Desperado Club.' },
  { id: 't-pk', revealAt: 8, term: 'Player-killer skull', aliases: ['player-killer skulls', 'player-killer'], def: 'A mark that appears over a crawler who has killed another crawler, visible to everyone.' },
  { id: 't-sponsor', revealAt: 8, term: 'Sponsor', aliases: ['sponsors', 'sponsored'], def: 'A wealthy backer from the audience who signs on with a crawler and can send them gifts.' },
  { id: 't-third-rail', revealAt: 10, term: 'Third rail', def: 'The electrified rail that powers the trains. It is live, and deadly to touch.' },
];

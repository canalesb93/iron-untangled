import type { Question } from './types.ts';

/**
 * Questions the book raises, and how they get answered. A question appears
 * in the chapter that raises it; each later note says only what that chapter
 * adds. `closedAt` is the chapter that settles it.
 */
export const questions: Question[] = [
  {
    id: 'q-back', revealAt: 2, closedAt: 18, title: 'How do you get back to the stairs if the trains only go forward?',
    stages: [
      { at: 2, text: 'The stairs are all at low numbers, behind the party, and coloured lines only run upward.' },
      { at: 14, text: 'Named trains loop, so they can come back round.' },
      { at: 15, text: 'Carl finds four possible routes back and shares them with everyone.' },
      { at: 17, text: 'A named train, Escape Velocity, was meant to carry crawlers back to the stairwell stations.' },
      { at: 18, text: 'Answered: the staff track from the trainyard reaches the stairwell stations, and the party rides it to 24, 36 and 48.' },
    ],
  },
  {
    id: 'q-chris', revealAt: 3, closedAt: 8, title: 'Where is Brandon’s brother Chris?',
    stages: [
      { at: 3, text: 'Brandon’s last message asks Carl to find him.' },
      { at: 8, text: 'Answered: he is alive, has taken a body of rock, and has gone his own way.' },
    ],
  },
  {
    id: 'q-fifth', revealAt: 4, closedAt: 12, title: 'Why do the monsters get off at every fifth station?',
    stages: [
      { at: 4, text: 'Hekla’s people report it; nobody knows why.' },
      { at: 6, text: 'Carl’s guess: they are collecting something there.' },
      { at: 10, text: 'One such station holds several bosses, including a Krakaren.' },
      { at: 12, text: 'Answered: a Pooka hands each monster a dose of an addictive drug the Krakaren makes, then sends it home.' },
    ],
  },
  {
    id: 'q-436', revealAt: 4, closedAt: 15, title: 'What is station 436, one past the end of the line?',
    stages: [
      { at: 4, text: 'A named train stops there, though the lines are said to end at 435.' },
      { at: 15, text: 'Answered: Abyss Station, with a long climb up to the Abyss itself.' },
    ],
  },
  {
    id: 'q-end', revealAt: 5, closedAt: 15, title: 'What happens to a train at the end of the line?',
    stages: [
      { at: 5, text: 'The conductor can’t remember; he just wakes up back at the yard.' },
      { at: 11, text: 'The engineer says the staff leave by a memory-wiping portal and only the engine carries on.' },
      { at: 15, text: 'Answered: the passenger cars are dumped into the Abyss, and every train is rebuilt for its next run.' },
    ],
  },
  {
    id: 'q-robots', revealAt: 6, closedAt: 18, title: 'What are the sealed rooms of robots for?',
    stages: [
      { at: 6, text: 'Dormant automatons behind a sigil only Carl can see.' },
      { at: 16, text: 'They switch on once the monsters start going into withdrawal.' },
      { at: 18, text: 'Answered: they collect ghouls and send them down a conveyor to the trainyards.' },
    ],
  },
  {
    id: 'q-mordecai', revealAt: 7, closedAt: 29, title: 'When will Mordecai be back?',
    stages: [
      { at: 7, text: 'He has been removed from the game for seven days.' },
      { at: 29, text: 'Answered: he returns once his time is up.' },
    ],
  },
  {
    id: 'q-cookbook', revealAt: 7, closedAt: 8, title: 'What is the Dungeon Anarchist’s Cookbook?',
    stages: [
      { at: 7, text: 'An ordinary-looking book with hidden writing only Carl can see.' },
      { at: 8, text: 'Answered: a secret manual passed between crawlers across seasons, each adding to it.' },
    ],
  },
  {
    id: 'q-zombies', revealAt: 15, closedAt: 17, title: 'What are the shambling figures in the fenced yard?',
    stages: [
      { at: 15, text: 'Carl glimpses them through one of the Abyss portals.' },
      { at: 17, text: 'Answered: Festering Ghouls, living monsters that died in withdrawal and got back up.' },
    ],
  },
  {
    id: 'q-stranded', revealAt: 20, closedAt: 28, title: 'How will the crawlers stranded at the end of the line get out?',
    stages: [
      { at: 20, text: 'With the portal closed, more than 150 people without hats are stuck there.' },
      { at: 25, text: 'Some five to six hundred people are stranded at the far end without hats or keys. Crawlers across the floor donate more than seven hundred hats and fifteen keys.' },
      { at: 26, text: 'Fast carts at station 75 could reach them.' },
      { at: 28, text: 'Answered: they walk out through an Abyss portal wearing the donated hats.' },
    ],
  },
  {
    id: 'q-24', revealAt: 22, closedAt: 29, title: 'What is waiting at station 24?',
    stages: [
      { at: 22, text: 'Every other stairwell station has a known threat. Nobody knows what is at 24.' },
      { at: 27, text: 'A message from a crawler already listed as dead warns of millions of something there.' },
      { at: 29, text: 'Answered: thousands of young Krakaren.' },
    ],
  },
  {
    id: 'q-trap', revealAt: 30, closedAt: 31, title: 'Is there one last trap at the stairwell stations?',
    stages: [
      { at: 30, text: 'Carl suspects so. Mordecai recalls a fourth floor from a past season whose finished logo flipped everyone into a hidden chamber.' },
      { at: 31, text: 'Answered: yes. The floors drop away and Krakaren climb up from below.' },
    ],
  },
];

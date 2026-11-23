import type { Diagram } from './types.ts';

/**
 * Cutaway diagrams of the floor's building blocks. The drawings are generic
 * shapes keyed by `key`; every label is stamped with the chapter that tells
 * the reader what that part is.
 */
export const diagrams: Diagram[] = [
  {
    id: 'd-train', revealAt: 1, shape: 'cars', title: 'A coloured-line train',
    parts: [
      { key: 'all', stages: [{ at: 1, text: 'Twenty cars. Monsters climb aboard at every stop.' }] },
      { key: 'c20', stages: [{ at: 1, text: 'Car 20, the last car: where the party woke up.' }] },
      { key: 'c15', stages: [{ at: 1, text: 'Car 15: a Janitor’s Lair. The party kills the two Jikininki inside.' }, { at: 5, text: 'Car 15: the janitors’ car, home to Jikininki.' }] },
      { key: 'c1', stages: [{ at: 4, text: 'Car 1: the engine car. Sealed; it needs that line’s engineer key.' }, { at: 11, text: 'Car 1: the engine car. The engineer only comes out if the train is wrecked.' }] },
      { key: 'c5', stages: [{ at: 5, text: 'Car 5: a staff break room.' }] },
      { key: 'c10', stages: [{ at: 5, text: 'Car 10: the Reward Room. One numbered suitcase per crawler, per line.' }] },
    ],
  },
  {
    id: 'd-station', revealAt: 2, shape: 'station', title: 'Inside a transfer station',
    parts: [
      { key: 'track', stages: [{ at: 2, text: 'Tracks: trains stop here going one way only, up the numbers.' }, { at: 10, text: 'Tracks: trains run one way only, and the third rail is live.' }] },
      { key: 'platform', stages: [{ at: 2, text: 'The platform.' }, { at: 4, text: 'The platform: monsters on a stopped train can’t reach you here.' }] },
      { key: 'upstairs', stages: [{ at: 2, text: 'Upstairs: a saferoom and shops.' }, { at: 16, text: 'Upstairs: a saferoom and shops, though monsters in withdrawal now break in.' }] },
      { key: 'club', stages: [{ at: 6, text: 'A club door: a Desperado Club if the number ends in 1, a Club Vanquisher if it ends in 9.' }] },
      { key: 'behind', stages: [{ at: 6, text: 'Behind some platforms: caves, and a sealed room of dormant robots.' }, { at: 16, text: 'Behind some platforms: the robot rooms, now awake, and a passage to a tunnel going down.' }] },
      { key: 'below', stages: [{ at: 12, text: 'At every fifth station: an exit-only cavern where a Pooka hands out doses, and a one-way portal home.' }] },
    ],
  },
  {
    id: 'd-stairs', revealAt: 18, shape: 'chamber', title: 'A stairwell station, from above',
    parts: [
      { key: 'ring', stages: [{ at: 18, text: 'Five stairwells in a ring, closed until the floor’s last six hours.' }] },
      { key: 'exits', stages: [{ at: 18, text: 'Ten exits to platforms, each signed with a line.' }] },
      { key: 'special', stages: [{ at: 18, text: 'One exit is signed for a named train, Escape Velocity III.' }] },
      { key: 'floor', stages: [{ at: 31, text: 'The floor itself: sections can drop away into a mirrored chamber below.' }] },
    ],
  },
];

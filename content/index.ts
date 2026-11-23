import type { Content } from './types.ts';
import { chapters } from './chapters.ts';
import { hops, lines, stations } from './map.ts';
import { people as rawPeople, whereabouts } from './people.ts';
import { creatures, embargoes, rules, sketch } from './lore.ts';
import { glossary } from './glossary.ts';
import { questions } from './questions.ts';
import { diagrams } from './diagrams.ts';
import { credit, directoryStations, goofs, patterns } from './directory.ts';

const people = rawPeople.map((p) => ({ ...p, whereabouts: whereabouts[p.id] }));

export const content: Content = { chapters, lines, stations: [...stations, ...directoryStations], people, creatures, rules, hops, embargoes, sketch, glossary, questions, diagrams, goofs, patterns, credit };

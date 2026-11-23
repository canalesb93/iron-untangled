/** Lints the content, then writes public/data/ch-NN.json (one per chapter). */
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { content } from '../content/index.ts';
import { slice } from './slice.ts';
import { lint } from './lint.ts';

const problems = lint(content);
if (problems.length) {
  console.error(`\n✖ spoiler lint: ${problems.length} problem(s)\n`);
  for (const p of problems.slice(0, 200)) console.error(`  ch ${String(p.ch).padStart(2)}  ${p.kind.padEnd(20)} ${p.detail}`);
  process.exit(1);
}
const dir = new URL('../public/data/', import.meta.url);
rmSync(dir, { recursive: true, force: true });
mkdirSync(dir, { recursive: true });
const total = content.chapters.length;
for (let ch = 0; ch <= total; ch++) {
  writeFileSync(new URL(`ch-${String(ch).padStart(2, '0')}.json`, dir), JSON.stringify(slice(content, ch)));
}
writeFileSync(new URL('meta.json', dir), JSON.stringify({ total, labels: content.chapters.map((c) => c.label) }));
console.log(`✔ spoiler lint clean · wrote ${total + 1} chapter bundles`);

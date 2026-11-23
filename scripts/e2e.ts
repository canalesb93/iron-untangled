/**
 * Rendered-page spoiler test. For every chapter N it opens the built site as
 * a reader who has finished N and checks:
 *   - the browser requested no chapter bundle later than N
 *   - nothing on the page (text, SVG, attributes) contains a term from later
 *   - the same holds after reading to the end and stepping BACK to N
 * Usage: node scripts/e2e.ts [baseUrl]
 */
import { readdirSync, readFileSync } from 'node:fs';
import { chromium, type Page } from 'playwright';
import { content } from '../content/index.ts';
import { forbidden, mentions } from './lint.ts';

const base = process.argv[2] ?? 'http://localhost:4317/';
const total = content.chapters.length;
const browser = await chromium.launch();
let failures = 0;
const fail = (msg: string) => { failures++; console.error('  ✖', msg); };

const pageText = (page: Page) => page.evaluate(() => {
  const skip = ['d', 'style', 'transform', 'viewBox', 'class'];
  const attrs = [...document.querySelectorAll('*')].flatMap((e) => [...e.attributes].filter((a) => !skip.includes(a.name)).map((a) => a.value));
  const svgText = [...document.querySelectorAll('svg text')].map((t) => t.textContent ?? '');
  document.querySelectorAll('details').forEach((d) => (d.open = true));
  return [document.body.innerText, ...svgText, ...attrs].join('\n');
});

async function check(page: Page, n: number, label: string, requested: Set<number>) {
  for (const r of requested) if (r > n) fail(`${label}: requested bundle ${r}`);
  // The book's own title (on its cover, and in the page's <head> metadata) is
  // not a spoiler, though the in-story item it names is embargoed on its own.
  const text = (await pageText(page)).replace(/Dungeon Anarchist['’]s Cookbook/gi, '');
  for (const term of forbidden(content, n)) if (mentions(text, term)) fail(`${label}: page shows "${term}"`);
}

// Static files are downloaded by every reader, whatever their progress:
// they must not name anything that is not known before chapter 1.
{
  const names = [...content.lines, ...content.stations, ...content.people, ...content.creatures]
    .filter((e) => e.revealAt > 0).flatMap((e) => e.secret ?? [e.name]).filter(Boolean);
  const dist = new URL(process.env.E2E_DIST ?? '../dist/', import.meta.url);
  // every text file at the root (index.html, 404.html, robots.txt, sitemap.xml,
  // the web manifest, _headers), plus the meta bundle and the built assets
  const text = /\.(html|txt|xml|json|webmanifest|svg|js|css)$|^_headers$/;
  const root = readdirSync(dist, { withFileTypes: true }).filter((d) => d.isFile() && text.test(d.name)).map((d) => d.name);
  const files = [...root, 'data/meta.json', ...readdirSync(new URL('assets/', dist)).map((f) => `assets/${f}`)];
  for (const f of files) {
    const text = readFileSync(new URL(f, dist), 'utf8');
    for (const t of names) if (mentions(text, t)) fail(`static ${f}: contains "${t}"`);
  }
}

const seed = (c: number, tilt: boolean) => ({ furthest: c, view: c, tilt });

async function chapter(n: number) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  const requested = new Set<number>();
  page.on('request', (r) => { const m = /ch-(\d+)\.json/.exec(r.url()); if (m) requested.add(+m[1]); });
  await page.addInitScript((v) => localStorage.setItem('iron-tangle/v1', JSON.stringify(v)), seed(n, false));
  await page.goto(base);
  await page.waitForSelector('.tick');
  await check(page, n, `ch ${n} chapter tab`, requested);
  await page.click('[data-tab="codex"]');
  if (await page.locator('[data-sec="diagrams"]').count()) { await page.click('[data-sec="diagrams"]'); await check(page, n, `ch ${n} diagrams`, requested); }
  await page.click('[data-sec="journey"]');
  await check(page, n, `ch ${n} journey`, requested);
  // the station directory: rows, rule notes and inferred rows never run ahead of the reader
  await page.click('[data-sec="directory"]');
  await page.waitForSelector('.dir');
  await check(page, n, `ch ${n} directory`, requested);
  const firstRule = Math.min(...content.patterns.map((p) => p.at));
  if (n < firstRule && (await page.locator('.dir-inf, .dir-fits').count())) fail(`ch ${n}: directory applies a rule before chapter ${firstRule}`);
  if (n < total && (await page.locator('.dir-credit').count())) fail(`ch ${n}: credit block shown before the end`);
  if (n === total && !(await page.locator('.dir-credit a[href*="fandom.com"]').count())) fail(`ch ${n}: credit block missing at the end`);
  if (n < Math.min(...content.goofs.map((g) => g.revealAt)) && (await page.locator('.dir-goof').count())) fail(`ch ${n}: goof shown early`);
  if (await page.locator('[data-dir-inferred]').count()) {
    await page.click('[data-dir-inferred]');
    await check(page, n, `ch ${n} directory, predictions hidden`, requested);
    await page.click('[data-dir-inferred]');
  }
  if (await page.locator('.dir-strip button.dc').count()) await page.locator('.dir-strip button.dc').last().click();
  if (await page.locator('button.dir-item').count()) {
    await page.locator('button.dir-item').last().click();
    if ((await page.locator('[data-sec="places"][aria-pressed="true"]').count()) === 0) fail(`ch ${n}: directory row did not open its place`);
    await check(page, n, `ch ${n} directory → place`, requested);
  }
  await page.click('[data-tab="cast"]');
  await check(page, n, `ch ${n} cast`, requested);
  const people = await page.locator('.panel .who[data-person], .panel .crew-m[data-person]').evaluateAll((els) => els.map((e) => (e as HTMLElement).dataset.person!).filter(Boolean));
  for (const id of people) {
    await page.click(`.panel [data-person="${id}"]`);
    await check(page, n, `ch ${n} profile/${id}`, requested);
    await page.click('.panel [data-person=""]');
  }
  await page.click('[data-tab="codex"]');
  for (const sec of ['places', 'lines', 'creatures', 'rules', 'questions', 'terms']) {
    await page.click(`[data-sec="${sec}"]`);
    const count = await page.locator('.card-head').count();
    for (let i = 0; i < count; i++) {
      await page.locator('.card-head').nth(i).click();
      await check(page, n, `ch ${n} codex/${sec}#${i}`, requested);
      if ((await page.locator('[data-tab="codex"][aria-selected="true"]').count()) === 0) { await page.click('[data-tab="codex"]'); await page.click(`[data-sec="${sec}"]`); }
    }
  }
  // the keyboard must not get past the seal without the hold dialog
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(150);
  if (n < total && (await page.locator('.modal:not([hidden]) .hold').count()) === 0) fail(`ch ${n}: next did not ask before unsealing`);
  await check(page, n, `ch ${n} after next`, requested);
  await ctx.close();
}
// chapters are independent readers, so a few run at once
{
  const queue = Array.from({ length: total + 1 }, (_, n) => n);
  const workers = Math.max(1, Number(process.env.E2E_WORKERS ?? 4));
  await Promise.all(Array.from({ length: workers }, async () => { for (let n = queue.shift(); n !== undefined; n = queue.shift()) await chapter(n); }));
}

// read to the end, then look back
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  await page.addInitScript((v) => localStorage.setItem('iron-tangle/v1', JSON.stringify(v)), seed(total, false)); // flat: CI machines have no GPU, and this checks text
  await page.goto(base);
  await page.waitForSelector('.tick');
  await page.click('[data-tab="codex"]');
  await page.click('[data-sec="places"]');
  await page.locator('.card-head').first().click();
  for (const n of [30, 22, 16, 9, 3, 0]) {
    await page.click(`.tick[data-ch="${n}"]`);
    await page.waitForTimeout(400);
    // the previous drawing lingers under the new one while it fades; it only ever shows what was already on screen
    await page.waitForSelector('.ghost', { state: 'detached' });
    await check(page, n, `back to ch ${n}`, new Set());
    await page.click('[data-tab="codex"]');
    await check(page, n, `back to ch ${n} codex`, new Set());
    await page.click('[data-sec="directory"]');
    await check(page, n, `back to ch ${n} directory`, new Set());
    if (await page.locator('.dir-credit').count()) fail(`back to ch ${n}: credit block still shown`);
    await page.click('[data-sec="places"]');
  }
  await ctx.close();
}

await browser.close();
console.log(failures ? `\n✖ ${failures} spoiler failure(s)` : `✔ rendered-page spoiler test clean across ${total + 1} chapters`);
process.exit(failures ? 1 : 0);

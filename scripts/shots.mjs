// Dev helper: screenshots at a few chapters and sizes. usage: node scripts/shots.mjs <outDir> [spec ...]
// spec = name:chapter:width:height[:tilt][:sheet][:fit]
import { chromium } from 'playwright';
const [out, ...specs] = process.argv.slice(2);
const browser = await chromium.launch();
for (const spec of specs) {
  const [name, ch, w, h, ...flags] = spec.split(':');
  const ctx = await browser.newContext({ viewport: { width: +w, height: +h }, deviceScaleFactor: +w < 500 ? 2 : 1, hasTouch: +w < 500 });
  const page = await ctx.newPage();
  page.on('console', (m) => m.type() === 'error' && console.log(`[${name}]`, m.text()));
  page.on('pageerror', (e) => console.log(`[${name}] pageerror`, e.message));
  if (ch !== 'new') await page.addInitScript(([c, t]) => localStorage.setItem('iron-tangle/v1', JSON.stringify({ furthest: +c, view: +c, tilt: t })), [ch, flags.includes('tilt')]);
  await page.goto(process.env.URL ?? 'http://localhost:4317/');
  await page.waitForTimeout(1200);
  if (flags.includes('sheet')) await page.click('.chip');
  if (flags.includes('codex')) { await page.click('[data-tab="codex"]'); }
  if (flags.includes('fit')) await page.click('[data-act="fit"]');
  await page.waitForTimeout(2400);
  await page.screenshot({ path: `${out}/${name}.png` });
  await ctx.close();
}
await browser.close();

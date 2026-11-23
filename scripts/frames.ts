/**
 * Dev tool: film a chapter change as a contact sheet, to look for flashes.
 * Usage: node scripts/frames.ts <from> <to> <out.png> [baseUrl]
 */
import { chromium } from 'playwright';

const [from, to, out, base = 'http://localhost:4317/'] = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.addInitScript((v) => localStorage.setItem('iron-tangle/v1', JSON.stringify(v)), { furthest: 35, view: +from, tilt: false });
await page.goto(base);
await page.waitForSelector('.tick');
await page.waitForTimeout(4500);
const shots: string[] = [];
const t0 = Date.now();
const times: number[] = [];
await page.click(`.tick[data-ch="${to}"]`, { noWaitAfter: true });
for (let i = 0; i < 30; i++) {
  times.push(Date.now() - t0);
  shots.push((await page.screenshot({ type: 'jpeg', quality: 70, clip: { x: 380, y: 60, width: 900, height: 640 } })).toString('base64'));
}
const sheet = await browser.newPage({ viewport: { width: 1830, height: 1300 } });
await sheet.setContent(`<body style="margin:0;background:#000;display:grid;grid-template-columns:repeat(6,1fr);gap:4px;font:12px monospace;color:#fff">${shots.map((s, i) => `<div style="position:relative"><img style="width:100%;display:block" src="data:image/jpeg;base64,${s}"><span style="position:absolute;left:4px;top:2px;background:#000">${times[i]}ms</span></div>`).join('')}</body>`);
await sheet.screenshot({ path: out, fullPage: true });
await browser.close();

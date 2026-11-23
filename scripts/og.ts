/**
 * Renders the social card and the PNG app icons into public/:
 *   og.png (1200x630) from scripts/og.html
 *   apple-touch-icon.png (180), icon-192.png, icon-512.png, icon-maskable-512.png
 *     from the roundel mark below (the same drawing as public/favicon.svg)
 * Usage: npm run og   (needs Playwright's Chromium; og.html loads Inter from Google Fonts)
 * Spoiler rule: these images are seen before anyone picks a chapter, so they
 * must never show a station, line, character or creature name.
 */
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const out = (f: string) => fileURLToPath(new URL(`../public/${f}`, import.meta.url));
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });

await page.goto(new URL('og.html', import.meta.url).href);
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: out('og.png') });

/**
 * The mark: a red ring crossed by a cream bar, on the app's dark ground.
 * `scale` shrinks it inside the square (maskable icons need it inside the
 * central safe circle); `rx` rounds the ground (0 = full bleed, for platforms
 * that apply their own mask).
 */
const mark = (scale: number, rx: number) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="${rx}" fill="#0d0e11"/>
  <g transform="translate(32 32) scale(${scale}) translate(-32 -32)">
    <circle cx="32" cy="32" r="20" fill="none" stroke="#e5484d" stroke-width="7"/>
    <rect x="8" y="26" width="48" height="12" rx="2" fill="#efe6d0"/>
  </g>
</svg>`;

const icons: [file: string, size: number, scale: number, rx: number][] = [
  ['apple-touch-icon.png', 180, 0.86, 0],
  ['icon-192.png', 192, 1, 14],
  ['icon-512.png', 512, 1, 14],
  ['icon-maskable-512.png', 512, 0.78, 0],
];
for (const [file, size, scale, rx] of icons) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`<style>html,body{margin:0;background:transparent}svg{display:block;width:${size}px;height:${size}px}</style>${mark(scale, rx)}`);
  await page.screenshot({ path: out(file), omitBackground: true });
}

await browser.close();
console.log('wrote public/og.png and', icons.map(([f]) => f).join(', '));

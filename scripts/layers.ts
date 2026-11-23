/**
 * Dev tool: count compositor layers, at rest and during a chapter change.
 * In-drawing animations that run on the compositor split the map into many
 * layers, and the browser may then show parts of it blank while the camera moves.
 * Usage: node scripts/layers.ts [baseUrl]
 */
import { chromium } from 'playwright';

const base = process.argv.slice(2).find((a) => a.startsWith('http')) ?? 'http://localhost:4317/';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.addInitScript((v) => localStorage.setItem('iron-tangle/v1', JSON.stringify(v)), { furthest: 35, view: 9, tilt: false });
await page.goto(base);
await page.waitForSelector('.tick');
const cdp = await page.context().newCDPSession(page);
let layers: { layerId: string; width: number; height: number; drawsContent: boolean }[] = [];
cdp.on('LayerTree.layerTreeDidChange', (e) => { if (e.layers) layers = e.layers; });
await cdp.send('LayerTree.enable');
const report = async (label: string) => {
  const why: Record<string, number> = {};
  for (const l of layers.filter((x) => x.drawsContent)) {
    const r = await cdp.send('LayerTree.compositingReasons', { layerId: l.layerId }).catch(() => null);
    for (const k of r?.compositingReasonIds ?? ['?']) why[k] = (why[k] ?? 0) + 1;
    if (process.argv.includes('--nodes') && (l as { backendNodeId?: number }).backendNodeId) {
      const d = await cdp.send('DOM.describeNode', { backendNodeId: (l as { backendNodeId?: number }).backendNodeId! }).catch(() => null);
      const at = d?.node.attributes ?? [];
      console.log('  ', l.width, l.height, r?.compositingReasonIds?.join(','), d?.node.nodeName, at[at.indexOf('class') + 1] ?? '');
    }
  }
  console.log(label, layers.filter((x) => x.drawsContent).length, JSON.stringify(why));
};
await page.waitForTimeout(3000);
await report('at rest');
await page.click('.tick[data-ch="10"]');
await page.waitForTimeout(350);
await report('changing ');
await page.waitForTimeout(700);
await report('riding   ');
await browser.close();

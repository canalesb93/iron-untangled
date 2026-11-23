/**
 * Things that stand up when the map is tilted.
 *
 * The SVG map lies flat on the tilted board, so anything drawn in it is seen as a
 * decal. While tilted, this keeps a flat (untilted) HTML layer above the map with a
 * live copy of a few pieces of the drawing, each placed at the screen point where its
 * map position lands:
 *   - the travelling party (faces, car, caption, and the stem down to its spot),
 *   - the get-on / get-off badges,
 *   - station names.
 * Each copy is drawn through a blend of two transforms: lying flat (the paper's own local
 * transform at that point, so it looks exactly like the original decal) and standing
 * (upright, facing the viewer). The blend follows the lean, so things rise as the map
 * leans back and lie down again as it flattens: nothing is swapped.
 *
 * The originals stay in the map (hidden while this is active), so everything that drives
 * them (chapter changes, the trip replay, label layout, selection) keeps working untouched.
 * A MutationObserver copies each change across: attribute changes are mirrored onto the
 * matching copied element (so CSS transitions, like the car's colour, still ease), and only
 * structural changes re-copy. Copies keep their data-person / data-id, so taps work as before.
 */
import './tangle3d.css';

const NS = 'http://www.w3.org/2000/svg';
type Kind = 'party' | 'ev' | 'st';
interface Item {
  src: SVGGElement; kind: Kind; el: SVGSVGElement; wx: number; wy: number;
  shadow: SVGEllipseElement | null;
  twin: Map<Element, Element>;
  /** Label box in the copy's own units (before scale): x0, y0, x1, y1. */
  box: [number, number, number, number] | null;
  shown: boolean;
}
/** Map point → screen: position, upright scale, and the paper's local 2x2 transform there (a, b, c, d). */
export type Project = (wx: number, wy: number) => { x: number; y: number; s: number; J: [number, number, number, number]; clear: number } | null;

const xy = (g: Element): [number, number] => {
  const m = /translate\(\s*([-\d.e]+)[ ,]+([-\d.e]+)\s*\)/.exec(g.getAttribute('transform') ?? '');
  return m ? [+m[1], +m[2]] : [0, 0];
};

export class Upright {
  private root: HTMLDivElement;
  private items = new Map<Element, Item>();
  private mo: MutationObserver;
  private project: Project = () => null;
  private stand = 0;
  private stage: HTMLElement;
  private svg: SVGSVGElement;

  constructor(stage: HTMLElement, svg: SVGSVGElement) {
    this.stage = stage;
    this.svg = svg;
    this.root = document.createElement('div');
    this.root.className = 'up3d-root';
    this.root.setAttribute('aria-hidden', 'true');
    stage.append(this.root);
    this.mo = new MutationObserver((recs) => this.changed(recs));
    this.mo.observe(svg, { subtree: true, childList: true, characterData: true, attributes: true, attributeOldValue: false });
    this.rebuild();
    stage.classList.add('up3d-on');
  }

  /** Re-place everything for the current camera. `stand` is 0 (lying flat, like the map) to 1 (upright). */
  place(project: Project, stand: number) {
    this.project = project;
    this.stand = stand;
    this.copyCamera();
    for (const it of this.items.values()) this.put(it);
    this.declutter();
  }

  dispose() {
    this.mo.disconnect();
    this.root.remove();
    this.stage.classList.remove('up3d-on');
  }

  // ── keeping the copies in step ──────────────────────────────────────

  private changed(recs: MutationRecord[]) {
    const dirty = new Set<Item>(), moved = new Set<Item>();
    let all = false;
    for (const r of recs) {
      const t = r.target as Element;
      if (t === this.svg) { if (r.type === 'childList') all = true; continue; }
      const host = (t.nodeType === 1 ? t : t.parentElement)?.closest('.party, .ev, .st');
      const it = host && this.items.get(host);
      if (!it) continue;
      if (r.type === 'attributes') {
        if (t === host && r.attributeName === 'transform') { moved.add(it); continue; }
        if (t === host && r.attributeName === 'class') { it.el.firstElementChild?.setAttribute('class', host.getAttribute('class') ?? ''); continue; }
        // mirror the attribute onto the copy, so its CSS transitions run as they do in the map
        const twin = it.twin.get(t);
        if (twin) {
          const v = t.getAttribute(r.attributeName!);
          if (v == null) twin.removeAttribute(r.attributeName!); else twin.setAttribute(r.attributeName!, v);
          if (it.kind === 'st') this.measure(it);
          continue;
        }
        if (!it.src.contains(t)) continue;
      }
      dirty.add(it);
    }
    if (all) return this.rebuild();
    for (const it of dirty) this.fill(it);
    for (const it of new Set([...dirty, ...moved])) { [it.wx, it.wy] = xy(it.src); this.put(it); }
    if (dirty.size || moved.size) this.declutter();
  }

  private rebuild() {
    for (const it of this.items.values()) it.el.remove();
    this.items.clear();
    const add = (src: SVGGElement, kind: Kind) => {
      const el = document.createElementNS(NS, 'svg');
      el.setAttribute('class', `up3d up-${kind}`);
      const [wx, wy] = xy(src);
      const it: Item = { src, kind, el, wx, wy, shadow: null, twin: new Map(), box: null, shown: true };
      this.items.set(src, it);
      this.root.append(el);
      this.fill(it);
    };
    for (const g of this.svg.querySelectorAll<SVGGElement>(':scope > g.st')) if (g.querySelector('text.lbl')) add(g, 'st');
    for (const g of this.svg.querySelectorAll<SVGGElement>(':scope > g.ev')) add(g, 'ev');
    const p = this.svg.querySelector<SVGGElement>(':scope > g.party');
    if (p) add(p, 'party');
    this.copyCamera();
    for (const it of this.items.values()) this.put(it);
    this.declutter();
  }

  /** Copy a source subtree, remembering which copy belongs to which original. */
  private copy(it: Item, src: Element): Element {
    const c = src.cloneNode(true) as Element;
    const walk = (a: Element, b: Element) => { it.twin.set(a, b); for (let i = 0; i < a.children.length; i++) walk(a.children[i], b.children[i]); };
    walk(src, c);
    return c;
  }

  /** Copy the source's current look into its upright version. */
  private fill(it: Item) {
    const src = it.src, mk = src.querySelector(':scope > .mk');
    it.twin.clear();
    const wrap = document.createElementNS(NS, 'g');
    wrap.setAttribute('class', src.getAttribute('class') ?? '');
    if (src.hasAttribute('data-id')) wrap.setAttribute('data-id', src.getAttribute('data-id')!);
    const inner = document.createElementNS(NS, 'g');
    inner.setAttribute('class', 'mk');
    it.shadow = null;
    if (it.kind === 'party' && mk) {
      // a soft contact shadow on the ground, then the pin: stem, car, faces, caption
      const sh = document.createElementNS(NS, 'ellipse');
      sh.setAttribute('class', 'up-shadow');
      sh.setAttribute('rx', '30');
      wrap.append(sh);
      it.shadow = sh;
      for (const c of mk.children) if (c.matches('.stem, .crew, .cap-slot')) inner.append(this.copy(it, c));
      inner.querySelector('.stem')?.setAttribute('d', 'M0 0V-38');
    } else if (it.kind === 'ev' && mk) {
      for (const c of mk.children) inner.append(this.copy(it, c));
    } else if (mk) {
      const t = mk.querySelector('text.lbl');
      if (t) inner.append(this.copy(it, t));
    }
    wrap.append(inner);
    it.el.replaceChildren(wrap);
    if (it.kind === 'st') this.measure(it);
  }

  /** The label's box, in the copy's units, from its text length and the offset the map's layout gave it. */
  private measure(it: Item) {
    const t = it.el.querySelector<SVGTextElement>('text.lbl');
    const src = it.src.querySelector<SVGTextElement>('text.lbl');
    if (!t || !src || src.classList.contains('lbl-hidden') || getComputedStyle(t).display === 'none') { it.box = null; return; }
    let w = 0;
    try { w = t.getComputedTextLength(); } catch { w = (t.textContent ?? '').length * 12.6; }
    const m = /translate\(\s*([-\d.]+)px,\s*([-\d.]+)px\)/.exec(src.style.transform || '') ?? [, '26', '8'];
    const dx = +m[1]!, dy = +m[2]!, anchor = src.style.textAnchor || (it.src.classList.contains('left') ? 'end' : 'start');
    const x0 = anchor === 'end' ? dx - w : anchor === 'middle' ? dx - w / 2 : dx;
    it.box = [x0 - 3, dy - 20, x0 + w + 3, dy + 7];
  }

  private lastCls = '';
  private lastMs = '';
  private ms = 1;
  /** Zoom-dependent classes and marker scale, as the map has them right now. */
  private copyCamera() {
    const cls = `up3d-root ${this.svg.classList.contains('far') ? 'far' : ''} ${this.svg.classList.contains('mid') ? 'mid' : ''}`;
    if (cls !== this.lastCls) {
      this.root.className = this.lastCls = cls;
      for (const it of this.items.values()) if (it.kind === 'st') this.measure(it);
    }
    const ms = this.svg.style.getPropertyValue('--ms');
    if (ms !== this.lastMs) { this.root.style.setProperty('--ms', ms); this.lastMs = ms; this.ms = parseFloat(ms) || 1; }
  }

  private put(it: Item) {
    const p = this.project(it.wx, it.wy);
    if (!p) { it.el.style.display = 'none'; return; }
    it.el.style.display = '';
    // these are drawn above the fog, so they take on the fog themselves: hidden where it hides the ground
    const vis = Math.min(1, Math.max(0, (p.clear - 0.3) / 0.45));
    it.el.style.opacity = vis >= 1 ? '' : vis.toFixed(3);
    if (vis <= 0) { it.el.style.display = 'none'; return; }
    // lying: the paper's own transform here; standing: upright at the same size
    const u = this.stand, [a, b, c, d] = p.J;
    const m = [a + (p.s - a) * u, b * (1 - u), c * (1 - u), d + (p.s - d) * u];
    it.el.style.transform = `matrix(${m.map((v) => v.toFixed(4)).join(',')},${p.x.toFixed(1)},${p.y.toFixed(1)})`;
    // nearer things in front; the party above everything
    it.el.style.zIndex = String(it.kind === 'party' ? 100000 : Math.round(p.y));
    (it as Item & { at?: { x: number; y: number; s: number } }).at = { x: p.x, y: p.y, s: p.s };
    if (it.shadow) {
      // the shadow lies on the ground, so it is squashed by the lean; it appears as the pin rises
      const squash = Math.hypot(c, d) / (p.s || 1);
      it.shadow.setAttribute('ry', (30 * Math.min(1, Math.max(0.15, squash))).toFixed(1));
      it.shadow.style.fillOpacity = (0.28 * u).toFixed(3);
    }
  }

  /**
   * Standing names no longer follow the map's own layout exactly (the map is foreshortened,
   * they are not), so names that would overlap another name, or the party's pin, are hidden:
   * names the chapter is about first, then the nearest.
   */
  private declutter() {
    type Box = [number, number, number, number];
    const boxes: Box[] = [];
    const hit = (q: Box) => boxes.some((r) => q[0] < r[2] && q[2] > r[0] && q[1] < r[3] && q[3] > r[1]);
    const at = (it: Item) => (it as Item & { at?: { x: number; y: number; s: number } }).at;
    const party = [...this.items.values()].find((it) => it.kind === 'party');
    const pa = party && at(party);
    if (pa && this.stand > 0.5) { const k = pa.s * this.ms; boxes.push([pa.x - 75 * k, pa.y - 125 * k, pa.x + 75 * k, pa.y - 30 * k]); }
    const names = [...this.items.values()].filter((it) => it.kind === 'st');
    names.sort((p, q) => (+q.src.classList.contains('rel') - +p.src.classList.contains('rel')) || ((at(q)?.y ?? 0) - (at(p)?.y ?? 0)));
    for (const it of names) {
      const p = at(it);
      let show = true;
      if (this.stand > 0.5 && it.box && p) {
        const k = p.s * this.ms, b = it.box;
        const q: Box = [p.x + b[0] * k, p.y + b[1] * k, p.x + b[2] * k, p.y + b[3] * k];
        if (hit(q) && !it.src.classList.contains('sel')) show = false;
        else boxes.push(q);
      }
      if (show !== it.shown) { it.shown = show; it.el.style.visibility = show ? '' : 'hidden'; }
    }
  }
}

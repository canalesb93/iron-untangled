/**
 * The map: an SVG transit diagram on paper, under a canvas of fog.
 * Everything drawn here comes from the current chapter bundle. The renderer
 * holds no knowledge of its own about the floor.
 */
import type { Bundle } from '../scripts/slice.ts';
import { face } from './portraits.ts';
import type { Tangle3D } from './tangle3d.ts';

type Station = Bundle['stations'][number];
type Person = Bundle['people'][number];
interface Vehicle { name: string; color: string }
const WORLD = 2350; // half-extent of the fog mask, in world units
const MASK = 560; // mask resolution
const PERSPECTIVE = 1500; // must match .stage { perspective } in style.css
const PITCH = 56; // how far the map leans back in 3D, degrees
const TILT_MS = 900;
/** The ease of the lean (the same curve the CSS used: cubic-bezier(0.2, 0.7, 0.1, 1)). */
function lean(t: number): number {
  const bez = (a: number, b: number, u: number) => 3 * a * u * (1 - u) * (1 - u) + 3 * b * u * u * (1 - u) + u * u * u;
  let lo = 0, hi = 1;
  for (let i = 0; i < 24; i++) { const m = (lo + hi) / 2; if (bez(0.2, 0.1, m) < t) lo = m; else hi = m; }
  return bez(0.7, 1, (lo + hi) / 2);
}

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
/** An angle folded into -π..π. */
const wrapA = (a: number) => ((a + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI;
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** Is this colour dark enough to need light text on it? */
function dark(hex: string): boolean {
  const n = parseInt(hex.slice(1), 16);
  return ((n >> 16) & 255) * 0.299 + ((n >> 8) & 255) * 0.587 + (n & 255) * 0.114 < 150;
}

function poly(pts: number[]): string {
  let d = '';
  for (let i = 0; i < pts.length; i += 2) d += `${i ? 'L' : 'M'}${pts[i]} ${pts[i + 1]}`;
  return d;
}

/** Smooth curve through points (Catmull-Rom → cubic Bézier). */
function spline(pts: number[], closed: boolean): string {
  const n = pts.length / 2;
  if (n < 2) return '';
  const P = (i: number): [number, number] => {
    const k = closed ? ((i % n) + n) % n : clamp(i, 0, n - 1);
    return [pts[k * 2], pts[k * 2 + 1]];
  };
  let d = `M${P(0)[0]} ${P(0)[1]}`;
  const segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const [p0, p1, p2, p3] = [P(i - 1), P(i), P(i + 1), P(i + 2)];
    const t = 0.22;
    d += `C${Math.round(p1[0] + (p2[0] - p0[0]) * t)} ${Math.round(p1[1] + (p2[1] - p0[1]) * t)} ${Math.round(p2[0] - (p3[0] - p1[0]) * t)} ${Math.round(p2[1] - (p3[1] - p1[1]) * t)} ${p2[0]} ${p2[1]}`;
  }
  return d;
}

/** Part of a spline(): from stop `a`, `steps` stops along (negative = backwards). Lies exactly on the full curve. */
function section(pts: number[], closed: boolean, a: number, steps: number): string {
  const n = pts.length / 2;
  const P = (i: number): [number, number] => {
    const k = closed ? ((i % n) + n) % n : clamp(i, 0, n - 1);
    return [pts[k * 2], pts[k * 2 + 1]];
  };
  const t = 0.22, dir = Math.sign(steps);
  let d = `M${P(a)[0]} ${P(a)[1]}`;
  for (let s = 0; s !== steps; s += dir) {
    const i = dir > 0 ? a + s : a + s - 1; // the segment i → i+1 of the full curve
    const [p0, p1, p2, p3] = [P(i - 1), P(i), P(i + 1), P(i + 2)];
    const c1 = [Math.round(p1[0] + (p2[0] - p0[0]) * t), Math.round(p1[1] + (p2[1] - p0[1]) * t)];
    const c2 = [Math.round(p2[0] - (p3[0] - p1[0]) * t), Math.round(p2[1] - (p3[1] - p1[1]) * t)];
    d += dir > 0 ? `C${c1[0]} ${c1[1]} ${c2[0]} ${c2[1]} ${p2[0]} ${p2[1]}` : `C${c2[0]} ${c2[1]} ${c1[0]} ${c1[1]} ${p1[0]} ${p1[1]}`;
  }
  return steps ? d : '';
}

/** A gentle arc between two points, for journeys that do not follow a line. */
function arc(pts: number[]): string {
  if (pts.length > 4) return poly(pts);
  const [x1, y1, x2, y2] = pts;
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  const dx = x2 - x1, dy = y2 - y1;
  return `M${x1} ${y1}Q${Math.round(mx - dy * 0.16)} ${Math.round(my + dx * 0.16)} ${x2} ${y2}`;
}

function marker(s: Station): string {
  switch (s.kind) {
    case 'transfer':
    case 'saferoom':
      // interchange: two trains passing, so it can't be mistaken for an ordinary stop
      return `<circle r="17" class="m-ring"/><path d="M-8-4.5H8M4-8.5 8-4.5 4-.5M8 4.5H-8M-4 .5-8 4.5-4 8.5" class="m-glyph m-swap"/>`;
    case 'stairwell':
      return `<rect x="-15" y="-15" width="30" height="30" rx="5" class="m-stairs"/><path d="M-8 8h6v-6h6v-6h6" class="m-glyph"/>`;
    case 'endline':
      return `<rect x="-16" y="-7" width="32" height="14" rx="3" class="m-ink"/>`;
    case 'depot':
      return `<rect x="-19" y="-19" width="38" height="38" rx="6" class="m-ink"/><text class="m-letter" y="9">${esc(s.glyph ?? '')}</text>`;
    case 'landmark':
      return `<rect x="-12" y="-12" width="24" height="24" transform="rotate(45)" class="m-ring"/>`;
    case 'core':
      return '';
    default:
      return `<circle r="10" class="m-stop"/>`;
  }
}

function label(s: Station): string {
  const named = s.num != null && !/^Station \d+/.test(s.name);
  const text = named ? `<tspan class="l-num">${s.num}</tspan> ${esc(s.name)}` : esc(s.name);
  return `<text class="lbl${s.kind === 'core' ? ' lbl-big' : ''}">${text}</text>`;
}

interface Cam { x: number; y: number; z: number }
export interface Pad { left: number; right: number; top: number; bottom: number }

export class TangleMap {
  private stage: HTMLElement;
  private board: HTMLElement;
  private svg: SVGSVGElement;
  private under: SVGSVGElement;
  private fog: HTMLCanvasElement;
  private fx: CanvasRenderingContext2D;
  private cam = { x: 0, y: -900, z: 0.3 };
  private BW = 1000;
  private BH = 1000;
  private W = 0;
  private H = 0;
  private pad: Pad = { left: 0, right: 0, top: 0, bottom: 0 };
  private bundle: Bundle | null = null;
  private maskNew: HTMLCanvasElement | null = null;
  private maskOld: HTMLCanvasElement | null = null;
  private maskT = 1;
  private forward = true;
  private maskStart = 0;
  private fly: { from: Cam; to: Cam; start: number; dur: number } | null = null;
  private noise: HTMLCanvasElement;
  private pointers = new Map<number, { x: number; y: number }>();
  private moved = 0;
  private tilt = false;
  private selected: string | null = null;
  private still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  private dirty = true;
  private lastFrame = 0;
  onSelect: (id: string | null) => void = () => {};
  onPerson: (id: string) => void = () => {};
  /** A tap on a stretch of the party's route that isn't on a drawn line. The number is the hop's place in the bundle. */
  onTrail: (hop: number) => void = () => {};

  constructor(host: HTMLElement) {
    host.innerHTML = `<div class="stage"><div class="board">
      <svg class="deck under" aria-hidden="true"></svg>
      <svg class="deck main" role="img" aria-label="Map of what you know so far"></svg>
      <canvas class="deck fog"></canvas>
    </div></div>`;
    this.stage = host.querySelector('.stage')!;
    this.board = host.querySelector('.board')!;
    this.svg = host.querySelector('.deck.main')!;
    this.under = host.querySelector('.deck.under')!;
    this.fog = host.querySelector('.deck.fog')!;
    this.fx = this.fog.getContext('2d')!;
    this.noise = this.makeNoise();
    this.bind();
    this.makeCompass(host);
    this.resize();
    new ResizeObserver(() => this.resize()).observe(this.stage);
    requestAnimationFrame((t) => this.frame(t));
  }

  // ── public ─────────────────────────────────────────────────────────

  setPad(p: Pad) {
    if (!this.W || !this.padCur) this.padCur = { ...p };
    this.pad = p;
    this.dirty = true;
    if (this.compass) Object.assign(this.compass.style, { right: `${p.right + 16}px`, bottom: `${p.bottom + 16}px` });
    if (this.turns) Object.assign(this.turns.style, { right: `${p.right + 16}px`, bottom: `${p.bottom + 16 + 46 + 8}px` });
  }
  /** The padding actually in use, easing toward `pad` so the map glides when panels resize. */
  private padCur: Pad | null = null;

  /** Spotlight: fade everything this chapter didn't touch. */
  setFocus(on: boolean) {
    this.stage.classList.toggle('spot', on);
    this.lastLayoutZ = 0;
    this.dirty = true;
  }

  /** Ids of the things this chapter is about: where the party went, and anything new or updated. */
  private relevant(): Set<string> {
    const b = this.bundle!, ch = b.ch, ids = new Set<string>();
    for (const h of b.hops) if (h.at === ch) { ids.add(h.from); ids.add(h.to); ids.add(h.via); }
    const last = b.hops.at(-1);
    if (last) ids.add(last.to);
    for (const s of b.stations) if (s.since === ch || s.notes.some((n) => n.at === ch)) ids.add(s.id);
    for (const l of b.lines) if (l.since === ch || l.segs.some((x) => x.at === ch) || l.legs.some((x) => x.at === ch)) ids.add(l.id);
    const k = b.chapters.find((c) => c.n === ch);
    if (k?.focus) ids.add(k.focus);
    return ids;
  }

  setTilt(on: boolean) {
    this.tilt = on;
    this.stage.classList.toggle('tilt', on);
    // grow before tilting; shrink only once the sheet has settled flat again
    if (on && !this.wide) { this.wide = true; this.resize(); }
    // One choreographed move, driven from here (not a CSS transition) so that everything
    // that leans, rises and lies back down can follow the same progress, frame by frame.
    const from = this.tiltP, to = on ? 1 : 0;
    // lying back down cancels any turn still in motion, and takes the short way back round
    if (!on) { this.orbit = null; this.spin = 0; this.yaw = wrapA(this.yaw); }
    if (this.still || !this.bundle || document.hidden) {
      this.tiltP = to;
      this.tiltAnim = null;
      if (!on) this.settleFlat();
    } else if (from !== to) this.tiltAnim = { from, to, start: -1, yaw0: this.yaw, pitch0: this.pitch };
    this.compass?.classList.toggle('on', on);
    this.turns?.classList.toggle('on', on);
    this.dirty = true;
    if (on) this.wakeDeco();
  }

  /** The 3D layer (three.js) is kept out of the first load, then fetched when the browser is idle. */
  private wakeDeco() {
    if (this.deco || this.decoLoading) return;
    this.decoLoading = true;
    import('./tangle3d.ts').then((m) => { if ((this.tilt || this.tiltP > 0) && !this.deco) this.deco = m.Tangle3D.create(this.stage, this.svg); })
      .catch(() => {}).finally(() => { this.decoLoading = false; });
  }

  /** Back to the plain flat map: the CSS takes over again, and the board shrinks to the window. */
  private settleFlat() {
    this.yaw = 0;
    this.pitch = PITCH;
    this.orbit = null;
    this.spin = 0;
    for (const el of [this.board, this.fog]) { el.style.transform = ''; el.style.transition = ''; }
    this.tiltCss = '';
    if (this.wide) { this.wide = false; this.resize(); }
  }

  /** How far the map leans back, 0 (flat) to 1 (tilted), as drawn this frame. */
  private tiltP = 0;
  private tiltAnim: { from: number; to: number; start: number; yaw0: number; pitch0: number } | null = null;
  /** The reader's own turn of the tilted map (radians, about the screen centre) and lean (degrees). */
  private yaw = 0;
  private pitch = PITCH;
  /** Where the turn and lean are heading; the frame loop eases them there. */
  private orbit: { yaw: number; pitch: number } | null = null;
  /** Leftover turn after a flick (radians per ms), and the recent turn it is measured from. */
  private spin = 0;
  private spinLog: { t: number; yaw: number }[] = [];
  private orbitT = 0;
  /** The board's transform as a matrix, for converting between screen and map. */
  private M = new DOMMatrix();
  private tiltCss = '';
  private compass: HTMLButtonElement | null = null;
  private turns: HTMLElement | null = null;

  /** Set the board's transform for the current lean and turn. */
  private applyTilt() {
    const p = this.tiltP;
    if (p <= 0 && !this.tiltAnim && !this.tilt) { this.M = new DOMMatrix(); return; }
    const deg = (this.yaw * 180) / Math.PI;
    const css = `rotateX(${(this.pitch * p).toFixed(3)}deg) rotateZ(${deg.toFixed(3)}deg) scale(${(1 + 0.08 * p).toFixed(4)})`;
    if (css !== this.tiltCss) {
      this.tiltCss = css;
      this.M = new DOMMatrix(css);
      Object.assign(this.board.style, { transform: css, transition: 'none' });
      // the fog sheet lies on the ground while tilted (the 3D layer draws the same sheet there)
      Object.assign(this.fog.style, { transform: 'none', transition: 'none' });
    }
    if (this.compass) {
      // the reader's own turn, so the dial sits straight at the starting view (the lean's perspective does not tip it)
      this.compass.style.setProperty('--turn', `${((this.yaw * 180) / Math.PI).toFixed(2)}deg`);
    }
  }

  /**
   * Screen point (client px) → map point. Undoes the stage perspective and the board's
   * transform by finding where the view ray meets the paper: two linear equations in the
   * paper's own coordinates. Flat, this is just the viewBox mapping.
   */
  private toMap(cx: number, cy: number): [number, number] {
    const r = this.stage.getBoundingClientRect();
    const X = cx - r.left - this.W / 2, Y = cy - r.top - this.H / 2, d = PERSPECTIVE, m = this.M;
    const a11 = d * m.m11 + X * m.m13, a12 = d * m.m21 + X * m.m23, b1 = X * d - d * m.m41 - X * m.m43;
    const a21 = d * m.m12 + Y * m.m13, a22 = d * m.m22 + Y * m.m23, b2 = Y * d - d * m.m42 - Y * m.m43;
    const det = a11 * a22 - a12 * a21;
    let bx = X, by = Y;
    if (Math.abs(det) > 1e-6) { bx = (b1 * a22 - a12 * b2) / det; by = (a11 * b2 - a21 * b1) / det; }
    const [sx, sy] = this.shift();
    return [this.cam.x + (bx - sx) / this.cam.z, this.cam.y + (by - sy) / this.cam.z];
  }

  /** Turn and lean the tilted map (radians, degrees), clamped to what still covers the view. */
  private turn(dYaw: number, dPitch = 0) {
    if (!this.tilt) return;
    // the pointer moves the target; the frame loop eases the map after it, so a jittery hand still turns smoothly
    const o = this.orbit ?? { yaw: this.yaw, pitch: this.pitch };
    o.yaw += dYaw;
    o.pitch = clamp(o.pitch + dPitch, 38, 62);
    this.spin = 0;
    this.dirty = true;
    if (this.still) { this.yaw = wrapA(o.yaw); this.pitch = o.pitch; this.orbit = null; return; }
    this.orbit = o;
    const t = performance.now();
    this.spinLog.push({ t, yaw: o.yaw });
    while (this.spinLog.length > 2 && t - this.spinLog[0].t > 90) this.spinLog.shift();
  }

  /** On letting go of a turn: a quick flick keeps the map turning a little, then it slows to a stop. */
  private fling() {
    const log = this.spinLog, now = performance.now();
    this.spinLog = [];
    if (this.still || log.length < 2) return;
    const a = log[0], b = log[log.length - 1];
    if (now - b.t > 60 || b.t - a.t < 8) return; // the hand had stopped before letting go
    this.spin = clamp((b.yaw - a.yaw) / (b.t - a.t), -0.005, 0.005);
  }

  /** Ease the turn and lean to a target (keyboard steps, and back to the starting view on reset). */
  private orbitTo(yaw: number, pitch: number) {
    if (!this.tilt) return;
    const d = wrapA(yaw - (this.orbit?.yaw ?? this.yaw));
    this.spin = 0;
    if (this.still) { this.yaw = wrapA(this.yaw + d); this.pitch = pitch; this.orbit = null; this.dirty = true; return; }
    this.orbit = { yaw: (this.orbit?.yaw ?? this.yaw) + d, pitch: clamp(pitch, 38, 62) };
  }

  /**
   * A small turn dial, shown while tilted. The book never says which way is north, so it shows how far
   * the reader has turned the map from where it started, not a compass heading. Drag to turn, tap
   * (or Enter) to go back to the starting view, arrows to turn and lean.
   */
  private makeCompass(host: HTMLElement) {
    const b = document.createElement('button');
    b.className = 'compass';
    b.type = 'button';
    b.title = 'Turn the map (drag), or tap to straighten it';
    b.setAttribute('aria-label', 'Map rotation. Arrow keys turn and lean the map; Enter straightens it again.');
    const ticks = Array.from({ length: 24 }, (_, i) => { const a = (i * Math.PI) / 12, r0 = i % 6 ? 17.5 : 15.5; return `M${(r0 * Math.sin(a)).toFixed(2)} ${(-r0 * Math.cos(a)).toFixed(2)}L${(19.5 * Math.sin(a)).toFixed(2)} ${(-19.5 * Math.cos(a)).toFixed(2)}`; }).join('');
    // the ticks and the little map sheet turn with the map; the amber mark at the top stays put, so it reads like a dial
    b.innerHTML = `<svg viewBox="-22 -22 44 44" aria-hidden="true"><g class="needle"><path d="${ticks}" class="tk"/><rect x="-7" y="-8.5" width="14" height="17" rx="2.5" class="sh"/><path d="M-3.5-4.5H3.5M-3.5-1H3.5M-3.5 2.5H1" class="sl"/></g><path d="M0-21.5 2.6-17.6H-2.6Z" class="mk"/></svg>`;
    // its look lives here, not in the lazily loaded 3D stylesheet, so it is never unstyled
    const css = document.createElement('style');
    css.textContent = `.compass{position:absolute;z-index:6;width:46px;height:46px;padding:0;border-radius:50%;border:1px solid #ffffff2e;background:#101218d9;display:grid;place-items:center;cursor:grab;touch-action:none;
  visibility:hidden;opacity:0;transform:scale(.85);transition:opacity .35s,transform .35s,visibility 0s .35s}
.compass.on{visibility:visible;opacity:1;transform:none;transition-delay:0s}
.compass:active{cursor:grabbing}.compass:focus-visible{outline:2px solid #ffb02e;outline-offset:2px}
.compass svg{width:40px;height:40px;overflow:visible}.compass .needle{transform:rotate(var(--turn,0deg))}
.compass .tk{stroke:#efe6d080;stroke-width:1.2;stroke-linecap:round}.compass .sh{fill:#efe6d01f;stroke:#efe6d0;stroke-width:1.3}
.compass .sl{stroke:#efe6d0a6;stroke-width:1.2;stroke-linecap:round}.compass .mk{fill:#ffb02e}`;
    host.append(css, b);
    let drag: { a: number; x: number; y: number; moved: number; rim: boolean } | null = null;
    const at = (e: PointerEvent) => { const r = b.getBoundingClientRect(), x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2; return { a: Math.atan2(y, x), d: Math.hypot(x, y) }; };
    b.addEventListener('pointerdown', (e) => {
      b.setPointerCapture(e.pointerId);
      const p = at(e);
      drag = { a: p.a, x: e.clientX, y: e.clientY, moved: 0, rim: p.d > 13 };
      this.spin = 0;
      this.spinLog = [];
      e.stopPropagation();
    });
    b.addEventListener('pointermove', (e) => {
      if (!drag) return;
      const p = at(e), dx = e.clientX - drag.x, da = wrapA(p.a - drag.a);
      drag.moved += Math.abs(dx) + Math.abs(e.clientY - drag.y);
      drag.a = p.a; drag.x = e.clientX; drag.y = e.clientY;
      if (drag.moved <= 4) return;
      // Grabbed by the rim, the map follows the hand round the dial (held close to the middle, where a
      // pixel is a big jump in angle, it pauses). Grabbed in the middle, it is a slider: right is clockwise.
      this.turn(drag.rim ? (p.d > 8 ? da : 0) : dx * 0.01);
    });
    b.addEventListener('pointerup', () => { const tap = drag && drag.moved <= 4; drag = null; if (tap) this.orbitTo(0, PITCH); else this.fling(); });
    b.addEventListener('pointercancel', () => { drag = null; this.spinLog = []; });
    b.addEventListener('click', (e) => { if (e.detail === 0) this.orbitTo(0, PITCH); });
    b.addEventListener('keydown', (e) => {
      const step = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] }[e.key];
      if (!step) return;
      e.preventDefault();
      e.stopPropagation(); // arrows here turn the map, not the chapter
      const base = this.orbit ?? { yaw: this.yaw, pitch: this.pitch };
      this.orbitTo(base.yaw + step[0] * (Math.PI / 12), base.pitch + step[1] * 4);
    });
    this.compass = b;
    // two quick turns above the dial: to the next 45° step either way
    const turns = document.createElement('div');
    turns.className = 'turns';
    // a small arc with its head on the turning end; mirrored for anticlockwise
    const arrow = (cw: boolean) => `<svg viewBox="0 0 16 10" aria-hidden="true"><g${cw ? '' : ' transform="translate(16 0) scale(-1 1)"'}><path d="M2.5 8.2C3.6 4.2 7.4 2.2 11.6 3.6" class="ta"/><path d="M9.4 1.2 12.4 3.8 9.6 6.6" class="ta"/></g></svg>`;
    for (const cw of [false, true]) {
      const t = document.createElement('button');
      t.type = 'button';
      t.className = 'turn-step';
      t.title = cw ? 'Turn 45° clockwise' : 'Turn 45° anticlockwise';
      t.setAttribute('aria-label', t.title);
      t.innerHTML = `${arrow(cw)}<span>${cw ? '+' : '−'}45°</span>`;
      t.addEventListener('pointerdown', (e) => e.stopPropagation());
      t.addEventListener('click', (e) => {
        e.stopPropagation();
        const q = Math.PI / 4, base = this.orbit ?? { yaw: this.yaw, pitch: this.pitch };
        const k = base.yaw / q;
        this.orbitTo((cw ? Math.floor(k + 1e-3) + 1 : Math.ceil(k - 1e-3) - 1) * q, base.pitch);
      });
      turns.append(t);
    }
    css.textContent += `.turns{position:absolute;z-index:6;width:46px;display:flex;flex-direction:column;border-radius:16px;border:1px solid #ffffff2e;background:#101218d9;overflow:hidden;
  visibility:hidden;opacity:0;transform:translateY(6px);transition:opacity .35s,transform .35s,visibility 0s .35s}
.turns.on{visibility:visible;opacity:1;transform:none;transition-delay:0s}
.turn-step{height:40px;padding:0;border:0;background:none;color:#efe6d0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;cursor:pointer;
  font:600 10.5px/1 Inter,system-ui,sans-serif;font-variant-numeric:tabular-nums;letter-spacing:.01em}
.turn-step+.turn-step{border-top:1px solid #ffffff1f}
.turn-step:hover{background:#ffffff12}.turn-step:active{background:#ffffff1f}.turn-step:focus-visible{outline:2px solid #ffb02e;outline-offset:-2px}
.turn-step svg{width:16px;height:10px}.turn-step .ta{fill:none;stroke:#ffb02e;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}`;
    host.append(turns);
    this.turns = turns;
  }

  /** Decorative WebGL layer, present only while tilted (and while it fades out). */
  private deco: Tangle3D | null = null;
  private decoLoading = false;
  private fogMask: HTMLCanvasElement | null = null;
  private fogKey = 0;

  private wide = false;

  selectedId() { return this.selected; }

  select(id: string | null) {
    this.selected = id;
    this.svg.querySelectorAll('.sel').forEach((e) => e.classList.remove('sel'));
    if (id) this.svg.querySelectorAll(`[data-id="${CSS.escape(id)}"]`).forEach((e) => e.classList.add('sel'));
    this.onSelected(id);
  }
  /** Told whenever the selection changes, for anything outside the map that mirrors it. */
  onSelected: (id: string | null) => void = () => {};

  /** Swap in a new chapter's knowledge. `instant` skips the fog animation. */
  setBundle(b: Bundle, instant = false) {
    const first = !this.bundle;
    this.forward = !this.bundle || b.ch >= this.bundle.ch;
    const soft = !(first || instant || this.still || document.hidden);
    this.dropGhosts();
    const old = soft ? this.parts() : null;
    const oldIds = new Set([...this.svg.querySelectorAll('[data-id]')].map((e) => e.getAttribute('data-id')!));
    const oldRel = this.relevantIds ?? new Set<string>();
    this.bundle = b;
    if (first) {
      // fetch the 3D layer once the app is up and the browser is idle, so the first tilt doesn't wait
      const idle = window.requestIdleCallback ?? ((f: () => void) => setTimeout(f, 2500));
      idle(() => import('./tangle3d.ts').catch(() => {}), { timeout: 6000 });
    }
    this.render();
    this.svg.classList.toggle('back', !this.forward);
    if (old) this.blend(old, oldIds, oldRel);
    this.maskOld = this.snapshotMask();
    this.maskNew = this.drawMask(b);
    if (!soft || !this.maskOld) this.maskT = 1;
    else {
      this.maskT = 0;
      this.maskStart = -1;
    }
    this.select(this.selected && this.find(this.selected) ? this.selected : null);
    this.paint(performance.now());
  }

  // The drawing is rebuilt from scratch for each chapter, then compared piece by piece
  // with the one it replaces. Pieces in both stay exactly as they are. New pieces fade in.
  // Pieces that are gone are kept on a layer of their own just long enough to fade out.
  // (Fading the whole old drawing into the whole new one showed everything double.)
  private ghosts: SVGSVGElement[] = [];
  private fade: { start: number; dur: number } | null = null;

  /** The pieces of the drawing that can come and go on their own. */
  private parts(): Element[] {
    return [...this.svg.children].flatMap((c) =>
      c.classList.contains('line') ? [...c.children].filter((x) => !x.classList.contains('hit')) : c.tagName === 'defs' || c.tagName === 'rect' ? [] : [c]);
  }

  private static key(e: Element): string {
    const cls = (e.getAttribute('class') ?? '').split(' ')[0];
    const fixed = cls === 'st' || cls === 'ring' || cls === 'core';
    return [e.tagName, cls, e.getAttribute('data-id') ?? e.getAttribute('data-trail') ?? '', fixed ? '' : e.getAttribute('transform') ?? '', e.getAttribute('d') ?? '', e.getAttribute('stroke') ?? '', e.tagName === 'path' ? e.getAttribute('style') ?? '' : ''].join('|');
  }

  private blend(old: Element[], oldIds: Set<string>, oldRel: Set<string>) {
    const b = this.bundle!, key = TangleMap.key;
    const fresh = this.parts();
    const oldKeys = new Set(old.map(key)), newKeys = new Set(fresh.map(key));
    // when the trip is about to be replayed, the group simply stays put and then moves
    const carry = b.hops.some((h) => h.at === b.ch) && old.some((e) => e.classList.contains('party'));
    const party = (e: Element) => carry && e.classList.contains('party');
    for (const e of fresh) if (!oldKeys.has(key(e)) && !party(e)) e.classList.add('enter');
    // spotlight: something that was dimmed and no longer is (or the reverse) eases over
    const rel = this.relevantIds ?? new Set<string>();
    for (const e of this.svg.querySelectorAll('.line[data-id], .ring[data-id], .st[data-id]')) {
      const id = e.getAttribute('data-id')!;
      if (oldIds.has(id) && oldRel.has(id) !== rel.has(id)) e.classList.add(rel.has(id) ? 'from-dim' : 'from-lit');
    }
    const gone = old.filter((e) => !newKeys.has(key(e)) && !party(e));
    if (!gone.length) return;
    const NS = 'http://www.w3.org/2000/svg';
    const g = document.createElementNS(NS, 'svg') as SVGSVGElement;
    g.setAttribute('class', `${this.svg.getAttribute('class') ?? ''} ghost`);
    g.setAttribute('aria-hidden', 'true');
    const lines = document.createElementNS(NS, 'g');
    lines.setAttribute('class', 'line rel');
    g.append(lines);
    for (const e of gone) (e.parentElement ? lines : g).append(e);
    g.querySelectorAll('[data-id], [data-person]').forEach((e) => { e.removeAttribute('data-id'); e.removeAttribute('data-person'); });
    this.svg.after(g);
    this.ghosts = [g];
    this.fade = { start: -1, dur: this.forward ? 500 : 800 };
  }

  private dropGhosts() {
    this.fade = null;
    this.ghosts.forEach((g) => g.remove());
    this.ghosts = [];
  }

  /** Where the party is as of the current bundle. */
  partyAt(): [number, number] | null {
    const h = this.bundle?.hops.at(-1);
    return h ? [h.pts[h.pts.length - 2], h.pts[h.pts.length - 1]] : null;
  }

  /** Frame this chapter's journey, if the party moved. Returns false if it did not. */
  fitChapter(instant = false): boolean {
    const b = this.bundle;
    const hops = b?.hops.filter((h) => h.at === b.ch) ?? [];
    if (!hops.length) return false;
    const xs: number[] = [], ys: number[] = [];
    for (const h of hops) for (let i = 0; i < h.pts.length; i += 2) { xs.push(h.pts[i]); ys.push(h.pts[i + 1]); }
    const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    const span = Math.max(760, (x1 - x0) * 1.35 + 360, (y1 - y0) * 1.35 + 360);
    this.flyTo({ x: (x0 + x1) / 2, y: (y0 + y1) / 2, z: this.zFor(span) }, instant);
    return true;
  }

  /** Who is travelling with the party as of this bundle. */
  private crew(who?: string[]): Person[] {
    const b = this.bundle!;
    const all = who ? b.people.filter((p) => who.includes(p.id)) : b.people.filter((p) => p.status?.state === 'party' && !p.base);
    return all.sort((p, q) => +(q.group === 'party') - +(p.group === 'party'));
  }

  private vehicle(via: string | undefined): Vehicle | null {
    if (!via || via === 'foot' || via === 'jump') return null;
    const l = this.bundle!.lines.find((x) => x.id === via);
    return l ? { name: l.name, color: l.color } : { name: '', color: '#6f6b62' };
  }

  /**
   * The path one hop is drawn along. A ride on a named train follows that train's
   * drawn route, so the party is seen travelling on the line and not beside it.
   */
  private hopPath(h: { via: string; pts: number[] }): { d: string; onLine: boolean } {
    if (h.pts.length > 4) return { d: poly(h.pts), onLine: true };
    const near = (ax: number, ay: number, bx: number, by: number) => Math.abs(ax - bx) < 2 && Math.abs(ay - by) < 2;
    const [x1, y1, x2, y2] = h.pts;
    for (const leg of this.bundle!.lines.find((l) => l.id === h.via)?.legs ?? []) {
      const n = leg.pts.length / 2;
      let a = -1, z = -1;
      for (let i = 0; i < n; i++) {
        if (near(leg.pts[i * 2], leg.pts[i * 2 + 1], x1, y1)) a = i;
        if (near(leg.pts[i * 2], leg.pts[i * 2 + 1], x2, y2)) z = i;
      }
      if (a < 0 || z < 0 || a === z) continue;
      // on a loop, go the shorter way round
      const fwd = leg.closed ? (((z - a) % n) + n) % n : z - a;
      const steps = leg.closed ? (fwd <= n - fwd ? fwd : fwd - n) : fwd;
      const d = section(leg.pts, leg.closed, a, steps);
      if (d) return { d, onLine: true };
    }
    return { d: arc(h.pts), onLine: false };
  }

  /** The travelling group: faces in a row, inside a train car when they are riding. */
  private crewSvg(people: Person[], car: Vehicle | null, caption = ''): string {
    const shown = people.length > 4 ? people.slice(0, 3) : people;
    const more = people.length - shown.length;
    const n = shown.length + (more ? 1 : 0), step = 29, w = Math.max(1, n - 1) * step + 50;
    const x = (i: number) => (i - (n - 1) / 2) * step;
    const bubs = shown.map((p, i) => `<g class="bub" data-person="${p.id}" transform="translate(${x(i)} 0)"><circle r="18.5" class="bub-ring"/><g transform="scale(.567)" clip-path="url(#avc)">${face(p)}</g></g>`).reverse().join('');
    const plus = more ? `<g class="bub bub-more" transform="translate(${x(n - 1)} 0)"><circle r="18.5" class="bub-ring"/><circle r="17" class="bub-fill"/><text y="5" class="bub-n">+${more}</text></g>` : '';
    const wheels = `<circle cx="${-w / 2 + 20}" cy="24" r="5.5" class="wheel"/><circle cx="${w / 2 - 20}" cy="24" r="5.5" class="wheel"/>`;
    return `<circle r="22" class="pulse"/><circle r="22" class="pulse p2"/><path d="M0-8V-38" class="stem"/><circle r="7" class="core"/>
      <g class="crew${car ? ' car' : ''}" data-who="${people.map((p) => p.id).join(' ')}" transform="translate(0 -64)"${car ? ` style="--c:${car.color}"` : ''}>${wheels}<rect class="hull" x="${-w / 2}" y="-25" width="${w}" height="50" rx="25"/>${plus}${bubs}</g><g class="cap-slot" data-cap="${esc(caption)}">${this.capSvg(car, caption)}</g>`;
  }

  private capSvg(car: Vehicle | null, caption: string): string {
    if (!caption) return '';
    const cw = caption.length * 7.6 + 22;
    return `<g class="cap" transform="translate(0 -104)"><rect x="${-cw / 2}" y="-13" width="${cw}" height="26" rx="13"${car ? ` style="fill:${car.color}"` : ''}/><text y="5"${car && dark(car.color) ? ' class="on-dark"' : ''}>${esc(caption)}</text></g>`;
  }

  /** Change how the group is drawn. The same people keep their elements, so the car can ease in and out around them. */
  private dress(mk: SVGGElement, people: Person[], car: Vehicle | null, caption: string) {
    const crew = mk.querySelector<SVGGElement>('.crew'), slot = mk.querySelector<SVGGElement>('.cap-slot');
    if (!crew || !slot || crew.dataset.who !== people.map((p) => p.id).join(' ')) { mk.innerHTML = this.crewSvg(people, car, caption); return; }
    crew.classList.toggle('car', !!car);
    if (car) crew.style.setProperty('--c', car.color);
    if (slot.dataset.cap !== caption) { slot.dataset.cap = caption; slot.innerHTML = this.capSvg(car, caption); }
  }

  /** Play this chapter's travel: get on, ride, get off, one leg at a time. */
  play() {
    const b = this.bundle;
    const party = this.svg.querySelector<SVGGElement>('.party');
    const legs = [...this.svg.querySelectorAll<SVGPathElement>('path.now[data-leg]')];
    if (!b || !party || !legs.length || this.still || document.hidden) return;
    const mk = party.querySelector<SVGGElement>('.mk')!;
    const glow = this.svg.querySelector<SVGPathElement>('.now-glow');
    const hops = b.hops.filter((h) => h.at === b.ch);
    const home = party.getAttribute('transform')!;
    const kNow = b.chapters.find((k) => k.n === b.ch);
    const restCar = this.vehicle(kNow?.aboard);
    const id = ++this.playId;
    const lens = legs.map((p) => p.getTotalLength());
    const evs = [...this.svg.querySelectorAll<SVGGElement>('.ev')];
    const show = (leg: number, kind: string) => evs.filter((e) => e.dataset.leg === String(leg) && e.classList.contains(`ev-${kind}`)).forEach((e) => e.classList.remove('pending'));
    const at = (p: { x: number; y: number }) => party.setAttribute('transform', `translate(${p.x} ${p.y})`);
    const dress = (h: typeof hops[number], riding: boolean, caption: string) => this.dress(mk, this.crew(h.who), riding ? this.vehicle(h.via) : null, caption);
    const riding = (v: Vehicle | null) => (v ? `Riding${v.name ? ` · ${v.name}` : ''}` : '');
    type Step = { ms: number; start?: () => void; tick?: (e: number) => void };
    const steps: Step[] = [];
    hops.forEach((h, i) => {
      const v = this.vehicle(h.via);
      // the opening pose is set below, before anything is drawn; this just holds it while the map settles
      if (i === 0) steps.push({ ms: 900 });
      if (h.board) steps.push({ ms: 1000, start: () => { dress(h, true, `Gets on${v?.name ? ` · ${v.name}` : ''}`); show(i, 'on'); } });
      steps.push({
        ms: clamp(650 + lens[i] * 0.9, 900, 2400),
        start: () => dress(h, !!v, v ? riding(v) : h.via === 'foot' ? 'On foot' : ''),
        tick: (e) => { at(legs[i].getPointAtLength(lens[i] * e)); legs[i].style.strokeDashoffset = `${lens[i] * (1 - e)}`; },
      });
      if (h.off) steps.push({ ms: 1000, start: () => { dress(h, false, 'Gets off'); show(i, 'off'); } });
    });
    // Opening pose, set now so the first thing drawn is the group where the chapter starts
    // and not, for one flash, where it ends.
    legs.forEach((p, i) => { p.style.strokeDasharray = `${lens[i]}`; p.style.strokeDashoffset = `${lens[i]}`; });
    evs.forEach((e) => e.classList.add('pending'));
    glow?.classList.add('pending');
    party.classList.add('moving');
    at(legs[0].getPointAtLength(0));
    const v0 = this.vehicle(hops[0].via), on0 = !!v0 && !hops[0].board;
    dress(hops[0], on0, on0 ? riding(v0) : '');
    let k = -1, t0 = 0;
    const done = () => {
      party.classList.remove('moving');
      party.setAttribute('transform', home);
      this.dress(mk, this.crew(), restCar, riding(restCar));
      legs.forEach((p) => { p.style.strokeDasharray = ''; p.style.strokeDashoffset = ''; });
      evs.forEach((e) => e.classList.remove('pending'));
      glow?.classList.remove('pending');
    };
    const frame = (now: number) => {
      if (id !== this.playId || !party.isConnected) return;
      if (k < 0 || now - t0 >= steps[k].ms) {
        if (k >= 0) steps[k].tick?.(1);
        if (++k >= steps.length) return done();
        t0 = now;
        steps[k].start?.();
      }
      steps[k].tick?.(ease(clamp((now - t0) / steps[k].ms, 0, 1)));
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }
  private playId = 0;

  focusOn(id: string | undefined, instant = false) {
    const b = this.bundle;
    if (!b) return;
    const st = id ? b.stations.find((s) => s.id === id) : undefined;
    const p = st?.xy ?? this.partyAt();
    if (!p) return this.flyTo({ x: 0, y: -900, z: this.zFor(1500) }, instant);
    const big = st?.kind === 'core' || st?.kind === 'depot';
    this.flyTo({ x: p[0], y: p[1], z: this.zFor(big ? 1300 : 820) }, instant);
  }

  fitAll(instant = false) {
    const b = this.bundle;
    if (!b) return;
    const xs: number[] = [], ys: number[] = [];
    const add = (pts: number[]) => { for (let i = 0; i < pts.length; i += 2) { xs.push(pts[i]); ys.push(pts[i + 1]); } };
    b.stations.forEach((s) => s.xy && add(s.xy));
    b.lines.forEach((l) => { l.segs.forEach((s) => add(s.pts)); l.legs.forEach((g) => add(g.pts)); });
    if (!xs.length) return this.flyTo({ x: 0, y: -900, z: this.zFor(1500) }, instant);
    const x0 = Math.min(...xs) - 330, x1 = Math.max(...xs) + 330, y0 = Math.min(...ys) - 200, y1 = Math.max(...ys) + 200;
    const w = this.W - this.pad.left - this.pad.right, h = this.H - this.pad.top - this.pad.bottom;
    const z = clamp(Math.min(w / (x1 - x0), h / (y1 - y0)), this.zMin(), 1.1);
    this.flyTo({ x: (x0 + x1) / 2, y: (y0 + y1) / 2, z }, instant);
  }

  zoomBy(f: number) {
    this.flyTo({ ...this.cam, z: clamp(this.cam.z * f, this.zMin(), 2.4) }, false, 260);
  }

  // ── camera ─────────────────────────────────────────────────────────

  private zMin() { return Math.max(0.05, Math.min(this.W, this.H) / 5200); }
  private zFor(span: number) {
    const w = this.W - this.pad.left - this.pad.right, h = this.H - this.pad.top - this.pad.bottom;
    return clamp(Math.min(w, h) / span, this.zMin(), 2.4);
  }
  private shift(): [number, number] {
    const p = this.padCur ?? this.pad;
    const x = (p.left - p.right) / 2, y = (p.top - p.bottom) / 2;
    if (!this.yaw) return [x, y];
    // the free space is on screen, so the offset turns back against the map's turn
    const c = Math.cos(-this.yaw), s = Math.sin(-this.yaw);
    return [x * c - y * s, x * s + y * c];
  }

  private flyTo(to: { x: number; y: number; z: number }, instant = false, dur = 1100) {
    if (instant || this.still || document.hidden) {
      this.cam = { ...to };
      this.fly = null;
      this.paint(performance.now());
    } else this.fly = { from: { ...this.cam }, to, start: -1, dur };
    this.dirty = true;
  }

  private resize() {
    const r = this.stage.getBoundingClientRect();
    this.W = r.width;
    this.H = r.height;
    // Flat, the drawing is exactly the size of the window. Tilted, it has to reach
    // past the edges, so it is a larger square; that costs more to draw, so only then.
    const big = Math.ceil(Math.max(this.W, this.H) * 1.55);
    this.BW = this.wide ? big : Math.ceil(this.W);
    this.BH = this.wide ? big : Math.ceil(this.H);
    Object.assign(this.board.style, {
      width: `${this.BW}px`, height: `${this.BH}px`,
      left: `${(this.W - this.BW) / 2}px`, top: `${(this.H - this.BH) / 2}px`,
    });
    const k = this.wide ? 0.6 : Math.min(1, 1500 / Math.max(this.BW, this.BH));
    this.fog.width = Math.max(1, Math.round(this.BW * k));
    this.fog.height = Math.max(1, Math.round(this.BH * k));
    this.paint(performance.now());
  }

  private bind() {
    const el = this.stage;
    const zoomAt = (cx: number, cy: number, f: number) => {
      const [wx, wy] = this.toMap(cx, cy);
      const z = clamp(this.cam.z * f, this.zMin(), 2.4);
      const k = this.cam.z / z;
      this.cam = { x: wx + (this.cam.x - wx) * k, y: wy + (this.cam.y - wy) * k, z };
      this.fly = null;
      this.dirty = true;
    };
    let turning = false;
    el.addEventListener('contextmenu', (e) => { if (this.tilt) e.preventDefault(); });
    el.addEventListener('pointerdown', (e) => {
      el.setPointerCapture(e.pointerId);
      this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      this.moved = 0;
      this.fly = null;
      this.spin = 0; // a hand on the map stops a flick
      // tilted: right-drag, or drag with Shift or Alt, turns and leans the map
      turning = this.tilt && (e.button === 2 || e.shiftKey || e.altKey);
    });
    el.addEventListener('pointermove', (e) => {
      const p = this.pointers.get(e.pointerId);
      if (!p) return;
      const all = [...this.pointers.values()];
      if (all.length === 1) {
        const dx = e.clientX - p.x, dy = e.clientY - p.y;
        this.moved += Math.abs(dx) + Math.abs(dy);
        if (turning) this.turn(dx * 0.006, -dy * 0.15);
        else {
          // keep the point that was grabbed under the pointer (exact at any lean and turn)
          const [ax, ay] = this.toMap(p.x, p.y), [bx, by] = this.toMap(e.clientX, e.clientY);
          this.cam.x += ax - bx;
          this.cam.y += ay - by;
        }
      } else if (all.length === 2) {
        const o = all.find((q) => q !== p)!;
        const before = Math.hypot(p.x - o.x, p.y - o.y), after = Math.hypot(e.clientX - o.x, e.clientY - o.y);
        if (before > 0) zoomAt((e.clientX + o.x) / 2, (e.clientY + o.y) / 2, after / before);
        // two-finger twist turns the tilted map
        if (this.tilt) this.turn(Math.atan2(e.clientY - o.y, e.clientX - o.x) - Math.atan2(p.y - o.y, p.x - o.x));
        this.moved += 10;
      }
      p.x = e.clientX;
      p.y = e.clientY;
      this.cam.x = clamp(this.cam.x, -WORLD, WORLD);
      this.cam.y = clamp(this.cam.y, -WORLD, WORLD);
      this.dirty = true;
    });
    const up = (e: PointerEvent) => {
      const had = this.pointers.delete(e.pointerId);
      if (had && this.pointers.size === 0 && this.moved >= 8) this.fling();
      if (had && this.moved < 8 && this.pointers.size === 0) {
        const el0 = document.elementFromPoint(e.clientX, e.clientY) as Element | null;
        const who = el0?.closest('[data-person]');
        if (who) return this.onPerson(who.getAttribute('data-person')!);
        const trail = el0?.closest('[data-trail]');
        if (trail) return this.onTrail(+trail.getAttribute('data-trail')!);
        const hit = el0?.closest('[data-id]');
        this.onSelect(hit ? hit.getAttribute('data-id') : null);
      }
    };
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    el.addEventListener('wheel', (e) => {
      e.preventDefault();
      zoomAt(e.clientX, e.clientY, Math.exp(-e.deltaY * (e.ctrlKey ? 0.012 : 0.0016)));
    }, { passive: false });
  }

  // ── drawing ────────────────────────────────────────────────────────

  private find(id: string) {
    const b = this.bundle!;
    return b.stations.find((s) => s.id === id) ?? b.lines.find((l) => l.id === id);
  }

  private render() {
    const b = this.bundle!;
    const ch = b.ch;
    const o: string[] = [];
    const rel = this.relevant();
    this.relevantIds = rel;
    const on = (id: string) => (rel.has(id) ? ' rel' : '');
    o.push(`<defs>
      <pattern id="grid" width="300" height="300" patternUnits="userSpaceOnUse"><path d="M300 0H0V300" class="grid"/></pattern>
      <radialGradient id="g1"><stop offset="0" stop-color="#fff6cf"/><stop offset=".28" stop-color="#ffb02e"/><stop offset=".6" stop-color="#d9480f"/><stop offset=".88" stop-color="#5c1206"/><stop offset="1" stop-color="#1b0705"/></radialGradient>
      <clipPath id="avc"><circle r="30"/></clipPath>
    </defs>`);
    o.push(`<rect x="-3200" y="-3200" width="6400" height="6400" class="paper"/><rect x="-3200" y="-3200" width="6400" height="6400" fill="url(#grid)"/>`);

    // rings: station numbers shared by every coloured line
    for (const s of b.stations) {
      if (!s.ring) continue;
      o.push(`<g class="ring k-${s.kind}${on(s.id)}" data-id="${s.id}"><circle r="${s.ring}" class="ring-hit"/><circle r="${s.ring}" class="ring-line"/>`);
      for (const deg of s.kind === 'endline' ? [200] : [8, 128, 248]) {
        const a = ((deg - 90) * Math.PI) / 180;
        o.push(`<g transform="translate(${Math.round(s.ring * Math.cos(a))} ${Math.round(s.ring * Math.sin(a))})"><g class="mk"><text class="ring-lbl">${s.num}</text></g></g>`);
      }
      o.push(`</g>`);
    }

    // lines
    const lineSvg: string[] = [];
    for (const l of b.lines) {
      const g: string[] = [];
      // a stretch that a longer charted stretch already covers is not drawn twice (two dotted paths out of step read as a smear)
      const charted = l.segs.filter((s) => s.mode === 'charted');
      const onPath = (x: number, y: number, pts: number[]) => {
        for (let i = 0; i + 3 < pts.length; i += 2) {
          const ax = pts[i], ay = pts[i + 1], dx = pts[i + 2] - ax, dy = pts[i + 3] - ay;
          const t = clamp(((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy || 1), 0, 1);
          if (Math.hypot(ax + dx * t - x, ay + dy * t - y) < 14) return true;
        }
        return false;
      };
      const span = (q: number[]) => { let d = 0; for (let i = 2; i < q.length; i += 2) d += Math.hypot(q[i] - q[i - 2], q[i + 1] - q[i - 1]); return d; };
      const shown = charted.filter((s, i) => !charted.some((o, j) => j !== i && (span(o.pts) > span(s.pts) || (span(o.pts) === span(s.pts) && j < i))
        && onPath(s.pts[0], s.pts[1], o.pts) && onPath(s.pts[s.pts.length - 2], s.pts[s.pts.length - 1], o.pts)));
      for (const s of shown) {
        // an end the reader doesn't know the continuation of tapers away instead of stopping dead
        const n = s.pts.length / 2, k = Math.min(10, Math.floor(n / 3));
        const [fa, fb] = s.fade ?? [false, false];
        const a = fa ? k : 0, z = fb ? n - 1 - k : n - 1;
        // every piece continues the dot rhythm of the whole stretch
        const cum = [0];
        for (let i = 1; i < n; i++) cum.push(cum[i - 1] + Math.hypot(s.pts[i * 2] - s.pts[i * 2 - 2], s.pts[i * 2 + 1] - s.pts[i * 2 - 1]));
        const off = (i: number) => `stroke-dashoffset:${Math.round(cum[i])}px`;
        g.push(`<path d="${poly(s.pts.slice(a * 2, (z + 1) * 2))}" class="chart" stroke="${l.color}" style="${off(a)}"/>`);
        for (let i = 0; i < k; i++) {
          const op = ((i + 1) / (k + 1)).toFixed(2);
          if (fa) g.push(`<path d="${poly(s.pts.slice(i * 2, (i + 2) * 2))}" class="chart" stroke="${l.color}" style="--o:calc(${op} * 0.8);${off(i)}"/>`);
          if (fb) g.push(`<path d="${poly(s.pts.slice((n - 2 - i) * 2, (n - i) * 2))}" class="chart" stroke="${l.color}" style="--o:calc(${op} * 0.8);${off(n - 2 - i)}"/>`);
        }
      }
      for (const s of l.segs.filter((s) => s.mode === 'ridden')) {
        g.push(`<path d="${poly(s.pts)}" class="case"/><path d="${poly(s.pts)}" class="ride${s.at === ch ? ' fresh' : ''}" stroke="${l.color}"/>`);
      }
      for (const leg of l.legs) {
        const d = spline(leg.pts, leg.closed);
        if (d) g.push(`<path d="${d}" class="case thin"/><path d="${d}" class="leg k-${l.kind}" stroke="${l.color}"/><path d="${d}" class="ties"/>`);
      }
      const hit = [...l.segs.map((s) => poly(s.pts)), ...l.legs.map((x) => spline(x.pts, x.closed))].filter(Boolean)
        .map((d) => `<path d="${d}" class="hit"/>`).join('');
      if (g.length) lineSvg.push(`<g class="line${on(l.id)}" data-id="${l.id}">${g.join('')}${hit}</g>`);
    }
    o.push(lineSvg.join(''));

    // the party's route off the lines, and this chapter's movement
    // (a hop along a named train's own route follows that route, which is already drawn and can be tapped)
    b.hops.forEach((h, i) => {
      const hp = this.hopPath(h);
      if (h.pts.length <= 4 && !hp.onLine) o.push(`<g class="trail-g" data-trail="${i}"><path d="${hp.d}" class="trail v-${h.via}"/><path d="${hp.d}" class="hit"/></g>`);
    });
    const nowD = b.hops.filter((h) => h.at === ch).map((h) => this.hopPath(h).d).join('');
    const legsNow = b.hops.filter((h) => h.at === ch);
    if (nowD) o.push(`<path d="${nowD}" class="now-glow"/>` + legsNow.map((h, i) => `<path d="${this.hopPath(h).d}" class="now" data-leg="${i}"/>`).join(''));

    // a large feature drawn as a glowing disc
    const pit = b.stations.find((s) => s.kind === 'core');
    if (pit?.xy) {
      const dots = Array.from({ length: 32 }, (_, i) => {
        const a = (i / 32) * Math.PI * 2;
        return `<circle cx="${Math.round(118 * Math.cos(a))}" cy="${Math.round(118 * Math.sin(a))}" r="5" class="core-dot"/>`;
      }).join('');
      o.push(`<g class="core" data-id="${pit.id}" transform="translate(${pit.xy[0]} ${pit.xy[1]})"><circle r="134" class="core-rim"/><circle r="104" fill="url(#g1)" class="core-fill"/>${dots}</g>`);
    }

    // stations
    for (const s of b.stations) {
      if (!s.xy) continue;
      const left = s.xy[0] < -40;
      o.push(`<g class="st k-${s.kind}${on(s.id)}${s.since === ch ? ' new' : ''}${left ? ' left' : ''}" data-id="${s.id}" transform="translate(${s.xy[0]} ${s.xy[1]})"><g class="mk"><circle r="30" class="halo"/>${marker(s)}${label(s)}</g></g>`);
    }

    // where this chapter's travellers got on and off
    legsNow.forEach((h, i) => {
      const v = this.vehicle(h.via);
      if (!v) return;
      const n = h.pts.length;
      if (h.board) o.push(`<g class="ev ev-on" data-leg="${i}" transform="translate(${h.pts[0]} ${h.pts[1]})"><g class="mk"><g transform="translate(-27 -27)"><circle r="12" style="fill:${v.color}"/><path d="M0 6V-5M-4.5-1 0-5.5 4.5-1" class="${dark(v.color) ? 'on-dark' : ''}"/></g></g></g>`);
      if (h.off) o.push(`<g class="ev ev-off" data-leg="${i}" transform="translate(${h.pts[n - 2]} ${h.pts[n - 1]})"><g class="mk"><g transform="translate(27 -27)"><circle r="12" style="stroke:${v.color}"/><path d="M0-6V5M-4.5 1 0 5.5 4.5 1"/></g></g></g>`);
    });

    const kNow = b.chapters.find((k) => k.n === ch);
    const pAt = this.partyAt(), vNow = this.vehicle(kNow?.aboard);
    if (kNow?.boarded && pAt && vNow) o.push(`<g class="ev ev-on" data-leg="-1" transform="translate(${pAt[0]} ${pAt[1]})"><g class="mk"><g transform="translate(-27 -27)"><circle r="12" style="fill:${vNow.color}"/><path d="M0 6V-5M-4.5-1 0-5.5 4.5-1" class="${dark(vNow.color) ? 'on-dark' : ''}"/></g></g></g>`);

    // people last seen somewhere else, recently enough to still mean something
    const seenAt = new Map<string, Person[]>();
    for (const p of b.people) {
      const st = p.status;
      if (st?.state === 'away' && st.stn && ch - st.at <= 4) seenAt.set(st.stn, [...(seenAt.get(st.stn) ?? []), p]);
    }
    for (const [stn, ps] of seenAt) {
      const xy = b.stations.find((x) => x.id === stn)?.xy;
      if (!xy) continue;
      const shown = ps.length > 3 ? ps.slice(0, 2) : ps, more = ps.length - shown.length, n = shown.length + (more ? 1 : 0);
      const x = (i: number) => (i - (n - 1) / 2) * 22;
      o.push(`<g class="away" transform="translate(${xy[0]} ${xy[1]})"><g class="mk"><g transform="translate(0 44)">`
        + (more ? `<g class="bub bub-more" transform="translate(${x(n - 1)} 0)"><circle r="13.5" class="bub-ring"/><circle r="12" class="bub-fill"/><text y="4" class="bub-n">+${more}</text></g>` : '')
        + shown.map((p, i) => `<g class="bub" data-person="${p.id}" transform="translate(${x(i)} 0)"><circle r="13.5" class="bub-ring"/><g transform="scale(.4)" clip-path="url(#avc)">${face(p)}</g></g>`).reverse().join('')
        + `</g></g></g>`);
    }

    // you are here
    const at = this.partyAt();
    if (at) {
      const car = this.vehicle(b.chapters.find((k) => k.n === ch)?.aboard);
      o.push(`<g class="party" transform="translate(${at[0]} ${at[1]})"><g class="mk">${this.crewSvg(this.crew(), car, car ? `Riding${car.name ? ` · ${car.name}` : ''}` : '')}</g></g>`);
    }

    this.svg.innerHTML = o.join('');
    this.lastLayoutZ = 0;

    // a second deck, drawn only when the bundle carries the rule that unlocks it
    const twin = b.rules.some((r) => r.id === 'shape');
    this.stage.classList.toggle('has-under', twin);
    this.under.innerHTML = twin
      ? b.lines.flatMap((l) => l.segs.filter((s) => s.mode === 'charted' || s.mode === 'ridden').map((s) => `<path d="${poly(s.pts)}" class="deck2"/>`)).join('')
        + b.stations.filter((s) => s.ring && s.kind === 'stairwell').map((s) => `<circle r="${s.ring}" class="deck2-ring"/>`).join('')
      : '';
  }

  /** The fog mask as it stands right now: a true blend of the old and new ones while a change is under way. */
  private mixed(): HTMLCanvasElement | null {
    const e = ease(this.maskT);
    if (e >= 1 || !this.maskOld || !this.maskNew) return this.maskNew;
    const cv = (this.mix ??= Object.assign(document.createElement('canvas'), { width: MASK, height: MASK }));
    const c = cv.getContext('2d')!;
    c.globalCompositeOperation = 'source-over';
    c.clearRect(0, 0, MASK, MASK);
    c.globalAlpha = 1 - e;
    c.drawImage(this.maskOld, 0, 0);
    c.globalCompositeOperation = 'lighter';
    c.globalAlpha = e;
    c.drawImage(this.maskNew, 0, 0);
    return cv;
  }
  private mix: HTMLCanvasElement | null = null;

  /** A copy of the mask as it stands, to fade away from. */
  private snapshotMask(): HTMLCanvasElement | null {
    const m = this.mixed();
    if (!m) return null;
    const cv = Object.assign(document.createElement('canvas'), { width: MASK, height: MASK });
    cv.getContext('2d')!.drawImage(m, 0, 0);
    return cv;
  }

  /** A low-resolution picture of where the fog has lifted. White = clear. */
  private drawMask(b: Bundle): HTMLCanvasElement {
    const mk = () => Object.assign(document.createElement('canvas'), { width: MASK, height: MASK });
    // The whole book read (the epilogue position): the fog lifts in one wide circle round the
    // middle, well past everything drawn, with a soft rim, so no straight edge of the paper shows.
    if (b.ch >= b.total) {
      const cv = mk(), c = cv.getContext('2d')!, k = MASK / (WORLD * 2), r0 = 2120 * k, r1 = 2340 * k;
      const g = c.createRadialGradient(MASK / 2, MASK / 2, r0, MASK / 2, MASK / 2, r1);
      g.addColorStop(0, '#fff');
      g.addColorStop(1, 'rgb(255 255 255 / 0)');
      c.fillStyle = g;
      c.beginPath();
      c.arc(MASK / 2, MASK / 2, r1, 0, Math.PI * 2);
      c.fill();
      return cv;
    }
    const k = MASK / (WORLD * 2);
    // Shapes are drawn far off-canvas and only their blurred shadow lands on it,
    // which gives a soft Gaussian edge in every browser.
    const FAR = 4000;
    const layer = (draw: (c: CanvasRenderingContext2D) => void) => {
      const cv = mk(), c = cv.getContext('2d')!;
      c.setTransform(k, 0, 0, k, MASK / 2 - FAR, MASK / 2);
      c.shadowColor = '#fff';
      c.shadowBlur = MASK / 28;
      c.shadowOffsetX = FAR;
      c.strokeStyle = c.fillStyle = '#fff';
      c.lineCap = c.lineJoin = 'round';
      draw(c);
      return cv;
    };
    const stroke = (c: CanvasRenderingContext2D, pts: number[], w: number) => {
      if (pts.length < 4) return;
      c.lineWidth = w;
      c.beginPath();
      for (let i = 0; i < pts.length; i += 2) i ? c.lineTo(pts[i], pts[i + 1]) : c.moveTo(pts[i], pts[i + 1]);
      c.stroke();
    };
    const strong = layer((c) => {
      for (const l of b.lines) for (const s of l.segs) if (s.mode === 'ridden') stroke(c, s.pts, 250);
      for (const h of b.hops) stroke(c, h.pts, 150);
      for (const s of b.stations) {
        if (!s.xy) continue;
        const r = s.kind === 'core' ? 330 : s.kind === 'depot' ? 230 : s.notes.length > 1 || s.kind === 'transfer' ? 200 : 150;
        c.beginPath();
        c.arc(s.xy[0], s.xy[1], r, 0, Math.PI * 2);
        c.fill();
      }
    });
    const weak = layer((c) => {
      for (const l of b.lines) {
        for (const s of l.segs) if (s.mode === 'charted') stroke(c, s.pts, 120);
        for (const g of l.legs) {
          const path = new Path2D(spline(g.pts, g.closed));
          c.lineWidth = 120;
          c.stroke(path);
        }
      }
      // rings only show through the fog once the middle of the map is known
      if (b.stations.some((s) => s.kind === 'core')) for (const s of b.stations) {
        if (!s.ring) continue;
        c.lineWidth = 46;
        c.beginPath();
        c.arc(0, 0, s.ring, 0, Math.PI * 2);
        c.stroke();
      }
    });
    const out = mk(), oc = out.getContext('2d')!;
    oc.globalAlpha = 0.6;
    oc.drawImage(weak, 0, 0);
    oc.globalAlpha = 1;
    oc.drawImage(strong, 0, 0);
    return out;
  }

  private makeNoise(): HTMLCanvasElement {
    const N = 256;
    const cv = Object.assign(document.createElement('canvas'), { width: N, height: N });
    const c = cv.getContext('2d')!;
    const img = c.createImageData(N, N);
    // tileable value noise, four octaves
    const grid = (g: number) => Array.from({ length: g * g }, () => Math.random());
    const octs = [4, 8, 16, 32].map((g) => ({ g, v: grid(g) }));
    const sm = (t: number) => t * t * (3 - 2 * t);
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      let v = 0, amp = 0.5;
      for (const { g, v: vals } of octs) {
        const fx = (x / N) * g, fy = (y / N) * g;
        const x0 = Math.floor(fx), y0 = Math.floor(fy), tx = sm(fx - x0), ty = sm(fy - y0);
        const at = (i: number, j: number) => vals[((j + g) % g) * g + ((i + g) % g)];
        v += amp * ((at(x0, y0) * (1 - tx) + at(x0 + 1, y0) * tx) * (1 - ty) + (at(x0, y0 + 1) * (1 - tx) + at(x0 + 1, y0 + 1) * tx) * ty);
        amp *= 0.5;
      }
      const i = (y * N + x) * 4;
      img.data[i] = 150; img.data[i + 1] = 158; img.data[i + 2] = 178;
      img.data[i + 3] = Math.round(clamp((v - 0.42) * 2.4, 0, 1) * 70);
    }
    c.putImageData(img, 0, 0);
    return cv;
  }

  private frame(now: number) {
    requestAnimationFrame((t) => this.frame(t));
    if (document.hidden) return;
    if (this.fly) {
      if (this.fly.start < 0) this.fly.start = now;
      const t = clamp((now - this.fly.start) / this.fly.dur, 0, 1), e = ease(t);
      const { from, to } = this.fly;
      // interpolate zoom geometrically so long flights feel even
      this.cam = { x: from.x + (to.x - from.x) * e, y: from.y + (to.y - from.y) * e, z: from.z * Math.pow(to.z / from.z, e) };
      if (t >= 1) this.fly = null;
      this.dirty = true;
    }
    if (this.tiltAnim) {
      const a = this.tiltAnim;
      if (a.start < 0) a.start = now;
      const t = clamp((now - a.start) / TILT_MS, 0, 1), e = lean(t);
      this.tiltP = a.from + (a.to - a.from) * e;
      // going back to flat also turns the map back to its starting angle, in the same move
      if (a.to === 0) { this.yaw = a.yaw0 * (1 - e); this.pitch = a.pitch0 + (PITCH - a.pitch0) * e; }
      if (t >= 1) { this.tiltP = a.to; this.tiltAnim = null; if (a.to === 0) this.settleFlat(); }
      this.dirty = true;
    }
    const dt = this.orbitT ? clamp(now - this.orbitT, 0, 64) : 16;
    this.orbitT = now;
    if (this.spin) {
      const o = (this.orbit ??= { yaw: this.yaw, pitch: this.pitch });
      o.yaw += this.spin * dt;
      this.spin *= Math.exp(-dt / 300);
      if (Math.abs(this.spin) < 3e-5) this.spin = 0;
    }
    if (this.orbit) {
      // time-based easing, so it feels the same at 60 Hz and 120 Hz
      const o = this.orbit, k = 1 - Math.exp(-dt / 70);
      this.yaw += (o.yaw - this.yaw) * k;
      this.pitch += (o.pitch - this.pitch) * k;
      if (!this.spin && Math.abs(o.yaw - this.yaw) < 1e-3 && Math.abs(o.pitch - this.pitch) < 0.05) { this.yaw = wrapA(o.yaw); this.pitch = o.pitch; this.orbit = null; }
      this.dirty = true;
    }
    if (this.fade) {
      if (this.fade.start < 0) this.fade.start = now;
      const t = clamp((now - this.fade.start) / this.fade.dur, 0, 1);
      if (t >= 1) this.dropGhosts();
      else for (const g of this.ghosts) g.style.opacity = (1 - t * t * (3 - 2 * t)).toFixed(3);
    }
    if (this.maskT < 1) {
      if (this.maskStart < 0) this.maskStart = now;
      this.maskT = clamp((now - this.maskStart) / (this.forward ? 1900 : 1500), 0, 1);
      this.dirty = true;
    }
    if (this.padCur) {
      let moving = false;
      for (const k of ['left', 'right', 'top', 'bottom'] as const) {
        const d = this.pad[k] - this.padCur[k];
        if (Math.abs(d) > 0.5) { this.padCur[k] += this.still ? d : d * 0.16; moving = true; } else this.padCur[k] = this.pad[k];
      }
      if (moving) this.dirty = true;
    }
    const drift = !this.still && now - this.lastFrame > 50;
    if (this.dirty || drift) {
      this.lastFrame = now;
      this.paint(now);
    }
    this.drawDeco(now);
  }

  /** Draw immediately. Also called outside the frame loop so a background tab is never left stale. */
  private paint(now: number) {
    if (!this.W || !(this.cam.z > 0)) return;
    this.applyTilt();
    this.applyCamera();
    this.drawFog(now);
    this.dirty = false;
    // the 3D layer draws the fog while tilted, so it must change in the same moment as the map
    this.drawDeco(now);
  }

  /** How clear the fog is at a map point right now (0 fogged, 1 clear), blend included. Read on the CPU, for things drawn above the fog. */
  private fogClear = (wx: number, wy: number): number => {
    const px = (cv: HTMLCanvasElement | null) => {
      if (!cv) return null;
      let d = this.maskPix.get(cv);
      if (!d) { d = cv.getContext('2d')!.getImageData(0, 0, MASK, MASK).data; this.maskPix.set(cv, d); }
      return d;
    };
    const i = Math.round(((wx + WORLD) / (WORLD * 2)) * MASK), j = Math.round(((wy + WORLD) / (WORLD * 2)) * MASK);
    if (i < 0 || j < 0 || i >= MASK || j >= MASK) return 0;
    const k = (j * MASK + i) * 4 + 3, n = px(this.maskNew);
    if (!n) return 0;
    const e = ease(this.maskT), o = e < 1 ? px(this.maskOld) : null;
    return Math.min(1, ((o ? o[k] * (1 - e) : 0) + n[k] * (o ? e : 1)) / 255);
  };
  private maskPix = new WeakMap<HTMLCanvasElement, Uint8ClampedArray>();

  private drawDeco(now: number) {
    if (this.deco && !this.deco.frame(now, {
      W: this.W, H: this.H, BW: this.BW, BH: this.BH, cam: this.cam, shift: this.shift(),
      mask: this.fogMask, maskKey: this.fogKey, bundle: this.bundle, tilt: this.tilt, still: this.still,
      M: this.M, p: this.tiltP, noise: this.noise, time: this.still ? 0 : now / 1000, fogClear: this.fogClear,
    })) this.deco = null;
  }

  /**
   * Place station labels so they don't collide. Each label tries eight spots
   * around its marker, most important stations first; a label with nowhere to
   * go is hidden until hovered, unless it is one the reader needs.
   */
  private layoutLabels() {
    const b = this.bundle;
    if (!b) return;
    const ms = clamp(0.66 / this.cam.z, 0.9, this.cam.z < 0.3 ? 2.3 : 3.2);
    this.lastLayoutZ = this.cam.z;
    const rel = this.relevantIds ?? new Set<string>();
    const partyAt = b.hops.at(-1)?.to;
    const groups = [...this.svg.querySelectorAll<SVGGElement>('g.st')];
    type Box = [number, number, number, number];
    const boxes: Box[] = [];
    const hit = (a: Box) => boxes.some((c) => a[0] < c[2] && a[2] > c[0] && a[1] < c[3] && a[3] > c[1]);
    // the travelling group and anyone standing at a station are obstacles
    const pa = this.partyAt();
    if (pa) boxes.push([pa[0] - 80 * ms, pa[1] - 120 * ms, pa[0] + 80 * ms, pa[1] - 36 * ms]);
    for (const g of this.svg.querySelectorAll<SVGGElement>('g.away')) {
      const m = /translate\(([-\d.]+) ([-\d.]+)\)/.exec(g.getAttribute('transform') ?? '');
      if (m) boxes.push([+m[1] - 40 * ms, +m[2] + 28 * ms, +m[1] + 40 * ms, +m[2] + 60 * ms]);
    }
    // markers are obstacles too
    const info = groups.map((g) => {
      const st = b.stations.find((s) => s.id === g.dataset.id)!;
      const [x, y] = st.xy!;
      const r = (st.kind === 'core' ? 140 : 18) * (st.kind === 'core' ? 1 : ms);
      boxes.push([x - r, y - r, x + r, y + r]);
      const text = g.querySelector<SVGTextElement>('text.lbl');
      const rank = st.id === partyAt ? 0 : rel.has(st.id) ? 1 : st.kind === 'transfer' || st.kind === 'stairwell' || st.kind === 'depot' ? 2 : 3;
      return { g, st, x, y, text, rank };
    });
    const spots: [number, number, 'start' | 'end' | 'middle'][] = [
      [26, 8, 'start'], [-26, 8, 'end'], [0, -26, 'middle'], [0, 44, 'middle'],
      [20, -18, 'start'], [20, 36, 'start'], [-20, -18, 'end'], [-20, 36, 'end'],
    ];
    const spot = this.stage.classList.contains('spot');
    for (const it of info.sort((p, q) => p.rank - q.rank)) {
      const t = it.text;
      if (!t || it.st.kind === 'core') continue;
      if (spot && it.rank > 1) { t.classList.remove('lbl-hidden'); continue; } // the spotlight already hides these
      const w = (t.textContent ?? '').length * 12.6 + 6, h = 26;
      let placed = false;
      // a label keeps the spot it had if that is still free, so labels don't hop about between chapters
      const pref = this.spotOf.get(it.st.id);
      const order = spots.map((_, i) => i);
      if (pref != null) { order.splice(pref, 1); order.unshift(pref); }
      for (const si of order) {
        const [dx, dy, anchor] = spots[si];
        const x0 = anchor === 'start' ? dx : anchor === 'end' ? dx - w : dx - w / 2;
        const box: Box = [it.x + x0 * ms, it.y + (dy - 20) * ms, it.x + (x0 + w) * ms, it.y + (dy - 20 + h) * ms];
        if (!hit(box)) {
          boxes.push(box);
          this.spotOf.set(it.st.id, si);
          t.style.transform = `translate(${dx}px, ${dy}px)`;
          t.style.textAnchor = anchor;
          t.classList.remove('lbl-hidden');
          placed = true;
          break;
        }
      }
      if (!placed) {
        t.style.transform = 'translate(26px, 8px)';
        t.style.textAnchor = 'start';
        t.classList.toggle('lbl-hidden', it.rank > 1);
      }
    }
  }
  private spotOf = new Map<string, number>();
  private lastLayoutZ = 0;
  private relevantIds: Set<string> | null = null;

  private applyCamera() {
    const { x, y, z } = this.cam;
    const [sx, sy] = this.shift();
    const vb = `${x - (sx + this.BW / 2) / z} ${y - (sy + this.BH / 2) / z} ${this.BW / z} ${this.BH / z}`;
    this.under.setAttribute('viewBox', vb);
    for (const el of [this.svg, ...this.ghosts]) {
      el.setAttribute('viewBox', vb);
      el.style.setProperty('--ms', String(clamp(0.66 / z, 0.9, z < 0.3 ? 2.3 : 3.2)));
      el.classList.toggle('far', z < 0.2);
      el.classList.toggle('mid', z < 0.34);
    }
    if (!this.lastLayoutZ || Math.abs(Math.log(z / this.lastLayoutZ)) > 0.08) this.layoutLabels();
  }

  private drawFog(now: number) {
    const c = this.fx, px = this.fog.width, py = this.fog.height;
    const s = px / this.BW; // canvas pixels per CSS pixel
    const { x, y, z } = this.cam;
    const [sx, sy] = this.shift();
    c.globalCompositeOperation = 'source-over';
    c.globalAlpha = 1;
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.fillStyle = '#0b0c10';
    c.fillRect(0, 0, px, py);
    // two drifting layers of cloud, moving with the map
    const t = this.still ? 0 : now / 1000;
    for (const [scale, vx, vy, a] of [[3.2, 5, 2, 1], [5.5, -3, 4, 0.7]] as const) {
      const pat = c.createPattern(this.noise, 'repeat')!;
      const zz = z * s * scale;
      pat.setTransform(new DOMMatrix([zz, 0, 0, zz, (px / 2 + sx * s) - x * z * s + t * vx * zz, (py / 2 + sy * s) - y * z * s + t * vy * zz]));
      c.globalAlpha = a;
      c.fillStyle = pat;
      c.fillRect(0, 0, px, py);
    }
    // punch out what is known
    c.globalCompositeOperation = 'destination-out';
    const size = WORLD * 2 * z * s;
    const ox = px / 2 + sx * s - (x + WORLD) * z * s, oy = py / 2 + sy * s - (y + WORLD) * z * s;
    c.imageSmoothingQuality = 'high';
    const m = this.mixed();
    if (m !== this.fogMask || this.maskT < 1) this.fogKey++;
    this.fogMask = m;
    c.globalAlpha = 1;
    if (m) c.drawImage(m, ox, oy, size, size);
    c.globalAlpha = 1;
    c.globalCompositeOperation = 'source-over';
  }
}

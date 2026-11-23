/**
 * Build-time geometry. Positions are computed here and shipped inside each
 * chapter bundle, so the browser never holds coordinates for places the
 * reader has not reached.
 *
 * The layout is a schematic: the only "real" coordinate is the station
 * number, mapped to distance from the centre. Angles are our own.
 */
import type { Line, Station } from '../content/types.ts';

export const RIM = 1700;
const CORE = 300;
const ARMS = 16;
const TWIST = 300; // degrees of spiral from rim to centre

/**
 * Like any transit diagram, distance is distorted so that the stations the
 * story visits have room to breathe. Radius is interpolated between these
 * anchor numbers; every gap gets at least a marker's width.
 */
const ANCHORS = [10, 11, 12, 24, 36, 41, 48, 59, 60, 72, 75, 81, 82, 83, 84, 89, 101, 116, 131, 149, 199, 271, 275, 281, 283, 432, 433, 434, 435, 436];
const GAPS = ANCHORS.slice(1).map((n, i) => Math.min(170, Math.max(36, 18 * Math.sqrt(n - ANCHORS[i]))));
const TOTAL = GAPS.reduce((a, b) => a + b, 0);
const CUM = GAPS.reduce<number[]>((acc, g) => [...acc, acc[acc.length - 1] + g], [0]);

/** 0 at the rim (station 10), 1 at station 436. */
const s = (n: number): number => {
  const c = Math.min(436, Math.max(10, n));
  let i = ANCHORS.findIndex((a) => a >= c);
  if (i <= 0) return 0;
  const a0 = ANCHORS[i - 1], a1 = ANCHORS[i];
  return (CUM[i - 1] + ((c - a0) / (a1 - a0)) * GAPS[i - 1]) / TOTAL;
};

/** Distance from the centre for a station number. */
export function radius(n: number): number {
  return RIM - (RIM - CORE) * s(n);
}

export function armDeg(line: Line, n: number): number {
  let d = (line.arm ?? 0) * (360 / ARMS) + TWIST * s(n);
  for (const k of line.kiss ?? []) d += k.deg * Math.exp(-Math.pow((s(n) - s(k.n)) / 0.035, 2));
  return d;
}

export type XY = [number, number];
export function polar(r: number, deg: number): XY {
  const a = ((deg - 90) * Math.PI) / 180;
  return [Math.round(r * Math.cos(a)), Math.round(r * Math.sin(a))];
}

export function onLine(line: Line, n: number, off = 0): XY {
  return polar(radius(n), armDeg(line, n) + off);
}

/** Points along a line between two station numbers (either order). */
export function along(line: Line, a: number, b: number): number[] {
  const out: number[] = [];
  const dir = a <= b ? 1 : -1;
  const span = Math.abs(b - a);
  const steps = Math.max(1, Math.ceil((Math.abs(s(b) - s(a)) * 1510) / 7));
  for (let i = 0; i <= steps; i++) out.push(...onLine(line, a + (dir * span * i) / steps));
  return out;
}

export function place(st: Station, lines: Line[]): XY {
  const p = st.pos;
  if (!p) throw new Error(`station ${st.id}: has no place on the map`);
  if ('line' in p) {
    const l = lines.find((x) => x.id === p.line);
    if (!l || st.num == null) throw new Error(`station ${st.id}: bad line position`);
    return onLine(l, st.num, p.off ?? 0);
  }
  return polar(p.r ?? radius(st.num ?? 10), p.deg);
}

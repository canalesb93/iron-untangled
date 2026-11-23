/**
 * The living floor: a decorative WebGL layer shown only while the map is tilted.
 *
 * A field of procedural railway strands spirals in toward the map's origin through a
 * thick disc below the paper, with small trains running along them. The strands never
 * move and never change: the field is built once from a fixed seed and is the same at
 * every chapter. Nothing here knows about the book; the only thing read from the chapter
 * bundle is whether it has a feature of kind 'core' (drawn as a pit).
 *
 * Registration: the canvas lies flat over the stage, and every vertex goes through the
 * same chain the browser applies to the SVG: viewBox camera, then the board's transform
 * (handed over by the map, which drives the lean and turn), then the stage's CSS
 * perspective. A point at depth 0 lands on the same pixel as the SVG point there.
 *
 * Fog: while this layer is up it draws the fog itself, lying on the ground: the same mask
 * and the same cloud texture as the flat fog canvas, at the same place, so it hides exactly
 * what the flat fog hides and looks identical to it when flat. A low mist lip at the edges
 * adds depth, but over ground the reader has cleared it is capped at a barely visible veil.
 */
import {
  BufferAttribute, BufferGeometry, BoxGeometry, Camera, CanvasTexture, DataTexture, FloatType, GLSL3,
  InstancedBufferAttribute, InstancedBufferGeometry, LinearFilter, Matrix4, Mesh, NearestFilter, NormalBlending,
  AdditiveBlending, Points, RGBAFormat, Scene, ShaderMaterial, Vector2, Vector3, WebGLRenderer, PlaneGeometry,
  CylinderGeometry, CircleGeometry, DoubleSide, LinearMipmapLinearFilter, RepeatWrapping,
} from 'three';
import type { Bundle } from '../scripts/slice.ts';
import { Upright } from './upright3d.ts';

export interface View3D {
  W: number; H: number; BW: number; BH: number;
  cam: { x: number; y: number; z: number };
  shift: [number, number];
  mask: HTMLCanvasElement | null;
  maskKey: number;
  bundle: Bundle | null;
  tilt: boolean;
  still: boolean;
  /** The board's transform (lean, turn, scale), about its centre. */
  M: DOMMatrix;
  /** How far into the lean, 0 flat to 1 tilted. */
  p: number;
  /** The flat fog's cloud texture, and its clock (seconds), so the drawn fog matches it exactly. */
  noise: HTMLCanvasElement;
  time: number;
  /** How clear the fog is at a map point right now, for the things standing above it. */
  fogClear: (wx: number, wy: number) => number;
}

const U = 256; // samples per path
const NS = 165; // decorative strands
const ROWS = NS;
const WORLD = 2350; // must match map.ts
const PERSPECTIVE = 1500; // must match .stage { perspective } in style.css
const MAX_DPR = 1.5;
/**
 * How many background tracks are out at a reading position: none at 0, a few at the first
 * chapter (the place should feel nearly empty), easing in to all of them by the end.
 * Trains run only on tracks that are out, so they follow the same curve.
 */
export const strandsFor = (ch: number, total: number, all: number) =>
  ch <= 0 ? 0 : Math.round(8 + (all - 8) * Math.pow(Math.min(1, ch / Math.max(1, total)), 2));

const smooth = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

/** Small fast seeded PRNG, so the floor is the same on every load. */
function rng32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
/** Resample a polyline to U points evenly spaced by length. Returns [x,y] pairs and the length. */
function resample(xy: number[]): { pts: Float32Array; len: number } | null {
  const n = xy.length / 2;
  if (n < 2) return null;
  const cum = [0];
  for (let i = 1; i < n; i++) cum.push(cum[i - 1] + Math.hypot(xy[i * 2] - xy[i * 2 - 2], xy[i * 2 + 1] - xy[i * 2 - 1]));
  const len = cum[n - 1];
  if (len < 60) return null;
  const pts = new Float32Array(U * 2);
  let j = 0;
  for (let k = 0; k < U; k++) {
    const s = (k / (U - 1)) * len;
    while (j < n - 2 && cum[j + 1] < s) j++;
    const seg = cum[j + 1] - cum[j] || 1, f = Math.min(1, Math.max(0, (s - cum[j]) / seg));
    pts[k * 2] = xy[j * 2] + (xy[j * 2 + 2] - xy[j * 2]) * f;
    pts[k * 2 + 1] = xy[j * 2 + 1] + (xy[j * 2 + 3] - xy[j * 2 + 1]) * f;
  }
  return { pts, len };
}

/** Corner-cutting smoothing: straight runs with rounded bends, like track. */
function chaikin(xy: number[], times: number): number[] {
  let p = xy;
  for (let t = 0; t < times; t++) {
    const q = [p[0], p[1]];
    for (let i = 0; i < p.length / 2 - 1; i++) {
      const [ax, ay, bx, by] = [p[i * 2], p[i * 2 + 1], p[i * 2 + 2], p[i * 2 + 3]];
      q.push(ax * 0.75 + bx * 0.25, ay * 0.75 + by * 0.25, ax * 0.25 + bx * 0.75, ay * 0.25 + by * 0.75);
    }
    q.push(p[p.length - 2], p[p.length - 1]);
    p = q;
  }
  return p;
}

// ── shaders ─────────────────────────────────────────────────────────────

const COMMON = /* glsl */ `
precision highp float;
precision highp sampler2D;
uniform sampler2D uPath;   // rows of (x, y, depth, arc length); column U holds (rank, unused, tint, closed)
uniform float uStrands;    // how many tracks are out (fractional while one fades in or out)
uniform float uTime;
uniform mat4 uA;           // map coords -> board pixels about its centre (the viewBox camera)
uniform mat4 uPMA;         // map coords -> clip space (viewBox, CSS transform, CSS perspective)
uniform vec2 uHalf;        // half the stage, in CSS px
uniform float uDepth;      // depth scale: 0 flat on the paper, 1 full depth (follows the lean)
const vec3 PAPER = vec3(0.937, 0.902, 0.816);
const float UN = ${U}.;
vec4 texAt(float row, float i) { return texelFetch(uPath, ivec2(int(i), int(row)), 0); }
vec4 meta(float row) { return texAt(row, UN); }
/** How far a track is out: 0 hidden, 1 shown (tracks come out in a fixed order of rank). */
float outAt(float row) { return clamp(uStrands - meta(row).x, 0., 1.); }
/** Point on a path at u in [0,1] (static: the strands never move). w = arc length. */
vec4 along(float row, float u) {
  float f = clamp(u, 0., 1.) * (UN - 1.);
  float i = floor(f);
  vec4 a = mix(texAt(row, i), texAt(row, min(i + 1., UN - 1.)), f - i);
  a.z *= uDepth;
  return a;
}
vec2 toPx(vec4 c) { return c.xy / c.w * uHalf; }
`;

const FOG = /* glsl */ `
uniform sampler2D uMask;
uniform float uHasMask;
uniform vec3 uEye;       // the viewer, in board pixels about its centre
uniform float uFogZ;     // height of the fog sheet above the paper, board px
uniform vec3 uCam;       // map camera x, y, zoom
uniform vec2 uShift;
uniform vec2 uBoard;     // half the board size
uniform float uFade;
const vec3 PAPER = vec3(0.937, 0.902, 0.816);
/** How clear the fog is in front of this point, as the viewer sees it. 0 = hidden. */
float clearAt(vec3 pb) {
  if (uHasMask < 0.5) return 0.;
  float k = (uFogZ - uEye.z) / (pb.z - uEye.z);
  vec2 q = uEye.xy + (pb.xy - uEye.xy) * k;
  if (abs(q.x) > uBoard.x || abs(q.y) > uBoard.y) return 0.;
  vec2 w = (q - uShift) / uCam.z + uCam.xy;
  vec2 uv = (w + ${WORLD}.) / ${WORLD * 2}.;
  if (uv.x < 0. || uv.y < 0. || uv.x > 1. || uv.y > 1.) return 0.;
  return textureLod(uMask, uv, 0.).a;
}
/** Fog mask at a map point; lod > 0 reads a blurred copy. 0 outside the known world. */
float maskAt(vec2 w, float lod) {
  if (uHasMask < 0.5) return 0.;
  vec2 uv = (w + ${WORLD}.) / ${WORLD * 2}.;
  if (uv.x < 0. || uv.y < 0. || uv.x > 1. || uv.y > 1.) return 0.;
  return textureLod(uMask, uv, lod).a;
}
vec2 boardToMap(vec2 q) { return (q - uShift) / uCam.z + uCam.xy; }
`;

const STRAND_VS = COMMON + /* glsl */ `
uniform float uMinPx;
out float vAcross; out float vS; out float vPx; out vec3 vPb; out float vA; out vec3 vCol;
void main() {
  float row = position.x, i = position.y, side = position.z;
  float u = i / (UN - 1.);
  vec4 p = along(row, u);
  vec4 pa = along(row, max(0., u - 1. / (UN - 1.)));
  vec4 pc = along(row, min(1., u + 1. / (UN - 1.)));
  vec2 t = normalize(pc.xy - pa.xy + 1e-4);
  vec2 n = vec2(-t.y, t.x);
  float hw = 6.5;
  vec4 c0 = uPMA * vec4(p.xyz, 1.);
  vec4 c1 = uPMA * vec4(p.xyz + vec3(n * hw, 0.), 1.);
  float px = length(toPx(c1) - toPx(c0));
  float k = max(1., uMinPx * 0.5 / max(px, 1e-3));
  vec3 q = p.xyz + vec3(n * hw * k * side, 0.);
  gl_Position = uPMA * vec4(q, 1.);
  vPb = (uA * vec4(q, 1.)).xyz;
  vAcross = side; vS = p.w; vPx = px * k * 2.;
  // deeper strands read as further under the paper; both ends fade so nothing marks a middle
  float depth = clamp(-texAt(row, i).z / 380., 0., 1.);
  vA = mix(0.2, 0.07, depth) * smoothstep(0., 0.07, u) * smoothstep(1., 0.72, u) * outAt(row);
  vec4 m = meta(row);
  vCol = m.z < 0.5 ? vec3(0.16, 0.13, 0.11) : m.z < 1.5 ? vec3(0.45, 0.22, 0.12) : vec3(0.18, 0.24, 0.32);
  vCol = mix(vCol, vec3(0.42, 0.42, 0.46), depth * 0.5);
}`;

const STRAND_FS = FOG + /* glsl */ `
in float vAcross; in float vS; in float vPx; in vec3 vPb; in float vA; in vec3 vCol;
out vec4 fragColor;
void main() {
  float a = abs(vAcross);
  float aa = 1.6 / max(vPx, 1.);
  float edge = 1. - smoothstep(1. - aa, 1., a);
  // close up: two rails and sleepers; far away: one hairline
  float detail = smoothstep(4., 9., vPx);
  float rails = 1. - smoothstep(0.1, 0.1 + aa * 1.5, abs(a - 0.62));
  float f = fract(vS / 21.);
  float fw = fwidth(vS / 21.);
  // sleepers fade out before they get closer than a few pixels apart (no moiré at a distance)
  float ties = (smoothstep(0.0, fw + 0.02, f) - smoothstep(0.32, 0.32 + fw + 0.02, f)) * step(a, 0.92) * 0.55 * (1. - smoothstep(0.12, 0.3, fw));
  // a hairline covers little, so it is drawn a bit darker to keep the swirl legible from afar
  float cover = mix(edge * 1.5, max(rails, ties), detail);
  float alpha = cover * vA * clearAt(vPb) * uFade;
  if (alpha < 0.003) discard;
  fragColor = vec4(vCol, alpha);
}`;

const TRAIN_VS = COMMON + /* glsl */ `
in vec4 iA;   // row, u0, speed (u per second, signed), offset behind the head (map units)
in vec4 iB;   // path length, car length, width, height
in vec3 iC;   // colour
out vec3 vPb; out vec3 vCol; out float vA; out vec3 vLocal; out vec3 vNormal;
void main() {
  float row = iA.x, L = iB.x, dir = sign(iA.z);
  float closed = meta(row).w;
  float u = fract(iA.y + uTime * iA.z) - dir * iA.w / L;
  float vis = outAt(row);  // a train runs only on a track that is out
  if (closed > 0.5) u = fract(u);
  else {
    vis = step(0., u) * step(u, 1.);
    float e = 160. / L;
    vis *= smoothstep(0., e, u) * smoothstep(0., e, 1. - u);
  }
  float d = 5. / L;
  vec3 p = along(row, u).xyz, p1 = along(row, u - d).xyz, p2 = along(row, u + d).xyz;
  vec3 T = normalize(p2 - p1 + vec3(1e-4, 0., 0.)) * dir;
  vec3 N = normalize(vec3(-T.y, T.x, 0.) + 1e-5);
  vec3 Up = cross(T, N);
  vec3 lp = position * vec3(iB.y, iB.z, iB.w);
  vec3 w = p + T * lp.x + N * lp.y + Up * (lp.z + iB.w * 0.5 + 1.) * max(uDepth, 0.05);
  gl_Position = uPMA * vec4(w, 1.);
  vPb = (uA * vec4(w, 1.)).xyz;
  vec3 nw = normalize(T * normal.x + N * normal.y + Up * normal.z);
  float light = 0.55 + 0.45 * max(0., dot(nw, normalize(vec3(-0.3, -0.5, 0.8))));
  float depth = clamp(-p.z / max(uDepth, 1e-3) / 380., 0., 1.);
  // under the paper: washed toward it, and fainter the deeper they run
  vCol = mix(iC * light, PAPER, 0.3 + 0.45 * depth);
  vA = vis * mix(0.6, 0.18, depth);
  vLocal = position; vNormal = normal;
}`;

const TRAIN_FS = FOG + /* glsl */ `
in vec3 vPb; in vec3 vCol; in float vA; in vec3 vLocal; in vec3 vNormal;
out vec4 fragColor;
void main() {
  float alpha = vA * clearAt(vPb) * uFade;
  if (alpha < 0.01) discard;
  vec3 c = vCol;
  // a pale roof and a row of dark windows
  if (vNormal.z > 0.5) c = mix(c, PAPER, 0.25);
  if (abs(vNormal.y) > 0.5 && vLocal.z > -0.05 && vLocal.z < 0.3 && fract(vLocal.x * 4. + 0.5) < 0.62) c *= 0.55;
  fragColor = vec4(c, alpha);
}`;

const LAMP_VS = COMMON + /* glsl */ `
in vec4 iA; in vec4 iB; in vec3 iC;
uniform float uDpr;
out vec3 vPb; out vec2 vQ; out float vA;
void main() {
  float row = iA.x, L = iB.x, dir = sign(iA.z);
  float closed = meta(row).w;
  float u = fract(iA.y + uTime * iA.z) + dir * (iB.y * 0.5 + 4.) / L;
  float vis = outAt(row);  // a train runs only on a track that is out
  if (closed > 0.5) u = fract(u);
  else { float e = 160. / L; vis = smoothstep(0., e, u) * smoothstep(0., e, 1. - u) * step(u, 1.); }
  vec3 p = along(row, u).xyz + vec3(0., 0., (iB.w * 0.55 + 1.) * uDepth);
  vec4 c = uPMA * vec4(p, 1.);
  float r = max(3., iB.z * 0.9 * length(toPx(uPMA * vec4(p + vec3(1., 0., 0.), 1.)) - toPx(c)));
  gl_Position = c + vec4(position.xy * r / uHalf * c.w, 0., 0.);
  vPb = (uA * vec4(p, 1.)).xyz;
  vQ = position.xy;
  float depth = clamp(-p.z / max(uDepth, 1e-3) / 380., 0., 1.);
  vA = vis * mix(0.55, 0.2, depth);
}`;

const LAMP_FS = FOG + /* glsl */ `
in vec3 vPb; in vec2 vQ; in float vA;
out vec4 fragColor;
void main() {
  float d = length(vQ);
  float g = exp(-d * d * 5.) * 0.55 + (1. - smoothstep(0.08, 0.16, d)) * 0.6;
  float alpha = g * vA * clearAt(vPb) * uFade;
  if (alpha < 0.004) discard;
  fragColor = vec4(vec3(1., 0.8, 0.45), alpha);
}`;

const DUST_VS = COMMON + /* glsl */ `
in vec4 aSeed;
uniform float uDpr;
out vec3 vPb; out float vA;
void main() {
  float t = uTime;
  vec3 p = position + vec3(14. * sin(t * 0.03 + aSeed.x), 14. * cos(t * 0.025 + aSeed.y), 10. * sin(t * 0.05 + aSeed.z));
  p.z *= uDepth;
  gl_Position = uPMA * vec4(p, 1.);
  vPb = (uA * vec4(p, 1.)).xyz;
  gl_PointSize = (1.4 + aSeed.w * 1.8) * uDpr;
  vA = (0.07 + 0.05 * sin(t * 0.2 + aSeed.x * 3.)) * min(1., uStrands / ${NS}.);
}`;

const DUST_FS = FOG + /* glsl */ `
in vec3 vPb; in float vA;
out vec4 fragColor;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float alpha = (1. - smoothstep(0.2, 0.5, d)) * vA * clearAt(vPb) * uFade;
  if (alpha < 0.004) discard;
  fragColor = vec4(0.3, 0.27, 0.24, alpha);
}`;

// The fog, lying on the ground. Index 2 is the base sheet: the flat fog canvas redrawn
// here (same mask, same cloud texture, same clock, same colours), at paper level, with
// opacity 1 - mask: it hides exactly what the flat fog hides, and is identical to it when
// flat. Indexes 0 and 1 are a low mist lip a few tens of map units up, only where the ground
// under the pixel is fogged (over cleared ground it is capped at a barely visible veil).
const STRATA_VS = /* glsl */ `
precision highp float;
uniform mat4 uPM;        // board pixels -> clip space
uniform vec2 uBoard;
uniform vec3 uCam;
uniform float uDepth;
const float H[3] = float[](12., 28., 0.);   // map units above the ground
out vec3 vPb; out float vI; out vec2 vEdge;
void main() {
  int i = int(position.z + 0.5);
  // the base sheet reaches a little past the board, so its edge never shows a seam
  vPb = vec3(position.xy * uBoard * (i == 2 ? 1.03 : 1.), H[i] * uCam.z * uDepth);
  vI = position.z; vEdge = position.xy;
  gl_Position = uPM * vec4(vPb, 1.);
}`;

const STRATA_FS = FOG + /* glsl */ `
uniform sampler2D uNoise;     // the flat fog's own cloud canvas
uniform float uFogT;          // the flat fog's clock, seconds
uniform float uDepth;
in vec3 vPb; in float vI; in vec2 vEdge;
out vec4 fragColor;
vec3 clouds(vec2 w) {
  // exactly the two drifting layers the flat fog paints (see drawFog in map.ts); seen at a
  // grazing angle they would streak, so there they thin out toward the plain fog colour
  vec2 dx = dFdx(w), dy = dFdy(w);
  float l1 = length(dx), l2 = length(dy);
  float calm = 1. - smoothstep(2.2, 5., max(l1, l2) / max(min(l1, l2), 1e-4));
  float a1 = texture(uNoise, (w / 3.2 - uFogT * vec2(5., 2.)) / 256.).a * calm;
  float a2 = texture(uNoise, (w / 5.5 - uFogT * vec2(-3., 4.)) / 256.).a * 0.7 * calm;
  vec3 c = vec3(0.043, 0.047, 0.063), cl = vec3(150., 158., 178.) / 255.;
  c = mix(c, cl, a1);
  return mix(c, cl, a2);
}
void main() {
  float fi = vI;
  vec2 w = boardToMap(vPb.xy);
  if (fi > 1.5) {
    // a hair more fog than the flat sheet: it samples the mask more coarsely, so the edge never sits further out
    float cover = uHasMask < 0.5 ? 1. : 1. - clamp((maskAt(w, 0.) - 0.1) / 0.9, 0., 1.);
    // distance haze: the ground darkens into the fog before it reaches the board's edge, so
    // turning or leaning the map never shows where the drawing ends (only far toward the horizon)
    float rin = min(uBoard.x, uBoard.y);
    cover = max(cover, smoothstep(0.84, 0.97, length(vPb.xy) / rin) * uDepth);
    // and past the paper's edge (only ever in view tilted and far out) the ground is dark too
    cover = max(cover, smoothstep(2850., 3150., max(abs(w.x), abs(w.y))));
    if (cover < 0.002) discard;
    fragColor = vec4(clouds(w), cover);
    return;
  }
  // the lip: thicker over fogged ground near a clearing, rough at the edge, lighter on top
  float fog = 1. - maskAt(w, 1.5 + fi);
  float edge = clamp(fog * (1. - fog) * 4., 0., 1.);
  float n = texture(uNoise, (w / 4.1 + vec2(13., 7.) * fi) / 256.).a * 3.;
  float a = clamp(fog * 0.5 + (n - 0.25) * edge, 0., 1.) * edge * (0.55 - fi * 0.2);
  // capped where the ground under this pixel is cleared, so known ground stays clear
  float k0 = -uEye.z / (vPb.z - uEye.z);
  float seen = maskAt(boardToMap(uEye.xy + (vPb.xy - uEye.xy) * k0), 0.);
  a *= mix(1., 0.04, smoothstep(0.05, 0.5, seen));
  a *= smoothstep(1., 0.94, max(abs(vEdge.x), abs(vEdge.y))) * uFade;
  if (a < 0.003) discard;
  fragColor = vec4(mix(clouds(w), vec3(0.32, 0.34, 0.4), 0.25 + 0.35 * fi), a);
}`;

// A pit where the bundle has a feature of kind 'core': a shaft going down through the
// floor under the glowing disc the map draws. Only the parts seen through the disc's
// opening are drawn (the view ray must pass through the opening at paper level).
const PIT_VS = COMMON + /* glsl */ `
uniform vec3 uCore;      // x, y, radius of the opening (map units)
uniform float uPitDepth;
out vec3 vPb; out float vD; out float vR; out float vAng;
void main() {
  vD = 0.5 - position.y;
  vec3 w = vec3(uCore.xy + position.xz * uCore.z, -vD * uPitDepth * max(uDepth, 0.02));
  vR = length(position.xz); vAng = atan(position.z, position.x);
  gl_Position = uPMA * vec4(w, 1.);
  vPb = (uA * vec4(w, 1.)).xyz;
}`;

const PIT_FS = FOG + /* glsl */ `
uniform vec3 uCore;
uniform float uTime;
uniform float uFloor;
in vec3 vPb; in float vD; in float vR; in float vAng;
out vec4 fragColor;
void main() {
  float k = -uEye.z / (vPb.z - uEye.z);
  vec2 q = uEye.xy + (vPb.xy - uEye.xy) * k;
  float r = length(boardToMap(q) - uCore.xy) / uCore.z;
  if (r > 0.985) discard;
  vec3 ember = vec3(1., 0.42, 0.08), hot = vec3(1., 0.93, 0.7), soot = vec3(0.09, 0.035, 0.025);
  vec3 c;
  if (uFloor > 0.5) {
    c = mix(hot, ember, smoothstep(0., 0.9, vR)) * (0.9 + 0.1 * sin(uTime * 0.7));
  } else {
    float glow = smoothstep(0.02, 0.5, vD);
    c = mix(soot, ember * 0.9, glow);
    // a track spiralling down the shaft, and rings of masonry
    float spiral = fract(vAng / 6.2831853 * 2. + vD * 7.);
    c = mix(c, c * 0.45, smoothstep(0.0, 0.03, spiral) - smoothstep(0.07, 0.1, spiral));
    c *= 0.82 + 0.18 * step(0.5, fract(vD * 22.));
  }
  // softly darken toward the lip, where the paper casts its shadow
  c *= mix(0.55, 1., smoothstep(0.6, 0.95, 1. - r * 0.5 + vD * 0.5));
  fragColor = vec4(c, uFade * clearAt(vPb));
}`;

// ── the layer ───────────────────────────────────────────────────────────

interface Train { row: number; u0: number; speed: number; len: number; cars: number; color: [number, number, number]; size: [number, number, number] }

export class Tangle3D {
  private canvas: HTMLCanvasElement;
  private gl: WebGLRenderer;
  private scene = new Scene();
  private camera = new Camera();
  private pathData = new Float32Array((U + 1) * ROWS * 4);
  private pathTex: DataTexture;
  private maskTex: CanvasTexture | null = null;
  private maskCanvas: HTMLCanvasElement | null = null;
  private maskKey = -1;
  private uniforms: Record<string, { value: unknown }>;
  private trainGeo: InstancedBufferGeometry;
  private lampGeo: InstancedBufferGeometry;
  private decoTrains: Train[] = [];
  private bundle: Bundle | null = null;
  private M = new DOMMatrix();
  private fade = 0;
  private last = 0;
  private lastKey = '';
  private size = '';
  private t0 = performance.now();
  private disposables: { dispose(): void }[] = [];

  /** Returns null if WebGL is not available, so the map simply carries on without it. */
  static create(stage: HTMLElement, svg: SVGSVGElement): Tangle3D | null {
    try { return new Tangle3D(stage, svg); } catch { return null; }
  }

  private stage: HTMLElement;
  private lens = new Float32Array(ROWS);

  private upright: Upright | null = null;
  private svg: SVGSVGElement;
  private pit: Mesh[] = [];

  private constructor(stage: HTMLElement, svg: SVGSVGElement) {
    this.svg = svg;
    this.stage = stage;
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'deck floor3d';
    this.canvas.setAttribute('aria-hidden', 'true');
    this.canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;';
    this.gl = new WebGLRenderer({ canvas: this.canvas, alpha: true, antialias: false, premultipliedAlpha: true, powerPreference: 'low-power' });
    this.gl.setClearColor(0x000000, 0);
    this.gl.setPixelRatio(Math.min(devicePixelRatio || 1, MAX_DPR));
    this.stage.append(this.canvas);
    // if the GPU drops this layer, the flat fog must come straight back (it is the spoiler barrier)
    this.canvas.addEventListener('webglcontextlost', () => { this.stage.classList.remove('fog3d'); this.fogOwned = true; this.lost = true; });

    this.pathTex = new DataTexture(this.pathData, U + 1, ROWS, RGBAFormat, FloatType);
    this.pathTex.minFilter = this.pathTex.magFilter = NearestFilter;
    this.pathTex.generateMipmaps = false;
    this.uniforms = {
      uPath: { value: this.pathTex }, uTime: { value: 0 }, uA: { value: new Matrix4() }, uPMA: { value: new Matrix4() },
      uHalf: { value: new Vector2(1, 1) }, uMask: { value: null }, uHasMask: { value: 0 }, uEye: { value: new Vector3(0, 0, PERSPECTIVE) },
      uFogZ: { value: 0 }, uCam: { value: new Vector3(0, 0, 1) }, uShift: { value: new Vector2() }, uBoard: { value: new Vector2(1, 1) },
      uFade: { value: 0 }, uMinPx: { value: 1.25 }, uDpr: { value: 1 }, uDepth: { value: 0 }, uStrands: { value: 0 },
      uPM: { value: new Matrix4() }, uNoise: { value: null }, uFogT: { value: 0 }, uCore: { value: new Vector3(0, 0, 0) }, uPitDepth: { value: 320 }, uFloor: { value: 0 },
    };

    this.buildStrands();
    this.pathTex.needsUpdate = true; // uploaded once: the strand field never changes
    const mat = (vs: string, fs: string, additive: boolean, depthTest: boolean, depthWrite: boolean) => {
      const m = new ShaderMaterial({ glslVersion: GLSL3, vertexShader: vs, fragmentShader: fs, uniforms: this.uniforms, transparent: true,
        depthTest, depthWrite, blending: additive ? AdditiveBlending : NormalBlending });
      this.disposables.push(m);
      return m;
    };

    // strands: one ribbon per path, positions read from the path texture
    const idx: number[] = [], pos = new Float32Array(NS * U * 2 * 3);
    for (let r = 0; r < NS; r++) for (let i = 0; i < U; i++) {
      const v = (r * U + i) * 2;
      pos.set([r, i, -1, r, i, 1], v * 3);
      if (i < U - 1) idx.push(v, v + 1, v + 2, v + 1, v + 3, v + 2);
    }
    const sg = new BufferGeometry();
    sg.setAttribute('position', new BufferAttribute(pos, 3));
    sg.setIndex(idx);
    this.disposables.push(sg);
    const strands = new Mesh(sg, mat(STRAND_VS, STRAND_FS, false, true, false));
    strands.frustumCulled = false;
    strands.renderOrder = 1;

    // trains: one instanced box per car
    const box = new BoxGeometry(1, 1, 1);
    this.trainGeo = new InstancedBufferGeometry();
    this.trainGeo.index = box.index;
    this.trainGeo.setAttribute('position', box.getAttribute('position'));
    this.trainGeo.setAttribute('normal', box.getAttribute('normal'));
    this.disposables.push(box, this.trainGeo);
    const trains = new Mesh(this.trainGeo, mat(TRAIN_VS, TRAIN_FS, false, true, true));
    trains.frustumCulled = false;
    trains.renderOrder = 0;

    const quad = new PlaneGeometry(2, 2);
    this.lampGeo = new InstancedBufferGeometry();
    this.lampGeo.index = quad.index;
    this.lampGeo.setAttribute('position', quad.getAttribute('position'));
    this.disposables.push(quad, this.lampGeo);
    const lamps = new Mesh(this.lampGeo, mat(LAMP_VS, LAMP_FS, true, false, false));
    lamps.frustumCulled = false;
    lamps.renderOrder = 3;

    // dust motes in the disc
    const rnd = rng32(0x5eed01);
    const ND = 260, dp = new Float32Array(ND * 3), ds = new Float32Array(ND * 4);
    for (let i = 0; i < ND; i++) {
      const r = 200 + Math.sqrt(rnd()) * 2300, a = rnd() * Math.PI * 2;
      dp.set([r * Math.cos(a), r * Math.sin(a), -380 * rnd() + 20], i * 3);
      ds.set([rnd() * 6.28, rnd() * 6.28, rnd() * 6.28, rnd()], i * 4);
    }
    const dg = new BufferGeometry();
    dg.setAttribute('position', new BufferAttribute(dp, 3));
    dg.setAttribute('aSeed', new BufferAttribute(ds, 4));
    this.disposables.push(dg);
    const dust = new Points(dg, mat(DUST_VS, DUST_FS, false, false, false));
    dust.frustumCulled = false;
    dust.renderOrder = 2;

    // the fog: the base sheet on the ground (index 2) first, then the low lip above it
    const fq = new Float32Array(3 * 4 * 3), fi: number[] = [];
    [2, 0, 1].forEach((i, j) => {
      fq.set([-1, -1, i, 1, -1, i, 1, 1, i, -1, 1, i], j * 12);
      fi.push(j * 4, j * 4 + 1, j * 4 + 2, j * 4, j * 4 + 2, j * 4 + 3);
    });
    const fg = new BufferGeometry();
    fg.setAttribute('position', new BufferAttribute(fq, 3));
    fg.setIndex(fi);
    this.disposables.push(fg);
    const strata = new Mesh(fg, mat(STRATA_VS, STRATA_FS, false, false, false));
    (strata.material as ShaderMaterial).side = DoubleSide;
    strata.frustumCulled = false;
    strata.renderOrder = 5;

    // the pit, present only while the bundle has a feature of kind 'core'
    const wall = new CylinderGeometry(1, 1, 1, 72, 1, true);
    const floor = new CircleGeometry(1, 72).rotateX(-Math.PI / 2).translate(0, -0.5, 0);
    this.disposables.push(wall, floor);
    for (const [g, isFloor] of [[wall, 0], [floor, 1]] as const) {
      const m = mat(PIT_VS, PIT_FS, false, false, false);
      m.side = DoubleSide;
      m.uniforms = { ...this.uniforms, uFloor: { value: isFloor } };
      const mesh = new Mesh(g, m);
      mesh.frustumCulled = false;
      mesh.renderOrder = isFloor ? -2 : -1;
      mesh.visible = false;
      this.pit.push(mesh);
    }

    this.scene.add(trains, strands, dust, lamps, strata, ...this.pit);
    this.disposables.push(this.pathTex);
    // compile off the main thread where the browser can, so switching to 3D doesn't hitch
    this.gl.compileAsync(this.scene, this.camera).catch(() => {}).finally(() => { this.ready = true; });
  }
  private ready = false;
  private fogOwned = false;
  private lost = false;

  private buildStrands() {
    const rnd = rng32(0x1a7e5);
    const gauss = () => (rnd() + rnd() + rnd() + rnd() - 2) * 0.87;
    // uneven arms, so the swirl is lopsided rather than a tidy pattern
    const arms = [[0.35, 1], [1.9, 0.7], [3.3, 1.1], [4.4, 0.4], [5.4, 0.75]];
    const total = arms.reduce((s, a) => s + a[1], 0);
    const pick = () => { let x = rnd() * total; for (const [a, w] of arms) { if ((x -= w) <= 0) return a; } return arms[0][0]; };
    for (let row = 0; row < NS; row++) {
      const stray = rnd() < 0.16, counter = rnd() < 0.13;
      const k = (counter ? -1 : 1) * (1.65 + gauss() * 0.38);
      const r0 = 1750 + rnd() * 850, r1 = 150 + Math.pow(rnd(), 1.3) * 850;
      const th0 = stray ? rnd() * Math.PI * 2 : pick() + gauss() * 0.34;
      const m = 9 + Math.floor(rnd() * 7);
      const wob = rnd() * 6.28;
      const coarse: number[] = [];
      for (let j = 0; j <= m; j++) {
        const f = j / m;
        let r = r0 * Math.pow(r1 / r0, f);
        const th = th0 + k * Math.log(r0 / r) + gauss() * 0.05;
        r *= 1 + 0.05 * Math.sin(th * 3 + wob) + gauss() * 0.035;
        const out = r / 2400; // the outskirts lean one way
        coarse.push(r * Math.cos(th) * 1.08 + 150 * out * out, r * Math.sin(th) * 0.93 - 90 * out);
      }
      const rs = resample(chaikin(coarse, 3))!;
      const z0 = -12 - Math.pow(rnd(), 0.8) * 330, z1 = Math.min(-8, Math.max(-370, z0 + gauss() * 130));
      const zb = rnd() * 6.28;
      for (let i = 0; i < U; i++) {
        const u = i / (U - 1), o = (row * (U + 1) + i) * 4;
        this.pathData[o] = rs.pts[i * 2];
        this.pathData[o + 1] = rs.pts[i * 2 + 1];
        this.pathData[o + 2] = z0 + (z1 - z0) * u + 18 * Math.sin(u * 7 + zb); // a fixed slope and sway, never animated
        this.pathData[o + 3] = u * rs.len;
      }
      const tint = rnd() < 0.72 ? 0 : rnd() < 0.6 ? 1 : 2;
      this.pathData.set([10 + rnd() * 34, rnd() * 6.28, tint, 0], (row * (U + 1) + U) * 4);
      this.lens[row] = rs.len;
    }
    // trains on the strands, all heading inward, at their own unhurried speeds
    const palette: [number, number, number][] = [[0.24, 0.22, 0.2], [0.36, 0.31, 0.27], [0.5, 0.24, 0.16], [0.22, 0.28, 0.36], [0.6, 0.55, 0.46]];
    for (let i = 0; i < 90; i++) {
      rnd(); // (was the track; tracks are now given out by rank, see rank())
      // speed is in map units per second until the track is known
      this.decoTrains.push({ row: 0, u0: rnd(), speed: 22 + rnd() * 60, len: 1, cars: 3 + Math.floor(rnd() * 3),
        color: palette[Math.floor(rnd() * palette.length)], size: [30, 10, 7.5] });
    }
  }

  /**
   * The order tracks come out in, fixed for good the first time it is known: the first few are
   * the ones passing nearest the start of the story (the first leg of the first trip in the
   * bundle, the same in every bundle that has one), spread apart from one another; after that,
   * each next track is the one furthest from all those already out, so the field fills evenly.
   */
  private rank(start: [number, number]) {
    const at = (row: number, i: number) => { const o = (row * (U + 1) + i) * 4; return [this.pathData[o], this.pathData[o + 1]]; };
    const near = (row: number) => { let d = Infinity; for (let i = 0; i < U; i += 4) { const [x, y] = at(row, i); d = Math.min(d, Math.hypot(x - start[0], y - start[1])); } return d; };
    const mid = Array.from({ length: NS }, (_, r) => at(r, U >> 1));
    const dist = Array.from({ length: NS }, (_, r) => near(r));
    const order: number[] = [];
    const left = new Set(Array.from({ length: NS }, (_, r) => r));
    const sep = (r: number) => Math.min(...order.map((q) => Math.hypot(mid[r][0] - mid[q][0], mid[r][1] - mid[q][1])), Infinity);
    const take = (r: number) => { order.push(r); left.delete(r); };
    // the nearest track to the start, then three more among the near ones, as far apart as possible
    const close = [...left].sort((a, b) => dist[a] - dist[b]).slice(0, 24);
    take(close[0]);
    while (order.length < 4) take(close.filter((r) => left.has(r)).reduce((a, b) => (sep(b) > sep(a) ? b : a)));
    while (left.size) take([...left].reduce((a, b) => (sep(b) > sep(a) ? b : a)));
    order.forEach((row, k) => { this.pathData[(row * (U + 1) + U) * 4] = k; });
    this.pathTex.needsUpdate = true;
    // trains are spread over the tracks by rank, so they come out with them
    this.decoTrains.forEach((t, i) => {
      const row = order[Math.floor((i * NS) / this.decoTrains.length)];
      t.row = row; t.len = this.lens[row]; t.speed /= this.lens[row];
    });
    this.fillTrains(this.decoTrains);
    this.ranked = true;
  }
  private ranked = false;
  /** The bundle only decides whether there is a pit. The strand field never changes with it. */
  private setBundle(b: Bundle | null) {
    this.bundle = b;
    const h0 = b?.hops[0];
    if (!this.ranked && h0) this.rank([h0.pts[0], h0.pts[1]]);
    // a fingerprint of the tracks' positions, for tests: it must be identical at every chapter
    // (only which tracks are out changes)
    let h = 2166136261;
    const u32 = new Uint32Array(this.pathData.buffer);
    for (let row = 0; row < NS; row++) for (let i = row * (U + 1) * 4, e = i + U * 4; i < e; i++) h = Math.imul(h ^ u32[i], 16777619);
    this.canvas.dataset.floor = (h >>> 0).toString(16);
    // and of the order they come out in, which must not depend on where the reader started
    let r = 2166136261;
    for (let row = 0; row < NS; row++) r = Math.imul(r ^ this.pathData[(row * (U + 1) + U) * 4], 16777619);
    this.canvas.dataset.order = (r >>> 0).toString(16);
  }

  private fillTrains(trains: Train[]) {
    const cars = trains.reduce((s, t) => s + t.cars, 0);
    const A = new Float32Array(cars * 4), B = new Float32Array(cars * 4), C = new Float32Array(cars * 3);
    const lA = new Float32Array(trains.length * 4), lB = new Float32Array(trains.length * 4), lC = new Float32Array(trains.length * 3);
    let k = 0;
    trains.forEach((t, j) => {
      for (let c = 0; c < t.cars; c++, k++) {
        A.set([t.row, t.u0, t.speed, c * (t.size[0] + 6)], k * 4);
        B.set([t.len, ...t.size], k * 4);
        const f = c === 0 ? 0.8 : 1; // the leading car a shade darker
        C.set([t.color[0] * f, t.color[1] * f, t.color[2] * f], k * 3);
      }
      lA.set([t.row, t.u0, t.speed, 0], j * 4);
      lB.set([t.len, ...t.size], j * 4);
    });
    const set = (g: InstancedBufferGeometry, a: Float32Array, b: Float32Array, c: Float32Array, n: number) => {
      g.setAttribute('iA', new InstancedBufferAttribute(a, 4));
      g.setAttribute('iB', new InstancedBufferAttribute(b, 4));
      g.setAttribute('iC', new InstancedBufferAttribute(c, 3));
      g.instanceCount = n;
    };
    set(this.trainGeo, A, B, C, cars);
    set(this.lampGeo, lA, lB, lC, trains.length);
  }

  /** Draw one frame. Returns false once it has faded out and released the GPU, so the map can drop it. */
  frame(now: number, v: View3D): boolean {
    if (!v.W || !v.H || !(v.cam.z > 0)) return true;
    if (v.bundle !== this.bundle) this.setBundle(v.bundle);
    this.M = v.M;
    if (!v.tilt && v.p <= 0) { this.dispose(); return false; }
    if (!this.born && this.ready) this.born = now;
    if (!this.created) this.created = now;
    // the layer comes in gently if it arrives late (first switch, while still loading)
    const arrive = this.born ? Math.min(1, (now - this.born) / 450) : 0;
    const p = v.p;
    this.fade = smooth(0, 0.6, p) * smooth(0, 1, arrive);

    // the tracks (and the trains on them) come out as the book goes on: none at the start, a
    // few early on, all by the end (from the viewed position only; each fades in or out by rank)
    const target = this.ranked ? strandsFor(v.bundle?.ch ?? 0, v.bundle?.total ?? 1, NS) : 0;
    const dtS = this.lastNow ? Math.min(0.1, (now - this.lastNow) / 1000) : 1;
    this.lastNow = now;
    if (this.canvas.dataset.strands !== String(target)) {
      // for tests: tracks out, and trains on them
      this.canvas.dataset.strands = String(target);
      this.canvas.dataset.trains = String(this.decoTrains.filter((_, i) => Math.floor((i * NS) / this.decoTrains.length) < target).length);
    }
    if (v.still || !this.shownSet) { this.shown = target; this.shownSet = true; }
    else if (Math.abs(target - this.shown) > 0.002) {
      // about a second to settle, a little quicker for big jumps
      const step = Math.max(Math.abs(target - this.shown) * (1 - Math.exp(-dtS * 2.6)), dtS * 1.5);
      this.shown += Math.sign(target - this.shown) * Math.min(step, Math.abs(target - this.shown));
    } else this.shown = target;

    const key = [v.W, v.H, v.BW, v.BH, v.cam.x, v.cam.y, v.cam.z, v.shift[0], v.shift[1], v.maskKey, p, arrive, this.shown.toFixed(3), v.M.m11, v.M.m12, v.M.m22, v.M.m23, v.bundle?.ch].join();
    const moved = key !== this.lastKey;
    // things standing up: placed on every camera change, in the same frame as the map
    // they rise once the board has leaned partway (and lie back down on the way out)
    const rise = smooth(0.25, 0.95, p) * smooth(0, 1, (now - this.created) / 450);
    if (moved || rise !== this.lastRise || !this.upright) { this.lastRise = rise; this.placeUpright(v, rise); }
    if (!this.ready || this.lost) return true;
    // camera moves are drawn on the frame they happen, to stay glued to the map; at rest ~30 fps is plenty
    if (v.still ? !moved : !moved && now - this.last < 32) return true;
    this.lastKey = key;
    this.last = now;

    const size = `${v.W}x${v.H}`;
    if (size !== this.size) { this.size = size; this.gl.setSize(v.W, v.H, false); }
    this.updateMask(v);
    if (v.noise !== this.noiseCanvas) {
      this.noiseTex?.dispose();
      this.noiseTex = new CanvasTexture(v.noise);
      this.noiseTex.wrapS = this.noiseTex.wrapT = RepeatWrapping;
      this.noiseTex.minFilter = LinearMipmapLinearFilter;
      this.noiseTex.magFilter = LinearFilter;
      this.noiseTex.anisotropy = Math.min(8, this.gl.capabilities.getMaxAnisotropy());
      this.noiseCanvas = v.noise;
    }

    const u = this.uniforms;
    const { x, y, z } = v.cam, [sx, sy] = v.shift;
    const A = (u.uA.value as Matrix4).set(z, 0, 0, -x * z + sx, 0, z, 0, -y * z + sy, 0, 0, z, 0, 0, 0, 0, 1);
    const M = new Matrix4().fromArray(this.M.toFloat32Array());
    const d = PERSPECTIVE, R = 8000;
    const P = new Matrix4().set(2 / v.W, 0, 0, 0, 0, -2 / v.H, 0, 0, 0, 0, -1 / R, 0, 0, 0, -1 / d, 1);
    (u.uPM.value as Matrix4).multiplyMatrices(P, M);
    (u.uPMA.value as Matrix4).multiplyMatrices(P, M).multiply(A);
    const pit = v.bundle?.stations.find((st) => st.kind === 'core')?.xy;
    (u.uCore.value as Vector3).set(pit?.[0] ?? 0, pit?.[1] ?? 0, 104); // 104 = the glowing disc map.ts draws
    for (const m of this.pit) m.visible = !!pit;
    const eye = this.M.inverse().transformPoint(new DOMPoint(0, 0, d, 1));
    (u.uEye.value as Vector3).set(eye.x / eye.w, eye.y / eye.w, eye.z / eye.w);
    u.uFogZ.value = 0; // the fog lies on the ground
    (u.uCam.value as Vector3).set(x, y, z);
    (u.uShift.value as Vector2).set(sx, sy);
    (u.uBoard.value as Vector2).set(v.BW / 2, v.BH / 2);
    (u.uHalf.value as Vector2).set(v.W / 2, v.H / 2);
    u.uFade.value = this.fade;
    u.uDepth.value = smooth(0, 1, p);
    u.uStrands.value = this.shown;
    const sh = this.shown.toFixed(1);
    if (this.canvas.dataset.shown !== sh) this.canvas.dataset.shown = sh; // for tests: trains out right now
    u.uNoise.value = this.noiseTex;
    u.uFogT.value = v.time;
    u.uDpr.value = this.gl.getPixelRatio();
    // reduced motion: one still picture, the same every time
    u.uTime.value = v.still ? 40 : ((now - this.t0) / 1000 + 40) % 20000;
    this.gl.render(this.scene, this.camera);
    // only now that this layer has drawn the fog itself may the flat fog canvas step aside
    if (!this.fogOwned) { this.fogOwned = true; this.stage.classList.add('fog3d'); }
    return true;
  }
  private born = 0;
  private shown = 0;
  private shownSet = false;
  private lastNow = 0;
  private created = 0;
  private lastRise = -1;
  private noiseTex: CanvasTexture | null = null;
  private noiseCanvas: HTMLCanvasElement | null = null;

  /**
   * Where a map point (on the paper) lands on screen, how much to scale something drawn
   * there, and how the paper itself is drawn there (the local 2x2 map → screen matrix),
   * so a copy can lie flat exactly like the original and rise from there.
   */
  private placeUpright(v: View3D, stand: number) {
    if (!this.upright) this.upright = new Upright(this.stage, this.svg);
    const M = v.M, { x, y, z } = v.cam, [sx, sy] = v.shift, d = PERSPECTIVE;
    const sc = Math.hypot(M.m11, M.m12, M.m13) || 1;
    const at = (wx: number, wy: number) => {
      const p = M.transformPoint(new DOMPoint((wx - x) * z + sx, (wy - y) * z + sy, 0, 1));
      if (p.z >= d - 1) return null;
      const k = d / (d - p.z);
      return { x: v.W / 2 + p.x * k, y: v.H / 2 + p.y * k, k };
    };
    const rin = 0.9 * Math.min(v.BW, v.BH) / 2;
    this.upright.place((wx, wy) => {
      // nothing stands in the distance haze near the board's edge
      if (v.p > 0 && Math.hypot((wx - x) * z + sx, (wy - y) * z + sy) > rin) return null;
      const o = at(wx, wy), ex = at(wx + 1, wy), ey = at(wx, wy + 1);
      if (!o || !ex || !ey) return null;
      return { x: o.x, y: o.y, s: z * o.k * sc, J: [ex.x - o.x, ex.y - o.y, ey.x - o.x, ey.y - o.y], clear: v.fogClear(wx, wy) };
    }, stand);
  }

  private updateMask(v: View3D) {
    const u = this.uniforms;
    if (!v.mask) { u.uHasMask.value = 0; return; }
    if (v.mask !== this.maskCanvas) {
      this.maskTex?.dispose();
      this.maskTex = new CanvasTexture(v.mask);
      this.maskTex.flipY = false;
      this.maskTex.generateMipmaps = true;
      this.maskTex.minFilter = LinearMipmapLinearFilter;
      this.maskTex.magFilter = LinearFilter;
      this.maskCanvas = v.mask;
      this.maskKey = v.maskKey;
    } else if (v.maskKey !== this.maskKey) {
      this.maskTex!.needsUpdate = true;
      this.maskKey = v.maskKey;
    }
    u.uMask.value = this.maskTex;
    u.uHasMask.value = 1;
  }

  dispose() {
    this.stage.classList.remove('fog3d');
    this.upright?.dispose();
    this.noiseTex?.dispose();
    this.disposables.forEach((d) => d.dispose());
    this.maskTex?.dispose();
    this.gl.dispose();
    this.gl.forceContextLoss();
    this.canvas.remove();
  }
}

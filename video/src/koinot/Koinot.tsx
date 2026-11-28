// "Yerdan koinotgacha": one continuous 3D zoom-out drawn on a canvas.
// World units are km, heliocentric (Sun at 0). Camera half-height V (km) grows on a log scale.
import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame} from 'remotion';
import {geoOrthographic, geoPath, geoGraticule10} from 'd3-geo';
import {feature} from 'topojson-client';
import land50 from 'world-atlas/land-50m.json';

export const KOINOT_FRAMES = 1080;
const W = 1080;
const H = 1920;
const CY = H * 0.54;
const LY = 9.4607e12;
const AU = 1.496e8;
const TANF = Math.tan((50 / 2) * Math.PI / 180);
const FOCAL = (H / 2) / TANF;

type V3 = [number, number, number];
const LAND = feature(land50 as any, (land50 as any).objects.land) as any;
const GRAT = geoGraticule10();

// ---------- helpers ----------
const rng = (seed: number) => () => {
  seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const gauss = (r: () => number) => {
  const u = Math.max(1e-9, r());
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r());
};
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const band = (a: number, b: number, c: number, d: number, x: number) => smooth(a, b, x) * (1 - smooth(c, d, x));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerp3 = (a: V3, b: V3, t: number): V3 => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const rotX = (p: V3, a: number): V3 => [p[0], p[1] * Math.cos(a) - p[2] * Math.sin(a), p[1] * Math.sin(a) + p[2] * Math.cos(a)];
const rotZ = (p: V3, a: number): V3 => [p[0] * Math.cos(a) - p[1] * Math.sin(a), p[0] * Math.sin(a) + p[1] * Math.cos(a), p[2]];

// ---------- timeline: frame -> log10(V) ----------
const KEYS: [number, number][] = [
  [0, 4.08], [45, 4.1],          // Yer
  [120, 5.78], [165, 5.8],       // Yer va Oy
  [230, 8.45], [262, 8.47],      // Yer orbitasi
  [330, 9.86], [372, 9.88],      // Quyosh tizimi
  [478, 14.1], [525, 14.12],     // Yaqin yulduzlar
  [665, 17.86], [745, 17.9],     // Somon yo'li
  [865, 19.42], [915, 19.45],     // Mahalliy guruh
  [1010, 22.0], [1080, 22.18],   // Koinot
];
const logV = (f: number) => {
  for (let i = 0; i < KEYS.length - 1; i++) {
    const [f0, v0] = KEYS[i];
    const [f1, v1] = KEYS[i + 1];
    if (f <= f1) return lerp(v0, v1, ease(clamp01((f - f0) / (f1 - f0))));
  }
  return KEYS[KEYS.length - 1][1];
};
const ELEV: [number, number][] = [[4, 18], [8, 26], [10, 34], [14, 28], [16.5, 40], [17.9, 58], [19.45, 30], [22.2, 32]];
const elevAt = (lv: number) => {
  if (lv <= ELEV[0][0]) return ELEV[0][1];
  for (let i = 0; i < ELEV.length - 1; i++) {
    if (lv <= ELEV[i + 1][0]) return lerp(ELEV[i][1], ELEV[i + 1][1], smooth(ELEV[i][0], ELEV[i + 1][0], lv));
  }
  return ELEV[ELEV.length - 1][1];
};

// ---------- the world ----------
const GAL_TILT = (60 * Math.PI) / 180; // galactic plane vs ecliptic
const fromGal = (p: V3): V3 => rotX(p, GAL_TILT);
const EARTH: V3 = [AU * Math.cos(2.2), AU * Math.sin(2.2), 0];
const SUN_GAL_R = 26000 * LY;
const GAL_C: V3 = fromGal([-SUN_GAL_R, 0, 0]);
const PLANETS: {a: number; r: number; c: string; ang: number; name?: string}[] = [
  {a: 0.387, r: 2440, c: '#b5a89a', ang: 0.8},
  {a: 0.723, r: 6052, c: '#e8cf9a', ang: 4.1},
  {a: 1.0, r: 6371, c: '#4fa3ff', ang: 2.2, name: 'YER'},
  {a: 1.524, r: 3390, c: '#d9653b', ang: 5.3},
  {a: 5.203, r: 69911, c: '#d8b48a', ang: 1.2, name: 'YUPITER'},
  {a: 9.537, r: 58232, c: '#e6d29b', ang: 3.4, name: 'SATURN'},
  {a: 19.19, r: 25362, c: '#9fe0e8', ang: 0.2},
  {a: 30.07, r: 24622, c: '#5b7cff', ang: 4.9},
];

// static sky (directions only) for the first stages
const SKY = (() => {
  const r = rng(7);
  return Array.from({length: 1400}, () => {
    const z = r() * 2 - 1, t = r() * Math.PI * 2, s = Math.sqrt(1 - z * z);
    return {d: [s * Math.cos(t), s * Math.sin(t), z] as V3, b: Math.pow(r(), 3), w: r()};
  });
})();

// stars within ~60 ly of the Sun
const NEAR = (() => {
  const r = rng(11);
  const out: {p: V3; b: number; c: string}[] = [];
  const cols = ['#ffd2a1', '#fff4e0', '#ffffff', '#cfe0ff', '#ffb38a'];
  for (let i = 0; i < 2600; i++) {
    const rr = 60 * LY * Math.cbrt(r()), z = r() * 2 - 1, t = r() * Math.PI * 2, s = Math.sqrt(1 - z * z);
    const p: V3 = [rr * s * Math.cos(t), rr * s * Math.sin(t), rr * z];
    if (Math.hypot(...p) < 6 * LY) continue; // keep the closest neighbourhood clear, Alpha Cen is placed by hand
    out.push({p, b: Math.pow(r(), 2.5), c: cols[Math.floor(r() * cols.length)]});
  }
  return out;
})();
const ALPHA_CEN: V3 = [-1.2 * LY, -4.0 * LY, -1.6 * LY]; // 4.37 ly

// galaxy template in its own frame (units: galaxy radius = 1)
const makeGalaxy = (seed: number, n: number, arms: number, bulge: number) => {
  const r = rng(seed);
  const pts: {p: V3; c: number}[] = []; // c: 0 core, 1 arm, 2 nebula, 3 old disk
  const pitch = Math.tan((13 * Math.PI) / 180);
  for (let i = 0; i < n; i++) {
    const k = r();
    if (k < bulge) {
      // bar + bulge
      const x = gauss(r) * 0.09, y = gauss(r) * 0.035, z = gauss(r) * 0.03;
      const a = 0.45;
      pts.push({p: [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a), z], c: 0});
    } else if (k < bulge + 0.18) {
      const rr = -Math.log(1 - r() * 0.98) * 0.3, t = r() * Math.PI * 2;
      pts.push({p: [rr * Math.cos(t), rr * Math.sin(t), gauss(r) * 0.012], c: 3});
    } else {
      const arm = Math.floor(r() * arms);
      const rr = Math.min(1, 0.08 + -Math.log(1 - r() * 0.95) * 0.27);
      const th = Math.log(rr / 0.08) / pitch + (arm * 2 * Math.PI) / arms + gauss(r) * 0.22 * (0.4 + rr);
      const x = rr * Math.cos(th) + gauss(r) * 0.02, y = rr * Math.sin(th) + gauss(r) * 0.02;
      pts.push({p: [x, y, gauss(r) * 0.008], c: r() < 0.04 ? 2 : 1});
    }
  }
  return pts;
};
const MW = makeGalaxy(3, 70000, 4, 0.16);
const SMALL_GAL = makeGalaxy(5, 3500, 2, 0.25);
const MW_R = 52000 * LY;
// rotate the Milky Way template so that the Sun (at 26k ly, phi=0 in our frame) sits between two arms
const MW_ROT = 0.55;

type Gal = {c: V3; R: number; tilt: number; az: number; n: number; hue: [number, number, number]; name?: string; irregular?: boolean};
const LOCAL: Gal[] = [
  {c: lerp3(GAL_C, fromGal([0, 0, 0]), 0), R: 0, tilt: 0, az: 0, n: 0, hue: [1, 1, 1]}, // placeholder for MW centre
  {c: [GAL_C[0] + 2.5e6 * LY * 0.62, GAL_C[1] + 2.5e6 * LY * 0.7, GAL_C[2] + 2.5e6 * LY * 0.35], R: 110000 * LY, tilt: 1.35, az: 0.6, n: 3500, hue: [1, 0.95, 0.9], name: 'ANDROMEDA'},
  {c: [GAL_C[0] + 2.7e6 * LY * 0.5, GAL_C[1] + 2.7e6 * LY * 0.78, GAL_C[2] + 2.7e6 * LY * 0.37], R: 30000 * LY, tilt: 0.9, az: 2.0, n: 1500, hue: [0.85, 0.95, 1.1]},
  {c: lerp3(GAL_C, fromGal([30000 * LY, -150000 * LY, -60000 * LY]), 1), R: 7000 * LY, tilt: 0.5, az: 1, n: 600, hue: [0.9, 0.95, 1.1], irregular: true},
  {c: lerp3(GAL_C, fromGal([10000 * LY, -190000 * LY, -90000 * LY]), 1), R: 3500 * LY, tilt: 0.5, az: 1, n: 350, hue: [0.9, 0.95, 1.1], irregular: true},
];
const DWARFS = (() => {
  const r = rng(21);
  const out: V3[] = [];
  for (let i = 0; i < 40; i++) {
    const host = r() < 0.5 ? LOCAL[0].c : LOCAL[1].c;
    const rr = (0.1 + r() * 0.6) * 1e6 * LY, z = r() * 2 - 1, t = r() * Math.PI * 2, s = Math.sqrt(1 - z * z);
    out.push([host[0] + rr * s * Math.cos(t), host[1] + rr * s * Math.sin(t), host[2] + rr * z]);
  }
  return out;
})();
const LG_C: V3 = lerp3(GAL_C, LOCAL[1].c, 0.5);

// cosmic web: filaments between random nodes, the Local Group sits on one of them
const WEB = (() => {
  const r = rng(99);
  const S = 1.4e9 * LY;
  const nodes: V3[] = [LG_C, [LG_C[0] + 54e6 * LY * 0.8, LG_C[1] - 54e6 * LY * 0.5, LG_C[2] + 54e6 * LY * 0.33]];
  for (let i = 0; i < 110; i++) nodes.push([LG_C[0] + (r() - 0.5) * S, LG_C[1] + (r() - 0.5) * S, LG_C[2] + (r() - 0.5) * S * 0.8]);
  const pts: {p: V3; b: number}[] = [];
  const add = (a: V3, b: V3, n: number, w: number) => {
    for (let i = 0; i < n; i++) {
      const t = r();
      pts.push({p: [lerp(a[0], b[0], t) + gauss(r) * w, lerp(a[1], b[1], t) + gauss(r) * w, lerp(a[2], b[2], t) + gauss(r) * w], b: r()});
    }
  };
  nodes.forEach((a, i) => {
    const near = nodes.map((b, j) => ({j, d: Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])})).filter((x) => x.j !== i).sort((x, y) => x.d - y.d).slice(0, 3);
    near.forEach(({j, d}) => { if (j > i) add(a, nodes[j], Math.floor(d / S * 2200), 16e6 * LY); });
    const rich = i < 2 ? 300 : 40 + Math.floor(r() * 500);
    for (let k = 0; k < rich; k++) { const cw = (4 + r() * 10) * 1e6 * LY; pts.push({p: [a[0] + gauss(r) * cw, a[1] + gauss(r) * cw, a[2] + gauss(r) * cw], b: 0.4 + r() * 0.6}); }
  });
  return pts;
})();

// ---------- camera ----------
type Cam = {m: number[]; T: V3; dist: number; pos: V3};
const makeCam = (lv: number, f: number): Cam => {
  const V = Math.pow(10, lv);
  const dist = V / TANF;
  // target: Earth -> Sun -> galactic centre -> Local Group
  let T = lerp3(EARTH, [0, 0, 0], smooth(5.9, 7.9, lv));
  T = lerp3(T, GAL_C, smooth(15.6, 17.4, lv));
  T = lerp3(T, LG_C, smooth(18.4, 19.4, lv));
  const plane = GAL_TILT * smooth(12.5, 16.0, lv);
  const az = 0.25 + f * 0.0012 + smooth(15, 18, lv) * 0.6;
  const e = (elevAt(lv) * Math.PI) / 180;
  // basis vectors in world coords: start from camera axes in the "plane frame", undo az and plane tilt
  const toWorld = (v: V3) => rotX(rotZ(v, az), plane);
  const r = toWorld([1, 0, 0]);
  const u = toWorld([0, Math.sin(e), Math.cos(e)]);
  const fw = toWorld([0, Math.cos(e), -Math.sin(e)]);
  const pos: V3 = [T[0] - fw[0] * dist, T[1] - fw[1] * dist, T[2] - fw[2] * dist];
  return {m: [...r, ...u, ...fw], T, dist, pos};
};
// returns [x, y, scale(px per km)] or null if behind camera
const proj = (c: Cam, p: V3): [number, number, number] | null => {
  const x = p[0] - c.pos[0], y = p[1] - c.pos[1], z = p[2] - c.pos[2];
  const d = x * c.m[6] + y * c.m[7] + z * c.m[8];
  if (d <= c.dist * 0.02) return null;
  const k = FOCAL / d;
  return [W / 2 + (x * c.m[0] + y * c.m[1] + z * c.m[2]) * k, CY - (x * c.m[3] + y * c.m[4] + z * c.m[5]) * k, k];
};

// ---------- formatting ----------
const fmt = (km: number) => {
  const sp = (n: number) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  const ly = km / LY;
  if (ly < 0.05) {
    if (km < 1e6) return `${sp(km)} km`;
    if (km < 1e9) return `${(km / 1e6).toFixed(km < 1e7 ? 1 : 0).replace('.', ',')} mln km`;
    return `${(km / 1e9).toFixed(km < 1e10 ? 1 : 0).replace('.', ',')} mlrd km`;
  }
  if (ly < 1000) return `${ly.toFixed(ly < 10 ? 1 : 0).replace('.', ',')} yorug'lik yili`;
  if (ly < 1e6) return `${sp(ly / 1000)} ming yorug'lik yili`;
  if (ly < 1e9) return `${(ly / 1e6).toFixed(ly < 1e7 ? 1 : 0).replace('.', ',')} mln yorug'lik yili`;
  return `${(ly / 1e9).toFixed(1).replace('.', ',')} mlrd yorug'lik yili`;
};

const STAGES: {a: number; b: number; t: string; s: string}[] = [
  {a: 0, b: 92, t: 'YER', s: 'Diametri 12 742 km'},
  {a: 112, b: 190, t: 'YER VA OY', s: 'Oralig\'i 384 400 km'},
  {a: 218, b: 280, t: 'YER ORBITASI', s: 'Quyoshgacha 150 mln km'},
  {a: 318, b: 392, t: 'QUYOSH TIZIMI', s: '8 ta sayyora'},
  {a: 468, b: 545, t: 'YAQIN YULDUZLAR', s: 'Eng yaqin qo\'shni: Alfa Sentavr'},
  {a: 650, b: 770, t: 'SOMON YO\'LI', s: 'Diametri ~100 000 yorug\'lik yili'},
  {a: 852, b: 935, t: 'MAHALLIY GURUH', s: 'Andromedagacha 2,5 mln yorug\'lik yili'},
  {a: 990, b: 1100, t: 'KOINOT', s: 'Galaktikalar to\'ri'},
];

// ---------- drawing ----------
const draw = (ctx: CanvasRenderingContext2D, f: number) => {
  const lv = logV(f);
  const cam = makeCam(lv, f);
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = '#02030a';
  ctx.fillRect(0, 0, W, H);

  const dot = (x: number, y: number, s: number, col: string, a: number) => {
    if (a <= 0.003 || x < -20 || x > W + 20 || y < -20 || y > H + 20) return;
    ctx.globalAlpha = Math.min(1, a);
    ctx.fillStyle = col;
    ctx.fillRect(x - s / 2, y - s / 2, s, s);
  };
  const glow = (x: number, y: number, r: number, inner: string, a: number) => {
    if (a <= 0.003 || r < 0.5) return;
    ctx.globalAlpha = Math.min(1, a);
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, inner);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  };

  // 1. sky at infinity (only direction, rotates with camera)
  const skyA = 1 - smooth(13.2, 14.6, lv);
  if (skyA > 0) {
    ctx.globalCompositeOperation = 'lighter';
    for (const s of SKY) {
      const d = s.d;
      const z = d[0] * cam.m[6] + d[1] * cam.m[7] + d[2] * cam.m[8];
      if (z <= 0.05) continue;
      const x = W / 2 + ((d[0] * cam.m[0] + d[1] * cam.m[1] + d[2] * cam.m[2]) / z) * FOCAL;
      const y = CY - ((d[0] * cam.m[3] + d[1] * cam.m[4] + d[2] * cam.m[5]) / z) * FOCAL;
      const tw = 0.75 + 0.25 * Math.sin(f * 0.07 + s.w * 40);
      dot(x, y, 1.6 + s.b * 2.4, s.w < 0.2 ? '#ffd9b0' : '#dfe8ff', skyA * (0.25 + s.b * 0.75) * tw);
    }
  }

  // 2. cosmic web
  const webA = smooth(19.9, 21.2, lv);
  if (webA > 0) {
    ctx.globalCompositeOperation = 'lighter';
    for (const w of WEB) {
      const q = proj(cam, w.p);
      if (!q) continue;
      dot(q[0], q[1], 2.0, w.b > 0.85 ? '#ffe9d2' : w.b > 0.4 ? '#a9b8ff' : '#c58bff', webA * (0.12 + 0.38 * w.b));
    }
  }

  // 3. galaxies (Milky Way + Local Group)
  const galA = smooth(15.2, 16.6, lv);
  const drawGal = (tpl: typeof MW, c: V3, R: number, tilt: number, az: number, n: number, hue: [number, number, number], a: number, inGal: boolean, irregular?: boolean) => {
    if (a <= 0.003) return;
    const cq = proj(cam, c);
    if (!cq) return;
    const pxR = R * cq[2];
    if (pxR < 1.5) { dot(cq[0], cq[1], 2.5, '#fff1dd', a * 0.9); return; }
    const step = Math.max(1, Math.floor(tpl.length / n));
    const sz = Math.max(1.4, Math.min(3.2, pxR / 260));
    const al = a * Math.min(1, 0.22 + 900 / (pxR + 600)) ;
    for (let i = 0; i < tpl.length; i += step) {
      const t = tpl[i];
      let p: V3 = irregular ? [t.p[0] * 0.7, t.p[1] * 0.5, t.p[2] * 8 + t.p[0] * 0.2] : t.p;
      p = rotZ(p, az);
      p = rotX(p, tilt);
      const wp: V3 = inGal ? fromGal(p) : p;
      const q = proj(cam, [c[0] + wp[0] * R, c[1] + wp[1] * R, c[2] + wp[2] * R]);
      if (!q) continue;
      const col = t.c === 0 ? `rgb(${255 * hue[0] | 0},${215 * hue[1] | 0},${160 * hue[2] | 0})`
        : t.c === 2 ? '#ff7fb0'
        : t.c === 3 ? `rgb(${230 * hue[0] | 0},${210 * hue[1] | 0},${190 * hue[2] | 0})`
        : `rgb(${Math.min(255, 175 * hue[0]) | 0},${Math.min(255, 200 * hue[1]) | 0},${Math.min(255, 255 * hue[2]) | 0})`;
      dot(q[0], q[1], sz, col, al * (t.c === 0 ? 0.28 : 0.55));
    }
    // core glow
    ctx.globalCompositeOperation = 'lighter';
    glow(cq[0], cq[1], pxR * 0.22, 'rgba(255,200,140,0.9)', a * 0.35);
  };
  if (galA > 0) {
    ctx.globalCompositeOperation = 'lighter';
    drawGal(MW, GAL_C, MW_R, 0, MW_ROT, 70000, [1, 1, 1], galA, true);
    const lgA = smooth(17.9, 18.8, lv);
    for (let i = 1; i < LOCAL.length; i++) {
      const g = LOCAL[i];
      drawGal(SMALL_GAL, g.c, g.R, g.tilt, g.az, g.n, g.hue, lgA, false, g.irregular);
    }
    for (const d of DWARFS) {
      const q = proj(cam, d);
      if (q) glow(q[0], q[1], 5, 'rgba(220,225,255,0.9)', lgA * 0.6 * (1 - webA * 0.7));
    }
  }

  // 4. nearby stars (3D)
  const nearA = band(12.6, 13.6, 16.0, 17.0, lv);
  if (nearA > 0) {
    ctx.globalCompositeOperation = 'lighter';
    for (const s of NEAR) {
      const q = proj(cam, s.p);
      if (!q) continue;
      const sz = 1.5 + s.b * 3;
      dot(q[0], q[1], sz, s.c, nearA * (0.35 + 0.65 * s.b));
    }
    const q = proj(cam, ALPHA_CEN);
    if (q) {
      glow(q[0], q[1], 26, 'rgba(255,236,200,1)', nearA);
      dot(q[0], q[1], 5, '#fff', nearA);
    }
  }

  // 5. Sun
  ctx.globalCompositeOperation = 'lighter';
  const sq = proj(cam, [0, 0, 0]);
  if (sq) {
    const r = 696000 * sq[2];
    const sunA = 1 - smooth(15.5, 16.8, lv) * 0.75;
    glow(sq[0], sq[1], Math.max(r * 6, 34), 'rgba(255,200,110,1)', sunA * 0.85);
    glow(sq[0], sq[1], Math.max(r * 2.2, 12), 'rgba(255,245,215,1)', sunA);
    if (r > 2) { ctx.globalAlpha = 1; ctx.fillStyle = '#fff6dc'; ctx.beginPath(); ctx.arc(sq[0], sq[1], r, 0, Math.PI * 2); ctx.fill(); }
  }

  // 6. orbits
  ctx.globalCompositeOperation = 'source-over';
  const ring = (center: V3, R: number, col: string, a: number, width: number) => {
    if (a <= 0.003) return;
    ctx.globalAlpha = a; ctx.strokeStyle = col; ctx.lineWidth = width;
    ctx.beginPath();
    let pen = false;
    for (let i = 0; i <= 180; i++) {
      const t = (i / 180) * Math.PI * 2;
      const q = proj(cam, [center[0] + R * Math.cos(t), center[1] + R * Math.sin(t), center[2]]);
      if (!q) { pen = false; continue; }
      if (pen) ctx.lineTo(q[0], q[1]); else ctx.moveTo(q[0], q[1]);
      pen = true;
    }
    ctx.stroke();
  };
  const orbA = band(6.6, 7.6, 11.6, 12.6, lv);
  PLANETS.forEach((p) => ring([0, 0, 0], p.a * AU, p.a === 1 ? '#6fb6ff' : '#8b93b8', orbA * (p.a === 1 ? 0.8 : 0.4), p.a === 1 ? 3 : 2));
  const moonA = 1 - smooth(7.6, 8.6, lv);
  ring(EARTH, 384400, '#9aa3c0', moonA * 0.55 * smooth(4.6, 5.3, lv), 2);

  // planets (not Earth)
  PLANETS.forEach((p) => {
    if (p.a === 1) return;
    const pos: V3 = [p.a * AU * Math.cos(p.ang), p.a * AU * Math.sin(p.ang), 0];
    const q = proj(cam, pos);
    if (!q) return;
    const r = Math.max(p.r * q[2], 4);
    const a = orbA;
    if (a <= 0.003) return;
    ctx.globalAlpha = a; ctx.fillStyle = p.c;
    ctx.beginPath(); ctx.arc(q[0], q[1], r, 0, Math.PI * 2); ctx.fill();
    if (p.a > 9 && p.a < 10) { ctx.strokeStyle = '#e6d29b'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(q[0], q[1], r * 2.2, r * 0.7, -0.2, 0, Math.PI * 2); ctx.stroke(); }
  });

  // 7. Moon
  const mpos: V3 = [EARTH[0] + 384400 * Math.cos(1.0 + f * 0.0015), EARTH[1] + 384400 * Math.sin(1.0 + f * 0.0015), 0];
  const mq = proj(cam, mpos);
  if (mq && moonA > 0.003) {
    const r = Math.max(1737 * mq[2], 9);
    ctx.globalAlpha = moonA;
    const g = ctx.createRadialGradient(mq[0] - r * 0.35, mq[1] - r * 0.35, r * 0.1, mq[0], mq[1], r);
    g.addColorStop(0, '#e8e8ea'); g.addColorStop(1, '#55565e');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(mq[0], mq[1], r, 0, Math.PI * 2); ctx.fill();
  }

  // 8. Earth
  const eq = proj(cam, EARTH);
  if (eq) {
    const r = 6371 * eq[2];
    const eA = 1 - smooth(11.6, 12.6, lv);
    if (r > 6) {
      ctx.globalAlpha = 1;
      glow(eq[0], eq[1], r * 1.12, 'rgba(90,160,255,0.55)', 1);
      ctx.globalCompositeOperation = 'source-over';
      const pr = geoOrthographic().scale(r).translate([eq[0], eq[1]]).rotate([-60 - f * 0.25, -18, 0]).clipAngle(90);
      const path = geoPath(pr, ctx);
      ctx.globalAlpha = 1;
      const og = ctx.createRadialGradient(eq[0] - r * 0.3, eq[1] - r * 0.3, r * 0.1, eq[0], eq[1], r);
      og.addColorStop(0, '#2f7fd6'); og.addColorStop(1, '#0b2c66');
      ctx.fillStyle = og; ctx.beginPath(); path({type: 'Sphere'} as any); ctx.fill();
      ctx.fillStyle = '#3f8f4a'; ctx.beginPath(); path(LAND); ctx.fill();
      ctx.globalAlpha = 0.08; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1; ctx.beginPath(); path(GRAT as any); ctx.stroke();
      // night side (Sun direction on screen)
      const sx = sq ? sq[0] - eq[0] : 1, sy = sq ? sq[1] - eq[1] : 0;
      const sl = Math.hypot(sx, sy) || 1;
      const lx = eq[0] + (sx / sl) * r * 0.6, ly = eq[1] + (sy / sl) * r * 0.6;
      ctx.globalAlpha = 1;
      const ng = ctx.createRadialGradient(lx, ly, r * 0.2, lx, ly, r * 1.9);
      ng.addColorStop(0, 'rgba(0,0,10,0)'); ng.addColorStop(0.55, 'rgba(0,0,10,0.15)'); ng.addColorStop(1, 'rgba(0,0,12,0.92)');
      ctx.fillStyle = ng; ctx.beginPath(); path({type: 'Sphere'} as any); ctx.fill();
      ctx.globalAlpha = 0.5; ctx.strokeStyle = '#8fd0ff'; ctx.lineWidth = Math.max(1.5, r * 0.012);
      ctx.beginPath(); ctx.arc(eq[0], eq[1], r, 0, Math.PI * 2); ctx.stroke();
    } else if (eA > 0.003) {
      ctx.globalCompositeOperation = 'lighter';
      glow(eq[0], eq[1], 14, 'rgba(110,180,255,1)', eA);
      dot(eq[0], eq[1], 5, '#bfe2ff', eA);
    }
  }

  // 9. on-object labels
  ctx.globalCompositeOperation = 'source-over';
  const tag = (q: [number, number, number] | null, text: string, a: number, dy = -40) => {
    if (!q || a <= 0.01) return;
    ctx.globalAlpha = a;
    ctx.font = '700 38px Oswald';
    ctx.textAlign = 'center';
    ctx.lineWidth = 8; ctx.strokeStyle = 'rgba(0,0,0,0.8)';
    ctx.strokeText(text, q[0], q[1] + dy);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(text, q[0], q[1] + dy);
  };
  tag(proj(cam, EARTH), 'YER', band(5.0, 5.4, 10.6, 11.2, lv), -30);
  tag(mq, 'OY', band(5.0, 5.4, 6.8, 7.3, lv), -30);
  tag(proj(cam, [0, 0, 0]), 'QUYOSH', band(8.6, 9.2, 15.0, 15.4, lv), -50);
  tag(proj(cam, ALPHA_CEN), 'ALFA SENTAVR', band(13.4, 13.9, 14.6, 15.1, lv), -44);
  tag(proj(cam, LOCAL[1].c), 'ANDROMEDA', band(18.9, 19.3, 20.2, 20.7, lv), -120);
  tag(proj(cam, GAL_C), 'SOMON YO\'LI', band(19.1, 19.4, 20.2, 20.7, lv), 110);
  // "we are here" marker on the Sun inside the Milky Way
  const here = band(16.6, 17.2, 18.6, 19.0, lv);
  const hq = proj(cam, [0, 0, 0]);
  if (hq && here > 0.01) {
    ctx.globalAlpha = here;
    ctx.strokeStyle = '#ffd23f'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(hq[0], hq[1], 22 + 6 * Math.sin(f * 0.15), 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(hq[0], hq[1] - 30); ctx.lineTo(hq[0], hq[1] - 120); ctx.stroke();
    ctx.font = '700 46px Oswald'; ctx.textAlign = 'center';
    ctx.lineWidth = 9; ctx.strokeStyle = 'rgba(0,0,0,0.85)';
    ctx.strokeText('BIZ SHU YERDAMIZ', hq[0], hq[1] - 138);
    ctx.fillStyle = '#ffd23f'; ctx.fillText('BIZ SHU YERDAMIZ', hq[0], hq[1] - 138);
  }

  // 10. stage title + distance readout
  ctx.globalAlpha = 1;
  const shade = ctx.createLinearGradient(0, 0, 0, 520);
  shade.addColorStop(0, 'rgba(0,0,0,0.65)'); shade.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = shade; ctx.fillRect(0, 0, W, 520);
  for (const s of STAGES) {
    const a = band(s.a, s.a + 14, s.b - 14, s.b, f);
    if (a <= 0.01) continue;
    const y = 250 - (1 - a) * 30;
    ctx.globalAlpha = a;
    ctx.textAlign = 'center';
    ctx.font = '700 118px Oswald';
    ctx.lineWidth = 12; ctx.strokeStyle = 'rgba(0,0,0,0.7)';
    ctx.strokeText(s.t, W / 2, y);
    ctx.fillStyle = '#ffffff'; ctx.fillText(s.t, W / 2, y);
    ctx.font = '700 48px Oswald';
    ctx.lineWidth = 8;
    ctx.strokeText(s.s, W / 2, y + 76);
    ctx.fillStyle = '#ffd23f'; ctx.fillText(s.s, W / 2, y + 76);
  }
  const de = Math.hypot(cam.pos[0] - EARTH[0], cam.pos[1] - EARTH[1], cam.pos[2] - EARTH[2]);
  ctx.globalAlpha = 0.95;
  ctx.textAlign = 'center';
  ctx.font = '700 40px Oswald';
  ctx.lineWidth = 8; ctx.strokeStyle = 'rgba(0,0,0,0.8)';
  const txt = `YERDAN UZOQLIK: ${fmt(de).toUpperCase()}`;
  ctx.strokeText(txt, W / 2, H - 330);
  ctx.fillStyle = '#cfe0ff'; ctx.fillText(txt, W / 2, H - 330);
  ctx.globalAlpha = 1;
};

export const Koinot: React.FC = () => {
  const f = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const [handle] = useState(() => delayRender('font'));
  useEffect(() => {
    const f1 = new FontFace('Oswald', `url(${staticFile('fonts/oswald-latin-700-normal.woff2')})`, {weight: '700'});
    const f2 = new FontFace('Oswald', `url(${staticFile('fonts/oswald-latin-ext-700-normal.woff2')})`, {weight: '700'});
    Promise.all([f1.load(), f2.load()]).then((fs) => fs.forEach((x) => document.fonts.add(x))).finally(() => setReady(true));
  }, []);
  useEffect(() => { if (ready) continueRender(handle); }, [ready, handle]);
  useLayoutEffect(() => {
    const ctx = ref.current?.getContext('2d');
    if (ctx) draw(ctx, f);
  }, [f, ready]);
  return (
    <AbsoluteFill style={{background: '#02030a'}}>
      <canvas ref={ref} width={W} height={H} style={{width: W, height: H}} />
    </AbsoluteFill>
  );
};

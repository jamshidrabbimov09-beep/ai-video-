// "Loy jangi, 1365": battle breakdown made entirely as motion design (no generated images).
// Timing comes from src/loy.json (edit/edit_loy.py): sentence cues s1..s14, so the animation follows the narration.
import React from 'react';
import {AbsoluteFill, Img, interpolate, random, staticFile, useCurrentFrame, Easing} from 'remotion';
import data from './loy.json';

const FPS = 30;
const GOLD = '#d4af37';
const CREAM = '#f5ecd5';
const font = '"Liberation Serif", "DejaVu Serif", Georgia, serif';
export const LOY_FRAMES = Math.round(data.end * FPS);
const S: Record<string, {t0: number; t1: number}> = {};
data.sents.forEach((s) => { S[s.id] = s; });
const a = (id: string, off = 0) => (S[id].t0 + off) * FPS;      // frame where sentence starts
const z = (id: string, off = 0) => (S[id].t1 + off) * FPS;      // frame where sentence ends
const ease = Easing.inOut(Easing.cubic);
// keyframes: [[frame, value], ...]
const kf = (fr: number, k: [number, number][]) => {
  if (fr <= k[0][0]) return k[0][1];
  for (let i = 1; i < k.length; i++) {
    if (fr <= k[i][0]) {
      const p = (fr - k[i - 1][0]) / Math.max(1, k[i][0] - k[i - 1][0]);
      return k[i - 1][1] + (k[i][1] - k[i - 1][1]) * ease(p);
    }
  }
  return k[k.length - 1][1];
};
const fade = (fr: number, f0: number, f1: number, d = 12) => Math.max(0, Math.min(interpolate(fr, [f0, f0 + d], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}), interpolate(fr, [f1 - d, f1], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})));

// ---------------- units (v2: tilted 3D battlefield, every soldier is an upright horseman) ----------------
type Unit = {id: string; n: number; cols: number; col: string; up: boolean;
  x: [number, number][]; y: [number, number][]; spread?: [number, number][]; o?: [number, number][]; label?: string};
const T0 = a('s5', -0.6);
const I1 = a('s3', -0.4);      // end of the cold open (flash-forward into the battle)
const TILT = 54;
const units: Unit[] = [
  {id: 'T', n: 72, cols: 12, col: '#e8b92e', up: true, label: 'TEMUR',
    x: [[0, 300]], y: [[0, 1560], [I1, 1150], [T0, 1150], [a('s6'), 1150], [a('s6', 3), 1030], [a('s8'), 1030], [z('s8'), 800], [a('s13'), 800], [z('s13', -1), 1700]],
    spread: [[a('s12'), 1], [a('s13'), 1.05], [z('s13', -1), 2.3]], o: [[a('s13', 1.5), 1], [z('s13'), 0]]},
  {id: 'T17', n: 30, cols: 6, col: '#ffd95e', up: true,
    x: [[a('s10'), 330], [a('s10', 2.4), 610]], y: [[a('s10'), 800], [a('s10', 2.4), 740], [a('s13'), 740], [z('s13', -1), 1700]],
    spread: [[a('s13'), 1], [z('s13', -1), 2.2]], o: [[a('s10', -0.2), 0], [a('s10', 0.3), 1], [a('s13', 1.5), 1], [z('s13'), 0]]},
  {id: 'H', n: 72, cols: 12, col: '#4f8fe6', up: true, label: 'HUSAYN',
    x: [[0, 780]], y: [[0, 1230], [I1, 1230], [T0, 1150], [a('s6'), 1150], [a('s6', 3), 1030], [a('s9'), 1030], [z('s9'), 1170], [a('s10', 2), 1170], [z('s10'), 1090], [a('s13'), 1090], [z('s13', -1.4), 1750]],
    spread: [[a('s9'), 1], [z('s9'), 1.7], [a('s10', 2), 1.7], [z('s10'), 1.05], [a('s13'), 1.05], [z('s13', -1.4), 2.3]], o: [[a('s13', 1.2), 1], [z('s13', -0.3), 0]]},
  {id: 'ER', n: 48, cols: 8, col: '#b3261e', up: false, label: "ILYOSXO'JA",
    x: [[0, 300]], y: [[0, 150], [I1, 640], [T0, 430], [a('s6'), 430], [a('s6', 3), 700], [a('s8'), 700], [z('s8'), 300], [a('s12'), 300], [a('s12', 2.5), 440], [z('s12'), 585], [a('s13', 1), 585], [z('s13'), 960]],
    spread: [[a('s8'), 1], [z('s8'), 2.1], [a('s12'), 2.1], [a('s12', 2.5), 1]], o: [[a('s8', 1), 1], [z('s8'), 0.6], [a('s12'), 0.6], [a('s12', 2), 1]]},
  {id: 'EC', n: 48, cols: 8, col: '#96211b', up: false, label: 'SHAMSUDDIN',
    x: [[0, 550]], y: [[0, 120], [I1, 620], [T0, 430], [a('s6'), 430], [a('s6', 3), 660], [a('s10', 1.6), 660], [z('s10'), 430], [a('s12', 2), 430], [z('s12'), 545], [a('s13', 1), 545], [z('s13'), 980]]},
  {id: 'EL', n: 48, cols: 8, col: '#b3261e', up: false,
    x: [[0, 800]], y: [[0, 150], [I1, 660], [T0, 430], [a('s6'), 430], [a('s6', 3), 700], [a('s9'), 700], [z('s9'), 900], [a('s10', 2), 900], [z('s10'), 640], [a('s12', 2), 640], [z('s12'), 840], [a('s13', 1), 840], [z('s13'), 1010]]},
];
const HORSE = ['#3b2a1c', '#57391f', '#241a14', '#6e4a2a', '#8a8378', '#2c2622'];
type Proj = (x: number, y: number) => {sx: number; sy: number; k: number};
const rider = (u: Unit, i: number, fr: number, mud: number, proj: Proj): {y: number; el: React.ReactNode} | null => {
  const lag = random(u.id + 'l' + i) * 16;
  const t = fr - lag;
  const cx = kf(t, u.x), cy = kf(t, u.y);
  const sp = u.spread ? kf(t, u.spread) : 1;
  const rows = Math.ceil(u.n / u.cols);
  const c = i % u.cols, r = Math.floor(i / u.cols);
  const jx = (random(u.id + 'x' + i) - 0.5) * 12, jy = (random(u.id + 'y' + i) - 0.5) * 12;
  const ox = ((c - (u.cols - 1) / 2) * 30 + jx) * (1 + (sp - 1) * (0.5 + random(u.id + 's' + i)));
  const oy = ((r - (rows - 1) / 2) * 34 + jy) * (1 + (sp - 1) * (0.5 + random(u.id + 't' + i)));
  const vy = kf(t + 4, u.y) - kf(t - 4, u.y), vx = kf(t + 4, u.x) - kf(t - 4, u.x);
  const moving = Math.min(1, Math.hypot(vx, vy) / 5);
  const ph = random(u.id + 'p' + i) * 6.28;
  const gait = fr * (0.95 - 0.35 * mud) + ph;
  const bob = Math.abs(Math.sin(gait)) * 5 * moving + Math.sin(fr / 13 + ph) * 0.8;
  const away = moving > 0.12 ? vy < 0 : u.up;        // do we see the rider's back?
  const lean = Math.max(-10, Math.min(10, vx * 2));
  const hc = HORSE[Math.floor(random(u.id + 'h' + i) * HORSE.length)];
  const l1 = 12 + Math.sin(gait) * 5 * moving, l2 = 12 - Math.sin(gait) * 5 * moving;
  const o = u.o ? kf(fr, u.o) : 1;
  if (o <= 0.01) return null;
  const pr = proj(cx + ox, cy + oy);
  if (pr.sy < -60 || pr.sy > 2100 || pr.sx < -80 || pr.sx > 1160) return null;
  return {y: cy + oy, el: (
    <g key={u.id + i} transform={`translate(${pr.sx.toFixed(1)} ${pr.sy.toFixed(1)}) scale(${pr.k.toFixed(3)})`} opacity={o}>
        <ellipse cx={0} cy={1} rx={15} ry={4} fill="rgba(0,0,0,0.35)" />
        <g transform={`translate(0 ${-bob}) rotate(${lean})`}>
          <line x1={-7} y1={-14} x2={-8} y2={-14 + l1} stroke={hc} strokeWidth={4} strokeLinecap="round" />
          <line x1={7} y1={-14} x2={8} y2={-14 + l2} stroke={hc} strokeWidth={4} strokeLinecap="round" />
          <ellipse cx={0} cy={-22} rx={12} ry={12} fill={hc} />
          {away
            ? <path d={`M 0 -18 q ${3 + Math.sin(gait) * 3} 10 ${Math.sin(gait) * 4} 18`} stroke="#15100c" strokeWidth={4} fill="none" strokeLinecap="round" />
            : <g><ellipse cx={0} cy={-27} rx={5.5} ry={10} fill={hc} stroke="rgba(0,0,0,0.35)" strokeWidth={1} /><path d="M -5 -36 l -2 -6 l 5 3 z M 5 -36 l 2 -6 l -5 3 z" fill={hc} /></g>}
          <path d="M -8 -30 L 8 -30 L 6 -50 L -6 -50 Z" fill={u.col} stroke="rgba(0,0,0,0.45)" strokeWidth={1.2} />
          <circle cx={0} cy={-55} r={5.5} fill={away ? '#3a342c' : '#c9a27a'} />
          <path d="M -6 -56 a 6 6 0 0 1 12 0 z" fill="#4a463e" /><line x1={0} y1={-62} x2={0} y2={-67} stroke="#4a463e" strokeWidth={2} />
          <line x1={10} y1={-26} x2={12} y2={-78} stroke="#1c1610" strokeWidth={1.8} />
          {i % 6 === 0 && <path d={`M 12 -78 l ${10 + Math.sin(fr / 4 + ph) * 3} 4 l -10 5 z`} fill={u.col} />}
        </g>
    </g>
  )};
};
const Billboard: React.FC<{x: number; y: number; children: React.ReactNode; o?: number; proj: Proj}> = ({x, y, children, o = 1, proj}) => {
  const pr = proj(x, y);
  return <g transform={`translate(${pr.sx.toFixed(1)} ${pr.sy.toFixed(1)}) scale(${pr.k.toFixed(3)})`} opacity={o}>{children}</g>;
};
const UnitLabel: React.FC<{u: Unit; fr: number; proj: Proj}> = ({u, fr, proj}) => {
  if (!u.label) return null;
  const x = kf(fr, u.x), y = kf(fr, u.y);
  const from = u.id === 'EC' ? a('s10', -0.3) : a('s5');
  const intro = u.id === 'H' ? fade(fr, (a('s2') + z('s2')) / 2, I1, 10) : 0;
  const o = Math.max(intro, fade(fr, from, u.id === 'EC' ? a('s12', 1.2) : a('s13', 1.2), 14) * (u.o ? Math.min(1, kf(fr, u.o) * 1.6) : 1));
  if (o <= 0) return null;
  const w = u.label.length * 23 + 50;
  return (
    <Billboard x={x} y={y} o={o} proj={proj}>
      <g transform={`translate(${-w / 2} -210)`}>
        <rect x={0} y={0} width={w} height={56} rx={9} fill="rgba(12,10,8,0.8)" stroke={u.up ? u.col : '#e39a8e'} strokeWidth={2.5} />
        <text x={w / 2} y={40} textAnchor="middle" fontFamily={font} fontSize={34} fontWeight={700} letterSpacing={4} fill={u.up ? CREAM : '#f6d7d1'}>{u.label}</text>
        <line x1={w / 2} y1={56} x2={w / 2} y2={96} stroke={u.up ? u.col : '#e39a8e'} strokeWidth={2.5} />
      </g>
    </Billboard>
  );
};
const Arrow: React.FC<{d: string; fr: number; f0: number; f1: number; col: string; w?: number}> = ({d, fr, f0, f1, col, w = 16}) => {
  const p = interpolate(fr, [f0, f0 + 26], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  const o = fade(fr, f0, f1, 10);
  if (o <= 0) return null;
  return <path d={d} fill="none" stroke={col} strokeWidth={w} strokeLinecap="round" pathLength={1} strokeDasharray={`${p} 1`} opacity={o * 0.9} markerEnd={p > 0.95 ? `url(#ah-${col.replace('#', '')})` : undefined} />;
};
const Marker: React.FC<{col: string}> = ({col}) => (
  <marker id={`ah-${col.replace('#', '')}`} viewBox="0 0 10 10" refX="5" refY="5" markerWidth="3.2" markerHeight="3.2" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill={col} /></marker>
);

// ---------------- battlefield ----------------
const Field: React.FC = () => {
  const fr = useCurrentFrame();
  const intro = fr < I1 + 20;
  const mud = intro ? 0.75 : kf(fr, [[a('s6'), 0], [a('s6', 4.5), 1]]);
  const rain = intro ? kf(fr, [[0, 0.75], [a('s2'), 0.85], [a('s2', 1), 1]]) : kf(fr, [[a('s6', -0.3), 0], [a('s6', 1.2), 1], [a('s8'), 1], [a('s9'), 0.65], [a('s12'), 0.55], [z('s13'), 0.4]]);
  const mid2 = (a('s2') + z('s2')) / 2;
  const cam = {
    x: kf(fr, [[0, 300], [a('s1', 4), 420], [a('s2'), 540], [mid2, 560], [z('s2'), 780], [I1 + 20, 780], [T0, 540], [a('s5', 1.2), 300], [(a('s5') + z('s5')) / 2 + 12, 780], [a('s6'), 540], [a('s8'), 540], [a('s8', 1.5), 330], [a('s9', -0.3), 330], [a('s9', 1), 760], [a('s10'), 760], [a('s10', 1.5), 580], [a('s11'), 680], [a('s12'), 560], [a('s13'), 540]]),
    y: kf(fr, [[0, 1500], [a('s1', 4), 1150], [a('s2'), 950], [mid2, 930], [z('s2'), 1230], [I1 + 20, 1230], [T0, 800], [a('s5', 1.2), 1120], [(a('s5') + z('s5')) / 2 + 12, 1120], [a('s6'), 860], [a('s6', 3), 880], [a('s8'), 880], [a('s8', 1.5), 700], [a('s9', -0.3), 660], [a('s9', 1), 1010], [a('s10'), 1010], [a('s10', 1.5), 760], [a('s11'), 900], [a('s12'), 640], [z('s12'), 720], [a('s13', 2), 980], [z('s13'), 1000]]),
    z: kf(fr, [[0, 2.0], [a('s1', 4), 1.6], [a('s2'), 1.15], [mid2, 1.2], [z('s2'), 1.85], [I1 + 20, 1.9], [T0, 1.0], [a('s5', 1.2), 1.7], [(a('s5') + z('s5')) / 2 + 12, 1.7], [a('s6'), 1.1], [a('s6', 3), 1.3], [a('s8'), 1.35], [a('s8', 1.5), 1.8], [a('s9', -0.3), 1.9], [a('s9', 1), 1.8], [a('s10'), 1.85], [a('s10', 1.5), 1.6], [a('s11'), 1.5], [a('s12'), 1.45], [z('s12'), 1.5], [a('s13', 2), 1.25], [z('s13'), 1.15]]),
  };
  const drift = Math.sin(fr / 47) * 10;
  const sepia = fade(fr, a('s7'), z('s7', 0.2), 12);
  const cosT = Math.cos((TILT * Math.PI) / 180), sinT = Math.sin((TILT * Math.PI) / 180);
  // same maths as the CSS 3D transform of the ground plane, so riders stand exactly on it
  const proj: Proj = (x, y) => {
    const X = x - cam.x, Y = y - cam.y;
    const px = 540 + drift + cam.z * X, py = 1020 + cam.z * Y * cosT, pz = Y * sinT;
    const f = 1500 / (1500 - pz);
    return {sx: 540 + (px - 540) * f, sy: 620 + (py - 620) * f, k: cam.z * f};
  };
  // messengers (s11)
  const mes: React.ReactNode[] = [], marks: React.ReactNode[] = [];
  const m0 = a('s11', 0.3), mlen = Math.max(60, (z('s11') - m0) / 2);
  for (let k = 0; k < 2; k++) {
    const st = m0 + k * mlen, go = mlen * 0.42, back = mlen * 0.36;
    if (fr < st || fr > st + mlen) continue;
    const t = fr - st;
    const p = t < go ? ease(t / go) : t < go + 8 ? 1 : Math.max(0, 1 - ease((t - go - 8) / back));
    const x = 640 + (770 - 640) * p, y = 800 + (975 - 800) * p;
    marks.push(<circle key={'r' + k} cx={x} cy={y} r={30} fill="none" stroke={CREAM} strokeWidth={4} opacity={0.9} />);
    mes.push(<Billboard key={k} x={x} y={y} proj={proj}>
      <g transform={`translate(0 ${-Math.abs(Math.sin(fr * 0.9)) * 6})`}><ellipse cx={0} cy={-22} rx={13} ry={13} fill="#f1e7cf" /><path d="M -8 -30 L 8 -30 L 6 -52 L -6 -52 Z" fill="#f5ecd5" stroke="#000" strokeWidth={1.5} /><circle cx={0} cy={-58} r={6} fill="#f5ecd5" stroke="#000" strokeWidth={1.5} /></g></Billboard>);
    if (t > go && t < go + 34) {
      const q = (t - go) / 34;
      marks.push(<g key={'x' + k} opacity={1 - q} transform={`translate(770 975) scale(${1.4 + q})`}><line x1={-22} y1={-22} x2={22} y2={22} stroke="#ff4b3a" strokeWidth={9} strokeLinecap="round" /><line x1={22} y1={-22} x2={-22} y2={22} stroke="#ff4b3a" strokeWidth={9} strokeLinecap="round" /></g>);
    }
  }
  const bn = fade(fr, a('s12', 1.2), z('s13'), 14);
  const by = kf(fr, units[4].y);
  const deadO = kf(fr, [[a('s13', 1), 0], [a('s13', 3.5), 1]]);
  const dead: React.ReactNode[] = [];
  for (let i = 0; i < 150; i++) {
    const x = 150 + random('dx' + i) * 780, y = 780 + random('dy' + i) * 460, on = random('do' + i);
    if (deadO > on) dead.push(<g key={i} transform={`translate(${x} ${y}) rotate(${random('dr' + i) * 180})`} opacity={0.85}><ellipse rx={15} ry={7} fill="#2a1e14" /><ellipse cx={4} rx={7} ry={5} fill={i % 3 ? '#a8861f' : '#365f96'} /></g>);
  }
  // dust / mud kicked up by moving units and sparks where the lines fight
  const dust: React.ReactNode[] = [];
  units.forEach((u) => {
    const sp = Math.min(1, Math.abs(kf(fr + 4, u.y) - kf(fr - 4, u.y)) / 5 + Math.abs(kf(fr + 4, u.x) - kf(fr - 4, u.x)) / 5);
    const uo = u.o ? kf(fr, u.o) : 1;
    if (sp < 0.08 || uo < 0.1) return;
    const ux = kf(fr, u.x), uy = kf(fr, u.y);
    for (let i = 0; i < 16; i++) {
      const life = ((fr + random(u.id + 'dl' + i) * 30) % 30) / 30;
      dust.push(<circle key={u.id + i} cx={ux + (random(u.id + 'du' + i) - 0.5) * u.cols * 30} cy={uy + (random(u.id + 'dv' + i) - 0.5) * 220 + (u.up ? 60 : -60) * life} r={10 + life * 26} fill={mud > 0.4 ? '#3d2e22' : '#b9a57a'} opacity={(1 - life) * 0.4 * sp * uo} />);
    }
  });
  const fights: [number, number, number, number, number][] = [[300, 865, 330, a('s6', 3), a('s8', 1)], [800, 865, 330, a('s6', 3), a('s10', 2)], [800, 1040, 330, z('s9', -0.5), a('s10', 2)], [600, 640, 200, a('s10', 2.2), z('s10')], [300, 695, 330, z('s12', -0.4), a('s13', 1.5)], [800, 965, 330, z('s12', -0.4), a('s13', 1.5)]];
  const sparks: React.ReactNode[] = [];
  fights.forEach(([x, y, w, f0, f1], k) => {
    if (fr < f0 || fr > f1) return;
    for (let i = 0; i < 14; i++) {
      const on = random('sp' + k + '_' + i + '_' + Math.floor(fr / 3)) > 0.62;
      if (!on) continue;
      const sx = x + (random('sx' + k + i + Math.floor(fr / 3)) - 0.5) * w, sy = y + (random('sy' + k + i + Math.floor(fr / 3)) - 0.5) * 50;
      sparks.push(<g key={k + '_' + i} transform={`translate(${sx} ${sy}) rotate(${random('sr' + k + i + fr) * 180})`}><line x1={-13} y1={0} x2={13} y2={0} stroke="#fff3c4" strokeWidth={3.5} strokeLinecap="round" /><line x1={0} y1={-8} x2={0} y2={8} stroke="#ffd36b" strokeWidth={2.5} strokeLinecap="round" /></g>);
    }
  });
  const drops: React.ReactNode[] = [];
  if (rain > 0.01) for (let i = 0; i < 190; i++) {
    const sp = 46 + random('rs' + i) * 26;
    const y = ((random('ry' + i) * 2300 + fr * sp) % 2300) - 200, x = random('rx' + i) * 1500 - 200 - y * 0.16;
    drops.push(<line key={i} x1={x} y1={y} x2={x - 9} y2={y + 56} stroke="rgba(214,226,238,0.55)" strokeWidth={random('rw' + i) * 1.8 + 0.8} />);
  }
  const lt = (f: number, k: number) => Math.max(0, 1 - Math.abs(fr - f) / 5) * k;
  const lightning = lt(a('s6', 1.4), 0.3) + lt(a('s7', 0.6), 0.2) + lt(a('s2', 0.9), 0.32) + lt(a('s1', 2.2), 0.22);
  const riders: {y: number; el: React.ReactNode}[] = [];
  units.forEach((u) => { for (let i = 0; i < u.n; i++) { const r = rider(u, i, fr, mud, proj); if (r) riders.push(r); } });
  riders.sort((p, q) => p.y - q.y);
  return (
    <AbsoluteFill style={{background: '#0f0d0a', perspective: 1500, perspectiveOrigin: '540px 620px', overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 540 + drift, top: 1020, width: 0, height: 0, transformStyle: 'preserve-3d', transform: `scale(${cam.z}) rotateX(${TILT}deg) translate3d(${-cam.x}px, ${-cam.y}px, 0px)`}}>
        <Img src={staticFile('loy/field.jpg')} style={{position: 'absolute', left: -640, top: -1000, width: 2360, height: 3300}} />
        <Img src={staticFile('loy/mud.jpg')} style={{position: 'absolute', left: -1500, top: -2400, width: 4100, height: 5600, opacity: mud}} />
        <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
          <defs><Marker col={GOLD} /><Marker col="#e0392b" />
            <linearGradient id="riv" x1="0" x2="1"><stop offset="0" stopColor="#2f6686" /><stop offset="1" stopColor="#5a9cc0" /></linearGradient></defs>
          <path d="M -260 -2400 C 60 -800, -220 200, -40 900 S -200 1900, -80 3200" fill="none" stroke="url(#riv)" strokeWidth={230} opacity={0.95} />
          <path d="M -260 -2400 C 60 -800, -220 200, -40 900 S -200 1900, -80 3200" fill="none" stroke="rgba(230,245,255,0.3)" strokeWidth={7} strokeDasharray="70 110" strokeDashoffset={-fr * 2} />
          {Array.from({length: 34}).map((_, i) => (
            <ellipse key={i} cx={120 + random('px' + i) * 860} cy={300 + random('py' + i) * 1100} rx={34 + random('pr' + i) * 70} ry={16 + random('pq' + i) * 26} fill="rgba(28,22,18,0.55)" opacity={mud * (0.5 + 0.5 * random('po' + i))} />
          ))}
          {dead}{dust}
          <Arrow d="M 300 930 L 300 600" fr={fr} f0={a('s8', 0.2)} f1={z('s8')} col={GOLD} />
          <Arrow d="M 800 800 L 800 1040" fr={fr} f0={a('s9', 0.1)} f1={z('s9', 0.3)} col="#e0392b" />
          <Arrow d="M 360 830 Q 480 800 590 700" fr={fr} f0={a('s10', 0.2)} f1={z('s10')} col={GOLD} />
          <Arrow d="M 440 470 L 440 650" fr={fr} f0={a('s12', 2.6)} f1={z('s12', 0.6)} col="#e0392b" />
          <Arrow d="M 690 470 L 690 650" fr={fr} f0={a('s12', 2.9)} f1={z('s12', 0.6)} col="#e0392b" />
          {sparks}{marks}
          {bn > 0 && <circle cx={550} cy={by} r={60 + ((fr * 3) % 120)} fill="none" stroke="#ffe2a8" strokeWidth={5} opacity={bn * (1 - ((fr * 3) % 120) / 120)} />}
          {fade(fr, a('s5'), z('s5', 1), 12) > 0 && <g opacity={fade(fr, a('s5'), z('s5', 1), 12)} fontFamily={font} fontSize={46} letterSpacing={8} fill={GOLD} stroke="rgba(0,0,0,0.75)" strokeWidth={6} paintOrder="stroke" textAnchor="middle" fontWeight={700}>
            <text x={300} y={1330}>CHAP QANOT</text><text x={780} y={1330}>O'NG QANOT</text>
          </g>}
        </svg>
      </div>
      <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
        {riders.map((r) => r.el)}
        {units.map((u) => <UnitLabel key={u.id} u={u} fr={fr} proj={proj} />)}
        {mes}
        {bn > 0 && <Billboard x={550} y={by} o={bn} proj={proj}><g>
          <line x1={0} y1={0} x2={0} y2={-300} stroke="#20150c" strokeWidth={8} />
          <path d={`M 0 -300 q ${28 + Math.sin(fr / 5) * 10} 40 ${Math.sin(fr / 6) * 12} 110 q -22 -44 0 -110`} fill="#0f0b08" />
          <path d={`M 0 -292 l ${54 + Math.sin(fr / 4) * 8} 16 l -54 22 z`} fill="#b3261e" />
          <circle cx={0} cy={-306} r={11} fill={GOLD} />
        </g></Billboard>}
      </svg>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(15,13,10,0.95) 0%, rgba(15,13,10,0.55) 14%, rgba(15,13,10,0) 30%)'}} />
      <AbsoluteFill style={{background: `rgba(150,105,45,${0.3 * sepia})`, mixBlendMode: 'color'}} />
      <AbsoluteFill style={{background: `rgba(18,24,34,${0.36 * rain})`}} />
      <svg width={1080} height={1920} style={{position: 'absolute', opacity: rain}}>{drops}</svg>
      <AbsoluteFill style={{background: `rgba(235,240,255,${lightning})`}} />
    </AbsoluteFill>
  );
};

// ---------------- intro map ----------------
const City: React.FC<{x: number; y: number; n: string; fr: number; f0: number; big?: boolean; dx?: number}> = ({x, y, n, fr, f0, big, dx = 22}) => {
  const o = interpolate(fr, [f0, f0 + 12], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return <g opacity={o}><circle cx={x} cy={y} r={big ? 13 : 9} fill={CREAM} stroke="#000" strokeWidth={3} /><text x={x + dx} y={y + 11} fontFamily={font} fontSize={big ? 40 : 32} letterSpacing={3} fill={CREAM} stroke="rgba(0,0,0,0.8)" strokeWidth={6} paintOrder="stroke" textAnchor={dx < 0 ? 'end' : 'start'}>{n}</text></g>;
};
const MapScene: React.FC = () => {
  const fr = useCurrentFrame();
  const zz = kf(fr, [[0, 1.0], [a('s4'), 1.06], [z('s4'), 1.2]]);
  const cx = kf(fr, [[a('s3'), 500], [a('s4'), 540], [z('s4'), 620]]) + Math.sin(fr / 40) * 6, cy = kf(fr, [[a('s3'), 960], [a('s4'), 900], [z('s4'), 830]]);
  const pulse = (fr % 40) / 40;
  const bt = a('s4', 2.6);
  return (
    <AbsoluteFill style={{background: '#14110c'}}>
      <AbsoluteFill style={{transform: `translate(${540 - cx * zz}px, ${960 - cy * zz}px) scale(${zz})`, transformOrigin: '0 0'}}>
        <Img src={staticFile('loy/map.jpg')} style={{position: 'absolute', width: 1080, height: 1920, transform: 'scale(1.4)'}} />
        <svg width={1080} height={1920} style={{position: 'absolute', overflow: 'visible'}}>
          <defs><Marker col={GOLD} /><Marker col="#c0392b" /><Marker col="#5f8fd0" /></defs>
          <path d="M 1200 930 C 900 900, 760 840, 610 770 S 300 520, -80 300" fill="none" stroke="#3f7393" strokeWidth={16} opacity={0.9} />
          <path d="M 1200 1560 C 800 1500, 500 1560, 200 1420 S -60 1250, -120 1180" fill="none" stroke="#3f7393" strokeWidth={16} opacity={0.9} />
          <g fontFamily={font} fontStyle="italic" fontSize={28} fill="#8fb6cc" letterSpacing={3}><text x={150} y={470} transform="rotate(32 150 470)">Sirdaryo</text><text x={560} y={1500}>Amudaryo</text></g>
          <text x={540} y={940} textAnchor="middle" fontFamily={font} fontSize={46} letterSpacing={16} fill="rgba(245,236,213,0.22)">MOVAROUNNAHR</text>
          <text x={840} y={300} textAnchor="middle" fontFamily={font} fontSize={38} letterSpacing={8} fill="rgba(240,201,194,0.75)" opacity={interpolate(fr, [a('s3'), a('s3') + 15], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}>MO'G'ULISTON</text>
          <City x={730} y={610} n="TOSHKENT" fr={fr} f0={a('s3', 0.2)} big />
          <City x={610} y={770} n="CHINOZ" fr={fr} f0={a('s4', 1.8)} dx={-22} />
          <City x={390} y={1130} n="SAMARQAND" fr={fr} f0={a('s3', 0.5)} big />
          <City x={440} y={1300} n="KESH" fr={fr} f0={a('s3', 0.8)} />
          {[["M 960 340 C 900 440, 800 500, 705 640", "#e0392b", a('s3', 1.6)], ["M 430 1270 C 420 1100, 520 950, 640 760", GOLD, a('s4', 0.2)], ["M 560 1420 C 640 1200, 700 980, 690 790", "#5f8fd0", a('s4', 0.7)]].map(([d, c, f0], k) => (
            fr > (f0 as number) + 20 && <path key={k} d={d as string} fill="none" stroke="#fff" strokeWidth={6} strokeLinecap="round" strokeDasharray="2 26" strokeDashoffset={-fr * 2.2} opacity={0.75} />
          ))}
          <Arrow d="M 960 340 C 900 440, 800 500, 705 640" fr={fr} f0={a('s3', 1.6)} f1={z('s4', 2)} col="#c0392b" w={18} />
          <Arrow d="M 430 1270 C 420 1100, 520 950, 640 760" fr={fr} f0={a('s4', 0.2)} f1={z('s4', 2)} col={GOLD} w={18} />
          <Arrow d="M 560 1420 C 640 1200, 700 980, 690 790" fr={fr} f0={a('s4', 0.7)} f1={z('s4', 2)} col="#5f8fd0" w={18} />
          {fr > bt && <g transform="translate(672 690)" opacity={Math.min(1, (fr - bt) / 10)}>
            <circle r={18 + pulse * 46} fill="none" stroke={GOLD} strokeWidth={4} opacity={1 - pulse} />
            <line x1={-16} y1={-16} x2={16} y2={16} stroke={GOLD} strokeWidth={7} strokeLinecap="round" /><line x1={16} y1={-16} x2={-16} y2={16} stroke={GOLD} strokeWidth={7} strokeLinecap="round" />
          </g>}
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------------- overlays ----------------
const HL = new Set(['temur', 'temurning', 'husayn', 'husaynga', 'husaynning', 'amir', 'loy', 'jangi', '1365-yil', "ilyosxo'ja", 'chinoz', 'toshkent', "o'n", 'yetti', "qo'shun", 'ming', 'yazdiy', 'yazdiyning', 'balxda', 'yada', 'rivoyatga']);
const Subs: React.FC = () => {
  const fr = useCurrentFrame();
  const t = fr / FPS;
  const s = data.subs.find((x) => t >= x.t0 && t < x.t1);
  if (!s) return null;
  const o = Math.min(1, (t - s.t0) / 0.18, (s.t1 - t) / 0.15);
  const words = s.text.split(' ');
  return (
    <div style={{position: 'absolute', left: 70, right: 70, top: 1440, textAlign: 'center', opacity: o, fontFamily: font, fontSize: 56, fontWeight: 700, lineHeight: 1.25, letterSpacing: 1.5, color: CREAM, WebkitTextStroke: '5px rgba(0,0,0,0.6)', paintOrder: 'stroke fill', textShadow: '0 0 10px #000, 0 3px 18px #000, 0 0 34px rgba(0,0,0,.9)'}}>
      {words.map((w, i) => <span key={i} style={{color: HL.has(w.toLowerCase().replace(/[.,?!:]+$/g, '')) ? GOLD : CREAM}}>{w}{i < words.length - 1 ? ' ' : ''}</span>)}
    </div>
  );
};
const TopCard: React.FC<{f0: number; f1: number; big: string; small?: string; count?: number}> = ({f0, f1, big, small, count}) => {
  const fr = useCurrentFrame();
  const o = fade(fr, f0, f1, 10);
  if (o <= 0) return null;
  const txt = count ? Math.round(count * interpolate(fr, [f0, f0 + 45], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)})).toLocaleString('ru-RU').replace(/ /g, ' ') : big;
  return (
    <div style={{position: 'absolute', top: 205, left: 0, right: 0, textAlign: 'center', opacity: o}}>
      <div style={{fontFamily: font, fontWeight: 700, fontSize: 104, letterSpacing: 6, color: GOLD, textShadow: '0 4px 22px #000, 0 0 40px rgba(0,0,0,.9)'}}>{txt}</div>
      {small && <div style={{fontFamily: font, fontStyle: 'italic', fontSize: 44, letterSpacing: 3, color: CREAM, textShadow: '0 3px 16px #000'}}>{small}</div>}
    </div>
  );
};
const Title: React.FC = () => {
  const fr = useCurrentFrame();
  const o = fade(fr, 2, a('s2', -0.1), 10);
  const mid2 = (a('s2') + z('s2')) / 2;
  const q1 = fade(fr, a('s2', 0.2), mid2 + 4, 8), q2 = fade(fr, mid2, I1, 8);
  const letters = 'LOY JANGI'.split('');
  const t0 = a('s1', 0.2);
  return (
    <AbsoluteFill>
      {o > 0 && <div style={{position: 'absolute', top: 250, left: 0, right: 0, textAlign: 'center', opacity: o}}>
        <div style={{fontFamily: font, fontSize: 70, letterSpacing: interpolate(fr, [0, a('s2')], [10, 26]), color: CREAM, textShadow: '0 4px 20px #000'}}>1365</div>
        <div style={{fontFamily: font, fontWeight: 700, fontSize: 150, color: GOLD, lineHeight: 1.1, textShadow: '0 6px 30px #000, 0 0 60px rgba(0,0,0,.8)'}}>
          {letters.map((ch, i) => {
            const p = interpolate(fr, [t0 + i * 4, t0 + i * 4 + 12], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.back(1.6))});
            return <span key={i} style={{display: 'inline-block', opacity: p, transform: `translateY(${(1 - p) * 60}px) scale(${0.6 + 0.4 * p})`, minWidth: ch === ' ' ? 40 : undefined, letterSpacing: 6}}>{ch}</span>;
          })}
        </div>
        <div style={{width: interpolate(fr, [t0 + 30, t0 + 60], [0, 420], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}), height: 4, background: GOLD, margin: '14px auto'}} />
      </div>}
      {q1 > 0 && <div style={{position: 'absolute', top: 300, left: 0, right: 0, textAlign: 'center', opacity: q1, fontFamily: font, fontWeight: 700, fontSize: 120, letterSpacing: 6, color: '#cfe2f3', textShadow: '0 6px 30px #000', transform: `scale(${1 + 0.06 * q1})`}}>YOMG'IRMI?</div>}
      {q2 > 0 && <div style={{position: 'absolute', top: 300, left: 0, right: 0, textAlign: 'center', opacity: q2, fontFamily: font, fontWeight: 700, fontSize: 104, letterSpacing: 4, color: '#8fbcf5', textShadow: '0 6px 30px #000', transform: `scale(${1 + 0.06 * q2})`}}>ITTIFOQCHIMI?</div>}
    </AbsoluteFill>
  );
};
const Outro: React.FC = () => {
  const fr = useCurrentFrame();
  const f0 = a('s14', -0.3);
  if (fr < f0) return null;
  const o = interpolate(fr, [f0, f0 + 18], [0, 1], {extrapolateRight: 'clamp'});
  const gap = kf(fr, [[a('s14'), 0], [z('s14'), 150]]);
  const endO = interpolate(fr, [z('s14', 0.3), z('s14', 0.9)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const dots = (col: string, dark: string, side: number) => Array.from({length: 40}).map((_, i) => {
    const x = 540 + side * (70 + gap + (i % 5) * 26 + (random('ox' + i) - 0.5) * 8), y = 700 + Math.floor(i / 5) * 28 + Math.sin(fr / 9 + i) * 2;
    return <g key={i} transform={`translate(${x} ${y})`}><ellipse rx={10} ry={5.5} fill={dark} /><circle r={4.4} fill={col} /></g>;
  });
  return (
    <AbsoluteFill style={{background: `rgba(8,6,5,${0.9 * o})`}}>
      <svg width={1080} height={1920} style={{position: 'absolute', opacity: o * (1 - endO)}}>
        {dots('#e0b93c', '#6b4a10', -1)}{dots('#5f8fd0', '#1d3557', 1)}
        <path d={`M 540 600 l -14 70 l 22 60 l -26 80 l 20 70 l -12 80`} fill="none" stroke="#c0392b" strokeWidth={5} pathLength={1} strokeDasharray={`${Math.min(1, gap / 90)} 1`} />
        <g fontFamily={font} fontSize={40} letterSpacing={6} textAnchor="middle" fill={CREAM}><text x={540 - 130 - gap} y={640}>TEMUR</text><text x={540 + 130 + gap} y={640}>HUSAYN</text></g>
      </svg>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: endO}}>
        <div style={{textAlign: 'center', marginTop: -200}}>
          <div style={{fontFamily: font, fontWeight: 700, fontSize: 84, letterSpacing: 8, color: GOLD}}>TO'LIQ HIKOYA</div>
          <div style={{width: 300, height: 3, background: GOLD, margin: '16px auto'}} />
          <div style={{fontFamily: font, fontStyle: 'italic', fontSize: 52, color: CREAM}}>2-qism: "Do'st va dushman"</div>
          <div style={{fontFamily: font, fontSize: 38, letterSpacing: 3, color: CREAM, marginTop: 30, opacity: 0.85}}>@unutilgan_qissalar</div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const LoyJangi: React.FC = () => {
  const fr = useCurrentFrame();
  const sw = a('s5', -0.5);
  const mapO = Math.min(interpolate(fr, [sw, sw + 16], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}), interpolate(fr, [I1, I1 + 18], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
  const rivO = fade(fr, a('s7'), z('s7', 0.2), 10);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {(fr >= sw - 2 || fr < I1 + 20) && <Field />}
      {mapO > 0 && <AbsoluteFill style={{opacity: mapO}}><MapScene /></AbsoluteFill>}
      <div style={{position: 'absolute', left: 0, right: 0, top: 1100, bottom: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0), rgba(0,0,0,0.72))'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 420, background: 'linear-gradient(0deg, rgba(0,0,0,0), rgba(0,0,0,0.55))'}} />
      <Title />
      {rivO > 0 && <div style={{position: 'absolute', top: 190, left: 50, opacity: rivO, color: GOLD, fontFamily: font, fontSize: 38, letterSpacing: 8, border: `2px solid ${GOLD}`, padding: '8px 24px', background: 'rgba(0,0,0,0.45)'}}>RIVOYAT</div>}
      <TopCard f0={a('s10', 0.3)} f1={z('s10', 0.2)} big="17" small="qo'shun" />
      <TopCard f0={a('s13', 3.6)} f1={z('s13', 0.3)} big="" count={10000} small="halok bo'lgan · Yazdiy bo'yicha" />
      <Outro />
      <Subs />
    </AbsoluteFill>
  );
};

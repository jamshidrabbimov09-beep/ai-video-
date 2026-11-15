// Motion-design inserts for Part 5 "Dasht yurishi" (2026-11-15). Same look as p4motion.tsx (real relief map, 14th-century uluses).
// Nothing is drawn in the subtitle band (y >= 1380); date cards sit on top (y < 520). Routes and rivers are approximate.
import React from 'react';
import {useCurrentFrame, Easing} from 'remotion';
import {GOLD, CREAM, RED, font, io, Paper, Label, Node} from './p3motion';
import {proj, pts, Geo, Arrow, Flame, SYR, AMU, ARAL, VOLGA, KURA, JOCHI, CHAGATAY} from './p4motion';

type LL = [number, number];
// hand-drawn rivers north of the Part 4 map data
const VOLGA_N: LL[] = [[49.1, 55.8], [48.6, 55.6], [49.0, 55.2], [48.6, 54.3], [49.0, 53.9], [49.6, 53.4], [50.2, 53.2], [49.9, 53.0], [49.0, 52.6], [48.0, 51.8], [47.0, 51.3], [46.1, 50.2], [45.0, 49.5]];
const YAIQ: LL[] = [[59.0, 53.8], [58.5, 52.5], [57.2, 51.8], [55.0, 51.7], [53.5, 51.5], [52.0, 51.3], [51.4, 50.9], [51.3, 50.0], [51.8, 49.0], [51.6, 48.0], [51.8, 47.0]];
const SARYSU: LL[] = [[71.0, 48.8], [69.6, 47.9], [68.3, 46.9], [67.0, 45.9], [66.3, 45.3]];
const TEREK: LL[] = [[44.6, 42.7], [44.7, 43.4], [45.4, 43.6], [46.3, 43.8], [47.1, 43.9], [47.5, 43.8]];
const Q: Record<string, LL> = {
  samarqand: [66.96, 39.65], toshkent: [69.24, 41.3], sabran: [68.7, 43.55], sariq: [68.4, 47.0], ulug: [67.0, 48.6],
  qunduzcha: [50.4, 53.7], itil: [48.9, 54.4], saroy: [47.3, 47.0], darband: [48.29, 42.06], terek: [44.9, 43.5],
  tabriz: [46.3, 38.08], sheroz: [52.5, 29.6], dehli: [77.2, 28.6],
};
// the 1391 march: Samarqand - Toshkent - Sabran - Sariq O'zan (14 March) - Ulug' tog' - north-west across the Yaiq - Qunduzcha (18 June)
const MARCH: LL[] = [Q.samarqand, Q.toshkent, Q.sabran, Q.sariq, Q.ulug, [65.0, 51.3], [62.0, 52.4], [58.0, 52.6], [55.0, 52.4], [52.6, 52.6], Q.qunduzcha];

const Place: React.FC<{P: (l: LL) => [number, number]; at: LL; t: string; o: number; side?: 'start' | 'end'; col?: string; size?: number; r?: number; pulse?: number}> = ({P, at, t, o, side = 'start', col = CREAM, size = 40, r = 14, pulse = 0}) => {
  const [x, y] = P(at);
  return (<g><Node x={x} y={y} r={r} o={o} pulse={pulse} /><Label x={x + (side === 'start' ? 34 : -34)} y={y + 14} t={t} o={o} size={size} col={col} anchor={side} /></g>);
};
const Riv: React.FC<{P: (l: LL) => [number, number]; r: LL[]; o?: number}> = ({P, r, o = 1}) => (
  <path d={`M ${pts(P, r)}`} fill="none" stroke="#8fc2d4" strokeWidth={5} strokeOpacity={0.9 * o} strokeLinejoin="round" strokeLinecap="round" />
);
// counter box: "21 KUN" etc. (never repeats the subtitle)
const Counter: React.FC<{x: number; y: number; n: number; unit: string; o: number}> = ({x, y, n, unit, o}) => (
  <g opacity={o}>
    <rect x={x - 170} y={y - 86} width={340} height={124} rx={14} fill="rgba(10,7,3,0.72)" stroke={GOLD} strokeWidth={3} />
    <text x={x - 14} y={y + 10} textAnchor="end" fontFamily={font} fontWeight={700} fontSize={96} fill={GOLD}>{Math.round(n)}</text>
    <text x={x + 4} y={y + 6} textAnchor="start" fontFamily={font} fontSize={50} letterSpacing={4} fill={CREAM}>{unit}</text>
  </g>
);
const marchPts = (P: (l: LL) => [number, number], upto: number) => MARCH.slice(0, upto).map((p) => P(p));

/* C: "Qo'shin dashtga kiradi. Uch hafta suvsiz yurish." Samarqand -> Sariq O'zan, a day counter to 21 (Yazdi: 21 Feb -> 14 Mar 1391) */
export const Route: React.FC<{d: number}> = ({d}) => {
  const fr = useCurrentFrame();
  const P = proj([58, 76, 37.5, 50.5], [60, 420, 1020, 1330]);
  const t = io(fr, 6, d - 8, Easing.inOut(Easing.quad));
  return (
    <Paper d={d} zoom={[1.0, 1.06]}>
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <Geo P={P} rivers={[SYR, AMU]} seas={[ARAL]} />
        <Riv P={P} r={SARYSU} />
        <Arrow p={marchPts(P, 4)} a={6} b={d - 8} col={GOLD} w={8} />
        <Place P={P} at={Q.samarqand} t="SAMARQAND" o={io(fr, 0, 8)} r={16} col={GOLD} />
        <Place P={P} at={Q.sariq} t="SARIQ O'ZAN" o={io(fr, d - 16, d - 8)} side="end" />
        <Counter x={540} y={330} n={21 * t} unit="KUN" o={io(fr, 2, 10)} />
      </svg>
    </Paper>
  );
};

/* E: 1391, 18 June — the whole march to Qunduzcha (117 days: 21 Feb -> 18 Jun), then the two armies face each other */
export const Route6: React.FC<{d: number}> = ({d}) => {
  const fr = useCurrentFrame();
  const P = proj([44, 74, 37.5, 57.5], [40, 540, 1040, 1350]);
  const end = d * 0.72;
  const t = io(fr, 4, end, Easing.inOut(Easing.quad));
  const [qx, qy] = P(Q.qunduzcha);
  const face = io(fr, end, end + 14);
  return (
    <Paper d={d} zoom={[1.0, 1.05]}>
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <Geo P={P} rivers={[SYR, AMU, VOLGA]} seas={[ARAL]} />
        {[VOLGA_N, YAIQ, SARYSU].map((r, i) => <Riv key={i} P={P} r={r} />)}
        <Arrow p={marchPts(P, MARCH.length)} a={4} b={end} col={GOLD} w={7} />
        <Place P={P} at={Q.samarqand} t="SAMARQAND" o={1} r={13} size={34} col={GOLD} />
        <Place P={P} at={Q.ulug} t="ULUG' TOG'" o={io(fr, end * 0.35, end * 0.35 + 8)} r={11} size={34} />
        <Place P={P} at={Q.qunduzcha} t="QUNDUZCHA" o={io(fr, end - 8, end)} side="start" size={44} col={GOLD} pulse={face > 0 ? (fr % 30) / 30 : 0} />
        {face > 0 && <g opacity={face}>
          <path d={`M ${qx - 70} ${qy - 56} l 140 0`} stroke={RED} strokeWidth={12} strokeLinecap="round" />
          <path d={`M ${qx - 50} ${qy + 50} l 100 0`} stroke={GOLD} strokeWidth={12} strokeLinecap="round" />
        </g>}
        <Counter x={860} y={600} n={117 * t} unit="KUN" o={io(fr, 2, 10)} />
      </svg>
    </Paper>
  );
};

/* F: Qunduzcha battle scheme — Temur's seven divisions and tents; the horde clashes, then swings round to the rear;
   Temur's own guard turns on it and the horde breaks and flees. Schematic, no map. */
export const Flank: React.FC<{d: number}> = ({d}) => {
  const fr = useCurrentFrame();
  const clash = io(fr, 4, d * 0.25);
  const swing = io(fr, d * 0.3, d * 0.72, Easing.inOut(Easing.cubic));
  const charge = io(fr, d * 0.74, d * 0.9);
  const flee = io(fr, d * 0.86, d);
  const divX = [180, 300, 420, 540, 660, 780, 900];
  const ty = 900;
  // horde: front body comes down to the line, then a wing swings round the right flank to the rear (y 1180)
  const fy = 520 + 230 * clash;
  const ang = swing * Math.PI;                 // 0 -> 180 degrees round the right side
  const wx = 540 + 420 * Math.sin(ang), wy = ty - 2 + -150 * Math.cos(ang) + 130 * swing;
  const wing = {x: wx + 120 * flee, y: wy - 520 * flee};
  return (
    <Paper d={d} zoom={[1.0, 1.04]}>
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        {/* tents behind the line */}
        {[260, 420, 660, 820].map((x, i) => <path key={i} d={`M ${x - 34} ${ty + 150} l 34 -44 l 34 44 z`} fill="rgba(245,236,213,0.55)" stroke="#000" strokeWidth={3} />)}
        {divX.map((x, i) => <rect key={i} x={x - 46} y={ty - 26} width={92} height={52} rx={8} fill={GOLD} stroke="#1a120a" strokeWidth={4} opacity={io(fr, i * 2, i * 2 + 8)} />)}
        <Label x={540} y={ty + 100} t="TEMUR" o={io(fr, 4, 12)} size={46} col={GOLD} />
        {/* horde front */}
        <g opacity={1 - flee}>
          {Array.from({length: 9}).map((_, i) => <rect key={i} x={110 + i * 100} y={fy - 24} width={78} height={44} rx={6} fill={RED} stroke="#000" strokeWidth={3} opacity={0.9} />)}
        </g>
        <Label x={540} y={fy - 60 - 300 * flee} t="TO'XTAMISH" o={io(fr, 2, 10) * (1 - 0.5 * flee)} size={46} col="#ffc2b0" />
        {/* the wing that goes round to the rear */}
        {swing > 0 && <g>
          <path d={`M ${540 + 420 * Math.sin(0)} ${ty - 150} A 420 260 0 0 1 ${wx} ${wy}`} fill="none" stroke={RED} strokeWidth={8} strokeDasharray="18 14" opacity={0.8 * (1 - flee)} />
          <circle cx={wing.x} cy={wing.y} r={46} fill={RED} stroke="#000" strokeWidth={4} opacity={1 - 0.6 * flee} />
        </g>}
        {/* Temur's guard turns on it */}
        {charge > 0 && <Arrow p={[[540, ty + 30], [540 + (wx - 540) * 0.85, ty + 30 + (wy - ty - 30) * 0.85]]} a={d * 0.74} b={d * 0.9} col="#ffe08a" w={10} />}
        {flee > 0 && <Arrow p={[[700, 560], [760, 300]]} a={d * 0.86} b={d - 2} col={RED} w={8} />}
      </svg>
    </Paper>
  );
};

/* G: the pursuit — from Qunduzcha west to the Itil (Volga) */
export const Pursuit: React.FC<{d: number}> = ({d}) => {
  const fr = useCurrentFrame();
  const P = proj([45, 56, 49.5, 57], [60, 420, 1020, 1340]);
  const A = (dy: number) => ([[51.6, 53.9 + dy], [50.6, 53.9 + dy], [49.4, 54.2 + dy]] as LL[]).map((p) => P(p));
  return (
    <Paper d={d} zoom={[1.0, 1.08]}>
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <Geo P={P} rivers={[VOLGA]} seas={[]} ulus={0} />
        <Riv P={P} r={VOLGA_N} />
        <Riv P={P} r={YAIQ} />
        {[-0.5, 0, 0.5].map((dy, i) => <Arrow key={'r' + i} p={A(dy)} a={2 + i * 3} b={d * 0.7 + i * 3} col={RED} w={7} />)}
        {[-0.3, 0.3].map((dy, i) => <Arrow key={'g' + i} p={A(dy).map(([x, y]) => [x + 60, y] as [number, number])} a={10 + i * 4} b={d * 0.82 + i * 3} col={GOLD} w={8} />)}
        <Place P={P} at={Q.qunduzcha} t="QUNDUZCHA" o={1} side="start" size={38} />
        <Label x={P([48.4, 55.1])[0]} y={P([48.4, 55.1])[1]} t="ITIL (VOLGA)" o={io(fr, d * 0.45, d * 0.45 + 10)} size={42} col="#cfe6ee" />
      </svg>
    </Paper>
  );
};

/* H: 1395 — To'xtamish comes south to the Terek, Temur comes north through Darband; they clash on the Terek */
export const Terek: React.FC<{d: number}> = ({d}) => {
  const fr = useCurrentFrame();
  const P = proj([40.5, 52, 38.5, 48.5], [60, 420, 1020, 1340]);
  const xt = d * 0.6;
  const [cx, cy] = P(Q.terek);
  const red = ([[45.8, 47.6], [45.6, 45.6], [45.1, 44.0]] as LL[]).map((p) => P(p));
  const gold = ([[48.6, 40.2], Q.darband, [47.2, 43.0], [45.5, 43.2]] as LL[]).map((p) => P(p));
  const hit = io(fr, xt, xt + 8);
  return (
    <Paper d={d} zoom={[1.0, 1.06]}>
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <Geo P={P} rivers={[VOLGA, KURA]} seas={[]} ulus={0} />
        <Riv P={P} r={TEREK} />
        <Arrow p={red} a={2} b={xt} col={RED} w={8} />
        <Arrow p={gold} a={4} b={xt} col={GOLD} w={8} />
        <Place P={P} at={Q.darband} t="DARBAND" o={io(fr, 4, 12)} side="start" size={36} r={11} />
        <Label x={P([46.5, 44.2])[0]} y={P([46.5, 44.2])[1]} t="TEREK" o={io(fr, 0, 10)} size={44} col="#cfe6ee" />
        {hit > 0 && <g transform={`translate(${cx} ${cy}) scale(${0.6 + 0.6 * hit})`} opacity={hit}>
          <line x1={-34} y1={-34} x2={34} y2={34} stroke="#fff3cf" strokeWidth={10} strokeLinecap="round" />
          <line x1={34} y1={-34} x2={-34} y2={34} stroke="#fff3cf" strokeWidth={10} strokeLinecap="round" />
        </g>}
        <Flame x={cx} y={cy - 70} o={io(fr, xt + 6, xt + 14)} s={0.8} />
      </svg>
    </Paper>
  );
};

/* H: "Oltin O'rda bu zarbadan hech qachon o'ziga kela olmadi" — the Ulus of Jochi cracks and fades */
export const Fall: React.FC<{d: number}> = ({d}) => {
  const fr = useCurrentFrame();
  const P = proj([30, 82, 36, 60], [30, 380, 1050, 1340]);
  const crack = io(fr, 10, d * 0.5);
  const fade = io(fr, d * 0.45, d - 6);
  const cracks: LL[][] = [[[50, 58], [52, 54], [49, 51], [51, 47.5], [48.5, 44.5]], [[62, 58], [60, 53], [63, 49.5], [61, 46.5]], [[40, 56], [42, 52], [39.5, 49], [41, 46.5]], [[72, 57], [70, 52], [73, 48.5]]];
  return (
    <Paper d={d} zoom={[1.06, 1.0]}>
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <Geo P={P} rivers={[SYR, AMU, VOLGA]} seas={[ARAL]} ulus={0} />
        <path d={`M ${pts(P, JOCHI)} Z`} fill="#c0563b" fillOpacity={0.42 * (1 - fade) + 0.06} stroke="#c0563b" strokeWidth={5} strokeOpacity={0.9 * (1 - fade * 0.8)} strokeDasharray={fade > 0 ? '14 12' : undefined} />
        <path d={`M ${pts(P, CHAGATAY)} Z`} fill="#e0b13a" fillOpacity={0.3} stroke="#e0b13a" strokeWidth={5} />
        {cracks.map((c, i) => <path key={i} d={`M ${pts(P, c)}`} fill="none" stroke="#120b05" strokeWidth={7} pathLength={1} strokeDasharray={`${io(fr, 10 + i * 6, d * 0.5 + i * 6)} 1`} opacity={crack} />)}
        <Label x={P([52, 50.5])[0]} y={P([52, 50.5])[1]} t="OLTIN O'RDA" o={1 - fade * 0.65} size={54} col="#ffc2b0" />
        <Label x={P([66, 41.0])[0]} y={P([66, 41.0])[1]} t="TEMUR" o={io(fr, 0, 10)} size={44} col="#ffe08a" />
      </svg>
    </Paper>
  );
};

/* teaser: Temur looks south — arrows to Iran and India */
export const South: React.FC<{d: number}> = ({d}) => {
  const fr = useCurrentFrame();
  const P = proj([42, 82, 22, 46], [40, 420, 1040, 1340]);
  const s = P(Q.samarqand);
  const toIran = ([Q.samarqand, [60.5, 36.3], [56.0, 33.0], Q.sheroz] as LL[]).map((p) => P(p));
  const toInd = ([Q.samarqand, [68.5, 36.0], [71.5, 33.5], [74.5, 31.0], Q.dehli] as LL[]).map((p) => P(p));
  return (
    <Paper d={d} zoom={[1.0, 1.06]}>
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <Geo P={P} rivers={[SYR, AMU]} seas={[ARAL]} ulus={0} />
        <path d={`M ${pts(P, CHAGATAY)} Z`} fill="#e0b13a" fillOpacity={0.3} stroke="#e0b13a" strokeWidth={5} />
        <Arrow p={toIran} a={6} b={d * 0.55} col={GOLD} w={8} />
        <Arrow p={toInd} a={d * 0.3} b={d - 6} col={GOLD} w={8} />
        <Node x={s[0]} y={s[1]} r={18} o={1} pulse={(fr % 30) / 30} />
        <Label x={s[0] + 34} y={s[1] - 14} t="SAMARQAND" o={1} size={38} col={GOLD} anchor="start" />
        <Label x={P([54, 32.5])[0]} y={P([54, 32.5])[1]} t="ERON" o={io(fr, d * 0.3, d * 0.3 + 10)} size={58} col={CREAM} />
        <Label x={P([76.5, 25.5])[0]} y={P([76.5, 25.5])[1]} t="HINDISTON" o={io(fr, d * 0.7, d * 0.7 + 10)} size={58} col={CREAM} />
      </svg>
    </Paper>
  );
};

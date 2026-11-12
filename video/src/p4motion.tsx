// Motion-design inserts for Part 4 "O'zi qutqargan dushman" (2026-11-12). Same look as p3motion.tsx (paper map, gold nodes).
// Nothing is drawn in the subtitle band (y >= 1380). Maps use a simple equirectangular projection of real coordinates.
import React from 'react';
import {interpolate, useCurrentFrame, Easing, random, staticFile} from 'remotion';
import borders from './borders_p4.json';
import {GOLD, CREAM, RED, font, cl, io, Paper, Label, Node} from './p3motion';

type LL = [number, number]; // [lon, lat]
type Box = [number, number, number, number];
const proj = (b: [number, number, number, number], box: Box) => {
  const [lo0, lo1, la0, la1] = b;
  const c = Math.cos((((la0 + la1) / 2) * Math.PI) / 180);
  const k = Math.min((box[2] - box[0]) / ((lo1 - lo0) * c), (box[3] - box[1]) / (la1 - la0));
  const w = (lo1 - lo0) * c * k, h = (la1 - la0) * k;
  const ox = (box[0] + box[2]) / 2 - w / 2, oy = (box[1] + box[3]) / 2 - h / 2;
  return ([lo, la]: LL): [number, number] => [ox + (lo - lo0) * c * k, oy + (la1 - la) * k];
};
const CASPIAN: LL[] = [[47.5, 46.5], [49, 46.6], [51, 46.9], [53, 46.5], [53.1, 45.3], [51.3, 44.5], [51.2, 43.2], [52.7, 42.0], [53, 40.5], [53.9, 38.5], [53.9, 37.3], [51, 36.7], [49.5, 37.5], [48.9, 38.5], [49.3, 40.3], [49.9, 40.5], [48.5, 41.8], [47.5, 43.0], [47.4, 44.4], [47.0, 45.5]];
const ARAL: LL[] = [[58.3, 46.3], [59.6, 46.8], [61.2, 46.6], [61.9, 45.8], [61.4, 44.6], [60.3, 43.6], [58.9, 43.9], [58.2, 45.0]];
const SYR: LL[] = [[71.0, 40.9], [69.6, 40.3], [68.9, 41.3], [68.3, 42.8], [67.6, 43.9], [66.4, 44.6], [65.5, 44.8], [63.8, 45.6], [61.8, 46.1]];
const AMU: LL[] = [[68.4, 37.1], [67.3, 37.2], [65.6, 37.8], [64.2, 38.9], [62.6, 40.3], [61.2, 41.3], [60.4, 42.4], [59.9, 43.6]];
const VOLGA: LL[] = [[45.0, 49.5], [46.5, 48.4], [46.9, 47.6], [47.8, 46.4]];
const KURA: LL[] = [[44.8, 41.7], [46.4, 41.1], [47.7, 40.4], [48.6, 39.9], [49.2, 39.3]];
export const PL: Record<string, LL> = {
  signoq: [68.2, 44.1], otror: [68.3, 42.85], sabran: [68.7, 43.55], samarqand: [66.96, 39.65], buxoro: [64.42, 39.77], qarshi: [65.8, 38.86],
  termiz: [67.3, 37.25], saroy: [47.3, 47.0], darband: [48.29, 42.06], shirvon: [48.6, 40.6], tabriz: [46.3, 38.08],
};
const pts = (P: (l: LL) => [number, number], a: LL[]) => a.map((p) => P(p).join(' ')).join(' L ');
// 14th-century uluses, drawn by hand after the books (approximate: there were no fixed borders).
// Chig'atoy ulusi under Temur in the 1370s: Movarounnahr between the Amu and Syr Darya, Fergana, Balx up to the Hindu Kush; Xorazm not yet his.
const CHAGATAY: LL[] = [[61.8, 40.6], [63.0, 41.9], [65.8, 42.2], [67.6, 42.0], [68.9, 42.4], [70.4, 42.2], [71.6, 41.6], [73.6, 40.8], [73.4, 39.6], [71.6, 39.4], [71.6, 37.2], [70.8, 36.1], [69.4, 35.3], [67.4, 35.0], [65.4, 35.6], [64.2, 36.3], [63.2, 37.3], [62.4, 38.7], [61.6, 39.6]];
// Jo'chi ulusi: the Qipchoq steppe from the Syr Darya (Sig'noq, O'tror region) and the Aral to the Volga, the Crimea and Darband.
const JOCHI: LL[] = [[25, 47.0], [25, 66], [85, 66], [85, 50.5], [80, 49.5], [77.0, 46.5], [73.0, 45.2], [70.4, 44.2], [68.9, 42.9], [67.6, 43.6], [66.4, 44.4], [65.5, 44.6], [63.8, 45.3], [61.8, 45.8], [61.4, 44.6], [60.3, 43.6], [58.6, 43.2], [56.0, 43.6], [53.5, 43.2], [52.0, 42.6], [50.0, 42.6], [48.5, 41.9], [46.8, 42.5], [44.0, 43.0], [41.0, 43.5], [38.0, 45.0], [35.5, 45.0], [33.0, 46.0]];
export const ULUS = {CHAGATAY, JOCHI};
const Relief: React.FC<{P: (l: LL) => [number, number]}> = ({P}) => {
  const [x0, y0] = P([25, 64]), [x1, y1] = P([85, 14]);
  return (
    <g>
      <image href={staticFile('maps/relief_p4.jpg')} x={x0} y={y0} width={x1 - x0} height={y1 - y0} preserveAspectRatio="none" />
      {(borders.lines as LL[][]).map((l, i) => <path key={i} d={`M ${pts(P, l)}`} fill="none" stroke="#f5ecd5" strokeWidth={2} strokeOpacity={0.28} strokeDasharray="6 8" />)}
    </g>
  );
};
const Ulus: React.FC<{P: (l: LL) => [number, number]; poly: LL[]; col: string; o: number}> = ({P, poly, col, o}) => (
  <path d={`M ${pts(P, poly)} Z`} fill={col} fillOpacity={0.28 * o} stroke={col} strokeWidth={5} strokeOpacity={0.9 * o} strokeLinejoin="round" />
);
const TEMUR_COL = '#e0b13a', JOCHI_COL = '#c0563b';
const Geo: React.FC<{P: (l: LL) => [number, number]; rivers?: LL[][]; seas?: LL[][]; ulus?: number}> = ({P, rivers = [SYR, AMU, VOLGA, KURA], seas = [ARAL], ulus = 1}) => (
  <g>
    <Relief P={P} />
    {ulus > 0 && <Ulus P={P} poly={JOCHI} col={JOCHI_COL} o={ulus} />}
    {ulus > 0 && <Ulus P={P} poly={CHAGATAY} col={TEMUR_COL} o={ulus} />}
    {(borders.lakes as LL[][]).map((s, i) => <path key={'l' + i} d={`M ${pts(P, s)} Z`} fill="#4a6b7a" stroke="#9cc3cf" strokeWidth={3} strokeOpacity={0.7} />)}
    {seas.map((s, i) => <path key={'s' + i} d={`M ${pts(P, s)} Z`} fill="#4a6b7a" fillOpacity={1} stroke="#9cc3cf" strokeWidth={3} strokeOpacity={0.7} />)}
    {(borders.rivers as LL[][]).map((r, i) => <path key={'r' + i} d={`M ${pts(P, r)}`} fill="none" stroke="#8fc2d4" strokeWidth={4} strokeOpacity={0.9} strokeLinejoin="round" />)}
  </g>
);
const UlusLabel: React.FC<{P: (l: LL) => [number, number]; at: LL; t: string; col: string; o: number; size?: number}> = ({P, at, t, col, o, size = 34}) => {
  const [x, y] = P(at);
  return <Label x={x} y={y} t={t} o={o} size={size} col={col} />;
};
// arrow along a polyline that draws itself between frames a..b
const Arrow: React.FC<{p: [number, number][]; a: number; b: number; col?: string; w?: number}> = ({p, a, b, col = RED, w = 9}) => {
  const fr = useCurrentFrame();
  const t = io(fr, a, b);
  if (t <= 0) return null;
  const seg = p.slice(1).map((q, i) => Math.hypot(q[0] - p[i][0], q[1] - p[i][1]));
  const L = seg.reduce((x, y) => x + y, 0);
  let rem = t * L, k = 0;
  while (k < seg.length - 1 && rem > seg[k]) { rem -= seg[k]; k++; }
  const f = Math.min(1, rem / seg[k]);
  const hx = p[k][0] + (p[k + 1][0] - p[k][0]) * f, hy = p[k][1] + (p[k + 1][1] - p[k][1]) * f;
  const ang = Math.atan2(p[k + 1][1] - p[k][1], p[k + 1][0] - p[k][0]) * 180 / Math.PI;
  const d = 'M ' + p.slice(0, k + 1).map((q) => q.join(' ')).join(' L ') + ` L ${hx} ${hy}`;
  return (
    <g>
      <path d={d} stroke="rgba(0,0,0,0.55)" strokeWidth={w + 8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} stroke={col} strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M 0 0 L -34 -20 L -26 0 L -34 20 Z" fill={col} stroke="rgba(0,0,0,0.6)" strokeWidth={3} transform={`translate(${hx} ${hy}) rotate(${ang})`} />
    </g>
  );
};
const Flame: React.FC<{x: number; y: number; s?: number; o: number}> = ({x, y, s = 1, o}) => {
  const fr = useCurrentFrame();
  const fl = 1 + 0.12 * Math.sin(fr / 2.3) + 0.08 * Math.sin(fr / 1.7);
  return (
    <g transform={`translate(${x} ${y}) scale(${s * fl * o})`} opacity={o}>
      <circle r={54} fill="rgba(255,120,30,0.25)" />
      <path d="M 0 -58 C 26 -26 30 -6 22 14 C 16 30 -16 30 -22 14 C -30 -6 -14 -22 0 -58 Z" fill="#ff7a1a" />
      <path d="M 0 -30 C 12 -12 14 0 9 12 C 5 20 -5 20 -9 12 C -13 0 -6 -12 0 -30 Z" fill="#ffd36a" />
    </g>
  );
};
const City: React.FC<{P: (l: LL) => [number, number]; k: string; t: string; o: number; side?: 'start' | 'end'; col?: string; size?: number; r?: number; pulse?: number; dy?: number}> = ({P, k, t, o, side = 'start', col = CREAM, size = 40, r = 14, pulse = 0, dy = 14}) => {
  const [x, y] = P(PL[k]);
  return (<g><Node x={x} y={y} r={r} o={o} pulse={pulse} /><Label x={x + (side === 'start' ? 34 : -34)} y={y + dy} t={t} o={o} size={size} col={col} anchor={side} /></g>);
};

/* A: "Bu Chingizxon avlodidan bo'lgan shahzoda" — the line from Chinggis Khan down to an unnamed prince */
export const Line: React.FC<{d: number}> = ({d}) => {
  const fr = useCurrentFrame();
  const ys = [400, 640, 800, 920, 1040];
  const q = io(fr, 50, 64);
  return (
    <Paper d={d} zoom={[1.0, 1.06]}>
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <path d={`M 540 ${ys[0]} L 540 1180`} stroke={GOLD} strokeWidth={6} pathLength={1} strokeDasharray={`${io(fr, 6, 54)} 1`} />
        <Node x={540} y={ys[0]} r={26} o={io(fr, 0, 8)} pulse={(fr % 40) / 40} />
        <Label x={540} y={ys[0] - 56} t="CHINGIZXON" o={io(fr, 2, 12)} size={56} col={GOLD} />
        <Node x={540} y={ys[1]} r={18} o={io(fr, 18, 24)} />
        <Label x={580} y={ys[1] + 14} t="JO'CHI" o={io(fr, 18, 28)} size={44} anchor="start" />
        {ys.slice(2).map((y, i) => <Node key={i} x={540} y={y} r={9} o={io(fr, 28 + i * 7, 34 + i * 7)} />)}
        <g opacity={q}>
          <circle cx={540} cy={1180} r={44 + 14 * Math.sin(fr / 6)} fill="rgba(212,175,55,0.22)" />
          <Node x={540} y={1180} r={30} o={1} col="#f3d36b" />
          <text x={540} y={1198} textAnchor="middle" fontFamily={font} fontSize={50} fontWeight={700} fill="#1a120a">?</text>
        </g>
      </svg>
    </Paper>
  );
};

/* B: O'tror and Sig'noq on the Syr Darya are given to To'xtamish */
const B_LANDS: [number, number, number, number] = [63.0, 72.0, 38.6, 46.2];
export const Lands: React.FC<{d: number}> = ({d}) => {
  const fr = useCurrentFrame();
  const P = proj(B_LANDS, [60, 300, 1020, 1330]);
  const [sx, sy] = P(PL.samarqand), [ox, oy] = P(PL.otror), [gx, gy] = P(PL.signoq);
  const zone = io(fr, 30, 56);
  return (
    <Paper d={d} zoom={[1.0, 1.08]}>
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <Geo P={P} />
        <ellipse cx={(ox + gx) / 2} cy={(oy + gy) / 2} rx={150 * zone} ry={150 * zone} fill="rgba(212,175,55,0.22)" stroke={GOLD} strokeWidth={4} strokeDasharray="14 10" />
        <Arrow p={[[sx, sy - 30], [sx + 60, (sy + oy) / 2], [ox - 10, oy + 40]]} a={6} b={34} col={GOLD} w={7} />
        <City P={P} k="samarqand" t="SAMARQAND" o={io(fr, 0, 10)} r={18} col={GOLD} />
        <City P={P} k="otror" t="O'TROR" o={io(fr, 22, 32)} side="end" />
        <City P={P} k="signoq" t="SIG'NOQ" o={io(fr, 34, 44)} side="end" />
        <UlusLabel P={P} at={[65.2, 40.9]} t="CHIG'ATOY ULUSI" col="#ffe08a" o={io(fr, 0, 12)} />
        <UlusLabel P={P} at={[64.6, 45.5]} t="JO'CHI ULUSI" col="#ffc2b0" o={io(fr, 0, 12)} />
      </svg>
    </Paper>
  );
};

/* D: "to'rt marta qochib keldi" — four flights south to Temur, each answered by a gold arrow back north; a counter 1..4 */
export const Four: React.FC<{d: number}> = ({d}) => {
  const fr = useCurrentFrame();
  const P = proj(B_LANDS, [60, 420, 1020, 1340]);
  const [sx, sy] = P(PL.samarqand), [gx, gy] = P(PL.signoq);
  const per = (d - 24) / 4;
  const n = Math.min(4, Math.floor((fr - 6) / per) + 1);
  const items: React.ReactNode[] = [];
  for (let i = 0; i < 4; i++) {
    const a = 6 + i * per, off = (i - 1.5) * 34;
    const down = io(fr, a, a + per * 0.45), up = io(fr, a + per * 0.5, a + per * 0.95);
    const x0 = gx + off, y0 = gy + 20, x1 = sx + off * 0.6, y1 = sy - 40;
    if (fr < a) continue;
    items.push(<g key={i} opacity={i + 1 < n ? 0.35 : 1}>
      <path d={`M ${x0} ${y0} L ${x0 + (x1 - x0) * down} ${y0 + (y1 - y0) * down}`} stroke="#e6c9b8" strokeWidth={4} strokeDasharray="8 10" />
      {down < 1 && <circle cx={x0 + (x1 - x0) * down} cy={y0 + (y1 - y0) * down} r={13} fill="#e6c9b8" stroke="#000" strokeWidth={3} />}
      {up > 0 && <path d={`M ${x1} ${y1} L ${x1 + (x0 - x1) * up} ${y1 + (y0 - y1) * up}`} stroke={GOLD} strokeWidth={7} />}
    </g>);
  }
  const pop = interpolate((fr - 6) % per, [0, 8], [1.35, 1], cl);
  return (
    <Paper d={d} zoom={[1.0, 1.05]}>
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <Geo P={P} rivers={[SYR, AMU]} seas={[ARAL]} />
        {items}
        <City P={P} k="signoq" t="SIG'NOQ" o={1} side="end" />
        <City P={P} k="samarqand" t="TEMUR" o={1} r={22} col={GOLD} size={48} />
        {fr >= 6 && <g transform={`translate(540 300) scale(${pop})`}>
          <text x={0} y={40} textAnchor="middle" fontFamily={font} fontWeight={700} fontSize={150} fill={GOLD} stroke="#000" strokeWidth={8} paintOrder="stroke">{n}</text>
        </g>}
        {Array.from({length: 4}).map((_, i) => <rect key={i} x={430 + i * 60} y={360} width={40} height={10} rx={5} fill={i < n ? GOLD : 'rgba(245,236,213,0.25)'} />)}
      </svg>
    </Paper>
  );
};

/* E: the whole Ulus of Jochi falls to To'xtamish — gold spreads from Sig'noq over the steppe to Saroy on the Volga */
export const Horde: React.FC<{d: number}> = ({d}) => {
  const fr = useCurrentFrame();
  const P = proj([42, 74, 35.5, 54], [40, 300, 1040, 1340]);
  const [gx, gy] = P(PL.signoq);
  const r = interpolate(fr, [4, d - 10], [0, 900], {...cl, easing: Easing.out(Easing.cubic)});
  const steppe = `M ${pts(P, [[43, 50.5], [46, 52.2], [50, 51.4], [54, 52.6], [58, 51.6], [62, 52.8], [66, 51.7], [70, 52.4], [73.5, 51.2], [73.5, 44.5], [69.5, 43.3], [66, 44.6], [62, 46.8], [58, 46.5], [55, 44.8], [53.2, 45.5], [50, 44.0], [47.5, 43.6], [45, 44.5], [43, 46]])} Z`;
  return (
    <Paper d={d} zoom={[1.05, 1.0]}>
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <defs><clipPath id="hz"><circle cx={gx} cy={gy} r={r} /></clipPath></defs>
        <path d={`M ${pts(P, JOCHI)} Z`} fill="rgba(255,190,90,0.42)" stroke="#ffcf6a" strokeWidth={6} clipPath="url(#hz)" />
        <Geo P={P} rivers={[SYR, AMU, VOLGA]} seas={[ARAL]} />
        <City P={P} k="signoq" t="SIG'NOQ" o={1} side="end" pulse={(fr % 30) / 30} />
        <City P={P} k="saroy" t="SAROY" o={io(fr, d * 0.55, d * 0.55 + 10)} r={16} col={GOLD} />
        <UlusLabel P={P} at={[66.0, 41.0]} t="CHIG'ATOY ULUSI" col="#ffe08a" o={0.9} size={30} />
        <City P={P} k="samarqand" t="SAMARQAND" o={0.85} r={12} size={34} col="#e6dcc4" side="end" />
      </svg>
    </Paper>
  );
};

/* E: callback to Part 3 — To'xtamish belongs to Chinggis's line, Temur does not; then To'xtamish rises above Temur */
export const Line2: React.FC<{d: number}> = ({d}) => {
  const fr = useCurrentFrame();
  const rise = io(fr, Math.max(110, d * 0.55), Math.max(140, d * 0.55 + 30));
  const tx = 540, txy = 820 - 120 * rise;
  const tIn = io(fr, 34, 50, Easing.out(Easing.cubic));
  const reach = io(fr, 52, 74), broken = io(fr, 76, 84);
  const my = 1230 + 60 * rise, ly = my - 30 - (my - 30 - 900) * reach;
  return (
    <Paper d={d} zoom={[1.0, 1.05]}>
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <path d={`M 540 360 C 540 460, 330 470, 330 560`} stroke={GOLD} strokeWidth={5} fill="none" pathLength={1} strokeDasharray={`${io(fr, 4, 16)} 1`} />
        <path d={`M 540 360 C 540 460, 750 470, 750 560`} stroke={GOLD} strokeWidth={5} fill="none" pathLength={1} strokeDasharray={`${io(fr, 6, 18)} 1`} opacity={0.6} />
        <path d={`M 330 580 C 330 700, ${tx} ${txy - 140}, ${tx} ${txy}`} stroke={GOLD} strokeWidth={6} fill="none" pathLength={1} strokeDasharray={`${io(fr, 14, 30)} 1`} />
        <Node x={540} y={340} r={24} o={io(fr, 0, 8)} pulse={(fr % 40) / 40} />
        <Label x={540} y={286} t="CHINGIZXON" o={io(fr, 0, 10)} size={52} col={GOLD} />
        <Node x={330} y={570} r={15} o={io(fr, 10, 16)} />
        <Label x={300} y={584} t="JO'CHI" o={io(fr, 10, 18)} size={38} anchor="end" />
        <Node x={750} y={570} r={12} o={io(fr, 12, 18) * 0.6} />
        <g opacity={io(fr, 26, 34)}>
          <circle cx={tx} cy={txy} r={40 + 10 * Math.sin(fr / 6) + 20 * rise} fill="rgba(212,175,55,0.25)" />
          <Node x={tx} y={txy} r={26} col="#f3d36b" o={1} />
          <path d={`M ${tx - 24} ${txy - 40} l 8 -26 l 16 14 l 0 -22 l 16 22 l 16 -14 l 8 26 z`} fill={GOLD} stroke="#000" strokeWidth={2} />
          <Label x={tx + 46} y={txy + 16} t="TO'XTAMISH" o={1} size={48} anchor="start" col={GOLD} />
        </g>
        {tIn > 0 && <g>
          <path d={`M 540 ${my - 30} L 540 ${ly}`} stroke={broken > 0 ? RED : CREAM} strokeWidth={5} strokeDasharray="14 12" opacity={(1 - broken * 0.3) * (1 - rise)} />
          {broken > 0 && <g transform={`translate(540 ${(ly + my) / 2 - 30}) scale(${0.6 + broken * 0.6})`} opacity={broken * (1 - rise)}><line x1={-30} y1={-30} x2={30} y2={30} stroke={RED} strokeWidth={10} strokeLinecap="round" /><line x1={30} y1={-30} x2={-30} y2={30} stroke={RED} strokeWidth={10} strokeLinecap="round" /></g>}
          <Node x={540} y={my} r={24} col="#e8e0cc" o={tIn} />
          <Label x={590} y={my + 16} t="TEMUR" o={tIn} size={50} anchor="start" />
        </g>}
        {rise > 0 && <g opacity={rise}>
          <path d={`M 230 ${my - 10} L 230 ${txy + 10}`} stroke={GOLD} strokeWidth={6} />
          <path d={`M 230 ${txy - 4} l -18 30 l 36 0 z`} fill={GOLD} />
        </g>}
      </svg>
    </Paper>
  );
};

/* F: winter 1385 — the horde rides down the Caspian shore through Darband to Tabriz; Tabriz burns. The date card sits on top (y < 520). */
export const Tabriz: React.FC<{d: number}> = ({d}) => {
  const fr = useCurrentFrame();
  const P = proj([41.5, 54.5, 36.6, 47.6], [60, 560, 1020, 1340]);
  const route = ([[47.6, 47.4], [47.2, 44.6], [48.29, 42.06], [48.6, 40.6], [47.3, 39.2], [46.3, 38.08]] as LL[]).map((p) => P(p));
  const [tx, ty] = P(PL.tabriz);
  const end = d - 14;
  return (
    <Paper d={d} zoom={[1.0, 1.08]}>
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <Geo P={P} rivers={[VOLGA, KURA]} seas={[]} ulus={0} />
        {Array.from({length: 26}).map((_, i) => {
          const y = ((random('sn' + i) * 900 + fr * (3 + random('v' + i) * 3)) % 900) + 520;
          return <circle key={i} cx={random('x' + i) * 1080} cy={y} r={2 + random('r' + i) * 3} fill="#fff" opacity={0.5} />;
        })}
        <Arrow p={route} a={6} b={end * 0.85} />
        <City P={P} k="darband" t="DARBAND" o={io(fr, end * 0.3, end * 0.3 + 8)} side="end" />
        <City P={P} k="tabriz" t="TABRIZ" o={io(fr, end * 0.75, end * 0.75 + 8)} side="end" size={46} />
        <Flame x={tx} y={ty - 10} o={io(fr, end * 0.85, end * 0.85 + 8)} s={1.1} />
      </svg>
    </Paper>
  );
};

/* G: autumn 1387 — the horde pours into Movarounnahr: Sig'noq/Sabran -> Buxoro (siege ring) -> fires down to the Amu Darya */
export const Invade: React.FC<{d: number}> = ({d}) => {
  const fr = useCurrentFrame();
  const P = proj([60.5, 71.5, 36.8, 45.2], [60, 300, 1020, 1340]);
  const [bx, by] = P(PL.buxoro), [qx, qy] = P(PL.qarshi);
  const a1 = ([[68.7, 44.6], [67.6, 43.0], [65.6, 41.6], [64.5, 40.1]] as LL[]).map((p) => P(p));
  const a2 = ([[64.6, 39.6], [65.7, 39.0], [66.4, 38.2], [66.9, 37.4]] as LL[]).map((p) => P(p));
  const siege = io(fr, d * 0.5, d * 0.5 + 12);
  return (
    <Paper d={d} zoom={[1.0, 1.08]}>
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <Geo P={P} rivers={[SYR, AMU]} seas={[ARAL]} />
        <Arrow p={a1} a={4} b={d * 0.45} />
        <Arrow p={a2} a={d * 0.62} b={d - 6} w={8} />
        <City P={P} k="signoq" t="SIG'NOQ" o={1} side="end" />
        <City P={P} k="samarqand" t="SAMARQAND" o={1} r={16} col={GOLD} />
        <City P={P} k="buxoro" t="BUXORO" o={io(fr, d * 0.35, d * 0.35 + 8)} side="end" size={46} />
        {siege > 0 && <circle cx={bx} cy={by} r={60 + 8 * Math.sin(fr / 4)} fill="none" stroke={RED} strokeWidth={8} strokeDasharray="10 12" opacity={siege} transform={`rotate(${fr * 3} ${bx} ${by})`} />}
        <Flame x={qx} y={qy - 6} o={io(fr, d * 0.72, d * 0.72 + 8)} s={0.8} />
        <UlusLabel P={P} at={[63.6, 44.4]} t="JO'CHI ULUSI" col="#ffc2b0" o={io(fr, 0, 12)} />
        <Label x={P([66.0, 36.95])[0]} y={P([66.0, 36.95])[1]} t="Amudaryo" o={io(fr, 0, 12) * 0.85} size={32} col="#cfe6ee" />
      </svg>
    </Paper>
  );
};

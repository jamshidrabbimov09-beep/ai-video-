// Part 8 motion scenes (Anqara 1402), after Yazdi 233b-263b: Bayezid's threat to march to Tabriz, and Temur's detour:
// Bayezid waits in the narrow wooded roads at To'qat, Temur goes round through Qaysariya and Qirshahr to Anqara.
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {GOLD, CREAM, RED, io, Paper, Label, Node} from './p3motion';
import {proj, Geo, Arrow} from './p4motion';

type LL = [number, number];
const C: Record<string, LL> = {
  bursa: [29.06, 40.18], tabriz: [46.3, 38.08], sivas: [37.02, 39.75], toqat: [36.55, 40.31], qaysariya: [35.48, 38.73],
  qirshahr: [34.16, 39.15], anqara: [32.86, 39.93],
};
const Place: React.FC<{P: (l: LL) => [number, number]; at: LL; t: string; o: number; side?: 'start' | 'end'; col?: string; dy?: number; size?: number}> = ({P, at, t, o, side = 'start', col = CREAM, dy = 14, size = 42}) => {
  const [x, y] = P(at);
  return (<g><Node x={x} y={y} r={14} o={o} /><Label x={x + (side === 'start' ? 34 : -34)} y={y + dy} t={t} o={o} size={size} col={col} anchor={side} /></g>);
};

/* "Agar u kelmasa, men o'zim Tabrizgacha boraman": a red arrow from Bursa (Ottoman capital) towards Tabriz (Temur's lands) */
export const Threat: React.FC<{d: number}> = ({d}) => {
  const fr = useCurrentFrame();
  const P = proj([26, 50, 33, 45], [60, 420, 1020, 1330]);
  const pts = ([C.bursa, [34.0, 39.6], [40.0, 39.2], C.tabriz] as LL[]).map((p) => P(p));
  return (
    <Paper d={d} zoom={[1.0, 1.06]}>
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <Geo P={P} rivers={[]} seas={[]} ulus={0} />
        <Arrow p={pts} a={6} b={d - 8} col={RED} w={10} />
        <Place P={P} at={C.bursa} t="BURSA" o={io(fr, 0, 8)} dy={60} col={CREAM} />
        <Place P={P} at={C.tabriz} t="TABRIZ" o={io(fr, d - 18, d - 8)} side="end" col={GOLD} dy={60} />
      </svg>
    </Paper>
  );
};

/* "Temur esa u yerga bormaydi. U aylanib o'tib, to'g'ri Anqaraga yuradi." */
export const Detour: React.FC<{d: number}> = ({d}) => {
  const fr = useCurrentFrame();
  const P = proj([31.0, 39.0, 37.6, 41.6], [60, 420, 1020, 1330]);
  const route = ([C.sivas, [36.3, 39.1], C.qaysariya, C.qirshahr, C.anqara] as LL[]).map((p) => P(p));
  const [tx, ty] = P(C.toqat);
  const blink = 0.55 + 0.45 * Math.sin(fr / 4);
  return (
    <Paper d={d} zoom={[1.0, 1.05]}>
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <Geo P={P} rivers={[]} seas={[]} ulus={0} />
        {/* Bayezid's army waiting in the wooded roads near To'qat */}
        <circle cx={tx} cy={ty} r={70} fill={RED} fillOpacity={0.22 * blink} stroke={RED} strokeWidth={4} strokeOpacity={0.8} />
        <Label x={tx} y={ty - 90} t="BOYAZID" o={io(fr, 0, 8)} size={40} col="#ff9b8a" />
        <Place P={P} at={C.toqat} t="TO'QAT" o={io(fr, 0, 8)} dy={14} />
        <Place P={P} at={C.sivas} t="SIVAS" o={io(fr, 0, 8)} dy={60} />
        <Arrow p={route} a={8} b={d - 10} col={GOLD} w={9} />
        <Place P={P} at={C.qaysariya} t="QAYSARIYA" o={io(fr, d * 0.35, d * 0.35 + 8)} dy={60} />
        <Place P={P} at={C.anqara} t="ANQARA" o={io(fr, d - 20, d - 10)} side="start" col={GOLD} dy={-30} />
      </svg>
    </Paper>
  );
};

// Part 6 motion scene: Samarqand -> Kobul -> the Indus crossing (24.09.1398) -> Dehli (December 1398), Yazdi 187a-203b.
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {GOLD, CREAM, io, Paper, Label, Node} from './p3motion';
import {proj, pts, Geo, Arrow, SYR, AMU, ARAL, CHAGATAY} from './p4motion';

type LL = [number, number];
const C: Record<string, LL> = {samarqand: [66.96, 39.65], kobul: [69.17, 34.53], indus: [71.4, 32.6], dehli: [77.2, 28.6]};
const INDUS: LL[] = [[74.5, 35.6], [72.6, 35.4], [72.2, 34.0], [71.6, 33.0], [71.1, 32.0], [70.6, 30.5], [69.9, 28.6], [68.9, 26.5], [68.3, 25.0], [67.6, 24.2]];
const YAMUNA: LL[] = [[77.6, 31.0], [77.4, 30.0], [77.25, 28.8], [77.6, 27.6], [78.4, 27.0]];
const ROUTE: LL[] = [C.samarqand, [67.6, 37.4], [68.6, 35.6], C.kobul, [70.5, 33.6], C.indus, [73.6, 31.4], [75.8, 30.0], C.dehli];

const Place: React.FC<{P: (l: LL) => [number, number]; at: LL; t: string; o: number; side?: 'start' | 'end'; col?: string; dy?: number}> = ({P, at, t, o, side = 'start', col = CREAM, dy = 14}) => {
  const [x, y] = P(at);
  return (<g><Node x={x} y={y} r={14} o={o} /><Label x={x + (side === 'start' ? 34 : -34)} y={y + dy} t={t} o={o} size={42} col={col} anchor={side} /></g>);
};
export const India: React.FC<{d: number}> = ({d}) => {
  const fr = useCurrentFrame();
  const P = proj([62, 80, 25, 42], [60, 400, 1020, 1330]);
  const R = ROUTE.map((p) => P(p));
  const at = (k: number) => io(fr, 4 + (d - 10) * k, 10 + (d - 10) * k);
  return (
    <Paper d={d} zoom={[1.0, 1.06]}>
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <Geo P={P} rivers={[SYR, AMU]} seas={[ARAL]} ulus={0} />
        <path d={`M ${pts(P, CHAGATAY)} Z`} fill="#e0b13a" fillOpacity={0.25} stroke="#e0b13a" strokeWidth={4} />
        <path d={`M ${pts(P, INDUS)}`} fill="none" stroke="#8fc2d4" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
        <path d={`M ${pts(P, YAMUNA)}`} fill="none" stroke="#8fc2d4" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
        <Arrow p={R} a={4} b={d - 6} col={GOLD} w={9} />
        <Place P={P} at={C.samarqand} t="SAMARQAND" o={io(fr, 0, 6)} col={GOLD} />
        <Place P={P} at={C.kobul} t="KOBUL" o={at(0.3)} side="end" />
        <Label x={P([70.2, 29.4])[0]} y={P([70.2, 29.4])[1]} t="HIND DARYOSI" o={at(0.5) * 0.95} size={34} col="#bfe3ee" anchor="end" />
        <Place P={P} at={C.dehli} t="DEHLI" o={at(0.85)} side="end" col={GOLD} dy={60} />
      </svg>
    </Paper>
  );
};

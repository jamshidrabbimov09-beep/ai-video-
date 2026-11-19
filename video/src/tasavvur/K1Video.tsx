import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Bg, BekAt, Text, useOswald, GOLD, RED, INK, FPS, lerp, pop, Burst, blinkAt, FollowButton} from './common';
import type {Outfit} from './Bek';

// 1K followers celebration, 12 s, music only. Timeline (s): counter 0.3-3.0, "1K" boom 3.0, heroes jump in 3.6-5.6,
// "RAHMAT!" 6.4, question 7.4, follow button 8.6 (tap 9.6, bell 9.85).
export const K1_DUR = 12;
const CONF = Array.from({length: 90}, (_, i) => {
  const r = (n: number) => ((Math.sin(i * 127.1 + n * 311.7) * 43758.5) % 1 + 1) % 1;
  return {x: r(1) * 1080, v: 260 + r(2) * 340, ph: r(3) * 1900, w: 14 + r(4) * 18, rs: (r(5) - 0.5) * 600, sw: r(6) * 6, c: ['#ffc94a', '#ff4b3e', '#4fc3f7', '#7ee07e', '#fff'][i % 5]};
});
const HEROES: {o: Outfit; x: number; y: number; s: number; t0: number}[] = [
  {o: 'iskandar', x: 170, y: 1900, s: 0.82, t0: 3.6},
  {o: 'chingiz', x: 910, y: 1900, s: 0.82, t0: 4.0},
  {o: 'temur', x: 370, y: 1920, s: 0.95, t0: 4.4},
  {o: 'ravshanak', x: 710, y: 1920, s: 0.95, t0: 4.8},
  {o: 'modern', x: 540, y: 1950, s: 1.12, t0: 5.2},
];

export const K1Video: React.FC<{at?: number}> = ({at}) => {
  useOswald();
  const f = at ?? useCurrentFrame();
  const t = f / FPS;
  const n = Math.round(Math.pow(lerp(t, 0.3, 3.0, 0, 1), 0.6) * 1000);
  const boom = pop(t, 3.0);
  const shake = t > 3.0 && t < 3.4 ? Math.sin(t * 90) * 14 * (3.4 - t) : 0;
  const conf = t >= 3.0 ? t - 3.0 : -1;
  const up = lerp(t, 6.0, 6.6, 0, 1); // block moves up to free space for the question and button
  return (
    <AbsoluteFill>
      <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
        <Bg c0="#3b1f6b" c1="#120a24" cy={35} />
        <g opacity={lerp(t, 0, 0.4, 0, 1)}><Text x={540} y={250} size={70} fill="#fff" stroke={8}>UNUTILGAN QISSALAR</Text></g>
        <g transform={`translate(${shake} ${-up * 60})`}>
          {t < 3.0 ? (
            <>
              <Text x={540} y={680} size={300} fill="#fff" stroke={14}>{n}</Text>
              <Text x={540} y={820} size={80} fill={GOLD} stroke={9}>OBUNACHI</Text>
            </>
          ) : (
            <>
              <g transform={`translate(540 560) scale(${boom}) translate(-540 -560)`}>
                <Text x={540} y={700} size={430} fill={GOLD} stroke={18}>1K</Text>
              </g>
              <g opacity={lerp(t, 3.3, 3.7, 0, 1)}><Text x={540} y={830} size={96} fill="#fff" stroke={10}>1000 OBUNACHI!</Text></g>
            </>
          )}
          <Burst x={540} y={560} t={t} t0={3.0} color={GOLD} />
          <Burst x={540} y={560} t={t} t0={3.12} color="#fff" />
          {t >= 6.4 && (
            <g transform={`translate(540 925) scale(${pop(t, 6.4)}) translate(-540 -925)`}>
              <Text x={540} y={960} size={120} fill={RED} stroke={12}>RAHMAT! ❤</Text>
            </g>
          )}
          {t >= 7.4 && <g opacity={lerp(t, 7.4, 7.8, 0, 1)}><Text x={540} y={1080} size={54} fill="#fff" stroke={7}>BIZ BILAN BIRGA BO'LGANING UCHUN!</Text></g>}
        </g>
        {conf >= 0 && CONF.map((c, i) => {
          const y = ((c.ph + conf * c.v) % 2000) - 60;
          if (conf * c.v + c.ph < c.ph + 0 && false) return null;
          const yy = conf < 0.6 ? lerp(conf, 0, 0.6, 560, y) : y;
          const xx = conf < 0.6 ? lerp(conf, 0, 0.6, 540, c.x) : c.x + Math.sin(conf * 3 + i) * 30 * c.sw / 6;
          return <rect key={i} x={xx} y={yy} width={c.w} height={c.w * 0.45} rx={3} fill={c.c} transform={`rotate(${c.rs * conf} ${xx} ${yy})`} />;
        })}
        <ellipse cx={540} cy={1880} rx={620} ry={120} fill={INK} opacity={0.5} />
        {HEROES.map((h, i) => {
          const k = t - h.t0;
          if (k < 0) return null;
          const enter = lerp(k, 0, 0.35, 700, 0) - (k < 0.6 ? Math.sin(Math.min(k / 0.6, 1) * Math.PI) * 120 : 0);
          const hop = t > 6.4 && t < 8.4 ? Math.abs(Math.sin((t - 6.4) * 7 + i)) * 40 : 0;
          const fade = lerp(t, 8.3, 8.7, 1, 0.35);
          return (
            <g key={h.o} opacity={fade} transform={`translate(0 ${enter - hop})`}>
              <BekAt x={h.x} y={h.y} s={h.s} outfit={h.o} mood={t < h.t0 + 0.4 ? 'surprised' : 'happy'} blink={blinkAt(t, i)} swing={h.o === 'modern' ? Math.sin(t * 6) * 0.6 : 0} lookX={(540 - h.x) / 600} />
            </g>
          );
        })}
        <FollowButton t={t} t0={8.6} y={1560} line="KEYINGI 1000 GA BIRGA!" />
      </svg>
    </AbsoluteFill>
  );
};

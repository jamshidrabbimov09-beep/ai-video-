import React from 'react';
import {AbsoluteFill, Audio, Img, staticFile, useCurrentFrame} from 'remotion';
import {Bg, BekAt, Text, useOswald, GOLD, RED, INK, FPS, lerp, pop, Burst, blinkAt, FollowButton} from './common';
import type {Outfit} from './Bek';
import ENV from './k1_env.json';

// 1K followers celebration, 27 s. Bek's voice (public/k1/raw.mp3, 19.8 s) starts at V0.
// Sentence times below are voice-relative (from ffmpeg silencedetect).
export const K1_DUR = 27;
export const V0 = 4.3;
const SENT: [number, number, string][] = [
  [0, 1.7, 'Salom! Men Bekman.'],
  [1.95, 4.57, "Bugun sahifamizda 1000 nafar obunachi bo'ldi!"],
  [4.77, 6.43, 'Hammangizga katta rahmat!'],
  [6.74, 11.52, 'Sizlar bilan Temur zamoniga ham, Chingizxon oldiga ham, Iskandar qoyasiga ham bordik.'],
  [11.8, 14.68, 'Amir Temur haqidagi katta serialimiz ham davom etadi.'],
  [14.92, 16.79, "Oldinda yana ko'p sayohatlar bor."],
  [17.1, 18.64, 'Keyingi qaysi zamonga boraylik?'],
  [18.89, 19.8, 'Izohda yoz!'],
];
const S = (i: number) => V0 + SENT[i][0];
const FOLLOW = 24.4;

const CONF = Array.from({length: 90}, (_, i) => {
  const r = (n: number) => ((Math.sin(i * 127.1 + n * 311.7) * 43758.5) % 1 + 1) % 1;
  return {x: r(1) * 1080, v: 220 + r(2) * 300, ph: r(3) * 1900, w: 14 + r(4) * 18, rs: (r(5) - 0.5) * 600, sw: r(6) * 6, c: ['#ffc94a', '#ff4b3e', '#4fc3f7', '#7ee07e', '#fff'][i % 5]};
});
const HEROES: {o: Outfit; x: number; y: number; s: number; t0: number}[] = [
  {o: 'iskandar', x: 170, y: 1900, s: 0.82, t0: 2.8},
  {o: 'chingiz', x: 910, y: 1900, s: 0.82, t0: 3.1},
  {o: 'temur', x: 370, y: 1920, s: 0.95, t0: 3.4},
  {o: 'ravshanak', x: 710, y: 1920, s: 0.95, t0: 3.7},
  {o: 'modern', x: 540, y: 1950, s: 1.12, t0: 3.95},
];

const Card: React.FC<{src: string; x: number; y: number; w: number; t: number; t0: number; t1: number; rot?: number}> = ({src, x, y, w, t, t0, t1, rot = 0}) => {
  if (t < t0 || t > t1 + 0.3) return null;
  const p = pop(t, t0) * lerp(t, t1, t1 + 0.3, 1, 0);
  const h = (w * 16) / 9;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${p})`}>
      <rect x={-w / 2 - 8} y={-h / 2 - 8} width={w + 16} height={h + 16} rx={18} fill="#fff" stroke={INK} strokeWidth={6} />
      <image href={staticFile(`k1/${src}.jpg`)} x={-w / 2} y={-h / 2} width={w} height={h} preserveAspectRatio="xMidYMid slice" />
    </g>
  );
};

export const K1Video: React.FC<{at?: number}> = ({at}) => {
  useOswald();
  const cf = useCurrentFrame();
  const f = at ?? cf;
  const t = f / FPS;
  const n = Math.round(Math.pow(lerp(t, 0.2, 2.6, 0, 1), 0.6) * 1000);
  const boom = pop(t, 2.6);
  const shake = t > 2.6 && t < 3.0 ? Math.sin(t * 90) * 14 * (3.0 - t) : 0;
  const conf = t >= 2.6 ? t - 2.6 : -1;
  const topOut = lerp(t, S(3) - 0.1, S(3) + 0.25, 1, 0);
  // lip sync from the voice envelope
  const vi = Math.round((t - V0) * FPS);
  const speaking = vi >= 0 && vi < ENV.length;
  const talk = speaking ? Math.min(1, ((ENV[vi] ?? 0) + (ENV[vi + 1] ?? 0)) / 2 * 1.3) : -1;
  const sent = SENT.findIndex(([a, b]) => t >= V0 + a - 0.05 && t < V0 + b + 0.25);
  const heroFade = lerp(t, FOLLOW - 0.3, FOLLOW + 0.1, 1, 0.35);
  return (
    <AbsoluteFill>
      {at === undefined && <Audio src={staticFile('k1/mix.m4a')} />}
      <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
        <Bg c0="#3b1f6b" c1="#120a24" cy={35} />
        {conf >= 0 && CONF.map((c, i) => {
          const y = ((c.ph + conf * c.v) % 2000) - 60;
          const yy = conf < 0.6 ? lerp(conf, 0, 0.6, 560, y) : y;
          const xx = conf < 0.6 ? lerp(conf, 0, 0.6, 540, c.x) : c.x + Math.sin(conf * 3 + i) * 5 * c.sw;
          return <rect key={i} x={xx} y={yy} width={c.w} height={c.w * 0.45} rx={3} fill={c.c} opacity={0.8} transform={`rotate(${c.rs * conf} ${xx} ${yy})`} />;
        })}
        <g opacity={lerp(t, 0, 0.4, 0, 1)}><Text x={540} y={200} size={64} fill="#fff" stroke={8}>UNUTILGAN QISSALAR</Text></g>

        {/* block 1: counter, 1K, thanks */}
        {topOut > 0 && (
          <g opacity={topOut} transform={`translate(${shake} 0)`}>
            {t < 2.6 ? (
              <>
                <Text x={540} y={640} size={300} fill="#fff" stroke={14}>{n}</Text>
                <Text x={540} y={780} size={80} fill={GOLD} stroke={9}>OBUNACHI</Text>
              </>
            ) : (
              <>
                <g transform={`translate(540 520) scale(${boom}) translate(-540 -520)`}>
                  <Text x={540} y={660} size={430} fill={GOLD} stroke={18}>1K</Text>
                </g>
                <g opacity={lerp(t, 2.9, 3.3, 0, 1)}><Text x={540} y={790} size={96} fill="#fff" stroke={10}>1000 OBUNACHI!</Text></g>
              </>
            )}
            <Burst x={540} y={520} t={t} t0={2.6} color={GOLD} />
            <Burst x={540} y={520} t={t} t0={2.72} color="#fff" />
            {t >= S(2) && (
              <g transform={`translate(540 920) scale(${pop(t, S(2))}) translate(-540 -920)`}>
                <Text x={540} y={960} size={130} fill={RED} stroke={12}>RAHMAT! ❤</Text>
              </g>
            )}
          </g>
        )}

        {/* block 2: our Tasavvur trips */}
        {t >= S(3) && t < S(4) + 0.3 && (
          <g opacity={lerp(t, S(4), S(4) + 0.3, 1, 0)}>
            <Text x={540} y={330} size={84} fill={GOLD} stroke={9}>TASAVVUR QIL</Text>
          </g>
        )}
        <Card src="tasavvur1" x={200} y={700} w={290} t={t} t0={S(3) + 0.6} t1={S(4)} rot={-6} />
        <Card src="tasavvur4" x={540} y={680} w={290} t={t} t0={S(3) + 1.9} t1={S(4)} />
        <Card src="tasavvur3" x={880} y={700} w={290} t={t} t0={S(3) + 3.3} t1={S(4)} rot={6} />

        {/* block 3: the Temur series */}
        {t >= S(4) && t < S(5) + 0.3 && (
          <g opacity={lerp(t, S(5), S(5) + 0.3, 1, 0)} transform={`translate(540 310) scale(${pop(t, S(4))}) translate(-540 -310)`}>
            <Text x={540} y={330} size={84} fill={GOLD} stroke={9}>AMIR TEMUR SERIALI</Text>
          </g>
        )}
        {[1, 2, 3, 4, 5].map((k, i) => (
          <Card key={k} src={`part${k}`} x={190 + i * 175} y={700 + Math.abs(i - 2) * 30} w={230} t={t} t0={S(4) + 0.3 + i * 0.3} t1={S(5)} rot={(i - 2) * 7} />
        ))}

        {/* block 4: what's next */}
        {t >= S(5) && t < FOLLOW && (
          <g opacity={lerp(t, FOLLOW - 0.3, FOLLOW, 1, 0)}>
            <g transform={`translate(540 520) scale(${pop(t, S(5))}) translate(-540 -520)`}>
              <Text x={540} y={500} size={96} fill="#fff" stroke={10}>OLDINDA YANA</Text>
              <Text x={540} y={620} size={110} fill={GOLD} stroke={11}>KO'P SAYOHAT!</Text>
            </g>
            {t >= S(6) && (
              <g transform={`translate(540 800) scale(${pop(t, S(6))}) translate(-540 -800)`}>
                <Text x={540} y={830} size={90} fill="#fff" stroke={10}>KEYINGI QAYSI ZAMON?</Text>
              </g>
            )}
            {t >= S(7) && (
              <g transform={`translate(540 960) scale(${pop(t, S(7))}) translate(-540 -960)`}>
                <Text x={540} y={1000} size={120} fill={RED} stroke={12}>IZOHDA YOZ!</Text>
              </g>
            )}
          </g>
        )}

        <ellipse cx={540} cy={1880} rx={620} ry={120} fill={INK} opacity={0.5} />
        {HEROES.map((h, i) => {
          const k = t - h.t0;
          if (k < 0) return null;
          const enter = lerp(k, 0, 0.35, 700, 0) - (k < 0.6 ? Math.sin(Math.min(k / 0.6, 1) * Math.PI) * 120 : 0);
          const bek = h.o === 'modern';
          const hop = !bek && t > S(2) && t < S(2) + 1.6 ? Math.abs(Math.sin((t - S(2)) * 7 + i)) * 40 : 0;
          const bob = bek && speaking ? Math.sin(t * 5) * 6 : 0;
          return (
            <g key={h.o} opacity={heroFade} transform={`translate(0 ${enter - hop + bob})`}>
              <BekAt x={h.x} y={h.y} s={h.s} outfit={h.o} mood={k < 0.4 ? 'surprised' : 'happy'} blink={blinkAt(t, i)} swing={bek ? Math.sin(t * 4) * 0.5 : 0} lookX={bek ? 0 : (540 - h.x) / 600} talk={bek ? talk : undefined} />
            </g>
          );
        })}

        {/* sentence subtitle under the top content */}
        {sent >= 0 && t < FOLLOW && (
          <g>
            <foreignObject x={70} y={1092} width={940} height={92}>
              <div style={{height: 92, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontFamily: 'Oswald', fontWeight: 700, color: '#fff', fontSize: SENT[sent][2].length > 50 ? 34 : 46, lineHeight: 1.1, WebkitTextStroke: '7px #1a120c', paintOrder: 'stroke fill', textShadow: '0 4px 0 #1a120c'}}>{SENT[sent][2]}</div>
            </foreignObject>
          </g>
        )}
        <FollowButton t={t} t0={FOLLOW} y={1560} line="KEYINGI 1000 GA BIRGA!" />
      </svg>
    </AbsoluteFill>
  );
};

import React, {useEffect, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, interpolate, spring, staticFile, useCurrentFrame} from 'remotion';
import {BekG, Mood, Outfit} from './Bek';
import words from './tq1_words.json';

// "Tasavvur qil" episode 1: "Sen Temurning askarisan: 1 kun".
// Everything is drawn in SVG; captions are single big words at the top, timed to the narration.

const FPS = 30;
export const TQ1_FRAMES = Math.round(62.2 * FPS);
const W = 1080;
const H = 1920;
const INK = '#2b1e16';
const RED = '#ff4b3e';
const GOLD = '#ffc94a';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const lerp = (t: number, a: number, b: number, v0: number, v1: number) => interpolate(t, [a, b], [v0, v1], clamp);
const pop = (t: number, t0: number) => (t < t0 ? 0 : spring({frame: (t - t0) * FPS, fps: FPS, config: {damping: 11, stiffness: 160}}));
const blinkAt = (t: number, seed = 0) => {
  const p = (t + seed) % 3.3;
  return p < 0.14 ? Math.sin((p / 0.14) * Math.PI) : 0;
};

// ---------- Bek placement ----------
type BekProps = {x: number; y: number; s: number; outfit?: Outfit; mood?: Mood; blink?: number; lookX?: number; swing?: number; rot?: number};
const BekAt: React.FC<BekProps> = ({x, y, s, outfit = 'soldier', mood = 'neutral', blink = 0, lookX = 0, swing = 0, rot = 0}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s}) translate(-200 -730)`}>
    <BekG outfit={outfit} mood={mood} blink={blink} lookX={lookX} armSwing={swing} />
  </g>
);

// ---------- props ----------
const Horse: React.FC<{color: string; mane: string; phase: number; amp?: number; rider?: React.ReactNode; tired?: boolean}> = ({color, mane, phase, amp = 26, rider, tired}) => {
  const leg = (x: number, off: number, front: boolean) => {
    const a = Math.sin(phase + off) * amp * (front ? 1 : -1);
    return (
      <g key={x + off} transform={`rotate(${a} ${x} 30)`}>
        <rect x={x - 10} y={20} width={20} height={118} rx={9} fill={color} stroke={INK} strokeWidth={5} />
        <rect x={x - 12} y={126} width={24} height={16} rx={4} fill={INK} />
      </g>
    );
  };
  return (
    <g>
      {leg(-85, Math.PI, false)}
      {leg(80, 0, true)}
      <path d="M-118 -24 Q-200 -6 -176 96 Q-152 40 -112 6 Z" fill={mane} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      {rider}
      <ellipse cx={0} cy={0} rx={128} ry={60} fill={color} stroke={INK} strokeWidth={5} />
      <path d="M66 -34 L134 -124 L176 -102 L124 22 Z" fill={color} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <g transform="translate(160 -112) rotate(38)">
        <path d="M-12 -26 L-2 -50 L8 -24 Z" fill={color} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        <rect x={-22} y={-24} width={96} height={46} rx={22} fill={color} stroke={INK} strokeWidth={5} />
        <circle cx={10} cy={-6} r={6} fill={INK} />
        {tired && <path d="M60 18 Q66 40 58 50" stroke="#e86a7a" strokeWidth={9} strokeLinecap="round" fill="none" />}
      </g>
      <path d="M70 -44 Q98 -112 140 -130 L128 -104 Q100 -70 86 -28 Z" fill={mane} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      {/* saddle cloth and saddle */}
      <rect x={-62} y={-56} width={112} height={62} rx={10} fill="#8f2a1e" stroke={INK} strokeWidth={4} />
      <rect x={-62} y={-8} width={112} height={8} fill={GOLD} />
      <path d="M-52 -58 Q0 -40 46 -58 L40 -72 Q0 -58 -46 -72 Z" fill="#5a3418" stroke={INK} strokeWidth={4} />
      {/* near-side boot and stirrup when ridden */}
      {rider && (
        <g>
          <path d="M-6 -50 L18 -50 L20 40 L36 46 L36 60 L-6 60 Z" fill="#4a2c1a" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
          <path d="M-10 62 L40 62" stroke="#9aa3ad" strokeWidth={6} strokeLinecap="round" />
        </g>
      )}
      {leg(-60, Math.PI * 1.5, false)}
      {leg(104, Math.PI * 0.5, true)}
    </g>
  );
};

const Coin: React.FC<{x: number; y: number}> = ({x, y}) => (
  <g>
    <ellipse cx={x} cy={y + 6} rx={46} ry={16} fill="#b07a12" stroke={INK} strokeWidth={4} />
    <ellipse cx={x} cy={y} rx={46} ry={16} fill={GOLD} stroke={INK} strokeWidth={4} />
  </g>
);

const Text: React.FC<{x: number; y: number; size: number; fill?: string; children: React.ReactNode; anchor?: string; stroke?: number}> = ({x, y, size, fill = '#fff', children, anchor = 'middle', stroke = 0}) => (
  <text x={x} y={y} fontSize={size} fill={fill} textAnchor={anchor} fontFamily="Oswald" fontWeight={700} stroke={stroke ? INK : undefined} strokeWidth={stroke} paintOrder="stroke">
    {children}
  </text>
);

const Bg: React.FC<{c0: string; c1: string; cy?: number}> = ({c0, c1, cy = 45}) => {
  const id = `g${c0.slice(1)}${c1.slice(1)}`;
  return (
    <>
      <defs>
        <radialGradient id={id} cx="50%" cy={`${cy}%`} r="75%">
          <stop offset="0%" stopColor={c0} />
          <stop offset="100%" stopColor={c1} />
        </radialGradient>
      </defs>
      <rect width={W} height={H} fill={`url(#${id})`} />
    </>
  );
};

const Burst: React.FC<{x: number; y: number; t: number; t0: number; color?: string}> = ({x, y, t, t0, color = '#fff'}) => {
  const k = t - t0;
  if (k < 0 || k > 0.5) return null;
  const r = lerp(k, 0, 0.5, 30, 170);
  const o = lerp(k, 0.2, 0.5, 1, 0);
  return (
    <g opacity={o}>
      {Array.from({length: 10}).map((_, i) => {
        const a = (i / 10) * Math.PI * 2;
        return <line key={i} x1={x + Math.cos(a) * r * 0.6} y1={y + Math.sin(a) * r * 0.6} x2={x + Math.cos(a) * r} y2={y + Math.sin(a) * r} stroke={color} strokeWidth={10} strokeLinecap="round" />;
      })}
    </g>
  );
};

// ---------- scenes (t = seconds from video start) ----------
const SceneHook: React.FC<{t: number}> = ({t}) => {
  const soldier = t >= 1.04;
  const puff = t >= 1.0 && t < 1.5 ? lerp(t, 1.0, 1.5, 1, 0) : 0;
  const cal = pop(t, 3.0);
  const worried = t >= 4.1;
  const q = pop(t, 4.3);
  return (
    <g>
      <Bg c0="#2f4a7a" c1="#0e1424" />
      <BekAt x={540} y={1700 + Math.sin(t * 3) * 6} s={1.45} outfit={soldier ? 'soldier' : 'modern'} mood={worried ? 'worried' : soldier ? 'surprised' : 'happy'} blink={blinkAt(t)} />
      {puff > 0 && <circle cx={540} cy={1150} r={420 * (1.4 - puff)} fill="#fff" opacity={puff * 0.9} />}
      <g transform={`translate(840 760) rotate(10) scale(${cal})`}>
        <rect x={-95} y={-110} width={190} height={210} rx={18} fill="#fff" stroke={INK} strokeWidth={6} />
        <rect x={-95} y={-110} width={190} height={62} rx={18} fill={RED} stroke={INK} strokeWidth={6} />
        <Text x={0} y={-62} size={44}>1-KUN</Text>
        <Text x={0} y={70} size={120} fill={INK}>1</Text>
      </g>
      {q > 0 &&
        [
          [250, 760, -15],
          [300, 600, 10],
          [790, 1050, 12],
        ].map(([x, y, r], i) => (
          <g key={i} transform={`translate(${x} ${y + Math.sin(t * 4 + i) * 8}) rotate(${r}) scale(${pop(t, 4.3 + i * 0.12)})`}>
            <Text x={0} y={0} size={130} fill="#fff" stroke={8}>?</Text>
          </g>
        ))}
    </g>
  );
};

const SceneWake: React.FC<{t: number}> = ({t}) => {
  const awake = t >= 6.88;
  const shake = t >= 6.88 && t < 8.2 ? Math.sin(t * 70) * lerp(t, 6.88, 8.2, 14, 0) : 0;
  const jump = t >= 8.42 && t < 9.1 ? Math.sin(((t - 8.42) / 0.68) * Math.PI) * 260 : 0;
  const drum = pop(t, 6.88);
  const horn = pop(t, 7.68);
  return (
    <g transform={`translate(${shake} 0)`}>
      <Bg c0="#5a3a2a" c1="#140c0a" cy={30} />
      {/* tent */}
      <path d="M0 260 L540 60 L1080 260 L1080 1920 L0 1920 Z" fill="#3a2418" opacity={0.6} />
      <path d="M540 60 L540 1920" stroke="#1d120c" strokeWidth={22} />
      {[0, 1, 2, 3].map((i) => (
        <path key={i} d={`M540 60 Q${200 + i * 230} 300 ${-80 + i * 400} 640`} stroke="#6b4530" strokeWidth={6} fill="none" opacity={0.5} />
      ))}
      <circle cx={830} cy={520} r={150} fill="#ffb84a" opacity={0.18 + Math.sin(t * 9) * 0.03} />
      <rect x={800} y={470} width={60} height={90} rx={10} fill="#ffcc6a" stroke={INK} strokeWidth={5} />
      <rect x={0} y={1560} width={W} height={360} fill="#2a1a12" />
      <ellipse cx={540} cy={1600} rx={420} ry={60} fill="#7a2a1e" />
      <BekAt x={540} y={1650 - jump} s={1.25} mood={awake ? (t > 8.4 ? 'determined' : 'surprised') : 'neutral'} blink={awake ? blinkAt(t) : 1} />
      {!awake &&
        [0, 1, 2].map((i) => {
          const k = (t * 0.8 + i / 3) % 1;
          return (
            <Text key={i} x={700 + k * 120} y={820 - k * 260} size={70 + i * 10} fill="#cfd8ff">
              <tspan opacity={1 - k}>Z</tspan>
            </Text>
          );
        })}
      <g transform={`translate(190 1180) scale(${drum}) rotate(${Math.sin(t * 30) * 6})`}>
        <ellipse cx={0} cy={60} rx={130} ry={40} fill="#7a3f1d" stroke={INK} strokeWidth={6} />
        <rect x={-130} y={-40} width={260} height={100} fill="#a3562a" stroke={INK} strokeWidth={6} />
        <ellipse cx={0} cy={-40} rx={130} ry={40} fill="#f1dfb8" stroke={INK} strokeWidth={6} />
        <Text x={0} y={-110} size={92} fill={GOLD} stroke={8}>DUM!</Text>
      </g>
      <g transform={`translate(860 1000) rotate(-30) scale(${horn})`}>
        <path d="M-200 -10 L120 -14 L220 -90 L220 70 L120 14 L-200 10 Z" fill={GOLD} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        {[0, 1, 2].map((i) => (
          <path key={i} d={`M${250 + i * 40} -60 Q${280 + i * 40} 0 ${250 + i * 40} 60`} stroke="#fff" strokeWidth={8} fill="none" opacity={0.5 + 0.5 * Math.sin(t * 20 + i)} />
        ))}
      </g>
      <Burst x={190} y={1100} t={t} t0={6.88} color={GOLD} />
    </g>
  );
};

const SceneArmy: React.FC<{t: number}> = ({t}) => {
  if (t < 14.3) {
    const many = t >= 10.7;
    const boss = pop(t, 13.4);
    return (
      <g>
        <Bg c0="#3c5c8a" c1="#101828" />
        {!many && <BekAt x={540} y={1660} s={1.3} mood="happy" blink={blinkAt(t)} />}
        {!many && pop(t, 9.6) > 0 && (
          <g opacity={pop(t, 9.6) * 0.5}>
            <BekAt x={230} y={1500} s={0.8} blink={blinkAt(t, 1)} />
            <BekAt x={850} y={1500} s={0.8} blink={blinkAt(t, 2)} />
          </g>
        )}
        {many &&
          Array.from({length: 10}).map((_, i) => {
            const row = Math.floor(i / 5);
            const col = i % 5;
            const p = pop(t, 10.75 + i * 0.13);
            const x = 160 + col * 190;
            const y = 1140 + row * 380;
            return (
              <g key={i} transform={`translate(${x} ${y}) scale(${p}) translate(${-x} ${-y})`}>
                <BekAt x={x} y={y} s={0.5} mood={i === 7 ? 'happy' : 'neutral'} blink={blinkAt(t, i * 0.7)} lookX={Math.sin(i) * 0.8} />
              </g>
            );
          })}
        {many && (
          <g transform={`translate(540 640) scale(${pop(t, 12.0)})`}>
            <Text x={0} y={60} size={190} fill={GOLD} stroke={10}>10</Text>
          </g>
        )}
        {boss > 0 && (
          <g transform={`translate(540 1700) scale(${boss}) translate(-540 -1700)`}>
            <line x1={700} y1={1700} x2={700} y2={1180} stroke="#5a3418" strokeWidth={12} />
            <path d="M700 1190 L860 1230 L700 1280 Z" fill={RED} stroke={INK} strokeWidth={5} />
            <BekAt x={540} y={1760} s={0.75} mood="determined" blink={blinkAt(t)} />
            <rect x={400} y={1770} width={280} height={70} rx={14} fill={GOLD} stroke={INK} strokeWidth={5} />
            <Text x={540} y={1825} size={50} fill={INK}>O'NBOSHI</Text>
          </g>
        )}
      </g>
    );
  }
  // zoom out: 10 -> 100 -> 1 000 -> 10 000
  const steps = [
    [14.3, 10, 120, "O'NLIK"],
    [14.84, 100, 62, 'YUZLIK'],
    [16.2, 1000, 24, 'MINGLIK'],
    [17.8, 10000, 13, 'TUMAN'],
  ] as const;
  let k = 0;
  steps.forEach((s, i) => {
    if (t >= s[0]) k = i;
  });
  const [t0, n, size] = steps[k];
  const prevSize = k > 0 ? steps[k - 1][2] : size;
  const cell = lerp(t, t0, t0 + 0.45, prevSize, size);
  const final = t >= 19.0;
  const pulse = final ? 1 + Math.sin((t - 19) * 8) * 0.04 : 1;
  return (
    <g>
      <Bg c0="#3c5c8a" c1="#101828" />
      <defs>
        <pattern id="army" width={cell} height={cell} patternUnits="userSpaceOnUse" x={540 - cell / 2} y={0}>
          <path d={`M${cell * 0.2} ${cell * 0.52} Q${cell * 0.5} ${cell * 0.02} ${cell * 0.8} ${cell * 0.52} Z`} fill="#9aa3ad" />
          <circle cx={cell * 0.5} cy={cell * 0.62} r={cell * 0.2} fill="#f2c39b" />
          <rect x={cell * 0.28} y={cell * 0.78} width={cell * 0.44} height={cell * 0.2} fill="#9b2d20" />
        </pattern>
      </defs>
      <rect x={40} y={870} width={1000} height={980} rx={30} fill="url(#army)" />
      <rect x={40} y={870} width={1000} height={980} rx={30} fill="none" stroke={GOLD} strokeWidth={6} opacity={0.6} />
      <g transform={`translate(540 640) scale(${pop(t, t0) * pulse})`}>
        <Text x={0} y={70} size={final ? 240 : 200} fill={final ? RED : GOLD} stroke={12}>{n.toLocaleString('ru-RU').replace(/ /g, ' ')}</Text>
      </g>
      <g>
        {steps.map((s, i) => (
          <Text key={i} x={150 + i * 260} y={820} size={46} fill={i <= k ? '#fff' : '#ffffff55'}>{s[3]}</Text>
        ))}
      </g>
    </g>
  );
};

const ITEMS: [string, number][] = [
  ['2 × OT', 22.26],
  ['KAMON', 23.0],
  ["O'QDON", 23.66],
  ['QILICH', 24.28],
  ['BOLTA', 24.88],
  ['ARQON', 25.5],
];
const SceneCheck: React.FC<{t: number}> = ({t}) => {
  const stamp = pop(t, 26.3);
  return (
    <g>
      <Bg c0="#f2c48a" c1="#b06a34" cy={40} />
      <g transform={`translate(540 1060) scale(${pop(t, 21.0)}) rotate(-2)`}>
        <rect x={-380} y={-560} width={760} height={1000} rx={24} fill="#fbf1dc" stroke={INK} strokeWidth={7} />
        <Text x={0} y={-450} size={74} fill={INK}>TEKSHIRUV</Text>
        <line x1={-320} y1={-415} x2={320} y2={-415} stroke={INK} strokeWidth={5} />
        {ITEMS.map(([name, at], i) => {
          const on = t >= at;
          const y = -320 + i * 125;
          return (
            <g key={name} opacity={on ? 1 : 0.35}>
              <rect x={-320} y={y - 50} width={70} height={70} rx={12} fill="#fff" stroke={INK} strokeWidth={5} />
              {on && <path d={`M${-308} ${y - 14} L${-290} ${y + 6} L${-258} ${y - 40}`} stroke="#1f9d55" strokeWidth={12} fill="none" strokeLinecap="round" strokeLinejoin="round" transform={`scale(1)`} />}
              <Text x={-210} y={y + 10} size={66} fill={INK} anchor="start">{name}</Text>
            </g>
          );
        })}
      </g>
      {stamp > 0 && (
        <g transform={`translate(560 1330) rotate(-14) scale(${2.2 - stamp * 1.2})`} opacity={Math.min(1, stamp * 1.5)}>
          <rect x={-250} y={-90} width={500} height={170} rx={20} fill="none" stroke={RED} strokeWidth={14} />
          <Text x={0} y={45} size={130} fill={RED}>SHART!</Text>
        </g>
      )}
      <BekAt x={900} y={1900} s={0.75} mood="determined" blink={blinkAt(t)} rot={-6} />
    </g>
  );
};

const SceneFood: React.FC<{t: number}> = ({t}) => {
  const sigh = t >= 30.4;
  return (
    <g>
      <Bg c0="#f2c48a" c1="#9a5a2a" cy={40} />
      <ellipse cx={540} cy={1500} rx={520} ry={120} fill="#7a3a22" />
      <BekAt x={540} y={1420 + Math.sin(t * 3) * 5} s={1.0} mood={sigh ? 'worried' : 'surprised'} blink={blinkAt(t)} />
      <g transform={`translate(540 1560) scale(${pop(t, 29.4)})`}>
        <ellipse cx={0} cy={20} rx={330} ry={90} fill="#c9b79a" stroke={INK} strokeWidth={6} />
        <ellipse cx={0} cy={6} rx={280} ry={64} fill="#e8dcc4" />
        {[-140, -70, 0].map((x, i) => (
          <rect key={x} x={x - 30} y={-34 + i * 6} width={120} height={34} rx={14} fill="#7a3a22" stroke={INK} strokeWidth={4} transform={`rotate(${-8 + i * 7} ${x} 0)`} />
        ))}
        {[110, 170, 140, 210].map((x, i) => (
          <circle key={i} cx={x} cy={i === 2 ? -30 : 0} r={30} fill="#f7f3ea" stroke={INK} strokeWidth={4} />
        ))}
      </g>
      {sigh && (
        <g opacity={lerp(t, 30.4, 30.8, 0, 1)}>
          <path d={`M640 ${880 - (t - 30.4) * 60} q30 -20 60 0 q30 20 60 0`} stroke="#fff" strokeWidth={8} fill="none" strokeLinecap="round" />
        </g>
      )}
    </g>
  );
};

const Steppe: React.FC<{t: number; speed: number}> = ({t, speed}) => {
  const off = (t * speed) % 600;
  return (
    <g>
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5fa8e0" />
          <stop offset="100%" stopColor="#f6d79a" />
        </linearGradient>
      </defs>
      <rect width={W} height={1200} fill="url(#sky)" />
      <circle cx={820} cy={420} r={90} fill="#fff1b8" />
      {[0, 1].map((i) => (
        <path key={i} d={`M${-off * 0.3 + i * 1200} 1120 q300 -200 600 0 q300 -160 600 0 L${-off * 0.3 + i * 1200 + 1200} 1220 L${-off * 0.3 + i * 1200} 1220 Z`} fill="#c8a76a" />
      ))}
      <rect y={1150} width={W} height={770} fill="#d9b46a" />
      {Array.from({length: 6}).map((_, i) => {
        const x = ((i * 300 - off * 1.6) % 1800 + 1800) % 1800 - 300;
        return <path key={i} d={`M${x} ${1700 + (i % 2) * 120} l20 -50 l20 50 l20 -40 l14 40`} stroke="#8a6a2a" strokeWidth={8} fill="none" strokeLinecap="round" />;
      })}
    </g>
  );
};

const SceneRide: React.FC<{t: number}> = ({t}) => {
  const tired = t >= 33.96 && t < 35.18;
  const second = t >= 35.18;
  const speed = tired ? 260 : 900;
  const phase = t * (tired ? 7 : 16);
  const bob = Math.abs(Math.sin(phase)) * (tired ? 6 : 18);
  const enter = second ? lerp(t, 35.18, 35.5, 700, 0) : 0;
  const rider = <BekAt x={0} y={-55 + 210 * 0.42} s={0.42} mood={tired ? 'worried' : second ? 'happy' : 'determined'} blink={blinkAt(t)} />;
  return (
    <g>
      <Steppe t={t} speed={speed} />
      <g transform={`translate(${520 + enter} ${1420 - bob}) scale(1.7)`}>
        <Horse color={second ? '#e9e2d6' : '#8a5130'} mane={second ? '#9a9a9a' : '#2b1a10'} phase={phase} amp={tired ? 10 : 28} rider={rider} tired={tired} />
      </g>
      {tired &&
        [0, 1, 2].map((i) => {
          const k = (t * 1.5 + i / 3) % 1;
          return <path key={i} d={`M${860 + i * 30} ${1080 + k * 120} q-14 24 0 34 q14 -10 0 -34`} fill="#8fd3ff" opacity={1 - k} />;
        })}
    </g>
  );
};

const SceneHunt: React.FC<{t: number}> = ({t}) => {
  if (t < 38.0) {
    return (
      <g>
        <Steppe t={t} speed={0} />
        <BekAt x={540} y={1760} s={1.2} mood="worried" blink={blinkAt(t)} />
        {[0, 1].map((i) => {
          const k = (t * 1.2 + i / 2) % 1;
          return <path key={i} d={`M${760 + i * 40} ${930 + k * 100} q-16 28 0 40 q16 -12 0 -40`} fill="#8fd3ff" opacity={1 - k} />;
        })}
      </g>
    );
  }
  const R = lerp(t, 40.1, 43.5, 470, 170);
  const N = 30;
  return (
    <g>
      <rect width={W} height={H} fill="#b9b25a" />
      {Array.from({length: 40}).map((_, i) => (
        <circle key={i} cx={(i * 397) % W} cy={(i * 811) % H} r={18 + (i % 4) * 6} fill="#a39c48" />
      ))}
      <circle cx={540} cy={1100} r={R + 50} fill="none" stroke="#7d7636" strokeWidth={20} strokeDasharray="6 30" opacity={0.6} />
      {Array.from({length: 6}).map((_, i) => {
        const a = t * (1.5 + i * 0.3) + i;
        const r = Math.min(R - 70, 160) * (0.3 + 0.7 * ((i * 37) % 10) / 10);
        const x = 540 + Math.cos(a) * r;
        const y = 1100 + Math.sin(a * 1.3) * r;
        return (
          <g key={i} transform={`translate(${x} ${y}) rotate(${(a * 57) % 360})`}>
            <ellipse cx={0} cy={0} rx={34} ry={18} fill="#9a5a2a" stroke={INK} strokeWidth={4} />
            <circle cx={30} cy={0} r={12} fill="#9a5a2a" stroke={INK} strokeWidth={4} />
            <circle cx={-34} cy={0} r={7} fill="#fff" />
          </g>
        );
      })}
      {Array.from({length: N}).map((_, i) => {
        const a = (i / N) * Math.PI * 2 + t * 0.15;
        const x = 540 + Math.cos(a) * R;
        const y = 1100 + Math.sin(a) * R;
        const p = pop(t, 38.1 + i * 0.03);
        return (
          <g key={i} transform={`translate(${x} ${y}) rotate(${(a * 180) / Math.PI + 180}) scale(${p})`}>
            <ellipse cx={0} cy={0} rx={44} ry={20} fill={i % 3 ? '#8a5130' : '#e9e2d6'} stroke={INK} strokeWidth={4} />
            <circle cx={0} cy={0} r={15} fill="#9b2d20" stroke={INK} strokeWidth={3} />
            <circle cx={0} cy={0} r={8} fill="#9aa3ad" />
          </g>
        );
      })}
    </g>
  );
};

const ScenePay: React.FC<{t: number}> = ({t}) => {
  const coins = Math.floor(lerp(t, 44.0, 46.0, 0, 7));
  const tilt = lerp(t, 45.9, 46.5, 14, 0) + (t < 45.9 ? Math.sin(t * 4) * 2 : 0);
  return (
    <g>
      <Bg c0="#4a3a7a" c1="#120e22" />
      <rect x={520} y={700} width={40} height={900} fill="#c9a24a" stroke={INK} strokeWidth={6} />
      <rect x={380} y={1580} width={320} height={60} rx={14} fill="#8a6a2a" stroke={INK} strokeWidth={6} />
      <g transform={`rotate(${tilt} 540 720)`}>
        <rect x={140} y={705} width={800} height={30} rx={14} fill={GOLD} stroke={INK} strokeWidth={6} />
        <g transform={`rotate(${-tilt} 220 720)`}>
          <line x1={220} y1={720} x2={220} y2={1000} stroke={INK} strokeWidth={5} />
          <path d="M80 1000 L360 1000 Q220 1080 80 1000 Z" fill="#c9a24a" stroke={INK} strokeWidth={6} />
          <g transform="translate(225 920) scale(0.42)">
            <Horse color="#8a5130" mane="#2b1a10" phase={0} amp={0} />
          </g>
        </g>
        <g transform={`rotate(${-tilt} 860 720)`}>
          <line x1={860} y1={720} x2={860} y2={1000} stroke={INK} strokeWidth={5} />
          <path d="M720 1000 L1000 1000 Q860 1080 720 1000 Z" fill="#c9a24a" stroke={INK} strokeWidth={6} />
          {Array.from({length: coins}).map((_, i) => (
            <Coin key={i} x={860} y={980 - i * 20} />
          ))}
        </g>
      </g>
      <BekAt x={850} y={1900} s={0.7} mood={t > 45.8 ? 'happy' : 'surprised'} blink={blinkAt(t)} />
      <Burst x={860} y={850} t={t} t0={46.3} color={GOLD} />
    </g>
  );
};

const SceneNight: React.FC<{t: number}> = ({t}) => {
  const sleepy = lerp(t, 47.2, 49.5, 0.45, 1);
  const alarm = t >= 49.68;
  const blink = alarm ? blinkAt(t) : Math.max(sleepy, blinkAt(t));
  const nod = alarm ? 0 : lerp(t, 48.6, 49.5, 0, 9);
  return (
    <g>
      <Bg c0="#1d2b55" c1="#05070f" cy={20} />
      {Array.from({length: 60}).map((_, i) => (
        <circle key={i} cx={(i * 173) % W} cy={(i * 97) % 1100} r={2 + (i % 3)} fill="#fff" opacity={0.4 + 0.6 * Math.abs(Math.sin(t * 2 + i))} />
      ))}
      <circle cx={820} cy={330} r={80} fill="#f4f0d8" />
      <circle cx={850} cy={310} r={74} fill="#1a274d" />
      <rect y={1500} width={W} height={420} fill="#0f1426" />
      <BekAt x={600} y={1720} s={1.1} mood={alarm ? 'surprised' : 'neutral'} blink={blink} rot={nod} />
      <g transform="translate(230 1640)">
        <path d="M-90 40 L90 40" stroke="#4a2c1a" strokeWidth={22} strokeLinecap="round" />
        <path d={`M-60 30 Q-70 ${-100 - Math.sin(t * 13) * 20} 0 ${-170 - Math.sin(t * 9) * 25} Q70 ${-100 - Math.cos(t * 11) * 20} 60 30 Z`} fill="#ff8a2a" />
        <path d={`M-30 30 Q-34 -50 0 ${-90 - Math.sin(t * 15) * 15} Q34 -50 30 30 Z`} fill="#ffd34a" />
        <circle cx={0} cy={-20} r={260} fill="#ff8a2a" opacity={0.12} />
      </g>
      {!alarm && t > 48.6 && (
        <Text x={800} y={1000 - ((t * 60) % 80)} size={80} fill="#cfd8ff">Z</Text>
      )}
      {alarm && (
        <>
          <rect width={W} height={H} fill={RED} opacity={lerp(t, 49.68, 50.6, 0.45, 0.12)} />
          <g transform={`translate(840 860) scale(${pop(t, 49.7)})`}>
            <Text x={0} y={0} size={240} fill={RED} stroke={12}>!</Text>
          </g>
        </>
      )}
    </g>
  );
};

const Card: React.FC<{x: number; n: string; title: string[]; color: string; active: number; icon: React.ReactNode}> = ({x, n, title, color, active, icon}) => (
  <g transform={`translate(${x} 900) scale(${0.9 + active * 0.14})`} opacity={0.55 + active * 0.45}>
    <rect x={-230} y={-330} width={460} height={620} rx={30} fill={color} stroke={active > 0.5 ? '#fff' : INK} strokeWidth={active > 0.5 ? 12 : 6} />
    <circle cx={0} cy={-330} r={70} fill="#fff" stroke={INK} strokeWidth={6} />
    <Text x={0} y={-300} size={90} fill={INK}>{n}</Text>
    {icon}
    {title.map((s, i) => (
      <Text key={i} x={0} y={170 + i * 80} size={70}>{s}</Text>
    ))}
  </g>
);

const SceneChoice: React.FC<{t: number}> = ({t}) => {
  if (t < 52.3) {
    return (
      <g>
        <Bg c0="#c8402a" c1="#2a0806" cy={40} />
        <g transform={`translate(540 980) scale(${pop(t, 51.4)})`}>
          <g transform="rotate(40)">
            <rect x={-20} y={-380} width={40} height={600} rx={10} fill="#d5dbe1" stroke={INK} strokeWidth={6} />
            <rect x={-80} y={200} width={160} height={36} rx={12} fill={GOLD} stroke={INK} strokeWidth={6} />
          </g>
          <g transform="rotate(-40)">
            <rect x={-20} y={-380} width={40} height={600} rx={10} fill="#d5dbe1" stroke={INK} strokeWidth={6} />
            <rect x={-80} y={200} width={160} height={36} rx={12} fill={GOLD} stroke={INK} strokeWidth={6} />
          </g>
        </g>
        <BekAt x={540} y={1900} s={0.75} mood="determined" blink={blinkAt(t)} />
      </g>
    );
  }
  const left = t >= 53.0 && t < 56.95 ? 1 : 0;
  const right = t >= 56.95 ? 1 : 0;
  const la = lerp(t, 52.9, 53.2, 0, 1) * (t < 56.95 ? 1 : lerp(t, 56.95, 57.2, 1, 0));
  const ra = lerp(t, 56.95, 57.2, 0, 1);
  void left;
  void right;
  return (
    <g>
      <Bg c0="#5a2a3a" c1="#120810" />
      <g opacity={pop(t, 52.4)}>
        <Card
          x={290}
          n="1"
          title={['OLDINGI', 'SAF']}
          color="#c0392b"
          active={la}
          icon={
            <g>
              <path d="M0 -200 L60 -110 L60 30 Q0 90 -60 30 L-60 -110 Z" fill="#9aa3ad" stroke={INK} strokeWidth={6} />
              <circle cx={0} cy={-60} r={30} fill={GOLD} stroke={INK} strokeWidth={5} />
            </g>
          }
        />
        <Card
          x={790}
          n="2"
          title={['KAMON-', 'CHILAR']}
          color="#2d6cb5"
          active={ra}
          icon={
            <g>
              <path d="M-40 -210 Q90 -80 -40 60" stroke="#7b5432" strokeWidth={16} fill="none" strokeLinecap="round" />
              <line x1={-40} y1={-210} x2={-40} y2={60} stroke="#f1ece0" strokeWidth={4} />
              <line x1={-90} y1={-75} x2={90} y2={-75} stroke={INK} strokeWidth={6} />
              <path d="M90 -75 L64 -90 L64 -60 Z" fill={INK} />
            </g>
          }
        />
      </g>
      <BekAt x={540} y={1900} s={0.62} mood={ra > 0.5 ? 'happy' : 'worried'} blink={blinkAt(t)} lookX={ra > 0.5 ? 1 : -1} />
    </g>
  );
};

const SceneEnd: React.FC<{t: number}> = ({t}) => {
  const box = pop(t, 60.0);
  const typed = '1 yoki 2?'.slice(0, Math.max(0, Math.floor((t - 60.4) * 10)));
  return (
    <g>
      <Bg c0="#2f4a7a" c1="#0e1424" />
      <BekAt x={540} y={1240 + Math.sin(t * 3) * 6} s={0.95} mood="surprised" blink={blinkAt(t)} lookX={0.6} />
      {[
        [230, 600, -12],
        [860, 520, 14],
      ].map(([x, y, r], i) => (
        <g key={i} transform={`translate(${x} ${y + Math.sin(t * 4 + i) * 10}) rotate(${r}) scale(${pop(t, 59.1 + i * 0.15)})`}>
          <Text x={0} y={0} size={150} fill="#fff" stroke={8}>?</Text>
        </g>
      ))}
      <g transform={`translate(540 1520) scale(${box})`}>
        <rect x={-420} y={-170} width={840} height={360} rx={40} fill="#1b2233" stroke="#fff" strokeWidth={5} />
        <Text x={0} y={-90} size={56}>Izohlar</Text>
        <rect x={-370} y={-40} width={740} height={110} rx={55} fill="#2c3550" />
        <Text x={-320} y={36} size={62} fill="#fff" anchor="start">{typed + (Math.floor(t * 3) % 2 ? '|' : '')}</Text>
        <rect x={-150} y={100} width={300} height={70} rx={35} fill={RED} />
        <Text x={0} y={150} size={44}>YOZ!</Text>
      </g>
    </g>
  );
};

const SCENES: [number, number, React.FC<{t: number}>][] = [
  [0, 5.2, SceneHook],
  [5.2, 9.4, SceneWake],
  [9.4, 21.0, SceneArmy],
  [21.0, 28.45, SceneCheck],
  [28.45, 31.8, SceneFood],
  [31.8, 36.3, SceneRide],
  [36.3, 43.6, SceneHunt],
  [43.6, 46.95, ScenePay],
  [46.95, 51.3, SceneNight],
  [51.3, 58.95, SceneChoice],
  [58.95, 99, SceneEnd],
];

// ---------- day clock ----------
const CLOCK: [number, number][] = [
  [5.2, 5 * 60],
  [9.4, 5 * 60 + 30],
  [21.0, 6 * 60 + 30],
  [28.45, 7 * 60],
  [31.8, 9 * 60],
  [36.3, 15 * 60],
  [43.6, 18 * 60],
  [46.95, 23 * 60],
  [51.3, 23 * 60 + 50],
];
const clockText = (t: number) => {
  const xs = CLOCK.map((c) => c[0]);
  const ys = CLOCK.map((c) => c[1]);
  const m = Math.floor(interpolate(t, xs, ys, clamp));
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
};

// ---------- captions ----------
type W3 = [string, number, number];
const HL = /^(TEMURNING|BIR|KUN|TIRIK|NOG'ORA|KARNAY|O'NTA|TUMANGA|O'N MING|SHART|QURUT|EGARDA|MASHQ|MAOSHING|NARXICHA|XAVF|JANG|BIRINCHI|IKKINCHI|IZOHDA|YOLG'IZ|QOROVULSAN|O'NLIKDASAN|ARQON|IKKI OT)/;
const chunks = (() => {
  const ws: W3[] = [];
  (words as W3[]).forEach((w) => {
    const txt = w[0].replace(/[ʻ’`]/g, "'");
    if (txt === 'qora') return;
    if (txt.startsWith('ovulsan')) {
      ws.push(['qorovulsan.', w[1] - 0.2, w[2]]);
      return;
    }
    ws.push([txt, w[1], w[2]]);
  });
  const out: {text: string; start: number; end: number; closed: boolean}[] = [];
  ws.forEach(([txt, s, e]) => {
    const clean = txt.replace(/[.,:]/g, '').toUpperCase();
    const closes = /[.,:?!]$/.test(txt);
    const cur = out[out.length - 1];
    if (cur && !cur.closed && cur.text.length + clean.length <= 9 && !cur.text.includes(' ')) {
      cur.text += ' ' + clean;
      cur.end = e;
      cur.closed = closes;
      return;
    }
    out.push({text: clean, start: s, end: e, closed: closes});
  });
  return out;
})();

const Caption: React.FC<{t: number}> = ({t}) => {
  let idx = -1;
  chunks.forEach((c, i) => {
    if (t >= c.start - 0.04) idx = i;
  });
  if (idx < 0) return null;
  const c = chunks[idx];
  const next = chunks[idx + 1];
  const until = next ? Math.min(next.start - 0.04, c.end + 0.9) : c.end + 1.2;
  if (t > until) return null;
  const p = spring({frame: (t - c.start + 0.04) * FPS, fps: FPS, config: {damping: 12, stiffness: 220}});
  const hl = HL.test(c.text);
  return (
    <div
      style={{
        position: 'absolute',
        top: 190,
        width: '100%',
        textAlign: 'center',
        fontFamily: 'Oswald',
        fontWeight: 700,
        fontSize: c.text.length > 11 ? 112 : 128,
        color: hl ? RED : '#fff',
        transform: `scale(${0.7 + 0.3 * p})`,
        textShadow: '0 6px 0 #1a120c, 0 0 24px rgba(0,0,0,0.6)',
        WebkitTextStroke: '3px #1a120c',
        letterSpacing: 1,
      }}
    >
      {c.text}
    </div>
  );
};

const useFont = () => {
  const [handle] = useState(() => delayRender('font'));
  useEffect(() => {
    const f1 = new FontFace('Oswald', `url(${staticFile('fonts/oswald-latin-700-normal.woff2')})`, {weight: '700'});
    const f2 = new FontFace('Oswald', `url(${staticFile('fonts/oswald-latin-ext-700-normal.woff2')})`, {weight: '700'});
    Promise.all([f1.load(), f2.load()])
      .then((fs) => fs.forEach((f) => document.fonts.add(f)))
      .finally(() => continueRender(handle));
  }, [handle]);
};

export const TQ1: React.FC = () => {
  useFont();
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const idx = SCENES.findIndex(([a, b]) => t >= a && t < b);
  const [a, , S] = SCENES[Math.max(0, idx)];
  const k = t - a;
  const zoom = 1 + lerp(k, 0, 0.25, 0.06, 0);
  const flash = lerp(k, 0, 0.12, a > 0 ? 0.5 : 0, 0);
  const showClock = t >= 5.2 && t < 58.95;
  const endFade = lerp(t, 61.6, 62.2, 0, 1);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
        <g transform={`translate(540 960) scale(${zoom}) translate(-540 -960)`}>
          <S t={t} />
        </g>
        <rect width={W} height={H} fill="#fff" opacity={flash} />
      </svg>
      {showClock && (
        <div
          style={{
            position: 'absolute',
            top: 380,
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <div style={{background: 'rgba(10,12,20,0.72)', borderRadius: 40, padding: '6px 30px', fontFamily: 'Oswald', fontWeight: 700, fontSize: 42, color: '#fff', border: '3px solid rgba(255,255,255,0.25)'}}>
            <span style={{color: GOLD}}>1-KUN</span> · {clockText(t)}
          </div>
        </div>
      )}
      <Caption t={t} />
      <AbsoluteFill style={{background: '#000', opacity: endFade}} />
    </AbsoluteFill>
  );
};

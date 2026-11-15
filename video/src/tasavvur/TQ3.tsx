import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {FollowButton, BekAt, Bg, blinkAt, buildChunks, Burst, Caption, FPS, GOLD, H, INK, lerp, pop, RED, Text, useOswald, W, W3} from './common';
import words from './tq3_words.json';

// "Tasavvur qil" episode 3: "Qanotli askarlar" — Alexander and the Sogdian Rock (327 BC, Arrian IV.18-19).

export const TQ3_FRAMES = Math.round(80.6 * FPS);
const FOLLOW_AT = 77.4;

const ease = (x: number) => x * x * (3 - 2 * x);
const span = (t: number, a: number, b: number) => ease(lerp(t, a, b, 0, 1));
const mix = (a: number, b: number, k: number) => a + (b - a) * k;

// ---------- world: the rock, the fortress, the army (world units; cliff top at y = 0) ----------
type Cam = {fx: number; fy: number; s: number};
const CLIFF = 'M300 0 L780 0 L820 380 L880 900 L930 1500 L1010 2360 L70 2360 L150 1500 L200 900 L260 380 Z';
const PEAK = 'M600 0 L660 -380 L700 -470 L740 -400 L800 -120 L820 0 Z';

const Snow: React.FC<{t: number; n?: number; o?: number}> = ({t, n = 70, o = 0.85}) => (
  <g fill="#fff" opacity={o}>
    {Array.from({length: n}).map((_, i) => {
      const x = (i * 137.5 + Math.sin(t * 0.7 + i) * 40) % W;
      const y = ((i * 263 + t * (70 + (i % 5) * 18)) % (H + 40)) - 20;
      return <circle key={i} cx={x} cy={y} r={3 + (i % 3) * 2} />;
    })}
  </g>
);

const Tents: React.FC<{night: number}> = ({night}) => (
  <g>
    {Array.from({length: 40}).map((_, i) => {
      const x = -1300 + i * 95 + (i % 3) * 20;
      if (x > 30 && x < 1050) return null;
      const y = 2440 + (i % 4) * 70;
      return <path key={'t' + i} d={`M${x - 45} ${y} L${x} ${y - 70} L${x + 45} ${y} Z`} fill={i % 2 ? '#8f2a1e' : '#a8742f'} stroke={INK} strokeWidth={4} />;
    })}
    {Array.from({length: 120}).map((_, i) => {
      const x = -1250 + (i % 60) * 60 + Math.floor(i / 60) * 30;
      const y = 2380 + Math.floor(i / 60) * 230 + (i % 2) * 20;
      return (
        <g key={'s' + i}>
          <rect x={x - 8} y={y - 34} width={16} height={34} rx={5} fill="#5a3a2a" />
          <circle cx={x} cy={y - 42} r={9} fill="#d4a017" />
          <line x1={x + 12} y1={y} x2={x + 12} y2={y - 80} stroke="#3b2a1e" strokeWidth={4} />
          <path d={`M${x + 6} ${y - 80} L${x + 12} ${y - 96} L${x + 18} ${y - 80} Z`} fill="#c9ced6" />
        </g>
      );
    })}
    {night > 0 &&
      [-900, -500, -150, 1200, 1600, 2000].map((x, i) => (
        <g key={'f' + i} opacity={night}>
          <circle cx={x} cy={2520} r={70} fill="#ff9a3c" opacity={0.25} />
          <circle cx={x} cy={2520} r={18} fill="#ffcf5a" />
        </g>
      ))}
  </g>
);

const Fortress: React.FC<{flag?: number}> = ({flag = 0}) => (
  <g>
    <path d={PEAK} fill="#7a6c63" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <path d="M660 -380 L700 -470 L740 -400 L715 -360 L690 -400 Z" fill="#f4f7fb" />
    <rect x={290} y={-170} width={500} height={170} fill="#b98d5f" stroke={INK} strokeWidth={6} />
    <g stroke="#8e6a45" strokeWidth={3}>
      {[-130, -90, -50].map((y) => (
        <line key={y} x1={292} y1={y} x2={788} y2={y} />
      ))}
      {Array.from({length: 12}).map((_, i) => (
        <line key={i} x1={320 + i * 40 + ((i % 2) * 20)} y1={-170} x2={320 + i * 40 + ((i % 2) * 20)} y2={-130} />
      ))}
    </g>
    <rect x={290} y={-60} width={500} height={60} fill="#000" opacity={0.12} />
    {Array.from({length: 9}).map((_, i) => (
      <rect key={i} x={296 + i * 55} y={-200} width={34} height={34} fill="#b98d5f" stroke={INK} strokeWidth={5} />
    ))}
    {[260, 740].map((x) => (
      <g key={x}>
        <rect x={x} y={-280} width={80} height={280} fill="#a87c50" stroke={INK} strokeWidth={6} />
        <path d={`M${x - 10} -280 L${x + 40} -340 L${x + 90} -280 Z`} fill="#8f2a1e" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        <rect x={x + 28} y={-220} width={24} height={40} rx={10} fill="#2b1e16" />
      </g>
    ))}
    <path d="M500 0 L500 -90 Q540 -130 580 -90 L580 0 Z" fill="#4a2c1a" stroke={INK} strokeWidth={5} />
    {flag > 0 && (
      <g transform={`translate(540 ${-170 - flag * 160})`}>
        <line x1={0} y1={0} x2={0} y2={170} stroke={INK} strokeWidth={8} />
        <path d="M0 0 Q60 -14 110 6 Q60 30 0 40 Z" fill="#fff" stroke={INK} strokeWidth={5} />
      </g>
    )}
  </g>
);

const WorldScene: React.FC<{t: number; cam: Cam; night?: number; dawn?: number; children?: React.ReactNode; flag?: number; behind?: React.ReactNode}> = ({t, cam, night = 0, dawn = 0, children, flag = 0, behind}) => (
  <g>
    <defs>
      <linearGradient id="skyDay" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#4f8fca" />
        <stop offset="100%" stopColor="#d6e8f5" />
      </linearGradient>
      <linearGradient id="skyDawn" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#5a4a8a" />
        <stop offset="55%" stopColor="#f08a5d" />
        <stop offset="100%" stopColor="#ffd28a" />
      </linearGradient>
      <linearGradient id="skyNight" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#050a1a" />
        <stop offset="100%" stopColor="#1a2b52" />
      </linearGradient>
      <linearGradient id="rock" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#8c7c71" />
        <stop offset="55%" stopColor="#6d5f57" />
        <stop offset="100%" stopColor="#463b35" />
      </linearGradient>
    </defs>
    <rect width={W} height={H} fill="url(#skyDay)" />
    <rect width={W} height={H} fill="url(#skyDawn)" opacity={dawn} />
    <rect width={W} height={H} fill="url(#skyNight)" opacity={night} />
    {night > 0.3 && (
      <g opacity={night}>
        <circle cx={830} cy={560} r={70} fill="#f4f1de" />
        <circle cx={855} cy={545} r={64} fill="#1a2b52" opacity={0.25} />
        <circle cx={830} cy={560} r={150} fill="#f4f1de" opacity={0.08} />
      </g>
    )}
    {dawn > 0.3 && <circle cx={180} cy={1250} r={160} fill="#fff1b8" opacity={dawn * 0.75} />}
    {night > 0.3 && (
      <g fill="#fff" opacity={night}>
        {Array.from({length: 40}).map((_, i) => (
          <circle key={i} cx={(i * 211) % W} cy={(i * 97) % 900} r={2 + (i % 3)} />
        ))}
      </g>
    )}
    {/* far mountains (parallax) */}
    <g transform={`translate(0 ${-cam.fy * 0.05})`}>
      <path d="M-100 1500 L160 900 L360 1250 L560 820 L800 1200 L1000 860 L1200 1500 Z" fill={night > 0.5 ? '#1c2a4a' : '#9fb0c4'} />
      <path d="M180 970 L160 900 L130 960 Z M580 880 L560 820 L530 880 Z M1020 920 L1000 860 L975 920 Z" fill="#fff" opacity={0.8} />
    </g>
    <g transform={`translate(540 960) scale(${cam.s}) translate(${-cam.fx} ${-cam.fy})`}>
      {behind}
      <rect x={-3000} y={2360} width={7000} height={2000} fill="#e8eef5" />
      <Tents night={night} />
      <ellipse cx={540} cy={2380} rx={700} ry={60} fill="#000" opacity={0.15} />
      <path d={CLIFF} fill="url(#rock)" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
      {/* rock facets: lighter planes catch the light, darker ones sit in shadow */}
      <g strokeLinejoin="round">
        <path d="M300 0 L420 0 L380 420 L262 380 Z" fill="#9a8a7e" opacity={0.7} />
        <path d="M200 900 L330 760 L360 1300 L150 1500 Z" fill="#9a8a7e" opacity={0.55} />
        <path d="M120 1900 L300 1700 L330 2360 L70 2360 Z" fill="#9a8a7e" opacity={0.5} />
        <path d="M640 380 L820 380 L880 900 L700 1000 Z" fill="#3b312c" opacity={0.45} />
        <path d="M720 1300 L930 1500 L1010 2360 L760 2360 Z" fill="#3b312c" opacity={0.45} />
        <path d="M430 700 L560 640 L600 1100 L470 1180 Z" fill="#7d6e64" opacity={0.6} />
        <path d="M460 1500 L600 1450 L640 2000 L480 2100 Z" fill="#5a4d45" opacity={0.6} />
      </g>
      <path d="M520 0 L560 600 L520 1200 L600 2360 M380 200 L330 900 L380 1600 M760 300 L800 1100 M240 1100 L300 1250 M700 1600 L760 1850 M420 1900 L460 2200" fill="none" stroke="#3e342e" strokeWidth={8} strokeLinecap="round" />
      {/* snow on ledges */}
      {[[330, 420, 80], [700, 760, 90], [250, 1250, 70], [820, 1380, 80], [480, 1900, 100], [600, 1100, 60], [380, 1620, 70]].map(([x, y, r]) => (
        <path key={x + '' + y} d={`M${x - r} ${y} Q${x} ${y - 30} ${x + r} ${y} Q${x} ${y + 12} ${x - r} ${y} Z`} fill="#f4f7fb" stroke="#c9d6e3" strokeWidth={3} />
      ))}
      <Fortress flag={flag} />
      {children}
    </g>
    <rect width={W} height={H} fill="#0b1630" opacity={night * 0.35} />
    <Snow t={t} o={night > 0.5 ? 0.6 : 0.85} />
  </g>
);

// a Greek soldier drawn in Bek's style, arms raised (climbing / waving); world units, feet at (x, y), ~150 tall at k = 1
const Climber: React.FC<{x: number; y: number; k?: number; rot?: number; wings?: number; cloth?: number; t?: number; mood?: 'determined' | 'happy' | 'worried'}> = ({x, y, k = 1, rot = 0, wings = 0, cloth = 0, t = 0, mood = 'determined'}) => {
  const swing = 150 + Math.sin(t * 6 + x * 0.01) * 14;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${k})`}>
      {wings > 0 && (
        <g transform={`translate(0 -70) scale(${wings * 1.1})`} fill="#fff" stroke={INK} strokeWidth={4}>
          <path d="M-6 -40 C-60 -90 -110 -60 -120 -20 C-90 -34 -60 -26 -40 -10 C-70 -16 -96 -4 -100 14 C-60 0 -30 -4 -6 -20 Z" transform={`rotate(${Math.sin(t * 12) * 10} -6 -30)`} />
          <path d="M6 -40 C60 -90 110 -60 120 -20 C90 -34 60 -26 40 -10 C70 -16 96 -4 100 14 C60 0 30 -4 6 -20 Z" transform={`rotate(${-Math.sin(t * 12) * 10} 6 -30)`} />
        </g>
      )}
      <BekAt x={0} y={0} s={0.2} outfit="yunon" mood={mood} swing={swing} shadow={false} blink={blinkAt(t, x)} />
      {cloth > 0 && (
        <g transform="translate(30 -110)">
          <line x1={0} y1={0} x2={0} y2={-34} stroke={INK} strokeWidth={4} />
          <path d={`M0 -34 Q${26 + Math.sin(t * 9) * 8} ${-52 + Math.cos(t * 9) * 6} 58 -36 Q34 -18 0 -12 Z`} fill="#fff" stroke={INK} strokeWidth={3} />
        </g>
      )}
    </g>
  );
};

// ---------- props ----------
const Coins: React.FC = () => (
  <g>
    {Array.from({length: 14}).map((_, i) => {
      const row = i < 5 ? 0 : i < 9 ? 1 : i < 12 ? 2 : 3;
      const idx = i < 5 ? i : i < 9 ? i - 5 : i < 12 ? i - 9 : i - 12;
      const n = [5, 4, 3, 2][row];
      const x = (idx - (n - 1) / 2) * 70;
      const y = -row * 46;
      return (
        <g key={i}>
          <ellipse cx={x} cy={y} rx={40} ry={22} fill="#d4a017" stroke={INK} strokeWidth={5} />
          <ellipse cx={x} cy={y - 4} rx={26} ry={13} fill="none" stroke="#f6dc7a" strokeWidth={4} />
        </g>
      );
    })}
  </g>
);

const Heart: React.FC = () => <path d="M0 40 C-90 -20 -60 -100 0 -60 C60 -100 90 -20 0 40 Z" fill={RED} stroke="#fff" strokeWidth={7} />;

const IconFlag: React.FC = () => (
  <g>
    <line x1={-50} y1={-90} x2={-50} y2={90} stroke={INK} strokeWidth={10} strokeLinecap="round" />
    <path d="M-50 -90 Q10 -110 70 -84 Q20 -50 70 -16 Q10 -40 -50 -20 Z" fill="#fff" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
  </g>
);
const IconSword: React.FC = () => (
  <g transform="rotate(-35)">
    <path d="M-12 -120 L0 -150 L12 -120 L12 50 L-12 50 Z" fill="#c9ced6" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <rect x={-50} y={50} width={100} height={18} rx={8} fill="#d4a017" stroke={INK} strokeWidth={5} />
    <rect x={-10} y={68} width={20} height={50} rx={6} fill="#6b3a1f" stroke={INK} strokeWidth={5} />
  </g>
);
const IconPath: React.FC = () => (
  <g>
    <path d="M-80 90 L-80 -20 Q-80 -100 0 -100 Q80 -100 80 -20 L80 90 Z" fill="#2b1e16" stroke="#b98d5f" strokeWidth={14} />
    <path d="M-30 40 L30 40 M10 20 L30 40 L10 60" fill="none" stroke={GOLD} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
  </g>
);

// ---------- scenes ----------
// 0-4.9 hook: start on Bek's frightened face, pull back fast to the whole rock and the endless army below
const SceneHook: React.FC<{t: number}> = ({t}) => {
  const k = span(t, 0.15, 4.6);
  const cam = {fx: 540, fy: mix(-250, 600, k), s: mix(2.7, 0.5, k)};
  return (
    <WorldScene t={t} cam={cam}>
      <BekAt x={540} y={-150} s={0.32} outfit="sogd" mood={t < 2.6 ? 'surprised' : 'worried'} blink={blinkAt(t)} lookX={t < 2.6 ? 0 : 0.4} />
    </WorldScene>
  );
};

// 4.9-10.85 the army at the foot of the rock, Iskandar steps in
const SceneArmy: React.FC<{t: number}> = ({t}) => {
  const k = span(t, 4.9, 7.4);
  const cam = {fx: 540, fy: mix(600, 2150, k), s: mix(0.5, 1.0, k)};
  const p = pop(t, 8.96);
  return (
    <g>
      <WorldScene t={t} cam={cam} />
      {p > 0 && (
        <g transform={`translate(540 1880) scale(${p})`}>
          <ellipse cx={0} cy={0} rx={300} ry={40} fill="#000" opacity={0.25} />
          <BekAt x={0} y={0} s={1.3} outfit="iskandar" mood="determined" blink={blinkAt(t, 1)} />
        </g>
      )}
    </g>
  );
};

// 10.85-12.55 can it be taken?
const SceneQuestion: React.FC<{t: number}> = ({t}) => (
  <g>
    <WorldScene t={t} cam={{fx: 540, fy: mix(650, 580, span(t, 10.85, 12.5)), s: 0.5}} />
    <g transform={`translate(540 960) scale(${pop(t, 11.0)}) rotate(${Math.sin(t * 4) * 4})`}>
      <Text x={0} y={90} size={300} fill="#fff" stroke={12}>?</Text>
    </g>
  </g>
);

// 12.55-19.4 the envoy shouts up; the So'g'ds laugh: "find soldiers with wings!"
const SceneEnvoy: React.FC<{t: number}> = ({t}) => {
  const laugh = t >= 15.32;
  const shake = laugh ? Math.sin(t * 28) * 4 : 0;
  const wings = pop(t, 17.14);
  return (
    <g>
      <WorldScene t={t} cam={{fx: 540, fy: -120, s: 1.3}}>
        {[380, 540, 700].map((x, i) => (
          <g key={x} transform={`translate(0 ${laugh ? Math.abs(Math.sin(t * 14 + i)) * -10 : 0})`}>
            <BekAt x={x} y={-150} s={0.3} outfit="sogd" mood={laugh ? 'happy' : 'neutral'} blink={blinkAt(t, i)} lookX={-0.2 + i * 0.2} />
          </g>
        ))}
      </WorldScene>
      <g transform={`translate(${790 + shake} 1880)`}>
        <BekAt x={0} y={0} s={0.85} outfit="iskandar" mood={t < 15.3 ? 'determined' : 'worried'} blink={blinkAt(t, 2)} swing={t < 15.2 ? -50 : 0} />
      </g>
      {t >= 12.7 && t < 15.3 && (
        <g stroke="#fff" strokeWidth={9} strokeLinecap="round" fill="none" opacity={0.9}>
          {[0, 1, 2].map((i) => (
            <path key={i} d={`M${640 - i * 30} ${1260 - i * 50 - ((t * 120) % 50)} q-40 -30 -80 0`} />
          ))}
        </g>
      )}
      {laugh && (
        <g transform={`translate(270 520) rotate(-8)`}>
          <Text x={0} y={0} size={90} fill={GOLD} stroke={8}>HA-HA!</Text>
        </g>
      )}
      {wings > 0 && (
        <g transform={`translate(330 1250) scale(${wings * 1.6})`}>
          <Climber x={0} y={40} k={1.4} wings={1} t={t} />
          <Text x={130} y={-40} size={120} fill="#fff" stroke={8}>?</Text>
        </g>
      )}
    </g>
  );
};

// 19.4-24.2 Iskandar is furious and promises a big reward
const SceneAngry: React.FC<{t: number}> = ({t}) => {
  const coins = pop(t, 22.96);
  return (
    <g>
      <Bg c0="#c0392b" c1="#2a0c08" cy={55} />
      <circle cx={540} cy={1100} r={520 + Math.sin(t * 6) * 20} fill="#ff7043" opacity={0.18} />
      <BekAt x={540} y={1800} s={1.55} outfit="iskandar" mood="determined" blink={blinkAt(t)} swing={t > 20.8 ? -70 : -10} />
      <Burst x={540} y={700} t={t} t0={19.98} color={GOLD} />
      {coins > 0 && (
        <g transform={`translate(800 1320) scale(${coins * 1.3})`}>
          <circle r={190} fill={GOLD} opacity={0.18} />
          <Coins />
        </g>
      )}
    </g>
  );
};

// 24.2-36.6 night: 300 men climb the frozen face with ropes and iron pegs; 30 fall
const CLIMBERS = Array.from({length: 18}).map((_, i) => ({x: 200 + (i % 6) * 135 + (i % 2) * 30, y0: 2050 + Math.floor(i / 6) * 180 + (i % 3) * 40}));
const SceneNight: React.FC<{t: number}> = ({t}) => {
  const fy = mix(1900, 650, span(t, 24.4, 36.4));
  const climb = Math.max(0, t - 24.96) * 115;
  const hammer = t >= 28.84 && t < 32.1;
  return (
    <WorldScene t={t} cam={{fx: 540, fy, s: 0.95}} night={1}>
      {CLIMBERS.map((c, i) => {
        const fall = i === 7 && t >= 33.42 ? t - 33.42 : 0;
        const y = c.y0 - climb + fall * fall * 1400;
        const sway = Math.sin(t * 5 + i) * 6;
        if (fall > 1.6) return null;
        return (
          <g key={i}>
            {fall === 0 && <line x1={c.x} y1={y - 140} x2={c.x} y2={2360} stroke="#c9b48e" strokeWidth={5} opacity={0.8} />}
            <Climber x={c.x + sway} y={y} k={1.1} rot={fall * 260} />
            {hammer && Math.sin(t * 18 + i * 1.7) > 0.75 && (
              <g stroke={GOLD} strokeWidth={5} strokeLinecap="round">
                {[0, 1, 2, 3].map((j) => (
                  <line key={j} x1={c.x + 30} y1={y - 150} x2={c.x + 30 + Math.cos(j * 1.6) * 34} y2={y - 150 + Math.sin(j * 1.6) * 34} />
                ))}
              </g>
            )}
          </g>
        );
      })}
    </WorldScene>
  );
};

// 36.6-42.7 dawn: Bek wakes up and sees the enemy on the peak above, waving white cloths
const PEAK_MEN = [[650, -390], [700, -480], [745, -410], [690, -330], [770, -300]];
const SceneDawn: React.FC<{t: number}> = ({t}) => {
  const dawn = lerp(t, 36.6, 38.0, 0.2, 1);
  const show = pop(t, 39.52);
  const cloth = t >= 40.46 ? 1 : 0;
  return (
    <g>
      <WorldScene t={t} cam={{fx: 640, fy: mix(-260, -330, span(t, 36.6, 42.7)), s: 1.55}} dawn={dawn} night={1 - dawn}>
        {show > 0 &&
          PEAK_MEN.map(([x, y], i) => (
            <g key={i} transform={`translate(${x} ${y}) scale(${pop(t, 39.52 + i * 0.1)}) translate(${-x} ${-y})`}>
              <Climber x={x} y={y} k={0.9} cloth={cloth} t={t + i} />
            </g>
          ))}
      </WorldScene>
      <g transform={`translate(300 ${1930 - span(t, 37.6, 38.4) * 60})`}>
        <BekAt x={0} y={0} s={1.25} outfit="sogd" mood={t < 38.6 ? 'neutral' : 'surprised'} blink={t < 37.78 ? 1 : blinkAt(t)} lookX={0.7} />
      </g>
    </g>
  );
};

// 42.7-47.1 Iskandar shouts: "here are my winged soldiers!"; wings pop onto the men on the peak
const SceneShout: React.FC<{t: number}> = ({t}) => {
  const wings = pop(t, 45.04);
  return (
    <g>
      <WorldScene t={t} cam={{fx: 640, fy: -260, s: 1.0}} dawn={1}>
        {PEAK_MEN.map(([x, y], i) => (
          <Climber key={i} x={x} y={y} k={0.9} cloth={1} wings={wings} t={t + i} />
        ))}
      </WorldScene>
      <g transform="translate(540 1900)">
        <BekAt x={0} y={0} s={1.3} outfit="iskandar" mood="happy" blink={blinkAt(t)} swing={t > 43.9 ? -80 : -20} />
      </g>
      <Burst x={540} y={560} t={t} t0={45.04} color={GOLD} />
    </g>
  );
};

// 47.1-53.15 panic in the fortress; nobody knows they are only a few; the So'g'ds give up
const ScenePanic: React.FC<{t: number}> = ({t}) => {
  const lens = pop(t, 48.86);
  const give = t >= 51.74;
  return (
    <g>
      <WorldScene t={t} cam={{fx: 540, fy: -120, s: 1.45}} dawn={1} flag={give ? pop(t, 52.24) : 0}>
        {[380, 540, 700].map((x, i) => (
          <g key={x} transform={`translate(${Math.sin(t * 30 + i) * (give ? 0 : 5)} 0)`}>
            <BekAt x={x} y={-150} s={0.3} outfit="sogd" mood={give ? 'worried' : 'surprised'} blink={blinkAt(t, i)} lookX={0.6} />
          </g>
        ))}
      </WorldScene>
      <rect width={W} height={H} fill={RED} opacity={!give ? 0.1 + Math.abs(Math.sin(t * 6)) * 0.12 : 0} />
      {lens > 0 && !give && (
        <g transform={`translate(780 1450) scale(${lens})`}>
          <circle r={230} fill="#f2a46a" stroke="#fff" strokeWidth={12} />
          <g transform="scale(0.85) translate(-700 380)">
            <path d={PEAK} fill="#7a6c63" stroke={INK} strokeWidth={6} />
            {PEAK_MEN.slice(0, 3).map(([x, y], i) => (
              <Climber key={i} x={x} y={y} k={0.9} cloth={1} t={t + i} />
            ))}
          </g>
          <line x1={160} y1={160} x2={260} y2={260} stroke="#fff" strokeWidth={26} strokeLinecap="round" />
        </g>
      )}
    </g>
  );
};

// 53.15-64.3 the twist: Ravshanak; Iskandar marries her
const SceneTwist: React.FC<{t: number}> = ({t}) => {
  const her = pop(t, 55.22);
  const him = pop(t, 58.36);
  const heart = pop(t, 60.18);
  const ours = pop(t, 62.82);
  const slide = span(t, 58.2, 58.9);
  return (
    <g>
      <Bg c0="#f6c36a" c1="#7a3a12" cy={40} />
      {Array.from({length: 26}).map((_, i) => {
        const a = i * 2.4 + t * 0.4;
        const r = 300 + (i % 5) * 90;
        return <circle key={i} cx={540 + Math.cos(a) * r} cy={1050 + Math.sin(a) * r * 1.3} r={4 + (i % 3) * 3} fill="#fff6c8" opacity={0.5 + Math.sin(t * 4 + i) * 0.3} />;
      })}
      {t < 55.2 && (
        <g transform={`translate(540 1000) scale(${pop(t, 53.26) * 1.2})`}>
          <Text x={0} y={80} size={260} fill="#fff" stroke={12}>!</Text>
        </g>
      )}
      {her > 0 && (
        <g transform={`translate(${mix(540, 700, slide)} 1820) scale(${her})`}>
          <BekAt x={0} y={0} s={1.3} outfit="ravshanak" mood="happy" blink={blinkAt(t)} lookX={-0.5 * slide} />
        </g>
      )}
      {her > 0 && t >= 57.56 && (
        <g transform={`translate(540 ${mix(760, 520, slide)}) scale(${pop(t, 57.56) * (1 - slide * 0.25)})`}>
          <rect x={-250} y={-60} width={500} height={110} rx={24} fill={INK} stroke={GOLD} strokeWidth={6} />
          <Text x={0} y={30} size={72} fill={GOLD}>RAVSHANAK</Text>
        </g>
      )}
      {him > 0 && (
        <g transform={`translate(${mix(-200, 330, him)} 1820)`}>
          <BekAt x={0} y={0} s={1.3} outfit="iskandar" mood="happy" blink={blinkAt(t, 2)} lookX={0.6} />
        </g>
      )}
      {heart > 0 && (
        <g transform={`translate(520 760) scale(${heart * (1 + Math.sin(t * 8) * 0.06) * 1.5})`}>
          <Heart />
        </g>
      )}
      {ours > 0 && (
        <g transform={`translate(700 ${960 - ours * 20}) scale(${ours * 0.7})`}>
          <path d="M-150 30 L-120 -60 L-60 0 L0 -90 L60 0 L120 -60 L150 30 Z" fill={GOLD} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
          <circle cx={0} cy={-90} r={14} fill={RED} stroke={INK} strokeWidth={4} />
        </g>
      )}
    </g>
  );
};

// 64.3-end: what would you have done? 1 surrender, 2 fight to the end, 3 escape by a secret path
const CHOICES = [
  {n: '1', label: 'TASLIM', at: 67.47, Icon: IconFlag},
  {n: '2', label: 'JANG', at: 69.37, Icon: IconSword},
  {n: '3', label: 'QOCHISH', at: 71.99, Icon: IconPath},
];
const SceneVote: React.FC<{t: number}> = ({t}) => {
  let hi = -1;
  CHOICES.forEach((c, i) => {
    if (t >= c.at) hi = i;
  });
  if (t >= 74.4) hi = -1;
  return (
    <g>
      <Bg c0="#2f4a7a" c1="#0e1424" />
      <Snow t={t} n={40} o={0.4} />
      {CHOICES.map((c, i) => {
        const x = 190 + i * 350;
        const on = hi === i;
        const p = pop(t, 64.5 + i * 0.12);
        return (
          <g key={c.n} transform={`translate(${x} 900) scale(${p * (on ? 1.12 : 1)})`}>
            <rect x={-150} y={-230} width={300} height={460} rx={30} fill={on ? '#fbf1dc' : '#1b2233'} stroke={on ? GOLD : '#fff'} strokeWidth={on ? 10 : 5} />
            <g transform="translate(0 -60) scale(0.95)">
              <c.Icon />
            </g>
            <Text x={0} y={120} size={50} fill={on ? INK : '#fff'}>{c.label}</Text>
            <g transform="translate(0 230)">
              <circle r={62} fill={on ? RED : '#1b2233'} stroke="#fff" strokeWidth={6} />
              <Text x={0} y={32} size={88}>{c.n}</Text>
            </g>
          </g>
        );
      })}
      <g transform={`translate(540 1380) scale(${pop(t, 74.49)})`}>
        <rect x={-420} y={-90} width={840} height={180} rx={40} fill="#1b2233" stroke="#fff" strokeWidth={5} />
        <Text x={0} y={-16} size={50} fill="#cfd8ff">Izohlar</Text>
        <Text x={0} y={60} size={66} fill={GOLD}>1, 2 YOKI 3?</Text>
      </g>
      <FollowButton t={t} t0={FOLLOW_AT} />
    </g>
  );
};

const SCENES: [number, number, React.FC<{t: number}>][] = [
  [0, 4.9, SceneHook],
  [4.9, 10.85, SceneArmy],
  [10.85, 12.55, SceneQuestion],
  [12.55, 19.4, SceneEnvoy],
  [19.4, 24.2, SceneAngry],
  [24.2, 36.6, SceneNight],
  [36.6, 42.7, SceneDawn],
  [42.7, 47.1, SceneShout],
  [47.1, 53.15, ScenePanic],
  [53.15, 64.3, SceneTwist],
  [64.3, 99, SceneVote],
];
// scenes that continue the same camera move get no flash / zoom accent on entry
const SOFT = new Set([4.9, 24.2]);

const PAIRS = ['TASAVVUR QIL', 'ISKANDAR MAKEDONSKIY', 'UCH YUZ', "O'TTIZ KISHI", 'OQ MATO', 'QANOTLI ASKARLARIM', 'QANOTLI ASKARLARING', 'TONG OTADI', 'IKKI MING'];
const HL = /^(ISKANDAR|QANOTLI|MUKOFOT|TUN|UCH YUZ|HALOK|O'TTIZ|TONG|OQ MATO|VAHIMA|OZ|TASLIM|RAVSHANAK|BIZNING|BIRINCHI|IKKINCHI|UCHINCHI|IZOHDA)/;
const chunks = buildChunks(words as W3[], PAIRS, {"sug'dlar": "So'g'dlar"});

export const TQ3: React.FC<{at?: number}> = ({at}) => {
  useOswald();
  const cur = useCurrentFrame();
  const frame = at ?? cur;
  const t = frame / FPS;
  const idx = SCENES.findIndex(([a, b]) => t >= a && t < b);
  const [a, , S] = SCENES[Math.max(0, idx)];
  const k = t - a;
  const soft = a === 0 || SOFT.has(a);
  const zoom = soft ? 1 : 1 + lerp(k, 0, 0.25, 0.06, 0);
  const flash = soft ? 0 : lerp(k, 0, 0.12, 0.4, 0);
  const endFade = lerp(t, 80.0, 80.6, 0, 1);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
        <g transform={`translate(540 960) scale(${zoom}) translate(-540 -960)`}>
          <S t={t} />
        </g>
        <defs>
          <linearGradient id="capband" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#000" stopOpacity={0.6} />
            <stop offset="60%" stopColor="#000" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#000" stopOpacity={0} />
          </linearGradient>
        </defs>
        <rect width={W} height={470} fill="url(#capband)" />
        <rect width={W} height={H} fill="#fff" opacity={flash} />
      </svg>
      {at === undefined && <Caption t={t} chunks={chunks} hl={HL} />}
      <AbsoluteFill style={{background: '#000', opacity: endFade}} />
    </AbsoluteFill>
  );
};

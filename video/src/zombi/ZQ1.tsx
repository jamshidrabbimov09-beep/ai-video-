import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {BekAt, blinkAt, FPS, H, lerp, W} from '../tasavvur/common';
import words from './zq1_words.json';

// Zombie series part 1 "Orzu ushaldi". Cinematic look: dark grade, vignette, letterbox, grain, siren light, film subtitles.
export const ZQ1_FRAMES = Math.round(80 * FPS);
type WW = [string, number, number, string];
type S = React.FC<{t: number}>;

const Grade: React.FC<{t: number}> = ({t}) => (
  <>
    <defs>
      <radialGradient id="vig" cx="50%" cy="48%" r="70%">
        <stop offset="55%" stopColor="#000" stopOpacity={0} />
        <stop offset="100%" stopColor="#000" stopOpacity={0.85} />
      </radialGradient>
      <filter id="grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={Math.floor(t * 24) % 50} />
        <feColorMatrix values="0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0.09 0" />
      </filter>
    </defs>
    <rect width={W} height={H} fill="url(#vig)" />
    <rect width={W} height={H} filter="url(#grain)" />
    <rect width={W} height={170} fill="#000" />
    <rect y={H - 170} width={W} height={170} fill="#000" />
  </>
);

// shared: a figure in silhouette (classmates)
const Sil: React.FC<{x: number; y: number; s: number; rot?: number; c?: string}> = ({x, y, s, rot = 0, c = '#11151b'}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} fill={c}>
    <path d="M-120 0 C-120 -90 -80 -130 0 -130 C80 -130 120 -90 120 0 Z" />
    <g transform={`rotate(${rot} 0 -150)`}><ellipse cx={0} cy={-190} rx={62} ry={70} /></g>
  </g>
);

// 1. Bek's room at night, lit by the monitor: a zombie game
const SRoom: S = ({t}) => (t < 1.9 ? <SGame t={t} /> : <SFace t={t} />);
const SGame: S = ({t}) => {
  const z = lerp(t, 0, 1.9, 1.0, 1.12);
  return (
    <g transform={`translate(540 960) scale(${z}) translate(-540 -960)`}>
      <rect width={W} height={H} fill="#03130a" />
      <rect x={60} y={560} width={960} height={760} rx={20} fill="#0a2a12" stroke="#1d3d24" strokeWidth={12} />
      <path d="M60 1150 H1020" stroke="#14481f" strokeWidth={6} />
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const x = 140 + i * 150 + Math.sin(t * 2 + i) * 10 + t * 30;
        return (
          <g key={i} transform={`translate(${x} ${1150 - (i % 2) * 30})`}>
            <ellipse cx={0} cy={-150} rx={34} ry={42} fill="#6fd16f" /><circle cx={-12} cy={-156} r={7} fill="#ff2a2a" /><circle cx={12} cy={-156} r={7} fill="#ff2a2a" />
            <path d="M-40 -100 L40 -100 L32 0 L-32 0 Z" fill="#3f8f3f" /><path d="M-40 -95 L-95 -80 M40 -95 L95 -80" stroke="#6fd16f" strokeWidth={14} strokeLinecap="round" />
          </g>
        );
      })}
      <text x={540} y={700} fontSize={64} fill="#9dff9d" textAnchor="middle" fontFamily="Liberation Mono" opacity={0.85}>ZOMBIE  SURVIVAL</text>
      <rect width={W} height={H} fill="#3cff6a" opacity={0.04} />
    </g>
  );
};
const SFace: S = ({t}) => {
  const z = lerp(t, 1.9, 3.6, 1.0, 1.1);
  const flick = 0.85 + 0.15 * Math.sin(t * 31) * Math.sin(t * 7);
  return (
    <g transform={`translate(540 1000) scale(${z}) translate(-540 -1000)`}>
      <rect width={W} height={H} fill="#070a12" />
      {/* poster + shelf */}
      <rect x={90} y={520} width={220} height={300} fill="#141a26" stroke="#1f2838" strokeWidth={6} />
      <circle cx={200} cy={640} r={60} fill="#2a3a2a" opacity={0.6} />

      {/* monitor glow on everything */}
      <rect width={W} height={H} fill="#3cff6a" opacity={0.05 * flick} />
      <g style={{filter: 'brightness(0.55) saturate(0.6) hue-rotate(40deg)'}}>
        <BekAt x={540} y={2350} s={2.1} mood="determined" blink={blinkAt(t)} lookX={0} />
      </g>
      {/* rim light from monitor on Bek's face side */}
      <rect y={1500} width={W} height={420} fill="#5cff7a" opacity={0.10 * flick} />
    </g>
  );
};
// 2. black, then a grey school window: "Bugun... orzusi ushaldi"
const SToday: S = ({t}) => {
  const o = lerp(t, 4.6, 5.6, 0, 1);
  return (
    <g>
      <rect width={W} height={H} fill="#000" />
      <g opacity={o}>
        <rect x={140} y={520} width={800} height={900} fill="#8d99a6" />
        <path d="M140 970 H940 M540 520 V1420" stroke="#2b333d" strokeWidth={24} />
        <rect x={140} y={520} width={800} height={900} fill="none" stroke="#2b333d" strokeWidth={30} />
        {/* city silhouette through glass */}
        <path d="M140 1180 L240 1180 L240 1060 L320 1060 L320 1140 L420 1140 L420 1000 L500 1000 L500 1180 L640 1180 L640 1080 L720 1080 L720 1160 L940 1160 L940 1420 L140 1420 Z" fill="#5d6773" />
      </g>
    </g>
  );
};
// 3. classroom, third lesson; at 7.62 the siren: red/blue light sweeps, shake, everyone turns
const SClass: S = ({t}) => {
  const siren = t > 7.62;
  const ph = (t * 1.6) % 1;
  const red = siren ? Math.max(0, Math.sin(t * 9)) : 0;
  const blue = siren ? Math.max(0, -Math.sin(t * 9)) : 0;
  const shake = siren ? lerp(t, 7.62, 8.4, 10, 2) : 0;
  const sx = Math.sin(t * 53) * shake, sy = Math.cos(t * 47) * shake;
  const turn = siren ? lerp(t, 7.9, 8.4, 0, 1) : 0;
  return (
    <g transform={`translate(${sx} ${sy})`}>
      <rect width={W} height={H} fill="#2a2f38" />
      {/* back wall + board */}
      <rect x={0} y={170} width={W} height={760} fill="#39404b" />
      <rect x={300} y={360} width={620} height={300} fill="#1d3326" stroke="#5a4a3a" strokeWidth={14} />
      <text x={610} y={530} fontSize={70} fill="#cfd8cf" textAnchor="middle" fontFamily="Liberation Serif" opacity={0.7}>3-dars</text>
      {/* window on the left, light pours in */}
      <rect x={0} y={330} width={220} height={520} fill="#9aa6b2" />
      <path d="M0 590 H220 M110 330 V850" stroke="#2b333d" strokeWidth={16} />
      <path d={`M220 330 L${780 + ph * 0} 1750 L330 1750 L220 850 Z`} fill="#c8d2dc" opacity={0.06} />
      {/* floor */}
      <rect y={930} width={W} height={1000} fill="#232830" />
      {/* desks + classmates in silhouette */}
      {[[260, 1060, 0.7], [620, 1060, 0.7], [150, 1280, 0.95], [520, 1290, 0.95]].map(([x, y, s], i) => (
        <g key={i}>
          <rect x={x - 150 * s} y={y - 20} width={300 * s} height={26} fill="#3a2e24" />
          <Sil x={x} y={y} s={s} rot={turn * -25} c="#14181e" />
        </g>
      ))}
      {/* Bek close-up, right third, lit by the window */}
      <g style={{filter: 'brightness(0.8) saturate(0.75)'}}>
        <BekAt x={790} y={2330} s={1.85} mood={siren ? 'surprised' : 'neutral'} blink={blinkAt(t, 1)} lookX={siren ? -16 * turn : -4} />
      </g>
      {/* siren light */}
      <rect width={W} height={H} fill="#ff2030" opacity={0.28 * red} style={{mixBlendMode: 'screen'}} />
      <rect width={W} height={H} fill="#2050ff" opacity={0.28 * blue} style={{mixBlendMode: 'screen'}} />
      {siren && <rect width={W} height={H} fill="#fff" opacity={lerp(t, 7.62, 7.75, 0.35, 0)} />}
    </g>
  );
};

const SCENES: [number, number, S][] = [
  [0, 3.6, SRoom], [3.6, 6.1, SToday], [6.1, 999, SClass],
];

// film subtitles: show the current sentence fragment (up to ~5 words) near the bottom
const Subs: React.FC<{t: number}> = ({t}) => {
  const ws = words as WW[];
  const i = ws.findIndex((w, k) => t >= w[1] - 0.05 && (k === ws.length - 1 || t < ws[k + 1][1] - 0.05));
  if (i < 0 || t > ws[i][2] + 0.8) return null;
  // group: walk back to the sentence start or 5 words
  let a = i;
  while (a > 0 && i - a < 4 && !/[.!?…]$/.test(ws[a - 1][0])) a--;
  const sp = ws[i][3];
  const color = sp === 'O' ? '#ffd3a8' : sp === 'B' ? '#bfe3ff' : '#ffffff';
  const text = ws.slice(a, i + 1).map((w) => w[0]).join(' ');
  return (
    <div style={{position: 'absolute', bottom: 260, width: '100%', textAlign: 'center', padding: '0 80px', boxSizing: 'border-box', fontFamily: 'Liberation Sans, Arial', fontWeight: 700, fontSize: 58, color, textShadow: '0 3px 0 #000, 0 0 18px #000', lineHeight: 1.2}}>
      {sp === 'O' && <span style={{opacity: 0.7}}>ONA: </span>}
      {sp === 'B' && <span style={{opacity: 0.7}}>BEK: </span>}
      {text}
    </div>
  );
};

export const ZQ1: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const idx = SCENES.findIndex(([a, b]) => t >= a && t < b);
  const [, , Sc] = SCENES[Math.max(0, idx)];
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
        <Sc t={t} />
        <Grade t={t} />
      </svg>
      <Subs t={t} />
    </AbsoluteFill>
  );
};

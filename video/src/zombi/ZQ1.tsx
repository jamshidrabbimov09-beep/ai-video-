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


// 4. phones: the same alert on every screen
const SPhones: S = ({t}) => {
  const k = t - 9.8;
  return (
    <g>
      <rect width={W} height={H} fill="#0c0f14" />
      {[[300, 900, -8, 0], [760, 820, 6, 0.25], [540, 1300, -2, 0.5]].map(([x, y, r, d], i) => {
        const p = lerp(k, d, d + 0.3, 0, 1);
        return (
          <g key={i} transform={`translate(${x} ${y}) rotate(${r}) scale(${0.9 + 0.1 * p})`} opacity={p}>
            <rect x={-170} y={-320} width={340} height={640} rx={40} fill="#05070a" stroke="#2a313b" strokeWidth={10} />
            <rect x={-150} y={-290} width={300} height={580} rx={24} fill="#1a1f27" />
            <rect x={-140} y={-230} width={280} height={190} rx={18} fill="#d22a2a" opacity={0.9 + 0.1 * Math.sin(t * 12)} />
            <text x={0} y={-170} fontSize={34} fill="#fff" textAnchor="middle" fontFamily="Liberation Sans" fontWeight={700}>⚠ FAVQULODDA</text>
            <text x={0} y={-120} fontSize={26} fill="#fff" textAnchor="middle" fontFamily="Liberation Sans">Shahar evakuatsiya</text>
            <text x={0} y={-88} fontSize={26} fill="#fff" textAnchor="middle" fontFamily="Liberation Sans">qilinmoqda</text>
          </g>
        );
      })}
      <rect width={W} height={H} fill="#ff2030" opacity={0.12 * Math.max(0, Math.sin(t * 9))} />
    </g>
  );
};
// 5. at the window: people running outside, one shadow attacks another
const SWindow: S = ({t}) => {
  const k = t - 14.4;
  const attack = t > 18.5;
  return (
    <g>
      <rect width={W} height={H} fill="#1b2027" />
      <rect x={90} y={380} width={900} height={900} fill="#7d8995" />
      {/* street */}
      <path d="M90 1000 H990 V1280 H90 Z" fill="#5a636d" />
      <path d="M90 900 L200 900 L200 760 L330 760 L330 880 L470 880 L470 700 L560 700 L560 900 L760 900 L760 800 L860 800 L860 900 L990 900 V1000 H90 Z" fill="#4a535d" />
      {[0, 1, 2, 3, 4].map((i) => {
        const x = 90 + ((k * (170 + i * 40) + i * 210) % 900);
        const y = 1080 + (i % 3) * 50;
        return <g key={i} transform={`translate(${x} ${y})`} fill="#12161b"><circle cx={0} cy={-80} r={16} /><path d={`M-14 -62 L14 -62 L18 -10 L-18 -10 Z`} /><path d={`M-10 -12 L${-22 + Math.sin(t * 14 + i) * 14} 30 M10 -12 L${22 - Math.sin(t * 14 + i) * 14} 30`} stroke="#12161b" strokeWidth={10} /></g>;
      })}
      {attack && (
        <g transform={`translate(${lerp(t, 18.5, 18.9, 700, 640)} 1150)`} fill="#0a0c0f">
          <circle cx={0} cy={-80} r={18} /><path d="M-16 -62 L16 -62 L20 -10 L-20 -10 Z" />
          <g transform={`translate(${lerp(t, 18.5, 18.8, 120, 30)} 0) rotate(${lerp(t, 18.5, 18.8, 0, -35)} 0 -40)`}><circle cx={0} cy={-80} r={18} /><path d="M-16 -62 L16 -62 L20 -10 L-20 -10 Z" /><path d="M-16 -55 L-60 -70" stroke="#0a0c0f" strokeWidth={10} /></g>
        </g>
      )}
      <path d="M90 830 H990 M540 380 V1280" stroke="#232a33" strokeWidth={22} />
      <rect x={90} y={380} width={900} height={900} fill="none" stroke="#232a33" strokeWidth={30} />
      {/* classmates at the window, from behind */}
      {[[250, 1640, 1.3], [560, 1700, 1.45], [860, 1650, 1.3]].map(([x, y, sc], i) => <Sil key={i} x={x} y={y} s={sc} c="#0d1014" />)}
      <rect width={W} height={H} fill="#ff2030" opacity={0.14 * Math.max(0, Math.sin(t * 9))} />
      <rect width={W} height={H} fill="#2050ff" opacity={0.14 * Math.max(0, -Math.sin(t * 9))} />
    </g>
  );
};
// 6. the teacher slams the door
const STeacher: S = ({t}) => {
  const shut = lerp(t, 22.3, 22.6, 0, 1);
  return (
    <g>
      <rect width={W} height={H} fill="#262b33" />
      <rect x={300} y={420} width={480} height={1180} fill="#b9c3cc" />
      <g transform={`translate(300 420) scale(${1 - shut * 0.0 + 0.0001} 1)`}>
        <rect x={0} y={0} width={480 * (1 - shut) + 40} height={1180} fill="#5a3f2a" stroke="#1a120c" strokeWidth={10} transform={`translate(${480 * shut - 40 * shut} 0)`} />
      </g>
      <g transform={`translate(${lerp(t, 19.8, 21, 640, 560)} 1560)`} fill="#0d1014">
        <ellipse cx={0} cy={-560} rx={70} ry={82} />
        <path d="M-150 0 C-150 -300 -120 -460 0 -470 C120 -460 150 -300 150 0 Z" />
        <path d={`M120 -400 L${260 + Math.sin(t * 10) * 10} -520`} stroke="#0d1014" strokeWidth={46} strokeLinecap="round" />
      </g>
      {t > 22.6 && <rect width={W} height={H} fill="#000" opacity={lerp(t, 22.6, 22.7, 0.6, 0)} />}
      <rect width={W} height={H} fill="#ff2030" opacity={0.1 * Math.max(0, Math.sin(t * 9))} />
    </g>
  );
};
// 7. the school gate closes; they are inside
const SGate: S = ({t}) => {
  const c = lerp(t, 23.4, 24.5, 0, 1);
  return (
    <g>
      <rect width={W} height={H} fill="#1d2229" />
      <rect x={0} y={420} width={W} height={560} fill="#3a424c" />
      <rect x={140} y={520} width={800} height={460} fill="#59626c" />
      {[0, 1, 2, 3, 4, 5].map((i) => <rect key={i} x={200 + i * 120} y={580} width={70} height={100} fill="#20262d" />)}
      <rect y={980} width={W} height={940} fill="#2a3038" />
      {/* two gate halves */}
      {[-1, 1].map((d) => (
        <g key={d} transform={`translate(${540 + d * (540 - 540 * c) - (d < 0 ? 540 : 0)} 0)`}>
          {Array.from({length: 7}).map((_, i) => <rect key={i} x={20 + i * 76} y={900} width={16} height={900} fill="#0b0d10" />)}
          <rect x={0} y={900} width={540} height={24} fill="#0b0d10" /><rect x={0} y={1500} width={540} height={24} fill="#0b0d10" />
        </g>
      ))}
      {t > 24.5 && <rect width={W} height={H} fill="#fff" opacity={lerp(t, 24.5, 24.62, 0.25, 0)} />}
      <rect width={W} height={H} fill="#ff2030" opacity={0.16 * Math.max(0, Math.sin(t * 9))} />
    </g>
  );
};
// 8. Bek freezes: his family
const SFreeze: S = ({t}) => {
  const z = lerp(t, 26.6, 32.4, 1.0, 1.25);
  return (
    <g transform={`translate(540 900) scale(${z}) translate(-540 -900)`}>
      <rect width={W} height={H} fill="#151a21" />
      <g opacity={0.35} style={{filter: 'blur(14px)'}}>{[[200, 1200, 1], [880, 1250, 1.1]].map(([x, y, sc], i) => <Sil key={i} x={x} y={y} s={sc} />)}</g>
      <g style={{filter: 'brightness(0.75) saturate(0.7)'}}>
        <BekAt x={540} y={2400} s={2.2} mood={t > 29 ? 'worried' : 'surprised'} blink={blinkAt(t)} lookX={0} />
      </g>
      <rect width={W} height={H} fill="#ff2030" opacity={0.06 * Math.max(0, Math.sin(t * 9))} />
    </g>
  );
};
// 9. calling mum: rings, no answer; again; connects
const SCall: S = ({t}) => {
  const connected = t > 40.9;
  const pulse = (t * 1.5) % 1;
  return (
    <g>
      <rect width={W} height={H} fill="#07090c" />
      <g transform="translate(540 1000)">
        <rect x={-300} y={-600} width={600} height={1200} rx={70} fill="#05070a" stroke="#2a313b" strokeWidth={14} />
        <rect x={-270} y={-560} width={540} height={1120} rx={44} fill={connected ? '#10261a' : '#141a22'} />
        {!connected && <circle cx={0} cy={-250} r={110 + pulse * 70} fill="none" stroke="#6fd18a" strokeWidth={6} opacity={1 - pulse} />}
        <circle cx={0} cy={-250} r={110} fill="#2a3340" />
        <text x={0} y={-215} fontSize={110} fill="#c9d3de" textAnchor="middle" fontFamily="Liberation Sans">👩</text>
        <text x={0} y={-60} fontSize={76} fill="#fff" textAnchor="middle" fontFamily="Liberation Sans" fontWeight={700}>Oyim</text>
        <text x={0} y={10} fontSize={40} fill="#9aa6b2" textAnchor="middle" fontFamily="Liberation Sans">
          {connected ? `00:0${Math.min(9, Math.floor(t - 40.9))}` : t < 34.6 ? "Qo'ng'iroq qilinmoqda..." : t < 37.0 ? 'Javob yo\'q' : "Qo'ng'iroq qilinmoqda..."}
        </text>
        <circle cx={0} cy={400} r={70} fill="#d23a3a" />
      </g>
    </g>
  );
};
// 10. split screen: Bek in the classroom corner / mum on the evacuation bus
const SSplit: S = ({t}) => {
  const sp = (words as WW[]).find((w, k, a) => t >= w[1] && (k === a.length - 1 || t < a[k + 1][1]))?.[3];
  return (
    <g>
      {/* top: Bek */}
      <g>
        <rect width={W} height={960} fill="#1e242c" />
        <g style={{filter: `brightness(${sp === 'B' ? 0.85 : 0.6}) saturate(0.7)`}}>
          <BekAt x={540} y={1500} s={1.5} mood={t > 53 ? 'worried' : 'surprised'} blink={blinkAt(t)} lookX={6} />
        </g>
        <rect x={690} y={600} width={64} height={140} rx={14} fill="#05070a" stroke="#2a313b" strokeWidth={4} transform="rotate(12 722 670)" />
        <rect width={W} height={960} fill="#ff2030" opacity={0.08 * Math.max(0, Math.sin(t * 9))} />
      </g>
      {/* bottom: mum on the bus, silhouette against passing lights */}
      <g>
        <rect y={960} width={W} height={960} fill="#0f141b" />
        <rect x={60} y={1080} width={960} height={420} rx={30} fill="#3c4a5a" />
        {[0, 1, 2, 3].map((i) => <rect key={i} x={((t * 600 + i * 330) % 1300) - 200} y={1120} width={120} height={340} fill={i % 2 ? '#ff3a3a' : '#ffd27a'} opacity={0.35} />)}
        <path d="M60 1290 H1020" stroke="#202833" strokeWidth={14} />
        <g transform={`translate(560 ${1860 + Math.sin(t * 6) * 4})`} fill="#07090c" style={{filter: `brightness(${sp === 'O' ? 1.6 : 1})`}}>
          <path d="M-190 0 C-190 -250 -130 -340 0 -350 C130 -340 190 -250 190 0 Z" />
          <path d="M-95 -430 C-110 -560 -40 -620 0 -620 C40 -620 110 -560 95 -430 C60 -360 -60 -360 -95 -430 Z" />
          <path d="M-120 -470 C-140 -620 -40 -680 0 -680 C40 -680 140 -620 120 -470 L150 -330 L-150 -330 Z" opacity={0.95} />
          <rect x={95} y={-560} width={44} height={90} rx={10} fill="#05070a" />
        </g>
      </g>
      <rect y={952} width={W} height={16} fill="#000" />
    </g>
  );
};
// 11. call dropped
const SDropped: S = ({t}) => (
  <g>
    <rect width={W} height={H} fill="#07090c" />
    <g transform="translate(540 1000)">
      <rect x={-300} y={-600} width={600} height={1200} rx={70} fill="#05070a" stroke="#2a313b" strokeWidth={14} />
      <rect x={-270} y={-560} width={540} height={1120} rx={44} fill="#141a22" />
      <text x={0} y={-60} fontSize={76} fill="#fff" textAnchor="middle" fontFamily="Liberation Sans" fontWeight={700}>Oyim</text>
      <text x={0} y={20} fontSize={44} fill="#d23a3a" textAnchor="middle" fontFamily="Liberation Sans">Aloqa uzildi</text>
    </g>
  </g>
);
// 12. Bek turns: Sardor in the corner, hand hidden
const SSardor: S = ({t}) => {
  const breathe = 1 + 0.02 * Math.sin(t * 5);
  return (
    <g>
      <rect width={W} height={H} fill="#0d1116" />
      <path d="M0 400 L700 900 L700 1920 L0 1920 Z" fill="#141920" />
      <path d="M1080 400 L700 900 L700 1920 L1080 1920 Z" fill="#11151b" />
      <g transform={`translate(400 1560) scale(${breathe})`} fill="#050608">
        <ellipse cx={0} cy={-330} rx={78} ry={88} />
        <path d="M-200 60 C-200 -180 -140 -250 0 -255 C140 -250 200 -180 200 60 Z" />
        <path d="M-150 -120 C-260 -40 -170 60 -60 30" stroke="#050608" strokeWidth={60} fill="none" strokeLinecap="round" />
      </g>
      <rect width={W} height={H} fill="#ff2030" opacity={0.08 * Math.max(0, Math.sin(t * 9))} />
      <g transform={`translate(${lerp(t, 64.6, 65.6, 1350, 1040)} 0)`} style={{filter: 'brightness(0.6) saturate(0.6)'}}>
        <BekAt x={0} y={2500} s={2.3} mood="surprised" blink={0} lookX={-18} />
      </g>
    </g>
  );
};
// 13. his eyes change
const SEyes: S = ({t}) => {
  const c = lerp(t, 70.6, 72.6, 0, 1);
  const iris = `rgb(${Math.round(60 + 110 * c)}, ${Math.round(40 + 160 * c)}, ${Math.round(30 + 110 * c)})`;
  return (
    <g>
      <rect width={W} height={H} fill="#030405" />
      <rect y={760} width={W} height={400} fill="#1b1410" />
      {[330, 750].map((x) => (
        <g key={x}>
          <ellipse cx={x} cy={960} rx={150} ry={lerp(t, 70.2, 70.5, 10, 80)} fill={`rgb(${235 - 60 * c},${230 - 30 * c},${220 - 60 * c})`} />
          <circle cx={x} cy={960} r={62} fill={iris} />
          <circle cx={x} cy={960} r={lerp(c, 0, 1, 28, 6)} fill="#000" />
          {c > 0.5 && <circle cx={x} cy={960} r={110} fill="#a8ff9a" opacity={0.12 * c} />}
        </g>
      ))}
      {t > 73.3 && <rect width={W} height={H} fill="#000" />}
    </g>
  );
};
// 14. end card
const SEnd: S = ({t}) => (
  <g>
    <rect width={W} height={H} fill="#000" />
    <text x={540} y={860} fontSize={64} fill="#fff" textAnchor="middle" fontFamily="Liberation Sans" fontWeight={700} opacity={lerp(t, 73.6, 74.2, 0, 1)}>Sen Bekning o'rnida</text>
    <text x={540} y={950} fontSize={64} fill="#fff" textAnchor="middle" fontFamily="Liberation Sans" fontWeight={700} opacity={lerp(t, 73.9, 74.5, 0, 1)}>nima qilarding?</text>
    <text x={540} y={1180} fontSize={46} fill="#d23a3a" textAnchor="middle" fontFamily="Liberation Sans" fontWeight={700} letterSpacing={6} opacity={lerp(t, 76.6, 77.2, 0, 1)}>1-QISM · DAVOMI BOR</text>
  </g>
);

const SCENES: [number, number, S][] = [
  [0, 3.6, SRoom], [3.6, 6.1, SToday], [6.1, 9.8, SClass], [9.8, 14.4, SPhones], [14.4, 19.7, SWindow],
  [19.7, 23.3, STeacher], [23.3, 26.7, SGate], [26.7, 32.5, SFreeze], [32.5, 41.1, SCall], [41.1, 62.4, SSplit],
  [62.4, 64.5, SDropped], [64.5, 70.1, SSardor], [70.1, 73.55, SEyes], [73.55, 999, SEnd],
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

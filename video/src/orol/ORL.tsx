import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {BekAt, blinkAt, buildChunks, Burst, Caption, FollowButton, FPS, GOLD, H, INK, lerp, pop, RED, Text, useOswald, W, W3} from '../tasavvur/common';
import words from './words.json';

// New direction video 1: "Dengiz qayerga ketdi?" (Aral Sea, Mo'ynoq). Voice public/orol/raw.mp3 (91.6 s).
export const FOLLOW_AT = 91.9;
export const ORL_FRAMES = Math.round((FOLLOW_AT + 3.2) * FPS);
const VOICE_END = 91.4;

const SEA = '#2f8fd0', SEA2 = '#1f6fa8', SAND = '#e2b673', SAND2 = '#b98445', RUST = '#8c3f22';
type S = React.FC<{t: number}>;

const Sky: React.FC<{c0: string; c1: string; id: string}> = ({c0, c1, id}) => (
  <>
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={c0} />
        <stop offset="100%" stopColor={c1} />
      </linearGradient>
    </defs>
    <rect width={W} height={H} fill={`url(#${id})`} />
  </>
);
const Sand: React.FC<{y: number}> = ({y}) => (
  <>
    <rect y={y} width={W} height={H - y} fill={SAND} />
    <rect y={y + 380} width={W} height={H - y} fill={SAND2} opacity={0.35} />
    <g stroke="#9a6a34" strokeWidth={5} fill="none" opacity={0.6} strokeLinecap="round">
      <path d={`M40 ${y + 300} l140 -40 l80 80 l160 -40`} /><path d={`M600 ${y + 520} l120 -60 l140 50 l180 -40`} />
      <path d={`M60 ${y + 600} l140 40 l130 -60`} /><path d={`M760 ${y + 220} l140 30 l100 -50`} />
    </g>
  </>
);
const Waves: React.FC<{y: number; t: number; c?: string}> = ({y, t, c = '#ffffff'}) => (
  <g stroke={c} strokeWidth={6} fill="none" opacity={0.5} strokeLinecap="round">
    {[0, 1, 2, 3].map((i) => {
      const off = ((t * 60 + i * 170) % 340) - 170;
      return <path key={i} d={`M${80 + off + i * 230} ${y + 40 + i * 70} q30 -18 60 0 t60 0`} />;
    })}
  </g>
);
const Ship: React.FC<{x: number; y: number; s?: number; rust?: boolean; tilt?: number}> = ({x, y, s = 1, rust = false, tilt = 0}) => (
  <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${s})`}>
    <path d="M-320 0 L320 0 L270 120 L-260 120 Z" fill={rust ? RUST : '#d94b3a'} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
    <path d="M-320 0 L320 0 L312 28 L-312 28 Z" fill={rust ? '#5b2a17' : '#f2f2f2'} />
    <rect x={-20} y={-110} width={220} height={110} fill={rust ? '#c9b9a0' : '#f6f1e6'} stroke={INK} strokeWidth={8} />
    {[10, 80, 150].map((wx) => <rect key={wx} x={wx} y={-80} width={40} height={40} fill="#4a6a80" stroke={INK} strokeWidth={5} />)}
    <rect x={60} y={-190} width={44} height={80} fill={rust ? '#6b2f1a' : '#333'} stroke={INK} strokeWidth={8} />
    <line x1={-200} y1={0} x2={-200} y2={-220} stroke={INK} strokeWidth={10} />
    <line x1={-200} y1={-200} x2={-60} y2={-30} stroke={INK} strokeWidth={4} />
    {rust && <g fill="#6b3a1f" opacity={0.55}><circle cx={-180} cy={70} r={18} /><circle cx={-40} cy={86} r={14} /><circle cx={170} cy={76} r={20} /></g>}
  </g>
);
const Fish: React.FC<{x: number; y: number; s?: number; c?: string; bone?: boolean}> = ({x, y, s = 1, c = '#9cc7e0', bone = false}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {bone ? (
      <g stroke="#f4efe4" strokeWidth={7} fill="none" strokeLinecap="round">
        <circle cx={-46} cy={0} r={18} /><line x1={-28} y1={0} x2={50} y2={0} /><path d="M50 0 l24 -22 M50 0 l24 22" />
        {[-10, 10, 30].map((bx) => <path key={bx} d={`M${bx} -24 L${bx} 24`} />)}
      </g>
    ) : (
      <>
        <path d="M-60 0 C-30 -36 30 -36 50 0 C30 36 -30 36 -60 0 Z" fill={c} stroke={INK} strokeWidth={6} />
        <path d="M46 0 L84 -28 L84 28 Z" fill={c} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        <circle cx={-34} cy={-6} r={6} fill={INK} />
      </>
    )}
  </g>
);
const Plate: React.FC<{x: number; y: number; text: string; t: number; t0: number; fill?: string; size?: number; color?: string}> = ({x, y, text, t, t0, fill = GOLD, size = 120, color = INK}) => {
  const p = pop(t, t0);
  if (p <= 0) return null;
  const w = text.length * size * 0.52 + 70;
  return (
    <g transform={`translate(${x} ${y}) scale(${p})`}>
      <rect x={-w / 2} y={-size * 0.85} width={w} height={size * 1.15} rx={22} fill={fill} stroke={INK} strokeWidth={8} />
      <Text x={0} y={size * 0.12} size={size} fill={color}>{text}</Text>
    </g>
  );
};
const Can: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-50} y={-34} width={100} height={68} rx={14} fill="#c8ccd2" stroke={INK} strokeWidth={6} />
    <rect x={-50} y={-14} width={100} height={28} fill="#2f7fd1" />
    <Fish x={0} y={0} s={0.32} c="#ffc94a" />
  </g>
);

// 1. hook: ships in the middle of the desert
const SHook: S = ({t}) => {
  const z = lerp(t, 0, 4.8, 1, 1.12);
  return (
    <g transform={`translate(540 1100) scale(${z}) translate(-540 -1100)`}>
      <Sky c0="#f08a3c" c1="#fbe3a8" id="sk1" />
      <circle cx={820} cy={760} r={120} fill="#fff3c9" opacity={0.85} />
      <Sand y={1000} />
      <Ship x={380} y={1080} s={0.85} rust tilt={-4} />
      <Ship x={860} y={1180} s={0.6} rust tilt={5} />
      <BekAt x={620} y={1640} s={0.95} mood="surprised" blink={blinkAt(t)} lookX={-8} />
      {t > 4.0 && <g transform={`translate(700 1060) scale(${pop(t, 4.0)})`}><Text x={0} y={0} size={170} fill={RED} stroke={8}>?</Text></g>}
    </g>
  );
};
// 2. 1960: the sea at your door, father is a fisherman
const S1960: S = ({t}) => {
  const k = t - 4.8;
  return (
    <g>
      <Sky c0="#7cc4ef" c1="#d8f0ff" id="sk2" />
      <circle cx={850} cy={620} r={90} fill="#fff6c8" />
      <rect y={900} width={W} height={420} fill={SEA} />
      <Waves y={930} t={t} />
      <g transform={`translate(${lerp(k, 0, 6.6, 300, 420)} ${980 + Math.sin(t * 2) * 8})`}><Ship x={0} y={0} s={0.5} /></g>
      <rect y={1300} width={W} height={620} fill={SAND} />
      <path d="M0 1300 Q270 1270 540 1300 T1080 1300 L1080 1330 L0 1330 Z" fill="#f2d39a" />
      {/* house */}
      <g transform="translate(140 1260)">
        <rect x={0} y={0} width={240} height={170} fill="#efe2c4" stroke={INK} strokeWidth={8} />
        <path d="M-20 0 L120 -110 L260 0 Z" fill="#b5523a" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
        <rect x={90} y={70} width={60} height={100} fill="#7a5233" stroke={INK} strokeWidth={6} />
      </g>
      <BekAt x={720} y={1690} s={0.95} mood="happy" blink={blinkAt(t, 1)} lookX={-6} />
      <Plate x={540} y={760} text="1960" t={t} t0={4.85} size={130} />
    </g>
  );
};
// 3. ships out to sea, factory, fish to the whole Union
const SFactory: S = ({t}) => (
  <g>
    <Sky c0="#9ed4f2" c1="#e6f6ff" id="sk3" />
    <rect y={1150} width={W} height={770} fill="#cfc6b4" />
    <g transform="translate(160 760)">
      <rect x={0} y={0} width={760} height={400} fill="#e7d9bd" stroke={INK} strokeWidth={8} />
      <path d="M0 0 L190 -110 L190 0 L380 -110 L380 0 L570 -110 L570 0 L760 -110 L760 0 Z" fill="#9aa6ad" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
      <rect x={640} y={-260} width={60} height={160} fill="#8a5a3a" stroke={INK} strokeWidth={8} />
      {[0, 1, 2].map((i) => <circle key={i} cx={670 + Math.sin(t * 2 + i) * 20} cy={-300 - ((t * 70 + i * 60) % 180)} r={26 + i * 6} fill="#f2f2f2" opacity={0.8} />)}
      <Text x={380} y={110} size={64} fill={INK}>BALIQ ZAVODI</Text>
      <rect x={-60} y={300} width={880} height={36} fill="#555" stroke={INK} strokeWidth={6} />
    </g>
    {[0, 1, 2, 3, 4, 5].map((i) => <Can key={i} x={((t * 160 + i * 180) % 1080)} y={1040} s={0.9} />)}
    {t > 15.6 && [0, 1, 2].map((i) => {
      const p = lerp(t, 15.7 + i * 0.3, 16.8 + i * 0.3, 0, 1);
      const a = [-0.5, 0, 0.5][i];
      return <g key={i} opacity={p}><line x1={540} y1={1350} x2={540 + Math.sin(a) * 420 * p} y2={1350 + 380 * p} stroke={RED} strokeWidth={14} strokeLinecap="round" /><Can x={540 + Math.sin(a) * 420 * p} y={1350 + 380 * p} s={1.1} /></g>;
    })}
    <Plate x={540} y={1300} text="BUTUN ITTIFOQQA" t={t} t0={16.9} size={70} fill="#fff" />
  </g>
);
// 4. fourth largest lake in the world
const SRank: S = ({t}) => {
  const rows = [['1', 'KASPIY'], ['2', 'YUQORI KO\'L'], ['3', 'VIKTORIYA'], ['4', 'OROL']];
  return (
    <g>
      <rect width={W} height={H} fill="#16324f" />
      {rows.map(([n, name], i) => {
        const p = pop(t, 19.6 + i * 0.45);
        const hl = i === 3;
        return (
          <g key={n} transform={`translate(540 ${700 + i * 230}) scale(${hl ? p * (1 + 0.05 * Math.sin(t * 6)) : p})`} opacity={hl ? 1 : 0.75}>
            <rect x={-400} y={-90} width={800} height={170} rx={26} fill={hl ? GOLD : '#2c5a85'} stroke={INK} strokeWidth={8} />
            <Text x={-300} y={30} size={110} fill={hl ? INK : '#fff'}>{n}</Text>
            <Text x={60} y={28} size={hl ? 110 : 84} fill={hl ? INK : '#fff'}>{name}</Text>
          </g>
        );
      })}
      <BekAt x={920} y={1880} s={0.55} mood="surprised" blink={blinkAt(t)} lookX={-8} />
    </g>
  );
};
// 5. the water starts to leave: 100 m, 1 km, 10 km
const SRecede: S = ({t}) => {
  const shore = lerp(t, 23.6, 31.8, 1330, 980);
  const label = t < 29.4 ? (t > 28.1 ? '100 M' : '') : t < 30.9 ? '1 KM' : '10 KM';
  return (
    <g>
      <Sky c0="#8ccbef" c1="#e1f3ff" id="sk5" />
      <rect y={860} width={W} height={shore - 860} fill={SEA} />
      <Waves y={870} t={t} />
      <rect y={shore} width={W} height={H - shore} fill={SAND} />
      <rect y={shore} width={W} height={30} fill="#c99a5a" opacity={0.6} />
      {[1, 2, 3].map((i) => <path key={i} d={`M0 ${shore + i * 70} H1080`} stroke="#c9965a" strokeWidth={5} opacity={lerp(t, 25 + i, 26 + i, 0, 0.7)} />)}
      <BekAt x={300} y={1720} s={0.95} mood="worried" blink={blinkAt(t, 2)} lookX={6} />
      {label && (
        <g>
          <line x1={700} y1={1600} x2={700} y2={shore + 40} stroke={RED} strokeWidth={12} markerEnd="" />
          <path d={`M680 ${shore + 70} L700 ${shore + 30} L720 ${shore + 70} Z`} fill={RED} />
          <Plate key={label} x={760} y={1560} text={label} t={t} t0={label === '100 M' ? 28.16 : label === '1 KM' ? 29.54 : 31.02} size={100} />
        </g>
      )}
    </g>
  );
};
// 6. map: Amudaryo and Sirdaryo turned to cotton fields
const SRivers: S = ({t}) => {
  const div = lerp(t, 37.4, 39.4, 0, 1);
  const sea = lerp(t, 37.6, 40.0, 1, 0.55);
  return (
    <g>
      <rect width={W} height={H} fill="#e8d7a8" />
      <g transform={`translate(560 760) scale(${sea})`}>
        <path d="M-230 -160 C-120 -260 120 -250 210 -140 C280 -40 250 140 140 220 C20 290 -160 260 -240 150 C-300 60 -300 -80 -230 -160 Z" fill={SEA} stroke={INK} strokeWidth={8} />
      </g>
      <Text x={560} y={790} size={84} fill="#fff" stroke={6}>OROL</Text>
      {/* rivers */}
      <path d="M250 1800 C300 1500 380 1250 470 980" stroke={SEA} strokeWidth={26} fill="none" strokeLinecap="round" opacity={1 - div * 0.75} />
      <path d="M950 1700 C880 1400 800 1180 700 960" stroke={SEA} strokeWidth={26} fill="none" strokeLinecap="round" opacity={1 - div * 0.75} />
      <Plate x={220} y={1640} text="AMUDARYO" t={t} t0={34.9} size={60} fill="#fff" />
      <Plate x={860} y={1560} text="SIRDARYO" t={t} t0={35.9} size={60} fill="#fff" />
      {/* canals to cotton */}
      {div > 0 && (
        <g>
          <path d="M330 1420 C200 1420 120 1380 60 1300" stroke={SEA} strokeWidth={20} fill="none" strokeDasharray={`${div * 500} 600`} strokeLinecap="round" />
          <path d="M840 1330 C960 1330 1020 1260 1060 1180" stroke={SEA} strokeWidth={20} fill="none" strokeDasharray={`${div * 500} 600`} strokeLinecap="round" />
          {[[90, 1220], [170, 1260], [60, 1360], [1000, 1110], [930, 1150], [1030, 1240]].map(([x, y], i) => (
            <g key={i} transform={`translate(${x} ${y}) scale(${pop(t, 38.3 + i * 0.12)})`}>
              <circle r={26} fill="#fff" stroke={INK} strokeWidth={5} /><circle cx={-18} cy={10} r={18} fill="#fff" stroke={INK} strokeWidth={5} /><circle cx={18} cy={10} r={18} fill="#fff" stroke={INK} strokeWidth={5} />
            </g>
          ))}
          <Plate x={540} y={1250} text="PAXTA" t={t} t0={38.3} size={90} />
        </g>
      )}
    </g>
  );
};
// 7. the sea is gone; father's ship sits on the sand
const SDry: S = ({t}) => {
  const water = lerp(t, 40.2, 42.0, 1, 0);
  return (
    <g>
      <Sky c0="#f2a65a" c1="#fbe6b4" id="sk7" />
      <Sand y={1000} />
      <rect y={1000} width={W} height={400} fill={SEA} opacity={water} />
      <Ship x={480} y={1180} s={0.85} rust={t > 42} tilt={lerp(t, 41, 43, 0, -6)} />
      <BekAt x={830} y={1720} s={0.9} mood="worried" blink={blinkAt(t)} lookX={-8} />
    </g>
  );
};
// 8. salt, fish die
const SSalt: S = ({t}) => (
  <g>
    <rect width={W} height={H} fill="#9fb3bb" />
    {Array.from({length: 40}).map((_, i) => (
      <rect key={i} x={(i * 197) % 1060} y={900 + ((i * 131) % 900)} width={22} height={22} fill="#fff" stroke="#9fb4bd" strokeWidth={3} transform={`rotate(45 ${(i * 197) % 1060 + 11} ${900 + ((i * 131) % 900) + 11})`} opacity={lerp(t, 45.4 + (i % 8) * 0.1, 45.8 + (i % 8) * 0.1, 0, 1)} />
    ))}
    <Plate x={540} y={760} text="SHO'R" t={t} t0={45.5} size={130} fill="#fff" />
    {t < 46.7 ? <Fish x={540} y={1250} s={2.4} /> : <Fish x={540} y={1250} s={2.4} bone />}
    {t > 46.7 && <Burst x={540} y={1250} t={t} t0={46.7} color="#fff" />}
  </g>
);
// 9. twist: the factory keeps working with fish from other seas
const STwist: S = ({t}) => (
  <g>
    <Sky c0="#f2b46a" c1="#fbe7bb" id="sk9" />
    <Sand y={1150} />
    <g transform="translate(560 820) scale(0.8)">
      <rect x={0} y={0} width={500} height={330} fill="#e7d9bd" stroke={INK} strokeWidth={8} />
      <path d="M0 0 L125 -90 L125 0 L250 -90 L250 0 L375 -90 L375 0 L500 -90 L500 0 Z" fill="#9aa6ad" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
      <rect x={190} y={170} width={120} height={160} fill={t > 49.9 ? '#ffd76a' : '#7a5233'} stroke={INK} strokeWidth={6} />
    </g>
    <Plate x={540} y={720} text="YOPILMAYDI!" t={t} t0={49.9} size={100} fill={RED} color="#fff" />
    {t > 50.7 && (
      <g>
        <path d="M-40 1290 H760" stroke={RED} strokeWidth={14} strokeDasharray="40 26" strokeDashoffset={-t * 120} />
        {[0, 1, 2].map((i) => {
          const x = ((t - 50.7) * 260 + i * 240) % 900 - 100;
          return <g key={i} transform={`translate(${x} 1250)`}><rect x={-80} y={-60} width={160} height={90} fill="#c9925a" stroke={INK} strokeWidth={6} /><Fish x={0} y={-30} s={0.6} /></g>;
        })}
        <Plate x={330} y={1440} text="MINGLAB KM" t={t} t0={51.3} size={80} fill="#fff" />
      </g>
    )}
    <BekAt x={880} y={1760} s={0.8} mood="surprised" blink={blinkAt(t)} lookX={-8} />
    {t > 55.6 && <g transform={`translate(880 1330) scale(${pop(t, 55.6)})`}><Text x={0} y={0} size={140} fill={RED} stroke={8}>?!</Text></g>}
  </g>
);
// 10. 1990: the factory closes
const S1990: S = ({t}) => (
  <g>
    <rect width={W} height={H} fill="#3a2f2a" />
    <rect x={240} y={700} width={600} height={900} fill="#7a5233" stroke={INK} strokeWidth={10} />
    <line x1={540} y1={700} x2={540} y2={1600} stroke={INK} strokeWidth={8} />
    <g transform={`translate(540 ${lerp(t, 59.9, 60.4, 900, 1150)}) scale(${pop(t, 59.9)})`}>
      <path d="M-60 0 V-60 A60 60 0 0 1 60 -60 V0" stroke="#bbb" strokeWidth={22} fill="none" />
      <rect x={-90} y={-10} width={180} height={150} rx={18} fill={GOLD} stroke={INK} strokeWidth={8} />
    </g>
    <Plate x={540} y={560} text="1990" t={t} t0={58.4} size={140} />
  </g>
);
// 11. today: ship cemetery, sea 100+ km away
const SToday: S = ({t}) => (
  <g>
    <Sky c0="#e9a25c" c1="#fae2b0" id="sk11" />
    <Sand y={980} />
    <Ship x={260} y={1080} s={0.55} rust tilt={-6} />
    <Ship x={720} y={1040} s={0.45} rust tilt={4} />
    <Ship x={520} y={1260} s={0.7} rust tilt={-2} />
    <path d={`M120 1600 H${lerp(t, 62.6, 64.0, 120, 960)}`} stroke={RED} strokeWidth={14} />
    {t > 64 && <path d="M940 1570 L990 1600 L940 1630 Z" fill={RED} />}
    <Plate x={540} y={1720} text="100+ KM" t={t} t0={63.3} size={110} />
  </g>
);
// 12. Orolqum: wind carries salt and dust
const SDust: S = ({t}) => (
  <g>
    <rect width={W} height={H} fill="#c9a36a" />
    <Sand y={1150} />
    {Array.from({length: 14}).map((_, i) => {
      const x = ((t * (240 + i * 20) + i * 140) % 1400) - 200;
      return <circle key={i} cx={x} cy={500 + i * 70} r={50 + (i % 4) * 30} fill={i % 2 ? '#f2efe8' : '#d8b98a'} opacity={0.55} />;
    })}
    {[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M${((t * 500 + i * 300) % 1400) - 300} ${700 + i * 150} h220`} stroke="#fff" strokeWidth={8} strokeLinecap="round" opacity={0.7} />)}
    <Plate x={540} y={760} text="OROLQUM" t={t} t0={70.1} size={130} />
    <BekAt x={540} y={1740} s={0.9} mood="worried" blink={blinkAt(t)} lookX={-10} rot={-4} />
  </g>
);
// 13. hope: saxaul and the dam in the north, fish return
const SHope: S = ({t}) => (
  <g>
    <Sky c0="#8fd0ef" c1="#e8f7ff" id="sk13" />
    <rect y={760} width={W} height={300} fill={SEA} opacity={lerp(t, 78.6, 80.0, 0, 1)} />
    {t > 78.6 && <Waves y={770} t={t} />}
    {t > 80.2 && <rect x={0} y={1040} width={W} height={34} fill="#8a8a8a" stroke={INK} strokeWidth={6} />}
    <Plate x={540} y={700} text="DAMBA" t={t} t0={80.26} size={90} fill="#fff" />
    {t > 81.1 && <Fish x={lerp(t, 81.1, 82.1, 360, 720)} y={900 - Math.sin(lerp(t, 81.1, 82.1, 0, Math.PI)) * 160} s={1.2} c="#9cc7e0" />}
    <Sand y={1074} />
    {[[180, 1300], [380, 1380], [620, 1320], [860, 1400], [280, 1560], [760, 1580]].map(([x, y], i) => {
      const g = pop(t, 77.4 + i * 0.15);
      return (
        <g key={i} transform={`translate(${x} ${y}) scale(${g})`}>
          <path d="M0 0 V-80 M0 -40 L-40 -80 M0 -50 L40 -95 M0 -70 L-25 -110" stroke="#4b7a2c" strokeWidth={10} strokeLinecap="round" fill="none" />
          <circle cx={-40} cy={-84} r={16} fill="#7fb24a" /><circle cx={40} cy={-98} r={18} fill="#7fb24a" /><circle cx={-25} cy={-114} r={14} fill="#7fb24a" />
        </g>
      );
    })}
    <BekAt x={540} y={1800} s={0.75} mood="happy" blink={blinkAt(t)} />
  </g>
);
// 14. vote
const SVote: S = ({t}) => (
  <g>
    <rect width={W} height={H} fill="#16324f" />
    {[['1', 'PAXTA', 300, 87.08], ['2', 'DENGIZ', 780, 88.3]].map(([n, name, x, t0]) => (
      <g key={n as string} transform={`translate(${x} 1000) scale(${pop(t, t0 as number)})`}>
        <rect x={-210} y={-260} width={420} height={520} rx={30} fill={n === '1' ? '#f6f1e6' : SEA} stroke={INK} strokeWidth={10} />
        <Text x={0} y={-120} size={140} fill={n === '1' ? INK : '#fff'}>{n}</Text>
        {n === '1' ? (
          <g transform="translate(0 30)"><circle r={50} fill="#fff" stroke={INK} strokeWidth={6} /><circle cx={-36} cy={22} r={36} fill="#fff" stroke={INK} strokeWidth={6} /><circle cx={36} cy={22} r={36} fill="#fff" stroke={INK} strokeWidth={6} /></g>
        ) : (
          <Fish x={0} y={30} s={1.3} c="#ffc94a" />
        )}
        <Text x={0} y={200} size={80} fill={n === '1' ? INK : '#fff'}>{name}</Text>
      </g>
    ))}
    <BekAt x={540} y={1560} s={0.5} mood="neutral" blink={blinkAt(t)} lookX={Math.sin(t * 2) * 10} />
    <FollowButton t={t} t0={FOLLOW_AT} />
  </g>
);

const SCENES: [number, number, S][] = [
  [0, 4.8, SHook], [4.8, 11.4, S1960], [11.4, 18.4, SFactory], [18.4, 23.1, SRank], [23.1, 31.9, SRecede],
  [31.9, 40.1, SRivers], [40.1, 45.3, SDry], [45.3, 47.6, SSalt], [47.6, 58.3, STwist], [58.3, 61.4, S1990],
  [61.4, 67.8, SToday], [67.8, 74.6, SDust], [74.6, 82.1, SHope], [82.1, 999, SVote],
];
const PAIRS = ['BU KEMALAR', 'ENG KATTA', 'YUZ METR', 'BIR KILOMETR', "O'N KILOMETR", 'IKKITA DARYO', 'ENG QIZIQ', 'YUZ KILOMETRDAN', "O'YLAB KO'R"];
const HL = /^(NEGA|1960|OROL|TO'RTINCHI|PAXTA|QUMDA|SHO'RLASHADI|YOPILMAYDI|1990|OROLQUM|DAMBA|SAKSOVUL|IZOHDA|CHO'LNING)/;
const FIX = {moynoqdasan: "Mo'ynoqdasan", moynoqdan: "Mo'ynoqdan", ittifoqqa: 'Ittifoqqa', '1960-yil': '1960-YIL', '1960-yildagi': '1960-YILDAGI'};
const chunks = buildChunks(words as W3[], PAIRS, FIX);

export const ORL: React.FC<{at?: number}> = ({at}) => {
  useOswald();
  const cur = useCurrentFrame();
  const frame = at ?? cur;
  const t = frame / FPS;
  const idx = SCENES.findIndex(([a, b]) => t >= a && t < b);
  const [a, , Sc] = SCENES[Math.max(0, idx)];
  const k = t - a;
  const soft = a === 0;
  const zoom = soft ? 1 : 1 + lerp(k, 0, 0.25, 0.06, 0);
  const flash = soft ? 0 : lerp(k, 0, 0.12, 0.3, 0);
  const end = ORL_FRAMES / FPS;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
        <g transform={`translate(540 960) scale(${zoom}) translate(-540 -960)`}>
          <Sc t={t} />
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
      {at === undefined && t < VOICE_END + 0.6 && <Caption t={t} chunks={chunks} hl={HL} />}
      <AbsoluteFill style={{background: '#000', opacity: lerp(t, end - 0.5, end, 0, 1)}} />
    </AbsoluteFill>
  );
};

import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {GlobeMap} from './GlobeMap';
import {BekAt, Bg, blinkAt, buildChunks, Burst, Caption, FPS, GOLD, H, INK, lerp, pop, RED, Text, useOswald, W, W3} from './common';
import words from './tq2_words.json';

// "Tasavvur qil" episode 2: modern weapon blueprints taken to Amir Temur; real map, then three "what if" map variants.

export const TQ2_FRAMES = Math.round(64.0 * FPS);

// ---------- country sets for the variants (world-atlas names) ----------
const V1 = ['India', 'Nepal', 'Bangladesh', 'Bhutan', 'Egypt', 'Syria', 'Lebanon', 'Israel', 'Palestine', 'Jordan', 'Turkey', 'Kuwait', 'Pakistan', 'Iraq', 'Iran', 'Afghanistan', 'Uzbekistan', 'Turkmenistan', 'Tajikistan', 'Azerbaijan', 'Armenia', 'Georgia'];
const V2 = [
  ...V1,
  'China', 'Mongolia', 'Kazakhstan', 'Kyrgyzstan', 'Saudi Arabia', 'Yemen', 'Oman', 'United Arab Emirates', 'Qatar', 'Bahrain', 'Myanmar', 'Thailand', 'Laos',
  'Vietnam', 'Cambodia', 'Malaysia', 'Sri Lanka', 'North Korea', 'South Korea', 'Taiwan',
];
const V3 = [
  ...V2,
  'Russia', 'Ukraine', 'Belarus', 'Poland', 'Lithuania', 'Latvia', 'Estonia', 'Moldova', 'Romania', 'Bulgaria', 'Greece', 'Serbia', 'Hungary', 'Slovakia', 'Czechia',
  'Austria', 'Germany', 'Italy', 'France', 'Spain', 'Portugal', 'Switzerland', 'Belgium', 'Netherlands', 'Luxembourg', 'Denmark', 'Norway', 'Sweden', 'Finland',
  'United Kingdom', 'Ireland', 'Croatia', 'Slovenia', 'Bosnia and Herz.', 'Montenegro', 'Albania', 'Macedonia', 'North Macedonia', 'Kosovo', 'Cyprus', 'N. Cyprus',
];

// ---------- drawings ----------
const Blueprint: React.FC<{kind: 'gun' | 'tank' | 'plane'; label: string}> = ({kind, label}) => (
  <g>
    <rect x={-200} y={-150} width={400} height={300} rx={18} fill="#1d5fa8" stroke="#fff" strokeWidth={6} />
    {Array.from({length: 9}).map((_, i) => (
      <line key={'v' + i} x1={-200 + i * 50} y1={-150} x2={-200 + i * 50} y2={150} stroke="#fff" strokeOpacity={0.15} strokeWidth={2} />
    ))}
    {Array.from({length: 7}).map((_, i) => (
      <line key={'h' + i} x1={-200} y1={-150 + i * 50} x2={200} y2={-150 + i * 50} stroke="#fff" strokeOpacity={0.15} strokeWidth={2} />
    ))}
    <g fill="none" stroke="#fff" strokeWidth={6} strokeLinejoin="round" strokeLinecap="round">
      {kind === 'gun' && (
        <path d="M-160 -10 L-70 -26 L50 -26 L160 -28 L160 -14 L60 -12 L44 -12 Q40 30 22 50 L4 44 Q18 20 20 -8 L-40 -8 L-70 26 L-160 30 Z" />
      )}
      {kind === 'tank' && (
        <g>
          <rect x={-150} y={10} width={300} height={70} rx={35} />
          {[-110, -55, 0, 55, 110].map((x) => (
            <circle key={x} cx={x} cy={45} r={18} />
          ))}
          <path d="M-120 10 L-100 -30 L100 -30 L120 10 Z" />
          <rect x={-60} y={-80} width={110} height={50} rx={14} />
          <line x1={50} y1={-60} x2={180} y2={-70} />
        </g>
      )}
      {kind === 'plane' && (
        <g>
          <path d="M-170 0 Q-150 -20 140 -12 Q175 0 140 12 Q-150 20 -170 0 Z" />
          <path d="M0 -12 L-50 -110 L-20 -110 L50 -12" />
          <path d="M0 12 L-50 110 L-20 110 L50 12" />
          <path d="M-140 -8 L-170 -60 L-150 -60 L-115 -10" />
        </g>
      )}
    </g>
    <Text x={0} y={128} size={44}>{label}</Text>
  </g>
);

const Cannon: React.FC = () => (
  <g>
    <g transform="rotate(-14)">
      <rect x={-130} y={-30} width={250} height={60} rx={26} fill="#4a4f57" stroke={INK} strokeWidth={6} />
      <rect x={100} y={-38} width={30} height={76} rx={8} fill="#5d636c" stroke={INK} strokeWidth={6} />
      <rect x={-60} y={-34} width={16} height={68} fill="#d9a43a" />
    </g>
    <path d="M-120 30 L60 10 L70 50 L-110 70 Z" fill="#8a5a2b" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    {[-60, 40].map((x) => (
      <g key={x}>
        <circle cx={x} cy={70} r={46} fill="#9b6a35" stroke={INK} strokeWidth={6} />
        <circle cx={x} cy={70} r={12} fill={INK} />
      </g>
    ))}
  </g>
);
const Musket: React.FC = () => (
  <g transform="rotate(-20)">
    <path d="M-170 -10 L-60 -24 L-20 -16 L-20 16 L-60 20 L-170 40 Z" fill="#8a5a2b" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <rect x={-30} y={-16} width={200} height={20} rx={8} fill="#4a4f57" stroke={INK} strokeWidth={6} />
    <path d="M-20 -16 L-6 -40 L10 -36 L4 -16 Z" fill="#5d636c" stroke={INK} strokeWidth={5} />
  </g>
);
const Rocket: React.FC<{t: number}> = ({t}) => (
  <g transform="rotate(-35)">
    <line x1={-170} y1={0} x2={40} y2={0} stroke="#b07a3a" strokeWidth={10} strokeLinecap="round" />
    <rect x={20} y={-26} width={110} height={52} rx={14} fill="#5d636c" stroke={INK} strokeWidth={6} />
    <path d="M130 -26 L170 0 L130 26 Z" fill="#4a4f57" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <path d={`M20 -16 Q${-40 - Math.sin(t * 30) * 10} 0 20 16 Z`} fill="#ff8a2a" />
  </g>
);
const Balloon: React.FC<{children?: React.ReactNode}> = ({children}) => (
  <g>
    <path d="M0 -190 C110 -190 150 -100 120 -20 C100 30 50 60 30 90 L-30 90 C-50 60 -100 30 -120 -20 C-150 -100 -110 -190 0 -190 Z" fill="#e3473b" stroke={INK} strokeWidth={6} />
    <path d="M0 -190 C50 -150 54 0 30 90 M0 -190 C-50 -150 -54 0 -30 90" fill="none" stroke="#ffc94a" strokeWidth={14} />
    <path d="M-30 90 L-46 210 M30 90 L46 210" stroke={INK} strokeWidth={5} />
    {children}
    <rect x={-56} y={205} width={112} height={64} rx={10} fill="#a8742f" stroke={INK} strokeWidth={6} />
    <path d="M-56 226 L56 226 M-56 248 L56 248" stroke="#7d5420" strokeWidth={4} />
  </g>
);
const Wagon: React.FC = () => (
  <g>
    <rect x={-170} y={-90} width={340} height={130} rx={10} fill="#7a7f87" stroke={INK} strokeWidth={6} />
    {[-110, -40, 30, 100].map((x) => (
      <rect key={x} x={x} y={-80} width={50} height={110} rx={6} fill="#8d9299" stroke={INK} strokeWidth={4} />
    ))}
    {[-120, -50, 20, 90].map((x) => (
      <circle key={x} cx={x + 25} cy={-26} r={6} fill={INK} />
    ))}
    <rect x={-150} y={-40} width={20} height={14} fill={INK} />
    {[-110, 110].map((x) => (
      <g key={x}>
        <circle cx={x} cy={60} r={46} fill="#9b6a35" stroke={INK} strokeWidth={6} />
        <circle cx={x} cy={60} r={12} fill={INK} />
      </g>
    ))}
  </g>
);
const Scope: React.FC = () => (
  <g transform="rotate(-20)">
    <rect x={-160} y={-26} width={120} height={52} rx={10} fill="#b58a2c" stroke={INK} strokeWidth={6} />
    <rect x={-46} y={-34} width={110} height={68} rx={10} fill="#d9a43a" stroke={INK} strokeWidth={6} />
    <rect x={60} y={-44} width={100} height={88} rx={12} fill="#b58a2c" stroke={INK} strokeWidth={6} />
    <ellipse cx={162} cy={0} rx={10} ry={40} fill="#8fd3ff" stroke={INK} strokeWidth={5} />
  </g>
);

const Card: React.FC<{x: number; y: number; t: number; at: number; label: string; children: React.ReactNode; w?: number; h?: number}> = ({x, y, t, at, label, children, w = 460, h = 400}) => {
  const p = pop(t, at);
  if (p <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${p})`}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={28} fill="#fbf1dc" stroke={INK} strokeWidth={7} />
      <g transform="translate(0 -30) scale(0.95)">{children}</g>
      <rect x={-w / 2} y={h / 2 - 90} width={w} height={90} rx={0} fill={INK} />
      <Text x={0} y={h / 2 - 26} size={54} fill={GOLD}>{label}</Text>
    </g>
  );
};

const Tent: React.FC<{t: number}> = ({t}) => (
  <g>
    <Bg c0="#6a4630" c1="#160d09" cy={30} />
    <path d="M0 260 L540 60 L1080 260 L1080 1920 L0 1920 Z" fill="#3a2418" opacity={0.6} />
    <path d="M540 60 L540 1920" stroke="#1d120c" strokeWidth={22} />
    {[0, 1, 2, 3].map((i) => (
      <path key={i} d={`M540 60 Q${200 + i * 230} 300 ${-80 + i * 400} 640`} stroke="#6b4530" strokeWidth={6} fill="none" opacity={0.5} />
    ))}
    <circle cx={180} cy={560} r={150} fill="#ffb84a" opacity={0.16 + Math.sin(t * 9) * 0.03} />
    <rect x={0} y={1560} width={W} height={360} fill="#2a1a12" />
    <ellipse cx={540} cy={1600} rx={460} ry={70} fill="#7a2a1e" />
    {[300, 540, 780].map((x) => (
      <path key={x} d={`M${x - 60} 1590 l60 -20 l60 20 l-60 20 Z`} fill="#c99a48" opacity={0.6} />
    ))}
  </g>
);

const RedX: React.FC<{x: number; y: number; k: number}> = ({x, y, k}) =>
  k > 0 ? (
    <g transform={`translate(${x} ${y}) scale(${2 - k}) rotate(-10)`} opacity={Math.min(1, k * 1.4)}>
      <path d="M-60 -60 L60 60 M60 -60 L-60 60" stroke={RED} strokeWidth={26} strokeLinecap="round" />
    </g>
  ) : null;

// ---------- scenes ----------
const SceneHook: React.FC<{t: number}> = ({t}) => {
  const open = pop(t, 3.1);
  return (
    <g>
      <Tent t={t} />
      <BekAt x={300} y={1690 + Math.sin(t * 3) * 5} s={1.0} mood={t < 3 ? 'happy' : 'surprised'} blink={blinkAt(t)} swing={-10} />
      <BekAt x={790} y={1700} s={1.08} outfit="temur" mood={t > 3.6 ? 'surprised' : 'neutral'} blink={blinkAt(t, 1)} lookX={-0.8} />
      {open > 0 && (
        <g transform={`translate(540 860) scale(${open}) rotate(-4)`}>
          <Blueprint kind="gun" label="CHIZMA" />
        </g>
      )}
    </g>
  );
};

const SceneBlueprints: React.FC<{t: number}> = ({t}) => (
  <g>
    <Bg c0="#24518f" c1="#0b1830" />
    {(
      [
        ['gun', 'AVTOMAT', 4.5, 640],
        ['tank', 'TANK', 5.28, 1020],
        ['plane', 'SAMOLYOT', 5.78, 1400],
      ] as const
    ).map(([k, l, at, y], i) => {
      const p = pop(t, at);
      return p > 0 ? (
        <g key={k} transform={`translate(${i === 1 ? 600 : 480} ${y}) scale(${p}) rotate(${i === 1 ? 3 : -3})`}>
          <Blueprint kind={k} label={l} />
        </g>
      ) : null;
    })}
  </g>
);

const SceneGlobe: React.FC<{t: number}> = ({t}) => (
  <g>
    <Bg c0="#16243f" c1="#05070f" cy={55} />
    <GlobeMap uid="a" rot={[lerp(t, 6.6, 8.7, 10, 50), 25]} scale={430} cy={1100} reveal={0} t={t} />
    <g transform={`translate(540 1100) scale(${pop(t, 7.6)})`}>
      <Text x={0} y={60} size={200} fill="#fff" stroke={10}>?</Text>
    </g>
  </g>
);

const SceneOrder: React.FC<{t: number}> = ({t}) => {
  const order = t >= 11.3;
  const hammer = t >= 10.1 ? Math.sin(t * 16) * 30 : 0;
  return (
    <g>
      <Tent t={t} />
      <BekAt x={360} y={1650} s={1.25} outfit="temur" mood={order ? 'determined' : 'surprised'} blink={blinkAt(t)} swing={order ? -60 : 0} lookX={0.6} />
      <g transform={`translate(760 1040) rotate(6) scale(${0.8})`}>
        <Blueprint kind="tank" label="CHIZMA" />
      </g>
      {t >= 10.1 && (
        <g transform="translate(800 1520)">
          <path d="M-120 0 L120 0 L90 40 L-90 40 Z" fill="#4a4f57" stroke={INK} strokeWidth={6} />
          <rect x={-40} y={40} width={80} height={80} fill="#3a3f46" stroke={INK} strokeWidth={6} />
          <g transform={`rotate(${hammer - 20} 120 -120)`}>
            <line x1={120} y1={-120} x2={10} y2={-30} stroke="#8a5a2b" strokeWidth={14} strokeLinecap="round" />
            <rect x={-30} y={-60} width={70} height={44} rx={8} fill="#5d636c" stroke={INK} strokeWidth={5} transform="rotate(-40 5 -38)" />
          </g>
          {Math.sin(t * 16) > 0.7 &&
            [0, 1, 2, 3, 4].map((i) => <line key={i} x1={0} y1={-6} x2={Math.cos(i) * 90} y2={-6 - Math.abs(Math.sin(i * 2)) * 80} stroke={GOLD} strokeWidth={6} strokeLinecap="round" />)}
        </g>
      )}
      <Burst x={360} y={900} t={t} t0={11.36} color={GOLD} />
    </g>
  );
};

const SceneProblems: React.FC<{t: number}> = ({t}) => {
  const rows = [
    {at: 13.94, x0: 15.0, label: 'AVTOMAT', kind: 'gun' as const, need: ['PORox', 'PATRON'], no: 16.34},
    {at: 17.26, x0: 17.8, label: 'TANK', kind: 'tank' as const, need: ['MOTOR', 'BENZIN'], no: 19.22},
    {at: 20.26, x0: 21.0, label: 'SAMOLYOT', kind: 'plane' as const, need: ['ORZU...'], no: 21.5},
  ];
  return (
    <g>
      <Bg c0="#3a2a4a" c1="#0e0a16" />
      {rows.map((r, i) => {
        const p = pop(t, r.at);
        if (p <= 0) return null;
        const y = 640 + i * 420;
        return (
          <g key={r.label} transform={`translate(0 ${y}) scale(1)`} opacity={Math.min(1, p)}>
            <g transform={`translate(270 0) scale(${0.7 * p})`}>
              <Blueprint kind={r.kind} label={r.label} />
            </g>
            {r.need.map((n, j) => (
              <g key={n} transform={`translate(760 ${-50 + j * 110}) scale(${pop(t, r.x0 + j * 0.4)})`}>
                <rect x={-190} y={-46} width={380} height={92} rx={20} fill={i === 2 ? '#5a6a8a' : '#fbf1dc'} stroke={INK} strokeWidth={5} />
                <Text x={0} y={22} size={58} fill={i === 2 ? '#fff' : INK}>{n.toUpperCase()}</Text>
              </g>
            ))}
            <RedX x={760} y={r.need.length > 1 ? 5 : -50} k={pop(t, r.no)} />
          </g>
        );
      })}
    </g>
  );
};

const SceneIdea: React.FC<{t: number}> = ({t}) => {
  const yes = t >= 24.2;
  return (
    <g>
      <Bg c0={yes ? '#f2c48a' : '#2f4a7a'} c1={yes ? '#b06a34' : '#0e1424'} />
      <BekAt x={540} y={1700 + Math.sin(t * 3) * 6} s={1.35} mood={yes ? 'happy' : 'worried'} blink={blinkAt(t)} />
      {yes && (
        <g transform={`translate(540 620) scale(${pop(t, 24.2)})`}>
          <circle r={130} fill="#fff6b0" opacity={0.35} />
          <path d="M-60 0 C-60 -80 60 -80 60 0 C60 40 30 50 30 80 L-30 80 C-30 50 -60 40 -60 0 Z" fill="#ffe14a" stroke={INK} strokeWidth={7} />
          <rect x={-30} y={80} width={60} height={34} rx={8} fill="#9aa3ad" stroke={INK} strokeWidth={6} />
        </g>
      )}
      {!yes && (
        <g transform={`translate(800 720) scale(${pop(t, 23.0)})`}>
          <Text x={0} y={0} size={170} fill="#fff" stroke={10}>?</Text>
        </g>
      )}
    </g>
  );
};

const SceneCan: React.FC<{t: number}> = ({t}) => (
  <g>
    <Bg c0="#f2c48a" c1="#9a5a2a" />
    {/* gunpowder pot */}
    {t < 27.4 && (
      <g transform={`translate(540 1080) scale(${pop(t, 24.9) * 1.5})`}>
        <path d="M-120 -40 Q-140 120 0 130 Q140 120 120 -40 Z" fill="#7a4a24" stroke={INK} strokeWidth={7} />
        <ellipse cx={0} cy={-40} rx={124} ry={34} fill="#2b2b2b" stroke={INK} strokeWidth={7} />
        {[...Array(6)].map((_, i) => (
          <circle key={i} cx={-60 + i * 24} cy={-46 + (i % 2) * 8} r={10} fill="#4a4a4a" />
        ))}
        <rect x={-100} y={20} width={200} height={60} rx={10} fill="#fbf1dc" stroke={INK} strokeWidth={5} />
        <Text x={0} y={66} size={48} fill={INK}>POROX</Text>
      </g>
    )}
    <Card x={300} y={720} t={t} at={27.6} label="TO'P"><Cannon /></Card>
    <Card x={780} y={1080} t={t} at={28.06} label="MILTIQ"><Musket /></Card>
    <Card x={300} y={1450} t={t} at={29.54} label="RAKETA"><Rocket t={t} /></Card>
  </g>
);

const SceneBalloon: React.FC<{t: number}> = ({t}) => {
  const rise = lerp(t, 31.0, 33.8, 0, 520);
  return (
    <g>
      <defs>
        <linearGradient id="sky2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5fa8e0" />
          <stop offset="100%" stopColor="#f6d79a" />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill="url(#sky2)" />
      <rect y={1500 + rise * 0.5} width={W} height={600} fill="#d9b46a" />
      {/* enemy camp far below */}
      {[...Array(9)].map((_, i) => (
        <path key={i} d={`M${120 + i * 100} ${1640 + rise * 0.5} l30 -50 l30 50 Z`} fill="#8f2a1e" opacity={0.85} />
      ))}
      <g transform={`translate(540 ${1300 - rise})`}>
        <Balloon>
          <g transform="translate(0 215) scale(0.22) translate(-200 -480)">
            <BekAt x={200} y={730} s={1} mood={t > 32.6 ? 'happy' : 'surprised'} blink={blinkAt(t)} swing={-30} />
          </g>
        </Balloon>
      </g>
      {[...Array(4)].map((_, i) => (
        <ellipse key={i} cx={((i * 380 + t * 60) % 1400) - 160} cy={300 + i * 240} rx={110} ry={34} fill="#fff" opacity={0.7} />
      ))}
    </g>
  );
};

const SceneWagonScope: React.FC<{t: number}> = ({t}) => {
  const view = t >= 37.0;
  return (
    <g>
      <Bg c0="#f2c48a" c1="#9a5a2a" />
      {!view && (
        <>
          <Card x={540} y={800} t={t} at={35.1} label="TEMIR ARAVA" w={620}><Wagon /></Card>
          <Card x={540} y={1330} t={t} at={36.3} label="DURBIN" w={620}><Scope /></Card>
        </>
      )}
      {view && (
        <g>
          <rect width={W} height={H} fill="#111" />
          <defs>
            <clipPath id="lens">
              <circle cx={540} cy={980} r={430} />
            </clipPath>
          </defs>
          <g clipPath="url(#lens)">
            <rect width={W} height={H} fill="#cfe6f5" />
            <rect y={1020} width={W} height={600} fill="#d9b46a" />
            <g transform={`translate(${540 + Math.sin(t * 1.5) * 20} 1260) scale(1.4)`}>
              <BekAt x={0} y={0} s={0.4} outfit="soldier" mood={t > 38.3 ? 'surprised' : 'neutral'} blink={blinkAt(t)} lookX={-0.5} />
            </g>
            <path d="M540 700 L540 1260 M260 980 L820 980" stroke="#000" strokeOpacity={0.25} strokeWidth={3} />
          </g>
          <circle cx={540} cy={980} r={430} fill="none" stroke="#2b2b2b" strokeWidth={30} />
          <Text x={540} y={1560} size={60} fill="#fff">DUSHMAN SENI KO'RMAYDI</Text>
        </g>
      )}
    </g>
  );
};

const EMPIRE_LABELS = ['Uzbekistan', 'Iran', 'Afghanistan', 'Turkmenistan', 'Iraq', 'Turkey', 'Pakistan', 'Kazakhstan', 'Syria'];
const SceneRealMap: React.FC<{t: number}> = ({t}) => {
  const z = lerp(t, 39.9, 41.6, 0, 1);
  const rot: [number, number] = [lerp(t, 39.9, 41.6, 25, 55), lerp(t, 39.9, 41.6, 25, 36)];
  const scale = 450 + z * z * 1000;
  const badge = pop(t, 45.4);
  return (
    <g>
      <Bg c0="#16243f" c1="#05070f" cy={55} />
      <GlobeMap
        uid="r"
        rot={rot}
        scale={scale}
        cy={1060}
        reveal={lerp(t, 41.3, 43.6, 0, 1)}
        flag={pop(t, 41.3)}
        labels={EMPIRE_LABELS.map((name, i) => ({name, at: 43.4 + i * 0.12}))}
        labelSize={40}
        samLabel={t < 43.3}
        t={t}
      />
      {badge > 0 && (
        <g transform={`translate(540 1560) scale(${badge})`}>
          <rect x={-330} y={-80} width={660} height={160} rx={30} fill={RED} stroke="#fff" strokeWidth={6} />
          <Text x={0} y={30} size={84}>10+ DAVLAT</Text>
        </g>
      )}
      <g>
        <rect x={60} y={1760} width={420} height={70} rx={35} fill="rgba(0,0,0,0.55)" />
        <Text x={270} y={1810} size={38} fill={GOLD}>TAXMINAN 1402–1405</Text>
      </g>
    </g>
  );
};

const SceneArmed: React.FC<{t: number}> = ({t}) => {
  const three = t >= 48.7;
  return (
    <g>
      <Tent t={t} />
      <g transform="translate(780 1500) scale(1.2)">
        <Cannon />
      </g>
      <BekAt x={370} y={1690} s={1.25} outfit="temur" mood="determined" blink={blinkAt(t)} swing={-25} />
      {three &&
        [1, 2, 3].map((n, i) => (
          <g key={n} transform={`translate(${240 + i * 300} 760) scale(${pop(t, 48.8 + i * 0.15)})`}>
            <circle r={110} fill={RED} stroke="#fff" strokeWidth={8} />
            <Text x={0} y={52} size={150}>{String(n)}</Text>
          </g>
        ))}
    </g>
  );
};

const VARIANTS = [
  {at: 49.92, set: V1, rot: [52, 30] as [number, number], scale: 820, n: '1', marks: [
    {text: 'HINDISTON', lon: 79, lat: 22, at: 50.64},
    {text: 'MISR', lon: 30, lat: 26.5, at: 51.36},
  ]},
  {at: 52.34, set: V2, rot: [78, 34] as [number, number], scale: 560, n: '2', marks: [
    {text: 'XITOY', lon: 103, lat: 34, at: 54.16},
    {text: 'OSIYO', lon: 85, lat: 48, at: 53.62},
  ]},
  {at: 55.34, set: V3, rot: [52, 46] as [number, number], scale: 470, n: '3', marks: [
    {text: 'YEVROPA', lon: 15, lat: 50, at: 56.08},
  ]},
];
const SceneVariants: React.FC<{t: number}> = ({t}) => {
  let k = 0;
  VARIANTS.forEach((v, i) => {
    if (t >= v.at) k = i;
  });
  const v = VARIANTS[k];
  const prev = VARIANTS[Math.max(0, k - 1)];
  const m = k === 0 ? 1 : lerp(t, v.at, v.at + 0.6, 0, 1);
  const ease = m * m * (3 - 2 * m);
  const rot: [number, number] = [prev.rot[0] + (v.rot[0] - prev.rot[0]) * ease, prev.rot[1] + (v.rot[1] - prev.rot[1]) * ease];
  const scale = prev.scale + (v.scale - prev.scale) * ease;
  return (
    <g>
      <Bg c0="#16243f" c1="#05070f" cy={55} />
      <GlobeMap uid="v" rot={rot} scale={scale} cy={1080} reveal={1} dim extra={v.set} extraK={lerp(t, v.at, v.at + 0.5, 0, 1)} flag={1} samLabel={false} marks={v.marks.map((x) => ({...x, size: 56}))} t={t} />
      <g transform={`translate(150 520) scale(${pop(t, v.at)})`}>
        <circle r={95} fill={RED} stroke="#fff" strokeWidth={8} />
        <Text x={0} y={46} size={130}>{v.n}</Text>
      </g>
      <g transform="translate(860 520) rotate(8)">
        <rect x={-130} y={-44} width={260} height={88} rx={16} fill="none" stroke={GOLD} strokeWidth={7} />
        <Text x={0} y={22} size={60} fill={GOLD}>TAXMIN</Text>
      </g>
    </g>
  );
};

const SceneVote: React.FC<{t: number}> = ({t}) => {
  const hi = t >= 61.0 ? 2 : t >= 60.1 ? 1 : t >= 59.55 ? 0 : -1;
  const follow = pop(t, 61.6);
  return (
    <g>
      <Bg c0="#2f4a7a" c1="#0e1424" />
      {VARIANTS.map((v, i) => {
        const x = 190 + i * 350;
        const on = hi === i;
        return (
          <g key={v.n} opacity={pop(t, 57.2 + i * 0.12)}>
            <GlobeMap uid={'m' + i} rot={v.rot} scale={150} cx={x} cy={900} reveal={1} dim extra={v.set} extraK={1} samLabel={false} t={t} />
            <g transform={`translate(${x} 1120) scale(${on ? 1.25 : 1})`}>
              <circle r={64} fill={on ? RED : '#1b2233'} stroke="#fff" strokeWidth={6} />
              <Text x={0} y={32} size={90}>{v.n}</Text>
            </g>
          </g>
        );
      })}
      <g transform={`translate(540 1380) scale(${pop(t, 58.7)})`}>
        <rect x={-420} y={-90} width={840} height={180} rx={40} fill="#1b2233" stroke="#fff" strokeWidth={5} />
        <Text x={0} y={-16} size={50} fill="#cfd8ff">Izohlar</Text>
        <Text x={0} y={60} size={66} fill={GOLD}>1, 2 YOKI 3?</Text>
      </g>
      {follow > 0 && (
        <g transform={`translate(540 1690) scale(${follow})`}>
          <Text x={0} y={-96} size={44} fill="#fff">KEYINGI ZAMONGA BIRGA BORAMIZ</Text>
          <rect x={-300} y={-60} width={600} height={124} rx={62} fill="#3b82f6" stroke="#fff" strokeWidth={6} />
          {/* bell, swinging */}
          <g transform={`translate(-200 0) rotate(${Math.sin(t * 14) * 14})`}>
            <path d="M-30 18 C-30 -30 -20 -40 0 -40 C20 -40 30 -30 30 18 L38 28 L-38 28 Z" fill={GOLD} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
            <circle cx={0} cy={36} r={9} fill={GOLD} stroke={INK} strokeWidth={4} />
          </g>
          <Text x={40} y={26} size={72} fill="#fff">OBUNA BO'L</Text>
        </g>
      )}
    </g>
  );
};

const SCENES: [number, number, React.FC<{t: number}>][] = [
  [0, 4.4, SceneHook],
  [4.4, 6.6, SceneBlueprints],
  [6.6, 8.6, SceneGlobe],
  [8.6, 12.2, SceneOrder],
  [12.2, 22.7, SceneProblems],
  [22.7, 24.85, SceneIdea],
  [24.85, 30.9, SceneCan],
  [30.9, 34.3, SceneBalloon],
  [34.3, 39.8, SceneWagonScope],
  [39.8, 46.65, SceneRealMap],
  [46.65, 49.85, SceneArmed],
  [49.85, 57.1, SceneVariants],
  [57.1, 99, SceneVote],
];

const PAIRS = ['TASAVVUR QIL', 'AMIR TEMURGA', "O'NDAN ORTIQ", 'HAVO SHARI', 'TEMIR ARAVALAR', 'TEMIR RAKETALAR', "TO'P VA", 'BUTUN OSIYO', 'UCHTA VARIANT'];
const HL = /^(AMIR TEMURGA|AVTOMAT|TANK|SAMOLYOT|YASANGLAR|YO'Q|POROX|PATRON|MOTOR|BENZIN|ORZU|TO'P|MILTIQ|TEMIR|HAVO SHARI|DURBIN|O'NDAN ORTIQ|BIRINCHI|IKKINCHI|UCHINCHI|IZOHDA|HINDISTON|MISRGACHA|XITOY|YEVROPAGACHA|OSIYO)/;
const chunks = buildChunks(words as W3[], PAIRS, {top: "to'p", yevrogacha: 'Yevropagacha'});

export const TQ2: React.FC = () => {
  useOswald();
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const idx = SCENES.findIndex(([a, b]) => t >= a && t < b);
  const [a, , S] = SCENES[Math.max(0, idx)];
  const k = t - a;
  const zoom = 1 + lerp(k, 0, 0.25, 0.06, 0);
  const flash = lerp(k, 0, 0.12, a > 0 ? 0.45 : 0, 0);
  const endFade = lerp(t, 63.4, 64.0, 0, 1);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
        <g transform={`translate(540 960) scale(${zoom}) translate(-540 -960)`}>
          <S t={t} />
        </g>
        <rect width={W} height={H} fill="#fff" opacity={flash} />
      </svg>
      <Caption t={t} chunks={chunks} hl={HL} />
      <AbsoluteFill style={{background: '#000', opacity: endFade}} />
    </AbsoluteFill>
  );
};

import React from 'react';

// "Bek": the recurring hero of the "Tasavvur qil" series.
// A modern Uzbek teenager who lands in a different era each episode.
// Pure SVG, viewBox 400x800, so it scales cleanly and animates in Remotion.

export type Outfit = 'modern' | 'soldier';
export type Mood = 'neutral' | 'surprised' | 'happy' | 'worried' | 'determined';

const INK = '#2b1e16';
const SKIN = '#f2c39b';
const SKIN_SH = '#e0a77c';
const HAIR = '#3a2418';
const SW = 5;

type Props = {
  outfit?: Outfit;
  mood?: Mood;
  blink?: number; // 0 open .. 1 closed
  lookX?: number; // -1..1 pupil shift
  armSwing?: number; // degrees
};

const Face: React.FC<{mood: Mood; blink: number; lookX: number}> = ({mood, blink, lookX}) => {
  const eyeRy = 19 * (1 - blink * 0.92);
  const lx = lookX * 5;
  const brow = {
    neutral: [0, 0, 0],
    surprised: [-12, 6, -6],
    happy: [-4, 4, -4],
    worried: [-6, -14, 14],
    determined: [6, 14, -14],
  }[mood];
  const [by, rotL, rotR] = brow;
  let mouth: React.ReactNode;
  if (mood === 'surprised') {
    mouth = <ellipse cx={200} cy={268} rx={13} ry={17} fill="#5a1f1a" stroke={INK} strokeWidth={4} />;
  } else if (mood === 'happy') {
    mouth = (
      <g><path d="M172 254 L228 254 Q226 292 200 292 Q174 292 172 254 Z" fill="#7a2620" stroke={INK} strokeWidth={4} strokeLinejoin="round" /><path d="M184 280 Q200 272 216 280 Q210 290 200 290 Q190 290 184 280 Z" fill="#e8796b" /></g>
    );
  } else if (mood === 'worried') {
    mouth = <path d="M178 270 Q189 260 200 268 Q211 276 222 266" fill="none" stroke={INK} strokeWidth={4.5} strokeLinecap="round" />;
  } else if (mood === 'determined') {
    mouth = <path d="M180 266 L222 262" fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round" />;
  } else {
    mouth = <path d="M182 262 Q200 274 218 262" fill="none" stroke={INK} strokeWidth={4.5} strokeLinecap="round" />;
  }
  return (
    <g>
      {/* cheeks */}
      <ellipse cx={148} cy={250} rx={16} ry={9} fill="#e8796b" opacity={0.35} />
      <ellipse cx={252} cy={250} rx={16} ry={9} fill="#e8796b" opacity={0.35} />
      {/* eyes: tall dark ovals with a highlight */}
      {[163, 237].map((x) => (
        <g key={x}>
          <ellipse cx={x + lx} cy={214} rx={12} ry={Math.max(eyeRy, 2)} fill={INK} />
          {blink < 0.5 && <circle cx={x + lx - 4} cy={207} r={4.2} fill="#fff" />}
        </g>
      ))}
      {/* brows */}
      <rect x={140} y={172 + by} width={44} height={9} rx={4.5} fill={HAIR} transform={`rotate(${rotL} 162 ${176 + by})`} />
      <rect x={216} y={172 + by} width={44} height={9} rx={4.5} fill={HAIR} transform={`rotate(${rotR} 238 ${176 + by})`} />
      {/* nose */}
      <path d="M200 228 Q209 240 199 246" fill="none" stroke={SKIN_SH} strokeWidth={4} strokeLinecap="round" />
      {mouth}
    </g>
  );
};

const Head: React.FC<{outfit: Outfit; mood: Mood; blink: number; lookX: number}> = ({outfit, mood, blink, lookX}) => (
  <g>
    {/* ears */}
    <ellipse cx={108} cy={222} rx={17} ry={22} fill={SKIN} stroke={INK} strokeWidth={SW} />
    <ellipse cx={292} cy={222} rx={17} ry={22} fill={SKIN} stroke={INK} strokeWidth={SW} />
    {/* face: slightly squared oval */}
    <path
      d="M200 105 C268 105 300 150 298 215 C296 278 258 318 200 318 C142 318 104 278 102 215 C100 150 132 105 200 105 Z"
      fill={SKIN}
      stroke={INK}
      strokeWidth={SW}
    />
    {outfit === 'modern' && (
      // messy hair with a front tuft
      <path
        d="M104 200 C96 130 140 92 200 92 C262 92 306 128 296 200 C284 170 268 152 246 146 C236 160 214 166 196 160
           C206 152 210 144 208 136 C190 152 160 160 132 158 C118 168 108 184 104 200 Z"
        fill={HAIR}
        stroke={INK}
        strokeWidth={SW}
        strokeLinejoin="round"
      />
    )}
    {outfit === 'soldier' && (
      // bit of hair under the helmet
      <path d="M106 196 C110 176 120 166 134 162 L266 162 C280 166 290 176 294 196 C270 182 130 182 106 196 Z" fill={HAIR} />
    )}
    <Face mood={mood} blink={blink} lookX={lookX} />
  </g>
);

const Helmet: React.FC = () => (
  <g>
    {/* spike */}
    <line x1={200} y1={44} x2={200} y2={6} stroke={INK} strokeWidth={6} strokeLinecap="round" />
    <circle cx={200} cy={6} r={7} fill="#d9a43a" stroke={INK} strokeWidth={4} />
    {/* steel cone */}
    <path d="M96 182 C100 112 150 58 200 40 C250 58 300 112 304 182 Z" fill="#9aa3ad" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
    <path d="M200 44 C232 64 262 110 270 178 L304 182 C300 112 250 58 200 40 Z" fill="#7d8690" />
    <path d="M150 90 C138 112 130 140 128 170" fill="none" stroke="#d5dbe1" strokeWidth={8} strokeLinecap="round" opacity={0.8} />
    {/* gold band with dots */}
    <rect x={90} y={164} width={220} height={26} rx={10} fill="#d9a43a" stroke={INK} strokeWidth={SW} />
    {[120, 160, 200, 240, 280].map((x) => (
      <circle key={x} cx={x} cy={177} r={4.5} fill="#8a5a17" />
    ))}
  </g>
);

const Aventail: React.FC = () => {
  // mail curtain behind the head, covering ears and neck
  const rings: React.ReactNode[] = [];
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 14; col++) {
      const x = 96 + col * 16 + (row % 2) * 8;
      const y = 190 + row * 16;
      rings.push(<path key={`${row}-${col}`} d={`M${x - 7} ${y} Q${x} ${y + 9} ${x + 7} ${y}`} fill="none" stroke="#5d6670" strokeWidth={2.5} />);
    }
  }
  return (
    <g>
      <path d="M92 176 L308 176 L316 300 C300 330 100 330 84 300 Z" fill="#a9b1ba" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
      <g clipPath="url(#avclip)">{rings}</g>
      <defs>
        <clipPath id="avclip">
          <path d="M92 176 L308 176 L316 300 C300 330 100 330 84 300 Z" />
        </clipPath>
      </defs>
    </g>
  );
};

const ModernBody: React.FC<{swing: number}> = ({swing}) => (
  <g>
    {/* legs: jeans */}
    <path d="M148 500 L144 700 L192 700 L198 560 L202 560 L208 700 L256 700 L252 500 Z" fill="#3b5b8c" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
    <path d="M200 520 L200 556" stroke={INK} strokeWidth={3} />
    {/* sneakers */}
    <path d="M136 696 L196 696 L200 728 L128 728 C126 712 130 700 136 696 Z" fill="#f3efe6" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
    <path d="M204 696 L264 696 C270 700 274 712 272 728 L200 728 Z" fill="#f3efe6" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
    <rect x={128} y={718} width={72} height={10} fill="#d1453b" />
    <rect x={200} y={718} width={72} height={10} fill="#d1453b" />
    {/* arms */}
    <g transform={`rotate(${swing} 128 340)`}>
      <path d="M128 330 C104 340 98 420 102 498 L134 498 C134 440 138 380 146 352 Z" fill="#e0a526" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
      <circle cx={118} cy={512} r={18} fill={SKIN} stroke={INK} strokeWidth={SW} />
    </g>
    <g transform={`rotate(${-swing} 272 340)`}>
      <path d="M272 330 C296 340 302 420 298 498 L266 498 C266 440 262 380 254 352 Z" fill="#e0a526" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
      <circle cx={282} cy={512} r={18} fill={SKIN} stroke={INK} strokeWidth={SW} />
    </g>
    {/* hoodie torso */}
    <path d="M136 326 C160 314 240 314 264 326 C272 380 270 460 262 520 L138 520 C130 460 128 380 136 326 Z" fill="#e0a526" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
    <rect x={136} y={500} width={128} height={22} rx={6} fill="#c98f17" stroke={INK} strokeWidth={4} />
    {/* hood around the neck */}
    <path d="M150 318 C170 344 230 344 250 318 C240 306 160 306 150 318 Z" fill="#c98f17" stroke={INK} strokeWidth={4} />
    {/* strings */}
    <path d="M184 340 L180 392" stroke={INK} strokeWidth={4} strokeLinecap="round" />
    <path d="M216 340 L220 392" stroke={INK} strokeWidth={4} strokeLinecap="round" />
    {/* pocket */}
    <path d="M160 440 L240 440 L252 490 L148 490 Z" fill="none" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
  </g>
);

const SoldierBody: React.FC<{swing: number}> = ({swing}) => {
  const plates: React.ReactNode[] = [];
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 7; c++) {
      plates.push(
        <rect key={`${r}-${c}`} x={146 + c * 16} y={346 + r * 20} width={14} height={18} rx={3} fill={r % 2 ? '#b98a3e' : '#c99a48'} stroke="#5b3b14" strokeWidth={2} />,
      );
    }
  }
  return (
    <g>
      {/* quiver on the back, arrows over the right shoulder */}
      <g transform="rotate(18 270 380)">
        <rect x={252} y={260} width={40} height={200} rx={10} fill="#6b3a1f" stroke={INK} strokeWidth={SW} />
        {[258, 270, 282].map((x, i) => (
          <g key={x}>
            <line x1={x} y1={262} x2={x} y2={222} stroke="#8a6a3a" strokeWidth={4} />
            <path d={`M${x - 7} ${236 - i * 2} L${x} ${214 - i * 2} L${x + 7} ${236 - i * 2} Z`} fill="#f1ece0" stroke={INK} strokeWidth={2.5} />
          </g>
        ))}
        <rect x={252} y={300} width={40} height={10} fill="#d9a43a" />
      </g>
      {/* trousers and tall boots */}
      <rect x={150} y={560} width={100} height={80} fill="#3d3a4a" stroke={INK} strokeWidth={SW} />
      <path d="M146 620 L194 620 L196 728 L128 728 C126 708 138 700 146 696 Z" fill="#4a2c1a" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
      <path d="M206 620 L254 620 L254 696 C262 700 274 708 272 728 L204 728 Z" fill="#4a2c1a" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
      <rect x={146} y={620} width={48} height={12} fill="#6e4426" />
      <rect x={206} y={620} width={48} height={12} fill="#6e4426" />
      {/* arms in quilted sleeves */}
      <g transform={`rotate(${swing} 128 340)`}>
        <path d="M128 330 C104 340 98 420 102 498 L134 498 C134 440 138 380 146 352 Z" fill="#9b2d20" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
        <rect x={100} y={470} width={36} height={22} rx={5} fill="#c99a48" stroke={INK} strokeWidth={4} />
        <circle cx={118} cy={512} r={18} fill={SKIN} stroke={INK} strokeWidth={SW} />
      </g>
      <g transform={`rotate(${-swing} 272 340)`}>
        <path d="M272 330 C296 340 302 420 298 498 L266 498 C266 440 262 380 254 352 Z" fill="#9b2d20" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
        <rect x={264} y={470} width={36} height={22} rx={5} fill="#c99a48" stroke={INK} strokeWidth={4} />
        <circle cx={282} cy={512} r={18} fill={SKIN} stroke={INK} strokeWidth={SW} />
      </g>
      {/* quilted kaftan, flared skirt to the knee */}
      <path d="M136 326 C160 314 240 314 264 326 C270 380 268 440 264 470 L292 630 L108 630 L136 470 C132 440 130 380 136 326 Z" fill="#9b2d20" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
      {[160, 186, 214, 240].map((x) => (
        <path key={x} d={`M${x} 490 L${x + (x - 200) * 0.35} 626`} stroke="#7a2017" strokeWidth={3} />
      ))}
      <path d="M200 330 L200 628" stroke="#7a2017" strokeWidth={4} />
      {/* lamellar chest plates */}
      <rect x={140} y={340} width={120} height={110} rx={10} fill="#5b3b14" stroke={INK} strokeWidth={SW} />
      {plates}
      {/* belt, buckle */}
      <rect x={132} y={458} width={136} height={24} rx={6} fill="#3b2414" stroke={INK} strokeWidth={4} />
      <rect x={186} y={454} width={28} height={32} rx={5} fill="#d9a43a" stroke={INK} strokeWidth={4} />
      {/* sabre on the left hip */}
      <path d="M130 480 C116 540 112 600 128 660" fill="none" stroke="#3b2414" strokeWidth={14} strokeLinecap="round" />
      <path d="M130 480 C116 540 112 600 128 660" fill="none" stroke="#7b5432" strokeWidth={8} strokeLinecap="round" />
      <rect x={118} y={466} width={30} height={8} rx={3} fill="#d9a43a" stroke={INK} strokeWidth={3} transform="rotate(-12 133 470)" />
      {/* collar */}
      <path d="M160 322 L200 360 L240 322" fill="none" stroke="#d9a43a" strokeWidth={8} strokeLinejoin="round" />
    </g>
  );
};

// Bek as an SVG group in his own 400x800 coordinate space (for use inside other SVG scenes).
export const BekG: React.FC<Props & {shadow?: boolean}> = ({outfit = 'modern', mood = 'neutral', blink = 0, lookX = 0, armSwing = 0, shadow = true}) => (
  <g>
    {shadow && <ellipse cx={200} cy={732} rx={110} ry={14} fill="#000" opacity={0.25} />}
    {outfit === 'soldier' && <Aventail />}
    {outfit === 'modern' ? <ModernBody swing={armSwing} /> : <SoldierBody swing={armSwing} />}
    {outfit === 'modern' && <rect x={180} y={300} width={40} height={26} fill={SKIN_SH} stroke={INK} strokeWidth={SW} />}
    <Head outfit={outfit} mood={mood} blink={blink} lookX={lookX} />
    {outfit === 'soldier' && <Helmet />}
  </g>
);

export const Bek: React.FC<Props> = (p) => (
  <svg viewBox="-20 -10 440 760" width="100%" height="100%" style={{overflow: 'visible'}}>
    <BekG {...p} />
  </svg>
);

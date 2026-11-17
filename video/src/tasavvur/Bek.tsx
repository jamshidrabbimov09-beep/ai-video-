import React from 'react';

// "Bek": the recurring hero of the "Tasavvur qil" series.
// A modern Uzbek teenager who lands in a different era each episode.
// Pure SVG, viewBox 400x800, so it scales cleanly and animates in Remotion.

export type Outfit = 'modern' | 'soldier' | 'temur' | 'sogd' | 'iskandar' | 'ravshanak' | 'yunon' | 'chingiz' | 'mongol' | 'jebe' | 'jamuxa' | 'navkar';
const MONGOL: Outfit[] = ['chingiz', 'mongol', 'jebe', 'jamuxa', 'navkar'];
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
    {outfit === 'ravshanak' && (
      // long hair falling behind the shoulders
      <path d="M104 190 C90 120 140 84 200 84 C260 84 310 120 296 190 C306 260 312 330 300 400 L250 404 C262 330 262 270 256 230 L144 230 C138 270 138 330 150 404 L100 400 C88 330 94 260 104 190 Z" fill={HAIR} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
    )}
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
    {(outfit === 'sogd' || MONGOL.includes(outfit)) && <path d="M106 196 C110 176 120 166 134 162 L266 162 C280 166 290 176 294 196 C270 182 130 182 106 196 Z" fill={HAIR} />}
    {(outfit === 'iskandar' || outfit === 'yunon') && (
      // golden curls under the helmet
      <g fill="#c9953a" stroke={INK} strokeWidth={3.5}>
        {[112, 136, 264, 288].map((x, i) => (
          <circle key={x} cx={x} cy={186 + (i % 2) * 14} r={16} />
        ))}
      </g>
    )}
    {outfit === 'ravshanak' && (
      // fringe and a gold diadem with a jewel
      <g>
        <path d="M108 190 C104 128 150 96 200 96 C250 96 296 128 292 190 C272 150 240 136 200 136 C160 136 128 150 108 190 Z" fill={HAIR} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
        <path d="M118 150 Q200 112 282 150" fill="none" stroke="#d9a43a" strokeWidth={9} strokeLinecap="round" />
        <circle cx={200} cy={126} r={11} fill="#c2185b" stroke={INK} strokeWidth={3.5} />
        <circle cx={108} cy={252} r={8} fill="#d9a43a" stroke={INK} strokeWidth={3} />
        <circle cx={292} cy={252} r={8} fill="#d9a43a" stroke={INK} strokeWidth={3} />
      </g>
    )}
    <Face mood={mood} blink={blink} lookX={lookX} />
    {outfit === 'temur' && <Beard />}
    {(outfit === 'chingiz' || outfit === 'jamuxa' || outfit === 'navkar') && <MongolBeard grey={outfit === 'chingiz'} short={outfit === 'navkar'} />}
  </g>
);

// ---------- So'g'd defender: soft pointed felt cap, belted kaftan with lapels ----------
const SogdCap: React.FC = () => (
  <g>
    <path d="M108 176 C110 120 150 60 214 26 C226 22 232 30 226 40 C254 80 288 120 292 176 Z" fill="#b8452e" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
    <path d="M214 30 C230 60 262 110 272 170" fill="none" stroke="#8f3220" strokeWidth={6} />
    <rect x={98} y={160} width={204} height={30} rx={14} fill="#e9dcc3" stroke={INK} strokeWidth={SW} />
  </g>
);
const SogdBody: React.FC<{swing: number}> = ({swing}) => (
  <g>
    <rect x={150} y={560} width={100} height={90} fill="#5a4a3a" stroke={INK} strokeWidth={SW} />
    <path d="M146 630 L194 630 L196 728 L128 728 C126 708 138 700 146 696 Z" fill="#3a2414" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
    <path d="M206 630 L254 630 L254 696 C262 700 274 708 272 728 L204 728 Z" fill="#3a2414" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
    <g transform={`rotate(${swing} 128 340)`}>
      <path d="M128 330 C104 340 98 420 102 498 L134 498 C134 440 138 380 146 352 Z" fill="#2f6f73" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
      <circle cx={118} cy={512} r={18} fill={SKIN} stroke={INK} strokeWidth={SW} />
    </g>
    <g transform={`rotate(${-swing} 272 340)`}>
      <path d="M272 330 C296 340 302 420 298 498 L266 498 C266 440 262 380 254 352 Z" fill="#2f6f73" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
      <circle cx={282} cy={512} r={18} fill={SKIN} stroke={INK} strokeWidth={SW} />
    </g>
    <path d="M136 326 C160 314 240 314 264 326 C270 380 268 440 264 470 L286 640 L114 640 L136 470 C132 440 130 380 136 326 Z" fill="#2f6f73" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
    <path d="M160 322 L214 400 L240 322" fill="#e9c46a" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    <path d="M200 400 L200 638" stroke="#1f5054" strokeWidth={4} />
    <rect x={132} y={458} width={136} height={22} rx={6} fill="#3b2414" stroke={INK} strokeWidth={4} />
    {[150, 176, 224, 250].map((x) => (
      <circle key={x} cx={x} cy={469} r={5} fill="#d9a43a" />
    ))}
    <rect x={244} y={476} width={14} height={90} rx={5} fill="#7b5432" stroke={INK} strokeWidth={3.5} transform="rotate(-10 251 476)" />
  </g>
);

// ---------- Iskandar: crested helmet, bronze cuirass, red cloak ----------
const GreekHelmet: React.FC = () => (
  <g>
    <path d="M140 40 C170 10 230 10 260 40 C240 30 160 30 140 40 Z" fill="#c62828" stroke={INK} strokeWidth={4} />
    <path d="M110 60 C150 0 250 0 290 60 C270 40 130 40 110 60 Z" fill="#e53935" stroke={INK} strokeWidth={4} />
    <path d="M104 186 C100 110 146 66 200 64 C254 66 300 110 296 186 L276 186 C274 150 250 132 200 132 C150 132 126 150 124 186 Z" fill="#d4a017" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
    <path d="M150 90 C138 110 132 130 130 160" fill="none" stroke="#f6dc7a" strokeWidth={8} strokeLinecap="round" />
    <path d="M100 186 L130 186 L128 250 L104 236 Z" fill="#d4a017" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    <path d="M300 186 L270 186 L272 250 L296 236 Z" fill="#d4a017" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
  </g>
);
const IskandarBody: React.FC<{swing: number; plain?: boolean}> = ({swing, plain = false}) => (
  <g>
    {!plain && <path d="M128 330 C80 420 70 560 84 690 L316 690 C330 560 320 420 272 330 Z" fill="#b71c1c" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />}
    {[156, 184, 216, 244].map((x) => (
      <rect key={x} x={x - 12} y={510} width={24} height={100} rx={5} fill="#f3e9d2" stroke={INK} strokeWidth={4} />
    ))}
    <path d="M150 600 L194 600 L194 720 L136 728 C136 700 144 680 150 600 Z" fill={SKIN} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
    <path d="M206 600 L250 600 C256 680 264 700 264 728 L206 720 Z" fill={SKIN} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
    <rect x={146} y={620} width={50} height={80} rx={12} fill="#d4a017" stroke={INK} strokeWidth={4} />
    <rect x={204} y={620} width={50} height={80} rx={12} fill="#d4a017" stroke={INK} strokeWidth={4} />
    <path d="M130 720 L198 720 L198 732 L126 732 Z M202 720 L270 720 L274 732 L202 732 Z" fill="#6b3a1f" stroke={INK} strokeWidth={3} />
    <g transform={`rotate(${swing} 128 340)`}>
      <path d="M128 330 C104 340 98 420 102 498 L134 498 C134 440 138 380 146 352 Z" fill={SKIN} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
      <rect x={100} y={460} width={36} height={30} rx={6} fill="#d4a017" stroke={INK} strokeWidth={4} />
      <circle cx={118} cy={512} r={18} fill={SKIN} stroke={INK} strokeWidth={SW} />
    </g>
    <g transform={`rotate(${-swing} 272 340)`}>
      <path d="M272 330 C296 340 302 420 298 498 L266 498 C266 440 262 380 254 352 Z" fill={SKIN} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
      <rect x={264} y={460} width={36} height={30} rx={6} fill="#d4a017" stroke={INK} strokeWidth={4} />
      <circle cx={282} cy={512} r={18} fill={SKIN} stroke={INK} strokeWidth={SW} />
    </g>
    <path d="M136 326 C160 314 240 314 264 326 C272 380 270 460 262 520 L138 520 C130 460 128 380 136 326 Z" fill={plain ? '#a93226' : '#d4a017'} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
    {plain && <path d="M150 330 L250 520 M250 330 L150 520" stroke="#6b3a1f" strokeWidth={12} />}
    {plain && <ellipse cx={200} cy={425} rx={34} ry={24} fill="none" stroke="#c9b48e" strokeWidth={10} />}
    <path d="M160 380 Q180 400 198 384 M202 384 Q220 400 240 380 M170 450 Q200 466 230 450" fill="none" stroke="#9c7410" strokeWidth={5} strokeLinecap="round" />
    <circle cx={200} cy={350} r={14} fill="#f6dc7a" stroke={INK} strokeWidth={4} />
    <rect x={136} y={500} width={128} height={20} rx={6} fill="#9c7410" stroke={INK} strokeWidth={4} />
  </g>
);

// ---------- Ravshanak: long dress with gold trim ----------
const RavshanakBody: React.FC<{swing: number}> = ({swing}) => (
  <g>
    <g transform={`rotate(${swing} 128 340)`}>
      <path d="M128 330 C104 340 98 420 102 498 L134 498 C134 440 138 380 146 352 Z" fill="#7b1fa2" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
      <rect x={100} y={476} width={36} height={16} rx={5} fill="#d9a43a" stroke={INK} strokeWidth={3} />
      <circle cx={118} cy={512} r={17} fill={SKIN} stroke={INK} strokeWidth={SW} />
    </g>
    <g transform={`rotate(${-swing} 272 340)`}>
      <path d="M272 330 C296 340 302 420 298 498 L266 498 C266 440 262 380 254 352 Z" fill="#7b1fa2" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
      <rect x={264} y={476} width={36} height={16} rx={5} fill="#d9a43a" stroke={INK} strokeWidth={3} />
      <circle cx={282} cy={512} r={17} fill={SKIN} stroke={INK} strokeWidth={SW} />
    </g>
    <path d="M140 326 C162 314 238 314 260 326 C266 380 262 430 258 460 L304 728 L96 728 L142 460 C138 430 134 380 140 326 Z" fill="#7b1fa2" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
    <path d="M104 700 L296 700" stroke="#d9a43a" strokeWidth={12} />
    <path d="M168 322 L200 372 L232 322" fill="none" stroke="#d9a43a" strokeWidth={8} strokeLinejoin="round" />
    <rect x={140} y={452} width={120} height={18} rx={6} fill="#d9a43a" stroke={INK} strokeWidth={3.5} />
    {[150, 250].map((x) => (
      <path key={x} d={`M${x} 480 L${x + (x - 200) * 0.5} 690`} stroke="#5e1780" strokeWidth={4} />
    ))}
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

// ---------- Amir Temur (same drawing style as Bek) ----------
const BEARD = '#3b2516';
const Beard: React.FC = () => (
  <g>
    {/* beard along the jaw, leaving the mouth open */}
    <path
      d="M110 228 C112 280 140 330 200 352 C260 330 288 280 290 228 C280 262 262 282 240 286 C226 300 214 304 200 304 C186 304 174 300 160 286 C138 282 120 262 110 228 Z"
      fill={BEARD}
      stroke={INK}
      strokeWidth={4}
      strokeLinejoin="round"
    />
    {/* moustache */}
    <path d="M200 252 C186 244 164 246 152 262 C168 258 184 262 200 260 C216 262 232 258 248 262 C236 246 214 244 200 252 Z" fill={BEARD} stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />
    {/* grey streaks */}
    <path d="M150 300 Q170 330 196 344" stroke="#7d6a5a" strokeWidth={4} fill="none" strokeLinecap="round" />
    <path d="M250 300 Q232 330 206 344" stroke="#7d6a5a" strokeWidth={4} fill="none" strokeLinecap="round" />
  </g>
);

const TemurHat: React.FC = () => (
  <g>
    {/* plume */}
    <path d="M232 70 C246 30 270 14 286 10 C276 34 262 56 246 82 Z" fill="#f4efe2" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    {/* tall rounded crown */}
    <path d="M118 160 C118 80 150 34 200 30 C250 34 282 80 282 160 Z" fill="#8f1f1a" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
    <path d="M200 34 L200 156" stroke="#d9a43a" strokeWidth={6} />
    <path d="M150 60 C140 90 136 120 136 156" stroke="#d9a43a" strokeWidth={5} fill="none" />
    <path d="M250 60 C260 90 264 120 264 156" stroke="#d9a43a" strokeWidth={5} fill="none" />
    {/* fur brim */}
    <rect x={98} y={146} width={204} height={44} rx={22} fill="#e9dcc3" stroke={INK} strokeWidth={SW} />
    {[118, 146, 174, 202, 230, 258, 284].map((x) => (
      <path key={x} d={`M${x} 152 q6 14 0 30`} stroke="#c9b48e" strokeWidth={4} fill="none" />
    ))}
    {/* jewel */}
    <circle cx={200} cy={120} r={16} fill="#2f7fd1" stroke={INK} strokeWidth={4} />
    <circle cx={195} cy={115} r={5} fill="#fff" opacity={0.8} />
  </g>
);

const TemurBody: React.FC<{swing: number}> = ({swing}) => (
  <g>
    {/* boots */}
    <path d="M146 640 L194 640 L196 728 L128 728 C126 708 138 700 146 696 Z" fill="#3a2414" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
    <path d="M206 640 L254 640 L254 696 C262 700 274 708 272 728 L204 728 Z" fill="#3a2414" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
    {/* arms */}
    <g transform={`rotate(${swing} 128 340)`}>
      <path d="M128 330 C100 340 92 420 98 500 L136 500 C136 440 140 380 148 352 Z" fill="#1f5a3a" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
      <rect x={96} y={478} width={42} height={18} rx={5} fill="#d9a43a" stroke={INK} strokeWidth={4} />
      <circle cx={117} cy={514} r={19} fill={SKIN} stroke={INK} strokeWidth={SW} />
    </g>
    <g transform={`rotate(${-swing} 272 340)`}>
      <path d="M272 330 C300 340 308 420 302 500 L264 500 C264 440 260 380 252 352 Z" fill="#1f5a3a" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
      <rect x={262} y={478} width={42} height={18} rx={5} fill="#d9a43a" stroke={INK} strokeWidth={4} />
      <circle cx={283} cy={514} r={19} fill={SKIN} stroke={INK} strokeWidth={SW} />
    </g>
    {/* long robe */}
    <path d="M132 322 C160 310 240 310 268 322 C276 380 274 440 270 470 L300 660 L100 660 L130 470 C126 440 124 380 132 322 Z" fill="#1f5a3a" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
    <path d="M200 326 L200 658" stroke="#d9a43a" strokeWidth={8} />
    <path d="M170 322 L200 380 L230 322" fill="none" stroke="#d9a43a" strokeWidth={8} strokeLinejoin="round" />
    {[380, 420, 520, 580].map((y) => (
      <circle key={y} cx={214} cy={y} r={6} fill="#d9a43a" stroke={INK} strokeWidth={2} />
    ))}
    {/* belt */}
    <rect x={128} y={456} width={144} height={28} rx={8} fill="#d9a43a" stroke={INK} strokeWidth={4} />
    <circle cx={200} cy={470} r={14} fill="#8f1f1a" stroke={INK} strokeWidth={4} />
  </g>
);


// ---------- Mongols (episode 4): fur-brimmed felt hats, wrap-over deel robes ----------
const MONGOL_COL: Record<string, {robe: string; trim: string; hat: string; top: string}> = {
  chingiz: {robe: '#f1ead8', trim: '#c8962e', hat: '#f6f1e4', top: '#b3261e'},
  mongol: {robe: '#2f6f73', trim: '#e9c46a', hat: '#6b4a2b', top: '#3a2418'},
  jebe: {robe: '#9a5a2c', trim: '#e9c46a', hat: '#5a3a22', top: '#3a2418'},
  jamuxa: {robe: '#5b3f7a', trim: '#c8a2e0', hat: '#3b2a4a', top: '#2a1a35'},
  navkar: {robe: '#4a4f57', trim: '#9aa3ad', hat: '#3a3a3a', top: '#222'},
};
const MongolBeard: React.FC<{grey?: boolean; short?: boolean}> = ({grey, short}) => {
  const c = grey ? '#4a3a30' : '#2a1a12';
  return (
    <g>
      {/* long drooping moustache */}
      <path d="M200 254 C182 244 160 250 150 270 C146 290 150 306 156 316 C160 296 170 274 200 266 C230 274 240 296 244 316 C250 306 254 290 250 270 C240 250 218 244 200 254 Z" fill={c} stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />
      {!short && <path d="M184 300 C186 330 194 350 200 360 C206 350 214 330 216 300 C208 306 192 306 184 300 Z" fill={c} stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />}
      {grey && <path d="M196 312 L198 348" stroke="#9c8e80" strokeWidth={3} strokeLinecap="round" />}
    </g>
  );
};
const MongolHat: React.FC<{outfit: Outfit}> = ({outfit}) => {
  const c = MONGOL_COL[outfit];
  return (
    <g>
      {outfit === 'chingiz' && (
        <g>
          <path d="M206 40 C220 20 236 14 250 18 C238 26 226 34 214 50 Z" fill="#b3261e" stroke={INK} strokeWidth={4} />
          <path d="M194 40 C176 22 160 18 148 24 C162 30 174 38 186 52 Z" fill="#b3261e" stroke={INK} strokeWidth={4} />
        </g>
      )}
      <path d="M116 168 C118 100 152 56 200 44 C248 56 282 100 284 168 Z" fill={c.hat} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
      <circle cx={200} cy={44} r={14} fill={c.top} stroke={INK} strokeWidth={4} />
      {/* fur brim turned up at the sides */}
      <path d="M92 196 C88 160 104 146 126 150 C170 158 230 158 274 150 C296 146 312 160 308 196 C290 178 270 176 250 180 C216 186 184 186 150 180 C130 176 110 178 92 196 Z" fill={outfit === 'chingiz' ? '#7a5a3a' : '#8a6a48'} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
      {[120, 150, 180, 210, 240, 270].map((x) => (
        <path key={x} d={`M${x} 158 q5 10 0 22`} stroke="#5a3e26" strokeWidth={4} fill="none" />
      ))}
    </g>
  );
};
const MongolBody: React.FC<{swing: number; outfit: Outfit}> = ({swing, outfit}) => {
  const c = MONGOL_COL[outfit];
  return (
    <g>
      <path d="M146 640 L194 640 L196 728 L128 728 C126 708 138 700 146 696 Z" fill="#3a2414" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
      <path d="M206 640 L254 640 L254 696 C262 700 274 708 272 728 L204 728 Z" fill="#3a2414" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
      <g transform={`rotate(${swing} 128 340)`}>
        <path d="M128 330 C100 340 92 420 98 500 L136 500 C136 440 140 380 148 352 Z" fill={c.robe} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
        <rect x={96} y={478} width={42} height={18} rx={5} fill={c.trim} stroke={INK} strokeWidth={4} />
        <circle cx={117} cy={514} r={19} fill={SKIN} stroke={INK} strokeWidth={SW} />
      </g>
      <g transform={`rotate(${-swing} 272 340)`}>
        <path d="M272 330 C300 340 308 420 302 500 L264 500 C264 440 260 380 252 352 Z" fill={c.robe} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
        <rect x={262} y={478} width={42} height={18} rx={5} fill={c.trim} stroke={INK} strokeWidth={4} />
        <circle cx={283} cy={514} r={19} fill={SKIN} stroke={INK} strokeWidth={SW} />
      </g>
      <path d="M132 322 C160 310 240 310 268 322 C276 380 274 440 270 470 L296 650 L104 650 L130 470 C126 440 124 380 132 322 Z" fill={c.robe} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
      {/* wrap-over front edge (deel) */}
      <path d="M150 324 C190 360 240 380 262 400 L262 470" fill="none" stroke={c.trim} strokeWidth={10} strokeLinecap="round" />
      <path d="M262 470 L282 648" stroke={c.trim} strokeWidth={8} />
      <rect x={128} y={456} width={144} height={28} rx={8} fill={outfit === 'chingiz' ? '#c8962e' : '#3b2414'} stroke={INK} strokeWidth={4} />
      {outfit === 'chingiz' && <circle cx={200} cy={470} r={14} fill="#2f7fd1" stroke={INK} strokeWidth={4} />}
    </g>
  );
};

// Bek as an SVG group in his own 400x800 coordinate space (for use inside other SVG scenes).
export const BekG: React.FC<Props & {shadow?: boolean}> = ({outfit = 'modern', mood = 'neutral', blink = 0, lookX = 0, armSwing = 0, shadow = true}) => (
  <g>
    {shadow && <ellipse cx={200} cy={732} rx={110} ry={14} fill="#000" opacity={0.25} />}
    {outfit === 'soldier' && <Aventail />}
    {outfit === 'modern' ? (
      <ModernBody swing={armSwing} />
    ) : outfit === 'temur' ? (
      <TemurBody swing={armSwing} />
    ) : outfit === 'sogd' ? (
      <SogdBody swing={armSwing} />
    ) : outfit === 'iskandar' ? (
      <IskandarBody swing={armSwing} />
    ) : outfit === 'yunon' ? (
      <IskandarBody swing={armSwing} plain />
    ) : outfit === 'ravshanak' ? (
      <RavshanakBody swing={armSwing} />
    ) : MONGOL.includes(outfit) ? (
      <MongolBody swing={armSwing} outfit={outfit} />
    ) : (
      <SoldierBody swing={armSwing} />
    )}
    {outfit !== 'soldier' && <rect x={180} y={300} width={40} height={26} fill={SKIN_SH} stroke={INK} strokeWidth={SW} />}
    <Head outfit={outfit} mood={mood} blink={blink} lookX={lookX} />
    {outfit === 'soldier' && <Helmet />}
    {outfit === 'temur' && <TemurHat />}
    {outfit === 'sogd' && <SogdCap />}
    {(outfit === 'iskandar' || outfit === 'yunon') && <GreekHelmet />}
    {MONGOL.includes(outfit) && <MongolHat outfit={outfit} />}
  </g>
);

export const Bek: React.FC<Props> = (p) => (
  <svg viewBox="-20 -10 440 760" width="100%" height="100%" style={{overflow: 'visible'}}>
    <BekG {...p} />
  </svg>
);

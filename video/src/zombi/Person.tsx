import React from 'react';

// Parametric people in Bek's drawing style (same 400x800 space, feet at y=730) for the zombie series.
export type Mood = 'neutral' | 'surprised' | 'happy' | 'worried' | 'determined' | 'scared' | 'shout';
export type Hair = 'messy' | 'short' | 'buzz' | 'long' | 'bun' | 'scarf' | 'grey' | 'curly';
export type Top = 'hoodie' | 'shirt' | 'blouse' | 'blazer' | 'jacket' | 'dress';
export type PersonProps = {
  skin?: string; hair?: Hair; hairColor?: string; top?: Top; topColor?: string; pants?: string;
  mood?: Mood; blink?: number; lookX?: number; swing?: number; phone?: boolean; armsUp?: boolean;
  glasses?: boolean; mustache?: boolean; zombie?: number; eyeGlow?: number; sweat?: boolean; big?: boolean;
};
const INK = '#2b1e16';
const SW = 5;
const mix = (a: string, b: string, k: number) => {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const A = p(a), B = p(b);
  return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * k)).join(',')})`;
};

const Face: React.FC<{mood: Mood; blink: number; lookX: number; hairColor: string; skinSh: string; zombie: number; eyeGlow: number}> = ({mood, blink, lookX, hairColor, skinSh, zombie, eyeGlow}) => {
  const eyeRy = 19 * (1 - blink * 0.92);
  const lx = lookX * 5;
  const brow = {neutral: [0, 0, 0], surprised: [-12, 6, -6], happy: [-4, 4, -4], worried: [-6, -14, 14], determined: [6, 14, -14], scared: [-14, -16, 16], shout: [4, 16, -16]}[mood];
  const [by, rotL, rotR] = brow;
  let mouth: React.ReactNode;
  if (mood === 'surprised' || mood === 'scared') mouth = <ellipse cx={200} cy={270} rx={mood === 'scared' ? 16 : 13} ry={mood === 'scared' ? 21 : 17} fill="#5a1f1a" stroke={INK} strokeWidth={4} />;
  else if (mood === 'shout') mouth = <path d="M170 254 L230 254 Q228 300 200 300 Q172 300 170 254 Z" fill="#5a1f1a" stroke={INK} strokeWidth={4} strokeLinejoin="round" />;
  else if (mood === 'happy') mouth = <path d="M172 254 L228 254 Q226 292 200 292 Q174 292 172 254 Z" fill="#7a2620" stroke={INK} strokeWidth={4} strokeLinejoin="round" />;
  else if (mood === 'worried') mouth = <path d="M178 270 Q189 260 200 268 Q211 276 222 266" fill="none" stroke={INK} strokeWidth={4.5} strokeLinecap="round" />;
  else if (mood === 'determined') mouth = <path d="M180 266 L222 262" fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round" />;
  else mouth = <path d="M182 262 Q200 274 218 262" fill="none" stroke={INK} strokeWidth={4.5} strokeLinecap="round" />;
  return (
    <g>
      <ellipse cx={148} cy={250} rx={16} ry={9} fill="#e8796b" opacity={0.35 * (1 - zombie)} />
      <ellipse cx={252} cy={250} rx={16} ry={9} fill="#e8796b" opacity={0.35 * (1 - zombie)} />
      {zombie > 0.3 && <g stroke="#5c6b4a" strokeWidth={3} opacity={zombie}><path d="M146 236 Q152 230 160 236" fill="none" /><path d="M240 236 Q248 230 254 236" fill="none" /></g>}
      {[163, 237].map((x) => (
        <g key={x}>
          {eyeGlow > 0 ? (
            <g>
              <circle cx={x} cy={214} r={30} fill="#b6ff9e" opacity={0.25 * eyeGlow} />
              <ellipse cx={x} cy={214} rx={15} ry={Math.max(eyeRy, 2)} fill={mix('#2b1e16', '#d8ffcf', eyeGlow)} />
              <circle cx={x} cy={214} r={4 * (1 - eyeGlow) + 2} fill={INK} opacity={1 - eyeGlow * 0.7} />
            </g>
          ) : (
            <g>
              <ellipse cx={x + lx} cy={214} rx={12} ry={Math.max(eyeRy, 2)} fill={INK} />
              {blink < 0.5 && <circle cx={x + lx - 4} cy={207} r={4.2} fill="#fff" />}
            </g>
          )}
        </g>
      ))}
      <rect x={140} y={172 + by} width={44} height={9} rx={4.5} fill={hairColor} transform={`rotate(${rotL} 162 ${176 + by})`} />
      <rect x={216} y={172 + by} width={44} height={9} rx={4.5} fill={hairColor} transform={`rotate(${rotR} 238 ${176 + by})`} />
      <path d="M200 228 Q209 240 199 246" fill="none" stroke={skinSh} strokeWidth={4} strokeLinecap="round" />
      {mouth}
    </g>
  );
};

const HairBack: React.FC<{hair: Hair; c: string}> = ({hair, c}) => {
  if (hair === 'long') return <path d="M104 190 C90 120 140 84 200 84 C260 84 310 120 296 190 C306 260 312 330 300 420 L250 424 C262 330 262 270 256 230 L144 230 C138 270 138 330 150 424 L100 420 C88 330 94 260 104 190 Z" fill={c} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />;
  if (hair === 'scarf') return <path d="M88 220 C80 120 136 70 200 70 C264 70 320 120 312 220 C320 290 300 350 270 380 L130 380 C100 350 80 290 88 220 Z" fill={c} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />;
  return null;
};
const HairFront: React.FC<{hair: Hair; c: string}> = ({hair, c}) => {
  const P = {fill: c, stroke: INK, strokeWidth: SW, strokeLinejoin: 'round' as const};
  switch (hair) {
    case 'messy':
      return <path d="M104 200 C96 130 140 92 200 92 C262 92 306 128 296 200 C284 170 268 152 246 146 C236 160 214 166 196 160 C206 152 210 144 208 136 C190 152 160 160 132 158 C118 168 108 184 104 200 Z" {...P} />;
    case 'short':
      return <path d="M106 196 C100 132 142 96 200 96 C258 96 300 132 294 196 C280 160 250 142 200 142 C150 142 120 160 106 196 Z" {...P} />;
    case 'buzz':
      return <path d="M110 180 C110 128 150 102 200 102 C250 102 290 128 290 180 C270 150 240 138 200 138 C160 138 130 150 110 180 Z" {...P} opacity={0.95} />;
    case 'grey':
      return <path d="M104 210 C100 150 120 116 140 112 C150 132 250 132 260 112 C280 116 300 150 296 210 C286 180 276 170 266 168 L134 168 C124 170 114 180 104 210 Z" {...P} />;
    case 'curly':
      return <g {...P}>{[[130, 150], [165, 118], [205, 108], [245, 120], [275, 152], [110, 190], [292, 190]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={30} />)}</g>;
    case 'long':
      return <path d="M108 190 C104 128 150 96 200 96 C250 96 296 128 292 190 C272 150 240 132 200 150 C170 136 128 150 108 190 Z" {...P} />;
    case 'bun':
      return <g><circle cx={200} cy={82} r={34} {...P} /><path d="M106 196 C100 132 142 96 200 96 C258 96 300 132 294 196 C280 160 250 142 200 142 C150 142 120 160 106 196 Z" {...P} /></g>;
    case 'scarf':
      return <path d="M96 230 C92 140 140 96 200 96 C260 96 308 140 304 230 C296 170 262 128 200 128 C138 128 104 170 96 230 Z" {...P} />;
  }
  return null;
};

const Body: React.FC<{top: Top; topColor: string; pants: string; skin: string; swing: number; phone: boolean; armsUp: boolean; big: boolean; zombie: number}> = ({top, topColor, pants, skin, swing, phone, armsUp, big, zombie}) => {
  const dark = mix(topColor, '#000000', 0.18);
  const w = big ? 16 : 0;
  const armL = armsUp ? 150 : swing;
  const armR = phone ? -166 : armsUp ? -150 : -swing;
  const torn = zombie > 0.5;
  return (
    <g>
      {top === 'dress' ? (
        <path d="M130 500 L116 712 L284 712 L270 500 Z" fill={dark} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
      ) : (
        <path d={`M${148 - w} 500 L${144 - w} 700 L192 700 L198 560 L202 560 L208 700 L${256 + w} 700 L${252 + w} 500 Z`} fill={pants} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
      )}
      <path d="M136 696 L196 696 L200 728 L128 728 C126 712 130 700 136 696 Z" fill="#2f2a26" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
      <path d="M204 696 L264 696 C270 700 274 712 272 728 L200 728 Z" fill="#2f2a26" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
      <g transform={`rotate(${armL} ${128 - w} 340)`}>
        <path d={`M${128 - w} 330 C${104 - w} 340 ${98 - w} 420 ${102 - w} 498 L${134 - w} 498 C${134 - w} 440 138 380 146 352 Z`} fill={topColor} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
        <circle cx={118 - w} cy={512} r={18} fill={skin} stroke={INK} strokeWidth={SW} />
      </g>
      {!phone && <g transform={`rotate(${armR} ${272 + w} 340)`}>
        <path d={`M${272 + w} 330 C${296 + w} 340 ${302 + w} 420 ${298 + w} 498 L${266 + w} 498 C${266 + w} 440 262 380 254 352 Z`} fill={topColor} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
        <circle cx={282 + w} cy={512} r={18} fill={skin} stroke={INK} strokeWidth={SW} />
      </g>}
      <path d={`M${136 - w} 326 C160 314 240 314 ${264 + w} 326 C${272 + w} 380 ${270 + w} 460 ${262 + w} 520 L${138 - w} 520 C${130 - w} 460 ${128 - w} 380 ${136 - w} 326 Z`} fill={topColor} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
      {top === 'hoodie' && <g><path d="M150 318 C170 344 230 344 250 318 C240 306 160 306 150 318 Z" fill={dark} stroke={INK} strokeWidth={4} /><path d="M160 440 L240 440 L252 490 L148 490 Z" fill="none" stroke={INK} strokeWidth={4} /></g>}
      {top === 'shirt' && <g><path d="M170 318 L200 360 L230 318" fill="#fff" stroke={INK} strokeWidth={4} /><path d="M200 360 V510" stroke={INK} strokeWidth={3} />{[390, 430, 470].map((y) => <circle key={y} cx={200} cy={y} r={4} fill={INK} />)}</g>}
      {top === 'blouse' && <g><path d="M168 318 L200 352 L232 318 L222 312 L200 330 L178 312 Z" fill="#fff" stroke={INK} strokeWidth={4} /><path d="M150 360 L180 360 L176 520 L140 520 Z M250 360 L220 360 L224 520 L260 520 Z" fill={dark} /></g>}
      {top === 'blazer' && <g><path d="M176 318 L200 420 L224 318 Z" fill="#e8e4dc" stroke={INK} strokeWidth={4} /><path d="M196 330 L204 330 L206 400 L200 412 L194 400 Z" fill="#7a2b2b" /><path d="M176 318 L200 420 L170 520 M224 318 L200 420 L230 520" fill="none" stroke={INK} strokeWidth={4} /></g>}
      {top === 'jacket' && <g><path d="M200 330 V520" stroke={INK} strokeWidth={4} /><path d="M160 320 L200 340 L240 320" fill="none" stroke={INK} strokeWidth={4} /></g>}
      {top === 'dress' && <path d="M160 330 Q200 350 240 330" fill="none" stroke={INK} strokeWidth={4} />}
      {torn && <g fill="#000" opacity={0.35}><path d="M150 470 l20 30 l14 -24 l18 34 l10 -20 L150 520 Z" /><path d="M230 380 l16 18 l-6 20 Z" /></g>}
    </g>
  );
};

// bent right arm holding a phone to the right ear (same 400x800 space); draw it after the head
export const PhoneArm: React.FC<{color: string; skin: string}> = ({color, skin}) => (
  <g>
    <path d="M262 338 C300 360 318 420 312 470" fill="none" stroke={INK} strokeWidth={46} strokeLinecap="round" />
    <path d="M262 338 C300 360 318 420 312 470" fill="none" stroke={color} strokeWidth={36} strokeLinecap="round" />
    <path d="M312 470 C330 400 322 320 300 268" fill="none" stroke={INK} strokeWidth={44} strokeLinecap="round" />
    <path d="M312 470 C330 400 322 320 300 268" fill="none" stroke={color} strokeWidth={34} strokeLinecap="round" />
    <rect x={272} y={150} width={38} height={92} rx={9} fill="#111" stroke={INK} strokeWidth={4} transform="rotate(10 291 196)" />
    <circle cx={300} cy={252} r={21} fill={skin} stroke={INK} strokeWidth={5} />
  </g>
);

export const PersonG: React.FC<PersonProps & {shadow?: boolean}> = (p) => {
  const z = p.zombie ?? 0;
  const skin = mix(p.skin ?? '#f2c39b', '#a7b59a', z * 0.8);
  const skinSh = mix(skin, '#000000', 0.12);
  const hc = p.hairColor ?? '#3a2418';
  const hair = p.hair ?? 'short';
  return (
    <g>
      {p.shadow !== false && <ellipse cx={200} cy={732} rx={110} ry={14} fill="#000" opacity={0.25} />}
      <HairBack hair={hair} c={hc} />
      <Body top={p.top ?? 'shirt'} topColor={p.topColor ?? '#3d6fa8'} pants={p.pants ?? '#2c3442'} skin={skin} swing={p.swing ?? 0} phone={!!p.phone} armsUp={!!p.armsUp} big={!!p.big} zombie={z} />
      <rect x={180} y={300} width={40} height={26} fill={skinSh} stroke={INK} strokeWidth={SW} />
      <ellipse cx={108} cy={222} rx={17} ry={22} fill={skin} stroke={INK} strokeWidth={SW} />
      <ellipse cx={292} cy={222} rx={17} ry={22} fill={skin} stroke={INK} strokeWidth={SW} />
      <path d="M200 105 C268 105 300 150 298 215 C296 278 258 318 200 318 C142 318 104 278 102 215 C100 150 132 105 200 105 Z" fill={skin} stroke={INK} strokeWidth={SW} />
      <HairFront hair={hair} c={hc} />
      <Face mood={p.mood ?? 'neutral'} blink={p.blink ?? 0} lookX={p.lookX ?? 0} hairColor={hair === 'scarf' ? '#3a2418' : hc} skinSh={skinSh} zombie={z} eyeGlow={p.eyeGlow ?? 0} />
      {p.glasses && <g fill="none" stroke={INK} strokeWidth={5}><circle cx={163} cy={214} r={26} /><circle cx={237} cy={214} r={26} /><path d="M189 212 H211" /></g>}
      {p.mustache && <path d="M168 248 Q200 236 232 248 Q216 258 200 250 Q184 258 168 248 Z" fill={p.hairColor ?? '#555'} stroke={INK} strokeWidth={3} />}
      {p.phone && <PhoneArm color={p.topColor ?? '#3d6fa8'} skin={skin} />}
      {p.sweat && <path d="M286 170 Q296 186 286 196 Q276 186 286 170 Z" fill="#bfe3ff" stroke={INK} strokeWidth={3} />}
    </g>
  );
};

export const PersonAt: React.FC<PersonProps & {x: number; y: number; s: number; rot?: number; shadow?: boolean}> = ({x, y, s, rot = 0, ...p}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s}) translate(-200 -730)`}>
    <PersonG {...p} />
  </g>
);

// the cast
export const CAST = {
  malika: {skin: '#efc19a', hair: 'long' as Hair, hairColor: '#24160f', top: 'blouse' as Top, topColor: '#2f3e5c', pants: '#2f3e5c'},
  sardor: {skin: '#d9a57c', hair: 'buzz' as Hair, hairColor: '#1d140e', top: 'jacket' as Top, topColor: '#2a2a2e', pants: '#3b3f47', big: true},
  doniyor: {skin: '#f0c7a2', hair: 'curly' as Hair, hairColor: '#4a2c1a', top: 'shirt' as Top, topColor: '#4f8a5b', pants: '#2c3442', glasses: true},
  jasur: {skin: '#f3cdaa', hair: 'short' as Hair, hairColor: '#6b4a2a', top: 'hoodie' as Top, topColor: '#8a3a3a', pants: '#2c3442'},
  girl2: {skin: '#e9b892', hair: 'bun' as Hair, hairColor: '#3a2418', top: 'blouse' as Top, topColor: '#5a3a6a', pants: '#2c3442'},
  boy3: {skin: '#d6a07a', hair: 'short' as Hair, hairColor: '#1d140e', top: 'shirt' as Top, topColor: '#d9d4c8', pants: '#2c3442'},
  ustoz: {skin: '#e3b28c', hair: 'grey' as Hair, hairColor: '#8d8d8d', top: 'blazer' as Top, topColor: '#4a4e57', pants: '#3a3d44', glasses: true, mustache: true},
  ona: {skin: '#efc19a', hair: 'scarf' as Hair, hairColor: '#7a2f45', top: 'dress' as Top, topColor: '#5d4a7a', pants: '#5d4a7a'},
};

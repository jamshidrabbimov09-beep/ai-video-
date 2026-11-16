import React from 'react';
import {AbsoluteFill, interpolate, random, useCurrentFrame, Easing} from 'remotion';
import {BekG, Outfit, Mood} from './Bek';
import {useOswald} from './common';

// "Bek edit": a short hype edit of our hero in the anime-edit style the user sent
// (particle storm, glowing line-art figures on a white triangle stage, shaking close-ups,
// whip blurs and flashes on the beat, logo burst). 120 BPM: one beat = 15 frames.

export const BEK_EDIT_FRAMES = 480;
const W = 1080;
const H = 1920;
const BEAT = 15;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// ---------- shared pieces ----------

// Inverted line-art look: ink lines become white, fills become dark navy, plus an outer glow.
const LineArt: React.FC<{id: string; color: string; k: number}> = ({id, color, k}) => (
  <filter id={id} x="-40%" y="-20%" width="180%" height="140%" colorInterpolationFilters="sRGB">
    <feColorMatrix
      in="SourceGraphic"
      type="matrix"
      values={`-0.33 -0.65 -0.12 0 1.0  -0.33 -0.65 -0.12 0 1.03  -0.30 -0.60 -0.10 0 1.1  0 0 0 1 0`}
      result="inv"
    />
    <feMorphology in="SourceAlpha" operator="dilate" radius={3 * k} result="dil" />
    <feFlood floodColor={color} result="fl" />
    <feComposite in="fl" in2="dil" operator="in" result="edge" />
    <feGaussianBlur in="edge" stdDeviation={16 * k} result="g1" />
    <feGaussianBlur in="edge" stdDeviation={4 * k} result="g2" />
    <feMerge>
      <feMergeNode in="g1" />
      <feMergeNode in="g1" />
      <feMergeNode in="g2" />
      <feMergeNode in="inv" />
    </feMerge>
  </filter>
);

// Storm of light streaks flying out of the centre.
const Storm: React.FC<{f: number; n?: number; speed?: number; cx?: number; cy?: number; color?: string}> = ({f, n = 260, speed = 1, cx = W / 2, cy = H * 0.45, color = '#bfe6ff'}) => {
  const items = [];
  for (let i = 0; i < n; i++) {
    const a = random(`a${i}`) * Math.PI * 2;
    const life = 40 + random(`l${i}`) * 50;
    const t = ((f * speed + random(`o${i}`) * life) % life) / life; // 0..1
    const r0 = 40 + t * t * 1500;
    const len = 6 + t * 70;
    const x1 = cx + Math.cos(a) * r0;
    const y1 = cy + Math.sin(a) * r0 * 1.2;
    const x2 = cx + Math.cos(a) * (r0 + len);
    const y2 = cy + Math.sin(a) * (r0 + len) * 1.2;
    items.push(<line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={1 + t * 3.5} strokeLinecap="round" opacity={0.25 + t * 0.7} />);
  }
  return <g>{items}</g>;
};

// Drifting snow/dust specks (for the dark close-ups).
const Specks: React.FC<{f: number; n?: number}> = ({f, n = 120}) => (
  <g>
    {Array.from({length: n}).map((_, i) => {
      const x = (random(`sx${i}`) * W + f * (6 + random(`sv${i}`) * 14)) % W;
      const y = (random(`sy${i}`) * H + f * (2 + random(`sw${i}`) * 5)) % H;
      return <circle key={i} cx={x} cy={y} r={1.5 + random(`sr${i}`) * 4} fill="#d8f0ff" opacity={0.3 + random(`so${i}`) * 0.6} />;
    })}
  </g>
);

const Sunglasses: React.FC = () => (
  <g>
    <path d="M128 200 L272 200" stroke="#111" strokeWidth={8} />
    <ellipse cx={163} cy={216} rx={34} ry={24} fill="#141820" stroke="#111" strokeWidth={6} />
    <ellipse cx={237} cy={216} rx={34} ry={24} fill="#141820" stroke="#111" strokeWidth={6} />
    <path d="M140 206 Q152 200 166 204" stroke="#6d7d96" strokeWidth={5} fill="none" strokeLinecap="round" />
    <path d="M214 206 Q226 200 240 204" stroke="#6d7d96" strokeWidth={5} fill="none" strokeLinecap="round" />
  </g>
);

// Flickering handle at the bottom, letters drop out at random like a glitchy watermark.
const Handle: React.FC<{f: number}> = ({f}) => {
  const txt = '@UNUTILGAN_QISSALAR';
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 1560, textAlign: 'center', fontFamily: 'Oswald', fontSize: 56, letterSpacing: 6, color: '#fff', textShadow: '0 0 12px #9fdcff, 0 0 28px #4fb4ff'}}>
      {txt.split('').map((c, i) => (
        <span key={i} style={{opacity: random(`h${i}-${Math.floor(f / 3)}`) < 0.2 ? 0 : 1}}>{c}</span>
      ))}
    </div>
  );
};

const shake = (f: number, amp: number, seed: string) => [
  (random(`${seed}x${f}`) - 0.5) * 2 * amp,
  (random(`${seed}y${f}`) - 0.5) * 2 * amp,
];

// ---------- scene A: triangle stage, outfits swap on every beat ----------

const STAGE_OUTFITS: Outfit[] = ['modern', 'soldier', 'temur', 'sogd', 'yunon', 'iskandar', 'mongol', 'jebe', 'navkar', 'modern'];

const StageScene: React.FC<{f: number}> = ({f}) => {
  const beat = Math.floor(f / BEAT);
  const inBeat = f % BEAT;
  const outfit = STAGE_OUTFITS[beat % STAGE_OUTFITS.length];
  const pop = interpolate(inBeat, [0, 5], [1.07, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const side1 = STAGE_OUTFITS[(beat + 3) % STAGE_OUTFITS.length];
  const side2 = STAGE_OUTFITS[(beat + 6) % STAGE_OUTFITS.length];
  const cam = interpolate(f, [0, 150], [1.0, 1.08]);
  const sc = 1.3 * pop;
  const swing = Math.sin(f / 6) * 10;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <defs>
        <radialGradient id="aBg" cx="50%" cy="45%" r="70%">
          <stop offset="0%" stopColor="#2d6f8f" />
          <stop offset="60%" stopColor="#0f3550" />
          <stop offset="100%" stopColor="#06131f" />
        </radialGradient>
        <LineArt id="laW" color="#ffffff" k={1} />
        <LineArt id="laR" color="#ff4a5a" k={1.6} />
        <filter id="triGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="18" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <rect width={W} height={H} fill="url(#aBg)" />
      <Storm f={f} speed={1.6} />
      <g transform={`translate(${W / 2} ${H / 2}) scale(${cam}) translate(${-W / 2} ${-H / 2})`}>
        <polygon points="90,1190 990,1190 540,1560" fill="#f4fbff" filter="url(#triGlow)" />
        {/* side figures, red glow, small, at the back corners */}
        <g transform={`translate(${150 - 200 * 0.6} ${1215 - 732 * 0.6}) scale(0.6)`} filter="url(#laR)">
          <BekG outfit={side1} mood="determined" shadow={false} armSwing={-swing} />
        </g>
        <g transform={`translate(${930 - 200 * 0.6} ${1215 - 732 * 0.6}) scale(0.6)`} filter="url(#laR)">
          <BekG outfit={side2} mood="determined" shadow={false} armSwing={swing} />
        </g>
        {/* hero */}
        <g transform={`translate(${540 - 200 * sc} ${1470 - 732 * sc}) scale(${sc})`} filter="url(#laW)">
          <BekG outfit={outfit} mood={beat % 2 ? 'determined' : 'neutral'} shadow={false} armSwing={swing} blink={inBeat > 11 && beat % 3 === 0 ? 1 : 0} />
        </g>
      </g>
      {/* white flash on each beat */}
      <rect width={W} height={H} fill="#fff" opacity={interpolate(inBeat, [0, 4], [0.55, 0], clamp)} />
    </svg>
  );
};

// ---------- scene B: dark, inverted, shaking face close-up ----------

const DarkFace: React.FC<{f: number; outfit?: Outfit; zoom?: number; mood?: Mood}> = ({f, outfit = 'modern', zoom = 3.6, mood = 'determined'}) => {
  const [sx, sy] = shake(f, 14, 'df');
  const z = zoom * interpolate(f, [0, 30], [1, 1.12], clamp);
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <defs>
        <linearGradient id="dBg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1d3b52" />
          <stop offset="100%" stopColor="#050c14" />
        </linearGradient>
        <LineArt id="laD" color="#e8f6ff" k={1 / zoom} />
      </defs>
      <rect width={W} height={H} fill="url(#dBg)" />
      <g transform={`translate(${W / 2 + sx} ${H * 0.46 + sy}) scale(${z}) rotate(-8) translate(-200 -230)`} filter="url(#laD)">
        <BekG outfit={outfit} mood={mood} shadow={false} />
      </g>
      <g transform={`translate(${W / 2 + sx} ${H * 0.46 + sy}) scale(${z}) rotate(-8) translate(-200 -230)`}>
        <Sunglasses />
      </g>
      <Specks f={f} />
    </svg>
  );
};

// ---------- scene C: bright anime sky, calm close-up with sunglasses ----------

const Cloud: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} fill="#fff">
    <circle cx={0} cy={0} r={60} /><circle cx={70} cy={-25} r={75} /><circle cx={150} cy={0} r={58} /><rect x={0} y={0} width={150} height={55} />
  </g>
);

const SkyFace: React.FC<{f: number; outfit?: Outfit}> = ({f, outfit = 'modern'}) => {
  const z = interpolate(f, [0, 75], [3.0, 3.4]);
  const drift = f * 1.5;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <defs>
        <linearGradient id="sBg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3f8fd8" />
          <stop offset="70%" stopColor="#9fd0f5" />
          <stop offset="100%" stopColor="#d9eefc" />
        </linearGradient>
        <filter id="soft"><feGaussianBlur stdDeviation="6" /></filter>
      </defs>
      <rect width={W} height={H} fill="url(#sBg)" />
      <g filter="url(#soft)" opacity={0.9}>
        <Cloud x={-120 + drift} y={300} s={1.6} />
        <Cloud x={620 + drift * 0.7} y={180} s={1.2} />
        <Cloud x={700 - drift * 0.5} y={1500} s={2.2} />
        <Cloud x={-200 + drift * 0.6} y={1650} s={2.4} />
      </g>
      <g transform={`translate(${W / 2} ${H * 0.5 + Math.sin(f / 8) * 6}) scale(${z}) translate(-200 -270)`}>
        <BekG outfit={outfit} mood="neutral" shadow={false} />
        <Sunglasses />
      </g>
    </svg>
  );
};

// ---------- scene D: logo burst ----------

const LogoBurst: React.FC<{f: number}> = ({f}) => {
  const s = interpolate(f, [0, 8, 14], [1.6, 0.96, 1], clamp);
  const blur = interpolate(f, [0, 8], [14, 0], clamp);
  const fade = interpolate(f, [48, 60], [1, 0], clamp);
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 45%, #10314a 0%, #040a12 70%)', opacity: fade}}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute'}}>
        <defs>
          <filter id="shardGlow"><feGaussianBlur stdDeviation="4" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        </defs>
        <Storm f={f + 20} n={160} speed={2.2} cy={860} color="#7fd0ff" />
        {/* ice shards flying outward */}
        <g filter="url(#shardGlow)">
          {Array.from({length: 46}).map((_, i) => {
            const a = random(`ka${i}`) * Math.PI * 2;
            const v = 10 + random(`kv${i}`) * 26;
            const d = Math.min(f, 40) * v * (1 - Math.min(f, 40) / 90);
            const x = 540 + Math.cos(a) * d;
            const y = 860 + Math.sin(a) * d;
            const sz = 10 + random(`ks${i}`) * 26;
            const rot = random(`kr${i}`) * 360 + f * 8;
            return <polygon key={i} points={`0,${-sz} ${sz * 0.35},0 0,${sz * 1.4} ${-sz * 0.3},0`} transform={`translate(${x} ${y}) rotate(${rot})`} fill="#bfeaff" opacity={interpolate(f, [0, 3, 40], [0, 1, 0.2], clamp)} />;
          })}
        </g>
        {/* crackle lines */}
        {f < 26 && Array.from({length: 9}).map((_, i) => {
          const a = (i / 9) * Math.PI * 2 + random(`ca${Math.floor(f / 2)}`);
          let d = `M540 860`;
          let x = 540, y = 860;
          for (let j = 0; j < 6; j++) {
            x += Math.cos(a + (random(`c${i}${j}${Math.floor(f / 2)}`) - 0.5)) * 55;
            y += Math.sin(a + (random(`d${i}${j}${Math.floor(f / 2)}`) - 0.5)) * 55;
            d += ` L${x} ${y}`;
          }
          return <path key={i} d={d} stroke="#e6f8ff" strokeWidth={3} fill="none" opacity={0.8} />;
        })}
      </svg>
      <div style={{position: 'absolute', top: 760, left: 0, right: 0, textAlign: 'center', transform: `scale(${s})`, filter: `blur(${blur}px)`}}>
        <div style={{fontFamily: 'Oswald', fontSize: 260, letterSpacing: 16, color: '#dff6ff', WebkitTextStroke: '3px #3fa9e8', textShadow: '0 0 20px #59c2ff, 0 0 60px #2a8fd6, 0 0 110px #1a6fb0'}}>BEK</div>
        <div style={{fontFamily: 'Oswald', fontSize: 84, letterSpacing: 16, color: '#bfe8ff', marginTop: -10, textShadow: '0 0 16px #4fb4ff'}}>TASAVVUR QIL</div>
      </div>
      <AbsoluteFill style={{background: '#fff', opacity: interpolate(f, [0, 5], [0.9, 0], clamp)}} />
    </AbsoluteFill>
  );
};

// ---------- whip transition wrapper ----------

const Whip: React.FC<{f: number; start: number; end: number; children: React.ReactNode}> = ({f, start, end, children}) => {
  // blur + slide in the first 5 frames and the last 5 frames of a shot
  const inT = interpolate(f, [start, start + 5], [1, 0], clamp);
  const outT = interpolate(f, [end - 5, end], [0, 1], clamp);
  const t = Math.max(inT, outT);
  const dx = inT > 0 ? inT * 260 : -outT * 260;
  return (
    <AbsoluteFill style={{transform: `translateX(${dx}px) scale(${1 + t * 0.15})`, filter: t > 0.01 ? `blur(${t * 26}px)` : undefined}}>
      {children}
    </AbsoluteFill>
  );
};

// ---------- timeline ----------

type Shot = {from: number; to: number; render: (f: number) => React.ReactNode; whip?: boolean};
const SHOTS: Shot[] = [
  {from: 0, to: 150, render: (f) => <StageScene f={f} />},
  {from: 150, to: 180, render: (f) => <DarkFace f={f} />},
  {from: 180, to: 255, render: (f) => <SkyFace f={f} />, whip: true},
  {from: 255, to: 285, render: (f) => <DarkFace f={f} outfit="temur" zoom={2.6} />, whip: true},
  {from: 285, to: 315, render: (f) => <DarkFace f={f} zoom={4.2} mood="neutral" />},
  {from: 315, to: 390, render: (f) => <SkyFace f={f} outfit="soldier" />, whip: true},
  {from: 390, to: 420, render: (f) => <StageScene f={f + 120} />, whip: true},
  {from: 420, to: 480, render: (f) => <LogoBurst f={f} />},
];

export const BekEdit: React.FC<{at?: number}> = ({at}) => {
  useOswald();
  const cur = useCurrentFrame();
  const frame = at ?? cur;
  const shot = SHOTS.find((s) => frame >= s.from && frame < s.to) ?? SHOTS[SHOTS.length - 1];
  const local = frame - shot.from;
  const body = shot.render(local);
  const beatFlash = frame >= 150 && frame < 420 && frame % BEAT < 3 ? interpolate(frame % BEAT, [0, 3], [0.35, 0], clamp) : 0;
  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      {shot.whip ? <Whip f={frame} start={shot.from} end={shot.to}>{body}</Whip> : body}
      {beatFlash > 0 && <AbsoluteFill style={{background: '#fff', opacity: beatFlash}} />}
      {frame < 420 && <Handle f={frame} />}
    </AbsoluteFill>
  );
};

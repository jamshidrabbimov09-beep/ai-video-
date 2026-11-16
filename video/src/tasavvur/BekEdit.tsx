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

// Sideways flowing stream of streaks (like a current), speeds up while the camera swings.
const Flow: React.FC<{f: number; boost: number; n?: number}> = ({f, boost, n = 520}) => {
  const items = [];
  const ang = -0.32 + boost * 0.15;
  const ca = Math.cos(ang), sa = Math.sin(ang);
  const WW = W + 400;
  for (let i = 0; i < n; i++) {
    const v = 9 + random(`fv${i}`) * 16;
    const travel = f * v * (1 + boost) + random(`fo${i}`) * 4000;
    const x = ((((random(`fx${i}`) * WW + travel * ca) % WW) + WW) % WW) - 200;
    const y0 = random(`fy${i}`) * H;
    const y = (((y0 + travel * sa + Math.sin(x / 180 + i) * 30) % H) + H) % H;
    const len = (14 + random(`fl${i}`) * 26) * (1 + boost * 3);
    const near = random(`fn${i}`);
    items.push(<line key={i} x1={x} y1={y} x2={x - ca * len} y2={y - sa * len} stroke={near > 0.85 ? '#ffffff' : '#a9dcf5'} strokeWidth={near > 0.85 ? 4 : 2} strokeLinecap="round" opacity={0.35 + near * 0.55} />);
  }
  return <g>{items}</g>;
};

// Pseudo-3D stage: three Beks stand on the corners of a glowing triangle, the camera orbits
// 120 degrees on every beat so a new one swings to the front (outfits change while at the back).
const STAGE_R = 470;
const project = (x: number, z: number, th: number, D: number, camH: number) => {
  const xr = x * Math.cos(th) - z * Math.sin(th);
  const zr = x * Math.sin(th) + z * Math.cos(th);
  const depth = D + zr;
  const F = 1150;
  return {sx: W / 2 + (xr * F) / depth, sy: 640 + (camH * F) / depth, k: F / depth, depth};
};

const StageScene: React.FC<{f: number}> = ({f}) => {
  const beat = Math.floor(f / BEAT);
  const inBeat = f % BEAT;
  const swingT = interpolate(inBeat, [0, 6], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const th = ((beat - 1 + swingT) * 2 * Math.PI) / 3 + f * 0.0015;
  const speed = inBeat < 6 ? Math.sin((inBeat / 6) * Math.PI) : 0;
  const D = 1500 + Math.sin(f / 23) * 120;
  const camH = 760 + Math.sin(f / 31) * 90;
  const corner = (i: number, r: number) => [Math.sin((i * 2 * Math.PI) / 3) * r, -Math.cos((i * 2 * Math.PI) / 3) * r];
  const tri = [0, 1, 2].map((i) => {
    const [x, z] = corner(i, 760);
    return project(x, z, th, D, camH);
  });
  const figs = [0, 1, 2]
    .map((i) => {
      // the figure nearest the camera once the swing of beat bf has finished
      const frontAt = (bb: number) => {
        const t = (bb * 2 * Math.PI) / 3;
        let best = 0, bz = 1e9;
        for (let j = 0; j < 3; j++) {
          const [cx, cz] = corner(j, 1);
          const zr = cx * Math.sin(t) + cz * Math.cos(t);
          if (zr < bz) { bz = zr; best = j; }
        }
        return best;
      };
      let bf = beat;
      while (frontAt(bf) !== i) bf++;
      const [x, z] = corner(i, STAGE_R);
      return {i, p: project(x, z, th, D, camH), outfit: STAGE_OUTFITS[bf % STAGE_OUTFITS.length], front: bf === beat};
    })
    .sort((q, r) => r.p.depth - q.p.depth);
  const blur = speed * 22;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <defs>
        <linearGradient id="aBg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3f8fae" />
          <stop offset="55%" stopColor="#1b5571" />
          <stop offset="100%" stopColor="#0b2a3c" />
        </linearGradient>
        <LineArt id="laW" color="#ffffff" k={1} />
        <LineArt id="laR" color="#ff4a5a" k={1.3} />
        <filter id="triGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="16" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="swing" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation={`${blur} 0`} /></filter>
      </defs>
      <rect width={W} height={H} fill="url(#aBg)" />
      <Flow f={f} boost={speed} />
      <g filter={blur > 0.5 ? 'url(#swing)' : undefined}>
        <polygon points={tri.map((t) => `${t.sx},${t.sy}`).join(' ')} fill="#f4fbff" filter="url(#triGlow)" />
        {figs.map(({i, p, outfit, front}) => {
          const sc = p.k * 1.55 * (front ? interpolate(inBeat, [6, 12], [1, 1.04], clamp) : 1);
          return (
            <g key={i} transform={`translate(${p.sx - 200 * sc} ${p.sy - 732 * sc}) scale(${sc})`} filter={front ? 'url(#laW)' : 'url(#laR)'}>
              <BekG outfit={outfit} mood={front ? 'determined' : 'neutral'} shadow={false} armSwing={Math.sin(f / 5 + i) * 12} />
            </g>
          );
        })}
      </g>
      <rect width={W} height={H} fill="#fff" opacity={interpolate(inBeat, [0, 3], [0.3, 0], clamp)} />
    </svg>
  );
};

// Ghost echo: the frame plus a faint copy of a few frames earlier (the doubled look of the reference).
const Echo: React.FC<{f: number; render: (f: number) => React.ReactNode; lag?: number; amt?: number}> = ({f, render, lag = 3, amt = 0.4}) => (
  <AbsoluteFill>
    {render(f)}
    {f >= lag && <AbsoluteFill style={{opacity: amt, mixBlendMode: 'screen'}}>{render(f - lag)}</AbsoluteFill>}
  </AbsoluteFill>
);

// ---------- scene B: dark, inverted, shaking face close-up ----------

const DarkFace: React.FC<{f: number; outfit?: Outfit; zoom?: number; mood?: Mood}> = ({f, outfit = 'modern', zoom = 3.6, mood = 'determined'}) => {
  const [sx, sy] = shake(f, 14, 'df');
  const z = zoom * interpolate(f, [0, 30], [1, 1.12], clamp) * interpolate(f % BEAT, [0, 5], [1.1, 1], clamp);
  const tilt = interpolate(f, [0, 30], [-14, -4], clamp);
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
      <g transform={`translate(${W / 2 + sx} ${H * 0.46 + sy}) scale(${z}) rotate(${tilt}) translate(-200 -230)`} filter="url(#laD)">
        <BekG outfit={outfit} mood={mood} shadow={false} />
      </g>
      <g transform={`translate(${W / 2 + sx} ${H * 0.46 + sy}) scale(${z}) rotate(${tilt}) translate(-200 -230)`}>
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
  {from: 0, to: 150, render: (f) => <Echo f={f} render={(g) => <StageScene f={g} />} amt={0.3} />},
  {from: 150, to: 180, render: (f) => <Echo f={f} render={(g) => <DarkFace f={g} />} lag={4} amt={0.45} />},
  {from: 180, to: 255, render: (f) => <SkyFace f={f} />, whip: true},
  {from: 255, to: 285, render: (f) => <DarkFace f={f} outfit="temur" zoom={2.6} />, whip: true},
  {from: 285, to: 315, render: (f) => <Echo f={f} render={(g) => <DarkFace f={g} zoom={4.2} mood="neutral" />} lag={4} amt={0.45} />},
  {from: 315, to: 390, render: (f) => <SkyFace f={f} outfit="soldier" />, whip: true},
  {from: 390, to: 420, render: (f) => <Echo f={f} render={(g) => <StageScene f={g + 120} />} amt={0.3} />, whip: true},
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
      {frame < 420 && <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 45%, transparent 45%, rgba(0,8,16,0.6) 100%)'}} />}
      {frame < 420 && <AbsoluteFill style={{background: '#000', opacity: random(`fk${Math.floor(frame / 2)}`) < 0.18 ? 0.28 : 0}} />}
      {beatFlash > 0 && <AbsoluteFill style={{background: '#fff', opacity: beatFlash}} />}
      {frame < 420 && <Handle f={frame} />}
    </AbsoluteFill>
  );
};

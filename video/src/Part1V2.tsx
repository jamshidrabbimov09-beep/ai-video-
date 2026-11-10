import React from 'react';
import {AbsoluteFill, Img, Sequence, interpolate, random, staticFile, useCurrentFrame} from 'remotion';
import edit from './edit.json';

const FPS = 30;
const GOLD = '#d4af37';
const font = '"Liberation Serif", "DejaVu Serif", Georgia, serif';
export const PART1_V2_FRAMES = Math.round(edit.end * FPS);
const f = (t: number) => Math.round(t * FPS);

type Mv = {z: [number, number]; x?: [number, number]; y?: [number, number]; r?: [number, number]; ease?: 'out' | 'io'; blur?: boolean};
const MV: Record<string, Mv> = {
  in: {z: [1.08, 1.3]},
  inslow: {z: [1.06, 1.18]},
  in2: {z: [1.05, 1.38], y: [0, -2]},
  punch: {z: [1.04, 1.36], ease: 'out'},
  out: {z: [1.34, 1.08]},
  panL: {z: [1.22, 1.22], x: [4, -4]},
  panR: {z: [1.22, 1.22], x: [-4, 4]},
  up: {z: [1.2, 1.3], y: [4, -4]},
  detailR: {z: [1.6, 1.75], x: [-14, -18], y: [-2, -6]},
  detailL: {z: [1.6, 1.7], x: [14, 18], y: [0, 2]},
  faceR: {z: [1.5, 1.62], x: [8, 10], y: [22, 24]},
  faceL: {z: [1.5, 1.65], x: [20, 24], y: [18, 20]},
  blur: {z: [1.1, 1.18], blur: true},
  map: {z: [1.05, 1.16]},
  none: {z: [1, 1]},
};
const TR_LEN: Record<string, number> = {cut: 0, flash: 0, fade: 9, whip: 8, zoom: 9, glitch: 8, dip: 12};
const GRADE: Record<string, string> = {
  warm: 'contrast(1.08) saturate(1.05)',
  sepia: 'sepia(0.75) contrast(1.06) saturate(0.95) brightness(0.98)',
  cold: 'contrast(1.1) saturate(0.78) brightness(0.93) hue-rotate(-10deg)',
};

type Shot = {t0: number; t1: number; img: string | null; mv: string; tr: string; grade: string; shake?: number};
type Over = {k: string; t0: number; t1: number; text?: string; sub?: string; top?: number; size?: number};

const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

const ShotView: React.FC<{s: Shot; T: number}> = ({s, T}) => {
  const fr = useCurrentFrame();
  const dur = Math.max(1, f(s.t1) - f(s.t0));
  const p = Math.min(1, Math.max(0, (fr - T) / dur));
  const m = MV[s.mv] || MV.in;
  const e = m.ease === 'out' ? 1 - (1 - p) * (1 - p) : p * p * (3 - 2 * p) * 0.4 + p * 0.6;
  const z = lerp(m.z[0], m.z[1], e);
  const x = m.x ? lerp(m.x[0], m.x[1], e) : 0;
  const y = m.y ? lerp(m.y[0], m.y[1], e) : 0;
  const sh = (s.shake || 0) * (1 - p);
  const sx = sh ? (random(`a${fr}`) - 0.5) * sh * 3 : 0;
  const sy = sh ? (random(`b${fr}`) - 0.5) * sh * 3 : 0;

  const te = T > 0 ? Math.min(1, fr / T) : 1;
  let op = 1, tx = 0, tsc = 1, blur = 0, extra = '';
  if (s.tr === 'fade' || s.tr === 'dip') op = te;
  if (s.tr === 'whip') { const q = 1 - Math.pow(1 - te, 3); tx = (1 - q) * 100; blur = (1 - q) * 22; }
  if (s.tr === 'zoom') { tsc = 1 + (1 - te) * 0.7; op = Math.min(1, te * 1.6); blur = (1 - te) * 10; }
  if (s.tr === 'glitch' && fr < T) { tx = (random(`g${fr}`) - 0.5) * 8; extra = ` hue-rotate(${Math.round(random(`h${fr}`) * 120)}deg) saturate(1.8)`; }

  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden', opacity: op, transform: `translateX(${tx}%) scale(${tsc})`, filter: blur ? `blur(${blur}px)` : undefined}}>
      {s.img && (
        <Img src={staticFile(`p1img/i${s.img}.jpg`)} style={{
          width: '100%', height: '100%', objectFit: 'cover',
          transform: `translate(${x + sx}%, ${y + sy}%) scale(${z})`,
          filter: m.blur ? 'blur(14px) brightness(0.42)' : (GRADE[s.grade] || GRADE.warm) + extra,
        }} />
      )}
      {s.mv === 'map' && <AbsoluteFill style={{background: 'rgba(0,0,0,0.25)'}} />}
    </AbsoluteFill>
  );
};

/* ---------------- overlays ---------------- */
const Kin: React.FC<{o: Over}> = ({o}) => {
  const fr = useCurrentFrame();
  const a = interpolate(fr, [0, 7], [0, 1], {extrapolateRight: 'clamp'});
  const sc = interpolate(fr, [0, 9], [1.25, 1], {extrapolateRight: 'clamp'});
  return (
    <div style={{position: 'absolute', top: o.top ?? 260, left: 40, right: 40, textAlign: 'center', fontFamily: font, color: '#fff', fontSize: o.size ?? 76,
      letterSpacing: 3, fontWeight: 700, opacity: a, transform: `scale(${sc})`, textShadow: '0 6px 30px #000, 0 0 60px #000, 0 0 12px #000'}}>{o.text}</div>
  );
};
const Kin2: React.FC<{o: Over}> = ({o}) => {
  const fr = useCurrentFrame();
  const a = interpolate(fr, [0, 9], [0, 1], {extrapolateRight: 'clamp'});
  return (
    <div style={{position: 'absolute', top: o.top ?? 250, left: 60, right: 60, textAlign: 'center', fontFamily: font, color: '#fff', fontSize: o.size ?? 58,
      lineHeight: 1.25, letterSpacing: 2, fontWeight: 700, opacity: a, textShadow: '0 6px 30px #000, 0 0 60px #000'}}>{o.text}</div>
  );
};
const Title: React.FC<{o: Over}> = ({o}) => {
  const fr = useCurrentFrame();
  const a = interpolate(fr, [0, 10], [0, 1], {extrapolateRight: 'clamp'});
  const sc = interpolate(fr, [0, 14], [1.18, 1], {extrapolateRight: 'clamp'});
  const w = interpolate(fr, [4, 30], [0, 70], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 420, opacity: a, transform: `scale(${sc})`}}>
      <div style={{fontFamily: font, color: GOLD, fontSize: 124, letterSpacing: 8, fontWeight: 700, textShadow: '0 6px 40px #000, 0 0 70px #000'}}>{o.text}</div>
      <div style={{width: `${w}%`, height: 3, background: GOLD, marginTop: 14}} />
    </AbsoluteFill>
  );
};
const Big: React.FC<{o: Over}> = ({o}) => {
  const fr = useCurrentFrame();
  const a = interpolate(fr, [0, 9], [0, 1], {extrapolateRight: 'clamp'});
  const sc = interpolate(fr, [0, 14], [1.14, 1], {extrapolateRight: 'clamp'});
  const w = interpolate(fr, [6, 30], [0, 100], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: `rgba(0,0,0,${0.58 * a})`, justifyContent: 'center', alignItems: 'center'}}>
      <div style={{opacity: a, transform: `scale(${sc})`, textAlign: 'center', fontFamily: font, padding: '0 60px'}}>
        <div style={{color: GOLD, fontSize: o.size ?? 112, letterSpacing: 5, lineHeight: 1.18, fontWeight: 700, textShadow: '0 6px 40px #000'}}>{o.text}</div>
        <div style={{width: `${w}%`, height: 3, background: GOLD, margin: '24px auto 0'}} />
      </div>
    </AbsoluteFill>
  );
};
const DateBig: React.FC<{o: Over}> = ({o}) => {
  const fr = useCurrentFrame();
  const a = interpolate(fr, [0, 9], [0, 1], {extrapolateRight: 'clamp'});
  const sc = interpolate(fr, [0, 16], [1.35, 1], {extrapolateRight: 'clamp'});
  return (
    <div style={{position: 'absolute', top: 210, width: '100%', textAlign: 'center', fontFamily: font, color: GOLD, fontSize: 190, letterSpacing: 8, fontWeight: 700,
      opacity: a, transform: `scale(${sc})`, textShadow: '0 6px 40px #000, 0 0 80px #000'}}>{o.text}</div>
  );
};
const Tag: React.FC<{o: Over}> = ({o}) => (
  <div style={{position: 'absolute', top: 190, left: 50, color: GOLD, fontFamily: font, fontSize: 40, letterSpacing: 8, border: `2px solid ${GOLD}`, padding: '8px 24px', background: 'rgba(0,0,0,0.45)'}}>{o.text}</div>
);
const Label: React.FC<{o: Over}> = ({o}) => {
  const fr = useCurrentFrame();
  return <div style={{position: 'absolute', bottom: 300, width: '100%', textAlign: 'center', fontFamily: font, fontSize: 30, letterSpacing: 3, color: '#e8dcc0',
    opacity: interpolate(fr, [0, 12], [0, 0.85], {extrapolateRight: 'clamp'}), textShadow: '0 2px 12px #000'}}>{o.text}</div>;
};
const Bars: React.FC<{d: number}> = ({d}) => {
  const fr = useCurrentFrame();
  const h = interpolate(fr, [0, 10, d - 10, d], [0, 170, 170, 0], {extrapolateRight: 'clamp', extrapolateLeft: 'clamp'});
  return <AbsoluteFill><div style={{position: 'absolute', top: 0, width: '100%', height: h, background: '#000'}} /><div style={{position: 'absolute', bottom: 0, width: '100%', height: h, background: '#000'}} /></AbsoluteFill>;
};
const MapOv: React.FC = () => {
  const fr = useCurrentFrame();
  const pts = [{n: 'KESH', x: 600, y: 1130}, {n: 'SAMARQAND', x: 690, y: 880}, {n: 'BALX', x: 470, y: 1390}];
  const draw = interpolate(fr, [10, 70], [0, 1], {extrapolateRight: 'clamp'});
  const pulse = 1 + 0.12 * Math.sin(fr / 6);
  const path = `M ${pts[0].x} ${pts[0].y} L ${pts[1].x} ${pts[1].y} M ${pts[0].x} ${pts[0].y} L ${pts[2].x} ${pts[2].y}`;
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <circle cx={600} cy={1140} r={330 * pulse} fill="rgba(212,175,55,0.10)" stroke={GOLD} strokeWidth={3} strokeDasharray="14 12" opacity={interpolate(fr, [0, 20], [0, 1], {extrapolateRight: 'clamp'})} />
        <path d={path} stroke={GOLD} strokeWidth={6} fill="none" pathLength={1} strokeDasharray={`${draw} 1`} opacity={0.95} />
        {pts.map((p, i) => {
          const o = interpolate(fr, [14 + i * 14, 28 + i * 14], [0, 1], {extrapolateRight: 'clamp', extrapolateLeft: 'clamp'});
          return (
            <g key={p.n} opacity={o}>
              <circle cx={p.x} cy={p.y} r={26 * pulse} fill="none" stroke={GOLD} strokeWidth={3} />
              <circle cx={p.x} cy={p.y} r={12} fill={GOLD} />
              <text x={p.x + 36} y={p.y + 12} fill="#fff" fontSize={44} fontFamily={font} style={{textShadow: '0 2px 10px #000'}}>{p.n}</text>
            </g>
          );
        })}
      </svg>
      <div style={{position: 'absolute', bottom: 300, width: '100%', textAlign: 'center', color: '#bda76a', fontFamily: font, fontSize: 28, letterSpacing: 3}}>sxematik xarita</div>
    </AbsoluteFill>
  );
};
const EndCard: React.FC<{o: Over}> = ({o}) => {
  const fr = useCurrentFrame();
  const a = interpolate(fr, [0, 14], [0, 1], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: `rgba(0,0,0,${0.92 * a})`, justifyContent: 'center', alignItems: 'center'}}>
      <div style={{textAlign: 'center', fontFamily: font, opacity: a}}>
        <div style={{color: GOLD, fontSize: 90, letterSpacing: 8, fontWeight: 700}}>{o.text}</div>
        <div style={{width: '70%', height: 3, background: GOLD, margin: '26px auto'}} />
        <div style={{color: '#efe3c4', fontSize: 46, letterSpacing: 4}}>{o.sub}</div>
        <div style={{color: '#8f8566', fontSize: 28, letterSpacing: 2, marginTop: 70}}>AI yordamida yaratilgan dramatizatsiya</div>
      </div>
    </AbsoluteFill>
  );
};

const Dust: React.FC = () => {
  const fr = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'screen'}}>
      {Array.from({length: 26}, (_, i) => {
        const sz = 3 + random(`s${i}`) * 6;
        const sp = 0.25 + random(`v${i}`) * 0.7;
        const y = ((random(`y${i}`) * 2300 - fr * sp * 2.2) % 2300 + 2300) % 2300 - 190;
        const x = random(`x${i}`) * 1080 + Math.sin(fr / 40 + i) * 36;
        return <div key={i} style={{position: 'absolute', left: x, top: y, width: sz, height: sz, borderRadius: '50%', background: '#f3dcae', opacity: 0.1 + random(`o${i}`) * 0.25, filter: 'blur(1.2px)'}} />;
      })}
    </AbsoluteFill>
  );
};
const Vignette: React.FC = () => {
  const fr = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.62) 100%)'}} />
      <AbsoluteFill style={{background: `rgba(255,170,70,${0.05 + 0.035 * Math.sin(fr / 5) + 0.025 * Math.sin(fr / 2.3)})`, mixBlendMode: 'soft-light'}} />
    </AbsoluteFill>
  );
};
const Flash: React.FC = () => {
  const fr = useCurrentFrame();
  return <AbsoluteFill style={{background: '#ffe2b0', opacity: interpolate(fr, [0, 2, 9], [0, 0.55, 0], {extrapolateRight: 'clamp'}), pointerEvents: 'none'}} />;
};
const DipBlack: React.FC = () => {
  const fr = useCurrentFrame();
  return <AbsoluteFill style={{background: '#000', opacity: 0.8 * Math.sin(Math.PI * Math.min(1, fr / 24)), pointerEvents: 'none'}} />;
};

const renderOver = (o: Over) => {
  switch (o.k) {
    case 'kin': return <Kin o={o} />;
    case 'kin2': return <Kin2 o={o} />;
    case 'title': return <Title o={o} />;
    case 'big': return <Big o={o} />;
    case 'date': return <DateBig o={o} />;
    case 'tag': return <Tag o={o} />;
    case 'label': return <Label o={o} />;
    case 'map': return <MapOv />;
    case 'end': return <EndCard o={o} />;
    default: return null;
  }
};

export const Part1V2: React.FC = () => {
  const shots = edit.shots as Shot[];
  const over = edit.over as Over[];
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {shots.map((s, i) => {
        const T = i === 0 ? 0 : TR_LEN[s.tr] ?? 0;
        const a = f(s.t0) - T;
        return (
          <Sequence key={i} from={a} durationInFrames={f(s.t1) - f(s.t0) + T + 1}>
            <ShotView s={s} T={T} />
          </Sequence>
        );
      })}
      {over.filter((o) => o.k !== 'bars').map((o, i) => (
        <Sequence key={`o${i}`} from={f(o.t0)} durationInFrames={Math.max(1, f(o.t1) - f(o.t0))}>{renderOver(o)}</Sequence>
      ))}
      {shots.filter((s, i) => i > 0 && s.tr === 'flash').map((s, i) => (
        <Sequence key={`f${i}`} from={f(s.t0)} durationInFrames={10}><Flash /></Sequence>
      ))}
      {shots.filter((s, i) => i > 0 && s.tr === 'dip').map((s, i) => (
        <Sequence key={`d${i}`} from={f(s.t0) - 12} durationInFrames={24}><DipBlack /></Sequence>
      ))}
      <Dust />
      <Vignette />
      {over.filter((o) => o.k === 'bars').map((o, i) => (
        <Sequence key={`b${i}`} from={f(o.t0)} durationInFrames={f(o.t1) - f(o.t0)}><Bars d={f(o.t1) - f(o.t0)} /></Sequence>
      ))}
    </AbsoluteFill>
  );
};

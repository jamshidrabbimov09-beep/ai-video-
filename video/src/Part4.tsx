import React from 'react';
import {AbsoluteFill, Img, Sequence, interpolate, random, staticFile, useCurrentFrame} from 'remotion';
import edit from './edit_p4.json';
import {Line, Lands, Four, Horde, Line2, Tabriz, Invade} from './p4motion';
import {QuestionCard, SubscribeEnd} from './p4outro';

const FPS = 30;
const GOLD = '#d4af37';
const CREAM = '#f5ecd5';
const font = '"Liberation Serif", "DejaVu Serif", Georgia, serif';
export const PART4_FRAMES = Math.round(edit.end * FPS);
const f = (t: number) => Math.round(t * FPS);
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

type Mv = {z: [number, number]; x?: [number, number]; y?: [number, number]};
// slower, smaller moves than before
const MV: Record<string, Mv> = {
  in: {z: [1.07, 1.2]},
  inslow: {z: [1.06, 1.15]},
  in2: {z: [1.05, 1.24], y: [0, -1.5]},
  out: {z: [1.22, 1.07]},
  panL: {z: [1.18, 1.18], x: [3, -3]},
  panR: {z: [1.18, 1.18], x: [-3, 3]},
  up: {z: [1.16, 1.22], y: [3, -3]},
  drift: {z: [1.1, 1.16], x: [1, -1]},
  faceL: {z: [1.45, 1.55], x: [20, 23], y: [18, 20]},
  map: {z: [1.02, 1.1]},
  none: {z: [1, 1]},
};
const XF = 12; // soft cross-dissolve length (frames)

type Shot = {t0: number; t1: number; img: string | null; mv: string; tr: string; grade: string};
type Over = {k: string; t0: number; t1: number; text?: string; sub?: string; sub_t?: number};

const ShotView: React.FC<{s: Shot; T: number}> = ({s, T}) => {
  const fr = useCurrentFrame();
  const dur = Math.max(1, f(s.t1) - f(s.t0));
  const p = Math.min(1, Math.max(0, (fr - T) / dur));
  const m = MV[s.mv] || MV.in;
  const e = p * p * (3 - 2 * p) * 0.35 + p * 0.65;
  const z = lerp(m.z[0], m.z[1], e);
  const x = m.x ? lerp(m.x[0], m.x[1], e) : 0;
  const y = m.y ? lerp(m.y[0], m.y[1], e) : 0;
  const op = T > 0 ? Math.min(1, fr / T) : 1;
  if (s.img && s.img.startsWith('mo:')) {
    const d = f(s.t1) - f(s.t0) + T;
    const M: Record<string, React.FC<{d: number}>> = {line: Line, lands: Lands, four: Four, horde: Horde, line2: Line2, tabriz: Tabriz, invade: Invade};
    const C = M[s.img.slice(3)];
    return <AbsoluteFill style={{opacity: T > 0 ? Math.min(1, fr / T) : 1}}><C d={d} /></AbsoluteFill>;
  }
  const file = s.img ? `p4g/${s.grade}/l${s.img}.jpg` : null;
  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden', opacity: op}}>
      {file && <Img src={staticFile(file)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `translate(${x}%, ${y}%) scale(${z})`}} />}
    </AbsoluteFill>
  );
};

/* ---------- text ---------- */
const useFade = (d: number) => {
  const fr = useCurrentFrame();
  return Math.min(interpolate(fr, [0, 12], [0, 1], {extrapolateRight: 'clamp'}), interpolate(fr, [d - 10, d], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
};
const Rule: React.FC<{w?: number}> = ({w = 260}) => (
  <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, margin: '0 auto'}}>
    <div style={{width: w, height: 2, background: `linear-gradient(90deg, transparent, ${GOLD})`}} />
    <div style={{width: 12, height: 12, background: GOLD, transform: 'rotate(45deg)'}} />
    <div style={{width: w, height: 2, background: `linear-gradient(270deg, transparent, ${GOLD})`}} />
  </div>
);
const TopShade: React.FC<{o: number}> = ({o}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 760, background: `linear-gradient(180deg, rgba(0,0,0,${0.6 * o}), rgba(0,0,0,0))`}} />
);
const Shade: React.FC<{o: number; top?: number}> = ({o, top = 1000}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top, bottom: 0, background: `linear-gradient(180deg, rgba(0,0,0,0), rgba(0,0,0,${0.62 * o}))`}} />
);
const Cap: React.FC<{o: Over; d: number}> = ({o, d}) => {
  const fr = useCurrentFrame();
  const a = useFade(d);
  const rise = interpolate(fr, [0, 14], [18, 0], {extrapolateRight: 'clamp'});
  const subA = o.sub ? interpolate(fr, [f(o.sub_t ?? 0.4), f(o.sub_t ?? 0.4) + 12], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 0;
  return (
    <AbsoluteFill>
      <Shade o={a} />
      <div style={{position: 'absolute', left: 50, right: 50, top: 1395, textAlign: 'center', opacity: a, transform: `translateY(${rise}px)`}}>
        <Rule w={150} />
        <div style={{fontFamily: font, color: CREAM, fontSize: o.text && o.text.length > 22 ? 52 : 64, letterSpacing: 5, fontWeight: 700, lineHeight: 1.2, margin: '18px 0 8px', textShadow: '0 4px 24px #000, 0 0 40px rgba(0,0,0,.8)'}}>{o.text}</div>
        {o.sub && <div style={{fontFamily: font, fontStyle: 'italic', color: GOLD, fontSize: 46, letterSpacing: 3, opacity: subA, textShadow: '0 3px 16px #000'}}>{o.sub}</div>}
      </div>
    </AbsoluteFill>
  );
};
const DateCap: React.FC<{o: Over; d: number}> = ({o, d}) => {
  const fr = useCurrentFrame();
  const a = useFade(d);
  const subA = o.sub ? interpolate(fr, [f(o.sub_t ?? 0.4), f(o.sub_t ?? 0.4) + 12], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 0;
  return (
    <AbsoluteFill>
      <TopShade o={a} />
      <div style={{position: 'absolute', left: 50, right: 50, top: 230, textAlign: 'center', opacity: a}}>
        <div style={{fontFamily: font, color: GOLD, fontSize: 132, letterSpacing: 10, fontWeight: 700, lineHeight: 1, textShadow: '0 4px 30px #000, 0 0 60px #000'}}>{o.text}</div>
        <div style={{margin: '12px 0'}}><Rule w={170} /></div>
        {o.sub && <div style={{fontFamily: font, color: CREAM, fontSize: 48, letterSpacing: 14, opacity: subA, textShadow: '0 3px 16px #000'}}>{o.sub}</div>}
      </div>
    </AbsoluteFill>
  );
};
const Title: React.FC<{o: Over; d: number}> = ({o, d}) => {
  const fr = useCurrentFrame();
  const a = useFade(d);
  const sc = interpolate(fr, [0, 20], [1.08, 1], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill>
      <Shade o={a} top={1000} />
      <div style={{position: 'absolute', left: 30, right: 30, top: 1130, textAlign: 'center', opacity: a, transform: `scale(${sc})`}}>
        <div style={{fontFamily: font, color: GOLD, fontSize: (o.text || '').length > 12 ? 86 : 118, letterSpacing: (o.text || '').length > 12 ? 6 : 12, fontWeight: 700, textShadow: '0 4px 34px #000, 0 0 70px #000'}}>{o.text}</div>
        <div style={{marginTop: 14}}><Rule w={200} /></div>
        {o.sub && <div style={{fontFamily: font, fontStyle: 'italic', color: CREAM, fontSize: 50, letterSpacing: 3, marginTop: 14, opacity: interpolate(fr, [f(o.sub_t ?? 0.5), f(o.sub_t ?? 0.5) + 12], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}), textShadow: '0 3px 16px #000, 0 0 30px #000'}}>{o.sub}</div>}
      </div>
    </AbsoluteFill>
  );
};
const Mid: React.FC<{o: Over; d: number}> = ({o, d}) => {
  const a = useFade(d);
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
      <div style={{opacity: a, textAlign: 'center', padding: '0 70px'}}>
        <Rule w={170} />
        <div style={{fontFamily: font, color: CREAM, fontSize: 60, letterSpacing: 6, fontWeight: 700, lineHeight: 1.25, margin: '26px 0', textShadow: '0 4px 24px #000'}}>{o.text}</div>
        <Rule w={170} />
      </div>
    </AbsoluteFill>
  );
};
const Ask: React.FC<{o: Over; d: number}> = ({o, d}) => {
  const a = useFade(d);
  return (
    <AbsoluteFill>
      <Shade o={a} top={800} />
      <div style={{position: 'absolute', left: 60, right: 60, top: 1380, textAlign: 'center', opacity: a}}>
        <Rule w={150} />
        <div style={{fontFamily: font, color: CREAM, fontSize: 54, letterSpacing: 4, fontWeight: 700, lineHeight: 1.3, marginTop: 20, textShadow: '0 4px 24px #000, 0 0 40px #000'}}>{o.text}</div>
      </div>
    </AbsoluteFill>
  );
};
const Name: React.FC<{o: Over; d: number}> = ({o, d}) => {
  const fr = useCurrentFrame();
  const a = useFade(d);
  const subA = interpolate(fr, [f(o.sub_t ?? 0.5), f(o.sub_t ?? 0.5) + 12], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill>
      <TopShade o={a} />
      <div style={{position: 'absolute', left: 30, right: 30, top: 345, textAlign: 'center', opacity: a}}>
        <div style={{fontFamily: font, color: GOLD, fontSize: (o.text || '').length > 13 ? 80 : 92, letterSpacing: (o.text || '').length > 13 ? 5 : 8, fontWeight: 700, textShadow: '0 4px 30px #000, 0 0 60px #000'}}>{o.text}</div>
        <div style={{margin: '12px 0'}}><Rule w={190} /></div>
{o.sub && <div style={{fontFamily: font, fontStyle: 'italic', color: CREAM, fontSize: 56, letterSpacing: 3, opacity: subA, textShadow: '0 3px 16px #000'}}>{o.sub}</div>}
      </div>
    </AbsoluteFill>
  );
};
const HL = new Set(['temur', 'temurning', 'temurga', 'temurdan', "to'xtamish", "to'xtamishning", "to'xtamishni", "to'xtamishga", "o'rusxondan", "o'rusxonning", 'chingiz', 'chingizxon', "jo'chi", 'yazdiy', "o'tror", "sig'noq", 'dashti', 'qipchoq', 'oltin', "o'rdani", 'darband', 'tabrizni', 'kura', 'mironshoh', 'forsda', 'movarounnahrga', 'buxoroni', 'zanjirsaroyini', 'amudaryogacha', 'xon', 'xoni', 'xiyonatni']);
const Sub: React.FC<{o: Over; d: number}> = ({o, d}) => {
  const fr = useCurrentFrame();
  const a = Math.min(interpolate(fr, [0, 6], [0, 1], {extrapolateRight: 'clamp'}), interpolate(fr, [d - 5, d], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
  const words = (o.text || '').split(' ');
  return (
    <AbsoluteFill>
      <Shade o={a} top={1150} />
      <div style={{position: 'absolute', left: 70, right: 70, top: 1440, textAlign: 'center', opacity: a, fontFamily: font, fontSize: 56, fontWeight: 700, lineHeight: 1.25, letterSpacing: 1.5, color: CREAM, WebkitTextStroke: '5px rgba(0,0,0,0.6)', paintOrder: 'stroke fill', textShadow: '0 0 10px #000, 0 3px 18px #000, 0 0 34px rgba(0,0,0,.9)'}}>
        {words.map((w, i) => {
          const key = w.toLowerCase().replace(/[.,?!:]+$/g, '');
          return <span key={i} style={{color: HL.has(key) ? GOLD : CREAM}}>{w}{i < words.length - 1 ? ' ' : ''}</span>;
        })}
      </div>
    </AbsoluteFill>
  );
};
const Tag: React.FC<{o: Over}> = ({o}) => (
  <div style={{position: 'absolute', top: 190, left: 50, color: GOLD, fontFamily: font, fontSize: 38, letterSpacing: 8, border: `2px solid ${GOLD}`, padding: '8px 24px', background: 'rgba(0,0,0,0.45)'}}>{o.text}</div>
);
const Bars: React.FC<{d: number}> = ({d}) => {
  const fr = useCurrentFrame();
  const h = interpolate(fr, [0, 14, d - 14, d], [0, 150, 150, 0], {extrapolateRight: 'clamp', extrapolateLeft: 'clamp'});
  return <AbsoluteFill><div style={{position: 'absolute', top: 0, width: '100%', height: h, background: '#000'}} /><div style={{position: 'absolute', bottom: 0, width: '100%', height: h, background: '#000'}} /></AbsoluteFill>;
};

const MapOv: React.FC = () => {
  const fr = useCurrentFrame();
  const pts = [{n: 'SAMARQAND', x: 700, y: 760}, {n: 'KESH', x: 600, y: 1010}, {n: 'BALX', x: 470, y: 1290}];
  const draw = interpolate(fr, [14, 80], [0, 1], {extrapolateRight: 'clamp'});
  const pulse = 1 + 0.1 * Math.sin(fr / 7);
  const sweep = ((fr * 9) % 1500) - 200;
  const path = `M ${pts[1].x} ${pts[1].y} L ${pts[0].x} ${pts[0].y} M ${pts[1].x} ${pts[1].y} L ${pts[2].x} ${pts[2].y}`;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 55% 45%, rgba(255,235,180,0.30), rgba(255,235,180,0) 62%)'}} />
      <div style={{position: 'absolute', top: sweep, left: -100, width: 1300, height: 160, background: 'linear-gradient(180deg, rgba(255,240,200,0), rgba(255,240,200,0.10), rgba(255,240,200,0))', transform: 'rotate(-14deg)'}} />
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <circle cx={600} cy={1020} r={380 * pulse} fill="rgba(212,175,55,0.14)" stroke="#f0cf6a" strokeWidth={4} strokeDasharray="16 12" opacity={interpolate(fr, [0, 20], [0, 1], {extrapolateRight: 'clamp'})} />
        <path d={path} stroke="#2b1b05" strokeWidth={12} fill="none" pathLength={1} strokeDasharray={`${draw} 1`} opacity={0.55} />
        <path d={path} stroke="#ffd966" strokeWidth={7} fill="none" pathLength={1} strokeDasharray={`${draw} 1`} />
        {pts.map((p, i) => {
          const o = interpolate(fr, [16 + i * 14, 30 + i * 14], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
          return (
            <g key={p.n} opacity={o}>
              <circle cx={p.x} cy={p.y} r={44 * pulse} fill="rgba(255,217,102,0.25)" />
              <circle cx={p.x} cy={p.y} r={26} fill="none" stroke="#ffd966" strokeWidth={4} />
              <circle cx={p.x} cy={p.y} r={13} fill="#ffd966" />
              <rect x={p.x + 36} y={p.y - 30} width={p.n.length * 27 + 28} height={56} rx={8} fill="rgba(0,0,0,0.6)" />
              <text x={p.x + 50} y={p.y + 10} fill="#fff7dd" fontSize={40} fontFamily={font} letterSpacing={3}>{p.n}</text>
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
const EndCard: React.FC<{o: Over}> = ({o}) => {
  const fr = useCurrentFrame();
  const a = interpolate(fr, [0, 20], [0, 1], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: `rgba(0,0,0,${0.94 * a})`, justifyContent: 'center', alignItems: 'center'}}>
      <div style={{textAlign: 'center', fontFamily: font, opacity: a}}>
        <div style={{color: GOLD, fontSize: 88, letterSpacing: 10, fontWeight: 700}}>{o.text}</div>
        <div style={{margin: '28px 0'}}><Rule w={200} /></div>
        <div style={{color: CREAM, fontSize: 44, letterSpacing: 5}}>{o.sub}</div>
      </div>
    </AbsoluteFill>
  );
};

const Dust: React.FC = () => {
  const fr = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {Array.from({length: 22}, (_, i) => {
        const sz = 3 + random(`s${i}`) * 5;
        const sp = 0.2 + random(`v${i}`) * 0.5;
        const y = ((random(`y${i}`) * 2300 - fr * sp * 2.0) % 2300 + 2300) % 2300 - 190;
        const x = random(`x${i}`) * 1080 + Math.sin(fr / 45 + i) * 30;
        return <div key={i} style={{position: 'absolute', left: x, top: y, width: sz, height: sz, borderRadius: '50%', background: '#f3dcae', opacity: 0.1 + random(`o${i}`) * 0.2}} />;
      })}
    </AbsoluteFill>
  );
};
const Vignette: React.FC = () => (
  <AbsoluteFill style={{pointerEvents: 'none', background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)'}} />
);
const DipBlack: React.FC = () => {
  const fr = useCurrentFrame();
  return <AbsoluteFill style={{background: '#000', opacity: 0.85 * Math.sin(Math.PI * Math.min(1, fr / 30)), pointerEvents: 'none'}} />;
};

const renderOver = (o: Over) => {
  const d = Math.max(1, f(o.t1) - f(o.t0));
  switch (o.k) {
    case 'sub': return <Sub o={o} d={d} />;
    case 'name': return <Name o={o} d={d} />;
    case 'cap': return <Cap o={o} d={d} />;
    case 'date': return <DateCap o={o} d={d} />;
    case 'title': return <Title o={o} d={d} />;
    case 'mid': return <Mid o={o} d={d} />;
    case 'ask': return <Ask o={o} d={d} />;
    case 'q': return <QuestionCard d={d} pop={(o as any).pop} v="C" />;
    case 'subend': return <SubscribeEnd d={d} />;
    case 'tag': return <Tag o={o} />;
    case 'map': return <MapOv />;
    case 'end': return <EndCard o={o} />;
    default: return null;
  }
};

export const Part4: React.FC = () => {
  const shots = edit.shots as Shot[];
  const over = edit.over as Over[];
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {shots.map((s, i) => {
        const T = i === 0 ? 0 : XF;
        return (
          <Sequence key={i} from={f(s.t0) - T} durationInFrames={f(s.t1) - f(s.t0) + T + 1}>
            <ShotView s={s} T={T} />
          </Sequence>
        );
      })}
      {shots.filter((s, i) => i > 0 && s.tr === 'dip').map((s, i) => (
        <Sequence key={`d${i}`} from={f(s.t0) - 15} durationInFrames={30}><DipBlack /></Sequence>
      ))}
      <Dust />
      <Vignette />
      {over.filter((o) => o.k !== 'bars').map((o, i) => (
        <Sequence key={`o${i}`} from={f(o.t0)} durationInFrames={Math.max(1, f(o.t1) - f(o.t0))}>{renderOver(o)}</Sequence>
      ))}
      {over.filter((o) => o.k === 'bars').map((o, i) => (
        <Sequence key={`b${i}`} from={f(o.t0)} durationInFrames={f(o.t1) - f(o.t0)}><Bars d={f(o.t1) - f(o.t0)} /></Sequence>
      ))}
    </AbsoluteFill>
  );
};

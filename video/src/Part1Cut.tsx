import React from 'react';
import {AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, random, staticFile, useCurrentFrame} from 'remotion';

const FPS = 30;
const PRE = 7; // crossfade overlap (frames)
const GOLD = '#d4af37';
const font = '"Liberation Serif", "DejaVu Serif", Georgia, serif';

const order = ['A', 'B', 'C', 'D', 'E', 'F'] as const;
type B = (typeof order)[number];
const lens: Record<B, number> = {A: 13.244, B: 21.316, C: 17.711, D: 21.002, E: 22.282, F: 20.271};
const GAP = 0.4;
const start: Record<B, number> = {A: 0, B: 0, C: 0, D: 0, E: 0, F: 0};
let t0 = 0;
for (const k of order) { start[k] = t0; t0 += lens[k] + GAP; }
export const PART1_CUT_FRAMES = Math.ceil((t0 - GAP) * FPS) + 6;
const fr = (b: B, s: number) => Math.round((start[b] + s) * FPS);

type Motion = {s0: number; s1: number; x0?: number; x1?: number; y0?: number; y1?: number; shake?: number; blur?: boolean};
const M = (s0: number, s1: number, x0 = 0, x1 = 0, y0 = 0, y1 = 0, extra: Partial<Motion> = {}): Motion => ({s0, s1, x0, x1, y0, y1, ...extra});

const Fade: React.FC<{children: React.ReactNode; first?: boolean}> = ({children, first}) => {
  const f = useCurrentFrame();
  const o = first ? 1 : interpolate(f, [0, PRE], [0, 1], {extrapolateRight: 'clamp'});
  return <AbsoluteFill style={{opacity: o}}>{children}</AbsoluteFill>;
};

const ImageShot: React.FC<{n: string; dur: number; m: Motion}> = ({n, dur, m}) => {
  const f = useCurrentFrame();
  const p = Math.min(1, f / Math.max(1, dur));
  const e = p * p * (3 - 2 * p) * 0.35 + p * 0.65; // gentle ease
  const s = m.s0 + (m.s1 - m.s0) * e;
  const x = (m.x0 ?? 0) + ((m.x1 ?? 0) - (m.x0 ?? 0)) * e;
  const y = (m.y0 ?? 0) + ((m.y1 ?? 0) - (m.y0 ?? 0)) * e;
  const sh = m.shake ?? 0;
  const sx = sh ? (random(`sx${f}`) - 0.5) * sh : 0;
  const sy = sh ? (random(`sy${f}`) - 0.5) * sh : 0;
  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      <Img src={staticFile(`p1img/i${n}.jpg`)} style={{
        width: '100%', height: '100%', objectFit: 'cover',
        transform: `translate(${x + sx}%, ${y + sy}%) scale(${s})`,
        filter: m.blur ? 'blur(14px) brightness(0.45)' : 'contrast(1.07) saturate(1.04)',
      }} />
    </AbsoluteFill>
  );
};

const ClipShot: React.FC<{file: string; from: number; dur: number; rate?: number; zoom?: number}> = ({file, from, dur, rate = 1, zoom = 1.0}) => {
  const f = useCurrentFrame();
  const sc = 1 + (zoom - 1) * Math.min(1, f / Math.max(1, dur));
  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      <div style={{width: '100%', height: '100%', transform: `scale(${sc})`}}>
        <OffthreadVideo src={staticFile(`clips/${file}`)} startFrom={Math.round(from * FPS)} playbackRate={rate} volume={0.12}
          style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'contrast(1.07) saturate(1.04)'}} />
      </div>
    </AbsoluteFill>
  );
};

const TextCard: React.FC<{big: string; small?: string}> = ({big, small}) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 10], [0, 1], {extrapolateRight: 'clamp'});
  const sc = interpolate(f, [0, 14], [1.12, 1], {extrapolateRight: 'clamp'});
  const w = interpolate(f, [6, 34], [0, 100], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: 'rgba(0,0,0,0.62)', justifyContent: 'center', alignItems: 'center'}}>
      <div style={{opacity: o, transform: `scale(${sc})`, textAlign: 'center', fontFamily: font, padding: '0 50px'}}>
        <div style={{color: GOLD, fontSize: 118, letterSpacing: 6, lineHeight: 1.15, fontWeight: 700, textShadow: '0 6px 40px #000'}}>{big}</div>
        <div style={{width: `${w}%`, height: 3, background: GOLD, margin: '26px auto'}} />
        {small && <div style={{color: '#efe3c4', fontSize: 54, letterSpacing: 8, textShadow: '0 4px 24px #000'}}>{small}</div>}
      </div>
    </AbsoluteFill>
  );
};

const DateTag: React.FC<{big: string; small?: string; top?: number; size?: number}> = ({big, small, top = 250, size = 170}) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 12], [0, 1], {extrapolateRight: 'clamp'});
  const sc = interpolate(f, [0, 16], [1.15, 1], {extrapolateRight: 'clamp'});
  return (
    <div style={{position: 'absolute', top, width: '100%', textAlign: 'center', fontFamily: font, opacity: o, transform: `scale(${sc})`, textShadow: '0 4px 30px #000, 0 0 60px #000'}}>
      <div style={{color: GOLD, fontSize: size, letterSpacing: 6, fontWeight: 700}}>{big}</div>
      {small && <div style={{color: '#fff', fontSize: 58, letterSpacing: 14, marginTop: 4}}>{small}</div>}
    </div>
  );
};

const Kinetic: React.FC<{text: string; top?: number; size?: number}> = ({text, top = 300, size = 80}) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 9], [0, 1], {extrapolateRight: 'clamp'});
  const y = interpolate(f, [0, 9], [26, 0], {extrapolateRight: 'clamp'});
  return (
    <div style={{position: 'absolute', top, left: 40, right: 40, textAlign: 'center', fontFamily: font, color: '#fff', fontSize: size, letterSpacing: 3,
      fontWeight: 700, opacity: o, transform: `translateY(${y}px)`, textShadow: '0 6px 30px #000, 0 0 50px #000'}}>{text}</div>
  );
};

const Tag: React.FC<{text: string}> = ({text}) => (
  <div style={{position: 'absolute', top: 200, left: 50, color: GOLD, fontFamily: font, fontSize: 40, letterSpacing: 8,
    border: `2px solid ${GOLD}`, padding: '8px 24px', background: 'rgba(0,0,0,0.4)'}}>{text}</div>
);

const Label: React.FC<{text: string}> = ({text}) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 10], [0, 0.85], {extrapolateRight: 'clamp'});
  return <div style={{position: 'absolute', bottom: 300, width: '100%', textAlign: 'center', fontFamily: font, fontSize: 30, letterSpacing: 3, color: '#e8dcc0', opacity: o, textShadow: '0 2px 12px #000'}}>{text}</div>;
};

const Dust: React.FC = () => {
  const f = useCurrentFrame();
  const parts = Array.from({length: 34}, (_, i) => i);
  return (
    <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'screen'}}>
      {parts.map((i) => {
        const sz = 3 + random(`s${i}`) * 6;
        const x0 = random(`x${i}`) * 1080;
        const sp = 0.25 + random(`v${i}`) * 0.7;
        const y = ((random(`y${i}`) * 2300 - f * sp * 2.2) % 2300 + 2300) % 2300 - 190;
        const x = x0 + Math.sin(f / 40 + i) * 36;
        const o = 0.12 + random(`o${i}`) * 0.28;
        return <div key={i} style={{position: 'absolute', left: x, top: y, width: sz, height: sz, borderRadius: '50%', background: '#f3dcae', opacity: o, filter: 'blur(1.2px)'}} />;
      })}
    </AbsoluteFill>
  );
};

const Vignette: React.FC = () => {
  const f = useCurrentFrame();
  const flick = 0.04 * Math.sin(f / 5) + 0.03 * Math.sin(f / 2.3);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 52%, rgba(0,0,0,0.6) 100%)'}} />
      <AbsoluteFill style={{background: `rgba(255,170,70,${0.05 + flick})`, mixBlendMode: 'soft-light'}} />
    </AbsoluteFill>
  );
};

const Flash: React.FC = () => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{background: '#fff', opacity: interpolate(f, [0, 2, 8], [0, 0.4, 0], {extrapolateRight: 'clamp'}), pointerEvents: 'none'}} />;
};

type Over = {from: number; to: number; node: React.ReactNode};
type S = {b: B; from: number; to: number; node: (d: number) => React.ReactNode; over?: Over[]};

const img = (n: string, m: Motion) => (d: number) => <ImageShot n={n} dur={d} m={m} />;

const shots: S[] = [
  // ---------- A ----------
  {b: 'A', from: 0, to: 4.8, node: (d) => <ClipShot file="c1.mp4" from={2.0} dur={d} />, over: [
    {from: 0.2, to: 3.6, node: <Label text="Dramatizatsiya · AI yordamida yaratilgan tasvirlar" />},
    {from: 2.0, to: 4.7, node: <Kinetic text="NA XON" top={260} />},
  ]},
  {b: 'A', from: 4.8, to: 8.7, node: img('03', M(1.12, 1.26, 1.5, -1.5, 0, -2)), over: [
    {from: 5.2, to: 8.6, node: <Kinetic text="NA CHINGIZ AVLODI" top={260} size={70} />},
  ]},
  {b: 'A', from: 8.7, to: 10.5, node: img('04', M(1.1, 1.3, 0, 0, 0, -2)), over: [
    {from: 8.7, to: 10.5, node: <TextCard big="AMIR TEMUR" />},
  ]},
  {b: 'A', from: 10.5, to: 13.7, node: img('05', M(1.08, 1.3, 2, -1, 1, -1)), over: [
    {from: 11.0, to: 13.6, node: <Kinetic text="BIR JAROHAT" top={260} size={90} />},
  ]},
  // ---------- B ----------
  {b: 'B', from: 0, to: 3.3, node: img('06', M(1.12, 1.26, -1.5, 1.5, 0, 0, {shake: 0.5})), over: [
    {from: 0, to: 3.3, node: <DateTag big="1363" small="SEISTON" />},
  ]},
  {b: 'B', from: 3.3, to: 6.0, node: (d) => <ClipShot file="c2.mp4" from={0.5} dur={d} zoom={1.08} />},
  {b: 'B', from: 6.0, to: 8.8, node: (d) => <ClipShot file="c2.mp4" from={5.1} dur={d} zoom={1.06} />},
  {b: 'B', from: 8.8, to: 10.95, node: img('08', M(1.1, 1.3, 2, -2, 0, 0))},
  {b: 'B', from: 10.95, to: 15.4, node: img('09', M(1.1, 1.28, 0, 0, 1, -1)), over: [
    {from: 10.95, to: 15.4, node: <TextCard big="TEMUR-I LANG" small="CHO'LOQ TEMUR" />},
  ]},
  {b: 'B', from: 15.4, to: 18.8, node: img('11', M(1.08, 1.28, -2, 2, 0, -1))},
  {b: 'B', from: 18.8, to: 21.8, node: img('10', M(1.3, 1.1, 0, 0, 1, 1))},
  // ---------- C ----------
  {b: 'C', from: 0, to: 3.7, node: img('12', M(1.08, 1.25, 2, -2, 1, 0)), over: [
    {from: 0, to: 3.7, node: <DateTag big="1336" small="KESH" />},
  ]},
  {b: 'C', from: 3.7, to: 6.3, node: img('13', M(1.1, 1.26, -2, 1, 0, 1))},
  {b: 'C', from: 6.3, to: 8.6, node: img('14', M(1.28, 1.08, 1, -1, 0, 0))},
  {b: 'C', from: 8.6, to: 11.1, node: img('15', M(1.08, 1.28, 0, 0, 2, -1))},
  {b: 'C', from: 11.1, to: 14.6, node: img('16', M(1.06, 1.26, -2, 2, 0, 0)), over: [
    {from: 11.2, to: 14.5, node: <Kinetic text="SANA MANBALARDA TURLICHA" top={260} size={62} />},
  ]},
  {b: 'C', from: 14.6, to: 18.1, node: img('20', M(1.08, 1.25, 2, -2, -1, 1))},
  // ---------- D ----------
  {b: 'D', from: 0, to: 4.3, node: img('17', M(1.08, 1.26, -2, 2, 0, 0)), over: [{from: 0, to: 4.3, node: <Tag text="RIVOYAT" />}]},
  {b: 'D', from: 4.3, to: 8.7, node: img('18', M(1.1, 1.28, 2, -1, 0, 1)), over: [{from: 4.3, to: 8.7, node: <Tag text="RIVOYAT" />}]},
  {b: 'D', from: 8.7, to: 12.2, node: img('19', M(1.1, 1.18, 0, 0, 0, 0, {blur: true})), over: [
    {from: 8.7, to: 12.2, node: <Tag text="RIVOYAT" />},
    {from: 9.0, to: 12.1, node: <Kinetic text="RIVOYAT HALI TARIX EMAS" top={820} size={66} />},
  ]},
  {b: 'D', from: 12.2, to: 15.0, node: img('20', M(1.25, 1.06, -2, 2, 1, -1))},
  {b: 'D', from: 15.0, to: 18.0, node: img('21', M(1.08, 1.26, 2, -2, 0, 0))},
  {b: 'D', from: 18.0, to: 21.4, node: (d) => <ClipShot file="c7a.mp4" from={0} dur={d} zoom={1.05} />},
  // ---------- E ----------
  {b: 'E', from: 0, to: 4.8, node: (d) => <ClipShot file="c7b.mp4" from={3.3} dur={d} rate={0.98} zoom={1.05} />, over: [
    {from: 0, to: 2.6, node: <DateTag big="1360" size={150} />},
  ]},
  {b: 'E', from: 4.8, to: 7.0, node: img('25', M(1.06, 1.24, 1, -1, 0, 0))},
  {b: 'E', from: 7.0, to: 10.9, node: img('26', M(1.1, 1.28, 0, 0, 2, -2))},
  {b: 'E', from: 10.9, to: 13.5, node: img('27', M(1.06, 1.22, -2, 1, 0, 0))},
  {b: 'E', from: 13.5, to: 16.7, node: img('27', M(1.5, 1.28, 6, 2, -4, -2))},
  {b: 'E', from: 16.7, to: 19.7, node: img('28', M(1.08, 1.26, 3, -3, 0, 0))},
  {b: 'E', from: 19.7, to: 22.7, node: img('28', M(1.4, 1.2, -4, 0, 0, 0))},
  // ---------- F ----------
  {b: 'F', from: 0, to: 4.9, node: img('29', M(1.08, 1.28, 2, -2, 1, -1))},
  {b: 'F', from: 4.9, to: 7.8, node: img('30', M(1.08, 1.26, -2, 2, 0, -2))},
  {b: 'F', from: 7.8, to: 11.2, node: img('31', M(1.1, 1.28, 1, -2, -1, 1))},
  {b: 'F', from: 11.2, to: 15.4, node: img('27', M(1.2, 1.4, 3, -4, -2, 2)), over: [
    {from: 11.4, to: 15.3, node: <Kinetic text="BU ITTIFOQ..." top={260} size={78} />},
  ]},
  {b: 'F', from: 15.4, to: 18.8, node: img('32', M(1.05, 1.3, 0, 0, 0, 0)), over: [
    {from: 15.6, to: 18.7, node: <Kinetic text="DO'ST DUSHMANGA AYLANSA?" top={260} size={62} />},
  ]},
  {b: 'F', from: 18.8, to: 20.8, node: img('33', M(1.05, 1.18, 0, 0, 0, 0)), over: [
    {from: 18.8, to: 20.8, node: <DateTag big="KEYINGI QISMDA" small="@unutilgan_qissalar" top={1180} size={66} />},
  ]},
];

// impact moments: [block, seconds]
const flashes: [B, number][] = [['A', 8.7], ['B', 0], ['B', 10.95], ['C', 0], ['F', 18.8]];
const whooshes: [B, number][] = [['A', 4.6], ['D', 17.7], ['E', 3.8], ['F', 11.0]];

export const Part1Cut: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    {order.map((k) => (
      <Sequence key={k} from={fr(k, 0)} durationInFrames={Math.ceil(lens[k] * FPS) + 2}>
        <Audio src={staticFile(`audio/${k}.mp3`)} volume={1} />
      </Sequence>
    ))}
    <Audio src={staticFile('audio/bed.mp3')} volume={0.5} />
    {flashes.map(([b, s], i) => (
      <Sequence key={`t${i}`} from={fr(b, s)} durationInFrames={50}><Audio src={staticFile('audio/thud.mp3')} volume={0.55} /></Sequence>
    ))}
    {whooshes.map(([b, s], i) => (
      <Sequence key={`w${i}`} from={fr(b, s)} durationInFrames={40}><Audio src={staticFile('audio/whoosh.mp3')} volume={0.5} /></Sequence>
    ))}
    {shots.map((s, i) => {
      const first = i === 0;
      const pre = first ? 0 : PRE;
      const from = fr(s.b, s.from) - pre;
      const dur = fr(s.b, s.to) - fr(s.b, s.from);
      return (
        <Sequence key={i} from={from} durationInFrames={dur + pre + 1}>
          <Fade first={first}>{s.node(dur + pre)}</Fade>
          {(s.over || []).map((o, j) => (
            <Sequence key={j} from={Math.round((o.from - s.from) * FPS) + pre} durationInFrames={Math.round((o.to - o.from) * FPS)}>
              {o.node}
            </Sequence>
          ))}
        </Sequence>
      );
    })}
    {flashes.map(([b, s], i) => (
      <Sequence key={`f${i}`} from={fr(b, s)} durationInFrames={10}><Flash /></Sequence>
    ))}
    <Dust />
    <Vignette />
  </AbsoluteFill>
);

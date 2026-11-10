import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';

const FPS = 30;
const GOLD = '#d4af37';
const font = 'Georgia, "Times New Roman", serif';
const GAP = 0.4;
const lens: Record<string, number> = {A: 13.244, B: 21.316, C: 17.711, D: 21.002, E: 22.282, F: 20.271};
const order = ['A', 'B', 'C', 'D', 'E', 'F'];
const start: Record<string, number> = {};
let t0 = 0;
for (const k of order) { start[k] = t0; t0 += lens[k] + GAP; }
export const PART1_FRAMES = Math.ceil((t0 - GAP) * FPS);
const fr = (b: string, s: number) => Math.round((start[b] + s) * FPS);

const Fade: React.FC<{children: React.ReactNode}> = ({children}) => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{opacity: interpolate(f, [0, 8], [0, 1], {extrapolateRight: 'clamp'})}}>{children}</AbsoluteFill>;
};

const ImageShot: React.FC<{src: string; dur: number; dir?: 1 | -1; px?: number}> = ({src, dur, dir = 1, px = 0}) => {
  const f = useCurrentFrame();
  const p = f / dur;
  const sc = dir === 1 ? 1.04 + 0.14 * p : 1.18 - 0.14 * p;
  return (
    <Fade>
      <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
        <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover',
          transform: `scale(${sc}) translateX(${px * p}px)`}} />
        <AbsoluteFill style={{background: 'linear-gradient(transparent 60%, rgba(0,0,0,0.55))'}} />
      </AbsoluteFill>
    </Fade>
  );
};

const Placeholder: React.FC<{label: string; sub?: string}> = ({label, sub}) => {
  const f = useCurrentFrame();
  const z = 1 + f / 3000;
  return (
    <Fade>
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 35%, #3a2a12, #0b0b0b 70%)', justifyContent: 'center', alignItems: 'center'}}>
        <div style={{transform: `scale(${z})`, textAlign: 'center', fontFamily: font, border: '3px dashed #6b5a33', padding: '60px 50px', margin: 60}}>
          <div style={{color: '#8a7a55', fontSize: 40, letterSpacing: 6}}>[ RASM KERAK ]</div>
          <div style={{color: '#e8dcc0', fontSize: 56, marginTop: 24, lineHeight: 1.3}}>{label}</div>
          {sub && <div style={{color: '#8a7a55', fontSize: 34, marginTop: 16}}>{sub}</div>}
        </div>
      </AbsoluteFill>
    </Fade>
  );
};

const TextCard: React.FC<{big: string; small?: string}> = ({big, small}) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 14], [0, 1], {extrapolateRight: 'clamp'});
  const w = interpolate(f, [8, 40], [0, 100], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 40%, #2a1d0a, #0b0b0b 70%)', justifyContent: 'center', alignItems: 'center'}}>
      <div style={{opacity: o, textAlign: 'center', fontFamily: font, padding: '0 50px'}}>
        <div style={{color: GOLD, fontSize: 120, letterSpacing: 6, lineHeight: 1.15}}>{big}</div>
        <div style={{width: `${w}%`, height: 3, background: GOLD, margin: '28px auto'}} />
        {small && <div style={{color: '#e8dcc0', fontSize: 58, letterSpacing: 8}}>{small}</div>}
      </div>
    </AbsoluteFill>
  );
};

const Kinetic: React.FC<{text: string; top?: number; size?: number}> = ({text, top = 300, size = 96}) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 10], [0, 1], {extrapolateRight: 'clamp'});
  const y = interpolate(f, [0, 10], [30, 0], {extrapolateRight: 'clamp'});
  return (
    <div style={{position: 'absolute', top, left: 40, right: 40, textAlign: 'center', fontFamily: font, color: '#fff', fontSize: size,
      letterSpacing: 4, opacity: o, transform: `translateY(${y}px)`, textShadow: '0 6px 30px #000', fontWeight: 700}}>{text}</div>
  );
};

const Tag: React.FC<{text: string}> = ({text}) => (
  <div style={{position: 'absolute', top: 110, left: 50, color: GOLD, fontFamily: font, fontSize: 42, letterSpacing: 8,
    border: `2px solid ${GOLD}`, padding: '8px 24px', background: 'rgba(0,0,0,0.35)'}}>{text}</div>
);

const DateTag: React.FC<{big: string; small: string}> = ({big, small}) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 12], [0, 1], {extrapolateRight: 'clamp'});
  return (
    <div style={{position: 'absolute', top: 160, width: '100%', textAlign: 'center', fontFamily: font, opacity: o, textShadow: '0 4px 24px #000'}}>
      <div style={{color: GOLD, fontSize: 170, letterSpacing: 6}}>{big}</div>
      <div style={{color: '#fff', fontSize: 60, letterSpacing: 14}}>{small}</div>
    </div>
  );
};

type S = {b: string; from: number; to: number; node: (d: number) => React.ReactNode; over?: {from: number; to: number; node: React.ReactNode}[]};
const BATTLE = 'part1/img_battle.jpg', WOUND = 'part1/img_wounded.jpg', RIDER = 'part1/img_rider.jpg';

const shots: S[] = [
  // A
  {b: 'A', from: 0, to: 8.7, node: (d) => <ImageShot src={RIDER} dur={d} />, over: [
    {from: 2.3, to: 4.9, node: <Kinetic text="NA XON" top={260} />},
    {from: 3.3, to: 4.9, node: <Kinetic text="NA CHINGIZ AVLODI" top={400} size={80} />},
    {from: 5.3, to: 8.7, node: <Kinetic text="XONLARNI TAXTGA O'TQAZDI" top={300} size={80} />},
  ]},
  {b: 'A', from: 8.7, to: 10.9, node: () => <TextCard big="AMIR TEMUR" />},
  {b: 'A', from: 10.9, to: 13.7, node: (d) => <ImageShot src={WOUND} dur={d} />},
  // B
  {b: 'B', from: 0, to: 8.8, node: (d) => <ImageShot src={BATTLE} dur={d} dir={1} px={-30} />, over: [
    {from: 0, to: 3.3, node: <DateTag big="1363" small="SEISTON" />},
  ]},
  {b: 'B', from: 8.8, to: 15.4, node: (d) => <ImageShot src={WOUND} dur={d} dir={-1} />},
  {b: 'B', from: 15.4, to: 18.8, node: () => <TextCard big="TEMUR-I LANG" small="CHO'LOQ TEMUR" />},
  {b: 'B', from: 18.8, to: 21.7, node: (d) => <ImageShot src={RIDER} dur={d} dir={-1} />},
  // C
  {b: 'C', from: 0, to: 11.1, node: () => <TextCard big="1336" small="KESH · SHAHRISABZ YAQINIDA" />},
  {b: 'C', from: 11.1, to: 18.1, node: () => <TextCard big="SANA" small="MANBALARDA TURLICHA" />},
  // D
  {b: 'D', from: 0, to: 8.7, node: () => <><Placeholder label="Qo'y boqayotgan bolalar" sub="rivoyat sahnasi" /><Tag text="RIVOYAT" /></>},
  {b: 'D', from: 8.7, to: 21.4, node: () => <Placeholder label="Parchalangan Movarounnahr" sub="xarita yoki mo'g'ul xonlari kengashi" />},
  // E
  {b: 'E', from: 0, to: 10.9, node: () => <><Placeholder label="Tug'luq Temur lashkari" sub="1360" /></>},
  {b: 'E', from: 10.9, to: 22.7, node: () => <Placeholder label="Temur va Amir Husayn" sub="ikki otliq, ittifoq" />},
  // F
  {b: 'F', from: 0, to: 7.8, node: (d) => <ImageShot src={BATTLE} dur={d} dir={-1} px={30} />},
  {b: 'F', from: 7.8, to: 15.4, node: (d) => <ImageShot src={WOUND} dur={d} />},
  {b: 'F', from: 15.4, to: 20.3, node: (d) => <ImageShot src={RIDER} dur={d} dir={1} />, over: [
    {from: 17.2, to: 20.3, node: <Kinetic text="KEYINGI QISMDA" top={1500} size={74} />},
  ]},
];

export const Part1Rough: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    {order.map((k) => (
      <Sequence key={k} from={fr(k, 0)} durationInFrames={Math.ceil(lens[k] * FPS) + 2}>
        <Audio src={staticFile(`audio/${k}.mp3`)} />
      </Sequence>
    ))}
    {shots.map((s, i) => {
      const from = fr(s.b, s.from);
      const dur = fr(s.b, s.to) - from;
      return (
        <Sequence key={i} from={from} durationInFrames={dur}>
          {s.node(dur)}
          {(s.over || []).map((o, j) => (
            <Sequence key={j} from={Math.round((o.from - s.from) * FPS)} durationInFrames={Math.round((o.to - o.from) * FPS)}>
              {o.node}
            </Sequence>
          ))}
        </Sequence>
      );
    })}
  </AbsoluteFill>
);

import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, Sequence, staticFile, useCurrentFrame, Easing} from 'remotion';
import {Grain, Rain, Vignette} from './NoirTest';

const FPS = 30;
export const T94D_SECONDS = 69;
export const T94D_FRAMES = T94D_SECONDS * FPS;

type Blur = [number, number, number, number]; // x0,y0,x1,y1 fractions
type Shot = {
  img: string; t0: number; t1: number;
  from: [number, number, number]; // scale, x%, y%
  to: [number, number, number];
  rain?: number; shake?: number; flicker?: boolean; blur?: Blur[];
}// times in seconds (voice timeline)
const SHOTS: Shot[] = [
  {img: '01', t0: 0, t1: 5.8, from: [1.04, 0, 0], to: [1.16, 3, 2]},
  {img: '02', t0: 5.8, t1: 11.9, from: [1.04, 0, 0], to: [1.2, 2, -3]},
  {img: '03', t0: 11.9, t1: 16.2, from: [1.04, 0, 0], to: [1.22, 2, 4]},
  {img: '04', t0: 16.2, t1: 22.1, from: [1.02, 0, 0], to: [1.3, 0, 4]},
  {img: '05', t0: 22.1, t1: 26.9, from: [1.04, 0, 0], to: [1.2, 0, -3]},
  {img: '06', t0: 26.9, t1: 32.6, from: [1.04, 0, 0], to: [1.25, 0, 3]},
  {img: '07', t0: 32.6, t1: 35.9, from: [1.04, 0, 0], to: [1.16, 0, 0], blur: [[0.475, 0.612, 0.575, 0.638]]},
  {img: '08', t0: 35.9, t1: 38.8, from: [1.04, 0, 0], to: [1.14, -2, 0]},
  {img: '09', t0: 38.8, t1: 44.7, from: [1.2, 0, 3], to: [1.04, 0, 0]},
  {img: '10', t0: 44.7, t1: 47.5, from: [1.04, 0, 0], to: [1.2, 0, 0]},
  {img: '11', t0: 47.5, t1: 51.7, from: [2.4, -12, -38], to: [2.0, -10, -32]},
  {img: '12', t0: 51.7, t1: 56.4, from: [1.02, 0, 0], to: [1.28, 0, 8]},
  {img: '13', t0: 56.4, t1: 59.7, from: [1.04, 0, 0], to: [1.18, 2, 2]},
  {img: '14', t0: 59.7, t1: T94D_SECONDS, from: [1.04, 0, -2], to: [1.32, 0, -6]},
];

const SUBS: [number, number, string][] = [
  [0.0, 2.1, 'Jasurni ichkariga kiritdim.'],
  [2.2, 4.5, "Oshxonada o'tirdik. Choy quydim."],
  [4.6, 5.8, 'Qo\'lim titrardi.'],
  [5.9, 8.8, "«Rustamni bilasan. Mashinangda o'lgan odam.»"],
  [9.0, 11.9, '«U mening odamim edi. Hoji akaning ichida.»'],
  [12.0, 16.2, "«Bu kalit vokzaldagi saqlash qutisini ochadi. O'n to'rtinchi quti.»"],
  [16.3, 18.2, '«Ichida Hoji akaning daftari bor.»'],
  [18.3, 22.1, '«Kimga pul bergani. Qaysi militsionerga. Qaysi boshliqqa.»'],
  [22.2, 24.1, '«Soat oltida ular keladi», dedim.'],
  [24.2, 26.8, '«Kalitni bermasam, onam...»'],
  [26.9, 29.4, '«Berasan», dedi Jasur. «Lekin boshqa kalitni.»'],
  [29.5, 32.6, "U cho'ntagidan aynan shunday eski kalit chiqardi."],
  [32.7, 35.9, 'Soat oltida qora mashina keldi. Kalitni uzatdim.'],
  [36.0, 37.6, "Bu safar qo'lim titramadi."],
  [37.7, 40.4, "Mashina ketdi. Biz vokzalga yo'l oldik."],
  [40.6, 44.6, "Ertalabki vokzal. Bo'm-bo'sh. Faqat poyezdlar ovozi."],
  [44.8, 47.4, "O'n to'rtinchi quti. Kalit qulfga kirdi."],
  [47.6, 49.8, "Ochdim. Ichida daftar yo'q edi."],
  [49.9, 51.7, 'Faqat bitta eski surat.'],
  [51.8, 53.6, 'Suratda yosh Hoji aka.'],
  [53.7, 56.4, 'Yonida esa... Jasur. Kulib turibdi.'],
  [56.5, 59.6, "Orqamda qurolning shiqillagan ovozini eshitdim."],
  [59.8, 62.9, "«Sardor... sen buni ko'rmasliging kerak edi.»"],
];

const STAMPS: [number, number, string][] = [];
const Stamp: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const cur = STAMPS.find(([a, b]) => t >= a && t < b);
  if (!cur) return null;
  const [a, b, txt] = cur;
  const o = Math.min(interpolate(t, [a, a + 0.25], [0, 1], {extrapolateRight: 'clamp'}), interpolate(t, [b - 0.25, b], [1, 0], {extrapolateLeft: 'clamp'}));
  return (
    <AbsoluteFill style={{alignItems: 'center', top: 250, opacity: o}}>
      <div style={{fontFamily: 'Liberation Mono, monospace', color: '#e8dcc0', fontSize: 120, fontWeight: 700, letterSpacing: 10,
        textShadow: '0 0 30px rgba(0,0,0,0.95)'}}>{txt}</div>
    </AbsoluteFill>
  );
};

const XF = 0.35; // crossfade seconds

const ShotView: React.FC<{s: Shot; next?: Shot}> = ({s}) => {
  const f = useCurrentFrame();
  const t = f / FPS + s.t0;
  const dur = s.t1 - s.t0 + XF;
  const p = Easing.inOut(Easing.quad)(Math.min(1, Math.max(0, (t - s.t0) / dur)));
  const sc = s.from[0] + (s.to[0] - s.from[0]) * p;
  const x = s.from[1] + (s.to[1] - s.from[1]) * p;
  const y = s.from[2] + (s.to[2] - s.from[2]) * p;
  const sh = s.shake ?? 0;
  const sx = sh ? Math.sin(f * 0.11) * sh * 1.2 + Math.sin(f * 0.047) * sh : 0;
  const sy = sh ? Math.cos(f * 0.09) * sh * 0.8 + Math.sin(f * 0.037) * sh * 0.6 : 0;
  const fl = 1;
  const op = interpolate(f, [0, XF * FPS], [0, 1], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{opacity: s.t0 === 0 ? 1 : op}}>
      <AbsoluteFill
        style={{
          transform: `translate3d(${x + sx / 10.8}%, ${y + sy / 19.2}%, 0) scale(${sc})`, willChange: 'transform',
          filter: `brightness(${fl}) contrast(1.06) saturate(0.92)`,
        }}
      >
        <Img src={staticFile(`t94d/${s.img}.jpg`)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        {(s.blur ?? []).map((b, i) => (
          <div key={i} style={{
            position: 'absolute', left: `${b[0] * 100}%`, top: `${b[1] * 100}%`,
            width: `${(b[2] - b[0]) * 100}%`, height: `${(b[3] - b[1]) * 100}%`,
            backdropFilter: 'blur(9px)', WebkitBackdropFilter: 'blur(9px)', borderRadius: 4,
          }} />
        ))}
      </AbsoluteFill>
      {s.rain ? <Rain n={160} o={s.rain} slant={0.06} /> : null}
    </AbsoluteFill>
  );
};

const Subtitle: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const cur = SUBS.find(([a, b]) => t >= a && t < b);
  if (!cur) return null;
  const [a, b, text] = cur;
  const o = Math.min(interpolate(t, [a, a + 0.15], [0, 1], {extrapolateRight: 'clamp'}),
    interpolate(t, [b - 0.15, b], [1, 0], {extrapolateLeft: 'clamp'}));
  return (
    <AbsoluteFill style={{justifyContent: 'flex-start', alignItems: 'center', top: 1300}}>
      <div style={{
        opacity: o, maxWidth: 900, textAlign: 'center', color: '#f4ecd8',
        fontFamily: 'Liberation Sans, Arial, sans-serif', fontSize: 50, lineHeight: 1.28, fontWeight: 700,
        textShadow: '0 2px 6px #000, 0 0 18px rgba(0,0,0,0.9)', padding: '0 40px',
      }}>{text}</div>
    </AbsoluteFill>
  );
};

const Title: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const o = interpolate(t, [0.1, 0.6, 2.4, 3.0], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const ls = interpolate(t, [0, 3.0], [14, 24]);
  return (
    <AbsoluteFill style={{alignItems: 'center', top: 330, opacity: o}}>
      <div style={{fontFamily: 'Liberation Serif, serif', color: '#efe3c6', fontSize: 108, letterSpacing: ls,
        textShadow: '0 0 40px rgba(0,0,0,0.9)', fontWeight: 700}}>TOSHKENT</div>
      <div style={{fontFamily: 'Liberation Serif, serif', color: '#c7372e', fontSize: 66, letterSpacing: 34, marginTop: 6,
        textShadow: '0 0 30px rgba(0,0,0,0.9)'}}>1994</div>
      <div style={{fontFamily: 'Liberation Sans, sans-serif', color: '#cfc6b2', fontSize: 34, letterSpacing: 8, marginTop: 34}}>
        3-QISM · SOAT OLTIGACHA
      </div>
    </AbsoluteFill>
  );
};

const EndCard: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const o = interpolate(t, [0, 0.5], [0, 1], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: `rgba(0,0,0,${0.6 * o})`, justifyContent: 'center', alignItems: 'center'}}>
      <div style={{opacity: o, textAlign: 'center'}}>
        <div style={{fontFamily: 'Liberation Sans, sans-serif', color: '#efe3c6', fontSize: 54, fontWeight: 700, marginBottom: 20}}>Siz Jasurga ishonarmidingiz?</div>
        <div style={{fontFamily: 'Liberation Sans, sans-serif', color: '#c7372e', fontSize: 64, fontWeight: 700, marginBottom: 14}}>HA yoki YO'Q</div>
        <div style={{fontFamily: 'Liberation Sans, sans-serif', color: '#cfc6b2', fontSize: 38, marginBottom: 90}}>Izohga yozing 👇</div>
        <div style={{fontFamily: 'Liberation Serif, serif', color: '#efe3c6', fontSize: 80, letterSpacing: 12, fontWeight: 700}}>DAVOMI</div>
        <div style={{fontFamily: 'Liberation Serif, serif', color: '#c7372e', fontSize: 68, letterSpacing: 14, marginTop: 10}}>5-QISMDA</div>
        <div style={{fontFamily: 'Liberation Sans, sans-serif', color: '#cfc6b2', fontSize: 38, marginTop: 60, maxWidth: 820}}>
          Davomini o'tkazib yubormaslik uchun obuna bo'ling 🔔
        </div>
      </div>
    </AbsoluteFill>
  );
};

// flash on hard moments
const Flash: React.FC<{at: number; strength?: number}> = ({at, strength = 0.5}) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const o = interpolate(t, [at, at + 0.05, at + 0.35], [0, strength, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return <AbsoluteFill style={{background: '#fff8e6', opacity: o, mixBlendMode: 'screen'}} />;
};

export const T94D: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    {SHOTS.map((s, i) => {
      const from = Math.max(0, Math.round((s.t0 - (i ? XF : 0)) * FPS));
      const until = Math.round(Math.min(T94D_SECONDS, s.t1 + XF) * FPS);
      return (
        <Sequence key={i} from={from} durationInFrames={until - from}>
          <ShotView s={{...s, t0: from / FPS}} />
        </Sequence>
      );
    })}
    <Flash at={47.6} strength={0.25} />
    <Flash at={51.8} strength={0.35} />
    <Flash at={59.7} strength={0.45} />
    <AbsoluteFill style={{
      background: 'linear-gradient(180deg, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 72%, rgba(0,0,0,0.25) 100%)',
    }} />
    <Vignette s={0.7} />
    <Grain o={0.13} />
    {/* thin cinema bars */}
    <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 70, background: '#000'}} />
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 70, background: '#000'}} />
    
    <Subtitle />
    <Stamp />
    <Sequence from={Math.round(63.2 * FPS)}><EndCard /></Sequence>
  </AbsoluteFill>
);

export const T94DWithAudio: React.FC = () => (
  <AbsoluteFill>
    <T94D />
    <Audio src={staticFile('t94d/mix.wav')} />
  </AbsoluteFill>
);


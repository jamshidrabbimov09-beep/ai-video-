import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, Sequence, staticFile, useCurrentFrame, Easing} from 'remotion';
import {Grain, Rain, Vignette} from './NoirTest';

const FPS = 30;
export const T94B_SECONDS = 70;
export const T94B_FRAMES = T94B_SECONDS * FPS;

type Blur = [number, number, number, number]; // x0,y0,x1,y1 fractions
type Shot = {
  img: string; t0: number; t1: number;
  from: [number, number, number]; // scale, x%, y%
  to: [number, number, number];
  rain?: number; shake?: number; flicker?: boolean; blur?: Blur[];
}// times in seconds (voice timeline)
const SHOTS: Shot[] = [
  {img: '01', t0: 0, t1: 3.9, from: [1.25, 0, 3], to: [1.06, 0, 0], flicker: true},
  {img: '02', t0: 3.9, t1: 8.3, from: [1.04, 0, 0], to: [1.16, 2, 4]},
  {img: '03', t0: 8.3, t1: 11.8, from: [1.05, 0, 0], to: [1.18, 4, 0]},
  {img: '04', t0: 11.8, t1: 17.0, from: [1.04, 0, 3], to: [1.2, 0, -3], flicker: true},
  {img: '05', t0: 17.0, t1: 23.1, from: [1.04, 0, 0], to: [1.22, 0, -6]},
  {img: '06', t0: 23.1, t1: 26.6, from: [1.04, -3, 0], to: [1.14, 3, 2]},
  {img: '07', t0: 26.6, t1: 28.9, from: [1.2, 0, 0], to: [1.08, 0, 0], shake: 5, rain: 0.3},
  {img: '08', t0: 28.9, t1: 31.5, from: [1.06, 0, 0], to: [1.2, 0, 3], shake: 7, rain: 0.3},
  {img: '01', t0: 31.5, t1: 35.0, from: [1.04, 0, 0], to: [1.18, 0, 5], flicker: true},
  {img: '09', t0: 35.0, t1: 41.6, from: [1.02, 0, 0], to: [1.25, 0, 6]},
  {img: '10', t0: 41.6, t1: 48.7, from: [1.04, 3, 0], to: [1.2, -4, 2]},
  {img: '11', t0: 48.7, t1: 55.2, from: [1.0, 0, 0], to: [1.3, -3, 6]},
  {img: '09', t0: 55.2, t1: 58.6, from: [1.3, 0, 8], to: [1.42, 0, 10]},
  {img: '12', t0: 58.6, t1: 60.3, from: [1.04, 0, 0], to: [1.14, 0, -2], rain: 0.3, shake: 2},
  {img: '13', t0: 60.3, t1: 62.4, from: [1.04, 0, 0], to: [1.2, 0, 2], shake: 4},
  {img: '14', t0: 62.4, t1: T94B_SECONDS, from: [1.0, 0, 0], to: [1.3, 2, 4]},
];

const SUBS: [number, number, string][] = [
  [0.0, 1.9, "Meni o'ldirishmadi."],
  [1.9, 3.6, 'Faqat bitta sabab bilan.'],
  [4.04, 5.5, "O'sha tong uyqum kelmadi."],
  [5.99, 8.1, 'Sumkani pol taxtasi ostiga yashirdim.'],
  [8.33, 11.4, 'Faqat bir dasta pul oldim. Onamga dori uchun.'],
  [11.88, 15.4, 'Dori sotuvchi pulga qaradi. Keyin menga qaradi.'],
  [15.98, 16.9, 'Indamadi.'],
  [17.0, 18.87, "Peshinda qo'shnim Salim aka keldi."],
  [19.25, 22.7, '«Sardor, qora mashinada ikki kishi oq taksini so\'rab yurishibdi.»'],
  [23.17, 24.4, 'Yuragim muzlab ketdi.'],
  [24.82, 26.3, 'Kechasi uyga qaytayotgandim.'],
  [26.68, 28.66, "Muyulishda qora mashina yo'limni to'sdi."],
  [28.94, 31.24, 'Ikki kishi tushdi. Boshimga qop kiygizishdi.'],
  [31.54, 34.64, "Ko'zimni ochganimda, restoranning orqa tomonida o'tirardim."],
  [35.04, 39.4, "Qarshimda bir odam. Sochlari oq. Ko'zlari sovuq."],
  [39.4, 41.2, 'Hamma uni Hoji aka der edi.'],
  [41.59, 44.41, '«Rustam mening odamim edi», dedi u sekin.'],
  [44.8, 47.28, '«Pul menga kerak emas. Kalit qani?»'],
  [47.28, 48.6, '«Qanday kalit?» dedim.'],
  [48.73, 51.28, 'U jilmaydi. Stolga bitta rasm qo\'ydi.'],
  [51.64, 55.2, 'Rasmda onam edi. Bizning uyda. Uxlab yotgan.'],
  [55.2, 58.3, '«Ertaga soat oltigacha. Kalit menda bo\'lsin.»'],
  [58.64, 60.3, "Meni ko'chaga tashlab ketishdi."],
  [60.3, 62.14, 'Uyga yugurdim. Pol taxtasini ochdim.'],
  [62.44, 63.5, 'Pul joyida edi.'],
  [64.01, 66.4, "Kalit esa... yo'q edi."],
];

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
        <Img src={staticFile(`t94b/${s.img}.jpg`)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
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
        2-QISM · KALIT EGASI
      </div>
    </AbsoluteFill>
  );
};

const EndCard: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const o = interpolate(t, [0, 0.4], [0, 1], {extrapolateRight: 'clamp'});
  const s = interpolate(t, [0, 3.4], [1.08, 1]);
  return (
    <AbsoluteFill style={{background: `rgba(0,0,0,${0.55 * o})`, justifyContent: 'center', alignItems: 'center'}}>
      <div style={{opacity: o, transform: `scale(${s})`, textAlign: 'center'}}>
        <div style={{fontFamily: 'Liberation Serif, serif', color: '#efe3c6', fontSize: 92, letterSpacing: 12, fontWeight: 700}}>
          KALITNI
        </div>
        <div style={{fontFamily: 'Liberation Serif, serif', color: '#efe3c6', fontSize: 92, letterSpacing: 12, fontWeight: 700}}>
          KIM OLDI?
        </div>
        <div style={{fontFamily: 'Liberation Sans, sans-serif', color: '#cfc6b2', fontSize: 40, marginTop: 24}}>
          Izohga yozing 👇
        </div>
        <div style={{fontFamily: 'Liberation Serif, serif', color: '#efe3c6', fontSize: 54, letterSpacing: 8, marginTop: 70}}>
          DAVOMI
        </div>
        <div style={{fontFamily: 'Liberation Serif, serif', color: '#c7372e', fontSize: 64, letterSpacing: 14, marginTop: 10}}>
          3-QISMDA
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

export const T94B: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    {SHOTS.map((s, i) => {
      const from = Math.max(0, Math.round((s.t0 - (i ? XF : 0)) * FPS));
      const until = Math.round(Math.min(T94B_SECONDS, s.t1 + XF) * FPS);
      return (
        <Sequence key={i} from={from} durationInFrames={until - from}>
          <ShotView s={{...s, t0: from / FPS}} />
        </Sequence>
      );
    })}
    <Flash at={26.6} />
    <Flash at={28.9} strength={0.35} />
    <Flash at={62.4} strength={0.3} />
    <AbsoluteFill style={{
      background: 'linear-gradient(180deg, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 72%, rgba(0,0,0,0.25) 100%)',
    }} />
    <Vignette s={0.7} />
    <Grain o={0.13} />
    {/* thin cinema bars */}
    <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 70, background: '#000'}} />
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 70, background: '#000'}} />
    <Sequence from={Math.round(4.0 * FPS)} durationInFrames={Math.round(3.0 * FPS)}><Title /></Sequence>
    <Subtitle />
    <Sequence from={Math.round(66.4 * FPS)}><EndCard /></Sequence>
  </AbsoluteFill>
);

export const T94BWithAudio: React.FC = () => (
  <AbsoluteFill>
    <T94B />
    <Audio src={staticFile('t94b/mix.wav')} />
  </AbsoluteFill>
);

// "Oldingi qismda" recap (prepended in ffmpeg)
const RECAP: [string, string][] = [
  ['03', "Sardor tunda yo'lovchi oldi"],
  ['08', "Yo'lovchi yo'lda o'ldi"],
  ['12', "Sumkada pul va 14-raqamli kalit bor edi"],
  ['14', 'Kimdir uning ismini bilardi'],
];
export const RECAP_SECONDS = 5;
const RecapShot: React.FC<{img: string; text: string}> = ({img, text}) => {
  const f = useCurrentFrame();
  const sc = interpolate(f, [0, 36], [1.12, 1.04]);
  const o = interpolate(f, [0, 6], [0, 1], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{opacity: o}}>
      <AbsoluteFill style={{transform: `scale(${sc})`, filter: 'saturate(0.6) brightness(0.8)'}}>
        <Img src={staticFile(`t94/${img}.jpg`)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </AbsoluteFill>
      <AbsoluteFill style={{justifyContent: 'flex-start', alignItems: 'center', top: 1260}}>
        <div style={{maxWidth: 900, textAlign: 'center', color: '#f4ecd8', fontFamily: 'Liberation Sans, Arial, sans-serif',
          fontSize: 56, fontWeight: 700, lineHeight: 1.25, textShadow: '0 2px 8px #000, 0 0 20px rgba(0,0,0,0.9)'}}>{text}</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export const T94Recap: React.FC = () => {
  const f = useCurrentFrame();
  const end = interpolate(f, [RECAP_SECONDS * FPS - 8, RECAP_SECONDS * FPS], [1, 0], {extrapolateLeft: 'clamp'});
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill style={{opacity: end}}>
        {RECAP.map(([img, text], i) => (
          <Sequence key={i} from={Math.round(i * 1.2 * FPS)} durationInFrames={Math.round(1.25 * FPS)}>
            <RecapShot img={img} text={text} />
          </Sequence>
        ))}
        <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.6) 78%)'}} />
        <Vignette s={0.7} />
        <Grain o={0.15} />
        <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 70, background: '#000'}} />
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 70, background: '#000'}} />
        <AbsoluteFill style={{alignItems: 'center', top: 190}}>
          <div style={{fontFamily: 'Liberation Serif, serif', color: '#c7372e', fontSize: 60, letterSpacing: 14, fontWeight: 700,
            textShadow: '0 0 24px rgba(0,0,0,0.9)'}}>OLDINGI QISMDA</div>
        </AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, Sequence, staticFile, useCurrentFrame, Easing} from 'remotion';
import {Grain, Rain, Vignette} from './NoirTest';

const FPS = 30;
export const T94C_SECONDS = 80;
export const T94C_FRAMES = T94C_SECONDS * FPS;

type Blur = [number, number, number, number]; // x0,y0,x1,y1 fractions
type Shot = {
  img: string; t0: number; t1: number;
  from: [number, number, number]; // scale, x%, y%
  to: [number, number, number];
  rain?: number; shake?: number; flicker?: boolean; blur?: Blur[];
}// times in seconds (voice timeline)
const SHOTS: Shot[] = [
  {img: '01', t0: 0, t1: 4.2, from: [1.18, 0, 2], to: [1.04, 0, 0]},
  {img: '02', t0: 4.2, t1: 9.1, from: [1.04, 0, 0], to: [1.16, 3, 2], shake: 2},
  {img: '03', t0: 9.1, t1: 14.9, from: [1.0, 0, 0], to: [1.3, 0, 4]},
  {img: '04', t0: 14.9, t1: 19.6, from: [1.04, 0, 0], to: [1.14, -2, 0]},
  {img: '05', t0: 19.6, t1: 25.0, from: [1.04, 0, 0], to: [1.16, 3, -2]},
  {img: '06', t0: 25.0, t1: 31.5, from: [1.04, 0, 0], to: [1.2, 2, -4]},
  {img: '07', t0: 31.5, t1: 33.3, from: [1.06, 0, 0], to: [1.12, 0, 0]},
  {img: '08', t0: 33.3, t1: 38.2, from: [1.04, 0, 0], to: [1.18, -3, -3]},
  {img: '07', t0: 38.2, t1: 43.0, from: [1.12, 0, 0], to: [1.3, 0, -2]},
  {img: '09', t0: 43.0, t1: 48.4, from: [1.2, 0, 3], to: [1.04, 0, 0]},
  {img: '10', t0: 48.4, t1: 51.8, from: [1.04, 0, 0], to: [1.16, 0, 0]},
  {img: '11', t0: 51.8, t1: 56.0, from: [1.04, 0, 0], to: [1.16, 2, 2]},
  {img: '10', t0: 56.0, t1: 59.4, from: [1.16, 0, 0], to: [1.4, -4, 0]},
  {img: '12', t0: 59.4, t1: 64.0, from: [1.04, 0, 0], to: [1.22, 0, 6]},
  {img: '13', t0: 64.0, t1: 72.0, from: [1.04, 0, 0], to: [1.3, 0, -6]},
  {img: 'jasur_portret', t0: 72.0, t1: T94C_SECONDS, from: [1.25, 0, -8], to: [1.45, 0, -12]},
];

const SUBS: [number, number, string][] = [
  [0.0, 1.9, "Soat o'n bir edi."],
  [2.0, 4.1, 'Oltigacha yetti soat qoldi.'],
  [4.3, 5.8, 'Butun uyni titkiladim.'],
  [5.9, 9.0, 'Shkafni. Divanni. Har bir burchakni.'],
  [9.2, 12.1, 'Pol taxtasi yonida bir narsa yaltiradi.'],
  [12.3, 14.8, 'Tugma. Militsiya kiyimining tugmasi.'],
  [15.1, 17.0, 'Bu joyni faqat onam bilardi.'],
  [17.2, 19.5, "Onam uxlab yotardi. Uyg'otmadim."],
  [19.7, 22.3, "Zaxira kalit faqat qo'shnim Salim akada edi."],
  [22.5, 25.0, 'Eshigini taqillatdim. U uzoq ochmadi.'],
  [25.1, 28.0, '«Sardor... men hech narsa bilmayman.»'],
  [28.2, 31.3, "«Salim aka. Onamning hayoti shunga bog'liq.»"],
  [31.5, 33.2, "U ko'zini yerga tikdi."],
  [33.4, 37.9, "«Kechqurun militsioner keldi. Hujjat ko'rsatdi. Eshigingni ochishimni buyurdi.»"],
  [38.3, 39.4, "«Qo'rqdim, bolam.»"],
  [39.6, 40.8, '«Yuzi qanaqa edi?»'],
  [40.9, 42.9, "«Ko'rmadim. Shapkasi past edi.»"],
  [43.1, 44.8, 'Tun bo\'yi shaharni kezdim.'],
  [44.9, 48.3, "Tanish ko'chalar. Militsiya bo'limlari. Hech kim yo'q."],
  [48.5, 51.8, "Soat uch. Soat to'rt. Soat besh."],
  [51.9, 55.0, "Uyga qaytdim. Onamning yonida o'tirdim."],
  [55.1, 56.0, 'Kutdim.'],
  [56.1, 59.3, "Besh yarim. Besh ellik. Besh ellik to'qqiz."],
  [59.5, 60.7, 'Eshik taqilladi.'],
  [60.8, 62.8, "Hoji akaning odamlari, deb o'yladim."],
  [62.9, 64.0, 'Eshikni ochdim.'],
  [64.1, 66.0, 'Ostonada militsioner turardi.'],
  [66.1, 69.7, "Jasur. Afg'onda meni o'limdan olib qolgan do'stim."],
  [69.8, 71.9, "Qo'lida o'n to'rt raqamli kalit."],
  [72.0, 75.6, '«Sardor... bu kalit nimani ochishini bilasanmi?»'],
];

const STAMPS: [number, number, string][] = [
  [0.2, 4.0, '23:00'], [48.5, 51.7, '03:00'], [56.1, 57.9, '05:30'], [58.0, 59.4, '05:59'],
];
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
        <Img src={staticFile(`t94c/${s.img}.jpg`)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
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
        <div style={{fontFamily: 'Liberation Serif, serif', color: '#efe3c6', fontSize: 96, letterSpacing: 12, fontWeight: 700}}>DAVOMI</div>
        <div style={{fontFamily: 'Liberation Serif, serif', color: '#c7372e', fontSize: 68, letterSpacing: 14, marginTop: 10}}>4-QISMDA</div>
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

export const T94C: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    {SHOTS.map((s, i) => {
      const from = Math.max(0, Math.round((s.t0 - (i ? XF : 0)) * FPS));
      const until = Math.round(Math.min(T94C_SECONDS, s.t1 + XF) * FPS);
      return (
        <Sequence key={i} from={from} durationInFrames={until - from}>
          <ShotView s={{...s, t0: from / FPS}} />
        </Sequence>
      );
    })}
    <Flash at={59.5} strength={0.3} />
    <Flash at={64.0} strength={0.35} />
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
    <Sequence from={Math.round(75.8 * FPS)}><EndCard /></Sequence>
  </AbsoluteFill>
);

export const T94CWithAudio: React.FC = () => (
  <AbsoluteFill>
    <T94C />
    <Audio src={staticFile('t94c/mix.wav')} />
  </AbsoluteFill>
);


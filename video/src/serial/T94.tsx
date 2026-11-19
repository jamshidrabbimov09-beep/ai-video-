import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, Sequence, staticFile, useCurrentFrame, Easing} from 'remotion';
import {Grain, Rain, Vignette} from './NoirTest';

const FPS = 30;
export const T94_SECONDS = 87;
export const T94_FRAMES = T94_SECONDS * FPS;

type Blur = [number, number, number, number]; // x0,y0,x1,y1 fractions
type Shot = {
  img: string; t0: number; t1: number;
  from: [number, number, number]; // scale, x%, y%
  to: [number, number, number];
  rain?: number; shake?: number; flicker?: boolean; blur?: Blur[];
};

// times in seconds (voice timeline)
const SHOTS: Shot[] = [
  {img: '01', t0: 0, t1: 3.6, from: [1.18, 0, -3], to: [1.05, 0, 2], rain: 0.25},
  {img: '02', t0: 3.6, t1: 9.6, from: [1.05, 0, 0], to: [1.16, 3, 2], rain: 0.3, blur: [[0.115, 0.542, 0.225, 0.56]]},
  {img: '03', t0: 9.6, t1: 16.7, from: [1.04, 0, 2], to: [1.2, 3, 6], rain: 0.3, flicker: true, blur: [[0.22, 0.702, 0.395, 0.73]]},
  {img: '04', t0: 16.7, t1: 18.95, from: [1.12, -2, 0], to: [1.04, 0, 0], flicker: true},
  {img: '05', t0: 18.95, t1: 22.6, from: [1.04, 0, 0], to: [1.18, 4, 2]},
  {img: '06', t0: 22.6, t1: 28.3, from: [1.04, 0, 0], to: [1.16, 0, -4], rain: 0.2},
  {img: '07', t0: 28.3, t1: 32.6, from: [1.06, 0, 0], to: [1.15, 3, -3], shake: 2},
  {img: '08', t0: 32.6, t1: 36.7, from: [1.05, 0, 0], to: [1.18, 4, 2], shake: 2},
  {img: '07', t0: 36.7, t1: 40.3, from: [1.2, 3, -6], to: [1.28, 3, -8], shake: 2},
  {img: '08', t0: 40.3, t1: 42.6, from: [1.22, 2, 3], to: [1.32, 4, 4], shake: 1},
  {img: '09', t0: 42.6, t1: 46.7, from: [1.05, 0, 0], to: [1.22, 0, 3], shake: 7},
  {img: '10', t0: 46.7, t1: 53.35, from: [1.25, -4, 0], to: [1.06, 3, 0], shake: 6, rain: 0.35, blur: [[0.745, 0.511, 0.848, 0.528]]},
  {img: '11', t0: 53.35, t1: 60.2, from: [1.04, 0, 0], to: [1.2, 6, -4], rain: 0.15},
  {img: '12', t0: 60.2, t1: 70.5, from: [1.0, 0, 0], to: [1.3, 2, 2]},
  {img: '13', t0: 70.5, t1: 74.0, from: [1.04, 0, 0], to: [1.16, -6, 3]},
  {img: '14', t0: 74.0, t1: T94_SECONDS, from: [1.02, 0, 0], to: [1.22, 0, -4]},
];

// subtitles (Latin), times from the voice
const SUBS: [number, number, string][] = [
  [0.0, 3.4, "Toshkent. To'qson to'rtinchi yil. Kuz."],
  [3.88, 6.45, "U paytda shaharda ikki xil odam bor edi."],
  [6.61, 9.5, "Qo'rqadiganlar... va qo'rqitadiganlar."],
  [9.92, 13.5, 'Men ikkalasi ham emasdim. Men shunchaki taksichi edim.'],
  [13.81, 16.65, "Ismim Sardor. Afg'ondan tirik qaytganman."],
  [16.84, 18.9, "Onam kasal. Dori puli yo'q."],
  [19.12, 22.5, "O'sha kecha jala quyardi. Soat ikkidan o'tgandi."],
  [22.8, 24.95, "Chilonzorda bir odam qo'l ko'tardi."],
  [25.12, 28.2, "Egnida qora charm kiyim. Qo'lida sumka."],
  [28.55, 30.3, '«Tez hayda. Orqaga qarama.»'],
  [30.55, 32.6, 'Men haydadim. Oynadan qaradim.'],
  [32.76, 34.6, "Uning ko'ylagi qizarib borardi."],
  [34.74, 36.7, '«Aka, kasalxonaga boramizmi?»'],
  [36.87, 40.3, "«Yo'q... kasalxonaga emas. Ular kasalxonada kutishyapti.»"],
  [40.48, 41.1, '«Kim?»'],
  [41.28, 42.6, 'U javob bermadi.'],
  [42.77, 46.6, 'Orqada faralar yondi. Bitta mashina. Keyin ikkinchisi.'],
  [46.91, 50.3, "Men gazni bosdim. Ingichka ko'chalar. Jala."],
  [50.42, 53.3, 'Qizil chiroqlar. Bir amallab ularni adashtirdim.'],
  [53.53, 56.0, "Mashinani to'xtatdim. Orqaga qaradim."],
  [56.25, 60.2, "Odam jim o'tirardi. Ko'zlari ochiq. Nafas olmayotgandi."],
  [60.4, 64.5, "Sumkani ochdim. Ichida pul. Men umrimda ko'rmagan pul."],
  [64.66, 67.5, 'Pullarning ostida esa bitta eski kalit.'],
  [67.68, 70.4, "Unga raqam yozilgandi. O'n to'rt."],
  [70.72, 74.0, "Uyga qaytdim. Tong otmasdan uy telefoni jiringladi."],
  [74.11, 78.0, 'Trubkani oldim. Narigi tomonda sekin, sovuq ovoz:'],
  [78.13, 80.6, "«Sardor... kalitni yo'qotma.»"],
  [80.87, 83.6, 'Men u odamga ismimni aytmagandim.'],
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
  const sx = sh ? Math.sin(f * 1.7) * sh + Math.sin(f * 0.53) * sh * 0.6 : 0;
  const sy = sh ? Math.cos(f * 1.3) * sh * 0.7 + Math.sin(f * 0.71) * sh * 0.5 : 0;
  const fl = s.flicker ? 0.94 + 0.06 * Math.sin(f * 0.9) * Math.sin(f * 0.31) : 1;
  const op = interpolate(f, [0, XF * FPS], [0, 1], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{opacity: s.t0 === 0 ? 1 : op}}>
      <AbsoluteFill
        style={{
          transform: `translate(${x + sx / 10.8}%, ${y + sy / 19.2}%) scale(${sc})`,
          filter: `brightness(${fl}) contrast(1.06) saturate(0.92)`,
        }}
      >
        <Img src={staticFile(`t94/${s.img}.jpg`)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
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
  const o = interpolate(t, [0.3, 1.2, 3.0, 3.6], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const ls = interpolate(t, [0, 3.6], [14, 26]);
  return (
    <AbsoluteFill style={{alignItems: 'center', top: 330, opacity: o}}>
      <div style={{fontFamily: 'Liberation Serif, serif', color: '#efe3c6', fontSize: 108, letterSpacing: ls,
        textShadow: '0 0 40px rgba(0,0,0,0.9)', fontWeight: 700}}>TOSHKENT</div>
      <div style={{fontFamily: 'Liberation Serif, serif', color: '#c7372e', fontSize: 66, letterSpacing: 34, marginTop: 6,
        textShadow: '0 0 30px rgba(0,0,0,0.9)'}}>1994</div>
      <div style={{fontFamily: 'Liberation Sans, sans-serif', color: '#cfc6b2', fontSize: 34, letterSpacing: 8, marginTop: 34}}>
        1-QISM · BIR KECHA
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
          DAVOMI
        </div>
        <div style={{fontFamily: 'Liberation Serif, serif', color: '#c7372e', fontSize: 64, letterSpacing: 14, marginTop: 10}}>
          2-QISMDA
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

export const T94: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    {SHOTS.map((s, i) => {
      const from = Math.max(0, Math.round((s.t0 - (i ? XF : 0)) * FPS));
      const until = Math.round(Math.min(T94_SECONDS, s.t1 + XF) * FPS);
      return (
        <Sequence key={i} from={from} durationInFrames={until - from}>
          <ShotView s={{...s, t0: from / FPS}} />
        </Sequence>
      );
    })}
    <Flash at={42.6} />
    <Flash at={46.7} strength={0.35} />
    <Flash at={60.2} strength={0.25} />
    <AbsoluteFill style={{
      background: 'linear-gradient(180deg, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 72%, rgba(0,0,0,0.25) 100%)',
    }} />
    <Vignette s={0.7} />
    <Grain o={0.13} />
    {/* thin cinema bars */}
    <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 70, background: '#000'}} />
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 70, background: '#000'}} />
    <Sequence from={0} durationInFrames={Math.round(3.8 * FPS)}><Title /></Sequence>
    <Subtitle />
    <Sequence from={Math.round(83.6 * FPS)}><EndCard /></Sequence>
  </AbsoluteFill>
);

export const T94WithAudio: React.FC = () => (
  <AbsoluteFill>
    <T94 />
    <Audio src={staticFile('t94/mix.wav')} />
  </AbsoluteFill>
);

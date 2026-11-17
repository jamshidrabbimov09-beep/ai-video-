import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {FollowButton, BekAt, Bg, blinkAt, buildChunks, Burst, Caption, FPS, GOLD, H, INK, lerp, pop, RED, Text, useOswald, W, W3} from './common';
import words from './tq4_words.json';

// "Tasavvur qil" episode 4: "Chingizxonning o'ng qo'li" (Secret History of the Mongols §147 Jebe, §200 Jamuxa's betrayers).

// The re-recorded Jamuxa sentence (fix_raw.mp3) is 1.4 s longer than the first take: scene times below stay in the
// first take's timebase and the real time is mapped onto it (the Bring scene is stretched, everything after shifts).
const SHIFT_A = 47.9;
const SHIFT_OLD = 52.55;
const SHIFT = 1.4;
const toScene = (t: number) =>
  t < SHIFT_A ? t : t < SHIFT_OLD + SHIFT ? SHIFT_A + ((t - SHIFT_A) * (SHIFT_OLD - SHIFT_A)) / (SHIFT_OLD + SHIFT - SHIFT_A) : t - SHIFT;
const VOICE_END = 78.2 + SHIFT;
const FOLLOW_AT = 78.4;
export const TQ4_FRAMES = Math.round((FOLLOW_AT + SHIFT + 3.2) * FPS);

const ease = (x: number) => x * x * (3 - 2 * x);
const span = (t: number, a: number, b: number) => ease(lerp(t, a, b, 0, 1));
const mix = (a: number, b: number, k: number) => a + (b - a) * k;

// ---------- steppe world ----------
const Steppe: React.FC<{t: number; sky?: [string, string]; dusk?: number}> = ({t, sky = ['#f7d9a0', '#7fb0d8'], dusk = 0}) => (
  <g>
    <defs>
      <linearGradient id={`sky${sky[0].slice(1)}`} x1="0" y1="1" x2="0" y2="0">
        <stop offset="0%" stopColor={sky[0]} />
        <stop offset="100%" stopColor={sky[1]} />
      </linearGradient>
    </defs>
    <rect width={W} height={H} fill={`url(#sky${sky[0].slice(1)})`} />
    {[0, 1, 2].map((i) => (
      <ellipse key={i} cx={((i * 420 + t * 12) % 1500) - 200} cy={300 + i * 120} rx={150} ry={36} fill="#fff" opacity={0.5 - dusk * 0.4} />
    ))}
    <path d="M0 1080 C180 980 320 1010 480 1060 C640 1000 820 960 1080 1050 L1080 1920 L0 1920 Z" fill="#8a9a6a" />
    <path d="M0 1180 C260 1120 520 1150 760 1190 C900 1160 1000 1150 1080 1170 L1080 1920 L0 1920 Z" fill="#a8b46e" />
    <rect y={1300} width={W} height={620} fill="#b9bf72" />
    {dusk > 0 && <rect width={W} height={H} fill="#2a1840" opacity={dusk * 0.45} />}
  </g>
);

const Yurt: React.FC<{x: number; y: number; s: number; big?: boolean}> = ({x, y, s, big}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-120 0 L-120 -90 C-60 -150 60 -150 120 -90 L120 0 Z" fill={big ? '#f6f1e4' : '#efe6d0'} stroke={INK} strokeWidth={6} />
    <path d="M-120 -90 C-60 -150 60 -150 120 -90" fill="none" stroke="#b3261e" strokeWidth={big ? 14 : 8} />
    <path d="M-120 -40 L120 -40" stroke="#c8962e" strokeWidth={6} />
    <rect x={-26} y={-70} width={52} height={70} fill="#b3261e" stroke={INK} strokeWidth={5} />
    {big && <path d="M0 -150 L0 -230" stroke={INK} strokeWidth={6} />}
    {big && <path d="M0 -230 L60 -210 L0 -190 Z" fill="#f6f1e4" stroke={INK} strokeWidth={4} />}
  </g>
);

const Horse: React.FC<{x: number; y: number; s: number; arrow?: number; flip?: boolean; color?: string}> = ({x, y, s, arrow = 0, flip, color = '#c08a4a'}) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
    <ellipse cx={0} cy={0} rx={170} ry={14} fill="#000" opacity={0.2} />
    {[-110, -70, 70, 110].map((lx) => (
      <rect key={lx} x={lx - 12} y={-150} width={24} height={150} rx={8} fill={color} stroke={INK} strokeWidth={6} />
    ))}
    <path d="M-150 -170 C-150 -250 -60 -270 40 -260 C110 -255 150 -230 150 -170 C150 -130 110 -120 40 -120 L-90 -120 C-140 -120 -150 -140 -150 -170 Z" fill={color} stroke={INK} strokeWidth={6} />
    <path d="M100 -230 C130 -300 170 -360 210 -380 C250 -390 280 -360 270 -330 C255 -300 220 -300 200 -290 C180 -260 160 -220 150 -190 Z" fill={color} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <path d="M120 -260 C140 -310 170 -350 200 -372" fill="none" stroke="#3a2414" strokeWidth={18} strokeLinecap="round" />
    <circle cx={236} cy={-352} r={7} fill={INK} />
    <path d="M-150 -200 C-200 -190 -210 -140 -190 -100" fill="none" stroke="#3a2414" strokeWidth={16} strokeLinecap="round" />
    <rect x={-60} y={-275} width={90} height={30} rx={10} fill="#8f1f1a" stroke={INK} strokeWidth={5} />
    {arrow > 0 && (
      <g transform={`translate(160 -260) rotate(-25) scale(${arrow})`}>
        <line x1={0} y1={0} x2={-150} y2={0} stroke="#5a3a22" strokeWidth={8} />
        <path d="M-150 -14 L-185 -14 L-170 0 L-185 14 L-150 14 Z" fill="#e9dcc3" stroke={INK} strokeWidth={3} />
      </g>
    )}
  </g>
);

const Arrow: React.FC<{x1: number; y1: number; x2: number; y2: number; k: number}> = ({x1, y1, x2, y2, k}) => {
  if (k <= 0 || k >= 1) return null;
  const x = mix(x1, x2, k);
  const y = mix(y1, y2, k) - Math.sin(k * Math.PI) * 120;
  const a = (Math.atan2(y2 - y1 - Math.cos(k * Math.PI) * 120 * Math.PI, x2 - x1) * 180) / Math.PI;
  return (
    <g transform={`translate(${x} ${y}) rotate(${a})`}>
      <line x1={-90} y1={0} x2={0} y2={0} stroke="#5a3a22" strokeWidth={8} />
      <path d="M0 -12 L26 0 L0 12 Z" fill="#c9ced6" stroke={INK} strokeWidth={3} />
      <path d="M-90 -10 L-110 -16 L-100 0 L-110 16 L-90 10 Z" fill="#e9dcc3" />
    </g>
  );
};

const Throne: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-230} y={-40} width={460} height={60} rx={10} fill="#8f1f1a" stroke={INK} strokeWidth={6} />
    <path d="M-200 -40 L-200 -520 C-120 -580 120 -580 200 -520 L200 -40 Z" fill="#c8962e" stroke={INK} strokeWidth={6} />
    <path d="M-160 -60 L-160 -480 C-90 -530 90 -530 160 -480 L160 -60 Z" fill="#8f1f1a" stroke={INK} strokeWidth={5} />
    <circle cx={0} cy={-470} r={22} fill="#2f7fd1" stroke={INK} strokeWidth={5} />
  </g>
);

const Rope: React.FC = () => (
  <g fill="none" stroke="#c8a46a" strokeWidth={12} strokeLinecap="round">
    <path d="M110 400 C160 420 240 420 290 400" />
    <path d="M108 450 C160 470 240 470 292 450" />
    <path d="M110 510 C160 530 240 530 290 510" />
  </g>
);

const Coins: React.FC<{k: number}> = ({k}) => (
  <g transform={`scale(${k})`}>
    {Array.from({length: 9}).map((_, i) => {
      const row = i < 4 ? 0 : i < 7 ? 1 : 2;
      const idx = i < 4 ? i : i < 7 ? i - 4 : i - 7;
      const n = [4, 3, 2][row];
      return (
        <g key={i}>
          <ellipse cx={(idx - (n - 1) / 2) * 64} cy={-row * 40} rx={36} ry={20} fill="#d4a017" stroke={INK} strokeWidth={5} />
          <ellipse cx={(idx - (n - 1) / 2) * 64} cy={-row * 40 - 4} rx={22} ry={11} fill="none" stroke="#f6dc7a" strokeWidth={4} />
        </g>
      );
    })}
  </g>
);

const Mark: React.FC<{x: number; y: number; k: number; ok: boolean}> = ({x, y, k, ok}) =>
  k <= 0 ? null : (
    <g transform={`translate(${x} ${y}) scale(${k})`}>
      <circle r={95} fill={ok ? '#2e9e5b' : RED} stroke="#fff" strokeWidth={10} />
      {ok ? (
        <path d="M-45 0 L-12 34 L48 -32" fill="none" stroke="#fff" strokeWidth={22} strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <g stroke="#fff" strokeWidth={22} strokeLinecap="round">
          <line x1={-38} y1={-38} x2={38} y2={38} />
          <line x1={38} y1={-38} x2={-38} y2={38} />
        </g>
      )}
    </g>
  );

const Heart: React.FC<{t: number}> = ({t}) => {
  const b = 1 + Math.max(0, Math.sin(t * 7.5)) * 0.12;
  return (
    <g transform={`translate(540 760) scale(${b})`} opacity={0.35}>
      <path d="M0 60 C-140 -40 -90 -150 0 -80 C90 -150 140 -40 0 60 Z" fill={RED} />
    </g>
  );
};

// ---------- scenes ----------
// 0-4.55 hook part 1: an arrow strikes Chingizxon's horse... and the archer is forgiven
const SceneHookA: React.FC<{t: number}> = ({t}) => {
  const fly = lerp(t, 2.2, 2.85, 0, 1);
  const hit = t >= 2.85 ? pop(t, 2.85) : 0;
  return (
    <g>
      <Steppe t={t} sky={['#f3b27a', '#5f86b8']} />
      <Horse x={300} y={1520} s={1.25} arrow={hit} />
      <Arrow x1={1100} y1={700} x2={480} y2={1150} k={fly} />
      <g transform={`translate(0 ${t >= 2.85 ? Math.sin(t * 40) * lerp(t, 2.85, 3.3, 6, 0) : 0})`}>
        <BekAt x={820} y={1800} s={1.0} outfit="jebe" mood={t < 3.86 ? 'worried' : 'surprised'} blink={blinkAt(t)} lookX={-0.5} />
      </g>
      <Burst x={500} y={1150} t={t} t0={2.85} color="#fff" />
      <Mark x={820} y={980} k={pop(t, 3.86)} ok />
    </g>
  );
};

// 4.55-9.35 hook part 2: the men who bring him his worst enemy, bound, are put to death
const SceneHookB: React.FC<{t: number}> = ({t}) => {
  const walk = span(t, 4.6, 6.9);
  return (
    <g>
      <Steppe t={t} sky={['#c9775a', '#3a3f6a']} dusk={0.4} />
      <g transform={`translate(${mix(-500, 0, walk)} 0)`}>
        {[150, 330, 510].map((x, i) => (
          <BekAt key={x} x={x} y={1760 + (i % 2) * 30} s={0.62} outfit="navkar" mood="happy" blink={blinkAt(t, i)} swing={Math.sin(t * 9 + i) * 10} />
        ))}
        <g>
          <BekAt x={760} y={1780} s={0.8} outfit="jamuxa" mood="worried" blink={blinkAt(t, 2)} />
          <g transform="translate(760 1780) scale(0.8) translate(-200 -730)">
            <Rope />
          </g>
        </g>
      </g>
      <g transform="translate(330 1080)">
        <Coins k={pop(t, 6.2) * 1.2} />
      </g>
      <g opacity={t >= 8.1 ? 0.55 : 0}>
        <rect width={W} height={H} fill="#5a0d0d" />
      </g>
      <Mark x={330} y={1020} k={pop(t, 8.1)} ok={false} />
    </g>
  );
};

// 9.35-14.4 "Nega?" then Bek appears beside the khan: you are his right hand
const SceneBek: React.FC<{t: number}> = ({t}) => {
  const q = t < 10.1 ? pop(t, 9.4) : 0;
  const show = span(t, 10.0, 10.6);
  return (
    <g>
      <Steppe t={t} />
      <Yurt x={540} y={1250} s={1.6} big />
      <Yurt x={120} y={1180} s={0.7} />
      <Yurt x={960} y={1170} s={0.7} />
      <g opacity={show}>
        <BekAt x={360} y={1820} s={1.1} outfit="chingiz" mood="determined" blink={blinkAt(t)} />
        <g transform={`translate(${mix(1200, 780, show)} 0)`}>
          <BekAt x={0} y={1820} s={0.95} outfit="mongol" mood={t < 12.5 ? 'surprised' : 'happy'} blink={blinkAt(t, 1)} lookX={-0.5} />
        </g>
      </g>
      {t >= 11.4 && (
        <g transform={`translate(780 ${960 + Math.sin(t * 5) * 12}) scale(${pop(t, 11.4)})`}>
          <path d="M0 50 L-30 0 L-12 0 L-12 -50 L12 -50 L12 0 L30 0 Z" fill={GOLD} stroke={INK} strokeWidth={6} />
        </g>
      )}
      {q > 0 && (
        <g transform={`translate(540 960) scale(${q})`}>
          <rect width={W} height={H} x={-540} y={-960} fill="#000" opacity={0.6} />
          <Text x={0} y={110} size={340} fill={GOLD} stroke={12}>?</Text>
        </g>
      )}
    </g>
  );
};

// 14.4-19.5 after the battle: many men come over from the enemy side and bow
const SceneBow: React.FC<{t: number}> = ({t}) => {
  const bow = span(t, 18.6, 19.2);
  return (
    <g>
      <Steppe t={t} sky={['#e8b98a', '#7d8fb0']} />
      {[0, 1, 2].map((i) => (
        <path key={i} d={`M${160 + i * 360} 1100 C${120 + i * 360} ${1000 - ((t * 40 + i * 50) % 120)} ${200 + i * 360} 900 ${170 + i * 360} 800`} stroke="#6a6a6a" strokeWidth={30} fill="none" opacity={0.25} strokeLinecap="round" />
      ))}
      <Throne x={540} y={1250} s={0.75} />
      <BekAt x={540} y={1230} s={0.62} outfit="chingiz" mood="neutral" blink={blinkAt(t)} />
      <BekAt x={830} y={1250} s={0.5} outfit="mongol" mood="neutral" blink={blinkAt(t, 2)} lookX={-0.4} />
      {Array.from({length: 7}).map((_, i) => {
        const x = 130 + i * 137;
        const y = 1640 + (i % 2) * 120;
        const arrive = span(t, 16.2 + i * 0.12, 17.6 + i * 0.12);
        return (
          <g key={i} transform={`translate(0 ${mix(500, 0, arrive)}) rotate(${bow * 22} ${x} ${y})`}>
            <BekAt x={x} y={y} s={0.42} outfit={i === 3 ? 'jebe' : 'navkar'} mood="worried" blink={blinkAt(t, i)} shadow={false} />
          </g>
        );
      })}
    </g>
  );
};

// 19.5-23.8 "who shot my horse from the mountain?"
const SceneWho: React.FC<{t: number}> = ({t}) => {
  const fly = lerp(t, 21.3, 22.4, 0, 1);
  return (
    <g>
      <Steppe t={t} sky={['#f3b27a', '#5f86b8']} />
      <path d="M560 1100 L780 560 L860 610 L1000 820 L1080 760 L1080 1100 Z" fill="#7a6a58" stroke={INK} strokeWidth={6} />
      <path d="M780 560 L860 610 L830 660 L760 620 Z" fill="#efe6d0" />
      <g transform={`translate(840 640) scale(${0.2 + 0.05 * Math.sin(t * 3)})`} opacity={t > 20.9 ? 1 : 0.4}>
        <BekAt x={0} y={0} s={1} outfit="jebe" mood="determined" blink={0} shadow={false} />
      </g>
      <Arrow x1={820} y1={600} x2={330} y2={1230} k={fly} />
      <Horse x={300} y={1600} s={1.1} arrow={t >= 22.4 ? pop(t, 22.4) : 0} />
      <BekAt x={760} y={1880} s={0.95} outfit="chingiz" mood="determined" blink={blinkAt(t)} lookX={0.5} swing={t > 20 ? -60 : 0} />
      <g transform={`translate(560 760) scale(${pop(t, 22.6)}) rotate(${Math.sin(t * 4) * 5})`}>
        <Text x={0} y={90} size={260} fill="#fff" stroke={10}>?</Text>
      </g>
    </g>
  );
};

// 23.8-26.6 silence: everybody waits, Bek is frightened
const SceneSilence: React.FC<{t: number}> = ({t}) => (
  <g>
    <Bg c0="#4a2f3a" c1="#0c0a12" cy={50} />
    <Heart t={t} />
    <BekAt x={540} y={1900} s={1.7} outfit="mongol" mood="worried" blink={blinkAt(t)} lookX={Math.sin(t * 2) * 0.6} />
  </g>
);

// 26.6-32.1 a young man steps forward: "I hit it."
const SceneConfess: React.FC<{t: number}> = ({t}) => {
  const step = span(t, 26.7, 27.6);
  return (
    <g>
      <Bg c0="#7a4a3a" c1="#1a0f10" cy={40} />
      <g opacity={0.5}>
        {[150, 300, 780, 930].map((x, i) => (
          <BekAt key={x} x={x} y={1500} s={0.45} outfit="navkar" mood="worried" blink={blinkAt(t, i)} />
        ))}
      </g>
      <g transform={`translate(540 ${1850 + mix(-200, 0, step)}) scale(${mix(0.8, 1, step)}) translate(-540 -1850)`}>
        <BekAt x={540} y={1850} s={1.45} outfit="jebe" mood={t < 29.2 ? 'determined' : 'neutral'} blink={blinkAt(t)} swing={t > 28.4 && t < 29 ? -40 : 0} />
      </g>
    </g>
  );
};

// 32.1-40.1 Chingizxon: "an enemy hides what he did; this one did not" and names him Jebe
const SceneVerdict: React.FC<{t: number}> = ({t}) => {
  const name = pop(t, 40.24);
  const warm = span(t, 36.4, 37.8);
  return (
    <g>
      <Bg c0={warm > 0.5 ? '#f4c06a' : '#7a4a3a'} c1={warm > 0.5 ? '#7a3a1a' : '#1a0f10'} cy={45} />
      <BekAt x={330} y={1820} s={1.15} outfit="chingiz" mood={t < 36.4 ? 'determined' : 'happy'} blink={blinkAt(t)} lookX={0.5} swing={t > 37 ? -70 : 0} />
      <BekAt x={790} y={1820} s={1.0} outfit="jebe" mood={t < 37.4 ? 'worried' : 'happy'} blink={blinkAt(t, 1)} lookX={-0.4} />
      <Burst x={790} y={1000} t={t} t0={37.5} color={GOLD} />
      {name > 0 && (
        <g transform={`translate(540 760) scale(${name})`}>
          <rect x={-300} y={-110} width={600} height={180} rx={30} fill="#1b1410" stroke={GOLD} strokeWidth={10} />
          <Text x={0} y={40} size={130} fill={GOLD}>JEBE</Text>
        </g>
      )}
    </g>
  );
};

// 40.1-44.2 Jebe becomes one of the most famous generals
const SceneGeneral: React.FC<{t: number}> = ({t}) => {
  const ride = span(t, 41.2, 44.1);
  return (
    <g>
      <Steppe t={t} sky={['#f7d9a0', '#4f7fb8']} />
      {Array.from({length: 14}).map((_, i) => {
        const x = mix(-300, 300, ride) + (i % 7) * 150 - 100;
        const y = 1300 + Math.floor(i / 7) * 160;
        return (
          <g key={i}>
            <Horse x={x} y={y} s={0.32} color={i % 2 ? '#7a5030' : '#a8763e'} />
            <BekAt x={x + 10} y={y - 70} s={0.22} outfit="mongol" shadow={false} />
            <line x1={x + 50} y1={y - 140} x2={x + 50} y2={y - 260} stroke="#3a2414" strokeWidth={5} />
          </g>
        );
      })}
      <g transform={`translate(${mix(380, 640, ride)} 1780)`}>
        <Horse x={0} y={0} s={0.85} color="#f1ead8" />
        <BekAt x={20} y={-200} s={0.62} outfit="jebe" mood="determined" blink={blinkAt(t)} shadow={false} />
        <line x1={150} y1={-380} x2={150} y2={-700} stroke={INK} strokeWidth={10} />
        <path d="M150 -700 L330 -660 L150 -610 Z" fill={RED} stroke={INK} strokeWidth={6} />
      </g>
      {/* sarkardalar: a gold star over him */}
      <g transform={`translate(${mix(380, 640, ride) + 20} 1300) scale(${pop(t, 42.62)})`}>
        <path d="M0 -60 L16 -18 L60 -18 L24 8 L38 52 L0 26 L-38 52 L-24 8 L-60 -18 L-16 -18 Z" fill={GOLD} stroke={INK} strokeWidth={5} />
      </g>
    </g>
  );
};

// 44.2-47.95 "the most frightening part is still ahead" + four years pass
const SceneYears: React.FC<{t: number}> = ({t}) => {
  const flash = t > 45.06 && t < 45.25 ? 0.6 : 0;
  const n = pop(t, 47.0);
  return (
    <g>
      <Bg c0="#3a3050" c1="#07060c" cy={40} />
      {[0, 1, 2, 3].map((i) => (
        <ellipse key={i} cx={((i * 330 + t * 60) % 1500) - 200} cy={500 + (i % 2) * 140} rx={260} ry={70} fill="#1c1828" opacity={0.9} />
      ))}
      <path d="M640 560 L580 760 L650 760 L560 1000" fill="none" stroke="#fff6c8" strokeWidth={14} opacity={flash ? 1 : 0} strokeLinejoin="round" />
      <rect width={W} height={H} fill="#fff" opacity={flash} />
      <BekAt x={540} y={1900} s={1.05} outfit="mongol" mood="worried" blink={blinkAt(t)} lookX={0.3} />
      {n > 0 && (
        <g transform={`translate(540 860) scale(${n})`}>
          <circle r={190} fill="#1b1410" stroke={GOLD} strokeWidth={10} />
          <Text x={0} y={40} size={150} fill={GOLD}>+4</Text>
          <Text x={0} y={120} size={56} fill="#fff">YIL</Text>
        </g>
      )}
    </g>
  );
};

// 47.95-54.6 Jamuxa is brought in bound by his own men; they wait for a reward
const SceneBring: React.FC<{t: number}> = ({t}) => {
  const walk = span(t, 48.0, 50.6);
  const dream = pop(t, 53.0);
  return (
    <g>
      <Steppe t={t} sky={['#d98a5a', '#3d4a7a']} dusk={0.3} />
      <Throne x={850} y={1300} s={0.6} />
      <BekAt x={850} y={1280} s={0.5} outfit="chingiz" mood="neutral" blink={blinkAt(t)} lookX={-0.5} />
      <g transform={`translate(${mix(-700, 0, walk)} 0)`}>
        <BekAt x={470} y={1800} s={0.9} outfit="jamuxa" mood="worried" blink={blinkAt(t, 2)} lookX={0.3} />
        <g transform="translate(470 1800) scale(0.9) translate(-200 -730)">
          <Rope />
        </g>
        {[90, 230].map((x, i) => (
          <BekAt key={x} x={x} y={1700 + i * 60} s={0.6} outfit="navkar" mood="happy" blink={blinkAt(t, i)} swing={Math.sin(t * 8 + i) * 12} />
        ))}
        <BekAt x={690} y={1830} s={0.6} outfit="navkar" mood="happy" blink={blinkAt(t, 3)} />
      </g>
      {dream > 0 && (
        <g transform={`translate(200 1180) scale(${dream})`}>
          <circle cx={60} cy={150} r={18} fill="#fff" opacity={0.9} />
          <circle cx={90} cy={110} r={26} fill="#fff" opacity={0.9} />
          <ellipse cx={0} cy={0} rx={170} ry={110} fill="#fff" stroke={INK} strokeWidth={6} />
          <g transform="translate(0 40)">
            <Coins k={0.9} />
          </g>
        </g>
      )}
    </g>
  );
};

// 54.6-59.45 you look at Chingizxon's face
const SceneFace: React.FC<{t: number}> = ({t}) => {
  const z = mix(1.0, 1.25, span(t, 54.7, 59.4));
  return (
    <g>
      <Bg c0="#8f1f1a" c1="#12060a" cy={40} />
      <g transform={`translate(540 1150) scale(${z}) translate(-540 -1150)`}>
        <BekAt x={540} y={2350} s={2.6} outfit="chingiz" mood="determined" blink={t > 57.5 ? 0 : blinkAt(t)} />
      </g>
    </g>
  );
};

// 59.45-62.1 the traitors are led away (no violence shown)
const SceneTraitors: React.FC<{t: number}> = ({t}) => {
  const away = span(t, 60.4, 62.0);
  return (
    <g>
      <Bg c0="#5a1a1a" c1="#0a0505" cy={45} />
      <g opacity={1 - away * 0.85} transform={`translate(${away * 300} 0)`}>
        {[200, 400, 600, 800].map((x, i) => (
          <BekAt key={x} x={x} y={1720 + (i % 2) * 40} s={0.6} outfit="navkar" mood="worried" blink={blinkAt(t, i)} />
        ))}
      </g>
      <Mark x={540} y={980} k={pop(t, 59.6)} ok={false} />
      <g transform="translate(540 1250)" opacity={span(t, 60.2, 60.8)}>
        <Coins k={0.9} />
        <line x1={-160} y1={-110} x2={160} y2={40} stroke={RED} strokeWidth={16} strokeLinecap="round" />
      </g>
    </g>
  );
};

// 62.1-67.3 the answer: an honest enemy weighs more than a treacherous friend
const SceneScale: React.FC<{t: number}> = ({t}) => {
  const tilt = span(t, 64.0, 65.6) * 14;
  return (
    <g>
      <Bg c0="#f4c06a" c1="#6a3010" cy={40} />
      <g transform="translate(540 900)">
        <rect x={-14} y={0} width={28} height={720} fill="#8a5a22" stroke={INK} strokeWidth={6} />
        <rect x={-180} y={700} width={360} height={50} rx={14} fill="#8a5a22" stroke={INK} strokeWidth={6} />
        <circle cy={0} r={30} fill={GOLD} stroke={INK} strokeWidth={6} />
        <g transform={`rotate(${-tilt})`}>
          <rect x={-420} y={-12} width={840} height={24} rx={12} fill={GOLD} stroke={INK} strokeWidth={6} />
          {[-1, 1].map((side) => {
            const px = side * 400;
            return (
              <g key={side} transform={`translate(${px} 0) rotate(${tilt})`}>
                <line x1={0} y1={0} x2={-120} y2={300} stroke={INK} strokeWidth={5} />
                <line x1={0} y1={0} x2={120} y2={300} stroke={INK} strokeWidth={5} />
                <path d="M-150 300 L150 300 C130 360 -130 360 -150 300 Z" fill="#c8962e" stroke={INK} strokeWidth={6} />
                <BekAt x={0} y={300} s={0.36} outfit={side < 0 ? 'jebe' : 'navkar'} mood={side < 0 ? 'happy' : 'worried'} blink={blinkAt(t, side + 1)} shadow={false} />
              </g>
            );
          })}
        </g>
      </g>
      <Burst x={140} y={1160} t={t} t0={65.6} color="#fff" />
    </g>
  );
};

// 67.3-end: what would you do with that young man? 1 kill, 2 let go, 3 take into the army
const IconSword: React.FC = () => (
  <g>
    <path d="M-12 -140 L12 -140 L16 40 L-16 40 Z" fill="#c9ced6" stroke={INK} strokeWidth={6} />
    <rect x={-60} y={40} width={120} height={22} rx={8} fill={GOLD} stroke={INK} strokeWidth={5} />
    <rect x={-12} y={62} width={24} height={60} rx={6} fill="#5a3a22" stroke={INK} strokeWidth={5} />
  </g>
);
const IconGo: React.FC = () => (
  <g fill="none" stroke="#fff" strokeWidth={18} strokeLinecap="round" strokeLinejoin="round">
    <path d="M-80 0 L70 0" />
    <path d="M20 -50 L80 0 L20 50" />
  </g>
);
const IconBanner: React.FC = () => (
  <g>
    <line x1={-40} y1={-140} x2={-40} y2={120} stroke="#5a3a22" strokeWidth={14} strokeLinecap="round" />
    <path d="M-40 -140 L90 -100 L-40 -50 Z" fill={RED} stroke={INK} strokeWidth={6} />
    <circle cx={-40} cy={-150} r={14} fill={GOLD} stroke={INK} strokeWidth={4} />
  </g>
);
const CHOICES = [
  {n: '1', label: "O'LDIRISH", at: 70.2, Icon: IconSword},
  {n: '2', label: "QO'YIB YUBORISH", at: 71.74, Icon: IconGo},
  {n: '3', label: "QO'SHINGA OLISH", at: 73.56, Icon: IconBanner},
];
const SceneVote: React.FC<{t: number}> = ({t}) => {
  let hi = -1;
  CHOICES.forEach((c, i) => {
    if (t >= c.at) hi = i;
  });
  if (t >= 75.4) hi = -1;
  return (
    <g>
      <Bg c0="#3a5a7a" c1="#0e1424" />
      <BekAt x={540} y={760} s={0.45} outfit="jebe" mood="worried" blink={blinkAt(t)} shadow={false} />
      {CHOICES.map((c, i) => {
        const x = 190 + i * 350;
        const on = hi === i;
        const p = pop(t, 67.5 + i * 0.12);
        return (
          <g key={c.n} transform={`translate(${x} 1020) scale(${p * (on ? 1.1 : 1)})`}>
            <rect x={-155} y={-200} width={310} height={420} rx={30} fill={on ? '#fbf1dc' : '#1b2233'} stroke={on ? GOLD : '#fff'} strokeWidth={on ? 10 : 5} />
            <g transform="translate(0 -40) scale(0.8)">
              <c.Icon />
            </g>
            <Text x={0} y={130} size={c.label.length > 10 ? 36 : 46} fill={on ? INK : '#fff'}>{c.label}</Text>
            <g transform="translate(0 220)">
              <circle r={60} fill={on ? RED : '#1b2233'} stroke="#fff" strokeWidth={6} />
              <Text x={0} y={30} size={84}>{c.n}</Text>
            </g>
          </g>
        );
      })}
      <g transform={`translate(540 1440) scale(${pop(t, 75.48)})`}>
        <rect x={-420} y={-80} width={840} height={160} rx={40} fill="#1b2233" stroke="#fff" strokeWidth={5} />
        <Text x={0} y={-12} size={46} fill="#cfd8ff">Izohlar</Text>
        <Text x={0} y={56} size={62} fill={GOLD}>1, 2 YOKI 3?</Text>
      </g>
      <FollowButton t={t} t0={FOLLOW_AT} />
    </g>
  );
};

const SCENES: [number, number, React.FC<{t: number}>][] = [
  [0, 4.55, SceneHookA],
  [4.55, 9.35, SceneHookB],
  [9.35, 14.4, SceneBek],
  [14.4, 19.5, SceneBow],
  [19.5, 23.8, SceneWho],
  [23.8, 26.6, SceneSilence],
  [26.6, 32.1, SceneConfess],
  [32.1, 41.0, SceneVerdict],
  [41.0, 44.2, SceneGeneral],
  [44.2, 47.95, SceneYears],
  [47.95, 54.6, SceneBring],
  [54.6, 59.45, SceneFace],
  [59.45, 62.1, SceneTraitors],
  [62.1, 67.3, SceneScale],
  [67.3, 99, SceneVote],
];

const PAIRS = ['TASAVVUR QIL', 'ENG KATTA', "O'NG QO'LI", 'KAMON OQINI', "KAMON O'QINI", "TO'RT YIL", 'KATTA MUKOFOT', "O'LIM TOPADI", 'MANA JAVOB'];
const HL = /^(CHINGIZXON|JEBE|JAMUXA|NEGA|KECHIRDI|O'LDIRISHNI|XOIN|MUKOFOT|TO'RT YIL|O'NG QO'LI|ROST|BIRINCHI|IKKINCHI|UCHINCHI|IZOHDA|JIM)/;
const chunks = buildChunks(words as W3[], PAIRS);

export const TQ4: React.FC<{at?: number}> = ({at}) => {
  useOswald();
  const cur = useCurrentFrame();
  const frame = at ?? cur;
  const real = frame / FPS;
  const t = toScene(real);
  const idx = SCENES.findIndex(([a, b]) => t >= a && t < b);
  const [a, , S] = SCENES[Math.max(0, idx)];
  const k = t - a;
  const soft = a === 0;
  const zoom = soft ? 1 : 1 + lerp(k, 0, 0.25, 0.06, 0);
  const flash = soft ? 0 : lerp(k, 0, 0.12, 0.35, 0);
  const end = TQ4_FRAMES / FPS;
  const endFade = lerp(real, end - 0.5, end, 0, 1);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
        <g transform={`translate(540 960) scale(${zoom}) translate(-540 -960)`}>
          <S t={t} />
        </g>
        <defs>
          <linearGradient id="capband" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#000" stopOpacity={0.6} />
            <stop offset="60%" stopColor="#000" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#000" stopOpacity={0} />
          </linearGradient>
        </defs>
        <rect width={W} height={470} fill="url(#capband)" />
        <rect width={W} height={H} fill="#fff" opacity={flash} />
      </svg>
      {at === undefined && real < VOICE_END + 0.6 && <Caption t={real} chunks={chunks} hl={HL} />}
      <AbsoluteFill style={{background: '#000', opacity: endFade}} />
    </AbsoluteFill>
  );
};

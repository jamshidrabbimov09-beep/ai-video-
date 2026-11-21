import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {FollowButton, BekAt, Bg, blinkAt, buildChunks, Burst, Caption, FPS, GOLD, H, INK, lerp, pop, RED, Text, useOswald, W, W3} from './common';
import words from './tq5_words.json';

// "Tasavvur qil" #5 "Chaqmoq sulton" (type 4 "Kim yutadi?"): Temur vs Yildirim Boyazid, Anqara, July 1402.
// Facts after Yazdi, Zafar-name 263a-266b. The winner is NOT shown.

const VOICE_END = 48.25;
const END_AT = 48.7; // end card + follow button
export const TQ5_FRAMES = Math.round((END_AT + 3.6) * FPS);

const ease = (x: number) => x * x * (3 - 2 * x);
const span = (t: number, a: number, b: number) => ease(lerp(t, a, b, 0, 1));
const mix = (a: number, b: number, k: number) => a + (b - a) * k;

// ---------- world ----------
export const Plain: React.FC<{t: number; hot?: number}> = ({t, hot = 0}) => (
  <g>
    <defs>
      <linearGradient id="sky5" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0%" stopColor="#ffd98a" />
        <stop offset="100%" stopColor="#7fb6e0" />
      </linearGradient>
    </defs>
    <rect width={W} height={H} fill="url(#sky5)" />
    {hot > 0 && <rect width={W} height={H} fill="#ff8a2a" opacity={hot * 0.35} />}
    <path d="M0 1060 L120 930 L230 1010 L380 860 L520 1000 L640 900 L800 1020 L930 920 L1080 1010 L1080 1920 L0 1920 Z" fill="#c9a06a" opacity={0.7} />
    <path d="M0 1150 C220 1100 480 1130 700 1160 C860 1140 980 1130 1080 1150 L1080 1920 L0 1920 Z" fill="#d8b878" />
    <rect y={1300} width={W} height={620} fill="#e2c486" />
    {[0, 1, 2, 3].map((i) => (
      <path key={i} d={`M${120 + i * 250} ${1420 + (i % 2) * 120} q20 -30 40 0`} stroke="#b8945a" strokeWidth={6} fill="none" opacity={0.6} />
    ))}
    {hot > 0 &&
      [0, 1, 2, 3, 4].map((i) => (
        <path
          key={i}
          d={`M${80 + i * 220} ${1250 - ((t * 120 + i * 90) % 400)} q30 -40 0 -80 q-30 -40 0 -80`}
          stroke="#fff"
          strokeWidth={6}
          fill="none"
          opacity={hot * 0.35}
        />
      ))}
  </g>
);

export const Sun: React.FC<{x: number; y: number; s: number; t: number}> = ({x, y, s, t}) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(${t * 20})`}>
    {Array.from({length: 12}).map((_, i) => (
      <path key={i} d="M-16 -150 L0 -210 L16 -150 Z" fill="#ffb21e" transform={`rotate(${i * 30})`} />
    ))}
    <circle r={130} fill="#ffcf3a" stroke="#ff9a1e" strokeWidth={10} />
  </g>
);

export const Bolt: React.FC<{x: number; y: number; s: number; k: number}> = ({x, y, s, k}) =>
  k <= 0 ? null : (
    <g transform={`translate(${x} ${y}) scale(${s * k})`}>
      <path d="M30 -260 L-90 20 L-10 20 L-50 260 L100 -60 L10 -60 L70 -260 Z" fill={GOLD} stroke={INK} strokeWidth={10} strokeLinejoin="round" />
    </g>
  );

export const Shackle: React.FC<{k: number}> = ({k}) => (
  <g transform={`scale(${k})`}>
    <circle cx={-70} cy={0} r={50} fill="none" stroke="#9aa3ad" strokeWidth={22} />
    <circle cx={70} cy={0} r={50} fill="none" stroke="#9aa3ad" strokeWidth={22} />
    <rect x={-30} y={-12} width={60} height={24} rx={10} fill="#6f7883" stroke={INK} strokeWidth={5} />
    <circle cx={-70} cy={0} r={61} fill="none" stroke={INK} strokeWidth={4} />
    <circle cx={70} cy={0} r={61} fill="none" stroke={INK} strokeWidth={4} />
  </g>
);

export const Elephant: React.FC<{x: number; y: number; s: number; t: number; archers?: boolean}> = ({x, y, s, t, archers = true}) => {
  const step = Math.sin(t * 5);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={0} cy={0} rx={260} ry={22} fill="#000" opacity={0.2} />
      {[-150, -70, 80, 160].map((lx, i) => (
        <rect key={lx} x={lx - 34} y={-230 + (i % 2 ? step : -step) * 8} width={68} height={230} rx={22} fill="#8b8f98" stroke={INK} strokeWidth={7} />
      ))}
      <path d="M-240 -260 C-250 -420 -100 -470 40 -460 C160 -450 230 -400 230 -280 C230 -200 160 -190 40 -190 L-150 -190 C-220 -190 -236 -210 -240 -260 Z" fill="#9aa0a9" stroke={INK} strokeWidth={7} />
      {/* armour blanket */}
      <path d="M-180 -440 C-80 -470 80 -470 170 -440 L190 -240 C80 -220 -80 -220 -200 -240 Z" fill="#8f1f1a" stroke={INK} strokeWidth={7} />
      {[-130, -60, 10, 80, 140].map((px) => (
        <rect key={px} x={px - 26} y={-400} width={52} height={60} rx={8} fill="#c9ced6" stroke={INK} strokeWidth={5} />
      ))}
      <path d="M-200 -260 C-80 -240 80 -240 190 -260" fill="none" stroke={GOLD} strokeWidth={12} />
      {/* head + trunk */}
      <path d="M170 -420 C260 -470 340 -420 340 -330 C340 -280 320 -250 330 -180 C338 -120 360 -80 390 -70 C400 -50 380 -36 360 -44 C310 -64 290 -120 284 -190 C270 -240 230 -250 200 -270 Z" fill="#9aa0a9" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
      <path d="M200 -420 C150 -400 140 -320 190 -280 C230 -300 240 -380 200 -420 Z" fill="#878d96" stroke={INK} strokeWidth={6} />
      <path d="M180 -430 L330 -400 L330 -340 L200 -360 Z" fill="#c9ced6" stroke={INK} strokeWidth={6} />
      <circle cx={300} cy={-330} r={10} fill={INK} />
      <path d="M300 -250 C330 -240 360 -250 380 -270" fill="none" stroke="#f4efe2" strokeWidth={16} strokeLinecap="round" />
      {/* howdah with archers */}
      {archers && (
        <g>
          <rect x={-140} y={-560} width={260} height={110} rx={12} fill="#c8962e" stroke={INK} strokeWidth={7} />
          {[-80, 50].map((ax, i) => (
            <g key={ax}>
              <BekAt x={ax} y={-470} s={0.34} outfit="soldier" mood="determined" blink={blinkAt(t, i + 3)} shadow={false} />
              <path d={`M${ax + 50} -690 C${ax + 110} -640 ${ax + 110} -560 ${ax + 50} -510`} fill="none" stroke="#5a3a22" strokeWidth={8} />
              <line x1={ax + 50} y1={-690} x2={ax + 50} y2={-510} stroke="#e9dcc3" strokeWidth={3} />
            </g>
          ))}
        </g>
      )}
    </g>
  );
};

export const Stump: React.FC<{x: number; y: number; r?: number}> = ({x, y, r = 0}) => (
  <g transform={`translate(${x} ${y}) rotate(${r})`}>
    <rect x={-60} y={-40} width={120} height={80} rx={10} fill="#8a5a2e" stroke={INK} strokeWidth={6} />
    <ellipse cx={60} cy={0} rx={18} ry={40} fill="#d9b27a" stroke={INK} strokeWidth={5} />
    <ellipse cx={60} cy={0} rx={8} ry={20} fill="none" stroke="#a87a44" strokeWidth={4} />
  </g>
);

export const Speech: React.FC<{x: number; y: number; k: number; children: React.ReactNode}> = ({x, y, k, children}) =>
  k <= 0 ? null : (
    <g transform={`translate(${x} ${y}) scale(${k})`}>
      <path d="M-300 -110 L300 -110 C330 -110 340 -100 340 -70 L340 70 C340 100 330 110 300 110 L40 110 L-20 180 L-30 110 L-300 110 C-330 110 -340 100 -340 70 L-340 -70 C-340 -100 -330 -110 -300 -110 Z" fill="#fff" stroke={INK} strokeWidth={8} />
      {children}
    </g>
  );

export const NumCard: React.FC<{x: number; y: number; n: string; label: string; k: number; on?: boolean}> = ({x, y, n, label, k, on}) =>
  k <= 0 ? null : (
    <g transform={`translate(${x} ${y}) scale(${k * (on ? 1.08 : 1)})`}>
      <rect x={-210} y={-70} width={420} height={140} rx={40} fill={on ? '#fbf1dc' : '#1b2233'} stroke={on ? GOLD : '#fff'} strokeWidth={on ? 10 : 6} />
      <circle cx={-140} cy={0} r={52} fill={RED} stroke="#fff" strokeWidth={6} />
      <Text x={-140} y={28} size={76}>{n}</Text>
      <Text x={40} y={24} size={label.length > 6 ? 58 : 70} fill={on ? INK : '#fff'}>{label}</Text>
    </g>
  );

// ---------- scenes ----------
// 0-6.3 hook: two rulers face to face, lightning between them; the loser becomes a captive
const SceneHook: React.FC<{t: number}> = ({t}) => {
  const z = mix(1.25, 1.0, span(t, 0, 2.2));
  const near = span(t, 0.2, 3.6);
  return (
    <g>
      <Bg c0="#5a2a1a" c1="#0d0a12" cy={50} />
      <g transform={`translate(540 1100) scale(${z}) translate(-540 -1100)`}>
        <BekAt x={mix(140, 270, near)} y={1760} s={1.05} outfit="temur" mood="determined" blink={blinkAt(t)} lookX={0.6} />
        <BekAt x={mix(940, 810, near)} y={1760} s={1.05} outfit="boyazid" mood="determined" blink={blinkAt(t, 2)} lookX={-0.6} />
        <Bolt x={540} y={900} s={0.9} k={pop(t, 0.5) * (t > 0.5 && Math.floor(t * 8) % 7 === 0 ? 1.15 : 1)} />
      </g>
      <Burst x={540} y={900} t={t} t0={0.5} color={GOLD} />
      <g transform="translate(540 1500)">
        <Shackle k={pop(t, 5.0)} />
      </g>
    </g>
  );
};

// 6.3-10.9 who wins? 1 Temur, 2 Sulton Boyazid
const SceneWho: React.FC<{t: number}> = ({t}) => (
  <g>
    <Bg c0="#3a5a7a" c1="#0e1424" />
    <BekAt x={270} y={1180} s={0.7} outfit="temur" mood="determined" blink={blinkAt(t)} lookX={0.4} shadow={false} />
    <BekAt x={810} y={1180} s={0.7} outfit="boyazid" mood="determined" blink={blinkAt(t, 2)} lookX={-0.4} shadow={false} />
    <Text x={540} y={880} size={150} fill={GOLD}>?</Text>
    <NumCard x={270} y={1380} n="1" label="TEMUR" k={pop(t, 7.3)} on={t >= 7.3 && t < 8.6} />
    <NumCard x={810} y={1380} n="2" label="BOYAZID" k={pop(t, 8.65)} on={t >= 8.65} />
  </g>
);

// 10.9-13.5 1402, Anqara: the hot plain, Bek watches from a hill
const SceneYear: React.FC<{t: number}> = ({t}) => (
  <g>
    <Plain t={t} hot={0.3} />
    <Sun x={840} y={640} s={0.8} t={t} />
    <g transform={`translate(540 1000) scale(${pop(t, 11.0)})`}>
      <rect x={-330} y={-110} width={660} height={220} rx={30} fill="#1b2233" stroke={GOLD} strokeWidth={8} />
      <Text x={0} y={-6} size={110} fill={GOLD}>1402</Text>
      <Text x={0} y={80} size={64} fill="#fff" >{t >= 12.7 ? 'ANQARA' : ''}</Text>
    </g>
    <BekAt x={250} y={1790} s={0.8} outfit="modern" mood="surprised" blink={blinkAt(t)} lookX={0.5} />
  </g>
);

// 13.5-17.0 the sultan's nickname: Yildirim = lightning
const SceneSultan: React.FC<{t: number}> = ({t}) => {
  const flash = t >= 16.0 ? lerp(t, 16.0, 16.5, 0.7, 0) : 0;
  return (
    <g>
      <Bg c0="#2a2f6a" c1="#0a0b1a" cy={40} />
      <Bolt x={830} y={700} s={0.8} k={pop(t, 15.95)} />
      <Bolt x={240} y={760} s={0.6} k={pop(t, 16.1)} />
      <BekAt x={540} y={1820} s={1.5} outfit="boyazid" mood={t > 16 ? 'determined' : 'neutral'} blink={blinkAt(t, 1)} />
      <rect width={W} height={H} fill="#fff" opacity={flash} />
    </g>
  );
};

// 17.0-19.0 he defeated the knights of Europe (striped shields knocked over)
const Shield: React.FC<{x: number; y: number; r: number; c: string}> = ({x, y, r, c}) => (
  <g transform={`translate(${x} ${y}) rotate(${r})`}>
    <path d="M-90 -120 L90 -120 L90 0 C90 80 30 120 0 140 C-30 120 -90 80 -90 0 Z" fill={c} stroke={INK} strokeWidth={8} />
    <path d="M-90 -40 L90 -40" stroke="#fff" strokeWidth={22} />
    <path d="M-90 30 L90 30" stroke="#fff" strokeWidth={22} />
  </g>
);
const SceneKnights: React.FC<{t: number}> = ({t}) => {
  const fall = span(t, 17.9, 18.7);
  return (
    <g>
      <Bg c0="#6a4a2a" c1="#1a1008" />
      {[
        [200, '#2f5f9a'],
        [420, '#2e7a4a'],
        [640, '#7a2f6a'],
        [860, '#b0782a'],
      ].map(([x, c], i) => (
        <Shield key={i} x={(x as number) + fall * (i % 2 ? 40 : -40)} y={1200 + fall * 260} r={fall * (i % 2 ? 70 : -70)} c={c as string} />
      ))}
      <BekAt x={540} y={1050} s={0.55} outfit="boyazid" mood="happy" blink={blinkAt(t)} shadow={false} />
      <Burst x={540} y={1300} t={t} t0={18.3} color={GOLD} />
    </g>
  );
};

// 19.0-23.9 men in steel from head to foot, only the eyes show
const SceneArmour: React.FC<{t: number}> = ({t}) => {
  const z = mix(1.0, 2.3, span(t, 22.0, 23.4));
  return (
    <g>
      <Bg c0="#4a4f57" c1="#0f1114" />
      <g transform={`translate(540 1000) scale(${z}) translate(-540 -1000)`}>
        {[[180, 1650], [900, 1650], [360, 1700], [720, 1700]].map(([x, y], i) => (
          <BekAt key={i} x={x} y={y} s={0.75} outfit="zirhli" mood="neutral" blink={0} shadow={false} />
        ))}
        <BekAt x={540} y={1760} s={0.95} outfit="zirhli" mood="neutral" blink={0} />
      </g>
    </g>
  );
};

// 23.9-28.4 Temur has armoured elephants with archers on them
const SceneElephant: React.FC<{t: number}> = ({t}) => {
  const walk = span(t, 23.9, 28.4);
  return (
    <g>
      <Plain t={t} />
      <BekAt x={170} y={1250} s={0.45} outfit="temur" mood="happy" blink={blinkAt(t)} lookX={0.5} />
      <Elephant x={mix(1300, 560, walk)} y={1740} s={1.0} t={t} archers={t >= 26.2} />
    </g>
  );
};

// 28.4-32.1 Temur's trick; an order is given
const SceneTrick: React.FC<{t: number}> = ({t}) => (
  <g>
    <Bg c0="#1f5a3a" c1="#06140c" cy={40} />
    <BekAt x={540} y={1820} s={1.4} outfit="temur" mood={t < 30.4 ? 'happy' : 'determined'} blink={blinkAt(t)} lookX={0.3} />
    <g transform={`translate(850 760) scale(${pop(t, 29.4)})`}>
      <circle r={90} fill={GOLD} stroke={INK} strokeWidth={8} />
      <rect x={-34} y={80} width={68} height={50} rx={10} fill="#9aa3ad" stroke={INK} strokeWidth={6} />
      {Array.from({length: 8}).map((_, i) => (
        <line key={i} x1={0} y1={-120} x2={0} y2={-160} stroke={GOLD} strokeWidth={10} strokeLinecap="round" transform={`rotate(${i * 45})`} />
      ))}
    </g>
    <g transform={`translate(260 800) scale(${pop(t, 31.0)}) rotate(-8)`}>
      <rect x={-130} y={-150} width={260} height={300} rx={14} fill="#f4e6c4" stroke={INK} strokeWidth={7} />
      {[-80, -30, 20, 70].map((y) => (
        <line key={y} x1={-90} y1={y} x2={90} y2={y} stroke="#b8945a" strokeWidth={8} strokeLinecap="round" />
      ))}
      <circle cx={70} cy={120} r={26} fill={RED} stroke={INK} strokeWidth={5} />
    </g>
  </g>
);

// 32.1-35.7 the small spring on the enemy side is blocked with tree stumps
const SceneSpring: React.FC<{t: number}> = ({t}) => {
  const dry = span(t, 34.2, 35.4);
  const drops = [32.7, 33.3, 33.9, 34.4];
  return (
    <g>
      <Plain t={t} />
      <path d="M-60 1250 L250 700 L470 1000 L620 780 L900 1250 Z" fill="#9c7a52" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
      <g transform="translate(560 1380)">
        <ellipse cx={0} cy={0} rx={300} ry={90} fill={dry > 0.95 ? '#b8945a' : '#4aa3df'} stroke={INK} strokeWidth={8} opacity={1} />
        <ellipse cx={0} cy={0} rx={300 * (1 - dry * 0.85)} ry={90 * (1 - dry * 0.85)} fill="#4aa3df" />
        {dry < 0.5 &&
          [0, 1, 2].map((i) => (
            <ellipse key={i} cx={0} cy={0} rx={((t * 120 + i * 90) % 260)} ry={((t * 36 + i * 27) % 78)} fill="none" stroke="#bfe4ff" strokeWidth={5} opacity={1 - ((t * 120 + i * 90) % 260) / 260} />
          ))}
        {drops.map((d, i) => {
          if (t < d) return null;
          const k = Math.min(1, (t - d) / 0.35);
          return <Stump key={i} x={-170 + i * 115} y={mix(-900, -10 - (i % 2) * 30, k)} r={(i % 2 ? 20 : -15) * k} />;
        })}
      </g>
      {drops.map((d) => (
        <Burst key={d} x={560} y={1360} t={t} t0={d + 0.35} color="#bfe4ff" />
      ))}
      <Text x={560} y={1600} size={60} fill={RED}>{t >= 35.0 ? 'SUV YOQ' : ''}</Text>
    </g>
  );
};

// 35.7-37.3 July. Scorching heat
const SceneHeat: React.FC<{t: number}> = ({t}) => (
  <g>
    <Plain t={t} hot={1} />
    <Sun x={540} y={820} s={mix(0.6, 1.3, span(t, 35.7, 37.2))} t={t} />
    <g transform={`translate(540 1300) scale(${pop(t, 35.75)})`}>
      <rect x={-200} y={-70} width={400} height={140} rx={30} fill="#1b2233" stroke={GOLD} strokeWidth={7} />
      <Text x={0} y={30} size={90} fill={GOLD}>IYUL</Text>
    </g>
  </g>
);

// 37.3-41.6 Temur said: most of the sultan's men are on foot, they will come tired
export const Walker: React.FC<{x: number; y: number; t: number; i: number; fast?: number}> = ({x, y, t, i, fast = 1}) => (
  <g>
    <BekAt x={x} y={y} s={0.55} outfit="sipohi" mood="worried" blink={blinkAt(t, i)} swing={Math.sin(t * 9 * fast + i) * 14} />
    <path d={`M${x + 70} ${y - 360 + ((t * 160 + i * 40) % 80)} q12 18 0 30 q-12 -12 0 -30 Z`} fill="#8fd0ff" stroke={INK} strokeWidth={3} />
  </g>
);
const SceneSaid: React.FC<{t: number}> = ({t}) => {
  const walk = (t - 37.3) * 60;
  return (
    <g>
      <Plain t={t} hot={0.7} />
      <Sun x={900} y={560} s={0.6} t={t} />
      {[0, 1, 2, 3, 4].map((i) => (
        <Walker key={i} x={((i * 230 + walk) % 1300) - 120} y={1780 + (i % 2) * 40} t={t} i={i} />
      ))}
      <BekAt x={230} y={1150} s={0.5} outfit="temur" mood="happy" blink={blinkAt(t, 1)} lookX={0.5} />
      <Speech x={600} y={760} k={pop(t, 37.6)}>
        <Text x={0} y={-10} size={64} fill={INK}>{t < 40.3 ? "KO'PI PIYODA" : 'CHARCHAB KELADI'}</Text>
        <Text x={0} y={60} size={40} fill="#6a5a4a">TEMUR</Text>
      </Speech>
    </g>
  );
};

// 41.6-44.3 so he deliberately hurried the sultan: the column has to run in the heat
const SceneRush: React.FC<{t: number}> = ({t}) => {
  const walk = (t - 41.6) * 260;
  return (
    <g>
      <Plain t={t} hot={1} />
      <Sun x={540} y={640} s={0.9} t={t} />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <Walker key={i} x={((i * 200 + walk) % 1300) - 120} y={1760 + (i % 2) * 50} t={t} i={i} fast={2.2} />
      ))}
      {[0, 1, 2].map((i) => (
        <ellipse key={i} cx={((i * 380 + walk) % 1300) - 260} cy={1820} rx={160} ry={50} fill="#e9d3a0" opacity={0.6} />
      ))}
      <BekAt x={780} y={1220} s={0.55} outfit="boyazid" mood="worried" blink={blinkAt(t, 2)} lookX={-0.4} />
      <g transform={`translate(330 1050) scale(${pop(t, 43.1)})`}>
        <path d="M-150 -40 L60 -40 L60 -90 L160 0 L60 90 L60 40 L-150 40 Z" fill={RED} stroke="#fff" strokeWidth={8} />
      </g>
    </g>
  );
};

// 44.3-48.7 vote: who wins? write the number
const SceneVote: React.FC<{t: number}> = ({t}) => {
  const hi = t >= 46.9 && t < 47.7 ? 0 : t >= 47.7 ? 1 : -1;
  return (
    <g>
      <Bg c0="#5a2a1a" c1="#0d0a12" cy={45} />
      <BekAt x={270} y={1250} s={0.75} outfit="temur" mood="determined" blink={blinkAt(t)} lookX={0.4} shadow={false} />
      <BekAt x={810} y={1250} s={0.75} outfit="boyazid" mood="determined" blink={blinkAt(t, 2)} lookX={-0.4} shadow={false} />
      <Bolt x={540} y={900} s={0.55} k={pop(t, 44.4)} />
      <NumCard x={270} y={1420} n="1" label="TEMUR" k={pop(t, 44.5)} on={hi === 0} />
      <NumCard x={810} y={1420} n="2" label="BOYAZID" k={pop(t, 44.6)} on={hi === 1} />
      <g transform={`translate(540 1640) scale(${pop(t, 45.8)})`}>
        <rect x={-360} y={-60} width={720} height={120} rx={36} fill="#1b2233" stroke="#fff" strokeWidth={5} />
        <Text x={0} y={22} size={58} fill={GOLD}>IZOHGA RAQAM YOZ</Text>
      </g>
    </g>
  );
};

// 48.7-end: end card pointing to the main history series
const SceneEnd: React.FC<{t: number}> = ({t}) => (
  <g>
    <Bg c0="#2a1a0e" c1="#070505" cy={40} />
    <g transform={`translate(540 860) scale(${pop(t, END_AT)})`}>
      <rect x={-420} y={-230} width={840} height={460} rx={40} fill="#1b2233" stroke={GOLD} strokeWidth={8} />
      <Text x={0} y={-120} size={52} fill="#cfd8ff">HAQIQIY TARIX HIKOYASI</Text>
      <Text x={0} y={-20} size={84} fill={GOLD}>PROFILDA</Text>
      
      <Text x={0} y={215} size={40} fill="#fff">AMIR TEMUR SERIALI</Text>
    </g>
    <BekAt x={540} y={1430} s={0.5} outfit="modern" mood="happy" blink={blinkAt(t)} shadow={false} />
    <FollowButton t={t} t0={END_AT + 0.3} line="YANGI QISMLAR HAR HAFTA" />
  </g>
);

const SCENES: [number, number, React.FC<{t: number}>][] = [
  [0, 6.3, SceneHook],
  [6.3, 10.9, SceneWho],
  [10.9, 13.5, SceneYear],
  [13.5, 16.95, SceneSultan],
  [16.95, 18.95, SceneKnights],
  [18.95, 23.85, SceneArmour],
  [23.85, 28.4, SceneElephant],
  [28.4, 32.05, SceneTrick],
  [32.05, 35.65, SceneSpring],
  [35.65, 37.25, SceneHeat],
  [37.25, 41.55, SceneSaid],
  [41.55, 44.25, SceneRush],
  [44.25, END_AT, SceneVote],
  [END_AT, 99, SceneEnd],
];

const PAIRS = ['TASAVVUR QIL', 'YUZMA-YUZ TURIBDI', 'ASIR BOLADI', "ASIR BO'LADI", 'KIM YENGADI?', 'BIRINCHI TEMUR', 'SULTON BOYAZID', "PO'LAT SOVUT", 'IZOHGA RAQAM', 'BIR YOKI'];
const HL = /^(TEMUR|BOYAZID|YILDIRIM|CHAQMOQ|ANQARA|MING|KIM|ASIR|FILLAR|HIYLASI|BULOQNI|JAZIRAMA|PIYODA|ATAYLAB|IZOHGA|BIRINCHI|IKKINCHI|FAQAT)/;
const FIX = {
  engadi: 'yengadi',
  enggan: 'yengan',
  ritzerlarini: 'ritsarlarini',
  sovit: 'sovut',
  "to'nkalarlar": "to'nkalar",
  chaqmoq: 'chaqmoq',
};
const chunks = buildChunks(words as W3[], PAIRS, FIX);

export const TQ5: React.FC<{at?: number}> = ({at}) => {
  useOswald();
  const cur = useCurrentFrame();
  const frame = at ?? cur;
  const t = frame / FPS;
  const idx = SCENES.findIndex(([a, b]) => t >= a && t < b);
  const [a, , S] = SCENES[Math.max(0, idx)];
  const k = t - a;
  const soft = a === 0;
  const zoom = soft ? 1 : 1 + lerp(k, 0, 0.25, 0.06, 0);
  const flash = soft ? 0 : lerp(k, 0, 0.12, 0.3, 0);
  const end = TQ5_FRAMES / FPS;
  const endFade = lerp(t, end - 0.4, end, 0, 1);
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
        {t < END_AT && <rect width={W} height={470} fill="url(#capband)" />}
        <rect width={W} height={H} fill="#fff" opacity={flash} />
      </svg>
      {at === undefined && t < VOICE_END + 0.5 && <Caption t={t} chunks={chunks} hl={HL} />}
      <AbsoluteFill style={{background: '#000', opacity: endFade}} />
    </AbsoluteFill>
  );
};

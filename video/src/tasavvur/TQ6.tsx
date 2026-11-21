import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {FollowButton, BekAt, Bg, blinkAt, buildChunks, Burst, Caption, FPS, GOLD, H, INK, lerp, pop, RED, Text, useOswald, W, W3} from './common';
import {GlobeMap} from './GlobeMap';
import {Bolt, Elephant, Plain, Speech, Stump, Sun, Walker} from './TQ5';
import words from './tq6_words.json';

// "Tasavvur qil" #6 "Sen Boyazidsan" (strategy v2): you are Sultan Boyazid, Temur is three days from Anqara.
// Three choices (each marked TAXMIN), then what really happened (Yazdi, Zafar-name 233b-266b), vote, bridge to the Temur series.

const VOICE_END = 88.1;
const BRIDGE_AT = 88.4;
// The word "Boyazid" was re-recorded twice (edit/voice_tq6.py): real time -> main-take timebase.
const seg = (t: number, a: number, b: number, c: number, d: number) => c + ((t - a) * (d - c)) / (b - a);
const toScene = (t: number) =>
  t < 1.85 ? t : t < 2.712 ? seg(t, 1.85, 2.712, 1.85, 2.6) : t < 82.244 ? t - 0.112 : t < 82.866 ? seg(t, 82.244, 82.866, 82.12, 82.53) : t - 0.336;
export const TQ6_FRAMES = Math.round((BRIDGE_AT + 0.336 + 4.4) * FPS);

const ease = (x: number) => x * x * (3 - 2 * x);
const span = (t: number, a: number, b: number) => ease(lerp(t, a, b, 0, 1));
const mix = (a: number, b: number, k: number) => a + (b - a) * k;
const wink = (t: number, t0: number) => (t >= t0 && t < t0 + 0.25 ? 1 : 0);
const wave = (t: number, a: number, b: number) => (t >= a && t < b ? Math.sin(t * 14) * 28 : 0);

// ---------- icons ----------
const IconSword: React.FC = () => (
  <g>
    <path d="M-12 -140 L12 -140 L16 40 L-16 40 Z" fill="#c9ced6" stroke={INK} strokeWidth={6} />
    <rect x={-60} y={40} width={120} height={22} rx={8} fill={GOLD} stroke={INK} strokeWidth={5} />
    <rect x={-12} y={62} width={24} height={60} rx={6} fill="#5a3a22" stroke={INK} strokeWidth={5} />
  </g>
);
const IconCastle: React.FC = () => (
  <g>
    <path d="M-110 120 L-110 -60 L-80 -60 L-80 -100 L-50 -100 L-50 -60 L-15 -60 L-15 -100 L15 -100 L15 -60 L50 -60 L50 -100 L80 -100 L80 -60 L110 -60 L110 120 Z" fill="#b9a27a" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
    <path d="M-30 120 L-30 40 C-30 10 30 10 30 40 L30 120 Z" fill="#5a3a22" stroke={INK} strokeWidth={6} />
    <line x1={-110} y1={-10} x2={110} y2={-10} stroke="#8a744e" strokeWidth={6} />
  </g>
);
const IconScroll: React.FC = () => (
  <g>
    <rect x={-90} y={-110} width={180} height={220} rx={12} fill="#f4e6c4" stroke={INK} strokeWidth={7} />
    {[-60, -20, 20, 60].map((y) => (
      <line key={y} x1={-60} y1={y} x2={60} y2={y} stroke="#b8945a" strokeWidth={8} strokeLinecap="round" />
    ))}
    <circle cx={50} cy={90} r={24} fill={RED} stroke={INK} strokeWidth={5} />
  </g>
);
const ICONS = [IconSword, IconCastle, IconScroll];
const LABELS = ['JANGGA CHIQ', "QAL'ADA KUT", 'ELCHI YUBOR'];

const Choice: React.FC<{x: number; y: number; i: number; k: number; on?: boolean; s?: number}> = ({x, y, i, k, on, s = 1}) => {
  if (k <= 0) return null;
  const I = ICONS[i];
  return (
    <g transform={`translate(${x} ${y}) scale(${k * s * (on ? 1.1 : 1)})`}>
      <rect x={-155} y={-200} width={310} height={420} rx={30} fill={on ? '#fbf1dc' : '#1b2233'} stroke={on ? GOLD : '#fff'} strokeWidth={on ? 10 : 5} />
      <g transform="translate(0 -40) scale(0.8)">
        <I />
      </g>
      <Text x={0} y={130} size={40} fill={on ? INK : '#fff'}>{LABELS[i]}</Text>
      <g transform="translate(0 220)">
        <circle r={60} fill={on ? RED : '#1b2233'} stroke="#fff" strokeWidth={6} />
        <Text x={0} y={30} size={84}>{String(i + 1)}</Text>
      </g>
    </g>
  );
};

// badge in the upper free area: "1-YO'L · TAXMIN"
const Badge: React.FC<{t: number; t0: number; n: number}> = ({t, t0, n}) => (
  <g transform={`translate(540 560) scale(${pop(t, t0)})`}>
    <rect x={-250} y={-50} width={500} height={100} rx={30} fill="#1b2233" stroke={GOLD} strokeWidth={6} />
    <Text x={-70} y={20} size={56} fill="#fff">{`${n}-YO'L`}</Text>
    <rect x={30} y={-34} width={200} height={68} rx={16} fill={RED} />
    <Text x={130} y={18} size={46} fill="#fff">TAXMIN</Text>
  </g>
);

const Dust: React.FC<{x: number; y: number; s: number; t: number}> = ({x, y, s, t}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {[0, 1, 2, 3, 4].map((i) => (
      <ellipse key={i} cx={i * 110 - 220 + Math.sin(t * 2 + i) * 14} cy={-Math.abs(Math.sin(i * 1.7)) * 50} rx={130} ry={70} fill="#e9d3a0" opacity={0.85} />
    ))}
    {[0, 1, 2, 3].map((i) => (
      <g key={i} transform={`translate(${i * 120 - 180} -40)`}>
        <line x1={0} y1={-90} x2={0} y2={40} stroke="#5a3a22" strokeWidth={8} />
        <path d="M0 -90 L60 -70 L0 -50 Z" fill={i % 2 ? RED : '#1f5a3a'} stroke={INK} strokeWidth={4} />
      </g>
    ))}
  </g>
);

const Village: React.FC<{x: number; y: number; t: number; fire: number}> = ({x, y, t, fire}) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-70} y={-80} width={140} height={80} fill="#d9b27a" stroke={INK} strokeWidth={6} />
    <path d="M-85 -80 L0 -140 L85 -80 Z" fill="#a8582e" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <rect x={-18} y={-50} width={36} height={50} fill="#5a3a22" />
    {fire > 0 &&
      [0, 1, 2].map((i) => (
        <circle key={i} cx={Math.sin(t * 2 + i) * 20} cy={-170 - i * 70 - ((t * 60) % 70)} r={40 + i * 14} fill="#6a6a6a" opacity={fire * (0.6 - i * 0.15)} />
      ))}
  </g>
);

const Crown: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-90 40 L-100 -50 L-50 0 L0 -70 L50 0 L100 -50 L90 40 Z" fill={GOLD} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
    <circle cx={0} cy={10} r={14} fill={RED} stroke={INK} strokeWidth={4} />
  </g>
);

const Rope: React.FC<{k: number}> = ({k}) =>
  k <= 0 ? null : (
    <g fill="none" stroke="#c8a46a" strokeWidth={12} strokeLinecap="round" opacity={k}>
      <path d="M110 470 C160 490 240 490 290 470" />
      <path d="M108 510 C160 530 240 530 292 510" />
    </g>
  );

// ---------- scenes ----------
// 0-4.8 hook: Bek is Sultan Boyazid, Temur's army raises dust on the horizon, "3 KUN"
const SceneHook: React.FC<{t: number}> = ({t}) => {
  const z = mix(1.18, 1.0, span(t, 0, 2.5));
  return (
    <g>
      <Plain t={t} />
      <Dust x={mix(1250, 760, span(t, 0, 4.8))} y={1180} s={1.1} t={t} />
      <g transform={`translate(540 1300) scale(${z}) translate(-540 -1300)`}>
        <BekAt x={420} y={1830} s={1.25} outfit="beksulton" mood={t < 3.5 ? 'happy' : 'surprised'} blink={wink(t, 1.2) || blinkAt(t)} lookX={t > 3.4 ? 0.7 : 0} swing={wave(t, 1.3, 2.6)} />
      </g>
      <g transform={`translate(860 640) scale(${pop(t, 0.15)})`}>
        <rect x={-150} y={-70} width={300} height={140} rx={30} fill={RED} stroke="#fff" strokeWidth={7} />
        <Text x={0} y={30} size={84}>3 KUN</Text>
      </g>
    </g>
  );
};

// 4.8-7.4 map: Temur's lands, Anqara, 3 days
const SceneMap: React.FC<{t: number}> = ({t}) => (
  <g>
    <Bg c0="#1d3a5a" c1="#06101c" />
    <GlobeMap
      uid="tq6"
      rot={[mix(62, 46, span(t, 4.8, 7.2)), 37]}
      scale={1250}
      cy={1150}
      reveal={0}
      flag={1}
      samLabel
      marks={[{text: 'ANQARA', lon: 32.85, lat: 39.93, at: 5.9, size: 54}]}
      t={t}
    />
    <g transform={`translate(540 1700) scale(${pop(t, 5.7)})`}>
      <rect x={-300} y={-60} width={600} height={120} rx={36} fill="#1b2233" stroke={GOLD} strokeWidth={6} />
      <Text x={0} y={22} size={56} fill={GOLD}>ANQARAGACHA 3 KUN</Text>
    </g>
  </g>
);

// 7.4-10.0 nickname: Yildirim = lightning
const SceneNick: React.FC<{t: number}> = ({t}) => {
  const flash = t >= 9.2 ? lerp(t, 9.2, 9.6, 0.6, 0) : 0;
  return (
    <g>
      <Bg c0="#2a2f6a" c1="#0a0b1a" cy={40} />
      <Bolt x={840} y={760} s={0.75} k={pop(t, 9.15)} />
      <Bolt x={230} y={820} s={0.55} k={pop(t, 9.3)} />
      <BekAt x={540} y={1840} s={1.45} outfit="beksulton" mood="determined" blink={blinkAt(t)} />
      <rect width={W} height={H} fill="#fff" opacity={flash} />
    </g>
  );
};

// 10.0-17.7 three choices
const SceneChoices: React.FC<{t: number}> = ({t}) => {
  const hi = t >= 15.6 ? 2 : t >= 13.6 ? 1 : t >= 11.7 ? 0 : -1;
  return (
    <g>
      <Bg c0="#3a5a7a" c1="#0e1424" />
      <BekAt x={540} y={830} s={0.5} outfit="beksulton" mood="worried" blink={blinkAt(t)} lookX={hi < 0 ? 0 : (hi - 1) * 0.8} shadow={false} />
      {[0, 1, 2].map((i) => (
        <Choice key={i} x={190 + i * 350} y={1180} i={i} k={pop(t, [11.7, 13.65, 15.65][i])} on={hi === i} />
      ))}
    </g>
  );
};

// 17.7-20.3 all three are a guess
const SceneTaxmin: React.FC<{t: number}> = ({t}) => (
  <g>
    <Bg c0="#5a2a1a" c1="#120806" />
    <g transform={`translate(540 860) rotate(-8) scale(${pop(t, 18.4)})`}>
      <rect x={-330} y={-110} width={660} height={220} rx={24} fill="none" stroke={RED} strokeWidth={16} />
      <Text x={0} y={45} size={150} fill={RED}>TAXMIN</Text>
    </g>
    <BekAt x={540} y={1840} s={0.95} outfit="beksulton" mood="happy" blink={wink(t, 19.4) || blinkAt(t)} swing={wave(t, 19.0, 20.2)} />
  </g>
);

// 20.3-31.7 way 1: battle in July heat, men on foot, armoured elephants
const SceneWay1: React.FC<{t: number}> = ({t}) => {
  const walk = (t - 20.3) * 70;
  return (
    <g>
      <Plain t={t} hot={t > 22.8 ? 1 : 0.3} />
      <Sun x={850} y={760} s={t > 22.8 ? 0.85 : 0.55} t={t} />
      {t < 28.9 &&
        [0, 1, 2, 3, 4].map((i) => <Walker key={i} x={((i * 230 + walk) % 1300) - 120} y={1790 + (i % 2) * 40} t={t} i={i} />)}
      {t >= 24.3 && t < 28.9 && (
        <g>
          <BekAt x={190} y={1250} s={0.5} outfit="temur" mood="happy" blink={blinkAt(t, 1)} lookX={0.5} />
          <Speech x={600} y={880} k={pop(t, 24.4)}>
            <Text x={0} y={-10} size={64} fill={INK}>{t < 27.5 ? "KO'PI PIYODA" : 'CHARCHAB KELADI'}</Text>
            <Text x={0} y={60} size={40} fill="#6a5a4a">TEMUR</Text>
          </Speech>
        </g>
      )}
      {t >= 28.9 && (
        <g>
          <Elephant x={mix(1250, 700, span(t, 28.9, 30.8))} y={1760} s={0.95} t={t} />
          <BekAt x={170} y={1830} s={0.8} outfit="beksulton" mood="surprised" blink={blinkAt(t)} lookX={0.7} />
        </g>
      )}
      <Badge t={t} t0={20.4} n={1} />
    </g>
  );
};

// 31.7-41.9 way 2: wait in the fortress while Temur raids the villages
const SceneWay2: React.FC<{t: number}> = ({t}) => {
  const fire = span(t, 36.3, 37.6);
  return (
    <g>
      <Plain t={t} />
      {[180, 420, 900].map((x, i) => (
        <Village key={x} x={x} y={1160 + (i % 2) * 30} t={t + i} fire={fire} />
      ))}
      {t >= 38.1 &&
        [0, 1, 2].map((i) => (
          <BekAt key={i} x={680 + i * 130} y={1520} s={0.42} outfit="sogd" mood="worried" blink={blinkAt(t, i)} swing={Math.sin(t * 12 + i) * 30} shadow={false} />
        ))}
      <g transform="translate(0 0)">
        <path d="M0 1380 L0 1260 L60 1260 L60 1220 L120 1220 L120 1260 L200 1260 L200 1220 L260 1220 L260 1260 L340 1260 L340 1220 L400 1220 L400 1260 L520 1260 L520 1920 L0 1920 Z" fill="#b9a27a" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
        {[1420, 1560, 1700, 1840].map((y) => (
          <line key={y} x1={0} y1={y} x2={520} y2={y} stroke="#8a744e" strokeWidth={6} />
        ))}
      </g>
      <BekAt x={270} y={1330} s={0.6} outfit="beksulton" mood={t > 38 ? 'worried' : 'neutral'} blink={blinkAt(t)} lookX={0.7} shadow={false} />
      <Badge t={t} t0={31.8} n={2} />
    </g>
  );
};

// 41.9-51.8 way 3: send an envoy; Temur once asked for one fortress: Kamax
const SceneWay3: React.FC<{t: number}> = ({t}) => {
  const walk = span(t, 42.0, 44.3);
  return (
    <g>
      <Bg c0="#4a3a6a" c1="#0c0a18" />
      {t < 44.4 && (
        <g>
          <BekAt x={mix(150, 760, walk)} y={1800} s={0.8} outfit="sipohi" mood="neutral" blink={blinkAt(t)} swing={Math.sin(t * 9) * 12} />
          <g transform={`translate(${mix(260, 870, walk)} 1330) scale(0.5)`}>
            <IconScroll />
          </g>
        </g>
      )}
      {t >= 44.4 && t < 49.6 && (
        <g>
          <BekAt x={260} y={1820} s={0.85} outfit="temur" mood="determined" blink={blinkAt(t, 2)} lookX={0.6} />
          <g transform={`translate(780 1180) scale(${pop(t, 45.4)})`}>
            <IconCastle />
            <Text x={0} y={230} size={80} fill={GOLD}>{t >= 46.7 ? 'KAMAX' : ''}</Text>
          </g>
          {t >= 47.5 && (
            <g transform={`translate(780 800) scale(${pop(t, 48.6)})`}>
              <Text x={0} y={0} size={70} fill="#fff">TINCHLIK?</Text>
            </g>
          )}
        </g>
      )}
      {t >= 49.6 && (
        <g>
          {[160, 380, 700, 920].map((x, i) => (
            <BekAt key={x} x={x} y={1800 + (i % 2) * 40} s={0.55} outfit="sipohi" mood={i % 2 ? 'happy' : 'neutral'} blink={blinkAt(t, i)} lookX={x < 540 ? 0.6 : -0.6} />
          ))}
          <BekAt x={540} y={1460} s={0.6} outfit="beksulton" mood="worried" blink={blinkAt(t)} shadow={false} />
          <Speech x={540} y={860} k={pop(t, 50.7)}>
            <Text x={0} y={22} size={80} fill={INK}>QO'RQDI!</Text>
          </Speech>
        </g>
      )}
      <Badge t={t} t0={42.0} n={3} />
    </g>
  );
};

// 51.8-55.6 what really happened: the sultan goes to battle
const SceneTruth: React.FC<{t: number}> = ({t}) => (
  <g>
    <Bg c0="#7a5a1a" c1="#140c04" />
    <g transform={`translate(540 760) scale(${pop(t, 51.95)})`}>
      <rect x={-420} y={-110} width={840} height={220} rx={30} fill="#fbf1dc" stroke={GOLD} strokeWidth={10} />
      <Text x={0} y={-12} size={60} fill={INK}>TARIX</Text>
      <Text x={0} y={70} size={72} fill={RED}>SHUNDAY BO'LGAN</Text>
    </g>
    <BekAt x={540} y={1840} s={1.0} outfit="beksulton" mood="determined" blink={blinkAt(t)} swing={t > 54.2 ? Math.sin(t * 10) * 18 : 0} />
    <g transform={`translate(860 1450) scale(${pop(t, 54.6)}) rotate(20)`}>
      <IconSword />
    </g>
  </g>
);

// 55.6-60.4 the small spring on the enemy side is blocked with stumps
const SceneSpring: React.FC<{t: number}> = ({t}) => {
  const drops = [57.6, 58.3, 59.0, 59.5];
  const dry = span(t, 59.4, 60.3);
  return (
    <g>
      <Plain t={t} />
      <path d="M-60 1250 L250 700 L470 1000 L620 780 L900 1250 Z" fill="#9c7a52" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
      <g transform="translate(560 1400)">
        <ellipse cx={0} cy={0} rx={300} ry={90} fill={dry > 0.95 ? '#b8945a' : '#4aa3df'} stroke={INK} strokeWidth={8} />
        <ellipse cx={0} cy={0} rx={300 * (1 - dry * 0.85)} ry={90 * (1 - dry * 0.85)} fill="#4aa3df" />
        {drops.map((d, i) => {
          if (t < d) return null;
          const k = Math.min(1, (t - d) / 0.35);
          return <Stump key={i} x={-170 + i * 115} y={mix(-900, -10 - (i % 2) * 30, k)} r={(i % 2 ? 20 : -15) * k} />;
        })}
      </g>
      {drops.map((d) => (
        <Burst key={d} x={560} y={1380} t={t} t0={d + 0.35} color="#bfe4ff" />
      ))}
    </g>
  );
};

// 60.4-65.8 the sultan's army loses; many who flee die of heat and thirst
const SceneFlee: React.FC<{t: number}> = ({t}) => {
  const walk = (t - 60.4) * 200;
  return (
    <g>
      <Plain t={t} hot={1} />
      <Sun x={540} y={700} s={0.95} t={t} />
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i} transform={`translate(${-((i * 230 + walk) % 1300) + 1180} ${1780 + (i % 2) * 50}) scale(-1 1)`}>
          <BekAt x={0} y={0} s={0.55} outfit="sipohi" mood="worried" blink={blinkAt(t, i)} swing={Math.sin(t * 18 + i) * 22} />
        </g>
      ))}
      <g transform={`translate(540 1250) scale(${pop(t, 62.6)})`}>
        <rect x={-260} y={-60} width={520} height={120} rx={30} fill="#1b2233" stroke={GOLD} strokeWidth={6} />
        <Text x={0} y={22} size={60} fill={GOLD}>SUV YO'Q</Text>
      </g>
    </g>
  );
};

// 65.8-72.5 the twist: who captured the sultan? The khan Temur himself put on the throne: Sulton Mahmudxon
const SceneTwist: React.FC<{t: number}> = ({t}) => (
  <g>
    <Bg c0="#5a1a3a" c1="#0c0410" />
    {t < 68.7 ? (
      <g>
        <Text x={540} y={1080} size={420} fill={GOLD}>?</Text>
        <BekAt x={540} y={1840} s={0.8} outfit="modern" mood="surprised" blink={blinkAt(t)} />
      </g>
    ) : (
      <g>
        <g transform="translate(330 1300) scale(0.55)">
          <rect x={-230} y={-40} width={460} height={60} rx={10} fill="#8f1f1a" stroke={INK} strokeWidth={6} />
          <path d="M-200 -40 L-200 -520 C-120 -580 120 -580 200 -520 L200 -40 Z" fill="#c8962e" stroke={INK} strokeWidth={6} />
          <path d="M-160 -60 L-160 -480 C-90 -530 90 -530 160 -480 L160 -60 Z" fill="#8f1f1a" stroke={INK} strokeWidth={5} />
        </g>
        <BekAt x={330} y={1290} s={0.45} outfit="mongol" mood="happy" blink={blinkAt(t, 3)} />
        <Crown x={330} y={940} s={0.55 * pop(t, 69.6)} />
        <BekAt x={820} y={1800} s={0.85} outfit="temur" mood="happy" blink={blinkAt(t, 1)} lookX={-0.7} swing={t > 69.3 && t < 70.4 ? -25 : 0} />
        <g transform={`translate(540 1560) scale(${pop(t, 71.0)})`}>
          <rect x={-380} y={-60} width={760} height={120} rx={30} fill="#1b2233" stroke={GOLD} strokeWidth={6} />
          <Text x={0} y={22} size={58} fill={GOLD}>SULTON MAHMUDXON</Text>
        </g>
      </g>
    )}
  </g>
);

// 72.5-81.8 the captive is brought; Temur has the rope removed, seats him, gives the royal robe
const SceneRobe: React.FC<{t: number}> = ({t}) => {
  const rope = t < 77.9 ? 1 : lerp(t, 77.9, 78.4, 1, 0);
  const robe = span(t, 80.3, 81.0);
  return (
    <g>
      <Bg c0="#1f5a3a" c1="#06140c" cy={40} />
      <BekAt x={280} y={1820} s={0.95} outfit="temur" mood={t > 76.7 ? 'happy' : 'determined'} blink={blinkAt(t, 1)} lookX={0.6} />
      <g transform={`translate(0 ${t > 78.9 ? span(t, 78.9, 79.5) * 40 : 0})`}>
        <BekAt x={790} y={1820} s={0.95} outfit="beksulton" mood={t > 80.3 ? 'happy' : 'worried'} blink={blinkAt(t)} lookX={-0.6} />
        <g transform="translate(790 1820) scale(0.95) translate(-200 -730)">
          <Rope k={rope} />
          {robe > 0 && (
            <path d="M120 330 C150 300 250 300 280 330 L310 670 L90 670 Z" fill={GOLD} stroke={INK} strokeWidth={6} opacity={robe * 0.9} />
          )}
        </g>
      </g>
      <Burst x={790} y={1300} t={t} t0={80.4} color={GOLD} />
      {t >= 80.3 && (
        <g transform={`translate(540 760) scale(${pop(t, 80.4)})`}>
          <rect x={-280} y={-60} width={560} height={120} rx={30} fill="#1b2233" stroke={GOLD} strokeWidth={6} />
          <Text x={0} y={22} size={62} fill={GOLD}>SHOH TO'NI</Text>
        </g>
      )}
    </g>
  );
};

// 81.8-88.4 vote
const SceneVote: React.FC<{t: number}> = ({t}) => {
  const hi = t >= 86.1 ? 2 : t >= 85.1 ? 1 : t >= 84.3 ? 0 : -1;
  return (
    <g>
      <Bg c0="#3a5a7a" c1="#0e1424" />
      <BekAt x={540} y={760} s={0.45} outfit="beksulton" mood="happy" blink={wink(t, 82.6) || blinkAt(t)} swing={wave(t, 82.8, 83.8)} shadow={false} />
      {[0, 1, 2].map((i) => (
        <Choice key={i} x={190 + i * 350} y={1060} i={i} k={pop(t, 81.95 + i * 0.12)} on={hi === i} />
      ))}
      <g transform={`translate(540 1440) scale(${pop(t, 86.9)})`}>
        <rect x={-380} y={-70} width={760} height={140} rx={40} fill="#1b2233" stroke="#fff" strokeWidth={5} />
        <Text x={0} y={24} size={62} fill={GOLD}>IZOHGA RAQAM YOZ</Text>
      </g>
    </g>
  );
};

// 88.4-end bridge to the Temur series
const SceneBridge: React.FC<{t: number}> = ({t}) => {
  const k = t - BRIDGE_AT;
  const z = 1.05 + k * 0.03;
  return (
    <g>
      <rect width={W} height={H} fill="#000" />
      <g transform={`translate(540 760) scale(${z}) translate(-540 -760)`}>
        <foreignObject x={0} y={0} width={W} height={1500}>
          <Img src={staticFile('p1img/i04.jpg')} style={{width: W, height: 1500, objectFit: 'cover'}} />
        </foreignObject>
      </g>
      <rect y={1050} width={W} height={870} fill="#000" opacity={0.75} />
      <g transform={`translate(540 1190) scale(${pop(t, BRIDGE_AT + 0.2)})`}>
        <Text x={0} y={-20} size={62} fill="#fff">TEMUR HAYOTI</Text>
        <Text x={0} y={70} size={76} fill={GOLD}>TEMUR SERIALIDA</Text>
        <Text x={0} y={150} size={48} fill="#cfd8ff">PROFILDA 1-QISM</Text>
      </g>
      <FollowButton t={t} t0={BRIDGE_AT + 1.0} line="KEYINGI ZAMONDA BIRGA BORAMIZ" />
    </g>
  );
};

const SCENES: [number, number, React.FC<{t: number}>][] = [
  [0, 4.8, SceneHook],
  [4.8, 7.4, SceneMap],
  [7.4, 10.0, SceneNick],
  [10.0, 17.7, SceneChoices],
  [17.7, 20.3, SceneTaxmin],
  [20.3, 31.7, SceneWay1],
  [31.7, 41.9, SceneWay2],
  [41.9, 51.8, SceneWay3],
  [51.8, 55.6, SceneTruth],
  [55.6, 60.4, SceneSpring],
  [60.4, 65.8, SceneFlee],
  [65.8, 72.5, SceneTwist],
  [72.5, 81.8, SceneRobe],
  [81.8, BRIDGE_AT, SceneVote],
  [BRIDGE_AT, 999, SceneBridge],
];

const PAIRS = ['TASAVVUR QIL', 'SULTON BOYAZIDSAN', 'UCH KUNDA', 'ENG QIZIQ', 'SULTON MAHMUDXON', 'SHOH TONINI', "SHOH TO'NINI", 'IZOHGA RAQAM'];
const HL = /^(TEMUR|BOYAZID|SULTON BOYAZIDSAN|YILDIRIM|CHAQMOQ|UCH KUNDA|ANQARA|TAXMIN|BIRINCHI|IKKINCHI|UCHINCHI|PIYODA|FILLAR|KAMAX|QO'RQDI|BULOQNI|SULTON MAHMUDXON|ENG QIZIQ|IZOHGA)/;
const FIX = {
  ankara: 'Anqara',
  "to'nkalarlar": "to'nkalar",
  jazirama: 'jazirama',
};
const chunks = buildChunks(words as W3[], PAIRS, FIX);

export const TQ6: React.FC<{at?: number}> = ({at}) => {
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
  const flash = soft ? 0 : lerp(k, 0, 0.12, 0.3, 0);
  const end = TQ6_FRAMES / FPS;
  const endFade = lerp(real, end - 0.4, end, 0, 1);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
        <g transform={`translate(540 960) scale(${zoom}) translate(-540 -960)`}>
          <S t={t} />
        </g>
        <defs>
          <linearGradient id="capband6" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#000" stopOpacity={0.6} />
            <stop offset="60%" stopColor="#000" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#000" stopOpacity={0} />
          </linearGradient>
        </defs>
        {t < BRIDGE_AT && <rect width={W} height={470} fill="url(#capband6)" />}
        <rect width={W} height={H} fill="#fff" opacity={flash} />
      </svg>
      {at === undefined && t < VOICE_END + 0.3 && <Caption t={t} chunks={chunks} hl={HL} />}
      <AbsoluteFill style={{background: '#000', opacity: endFade}} />
    </AbsoluteFill>
  );
};

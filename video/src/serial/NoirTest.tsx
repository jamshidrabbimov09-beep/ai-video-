import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';

// Deterministic random
const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

export const Grain: React.FC<{o?: number}> = ({o = 0.16}) => {
  const f = useCurrentFrame();
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, mixBlendMode: 'overlay', opacity: o}}>
      <filter id={`g${f}`}>
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={f % 50} />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter={`url(#g${f})`} />
    </svg>
  );
};

export const Vignette: React.FC<{s?: number}> = ({s = 0.85}) => (
  <AbsoluteFill
    style={{background: `radial-gradient(ellipse 75% 60% at 50% 50%, rgba(0,0,0,0) 40%, rgba(0,0,0,${s}) 100%)`}}
  />
);

export const Rain: React.FC<{n?: number; o?: number; slant?: number}> = ({n = 220, o = 0.35, slant = 0.18}) => {
  const f = useCurrentFrame();
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
      {Array.from({length: n}).map((_, i) => {
        const sp = 55 + rnd(i) * 45;
        const len = 40 + rnd(i + 9) * 70;
        const y = ((rnd(i + 3) * 2200 + f * sp) % 2200) - 200;
        const x = rnd(i + 5) * 1300 - 100 - y * slant;
        return (
          <line key={i} x1={x} y1={y} x2={x - len * slant} y2={y + len}
            stroke="#c9d6e0" strokeWidth={1 + rnd(i + 7) * 1.5} opacity={o * (0.4 + rnd(i + 1) * 0.6)} />
        );
      })}
    </svg>
  );
};

// Scene A: taxi under the street lamp
const Street: React.FC = () => {
  const f = useCurrentFrame();
  const flick = 0.92 + 0.08 * Math.sin(f * 0.9) * Math.sin(f * 0.37);
  const ember = 0.6 + 0.4 * Math.abs(Math.sin(f * 0.05));
  const blocks = [
    {x: -40, w: 300, h: 760}, {x: 230, w: 220, h: 980}, {x: 470, w: 330, h: 700}, {x: 790, w: 330, h: 900},
  ];
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920}>
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#03060a" />
            <stop offset="0.6" stopColor="#0d1c26" />
            <stop offset="1" stopColor="#1a2a30" />
          </linearGradient>
          <radialGradient id="cone" cx="0.5" cy="0" r="1">
            <stop offset="0" stopColor="#ffc46b" stopOpacity="0.55" />
            <stop offset="1" stopColor="#ffb04a" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="road" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#141c20" />
            <stop offset="1" stopColor="#05080a" />
          </linearGradient>
          <linearGradient id="refl" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffb85c" stopOpacity="0.5" />
            <stop offset="1" stopColor="#ffb85c" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="body" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#d8d4c8" />
            <stop offset="0.5" stopColor="#8a8780" />
            <stop offset="1" stopColor="#2b2b2a" />
          </linearGradient>
          <filter id="blur8"><feGaussianBlur stdDeviation="8" /></filter>
          <filter id="blur30"><feGaussianBlur stdDeviation="30" /></filter>
        </defs>
        <rect width="1080" height="1920" fill="url(#sky)" />
        {/* far haze blocks */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <rect key={i} x={i * 190 - 30} y={900 - rnd(i + 40) * 200} width={170} height={500} fill="#0e1820" opacity={0.8} />
        ))}
        {/* panel blocks with windows */}
        {blocks.map((b, bi) => (
          <g key={bi}>
            <rect x={b.x} y={1300 - b.h} width={b.w} height={b.h} fill="#070b0e" />
            {Array.from({length: Math.floor(b.h / 70)}).map((_, r) =>
              Array.from({length: Math.floor(b.w / 55)}).map((__, c) => {
                const k = bi * 1000 + r * 30 + c;
                if (rnd(k) > 0.12) return null;
                return (
                  <rect key={`${r}-${c}`} x={b.x + 18 + c * 55} y={1300 - b.h + 30 + r * 70} width={26} height={34}
                    fill={rnd(k + 2) > 0.5 ? '#e8a84a' : '#9fb7c2'} opacity={0.5 + rnd(k + 4) * 0.4} />
                );
              })
            )}
          </g>
        ))}
        {/* road */}
        <rect x="0" y="1300" width="1080" height="620" fill="url(#road)" />
        <rect x="0" y="1296" width="1080" height="10" fill="#1d262b" />
        {/* lamp reflection on wet road */}
        <rect x="700" y="1310" width="120" height="600" fill="url(#refl)" filter="url(#blur30)" opacity={flick} />
        {/* lamp light cone */}
        <polygon points="760,810 420,1320 1100,1320" fill="url(#cone)" opacity={flick} />
        <ellipse cx="760" cy="1330" rx="340" ry="40" fill="#ffb85c" opacity={0.18 * flick} filter="url(#blur30)" />
        {/* lamp pole */}
        <rect x="900" y="760" width="14" height="560" fill="#050708" />
        <path d="M907 770 Q 860 760 790 800" stroke="#050708" strokeWidth="12" fill="none" />
        <rect x="735" y="796" width="60" height="16" rx="6" fill="#ffe0a8" opacity={flick} />
        <circle cx="765" cy="815" r="60" fill="#ffc46b" opacity={0.35 * flick} filter="url(#blur30)" />
        {/* taxi: Lada-like boxy sedan, side view */}
        <g transform="translate(160,1050)">
          <ellipse cx="370" cy="275" rx="420" ry="30" fill="#000" opacity="0.7" filter="url(#blur8)" />
          {/* body */}
          <path d="M20 170 L60 120 L210 110 L270 40 L520 40 L590 110 L720 125 L745 170 L745 235 L20 235 Z" fill="url(#body)" />
          {/* windows */}
          <path d="M228 108 L280 55 L390 55 L390 108 Z" fill="#1a1308" />
          <path d="M405 55 L510 55 L565 108 L405 108 Z" fill="#0b0e10" />
          {/* driver silhouette + ember */}
          <circle cx="335" cy="78" r="20" fill="#000" />
          <rect x="315" y="92" width="44" height="20" fill="#000" />
          <circle cx="362" cy="88" r="3.5" fill="#ff5a1f" opacity={ember} />
          <circle cx="362" cy="88" r="12" fill="#ff5a1f" opacity={0.3 * ember} filter="url(#blur8)" />
          <rect x="228" y="56" width="162" height="52" fill="#ffb04a" opacity="0.08" />
          {/* checker sign */}
          <rect x="360" y="16" width="70" height="24" fill="#e9c94a" />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <rect key={i} x={360 + (i % 6) * 11.6} y={i % 2 ? 16 : 28} width="11.6" height="12" fill="#111" />
          ))}
          {/* trim, door line, handles */}
          <rect x="20" y="168" width="725" height="6" fill="#c9c6bd" />
          <line x1="398" y1="110" x2="398" y2="232" stroke="#3a3a38" strokeWidth="3" />
          <rect x="300" y="140" width="34" height="7" fill="#222" />
          <rect x="455" y="140" width="34" height="7" fill="#222" />
          {/* lights */}
          <rect x="732" y="140" width="16" height="22" fill="#fff6d8" />
          <ellipse cx="900" cy="170" rx="200" ry="60" fill="#fff0c8" opacity="0.25" filter="url(#blur30)" />
          <rect x="16" y="140" width="12" height="24" fill="#d0201a" />
          <circle cx="16" cy="152" r="26" fill="#ff2a1a" opacity="0.35" filter="url(#blur8)" />
          {/* wheels */}
          {[150, 610].map((x) => (
            <g key={x}>
              <circle cx={x} cy="235" r="56" fill="#060606" />
              <circle cx={x} cy="235" r="26" fill="#3d3d3b" />
              <circle cx={x} cy="235" r="8" fill="#777" />
            </g>
          ))}
          {/* reflection of car on wet road */}
          <g transform="translate(0,560) scale(1,-1)" opacity="0.18" filter="url(#blur8)">
            <path d="M20 170 L60 120 L210 110 L270 40 L520 40 L590 110 L720 125 L745 170 L745 235 L20 235 Z" fill="#9a968c" />
          </g>
        </g>
      </svg>
      <Rain />
      <Vignette />
      <Grain />
      <Title />
    </AbsoluteFill>
  );
};

const Title: React.FC = () => (
  <AbsoluteFill style={{alignItems: 'center', paddingTop: 260}}>
    <div style={{fontFamily: 'Liberation Serif, serif', color: '#e9dcc0', fontSize: 104, letterSpacing: 22,
      textShadow: '0 0 30px rgba(0,0,0,0.9)'}}>TOSHKENT</div>
    <div style={{fontFamily: 'Liberation Serif, serif', color: '#c8312a', fontSize: 64, letterSpacing: 30, marginTop: 10}}>
      1994
    </div>
  </AbsoluteFill>
);

const Sub: React.FC<{t: string}> = ({t}) => (
  <AbsoluteFill style={{justifyContent: 'flex-start', alignItems: 'center', paddingTop: 300}}>
    <div style={{fontFamily: 'Liberation Serif, serif', color: '#f1e8d6', fontSize: 62, textAlign: 'center',
      maxWidth: 900, lineHeight: 1.25, textShadow: '0 3px 18px #000, 0 0 4px #000'}}>{t}</div>
  </AbsoluteFill>
);

// Scene B: headlights chasing through the rear window
const Chase: React.FC = () => {
  const f = useCurrentFrame();
  const sway = Math.sin(f * 0.15) * 25;
  const near = 1 + 0.15 * Math.sin(f * 0.07);
  return (
    <AbsoluteFill style={{background: '#020304'}}>
      <svg width={1080} height={1920}>
        <defs>
          <radialGradient id="hl">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.15" stopColor="#fff3d6" stopOpacity="0.9" />
            <stop offset="1" stopColor="#ffd9a0" stopOpacity="0" />
          </radialGradient>
          <filter id="b12"><feGaussianBlur stdDeviation="12" /></filter>
          <clipPath id="win"><path d="M120 620 Q 540 520 960 620 L 1010 1180 Q 540 1240 70 1180 Z" /></clipPath>
        </defs>
        {/* street seen through the rear window */}
        <g clipPath="url(#win)">
          <rect width="1080" height="1920" fill="#0a1218" />
          <rect y="1000" width="1080" height="300" fill="#05090c" />
          {[0, 1, 2].map((i) => (
            <rect key={i} x={(i * 420 - f * 6) % 1300 - 100} y={640} width={200} height={360} fill="#070c10" />
          ))}
          {/* two cars' headlights */}
          {[{cx: 420 + sway, cy: 960, s: near}, {cx: 700 - sway * 0.6, cy: 900, s: 0.6}].map((c, i) => (
            <g key={i} transform={`translate(${c.cx},${c.cy}) scale(${c.s})`}>
              <circle cx={-80} cy={0} r={150} fill="url(#hl)" />
              <circle cx={80} cy={0} r={150} fill="url(#hl)" />
              <rect x={-420} y={-6} width={840} height={12} fill="#fff1d0" opacity="0.35" filter="url(#b12)" />
            </g>
          ))}
          <Rain n={120} o={0.5} slant={-0.05} />
        </g>
        {/* car interior frame */}
        <path d="M0 0 H1080 V1920 H0 Z M120 620 Q 540 520 960 620 L 1010 1180 Q 540 1240 70 1180 Z"
          fill="#030405" fillRule="evenodd" />
        {/* back seat and passenger silhouette */}
        <rect x="0" y="1260" width="1080" height="660" fill="#0b0b0c" />
        <path d="M600 1900 L600 1330 Q 600 1250 690 1240 L 860 1240 Q 950 1250 950 1330 L950 1900 Z" fill="#000" />
        <circle cx="775" cy="1150" r="85" fill="#000" />
        <path d="M720 1235 Q 775 1265 830 1235 L 840 1260 L 710 1260 Z" fill="#000" />
        {/* rim light from headlights on the head */}
        <path d="M700 1105 Q 730 1060 790 1066" stroke="#ffe6b8" strokeWidth="5" fill="none" opacity="0.6" />
      </svg>
      <Vignette s={0.7} />
      <Grain o={0.2} />
      <Sub t="Orqada faralar yondi." />
    </AbsoluteFill>
  );
};

// Scene C: the bag, the money and key 14
const Bag: React.FC = () => {
  const f = useCurrentFrame();
  const lx = 540 + Math.sin(f * 0.04) * 60;
  return (
    <AbsoluteFill style={{background: '#040404'}}>
      <svg width={1080} height={1920}>
        <defs>
          <radialGradient id="torch" cx={lx / 1080} cy="0.58" r="0.42">
            <stop offset="0" stopColor="#fff2d0" stopOpacity="0.55" />
            <stop offset="0.6" stopColor="#ffd890" stopOpacity="0.12" />
            <stop offset="1" stopColor="#000" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="brass" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#f3d38a" />
            <stop offset="0.5" stopColor="#a87a2c" />
            <stop offset="1" stopColor="#5b3e12" />
          </linearGradient>
          <filter id="sh"><feGaussianBlur stdDeviation="10" /></filter>
        </defs>
        {/* seat texture */}
        <rect width="1080" height="1920" fill="#16110e" />
        {Array.from({length: 14}).map((_, i) => (
          <line key={i} x1={0} y1={i * 150} x2={1080} y2={i * 150 + 40} stroke="#0a0806" strokeWidth={8} />
        ))}
        {/* open bag */}
        <path d="M150 760 Q 540 680 930 760 L 990 1560 Q 540 1640 90 1560 Z" fill="#141516" />
        <path d="M200 800 Q 540 740 880 800 L 920 1500 Q 540 1560 160 1500 Z" fill="#0b0c0d" />
        <path d="M150 760 Q 540 680 930 760" stroke="#3b3d3f" strokeWidth="14" fill="none" />
        {/* cash bundles */}
        {Array.from({length: 12}).map((_, i) => {
          const c = i % 4, r = Math.floor(i / 4);
          const x = 230 + c * 165 + (r % 2) * 30, y = 860 + r * 190;
          const rot = (rnd(i + 70) - 0.5) * 14;
          const green = i % 3 !== 0;
          return (
            <g key={i} transform={`rotate(${rot} ${x + 75} ${y + 50})`}>
              <rect x={x} y={y} width={160} height={100} fill={green ? '#4f6a48' : '#8f7a5a'} stroke="#20281e" strokeWidth={3} />
              <rect x={x + 8} y={y + 8} width={144} height={84} fill="none" stroke={green ? '#788f6e' : '#b49c74'} strokeWidth={2} />
              <rect x={x + 62} y={y} width={36} height={100} fill="#d8ccb0" />
              <circle cx={x + 34} cy={y + 50} r={18} fill="none" stroke={green ? '#2e4029' : '#5a4a32'} strokeWidth={3} />
            </g>
          );
        })}
        {/* key with tag 14 */}
        <g transform="translate(470,1150) rotate(-18)">
          <ellipse cx="90" cy="40" rx="200" ry="40" fill="#000" opacity="0.6" filter="url(#sh)" />
          <circle cx="0" cy="0" r="46" fill="url(#brass)" />
          <circle cx="0" cy="0" r="18" fill="#0b0c0d" />
          <rect x="40" y="-12" width="220" height="24" fill="url(#brass)" />
          <path d="M210 12 v26 h18 v-14 h14 v22 h18 v-34 Z" fill="url(#brass)" />
          <line x1="-30" y1="-30" x2="-110" y2="-120" stroke="#cdb98a" strokeWidth="4" />
          <g transform="translate(-200,-210) rotate(10)">
            <rect width="120" height="80" rx="8" fill="#e6dcc2" />
            <circle cx="104" cy="16" r="7" fill="#2a2a2a" />
            <text x="50" y="60" textAnchor="middle" fontFamily="Liberation Serif, serif" fontSize="52" fill="#8b1e18">14</text>
          </g>
        </g>
        {/* flashlight */}
        <rect width="1080" height="1920" fill="url(#torch)" style={{mixBlendMode: 'screen'}} />
        <rect width="1080" height="1920" fill="#000" opacity="0.35" />
        <rect width="1080" height="1920" fill="url(#torch)" style={{mixBlendMode: 'screen'}} />
      </svg>
      <Vignette s={0.9} />
      <Grain o={0.2} />
      <Sub t="Pulning tagida esa — bitta eski kalit." />
    </AbsoluteFill>
  );
};

export const NoirTest: React.FC<{scene: string}> = ({scene}) =>
  scene === 'chase' ? <Chase /> : scene === 'bag' ? <Bag /> : <Street />;

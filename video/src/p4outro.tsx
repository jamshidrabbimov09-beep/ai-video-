// Part 4 outro (2026-11-13, user's wish): a direct question to the viewer (HA / YO'Q) and a subscribe-button animation:
// a hand taps the button, it changes from gold "OBUNA BO'LING" to grey "OBUNA BO'LINDI" with a tick, the bell rings.
// Own style and synthesized sounds only (no YouTube logo or sounds).
import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, Easing} from 'remotion';

const GOLD = '#d4af37';
const CREAM = '#f5ecd5';
const font = '"Liberation Serif", "DejaVu Serif", Georgia, serif';
const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};

/* question card: a poll sticker just above the subtitle band */
export const QuestionCard: React.FC<{d: number; pop?: number; v?: string}> = ({d, pop: P0 = 20, v = 'A'}) => {
  const fr = useCurrentFrame();
  const a = Math.min(interpolate(fr, [0, 12], [0, 1], cl), interpolate(fr, [d - 8, d], [1, 0], cl));
  const pop = (s: number) => interpolate(fr, [s, s + 12], [0, 1], {...cl, easing: Easing.out(Easing.back(2))});
  // a poll-sticker card (familiar from Instagram stories): one light card, two halves HA | YO'Q, just above the subtitles
  const p = pop(P0);
  const pulse = 1 + 0.025 * Math.sin(Math.max(0, fr - P0 - 14) / 5);
  const half = (t: string, col: string, s: number) => (
    <div style={{flex: 1, textAlign: 'center', padding: '30px 0', fontFamily: font, fontWeight: 700, fontSize: 70, letterSpacing: 5, color: col, opacity: interpolate(fr, [s, s + 8], [0, 1], cl)}}>{t}</div>
  );
  if (v !== 'A') return <AbsoluteFill style={{opacity: a}}><div style={{position: 'absolute', left: 0, right: 0, top: 900, bottom: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0), rgba(0,0,0,0.55) 45%)'}} /><QVariant v={v} fr={fr} P0={P0} /></AbsoluteFill>;
  return (
    <AbsoluteFill style={{opacity: a}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 900, bottom: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0), rgba(0,0,0,0.55) 45%)'}} />
      <div style={{position: 'absolute', left: 170, right: 170, top: 1150, transform: `scale(${p * pulse})`, transformOrigin: '50% 50%'}}>
        <div style={{display: 'flex', alignItems: 'stretch', background: 'rgba(250,244,230,0.96)', borderRadius: 34, boxShadow: '0 14px 50px rgba(0,0,0,0.65)', overflow: 'hidden', border: `3px solid ${GOLD}`}}>
          {half('HA', '#2f6b3c', P0 + 4)}
          <div style={{width: 3, background: 'rgba(120,100,60,0.35)'}} />
          {half("YO'Q", '#a8321e', P0 + 8)}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* subscribe end card: TAP is the frame of the tap (the click sound is placed there in edit_p4.py) */
export const SUB_TAP = 26;
export const SubscribeEnd: React.FC<{d: number}> = ({d}) => {
  const fr = useCurrentFrame();
  const a = interpolate(fr, [0, 12], [0, 1], cl);
  const done = fr >= SUB_TAP + 2;
  // hand: comes from bottom right, taps, leaves
  const hin = interpolate(fr, [4, SUB_TAP - 4], [0, 1], {...cl, easing: Easing.out(Easing.cubic)});
  const hout = interpolate(fr, [SUB_TAP + 10, SUB_TAP + 26], [0, 1], {...cl, easing: Easing.in(Easing.cubic)});
  const press = interpolate(fr, [SUB_TAP - 4, SUB_TAP, SUB_TAP + 6], [0, 1, 0], cl);
  const hx = 760 + (1 - hin) * 300 + hout * 300, hy = 1035 + (1 - hin) * 420 + hout * 420 + press * 18;
  const bs = 1 - press * 0.06 + (done ? interpolate(fr, [SUB_TAP + 2, SUB_TAP + 10], [0.06, 0], cl) : 0);
  const ring = done ? Math.sin((fr - SUB_TAP) / 1.6) * 22 * Math.exp(-(fr - SUB_TAP) / 14) : 0;
  const tick = interpolate(fr, [SUB_TAP + 2, SUB_TAP + 10], [0, 1], cl);
  return (
    <AbsoluteFill style={{background: `rgba(0,0,0,${0.9 * a})`, opacity: a}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 470, textAlign: 'center'}}>
        <div style={{display: 'inline-block', width: 300, height: 300, borderRadius: '50%', boxShadow: '0 0 60px rgba(212,175,55,0.40)', opacity: interpolate(fr, [0, 14], [0, 1], cl), transform: `scale(${interpolate(fr, [0, 18], [0.92, 1], {...cl, easing: Easing.out(Easing.cubic)})})`}}>
          <Img src={staticFile('maps/uq_avatar_c.png')} style={{width: 300, height: 300, display: 'block'}} />
        </div>
        <div style={{fontFamily: font, color: GOLD, fontWeight: 700, fontSize: 64, letterSpacing: 6, marginTop: 24}}>UNUTILGAN QISSALAR</div>
        <div style={{fontFamily: font, color: CREAM, fontSize: 40, letterSpacing: 4, marginTop: 10}}>@unutilgan_qissalar</div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 950, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 34}}>
        <div style={{transform: `scale(${bs})`, padding: '30px 64px', borderRadius: 70, background: done ? '#4a4540' : GOLD, color: done ? '#e8e0cc' : '#1a120a', fontFamily: font, fontWeight: 700, fontSize: 58, letterSpacing: 3, boxShadow: done ? 'none' : '0 0 50px rgba(212,175,55,0.55)', display: 'flex', alignItems: 'center', gap: 18}}>
          {done && <svg width={50} height={50}><path d="M 8 26 L 20 38 L 42 12" stroke="#e8e0cc" strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={`${tick} 1`} /></svg>}
          {done ? "OBUNA BO'LINDI" : "OBUNA BO'LING"}
        </div>
        <svg width={90} height={96} style={{transform: `rotate(${ring}deg)`, transformOrigin: '45px 10px'}}>
          <path d="M 45 8 C 22 8 18 30 18 46 L 18 64 L 8 76 L 82 76 L 72 64 L 72 46 C 72 30 68 8 45 8 Z" fill={done ? GOLD : 'none'} stroke={GOLD} strokeWidth={6} strokeLinejoin="round" />
          <circle cx={45} cy={86} r={8} fill={GOLD} />
        </svg>
      </div>
      {hout < 1 && <svg width={200} height={240} style={{position: 'absolute', left: hx - 60, top: hy - 20}}>
        <g transform="scale(1.6)" fill="#f2d7bf" stroke="#2a1f14" strokeWidth={4} strokeLinejoin="round">
          <path d="M 38 4 C 46 4 48 10 48 16 L 48 62 L 54 58 C 62 54 70 56 72 64 L 74 70 C 84 66 92 70 92 80 C 100 78 106 84 104 94 L 100 122 C 98 134 88 142 76 142 L 50 142 C 40 142 34 136 28 126 L 10 92 C 6 84 12 76 20 80 L 28 88 L 28 16 C 28 9 31 4 38 4 Z" />
        </g>
      </svg>}
    </AbsoluteFill>
  );
};

/* alternative designs for the HA / YO'Q card, shown to the user for choice */
const QVariant: React.FC<{v: string; fr: number; P0: number}> = ({v, fr, P0}) => {
  const pop = (s: number) => interpolate(fr, [s, s + 12], [0, 1], {...cl, easing: Easing.out(Easing.back(2))});
  const pulse = (k: number) => 1 + 0.03 * Math.sin(Math.max(0, fr - P0 - 14) / 5 + k);
  if (v === 'B') {   // two round seals: a gold coin and a red wax seal
    const seal = (t: string, bg: string, ring: string, col: string, k: number) => (
      <div style={{width: 250, height: 250, borderRadius: '50%', background: bg, border: `8px double ${ring}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 12px 40px rgba(0,0,0,0.7), inset 0 -10px 30px rgba(0,0,0,0.35)', transform: `scale(${pop(P0 + k * 6) * pulse(k)})`}}>
        <span style={{fontFamily: font, fontWeight: 700, fontSize: 74, color: col, letterSpacing: 4, textShadow: '0 2px 6px rgba(0,0,0,0.5)'}}>{t}</span>
      </div>
    );
    return <div style={{position: 'absolute', left: 0, right: 0, top: 1080, display: 'flex', justifyContent: 'center', gap: 90}}>
      {seal('HA', 'radial-gradient(circle at 35% 30%, #f6dc7a, #c9a227 60%, #8a6a14)', '#6b4f0e', '#3a2a06', 0)}
      {seal("YO'Q", 'radial-gradient(circle at 35% 30%, #d0564a, #9b2a20 60%, #5e140e)', '#3d0b07', '#f5ecd5', 1)}
    </div>;
  }
  if (v === 'C') {   // dark glass bar with a gold frame
    const p = pop(P0);
    return <div style={{position: 'absolute', left: 150, right: 150, top: 1160, transform: `scale(${p * pulse(0)})`}}>
      <div style={{display: 'flex', background: 'rgba(15,10,5,0.78)', border: `3px solid ${GOLD}`, borderRadius: 20, boxShadow: '0 0 40px rgba(212,175,55,0.35)', overflow: 'hidden'}}>
        <div style={{flex: 1, textAlign: 'center', padding: '28px 0', fontFamily: font, fontWeight: 700, fontSize: 68, letterSpacing: 6, color: GOLD}}>HA</div>
        <div style={{width: 2, background: GOLD, opacity: 0.6, margin: '18px 0'}} />
        <div style={{flex: 1, textAlign: 'center', padding: '28px 0', fontFamily: font, fontWeight: 700, fontSize: 68, letterSpacing: 6, color: '#e07a5f'}}>YO'Q</div>
      </div>
    </div>;
  }
  // D: quiz style, two stacked answers with a tick and a cross
  const row = (icon: React.ReactNode, t: string, col: string, k: number) => (
    <div style={{display: 'flex', alignItems: 'center', gap: 30, padding: '20px 40px', margin: '0 0 22px', background: 'rgba(250,244,230,0.95)', borderRadius: 26, boxShadow: '0 10px 34px rgba(0,0,0,0.6)', transform: `translateX(${(1 - pop(P0 + k * 6)) * (k ? 600 : -600)}px)`}}>
      {icon}<span style={{fontFamily: font, fontWeight: 700, fontSize: 62, letterSpacing: 4, color: col}}>{t}</span>
    </div>
  );
  return <div style={{position: 'absolute', left: 230, right: 230, top: 1000}}>
    {row(<svg width={64} height={64}><circle cx={32} cy={32} r={30} fill="#2f6b3c" /><path d="M 18 33 L 28 43 L 47 22" stroke="#fff" strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>, 'HA', '#2f6b3c', 0)}
    {row(<svg width={64} height={64}><circle cx={32} cy={32} r={30} fill="#a8321e" /><path d="M 21 21 L 43 43 M 43 21 L 21 43" stroke="#fff" strokeWidth={7} strokeLinecap="round" /></svg>, "YO'Q", '#a8321e', 1)}
  </div>;
};

/* preview composition for choosing a variant: last still behind the card */
export const QPreview: React.FC<{v: string}> = ({v}) => (
  <AbsoluteFill style={{background: '#000'}}>
    <Img src={staticFile('p4g/warm/l37.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.12)'}} />
    <QuestionCard d={300} pop={0} v={v} />
    <div style={{position: 'absolute', left: 70, right: 70, top: 1440, textAlign: 'center', fontFamily: font, fontSize: 56, fontWeight: 700, color: CREAM, textShadow: '0 0 10px #000, 0 3px 18px #000'}}><span style={{color: GOLD}}>To'xtamishni</span> yana kechirarmidingiz?</div>
  </AbsoluteFill>
);

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
export const QuestionCard: React.FC<{d: number; pop?: number}> = ({d, pop: P0 = 20}) => {
  const fr = useCurrentFrame();
  const a = Math.min(interpolate(fr, [0, 12], [0, 1], cl), interpolate(fr, [d - 8, d], [1, 0], cl));
  const pop = (s: number) => interpolate(fr, [s, s + 12], [0, 1], {...cl, easing: Easing.out(Easing.back(2))});
  // a poll-sticker card (familiar from Instagram stories): one light card, two halves HA | YO'Q, just above the subtitles
  const p = pop(P0);
  const pulse = 1 + 0.025 * Math.sin(Math.max(0, fr - P0 - 14) / 5);
  const half = (t: string, col: string, s: number) => (
    <div style={{flex: 1, textAlign: 'center', padding: '30px 0', fontFamily: font, fontWeight: 700, fontSize: 70, letterSpacing: 5, color: col, opacity: interpolate(fr, [s, s + 8], [0, 1], cl)}}>{t}</div>
  );
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
        <div style={{display: 'inline-block', width: 300, height: 300, borderRadius: '50%', overflow: 'hidden', border: `5px solid ${GOLD}`, boxShadow: '0 0 60px rgba(212,175,55,0.45)', transform: `scale(${interpolate(fr, [0, 16], [0.85, 1], {...cl, easing: Easing.out(Easing.back(1.6))})})`}}>
          <Img src={staticFile('maps/uq_avatar.png')} style={{width: 300, height: 300}} />
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

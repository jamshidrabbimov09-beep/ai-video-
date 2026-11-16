import React from 'react';
import {AbsoluteFill} from 'remotion';
import {TQ4} from './TQ4';
import {useOswald} from './common';

// Instagram cover candidates for "Tasavvur qil" ep.4: a real frame of the video under a big title.
// Key content inside the 3:4 grid crop (y 240..1680). The title box hides the video's own caption.
const VARIANTS = {
  a: {frame: 1737, l1: 'CHINGIZXONNING', l2: "O'NG QO'LI"},
  b: {frame: 1218, l1: 'DUSHMANINI', l2: 'KECHIRDI!'},
} as const;

export const TQ4Cover: React.FC<{v?: keyof typeof VARIANTS}> = ({v = 'a'}) => {
  useOswald();
  const c = VARIANTS[v];
  const T: React.CSSProperties = {position: 'absolute', width: '100%', textAlign: 'center', fontFamily: 'Oswald', fontWeight: 700, WebkitTextStroke: '4px #1a120c', textShadow: '0 8px 0 #1a120c', lineHeight: 1.05};
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <TQ4 at={c.frame} />
      <div style={{position: 'absolute', left: 0, top: 0, width: '100%', height: 800, background: 'linear-gradient(180deg, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.9) 72%, rgba(0,0,0,0) 100%)'}} />
      <div style={{...T, top: 320, fontSize: c.l1.length > 11 ? 112 : 150, color: '#fff'}}>{c.l1}</div>
      <div style={{...T, top: 480, fontSize: c.l2.length > 11 ? 120 : 150, color: '#ff4b3e'}}>{c.l2}</div>
    </AbsoluteFill>
  );
};

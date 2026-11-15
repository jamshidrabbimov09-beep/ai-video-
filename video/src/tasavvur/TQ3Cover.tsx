import React from 'react';
import {AbsoluteFill} from 'remotion';
import {TQ3} from './TQ3';
import {useOswald} from './common';

// Instagram cover candidates for "Tasavvur qil" ep.3: a real frame of the video under a big title.
// Key content inside the 3:4 grid crop (y 240..1680). The title box hides the video's own caption.
const VARIANTS = {
  a: {frame: 1368, l1: 'QANOTLI', l2: 'ASKARLAR'},
  b: {frame: 1236, l1: 'UYG\'ONSANG,', l2: 'TEPADA DUSHMAN!'},
  c: {frame: 1790, l1: 'ISKANDAR KIMGA', l2: 'UYLANDI?'},
} as const;

export const TQ3Cover: React.FC<{v?: keyof typeof VARIANTS}> = ({v = 'a'}) => {
  useOswald();
  const c = VARIANTS[v];
  const T: React.CSSProperties = {position: 'absolute', width: '100%', textAlign: 'center', fontFamily: 'Oswald', fontWeight: 700, WebkitTextStroke: '4px #1a120c', textShadow: '0 8px 0 #1a120c', lineHeight: 1.05};
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <TQ3 at={c.frame} />
      <div style={{position: 'absolute', left: 0, top: 0, width: '100%', height: 800, background: 'linear-gradient(180deg, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.9) 72%, rgba(0,0,0,0) 100%)'}} />
      <div style={{...T, top: 320, fontSize: c.l1.length > 11 ? 120 : 150, color: '#fff'}}>{c.l1}</div>
      <div style={{...T, top: 480, fontSize: c.l2.length > 11 ? 120 : 150, color: '#ff4b3e'}}>{c.l2}</div>
    </AbsoluteFill>
  );
};

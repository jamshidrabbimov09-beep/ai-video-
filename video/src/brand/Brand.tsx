import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BekG} from '../tasavvur/Bek';
import {useOswald} from '../tasavvur/common';

// New page identity (chat 8): Bek avatar + one cover style for every video.
const Rays: React.FC<{cx: number; cy: number; n?: number; color: string; op?: number}> = ({cx, cy, n = 16, color, op = 0.18}) => (
  <g opacity={op}>
    {Array.from({length: n}).map((_, i) => {
      const a0 = (i / n) * Math.PI * 2, a1 = a0 + Math.PI / n;
      const R = 3000;
      return <path key={i} d={`M${cx} ${cy} L${cx + R * Math.cos(a0)} ${cy + R * Math.sin(a0)} L${cx + R * Math.cos(a1)} ${cy + R * Math.sin(a1)} Z`} fill={color} />;
    })}
  </g>
);

// Profile picture: Bek's head and shoulders on a warm mustard background (Instagram shows it as a circle).
export const BrandAvatar: React.FC = () => (
  <AbsoluteFill style={{background: '#1d3b5c'}}>
    <svg viewBox="0 0 1080 1080" width="100%" height="100%">
      <defs>
        <radialGradient id="ag" cx="50%" cy="45%" r="65%">
          <stop offset="0%" stopColor="#3f78b0" />
          <stop offset="100%" stopColor="#163250" />
        </radialGradient>
      </defs>
      <rect width={1080} height={1080} fill="url(#ag)" />
      <Rays cx={540} cy={470} color="#ffffff" op={0.08} n={18} />
      <g transform="translate(540 400) scale(2.0) translate(-200 -200)">
        <BekG outfit="modern" mood="happy" lookX={0} shadow={false} />
      </g>
    </svg>
  </AbsoluteFill>
);

// Cover template: big two-line title at the top, Bek scene below (key content inside 3:4 crop y 240..1680).
export const BrandCover: React.FC<{l0?: string; l1: string; l2: string; children: React.ReactNode; bg?: string}> = ({l0, l1, l2, children, bg = '#0f2236'}) => {
  useOswald();
  const T: React.CSSProperties = {position: 'absolute', width: '100%', textAlign: 'center', fontFamily: 'Oswald', fontWeight: 700, WebkitTextStroke: '5px #10161c', textShadow: '0 9px 0 #10161c', lineHeight: 1.02, letterSpacing: 1};
  return (
    <AbsoluteFill style={{background: bg}}>
      {children}
      <div style={{position: 'absolute', left: 0, top: 0, width: '100%', height: 760, background: 'linear-gradient(180deg, rgba(8,14,22,0.92) 0%, rgba(8,14,22,0.75) 70%, rgba(8,14,22,0) 100%)'}} />
      {l0 && <div style={{...T, top: 260, fontSize: 78, color: '#ffc94a', letterSpacing: 5}}>{l0}</div>}
      <div style={{...T, top: l0 ? 360 : 300, fontSize: l1.length > 12 ? 118 : 150, color: '#fff'}}>{l1}</div>
      <div style={{...T, top: l0 ? 530 : 490, fontSize: l2.length > 12 ? 118 : 150, color: '#ffc94a'}}>{l2}</div>
    </AbsoluteFill>
  );
};

// Sample cover for the first new-direction video: Aral Sea, Bek next to a ship stranded on sand.
const OrolScene: React.FC = () => (
  <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{position: 'absolute'}}>
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#f08a3c" />
        <stop offset="55%" stopColor="#f7c77a" />
        <stop offset="100%" stopColor="#fbe3a8" />
      </linearGradient>
      <linearGradient id="sand" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#e2b673" />
        <stop offset="100%" stopColor="#b98445" />
      </linearGradient>
    </defs>
    <rect width={1080} height={1920} fill="url(#sky)" />
    <circle cx={800} cy={880} r={130} fill="#fff3c9" opacity={0.85} />
    <rect y={1080} width={1080} height={840} fill="url(#sand)" />
    {/* cracked dry sea bed */}
    <g stroke="#9a6a34" strokeWidth={5} fill="none" opacity={0.7} strokeLinecap="round">
      <path d="M40 1500 L180 1460 L260 1540 L420 1500" /><path d="M180 1460 L160 1380" /><path d="M600 1700 L720 1640 L860 1690 L1040 1650" />
      <path d="M720 1640 L700 1560" /><path d="M60 1780 L200 1820 L330 1760" /><path d="M820 1400 L960 1430 L1060 1380" />
    </g>
    {/* rusty stranded ship */}
    <g transform="translate(60 900)">
      <path d="M0 260 L640 260 L590 380 L60 380 Z" fill="#8c3f22" stroke="#2a1408" strokeWidth={8} strokeLinejoin="round" />
      <path d="M0 260 L640 260 L630 290 L8 290 Z" fill="#5b2a17" />
      <rect x={300} y={150} width={220} height={110} fill="#c9b9a0" stroke="#2a1408" strokeWidth={8} />
      <rect x={330} y={180} width={40} height={40} fill="#4a6a80" stroke="#2a1408" strokeWidth={5} />
      <rect x={400} y={180} width={40} height={40} fill="#4a6a80" stroke="#2a1408" strokeWidth={5} />
      <rect x={470} y={180} width={30} height={40} fill="#4a6a80" stroke="#2a1408" strokeWidth={5} />
      <rect x={380} y={70} width={44} height={80} fill="#6b2f1a" stroke="#2a1408" strokeWidth={8} />
      <g fill="#6b3a1f" opacity={0.55}><circle cx={120} cy={320} r={18} /><circle cx={260} cy={340} r={14} /><circle cx={470} cy={330} r={20} /></g>
      <path d="M-20 380 Q320 350 680 382 L680 400 L-20 400 Z" fill="#c9965a" />
    </g>
    {/* Bek, worried, in front */}
    <g transform="translate(600 1060) scale(0.8)">
      <BekG outfit="modern" mood="worried" lookX={-6} armSwing={0} />
    </g>
  </svg>
);

export const BrandCoverOrol: React.FC = () => (
  <BrandCover l1="DENGIZ" l2="QAYERGA KETDI?">
    <OrolScene />
  </BrandCover>
);

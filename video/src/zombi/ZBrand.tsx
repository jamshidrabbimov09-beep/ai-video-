import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BekAt} from '../tasavvur/common';
import {ZQ1} from './ZQ1';
import {useOswald} from '../tasavvur/common';

// New account identity for the zombie series: avatar (Bek under siren light) and a cover from a real video frame.
export const ZAvatar: React.FC = () => (
  <AbsoluteFill style={{background: '#101318'}}>
    <svg viewBox="0 0 1080 1080" width={1080} height={1080}>
      <defs>
        <linearGradient id="sir" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ff2a3a" stopOpacity={0.75} />
          <stop offset="50%" stopColor="#101318" stopOpacity={0} />
          <stop offset="100%" stopColor="#2a5cff" stopOpacity={0.75} />
        </linearGradient>
      </defs>
      <rect width={1080} height={1080} fill="#1a1f27" />
      <rect width={1080} height={1080} fill="url(#sir)" />
      <BekAt x={540} y={1700} s={1.9} mood="worried" shadow={false} />
      <text x={540} y={175} fontSize={100} fill="#fff" textAnchor="middle" fontFamily="Liberation Sans" fontWeight={700} letterSpacing={8} opacity={0.9}>41</text>
    </svg>
  </AbsoluteFill>
);

export const ZCover1: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <ZQ1 at={Math.round(74.0 * 30)} />
    <div style={{position: 'absolute', top: 1180, width: '100%', textAlign: 'center', fontFamily: 'Oswald, Liberation Sans', fontWeight: 700}}>
      <div style={{fontSize: 70, color: '#ff4b4b', letterSpacing: 8, textShadow: '0 4px 0 #000'}}>1-QISM</div>
      <div style={{fontSize: 150, color: '#fff', lineHeight: 1.0, marginTop: 10, WebkitTextStroke: '4px #000', textShadow: '0 8px 0 #000'}}>ORZU<br />USHALDI</div>
    </div>
  </AbsoluteFill>
);

// Umbrella channel logo for several drama series: "DAVOMI BOR" (to be continued). A red play sign that trails off into dots.
export const ZLogo: React.FC = () => {
  useOswald();
  return (
    <AbsoluteFill style={{background: '#0e0f12'}}>
      <svg viewBox="0 0 1080 1080" width={1080} height={1080}>
        <defs>
          <radialGradient id="lg" cx="50%" cy="45%" r="60%"><stop offset="0%" stopColor="#23262d" /><stop offset="100%" stopColor="#0e0f12" /></radialGradient>
        </defs>
        <rect width={1080} height={1080} fill="url(#lg)" />
        <path d="M330 300 Q330 262 364 280 L610 420 Q642 440 610 460 L364 600 Q330 618 330 580 Z" fill="#e63946" />
        {[0, 1, 2].map((i) => <circle key={i} cx={680 + i * 70} cy={440} r={24 - i * 3} fill="#ffffff" opacity={1 - i * 0.3} />)}
        <text x={540} y={800} fontSize={128} fill="#ffffff" textAnchor="middle" fontFamily="Oswald" fontWeight={700} letterSpacing={6}>DAVOMI BOR</text>
      </svg>
    </AbsoluteFill>
  );
};

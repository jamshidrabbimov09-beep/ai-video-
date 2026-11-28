import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BekAt} from '../tasavvur/common';
import {ZQ1} from './ZQ1';

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

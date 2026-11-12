import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Bek} from './Bek';
import {GlobeMap} from './GlobeMap';
import {Blueprint} from './TQ2';
import {useOswald} from './common';

// Instagram cover for "Tasavvur qil" ep.2. Key content inside the 3:4 grid crop (y 240..1680).
export const TQ2Cover: React.FC = () => {
  useOswald();
  const T: React.CSSProperties = {position: 'absolute', width: '100%', textAlign: 'center', fontFamily: 'Oswald', fontWeight: 700, WebkitTextStroke: '4px #1a120c', textShadow: '0 8px 0 #1a120c'};
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 55%, #3a5a92 0%, #0e1424 72%)'}}>
      {Array.from({length: 14}).map((_, i) => (
        <div key={i} style={{position: 'absolute', left: 540, top: 1100, width: 1400, height: 60, background: 'rgba(255,255,255,0.05)', transformOrigin: '0 50%', transform: `rotate(${i * (360 / 14)}deg)`}} />
      ))}
      <div style={{...T, top: 280, display: 'flex', justifyContent: 'center', WebkitTextStroke: '0', textShadow: 'none'}}>
        <div style={{background: '#ffc94a', color: '#1a120c', fontSize: 52, padding: '4px 34px', borderRadius: 40}}>TASAVVUR QIL</div>
      </div>
      <div style={{...T, top: 370, fontSize: 132, color: '#fff', lineHeight: 1.05}}>TEMURGA AVTOMAT</div>
      <div style={{...T, top: 520, fontSize: 132, color: '#ff4b3e', lineHeight: 1.05}}>CHIZMASI!</div>
      <svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
        <GlobeMap uid="c" rot={[60, 32]} scale={230} cx={820} cy={1330} reveal={1} extra={[]} flag={0.8} samLabel={false} t={0} />
        <g transform="translate(790 880) rotate(8) scale(1.05)">
          <Blueprint kind="gun" label="AVTOMAT" />
        </g>
      </svg>
      <div style={{position: 'absolute', left: 30, top: 760, width: 560, height: 900}}>
        <Bek outfit="temur" mood="surprised" lookX={0.8} />
      </div>
      <div style={{...T, top: 1530, fontSize: 82, color: '#ffc94a'}}>XARITA QANDAY O'ZGARADI?</div>
    </AbsoluteFill>
  );
};

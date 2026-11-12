import React, {useEffect, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, staticFile} from 'remotion';
import {Bek} from './Bek';

// Instagram cover for "Tasavvur qil" ep.1. Key content kept inside the 3:4 grid crop (y 240..1680).
export const TQ1Cover: React.FC = () => {
  const [h] = useState(() => delayRender('font'));
  useEffect(() => {
    const f = new FontFace('Oswald', `url(${staticFile('fonts/oswald-latin-700-normal.woff2')})`, {weight: '700'});
    f.load().then((x) => document.fonts.add(x)).finally(() => continueRender(h));
  }, [h]);
  const T: React.CSSProperties = {position: 'absolute', width: '100%', textAlign: 'center', fontFamily: 'Oswald', fontWeight: 700, WebkitTextStroke: '4px #1a120c', textShadow: '0 8px 0 #1a120c'};
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 55%, #3a5a92 0%, #0e1424 72%)'}}>
      {Array.from({length: 14}).map((_, i) => (
        <div key={i} style={{position: 'absolute', left: 540, top: 1100, width: 1400, height: 60, background: 'rgba(255,255,255,0.05)', transformOrigin: '0 50%', transform: `rotate(${i * (360 / 14)}deg)`}} />
      ))}
      <div style={{...T, top: 290, display: 'flex', justifyContent: 'center', WebkitTextStroke: '0', textShadow: 'none'}}>
        <div style={{background: '#ffc94a', color: '#1a120c', fontSize: 52, padding: '4px 34px', borderRadius: 40}}>TASAVVUR QIL</div>
      </div>
      <div style={{...T, top: 380, fontSize: 150, color: '#fff', lineHeight: 1.05}}>SEN TEMURNING</div>
      <div style={{...T, top: 540, fontSize: 170, color: '#ff4b3e', lineHeight: 1.05}}>ASKARISAN</div>
      <div style={{position: 'absolute', left: 190, top: 720, width: 700, height: 1060}}>
        <Bek outfit="soldier" mood="surprised" />
      </div>
      <div style={{position: 'absolute', left: 760, top: 820, width: 210, height: 230, transform: 'rotate(10deg)', background: '#fff', border: '7px solid #2b1e16', borderRadius: 20, overflow: 'hidden', fontFamily: 'Oswald', fontWeight: 700, textAlign: 'center'}}>
        <div style={{background: '#ff4b3e', color: '#fff', fontSize: 46, borderBottom: '7px solid #2b1e16'}}>1-KUN</div>
        <div style={{color: '#2b1e16', fontSize: 130, lineHeight: 1.2}}>1</div>
      </div>
      <div style={{...T, top: 1500, fontSize: 104, color: '#ffc94a'}}>TIRIK QOLASANMI?</div>
    </AbsoluteFill>
  );
};

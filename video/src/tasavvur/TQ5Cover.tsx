import React from 'react';
import {AbsoluteFill} from 'remotion';
import {TQ5} from './TQ5';
import {BekAt, H, useOswald, W} from './common';

// Cover template from the strategy brief: yellow "TASAVVUR QIL #N" badge, big 2-3 word title, Bek + one big icon.
// Real video frame (hook: Temur vs Boyazid, lightning). Key content inside the 3:4 grid crop (y 240..1680).
export const TQ5Cover: React.FC = () => {
  useOswald();
  const T: React.CSSProperties = {position: 'absolute', width: '100%', textAlign: 'center', fontFamily: 'Oswald', fontWeight: 700, WebkitTextStroke: '4px #1a120c', textShadow: '0 8px 0 #1a120c', lineHeight: 1.0};
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <TQ5 at={120} />
      <div style={{position: 'absolute', left: 0, top: 0, width: '100%', height: 760, background: 'linear-gradient(180deg, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.85) 70%, rgba(0,0,0,0) 100%)'}} />
      <div style={{position: 'absolute', top: 250, width: '100%', display: 'flex', justifyContent: 'center'}}>
        <div style={{background: '#ffc94a', color: '#1a120c', fontFamily: 'Oswald', fontWeight: 700, fontSize: 58, padding: '6px 34px', borderRadius: 18, border: '5px solid #1a120c', letterSpacing: 3}}>TASAVVUR QIL #5</div>
      </div>
      <div style={{...T, top: 360, fontSize: 150, color: '#fff'}}>CHAQMOQ</div>
      <div style={{...T, top: 510, fontSize: 150, color: '#ff4b3e'}}>SULTON</div>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
        <BekAt x={540} y={1640} s={0.55} outfit="modern" mood="surprised" blink={0} lookX={0} />
      </svg>
    </AbsoluteFill>
  );
};

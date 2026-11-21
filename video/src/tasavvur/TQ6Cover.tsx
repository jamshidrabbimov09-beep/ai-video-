import React from 'react';
import {AbsoluteFill} from 'remotion';
import {TQ6} from './TQ6';
import {useOswald} from './common';

// Cover template from the strategy brief: yellow "TASAVVUR QIL #N" badge, big 2-3 word title, Bek + one big icon.
// Real video frame (hook: Bek as the sultan, 3 KUN, Temur's banners). Key content inside the 3:4 grid crop (y 240..1680).
export const TQ6Cover: React.FC = () => {
  useOswald();
  const T: React.CSSProperties = {position: 'absolute', width: '100%', textAlign: 'center', fontFamily: 'Oswald', fontWeight: 700, WebkitTextStroke: '4px #1a120c', textShadow: '0 8px 0 #1a120c', lineHeight: 1.0};
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <TQ6 at={3} />
      <div style={{position: 'absolute', left: 0, top: 0, width: '100%', height: 760, background: 'linear-gradient(180deg, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.85) 70%, rgba(0,0,0,0) 100%)'}} />
      <div style={{position: 'absolute', top: 250, width: '100%', display: 'flex', justifyContent: 'center'}}>
        <div style={{background: '#ffc94a', color: '#1a120c', fontFamily: 'Oswald', fontWeight: 700, fontSize: 58, padding: '6px 34px', borderRadius: 18, border: '5px solid #1a120c', letterSpacing: 3}}>TASAVVUR QIL #6</div>
      </div>
      <div style={{...T, top: 360, fontSize: 150, color: '#fff'}}>SEN</div>
      <div style={{...T, top: 510, fontSize: 132, color: '#ff4b3e'}}>BOYAZIDSAN</div>
      <div style={{position: 'absolute', left: 640, top: 930, background: '#ff4b3e', color: '#fff', fontFamily: 'Oswald', fontWeight: 700, fontSize: 96, padding: '4px 36px', borderRadius: 30, border: '7px solid #fff', boxShadow: '0 8px 0 #1a120c', transform: 'rotate(-6deg)'}}>3 KUN</div>
    </AbsoluteFill>
  );
};

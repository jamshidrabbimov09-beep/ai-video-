import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Bek, Outfit, Mood} from './Bek';

const cells: {outfit: Outfit; mood: Mood; label: string}[] = [
  {outfit: 'modern', mood: 'happy', label: 'Bugungi Bek'},
  {outfit: 'soldier', mood: 'surprised', label: 'Temur askari'},
  {outfit: 'soldier', mood: 'worried', label: 'xavotir'},
  {outfit: 'soldier', mood: 'determined', label: 'qat\'iyat'},
];

export const BekSheet: React.FC = () => (
  <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 40%, #2c3f63 0%, #141c2e 70%)', fontFamily: 'Liberation Sans, sans-serif'}}>
    <div style={{position: 'absolute', top: 70, width: '100%', textAlign: 'center', color: '#f4d27a', fontSize: 92, fontWeight: 700, letterSpacing: 2}}>BEK</div>
    <div style={{position: 'absolute', top: 180, width: '100%', textAlign: 'center', color: '#e9e3d4', fontSize: 40}}>"Tasavvur qil" seriyasi qahramoni</div>
    <div style={{position: 'absolute', top: 280, left: 40, right: 40, bottom: 40, display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 30}}>
      {cells.map((c, i) => (
        <div key={i} style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          <div style={{width: 460, height: 700}}><Bek outfit={c.outfit} mood={c.mood} /></div>
          <div style={{color: '#e9e3d4', fontSize: 36, marginTop: 6}}>{c.label}</div>
        </div>
      ))}
    </div>
  </AbsoluteFill>
);

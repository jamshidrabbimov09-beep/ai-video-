import React from 'react';
import {AbsoluteFill, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';

const GOLD = '#d4af37';
const BG = '#0b0b0b';
const font = 'Georgia, "Times New Roman", serif';

const Subtitle: React.FC<{text: string}> = ({text}) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 12], [0, 1], {extrapolateRight: 'clamp'});
  return (
    <div style={{position: 'absolute', bottom: 180, left: 60, right: 60, textAlign: 'center',
      color: '#fff', fontSize: 54, lineHeight: 1.25, fontFamily: font, opacity: o,
      textShadow: '0 4px 20px #000'}}>
      {text}
    </div>
  );
};

const DateCard: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: f, fps, config: {damping: 200}});
  const line = interpolate(f, [10, 50], [0, 100], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: `radial-gradient(circle at 50% 40%, #2a1d0a, ${BG} 70%)`,
      justifyContent: 'center', alignItems: 'center'}}>
      <div style={{transform: `scale(${0.9 + 0.1 * s})`, opacity: s, textAlign: 'center', fontFamily: font}}>
        <div style={{color: GOLD, fontSize: 180, letterSpacing: 8}}>1363</div>
        <div style={{width: `${line}%`, height: 3, background: GOLD, margin: '20px auto'}} />
        <div style={{color: '#e8dcc0', fontSize: 72, letterSpacing: 14}}>SEISTON</div>
      </div>
      <Subtitle text="Kamondan uchgan o'q yigitning o'ng qo'li va oyog'ini teshib o'tdi." />
    </AbsoluteFill>
  );
};

const pts = {
  Samarqand: {lon: 66.96, lat: 39.65},
  Kesh: {lon: 67.0, lat: 39.05},
  Balx: {lon: 66.9, lat: 36.76},
  Seiston: {lon: 61.9, lat: 30.9},
};
const X = (lon: number) => (lon - 60) * 100 + 40;
const Y = (lat: number) => (41 - lat) * 115 + 140;

const MapScene: React.FC = () => {
  const f = useCurrentFrame();
  const route = `M ${X(pts.Kesh.lon)} ${Y(pts.Kesh.lat)} L ${X(pts.Balx.lon)} ${Y(pts.Balx.lat)} L ${X(pts.Seiston.lon)} ${Y(pts.Seiston.lat)}`;
  const len = 1800;
  const draw = interpolate(f, [20, 140], [len, 0], {extrapolateRight: 'clamp', extrapolateLeft: 'clamp'});
  return (
    <AbsoluteFill style={{background: `linear-gradient(#17120a, ${BG})`}}>
      <div style={{position: 'absolute', top: 70, width: '100%', textAlign: 'center', color: GOLD,
        fontFamily: font, fontSize: 64, letterSpacing: 6}}>1336 · KESH</div>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <path d={route} stroke={GOLD} strokeWidth={6} fill="none" strokeDasharray="22 14"
          strokeDashoffset={draw} style={{opacity: 0.9}} pathLength={undefined} />
        {Object.entries(pts).map(([name, p], i) => {
          const o = interpolate(f, [i * 12, i * 12 + 14], [0, 1], {extrapolateRight: 'clamp'});
          return (
            <g key={name} opacity={o}>
              <circle cx={X(p.lon)} cy={Y(p.lat)} r={14} fill={GOLD} />
              <text x={X(p.lon) + 26} y={Y(p.lat) + 12} fill="#fff" fontSize={44} fontFamily={font}>{name}</text>
            </g>
          );
        })}
      </svg>
      <div style={{position: 'absolute', bottom: 120, width: '100%', textAlign: 'center', color: '#8a7a55',
        fontFamily: font, fontSize: 30}}>Sxematik xarita</div>
      <Subtitle text="1336-yil. Keshda, Barlos qabilasida bir o'g'il tug'iladi." />
    </AbsoluteFill>
  );
};

const KenBurns: React.FC = () => {
  const f = useCurrentFrame();
  const sc = interpolate(f, [0, 120], [1, 1.18]);
  const tx = interpolate(f, [0, 120], [0, -40]);
  return (
    <AbsoluteFill style={{background: BG, overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `scale(${sc}) translateX(${tx}px)`,
        background: 'linear-gradient(160deg,#3a2a12,#120d06 60%,#0b0b0b)',
        justifyContent: 'center', alignItems: 'center'}}>
        <div style={{color: '#6b5a33', fontFamily: font, fontSize: 56, textAlign: 'center', padding: 80}}>
          [ AI RASM O'RNI ]<br />sekin zoom + pan
        </div>
      </AbsoluteFill>
      <div style={{position: 'absolute', top: 120, left: 60, color: GOLD, fontFamily: font, fontSize: 40,
        border: `2px solid ${GOLD}`, padding: '8px 22px', letterSpacing: 6}}>RIVOYAT</div>
      <Subtitle text="Bolaligi haqida ko'p hikoyalar bor, ammo ularning ko'pi rivoyat." />
    </AbsoluteFill>
  );
};

export const Part1Test: React.FC = () => (
  <AbsoluteFill style={{background: BG}}>
    <Sequence from={0} durationInFrames={120}><DateCard /></Sequence>
    <Sequence from={120} durationInFrames={180}><MapScene /></Sequence>
    <Sequence from={300} durationInFrames={120}><KenBurns /></Sequence>
  </AbsoluteFill>
);

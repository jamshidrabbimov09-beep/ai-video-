import React from 'react';
import {Composition, AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';

const Test: React.FC = () => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 20], [0, 1], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: '#0b0b0b', justifyContent: 'center', alignItems: 'center'}}>
      <h1 style={{color: '#d4af37', fontSize: 90, opacity: o, fontFamily: 'serif'}}>Amir Temur</h1>
    </AbsoluteFill>
  );
};

export const Root: React.FC = () => (
  <Composition id="Test" component={Test} durationInFrames={60} fps={30} width={1920} height={1080} />
);

import React from 'react';
import {Part1Test} from './Part1Test';
import {VoiceTest} from './VoiceTest';
import {Part1V3, PART1_V3_FRAMES} from './Part1V3';
import {Part1V2, PART1_V2_FRAMES} from './Part1V2';
import {Part1Rough, PART1_FRAMES} from './Part1Rough';
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
  <>
  <Composition id="Part1Test" component={Part1Test} durationInFrames={420} fps={30} width={1080} height={1920} />
  <Composition id="VoiceTest" component={VoiceTest} durationInFrames={640} fps={30} width={1080} height={1920} />
  <Composition id="Part1Rough" component={Part1Rough} durationInFrames={PART1_FRAMES} fps={30} width={1080} height={1920} />
  <Composition id="Part1V2" component={Part1V2} durationInFrames={PART1_V2_FRAMES} fps={30} width={1080} height={1920} />
  <Composition id="Part1V3" component={Part1V3} durationInFrames={PART1_V3_FRAMES} fps={30} width={1080} height={1920} />
  <Composition id="Test" component={Test} durationInFrames={60} fps={30} width={1920} height={1080} />
  </>
);

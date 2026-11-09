import React from 'react';
import {Part1Test} from './Part1Test';
import {VoiceTest} from './VoiceTest';
import {Part1Cut, PART1_CUT_FRAMES} from './Part1Cut';
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
  <Composition id="Part1Cut" component={Part1Cut} durationInFrames={PART1_CUT_FRAMES} fps={30} width={1080} height={1920} />
  <Composition id="Test" component={Test} durationInFrames={60} fps={30} width={1920} height={1080} />
  </>
);

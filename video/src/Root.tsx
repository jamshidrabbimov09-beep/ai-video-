import React from 'react';
import {Part1Test} from './Part1Test';
import {VoiceTest} from './VoiceTest';
import {Part1V4, PART1_V4_FRAMES} from './Part1V4';
import {Part2, PART2_FRAMES} from './Part2';
import {BekSheet} from './tasavvur/BekSheet';
import {TQ1, TQ1_FRAMES} from './tasavvur/TQ1';
import {TQ1Cover} from './tasavvur/TQ1Cover';
import {MapTest} from './tasavvur/MapTest';
import {TQ2, TQ2_FRAMES} from './tasavvur/TQ2';
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
  <Composition id="Part1V4" component={Part1V4} durationInFrames={PART1_V4_FRAMES} fps={30} width={1080} height={1920} />
  <Composition id="Part2" component={Part2} durationInFrames={PART2_FRAMES} fps={30} width={1080} height={1920} />
  <Composition id="TQ1" component={TQ1} durationInFrames={TQ1_FRAMES} fps={30} width={1080} height={1920} />
  <Composition id="TQ1Cover" component={TQ1Cover} durationInFrames={1} fps={30} width={1080} height={1920} />
  <Composition id="TQ2" component={TQ2} durationInFrames={TQ2_FRAMES} fps={30} width={1080} height={1920} />
  <Composition id="MapTest" component={MapTest} durationInFrames={1} fps={30} width={1080} height={1920} />
  <Composition id="BekSheet" component={BekSheet} durationInFrames={1} fps={30} width={1080} height={1920} />
  <Composition id="Test" component={Test} durationInFrames={60} fps={30} width={1920} height={1080} />
  </>
);

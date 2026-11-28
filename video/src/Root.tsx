import React from 'react';
import {Part1Test} from './Part1Test';
import {VoiceTest} from './VoiceTest';
import {Part1V4, PART1_V4_FRAMES} from './Part1V4';
import {Part2, PART2_FRAMES} from './Part2';
import {Part3, PART3_FRAMES} from './Part3';
import {Part3V2, PART3V2_FRAMES} from './Part3V2';
import {Part4, PART4_FRAMES} from './Part4';
import {Part5, PART5_FRAMES} from './Part5';
import {QPreview} from './p4outro';
import {LoyJangi, LOY_FRAMES} from './LoyJangi';
import {BekSheet} from './tasavvur/BekSheet';
import {BrandAvatar, BrandCoverOrol} from './brand/Brand';
import {ORL, ORL_FRAMES} from './orol/ORL';
import {ZQ1, ZQ1_FRAMES} from './zombi/ZQ1';
import {ZCast} from './zombi/ZCast';
import {ZAvatar, ZCover1, ZLogo, ZLogoBek} from './zombi/ZBrand';
import {TQ1, TQ1_FRAMES} from './tasavvur/TQ1';
import {TQ1Cover} from './tasavvur/TQ1Cover';
import {MapTest} from './tasavvur/MapTest';
import {TQ2, TQ2_FRAMES} from './tasavvur/TQ2';
import {TQ2Cover} from './tasavvur/TQ2Cover';
import {TQ3, TQ3_FRAMES} from './tasavvur/TQ3';
import {TQ3Cover} from './tasavvur/TQ3Cover';
import {TQ4, TQ4_FRAMES} from './tasavvur/TQ4';
import {TQ4Cover} from './tasavvur/TQ4Cover';
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
  <Composition id="Part3" component={Part3} durationInFrames={PART3_FRAMES} fps={30} width={1080} height={1920} />
  <Composition id="Part3V2" component={Part3V2} durationInFrames={PART3V2_FRAMES} fps={30} width={1080} height={1920} />
  <Composition id="Part4" component={Part4} durationInFrames={PART4_FRAMES} fps={30} width={1080} height={1920} />
  <Composition id="Part5" component={Part5} durationInFrames={PART5_FRAMES} fps={30} width={1080} height={1920} />
  <Composition id="QPreview" component={QPreview} durationInFrames={60} fps={30} width={1080} height={1920} defaultProps={{v: 'A'}} />
  <Composition id="LoyJangi" component={LoyJangi} durationInFrames={LOY_FRAMES} fps={30} width={1080} height={1920} />
  <Composition id="TQ1" component={TQ1} durationInFrames={TQ1_FRAMES} fps={30} width={1080} height={1920} />
  <Composition id="TQ1Cover" component={TQ1Cover} durationInFrames={1} fps={30} width={1080} height={1920} />
  <Composition id="TQ2" component={TQ2} durationInFrames={TQ2_FRAMES} fps={30} width={1080} height={1920} />
  <Composition id="TQ3" component={TQ3} durationInFrames={TQ3_FRAMES} fps={30} width={1080} height={1920} />
  <Composition id="TQ4CoverA" component={TQ4Cover} defaultProps={{v: 'a' as const}} durationInFrames={1} fps={30} width={1080} height={1920} />
  <Composition id="TQ4CoverC" component={TQ4Cover} defaultProps={{v: 'c' as const}} durationInFrames={1} fps={30} width={1080} height={1920} />
  <Composition id="TQ4CoverB" component={TQ4Cover} defaultProps={{v: 'b' as const}} durationInFrames={1} fps={30} width={1080} height={1920} />
  <Composition id="TQ4" component={TQ4} durationInFrames={TQ4_FRAMES} fps={30} width={1080} height={1920} />
  <Composition id="TQ3CoverA" component={TQ3Cover} defaultProps={{v: 'a' as const}} durationInFrames={1} fps={30} width={1080} height={1920} />
  <Composition id="TQ3CoverB" component={TQ3Cover} defaultProps={{v: 'b' as const}} durationInFrames={1} fps={30} width={1080} height={1920} />
  <Composition id="TQ3CoverC" component={TQ3Cover} defaultProps={{v: 'c' as const}} durationInFrames={1} fps={30} width={1080} height={1920} />
  <Composition id="TQ2Cover" component={TQ2Cover} durationInFrames={1} fps={30} width={1080} height={1920} />
  <Composition id="MapTest" component={MapTest} durationInFrames={1} fps={30} width={1080} height={1920} />
  <Composition id="ZLogoBek" component={ZLogoBek} durationInFrames={1} fps={30} width={1080} height={1080} />
  <Composition id="ZLogo" component={ZLogo} durationInFrames={1} fps={30} width={1080} height={1080} />
  <Composition id="ZAvatar" component={ZAvatar} durationInFrames={1} fps={30} width={1080} height={1080} />
  <Composition id="ZCover1" component={ZCover1} durationInFrames={1} fps={30} width={1080} height={1920} />
  <Composition id="ZCast" component={ZCast} durationInFrames={1} fps={30} width={1080} height={1920} />
  <Composition id="ZQ1" component={ZQ1} durationInFrames={ZQ1_FRAMES} fps={30} width={1080} height={1920} />
  <Composition id="ORL" component={ORL} durationInFrames={ORL_FRAMES} fps={30} width={1080} height={1920} />
  <Composition id="BrandAvatar" component={BrandAvatar} durationInFrames={1} fps={30} width={1080} height={1080} />
  <Composition id="BrandCoverOrol" component={BrandCoverOrol} durationInFrames={1} fps={30} width={1080} height={1920} />
  <Composition id="BekSheet" component={BekSheet} durationInFrames={1} fps={30} width={1080} height={1920} />
  <Composition id="Test" component={Test} durationInFrames={60} fps={30} width={1920} height={1080} />
  </>
);

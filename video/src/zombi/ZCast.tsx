import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BekAt} from '../tasavvur/common';
import {CAST, PersonAt} from './Person';
export const ZCast: React.FC = () => (
  <AbsoluteFill style={{background: '#cfd6dd'}}>
    <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
      <BekAt x={140} y={760} s={0.6} />
      <PersonAt x={400} y={760} s={0.6} {...CAST.malika} mood="worried" />
      <PersonAt x={660} y={760} s={0.6} {...CAST.sardor} mood="neutral" />
      <PersonAt x={920} y={760} s={0.6} {...CAST.doniyor} mood="happy" />
      <PersonAt x={140} y={1400} s={0.6} {...CAST.jasur} mood="scared" />
      <PersonAt x={400} y={1400} s={0.66} {...CAST.ustoz} mood="shout" armsUp />
      <PersonAt x={660} y={1400} s={0.6} {...CAST.ona} mood="worried" phone />
      <PersonAt x={920} y={1400} s={0.6} {...CAST.sardor} zombie={1} eyeGlow={1} mood="neutral" />
      <PersonAt x={540} y={1900} s={0.6} {...CAST.girl2} mood="surprised" />
    </svg>
  </AbsoluteFill>
);

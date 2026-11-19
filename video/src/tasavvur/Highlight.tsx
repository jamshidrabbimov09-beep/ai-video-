import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BekAt, Text, useOswald, GOLD, INK} from './common';
import type {Outfit} from './Bek';

// Instagram Highlight covers: 1080x1920, Instagram crops a circle from the centre (about 700 px wide).
const V: Record<string, {label: string; outfit?: Outfit; bg: string}> = {
  k1: {label: '1K', bg: '#3b1f6b'},
  temur: {label: 'TEMUR', outfit: 'temur', bg: '#5a1a14'},
  tasavvur: {label: 'TASAVVUR', outfit: 'modern', bg: '#1d3f6e'},
};

export const Highlight: React.FC<{v?: string}> = ({v = 'k1'}) => {
  useOswald();
  const c = V[v];
  return (
    <AbsoluteFill style={{background: c.bg}}>
      <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
        <circle cx={540} cy={960} r={330} fill="none" stroke={GOLD} strokeWidth={14} />
        <defs><clipPath id="cc"><circle cx={540} cy={960} r={316} /></clipPath></defs>
        {c.outfit ? (
          <g clipPath="url(#cc)">
            <BekAt x={540} y={1780} s={1.55} outfit={c.outfit} mood="happy" />
            <rect x={200} y={1080} width={680} height={200} fill={c.bg} opacity={0.85} />
            <Text x={540} y={1215} size={c.label.length > 6 ? 92 : 130} fill={GOLD} stroke={8}>{c.label}</Text>
          </g>
        ) : (
          <Text x={540} y={1060} size={300} fill={GOLD} stroke={14}>{c.label}</Text>
        )}
      </svg>
    </AbsoluteFill>
  );
};

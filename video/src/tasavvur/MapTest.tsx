import React from 'react';
import {AbsoluteFill} from 'remotion';
import {GlobeMap} from './GlobeMap';
const L = ['Uzbekistan', 'Iran', 'Afghanistan', 'Iraq', 'Turkey', 'Pakistan', 'Turkmenistan', 'Azerbaijan', 'Kazakhstan', 'Syria', 'Tajikistan', 'Georgia'].map((name) => ({name, at: 0}));
export const MapTest: React.FC = () => (
  <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 55%, #16243f 0%, #05070f 75%)'}}>
    <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
      <GlobeMap rot={[54, 37]} scale={1500} cy={1000} reveal={1} labels={L} t={1} />
    </svg>
  </AbsoluteFill>
);

import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Bg, BekAt, Text, useOswald, GOLD, RED, INK} from './common';

// Instagram Story: thanks for 1,000 followers. Empty band y 1060..1330 is left for the poll sticker.
const CONF = Array.from({length: 70}, (_, i) => {
  const r = (n: number) => ((Math.sin(i * 127.1 + n * 311.7) * 43758.5) % 1 + 1) % 1;
  return {x: r(1) * 1080, y: r(2) * 1000 + 20, w: 14 + r(3) * 18, rot: r(4) * 360, c: ['#ffc94a', '#ff4b3e', '#4fc3f7', '#7ee07e', '#fff'][i % 5]};
});

export const Story1K: React.FC = () => {
  useOswald();
  return (
    <AbsoluteFill>
      <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
        <Bg c0="#3b1f6b" c1="#120a24" cy={35} />
        {CONF.map((c, i) => (
          <rect key={i} x={c.x} y={c.y} width={c.w} height={c.w * 0.45} rx={3} fill={c.c} opacity={0.85} transform={`rotate(${c.rot} ${c.x} ${c.y})`} />
        ))}
        <Text x={540} y={300} size={70} fill="#fff" stroke={8}>UNUTILGAN QISSALAR</Text>
        <Text x={540} y={700} size={430} fill={GOLD} stroke={18}>1K</Text>
        <Text x={540} y={830} size={96} fill="#fff" stroke={10}>1000 OBUNACHI!</Text>
        <Text x={540} y={960} size={120} fill={RED} stroke={12}>RAHMAT! ❤</Text>
        <Text x={540} y={1100} size={58} fill="#fff" stroke={7}>KEYINGI QISM QAYSI ZAMONDA?</Text>
        <ellipse cx={540} cy={1880} rx={620} ry={120} fill={INK} opacity={0.5} />
        <BekAt x={170} y={1900} s={0.82} outfit="iskandar" mood="happy" lookX={0.5} />
        <BekAt x={910} y={1900} s={0.82} outfit="chingiz" mood="happy" lookX={-0.5} />
        <BekAt x={370} y={1920} s={0.95} outfit="temur" mood="happy" lookX={0.4} />
        <BekAt x={710} y={1920} s={0.95} outfit="ravshanak" mood="happy" lookX={-0.4} />
        <BekAt x={540} y={1950} s={1.12} outfit="modern" mood="happy" swing={0.6} />
      </svg>
    </AbsoluteFill>
  );
};

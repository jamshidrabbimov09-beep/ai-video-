import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

const GOLD = '#d4af37';
const font = 'Georgia, "Times New Roman", serif';

type W = {t: string; s: number; e: number};
const words: W[] = [
  ['1363-',0,1.84],['yil.',1.84,2.56],['Seiston',2.64,3.12],['dashtida',3.2,3.76],['tungi',4,4.32],['jang.',4.4,5.28],
  ['Kamondan',5.32,5.76],['uchgan',5.84,6.24],["o'q",6.32,6.52],['yigitning',6.56,7.12],["o'ng",7.16,7.36],["qo'lini",7.44,7.84],['va',8.08,8.24],["oyog'ini",8.32,8.88],['teshib',8.96,9.28],["o'tdi.",9.32,10.16],
  ['Dushmanlari',10.24,10.88],['uni',11.04,11.2],['"Temur-i',11.52,12],['Lang",',12.08,12.88],["ya'ni",12.96,13.28],['"cho\'loq',13.6,14.08],['Temur"',14.16,14.52],['deb',14.56,14.72],['atadi.',14.8,15.25],
  ['Shu',16.8,16.92],['yigit',16.96,17.36],['qirq',17.6,17.84],['yildan',17.92,18.24],['keyin',18.32,18.72],['yarim',18.8,19.04],['dunyoni',19.2,19.68],['boshqaradi.',19.76,20.64],
].map(([t, s, e]) => ({t: t as string, s: s as number, e: e as number}));

const sentences: W[][] = [];
let cur: W[] = [];
for (const w of words) { cur.push(w); if (/[.]["]?$/.test(w.t) && !/^"?(Temur-i|Lang)/.test(w.t) || w.t === 'atadi.') { sentences.push(cur); cur = []; } }
if (cur.length) sentences.push(cur);

const Captions: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;
  const sent = sentences.find((s) => t >= s[0].s - 0.1 && t <= s[s.length - 1].e + 0.5);
  if (!sent) return null;
  return (
    <div style={{position: 'absolute', bottom: 200, left: 60, right: 60, textAlign: 'center', fontFamily: font,
      fontSize: 62, lineHeight: 1.3, textShadow: '0 4px 20px #000'}}>
      {sent.map((w, i) => (
        <span key={i} style={{color: t >= w.s && t <= w.e + 0.05 ? GOLD : '#fff', fontWeight: t >= w.s && t <= w.e ? 700 : 400}}>{w.t} </span>
      ))}
    </div>
  );
};

const Bg: React.FC<{label: string; sub?: string; from: number; to: number}> = ({label, sub, from, to}) => {
  const f = useCurrentFrame();
  const z = interpolate(f, [0, to - from], [1, 1.15]);
  return (
    <AbsoluteFill style={{background: '#0b0b0b', overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `scale(${z})`, background: 'radial-gradient(circle at 50% 35%, #3a2a12, #0b0b0b 70%)',
        justifyContent: 'center', alignItems: 'center'}}>
        <div style={{textAlign: 'center', fontFamily: font}}>
          <div style={{color: GOLD, fontSize: 130, letterSpacing: 6}}>{label}</div>
          {sub && <div style={{color: '#e8dcc0', fontSize: 56, letterSpacing: 10, marginTop: 20}}>{sub}</div>}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const VoiceTest: React.FC = () => (
  <AbsoluteFill style={{background: '#0b0b0b'}}>
    <Audio src={staticFile('voice1.mp3')} />
    <Sequence from={0} durationInFrames={160}><Bg label="1363" sub="SEISTON" from={0} to={160} /></Sequence>
    <Sequence from={160} durationInFrames={146}><Bg label="[ RASM 1 ]" sub="o'q tegdi" from={160} to={306} /></Sequence>
    <Sequence from={306} durationInFrames={190}><Bg label="TEMUR-I LANG" sub="CHO'LOQ TEMUR" from={306} to={496} /></Sequence>
    <Sequence from={496} durationInFrames={134}><Bg label="40 YIL" sub="KEYIN" from={496} to={630} /></Sequence>
    <Captions />
  </AbsoluteFill>
);

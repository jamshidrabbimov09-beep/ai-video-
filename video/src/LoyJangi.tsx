// "Loy jangi, 1365": battle breakdown made entirely as motion design (no generated images).
// Timing comes from src/loy.json (edit/edit_loy.py): sentence cues s1..s14, so the animation follows the narration.
import React from 'react';
import {AbsoluteFill, Img, interpolate, random, staticFile, useCurrentFrame, Easing} from 'remotion';
import data from './loy.json';

const FPS = 30;
const GOLD = '#d4af37';
const CREAM = '#f5ecd5';
const font = '"Liberation Serif", "DejaVu Serif", Georgia, serif';
export const LOY_FRAMES = Math.round(data.end * FPS);
const S: Record<string, {t0: number; t1: number}> = {};
data.sents.forEach((s) => { S[s.id] = s; });
const a = (id: string, off = 0) => (S[id].t0 + off) * FPS;      // frame where sentence starts
const z = (id: string, off = 0) => (S[id].t1 + off) * FPS;      // frame where sentence ends
const ease = Easing.inOut(Easing.cubic);
// keyframes: [[frame, value], ...]
const kf = (fr: number, k: [number, number][]) => {
  if (fr <= k[0][0]) return k[0][1];
  for (let i = 1; i < k.length; i++) {
    if (fr <= k[i][0]) {
      const p = (fr - k[i - 1][0]) / Math.max(1, k[i][0] - k[i - 1][0]);
      return k[i - 1][1] + (k[i][1] - k[i - 1][1]) * ease(p);
    }
  }
  return k[k.length - 1][1];
};
const fade = (fr: number, f0: number, f1: number, d = 12) => Math.max(0, Math.min(interpolate(fr, [f0, f0 + d], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}), interpolate(fr, [f1 - d, f1], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})));

// ---------------- units ----------------
type Unit = {id: string; n: number; cols: number; col: string; dark: string; up: boolean;
  x: [number, number][]; y: [number, number][]; spread?: [number, number][]; o?: [number, number][]; label?: string; lo?: [number, number][]};
const T0 = a('s5', -0.6);
const units: Unit[] = [
  {id: 'T', n: 84, cols: 12, col: '#e0b93c', dark: '#6b4a10', up: true, label: 'TEMUR',
    x: [[0, 300]], y: [[T0, 1120], [a('s6'), 1120], [a('s6', 3), 1030], [a('s8'), 1030], [z('s8'), 800], [a('s13'), 800], [z('s13', -1), 1560]],
    spread: [[a('s12'), 1], [a('s13'), 1.05], [z('s13', -1), 2.3]], o: [[a('s13', 1), 1], [z('s13'), 0]]},
  {id: 'T17', n: 34, cols: 6, col: '#f3d77a', dark: '#6b4a10', up: true,
    x: [[a('s10'), 330], [a('s10', 2.4), 610]], y: [[a('s10'), 800], [a('s10', 2.4), 740], [a('s13'), 740], [z('s13', -1), 1560]],
    spread: [[a('s13'), 1], [z('s13', -1), 2.2]], o: [[a('s10', -0.2), 0], [a('s10', 0.3), 1], [a('s13', 1), 1], [z('s13'), 0]]},
  {id: 'H', n: 84, cols: 12, col: '#5f8fd0', dark: '#1d3557', up: true, label: 'HUSAYN',
    x: [[0, 780]], y: [[T0, 1120], [a('s6'), 1120], [a('s6', 3), 1030], [a('s9'), 1030], [z('s9'), 1170], [a('s10', 2), 1170], [z('s10'), 1090], [a('s13'), 1090], [z('s13', -1.4), 1600]],
    spread: [[a('s9'), 1], [z('s9'), 1.7], [a('s10', 2), 1.7], [z('s10'), 1.05], [a('s13'), 1.05], [z('s13', -1.4), 2.3]], o: [[a('s13', 0.6), 1], [z('s13', -0.5), 0]]},
  {id: 'ER', n: 70, cols: 10, col: '#8f2f2a', dark: '#2a0f0d', up: false, label: "ILYOSXO'JA",
    x: [[0, 300], [a('s12'), 300], [a('s12', 2.5), 400]], y: [[T0, 430], [a('s6'), 430], [a('s6', 3), 700], [a('s8'), 700], [z('s8'), 300], [a('s12'), 300], [a('s12', 2.5), 470], [z('s12'), 780], [z('s13'), 960]],
    spread: [[a('s8'), 1], [z('s8'), 2.1], [a('s12'), 2.1], [a('s12', 2.5), 1]], o: [[a('s8', 1), 1], [z('s8'), 0.55], [a('s12'), 0.55], [a('s12', 2), 1]]},
  {id: 'EC', n: 60, cols: 10, col: '#7a2622', dark: '#2a0f0d', up: false, label: 'SHAMSUDDIN',
    x: [[0, 560]], y: [[T0, 400], [a('s6'), 400], [a('s6', 3), 660], [a('s10', 1.6), 660], [z('s10'), 470], [a('s12', 2), 470], [z('s12'), 800], [z('s13'), 980]]},
  {id: 'EL', n: 70, cols: 10, col: '#8f2f2a', dark: '#2a0f0d', up: false,
    x: [[0, 800]], y: [[T0, 430], [a('s6'), 430], [a('s6', 3), 700], [a('s9'), 700], [z('s9'), 900], [a('s10', 2), 900], [z('s10'), 640], [a('s12', 2), 640], [z('s12'), 820], [z('s13'), 1010]]},
];
const Soldiers: React.FC<{u: Unit; fr: number; mud: number}> = ({u, fr, mud}) => {
  const out: React.ReactNode[] = [];
  const rows = Math.ceil(u.n / u.cols);
  for (let i = 0; i < u.n; i++) {
    const lag = random(u.id + 'l' + i) * 16;
    const t = fr - lag;
    const cx = kf(t, u.x), cy = kf(t, u.y);
    const sp = u.spread ? kf(t, u.spread) : 1;
    const c = i % u.cols, r = Math.floor(i / u.cols);
    const jx = (random(u.id + 'x' + i) - 0.5) * 9, jy = (random(u.id + 'y' + i) - 0.5) * 9;
    const ox = ((c - (u.cols - 1) / 2) * 24 + jx) * (1 + (sp - 1) * (0.5 + random(u.id + 's' + i)));
    const oy = ((r - (rows - 1) / 2) * 26 + jy) * (1 + (sp - 1) * (0.5 + random(u.id + 't' + i)));
    const vy = kf(t + 4, u.y) - kf(t - 4, u.y), vx = kf(t + 4, u.x) - kf(t - 4, u.x);
    const moving = Math.min(1, Math.hypot(vx, vy) / 6);
    const ph = random(u.id + 'p' + i) * 6.28;
    const bob = Math.sin(fr / (3.2 + mud * 2.5) + ph) * (0.8 + 2.4 * moving);
    const sway = Math.sin(fr / 11 + ph * 2) * 1.4;
    let ang = u.up ? -90 : 90;
    if (moving > 0.15) ang = (Math.atan2(vy, vx) * 180) / Math.PI;
    const x = cx + ox + sway, y = cy + oy + bob;
    out.push(
      <g key={i} transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${ang.toFixed(0)}) scale(1.3)`}>
        <ellipse cx={0} cy={1.5} rx={8.5} ry={4.6} fill="rgba(0,0,0,0.35)" />
        <ellipse cx={0} cy={0} rx={8} ry={4.2} fill={u.dark} />
        <circle cx={7.5} cy={0} r={2.3} fill={u.dark} />
        <circle cx={-0.5} cy={0} r={3.3} fill={u.col} />
        <line x1={0} y1={-3.4} x2={12} y2={-3.4} stroke="rgba(20,16,10,0.8)" strokeWidth={0.9} />
      </g>
    );
  }
  const o = u.o ? kf(fr, u.o) : 1;
  return <g opacity={o}>{out}</g>;
};
const UnitLabel: React.FC<{u: Unit; fr: number}> = ({u, fr}) => {
  if (!u.label) return null;
  const rows = Math.ceil(u.n / u.cols);
  const x = kf(fr, u.x), y = kf(fr, u.y) + (u.up ? rows * 13 + 48 : -rows * 13 - 26);
  const o = fade(fr, a('s5'), a('s13', 1.2), 14) * (u.o ? Math.min(1, kf(fr, u.o) * 1.4) : 1);
  return <text x={x} y={y} textAnchor="middle" fontFamily={font} fontSize={30} fontWeight={700} letterSpacing={4} fill={u.up ? CREAM : '#f0c9c2'} stroke="rgba(0,0,0,0.75)" strokeWidth={5} paintOrder="stroke" opacity={o}>{u.label}</text>;
};
const Arrow: React.FC<{d: string; fr: number; f0: number; f1: number; col: string; w?: number}> = ({d, fr, f0, f1, col, w = 14}) => {
  const p = interpolate(fr, [f0, f0 + 26], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  const o = fade(fr, f0, f1, 10);
  if (o <= 0) return null;
  return <path d={d} fill="none" stroke={col} strokeWidth={w} strokeLinecap="round" pathLength={1} strokeDasharray={`${p} 1`} opacity={o * 0.85} markerEnd={p > 0.95 ? `url(#ah-${col.replace('#', '')})` : undefined} />;
};
const Marker: React.FC<{col: string}> = ({col}) => (
  <marker id={`ah-${col.replace('#', '')}`} viewBox="0 0 10 10" refX="5" refY="5" markerWidth="3.2" markerHeight="3.2" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill={col} /></marker>
);

// ---------------- battlefield ----------------
const Field: React.FC = () => {
  const fr = useCurrentFrame();
  const mud = kf(fr, [[a('s6'), 0], [a('s6', 4.5), 1]]);
  const rain = kf(fr, [[a('s6', -0.3), 0], [a('s6', 1.2), 1], [a('s8'), 1], [a('s9'), 0.6], [a('s12'), 0.5], [z('s13'), 0.35]]);
  const cam = {
    x: kf(fr, [[T0, 540], [a('s8'), 540], [a('s8', 1.5), 380], [a('s9', -0.3), 380], [a('s9', 1), 700], [a('s10'), 700], [a('s10', 1.5), 560], [a('s11'), 540], [a('s12'), 540]]),
    y: kf(fr, [[T0, 760], [a('s6'), 760], [a('s6', 3), 860], [a('s8'), 860], [a('s8', 1.5), 640], [a('s9', -0.3), 640], [a('s9', 1), 980], [a('s10'), 980], [a('s10', 1.5), 800], [a('s11'), 900], [a('s12'), 760], [a('s13'), 900]]),
    z: kf(fr, [[T0, 1.12], [a('s5', 2), 1], [a('s6'), 1], [a('s6', 3), 1.12], [a('s8'), 1.12], [a('s8', 1.5), 1.5], [a('s9', -0.3), 1.5], [a('s9', 1), 1.45], [a('s10'), 1.45], [a('s10', 1.5), 1.3], [a('s11'), 1.22], [a('s12'), 1.08], [a('s13'), 1.05]]),
  };
  const shake = rain * 0.0;
  const sepia = fade(fr, a('s7'), z('s7', 0.2), 12);
  // messengers (s11): two riders go from Temur's detachment to Husayn and come back
  const mes: React.ReactNode[] = [];
  const m0 = a('s11', 0.3), mlen = Math.max(60, (z('s11') - m0) / 2);
  for (let k = 0; k < 2; k++) {
    const st = m0 + k * mlen, go = mlen * 0.42, back = mlen * 0.36;
    if (fr < st || fr > st + mlen) continue;
    const t = fr - st;
    const p = t < go ? ease(t / go) : t < go + 8 ? 1 : Math.max(0, 1 - ease((t - go - 8) / back));
    const x = 610 + (760 - 610) * p, y = 760 + (1040 - 760) * p - Math.sin(p * Math.PI) * 30;
    mes.push(<g key={k}><circle cx={x} cy={y} r={15} fill="none" stroke={CREAM} strokeWidth={2.5} opacity={0.8} /><circle cx={x} cy={y} r={7} fill={CREAM} /></g>);
    if (t > go && t < go + 34) {
      const q = (t - go) / 34;
      mes.push(<g key={'x' + k} opacity={1 - q} transform={`translate(760 1020) scale(${1 + q * 0.6})`}><line x1={-22} y1={-22} x2={22} y2={22} stroke="#e5483b" strokeWidth={8} strokeLinecap="round" /><line x1={22} y1={-22} x2={-22} y2={22} stroke="#e5483b" strokeWidth={8} strokeLinecap="round" /></g>);
    }
  }
  // banner (s12)
  const bn = fade(fr, a('s12', 1.2), z('s13'), 14);
  const by = kf(fr, units[4].y) - 70;
  // dead (s13)
  const deadO = kf(fr, [[a('s13', 1), 0], [a('s13', 3.5), 1]]);
  const dead: React.ReactNode[] = [];
  for (let i = 0; i < 130; i++) {
    const x = 170 + random('dx' + i) * 740, y = 800 + random('dy' + i) * 420, on = random('do' + i);
    if (deadO > on) dead.push(<ellipse key={i} cx={x} cy={y} rx={8} ry={4} fill={i % 3 ? '#3a2b12' : '#16263d'} opacity={0.7} transform={`rotate(${random('dr' + i) * 180} ${x} ${y})`} />);
  }
  const drops: React.ReactNode[] = [];
  if (rain > 0.01) for (let i = 0; i < 170; i++) {
    const sp = 46 + random('rs' + i) * 26;
    const y = ((random('ry' + i) * 2300 + fr * sp) % 2300) - 200, x = random('rx' + i) * 1500 - 200 - y * 0.16;
    drops.push(<line key={i} x1={x} y1={y} x2={x - 9} y2={y + 56} stroke="rgba(214,226,238,0.55)" strokeWidth={random('rw' + i) * 1.8 + 0.8} />);
  }
  const lightning = Math.max(0, 1 - Math.abs(fr - a('s6', 1.4)) / 5) * 0.28 + Math.max(0, 1 - Math.abs(fr - a('s7', 0.6)) / 5) * 0.2;
  return (
    <AbsoluteFill style={{background: '#14110c'}}>
      <AbsoluteFill style={{transform: `translate(${540 - cam.x * cam.z + shake}px, ${960 - cam.y * cam.z}px) scale(${cam.z})`, transformOrigin: '0 0', filter: sepia > 0.01 ? `sepia(${0.75 * sepia}) saturate(${1 - 0.25 * sepia})` : undefined}}>
        <Img src={staticFile('loy/field.jpg')} style={{position: 'absolute', width: 1080, height: 1920, top: -180, transform: 'scale(1.5)'}} />
        <Img src={staticFile('loy/mud.jpg')} style={{position: 'absolute', width: 1080, height: 1920, top: -180, transform: 'scale(1.5)', opacity: mud}} />
        <svg width={1080} height={1920} style={{position: 'absolute', overflow: 'visible'}}>
          <defs><Marker col={GOLD} /><Marker col="#c0392b" /><Marker col="#5f8fd0" />
            <linearGradient id="riv" x1="0" x2="1"><stop offset="0" stopColor="#2f5d7a" /><stop offset="1" stopColor="#4a86a6" /></linearGradient></defs>
          <path d="M -160 -300 C 60 100, -120 500, 40 900 S -100 1500, 10 2100" fill="none" stroke="url(#riv)" strokeWidth={150} opacity={0.9} />
          <path d="M -160 -300 C 60 100, -120 500, 40 900 S -100 1500, 10 2100" fill="none" stroke="rgba(220,240,250,0.25)" strokeWidth={5} strokeDasharray="60 90" strokeDashoffset={-fr * 1.6} />
          {Array.from({length: 26}).map((_, i) => (
            <ellipse key={i} cx={150 + random('px' + i) * 800} cy={420 + random('py' + i) * 900} rx={30 + random('pr' + i) * 60} ry={10 + random('pq' + i) * 16} fill="rgba(40,32,26,0.55)" opacity={mud * (0.5 + 0.5 * random('po' + i))} />
          ))}
          {dead}
          <Arrow d="M 300 960 L 300 640" fr={fr} f0={a('s8', 0.2)} f1={z('s8')} col={GOLD} />
          <Arrow d="M 800 780 L 800 1010" fr={fr} f0={a('s9', 0.1)} f1={z('s9', 0.3)} col="#c0392b" />
          <Arrow d="M 360 830 Q 480 800 590 690" fr={fr} f0={a('s10', 0.2)} f1={z('s10')} col={GOLD} />
          <Arrow d="M 420 560 L 420 800" fr={fr} f0={a('s12', 2.6)} f1={z('s12', 0.6)} col="#c0392b" />
          <Arrow d="M 700 560 L 700 800" fr={fr} f0={a('s12', 2.9)} f1={z('s12', 0.6)} col="#c0392b" />
          {units.map((u) => <Soldiers key={u.id} u={u} fr={fr} mud={mud} />)}
          {units.map((u) => <UnitLabel key={u.id} u={u} fr={fr} />)}
          {bn > 0 && <g opacity={bn} transform={`translate(560 ${by})`}>
            <circle r={40 + ((fr * 2.2) % 70)} fill="none" stroke="#e8c9a0" strokeWidth={3} opacity={1 - ((fr * 2.2) % 70) / 70} />
            <line x1={0} y1={46} x2={0} y2={-62} stroke="#2a1c10" strokeWidth={6} />
            <path d={`M 0 -62 q ${14 + Math.sin(fr / 5) * 5} 26 ${Math.sin(fr / 6) * 6} 58 q -10 -22 0 -58`} fill="#1b1410" />
            <circle cx={0} cy={-66} r={7} fill={GOLD} />
          </g>}
          {mes}
          {fade(fr, a('s5'), z('s5', 1), 12) > 0 && <g opacity={fade(fr, a('s5'), z('s5', 1), 12)} fontFamily={font} fontSize={34} letterSpacing={6} fill={GOLD} stroke="rgba(0,0,0,0.7)" strokeWidth={5} paintOrder="stroke" textAnchor="middle" fontStyle="italic">
            <text x={300} y={960}>chap qanot</text><text x={780} y={960}>o'ng qanot</text>
            <text x={560} y={232} fontStyle="normal" fill="#f0c9c2" fontSize={32}>MO'G'ULISTON QO'SHINI</text>
          </g>}
        </svg>
      </AbsoluteFill>
      <AbsoluteFill style={{background: `rgba(18,24,34,${0.42 * rain})`}} />
      <svg width={1080} height={1920} style={{position: 'absolute', opacity: rain}}>{drops}</svg>
      <AbsoluteFill style={{background: `rgba(235,240,255,${lightning})`}} />
    </AbsoluteFill>
  );
};

// ---------------- intro map ----------------
const City: React.FC<{x: number; y: number; n: string; fr: number; f0: number; big?: boolean; dx?: number}> = ({x, y, n, fr, f0, big, dx = 22}) => {
  const o = interpolate(fr, [f0, f0 + 12], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return <g opacity={o}><circle cx={x} cy={y} r={big ? 13 : 9} fill={CREAM} stroke="#000" strokeWidth={3} /><text x={x + dx} y={y + 11} fontFamily={font} fontSize={big ? 40 : 32} letterSpacing={3} fill={CREAM} stroke="rgba(0,0,0,0.8)" strokeWidth={6} paintOrder="stroke" textAnchor={dx < 0 ? 'end' : 'start'}>{n}</text></g>;
};
const MapScene: React.FC = () => {
  const fr = useCurrentFrame();
  const zz = kf(fr, [[0, 1.0], [a('s4'), 1.06], [z('s4'), 1.35]]);
  const cx = kf(fr, [[a('s4'), 540], [z('s4'), 650]]), cy = kf(fr, [[a('s4'), 900], [z('s4'), 720]]);
  const pulse = (fr % 40) / 40;
  const bt = a('s4', 2.6);
  return (
    <AbsoluteFill style={{background: '#14110c'}}>
      <AbsoluteFill style={{transform: `translate(${540 - cx * zz}px, ${960 - cy * zz}px) scale(${zz})`, transformOrigin: '0 0'}}>
        <Img src={staticFile('loy/map.jpg')} style={{position: 'absolute', width: 1080, height: 1920, transform: 'scale(1.4)'}} />
        <svg width={1080} height={1920} style={{position: 'absolute', overflow: 'visible'}}>
          <defs><Marker col={GOLD} /><Marker col="#c0392b" /><Marker col="#5f8fd0" /></defs>
          <path d="M 1200 930 C 900 900, 760 840, 610 770 S 300 520, -80 300" fill="none" stroke="#3f7393" strokeWidth={16} opacity={0.9} />
          <path d="M 1200 1560 C 800 1500, 500 1560, 200 1420 S -60 1250, -120 1180" fill="none" stroke="#3f7393" strokeWidth={16} opacity={0.9} />
          <g fontFamily={font} fontStyle="italic" fontSize={28} fill="#8fb6cc" letterSpacing={3}><text x={150} y={470} transform="rotate(32 150 470)">Sirdaryo</text><text x={560} y={1500}>Amudaryo</text></g>
          <text x={540} y={940} textAnchor="middle" fontFamily={font} fontSize={46} letterSpacing={16} fill="rgba(245,236,213,0.22)">MOVAROUNNAHR</text>
          <text x={840} y={300} textAnchor="middle" fontFamily={font} fontSize={38} letterSpacing={8} fill="rgba(240,201,194,0.75)" opacity={interpolate(fr, [a('s3'), a('s3') + 15], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}>MO'G'ULISTON</text>
          <City x={730} y={610} n="TOSHKENT" fr={fr} f0={a('s3', 0.2)} big />
          <City x={610} y={770} n="CHINOZ" fr={fr} f0={a('s4', 1.8)} dx={-22} />
          <City x={390} y={1130} n="SAMARQAND" fr={fr} f0={a('s3', 0.5)} big />
          <City x={440} y={1300} n="KESH" fr={fr} f0={a('s3', 0.8)} />
          <Arrow d="M 960 340 C 900 440, 800 500, 705 640" fr={fr} f0={a('s3', 1.6)} f1={z('s4', 2)} col="#c0392b" w={18} />
          <Arrow d="M 430 1270 C 420 1100, 520 950, 640 760" fr={fr} f0={a('s4', 0.2)} f1={z('s4', 2)} col={GOLD} w={18} />
          <Arrow d="M 560 1420 C 640 1200, 700 980, 690 790" fr={fr} f0={a('s4', 0.7)} f1={z('s4', 2)} col="#5f8fd0" w={18} />
          {fr > bt && <g transform="translate(672 690)" opacity={Math.min(1, (fr - bt) / 10)}>
            <circle r={18 + pulse * 46} fill="none" stroke={GOLD} strokeWidth={4} opacity={1 - pulse} />
            <line x1={-16} y1={-16} x2={16} y2={16} stroke={GOLD} strokeWidth={7} strokeLinecap="round" /><line x1={16} y1={-16} x2={-16} y2={16} stroke={GOLD} strokeWidth={7} strokeLinecap="round" />
          </g>}
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------------- overlays ----------------
const HL = new Set(['temur', 'temurning', 'husayn', 'husaynga', 'husaynning', 'amir', 'loy', 'jangi', '1365-yil', "ilyosxo'ja", 'chinoz', 'toshkent', "o'n", 'yetti', "qo'shun", 'ming', 'yazdiy', 'yazdiyning', 'balxda', 'yada', 'rivoyatga']);
const Subs: React.FC = () => {
  const fr = useCurrentFrame();
  const t = fr / FPS;
  const s = data.subs.find((x) => t >= x.t0 && t < x.t1);
  if (!s) return null;
  const o = Math.min(1, (t - s.t0) / 0.18, (s.t1 - t) / 0.15);
  const words = s.text.split(' ');
  return (
    <div style={{position: 'absolute', left: 70, right: 70, top: 1440, textAlign: 'center', opacity: o, fontFamily: font, fontSize: 56, fontWeight: 700, lineHeight: 1.25, letterSpacing: 1.5, color: CREAM, WebkitTextStroke: '5px rgba(0,0,0,0.6)', paintOrder: 'stroke fill', textShadow: '0 0 10px #000, 0 3px 18px #000, 0 0 34px rgba(0,0,0,.9)'}}>
      {words.map((w, i) => <span key={i} style={{color: HL.has(w.toLowerCase().replace(/[.,?!:]+$/g, '')) ? GOLD : CREAM}}>{w}{i < words.length - 1 ? ' ' : ''}</span>)}
    </div>
  );
};
const TopCard: React.FC<{f0: number; f1: number; big: string; small?: string; count?: number}> = ({f0, f1, big, small, count}) => {
  const fr = useCurrentFrame();
  const o = fade(fr, f0, f1, 10);
  if (o <= 0) return null;
  const txt = count ? Math.round(count * interpolate(fr, [f0, f0 + 45], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)})).toLocaleString('ru-RU').replace(/ /g, ' ') : big;
  return (
    <div style={{position: 'absolute', top: 205, left: 0, right: 0, textAlign: 'center', opacity: o}}>
      <div style={{fontFamily: font, fontWeight: 700, fontSize: 104, letterSpacing: 6, color: GOLD, textShadow: '0 4px 22px #000, 0 0 40px rgba(0,0,0,.9)'}}>{txt}</div>
      {small && <div style={{fontFamily: font, fontStyle: 'italic', fontSize: 44, letterSpacing: 3, color: CREAM, textShadow: '0 3px 16px #000'}}>{small}</div>}
    </div>
  );
};
const Title: React.FC = () => {
  const fr = useCurrentFrame();
  const o = fade(fr, 4, a('s3', -0.2), 14);
  if (o <= 0) return null;
  const sc = interpolate(fr, [0, a('s3')], [1.0, 1.06]);
  const q = fade(fr, a('s2'), a('s3', -0.2), 12);
  return (
    <AbsoluteFill style={{background: `rgba(10,8,6,${0.55 * o})`, opacity: o, alignItems: 'center', justifyContent: 'center'}}>
      <div style={{transform: `scale(${sc})`, textAlign: 'center', marginTop: -260}}>
        <div style={{fontFamily: font, fontSize: 60, letterSpacing: 18, color: CREAM}}>1365</div>
        <div style={{fontFamily: font, fontWeight: 700, fontSize: 138, letterSpacing: 8, color: GOLD, textShadow: '0 6px 30px #000', lineHeight: 1.1}}>LOY JANGI</div>
        <div style={{width: 360, height: 3, background: GOLD, margin: '18px auto'}} />
        <div style={{fontFamily: font, fontStyle: 'italic', fontSize: 50, color: CREAM, opacity: q}}>yomg'irmi yoki ittifoqchimi?</div>
      </div>
    </AbsoluteFill>
  );
};
const Outro: React.FC = () => {
  const fr = useCurrentFrame();
  const f0 = a('s14', -0.3);
  if (fr < f0) return null;
  const o = interpolate(fr, [f0, f0 + 18], [0, 1], {extrapolateRight: 'clamp'});
  const gap = kf(fr, [[a('s14'), 0], [z('s14'), 150]]);
  const endO = interpolate(fr, [z('s14', 0.3), z('s14', 0.9)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const dots = (col: string, dark: string, side: number) => Array.from({length: 40}).map((_, i) => {
    const x = 540 + side * (70 + gap + (i % 5) * 26 + (random('ox' + i) - 0.5) * 8), y = 700 + Math.floor(i / 5) * 28 + Math.sin(fr / 9 + i) * 2;
    return <g key={i} transform={`translate(${x} ${y})`}><ellipse rx={10} ry={5.5} fill={dark} /><circle r={4.4} fill={col} /></g>;
  });
  return (
    <AbsoluteFill style={{background: `rgba(8,6,5,${0.9 * o})`}}>
      <svg width={1080} height={1920} style={{position: 'absolute', opacity: o * (1 - endO)}}>
        {dots('#e0b93c', '#6b4a10', -1)}{dots('#5f8fd0', '#1d3557', 1)}
        <path d={`M 540 600 l -14 70 l 22 60 l -26 80 l 20 70 l -12 80`} fill="none" stroke="#c0392b" strokeWidth={5} pathLength={1} strokeDasharray={`${Math.min(1, gap / 90)} 1`} />
        <g fontFamily={font} fontSize={40} letterSpacing={6} textAnchor="middle" fill={CREAM}><text x={540 - 130 - gap} y={640}>TEMUR</text><text x={540 + 130 + gap} y={640}>HUSAYN</text></g>
      </svg>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: endO}}>
        <div style={{textAlign: 'center', marginTop: -200}}>
          <div style={{fontFamily: font, fontWeight: 700, fontSize: 84, letterSpacing: 8, color: GOLD}}>TO'LIQ HIKOYA</div>
          <div style={{width: 300, height: 3, background: GOLD, margin: '16px auto'}} />
          <div style={{fontFamily: font, fontStyle: 'italic', fontSize: 52, color: CREAM}}>2-qism: "Do'st va dushman"</div>
          <div style={{fontFamily: font, fontSize: 38, letterSpacing: 3, color: CREAM, marginTop: 30, opacity: 0.85}}>@unutilgan_qissalar</div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const LoyJangi: React.FC = () => {
  const fr = useCurrentFrame();
  const sw = a('s5', -0.5);
  const mapO = interpolate(fr, [sw, sw + 16], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const rivO = fade(fr, a('s7'), z('s7', 0.2), 10);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {fr >= sw - 2 && <Field />}
      {mapO > 0 && <AbsoluteFill style={{opacity: mapO}}><MapScene /></AbsoluteFill>}
      <div style={{position: 'absolute', left: 0, right: 0, top: 1100, bottom: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0), rgba(0,0,0,0.72))'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 420, background: 'linear-gradient(0deg, rgba(0,0,0,0), rgba(0,0,0,0.55))'}} />
      <Title />
      {rivO > 0 && <div style={{position: 'absolute', top: 190, left: 50, opacity: rivO, color: GOLD, fontFamily: font, fontSize: 38, letterSpacing: 8, border: `2px solid ${GOLD}`, padding: '8px 24px', background: 'rgba(0,0,0,0.45)'}}>RIVOYAT</div>}
      <TopCard f0={a('s10', 0.3)} f1={z('s10', 0.2)} big="17" small="qo'shun" />
      <TopCard f0={a('s13', 3.6)} f1={z('s13', 0.3)} big="" count={10000} small="halok bo'lgan · Yazdiy bo'yicha" />
      <Outro />
      <Subs />
    </AbsoluteFill>
  );
};

// Motion-design inserts for Part 3 v2 (2026-11-12): full-screen animated scenes placed between the stills.
// Each scene gets its own local frame (inside a Sequence) and its length d in frames.
import React from 'react';
import {AbsoluteFill, Img, interpolate, random, staticFile, useCurrentFrame, Easing} from 'remotion';

const GOLD = '#d4af37';
const CREAM = '#f5ecd5';
const RED = '#c0392b';
const font = '"Liberation Serif", "DejaVu Serif", Georgia, serif';
const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const io = (fr: number, a: number, b: number, e = Easing.inOut(Easing.cubic)) => interpolate(fr, [a, b], [0, 1], {...cl, easing: e});

const Paper: React.FC<{children: React.ReactNode; zoom?: [number, number]; d: number}> = ({children, zoom = [1.0, 1.08], d}) => {
  const fr = useCurrentFrame();
  const z = interpolate(fr, [0, d], zoom, cl);
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 42%, #6b5330 0%, #3a2a16 45%, #140e08 85%)', overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `scale(${z})`}}>
        <Img src={staticFile('loy/map.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', opacity: 0.45, mixBlendMode: 'overlay'}} />
        <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(255,226,160,0.16), rgba(0,0,0,0) 60%)'}} />
        {children}
      </AbsoluteFill>
      <AbsoluteFill style={{boxShadow: 'inset 0 0 220px 60px rgba(0,0,0,0.75)'}} />
    </AbsoluteFill>
  );
};
const Label: React.FC<{x: number; y: number; t: string; o: number; size?: number; col?: string; anchor?: 'start' | 'middle' | 'end'}> = ({x, y, t, o, size = 40, col = CREAM, anchor = 'middle'}) => (
  <text x={x} y={y} textAnchor={anchor} fontFamily={font} fontSize={size} letterSpacing={4} fill={col} stroke="rgba(0,0,0,0.85)" strokeWidth={7} paintOrder="stroke" opacity={o}>{t}</text>
);
const Node: React.FC<{x: number; y: number; r?: number; col?: string; o: number; pulse?: number}> = ({x, y, r = 16, col = GOLD, o, pulse = 0}) => (
  <g opacity={o}>
    {pulse > 0 && <circle cx={x} cy={y} r={r + 10 + pulse * 30} fill="none" stroke={col} strokeWidth={3} opacity={1 - pulse} />}
    <circle cx={x} cy={y} r={r + 6} fill="rgba(0,0,0,0.55)" />
    <circle cx={x} cy={y} r={r} fill={col} stroke="#120d06" strokeWidth={3} />
  </g>
);

/* B: amirs from all over the ulus gather at Balx */
export const Gather: React.FC<{d: number}> = ({d}) => {
  const fr = useCurrentFrame();
  const bx = 540, by = 980;
  const src = [[150, 420, "XUTTALON"], [930, 380, "BADAXSHON"], [180, 1500, "SHIBIRG'ON"], [960, 1420, "QUNDUZ"], [120, 930, ''], [980, 900, ''], [540, 330, ''], [420, 1640, ''], [780, 1650, '']] as const;
  const pulse = (fr % 36) / 36;
  return (
    <Paper d={d}>
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        {src.map(([x, y, n], i) => {
          const s = 8 + i * 4, p = io(fr, s, s + 45);
          const cx = x + (bx - x) * p, cy = y + (by - y) * p;
          return (
            <g key={i}>
              <path d={`M ${x} ${y} L ${bx} ${by}`} stroke={GOLD} strokeWidth={4} strokeDasharray="4 18" strokeDashoffset={-fr * 2} opacity={0.55 * (1 - p * 0.6)} />
              {n && <Label x={x} y={y - 34} t={n} o={io(fr, s - 6, s + 4) * (1 - io(fr, s + 30, s + 45))} size={30} />}
              <g transform={`translate(${cx} ${cy})`} opacity={io(fr, s - 6, s)}>
                <path d="M -2 -40 L -2 6 M -2 -40 l 30 8 l -30 9 z" stroke="#1a120a" strokeWidth={4} fill={i % 2 ? '#a8862a' : GOLD} />
                <circle r={9} fill={CREAM} stroke="#000" strokeWidth={2} />
              </g>
            </g>
          );
        })}
        <Node x={bx} y={by} r={22} o={io(fr, 0, 10)} pulse={fr > 50 ? pulse : 0} />
        <Label x={bx} y={by + 80} t="BALX" o={io(fr, 2, 14)} size={58} col={GOLD} />
        <circle cx={bx} cy={by} r={interpolate(fr, [45, 75], [0, 150], cl)} fill="none" stroke={GOLD} strokeWidth={5} opacity={io(fr, 45, 55) * (1 - io(fr, 75, 95))} />
      </svg>
    </Paper>
  );
};

/* C: Chinggis Khan's line — only his descendants may be khan; Temur cannot join it */
export const Tree: React.FC<{d: number}> = ({d}) => {
  const fr = useCurrentFrame();
  const root = [540, 380];
  const lvl = [[[300, 620], [540, 620], [780, 620]], [[200, 860], [380, 860], [540, 860], [700, 860], [880, 860]]];
  const nodes: React.ReactNode[] = [], lines: React.ReactNode[] = [];
  lvl[0].forEach(([x, y], i) => {
    const s = 22 + i * 5, p = io(fr, s, s + 18);
    lines.push(<path key={'a' + i} d={`M ${root[0]} ${root[1]} C ${root[0]} ${root[1] + 140}, ${x} ${y - 160}, ${x} ${y}`} stroke={GOLD} strokeWidth={5} fill="none" pathLength={1} strokeDasharray={`${p} 1`} />);
    nodes.push(<Node key={'a' + i} x={x} y={y} r={14} o={io(fr, s + 14, s + 20)} />);
  });
  lvl[1].forEach(([x, y], i) => {
    const par = lvl[0][Math.min(2, Math.floor(i / 2))];
    const s = 42 + i * 4, p = io(fr, s, s + 16);
    lines.push(<path key={'b' + i} d={`M ${par[0]} ${par[1]} C ${par[0]} ${par[1] + 120}, ${x} ${y - 140}, ${x} ${y}`} stroke={GOLD} strokeWidth={4} fill="none" pathLength={1} strokeDasharray={`${p} 1`} opacity={0.85} />);
    nodes.push(<Node key={'b' + i} x={x} y={y} r={11} o={io(fr, s + 12, s + 18)} />);
  });
  // Temur: comes in from below, a dashed line reaches for the tree, turns red and breaks
  const t0 = Math.max(80, d * 0.5);
  const tp = io(fr, t0, t0 + 20, Easing.out(Easing.cubic));
  const tx = 540, ty = 1290 - 60 * tp;
  const reach = io(fr, t0 + 24, t0 + 50);
  const broken = io(fr, t0 + 52, t0 + 60);
  const ly = ty - 30 - (ty - 30 - 900) * reach;
  return (
    <Paper d={d} zoom={[1.0, 1.06]}>
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        {lines}
        <Node x={root[0]} y={root[1]} r={26} o={io(fr, 0, 10)} pulse={(fr % 40) / 40} />
        <Label x={root[0]} y={root[1] - 56} t="CHINGIZXON" o={io(fr, 4, 16)} size={54} col={GOLD} />
        {nodes}
        {tp > 0 && <g>
          <path d={`M ${tx} ${ty - 30} L ${tx} ${ly}`} stroke={broken > 0 ? RED : CREAM} strokeWidth={5} strokeDasharray="14 12" opacity={1 - broken * 0.3} />
          {broken > 0 && <g transform={`translate(${tx} ${(ly + ty) / 2 - 40}) scale(${0.6 + broken * 0.6})`} opacity={broken}><line x1={-30} y1={-30} x2={30} y2={30} stroke={RED} strokeWidth={10} strokeLinecap="round" /><line x1={30} y1={-30} x2={-30} y2={30} stroke={RED} strokeWidth={10} strokeLinecap="round" /></g>}
          <Node x={tx} y={ty} r={24} col="#e8e0cc" o={tp} />
          <Label x={tx + 50} y={ty + 16} t="TEMUR" o={tp} size={52} anchor="start" />
          <Label x={tx + 52} y={ty + 60} t="barlos urug'i" o={tp * 0.9} size={32} col="#e6dcc4" anchor="start" />
        </g>}
      </svg>
    </Paper>
  );
};

/* D: the puppet khan — strings from the khan's hands go up to Temur's hand */
export const Puppet: React.FC<{d: number}> = ({d}) => {
  const fr = useCurrentFrame();
  const sway = Math.sin(fr / 14) * 10;
  const hy = 520 + Math.sin(fr / 14) * 14;
  const strings = io(fr, 18, 40);
  const tO = io(fr, 30, 46);
  const kx = 540 + sway * 0.6;
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 60%, #3a2a14, #0d0905 70%)'}}>
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <g opacity={tO}>
          <ellipse cx={540} cy={330} rx={190} ry={120} fill="rgba(0,0,0,0.55)" />
          <path d="M 470 360 q 70 -70 140 0" stroke="#1a120a" strokeWidth={4} fill="#2a1f14" />
          <circle cx={540} cy={280} r={46} fill="#c9a27a" stroke={GOLD} strokeWidth={3} />
          <path d="M 494 268 a 46 40 0 0 1 92 0 z" fill="#111" />
          <path d="M 515 305 q 25 22 50 0 l -6 26 q -19 10 -38 0 z" fill="#2a1f14" />
          <Label x={540} y={170} t="TEMUR" o={tO} size={52} col={GOLD} />
          <path d={`M 420 ${hy - 40} L 660 ${hy - 40}`} stroke="#6b4a1e" strokeWidth={14} strokeLinecap="round" />
          <path d={`M 540 ${hy - 40} L 540 ${hy + 30}`} stroke="#6b4a1e" strokeWidth={12} strokeLinecap="round" />
        </g>
        {[[420, 980], [660, 980], [540, 860], [470, 1210], [610, 1210]].map(([x, y], i) => (
          <line key={i} x1={i < 2 ? (i ? 660 : 420) : 540} y1={hy - 40} x2={x + sway * 0.6} y2={y} stroke={CREAM} strokeWidth={2.5} opacity={0.8} pathLength={1} strokeDasharray={`${strings} 1`} />
        ))}
        <g transform={`translate(${kx - 540} -60)`}>
          <path d="M 330 1330 L 330 980 Q 540 900 750 980 L 750 1330 Z" fill="#5a3d16" stroke={GOLD} strokeWidth={6} />
          <rect x={300} y={1250} width={480} height={90} rx={12} fill="#4a3112" stroke={GOLD} strokeWidth={5} />
          <path d="M 470 1250 L 470 1020 Q 540 990 610 1020 L 610 1250 Z" fill="#e6d3a3" stroke="#1a120a" strokeWidth={3} />
          <circle cx={540} cy={960} r={52} fill="#c9a27a" stroke="#1a120a" strokeWidth={3} />
          <path d="M 482 940 Q 540 860 598 940 Z" fill="#3b2a1a" stroke={GOLD} strokeWidth={3} />
          <circle cx={540} cy={905} r={9} fill="#c0392b" />
          <line x1={420} y1={980} x2={470} y2={1060} stroke="#e6d3a3" strokeWidth={14} strokeLinecap="round" />
          <line x1={660} y1={980} x2={610} y2={1060} stroke="#e6d3a3" strokeWidth={14} strokeLinecap="round" />
        </g>
        <Label x={540} y={1395} t="XON" o={io(fr, 4, 16)} size={58} col={GOLD} />
      </svg>
    </AbsoluteFill>
  );
};

/* E: marriage links Temur to the Chinggisid line -> title KO'RAGON */
export const Koragon: React.FC<{d: number}> = ({d}) => {
  const fr = useCurrentFrame();
  const join = io(fr, 18, 46);
  const up = io(fr, 50, 78);
  const letters = "KO'RAGON".split('');
  return (
    <Paper d={d} zoom={[1.04, 1.0]}>
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <Node x={540} y={560} r={22} o={io(fr, 0, 10)} />
        <Label x={540} y={505} t="CHINGIZ AVLODI" o={io(fr, 0, 12)} size={40} col={GOLD} />
        <path d="M 540 580 C 540 700, 760 760, 760 900" stroke={GOLD} strokeWidth={5} fill="none" pathLength={1} strokeDasharray={`${io(fr, 4, 20)} 1`} />
        <Node x={760} y={920} r={20} col="#c86a8a" o={io(fr, 10, 20)} />
        <Label x={760} y={995} t="SAROYMULKXONIM" o={io(fr, 10, 22)} size={34} />
        <Node x={320} y={920} r={20} col="#e8e0cc" o={io(fr, 6, 16)} />
        <Label x={320} y={995} t="TEMUR" o={io(fr, 6, 18)} size={40} />
        <path d="M 344 920 L 736 920" stroke={GOLD} strokeWidth={6} pathLength={1} strokeDasharray={`${join} 1`} />
        {join > 0.98 && <g transform="translate(540 920)" opacity={io(fr, 46, 54)}><circle r={30} fill="rgba(0,0,0,0.6)" stroke={GOLD} strokeWidth={4} /><circle cx={-8} r={11} fill="none" stroke={GOLD} strokeWidth={4} /><circle cx={8} r={11} fill="none" stroke={GOLD} strokeWidth={4} /></g>}
        <path d="M 320 895 C 300 760, 470 640, 528 580" stroke={GOLD} strokeWidth={4} fill="none" strokeDasharray="10 10" pathLength={1} opacity={up} />
      </svg>
      <div style={{position: 'absolute', top: 1160, left: 0, right: 0, textAlign: 'center', fontFamily: font, fontWeight: 700, fontSize: 132, color: GOLD, textShadow: '0 6px 30px #000'}}>
        {letters.map((ch, i) => {
          const p = interpolate(fr, [54 + i * 4, 66 + i * 4], [0, 1], {...cl, easing: Easing.out(Easing.back(1.7))});
          return <span key={i} style={{display: 'inline-block', opacity: p, transform: `translateY(${(1 - p) * 50}px) scale(${0.5 + 0.5 * p})`, letterSpacing: 4}}>{ch}</span>;
        })}
      </div>
    </Paper>
  );
};

/* F: the road Balx -> Kesh -> Samarqand, and walls rising around Samarqand */
export const Capital: React.FC<{d: number}> = ({d}) => {
  const fr = useCurrentFrame();
  const P = {b: [330, 1290], k: [520, 1000], s: [700, 640]};
  const path = `M ${P.b[0]} ${P.b[1]} Q 380 1130 ${P.k[0]} ${P.k[1]} Q 620 820 ${P.s[0]} ${P.s[1]}`;
  const draw = io(fr, 6, 50);
  const wall = io(fr, 52, d - 10);
  const pulse = (fr % 36) / 36;
  const blocks: React.ReactNode[] = [];
  const n = 28;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2, on = wall * n > i;
    const x = P.s[0] + Math.cos(a) * 150, y = P.s[1] + Math.sin(a) * 110;
    const h = on ? 22 * Math.min(1, (wall * n - i)) : 0;
    blocks.push(<rect key={i} x={x - 11} y={y - h} width={22} height={h} fill="#c9a46a" stroke="#3a2a14" strokeWidth={2} transform={`rotate(${(a * 180) / Math.PI + 90} ${x} ${y})`} />);
  }
  return (
    <Paper d={d} zoom={[1.0, 1.12]}>
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <path d={path} stroke="#1c1408" strokeWidth={16} fill="none" pathLength={1} strokeDasharray={`${draw} 1`} opacity={0.6} />
        <path d={path} stroke={GOLD} strokeWidth={8} fill="none" pathLength={1} strokeDasharray={`${draw} 1`} />
        <Node x={P.b[0]} y={P.b[1]} o={io(fr, 0, 8)} />
        <Label x={P.b[0] + 40} y={P.b[1] + 14} t="BALX" o={io(fr, 0, 10)} anchor="start" />
        <Node x={P.k[0]} y={P.k[1]} o={io(fr, 26, 34)} />
        <Label x={P.k[0] + 40} y={P.k[1] + 14} t="KESH" o={io(fr, 26, 36)} anchor="start" />
        {blocks}
        <Node x={P.s[0]} y={P.s[1]} r={22} o={io(fr, 44, 52)} pulse={fr > 52 ? pulse : 0} />
        <Label x={P.s[0]} y={P.s[1] - 140} t="SAMARQAND" o={io(fr, 44, 56)} size={62} col={GOLD} />
        <Label x={P.s[0] + 190} y={P.s[1] + 14} t="poytaxt" anchor="start" o={io(fr, 56, 70)} size={36} />
      </svg>
    </Paper>
  );
};

/* F: a lone rider (To'xtamish) comes from the northern steppe to Temur */
export const LoneRider: React.FC<{d: number}> = ({d}) => {
  const fr = useCurrentFrame();
  const p = io(fr, 0, d - 8, Easing.inOut(Easing.quad));
  const x = 240 + (600 - 240) * p, y = 300 + (1060 - 300) * p;
  const gait = fr * 0.8;
  const bob = Math.abs(Math.sin(gait)) * 6;
  const l1 = 16 + Math.sin(gait) * 7, l2 = 16 - Math.sin(gait) * 7;
  return (
    <Paper d={d} zoom={[1.0, 1.1]}>
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <Label x={300} y={230} t="DASHTI QIPCHOQ" o={io(fr, 0, 14)} size={40} col="#e6c9b8" />
        <Node x={720} y={1180} r={22} o={1} />
        <Label x={720} y={1270} t="SAMARQAND" o={1} size={46} col={GOLD} />
        <path d={`M 240 300 L ${x} ${y}`} stroke={CREAM} strokeWidth={3} strokeDasharray="6 14" opacity={0.6} />
        {Array.from({length: 10}).map((_, i) => {
          const life = ((fr + i * 6) % 60) / 60;
          return <circle key={i} cx={x - 60 * life - random('d' + i) * 40} cy={y - 70 * life + 20} r={12 + 34 * life} fill="#b9a57a" opacity={0.35 * (1 - life)} />;
        })}
        <g transform={`translate(${x} ${y - bob}) scale(3.2)`}>
          <ellipse cx={0} cy={bob / 1.9 + 2} rx={22} ry={5} fill="rgba(0,0,0,0.4)" />
          <line x1={-10} y1={-16} x2={-12} y2={-16 + l1} stroke="#3b2a1c" strokeWidth={5} strokeLinecap="round" />
          <line x1={10} y1={-16} x2={12} y2={-16 + l2} stroke="#3b2a1c" strokeWidth={5} strokeLinecap="round" />
          <ellipse cx={0} cy={-26} rx={22} ry={12} fill="#3b2a1c" />
          <path d="M 18 -30 q 12 -14 6 -26 l -8 4 q 2 10 -8 18 z" fill="#3b2a1c" />
          <path d="M -6 -36 L 8 -36 L 6 -58 L -6 -58 Z" fill="#4a6c9a" stroke="#000" strokeWidth={1.2} />
          <circle cx={1} cy={-64} r={6} fill="#c9a27a" />
          <path d="M -5 -66 a 6 6 0 0 1 12 0 z" fill="#6b5a44" />
          <path d={`M -6 -50 q -18 ${4 + Math.sin(gait) * 4} -28 ${10}`} stroke="#4a6c9a" strokeWidth={4} fill="none" />
        </g>
        <Label x={x} y={y - 240} t="TO'XTAMISH" o={io(fr, 10, 24)} size={48} col="#f3d7cc" />
      </svg>
    </Paper>
  );
};

import React, {useEffect, useState} from 'react';
import {continueRender, delayRender, interpolate, spring, staticFile} from 'remotion';
import {BekG, Mood, Outfit} from './Bek';

// Shared helpers for "Tasavvur qil" episodes (ep.2 onward; ep.1 keeps its own copy in TQ1.tsx).

export const FPS = 30;
export const W = 1080;
export const H = 1920;
export const INK = '#2b1e16';
export const RED = '#ff4b3e';
export const GOLD = '#ffc94a';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const lerp = (t: number, a: number, b: number, v0: number, v1: number) => interpolate(t, [a, b], [v0, v1], clamp);
export const pop = (t: number, t0: number) => (t < t0 ? 0 : spring({frame: (t - t0) * FPS, fps: FPS, config: {damping: 11, stiffness: 160}}));
export const blinkAt = (t: number, seed = 0) => {
  const p = (t + seed) % 3.3;
  return p < 0.14 ? Math.sin((p / 0.14) * Math.PI) : 0;
};

type BekProps = {x: number; y: number; s: number; outfit?: Outfit; mood?: Mood; blink?: number; lookX?: number; swing?: number; rot?: number};
export const BekAt: React.FC<BekProps> = ({x, y, s, outfit = 'modern', mood = 'neutral', blink = 0, lookX = 0, swing = 0, rot = 0}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s}) translate(-200 -730)`}>
    <BekG outfit={outfit} mood={mood} blink={blink} lookX={lookX} armSwing={swing} />
  </g>
);

export const Text: React.FC<{x: number; y: number; size: number; fill?: string; children: React.ReactNode; anchor?: string; stroke?: number}> = ({x, y, size, fill = '#fff', children, anchor = 'middle', stroke = 0}) => (
  <text x={x} y={y} fontSize={size} fill={fill} textAnchor={anchor} fontFamily="Oswald" fontWeight={700} stroke={stroke ? INK : undefined} strokeWidth={stroke} paintOrder="stroke">
    {children}
  </text>
);

export const Bg: React.FC<{c0: string; c1: string; cy?: number}> = ({c0, c1, cy = 45}) => {
  const id = `g${c0.slice(1)}${c1.slice(1)}${cy}`;
  return (
    <>
      <defs>
        <radialGradient id={id} cx="50%" cy={`${cy}%`} r="75%">
          <stop offset="0%" stopColor={c0} />
          <stop offset="100%" stopColor={c1} />
        </radialGradient>
      </defs>
      <rect width={W} height={H} fill={`url(#${id})`} />
    </>
  );
};

export const Burst: React.FC<{x: number; y: number; t: number; t0: number; color?: string}> = ({x, y, t, t0, color = '#fff'}) => {
  const k = t - t0;
  if (k < 0 || k > 0.5) return null;
  const r = lerp(k, 0, 0.5, 30, 170);
  const o = lerp(k, 0.2, 0.5, 1, 0);
  return (
    <g opacity={o}>
      {Array.from({length: 10}).map((_, i) => {
        const a = (i / 10) * Math.PI * 2;
        return <line key={i} x1={x + Math.cos(a) * r * 0.6} y1={y + Math.sin(a) * r * 0.6} x2={x + Math.cos(a) * r} y2={y + Math.sin(a) * r} stroke={color} strokeWidth={10} strokeLinecap="round" />;
      })}
    </g>
  );
};

// ---------- captions: one big word or short phrase at the top ----------
export type W3 = [string, number, number];
export type Chunk = {text: string; start: number; end: number; closed: boolean};
export const buildChunks = (words: W3[], pairs: string[], fix: Record<string, string> = {}): Chunk[] => {
  const ws: W3[] = words.map(([txt, s, e]) => {
    let t = txt.replace(/[ʻ’`"“”]/g, (c) => (c === '"' || c === '“' || c === '”' ? '' : "'"));
    const key = t.replace(/[.,:?!]/g, '').toLowerCase();
    if (fix[key]) t = t.replace(/^[^.,:?!]+/, fix[key]);
    return [t, s, e];
  });
  const up = (x: string) => x.replace(/[.,:]/g, '').toUpperCase();
  const out: Chunk[] = [];
  ws.forEach(([txt, s, e], i) => {
    const clean = up(txt);
    const closes = /[.,:?!]$/.test(txt);
    const cur = out[out.length - 1];
    if (cur && pairs.includes(cur.text + ' ' + clean)) {
      cur.text += ' ' + clean;
      cur.end = e;
      cur.closed = true;
      return;
    }
    const next = ws[i + 1];
    const startsPair = next && pairs.includes(clean + ' ' + up(next[0]));
    if (cur && !startsPair && !cur.closed && cur.text.length + clean.length <= 9 && !cur.text.includes(' ')) {
      cur.text += ' ' + clean;
      cur.end = e;
      cur.closed = closes;
      return;
    }
    out.push({text: clean, start: s, end: e, closed: closes});
  });
  return out;
};

export const Caption: React.FC<{t: number; chunks: Chunk[]; hl: RegExp; top?: number}> = ({t, chunks, hl, top = 190}) => {
  let idx = -1;
  chunks.forEach((c, i) => {
    if (t >= c.start - 0.04) idx = i;
  });
  if (idx < 0) return null;
  const c = chunks[idx];
  const next = chunks[idx + 1];
  const until = next ? Math.min(next.start - 0.04, c.end + 0.9) : c.end + 1.2;
  if (t > until) return null;
  const p = spring({frame: (t - c.start + 0.04) * FPS, fps: FPS, config: {damping: 12, stiffness: 220}});
  return (
    <div
      style={{
        position: 'absolute',
        top,
        width: '100%',
        textAlign: 'center',
        fontFamily: 'Oswald',
        fontWeight: 700,
        fontSize: c.text.length > 11 ? 108 : 128,
        color: hl.test(c.text) ? RED : '#fff',
        transform: `scale(${0.7 + 0.3 * p})`,
        textShadow: '0 6px 0 #1a120c, 0 0 24px rgba(0,0,0,0.6)',
        WebkitTextStroke: '3px #1a120c',
        letterSpacing: 1,
      }}
    >
      {c.text}
    </div>
  );
};

export const useOswald = () => {
  const [handle] = useState(() => delayRender('font'));
  useEffect(() => {
    const f1 = new FontFace('Oswald', `url(${staticFile('fonts/oswald-latin-700-normal.woff2')})`, {weight: '700'});
    const f2 = new FontFace('Oswald', `url(${staticFile('fonts/oswald-latin-ext-700-normal.woff2')})`, {weight: '700'});
    Promise.all([f1.load(), f2.load()])
      .then((fs) => fs.forEach((f) => document.fonts.add(f)))
      .finally(() => continueRender(handle));
  }, [handle]);
};

// ---------- animated follow button (YouTube-style): pops in, wiggles, a hand taps it, it turns grey, the bell rings ----------
// Sound to match: click at t0 + 1.0 s, bell "ching" at t0 + 1.25 s (see edit/follow_sfx.py).
export const FOLLOW_TAP = 1.0;
export const FOLLOW_BELL = 1.25;
export const FollowButton: React.FC<{t: number; t0: number; x?: number; y?: number; line?: string}> = ({t, t0, x = 540, y = 1690, line = 'KEYINGI ZAMONGA BIRGA BORAMIZ'}) => {
  const k = t - t0;
  if (k < 0) return null;
  const p = pop(t, t0);
  const tapped = k >= FOLLOW_TAP;
  const wiggle = !tapped && k > 0.4 ? Math.sin(k * 22) * 3 : 0;
  const press = k >= FOLLOW_TAP - 0.08 && k < FOLLOW_TAP + 0.12 ? 0.9 : 1;
  const bell = k >= FOLLOW_BELL && k < FOLLOW_BELL + 1.2 ? Math.sin((k - FOLLOW_BELL) * 30) * 22 * Math.exp(-(k - FOLLOW_BELL) * 2.5) : Math.sin(k * 3) * 3;
  // hand slides in from bottom right, taps, then leaves
  const hx = lerp(k, 0.4, FOLLOW_TAP - 0.1, 360, 150) + lerp(k, FOLLOW_TAP + 0.4, FOLLOW_TAP + 0.9, 0, 260);
  const hy = lerp(k, 0.4, FOLLOW_TAP - 0.1, 260, 40) + (k >= FOLLOW_TAP - 0.08 && k < FOLLOW_TAP + 0.12 ? 14 : 0) + lerp(k, FOLLOW_TAP + 0.4, FOLLOW_TAP + 0.9, 0, 220);
  const ring = k >= FOLLOW_TAP && k < FOLLOW_TAP + 0.5 ? (k - FOLLOW_TAP) / 0.5 : -1;
  return (
    <g transform={`translate(${x} ${y}) scale(${p})`}>
      <Text x={0} y={-100} size={44} fill="#fff">{line}</Text>
      <g transform={`rotate(${wiggle}) scale(${press})`}>
        <rect x={-300} y={-62} width={600} height={124} rx={62} fill={tapped ? '#3a3f4b' : RED} stroke="#fff" strokeWidth={6} />
        <g transform={`translate(-205 0) rotate(${bell})`}>
          <path d="M-30 18 C-30 -30 -20 -40 0 -40 C20 -40 30 -30 30 18 L38 28 L-38 28 Z" fill={GOLD} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
          <circle cx={0} cy={36} r={9} fill={GOLD} stroke={INK} strokeWidth={4} />
          {k >= FOLLOW_BELL && k < FOLLOW_BELL + 0.8 && (
            <g stroke="#fff" strokeWidth={5} strokeLinecap="round" opacity={1 - (k - FOLLOW_BELL) / 0.8}>
              <path d="M-52 -20 Q-62 0 -52 20" fill="none" />
              <path d="M52 -20 Q62 0 52 20" fill="none" />
            </g>
          )}
        </g>
        <Text x={40} y={26} size={tapped ? 54 : 72} fill="#fff">{tapped ? "OBUNA BO'LDING" : "OBUNA BO'L"}</Text>
      </g>
      {ring >= 0 && <circle cx={150} cy={10} r={20 + ring * 90} fill="none" stroke="#fff" strokeWidth={6} opacity={1 - ring} />}
      {k > 0.4 && k < FOLLOW_TAP + 0.9 && (
        <g transform={`translate(${hx} ${hy}) rotate(-20)`}>
          <path d="M-14 -40 C-14 -54 14 -54 14 -40 L14 0 L40 6 C56 10 58 24 52 40 L40 80 L-26 80 L-44 30 C-50 16 -40 6 -28 14 L-14 24 Z" fill="#fff" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        </g>
      )}
    </g>
  );
};

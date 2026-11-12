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

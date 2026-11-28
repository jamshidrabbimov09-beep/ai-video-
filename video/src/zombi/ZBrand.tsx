import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BekAt} from '../tasavvur/common';
import {BekG} from '../tasavvur/Bek';
import {ZQ1} from './ZQ1';
import {useOswald} from '../tasavvur/common';

// New account identity for the zombie series: avatar (Bek under siren light) and a cover from a real video frame.
export const ZAvatar: React.FC = () => (
  <AbsoluteFill style={{background: '#101318'}}>
    <svg viewBox="0 0 1080 1080" width={1080} height={1080}>
      <defs>
        <linearGradient id="sir" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ff2a3a" stopOpacity={0.75} />
          <stop offset="50%" stopColor="#101318" stopOpacity={0} />
          <stop offset="100%" stopColor="#2a5cff" stopOpacity={0.75} />
        </linearGradient>
      </defs>
      <rect width={1080} height={1080} fill="#1a1f27" />
      <rect width={1080} height={1080} fill="url(#sir)" />
      <BekAt x={540} y={1700} s={1.9} mood="worried" shadow={false} />
      <text x={540} y={175} fontSize={100} fill="#fff" textAnchor="middle" fontFamily="Liberation Sans" fontWeight={700} letterSpacing={8} opacity={0.9}>41</text>
    </svg>
  </AbsoluteFill>
);

export const ZCover1: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <ZQ1 at={Math.round(74.0 * 30)} />
    <div style={{position: 'absolute', top: 1180, width: '100%', textAlign: 'center', fontFamily: 'Oswald, Liberation Sans', fontWeight: 700}}>
      <div style={{fontSize: 70, color: '#ff4b4b', letterSpacing: 8, textShadow: '0 4px 0 #000'}}>1-QISM</div>
      <div style={{fontSize: 150, color: '#fff', lineHeight: 1.0, marginTop: 10, WebkitTextStroke: '4px #000', textShadow: '0 8px 0 #000'}}>ORZU<br />USHALDI</div>
    </div>
  </AbsoluteFill>
);

// Umbrella channel logo for several drama series: "DAVOMI BOR" (to be continued). A red play sign that trails off into dots.
export const ZLogo: React.FC = () => {
  useOswald();
  return (
    <AbsoluteFill style={{background: '#0e0f12'}}>
      <svg viewBox="0 0 1080 1080" width={1080} height={1080}>
        <defs>
          <radialGradient id="lg" cx="50%" cy="45%" r="60%"><stop offset="0%" stopColor="#23262d" /><stop offset="100%" stopColor="#0e0f12" /></radialGradient>
        </defs>
        <rect width={1080} height={1080} fill="url(#lg)" />
        <path d="M330 300 Q330 262 364 280 L610 420 Q642 440 610 460 L364 600 Q330 618 330 580 Z" fill="#e63946" />
        {[0, 1, 2].map((i) => <circle key={i} cx={680 + i * 70} cy={440} r={24 - i * 3} fill="#ffffff" opacity={1 - i * 0.3} />)}
        <text x={540} y={800} fontSize={128} fill="#ffffff" textAnchor="middle" fontFamily="Oswald" fontWeight={700} letterSpacing={6}>DAVOMI BOR</text>
      </svg>
    </AbsoluteFill>
  );
};

// Channel logo "BEK OLAMI": Bek's head and shoulders as a planet with a mustard ring (olam = world), name below.
export const ZLogoBek: React.FC = () => {
  useOswald();
  const ring = <ellipse cx={540} cy={470} rx={420} ry={92} fill="none" stroke="#e0a526" strokeWidth={26} />;
  return (
    <AbsoluteFill style={{background: '#0d1530'}}>
      <svg viewBox="0 0 1080 1080" width={1080} height={1080}>
        <defs>
          <radialGradient id="bg2" cx="50%" cy="42%" r="65%"><stop offset="0%" stopColor="#24366e" /><stop offset="100%" stopColor="#0b1128" /></radialGradient>
          <clipPath id="planet"><circle cx={540} cy={440} r={270} /></clipPath>
          <clipPath id="front"><rect x={-200} y={470} width={1480} height={700} transform="rotate(-12 540 470)" /></clipPath>
        </defs>
        <rect width={1080} height={1080} fill="url(#bg2)" />
        {Array.from({length: 40}).map((_, i) => <circle key={i} cx={(i * 263) % 1080} cy={(i * 151) % 1080} r={2 + (i % 3)} fill="#fff" opacity={0.25 + (i % 4) * 0.15} />)}
        <g transform="rotate(-12 540 470)">{ring}</g>
        <circle cx={540} cy={440} r={270} fill="#3d78c4" stroke="#0b1128" strokeWidth={10} />
        <g clipPath="url(#planet)">
          <g transform="translate(540 455) scale(1.35) translate(-200 -250)"><BekG outfit="modern" mood="happy" shadow={false} /></g>
        </g>
        <g clipPath="url(#front)"><g transform="rotate(-12 540 470)">{ring}</g></g>
        <text x={540} y={900} fontSize={132} fill="#ffffff" textAnchor="middle" fontFamily="Oswald" fontWeight={700} letterSpacing={6}>BEK OLAMI</text>
      </svg>
    </AbsoluteFill>
  );
};

// "BEK OLAMI" in the clean style of the "Davomi bor" logo: dark background, flat red planet with a play sign and a ring, bold name.
export const ZLogoBek2: React.FC = () => {
  useOswald();
  const ring = <ellipse cx={540} cy={430} rx={300} ry={70} fill="none" stroke="#ffffff" strokeWidth={20} />;
  return (
    <AbsoluteFill style={{background: '#0e0f12'}}>
      <svg viewBox="0 0 1080 1080" width={1080} height={1080}>
        <defs>
          <radialGradient id="lg2" cx="50%" cy="45%" r="60%"><stop offset="0%" stopColor="#23262d" /><stop offset="100%" stopColor="#0e0f12" /></radialGradient>
          <clipPath id="front2"><rect x={-200} y={430} width={1480} height={700} transform="rotate(-16 540 430)" /></clipPath>
        </defs>
        <rect width={1080} height={1080} fill="url(#lg2)" />
        <g transform="rotate(-16 540 430)">{ring}</g>
        <circle cx={540} cy={430} r={190} fill="#e63946" />
        <g clipPath="url(#front2)"><g transform="rotate(-16 540 430)">{ring}</g></g>
        <path d="M498 352 Q498 330 518 342 L610 418 Q626 430 610 442 L518 518 Q498 530 498 508 Z" fill="#ffffff" stroke="#e63946" strokeWidth={14} paintOrder="stroke" />
        <text x={540} y={790} fontSize={128} fill="#ffffff" textAnchor="middle" fontFamily="Oswald" fontWeight={700} letterSpacing={6}>BEK OLAMI</text>
        <text x={540} y={860} fontSize={40} fill="#9aa0aa" textAnchor="middle" fontFamily="Oswald" fontWeight={700} letterSpacing={14}>2D SERIALLAR</text>
      </svg>
    </AbsoluteFill>
  );
};

// three logo variants for "BEK OLAMI" in the "Davomi bor" style
const LBg: React.FC = () => (
  <>
    <defs><radialGradient id="lg3" cx="50%" cy="45%" r="60%"><stop offset="0%" stopColor="#23262d" /><stop offset="100%" stopColor="#0e0f12" /></radialGradient></defs>
    <rect width={1080} height={1080} fill="url(#lg3)" />
  </>
);
export const ZLogoV: React.FC<{v: 'a' | 'b' | 'c'}> = ({v}) => {
  useOswald();
  return (
    <AbsoluteFill style={{background: '#0e0f12'}}>
      <svg viewBox="0 0 1080 1080" width={1080} height={1080}>
        <LBg />
        {v === 'a' && (
          <g>
            <path d="M330 300 Q330 262 364 280 L610 420 Q642 440 610 460 L364 600 Q330 618 330 580 Z" fill="#e63946" />
            {[0, 1, 2].map((i) => <circle key={i} cx={680 + i * 70} cy={440} r={24 - i * 3} fill="#ffffff" opacity={1 - i * 0.3} />)}
            <text x={540} y={800} fontSize={128} fill="#ffffff" textAnchor="middle" fontFamily="Oswald" fontWeight={700} letterSpacing={6}>BEK OLAMI</text>
          </g>
        )}
        {v === 'b' && (
          <g>
            <text x={540} y={500} fontSize={300} fill="#e63946" textAnchor="middle" fontFamily="Oswald" fontWeight={700} letterSpacing={10}>BEK</text>
            <text x={540} y={700} fontSize={150} fill="#ffffff" textAnchor="middle" fontFamily="Oswald" fontWeight={700} letterSpacing={30}>OLAMI</text>
            <path d="M470 760 L470 830 L530 795 Z" fill="#e63946" />
            {[0, 1, 2].map((i) => <circle key={i} cx={565 + i * 34} cy={795} r={11 - i * 2} fill="#fff" opacity={1 - i * 0.3} />)}
          </g>
        )}
        {v === 'c' && (
          <g>
            <rect x={340} y={200} width={400} height={400} rx={90} fill="#e63946" />
            <text x={540} y={500} fontSize={300} fill="#ffffff" textAnchor="middle" fontFamily="Oswald" fontWeight={700}>B</text>
            <path d="M640 250 L640 320 L700 285 Z" fill="#ffffff" />
            <text x={540} y={800} fontSize={128} fill="#ffffff" textAnchor="middle" fontFamily="Oswald" fontWeight={700} letterSpacing={6}>BEK OLAMI</text>
          </g>
        )}
      </svg>
    </AbsoluteFill>
  );
};

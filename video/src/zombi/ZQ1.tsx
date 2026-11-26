import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {BekAt, blinkAt, FPS, H, lerp, W} from '../tasavvur/common';
import {CAST, PersonAt, PhoneArm} from './Person';
import words from './zq1_words.json';

// Zombie series part 1 "Orzu ushaldi" (v2: every character drawn in Bek's style, lighter grade, dialogue-only subtitles).
export const ZQ1_FRAMES = Math.round(80 * FPS);
type WW = [string, number, number, string];
type S = React.FC<{t: number}>;
const red = (t: number) => Math.max(0, Math.sin(t * 9));
const blue = (t: number) => Math.max(0, -Math.sin(t * 9));

const Siren: React.FC<{t: number; k?: number}> = ({t, k = 1}) => (
  <>
    <rect width={W} height={H} fill="#ff2030" opacity={0.2 * k * red(t)} />
    <rect width={W} height={H} fill="#2050ff" opacity={0.2 * k * blue(t)} />
  </>
);
const Grade: React.FC<{t: number}> = ({t}) => (
  <>
    <defs>
      <radialGradient id="vig" cx="50%" cy="48%" r="72%">
        <stop offset="60%" stopColor="#000" stopOpacity={0} />
        <stop offset="100%" stopColor="#000" stopOpacity={0.55} />
      </radialGradient>
    </defs>
    <rect width={W} height={H} fill="url(#vig)" />
    <rect width={W} height={120} fill="#000" />
    <rect y={H - 120} width={W} height={120} fill="#000" />
  </>
);
const Board: React.FC = () => (
  <g>
    <rect x={0} y={120} width={W} height={900} fill="#c9d2c4" />
    <rect x={250} y={300} width={640} height={320} fill="#24453a" stroke="#6a5038" strokeWidth={16} />
    <text x={570} y={420} fontSize={56} fill="#e6efe6" textAnchor="middle" fontFamily="Liberation Serif">3-dars: Fizika</text>
    <path d="M330 500 H560 M330 550 H700" stroke="#e6efe6" strokeWidth={6} opacity={0.6} />
    <rect x={0} y={250} width={170} height={520} fill="#a9c4dc" stroke="#7d6a55" strokeWidth={14} />
    <path d="M85 250 V770 M0 510 H170" stroke="#7d6a55" strokeWidth={10} />
    <rect y={1020} width={W} height={900} fill="#b89a74" />
    <path d="M0 1020 H1080" stroke="#8d7452" strokeWidth={8} />
  </g>
);
const Desk: React.FC<{x: number; y: number; w: number}> = ({x, y, w}) => (
  <g>
    <rect x={x - w / 2} y={y} width={w} height={34} rx={6} fill="#a8774a" stroke="#2b1e16" strokeWidth={5} />
    <rect x={x - w / 2 + 14} y={y + 34} width={w - 28} height={150} fill="#8d6340" stroke="#2b1e16" strokeWidth={5} />
  </g>
);

// 1. game on the monitor, then Bek's face lit by it
const SRoom: S = ({t}) => (t < 1.9 ? <SGame t={t} /> : <SFace t={t} />);
const SGame: S = ({t}) => {
  const z = lerp(t, 0, 1.9, 1.0, 1.12);
  return (
    <g transform={`translate(540 960) scale(${z}) translate(-540 -960)`}>
      <rect width={W} height={H} fill="#06140b" />
      <rect x={60} y={560} width={960} height={760} rx={20} fill="#123a1b" stroke="#2b4d33" strokeWidth={12} />
      <path d="M60 1150 H1020" stroke="#1c5a2a" strokeWidth={6} />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <PersonAt key={i} x={150 + i * 150 + t * 30} y={1150 - (i % 2) * 30} s={0.32} {...CAST.boy3} topColor={['#5a6b4a', '#6b5a4a', '#4a5a6b'][i % 3]} zombie={1} eyeGlow={1} armsUp={i % 2 === 0} shadow={false} />
      ))}
      <text x={540} y={700} fontSize={64} fill="#9dff9d" textAnchor="middle" fontFamily="Liberation Mono">ZOMBIE  SURVIVAL</text>
    </g>
  );
};
const SFace: S = ({t}) => {
  const z = lerp(t, 1.9, 3.6, 1.0, 1.1);
  return (
    <g transform={`translate(540 1000) scale(${z}) translate(-540 -1000)`}>
      <rect width={W} height={H} fill="#151b26" />
      <rect x={80} y={420} width={260} height={360} fill="#283247" stroke="#3a4560" strokeWidth={8} />
      <text x={210} y={620} fontSize={44} fill="#9dff9d" textAnchor="middle" fontFamily="Liberation Mono" opacity={0.7}>ZOMBIE</text>
      <BekAt x={540} y={2300} s={2.1} mood="happy" blink={blinkAt(t)} />
      <rect y={1500} width={W} height={420} fill="#5cff7a" opacity={0.1} />
    </g>
  );
};
// 2. black -> window: "Bugun... orzusi ushaldi"
const SToday: S = ({t}) => (
  <g>
    <rect width={W} height={H} fill="#000" />
    <g opacity={lerp(t, 4.6, 5.6, 0, 1)}>
      <rect x={140} y={520} width={800} height={900} fill="#a9c4dc" />
      <path d="M140 1180 L240 1180 L240 1060 L320 1060 L320 1140 L420 1140 L420 1000 L500 1000 L500 1180 L640 1180 L640 1080 L720 1080 L720 1160 L940 1160 L940 1420 L140 1420 Z" fill="#7d8ea0" />
      <path d="M140 970 H940 M540 520 V1420" stroke="#7d6a55" strokeWidth={24} />
      <rect x={140} y={520} width={800} height={900} fill="none" stroke="#7d6a55" strokeWidth={30} />
    </g>
  </g>
);
// 3. classroom: teacher at the board, two rows of pupils; siren at 7.62
const SClass: S = ({t}) => {
  const siren = t > 7.62;
  const shake = siren ? lerp(t, 7.62, 8.4, 10, 1.5) : 0;
  const m = siren ? 'scared' : 'neutral';
  const look = siren ? -1 : 0;
  return (
    <g transform={`translate(${Math.sin(t * 53) * shake} ${Math.cos(t * 47) * shake})`}>
      <Board />
      <PersonAt x={880} y={1080} s={0.62} {...CAST.ustoz} mood={siren ? 'surprised' : 'neutral'} blink={blinkAt(t, 2)} lookX={look} />
      {[[200, CAST.girl2], [430, CAST.jasur], [660, CAST.sardor]].map(([x, c], i) => (
        <g key={i}><PersonAt x={x as number} y={1290} s={0.5} {...(c as object)} mood={m} blink={blinkAt(t, i)} lookX={look} /><Desk x={x as number} y={1150} w={200} /></g>
      ))}
      <PersonAt x={250} y={1760} s={0.78} {...CAST.doniyor} mood={siren ? 'scared' : 'happy'} blink={blinkAt(t, 3)} lookX={look} />
      <PersonAt x={560} y={1760} s={0.78} {...CAST.malika} mood={m} blink={blinkAt(t, 4)} lookX={look} />
      <BekAt x={830} y={1760} s={0.78} mood={siren ? 'surprised' : 'neutral'} blink={blinkAt(t, 1)} lookX={look * 0.8} />
      <Desk x={400} y={1530} w={560} /><Desk x={830} y={1530} w={300} />
      {siren && <><Siren t={t} k={1.3} /><rect width={W} height={H} fill="#fff" opacity={lerp(t, 7.62, 7.75, 0.4, 0)} /></>}
    </g>
  );
};
// 4. phones with the same alert, held by pupils
const SPhones: S = ({t}) => {
  const k = t - 9.8;
  return (
    <g>
      <rect width={W} height={H} fill="#3a3f48" />
      {[[300, 900, -8, 0], [780, 820, 6, 0.25], [540, 1320, -2, 0.5]].map(([x, y, r, d], i) => {
        const p = lerp(k, d, d + 0.3, 0, 1);
        return (
          <g key={i} transform={`translate(${x} ${y}) rotate(${r}) scale(${0.9 + 0.1 * p})`} opacity={p}>
            <rect x={-170} y={-320} width={340} height={640} rx={40} fill="#0b0d10" stroke="#2b1e16" strokeWidth={8} />
            <rect x={-150} y={-290} width={300} height={580} rx={24} fill="#dfe6ee" />
            <rect x={-140} y={-230} width={280} height={190} rx={18} fill="#d22a2a" />
            <text x={0} y={-170} fontSize={34} fill="#fff" textAnchor="middle" fontFamily="Liberation Sans" fontWeight={700}>⚠ FAVQULODDA</text>
            <text x={0} y={-120} fontSize={26} fill="#fff" textAnchor="middle" fontFamily="Liberation Sans">Shahar evakuatsiya</text>
            <text x={0} y={-88} fontSize={26} fill="#fff" textAnchor="middle" fontFamily="Liberation Sans">qilinmoqda</text>
            <circle cx={-110} cy={300} r={46} fill="#f2c39b" stroke="#2b1e16" strokeWidth={5} /><circle cx={110} cy={300} r={46} fill="#f2c39b" stroke="#2b1e16" strokeWidth={5} />
          </g>
        );
      })}
      <Siren t={t} k={0.7} />
    </g>
  );
};
// 5. faces at the window (seen from outside), then the street
const SWindow: S = ({t}) => {
  if (t < 16.6) {
    return (
      <g>
        <rect width={W} height={H} fill="#d8c8a8" />
        <rect x={60} y={480} width={960} height={980} fill="#a9c4dc" />
        <rect x={60} y={480} width={960} height={980} fill="#e9f3fb" opacity={0.25} />
        <PersonAt x={250} y={1340} s={0.95} {...CAST.doniyor} mood="scared" blink={blinkAt(t, 3)} lookX={0.8} />
        <BekAt x={540} y={1320} s={0.95} mood="surprised" blink={blinkAt(t, 1)} lookX={0.9} />
        <PersonAt x={830} y={1340} s={0.95} {...CAST.malika} mood="scared" blink={blinkAt(t, 4)} lookX={0.8} />
        <rect x={0} y={1230} width={1080} height={700} fill="#d8c8a8" />
        <rect x={40} y={1215} width={1000} height={34} fill="#b8a888" stroke="#2b1e16" strokeWidth={5} />
        <path d="M60 610 H1020 M540 480 V610" stroke="#7d6a55" strokeWidth={26} />
        <rect x={60} y={480} width={960} height={750} fill="none" stroke="#7d6a55" strokeWidth={34} />
        <path d="M160 560 L360 520 M700 600 L900 560" stroke="#fff" strokeWidth={10} opacity={0.35} />
        <Siren t={t} />
      </g>
    );
  }
  const k = t - 16.6;
  const att = lerp(t, 18.5, 18.9, 0, 1);
  return (
    <g>
      <rect width={W} height={H} fill="#9fb3c6" />
      <path d="M0 860 L120 860 L120 640 L300 640 L300 800 L460 800 L460 560 L620 560 L620 820 L820 820 L820 700 L1080 700 L1080 1100 L0 1100 Z" fill="#7a8796" />
      <rect y={1100} width={W} height={820} fill="#6c6f74" />
      <path d="M0 1450 H1080" stroke="#e8e2c8" strokeWidth={10} strokeDasharray="60 50" />
      {[[0, CAST.boy3], [1, CAST.girl2], [2, CAST.jasur], [3, CAST.ustoz]].map(([i, c]) => (
        <PersonAt key={i as number} x={((k * (260 + (i as number) * 50) + (i as number) * 260) % 1300) - 100} y={1300 + ((i as number) % 2) * 160} s={0.42} {...(c as object)} mood="scared" swing={Math.sin(t * 14 + (i as number)) * 30} />
      ))}
      {/* a zombie lunges at a man */}
      <PersonAt x={lerp(t, 17.4, 18.5, 940, 700) - att * 40} y={1720} s={0.6} {...CAST.boy3} topColor="#6b5a4a" zombie={1} eyeGlow={1} armsUp rot={-12 * att} />
      <PersonAt x={560 - att * 20} y={1720} s={0.6} {...CAST.ustoz} hair="short" glasses={false} mustache={false} mood="scared" rot={-18 * att} />
      <Siren t={t} />
    </g>
  );
};
// 6. the teacher shouts and slams the door
const STeacher: S = ({t}) => {
  const shut = lerp(t, 22.3, 22.6, 0, 1);
  return (
    <g>
      <rect width={W} height={H} fill="#c9d2c4" />
      <rect x={560} y={360} width={440} height={1140} fill="#2a2f36" />
      <rect x={560 + 440 * (1 - shut) * 0.9} y={360} width={440 - 396 * (1 - shut)} height={1140} fill="#8a6440" stroke="#2b1e16" strokeWidth={8} />
      <rect y={1500} width={W} height={420} fill="#b89a74" />
      <PersonAt x={380} y={1880} s={1.35} {...CAST.ustoz} mood="shout" swing={t < 22.3 ? 20 + Math.sin(t * 10) * 8 : 0} blink={0} lookX={-0.6} />
      {t > 22.6 && <rect width={W} height={H} fill="#000" opacity={lerp(t, 22.6, 22.75, 0.5, 0)} />}
      <Siren t={t} k={0.6} />
    </g>
  );
};
// 7. the school gate closes, pupils inside
const SGate: S = ({t}) => {
  const c = lerp(t, 23.4, 24.5, 0, 1);
  return (
    <g>
      <rect width={W} height={H} fill="#9fb3c6" />
      <rect x={60} y={420} width={960} height={600} fill="#d9c9a3" stroke="#2b1e16" strokeWidth={8} />
      {[0, 1, 2, 3, 4, 5].map((i) => <rect key={i} x={130 + i * 150} y={500} width={90} height={130} fill="#7aa0c4" stroke="#2b1e16" strokeWidth={5} />)}
      <text x={540} y={760} fontSize={60} fill="#5a4630" textAnchor="middle" fontFamily="Liberation Sans" fontWeight={700}>MAKTAB №41</text>
      <rect y={1020} width={W} height={900} fill="#8a8d92" />
      {[[300, CAST.jasur], [540, CAST.malika], [780, CAST.doniyor]].map(([x, cc], i) => <PersonAt key={i} x={x as number} y={1560} s={0.6} {...(cc as object)} mood="scared" blink={blinkAt(t, i)} />)}
      {[-1, 1].map((d) => (
        <g key={d} transform={`translate(${d < 0 ? -540 * (1 - c) : 540 + 540 * (1 - c)} 0)`}>
          {Array.from({length: 8}).map((_, i) => <rect key={i} x={20 + i * 66} y={980} width={18} height={720} fill="#1d2228" />)}
          <rect x={0} y={980} width={540} height={26} fill="#1d2228" /><rect x={0} y={1640} width={540} height={26} fill="#1d2228" />
        </g>
      ))}
      {t > 24.5 && <rect width={W} height={H} fill="#fff" opacity={lerp(t, 24.5, 24.62, 0.3, 0)} />}
      <Siren t={t} />
    </g>
  );
};
// 8. Bek freezes: what about his family?
const SFreeze: S = ({t}) => {
  const z = lerp(t, 26.6, 32.4, 1.0, 1.2);
  return (
    <g transform={`translate(540 900) scale(${z}) translate(-540 -900)`}>
      <Board />
      <g opacity={0.6} style={{filter: 'blur(10px)'}}>
        <PersonAt x={200} y={1500} s={0.8} {...CAST.jasur} mood="scared" />
        <PersonAt x={880} y={1500} s={0.8} {...CAST.girl2} mood="scared" />
      </g>
      <BekAt x={540} y={2400} s={2.2} mood={t > 29 ? 'worried' : 'surprised'} blink={blinkAt(t)} />
      <rect width={W} height={H} fill="#000" opacity={0.25} />
      <Siren t={t} k={0.4} />
    </g>
  );
};
// 9. calling mum
const SCall: S = ({t}) => {
  const connected = t > 40.9;
  const pulse = (t * 1.5) % 1;
  return (
    <g>
      <rect width={W} height={H} fill="#3a3f48" />
      <g transform="translate(540 1000)">
        <rect x={-300} y={-600} width={600} height={1200} rx={70} fill="#0b0d10" stroke="#2b1e16" strokeWidth={14} />
        <rect x={-270} y={-560} width={540} height={1120} rx={44} fill={connected ? '#1f4a30' : '#1e2733'} />
        {!connected && <circle cx={0} cy={-250} r={110 + pulse * 70} fill="none" stroke="#6fd18a" strokeWidth={6} opacity={1 - pulse} />}
        <circle cx={0} cy={-250} r={110} fill="#c9b3d9" />
        <g transform="translate(0 -250) scale(0.55) translate(-200 -215)"><PersonAt x={200} y={730} s={1} {...CAST.ona} mood="neutral" shadow={false} /></g>
        <text x={0} y={-60} fontSize={76} fill="#fff" textAnchor="middle" fontFamily="Liberation Sans" fontWeight={700}>Oyim</text>
        <text x={0} y={10} fontSize={40} fill="#c5ced8" textAnchor="middle" fontFamily="Liberation Sans">
          {connected ? `00:0${Math.min(9, Math.floor(t - 40.9))}` : t > 34.6 && t < 37.0 ? "Javob yo'q" : "Qo'ng'iroq qilinmoqda..."}
        </text>
        <circle cx={0} cy={400} r={70} fill="#d23a3a" />
      </g>
    </g>
  );
};
// 10. split: Bek in the classroom / mum on the evacuation bus
const SSplit: S = ({t}) => {
  const ws = words as WW[];
  const sp = ws.find((w, k) => t >= w[1] && (k === ws.length - 1 || t < ws[k + 1][1]))?.[3];
  return (
    <g>
      <g>
        <rect width={W} height={960} fill="#c9d2c4" />
        <rect x={0} y={250} width={170} height={520} fill="#a9c4dc" stroke="#7d6a55" strokeWidth={14} />
        <BekAt x={540} y={1560} s={1.5} mood={t > 53 ? 'worried' : 'surprised'} blink={blinkAt(t)} lookX={0.3} />
        <g transform="translate(540 1560) scale(1.5) translate(-200 -730)"><PhoneArm color="#e0a526" skin="#f2c39b" /></g>
        <rect width={W} height={960} fill="#000" opacity={sp === 'B' ? 0 : 0.25} />
        <rect width={W} height={960} fill="#ff2030" opacity={0.12 * red(t)} />
      </g>
      <g>
        <rect y={960} width={W} height={960} fill="#5a6474" />
        <defs>
          <clipPath id="buswin"><rect x={60} y={1040} width={960} height={360} rx={30} /></clipPath>
          <linearGradient id="dusk" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3b3f63" /><stop offset="70%" stopColor="#c8644a" /><stop offset="100%" stopColor="#f0a060" /></linearGradient>
        </defs>
        <g clipPath="url(#buswin)">
          <rect x={60} y={1040} width={960} height={360} fill="url(#dusk)" />
          {/* smoke columns and fire glow far away */}
          <ellipse cx={780} cy={1330} rx={220} ry={60} fill="#ff7a2a" opacity={0.5 + 0.15 * Math.sin(t * 5)} />
          {[0, 1, 2].map((i) => <ellipse key={i} cx={760 + i * 30 + Math.sin(t + i) * 10} cy={1250 - i * 60 - ((t * 20) % 40)} rx={70 + i * 25} ry={45 + i * 12} fill="#2a2a30" opacity={0.55} />)}
          {/* far skyline, slow */}
          {Array.from({length: 12}).map((_, i) => {
            const x = ((i * 130 - t * 40) % 1560 + 1560) % 1560 - 200;
            const h = 120 + ((i * 47) % 110);
            return <g key={i}><rect x={x} y={1400 - h} width={110} height={h} fill="#2c3048" />{Array.from({length: 6}).map((__, j) => <rect key={j} x={x + 14 + (j % 3) * 30} y={1400 - h + 18 + Math.floor(j / 3) * 34} width={14} height={18} fill="#ffd27a" opacity={(i + j) % 3 ? 0.8 : 0.15} />)}</g>;
          })}
          {/* near buildings and street lamps, fast */}
          {Array.from({length: 5}).map((_, i) => {
            const x = ((i * 320 - t * 520) % 1600 + 1600) % 1600 - 300;
            return (
              <g key={i}>
                <rect x={x} y={1180} width={190} height={240} fill="#1c1f2c" />
                {Array.from({length: 8}).map((__, j) => <rect key={j} x={x + 20 + (j % 4) * 42} y={1205 + Math.floor(j / 4) * 60} width={24} height={34} fill="#ffcf6a" opacity={(i * 3 + j) % 4 ? 0.85 : 0.1} />)}
                <rect x={x + 250} y={1150} width={10} height={260} fill="#111" /><circle cx={x + 255} cy={1150} r={14} fill="#fff2b0" />
              </g>
            );
          })}
          {/* police light flashes on the glass */}
          <rect x={60} y={1040} width={960} height={360} fill="#ff2030" opacity={0.18 * red(t)} />
          <rect x={60} y={1040} width={960} height={360} fill="#2050ff" opacity={0.18 * blue(t)} />
          <path d="M140 1060 L300 1040 M640 1060 L820 1040" stroke="#fff" strokeWidth={8} opacity={0.25} />
        </g>
        <path d="M60 1220 H1020" stroke="#3a4250" strokeWidth={14} />
        <rect x={40} y={1600} width={1000} height={320} fill="#3f6e8f" />
        <PersonAt x={560} y={1960 + Math.sin(t * 6) * 4} s={1.0} {...CAST.ona} mood="worried" phone blink={blinkAt(t, 2)} />
        <rect y={960} width={W} height={960} fill="#000" opacity={sp === 'O' ? 0 : 0.25} />
      </g>
      <rect y={952} width={W} height={16} fill="#000" />
    </g>
  );
};
// 11. call dropped
const SDropped: S = () => (
  <g>
    <rect width={W} height={H} fill="#3a3f48" />
    <g transform="translate(540 1000)">
      <rect x={-300} y={-600} width={600} height={1200} rx={70} fill="#0b0d10" stroke="#2b1e16" strokeWidth={14} />
      <rect x={-270} y={-560} width={540} height={1120} rx={44} fill="#1e2733" />
      <text x={0} y={-60} fontSize={76} fill="#fff" textAnchor="middle" fontFamily="Liberation Sans" fontWeight={700}>Oyim</text>
      <text x={0} y={20} fontSize={48} fill="#ff5a5a" textAnchor="middle" fontFamily="Liberation Sans" fontWeight={700}>Aloqa uzildi</text>
    </g>
  </g>
);
// 12. Bek looks back: Sardor in the corner hiding his hand
const SSardor: S = ({t}) => {
  const z = lerp(t, 66.9, 70.1, 1, 1.15);
  return (
    <g transform={`translate(420 1300) scale(${z}) translate(-420 -1300)`}>
      <rect width={W} height={H} fill="#b9c2b4" />
      <path d="M0 120 L640 700 L640 1920 L0 1920 Z" fill="#a9b2a4" />
      <rect y={1500} width={W} height={420} fill="#9e8462" />
      <PersonAt x={400} y={1760} s={1.3} {...CAST.sardor} mood="worried" sweat zombie={lerp(t, 66.9, 70, 0.1, 0.35)} blink={blinkAt(t, 5)} lookX={0.4} swing={-8} />
      <rect width={W} height={H} fill="#000" opacity={0.2} />
      <g transform={`translate(${lerp(t, 64.6, 65.6, 1380, 1000)} 0)`}>
        <BekAt x={0} y={2500} s={2.3} mood="surprised" blink={0} lookX={-1} />
      </g>
      <Siren t={t} k={0.4} />
    </g>
  );
};
// 13. close-up: Sardor's eyes change
const SEyes: S = ({t}) => {
  const g = lerp(t, 70.6, 72.6, 0, 1);
  return (
    <g>
      <rect width={W} height={H} fill="#0d0f12" />
      <PersonAt x={540} y={2950} s={4.2} {...CAST.sardor} zombie={0.35 + 0.5 * g} eyeGlow={g} mood="determined" shadow={false} />
      <rect width={W} height={H} fill="#000" opacity={0.25} />
      {t > 73.3 && <rect width={W} height={H} fill="#000" />}
    </g>
  );
};
// 14. end card
const SEnd: S = ({t}) => (
  <g>
    <rect width={W} height={H} fill="#000" />
    <text x={540} y={860} fontSize={66} fill="#fff" textAnchor="middle" fontFamily="Liberation Sans" fontWeight={700} opacity={lerp(t, 73.6, 74.2, 0, 1)}>Sen Bekning o'rnida</text>
    <text x={540} y={950} fontSize={66} fill="#fff" textAnchor="middle" fontFamily="Liberation Sans" fontWeight={700} opacity={lerp(t, 73.9, 74.5, 0, 1)}>nima qilarding?</text>
    <text x={540} y={1180} fontSize={46} fill="#ff4b4b" textAnchor="middle" fontFamily="Liberation Sans" fontWeight={700} letterSpacing={6} opacity={lerp(t, 76.6, 77.2, 0, 1)}>1-QISM · DAVOMI BOR</text>
  </g>
);

const SCENES: [number, number, S][] = [
  [0, 3.6, SRoom], [3.6, 6.1, SToday], [6.1, 9.8, SClass], [9.8, 14.4, SPhones], [14.4, 19.7, SWindow],
  [19.7, 23.3, STeacher], [23.3, 26.7, SGate], [26.7, 32.5, SFreeze], [32.5, 41.1, SCall], [41.1, 62.4, SSplit],
  [62.4, 64.5, SDropped], [64.5, 70.1, SSardor], [70.1, 73.55, SEyes], [73.55, 999, SEnd],
];

// subtitles only for the phone dialogue (mum and Bek), one short line at a time
const Subs: React.FC<{t: number}> = ({t}) => {
  const ws = (words as WW[]).filter((w) => w[3] !== 'N');
  const i = ws.findIndex((w, k) => t >= w[1] - 0.05 && (k === ws.length - 1 || t < ws[k + 1][1] - 0.05));
  if (i < 0 || t > ws[i][2] + 0.7) return null;
  let a = i;
  while (a > 0 && i - a < 3 && ws[a - 1][3] === ws[i][3] && !/[.!?…]$/.test(ws[a - 1][0])) a--;
  const sp = ws[i][3];
  const text = ws.slice(a, i + 1).map((w) => w[0]).join(' ');
  return (
    <div style={{position: 'absolute', top: sp === 'B' ? 180 : 1000, width: '100%', textAlign: 'center', fontFamily: 'Liberation Sans, Arial', fontWeight: 700, fontSize: 54, color: '#fff', textShadow: '0 3px 0 #000, 0 0 14px #000'}}>
      {text}
    </div>
  );
};

export const ZQ1: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const idx = SCENES.findIndex(([a, b]) => t >= a && t < b);
  const [, , Sc] = SCENES[Math.max(0, idx)];
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
        <Sc t={t} />
        <Grade t={t} />
      </svg>
      {t > 41 && t < 62.6 && <Subs t={t} />}
    </AbsoluteFill>
  );
};

// "Eskizdan 3D'ga": Go'ri Amir. A pencil sketch draws itself, then the same building
// assembles in code-made 3D (Three.js) while the camera orbits it.
import React, {useMemo} from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import * as THREE from 'three';
import {useThree} from '@react-three/fiber';
import {useOswald} from '../tasavvur/common';

export const GA_FRAMES = 450;
const W = 1080, H = 1920;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// ---------- textures (canvas, built once) ----------
const canvasTex = (w: number, h: number, draw: (c: CanvasRenderingContext2D) => void, rx = 1, ry = 1) => {
  const cv = document.createElement('canvas');
  cv.width = w; cv.height = h;
  draw(cv.getContext('2d')!);
  const t = new THREE.CanvasTexture(cv);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(rx, ry);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};

// brick wall with small blue girih diamonds
const brickTex = () => canvasTex(256, 256, (c) => {
  c.fillStyle = '#c9a77a'; c.fillRect(0, 0, 256, 256);
  for (let y = 0; y < 256; y += 16) {
    const off = (y / 16) % 2 ? 16 : 0;
    for (let x = -32; x < 256; x += 32) {
      const v = 190 + ((x * 7 + y * 13) % 30);
      c.fillStyle = `rgb(${v},${v - 32},${v - 78})`;
      c.fillRect(x + off + 1, y + 1, 30, 14);
    }
  }
  c.fillStyle = '#1f6fa8';
  for (let y = 24; y < 256; y += 64) for (let x = 16; x < 256; x += 64) {
    c.beginPath(); c.moveTo(x + 16, y); c.lineTo(x + 32, y + 16); c.lineTo(x + 16, y + 32); c.lineTo(x, y + 16); c.fill();
  }
}, 8, 6);

// drum band: big white "kufic"-like blocks on deep blue tile
const drumTex = () => canvasTex(512, 128, (c) => {
  c.fillStyle = '#0f4d86'; c.fillRect(0, 0, 512, 128);
  c.fillStyle = '#e9f2f8';
  for (let x = 0; x < 512; x += 64) {
    c.fillRect(x + 6, 16, 12, 96); c.fillRect(x + 6, 100, 44, 12); c.fillRect(x + 38, 40, 12, 72);
    c.fillRect(x + 22, 16, 28, 12);
  }
  c.fillStyle = '#f2c14e'; c.fillRect(0, 0, 512, 6); c.fillRect(0, 122, 512, 6);
}, 6, 1);

// dome tiles: turquoise with fine lighter glints
const domeTex = () => canvasTex(256, 256, (c) => {
  c.fillStyle = '#1fa3c4'; c.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 900; i++) {
    const x = (i * 97) % 256, y = (i * 61) % 256;
    c.fillStyle = i % 3 ? 'rgba(255,255,255,0.10)' : 'rgba(0,40,80,0.18)';
    c.fillRect(x, y, 6, 3);
  }
}, 8, 4);

// ---------- ribbed "melon" dome geometry ----------
const ribDome = (R: number, Hd: number, ribs: number) => {
  const seg = ribs * 6, rows = 48;
  const g = new THREE.BufferGeometry();
  const pos: number[] = [], uv: number[] = [], idx: number[] = [];
  for (let j = 0; j <= rows; j++) {
    const t = j / rows; // 0 bottom -> 1 tip
    // bulb profile: swells out above the base, then closes to a point
    const prof = t < 0.35 ? 1 + 0.18 * Math.sin((t / 0.35) * Math.PI / 2) : 1.18 * Math.cos(((t - 0.35) / 0.65) * Math.PI / 2) ** 0.85;
    for (let i = 0; i <= seg; i++) {
      const a = (i / seg) * Math.PI * 2;
      const rib = 1 + 0.05 * Math.abs(Math.cos((ribs / 2) * a)) * (1 - t * 0.7);
      const r = R * prof * rib;
      pos.push(Math.cos(a) * r, t * Hd, Math.sin(a) * r);
      uv.push(i / seg, t);
    }
  }
  for (let j = 0; j < rows; j++) for (let i = 0; i < seg; i++) {
    const a = j * (seg + 1) + i, b = a + seg + 1;
    idx.push(a, b, a + 1, b, b + 1, a + 1);
  }
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
};

// ---------- 3D scene ----------
const Building: React.FC<{f: number}> = ({f}) => {
  const {fps} = useVideoConfig();
  const tex = useMemo(() => ({brick: brickTex(), drum: drumTex(), dome: domeTex()}), []);
  const dome = useMemo(() => ribDome(3.1, 5.4, 64), []);
  const sp = (start: number, damping = 14) => spring({frame: f - start, fps, config: {damping, mass: 0.8}});

  // assembly timeline (frames)
  const base = sp(108), drum = sp(128), domeS = sp(150, 10), portal = sp(172), mins = sp(194), finial = sp(214, 8);
  const rise = (s: number, y: number) => y - (1 - s) * 6;

  const brick = <meshStandardMaterial map={tex.brick} roughness={0.9} />;
  return (
    <group>
      {/* ground + plinth */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[300, 64]} />
        <meshStandardMaterial color="#b89a72" roughness={1} />
      </mesh>
      <mesh position={[0, 0.25, 0]} scale={[base, 1, base]} receiveShadow castShadow>
        <cylinderGeometry args={[9, 9.4, 0.5, 8]} />
        <meshStandardMaterial color="#d8c3a0" roughness={0.95} />
      </mesh>

      {/* octagonal body */}
      <group position={[0, rise(base, 0.5), 0]} scale={[1, Math.max(0.001, base), 1]}>
        <mesh position={[0, 3.5, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[5.4, 5.6, 7, 8]} />
          {brick}
        </mesh>
        {/* arched niches on the faces */}
        {Array.from({length: 8}).map((_, i) => {
          const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
          return (
            <mesh key={i} position={[Math.sin(a) * 5.05, 3.4, Math.cos(a) * 5.05]} rotation={[0, a, 0]}>
              <boxGeometry args={[2.4, 4.6, 0.3]} />
              <meshStandardMaterial color="#123c66" roughness={0.7} />
            </mesh>
          );
        })}
      </group>

      {/* drum with inscription band */}
      <group position={[0, rise(drum, 7.5), 0]} scale={[drum, drum, drum]}>
        <mesh position={[0, 1.6, 0]} castShadow>
          <cylinderGeometry args={[3.35, 3.35, 3.2, 64, 1, true]} />
          <meshStandardMaterial map={tex.drum} roughness={0.45} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 3.25, 0]}>
          <cylinderGeometry args={[3.55, 3.4, 0.25, 64]} />
          <meshStandardMaterial color="#f2c14e" roughness={0.5} metalness={0.2} />
        </mesh>
      </group>

      {/* ribbed dome */}
      <group position={[0, 10.85, 0]} scale={[domeS, domeS, domeS]}>
        <mesh geometry={dome} castShadow>
          <meshStandardMaterial map={tex.dome} roughness={0.3} metalness={0.05} />
        </mesh>
        <group scale={[finial, finial, finial]} position={[0, 5.3, 0]}>
          <mesh position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.06, 0.12, 1.4, 12]} />
            <meshStandardMaterial color="#f2c14e" metalness={0.7} roughness={0.3} />
          </mesh>
          <mesh position={[0, 1.3, 0]}>
            <sphereGeometry args={[0.22, 16, 16]} />
            <meshStandardMaterial color="#f2c14e" metalness={0.7} roughness={0.3} />
          </mesh>
        </group>
      </group>

      {/* entrance portal (peshtoq) */}
      <group position={[0, rise(portal, 0.5), 7.2]} scale={[portal, Math.max(0.001, portal), portal]}>
        <mesh position={[0, 4.6, 0]} castShadow receiveShadow>
          <boxGeometry args={[7.6, 9.2, 2.4]} />
          {brick}
        </mesh>
        <mesh position={[0, 3.6, 1.05]}>
          <boxGeometry args={[3.6, 6.4, 0.5]} />
          <meshStandardMaterial color="#0d2f52" roughness={0.6} />
        </mesh>
        <mesh position={[0, 6.8, 1.05]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[1.8, 1.8, 0.5, 32, 1, false, 0, Math.PI]} />
          <meshStandardMaterial color="#0d2f52" roughness={0.6} />
        </mesh>
        <mesh position={[0, 8.7, 1.22]}>
          <boxGeometry args={[7.6, 0.7, 0.05]} />
          <meshStandardMaterial map={tex.drum} roughness={0.45} />
        </mesh>
        {/* two minarets on the portal corners */}
        {[-1, 1].map((s) => (
          <group key={s} position={[s * 3.8, 0, 0.9]} scale={[1, Math.max(0.001, mins), 1]}>
            <mesh position={[0, 6.5, 0]} castShadow>
              <cylinderGeometry args={[0.55, 0.7, 13, 24]} />
              {brick}
            </mesh>
            <mesh position={[0, 11.5, 0]}>
              <cylinderGeometry args={[0.6, 0.6, 1.2, 24]} />
              <meshStandardMaterial map={tex.drum} roughness={0.45} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
};

const Scene: React.FC = () => {
  const f = useCurrentFrame();
  // camera: low orbit that slowly rises and pulls back
  const t = interpolate(f, [110, 450], [0, 1], clamp);
  const ang = interpolate(t, [0, 1], [0.9, -0.55]);
  const dist = interpolate(t, [0, 0.35, 1], [44, 50, 54], {easing: Easing.inOut(Easing.cubic)});
  const camY = interpolate(t, [0, 1], [6, 14]);
  const cam = useMemo(() => new THREE.Vector3(), []);
  cam.set(Math.sin(ang) * dist, camY, Math.cos(ang) * dist);
  return (
    <>
      <PerspectiveCam pos={cam} target={[0, 9.5, 0]} />
      <color attach="background" args={['#f0b98a']} />
      <fog attach="fog" args={['#e9b48a', 45, 110]} />
      <hemisphereLight args={['#ffe2bf', '#6b4a2f', 0.9]} />
      <directionalLight
        position={[18, 26, 14]} intensity={2.6} color="#ffd6a1" castShadow
        shadow-mapSize={[2048, 2048]} shadow-camera-left={-25} shadow-camera-right={25}
        shadow-camera-top={25} shadow-camera-bottom={-25} shadow-bias={-0.0004}
      />
      <directionalLight position={[-20, 10, -10]} intensity={0.6} color="#9fc4ff" />
      <Building f={f} />
    </>
  );
};

// a camera aimed every frame
const PerspectiveCam: React.FC<{pos: THREE.Vector3; target: [number, number, number]}> = ({pos, target}) => {
  const {camera} = useThree();
  camera.position.copy(pos);
  camera.lookAt(...target);
  (camera as THREE.PerspectiveCamera).fov = 38;
  camera.updateProjectionMatrix();
  return null;
};

// ---------- sketch (SVG, draws itself) ----------
const SK = '#2b2b2b';
const Stroke: React.FC<{d: string; p: number; w?: number}> = ({d, p, w = 3}) => (
  <path d={d} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} fill="none" stroke={SK}
    strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
);
// sketch strokes in drawing order (viewBox 600x760)
const STROKES = [
  'M60 650 C200 646 400 654 540 648',                       // ground
  'M175 645 L178 420 M425 645 L422 420 M178 420 L422 420',   // body
  'M215 645 L215 470 Q245 440 275 470 L275 645',             // niche L
  'M325 645 L325 470 Q355 440 385 470 L385 645',             // niche R
  'M222 420 L224 345 M378 420 L376 345 M222 380 L378 380',   // drum + band
  'M220 345 C160 300 190 215 300 150 C410 215 440 300 380 345 Z', // dome bulb
  'M260 340 C230 290 250 210 300 152 M340 340 C370 290 350 210 300 152 M300 345 L300 152', // ribs
  'M300 150 L300 112 M292 104 a8 8 0 1 0 16 0 a8 8 0 1 0 -16 0',  // finial
  'M120 648 L122 330 M145 648 L143 330 M118 330 L148 330',   // minaret L
  'M455 648 L457 330 M480 648 L478 330 M453 330 L483 330',   // minaret R
];

const Sketch: React.FC<{f: number}> = ({f}) => {
  const per = 9; // frames per stroke
  return (
    <svg viewBox="0 0 600 760" width="100%" height="100%">
      {STROKES.map((d, i) => (
        <Stroke key={i} d={d} p={interpolate(f, [8 + i * per, 8 + (i + 1) * per + 4], [0, 1], clamp)} />
      ))}
      {/* hatching on the dome */}
      <Stroke d="M235 300 L262 280 M242 318 L268 300 M250 334 L272 318" p={interpolate(f, [100, 108], [0, 1], clamp)} w={2} />
      <text x={300} y={712} textAnchor="middle" fontFamily="'Liberation Serif', serif" fontStyle="italic" fontSize={40} fill={SK}
        opacity={interpolate(f, [96, 108], [0, 1], clamp)}>Go'ri Amir</text>
    </svg>
  );
};

// ---------- composition ----------
export const GoriAmir: React.FC = () => {
  useOswald();
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();

  // sketch card: full-size and centred while drawing, then flies to the top-left corner
  const fly = spring({frame: f - 112, fps, config: {damping: 16}});
  const cardW = interpolate(fly, [0, 1], [820, 300]);
  const cardH = cardW * (760 / 600);
  const cardX = interpolate(fly, [0, 1], [(W - 820) / 2, 50]);
  const cardY = interpolate(fly, [0, 1], [430, 1290]);
  const tilt = interpolate(fly, [0, 1], [0, -4]);
  const show3d = interpolate(f, [100, 118], [0, 1], clamp);
  const endT = interpolate(f, [330, 352], [0, 1], clamp);

  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 40%, #2a2a2e, #0e0e10 70%)'}}>
      <AbsoluteFill style={{opacity: show3d}}>
        <ThreeCanvas width={W} height={H} shadows gl={{antialias: true, preserveDrawingBuffer: true}}
          camera={{fov: 38, near: 0.1, far: 300, position: [20, 6, 20]}}>
          <Scene />
        </ThreeCanvas>
        {/* top shade for captions */}
        <AbsoluteFill style={{background: 'linear-gradient(#000a, #0000 28%, #0000 78%, #0008)'}} />
      </AbsoluteFill>

      {/* label above the sketch */}
      <div style={{position: 'absolute', left: cardX, top: cardY - 64, transform: `rotate(${tilt}deg)`,
        fontFamily: 'Oswald', fontWeight: 700, fontSize: interpolate(fly, [0, 1], [56, 38]), color: '#fff', letterSpacing: 2}}>
        ESKIZ
      </div>
      <div style={{position: 'absolute', left: cardX, top: cardY, width: cardW, height: cardH, background: '#fbfaf6',
        borderRadius: 14, boxShadow: '0 20px 50px #0008', transform: `rotate(${tilt}deg)`, overflow: 'hidden'}}>
        <Sketch f={f} />
      </div>

      {/* top title */}
      <div style={{position: 'absolute', top: 120, width: '100%', textAlign: 'center', fontFamily: 'Oswald', fontWeight: 700,
        color: '#fff', fontSize: 74, letterSpacing: 3, textShadow: '0 4px 18px #000a',
        opacity: interpolate(f, [0, 10], [0, 1], clamp) * (1 - endT)}}>
        ESKIZDAN <span style={{color: '#f2c14e'}}>3D</span>'GA
      </div>

      {/* ending caption */}
      <div style={{position: 'absolute', top: 110, width: '100%', textAlign: 'center', fontFamily: 'Oswald', fontWeight: 700,
        color: '#fff', opacity: endT, transform: `translateY(${(1 - endT) * 30}px)`, textShadow: '0 4px 18px #000a'}}>
        <div style={{fontSize: 96, letterSpacing: 4}}>GO'RI <span style={{color: '#5fd0ea'}}>AMIR</span></div>
        <div style={{fontSize: 46, opacity: 0.9}}>SAMARQAND · 1403–1404</div>
      </div>
    </AbsoluteFill>
  );
};

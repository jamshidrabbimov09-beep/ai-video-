import React, {useMemo} from 'react';
import {geoCentroid, geoGraticule10, geoOrthographic, geoPath} from 'd3-geo';
import {feature, merge} from 'topojson-client';
import type {Feature, FeatureCollection, Geometry} from 'geojson';
import world from 'world-atlas/countries-50m.json';
import {TIMURID} from './timurid';

// Code-drawn globe with today's borders and Amir Temur's state at its height in one colour.

const topo = world as unknown as Parameters<typeof feature>[0] & {objects: {countries: never}};
const countries = feature(topo, (topo as any).objects.countries) as unknown as FeatureCollection<Geometry, {name: string}>;
const land = merge(topo as any, (topo as any).objects.countries.geometries);
const empire: Feature = {type: 'Feature', properties: {}, geometry: {type: 'Polygon', coordinates: [TIMURID]}};
const graticule = geoGraticule10();

const UZ: Record<string, string> = {
  Uzbekistan: "O'ZBEKISTON",
  Iran: 'ERON',
  Afghanistan: "AFG'ONISTON",
  Iraq: 'IROQ',
  Turkey: 'TURKIYA',
  Pakistan: 'POKISTON',
  Turkmenistan: 'TURKMANISTON',
  Azerbaijan: 'OZARBAYJON',
  Syria: 'SURIYA',
  Tajikistan: 'TOJIKISTON',
  Georgia: 'GRUZIYA',
  Kazakhstan: "QOZOG'ISTON",
  Kyrgyzstan: "QIRG'IZISTON",
  Armenia: 'ARMANISTON',
};
// label anchor overrides (lon, lat) where the centroid falls outside the empire
const ANCHOR: Record<string, [number, number]> = {
  Kazakhstan: [62, 44.6],
  Turkey: [37.5, 39.0],
  Pakistan: [68.5, 29.5],
  Uzbekistan: [64.0, 41.5],
  Turkmenistan: [58.5, 39.0],
  Iran: [54.0, 32.5],
  Kyrgyzstan: [74.0, 41.3],
};

export type GlobeProps = {
  rot: [number, number]; // centre lon, lat
  scale: number; // globe radius in px
  cx?: number;
  cy?: number;
  reveal: number; // 0..1 how far the empire colour has spread from Samarqand
  labels?: {name: string; at: number}[]; // country labels popping at local seconds
  t: number;
  color?: string;
  extra?: string[]; // whole countries added to the coloured area (variants)
  extraK?: number; // 0..1 fade-in of the extra countries
  dim?: boolean; // grey land outside the coloured area
  flag?: number; // 0..1 Temur's flag at Samarqand
  marks?: {text: string; lon: number; lat: number; at: number; size?: number}[];
  samLabel?: boolean;
  uid?: string;
  labelSize?: number;
};

export const GlobeMap: React.FC<GlobeProps> = ({rot, scale, cx = 540, cy = 1080, reveal, labels = [], t, color = '#ff4b3e', extra = [], extraK = 0, dim = false, flag = 0, marks = [], samLabel = true, uid = 'g', labelSize = 28}) => {
  const proj = useMemo(() => geoOrthographic().rotate([-rot[0], -rot[1]]).scale(scale).translate([cx, cy]).clipAngle(90).precision(0.4), [rot[0], rot[1], scale, cx, cy]);
  const path = geoPath(proj);
  const sam = proj([66.97, 39.65]);
  const r = reveal * scale * 1.2;
  return (
    <g>
      <defs>
        <radialGradient id={`ocean${uid}`} cx="42%" cy="38%" r="70%">
          <stop offset="0%" stopColor="#2f78b8" />
          <stop offset="70%" stopColor="#14457e" />
          <stop offset="100%" stopColor="#0a2448" />
        </radialGradient>
        <radialGradient id={`shade${uid}`} cx="38%" cy="32%" r="75%">
          <stop offset="55%" stopColor="#000" stopOpacity={0} />
          <stop offset="100%" stopColor="#000" stopOpacity={0.55} />
        </radialGradient>
        <radialGradient id={`halo${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="80%" stopColor="#6fb4ff" stopOpacity={0.35} />
          <stop offset="100%" stopColor="#6fb4ff" stopOpacity={0} />
        </radialGradient>
        <clipPath id={`landclip${uid}`}>
          <path d={path(land as any) || ''} />
        </clipPath>
        <clipPath id={`revealclip${uid}`}>{sam && <circle cx={sam[0]} cy={sam[1]} r={Math.max(0.1, r)} />}</clipPath>
      </defs>
      <circle cx={cx} cy={cy} r={scale * 1.12} fill={`url(#halo${uid})`} />
      <path d={path({type: 'Sphere'}) || ''} fill={`url(#ocean${uid})`} />
      <path d={path(graticule) || ''} fill="none" stroke="#ffffff" strokeOpacity={0.08} strokeWidth={1} />
      <path d={path(land as any) || ''} fill="#a7b06c" />
      {countries.features.map((f, i) => (
        <path key={i} d={path(f) || ''} fill={dim ? (i % 2 ? '#8d9196' : '#9a9ea3') : i % 3 === 0 ? '#b4b977' : i % 3 === 1 ? '#c2b47a' : '#9fae6a'} stroke="#ffffff" strokeOpacity={0.55} strokeWidth={1.2} />
      ))}
      {extraK > 0 &&
        countries.features
          .filter((f) => extra.includes(f.properties.name))
          .map((f, i) => <path key={'x' + i} d={path(f) || ''} fill={color} fillOpacity={0.82 * extraK} stroke="#fff" strokeOpacity={0.7} strokeWidth={1.4} />)}
      {reveal > 0 && (
        <g clipPath={`url(#revealclip${uid})`}>
          <g clipPath={`url(#landclip${uid})`}>
            <path d={path(empire) || ''} fill={color} fillOpacity={0.82} />
          </g>
          {countries.features.map((f, i) => (
            <path key={i} d={path(f) || ''} fill="none" stroke="#fff" strokeOpacity={0.7} strokeWidth={1.4} clipPath={`url(#landclip${uid})`} />
          ))}
          <path d={path(empire) || ''} fill="none" stroke="#ffe08a" strokeWidth={4} strokeDasharray="14 8" clipPath={`url(#landclip${uid})`} />
        </g>
      )}
      <path d={path({type: 'Sphere'}) || ''} fill={`url(#shade${uid})`} />
      {sam && flag > 0 && (
        <g transform={`translate(${sam[0]} ${sam[1]}) scale(${flag})`}>
          <line x1={0} y1={0} x2={0} y2={-150} stroke="#2b1e16" strokeWidth={8} strokeLinecap="round" />
          <path d={`M0 -150 Q60 ${-160 + Math.sin(t * 5) * 8} 120 -146 L120 -76 Q60 ${-90 + Math.sin(t * 5 + 1) * 8} 0 -80 Z`} fill="#c0392b" stroke="#2b1e16" strokeWidth={5} strokeLinejoin="round" />
          {[
            [40, -128],
            [80, -128],
            [60, -100],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={13} fill="none" stroke="#ffc94a" strokeWidth={6} />
          ))}
        </g>
      )}
      {sam && reveal > 0 && samLabel && (
        <g transform={`translate(${sam[0]} ${sam[1]})`}>
          <circle r={14 + Math.sin(t * 6) * 3} fill="#ffc94a" stroke="#2b1e16" strokeWidth={4} />
          <text y={-26} textAnchor="middle" fontFamily="Oswald" fontWeight={700} fontSize={34} fill="#fff" stroke="#1a120c" strokeWidth={6} paintOrder="stroke">
            SAMARQAND
          </text>
        </g>
      )}
      {marks.map(({text, lon, lat, at, size = 44}) => {
        if (t < at) return null;
        const p = proj([lon, lat]);
        if (!p) return null;
        const k = Math.min(1, (t - at) / 0.25);
        return (
          <text key={text} x={p[0]} y={p[1]} textAnchor="middle" fontFamily="Oswald" fontWeight={700} fontSize={size * (0.6 + 0.4 * k)} fill="#fff" opacity={k} stroke="#1a120c" strokeWidth={7} paintOrder="stroke">
            {text}
          </text>
        );
      })}
      {labels.map(({name, at}) => {
        if (t < at) return null;
        const f = countries.features.find((c) => c.properties.name === name);
        if (!f) return null;
        const p = proj(ANCHOR[name] || (geoCentroid(f) as [number, number]));
        if (!p) return null;
        const k = Math.min(1, (t - at) / 0.25);
        return (
          <text key={name} x={p[0]} y={p[1]} textAnchor="middle" fontFamily="Oswald" fontWeight={700} fontSize={labelSize * (0.6 + 0.4 * k)} fill="#fff" opacity={k} stroke="#1a120c" strokeWidth={5} paintOrder="stroke">
            {UZ[name] || name}
          </text>
        );
      })}
    </g>
  );
};

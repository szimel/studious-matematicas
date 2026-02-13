/* eslint-disable react/no-unknown-property */
import React, { useRef, useState } from 'react';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { ComponentProps } from '../types';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import { ChordSlice } from './chord-wheel-helpers/ChordSlice';
import { ChordSync } from './chord-wheel-helpers/ChordSync';
import { CenterHUD } from './chord-wheel-helpers/CenterHUD';
import { Color } from 'three';
import * as THREE from 'three';

const OUTER = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'G#', 'D#', 'A#', 'F'] as const;
const INNER = ['Am', 'Em', 'Bm', 'F#m', 'C#m', 'G#m', 'D#m', 'A#m', 'Fm', 'Cm', 'Gm', 'Dm'] as const;
export const ALLOWED = new Set<ChordKey>([...OUTER, ...INNER]);
type OuterChord = typeof OUTER[number];
type InnerChord = typeof INNER[number];
export type ChordKey = OuterChord | InnerChord;

/**
 * Object with all 24 chords as keys, each key with `ChordProps`: 
 * {name: ChordKey, count: number, seconds: number, time: string, pct: number, pctDisplay: string}
 */
export type ChordMap = Record<ChordKey, ChordProps>;

export type ChordSegment = {
  start: number;
  end: number;
  label: string;
};

type ChordProps = {
	name: ChordKey
	count: number
	seconds: number
	time: string
	pct: number
	pctDisplay: string
}

export type OverlayState = {
  display: ChordKey;
  count: number;
  pct: string;
  seconds: string;
	color: Color
};

/**
 * Initializes and returns a `ChordMap` object that aggregates statistics for each allowed chord.
 * All chords of `ChordMap` are initialized with default values. 
 * @returns A `ChordMap` object mapping each allowed chord to its aggregated statistics and display values.
 */
function initializeChordMap(segments: ChordSegment[]): {init: ChordMap, best: ChordProps} {
  // sets up chordMap so there are no empty values
  const chordMap ={} as ChordMap;
  const total = segments.length;

  // set initial state
  for (const chord of [...OUTER,...INNER]) {
    const initialVals = { name: chord, count: 0, seconds:0, time: '0s', pct: 0, pctDisplay: '0%' };
    chordMap[chord] =  initialVals satisfies ChordProps;
  }

  // update w/ values from segments
  for (const s of segments) {
    const parts = s.label.split(':'); // s.label ex: 'A#:min"

    // typescript is kinda cool SOMETIMES
    const candidate = parts[1] === 'min' ? parts[0] + 'm' : parts[0];
    if (!ALLOWED.has(candidate as ChordKey)) {continue;}
    const key = candidate as ChordKey;

    const dur = Math.max(0, s.end - s.start);

    chordMap[key].count += 1;
    chordMap[key].seconds += dur;
  }

  let bestKey = 'C' as ChordKey;
  for (const [chord, props] of Object.entries(chordMap)) {
    if (props.count > 0) {
      props.time = `${props.seconds.toFixed(1)}s`;
      props.pct = props.count / total;
      props.pctDisplay = `${(props.pct * 100).toFixed(1)}%`;
      chordMap[bestKey].pct < props.pct && (bestKey = chord as ChordKey);
    }
  }

  return { init: chordMap, best: chordMap[bestKey] };
}

const ChordWedge = ({ segments, activeChordRef }: { 
	segments: ChordSegment[], activeChordRef: React.MutableRefObject<ChordKey | null> 
}) => {
  const { init, best } = initializeChordMap(segments);
  const [chordMap] = useState<ChordMap>(init);

  // cool to populate initial with strongest cords
  const initial = { 
    count: best.count, 
    pct: best.pctDisplay, 
    seconds: best.time, 
    display: best.name,
    color: new THREE.Color(1,1,1)
  } satisfies OverlayState;
  const [overlay, setOverlay] = useState<OverlayState>(initial);

  // --- Ring radii (TUNE THESE) ---
  // used to create radius boundaries for inner vs outer chord wedges
  const rOuter = 2.85;   // outer edge of majors
  const rMid = 1.95;     // boundary between majors/minors (touching)
  const rHole = 0.85;    // center hole radius

  return (
    <>
      {/* Lights */}
      <ambientLight intensity={0.75} />
      <directionalLight position={[5, 4, 4]} intensity={.7} castShadow shadow-mapSize={[2048, 2048]} />
      <directionalLight position={[-4, 3, -2]} intensity={0.35} />


      {/* subtle "Floor" circle to give the scene a base */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -1, 0]} receiveShadow>
        <circleGeometry args={[8, 64]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* OUTER (maj) wedges: rMid -> rOuter */}
      {OUTER.map((d, index) => (
        <ChordSlice
          key={d}
          index={index}
          activeChordRef={activeChordRef}
          chord={d}
          rOuter={rOuter}
          rInner={rMid}
          chordMap={chordMap}
          setOverlay={setOverlay}
        />
      ))}

      {/* INNER (min) wedges: rHole -> rMid */}
      {INNER.map((d, index) => (
        <ChordSlice
          key={d}
          index={index}
          activeChordRef={activeChordRef}
          chord={d}
          rOuter={rMid}
          rInner={rHole}
          chordMap={chordMap}
          setOverlay={setOverlay}
        />
      ))}

      <CenterHUD 
        overlay={overlay}
        radius={rHole}
      />

      {/* <CenterHud
        overlay={overlay}
        chordMap={chordMap}
        segmentsCount={segments.length}
        activeChordRef={activeChordRef}
        rHole={0.85}
      /> */}

      {/* <Html fullscreen style={{ pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', left: '50%', top: 12, transform: 'translateX(-50%)', width: 'min(340px, 92vw)' }}>
          <div
            style={{
              color: 'white',
              background: 'rgba(0,0,0,0.5)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 16,
              padding: '10px 12px',
              backdropFilter: 'blur(8px)',
              fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 }}>
              <div style={{ fontSize: 14, opacity: 0.9 }}>{overlay ? 'Chord' : 'Chord wheel'}</div>
              <div style={{ fontSize: 12, opacity: 0.75 }}>{segments ? `${segments.length} segments` : 'no data'}</div>
            </div>
			
            <div style={{ marginTop: 6, fontSize: 22, fontWeight: 700, letterSpacing: 0.2 }}>
              {overlay ? overlay.display : 'Tap a chord'}
            </div>
			
            <div style={{ marginTop: 6, fontSize: 13, opacity: 0.9, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <span style={{ opacity: 0.7 }}>Count: {overlay.count}</span>
              <span style={{ opacity: 0.7 }}>Share: {overlay.pct}</span>
              <span style={{ opacity: 0.7 }}>Time: {overlay.seconds}</span>
            </div>
          </div>
        </div>
      </Html> */}

      <OrbitControls
        enablePan={false}
        enableZoom={true}
        screenSpacePanning={false}
        enableDamping
        zoomSpeed={0.7}
        minDistance={4.0}
        maxDistance={7.0}
        dampingFactor={0.08}
        rotateSpeed={0.6}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2.05}
      />
    </>
  );
};

export const ChordWheel = ({ data, audioRef }: ComponentProps): JSX.Element => {
  const activeChordRef = useRef<ChordKey | null>(null);

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Canvas style={{ position: 'absolute', inset: 0, backgroundColor: '#ffffff' }} dpr={[1, 2]} shadows frameloop='demand'>
        <ChordSync segments={data.c_chord_segments} audioRef={audioRef} activeChordRef={activeChordRef} />
        <PerspectiveCamera makeDefault position={[0, 4.8, 5.2]} fov={45} near={0.1} far={100} />
        <ChordWedge segments={data.c_chord_segments} activeChordRef={activeChordRef} />
        <EffectComposer>
          <Bloom
            intensity={2.5}
            luminanceThreshold={.5}
            luminanceSmoothing={1}
            radius={.3}
            mipmapBlur
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
};
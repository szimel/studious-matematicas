/* eslint-disable react/no-unknown-property */
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Billboard, Center, ContactShadows, Environment, Html, OrbitControls, PerspectiveCamera, Text, Text3D, Text3DProps } from '@react-three/drei';
import * as THREE from 'three';
import { Canvas, MeshPhysicalMaterialProps, MeshStandardMaterialProps, ThreeEvent } from '@react-three/fiber';
import { ComponentProps } from '../types';
import { text } from 'd3';

const OUTER = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'G#', 'D#', 'A#', 'F'] as const;
const INNER = ['Am', 'Em', 'Bm', 'F#m', 'C#m', 'G#m', 'D#m', 'A#m', 'Fm', 'Cm', 'Gm', 'Dm'] as const;
const ALLOWED = new Set<ChordKey>([...OUTER, ...INNER]);
type OuterChord = typeof OUTER[number];
type InnerChord = typeof INNER[number];
type ChordKey = OuterChord | InnerChord;

/**
 * Object with all 24 chords as keys, each key with `ChordProps`: 
 * {name: ChordKey, count: number, seconds: number, time: string, pct: number, pctDisplay: string}
 */
type ChordMap = Record<ChordKey, ChordProps>;

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

type SliceProps = {
  index: number
  chord: ChordKey
  rInner: number
  rOuter: number
  chordMap: ChordMap
  // eslint-disable-next-line no-unused-vars
  setOverlay: (o: OverlayState ) => void;
}

type OverlayState = {
  display: ChordKey;
  count: number;
  pct: string;
  seconds: string;
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

/**
 * Create a THREE.Color based on a semitone index and chord key. 
 * Matches each chord major and minor to the same color, but minors are darker and more muted.
 *
 * @returns A THREE.Color with HSL corresponding to the chord.
 */
function colorForIndex(index: number, name: ChordKey) {
  const ID = name.slice(-1);
  const isMinor = ID === 'm' ? 3 : 0;

  const adjustedIndex = (index + isMinor) % 12;

  // Hue around the wheel
  const h = adjustedIndex / 12; // 0..1
  const s = !isMinor ? 0.9 : 0.65; // inner muted
  const l = !isMinor ? 0.55 : 0.45; // inner darker
  const c = new THREE.Color();
  c.setHSL(h, s, l);
  return c;
}

/**
 * Donut-slice shape in XY plane, extruded along +Z, then rotated so +Z becomes +Y.
 * Used to build individual chord wedges
 */
function makeAnnularSectorGeometry(
  rOuter: number,
  rInner: number,
  theta0: number,
  theta1: number,
  height: number,
) {
  const gap = 0.03; // gap between slices to visually separate them (vertically)
  rOuter = rOuter - gap;
  rInner = rInner + gap;
  const shape = new THREE.Shape();
  const x0 = rOuter * Math.cos(theta0);
  const y0 = rOuter * Math.sin(theta0);
  shape.moveTo(x0, y0);
  shape.absarc(0, 0, rOuter, theta0, theta1, false);
  shape.lineTo(rInner * Math.cos(theta1), rInner * Math.sin(theta1));
  shape.absarc(0, 0, rInner, theta1, theta0, true);
  shape.closePath();

  const geom1 = new THREE.ExtrudeGeometry(shape, {
    depth: height,
    bevelEnabled: true,
    bevelThickness: 0.02,
    bevelSize: 0.02,
    steps: 5,
  });

  // Put the slice on the XZ plane, extrude "up" in Y.
  geom1.rotateX(-Math.PI / 2);

  return geom1;
}

function ChordSlice({
  index,
  chord,
  rInner,
  rOuter,
  chordMap,
  setOverlay,
}: SliceProps ) {
  const meshRef = useRef<THREE.Mesh>(null);
  const slice = chordMap[chord];
		
  // 12 slices
  const { theta0, theta1, thetaMid } = useMemo(() => {
    const step = (Math.PI * 2) / 12;
    const top = -Math.PI / 2;
    const gap = 0.035; // gap between slices to visually separate them
    const t0 = top + index * step - gap;
    const t1 = t0 + step - gap;
    return { theta0: t0, theta1: t1, thetaMid: (t0 + t1) / 2 };
  }, [chordMap]);

  const baseHeight = 0.1;
  const maxExtraHeight = 3; // scale's pct to this max height
		
  const height = useMemo(() => baseHeight + slice.pct * maxExtraHeight, [chordMap]);
  // const isSelected = selectedLabel === datum.label;
		
  const geometry = useMemo(
    () => makeAnnularSectorGeometry(rOuter, rInner, theta0, theta1, height),
    [chordMap]
  );

  const baseColor = useMemo(() => colorForIndex(index, slice.name), [chordMap]);

  const onSelect = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
		
      setOverlay({
        display: slice.name,
        count: slice.count,
        pct: slice.pctDisplay,
        seconds: slice.time,
      });
    },
    [chordMap, setOverlay]
  );
		
  const onHover = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      setOverlay({
        display: slice.name,
        count: slice.count,
        pct: slice.pctDisplay,
        seconds: slice.time,
      });
      document.body.style.cursor = 'pointer';
    },
    [chordMap, setOverlay]
  );

  // Calculate text position at the center of the wedge, on top
  const textPosition = useMemo(() => {
    const correction = Math.PI / 2; // idky but position is off by 90deg, this fixes it
    const rMid = (rInner + rOuter) / 2;
    const x = rMid * Math.sin(thetaMid + correction);
    const z = rMid * Math.cos(thetaMid + correction);
    const y = height + 0.03;
    return [x, y, z] as const;
  }, [chordMap]);

  const wireProps = useMemo(() => ({
    color: baseColor,
    emissive: baseColor,
    emissiveIntensity: .2,
    wireframe: true,
  } satisfies MeshStandardMaterialProps), [baseColor]);

  const best = 'Gm' as ChordKey;

  // super transparent material, glass like, but with a subtle glow of the chord color, for meshPhysicalMaterial
  const glassPropsPhysical = useMemo(() => ({
    color: best === slice.name ? 'white' : baseColor,
    transparent: true,
    opacity: best === slice.name ? 0.95 : 0.6,
    transmission: .8, // Make it look more like glass
  } satisfies MeshPhysicalMaterialProps), [baseColor]);

  const textProps = useMemo(() => ({
    color: baseColor.clone().multiplyScalar(2.2),
  } satisfies MeshStandardMaterialProps), [baseColor]);

  return (
    <group>
      <group>
        <mesh
          ref={meshRef}
          geometry={geometry}
          onPointerDown={onSelect}
          onPointerEnter={onHover}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial {... wireProps} />
        </mesh>

        <mesh
          geometry={geometry}
          receiveShadow
          scale={.98}
        >
          <meshPhysicalMaterial {... glassPropsPhysical} />
        </mesh>

        { best === slice.name && (
          <pointLight
            position={[textPosition[0], height / 2, textPosition[2]]}
            intensity={best === slice.name ? 2 : 0}
            distance={2.5}
            color={baseColor}
          />
        )}
      </group>

      <group position={textPosition} rotation={[-Math.PI / 2, 0, 0]}>
        <Center>
          <Text3D
            font={'https://threejs.org/examples/fonts/helvetiker_regular.typeface.json'}
            size={0.2}
            height={0.05}
            letterSpacing={-.01}
            castShadow
            bevelEnabled={false}
          >
            {slice.name}
            <meshStandardMaterial {...textProps} />
            {/* <meshPhysicalMaterial color={baseColor} emissiveIntensity={.5}/> */}
          </Text3D>
        </Center>
      </group>
    </group>
  );
}

const ChordWedge = ({ segments }: { segments: ChordSegment[] }) => {
  const { init, best } = initializeChordMap(segments);
  const [chordMap] = useState<ChordMap>(init);

  // cool to populate initial with strongest cords
  const initial = { 
    count: best.count, 
    pct: best.pctDisplay, 
    seconds: best.time, 
    display: best.name 
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
      <directionalLight position={[5, 4, 4]} intensity={0.8} castShadow shadow-mapSize={[2048, 2048]} />
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
          chord={d}
          rOuter={rMid}
          rInner={rHole}
          chordMap={chordMap}
          setOverlay={setOverlay}
        />
      ))}

      <Html fullscreen style={{ pointerEvents: 'none' }}>
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
      </Html>

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

export const ChordWheel = ({ data }: ComponentProps): JSX.Element => (
  <div style={{ position: 'absolute', inset: 0 }}>
    <Canvas style={{ position: 'absolute', inset: 0, backgroundColor: '#c4c3c3' }} dpr={[1, 2]} shadows>
      {/* <ContactShadows position={[0, -0.01, 0]} opacity={0.4} scale={10} blur={2.5} far={4} /> */}
      <PerspectiveCamera makeDefault position={[0, 4.8, 5.2]} fov={45} near={0.1} far={100} />
      <ChordWedge segments={data.c_chord_segments} />
    </Canvas>
  </div>
);


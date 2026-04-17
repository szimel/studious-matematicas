/* eslint-disable react/no-unknown-property */
import React from 'react';
import { ThreeEvent } from '@react-three/fiber';
import { useCallback, useMemo } from 'react';
import { Center, Text3D } from '@react-three/drei';
import { DataKey, DataMap, OverlayState } from '../../../../types/sound_data_types';
import * as THREE from 'three';

export type SliceProps = {
	flag: boolean;
  index: number
  chord: DataKey
  rInner: number
  rOuter: number
  dataMap: DataMap
  // eslint-disable-next-line no-unused-vars
  setOverlay: (o: OverlayState ) => void;
}

/* ─── geometry helpers ──────────────────────────────────────── */

/** Main wedge – annular sector extruded up into Y */
function makeAnnularSectorGeometry(
  rOuter: number,
  rInner: number,
  theta0: number,
  theta1: number,
  height: number,
) {
  const gap = 0.04;
  rOuter -= gap;
  rInner += gap;

  const shape = new THREE.Shape();
  shape.moveTo(rOuter * Math.cos(theta0), rOuter * Math.sin(theta0));
  shape.absarc(0, 0, rOuter, theta0, theta1, false);
  shape.lineTo(rInner * Math.cos(theta1), rInner * Math.sin(theta1));
  shape.absarc(0, 0, rInner, theta1, theta0, true);
  shape.closePath();

  const depth = Math.max(0.0001, Math.abs(height));

  const geom = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.015,
    bevelSize: 0.015,
    bevelSegments: 3,
    steps: 1,
  });

  geom.rotateX(-Math.PI / 2);

  // For negative height, translate down instead of flipping scale.
  // geom.scale(1, -1, 1) reverses vertex winding order, corrupting normals
  // for lit materials (wireframe is immune since it ignores normals).
  // Translating by `height` (negative value) shifts the geometry from
  // [y=0 → y=|height|] down to [y=height → y=0] — same inverted shape,
  // normals stay correct.
  if (height < 0) {
    geom.translate(0, height, 0);
  }

  return geom;
}

/** Thin floating arc that orbits above each slice */
function makeFloatingArcGeometry(
  radius: number,
  theta0: number,
  theta1: number,
) {
  const segments = 48;
  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = theta0 + (theta1 - theta0) * (i / segments);
    points.push(new THREE.Vector3(radius * Math.sin(t + Math.PI/2), 0, radius * Math.cos(t + Math.PI/2)));
  }
  const geom = new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3(points, false, 'centripetal'),
    segments, 0.012, 6, false,
  );
  return geom;
}

/* ─── color ─────────────────────────────────────────────────── */
function colorForIndex(index: number, name: DataKey) {
  const isMinor = name.slice(-1) === 'm' ? 3 : 0;
  const adjustedIndex = (index + isMinor) % 12;
  const h = adjustedIndex / 12;
  const s = 0.88;
  const l = 0.58;
  const c = new THREE.Color();
  c.setHSL(h, s, l);
  return c;
}

/**
 * Crystalline chord slice with:
 *   1. metallic base wedge
 *   2. Wireframe overlay for crystalline facets
 *   3. Floating neon arc ring above
 *   4. Chord label on top
 */
export function ChordSlice({
  flag, // determines if called from ChordWedge or NoteWedge
  index,
  chord,
  rInner,
  rOuter,
  dataMap,
  setOverlay,
}: SliceProps ) {
  const slice = dataMap[chord];

  // const invert = flag ? -1 : 1; // used with noteWedge stuff
  // const baseHeight = 0.12;
  // const maxExtraHeight = flag ? 6 : 3;
  // const hei = flag ? slice.notePct : slice.pct;
  const invert = flag ? -1 : 1; // used with noteWedge stuff
  const baseHeight = 0.12;
  const maxExtraHeight = 3;

  const { theta0, theta1, thetaMid } = useMemo(() => {
    const step = (Math.PI * 2) / 12;
    const top = -Math.PI / 2;
    const gap = 0.035;
    const t0 = top + index * step - gap;
    const t1 = t0 + step - gap;
    return { theta0: t0, theta1: t1, thetaMid: (t0 + t1) / 2 };
  }, [dataMap]);

  const height = useMemo(() => (baseHeight + slice.pct * maxExtraHeight) * invert, [dataMap]);

  /* ── geometries ── */
  const geometry = useMemo(
    () => makeAnnularSectorGeometry(rOuter, rInner, theta0, theta1, height),
    [dataMap]
  );

  const arcGeometry = useMemo(
    () => makeFloatingArcGeometry(rOuter, theta0, theta1),
    [dataMap]
  );

  const innerArcGeometry = useMemo(
    () => makeFloatingArcGeometry(rInner, theta0, theta1), [dataMap]
  );

  /* ── wireframe scale correction ──
    scale={s} on a mesh scales from world origin, not geometry center.
    Offset = center * (1 - s) cancels the drift so the scale appears
    to happen around the geometry's own bounding-box center. */
  const wireframePosition = useMemo(() => {
    geometry.computeBoundingBox();
    const center = new THREE.Vector3();
    if (geometry.boundingBox) {
      geometry.boundingBox.getCenter(center);
    }
    const s = 1.01;
    return center.multiplyScalar(1 - s);
  }, [geometry]);

  /* ── colors ── */
  const baseColor = useMemo(() => colorForIndex(index, slice.name), [dataMap]);
  const brightColor = useMemo(() => baseColor.clone().multiplyScalar(1.6), [baseColor]);
  const darkBase = useMemo(() => baseColor.clone().multiplyScalar(.65), [baseColor]);

  /* ── interaction ── */
  const makeOverlay = useCallback(() => ({
    display: slice.name,
    count: slice.count,
    pct: slice.count > 0 ? (slice.pct * 100).toFixed(1) + '%' : '0%',
    seconds: slice.count > 0 ? slice.seconds.toFixed(1) + 's' : '0s',
    color: baseColor.clone(),
  }), [dataMap, baseColor]);

  const onSelect = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      setOverlay(makeOverlay());
    },
    [makeOverlay, setOverlay]
  );

  const onHover = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      setOverlay(makeOverlay());
      document.body.style.cursor = 'pointer';
    },
    [makeOverlay, setOverlay]
  );

  /* ── text position on top of wedge ── */
  const textPosition = useMemo(() => {
    const correction = Math.PI / 2;
    const rMid = (rInner + rOuter) / 2;
    const x = rMid * Math.sin(thetaMid + correction);
    const z = rMid * Math.cos(thetaMid + correction);
    const y = height + 0.06 * invert;
    return [x, y, z] as const;
  }, [dataMap]);

  return (
    <group>
      {/* ── Dark obsidian base wedge ── */}
      <mesh
        geometry={geometry}
        onPointerDown={onSelect}
        onPointerEnter={onHover}
        castShadow
        receiveShadow
      >
        <meshPhysicalMaterial
          color={darkBase}
          metalness={0.85}
          roughness={0.18}
          clearcoat={1}
          clearcoatRoughness={0.05}
          reflectivity={1}
        />
      </mesh>

      {/* ── Wireframe overlay for crystalline facets ── */}
      <mesh geometry={geometry} scale={1.01} position={wireframePosition} >
        <meshStandardMaterial
          color={baseColor}
          wireframe
          transparent
          opacity={0.2}
          emissive={baseColor}
          emissiveIntensity={0.85}
          toneMapped={false}
        />
      </mesh>

      {/* ── Floating neon arc ring ── */}
      <group position={[0, height, 0]}>
        <mesh geometry={arcGeometry}>
          <meshStandardMaterial
            color={brightColor}
            emissive={brightColor}
            emissiveIntensity={4}
            toneMapped={false}
            transparent
            opacity={0.9}
          />
        </mesh>
      </group>

      {/* -- Smaller floating neon arc ring, for rHole only */}
      {rInner === 0.85 && (
        <group position={[0, height, 0]}>
          <mesh geometry={innerArcGeometry}>
            <meshStandardMaterial
              color={brightColor}
              emissive={brightColor}
              emissiveIntensity={4}
              toneMapped={false}
              transparent
              opacity={0.9}
            />
          </mesh>
        </group>
      )}

      {/* ──  Chord label ── */}
      <group position={textPosition} rotation={[-Math.PI / 2, flag ? Math.PI : 0, flag? Math.PI : 0]}>
        <Center>
          <group>
            {/* shadow / outline */}
            <Text3D
              font="https://threejs.org/examples/fonts/helvetiker_regular.typeface.json"
              size={0.2}
              height={0.03}
              bevelEnabled={false}
              scale={1.04}
              position={[-0.005, -0.015, -0.005]}
            >
              {slice.name}
              <meshBasicMaterial color="#111111" transparent opacity={0.9} />
            </Text3D>

            {/* main text – bright emissive so it glows through bloom */}
            <Text3D
              font="https://threejs.org/examples/fonts/helvetiker_regular.typeface.json"
              size={0.2}
              height={0.04}
              bevelEnabled={false}
              scale={1.0}
            >
              {slice.name}
              <meshStandardMaterial
                color="#ffffff"
                emissive={baseColor.clone()}
                emissiveIntensity={1.3}
                toneMapped={false}
              />
            </Text3D>
          </group>
        </Center>
      </group>
    </group>
  );
}
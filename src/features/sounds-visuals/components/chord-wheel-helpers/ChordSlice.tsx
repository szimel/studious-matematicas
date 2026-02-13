/* eslint-disable react/no-unknown-property */
import React from 'react';
import { MeshPhysicalMaterialProps, MeshStandardMaterialProps, ThreeEvent, useFrame } from '@react-three/fiber';
import { useCallback, useMemo, useRef } from 'react';
import { Center, Text3D } from '@react-three/drei';
import { ChordKey, ChordMap, OverlayState } from '../ChordWheel';
import * as THREE from 'three';

export type SliceProps = {
  index: number
  chord: ChordKey
	activeChordRef: React.MutableRefObject<ChordKey | null>;
  rInner: number
  rOuter: number
  chordMap: ChordMap
  // eslint-disable-next-line no-unused-vars
  setOverlay: (o: OverlayState ) => void;
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
  const s = .9;
  const l = .55;
  // const s = !isMinor ? 0.9 : 0.65; // inner muted
  // const l = !isMinor ? 0.55 : 0.45; // inner darker
  const c = new THREE.Color();
  c.setHSL(h, s, l);
  return c;
}

/**
 * Creates a single chord slice. Updates chord overlay on hover and click.
 * highlights current chord with using bloom
 */
export function ChordSlice({
  index,
  chord,
  activeChordRef,
  rInner,
  rOuter,
  chordMap,
  setOverlay,
}: SliceProps ) {
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
        color: baseColor.clone(),
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
        color: baseColor.clone()
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
    color: baseColor.clone(),
    metalness: 0.5,
    emissive: baseColor, // make the emissive color a brighter version of the base color
    emissiveIntensity: .2,
    toneMapped: false,  
    wireframe: true,
  } satisfies MeshStandardMaterialProps), [baseColor]);

  // super transparent material, glass like, but with a subtle glow of the chord color, for meshPhysicalMaterial
  const glassPropsPhysical = useMemo(() => ({
    color: baseColor.clone().multiplyScalar(1.4),
    transparent: true,
    opacity: 0.45,
    transmission: 1, // Make it look more like glass
    toneMapped: false,  
    ior: 1,
  } satisfies MeshPhysicalMaterialProps), [baseColor]);

  // // track last active value so we only write when it changes
  // const lastActiveRef = useRef<ChordKey | null>(null);
  // const wireMatRef = useRef<THREE.MeshPhysicalMaterial>(null);
  // const glassMatRef = useRef<THREE.MeshPhysicalMaterial>(null);
  // useFrame(() => {
  //   const active = activeChordRef.current;

  //   // only update when it changes
  //   if (active !== chord && lastActiveRef.current !== chord) {return;}

  //   lastActiveRef.current = active;
  //   const isActive = active === chord;
  //   const w = wireMatRef.current;
  //   const g = glassMatRef.current;

  //   if (!w || !g) {return;}
  //   // drive bloom: hot emissive + toneMapped false
  //   for (const mat of [w, g]) {
  //     mat.toneMapped = false;
  //     mat.emissive.copy(baseColor);
  //     // mat.emissiveIntensity = isActive ? 2.5 : 0.2;
  //   }
  //   w.emissiveIntensity = isActive ? 3.5 : 0.2;
  //   g.emissiveIntensity = isActive ? 2.5 : 0.2;
  // });

  return (
    <group>
      <group>
        <mesh
          geometry={geometry}
          onPointerDown={onSelect}
          onPointerEnter={onHover}
          castShadow
          receiveShadow
        >
          {/* <meshStandardMaterial attach="material" ref={wireMatRef} {... wireProps}/> */}
          <meshStandardMaterial {... wireProps}/>
        </mesh>

        <mesh geometry={geometry} receiveShadow scale={.99}>
          {/* <meshPhysicalMaterial attach="material" ref={glassMatRef} {... glassPropsPhysical} /> */}
          <meshPhysicalMaterial {... glassPropsPhysical} />
        </mesh>
      </group>

      <group position={textPosition} rotation={[-Math.PI / 2, 0, 0]}>
        <Center>
          <group>
            {/* Outline text */}
            <Text3D
              font="https://threejs.org/examples/fonts/helvetiker_regular.typeface.json"
              size={0.2}
              height={0.04}
              letterSpacing={-0.01}
              bevelEnabled={false}
              scale={1.03}
              position={[-.005, -.015, 0]}
            >
              {slice.name}
              <meshBasicMaterial color={'#e0dddd'} />
            </Text3D>

            {/* actual text */}
            <Text3D
              font="https://threejs.org/examples/fonts/helvetiker_regular.typeface.json"
              size={0.2}
              height={0.05}
              // scale={0.98}
              letterSpacing={-0.01}
              bevelEnabled={false}
            >
              {slice.name}
              <meshStandardMaterial color={baseColor.clone()} />
            </Text3D>
          </group>
        </Center>
      </group>
    </group>
  );
}
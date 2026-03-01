/* eslint-disable react/no-unknown-property */
import React, { useRef, useEffect } from 'react';
import { Text, Text3D } from '@react-three/drei';
import * as THREE from 'three';
import { OverlayState } from '../../../../types/sound_data_types';


/**
 * Used in NoteWedges and ChordWedges to display the central HUD that shows the currently 
 * hovered active chord/note and it's associated stats.
 * @param param0 
 * @returns 
 */
export const CenterHUD = ({ overlay, radius, flag }: { overlay: OverlayState; radius: number; flag: boolean; }) => {
  // Visual constants
  const baseHeight = .1;
  const inv = flag ? -1 : 1;
  const pct01 = Math.max(0, Math.min(1, parseFloat(overlay.pct) / 100));
  const theta = Math.max(0.0001, pct01 * Math.PI * 2);
  const magicNum = flag ? Math.PI : 0;

  const text3DRef = useRef<THREE.Group>(null); 
  useEffect(() => { 
    if (text3DRef.current) { 
      const bbox = new THREE.Box3().setFromObject(text3DRef.current); 
      const width = bbox.max.x - bbox.min.x; 
      const xOffset = -width / 2; 
      text3DRef.current.position.x = xOffset; 
    }}, [overlay.display]);

  return (
    <group rotation={[Math.PI/-2, magicNum, magicNum]}>
      {/* 1. HUD Background (Dark Circle) */}
      <mesh position={[0, 0, baseHeight * inv]}>
        <circleGeometry args={[radius, 64]} />
        <meshPhysicalMaterial
          color="#0b0f14"
          metalness={0.2}
          roughness={0.25}
          clearcoat={1}
          transparent
          opacity={1}
          transmission={1}
          thickness={0.2}
          ior={1.4}
          side={THREE.FrontSide}
        />
      </mesh>

      <mesh position={[0, 0, (baseHeight + 0.012)]}>
        <ringGeometry args={[radius * 0.82, radius * 0.90, 128]} />
        <meshStandardMaterial transparent opacity={0.5} color="#ffffff" side={THREE.FrontSide}/>
      </mesh>

      {/* ring fg */}
      <mesh position={[0, 0, (baseHeight + 0.013)]}>
        <ringGeometry args={[radius * 0.82, radius * 0.90, 128, 1, Math.PI / 2, theta]} />
        <meshStandardMaterial
          color={overlay.color}
          emissive={overlay.color}
          emissiveIntensity={3}
          toneMapped={false}
          side={THREE.FrontSide}
        />
      </mesh>

      {/* 3. Main Chord Text (Large, Glowing) */}
      <group position={[0, 0.1, (baseHeight + .04)]} ref={text3DRef}>
        <Text3D
          font="https://threejs.org/examples/fonts/helvetiker_regular.typeface.json"
          size={0.3}
          height={.04 * inv}
          castShadow
        >
          {overlay.display}
          <meshStandardMaterial color={overlay.color} toneMapped={false} side={THREE.FrontSide}/>
        </Text3D>
        <Text3D
          font="https://threejs.org/examples/fonts/helvetiker_regular.typeface.json"
          size={0.3}
          height={.02 * inv}
          bevelEnabled={false}
          scale={1.02}
          position={[-.002 * inv, -.01 * inv, 0]}
        >
          {overlay.display}
          <meshStandardMaterial 
            color={'white'} 
            emissive={overlay.color} 
            emissiveIntensity={1.8} 
          />
        </Text3D>
      </group>

      {/* 4. Associated stats (varies on where it's called from) */}
      <group position={[0, -0.25, (baseHeight + .05)]}>
        {/* Row 1: Time & Percent */}
        <Text
          font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hjp-Ek-_EeA.woff"
          fontSize={0.13}
          color={'#e1d4d4'}
          anchorX="center"
          anchorY="top"
          position={[0, 0.2, 0]}
          castShadow
        >
          {`${overlay.seconds} • ${overlay.pct}`}
        </Text>
        
        {/* Row 2: Count label */}
        <Text
          font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hjp-Ek-_EeA.woff"
          fontSize={0.12}
          color="#4e4d4d"
          anchorX="center"
          anchorY="top"
          castShadow
        >
          {`${overlay.count} samples`}
        </Text>
      </group>
    </group>
  );
};

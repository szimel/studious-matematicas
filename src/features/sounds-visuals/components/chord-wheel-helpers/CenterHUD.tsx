/* eslint-disable react/no-unknown-property */
import React, { useRef, useEffect } from 'react';
import { Text, Text3D } from '@react-three/drei';
import * as THREE from 'three';
// Make sure this path points to where you defined the OverlayState type
import type { OverlayState } from '../ChordWheel'; 

export const CenterHUD = ({ overlay, radius }: { overlay: OverlayState; radius: number }) => {
  // Visual constants
  const baseHeight = .1;
  const pct01 = Math.max(0, Math.min(1, parseFloat(overlay.pct) / 100));
  const theta = Math.max(0.0001, pct01 * Math.PI * 2);

  const text3DRef = useRef<THREE.Group>(null); useEffect(() => { 
    if (text3DRef.current) { 
      const bbox = new THREE.Box3().setFromObject(text3DRef.current); 
      const width = bbox.max.x - bbox.min.x; const xOffset = -width / 2; 
      text3DRef.current.position.x = xOffset; 
    }}, [overlay.display]);

  return (
    <group position={[0, 0, 0]} rotation-x={-Math.PI / 2}>
      {/* 1. HUD Background (Dark Circle) */}
      <mesh position={[0, 0, baseHeight]}>
        <circleGeometry args={[radius, 64]} />
        <meshPhysicalMaterial
          color="#0b0f14"
          metalness={0.2}
          roughness={0.25}
          clearcoat={1}
          transparent
          opacity={0.45}
          transmission={1}
          thickness={0.2}
          ior={1.4}
        />
      </mesh>

      <mesh position={[0, 0, baseHeight + 0.012]}>
        <ringGeometry args={[radius * 0.82, radius * 0.90, 128]} />
        <meshStandardMaterial transparent opacity={0.5} color="#ffffff" />
      </mesh>

      {/* ring fg */}
      <mesh position={[0, 0, baseHeight + 0.013]}>
        <ringGeometry args={[radius * 0.82, radius * 0.90, 128, 1, Math.PI / 2, theta]} />
        <meshStandardMaterial
          color={overlay.color}
          emissive={overlay.color}
          emissiveIntensity={3}
          toneMapped={false}
        />
      </mesh>

      {/* 3. Main Chord Text (Large, Glowing) */}
      <group position={[0, 0.1, baseHeight + .01]} ref={text3DRef}>
        <Text3D
          font="https://threejs.org/examples/fonts/helvetiker_regular.typeface.json"
          size={0.3}
          letterSpacing={-0.04}
          height={.04}
          castShadow
        >
          {overlay.display}
          <meshStandardMaterial
            color={overlay.color} 
            toneMapped={false} 
          />
        </Text3D>
        <Text3D
          font="https://threejs.org/examples/fonts/helvetiker_regular.typeface.json"
          size={0.3}
          letterSpacing={-0.04}
          height={.02}
          bevelEnabled={false}
          scale={1.02}
          position={[-.002, -.01, 0]}
        >
          {overlay.display}
          <meshStandardMaterial 
            color={'white'} 
            emissive={overlay.color} 
            emissiveIntensity={1.8} 
            toneMapped={false}
          />
        </Text3D>
      </group>

      {/* 4. Stats Text (Stacked below) */}
      <group position={[0, -0.25, baseHeight + .05]}>
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
          color="#424141"
          anchorX="center"
          anchorY="top"
          position={[0, 0, 0]}
          castShadow
        >
          {`${overlay.count} samples`}
        </Text>
      </group>
    </group>
  );
};

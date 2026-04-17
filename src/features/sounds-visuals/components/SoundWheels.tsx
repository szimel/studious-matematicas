/* eslint-disable react/no-unknown-property */
import React from 'react';
import { OrbitControls, PerspectiveCamera, Stars } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import { ComponentProps } from '../../../types/types';
import { ChordWedge } from './chord-wheel-helpers/ChordWedge';
import { NoteWedge } from './chord-wheel-helpers/NoteWedge';

export const SoundWheels = ({ data }: ComponentProps): JSX.Element => {
  const chordMap = data.parsed_chords;
  const noteMap = data.parsed_notes;

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Canvas style={{ position: 'absolute', inset: 0, backgroundColor: '#080810' }} dpr={[1, 2]} shadows frameloop='demand'>
        <PerspectiveCamera makeDefault position={[0, 4.8, 5.2]} fov={45} near={0.1} far={100} />
        <ChordWedge dataMap={chordMap} />
        <NoteWedge  dataMap={noteMap} />
        <Scene />
      </Canvas>
    </div>
  );
};

/**
 * Background setup for the SoundWheels visualization: starry skybox, bloom effect, and orbit controls.
 */
const Scene = () => (
  <>
    <ambientLight intensity={0.4} />
    <Stars radius={30} depth={5} count={1000} factor={2} saturation={0} fade speed={1} />
    <EffectComposer>
      <Bloom
        intensity={3}
        luminanceThreshold={0.35}
        luminanceSmoothing={0.9}
        radius={0.4}
        mipmapBlur
      />
    </EffectComposer>
    <OrbitControls
      enablePan={true}
      enableZoom={true}
      screenSpacePanning={false}
      enableDamping
      zoomSpeed={0.7}
      minDistance={4.0}
      maxDistance={7.0}
      dampingFactor={0.08}
      rotateSpeed={0.6}
    />
  </>
);
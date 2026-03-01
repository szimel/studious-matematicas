import React from 'react';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import { ComponentProps } from '../../../types/types';
import { ChordWedge } from './chord-wheel-helpers/ChordWedge';
import { ALLOWED, DataMap, INNER, OUTER, DataSegment, DataKey, DataProps } from '../../../types/sound_data_types';
import { NoteWedge } from './chord-wheel-helpers/NoteWedge';


/**
 * Initializes and returns a `ChordMap` object that aggregates statistics for each allowed chord.
 * All chords of `ChordMap` are initialized with default values. Adds note percentage values to the
 * 12 notes in the tonal profile for use in the `NoteWedge` visualization (the OUTER values)
 * @returns A `ChordMap` object mapping each allowed chord to its aggregated statistics and display values.
 */
function initializeDataMap(segments: DataSegment[]): DataMap {
  // sets up chordMap so there are no empty values
  const dataMap = Object.fromEntries(
    [...OUTER, ...INNER].map(chord => 
      [chord, { name: chord, count: 0, seconds: 0, pct: 0 } satisfies DataProps]
    )) as DataMap;
  let total = 0;

  // this part needs to handle both chord segments (string) and note segments (string[])
  for (const s of segments) {
    const dur = Math.max(0, s.end - s.start);
    if (typeof s.label === 'string') {
      // for when chords are being used
      const parts = s.label.split(':'); // s.label ex: 'A#:min"

      // typescript is kinda uncool sometimes
      const candidate = parts[1] === 'min' ? parts[0] + 'm' : parts[0];
      if (!ALLOWED.has(candidate as DataKey)) {continue;}
      const key = candidate as DataKey;

      dataMap[key].count += 1;
      dataMap[key].seconds += dur;
      total ++;
    } else {
      // for when notes are being used
      for (let i = 0; i < s.label.length; i++) {
        const note = s.label[i];
        if (!ALLOWED.has(note as DataKey)) {continue;}
        const key = note as DataKey;

        dataMap[key].count += 1; // TODO: Try it with count == seconds
        dataMap[key].seconds += Math.max(0, s.end - s.start);

        total ++;
      }
    }
  }

  for (const [, props] of Object.entries(dataMap) as [DataKey, DataProps][]) {
    if (props.count > 0) {
      props.pct = props.count / total;
    }
  }

  return dataMap;
}

export const SoundWheels = ({ data }: ComponentProps): JSX.Element => {
  // const activeChordRef = useRef<ChordKey | null>(null);
  const chordMap = initializeDataMap(data.chord_segments);
  const noteMap = initializeDataMap(data.note_segments);

  // const noteSegments = data.note_segments;

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Canvas style={{ position: 'absolute', inset: 0, backgroundColor: '#080810' }} dpr={[1, 2]} shadows frameloop='demand'>
        {/* <ChordSync segments={data.chord_segments} audioRef={audioRef} activeChordRef={activeChordRef} /> */}
        <PerspectiveCamera makeDefault position={[0, 4.8, 5.2]} fov={45} near={0.1} far={100} />
        <ChordWedge dataMap={chordMap} />
        <NoteWedge  dataMap={noteMap} />
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
      </Canvas>
    </div>
  );
};
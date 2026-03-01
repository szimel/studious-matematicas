/* eslint-disable react/no-unknown-property */
import React from 'react';
import { useState } from 'react';
import * as THREE from 'three';
import { ChordSlice } from './ChordSlice';
import { CenterHUD } from './CenterHUD';
import { INNER, OUTER, OverlayState, DataMap } from '../../../../types/sound_data_types';


/**
 * Creates the chord wheel visualization by rendering `ChordSlice` components for each allowed chord and a central HUD.
 * @param segments - An array of `ChordSegment` objects representing the detected chords in the audio track.
 * @param activeChordRef - A mutable ref object that tracks the currently active chord based on audio playback time.
 * @returns A JSX element containing the 3D chord wheel visualization.
 */
export const ChordWedge = ({ dataMap }: { 
	dataMap: DataMap 
}) => {
  const initialOverlayState = {
    display: 'C',
    count: dataMap['C'].count,
    pct: (dataMap['C'].pct * 100).toFixed(1) + '%',
    seconds: dataMap['C'].seconds.toFixed(1) + 's',
    color: new THREE.Color(0xffffff),
  } satisfies OverlayState;
  const [overlay, setOverlay] = useState<OverlayState>(initialOverlayState);

  // used to create radius boundaries for inner vs outer chord wedges
  const rOuter = 2.85;   // outer edge of majors
  const rMid = 1.95;     // boundary between majors/minors (touching)
  const rHole = 0.85;    // center hole radius

  return (
    <>
      {/* Lights – cooler tones to let rainbow hues shine */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 6, 4]} intensity={0.6} castShadow shadow-mapSize={[2048, 2048]} />
      <directionalLight position={[-4, 3, -2]} intensity={0.3} />

      {/* OUTER (maj) wedges: rMid -> rOuter */}
      {OUTER.map((d, index) => (
        <ChordSlice
          flag={false}
          key={d}
          index={index}
          chord={d}
          rOuter={rOuter}
          rInner={rMid}
          dataMap={dataMap}
          setOverlay={setOverlay}
        />
      ))}

      {/* INNER (min) wedges: rHole -> rMid */}
      {INNER.map((d, index) => (
        <ChordSlice
          flag={false}
          key={d}
          index={index}
          chord={d}
          rOuter={rMid}
          rInner={rHole}
          dataMap={dataMap}
          setOverlay={setOverlay}
        />
      ))}

      <CenterHUD overlay={overlay} radius={rHole} flag={false}/>
    </>
  );
};
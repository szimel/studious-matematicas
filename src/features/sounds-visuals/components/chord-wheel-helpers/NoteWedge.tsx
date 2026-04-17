/* eslint-disable react/no-unknown-property */
import React, { useState } from 'react';
import { DataMap, OUTER, OverlayState } from '../../../../types/sound_data_types';
import * as THREE from 'three';
import { ChordSlice } from './ChordSlice';
import { CenterHUD } from './CenterHUD';

/**
 * Creates the chord wheel visualization by rendering `ChordSlice` components for each allowed chord and a central HUD.
 * @param segments - An array of `ChordSegment` objects representing the detected chords in the audio track.
 * @param activeChordRef - A mutable ref object that tracks the currently active chord based on audio playback time.
 * @returns A JSX element containing the 3D chord wheel visualization.
 */
export const NoteWedge = ({ dataMap }: { 
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

  // used for radius boundaries
  const outerRadius = 2.85;
  const innerRadius = 0.85;

  return (
    <>
      {/* Note wedges*/}
      {OUTER.map((d, index) => (
        <ChordSlice
          flag={true}
          key={d}
          index={index}
          chord={d}
          rOuter={outerRadius}
          rInner={innerRadius}
          dataMap={dataMap}
          setOverlay={setOverlay}
        />
      ))}

      {/* Center HUD */}
      <CenterHUD overlay={overlay} radius={innerRadius} flag={true}/>
    </>
  );
};
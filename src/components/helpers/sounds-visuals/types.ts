import React from 'react';
import { PlaceholderPhaseSpace, PlaceholderSpectrogram } from './test';
import { SherlockReport } from '../../screens/Analysis';
import { ChordWheel } from './threejs-components/ChordWheel';

export interface ComponentProps {
	data: SherlockReport,
	currentFrame: number
}

interface VisualizerModule {
  id: string;
  title: string;
  description: string;
  Component: React.FC<ComponentProps>; 
}

export const modules: VisualizerModule[] = [
  { 
    id: 'phase-space', 
    title: 'Phase Space Reconstruction', 
    description: 'Mapping the raw signal against its own time-delay to reveal chaotic attractors.',
    Component: ChordWheel
  },
  { 
    id: 'spectrogram', 
    title: '3D Spectrogram Terrain', 
    description: 'A frequency-amplitude mesh showing the harmonic architecture over time.',
    Component: PlaceholderSpectrogram
  },
  { 
    id: 'chroma', 
    title: 'Radial Chroma Distribution', 
    description: 'A 12-bin tonal wrap showing the harmonic weight of the recording.',
    Component: PlaceholderPhaseSpace 
  }
];
import React from 'react';
import { PlaceholderPhaseSpace, PlaceholderSpectrogram } from './test';
import { SherlockReport } from '../../screens/seeing-sounds/Analysis';
import { ChordWheel } from './components/ChordWheel';

export interface ComponentProps {
	data: SherlockReport,
	audioRef: React.RefObject<HTMLAudioElement>;
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
    title: 'Real-Time Chord Wheel',
    description:
    'A live 3D visualization that lights up the “current” chord as the audio plays. The chord labels come from a "estimated guess" (not ground truth), so expect misses and weird calls.',
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
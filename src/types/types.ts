import React from 'react';
import { ChordWheel } from '../features/sounds-visuals/components/ChordWheel';
import { PlaceholderPhaseSpace, PlaceholderSpectrogram } from '../features/sounds-visuals/test';
import { SherlockReport } from '../pages/seeing-sounds/Analysis';

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
    title: 'Chord Wheel',
    description:
    'Guesses at what chord compromise a song, where height is a measurement of times chord was seen. I am 70% sure it\'s 75% accurate.',
    Component: ChordWheel
  },
  { 
    id: 'spectrogram', 
    title: '3D Spectrogram Terrain', 
    description: 'Hopefully coming soon',
    Component: PlaceholderSpectrogram
  },
  { 
    id: 'chroma', 
    title: 'Radial Chroma Distribution', 
    description: 'Hopefully coming soon.',
    Component: PlaceholderPhaseSpace
  }
];
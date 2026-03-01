import React from 'react';
import { SoundWheels } from '../features/sounds-visuals/components/SoundWheels';
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
    'Guesses at what chord\'s and note\'s compromise a song. I am 70% sure it\'s 75% accurate. \n A cool patterns: The most played chord and note are almost always touching each other. Even if it\'s a minor chord.',
    Component: SoundWheels
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
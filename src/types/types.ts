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
    'Guesses at what chord\'s and note\'s compromise a song. I am 70% sure it\'s 75% accurate. \nNote that the chord wheel (the top component) puts chords that sound good together touching each other (Ex:, C sounds good with F, G, and Am). So, if you notice chords clumping together, the song is following music theory rules!',
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
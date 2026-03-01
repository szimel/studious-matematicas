import React from 'react';
import { SoundWheels } from '../features/sounds-visuals/components/SoundWheels';
import { PlaceholderPhaseSpace } from '../features/sounds-visuals/test';
import { SherlockReport } from '../pages/seeing-sounds/Analysis';
import { Spectrogram } from '../features/sounds-visuals/components/Spectrogram';

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
    title: 'Spectrogram',
    description:
    'A chromagram spectrogram: each row is one of the 12 musical notes (C–B), each column is a point in time. Brightness shows how strongly that note is present at that moment. The white line follows the current playback position.',
    Component: Spectrogram
  },
  {
    id: 'spectrogram-3d',
    title: '3D Frequency Lines',
    description:
    'A three-dimensional spectrogram where 12 continuous lines (one per chromatic note) rise and glow based on how strongly each note is present. The view scrolls with playback, keeping a consistent viewport regardless of song length. Chord labels mark harmonic sections overhead.',
    Component: PlaceholderPhaseSpace
  },
  { 
    id: 'chroma', 
    title: 'Radial Chroma Distribution', 
    description: 'Hopefully coming soon.',
    Component: PlaceholderPhaseSpace
  }
];
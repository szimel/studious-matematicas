import React from 'react';
import { SoundWheels } from '../features/sounds-visuals/components/SoundWheels';
import { SherlockReport } from '../pages/seeing-sounds/Analysis';
import { Spectrogram } from '../features/sounds-visuals/components/Spectrogram';
import FingerprintSculpture from '../features/sounds-visuals/components/Fingerprint';

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
    'A chromagram spectrogram: each row is one of the 12 musical notes (C–B), each column is a point in time. Brightness shows how strongly that note is present at that moment.',
    Component: Spectrogram
  },
  {
    id: 'fingerprint',
    title: 'Fingerprint Sculpture',
    description:
    'A procedurally-generated 3D crystalline sculpture derived from the song\'s harmonic structure. Tries to create a fingerprint like structure for each song using chords, notes, and their interactions.',
    Component: FingerprintSculpture
  },
];

export const demoSongs: Record<string, { label: string; file: string }[]> = {
  'Dad': [
    { label: 'Slow To Rise', file: '/audio/Dad-slow_to_rise.mp3' },
  ],
  'Mom': [
    { label: 'Song of Ascent', file: '/audio/Mom-song_of_ascent.mp3' },
  ],
  'Matea': [
    { label: 'Je Te Laisserai Des Mots', file: '/audio/Matea-je_te_laisserai_des_mots.mp3' },
    { label: 'I Just Might', file: '/audio/Matea-i_just_might.mp3' },
  ],
  'Abraham': [
    { label: 'Selah', file: '/audio/Abraham-selah.mp3' },
  ],
  'Isaac': [
    { label: 'Dani California', file: '/audio/Isaac-dani_california.mp3' },
  ],
  'Elijah': [
    { label: 'Peg', file: '/audio/Elijah-peg.mp3' },
  ],
  'Rebecca': [
    { label: 'Down in the Valley', file: '/audio/Rebecca-down_in_the_valley.mp3' },
  ],
  'Kamrie': [
    { label: 'Aperture', file: '/audio/Kamrie-aperture.mp3' },
  ], 
  'Samuel': [
    { label: 'Fairy Fountain', file: '/audio/fairy_fountain.mp3' },
    { label: 'Clair De Lune', file: '/audio/clair_de_lune.mp3' },
    { label: 'Blackbird', file: '/audio/blackbird.mp3' },
    { label: 'Song of Storms', file: '/audio/song_of_storms.mp3' },
    { label: 'Fabulous Kisses', file: '/audio/fabulous_kisses.mp3' },
  ],
  'Maria': [
    { label: 'Midnight Sun', file: '/audio/Maria-midnight_sun.mp3' },
    { label: 'Mountain Peaks', file: '/audio/Maria-mountain_peaks.mp3' },
    { label: 'Season 2 Weight Loss', file: '/audio/Maria-season_2_weight_loss.mp3' }
  ], 
  'Joel': [
    { label: 'INTERNET YAMERO', file: '/audio/Joel-INTERNET_YAMERO.mp3' },
    { label: 'Rise and Shine', file: '/audio/Joel-rise_and_shine.mp3' },
  ],
  'Pop': [
    { label: 'Mary Jane Last Dance', file: '/audio/Pop-mary_jane_last_dance.mp3' },
    { label: 'Dani California', file: '/audio/Isaac-dani_california.mp3' },
  ]
};
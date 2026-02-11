import React from 'react';

export const PlaceholderPhaseSpace = ({ audioRef }: { audioRef: React.RefObject<HTMLAudioElement> }) => (
  <div>
    <h4>Analyzing Chaos...</h4>
    <p>Current Index: {audioRef.current?.currentTime || 0}</p>
    <div>[ 3D ATTACTOR MOCK ]</div>
  </div>
);

export const PlaceholderSpectrogram = ({ audioRef }: { audioRef: React.RefObject<HTMLAudioElement> }) => (
  <div>
    <h4>Building Terrain...</h4>
    <p>Current Index: {audioRef.current?.currentTime || 0}</p>
    <div>[ 3D MESH MOCK ]</div>
  </div>
);
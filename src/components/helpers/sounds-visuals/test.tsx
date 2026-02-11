import React from 'react';

export const PlaceholderPhaseSpace = ({ currentFrame }: { currentFrame: number }) => (
  <div>
    <h4>Analyzing Chaos...</h4>
    <p>Current Index: {currentFrame}</p>
    <div>[ 3D ATTACTOR MOCK ]</div>
  </div>
);

export const PlaceholderSpectrogram = ({ currentFrame }: { currentFrame: number }) => (
  <div>
    <h4>Building Terrain...</h4>
    <p>Current Index: {currentFrame}</p>
    <div>[ 3D MESH MOCK ]</div>
  </div>
);
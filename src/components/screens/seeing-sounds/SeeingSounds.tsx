import React, { useState } from 'react';
import '../../../css/set-theory.css';
import { useNavigate } from 'react-router-dom';

// TODO: 
// setup railway for python backend api

export const SeeingSounds: React.FC = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  // Demo track configuration
  const demoTracks = [
    { id: 'piano', label: 'My favorite piano piece', icon: '🎹', name: 'Clair De Lune', file: '/audio/clair_de_lune.mp3' },
    { id: 'synth', label: 'Zelda!', icon: '🎸', name: 'Fairy Fountain', file: '/audio/fairy_fountain.mp3' },
    { id: 'ambient', label: 'Beatles!', icon: '🌊', name: 'Blackbird', file: '/audio/blackbird.mp3' }
  ];

  const sendToSherlock = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {return;}

    // 1. Show processing UI
    setIsProcessing(true);
    setLoadingMessage(`Analyzing "${file.name}"...`);

    // 2. Prepare the "Evidence" (FormData)
    const formData = new FormData();
    formData.append('file', file); 
    const audioUrl = URL.createObjectURL(file);

    try {
    // 3. Send to the Python Engine
      const response = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {throw new Error('Network response was not ok');}

      const analysisResult = await response.json();

      // 4. Temporary success feedback
      setLoadingMessage('Analysis Complete!');
      setTimeout(() => {
        setIsProcessing(false);
				
        navigate('/seeing-sounds/analysis', { 
          state: { ...analysisResult, audio_url: audioUrl } 
        });
      }, 1500);

    } catch (error) {
      console.error('The investigation failed:', error);
      setLoadingMessage('Investigation failed. Check the console.');
      setIsProcessing(false);
    }
  };


  const handleDemoSelect = async (track: typeof demoTracks[0]) => {
    setIsProcessing(true);
    setLoadingMessage(`Analyzing "${track.name}"...`);

    try {
      // 1. Fetch the audio file (Lazy Loading)
      const response = await fetch(track.file);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      // 2. Here is where you'd eventually fetch your pre-computed JSON
      // const jsonResponse = await fetch(`/data/${track.id}.json`);
      // const data = await jsonResponse.json();

      console.log('Audio Loaded & Ready:', url);
      
      // Simulate the "Thinking" time of the algorithm for now
      setTimeout(() => {
        setIsProcessing(false);
        // transitionToCarousel(url, data);
      }, 2000);

    } catch (error) {
      console.error('Failed to load demo:', error);
      setIsProcessing(false);
    }
  };

  function wikiClick (link: string) {
    window.open(`https://en.wikipedia.org/wiki/${link}`);
  }

  return (
    <div className='st-container' style={{ position: 'relative' }}>
      
      {/* --- Loading Overlay --- */}
      {isProcessing && (
        <div style={styles.loadingOverlay}>
          <div className="loader-spinner" style={styles.spinner}></div>
          <p style={styles.loadingText}>{loadingMessage}</p>
        </div>
      )}

      {/* Landing Page Header Section */}
      <div style={styles.headerSection}>
        <h1 style={styles.mainTitle}>1D-to-3D Audio Analysis</h1>
        <p style={styles.description}>
          Welcome to a project designed to peel back the layers of sound. Using 
          <span style={styles.highlight} onClick={() => wikiClick('Fast_Fourier_transform')}> Fast Fourier Transform (FFT)</span>,
          <span style={styles.highlight} onClick={() => wikiClick('Constant-Q_transform')}> Constant-Q Transforms (CQT)</span>, and 
          <span style={styles.highlight} onClick={() => wikiClick('Music_Source_Separation')}> Harmonic-Percussive Source Separation (HPSS)</span>, 
          raw audio data is decomposed into its constituent base frequency... which is a lot of jargon.
          Simply said: if the song is the criminal, then math is Sherlock Holmes: picking up and categorizing
          notes, like clues, that the music can&apos;t help but leave behind. 
        </p>
      </div>

      {/* Action Section: Upload & Demos */}
      <div style={styles.actionContainer}>
        <label style={styles.uploadButton}>
          Upload Audio Recording (.mp3, .wav)
          <input 
            type="file" 
            accept="audio/*" 
            style={{ display: 'none' }} 
            onChange={(e) => sendToSherlock(e)}
          />
        </label>

        <p style={styles.subtext}>Or try a pre-loaded analysis:</p>

        <div style={styles.demoGrid}>
          {demoTracks.map(track => (
            <button
              key={track.id}
              onClick={() => handleDemoSelect(track)}
              style={styles.demoButton}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#3d3e42')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#2d2e32')}
            >
              <span style={{ fontSize: '1.2rem' }}>{track.icon}</span> 
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.9rem', color: '#fff' }}>{track.label}</div>
                <div style={{ fontSize: '0.75rem', color: '#888' }}>{track.name}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Logic for the spinner animation (usually put in global CSS, but here for completeness) */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

const styles = {
  // ... existing styles ...
  headerSection: {
    display: 'flex',
    flexDirection: 'column' as const,
    width: '100%',
    alignItems: 'stretch',
    marginBottom: '2rem',
    justifyContent: 'center',
  },
  mainTitle: {
    color: '#fff',
    fontSize: '2.5rem',
    marginBottom: '20px',
    fontWeight: '700',
    letterSpacing: '-0.5px',
  },
  description: {
    color: '#b0b0b0',
    lineHeight: '1.7',
    fontSize: '1.1rem',
    textAlign: 'justify' as const,
  },
  highlight: {
    color: '#4A90E2',
    fontWeight: '600',
    padding: '0 4px',
    textDecoration: 'underline',
    cursor: 'pointer',
  },
  actionContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '20px',
    alignItems: 'flex-start',
  },
  uploadButton: {
    backgroundColor: '#4A90E2',
    color: 'white',
    padding: '14px 28px',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: '600' as const,
    fontSize: '1rem',
    transition: 'background 0.2s ease',
  },
  subtext: {
    color: '#666',
    marginTop: '15px',
    marginBottom: '5px',
    fontSize: '0.85rem',
    textTransform: 'uppercase' as const,
    letterSpacing: '1.5px',
    fontWeight: '700' as const,
  },
  demoGrid: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap' as const,
  },
  demoButton: {
    background: '#2d2e32',
    border: '1px solid #444',
    color: '#efefef',
    padding: '12px 20px',
    borderRadius: '10px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    transition: 'all 0.2s ease',
  },
  loadingOverlay: {
    position: 'absolute' as const,
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(33, 34, 37, 0.9)',
    zIndex: 100,
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '15px',
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '5px solid #333',
    borderTop: '5px solid #4A90E2',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '20px',
  },
  loadingText: {
    color: '#fff',
    fontSize: '1.1rem',
    fontWeight: '500',
  }
} as const;
import React, { useState } from 'react';
import '../../css/set-theory.css';
import { useNavigate } from 'react-router-dom';
import { LoadingUI } from '../../components/LoadingUI';
import { getParsedData } from '../../utils/sherlockApi';

// Demo track configuration
type DemoTrack = {
	id: string
	label: string
	icon: string
	name: string
	file: string
}

const demoTracks: DemoTrack[] = [
  { id: 'piano', label: 'My favorite piano piece', icon: '🎹', name: 'Clair De Lune', file: '/audio/clair_de_lune.mp3' },
  { id: 'synth', label: 'Zelda!', icon: '🌊', name: 'Fairy Fountain', file: '/audio/fairy_fountain.mp3' },
  { id: 'ambient', label: 'Beatles!', icon: '🎸', name: 'Blackbird', file: '/audio/blackbird.mp3' }
];

export const SeeingSounds: React.FC = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  /**
	 * Takes file input, saves it somewhere not very permanent, then passes it 
	 * along to python api "sherlock". Navigates to /analysis, given success
	 */
  const sendToSherlock = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) {return;}

      const url = URL.createObjectURL(file);
    
      setIsProcessing(true);
      setLoadingMessage(`Analyzing "${file.name}"...`);

      const formData = new FormData();
      formData.append('file', file);
      
      const result = await getParsedData(formData);

      if (result.error) {throw new Error(result.error);}

      setLoadingMessage('Analysis Complete!');
      setTimeout(() => {
        setIsProcessing(false);
        navigate('/seeing-sounds/analysis', { state: { ...result, audio_url: url } });
      }, 1500);

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setLoadingMessage(`Error: ${errorMessage}`);
      setTimeout(() => setIsProcessing(false), 3000);
    }
  };

  /**
	 * Fetches lazy loaded .mp3 and .json for corresponding demo track. Sends to /analysis,
	 * given no errors. 
	 */
  const loadDemoData = async (track: DemoTrack) => {
    try {
      setIsProcessing(true);
      setLoadingMessage(`Loading "${track.name}"...`);

      // A. Create the Audio URL
      const audioRes = await fetch(track.file);
      const audioBlob = await audioRes.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      // B. Fetch the Pre-computed JSON
      const jsonPath = track.file.replace('/audio/', '/json/').replace('.mp3', '.json');
      
      const jsonRes = await fetch(jsonPath);
      if (!jsonRes.ok) {
        throw new Error(`Could not find analysis file at ${jsonPath}`);
      }
      
      // This is "lazy loading" — the data is only downloaded now!
      const analysisData = await jsonRes.json();

      // C. Transition
      setLoadingMessage('Ready!');
      setTimeout(() => {
        setIsProcessing(false);
        // Pass the fetched JSON + the audio URL to the next page
        navigate('/seeing-sounds/analysis', { 
          state: { ...analysisData, audio_url: audioUrl } 
        });
      }, 800); 

    } catch (err) {
      setLoadingMessage('Error loading demo file.');
      setTimeout(() => setIsProcessing(false), 2500);
    }
  };

  function wikiClick (link: string) {
    window.open(`https://en.wikipedia.org/wiki/${link}`);
  }

  return (
    <div className='st-container' style={{ position: 'relative' }}>

      {/* --- Loading Overlay --- */}
      <LoadingUI loading={isProcessing} displayText={loadingMessage} />

      {/* Landing Page Header Section */}
      <div style={styles.headerSection}>
        <h1 style={styles.mainTitle}>1D-to-3D Audio Analysis</h1>
        <p style={styles.description}>
          Welcome to a project designed to peel back the layers of sound. Using 
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

        {/* Demo songs */}
        <p style={styles.subtext}>Or try a pre-loaded analysis:</p>
        <div style={styles.demoGrid}>
          {demoTracks.map(track => (
            <button
              key={track.id}
              onClick={() => loadDemoData(track)}
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
    </div>
  );
};

const styles = {
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
  loadingText: {
    color: '#fff',
    fontSize: '1.1rem',
    fontWeight: '500',
  }
} as const;
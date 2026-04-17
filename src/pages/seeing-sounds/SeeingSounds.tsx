import React, { useEffect, useRef, useState } from 'react';
import '../../css/set-theory.css';
import { useNavigate } from 'react-router-dom';
import { LoadingUI } from '../../components/LoadingUI';
import { getParsedData, healthPing } from '../../utils/sherlockApi';
import { demoSongs } from '../../types/types';
import { persistAnalysisState, persistUploadedAudio } from '../../utils/analysisSession';
import { DataKey, DataProps, Fingerprint } from '../../types/sound_data_types';

type DemoSong = {
  label: string;
  file: string;
};

type AnalysisPayload = {
  audio_url: string;
  audio_upload_id?: string;
  file_name: string;
  duration: number;
  fps: number;
  sr: number;
  hop_length: number;
  parsed_chords: Record<DataKey, DataProps>;
  parsed_notes: Record<DataKey, DataProps>;
  spectrogram_data: number[][];
  fingerprint: Fingerprint;
  error?: string;
};

export const SeeingSounds: React.FC = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [isDemoMenuOpen, setIsDemoMenuOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(Object.keys(demoSongs)[0] ?? '');
  const [isNarrowViewport, setIsNarrowViewport] = useState(false);
  const demoMenuRef = useRef<HTMLDivElement>(null);
  const selectedSongs = demoSongs[selectedPerson] ?? [];

  // "wake" backend, in case it's not awake
  useEffect(() => {
    const initializeSherlock = async () => {
      try {
        const response = await healthPing();
        if (!response) { throw new Error(); }

      } catch (err: unknown) {
        const errorMessage = 'Error: Backend failed. Use demo file or refresh and try again.';
        setLoadingMessage(errorMessage);
        setIsProcessing(true);
        setTimeout(() => setIsProcessing(false), 3000);
      }
    };

    initializeSherlock();
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 720px)');
    const updateViewportMode = (event?: MediaQueryListEvent) => {
      setIsNarrowViewport(event ? event.matches : mediaQuery.matches);
    };

    updateViewportMode();
    mediaQuery.addEventListener('change', updateViewportMode);

    return () => {
      mediaQuery.removeEventListener('change', updateViewportMode);
    };
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!demoMenuRef.current?.contains(event.target as Node)) {
        setIsDemoMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  /**
	 * Takes file input, saves it somewhere not very permanent, then passes it 
	 * along to python api "sherlock". Navigates to /analysis, given success
	 */
  const sendToSherlock = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) {return;}

      const url = URL.createObjectURL(file);
      const uploadId = `${Date.now()}-${file.name}`;
    
      setIsProcessing(true);
      setLoadingMessage(`Analyzing "${file.name}"...`);

      const formData = new FormData();
      formData.append('file', file);
      
      const result = await getParsedData(formData);

      if (result.error) {throw new Error(result.error);}

      await persistUploadedAudio(uploadId, file);

      const payload: AnalysisPayload = {
        ...result,
        audio_url: url,
        audio_upload_id: uploadId,
      };

      persistAnalysisState(payload);

      setLoadingMessage('Analysis Complete!');
      setTimeout(() => {
        setIsProcessing(false);
        navigate('/seeing-sounds/analysis', { state: payload });
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
  const loadDemoData = async (song: DemoSong) => {
    try {
      setIsProcessing(true);
      setLoadingMessage(`Loading "${song.label}"...`);

      // B. Fetch the Pre-computed JSON
      const jsonPath = song.file
        .replace('/audio/', '/json/')
        .replace(/\.[^.]+$/, '.json');
      
      const jsonRes = await fetch(jsonPath);
      if (!jsonRes.ok) {
        throw new Error(`Could not find analysis file at ${jsonPath}`);
      }
      
      // lazy load the json
      const analysisData = await jsonRes.json();// Debug log
      const payload: AnalysisPayload = {
        ...analysisData,
        audio_url: song.file,
      };

      persistAnalysisState(payload);

      // C. Transition
      setLoadingMessage('Ready!');
      setTimeout(() => {
        setIsProcessing(false);
        setIsDemoMenuOpen(false);
        // Pass the fetched JSON + the audio URL to the next page
        navigate('/seeing-sounds/analysis', { 
          state: payload 
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
        <p style={styles.description}>
					Please note that this project doesn&apos;t yield perfect results - the math is powerful, but music is complex! File analysis also can take upwards of a minute. 
					Lastly, I&apos;ve found it&apos;s easiest to use two devices, one to play a song, the other to record it and upload here.
        </p>
      </div>

      {/* Action Section: Upload & Demos */}
      <div style={styles.actionContainer}>
        <label style={styles.uploadButton}>
					Upload Audio Recording (.mp3, .m4a)
          <input 
            type="file" 
            accept=".mp3,.m4a" 
            style={{ display: 'none' }} 
            onChange={(e) => sendToSherlock(e)}
          />
        </label>

        {/* Demo songs */}
        <p style={styles.subtext}>Or try a pre-loaded analysis:</p>
        <div style={styles.demoBrowser} ref={demoMenuRef}>
          <button
            type="button"
            onClick={() => setIsDemoMenuOpen((current) => !current)}
            style={styles.demoLauncher}
            aria-expanded={isDemoMenuOpen}
            aria-haspopup="dialog"
          >
            <span style={styles.demoLauncherLabel}>Browse demo songs</span>
            <span style={styles.demoLauncherMeta}>{selectedPerson || 'Choose a person'}</span>
          </button>

          {isDemoMenuOpen && (
            <div
              style={{
                ...styles.demoPanel,
                ...(isNarrowViewport ? styles.demoPanelNarrow : styles.demoPanelWide),
              }}
            >
              <div style={{
                ...styles.demoPeopleColumn,
                ...(isNarrowViewport ? styles.demoPeopleColumnNarrow : null),
              }}>
                {Object.entries(demoSongs).map(([person, songs]) => {
                  const isActive = person === selectedPerson;

                  return (
                    <button
                      key={person}
                      type="button"
                      onClick={() => setSelectedPerson(person)}
                      style={{
                        ...styles.personButton,
                        ...(isActive ? styles.personButtonActive : null),
                      }}
                    >
                      <span>{person}</span>
                      <span style={styles.personCount}>{songs.length}</span>
                    </button>
                  );
                })}
              </div>

              <div style={styles.demoSongsColumn}>
                <div style={styles.demoSongsHeader}>
                  <span>{selectedPerson}</span>
                  <span style={styles.demoCount}>{selectedSongs.length} song{selectedSongs.length === 1 ? '' : 's'}</span>
                </div>
                <div style={styles.demoSongList}>
                  {selectedSongs.map((song) => (
                    <button
                      key={`${selectedPerson}-${song.file}`}
                      type="button"
                      onClick={() => loadDemoData(song)}
                      style={styles.demoSongButton}
                    >
                      <span style={styles.demoSongTitle}>{song.label}</span>
                      <span style={styles.demoSongFile}>{song.file.split('/').pop()?.replace(/\.[^.]+$/, '')}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
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
    alignItems: 'stretch',
    width: '100%',
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
    alignSelf: 'flex-start',
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
  demoBrowser: {
    position: 'relative' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px',
    width: '100%',
    maxWidth: '560px',
  },
  demoLauncher: {
    background: '#2d2e32',
    border: '1px solid #444',
    borderRadius: '12px',
    color: '#efefef',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    padding: '14px 16px',
    width: '100%',
    textAlign: 'left' as const,
  },
  demoLauncherLabel: {
    fontWeight: '600' as const,
    fontSize: '0.98rem',
    color: '#ffffff',
  },
  demoLauncherMeta: {
    color: '#8f95a3',
    fontSize: '0.82rem',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
  },
  demoPanel: {
    position: 'absolute' as const,
    top: 'calc(100% + 8px)',
    left: 0,
    width: '100%',
    background: '#202126',
    border: '1px solid #3a3b40',
    borderRadius: '14px',
    boxShadow: '0 18px 50px rgba(0, 0, 0, 0.35)',
    zIndex: 20,
    overflow: 'hidden',
  },
  demoPanelWide: {
    display: 'grid',
    gridTemplateColumns: '170px minmax(0, 1fr)',
  },
  demoPanelNarrow: {
    display: 'flex',
    flexDirection: 'column' as const,
  },
  demoPeopleColumn: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '6px',
    padding: '12px',
    background: '#25262b',
    borderRight: '1px solid #34363d',
  },
  demoPeopleColumnNarrow: {
    borderRight: 'none',
    borderBottom: '1px solid #34363d',
  },
  personButton: {
    background: 'transparent',
    border: '1px solid transparent',
    borderRadius: '10px',
    color: '#d8dbe2',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '10px',
    padding: '10px 12px',
    textAlign: 'left' as const,
    width: '100%',
  },
  personButtonActive: {
    background: '#111318',
    border: '1px solid #4A90E2',
    color: '#ffffff',
  },
  personCount: {
    color: '#8f95a3',
    fontSize: '0.78rem',
    fontWeight: '600' as const,
  },
  demoSongsColumn: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px',
    padding: '12px',
    minWidth: 0,
  },
  demoSongsHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    color: '#efefef',
    padding: '4px 2px',
    fontWeight: '600' as const,
  },
  demoCount: {
    color: '#8f95a3',
    fontSize: '0.8rem',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
  },
  demoSongList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  },
  demoSongButton: {
    background: '#1e1f23',
    border: '1px solid #3a3b40',
    color: '#efefef',
    padding: '12px 14px',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '12px',
    textAlign: 'left' as const,
    width: '100%',
  },
  demoSongTitle: {
    fontSize: '0.95rem',
    color: '#ffffff',
  },
  demoSongFile: {
    fontSize: '0.72rem',
    color: '#7f8592',
    wordBreak: 'break-word' as const,
  },
  loadingText: {
    color: '#fff',
    fontSize: '1.1rem',
    fontWeight: '500',
  }
} as const;
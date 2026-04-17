import React, { useEffect, useRef, useState } from 'react';
import '../../css/set-theory.css';
import '../../css/sound-analysis.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { AudioPlayer } from '../../features/sounds-visuals/AudioPlayer';
import { modules } from '../../types/types';
import { DataKey, DataProps, Fingerprint } from '../../types/sound_data_types';
import { getPersistedUploadedAudio, persistAnalysisState, readPersistedAnalysisState } from '../../utils/analysisSession';

// TODO: error screen using <LoadingUI> when no response file OR track file
export interface SherlockReport {
  file_name: string;
  duration: number;
	fps: number;
  sr: number;
  hop_length: number;
  audio_url: string;
  audio_upload_id?: string;
	parsed_chords: Record<DataKey, DataProps>;
	parsed_notes: Record<DataKey, DataProps>;
	/** Chromagram matrix from backend: shape (N_frames × 12 bins), values 0–255 */
	spectrogram_data: number[][];
  fingerprint: Fingerprint;
}

export const SeeingSoundsAnalysis: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const audioRef = useRef<HTMLAudioElement>(null);

  const [, setCurrentFrame] = useState(0);
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const activeModule = modules[activeModuleIndex];

  const routeReport = location.state as SherlockReport | null;
  const [report, setReport] = useState<SherlockReport | null>(routeReport ?? readPersistedAnalysisState<SherlockReport>());
  const [resolvedAudioUrl, setResolvedAudioUrl] = useState<string>(routeReport?.audio_url ?? '');

  useEffect(() => {
    if (routeReport) {
      setReport(routeReport);
      persistAnalysisState(routeReport);
    }
  }, [routeReport]);

  useEffect(() => {
    let localUrl = '';

    const restoreAudio = async () => {
      if (!report) {
        navigate('/seeing-sounds');
        return;
      }

      if (report.audio_upload_id) {
        const uploadedBlob = await getPersistedUploadedAudio(report.audio_upload_id);
        if (uploadedBlob) {
          localUrl = URL.createObjectURL(uploadedBlob);
          setResolvedAudioUrl(localUrl);
          return;
        }
      }

      setResolvedAudioUrl(report.audio_url);
    };

    restoreAudio();

    return () => {
      if (localUrl) {
        URL.revokeObjectURL(localUrl);
      }
    };
  }, [navigate, report]);

  if (!report) {
    return null;
  }
  // time passed from audio player
  const handleSync = (time: number) => {
    const frame = Math.floor(time * report.fps);
    audioRef.current?.currentTime && setCurrentFrame(frame);
    setCurrentFrame(frame);
  };


  return (
    <div className='st-container' style={styles.dashboardRoot}>
      <header className='analysis-header'>
        <div className='header-info'>
          <button onClick={() => navigate('/seeing-sounds')} className='analysis-back-btn'>
            ← Back
          </button>
          <h2 className='analysis-file-name'>{report.file_name}</h2>
        </div>
      
        <div className='analysis-nav-controls'>
          <button 
            className='nav-btn'
            onClick={() => setActiveModuleIndex(prev => Math.max(0, prev - 1))}
            disabled={activeModuleIndex === 0}
          >
            PREV
          </button>
          <div className='module-counter'>
            {activeModuleIndex + 1} / {modules.length}
          </div>
          <button 
            className='nav-btn'
            onClick={() => setActiveModuleIndex(prev => Math.min(modules.length - 1, prev + 1))}
            disabled={activeModuleIndex === modules.length - 1}
          >
            NEXT
          </button>
        </div>
      </header>

      <div className='analysis-main'>
        <div className='perspective-sidebar'>
          <div className='sidebar-label'>Perspective</div>
          <h3 className='active-module-title'>{activeModule.title}</h3>
          <p className='active-module-desc'>{activeModule.description}</p>
        
          <div className='metadata-box'>
            <div className='meta-row'>
              <span>Duration:</span> <span>{report.duration.toFixed(2)}s</span>
            </div>
            <div className='meta-row'>
              <span>Sampling:</span> <span>{report.fps.toFixed(1)} fps</span>
            </div>
          </div>
        </div>

        <div className='visualizer-container'>
          <activeModule.Component data={report} audioRef={audioRef}/>
        </div>
      </div>

      <footer className='analysis-footer'>
        <AudioPlayer src={resolvedAudioUrl} duration={report.duration} audioRef={audioRef} onTimeUpdate={handleSync} />
      </footer>
    </div>
  );
};

const styles = {
  dashboardRoot: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column' as const,
    gap: '20px',
    color: '#fff',
  },
} as const;

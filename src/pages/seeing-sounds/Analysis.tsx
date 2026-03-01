import React, { useRef, useState } from 'react';
import '../../css/set-theory.css';
import '../../css/sound-analysis.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { AudioPlayer } from '../../features/sounds-visuals/AudioPlayer';
import { modules } from '../../types/types';
import { DataSegment } from '../../types/sound_data_types';

// TODO: error screen using <LoadingUI> when no response file OR track file

export interface SherlockReport {
  file_name: string;
  duration: number;
	fps: number
  sr: number;
  hop_length: number;
  audio_url: string;
	chord_segments: Array<DataSegment>
	note_segments: Array<DataSegment>
}

export const SeeingSoundsAnalysis: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const audioRef = useRef<HTMLAudioElement>(null);

  const [, setCurrentFrame] = useState(0);
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const activeModule = modules[activeModuleIndex];
  
  // Extract the "evidence" from the router state
  const report = location.state as SherlockReport;

  // If someone navigates here directly without data, send them back
  if (!report) {
    navigate('/seeing-sounds');
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
        <AudioPlayer src={report.audio_url} duration={report.duration} audioRef={audioRef} onTimeUpdate={handleSync} />
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

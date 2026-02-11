import React, { useState } from 'react';
import '../../css/set-theory.css';
import '../../css/sound-analysis.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { AudioPlayer } from '../helpers/sounds-visuals/AudioPlayer';
import { modules } from '../helpers/sounds-visuals/types';

type ChordSegment = {
  start: number;
  end: number;
  label: string;
};

export interface SherlockReport {
  file_name: string;
  duration: number;
	fps: number;
  tonal_profile: number[];
  time_series_notes: number[][];
  spectrogram_data: number[][];
  raw_data: number[];
  audio_url: string;
	c_chord_segments: Array<ChordSegment>
}

export const SeeingSoundsAnalysis: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [currentFrame, setCurrentFrame] = useState(0);
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const activeModule = modules[activeModuleIndex];
  
  // Extract the "Evidence" from the router state
  const report = location.state as SherlockReport;

  // If someone navigates here directly without data, send them back
  if (!report) {
    navigate('/seeing-sounds');
    return null;
  }
  console.log(report);
  // time passed from audio player
  const handleSync = (time: number) => {
    const frame = Math.floor(time * report.fps);
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

      <main className='analysis-main'>
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
          <activeModule.Component data={report} currentFrame={currentFrame} />
        </div>
      </main>

      <footer className='analysis-footer'>
        <AudioPlayer src={report.audio_url} duration={report.duration} onTimeUpdate={handleSync} />
      </footer>
    </div>
  );
};

const styles = {
  dashboardRoot: {
    display: 'flex',
    flexDirection: 'column' as const,
    height: '100%',
    gap: '20px',
    color: '#fff',
  },
} as const;

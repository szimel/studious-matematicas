import React, { useState } from 'react';

interface PlayerProps {
  src: string;
	duration: number;
	audioRef: React.RefObject<HTMLAudioElement>;
  // eslint-disable-next-line no-unused-vars
  onTimeUpdate: (time: number) => void;
}

export const AudioPlayer: React.FC<PlayerProps> = ({ src, duration, audioRef, onTimeUpdate }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const togglePlay = () => {
    const a = audioRef.current;
    if (!a) {return;}
    if (isPlaying) {a.pause();}
    else {a.play();}
    setIsPlaying(!isPlaying);
  };

  const handleUpdate = () => {
    const a = audioRef.current;
    if (!a || !Number.isFinite(a.duration) || a.duration <= 0) {return;}

    setProgress((a.currentTime / a.duration) * 100);
    onTimeUpdate?.(a.currentTime);
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current) {
      const bounds = e.currentTarget.getBoundingClientRect();
      const percent = (e.clientX - bounds.left) / bounds.width;
      audioRef.current.currentTime = percent * audioRef.current.duration;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={styles.playerWrapper}>
      <audio ref={audioRef} src={src} onTimeUpdate={handleUpdate} onEnded={() => setIsPlaying(false)} />
      
      <button onClick={togglePlay} style={styles.playBtn}>
        {isPlaying ? <PauseIcon /> : <PlayIcon />}
      </button>

      <div style={styles.trackContainer} onClick={seek}>
        <div style={styles.trackBase}>
          <div style={{ ...styles.trackProgress, width: `${progress}%` }} />
        </div>
      </div>
      <div style={styles.timeLabel}>
        {formatTime((progress/100)*duration)} / {formatTime(duration)}
      </div>
    </div>
  );
};

// --- Minimized Icons for a clean look ---
const PlayIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const PauseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
    <rect x="6" y="4" width="4" height="16" />
    <rect x="14" y="4" width="4" height="16" />
  </svg>
);

const styles = {
  playerWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: '15px 25px',
    borderRadius: '40px',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  playBtn: {
    background: '#4A90E2',
    border: 'none',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 15px rgba(74, 144, 226, 0.3)',
  },
  trackContainer: {
    flexGrow: 1,
    cursor: 'pointer',
    padding: '10px 0',
  },
  trackBase: {
    height: '4px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '2px',
    position: 'relative' as const,
  },
  trackProgress: {
    height: '100%',
    background: 'linear-gradient(90deg, #4A90E2, #63B3ED)',
    borderRadius: '2px',
    transition: 'width 0.1s linear',
  },
  timeLabel: {
    color: '#888',
    fontFamily: 'monospace',
    fontSize: '0.9rem',
  }
} as const;
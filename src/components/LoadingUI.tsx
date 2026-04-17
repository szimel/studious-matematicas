import React from 'react';

type LoadingUIProps = {
	showing?: boolean
	loading?: boolean
	displayText: string
}

export const LoadingUI: React.FC<LoadingUIProps> = ({ showing, loading, displayText }) => {

  return (
    <>
      {(showing || loading) && (
        <div style={styles.overlay}>
          {loading && (
            <div className="loader-spinner" style={styles.spinner}></div>
          )}
          <p style={styles.loadingText}>{displayText}</p>
        </div>
      )}
      {/* Logic for the spinner animation (usually put in global CSS, but here for completeness) */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};

const styles = {
  overlay: {
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


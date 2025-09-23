import React from 'react';
import FileSelector from '../FileSelector';

const AppHeader = ({ 
  isConnected, 
  liveDataMode, 
  onLiveDataToggle, 
  onFileSelect 
}) => {
  return (
    <header className="header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ flex: 1 }}>
          <h1>Energy Data Insights - Explorer</h1>
          <p>EDI Data Platform - {isConnected ? 'connected' : 'not connected'}</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button
            onClick={onLiveDataToggle}
            style={{
              padding: '0.5rem 1rem',
              background: liveDataMode ? '#e74c3c' : '#95a5a6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            {liveDataMode ? 'Back to Search' : 'Live Data'}
          </button>
          {liveDataMode && <FileSelector onFileSelect={onFileSelect} />}
        </div>
      </div>
    </header>
  );
};

export default AppHeader;

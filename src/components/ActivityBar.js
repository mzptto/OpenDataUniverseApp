import React from 'react';
import { Folder, Search, Palette } from 'lucide-react';

const ActivityBar = ({ activeView, onViewChange }) => {
  const handleViewClick = (view) => {
    onViewChange(view);
  };

  return (
    <div className="activity-bar">
      <button 
        className={`activity-button ${activeView === 'entities' ? 'active' : ''}`}
        onClick={() => handleViewClick('entities')}
        title="Entity Browser"
      >
        <Folder size={24} />
      </button>
      <button 
        className={`activity-button ${activeView === 'search' ? 'active' : ''}`}
        onClick={() => handleViewClick('search')}
        title="OSDU Search"
      >
        <Search size={24} />
      </button>
      <button 
        className={`activity-button ${activeView === 'icons' ? 'active' : ''}`}
        onClick={() => handleViewClick('icons')}
        title="Icon Preview"
      >
        <Palette size={24} />
      </button>
    </div>
  );
};

export default ActivityBar;
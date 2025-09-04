import React from 'react';
import { Folder, Search, Server, GitBranch } from 'lucide-react';

const ActivityBar = ({ activeView, onViewChange, onHierarchyView }) => {
  const handleViewClick = (view) => {
    onViewChange(view);
  };

  return (
    <div className="activity-bar">
      <button 
        className="activity-button"
        onClick={onHierarchyView}
        title="OSDU Hierarchy"
      >
        <GitBranch size={24} />
      </button>
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
        className={`activity-button ${activeView === 'serverless' ? 'active' : ''}`}
        onClick={() => handleViewClick('serverless')}
        title="Serverless EDI"
      >
        <Server size={24} />
      </button>
    </div>
  );
};

export default ActivityBar;
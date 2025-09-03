import React from 'react';
import EntityBrowser from './EntityBrowser';
import SearchSidebar from './SearchSidebar';

const Sidebar = ({ 
  activeView, 
  entities, 
  selectedEntity, 
  onEntitySelect, 
  onFileSelect,
  onSearch,
  onClose
}) => {
  if (!activeView) return null;

  const handleMouseLeave = () => {
    onClose();
  };

  return (
    <div className={`sidebar ${activeView ? 'open' : ''}`} onMouseLeave={handleMouseLeave}>
      {activeView === 'entities' && (
        <EntityBrowser
          entities={entities}
          selectedEntity={selectedEntity}
          onEntitySelect={onEntitySelect}
          isOpen={true}
          onClose={() => {}}
        />
      )}
      {activeView === 'search' && (
        <SearchSidebar entities={entities} onSearch={onSearch} />
      )}
      {activeView === 'icons' && (
        <div style={{ padding: '1rem', textAlign: 'center', color: '#666' }}>
          Icon preview is shown in the main area
        </div>
      )}
    </div>
  );
};

export default Sidebar;
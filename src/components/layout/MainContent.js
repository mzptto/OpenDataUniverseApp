import React from 'react';
import SearchResults from '../SearchResults';
import ServerlessEDI from '../ServerlessEDI';
import OSDUHierarchyViewer from '../OSDUHierarchyViewer';
import DiagramViewer from '../DiagramViewer';
import PropertiesPanel from '../PropertiesPanel';

const ResizeHandle = () => {
  const handleMouseDown = (e) => {
    const startY = e.clientY;
    const diagramContainer = document.querySelector('.diagram-container');
    const propertiesPanel = document.querySelector('.properties-panel');
    const startDiagramHeight = diagramContainer.offsetHeight;
    const startPropertiesHeight = propertiesPanel.offsetHeight;
    
    const handleMouseMove = (e) => {
      const deltaY = e.clientY - startY;
      const newDiagramHeight = startDiagramHeight + deltaY;
      const newPropertiesHeight = startPropertiesHeight - deltaY;
      
      if (newDiagramHeight > 200 && newPropertiesHeight > 200) {
        diagramContainer.style.flex = 'none';
        diagramContainer.style.height = newDiagramHeight + 'px';
        propertiesPanel.style.height = newPropertiesHeight + 'px';
      }
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  
  return <div className="resize-handle" onMouseDown={handleMouseDown} />;
};

const MainContent = ({
  mainContentView,
  searchState,
  onRecordSelect,
  authState,
  selectedEntity,
  onNodeClick,
  onTransformChange,
  getCurrentTransform,
  liveDataMode
}) => {
  const renderContent = () => {
    switch (mainContentView) {
      case 'search':
        return (
          <>
            <div className="diagram-header">Search Service</div>
            <div className="diagram-container" style={{ flex: '1 1 auto', minHeight: 0 }}>
              <SearchResults 
                searchResponse={searchState.results}
                loading={searchState.loading}
                onRecordSelect={onRecordSelect}
              />
            </div>
          </>
        );

      case 'serverless':
        return (
          <>
            <div className="diagram-header">Serverless EDI</div>
            <div className="diagram-container" style={{ flex: '1 1 auto', minHeight: 0 }}>
              {authState.isAuthenticated ? (
                <ServerlessEDI user={authState.user} signOut={authState.signOut} />
              ) : (
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  flex: 1,
                  fontSize: '16px',
                  color: '#666'
                }}>
                  Please authenticate using the sidebar to access Serverless EDI
                </div>
              )}
            </div>
          </>
        );

      case 'hierarchy':
        return (
          <>
            <div className="diagram-header">OSDU Data Model Hierarchy</div>
            <div className="diagram-container" style={{ flex: '1 1 auto', minHeight: 0 }}>
              <OSDUHierarchyViewer />
            </div>
          </>
        );

      default:
        return (
          <>
            <div className="diagram-header">Data Model - E-R Diagram</div>
            <div className="diagram-container">
              <DiagramViewer
                key={(selectedEntity?.name && selectedEntity?.version) ? `${selectedEntity.name}:${selectedEntity.version}` : (selectedEntity?.name || 'default')}
                pumlContent={selectedEntity?.pumlContent}
                onNodeClick={onNodeClick}
                entityName={selectedEntity?.name}
                entityVersion={selectedEntity?.version}
                kind={(selectedEntity?.schema?.kind) || (selectedEntity?.example?.kind)}
                onTransformChange={onTransformChange}
                initialTransform={getCurrentTransform()}
                exampleData={selectedEntity?.example}
                fileName={selectedEntity?.fileName}
                enableDataFading={liveDataMode}
              />
            </div>
            
            <ResizeHandle />
            
            <div className="diagram-header">Data & Properties</div>
            <PropertiesPanel
              schema={selectedEntity?.schema}
              example={selectedEntity?.example}
              selectedNode={selectedEntity?.selectedNode}
            />
          </>
        );
    }
  };

  return (
    <div className="main-content">
      <div className="content-area">
        {renderContent()}
      </div>
    </div>
  );
};

export default MainContent;

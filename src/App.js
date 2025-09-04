import React, { useState, useCallback, useEffect } from 'react';
import ActivityBar from './components/ActivityBar';
import Sidebar from './components/Sidebar';
import DiagramViewer from './components/DiagramViewer';
import PropertiesPanel from './components/PropertiesPanel';
import SearchResults from './components/SearchResults';
import FileSelector from './components/FileSelector';
import ErrorBoundary from './components/ErrorBoundary';

import ServerlessEDI from './components/ServerlessEDI';
import OSDUHierarchyViewer from './components/OSDUHierarchyViewer';
import { DataLoader } from './utils/dataLoader';
import { sampleEntities } from './data/sampleData';
// AWS config removed - using simple auth

function App() {
  const [entities, setEntities] = useState(sampleEntities);
  const [isLoadingEntities, setIsLoadingEntities] = useState(true);
  const [appState, setAppState] = useState({
    selectedEntity: null,
    selectedNode: null,
    activeSidebarView: null,
    liveDataMode: false,
    mainContentView: 'hierarchy' // Default to hierarchy view
  });
  const [searchState, setSearchState] = useState({
    results: null,
    loading: false
  });
  const [isConnected, setIsConnected] = useState(false);
  const [authState, setAuthState] = useState({ user: null, signOut: null, isAuthenticated: false });
  
  // Load entities on component mount
  useEffect(() => {
    const loadEntities = async () => {
      try {
        setIsLoadingEntities(true);
        const loadedEntities = await DataLoader.loadOsduEntitiesLazy();
        
        if (loadedEntities && loadedEntities.length > 0) {
          // Load entities in chunks for better performance
          await DataLoader.loadEntitiesInChunks(loadedEntities, (chunkedEntities) => {
            setEntities(chunkedEntities);
            if (!appState.selectedEntity && chunkedEntities.length > 0) {
              setAppState(prev => ({ ...prev, selectedEntity: chunkedEntities[0] }));
            }
          });
        } else {
          setEntities(sampleEntities);
          setAppState(prev => ({ ...prev, selectedEntity: sampleEntities[0] }));
        }
      } catch (error) {
        console.error('Failed to load entities:', error);
        setEntities(sampleEntities);
        setAppState(prev => ({ ...prev, selectedEntity: sampleEntities[0] }));
      } finally {
        setIsLoadingEntities(false);
      }
    };
    
    loadEntities();
  }, []);
  
  // Store transform state per entity to prevent jumping
  const [entityTransforms, setEntityTransforms] = useState(new Map());

  const handleEntitySelect = useCallback((entity) => {
    setAppState(prev => ({
      ...prev,
      selectedEntity: entity,
      selectedNode: null,
      liveDataMode: false
    }));
  }, []);

  const extractEntityNameFromKind = (data, fileName) => {
    // Try to extract from kind field first
    if (data.kind && typeof data.kind === 'string') {
      const kindMatch = data.kind.match(/^[\w\-\.]+:[\w\-\.]+:([\w\-\.]+):[0-9]+\.[0-9]+\.[0-9]+$/);
      if (kindMatch) {
        const entityPart = kindMatch[1];
        // Remove master-data-- or work-product-component-- prefixes
        const cleanEntity = entityPart.replace(/^(master-data--|work-product-component--|reference-data--)/, '');
        // Get version from kind
        const versionMatch = data.kind.match(/:([0-9]+\.[0-9]+\.[0-9]+)$/);
        const version = versionMatch ? versionMatch[1] : '';
        return version ? `${cleanEntity}.${version}` : cleanEntity;
      }
    }
    
    // Fallback to filename
    return fileName.replace('.json', '').split('.')[0];
  };

  const handleFileSelect = async (fileData) => {

    let matchingEntity = null;
    
    // Only auto-select entity for schema files (not data records)
    const isSchemaFile = fileData.schema?.$schema || fileData.schema?.properties || fileData.name.toLowerCase().includes('schema');
    
    if (isSchemaFile) {
      // Extract entity name from schema title or filename
      const schemaTitle = fileData.schema?.title;
      const fileName = fileData.name;

      console.log('Schema file detected. Title:', schemaTitle, 'Filename:', fileName);
      console.log('Available entities (sample):', entities.slice(0,5).map(e => `${e.name}.${e.version}`), '... total', entities.length);

      // Try to match by schema title first, then filename
      const searchName = schemaTitle || fileName;

      matchingEntity = entities.find(entity => {
        const match = entity.name.toLowerCase() === searchName.toLowerCase() ||
                     entity.name.toLowerCase().includes(searchName.toLowerCase()) ||
                     searchName.toLowerCase().includes(entity.name.toLowerCase());
        console.log(`Checking ${entity.name} vs ${searchName}: ${match}`);
        return match;
      });

      console.log('Found matching entity (schema route):', matchingEntity?.name, matchingEntity?.version, 'puml?', !!matchingEntity?.pumlContent);
    } else {
      // For data records, match EXACT by kind base + version
      const kind = fileData.schema?.kind;
      const kindMatch = typeof kind === 'string'
        ? kind.match(/^[\w\-.]+:[\w\-.]+:([\w\-.]+):([0-9]+\.[0-9]+\.[0-9]+)$/)
        : null;
      if (kindMatch) {
        const entityPart = kindMatch[1];
        const version = kindMatch[2];
        const base = entityPart.replace(/^(master-data--|work-product-component--|reference-data--)/, '').toLowerCase();
        console.log('Live data record detected. Parsed kind:', { base, version });

        // First, search in currently loaded chunk
        matchingEntity = entities.find(e => e.name.toLowerCase() === base && e.version === version);
        console.log('Match in current chunk:', !!matchingEntity);

        // If not found in current chunk, skip full dataset search for now
        if (!matchingEntity) {
          console.log('Entity not found in current chunk, skipping full dataset search');
        }
      }
    }
    
    // Extract proper entity name for display
    const extractedEntityName = extractEntityNameFromKind(fileData.schema, fileData.name);
    
    // Use the matching entity from osduEntities with loaded data
    const entityToUse = matchingEntity ? {
      ...matchingEntity, // Keep schema, pumlContent, etc. from osduEntities
      example: fileData.schema, // Replace example with loaded data
      fileName: fileData.name // Add filename
    } : {
      name: extractedEntityName,
      schema: null,
      example: fileData.schema,
      pumlContent: null,
      fileName: fileData.name
    };

    console.log('Selected entity set to:', {
      name: entityToUse.name,
      version: entityToUse.version,
      hasPUML: !!entityToUse.pumlContent,
      exampleKeys: Object.keys(fileData.schema || {})
    });

    setAppState(prev => ({
      ...prev,
      selectedEntity: entityToUse,
      selectedNode: null,
      liveDataMode: true
    }));
  };

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

  const handleNodeClick = useCallback((nodeName) => {
    setAppState(prev => ({ ...prev, selectedNode: nodeName }));
  }, []);
  
  // Save transform state when switching entities
  const handleTransformChange = useCallback((entityName, transform) => {
    setEntityTransforms(prev => {
      const newMap = new Map(prev);
      newMap.set(entityName, transform);
      return newMap;
    });
  }, []);
  
  // Get saved transform for current entity
  const getCurrentTransform = useCallback(() => {
    return entityTransforms.get(appState.selectedEntity?.name) || null;
  }, [entityTransforms, appState.selectedEntity?.name]);

  const handleSidebarViewChange = useCallback((view) => {
    setAppState(prev => ({ 
      ...prev, 
      activeSidebarView: view,
      // Only update main content view when a sidebar is actually opened
      mainContentView: view || prev.mainContentView
    }));
  }, []);

  const handleHierarchyView = useCallback(() => {
    setAppState(prev => ({ 
      ...prev, 
      activeSidebarView: null,
      mainContentView: 'hierarchy'
    }));
  }, []);

  const handleSearch = useCallback(async (searchBody) => {
    setSearchState({ results: null, loading: true });
    
    try {
      // Use API Gateway URL instead of localhost
      const apiUrl = process.env.REACT_APP_API_URL || 'https://zitygaox8b.execute-api.eu-west-1.amazonaws.com/prod';
      const response = await fetch(`${apiUrl}/api/search`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(searchBody)
      });
      
      const responseText = await response.text();
      const jsonResponse = JSON.parse(responseText);
      
      setSearchState({ results: jsonResponse, loading: false });
      setIsConnected(response.ok);
    } catch (error) {
      console.error('Search error:', error);
      setSearchState({ results: null, loading: false });
      setIsConnected(false);
    }
  }, []);

  const handleAuthStateChange = useCallback((newAuthState) => {
    setAuthState(newAuthState);
  }, []);

  const handleRecordSelect = useCallback(async (record) => {
    try {
      // Fetch full record data using API Gateway
      const apiUrl = process.env.REACT_APP_API_URL || 'https://zitygaox8b.execute-api.eu-west-1.amazonaws.com/prod';
      const response = await fetch(`${apiUrl}/api/storage/${encodeURIComponent(record.id)}`);
      const fullRecord = await response.json();
      
      // Extract entity info from kind
      const kind = record.kind || record.type || '';
      const kindMatch = kind.match(/^[\w\-.]+:[\w\-.]+:([\w\-.]+):([0-9]+\.[0-9]+\.[0-9]+)$/);
      
      if (kindMatch) {
        const entityPart = kindMatch[1];
        const version = kindMatch[2];
        const base = entityPart.replace(/^(master-data--|work-product-component--|reference-data--)/, '');
        
        // Find matching entity using same strategy as handleFileSelect
        const matchingEntity = entities.find(entity => {
          const match = entity.name.toLowerCase() === base.toLowerCase() ||
                       entity.name.toLowerCase().includes(base.toLowerCase()) ||
                       base.toLowerCase().includes(entity.name.toLowerCase());
          return match;
        });
        
        const entityToUse = matchingEntity ? {
          ...matchingEntity,
          example: fullRecord,
          fileName: `${record.id.split(':').pop()}.json`
        } : {
          name: base,
          schema: null,
          example: fullRecord,
          pumlContent: null,
          fileName: `${record.id.split(':').pop()}.json`
        };
        
        setAppState(prev => ({
          ...prev,
          selectedEntity: entityToUse,
          selectedNode: null,
          liveDataMode: true,
          mainContentView: 'entities'
        }));
      }
    } catch (error) {
      console.error('Error loading record:', error);
    }
  }, [entities]);

  if (isLoadingEntities) {
    return (
      <div className="app">
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <div style={{ fontSize: '18px', color: '#666' }}>Loading OSDU Data Model...</div>
          <div style={{ fontSize: '14px', color: '#999' }}>This may take a moment for large datasets</div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="app">
        <ActivityBar 
          activeView={appState.activeSidebarView}
          onViewChange={handleSidebarViewChange}
          onHierarchyView={handleHierarchyView}
        />
        
        <Sidebar
          activeView={appState.activeSidebarView}
          entities={entities}
          selectedEntity={appState.selectedEntity}
          onEntitySelect={handleEntitySelect}
          onFileSelect={handleFileSelect}
          onSearch={handleSearch}
          onClose={() => setAppState(prev => ({ ...prev, activeSidebarView: null }))}
          onAuthStateChange={handleAuthStateChange}
        />
        
        <div className="main-container">
          <header className="header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <h1>Energy Data Insights - Explorer</h1>
                <p>EDI Data Platform - {isConnected ? 'connected' : 'not connected'}</p>
              </div>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <button
                  onClick={() => {
                    if (appState.liveDataMode) {
                      setAppState(prev => ({ 
                        ...prev, 
                        liveDataMode: false,
                        mainContentView: 'search'
                      }));
                    } else {
                      setAppState(prev => ({ ...prev, liveDataMode: true }));
                    }
                  }}
                  style={{
                    padding: '0.5rem 1rem',
                    background: appState.liveDataMode ? '#e74c3c' : '#95a5a6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  {appState.liveDataMode ? 'Back to Search' : 'Live Data'}
                </button>
                {appState.liveDataMode && <FileSelector onFileSelect={handleFileSelect} />}
              </div>
            </div>
          </header>
          
          <div className="main-content">
            <div className="content-area">
              {appState.mainContentView === 'search' ? (
                <>
                  <div className="diagram-header">Search Service</div>
                  <div className="diagram-container" style={{ flex: '1 1 auto', minHeight: 0 }}>
                    <SearchResults 
                      searchResponse={searchState.results}
                      loading={searchState.loading}
                      onRecordSelect={handleRecordSelect}
                    />
                  </div>
                </>
              ) : appState.mainContentView === 'serverless' ? (
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
              ) : appState.mainContentView === 'hierarchy' ? (
                <>
                  <div className="diagram-header">OSDU Data Model Hierarchy</div>
                  <div className="diagram-container" style={{ flex: '1 1 auto', minHeight: 0 }}>
                    <OSDUHierarchyViewer />
                  </div>
                </>
              ) : (
                <>
                  <div className="diagram-header">Data Model - E-R Diagram</div>
                  <div className="diagram-container">
                    <DiagramViewer
                      key={(appState.selectedEntity?.name && appState.selectedEntity?.version) ? `${appState.selectedEntity.name}:${appState.selectedEntity.version}` : (appState.selectedEntity?.name || 'default')}
                      pumlContent={appState.selectedEntity?.pumlContent}
                      onNodeClick={handleNodeClick}
                      entityName={appState.selectedEntity?.name}
                      entityVersion={appState.selectedEntity?.version}
                      kind={(appState.selectedEntity?.schema?.kind) || (appState.selectedEntity?.example?.kind)}
                      onTransformChange={handleTransformChange}
                      initialTransform={getCurrentTransform()}
                      exampleData={appState.selectedEntity?.example}
                      fileName={appState.selectedEntity?.fileName}
                      enableDataFading={appState.liveDataMode}
                    />
                  </div>
                  
                  <ResizeHandle />
                  
                  <div className="diagram-header">Data & Properties</div>
                  <PropertiesPanel
                    schema={appState.selectedEntity?.schema}
                    example={appState.selectedEntity?.example}
                    selectedNode={appState.selectedNode}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;

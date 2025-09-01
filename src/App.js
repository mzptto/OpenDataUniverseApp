import React, { useState, useCallback, useEffect } from 'react';
import EntityBrowser from './components/EntityBrowser';
import DiagramViewer from './components/DiagramViewer';
import PropertiesPanel from './components/PropertiesPanel';
import FileSelector from './components/FileSelector';
import ErrorBoundary from './components/ErrorBoundary';
import { DataLoader } from './utils/dataLoader';
import { sampleEntities } from './data/sampleData';
import { Menu } from 'lucide-react';

function App() {
  const [entities, setEntities] = useState(sampleEntities);
  const [isLoadingEntities, setIsLoadingEntities] = useState(true);
  const [appState, setAppState] = useState({
    selectedEntity: null,
    selectedNode: null,
    sidebarOpen: false,
    liveDataMode: false
  });
  
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
      selectedNode: null
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

        // If not found (due to chunked loading), search full data set
        if (!matchingEntity) {
          try {
            const { osduEntities } = await import('./data/osduEntities.js');
            matchingEntity = osduEntities.find(e => e.name.toLowerCase() === base && e.version === version);
            console.log('Match in full dataset:', !!matchingEntity);
          } catch (e) {
            console.warn('Could not import full osduEntities for exact match', e);
          }
        }
      }
    }
    
    // Extract proper entity name for display
    const extractedEntityName = extractEntityNameFromKind(fileData.schema, fileData.name);
    
    // Use the matching entity from osduEntities with loaded data
    const entityToUse = matchingEntity ? {
      ...matchingEntity, // Keep schema, pumlContent, etc. from osduEntities
      example: fileData.schema // Replace example with loaded data
    } : {
      name: extractedEntityName,
      schema: null,
      example: fileData.schema,
      pumlContent: null
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
        <header className="header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={() => setAppState(prev => ({ ...prev, sidebarOpen: !prev.sidebarOpen }))}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                padding: '0.5rem'
              }}
            >
              <Menu size={24} />
            </button>
            <div style={{ flex: 1 }}>
              <h1>OSDU Data Model Explorer</h1>
              <p>Interactive visualization of OSDU schema relationships and data structures ({entities.length} entities loaded)</p>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <button
                onClick={() => setAppState(prev => ({ ...prev, liveDataMode: !prev.liveDataMode }))}
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
                {appState.liveDataMode ? 'Exit Live Data' : 'Live Data'}
              </button>
              {appState.liveDataMode && <FileSelector onFileSelect={handleFileSelect} />}
            </div>
          </div>
        </header>
      
      <div className="main-content">
        {appState.sidebarOpen && <div className="sidebar-overlay open" onClick={() => setAppState(prev => ({ ...prev, sidebarOpen: false }))} />}
        
        <EntityBrowser
          entities={entities}
          selectedEntity={appState.selectedEntity}
          onEntitySelect={handleEntitySelect}
          isOpen={appState.sidebarOpen}
          onClose={() => setAppState(prev => ({ ...prev, sidebarOpen: false }))}
        />
        
        <div className="content-area">
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
            />
          </div>
          
          <ResizeHandle />
          
          <div className="diagram-header">Data & Properties</div>
          <PropertiesPanel
            schema={appState.selectedEntity?.schema}
            example={appState.selectedEntity?.example}
            selectedNode={appState.selectedNode}
          />
        </div>
      </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;

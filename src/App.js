import React, { useState, useCallback } from 'react';
import ActivityBar from './components/ActivityBar';
import Sidebar from './components/Sidebar';
import ErrorBoundary from './components/ErrorBoundary';
import AppHeader from './components/layout/AppHeader';
import MainContent from './components/layout/MainContent';

// Import custom hooks
import { useAppState } from './hooks/useAppState';
import { useEntityData } from './hooks/useEntityData';
import { useSearchState } from './hooks/useSearchState';

function App() {
  // Use custom hooks for state management
  const {
    appState,
    setAppState,
    handleEntitySelect,
    handleNodeClick,
    handleSidebarViewChange,
    handleHierarchyView,
    handleTransformChange,
    getCurrentTransform
  } = useAppState();

  const {
    entities,
    isLoadingEntities,
    findMatchingEntity,
    createEntityFromFile
  } = useEntityData();

  const {
    searchState,
    isConnected,
    handleSearch,
    handleRecordSelect
  } = useSearchState();

  // Auth state (will be moved to separate hook in Phase 3)
  const [authState, setAuthState] = useState({ 
    user: null, 
    signOut: null, 
    isAuthenticated: false 
  });

  const handleFileSelect = useCallback(async (fileData) => {
    const matchingEntity = findMatchingEntity(fileData);
    const entityToUse = createEntityFromFile(fileData, matchingEntity);

    setAppState(prev => ({
      ...prev,
      selectedEntity: entityToUse,
      selectedNode: null,
      liveDataMode: true
    }));
  }, [findMatchingEntity, createEntityFromFile, setAppState]);

  const handleLiveDataToggle = useCallback(() => {
    if (appState.liveDataMode) {
      setAppState(prev => ({ 
        ...prev, 
        liveDataMode: false,
        mainContentView: 'search'
      }));
    } else {
      setAppState(prev => ({ ...prev, liveDataMode: true }));
    }
  }, [appState.liveDataMode, setAppState]);

  const handleAuthStateChange = useCallback((newAuthState) => {
    setAuthState(newAuthState);
  }, []);

  const handleSearchWithViewSwitch = useCallback(async (searchBody) => {
    // Switch to search view when search is executed
    setAppState(prev => ({
      ...prev,
      mainContentView: 'search'
    }));
    
    // Execute the actual search
    await handleSearch(searchBody);
  }, [handleSearch, setAppState]);

  const handleRecordSelectWithState = useCallback(async (record) => {
    await handleRecordSelect(record, entities, (entity, liveDataMode, mainContentView) => {
      setAppState(prev => ({
        ...prev,
        selectedEntity: entity,
        selectedNode: null,
        liveDataMode,
        mainContentView
      }));
    });
  }, [handleRecordSelect, entities, setAppState]);

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
          onSearch={handleSearchWithViewSwitch}
          onClose={() => setAppState(prev => ({ ...prev, activeSidebarView: null }))}
          onAuthStateChange={handleAuthStateChange}
        />
        
        <div className="main-container">
          <AppHeader
            isConnected={isConnected}
            liveDataMode={appState.liveDataMode}
            onLiveDataToggle={handleLiveDataToggle}
            onFileSelect={handleFileSelect}
          />
          
          <MainContent
            mainContentView={appState.mainContentView}
            searchState={searchState}
            onRecordSelect={handleRecordSelectWithState}
            authState={authState}
            selectedEntity={appState.selectedEntity}
            onNodeClick={handleNodeClick}
            onTransformChange={handleTransformChange}
            getCurrentTransform={getCurrentTransform}
            liveDataMode={appState.liveDataMode}
          />
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;

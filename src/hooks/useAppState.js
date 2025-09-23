import { useState, useCallback } from 'react';

export const useAppState = () => {
  const [appState, setAppState] = useState({
    selectedEntity: null,
    selectedNode: null,
    activeSidebarView: null,
    liveDataMode: false,
    mainContentView: 'hierarchy' // Default to hierarchy view
  });

  const [entityTransforms, setEntityTransforms] = useState(new Map());

  const handleEntitySelect = useCallback((entity) => {
    setAppState(prev => ({
      ...prev,
      selectedEntity: entity,
      selectedNode: null,
      liveDataMode: false
    }));
  }, []);

  const handleNodeClick = useCallback((nodeName) => {
    setAppState(prev => ({ ...prev, selectedNode: nodeName }));
  }, []);

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

  const handleTransformChange = useCallback((entityName, transform) => {
    setEntityTransforms(prev => {
      const newMap = new Map(prev);
      newMap.set(entityName, transform);
      return newMap;
    });
  }, []);

  const getCurrentTransform = useCallback(() => {
    return entityTransforms.get(appState.selectedEntity?.name) || null;
  }, [entityTransforms, appState.selectedEntity?.name]);

  return {
    appState,
    setAppState,
    handleEntitySelect,
    handleNodeClick,
    handleSidebarViewChange,
    handleHierarchyView,
    handleTransformChange,
    getCurrentTransform
  };
};

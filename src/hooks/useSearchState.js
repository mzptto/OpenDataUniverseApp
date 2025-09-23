import { useState, useCallback } from 'react';

export const useSearchState = () => {
  const [searchState, setSearchState] = useState({
    results: null,
    loading: false
  });
  const [isConnected, setIsConnected] = useState(false);

  const handleSearch = useCallback(async (searchBody) => {
    setSearchState({ results: null, loading: true });
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/search`, {
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

  const handleRecordSelect = useCallback(async (record, entities, onEntitySelect) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/storage/${encodeURIComponent(record.id)}`);
      const fullRecord = await response.json();
      
      // Extract entity info from kind
      const kind = record.kind || record.type || '';
      const kindMatch = kind.match(/^[\w\-.]+:[\w\-.]+:([\w\-.]+):([0-9]+\.[0-9]+\.[0-9]+)$/);
      
      if (kindMatch) {
        const entityPart = kindMatch[1];
        const version = kindMatch[2];
        const base = entityPart.replace(/^(master-data--|work-product-component--|reference-data--)/, '');
        
        // Find matching entity using exact matching (same as EntityBrowser)
        const matchingEntity = entities.find(entity => 
          entity.name.toLowerCase() === base.toLowerCase() && entity.version === version
        );
        
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
        
        // Call the entity selection handler
        onEntitySelect(entityToUse, true, 'entities'); // entity, liveDataMode, mainContentView
      }
    } catch (error) {
      console.error('Error loading record:', error);
    }
  }, []);

  return {
    searchState,
    isConnected,
    handleSearch,
    handleRecordSelect
  };
};

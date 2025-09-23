import { useState, useEffect, useCallback } from 'react';
import { DataLoader } from '../utils/dataLoader';
import { sampleEntities } from '../data/sampleData';

export const useEntityData = () => {
  const [entities, setEntities] = useState(sampleEntities);
  const [isLoadingEntities, setIsLoadingEntities] = useState(true);

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
          });
        } else {
          setEntities(sampleEntities);
        }
      } catch (error) {
        console.error('Failed to load entities:', error);
        setEntities(sampleEntities);
      } finally {
        setIsLoadingEntities(false);
      }
    };
    
    loadEntities();
  }, []);

  const extractEntityNameFromKind = useCallback((data, fileName) => {
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
  }, []);

  const findMatchingEntity = useCallback((fileData) => {
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

    return matchingEntity;
  }, [entities]);

  const createEntityFromFile = useCallback((fileData, matchingEntity) => {
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

    return entityToUse;
  }, [extractEntityNameFromKind]);

  return {
    entities,
    isLoadingEntities,
    findMatchingEntity,
    createEntityFromFile,
    extractEntityNameFromKind
  };
};

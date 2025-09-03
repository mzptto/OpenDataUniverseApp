// Utility functions to load and process OSDU data files

/**
 * Load and parse OSDU entity data from the file system
 * This would be used to integrate with your actual OSDU data folders
 */

export const parseEntityFromFiles = (pumlContent, schemaContent, exampleContent, entityName, version) => {
  return {
    id: `${entityName.toLowerCase()}-${version}`,
    name: entityName,
    type: detectEntityType(schemaContent),
    version: version,
    pumlContent: pumlContent,
    schema: JSON.parse(schemaContent),
    example: JSON.parse(exampleContent)
  };
};

export const detectEntityType = (schemaContent) => {
  try {
    const schema = JSON.parse(schemaContent);
    const id = schema.$id || '';
    
    if (id.includes('master-data')) return 'master-data';
    if (id.includes('work-product-component')) return 'work-product-component';
    if (id.includes('reference-data')) return 'reference-data';
    if (id.includes('abstract')) return 'abstract';
    if (id.includes('dataset')) return 'dataset';
    
    return 'unknown';
  } catch (e) {
    return 'unknown';
  }
};

export const extractRelationshipsFromSchema = (schema) => {
  const relationships = [];
  
  const findRelationships = (obj, path = '') => {
    if (typeof obj !== 'object' || obj === null) return;
    
    for (const [key, value] of Object.entries(obj)) {
      if (key === 'x-osdu-relationship' && Array.isArray(value)) {
        value.forEach(rel => {
          relationships.push({
            from: path,
            to: `${rel.GroupType}--${rel.EntityType}`,
            type: 'reference'
          });
        });
      }
      
      if (typeof value === 'object') {
        findRelationships(value, path ? `${path}.${key}` : key);
      }
    }
  };
  
  findRelationships(schema);
  return relationships;
};

export const generateDiagramFromSchema = (schema, entityName) => {
  const relationships = extractRelationshipsFromSchema(schema);
  const entityType = detectEntityType(JSON.stringify(schema));
  
  let puml = '@startuml\\n';
  puml += 'hide methods\\n';
  puml += 'skinparam class {\\n';
  puml += '    BackgroundColor<<master-data>> #ffa080\\n';
  puml += '    BackgroundColor<<work-product-component>> #f9d949\\n';
  puml += '    BackgroundColor<<reference-data>> #79dfdf\\n';
  puml += '    BackgroundColor<<abstract>> #97ccf6\\n';
  puml += '}\\n\\n';
  
  // Add main entity
  puml += `class "${entityName}" as ${entityName} <<${entityType}>>\\n`;
  
  // Add related entities
  const relatedEntities = new Set();
  relationships.forEach(rel => {
    const [groupType, entityType] = rel.to.split('--');
    relatedEntities.add({ name: entityType, type: groupType });
  });
  
  relatedEntities.forEach(entity => {
    puml += `class "${entity.name}" as ${entity.name} <<${entity.type}>>\\n`;
  });
  
  puml += '\\n';
  
  // Add relationships
  relationships.forEach(rel => {
    const [, targetEntity] = rel.to.split('--');
    puml += `${entityName} --> ${targetEntity}\\n`;
  });
  
  puml += '@enduml';
  
  return puml;
};

// Example usage for loading from your OSDU folders:
/*
export const loadOsduEntitiesFromDisk = async (basePath) => {
  const entities = [];
  
  // This would read from your actual file system
  // const pumlFiles = await fs.readdir(`${basePath}/E-R/_diagrams/master-data/`);
  // const schemaFiles = await fs.readdir(`${basePath}/Generated/master-data/`);
  // const exampleFiles = await fs.readdir(`${basePath}/Examples/master-data/`);
  
  // Match files by entity name and version
  // for (const pumlFile of pumlFiles) {
  //   const match = pumlFile.match(/(\w+)\.(\d+\.\d+\.\d+)\.puml$/);
  //   if (match) {
  //     const [, entityName, version] = match;
  //     
  //     const pumlContent = await fs.readFile(`${basePath}/E-R/_diagrams/master-data/${pumlFile}`, 'utf8');
  //     const schemaContent = await fs.readFile(`${basePath}/Generated/master-data/${entityName}.${version}.json`, 'utf8');
  //     const exampleContent = await fs.readFile(`${basePath}/Examples/master-data/${entityName}.${version}.json`, 'utf8');
  //     
  //     entities.push(parseEntityFromFiles(pumlContent, schemaContent, exampleContent, entityName, version));
  //   }
  // }
  
  return entities;
};
*/
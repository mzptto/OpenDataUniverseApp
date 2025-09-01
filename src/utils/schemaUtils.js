export class SchemaUtils {
  static resolveSchemaProperties(schemaData) {
    if (!schemaData) return {};
    
    let resolvedProperties = {};
    
    // Handle allOf structure
    if (schemaData.allOf) {
      for (const item of schemaData.allOf) {
        if (item.properties) {
          resolvedProperties = { ...resolvedProperties, ...item.properties };
        }
        // For $ref items, we'll add some common OSDU patterns
        if (item.$ref) {
          const refName = item.$ref.split('/').pop().replace('.json', '');
          const commonProperties = this.getCommonOSDUProperties(refName);
          resolvedProperties = { ...resolvedProperties, ...commonProperties };
        }
      }
    }
    
    // Handle direct properties
    if (schemaData.properties) {
      resolvedProperties = { ...resolvedProperties, ...schemaData.properties };
    }
    
    return resolvedProperties;
  }

  static getCommonOSDUProperties(refName) {
    // For now, return empty object since we can't resolve $ref links
    // In a full implementation, this would load and parse the referenced schema files
    return {};
  }

  static getNodeProperties(schema, nodeName) {
    if (!schema?.properties?.data?.allOf) return null;
    
    // Search through schema for node properties
    for (const schemaSection of schema.properties.data.allOf) {
      if (schemaSection.properties) {
        for (const [key, value] of Object.entries(schemaSection.properties)) {
          if (key === nodeName || key.includes(nodeName)) {
            return { [key]: value };
          }
        }
      }
    }
    return null;
  }

  static getNodeExampleData(example, nodeName) {
    if (!example?.data) return null;
    
    // Search through example data for matching node
    const searchInObject = (obj, searchKey, depth = 0, maxDepth = 10) => {
      if (depth > maxDepth) return null;
      
      for (const [key, value] of Object.entries(obj)) {
        if (key === searchKey || key.includes(searchKey)) {
          return { [key]: value };
        }
        if (typeof value === 'object' && value !== null) {
          const found = searchInObject(value, searchKey, depth + 1, maxDepth);
          if (found) return found;
        }
      }
      return null;
    };
    
    return searchInObject(example.data, nodeName);
  }
}
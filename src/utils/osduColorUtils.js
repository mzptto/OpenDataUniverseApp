export class OSDUColors {
  static getDataTypeColor(key, schemaProperty, value) {
    // Check if value contains OSDU patterns (most specific first)
    if (typeof value === 'string') {
      if (value.includes('reference-data--')) {
        return '#79dfdf'; // reference-data (cyan)
      }
      if (value.includes('master-data--')) {
        return '#ffa080'; // master-data (orange)
      }
      if (value.includes('work-product-component--')) {
        return '#f9d949'; // work-product-component (yellow)
      }
      if (value.includes('dataset--')) {
        return '#ddddff'; // dataset (light blue)
      }
    }
    
    // Check schema-based detection
    if (this.isReferenceField(schemaProperty)) {
      return '#79dfdf'; // reference-data
    }
    if (schemaProperty?.$ref || schemaProperty?.type === 'object') {
      return '#97ccf6'; // abstract
    }
    if (schemaProperty?.type === 'array') {
      return '#f1f1f1'; // nested array
    }
    
    // For string/number values without OSDU patterns, use dark grey
    if (schemaProperty?.type === 'string' || schemaProperty?.type === 'number' || schemaProperty?.type === 'integer' || 
        (typeof value === 'string' && !schemaProperty?.type) || typeof value === 'number') {
      return '#666666'; // dark grey
    }
    
    return '#f9d949'; // work-product-component (default)
  }

  static getValueTypeColor(value, fieldType) {
    if (fieldType === 'boolean') return '#ae81ff'; // purple
    if (fieldType === 'number' || fieldType === 'integer') return '#fd971f'; // orange
    if (fieldType === 'object') return '#66d9ef'; // blue
    if (fieldType === 'array') return '#f4bf75'; // yellow
    return '#a6e22e'; // green (string default)
  }

  static isReferenceField(schemaProperty) {
    if (!schemaProperty) return false;
    
    // Check various ways a field might indicate reference data usage
    const patterns = [
      schemaProperty.pattern,
      schemaProperty.$ref,
      schemaProperty.description
    ];
    
    for (const pattern of patterns) {
      if (pattern && typeof pattern === 'string') {
        if (pattern.includes('reference-data--') || 
            pattern.includes('reference-data:') ||
            pattern.toLowerCase().includes('reference')) {
          return true;
        }
      }
    }
    
    return false;
  }
}
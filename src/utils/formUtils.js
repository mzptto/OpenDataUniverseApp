export class FormUtils {
  static formatFieldName(fieldName) {
    const formatted = fieldName
      .replace(/ID/g, '') // Remove all instances of ID
      .replace(/Id/g, '') // Remove all instances of Id
      .replace(/([A-Z])/g, ' $1') // Add space before capital letters
      .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
      .trim();
    
    return formatted;
  }

  static isReadOnlyField(key) {
    return key.toLowerCase().includes('time') || 
           key.toLowerCase().includes('user') || 
           ['id', 'kind', 'version'].includes(key);
  }

  static isReferenceDataField(value) {
    return typeof value === 'string' && value.includes('reference-data--');
  }
}
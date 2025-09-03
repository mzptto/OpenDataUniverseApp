// ReferenceDataManager class to handle reference data operations
export class ReferenceDataManager {
  static referenceData = null;
  
  static async loadReferenceData() {
    if (!this.referenceData) {
      try {
        const module = await import('./referenceData.js');
        this.referenceData = module.referenceData || {};
      } catch (error) {
        console.warn('Failed to load reference data:', error);
        this.referenceData = {};
      }
    }
    return this.referenceData;
  }
  
  static async getReferenceValues(type) {
    const data = await this.loadReferenceData();
    return data[type] || [];
  }
  
  static getAllReferenceTypes() {
    return Object.keys(this.referenceData || {});
  }
  
  static async getReferenceValuesForProperty(schemaProperty) {
    if (!schemaProperty) return null;
    
    // Check various ways a field might indicate reference data usage
    const patterns = [
      schemaProperty.pattern,
      schemaProperty.$ref,
      schemaProperty.description
    ];
    
    for (const pattern of patterns) {
      if (pattern && typeof pattern === 'string') {
        // Extract reference type from namespace pattern
        const match = pattern.match(/reference-data--([^:]+)/);
        if (match) {
          const refType = match[1];
          return await this.getReferenceValues(refType);
        }
      }
    }
    
    return null;
  }
  
  static async getReferenceValuesByFieldName(fieldName) {
    // Map common field name patterns to reference data types
    const fieldMappings = {
      'GeoPoliticalEntityID': 'GeoPoliticalEntityType',
      'BasinID': 'BasinType',
      'PlayID': 'PlayType',
      'ProspectID': 'ProspectType',
      'WellLogClassID': 'WellLogClass',
      'WellLogTypeID': 'LogType',
      'LogTypeID': 'LogType',
      'VerticalMeasurementTypeID': 'VerticalMeasurementType',
      'VerticalMeasurementPathID': 'VerticalMeasurementPath',
      'VerticalMeasurementSourceID': 'VerticalMeasurementSource',
      'VerticalMeasurementUnitOfMeasureID': 'UnitOfMeasure',
      'DepthUnit': 'UnitOfMeasure',
      'CurveUnit': 'UnitOfMeasure',
      'LogCurveBusinessValueID': 'LogCurveBusinessValue',
      'LogCurveMainFamilyID': 'LogCurveMainFamily',
      'LogCurveFamilyID': 'LogCurveFamily',
      'CurveSampleTypeID': 'CurveSampleType',
      'SamplingDomainTypeID': 'WellLogSamplingDomainType'
    };
    
    // Check for exact field name match
    if (fieldMappings[fieldName]) {
      return await this.getReferenceValues(fieldMappings[fieldName]);
    }
    
    return null;
  }
}
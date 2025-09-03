import React, { useState, useCallback, useEffect } from 'react';
import { ReferenceDataManager } from '../data/ReferenceDataManager';
import RecordInfoPanel from './RecordInfoPanel';

// Reference Data Dropdown Component
const ReferenceDataDropdown = ({ value, style }) => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        // Extract reference type directly from the value
        if (typeof value === 'string' && value.includes('reference-data--')) {
          const match = value.match(/reference-data--([^:]+)/);
          if (match) {
            const refType = match[1];
            console.log('Loading reference data for type:', refType);
            const referenceValues = await ReferenceDataManager.getReferenceValues(refType);
            console.log('Loaded options:', referenceValues?.length || 0);
            setOptions(referenceValues || []);
          }
        }
      } catch (error) {
        console.error('Failed to load reference data:', error);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadOptions();
  }, [value]);

  if (loading) {
    return (
      <select disabled style={style}>
        <option>Loading...</option>
      </select>
    );
  }

  if (options.length === 0) {
    return (
      <input
        type="text"
        value={value || ''}
        readOnly
        style={style}
      />
    );
  }

  return (
    <select value={value || ''} onChange={() => {}} style={style}>
      <option value="">{value ? value : 'Select...'}</option>
      {options.map((option) => (
        <option key={option.id} value={option.id}>
          {option.name} ({option.code})
        </option>
      ))}
    </select>
  );
};

const PropertiesPanel = ({ schema, example, selectedNode }) => {
  const [activeTab, setActiveTab] = useState('business');

  const handleRecordTabClick = useCallback(() => setActiveTab('record'), []);
  const handleBusinessTabClick = useCallback(() => setActiveTab('business'), []);
  const handleQualityTabClick = useCallback(() => setActiveTab('quality'), []);
  const handleActivityTabClick = useCallback(() => setActiveTab('activity'), []);
  const handleCollectionTabClick = useCallback(() => setActiveTab('collection'), []);

  const getNodeProperties = (nodeName) => {
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
  };

  const getNodeExampleData = (nodeName) => {
    if (!example?.data) return null;
    
    // Search through example data for matching node
    const searchInObject = (obj, searchKey) => {
      for (const [key, value] of Object.entries(obj)) {
        if (key === searchKey || key.includes(searchKey)) {
          return { [key]: value };
        }
        if (typeof value === 'object' && value !== null) {
          const found = searchInObject(value, searchKey);
          if (found) return found;
        }
      }
      return null;
    };
    
    return searchInObject(example.data, nodeName);
  };

  const resolveSchemaProperties = (schemaData) => {
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
          const commonProperties = getCommonOSDUProperties(refName);
          resolvedProperties = { ...resolvedProperties, ...commonProperties };
        }
      }
    }
    
    // Handle direct properties
    if (schemaData.properties) {
      resolvedProperties = { ...resolvedProperties, ...schemaData.properties };
    }
    
    return resolvedProperties;
  };

  const getCommonOSDUProperties = (refName) => {
    // For now, return empty object since we can't resolve $ref links
    // In a full implementation, this would load and parse the referenced schema files
    return {};
  };

  const formatFieldName = (fieldName) => {
    const formatted = fieldName
      .replace(/ID/g, '') // Remove all instances of ID
      .replace(/Id/g, '') // Remove all instances of Id
      .replace(/([A-Z])/g, ' $1') // Add space before capital letters
      .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
      .trim();
    
    return formatted;
  };

  // OSDU Data Model Color Utilities
  const getDataTypeColor = (key, schemaProperty, value) => {
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
    if (isReferenceField(schemaProperty)) {
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
  };

  const getValueTypeColor = (value, fieldType) => {
    if (fieldType === 'boolean') return '#ae81ff'; // purple
    if (fieldType === 'number' || fieldType === 'integer') return '#fd971f'; // orange
    if (fieldType === 'object') return '#66d9ef'; // blue
    if (fieldType === 'array') return '#f4bf75'; // yellow
    return '#a6e22e'; // green (string default)
  };

  const isReferenceField = (schemaProperty) => {
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
    
    // Check if the field name suggests it's a reference
    return false;
  };

  const renderFormField = (key, value, schemaProperty) => {
    const isReadOnly = key.toLowerCase().includes('time') || key.toLowerCase().includes('user') || ['id', 'kind', 'version'].includes(key);
    const fieldType = schemaProperty?.type || 'string';
    const borderColor = getDataTypeColor(key, schemaProperty, value);
    
    const baseStyle = {
      width: '100%',
      padding: '0.5rem',
      border: `3px solid ${borderColor}`,
      borderRadius: '4px',
      backgroundColor: '#ffffff',
      fontWeight: '500'
    };
    
    // Check if this is a reference data field
    const isReferenceDataField = (typeof value === 'string' && value.includes('reference-data--'));
    
    if (isReferenceDataField) {
      console.log('Reference data field detected:', key, value);
    }
    
    if (isReadOnly) {
      return (
        <input
          type="text"
          value={value || ''}
          disabled
          style={{
            ...baseStyle,
            opacity: 0.7
          }}
        />
      );
    }

    if (fieldType === 'boolean') {
      return (
        <select
          value={value?.toString() || 'false'}
          disabled
          style={baseStyle}
        >
          <option value="true">True</option>
          <option value="false">False</option>
        </select>
      );
    }
    
    if (fieldType === 'number' || fieldType === 'integer') {
      return (
        <input
          type="number"
          value={value || ''}
          readOnly
          style={baseStyle}
        />
      );
    }
    
    // Render reference data dropdown
    if (isReferenceDataField) {
      return <ReferenceDataDropdown 
        value={value} 
        style={baseStyle} 
      />;
    }
    
    return (
      <input
        type="text"
        value={value || ''}
        readOnly
        style={baseStyle}
      />
    );
  };

  const renderFormView = (data, schemaProps) => {
    if (!data || typeof data !== 'object') return null;
    
    return (
      <div style={{ display: 'grid', gap: '1rem' }}>
        {Object.entries(data).map(([key, value]) => {
          if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            return (
              <div key={key} style={{ border: '2px solid #ccc', padding: '1rem', borderRadius: '6px', backgroundColor: '#f8f9fa' }}>
                <h5 style={{ margin: '0 0 0.5rem 0', color: '#2c3e50' }}>{key}</h5>
                {renderFormView(value, schemaProps?.[key])}
              </div>
            );
          }
          
          if (Array.isArray(value)) {
            return (
              <div key={key} style={{ border: '2px solid #ccc', padding: '1rem', borderRadius: '6px', backgroundColor: '#f8f9fa' }}>
                <h5 style={{ margin: '0 0 1rem 0', color: '#2c3e50' }}>{key} ({value.length} items)</h5>
                {value.map((item, index) => (
                  <div key={index} style={{ 
                    border: '2px solid #bbb', 
                    padding: '1rem', 
                    marginBottom: '1rem', 
                    borderRadius: '6px',
                    backgroundColor: '#ffffff'
                  }}>
                    <h6 style={{ margin: '0 0 0.5rem 0', color: '#34495e' }}>
                      {key.slice(0, -1)} {index + 1}
                    </h6>
                    {typeof item === 'object' && item !== null ? (
                      renderFormView(item, schemaProps?.[key]?.items?.properties)
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '0.5rem', alignItems: 'center' }}>
                        <label style={{ fontWeight: 'bold', color: '#2c3e50' }}>Value:</label>
                        <input
                          type="text"
                          value={item || ''}
                          readOnly
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            border: '1px solid #ddd',
                            borderRadius: '4px'
                          }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            );
          }
          
          return (
            <div key={key} style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '0.5rem', alignItems: 'center' }}>
              <label style={{ fontWeight: 'bold', color: '#2c3e50' }}>
                {formatFieldName(key)}:
              </label>
              {renderFormField(key, value, schemaProps?.[key]?.properties || schemaProps?.[key])}
            </div>
          );
        })}
      </div>
    );
  };

  const renderContent = () => {
    if (selectedNode) {
      const nodeProps = getNodeProperties(selectedNode);
      const nodeExample = getNodeExampleData(selectedNode);
      
      return (
        <div>
          <h4 style={{ marginBottom: '1rem', color: '#2c3e50' }}>
            Node: {selectedNode}
          </h4>
          
          <div style={{ marginBottom: '1rem' }}>
            <button
              onClick={handleRecordTabClick}
              style={{
                padding: '0.5rem 1rem',
                marginRight: '0.5rem',
                border: 'none',
                background: activeTab === 'record' ? '#3498db' : '#ecf0f1',
                color: activeTab === 'record' ? 'white' : '#2c3e50',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Record Infromation
            </button>
            <button
              onClick={handleBusinessTabClick}
              style={{
                padding: '0.5rem 1rem',
                marginRight: '0.5rem',
                border: 'none',
                background: activeTab === 'business' ? '#3498db' : '#ecf0f1',
                color: activeTab === 'business' ? 'white' : '#2c3e50',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Business Data
            </button>
            <button
              onClick={handleQualityTabClick}
              style={{
                padding: '0.5rem 1rem',
                marginRight: '0.5rem',
                border: 'none',
                background: activeTab === 'quality' ? '#3498db' : '#ecf0f1',
                color: activeTab === 'quality' ? 'white' : '#2c3e50',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Data Quality
            </button>
            <button
              onClick={handleActivityTabClick}
              style={{
                padding: '0.5rem 1rem',
                marginRight: '0.5rem',
                border: 'none',
                background: activeTab === 'activity' ? '#3498db' : '#ecf0f1',
                color: activeTab === 'activity' ? 'white' : '#2c3e50',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Activity
            </button>
            <button
              onClick={handleCollectionTabClick}
              style={{
                padding: '0.5rem 1rem',
                marginRight: '0.5rem',
                border: 'none',
                background: activeTab === 'collection' ? '#3498db' : '#ecf0f1',
                color: activeTab === 'collection' ? 'white' : '#2c3e50',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Data Collection
            </button>
          </div>
         
          {activeTab === 'business' && nodeExample && (
            renderFormView(nodeExample, nodeProps)
          )}
          
          {activeTab === 'record' && (
            <RecordInfoPanel example={example} />
          )}
          {activeTab === 'quality' && (
            <div style={{ color: '#7f8c8d' }}>Data Quality (placeholder)</div>
          )}
          {activeTab === 'activity' && (
            <div style={{ color: '#7f8c8d' }}>Activity (placeholder)</div>
          )}
          {activeTab === 'collection' && (
            <div style={{ color: '#7f8c8d' }}>Data Collection (placeholder)</div>
          )}
        </div>
      );
    }

    return (
      <div>
        <div style={{ marginBottom: '1rem' }}>
          <button
            onClick={handleRecordTabClick}
            style={{
              padding: '0.5rem 1rem',
              marginRight: '0.5rem',
              border: 'none',
              background: activeTab === 'record' ? '#3498db' : '#ecf0f1',
              color: activeTab === 'record' ? 'white' : '#2c3e50',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Record Infromation
          </button>
          <button
            onClick={handleBusinessTabClick}
            style={{
              padding: '0.5rem 1rem',
              marginRight: '0.5rem',
              border: 'none',
              background: activeTab === 'business' ? '#3498db' : '#ecf0f1',
              color: activeTab === 'business' ? 'white' : '#2c3e50',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Business Data
          </button>
          <button
            onClick={handleQualityTabClick}
            style={{
              padding: '0.5rem 1rem',
              marginRight: '0.5rem',
              border: 'none',
              background: activeTab === 'quality' ? '#3498db' : '#ecf0f1',
              color: activeTab === 'quality' ? 'white' : '#2c3e50',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Data Quality
          </button>
          <button
            onClick={handleActivityTabClick}
            style={{
              padding: '0.5rem 1rem',
              marginRight: '0.5rem',
              border: 'none',
              background: activeTab === 'activity' ? '#3498db' : '#ecf0f1',
              color: activeTab === 'activity' ? 'white' : '#2c3e50',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Activity
          </button>
          <button
            onClick={handleCollectionTabClick}
            style={{
              padding: '0.5rem 1rem',
              marginRight: '0.5rem',
              border: 'none',
              background: activeTab === 'collection' ? '#3498db' : '#ecf0f1',
              color: activeTab === 'collection' ? 'white' : '#2c3e50',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Data Collection
          </button>
        </div>
        
        {activeTab === 'business' && example && (() => {
          // For loaded OSDU data, use the 'data' property if it exists
          const dataToRender = example.data ? example.data : example;
          return renderFormView(dataToRender, resolveSchemaProperties(schema?.properties?.data));
        })()}
        
        {activeTab === 'record' && (
          <RecordInfoPanel example={example} />
        )}
        {activeTab === 'quality' && (
          <div style={{ color: '#7f8c8d' }}>Data Quality (placeholder)</div>
        )}
        {activeTab === 'activity' && (
          <div style={{ color: '#7f8c8d' }}>Activity (placeholder)</div>
        )}
        {activeTab === 'collection' && (
          <div style={{ color: '#7f8c8d' }}>Data Collection (placeholder)</div>
        )}
      </div>
    );
  };

  return (
    <div
      className="properties-panel"
      style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}
    >
      <h3 style={{ marginBottom: '1rem', color: '#2c3e50' }}>
        Properties & Data
      </h3>
      <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
        {renderContent()}
      </div>
    </div>
  );
};

export default PropertiesPanel;

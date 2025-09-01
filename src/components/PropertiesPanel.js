import React, { useState, useCallback } from 'react';
import { JSONTree } from 'react-json-tree';
import { ReferenceDataManager } from '../data/ReferenceDataManager';
import ReferenceDataInfo from './ReferenceDataInfo';

const PropertiesPanel = ({ schema, example, selectedNode }) => {
  const [activeTab, setActiveTab] = useState('form');

  const handleFormTabClick = useCallback(() => setActiveTab('form'), []);
  const handleSchemaTabClick = useCallback(() => setActiveTab('schema'), []);

  const theme = {
    scheme: 'monokai',
    author: 'wimer hazenberg (http://www.monokai.nl)',
    base00: '#272822',
    base01: '#383830',
    base02: '#49483e',
    base03: '#75715e',
    base04: '#a59f85',
    base05: '#f8f8f2',
    base06: '#f5f4f1',
    base07: '#f9f8f5',
    base08: '#f92672',
    base09: '#fd971f',
    base0A: '#f4bf75',
    base0B: '#a6e22e',
    base0C: '#a1efe4',
    base0D: '#66d9ef',
    base0E: '#ae81ff',
    base0F: '#cc6633'
  };

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
    console.log('Formatting field name:', fieldName);
    
    const formatted = fieldName
      .replace(/ID/g, '') // Remove all instances of ID
      .replace(/Id/g, '') // Remove all instances of Id
      .replace(/([A-Z])/g, ' $1') // Add space before capital letters
      .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
      .trim();
    
    console.log('Formatted result:', formatted);
    return formatted;
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
    

    
    if (isReadOnly) {
      return (
        <input
          type="text"
          value={value || ''}
          disabled
          style={{
            width: '100%',
            padding: '0.5rem',
            border: '1px solid #ddd',
            borderRadius: '4px',
            background: '#f5f5f5',
            color: '#666'
          }}
        />
      );
    }

    
    if (fieldType === 'boolean') {
      return (
        <select
          value={value?.toString() || 'false'}
          disabled
          style={{
            width: '100%',
            padding: '0.5rem',
            border: '1px solid #ddd',
            borderRadius: '4px'
          }}
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
          style={{
            width: '100%',
            padding: '0.5rem',
            border: '1px solid #ddd',
            borderRadius: '4px'
          }}
        />
      );
    }
    
    return (
      <input
        type="text"
        value={value || ''}
        readOnly
        style={{
          width: '100%',
          padding: '0.5rem',
          border: '1px solid #ddd',
          borderRadius: '4px'
        }}
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
              <div key={key} style={{ border: '1px solid #eee', padding: '1rem', borderRadius: '4px' }}>
                <h5 style={{ margin: '0 0 0.5rem 0', color: '#2c3e50' }}>{key}</h5>
                {renderFormView(value, schemaProps?.[key])}
              </div>
            );
          }
          
          if (Array.isArray(value)) {
            return (
              <div key={key} style={{ border: '1px solid #eee', padding: '1rem', borderRadius: '4px' }}>
                <h5 style={{ margin: '0 0 1rem 0', color: '#2c3e50' }}>{key} ({value.length} items)</h5>
                {value.map((item, index) => (
                  <div key={index} style={{ 
                    border: '1px solid #ddd', 
                    padding: '1rem', 
                    marginBottom: '1rem', 
                    borderRadius: '4px',
                    backgroundColor: '#f9f9f9'
                  }}>
                    <h6 style={{ margin: '0 0 0.5rem 0', color: '#34495e' }}>
                      {key.slice(0, -1)} {index + 1}
                    </h6>
                    {typeof item === 'object' && item !== null ? 
                      renderFormView(item, schemaProps?.[key]?.items?.properties) :
                      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '0.5rem', alignItems: 'center' }}>
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
                    }
                  </div>
                ))}
              </div>
            );
          }
          
          return (
            <div key={key} style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '0.5rem', alignItems: 'center' }}>
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
              onClick={handleFormTabClick}
              style={{
                padding: '0.5rem 1rem',
                marginRight: '0.5rem',
                border: 'none',
                background: activeTab === 'form' ? '#3498db' : '#ecf0f1',
                color: activeTab === 'form' ? 'white' : '#2c3e50',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Form View
            </button>
            <button
              onClick={handleSchemaTabClick}
              style={{
                padding: '0.5rem 1rem',
                marginRight: '0.5rem',
                border: 'none',
                background: activeTab === 'schema' ? '#3498db' : '#ecf0f1',
                color: activeTab === 'schema' ? 'white' : '#2c3e50',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Schema
            </button>

          </div>
          
          {activeTab === 'form' && nodeExample && (
            renderFormView(nodeExample, nodeProps)
          )}
          
          {activeTab === 'schema' && nodeProps && (
            <JSONTree data={nodeProps} theme={theme} invertTheme={false} />
          )}
          

        </div>
      );
    }

    return (
      <div>
        <div style={{ marginBottom: '1rem' }}>
          <button
            onClick={handleFormTabClick}
            style={{
              padding: '0.5rem 1rem',
              marginRight: '0.5rem',
              border: 'none',
              background: activeTab === 'form' ? '#3498db' : '#ecf0f1',
              color: activeTab === 'form' ? 'white' : '#2c3e50',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Form View
          </button>
          <button
            onClick={handleSchemaTabClick}
            style={{
              padding: '0.5rem 1rem',
              marginRight: '0.5rem',
              border: 'none',
              background: activeTab === 'schema' ? '#3498db' : '#ecf0f1',
              color: activeTab === 'schema' ? 'white' : '#2c3e50',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Schema
          </button>

        </div>
        
        {activeTab === 'form' && example && (() => {
          // For loaded OSDU data, use the 'data' property if it exists
          const dataToRender = example.data ? example.data : example;
          return renderFormView(dataToRender, resolveSchemaProperties(schema?.properties?.data));
        })()}
        
        {activeTab === 'schema' && schema && (
          <JSONTree data={schema} theme={theme} invertTheme={false} />
        )}
        

      </div>
    );
  };

  return (
    <div className="properties-panel">
      <h3 style={{ marginBottom: '1rem', color: '#2c3e50' }}>
        Properties & Data
      </h3>
      {renderContent()}
    </div>
  );
};

export default PropertiesPanel;
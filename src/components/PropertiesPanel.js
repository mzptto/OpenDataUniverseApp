import React, { useState, useCallback, useEffect } from 'react';
import { JSONTree } from 'react-json-tree';
import { ReferenceDataManager } from '../data/ReferenceDataManager';
import ReferenceDataInfo from './ReferenceDataInfo';
import { OSDUColors } from '../utils/osduColorUtils';
import { SchemaUtils } from '../utils/schemaUtils';
import { FormUtils } from '../utils/formUtils';

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





  const renderFormField = (key, value, schemaProperty) => {
    const isReadOnly = FormUtils.isReadOnlyField(key);
    const fieldType = schemaProperty?.type || 'string';
    const borderColor = OSDUColors.getDataTypeColor(key, schemaProperty, value);
    
    const baseStyle = {
      width: '100%',
      padding: '0.5rem',
      border: `3px solid ${borderColor}`,
      borderRadius: '4px',
      backgroundColor: '#ffffff',
      fontWeight: '500'
    };
    
    // Check if this is a reference data field
    const isReferenceDataField = FormUtils.isReferenceDataField(value);
    
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
                {FormUtils.formatFieldName(key)}:
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
      const nodeProps = SchemaUtils.getNodeProperties(schema, selectedNode);
      const nodeExample = SchemaUtils.getNodeExampleData(example, selectedNode);
      
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
          return renderFormView(dataToRender, SchemaUtils.resolveSchemaProperties(schema?.properties?.data));
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
import React, { useState } from 'react';
import { JSONTree } from 'react-json-tree';

const EntityComparison = ({ entities, selectedEntities, onClose }) => {
  const [compareMode, setCompareMode] = useState('schema');

  if (!selectedEntities || selectedEntities.length < 2) return null;

  const theme = {
    scheme: 'monokai',
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

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0,0,0,0.8)',
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        background: 'white',
        width: '90vw',
        height: '90vh',
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{
          padding: '1rem',
          borderBottom: '1px solid #ddd',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3>Compare Entities</h3>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <select
              value={compareMode}
              onChange={(e) => setCompareMode(e.target.value)}
              style={{ padding: '0.5rem' }}
            >
              <option value="schema">Schema</option>
              <option value="example">Example Data</option>
              <option value="properties">Properties</option>
            </select>
            <button onClick={onClose} style={{ padding: '0.5rem 1rem' }}>Close</button>
          </div>
        </div>
        
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {selectedEntities.map((entity, index) => (
            <div key={entity.id} style={{
              flex: 1,
              borderRight: index < selectedEntities.length - 1 ? '1px solid #ddd' : 'none',
              overflow: 'auto',
              padding: '1rem'
            }}>
              <h4>{entity.name} v{entity.version}</h4>
              <div style={{ marginTop: '1rem', fontSize: '12px' }}>
                {compareMode === 'schema' && entity.schema && (
                  <JSONTree data={entity.schema} theme={theme} invertTheme={false} />
                )}
                {compareMode === 'example' && entity.example && (
                  <JSONTree data={entity.example} theme={theme} invertTheme={false} />
                )}
                {compareMode === 'properties' && (
                  <div>
                    <p><strong>Type:</strong> {entity.type}</p>
                    <p><strong>Version:</strong> {entity.version}</p>
                    <p><strong>Has Schema:</strong> {entity.schema ? 'Yes' : 'No'}</p>
                    <p><strong>Has Example:</strong> {entity.example ? 'Yes' : 'No'}</p>
                    <p><strong>Has Diagram:</strong> {entity.pumlContent ? 'Yes' : 'No'}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EntityComparison;
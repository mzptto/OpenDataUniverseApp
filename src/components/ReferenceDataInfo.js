import React, { useState } from 'react';
import { ReferenceDataManager, referenceData } from '../data/referenceData';

const ReferenceDataInfo = () => {
  const [selectedType, setSelectedType] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  const referenceTypes = ReferenceDataManager.getAllReferenceTypes();
  const totalTypes = referenceTypes.length;
  const totalValues = Object.values(referenceData).reduce((sum, values) => sum + values.length, 0);

  const selectedValues = selectedType ? ReferenceDataManager.getReferenceValues(selectedType) : [];

  return (
    <div style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '4px', margin: '1rem 0' }}>
      <h4 style={{ margin: '0 0 1rem 0', color: '#2c3e50' }}>
        Reference Data Information
      </h4>
      
      <div style={{ marginBottom: '1rem', fontSize: '14px', color: '#666' }}>
        <strong>{totalTypes}</strong> reference data types with <strong>{totalValues.toLocaleString()}</strong> total values loaded
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <button
          onClick={() => setShowDetails(!showDetails)}
          style={{
            padding: '0.5rem 1rem',
            border: 'none',
            background: '#3498db',
            color: 'white',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {showDetails ? 'Hide Details' : 'Show Details'}
        </button>
      </div>

      {showDetails && (
        <div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Select Reference Type:
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            >
              <option value="">Select a reference type...</option>
              {referenceTypes.sort().map(type => (
                <option key={type} value={type}>
                  {type} ({ReferenceDataManager.getReferenceValues(type).length} values)
                </option>
              ))}
            </select>
          </div>

          {selectedValues.length > 0 && (
            <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #eee', padding: '0.5rem' }}>
              <h5 style={{ margin: '0 0 0.5rem 0' }}>
                {selectedType} ({selectedValues.length} values)
              </h5>
              <div style={{ display: 'grid', gap: '0.25rem' }}>
                {selectedValues.slice(0, 50).map((value, index) => (
                  <div key={index} style={{ 
                    fontSize: '12px', 
                    padding: '0.25rem', 
                    background: '#f8f9fa',
                    borderRadius: '2px'
                  }}>
                    <strong>{value.name}</strong> ({value.code})
                    {value.description !== value.name && (
                      <div style={{ color: '#666', fontSize: '11px' }}>
                        {value.description}
                      </div>
                    )}
                  </div>
                ))}
                {selectedValues.length > 50 && (
                  <div style={{ fontSize: '12px', color: '#666', fontStyle: 'italic' }}>
                    ... and {selectedValues.length - 50} more values
                  </div>
                )}
              </div>
            </div>
          )}

          <div style={{ marginTop: '1rem', fontSize: '12px', color: '#666' }}>
            <strong>Top 10 Reference Types by Value Count:</strong>
            <div style={{ marginTop: '0.5rem' }}>
              {referenceTypes
                .map(type => ({ type, count: ReferenceDataManager.getReferenceValues(type).length }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 10)
                .map(({ type, count }) => (
                  <div key={type} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.1rem 0' }}>
                    <span>{type}</span>
                    <span>{count.toLocaleString()}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferenceDataInfo;
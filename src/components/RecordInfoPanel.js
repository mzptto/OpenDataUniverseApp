import React from 'react';

const RecordInfoPanel = ({ example }) => {
  if (!example) {
    return <div style={{ color: '#7f8c8d' }}>No record data available</div>;
  }

  const formatDateTime = (dateTime) => {
    if (!dateTime) return 'N/A';
    return new Date(dateTime).toLocaleString();
  };



  const renderSection = (title, content) => (
    <div style={{ 
      border: '1px solid #dee2e6', 
      borderRadius: '4px', 
      padding: '1rem', 
      marginBottom: '1rem',
      backgroundColor: '#f8f9fa'
    }}>
      <h5 style={{ margin: '0 0 0.75rem 0', color: '#2c3e50', fontSize: '1rem', fontWeight: '600' }}>
        {title}
      </h5>
      {content}
    </div>
  );

  const renderField = (label, value, isCode = false) => (
    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.75rem', alignItems: 'start', marginBottom: '0.75rem' }}>
      <label style={{ fontWeight: '500', color: '#495057', fontSize: '0.9rem' }}>{label}:</label>
      <span style={{ 
        fontFamily: isCode ? 'monospace' : 'inherit',
        fontSize: '0.9rem',
        backgroundColor: isCode ? '#f1f3f4' : 'transparent',
        padding: isCode ? '0.25rem 0.5rem' : '0',
        borderRadius: isCode ? '3px' : '0',
        wordBreak: 'break-all',
        color: '#212529'
      }}>
        {value || 'N/A'}
      </span>
    </div>
  );

  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      {/* Schema Information */}
      {renderSection('Schema Information', (
        <>
          {renderField('Kind', example.kind, true)}
          {renderField('Record ID', example.id, true)}
          {renderField('Version', example.version)}
        </>
      ))}

      {/* Governance */}
      {example.acl && renderSection('Access Control', (
        <>
          {renderField('Owners', example.acl.owners?.join(', '))}
          {renderField('Viewers', example.acl.viewers?.join(', '))}
        </>
      ))}

      {example.legal && renderSection('Legal & Compliance', (
        <>
          {renderField('Status', example.legal.status)}
          {renderField('Legal Tags', example.legal.legaltags?.join(', '))}
          {renderField('Countries', example.legal.otherRelevantDataCountries?.join(', '))}
        </>
      ))}

      {/* Lifecycle */}
      {renderSection('Lifecycle', (
        <>
          {renderField('Created', formatDateTime(example.createTime))}
          {renderField('Created By', example.createUser)}
          {renderField('Modified', formatDateTime(example.modifyTime))}
          {renderField('Modified By', example.modifyUser)}
        </>
      ))}

      {/* Relationships */}
      {example.ancestry && renderSection('Relationships', (
        <>
          {renderField('Parent Records', example.ancestry.parents?.length || 0)}
          {example.ancestry.parents?.length > 0 && (
            <div style={{ marginTop: '0.5rem' }}>
              {example.ancestry.parents.map((parent, index) => (
                <div key={index} style={{ 
                  fontFamily: 'monospace', 
                  fontSize: '0.85em', 
                  backgroundColor: '#f1f3f4',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '3px',
                  marginBottom: '0.25rem',
                  wordBreak: 'break-all'
                }}>
                  {parent}
                </div>
              ))}
            </div>
          )}
        </>
      ))}

      {/* Technical Metadata */}
      {example.meta && example.meta.length > 0 && renderSection('Technical Metadata', (
        <>
          {renderField('Meta Entries', example.meta.length)}
          {example.meta.map((metaItem, index) => (
            <div key={index} style={{ 
              border: '1px solid #dee2e6',
              borderRadius: '4px',
              padding: '0.75rem',
              marginBottom: '0.75rem',
              backgroundColor: '#ffffff'
            }}>
              {renderField('Kind', metaItem.kind)}
              {renderField('Name', metaItem.name)}
              {metaItem.unitOfMeasureID && renderField('Unit ID', metaItem.unitOfMeasureID, true)}
              {metaItem.propertyNames && renderField('Properties', metaItem.propertyNames.join(', '))}
            </div>
          ))}
        </>
      ))}

      {/* Custom Tags */}
      {example.tags && Object.keys(example.tags).length > 0 && renderSection('Custom Tags', (
        <>
          {Object.entries(example.tags).map(([key, value]) => 
            renderField(key, value)
          )}
        </>
      ))}
    </div>
  );
};

export default RecordInfoPanel;
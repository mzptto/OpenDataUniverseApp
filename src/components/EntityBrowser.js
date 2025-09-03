import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';

const EntityBrowser = ({ entities, selectedEntity, onEntitySelect, isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  // Dynamically generate entity types from actual entities
  const entityTypes = React.useMemo(() => {
    const types = new Set(entities.map(entity => entity.type));
    const typeLabels = {
      'master-data': 'Master Data',
      'reference-data': 'Reference Data',
      'work-product-component': 'Work Product Component',
      'work-product': 'Work Product',
      'dataset': 'Dataset',
      'manifest': 'Manifest'
    };
    
    return [
      { value: 'all', label: 'All Types' },
      ...Array.from(types).sort().map(type => ({
        value: type,
        label: typeLabels[type] || type.split('-').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ')
      }))
    ];
  }, [entities]);

  const filteredEntities = useMemo(() => {
    let filtered = entities;
    
    if (selectedType !== 'all') {
      filtered = filtered.filter(entity => entity.type === selectedType);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(entity =>
        entity.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  }, [entities, selectedType, searchTerm]);

  if (!isOpen) return null;
  
  return (
    <div className="entity-browser" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '320px',
      height: '100vh',
      background: 'white',
      borderRight: '1px solid #ddd',
      zIndex: 1002,
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{ padding: '1rem', borderBottom: '1px solid #ddd' }}>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '18px' }}>OSDU Data Model</h3>
        
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '14px', fontWeight: 'bold' }}>Data Type:</label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          >
            {entityTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>
        
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ 
            position: 'absolute', 
            left: '0.5rem', 
            top: '50%', 
            transform: 'translateY(-50%)',
            color: '#666'
          }} />
          <input
            type="text"
            placeholder="Search entities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem 0.5rem 0.5rem 2rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
        </div>
      </div>
      
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ padding: '0.5rem 1rem', background: '#f8f9fa', fontSize: '12px', color: '#666' }}>
          {filteredEntities.length} entities
        </div>
        {filteredEntities.map((entity) => (
          <div
            key={entity.id}
            style={{
              padding: '0.75rem 1rem',
              borderBottom: '1px solid #f0f0f0',
              cursor: 'pointer',
              backgroundColor: selectedEntity?.id === entity.id ? '#e3f2fd' : 'transparent'
            }}
            onClick={() => onEntitySelect(entity)}
            onMouseEnter={(e) => e.target.style.backgroundColor = selectedEntity?.id === entity.id ? '#e3f2fd' : '#f8f9fa'}
            onMouseLeave={(e) => e.target.style.backgroundColor = selectedEntity?.id === entity.id ? '#e3f2fd' : 'transparent'}
          >
            <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
              {entity.name}
            </div>
            <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
              {entity.type} • v{entity.version}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EntityBrowser;
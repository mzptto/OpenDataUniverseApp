import React, { useState } from 'react';
import { Search, Filter } from 'lucide-react';

const AdvancedSearch = ({ entities, onFilteredResults }) => {
  const [filters, setFilters] = useState({
    text: '',
    type: 'all',
    hasSchema: null,
    hasExample: null
  });

  const applyFilters = () => {
    let filtered = entities;

    if (filters.text) {
      filtered = filtered.filter(entity =>
        entity.name.toLowerCase().includes(filters.text.toLowerCase()) ||
        entity.type.toLowerCase().includes(filters.text.toLowerCase())
      );
    }

    if (filters.type !== 'all') {
      filtered = filtered.filter(entity => entity.type === filters.type);
    }

    if (filters.hasSchema !== null) {
      filtered = filtered.filter(entity => !!entity.schema === filters.hasSchema);
    }

    if (filters.hasExample !== null) {
      filtered = filtered.filter(entity => !!entity.example === filters.hasExample);
    }

    onFilteredResults(filtered);
  };

  React.useEffect(applyFilters, [filters, entities]);

  return (
    <div style={{ padding: '1rem', background: '#f8f9fa', borderBottom: '1px solid #ddd' }}>
      <div style={{ display: 'grid', gap: '0.5rem' }}>
        <input
          type="text"
          placeholder="Search entities..."
          value={filters.text}
          onChange={(e) => setFilters(prev => ({ ...prev, text: e.target.value }))}
          style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
        />
        
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <label style={{ fontSize: '12px' }}>
            <input
              type="checkbox"
              checked={filters.hasSchema === true}
              onChange={(e) => setFilters(prev => ({ 
                ...prev, 
                hasSchema: e.target.checked ? true : null 
              }))}
            />
            Has Schema
          </label>
          
          <label style={{ fontSize: '12px' }}>
            <input
              type="checkbox"
              checked={filters.hasExample === true}
              onChange={(e) => setFilters(prev => ({ 
                ...prev, 
                hasExample: e.target.checked ? true : null 
              }))}
            />
            Has Example
          </label>
        </div>
      </div>
    </div>
  );
};

export default AdvancedSearch;
import React, { useState } from 'react';
import { Search, Send, Key } from 'lucide-react';

const SearchSidebar = ({ entities = [], onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [loading, setLoading] = useState(false);
  const [newToken, setNewToken] = useState('');
  const [tokenRefreshing, setTokenRefreshing] = useState(false);
  const [showTokenSection, setShowTokenSection] = useState(false);

  // Generate entity types from entities (same as EntityBrowser)
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

  const buildSearchBody = () => {
    let kind = '*:*:*:*';
    if (selectedType !== 'all') {
      kind = `*:*:${selectedType}--*:*`;
    }
    
    return {
      query: searchQuery,
      kind: kind,
      cursor: null,
      limit: 100,
      sort: {
        field: ['id'],
        order: ['desc']
      }
    };
  };

  const handleSearch = async () => {
    if (!onSearch) return;
    
    setLoading(true);
    try {
      const searchBody = buildSearchBody();
      await onSearch(searchBody);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const refreshToken = async (e) => {
    e?.preventDefault(); // Prevent any form submission
    
    if (!newToken.trim()) {
      alert('Please enter a token');
      return;
    }
    
    setTokenRefreshing(true);
    try {
      // Use local proxy for development, deployed API for production
      const isDevelopment = window.location.hostname === 'localhost';
      const apiUrl = isDevelopment ? 'http://localhost:3001' : process.env.REACT_APP_API_URL;
      const url = `${apiUrl}/api/refresh-token/`;
      
      console.log('Making POST request to:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ token: newToken.trim().replace(/^Bearer\s+/i, '') })
      });
      
      if (response.ok) {
        setNewToken('');
        alert('Token updated successfully!');
      } else {
        alert('Failed to update token');
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setTokenRefreshing(false);
    }
  };

  return (
    <div style={{
      position: 'static',
      width: '100%',
      height: '100%',
      background: 'white',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{ padding: '1rem', borderBottom: '1px solid #ddd' }}>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '18px' }}>OSDU Search</h3>
        
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
        
        <div style={{ position: 'relative', marginBottom: '1rem' }}>
          <Search size={16} style={{ 
            position: 'absolute', 
            left: '0.5rem', 
            top: '50%', 
            transform: 'translateY(-50%)',
            color: '#666'
          }} />
          <input
            type="text"
            placeholder="Search OSDU data..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            style={{
              width: '100%',
              padding: '0.5rem 0.5rem 0.5rem 2rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
        </div>
        
        <button
          onClick={handleSearch}
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.75rem',
            background: loading ? '#6c757d' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            fontSize: '14px',
            fontWeight: 'bold',
            marginBottom: '1rem'
          }}
        >
          <Send size={16} />
          {loading ? 'Searching...' : 'Search'}
        </button>
        
        <div style={{ borderTop: '1px solid #ddd', paddingTop: '1rem' }}>
          <button
            onClick={() => setShowTokenSection(!showTokenSection)}
            style={{
              width: '100%',
              padding: '0.5rem',
              background: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              fontSize: '12px',
              marginBottom: showTokenSection ? '1rem' : '0'
            }}
          >
            <Key size={14} />
            Update Token
          </button>
          
          {showTokenSection && (
            <div>
              <input
                type="text"
                placeholder="Paste your token to search"
                value={newToken}
                onChange={(e) => setNewToken(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  marginBottom: '0.5rem'
                }}
              />
              <button
                type="button"
                onClick={(e) => refreshToken(e)}
                disabled={tokenRefreshing || !newToken.trim()}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  background: tokenRefreshing || !newToken.trim() ? '#6c757d' : '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: tokenRefreshing || !newToken.trim() ? 'not-allowed' : 'pointer',
                  fontSize: '12px'
                }}
              >
                {tokenRefreshing ? 'Updating...' : 'Update Token'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchSidebar;
import React, { useState } from 'react';
import { Building2, Database, BarChart3, FileText, BarChart, ChevronUp, ChevronDown, Eye, Code, Table, Files, MapPin, Factory, Scroll, FileSpreadsheet, FolderOpen, FileJson, Repeat } from 'lucide-react';

const SearchResults = ({ searchResponse, loading, onRecordSelect }) => {
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [viewMode, setViewMode] = useState('table');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [columnWidths, setColumnWidths] = useState({ name: 250, id: 150, type: 180, details: 200 });


  const getEntityDisplayInfo = (record) => {
    const kind = record.kind || record.type || '';
    const kindParts = kind.split(':');
    
    if (kindParts.length >= 3) {
      const category = kindParts[2].split('--')[0];
      const entityType = kindParts[2].split('--')[1]?.split(':')[0] || '';
      
      const categoryMap = {
        'dataset': { name: 'Dataset', icon: Database, color: '#138a5c' },
        'datacollection': { name: 'Data Collection', icon: Files, color: '#0f6674' },
        'master-data': { name: 'Master-Data', icon: Building2, color: '#1e7e34' },
        'reference-data': { name: 'Reference-Data', icon: Scroll, color: '#5a2d91' },
        'work-product-component': { name: 'Work-Product-Component', icon: BarChart, color: '#cc5500' },
        'abstract': { name: 'Abstract', icon: FileSpreadsheet, color: '#495057' },
        'manifest': { name: 'Manifest', icon: FolderOpen, color: '#a71d2a' },
        'work-product': { name: 'Work-Product', icon: FileJson, color: '#cc9900' }
      };
      
      const categoryInfo = categoryMap[category] || { name: category, icon: FileText, color: '#6c757d' };
      
      let displayName = record.data?.Name || record.name || record.title || entityType;
      let details = '';
      let iconOverride = null;
      
      switch (category) {
        case 'master-data':
          displayName = record.data?.Name || record.data?.FacilityName || record.data?.OrganisationName || displayName;
          if (entityType === 'Organisation') {
            details = [record.data?.OrganisationType, record.data?.Country].filter(Boolean).join(' • ');
            iconOverride = Building2;
          } else if (entityType === 'Well') {
            details = [record.data?.OperatingCompany, record.data?.Country].filter(Boolean).join(' • ');
            iconOverride = MapPin;
          } else if (entityType === 'Wellbore') {
            details = [record.data?.Type, record.data?.Status].filter(Boolean).join(' • ');
            iconOverride = Factory;
          } else {
            details = [record.data?.Type, record.data?.Status].filter(Boolean).join(' • ');
            iconOverride = Factory;
          }
          break;
        default:
          details = record.id || '';
      }
      
      return {
        displayName,
        category: categoryInfo.name,
        categoryIcon: iconOverride || categoryInfo.icon,
        categoryColor: categoryInfo.color,
        entityType,
        details,
        simplifiedId: entityType
      };
    }
    
    return {
      displayName: record.name || record.title || 'Unknown',
      category: 'Unknown',
      categoryIcon: FileText,
      categoryColor: '#6c757d',
      entityType: 'Unknown',
      details: record.id || '',
      simplifiedId: 'Unknown'
    };
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortedResults = () => {
    if (!searchResponse?.results || !sortField) return searchResponse.results;
    
    return [...searchResponse.results].sort((a, b) => {
      let aVal, bVal;
      
      switch (sortField) {
        case 'name':
          const aEntity = getEntityDisplayInfo(a);
          const bEntity = getEntityDisplayInfo(b);
          aVal = aEntity.displayName.toLowerCase();
          bVal = bEntity.displayName.toLowerCase();
          break;
        case 'id':
          const aIdEntity = getEntityDisplayInfo(a);
          const bIdEntity = getEntityDisplayInfo(b);
          aVal = aIdEntity.simplifiedId.toLowerCase();
          bVal = bIdEntity.simplifiedId.toLowerCase();
          break;
        case 'type':
          const aTypeEntity = getEntityDisplayInfo(a);
          const bTypeEntity = getEntityDisplayInfo(b);
          aVal = aTypeEntity.category.toLowerCase();
          bVal = bTypeEntity.category.toLowerCase();
          break;
        default:
          return 0;
      }
      
      if (sortDirection === 'asc') {
        return aVal.localeCompare(bVal);
      } else {
        return bVal.localeCompare(aVal);
      }
    });
  };

  const renderSortIcon = (field) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };

  const handleColumnResize = (column, newWidth) => {
    setColumnWidths(prev => ({ ...prev, [column]: Math.max(100, newWidth) }));
  };

  const downloadRecord = async (recordId) => {
    try {
      const storageEndpoint = `http://localhost:3001/api/storage/${encodeURIComponent(recordId)}`;
      
      const result = await fetch(storageEndpoint, {
        method: 'GET',
        headers: { 'content-type': 'application/json' }
      });
      
      if (result.ok) {
        const recordData = await result.json();
        
        const blob = new Blob([JSON.stringify(recordData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${recordId.split(':').pop()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        alert(`Failed to download record: ${result.status} ${result.statusText}`);
      }
    } catch (error) {
      alert(`Error downloading record: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        flex: 1,
        fontSize: '16px',
        color: '#666'
      }}>
        Searching...
      </div>
    );
  }

  if (!searchResponse) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        flex: 1,
        fontSize: '16px',
        color: '#666'
      }}>
        Use the search sidebar to find OSDU data
      </div>
    );
  }

  if (!searchResponse.results || searchResponse.results.length === 0) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        flex: 1,
        fontSize: '16px',
        color: '#666'
      }}>
        No results found
      </div>
    );
  }

  const sortedResults = getSortedResults();



  const renderViewModeButtons = () => (
    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
      <button
        onClick={() => setViewMode('table')}
        style={{
          padding: '0.5rem 1rem',
          background: viewMode === 'table' ? '#007bff' : '#f8f9fa',
          color: viewMode === 'table' ? 'white' : '#333',
          border: '1px solid #ddd',
          borderRadius: '4px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '14px'
        }}
      >
        <Table size={16} /> Table
      </button>
      <button
        onClick={() => setViewMode('raw')}
        style={{
          padding: '0.5rem 1rem',
          background: viewMode === 'raw' ? '#007bff' : '#f8f9fa',
          color: viewMode === 'raw' ? 'white' : '#333',
          border: '1px solid #ddd',
          borderRadius: '4px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '14px'
        }}
      >
        <Eye size={16} /> Raw
      </button>
      <button
        onClick={() => setViewMode('schema')}
        style={{
          padding: '0.5rem 1rem',
          background: viewMode === 'schema' ? '#007bff' : '#f8f9fa',
          color: viewMode === 'schema' ? 'white' : '#333',
          border: '1px solid #ddd',
          borderRadius: '4px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '14px'
        }}
      >
        <Code size={16} /> Schema
      </button>
    </div>
  );

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <div style={{ padding: '1rem', background: 'white', borderBottom: '1px solid #ddd', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ marginBottom: '1rem', padding: '0.5rem', background: '#e8f4fd', borderRadius: '4px', fontSize: '14px' }}>
          📊 Found {searchResponse.totalCount || searchResponse.results.length} records
          {searchResponse.cursor && ' • Has more results'}
        </div>
        {renderViewModeButtons()}
      </div>
      
      <div style={{ flex: 1, overflow: 'auto' }}>
        {viewMode === 'table' && (
          <div style={{ border: '1px solid #ddd', borderRadius: '4px', overflow: 'auto', height: '100%' }}>
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse', 
              backgroundColor: 'white',
              tableLayout: 'fixed'
            }}>
              <thead>
                <tr style={{ background: '#f8f9fa', position: 'sticky', top: 0, zIndex: 10 }}>
                  <th 
                    onClick={() => handleSort('name')}
                    style={{ 
                      padding: '0.75rem', 
                      textAlign: 'left', 
                      borderBottom: '1px solid #ddd',
                      fontWeight: 'bold', 
                      color: '#333',
                      cursor: 'pointer',
                      userSelect: 'none',
                      background: '#f8f9fa',
                      width: columnWidths.name + 'px',
                      position: 'relative'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      Name {renderSortIcon('name')}
                    </div>
                    <div 
                      style={{ 
                        position: 'absolute', 
                        right: 0, 
                        top: 0, 
                        bottom: 0, 
                        width: '4px', 
                        cursor: 'col-resize', 
                        background: 'transparent'
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        const startX = e.clientX;
                        const startWidth = columnWidths.name;
                        const handleMouseMove = (e) => {
                          const newWidth = startWidth + (e.clientX - startX);
                          handleColumnResize('name', newWidth);
                        };
                        const handleMouseUp = () => {
                          document.removeEventListener('mousemove', handleMouseMove);
                          document.removeEventListener('mouseup', handleMouseUp);
                        };
                        document.addEventListener('mousemove', handleMouseMove);
                        document.addEventListener('mouseup', handleMouseUp);
                      }}
                    />
                  </th>
                  <th 
                    onClick={() => handleSort('id')}
                    style={{ 
                      padding: '0.75rem', 
                      textAlign: 'left', 
                      borderBottom: '1px solid #ddd',
                      fontWeight: 'bold', 
                      color: '#333',
                      cursor: 'pointer',
                      userSelect: 'none',
                      background: '#f8f9fa',
                      width: columnWidths.id + 'px',
                      position: 'relative'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      ID {renderSortIcon('id')}
                    </div>
                    <div 
                      style={{ 
                        position: 'absolute', 
                        right: 0, 
                        top: 0, 
                        bottom: 0, 
                        width: '4px', 
                        cursor: 'col-resize', 
                        background: 'transparent'
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        const startX = e.clientX;
                        const startWidth = columnWidths.id;
                        const handleMouseMove = (e) => {
                          const newWidth = startWidth + (e.clientX - startX);
                          handleColumnResize('id', newWidth);
                        };
                        const handleMouseUp = () => {
                          document.removeEventListener('mousemove', handleMouseMove);
                          document.removeEventListener('mouseup', handleMouseUp);
                        };
                        document.addEventListener('mousemove', handleMouseMove);
                        document.addEventListener('mouseup', handleMouseUp);
                      }}
                    />
                  </th>
                  <th 
                    onClick={() => handleSort('type')}
                    style={{ 
                      padding: '0.75rem', 
                      textAlign: 'left', 
                      borderBottom: '1px solid #ddd',
                      fontWeight: 'bold', 
                      color: '#333',
                      cursor: 'pointer',
                      userSelect: 'none',
                      background: '#f8f9fa',
                      width: columnWidths.type + 'px',
                      position: 'relative'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      Type {renderSortIcon('type')}
                    </div>
                    <div 
                      style={{ 
                        position: 'absolute', 
                        right: 0, 
                        top: 0, 
                        bottom: 0, 
                        width: '4px', 
                        cursor: 'col-resize', 
                        background: 'transparent'
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        const startX = e.clientX;
                        const startWidth = columnWidths.type;
                        const handleMouseMove = (e) => {
                          const newWidth = startWidth + (e.clientX - startX);
                          handleColumnResize('type', newWidth);
                        };
                        const handleMouseUp = () => {
                          document.removeEventListener('mousemove', handleMouseMove);
                          document.removeEventListener('mouseup', handleMouseUp);
                        };
                        document.addEventListener('mousemove', handleMouseMove);
                        document.addEventListener('mouseup', handleMouseUp);
                      }}
                    />
                  </th>
                  <th style={{ 
                    padding: '0.75rem', 
                    textAlign: 'left', 
                    borderBottom: '1px solid #ddd',
                    fontWeight: 'bold', 
                    color: '#333',
                    background: '#f8f9fa',
                    width: columnWidths.details + 'px'
                  }}>Details</th>
                </tr>
              </thead>
              <tbody>
                  {sortedResults.map((record, index) => {
                    const entityInfo = getEntityDisplayInfo(record);
                    const IconComponent = entityInfo.categoryIcon;
                    
                    return (
                      <tr key={index} style={{ borderBottom: '1px solid #eee', backgroundColor: 'white', borderLeft: `4px solid ${entityInfo.categoryColor}` }}>
                        <td 
                          style={{ 
                            padding: '0.75rem', 
                            fontWeight: '500', 
                            fontSize: '14px',
                            color: '#333',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}
                        >
                          <span style={{ 
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            flex: 1
                          }}>
                            {entityInfo.displayName}
                          </span>
                          <Repeat 
                            size={16} 
                            color="#666" 
                            style={{ marginLeft: '0.5rem', flexShrink: 0, cursor: 'pointer' }} 
                            onClick={(e) => {
                              e.stopPropagation();
                              onRecordSelect && onRecordSelect(record);
                            }}
                            title="View record details"
                          />
                        </td>
                        <td 
                          style={{ 
                            padding: '0.75rem', 
                            fontSize: '14px', 
                            color: '#666', 
                            cursor: 'help',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                          title={record.id}
                        >
                          {entityInfo.simplifiedId}
                        </td>
                        <td style={{ 
                          padding: '0.75rem', 
                          fontSize: '14px', 
                          color: entityInfo.categoryColor, 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.5rem'
                        }}>
                          {entityInfo.category}
                          <IconComponent size={16} color={entityInfo.categoryColor} />
                        </td>
                        <td style={{ 
                          padding: '0.75rem', 
                          fontSize: '14px', 
                          color: '#28a745',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>{entityInfo.details}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}
        
        {viewMode === 'raw' && (
          <div style={{ padding: '1rem', background: 'white', border: '1px solid #ddd', borderRadius: '4px' }}>
            <pre style={{ 
              background: '#f8f9fa', 
              padding: '1rem', 
              borderRadius: '4px', 
              overflow: 'auto', 
              fontSize: '12px',
              maxHeight: '600px'
            }}>
              {JSON.stringify(searchResponse, null, 2)}
            </pre>
          </div>
        )}
        
        {viewMode === 'schema' && (
          <div style={{ padding: '1rem', background: 'white', border: '1px solid #ddd', borderRadius: '4px' }}>
            <h4 style={{ marginBottom: '1rem', color: '#333' }}>Response Schema</h4>
            <pre style={{ 
              background: '#f8f9fa', 
              padding: '1rem', 
              borderRadius: '4px', 
              overflow: 'auto', 
              fontSize: '12px',
              maxHeight: '600px'
            }}>
              {JSON.stringify({
                totalCount: typeof searchResponse.totalCount,
                cursor: typeof searchResponse.cursor,
                results: [
                  {
                    id: "string",
                    kind: "string",
                    type: "string",
                    data: "object",
                    "...other_fields": "various_types"
                  }
                ]
              }, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
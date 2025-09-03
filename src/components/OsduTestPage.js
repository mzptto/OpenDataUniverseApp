import React, { useState } from 'react';
import { Send, Copy, Eye, Code, Building2, Table, ChevronUp, ChevronDown, Search, Database, BarChart3, FileText, BarChart } from 'lucide-react';
import { JSONTree } from 'react-json-tree';
import { investigateCORS } from '../utils/corsInvestigation';

const OsduTestPage = () => {
  const [endpoint, setEndpoint] = useState('http://localhost:3001/api/search');
  const [method, setMethod] = useState('POST');
  const [headers, setHeaders] = useState(`{
  "content-type": "application/json"
}`);
  const [body, setBody] = useState(`{
  "query": "volve",
  "kind": "*:*:*:*",
  "cursor": null,
  "limit": 100,
  "sort": {
    "field": [
      "id"
    ],
    "order": [
      "desc"
    ]
  }
}`);
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [responseView, setResponseView] = useState('raw'); // 'raw', 'formatted', or 'table'
  const [parsedResponse, setParsedResponse] = useState(null);
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [corsInvestigation, setCorsInvestigation] = useState(null);
  const [newToken, setNewToken] = useState('');
  const [tokenRefreshing, setTokenRefreshing] = useState(false);
  const [showTokenPopup, setShowTokenPopup] = useState(false);
  const sendRequest = async () => {
    setLoading(true);
    try {
      const parsedHeaders = JSON.parse(headers);
      
      const options = {
        method,
        headers: parsedHeaders
      };
      
      if (method !== 'GET' && body.trim()) {
        options.body = body;
      }
      
      const result = await fetch(endpoint, options);
      const responseText = await result.text();
      
      // Capture CORS headers from the response
      const corsHeaders = {};
      result.headers.forEach((value, key) => {
        if (key.toLowerCase().startsWith('access-control-')) {
          corsHeaders[key] = value;
        }
      });
      
      let responseWithCors = `Status: ${result.status} ${result.statusText}`;
      if (Object.keys(corsHeaders).length > 0) {
        responseWithCors += `\n\nCORS Headers:\n${JSON.stringify(corsHeaders, null, 2)}`;
      }
      responseWithCors += `\n\n${responseText}`;
      
      setResponse(responseWithCors);
      
      try {
        const jsonResponse = JSON.parse(responseText);
        setParsedResponse(jsonResponse);
      } catch (e) {
        setParsedResponse(null);
      }
    } catch (error) {
      setResponse(`Error: ${error.message}`);
      setParsedResponse(null);
    } finally {
      setLoading(false);
    }
  };

  const investigateCORSHeaders = async () => {
    setLoading(true);
    try {
      const parsedHeaders = JSON.parse(headers);
      const result = await investigateCORS(endpoint, parsedHeaders, method);
      setCorsInvestigation(result);
      
      // Also display in response area
      setResponse(`CORS Investigation Results:\n\n${JSON.stringify(result, null, 2)}`);
    } catch (error) {
      setResponse(`CORS Investigation Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const refreshToken = async () => {
    if (!newToken.trim()) {
      alert('Please enter a token');
      return;
    }
    
    setTokenRefreshing(true);
    try {
      const response = await fetch('http://localhost:3001/api/refresh-token', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ token: newToken.trim() })
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

  const copyResponse = () => {
    navigator.clipboard.writeText(response);
  };

  const searchOrganisations = () => {
    setBody(`{
  "query": "",
  "kind": "*:*:master-data--Organisation:*",
  "cursor": null,
  "limit": 100,
  "sort": {
    "field": [
      "id"
    ],
    "order": [
      "desc"
    ]
  }
}`);
    sendRequest();
  };

  const loadNextPage = () => {
    if (parsedResponse?.cursor) {
      try {
        const currentBody = JSON.parse(body);
        currentBody.cursor = parsedResponse.cursor;
        setBody(JSON.stringify(currentBody, null, 2));
        sendRequest();
      } catch (error) {
        console.error('Error parsing body for pagination:', error);
      }
    }
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
        a.download = `${extractNameFromId(recordId)}.json`;
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

  const extractNameFromId = (id) => {
    if (!id || typeof id !== 'string') return 'Unknown';
    const parts = id.split(':');
    return parts[parts.length - 1] || 'Unknown';
  };

  const getDisplayName = (record) => {
    // Try common name fields first
    if (record.name) return record.name;
    if (record.Name) return record.Name;
    if (record.title) return record.title;
    if (record.Title) return record.Title;
    
    // Extract from ID as fallback
    return extractNameFromId(record.id);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getEntityDisplayInfo = (record) => {
    const kind = record.kind || record.type || '';
    const kindParts = kind.split(':');
    
    if (kindParts.length >= 3) {
      const category = kindParts[2].split('--')[0];
      const entityType = kindParts[2].split('--')[1]?.split(':')[0] || '';
      
      const categoryMap = {
        'dataset': { name: 'Dataset', icon: Database, color: '#20c997' },
        'datacollection': { name: 'Data Collection', icon: Database, color: '#17a2b8' },
        'master-data': { name: 'Master-Data', icon: Building2, color: '#28a745' },
        'reference-data': { name: 'Reference-Data', icon: FileText, color: '#6f42c1' },
        'work-product-component': { name: 'Work-Product-Component', icon: BarChart, color: '#fd7e14' },
        'abstract': { name: 'Abstract', icon: FileText, color: '#6c757d' },
        'manifest': { name: 'Manifest', icon: FileText, color: '#dc3545' },
        'work-product': { name: 'Work-Product', icon: BarChart3, color: '#ffc107' }
      };
      
      const categoryInfo = categoryMap[category] || { name: category, icon: FileText, color: '#6c757d' };
      
      let displayName = record.data?.Name || record.name || record.title || entityType;
      let details = '';
      
      switch (category) {
        case 'dataset':
          displayName = record.data?.Name || record.data?.FileName || displayName;
          details = [record.data?.FileType, record.data?.FileSize, record.data?.Format].filter(Boolean).join(' • ');
          break;
        case 'datacollection':
          displayName = record.data?.Name || record.data?.CollectionName || displayName;
          details = [record.data?.DatasetCount, record.data?.CollectionType].filter(Boolean).join(' • ');
          break;
        case 'master-data':
          displayName = record.data?.Name || record.data?.FacilityName || record.data?.OrganisationName || displayName;
          if (entityType === 'Organisation') {
            details = [record.data?.OrganisationType, record.data?.Country].filter(Boolean).join(' • ');
          } else if (entityType === 'Well') {
            details = [record.data?.OperatingCompany, record.data?.Country].filter(Boolean).join(' • ');
          } else if (entityType === 'Wellbore') {
            details = record.data?.WellID ? `Well: ${record.data.WellID}` : '';
          } else {
            details = [record.data?.Type, record.data?.Status].filter(Boolean).join(' • ');
          }
          break;
        case 'reference-data':
          displayName = record.data?.Name || record.data?.Symbol || displayName;
          if (entityType === 'UnitOfMeasure') {
            details = record.data?.MeasurementType || '';
          } else if (entityType === 'CoordinateReferenceSystem') {
            details = record.data?.ProjectionType || '';
          } else {
            details = [record.data?.Category, record.data?.Type].filter(Boolean).join(' • ');
          }
          break;
        case 'work-product-component':
          displayName = record.data?.Name || record.data?.SurveyName || record.data?.LogName || displayName;
          if (entityType === 'SeismicTraceData') {
            details = [record.data?.DataType, record.data?.ProcessingStage].filter(Boolean).join(' • ');
          } else if (entityType === 'WellLog') {
            details = record.data?.WellboreID ? `Wellbore: ${record.data.WellboreID}` : (record.data?.CurveCount ? `${record.data.CurveCount} curves` : '');
          } else {
            details = [record.data?.ComponentType, record.data?.Status].filter(Boolean).join(' • ');
          }
          break;
        case 'abstract':
          displayName = record.data?.Name || record.data?.Title || displayName;
          details = [record.data?.AbstractType, record.data?.Version].filter(Boolean).join(' • ');
          break;
        case 'manifest':
          displayName = record.data?.Name || record.data?.ManifestName || displayName;
          details = [record.data?.ManifestType, record.data?.ItemCount].filter(Boolean).join(' • ');
          break;
        case 'work-product':
          displayName = record.data?.Name || record.data?.ProductName || displayName;
          details = [record.data?.ProductType, record.data?.Status].filter(Boolean).join(' • ');
          break;
        default:
          details = record.id || '';
      }
      
      return {
        displayName,
        category: categoryInfo.name,
        categoryIcon: categoryInfo.icon,
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

  const getSortedResults = () => {
    if (!parsedResponse?.results || !sortField) return parsedResponse.results;
    
    return [...parsedResponse.results].sort((a, b) => {
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

  const renderTableView = () => {
    if (!parsedResponse?.results) return null;
    
    const sortedResults = getSortedResults();
    
    return (
      <div style={{ border: '1px solid #ddd', borderRadius: '4px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white' }}>
          <thead>
            <tr style={{ background: '#f8f9fa' }}>
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
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                Name {renderSortIcon('name')}
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
                  userSelect: 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  ID {renderSortIcon('id')}
                </div>
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
                  userSelect: 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  Type {renderSortIcon('type')}
                </div>
              </th>
              <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #ddd', fontWeight: 'bold', color: '#333' }}>Details</th>
            </tr>
          </thead>
          <tbody>
            {sortedResults.map((record, index) => {
              const entityInfo = getEntityDisplayInfo(record);
              const IconComponent = entityInfo.categoryIcon;
              
              return (
                <tr key={index} style={{ borderBottom: '1px solid #eee', backgroundColor: 'white', borderLeft: `4px solid ${entityInfo.categoryColor}` }}>
                  <td 
                    onClick={() => downloadRecord(record.id)}
                    style={{ 
                      padding: '0.75rem', 
                      fontWeight: '500', 
                      color: '#007bff',
                      cursor: 'pointer',
                      textDecoration: 'underline'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#f8f9fa';
                      e.target.style.color = '#0056b3';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'white';
                      e.target.style.color = '#007bff';
                    }}
                    title={`Click to download: ${record.id}`}
                  >
                    {entityInfo.displayName}
                  </td>
                  <td 
                    style={{ padding: '0.75rem', fontSize: '12px', color: '#666', cursor: 'help' }}
                    title={record.id}
                  >
                    {entityInfo.simplifiedId}
                  </td>
                  <td style={{ padding: '0.75rem', fontSize: '12px', color: entityInfo.categoryColor, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <IconComponent size={16} color={entityInfo.categoryColor} />
                    {entityInfo.category}
                  </td>
                  <td style={{ padding: '0.75rem', fontSize: '12px', color: '#28a745' }}>{entityInfo.details}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '2rem' }}>OSDU Service Tester</h2>
      

      
      <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>



        {method !== 'GET' && (
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Body (JSON):
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              style={{
                width: '100%',
                height: '120px',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontFamily: 'monospace',
                fontSize: '12px'
              }}
            />
          </div>
        )}
        
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            onClick={sendRequest}
            disabled={loading}
            style={{
              padding: '0.75rem 1.5rem',
              background: loading ? '#6c757d' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              justifyContent: 'center'
            }}
          >
            <Send size={16} />
            {loading ? 'Sending...' : 'Send Request'}
          </button>
          
          <button
            onClick={searchOrganisations}
            disabled={loading}
            style={{
              padding: '0.75rem 1.5rem',
              background: loading ? '#6c757d' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              justifyContent: 'center'
            }}
          >
            <Building2 size={16} />
            Search Organisations
          </button>
          

        </div>
      </div>
      
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
          <label style={{ fontWeight: 'bold' }}>Response:</label>
          
          {parsedResponse && (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setResponseView('raw')}
                style={{
                  padding: '0.25rem 0.5rem',
                  background: responseView === 'raw' ? '#007bff' : '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  fontSize: '12px'
                }}
              >
                <Code size={12} />
                Raw
              </button>
              <button
                onClick={() => setResponseView('formatted')}
                style={{
                  padding: '0.25rem 0.5rem',
                  background: responseView === 'formatted' ? '#007bff' : '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  fontSize: '12px'
                }}
              >
                <Eye size={12} />
                Formatted
              </button>
              <button
                onClick={() => setResponseView('table')}
                style={{
                  padding: '0.25rem 0.5rem',
                  background: responseView === 'table' ? '#007bff' : '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  fontSize: '12px'
                }}
              >
                <Table size={12} />
                Table
              </button>
            </div>
          )}
          
          {response && (
            <button
              onClick={copyResponse}
              style={{
                padding: '0.25rem 0.5rem',
                background: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontSize: '12px'
              }}
            >
              <Copy size={12} />
              Copy
            </button>
          )}
        </div>
        
        {parsedResponse && parsedResponse.results && (
          <div style={{ marginBottom: '1rem', padding: '0.5rem', background: '#e8f4fd', borderRadius: '4px', fontSize: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>📊 Found {parsedResponse.totalCount || parsedResponse.results.length} records
            {parsedResponse.cursor && ' • Has more results'}</span>
            {parsedResponse.cursor && (
              <button
                onClick={loadNextPage}
                disabled={loading}
                style={{
                  padding: '0.5rem 1rem',
                  background: loading ? '#6c757d' : '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '12px'
                }}
              >
                {loading ? 'Loading...' : 'Next 100 →'}
              </button>
            )}
          </div>
        )}
        
        {responseView === 'formatted' && parsedResponse ? (
          <div style={{
            border: '1px solid #ddd',
            borderRadius: '4px',
            backgroundColor: '#f8f9fa',
            maxHeight: '600px',
            overflow: 'auto'
          }}>
            <JSONTree 
              data={parsedResponse} 
              theme={{
                scheme: 'bright',
                base00: '#000000',
                base01: '#303030',
                base02: '#505050',
                base03: '#b0b0b0',
                base04: '#d0d0d0',
                base05: '#e0e0e0',
                base06: '#f5f5f5',
                base07: '#ffffff',
                base08: '#fb0120',
                base09: '#fc6d24',
                base0A: '#fda331',
                base0B: '#a1c659',
                base0C: '#76c7b7',
                base0D: '#6fb3d2',
                base0E: '#d381c3',
                base0F: '#be643c'
              }}
              invertTheme={false}
              shouldExpandNode={(keyPath, data, level) => level < 2}
            />
          </div>
        ) : responseView === 'table' && parsedResponse ? (
          renderTableView()
        ) : (
          <textarea
            value={response}
            readOnly
            style={{
              width: '100%',
              height: '400px',
              padding: '0.5rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '12px',
              backgroundColor: '#f8f9fa'
            }}
          />
        )}
      </div>
      
      {/* Floating OSDU Connection Button */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 1000
      }}>
        <button
          onClick={() => setShowTokenPopup(!showTokenPopup)}
          style={{
            padding: '1rem',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '50px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          🔑 OSDU Connection
        </button>
        
        {/* Token Update Popup */}
        {showTokenPopup && (
          <div style={{
            position: 'absolute',
            bottom: '70px',
            right: '0',
            width: '400px',
            padding: '1rem',
            background: 'white',
            border: '1px solid #ddd',
            borderRadius: '8px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
          }}>
            <div style={{ marginBottom: '1rem', fontWeight: 'bold', color: '#333' }}>
              🔑 Update OSDU Token
            </div>
            <input
              type="text"
              placeholder="Paste new token here"
              value={newToken}
              onChange={(e) => setNewToken(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontFamily: 'monospace',
                fontSize: '12px',
                marginBottom: '1rem'
              }}
            />
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={refreshToken}
                disabled={tokenRefreshing || !newToken.trim()}
                style={{
                  flex: 1,
                  padding: '0.5rem 1rem',
                  background: tokenRefreshing || !newToken.trim() ? '#6c757d' : '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: tokenRefreshing || !newToken.trim() ? 'not-allowed' : 'pointer'
                }}
              >
                {tokenRefreshing ? 'Updating...' : 'Update Token'}
              </button>
              <button
                onClick={() => setShowTokenPopup(false)}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
            <small style={{ color: '#666', display: 'block', marginTop: '0.5rem' }}>
              Paste your new OSDU token above and click Update Token
            </small>
          </div>
        )}
      </div>
    </div>
  );
};

export default OsduTestPage;
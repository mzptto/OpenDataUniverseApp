import React, { useState } from 'react';
import { Search, Database, BarChart3, Building2, MapPin, FileText, BarChart } from 'lucide-react';
import { OSDUApi } from '../services/osduApi';

// Entity type parsing and display logic
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
    
    // Data type-specific display logic
    let displayName = record.data?.Name || record.name || record.title || entityType;
    let details = '';
    
    console.log('🔍 Processing record:', { category, entityType, recordData: record.data });
    
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
      simplifiedId: `${categoryInfo.name.split('-')[0]} • ${entityType}`
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

const OsduDataBrowser = ({ isOpen, onClose, onRecordSelect }) => {
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('main'); // 'main', 'types', 'records'
  const [dataTypes, setDataTypes] = useState([]);
  const [records, setRecords] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);

  const analyzeDataTypes = async () => {
    console.log('🚀 Button clicked - starting analysis');
    setLoading(true);
    try {
      console.log('🔍 Analyzing OSDU data types...');
      const osduApi = new OSDUApi();
      console.log('📡 OSDU API created:', osduApi);
      
      // Get all records
      const result = await osduApi.executeGraphQL(`query {
        search(input: {
          query: "*",
          index: "*",
          dataPartition: "osdu"
        }) {
          total
          items
        }
      }`);
      
      console.log('📥 GraphQL result:', result);

      if (result.data?.search) {
        const { total, items } = result.data.search;
        setTotalRecords(total);
        
        // Analyze data types from items
        const typeAnalysis = {};
        
        items.forEach((item, index) => {
          console.log('🔍 Processing item:', item.kind, item);
          const entityInfo = getEntityDisplayInfo(item);
          console.log('📊 Entity info:', entityInfo);
          const type = `${entityInfo.category} • ${entityInfo.entityType}`;
          
          if (!typeAnalysis[type]) {
            typeAnalysis[type] = {
              type: type,
              category: entityInfo.category,
              entityType: entityInfo.entityType,
              categoryIcon: entityInfo.categoryIcon,
              categoryColor: entityInfo.categoryColor,
              count: 0,
              samples: []
            };
          }
          
          typeAnalysis[type].count++;
          if (typeAnalysis[type].samples.length < 3) {
            typeAnalysis[type].samples.push({
              id: item.id || `item-${index}`,
              name: entityInfo.displayName,
              details: entityInfo.details,
              simplifiedId: entityInfo.simplifiedId,
              data: item
            });
          }
        });

        const sortedTypes = Object.values(typeAnalysis)
          .sort((a, b) => b.count - a.count);
        
        setDataTypes(sortedTypes);
        setView('types');
        
        console.log('📊 Data type analysis:', sortedTypes);
      }
    } catch (error) {
      console.error('❌ Failed to analyze data types:', error);
      console.error('❌ Error details:', error.message, error.stack);
    } finally {
      console.log('✅ Analysis complete, setting loading to false');
      setLoading(false);
    }
  };

  const viewTypeRecords = (dataType) => {
    setRecords(dataType.samples);
    setView('records');
  };

  const handleRecordSelect = (record) => {
    onRecordSelect(record.data);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{
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
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '18px', color: '#333' }}>
          OSDU Data Explorer
        </h3>
        
        {view === 'main' && (
          <>
            <button
              onClick={analyzeDataTypes}
              disabled={loading}
              style={{
                width: '100%',
                padding: '1rem',
                background: loading ? '#6c757d' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                justifyContent: 'center'
              }}
            >
              <BarChart3 size={20} />
              {loading ? 'Analyzing...' : 'Analyze Data Types'}
            </button>
            
            <div style={{ 
              marginTop: '1rem', 
              padding: '1rem', 
              background: '#f8f9fa', 
              borderRadius: '6px',
              fontSize: '14px',
              color: '#666'
            }}>
              Click "Analyze Data Types" to discover what types of data exist in your OSDU backend and see counts for each type.
            </div>
          </>
        )}

        {view === 'types' && (
          <>
            <button
              onClick={() => setView('main')}
              style={{
                background: 'none',
                border: 'none',
                color: '#007bff',
                cursor: 'pointer',
                fontSize: '14px',
                marginBottom: '1rem'
              }}
            >
              ← Back
            </button>
            
            <div style={{ 
              fontSize: '14px', 
              color: '#666', 
              marginBottom: '1rem',
              padding: '0.5rem',
              background: '#e9ecef',
              borderRadius: '4px'
            }}>
              Found {dataTypes.length} data types in {totalRecords} total records
            </div>
          </>
        )}

        {view === 'records' && (
          <>
            <button
              onClick={() => setView('types')}
              style={{
                background: 'none',
                border: 'none',
                color: '#007bff',
                cursor: 'pointer',
                fontSize: '14px',
                marginBottom: '1rem'
              }}
            >
              ← Back to Types
            </button>
            
            <div style={{ 
              fontSize: '14px', 
              color: '#666', 
              marginBottom: '1rem' 
            }}>
              Sample records:
            </div>
          </>
        )}
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {view === 'main' && (
          <div style={{ 
            textAlign: 'center', 
            color: '#666', 
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <Database size={48} color="#ccc" />
            <div>
              <div style={{ fontSize: '16px', marginBottom: '0.5rem' }}>
                OSDU Data Explorer
              </div>
              <div style={{ fontSize: '14px' }}>
                Discover and analyze your OSDU data types
              </div>
            </div>
          </div>
        )}

        {view === 'types' && (
          <div>
            {dataTypes.map((dataType, index) => {
              const IconComponent = dataType.categoryIcon || FileText;
              return (
                <div
                  key={index}
                  style={{
                    padding: '1rem',
                    borderBottom: '1px solid #f0f0f0',
                    cursor: 'pointer',
                    backgroundColor: 'white',
                    borderLeft: `4px solid ${dataType.categoryColor || '#6c757d'}`
                  }}
                  onClick={() => viewTypeRecords(dataType)}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                >
                  <div style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '4px'
                  }}>
                    <IconComponent size={16} color={dataType.categoryColor} />
                    <span style={{
                      fontWeight: 'bold', 
                      fontSize: '14px', 
                      color: '#333'
                    }}>
                      {dataType.entityType}
                    </span>
                  </div>
                  <div style={{ 
                    fontSize: '11px', 
                    color: dataType.categoryColor,
                    marginBottom: '4px',
                    marginLeft: '22px'
                  }}>
                    {dataType.category}
                  </div>
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#666',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span>{dataType.count} records</span>
                    <span style={{ color: '#007bff' }}>View samples →</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {view === 'records' && (
          <div>
            {records.map((record, index) => (
              <div
                key={index}
                style={{
                  padding: '1rem',
                  borderBottom: '1px solid #f0f0f0',
                  cursor: 'pointer',
                  backgroundColor: 'white'
                }}
                onClick={() => handleRecordSelect(record)}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
              >
                <div style={{ 
                  fontWeight: 'bold', 
                  fontSize: '14px', 
                  color: '#333',
                  marginBottom: '4px'
                }}>
                  {record.name}
                </div>
                {record.details && (
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#28a745',
                    marginBottom: '2px'
                  }}>
                    {record.details}
                  </div>
                )}
                <div style={{ 
                  fontSize: '11px', 
                  color: '#666' 
                }}>
                  {record.simplifiedId}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OsduDataBrowser;
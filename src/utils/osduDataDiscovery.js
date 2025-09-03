// OSDU Data Discovery Utility
// Systematically discovers what data exists in the OSDU backend

import { OSDUApi } from '../services/osduApi';

export const discoverOsduData = async (osduApi) => {
  console.log('🔍 Starting OSDU Data Discovery...');
  
  const results = {
    introspection: null,
    entityTypes: [],
    sampleData: [],
    workingQueries: []
  };

  // 1. Try GraphQL introspection to understand the schema
  try {
    console.log('📋 Attempting GraphQL introspection...');
    const introspectionQuery = `
      query IntrospectionQuery {
        __schema {
          queryType {
            name
            fields {
              name
              description
              args {
                name
                type {
                  name
                  kind
                }
              }
            }
          }
        }
      }
    `;
    
    const introspectionResult = await osduApi.executeGraphQL(introspectionQuery);
    results.introspection = introspectionResult;
    console.log('✅ Introspection successful:', introspectionResult);
    
    // Log available queries
    if (introspectionResult?.data?.__schema?.queryType?.fields) {
      const availableQueries = introspectionResult.data.__schema.queryType.fields.map(f => ({
        name: f.name,
        description: f.description,
        args: f.args?.map(arg => `${arg.name}: ${arg.type?.name || arg.type?.kind}`) || []
      }));
      console.log('🔍 Available GraphQL queries:', availableQueries);
      
      // Test each available query that looks like a search function
      const searchQueries = availableQueries.filter(q => 
        q.name.toLowerCase().includes('search') || 
        q.name.toLowerCase().includes('record') || 
        q.name.toLowerCase().includes('get')
      );
      
      console.log('🎯 Testing search-related queries:', searchQueries.map(q => q.name));
      
      for (const queryInfo of searchQueries) {
        try {
          let testQuery;
          
          // Build appropriate test query based on query name and args
          if (queryInfo.name === 'search') {
            testQuery = `query { search(input: { query: "*", index: "*", dataPartition: "osdu", limit: 5 }) { __typename } }`;
          } else if (queryInfo.name === 'advancedSearch') {
            testQuery = `query { advancedSearch(input: { query: "*", index: "*", dataPartition: "osdu", limit: 5 }) { __typename } }`;
          } else if (queryInfo.name === 'facetedSearch') {
            testQuery = `query { facetedSearch(input: { query: "*", index: "*", dataPartition: "osdu", limit: 5 }) { __typename } }`;
          } else if (queryInfo.name === 'geoSearch') {
            testQuery = `query { geoSearch(input: { query: "*", index: "*", dataPartition: "osdu", limit: 5 }) { __typename } }`;
          } else if (queryInfo.name.includes('get')) {
            // Skip get queries that require specific IDs
            continue;
          } else {
            // Generic test for other search queries
            testQuery = `query { ${queryInfo.name} { __typename } }`;
          }
          
          console.log(`🧪 Testing ${queryInfo.name}:`, testQuery);
          const result = await osduApi.executeGraphQL(testQuery);
          
          if (result?.data && !result.errors) {
            const data = result.data[queryInfo.name];
            console.log(`✅ ${queryInfo.name} query successful, response:`, data);
            results.workingQueries.push(testQuery);
            
            // Now try a more detailed query to get actual data
            let detailedQuery;
            if (queryInfo.name === 'search') {
              detailedQuery = `query { search(input: { query: "*", index: "*", dataPartition: "osdu", limit: 10 }) { __typename } }`;
            } else {
              detailedQuery = testQuery;
            }
            
            try {
              const detailedResult = await osduApi.executeGraphQL(detailedQuery);
              if (detailedResult?.data) {
                console.log(`🔍 ${queryInfo.name} detailed response:`, detailedResult.data);
                results.sampleData.push({
                  query: detailedQuery,
                  queryName: queryInfo.name,
                  totalCount: 1,
                  sampleRecords: [{ id: 'test', kind: queryInfo.name, data: detailedResult.data }]
                });
              }
            } catch (detailedError) {
              console.log(`⚠️ ${queryInfo.name} detailed query failed:`, detailedError.message);
            }
          } else if (result?.errors) {
            console.log(`❌ ${queryInfo.name} returned errors:`, result.errors.map(e => e.message));
          }
        } catch (error) {
          console.log(`❌ ${queryInfo.name} failed:`, error.message);
        }
      }
    }
  } catch (error) {
    console.log('❌ Introspection failed:', error.message);
  }

  // 2. Test with correct syntax now that we know the schema
  console.log('🎯 Testing with correct GraphQL syntax...');
  
  // First test basic connectivity, then get actual data
  const testQueries = [
    {
      name: 'Basic Search Test',
      query: `query { search(input: { query: "*", index: "*", dataPartition: "osdu" }) { __typename } }`
    },
    {
      name: 'Get Search Fields',
      query: `query { search(input: { query: "*", index: "*", dataPartition: "osdu" }) { __typename } }`
    }
  ];
  
  // Try to get the actual search response structure using introspection
  try {
    const schemaQuery = `
      query {
        __type(name: "SearchResult") {
          fields {
            name
            type {
              name
              kind
              ofType {
                name
                kind
              }
            }
          }
        }
      }
    `;
    
    const schemaResult = await osduApi.executeGraphQL(schemaQuery);
    if (schemaResult?.data?.__type?.fields) {
      const availableFields = schemaResult.data.__type.fields.map(f => f.name);
      console.log('🔍 Available SearchResult fields:', availableFields);
      
      // Build a query with available fields
      const fieldQuery = availableFields.slice(0, 5).join(' ');
      const dataQuery = `query { search(input: { query: "*", index: "*", dataPartition: "osdu" }) { ${fieldQuery} } }`;
      
      console.log('🧪 Testing with available fields:', dataQuery);
      const dataResult = await osduApi.executeGraphQL(dataQuery);
      
      if (dataResult?.data?.search && !dataResult.errors) {
        console.log('✅ Got search data:', dataResult.data.search);
        results.sampleData.push({
          query: dataQuery,
          queryName: 'search',
          totalCount: 1,
          sampleRecords: [{ id: 'search-result', kind: 'SearchResult', data: dataResult.data.search }]
        });
        results.workingQueries.push(dataQuery);
      }
    }
  } catch (error) {
    console.log('❌ Schema introspection failed:', error.message);
  }
  
  // Try common field patterns
  const fieldPatterns = [
    'totalCount',
    'results { id }',
    'hits { id }',
    'records { id }',
    'data { id }',
    'items { id }'
  ];
  
  for (const pattern of fieldPatterns) {
    try {
      const testQuery = `query { search(input: { query: "*", index: "*", dataPartition: "osdu" }) { ${pattern} } }`;
      console.log(`🧪 Testing field pattern: ${pattern}`);
      
      const result = await osduApi.executeGraphQL(testQuery);
      if (result?.data?.search && !result.errors) {
        console.log(`✅ Field pattern works: ${pattern}`);
        console.log(`📊 Response:`, result.data.search);
        
        results.workingQueries.push(testQuery);
        
        // If we got actual data, save it
        const searchData = result.data.search;
        if (searchData.totalCount > 0 || searchData.results?.length > 0 || searchData.hits?.length > 0 || searchData.records?.length > 0) {
          results.sampleData.push({
            query: testQuery,
            queryName: 'search',
            totalCount: searchData.totalCount || searchData.results?.length || searchData.hits?.length || searchData.records?.length || 1,
            sampleRecords: searchData.results || searchData.hits || searchData.records || [searchData]
          });
          console.log(`🎉 Found actual data with pattern: ${pattern}`);
          break; // Found working pattern, stop testing
        }
      } else if (result?.errors) {
        console.log(`❌ Field pattern failed: ${result.errors.map(e => e.message)}`);
      }
    } catch (error) {
      console.log(`❌ Pattern error: ${error.message}`);
    }
  }





  console.log('🎉 Discovery complete!');
  console.log('📊 Summary:', {
    foundEntityTypes: results.entityTypes.length,
    workingQueries: results.workingQueries.length,
    hasIntrospection: !!results.introspection,
    sampleDataSources: results.sampleData.length
  });
  
  if (results.sampleData.length > 0) {
    console.log('🎯 Found data sources:', results.sampleData.map(sd => `${sd.queryName}: ${sd.totalCount} records`));
  } else if (results.workingQueries.length > 0) {
    console.log('⚠️ Queries work but no data returned - OSDU backend may be empty or require different parameters');
  }

  return results;
};
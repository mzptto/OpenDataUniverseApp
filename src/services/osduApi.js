import { getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';

// Add executeGraphQL method
const executeGraphQL = async (query) => {
  try {
    const session = await fetchAuthSession({ forceRefresh: false });
    const token = session.tokens?.accessToken?.toString() || session.tokens?.idToken?.toString();
    
    if (!token) {
      throw new Error('No auth token available');
    }
    
    const response = await fetch(process.env.REACT_APP_SEARCH_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
      body: JSON.stringify({ query })
    });
    
    const result = await response.json();
    return result;
  } catch (error) {
    throw error;
  }
};

export class OSDUApi {
  
  async executeGraphQL(query) {
    return executeGraphQL(query);
  }
  static async testConnection() {
    try {
      const user = await getCurrentUser();
      console.log('Authenticated user:', user);
      return { success: true, user };
    } catch (error) {
      console.error('Authentication failed:', error);
      return { success: false, error: error.message };
    }
  }

  static async testGraphQLConnection() {
    try {
      // Get session without identity pool
      const session = await fetchAuthSession({ forceRefresh: false });
      const token = session.tokens?.accessToken?.toString() || session.tokens?.idToken?.toString();
      
      if (!token) {
        return { success: false, error: 'No auth token available' };
      }
      
      const response = await fetch(process.env.REACT_APP_SCHEMA_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
        body: JSON.stringify({
          query: '{ __typename }'
        })
      });
      
      const result = await response.json();
      return { success: response.ok, result, status: response.status };
    } catch (error) {
      console.error('GraphQL test failed:', error);
      return { success: false, error: error.message };
    }
  }

  static async testOrganisationSearch() {
    try {
      const session = await fetchAuthSession({ forceRefresh: false });
      const token = session.tokens?.accessToken?.toString() || session.tokens?.idToken?.toString();
      
      if (!token) {
        return { success: false, error: 'No auth token available' };
      }
      
      // Test different query variations
      const queries = [
        // Standard GraphQL search query
        {
          name: 'GraphQL Search Query',
          query: `
            query SearchOrganisations {
              searchRecords(query: "kind:*Organisation*", limit: 10) {
                records {
                  id
                  kind
                  data
                }
                totalCount
              }
            }
          `
        },
        // Alternative query structure
        {
          name: 'Alternative Search',
          query: `
            query {
              search(input: {
                query: "kind:osdu:wks:master-data--Organisation:*"
                limit: 10
              }) {
                results {
                  id
                  kind
                  data
                }
              }
            }
          `
        },
        // Simple introspection to see available queries
        {
          name: 'Schema Introspection',
          query: `
            query {
              __schema {
                queryType {
                  fields {
                    name
                    description
                  }
                }
              }
            }
          `
        }
      ];
      
      const results = [];
      
      for (const testQuery of queries) {
        try {
          const response = await fetch(process.env.REACT_APP_SEARCH_API_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': token,
            },
            body: JSON.stringify({
              query: testQuery.query
            })
          });
          
          const result = await response.json();
          results.push({
            name: testQuery.name,
            success: response.ok,
            status: response.status,
            result: result
          });
        } catch (error) {
          results.push({
            name: testQuery.name,
            success: false,
            error: error.message
          });
        }
      }
      
      return { success: true, results };
    } catch (error) {
      console.error('Organisation search test failed:', error);
      return { success: false, error: error.message };
    }
  }

  static async searchOrganisations() {
    console.log('🔍 Starting Organisation search with timestamp:', Date.now());
    
    // Use the exact same test method that worked before
    const testResult = await this.testOrganisationSearch();
    
    if (!testResult.success) {
      throw new Error('Test search failed');
    }
    
    // Check what GraphQL queries are actually available
    const schemaResult = testResult.results.find(r => r.name === 'Schema Introspection' && r.success);
    
    if (schemaResult?.result?.data?.__schema?.queryType?.fields) {
      const availableQueries = schemaResult.result.data.__schema.queryType.fields.map(f => f.name);
      console.log('🔍 Available GraphQL queries:', availableQueries);
      
      // Check if any search-related queries exist
      const searchQueries = availableQueries.filter(q => 
        q.toLowerCase().includes('search') || 
        q.toLowerCase().includes('record') || 
        q.toLowerCase().includes('organisation')
      );
      console.log('🔍 Search-related queries:', searchQueries);
      
      if (searchQueries.length === 0) {
        console.log('❌ No search queries available in GraphQL schema');
        console.log('📋 All available queries:', availableQueries);
        throw new Error(`OSDU backend does not support search operations. Available queries: ${availableQueries.join(', ')}`);
      }
    }
    
    // The backend has search capability, let's try the basic search query directly
    try {
      const session = await fetchAuthSession({ forceRefresh: false });
      const token = session.tokens?.accessToken?.toString() || session.tokens?.idToken?.toString();
      
      const response = await fetch(process.env.REACT_APP_SEARCH_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
        body: JSON.stringify({
          query: `
            query {
              search(input: {
                kind: "osdu:wks:*:*"
                query: "*"
                limit: 10
              }) {
                results {
                  id
                  type
                  data {
                    title
                    description
                    tags
                  }
                }
                totalCount
              }
            }
          `
        })
      });
      
      const result = await response.json();
      console.log('🔍 Direct search response:', {
        status: response.status,
        hasErrors: !!result.errors,
        errors: result.errors,
        dataKeys: result.data ? Object.keys(result.data) : 'no data'
      });
      
      if (result.errors) {
        console.log('❌ Search errors:', result.errors.map(e => e.message));
        console.log('🔍 Full error details:', result.errors);
        
        // Try a simpler query without wildcards
        console.log('🔄 Trying simpler search query...');
        const simpleResponse = await fetch(process.env.REACT_APP_SEARCH_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token,
          },
          body: JSON.stringify({
            query: `
              query {
                search(input: {
                  kind: "osdu:wks:*:*"
                  query: "*"
                  limit: 10
                }) {
                  results {
                    id
                    type
                    data {
                      title
                      description
                      tags
                    }
                  }
                  totalCount
                }
              }
            `
          })
        });
        
        const simpleResult = await simpleResponse.json();
        console.log('🔍 Simple search result:', simpleResult);
        
        if (simpleResult.data?.search?.results) {
          const records = simpleResult.data.search.results;
          console.log('✅ Found', records.length, 'records with simple search');
          return records.map(record => ({
            id: record.id,
            kind: record.kind,
            organisationName: record.data?.OrganisationName || 'Unknown Organisation',
            organisationId: this.extractOrganisationId(record.id),
            fullRecord: record
          }));
        }
        
        return [];
      }
      
      const records = result.data?.search?.results || [];
      console.log('📊 Found', records.length, 'Organisation records');
      
      return records.map(record => ({
        id: record.id,
        kind: record.kind,
        organisationName: record.data?.OrganisationName || 'Unknown Organisation',
        organisationId: this.extractOrganisationId(record.id),
        fullRecord: record
      }));
      
    } catch (searchError) {
      console.error('❌ Direct search failed:', searchError);
      return [];
    }

  }

  static async getRecordById(id) {
    try {
      const session = await fetchAuthSession({ forceRefresh: false });
      const token = session.tokens?.accessToken?.toString() || session.tokens?.idToken?.toString();
      
      console.log('🔐 Token info:', {
        hasAccessToken: !!session.tokens?.accessToken,
        hasIdToken: !!session.tokens?.idToken,
        tokenLength: token?.length || 0,
        tokenPrefix: token?.substring(0, 20) + '...'
      });
      
      if (!token) {
        throw new Error('No auth token available');
      }
      
      const response = await fetch(process.env.REACT_APP_SEARCH_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
        body: JSON.stringify({
          query: `
            query GetRecord($id: String!) {
              getRecord(id: $id) {
                id
                kind
                version
                acl
                legal
                data
              }
            }
          `,
          variables: { id }
        })
      });
      
      const result = await response.json();
      
      if (!response.ok || result.errors) {
        throw new Error(result.errors?.[0]?.message || 'Record fetch failed');
      }
      
      return result.data?.getRecord;
    } catch (error) {
      console.error('Record fetch failed:', error);
      throw error;
    }
  }

  static async searchOpenSearch(query = '*', index = '*') {
    try {
      const session = await fetchAuthSession({ forceRefresh: false });
      const token = session.tokens?.accessToken?.toString() || session.tokens?.idToken?.toString();
      
      console.log('🔍 OpenSearch query:', { query, index, endpoint: process.env.REACT_APP_OPENSEARCH_ENDPOINT });
      
      const response = await fetch(`${process.env.REACT_APP_OPENSEARCH_ENDPOINT}/${index}/_search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: {
            query_string: {
              query: query
            }
          },
          size: 50
        })
      });
      
      const result = await response.json();
      console.log('📊 OpenSearch response:', {
        status: response.status,
        totalHits: result.hits?.total?.value || 0,
        hits: result.hits?.hits?.length || 0
      });
      
      if (!response.ok) {
        throw new Error(`OpenSearch error: ${response.status} ${result.error?.type || ''}`);
      }
      
      const records = result.hits?.hits?.map(hit => ({
        id: hit._id,
        index: hit._index,
        kind: hit._source?.kind || hit._source?.type,
        organisationName: hit._source?.data?.OrganisationName || hit._source?.OrganisationName || 'Unknown',
        organisationId: hit._id.split(':').pop(),
        fullRecord: hit._source
      })) || [];
      
      console.log('✅ Processed OpenSearch records:', records.length);
      return records;
    } catch (error) {
      console.error('❌ OpenSearch failed:', error);
      throw error;
    }
  }

  static extractOrganisationId(namespaceId) {
    // Extract "SomeUniqueOrganisationID" from 
    // "namespace:master-data--Organisation:SomeUniqueOrganisationID:"
    const parts = namespaceId.split(':');
    return parts.length >= 3 ? parts[2] : namespaceId;
  }
}
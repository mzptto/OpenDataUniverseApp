import { fetchAuthSession } from 'aws-amplify/auth';

export class GraphQLTestRunner {
  static async runAllTests() {
    console.log('🧪 Starting GraphQL Test Runner - 100 iterations');
    
    const queries = this.generateTestQueries();
    const results = [];
    
    for (let i = 0; i < queries.length; i++) {
      const query = queries[i];
      console.log(`🔍 Test ${i + 1}/100: ${query.name}`);
      
      try {
        const result = await this.executeQuery(query.query);
        const recordCount = this.extractRecordCount(result);
        
        results.push({
          id: i + 1,
          name: query.name,
          query: query.query,
          success: !result.errors,
          recordCount: recordCount,
          errors: result.errors,
          hasData: recordCount > 0
        });
        
        if (recordCount > 0) {
          console.log(`✅ FOUND RECORDS! Test ${i + 1}: ${recordCount} records`);
        }
        
      } catch (error) {
        results.push({
          id: i + 1,
          name: query.name,
          query: query.query,
          success: false,
          recordCount: 0,
          errors: [error.message],
          hasData: false
        });
      }
      
      // Small delay to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    this.printResults(results);
    return results;
  }
  
  static async executeQuery(query) {
    const session = await fetchAuthSession({ forceRefresh: false });
    const token = session.tokens?.accessToken?.toString() || session.tokens?.idToken?.toString();
    
    const response = await fetch(process.env.REACT_APP_SEARCH_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
      body: JSON.stringify({ query })
    });
    
    return await response.json();
  }
  
  static extractRecordCount(result) {
    if (result.data?.search?.totalCount) return result.data.search.totalCount;
    if (result.data?.search?.results?.length) return result.data.search.results.length;
    if (result.data?.search?.records?.length) return result.data.search.records.length;
    if (result.data?.searchRecords?.totalCount) return result.data.searchRecords.totalCount;
    if (result.data?.searchRecords?.records?.length) return result.data.searchRecords.records.length;
    return 0;
  }
  
  static printResults(results) {
    const successful = results.filter(r => r.success);
    const withData = results.filter(r => r.hasData);
    
    console.log('\n📊 TEST RESULTS SUMMARY:');
    console.log(`Total tests: ${results.length}`);
    console.log(`Successful queries: ${successful.length}`);
    console.log(`Queries with data: ${withData.length}`);
    
    if (withData.length > 0) {
      console.log('\n🎉 QUERIES THAT RETURNED DATA:');
      withData.forEach(result => {
        console.log(`✅ ${result.name}: ${result.recordCount} records`);
      });
    }
    
    console.log('\n📋 All results:', results);
  }
  
  static generateTestQueries() {
    return [
      // Basic search variations
      { name: 'Basic wildcard', query: 'query { search(input: { query: "*" }) { results { id } totalCount } }' },
      { name: 'Organisation text', query: 'query { search(input: { query: "organisation" }) { results { id } totalCount } }' },
      { name: 'Organization text', query: 'query { search(input: { query: "organization" }) { results { id } totalCount } }' },
      
      // Kind variations
      { name: 'Kind wildcard', query: 'query { search(input: { kind: "*:*:*:*", query: "*" }) { results { id } totalCount } }' },
      { name: 'Kind osdu wildcard', query: 'query { search(input: { kind: "osdu:*:*:*", query: "*" }) { results { id } totalCount } }' },
      { name: 'Kind wks wildcard', query: 'query { search(input: { kind: "osdu:wks:*:*", query: "*" }) { results { id } totalCount } }' },
      { name: 'Kind master-data', query: 'query { search(input: { kind: "osdu:wks:master-data:*", query: "*" }) { results { id } totalCount } }' },
      { name: 'Kind Organisation', query: 'query { search(input: { kind: "osdu:wks:master-data--Organisation:*", query: "*" }) { results { id } totalCount } }' },
      
      // Index variations
      { name: 'Index wildcard', query: 'query { search(input: { index: "*", query: "*" }) { results { id } totalCount } }' },
      { name: 'Index osdu', query: 'query { search(input: { index: "osdu", query: "*" }) { results { id } totalCount } }' },
      { name: 'Index master-data', query: 'query { search(input: { index: "master-data", query: "*" }) { results { id } totalCount } }' },
      
      // DataPartition variations
      { name: 'DataPartition osdu', query: 'query { search(input: { dataPartition: "osdu", query: "*" }) { results { id } totalCount } }' },
      { name: 'DataPartition wildcard', query: 'query { search(input: { dataPartition: "*", query: "*" }) { results { id } totalCount } }' },
      
      // Combined variations
      { name: 'Index + DataPartition', query: 'query { search(input: { index: "*", dataPartition: "osdu", query: "*" }) { results { id } totalCount } }' },
      { name: 'Kind + Index + DataPartition', query: 'query { search(input: { kind: "osdu:wks:*:*", index: "*", dataPartition: "osdu", query: "*" }) { results { id } totalCount } }' },
      
      // Limit variations
      { name: 'With limit 10', query: 'query { search(input: { query: "*", limit: 10 }) { results { id } totalCount } }' },
      { name: 'With limit 100', query: 'query { search(input: { query: "*", limit: 100 }) { results { id } totalCount } }' },
      
      // Different response fields
      { name: 'Records field', query: 'query { search(input: { query: "*" }) { records { id } totalCount } }' },
      { name: 'Items field', query: 'query { search(input: { query: "*" }) { items { id } totalCount } }' },
      { name: 'Hits field', query: 'query { search(input: { query: "*" }) { hits { id } totalCount } }' },
      
      // Alternative search methods
      { name: 'advancedSearch', query: 'query { advancedSearch(input: { query: "*" }) { results { id } totalCount } }' },
      { name: 'facetedSearch', query: 'query { facetedSearch(input: { query: "*" }) { results { id } totalCount } }' },
      { name: 'geoSearch', query: 'query { geoSearch(input: { query: "*" }) { results { id } totalCount } }' },
      
      // Different query structures
      { name: 'searchRecords', query: 'query { searchRecords(query: "*") { records { id } totalCount } }' },
      { name: 'searchRecords with limit', query: 'query { searchRecords(query: "*", limit: 10) { records { id } totalCount } }' },
      
      // Specific organisation searches
      { name: 'Org in kind', query: 'query { search(input: { kind: "*Organisation*", query: "*" }) { results { id } totalCount } }' },
      { name: 'Org in query', query: 'query { search(input: { query: "*Organisation*" }) { results { id } totalCount } }' },
      
      // Different field combinations
      { name: 'Full data fields', query: 'query { search(input: { query: "*" }) { results { id type data { title description tags } } totalCount } }' },
      { name: 'Minimal fields', query: 'query { search(input: { query: "*" }) { results { id } } }' },
      
      // Schema introspection attempts
      { name: 'Schema type', query: 'query { __type(name: "SearchResult") { fields { name } } }' },
      { name: 'Query type', query: 'query { __schema { queryType { fields { name } } } }' },
      
      // Empty/null variations
      { name: 'Empty query', query: 'query { search(input: { query: "" }) { results { id } totalCount } }' },
      { name: 'No input', query: 'query { search { results { id } totalCount } }' },
      
      // Different authentication approaches
      { name: 'Simple search', query: 'query { search(query: "*") { id } }' },
      { name: 'Direct search', query: '{ search(input: { query: "*" }) { results { id } } }' },
      
      // Pagination attempts
      { name: 'With offset', query: 'query { search(input: { query: "*", offset: 0 }) { results { id } totalCount } }' },
      { name: 'With cursor', query: 'query { search(input: { query: "*", cursor: null }) { results { id } totalCount } }' },
      
      // Sort attempts
      { name: 'With sort', query: 'query { search(input: { query: "*", sort: { field: ["id"] } }) { results { id } totalCount } }' },
      
      // Filter attempts
      { name: 'With filter', query: 'query { search(input: { query: "*", filter: {} }) { results { id } totalCount } }' },
      
      // Different entity types
      { name: 'Well kind', query: 'query { search(input: { kind: "osdu:wks:master-data--Well:*", query: "*" }) { results { id } totalCount } }' },
      { name: 'Wellbore kind', query: 'query { search(input: { kind: "osdu:wks:master-data--Wellbore:*", query: "*" }) { results { id } totalCount } }' },
      { name: 'Field kind', query: 'query { search(input: { kind: "osdu:wks:master-data--Field:*", query: "*" }) { results { id } totalCount } }' },
      
      // Work product variations
      { name: 'Work product kind', query: 'query { search(input: { kind: "osdu:wks:work-product:*", query: "*" }) { results { id } totalCount } }' },
      { name: 'Work product component', query: 'query { search(input: { kind: "osdu:wks:work-product-component:*", query: "*" }) { results { id } totalCount } }' },
      
      // Reference data
      { name: 'Reference data', query: 'query { search(input: { kind: "osdu:wks:reference-data:*", query: "*" }) { results { id } totalCount } }' },
      
      // Different namespaces
      { name: 'Namespace wildcard', query: 'query { search(input: { kind: "*:*:master-data--Organisation:*", query: "*" }) { results { id } totalCount } }' },
      { name: 'Different namespace', query: 'query { search(input: { kind: "namespace:wks:master-data--Organisation:*", query: "*" }) { results { id } totalCount } }' },
      
      // Case variations
      { name: 'Lowercase organisation', query: 'query { search(input: { kind: "osdu:wks:master-data--organisation:*", query: "*" }) { results { id } totalCount } }' },
      { name: 'Uppercase ORGANISATION', query: 'query { search(input: { kind: "osdu:wks:master-data--ORGANISATION:*", query: "*" }) { results { id } totalCount } }' },
      
      // Version specific
      { name: 'Version 1.0.0', query: 'query { search(input: { kind: "osdu:wks:master-data--Organisation:1.0.0", query: "*" }) { results { id } totalCount } }' },
      { name: 'Version 1.2.0', query: 'query { search(input: { kind: "osdu:wks:master-data--Organisation:1.2.0", query: "*" }) { results { id } totalCount } }' },
      
      // Alternative field names
      { name: 'Type instead of kind', query: 'query { search(input: { type: "osdu:wks:master-data--Organisation:*", query: "*" }) { results { id } totalCount } }' },
      { name: 'Schema instead of kind', query: 'query { search(input: { schema: "osdu:wks:master-data--Organisation:*", query: "*" }) { results { id } totalCount } }' },
      
      // Boolean queries
      { name: 'Boolean AND', query: 'query { search(input: { query: "organisation AND master-data" }) { results { id } totalCount } }' },
      { name: 'Boolean OR', query: 'query { search(input: { query: "organisation OR organization" }) { results { id } totalCount } }' },
      
      // Exact match attempts
      { name: 'Exact match', query: 'query { search(input: { query: "\\"organisation\\"" }) { results { id } totalCount } }' },
      { name: 'Field specific', query: 'query { search(input: { query: "data.OrganisationName:*" }) { results { id } totalCount } }' },
      
      // Range queries
      { name: 'Range query', query: 'query { search(input: { query: "*", from: 0, size: 10 }) { results { id } totalCount } }' },
      
      // Aggregation attempts
      { name: 'With aggregations', query: 'query { search(input: { query: "*", aggregations: {} }) { results { id } totalCount aggregations } }' },
      
      // Different response structures
      { name: 'Nested results', query: 'query { search(input: { query: "*" }) { data { results { id } totalCount } } }' },
      { name: 'Response wrapper', query: 'query { search(input: { query: "*" }) { response { results { id } totalCount } } }' },
      
      // Multi-field search
      { name: 'Multi-field', query: 'query { search(input: { query: "*", fields: ["id", "data"] }) { results { id } totalCount } }' },
      
      // Highlight attempts
      { name: 'With highlight', query: 'query { search(input: { query: "*", highlight: true }) { results { id } totalCount } }' },
      
      // Source filtering
      { name: 'Source includes', query: 'query { search(input: { query: "*", _source: ["id", "data"] }) { results { id } totalCount } }' },
      
      // Timeout attempts
      { name: 'With timeout', query: 'query { search(input: { query: "*", timeout: "30s" }) { results { id } totalCount } }' },
      
      // Track total hits
      { name: 'Track total hits', query: 'query { search(input: { query: "*", track_total_hits: true }) { results { id } totalCount } }' },
      
      // Preference
      { name: 'With preference', query: 'query { search(input: { query: "*", preference: "_local" }) { results { id } totalCount } }' },
      
      // Routing
      { name: 'With routing', query: 'query { search(input: { query: "*", routing: "osdu" }) { results { id } totalCount } }' },
      
      // Scroll
      { name: 'With scroll', query: 'query { search(input: { query: "*", scroll: "1m" }) { results { id } totalCount } }' },
      
      // Search type
      { name: 'Search type dfs', query: 'query { search(input: { query: "*", search_type: "dfs_query_then_fetch" }) { results { id } totalCount } }' },
      
      // Explain
      { name: 'With explain', query: 'query { search(input: { query: "*", explain: true }) { results { id } totalCount } }' },
      
      // Version
      { name: 'With version', query: 'query { search(input: { query: "*", version: true }) { results { id } totalCount } }' },
      
      // Sequence number
      { name: 'With seq_no', query: 'query { search(input: { query: "*", seq_no_primary_term: true }) { results { id } totalCount } }' },
      
      // Stored fields
      { name: 'Stored fields', query: 'query { search(input: { query: "*", stored_fields: ["id"] }) { results { id } totalCount } }' },
      
      // Doc value fields
      { name: 'Doc value fields', query: 'query { search(input: { query: "*", docvalue_fields: ["id"] }) { results { id } totalCount } }' },
      
      // Script fields
      { name: 'Script fields', query: 'query { search(input: { query: "*", script_fields: {} }) { results { id } totalCount } }' },
      
      // Rescore
      { name: 'With rescore', query: 'query { search(input: { query: "*", rescore: {} }) { results { id } totalCount } }' },
      
      // Search after
      { name: 'Search after', query: 'query { search(input: { query: "*", search_after: [] }) { results { id } totalCount } }' },
      
      // Collapse
      { name: 'With collapse', query: 'query { search(input: { query: "*", collapse: { field: "id" } }) { results { id } totalCount } }' },
      
      // Point in time
      { name: 'Point in time', query: 'query { search(input: { query: "*", pit: {} }) { results { id } totalCount } }' },
      
      // Runtime mappings
      { name: 'Runtime mappings', query: 'query { search(input: { query: "*", runtime_mappings: {} }) { results { id } totalCount } }' },
      
      // Stats
      { name: 'With stats', query: 'query { search(input: { query: "*", stats: ["group1"] }) { results { id } totalCount } }' },
      
      // Terminate after
      { name: 'Terminate after', query: 'query { search(input: { query: "*", terminate_after: 100 }) { results { id } totalCount } }' },
      
      // Allow partial results
      { name: 'Allow partial', query: 'query { search(input: { query: "*", allow_partial_search_results: true }) { results { id } totalCount } }' },
      
      // Batched reduce size
      { name: 'Batched reduce', query: 'query { search(input: { query: "*", batched_reduce_size: 512 }) { results { id } totalCount } }' },
      
      // Max concurrent shards
      { name: 'Max concurrent', query: 'query { search(input: { query: "*", max_concurrent_shard_requests: 5 }) { results { id } totalCount } }' },
      
      // Pre filter shard size
      { name: 'Pre filter shard', query: 'query { search(input: { query: "*", pre_filter_shard_size: 128 }) { results { id } totalCount } }' },
      
      // Request cache
      { name: 'Request cache', query: 'query { search(input: { query: "*", request_cache: true }) { results { id } totalCount } }' },
      
      // Allow no indices
      { name: 'Allow no indices', query: 'query { search(input: { query: "*", allow_no_indices: true }) { results { id } totalCount } }' },
      
      // Expand wildcards
      { name: 'Expand wildcards', query: 'query { search(input: { query: "*", expand_wildcards: "open" }) { results { id } totalCount } }' },
      
      // Ignore unavailable
      { name: 'Ignore unavailable', query: 'query { search(input: { query: "*", ignore_unavailable: true }) { results { id } totalCount } }' },
      
      // Ignore throttled
      { name: 'Ignore throttled', query: 'query { search(input: { query: "*", ignore_throttled: true }) { results { id } totalCount } }' },
      
      // Rest total hits as int
      { name: 'Rest total hits', query: 'query { search(input: { query: "*", rest_total_hits_as_int: true }) { results { id } totalCount } }' },
      
      // Typed keys
      { name: 'Typed keys', query: 'query { search(input: { query: "*", typed_keys: true }) { results { id } totalCount } }' }
    ];
  }
}
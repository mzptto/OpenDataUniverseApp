// Final OSDU Test - Using discovered schema structure
import { OSDUApi } from '../services/osduApi';

export const testFinalOsduQuery = async () => {
  console.log('🎯 Final OSDU Test - Using correct schema structure');
  
  try {
    const osduApi = new OSDUApi();
    
    // Use only the working fields: total and items
    const query = `
      query {
        search(input: { 
          query: "*", 
          index: "*", 
          dataPartition: "osdu" 
        }) {
          total
          items
        }
      }
    `;
    
    console.log('🧪 Testing final query:', query);
    const result = await osduApi.executeGraphQL(query);
    
    if (result?.data?.search) {
      const searchData = result.data.search;
      console.log('✅ OSDU Search Results:', {
        total: searchData.total,
        itemsType: typeof searchData.items,
        itemsValue: searchData.items,
        sampleItems: Array.isArray(searchData.items) ? searchData.items.slice(0, 3) : searchData.items
      });
      
      if (searchData.total > 0) {
        console.log('🎉 SUCCESS! Found', searchData.total, 'records in OSDU backend');
        return {
          success: true,
          total: searchData.total,
          items: Array.isArray(searchData.items) ? searchData.items : [searchData.items].filter(Boolean)
        };
      } else {
        console.log('⚠️ Query successful but OSDU backend contains 0 records');
        return {
          success: true,
          total: 0,
          items: [],
          message: 'OSDU backend is empty - no records found'
        };
      }
    } else if (result?.errors) {
      console.log('❌ Query errors:', result.errors.map(e => e.message));
      return {
        success: false,
        errors: result.errors
      };
    }
    
  } catch (error) {
    console.error('❌ Final test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};
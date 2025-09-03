// CORS Investigation Utility
// This utility helps investigate why CORS requests are working

export const investigateCORS = async (endpoint, headers, method = 'POST') => {
  console.log('🔍 CORS Investigation Starting...');
  console.log('Target endpoint:', endpoint);
  console.log('Method:', method);
  
  const investigation = {
    endpoint,
    method,
    preflightRequired: false,
    preflightResponse: null,
    actualResponse: null,
    corsHeaders: {},
    errors: []
  };

  try {
    // Check if this request would trigger a preflight
    const hasCustomHeaders = Object.keys(headers).some(header => 
      !['accept', 'accept-language', 'content-language', 'content-type'].includes(header.toLowerCase())
    );
    
    const hasComplexContentType = headers['content-type'] && 
      !['application/x-www-form-urlencoded', 'multipart/form-data', 'text/plain'].includes(headers['content-type']);
    
    investigation.preflightRequired = method !== 'GET' && method !== 'HEAD' && method !== 'POST' ||
                                   hasCustomHeaders || 
                                   hasComplexContentType;

    console.log('🚦 Preflight required:', investigation.preflightRequired);

    // If preflight is required, let's see what happens
    if (investigation.preflightRequired) {
      try {
        console.log('🔄 Checking preflight OPTIONS request...');
        const preflightResponse = await fetch(endpoint, {
          method: 'OPTIONS',
          headers: {
            'Access-Control-Request-Method': method,
            'Access-Control-Request-Headers': Object.keys(headers).join(', '),
            'Origin': window.location.origin
          }
        });
        
        investigation.preflightResponse = {
          status: preflightResponse.status,
          statusText: preflightResponse.statusText,
          headers: Object.fromEntries(preflightResponse.headers.entries())
        };
        
        console.log('✅ Preflight response:', investigation.preflightResponse);
      } catch (error) {
        investigation.errors.push(`Preflight error: ${error.message}`);
        console.log('❌ Preflight failed:', error.message);
      }
    }

    // Now try the actual request
    console.log('🎯 Making actual request...');
    const response = await fetch(endpoint, {
      method,
      headers,
      body: method !== 'GET' ? JSON.stringify({
        query: "test",
        kind: "*:*:*:*",
        limit: 1
      }) : undefined
    });

    investigation.actualResponse = {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    };

    // Extract CORS-related headers
    const corsHeaders = {};
    response.headers.forEach((value, key) => {
      if (key.toLowerCase().startsWith('access-control-')) {
        corsHeaders[key] = value;
      }
    });
    investigation.corsHeaders = corsHeaders;

    console.log('✅ Actual response:', investigation.actualResponse);
    console.log('🔐 CORS headers found:', corsHeaders);

    // Analyze why it's working
    const analysis = analyzeCORSSuccess(investigation);
    console.log('📊 Analysis:', analysis);
    
    return { investigation, analysis };

  } catch (error) {
    investigation.errors.push(`Request error: ${error.message}`);
    console.log('❌ Request failed:', error.message);
    return { investigation, analysis: { reason: 'Request failed', details: error.message } };
  }
};

const analyzeCORSSuccess = (investigation) => {
  const { corsHeaders, actualResponse, preflightResponse } = investigation;
  
  // Check for permissive CORS headers
  const allowOrigin = corsHeaders['access-control-allow-origin'];
  const allowMethods = corsHeaders['access-control-allow-methods'];
  const allowHeaders = corsHeaders['access-control-allow-headers'];
  
  if (allowOrigin === '*') {
    return {
      reason: 'Wildcard CORS policy',
      details: 'Server allows requests from any origin (*)',
      headers: corsHeaders
    };
  }
  
  if (allowOrigin === window.location.origin) {
    return {
      reason: 'Explicit origin allowlist',
      details: `Server explicitly allows requests from ${window.location.origin}`,
      headers: corsHeaders
    };
  }
  
  if (allowOrigin && allowOrigin.includes('localhost')) {
    return {
      reason: 'Development-friendly CORS',
      details: 'Server allows localhost origins for development',
      headers: corsHeaders
    };
  }
  
  if (!corsHeaders || Object.keys(corsHeaders).length === 0) {
    return {
      reason: 'No CORS headers detected',
      details: 'Request might be same-origin or server might not implement CORS properly',
      headers: corsHeaders
    };
  }
  
  return {
    reason: 'Custom CORS configuration',
    details: 'Server has specific CORS configuration that allows this request',
    headers: corsHeaders
  };
};

// Helper to run investigation from console
export const runCORSTest = async (token = null, customEndpoint = null) => {
  const endpoint = customEndpoint || process.env.REACT_APP_SEARCH_API_URL || 'https://your-osdu-endpoint.com/api/search/v2/query';
  const headers = {
    "authorization": token ? `Bearer ${token}` : "Bearer <your-token-here>",
    "content-type": "application/json",
    "data-partition-id": "osdu"
  };
  
  return await investigateCORS(endpoint, headers, 'POST');
};
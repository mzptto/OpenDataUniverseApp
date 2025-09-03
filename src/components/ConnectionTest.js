import React, { useState } from 'react';
import { Settings } from 'lucide-react';
import { OSDUApi } from '../services/osduApi';

const ConnectionTest = () => {
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const testConnection = async () => {
    console.log('🔄 Starting connection test...');
    setLoading(true);
    setTestResult(null);
    
    try {
      console.log('🔐 Testing authentication...');
      const authResult = await OSDUApi.testConnection();
      console.log('Auth result:', authResult);
      
      console.log('🌐 Testing GraphQL connection...');
      const graphqlResult = await OSDUApi.testGraphQLConnection();
      console.log('GraphQL result:', graphqlResult);
      
      console.log('🏢 Testing Organisation search...');
      const orgSearchResult = await OSDUApi.testOrganisationSearch();
      console.log('Organisation search result:', orgSearchResult);
      
      const finalResult = { 
        auth: authResult, 
        graphql: graphqlResult,
        orgSearch: orgSearchResult,
        success: authResult.success && graphqlResult.success
      };
      
      console.log('✅ Final test result:', finalResult);
      setTestResult(finalResult);
    } catch (error) {
      console.error('❌ Connection test failed:', error);
      setTestResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '50px',
          height: '50px',
          background: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          cursor: 'pointer',
          zIndex: 9999,
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        title="OSDU Connection Test"
      >
        <Settings size={20} />
      </button>

      {/* Test Panel */}
      {isOpen && (
        <div style={{ 
          position: 'fixed', 
          bottom: '80px', 
          right: '20px', 
          background: 'white', 
          padding: '15px', 
          border: '2px solid #007bff',
          borderRadius: '8px',
          zIndex: 9999,
          minWidth: '250px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
        }}>
      <button 
        onClick={testConnection} 
        disabled={loading}
        style={{
          padding: '10px 15px',
          background: loading ? '#6c757d' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: '14px',
          fontWeight: 'bold',
          width: '100%'
        }}
      >
        {loading ? '🔄 Testing...' : '🔌 Test OSDU Connection'}
      </button>
      
      {testResult && (
        <div style={{ 
          marginTop: '10px', 
          padding: '5px',
          background: testResult.success ? '#d4edda' : '#f8d7da',
          border: `1px solid ${testResult.success ? '#c3e6cb' : '#f5c6cb'}`,
          borderRadius: '4px',
          fontSize: '12px'
        }}>
          {testResult.success ? (
            <div>
              <strong>✓ Connected!</strong>
              <br />Auth: {testResult.auth?.user?.username}
              <br />GraphQL: {testResult.graphql?.success ? '✓' : '✗'}
              <br />Org Search: {testResult.orgSearch?.success ? '✓' : '✗'}
            </div>
          ) : (
            <div>
              <strong>✗ Connection Issues</strong>
              <br />Auth: {testResult.auth?.success ? '✓' : '✗'}
              <br />GraphQL: {testResult.graphql?.success ? '✓' : '✗'}
              <br />Org Search: {testResult.orgSearch?.success ? '✓' : '✗'}
              {testResult.error && <br />}{testResult.error}
            </div>
          )}
        </div>
      )}
        </div>
      )}
    </>
  );
};

export default ConnectionTest;
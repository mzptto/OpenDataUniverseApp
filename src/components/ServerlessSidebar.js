import React, { useState } from 'react';

const SimpleAuth = ({ onAuthStateChange }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [credentials, setCredentials] = useState({ username: '', password: '' });

  const handleSignIn = () => {
    // Simple mock authentication
    if (credentials.username && credentials.password) {
      const mockUser = { username: credentials.username };
      setUser(mockUser);
      setIsAuthenticated(true);
      
      const signOut = () => {
        setUser(null);
        setIsAuthenticated(false);
        if (onAuthStateChange) {
          onAuthStateChange({ user: null, signOut: null, isAuthenticated: false });
        }
      };
      
      if (onAuthStateChange) {
        onAuthStateChange({ user: mockUser, signOut, isAuthenticated: true });
      }
    }
  };

  if (isAuthenticated) {
    return (
      <div>
        <div style={{ 
          padding: '12px', 
          background: '#e8f5e8', 
          borderRadius: '4px',
          marginBottom: '16px'
        }}>
          <div style={{ fontSize: '12px', color: '#2d5a2d', fontWeight: '500' }}>
            ✓ Authenticated
          </div>
          <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
            {user?.username}
          </div>
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
            Available Services:
          </div>
          <div style={{ fontSize: '11px', color: '#2c3e50' }}>
            • Search Service
            • Storage Service  
            • Schema Service
            • Legal Service
            • AI Service
          </div>
        </div>
        
        <button 
          onClick={() => {
            setUser(null);
            setIsAuthenticated(false);
            if (onAuthStateChange) {
              onAuthStateChange({ user: null, signOut: null, isAuthenticated: false });
            }
          }}
          style={{
            width: '100%',
            padding: '8px',
            background: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <input
          type="text"
          placeholder="Username"
          value={credentials.username}
          onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
          style={{
            width: '100%',
            padding: '8px',
            marginBottom: '8px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '12px'
          }}
        />
        <input
          type="password"
          placeholder="Password"
          value={credentials.password}
          onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
          style={{
            width: '100%',
            padding: '8px',
            marginBottom: '12px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '12px'
          }}
        />
        <button
          onClick={handleSignIn}
          style={{
            width: '100%',
            padding: '8px',
            background: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          Sign In
        </button>
      </div>
    </div>
  );
};

const ServerlessSidebar = ({ onAuthStateChange, onClose }) => {
  return (
    <div style={{ padding: '16px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ color: '#2c3e50', fontSize: '14px', fontWeight: '600', margin: 0 }}>
          Serverless EDI Authentication
        </h3>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '16px',
            cursor: 'pointer',
            color: '#666',
            padding: '4px'
          }}
        >
          ×
        </button>
      </div>
      
      <div style={{ flex: 1 }}>
        <SimpleAuth onAuthStateChange={onAuthStateChange} />
      </div>
    </div>
  );
};

export default ServerlessSidebar;
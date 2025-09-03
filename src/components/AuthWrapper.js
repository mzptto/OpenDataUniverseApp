import React from 'react';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

const AuthWrapper = ({ children }) => {
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <div>
          <div style={{ 
            padding: '10px', 
            background: '#f0f0f0', 
            borderBottom: '1px solid #ddd',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>Welcome, {user?.username}</span>
            <button onClick={signOut} style={{
              padding: '5px 10px',
              background: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}>
              Sign Out
            </button>
          </div>
          {children}
        </div>
      )}
    </Authenticator>
  );
};

export default AuthWrapper;
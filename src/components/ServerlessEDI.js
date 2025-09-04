import React, { useState } from 'react';
import { Search, Database, FileText, Scale, Brain } from 'lucide-react';

const ServerlessEDI = ({ user, signOut }) => {
  const [activeService, setActiveService] = useState('search');

  const services = [
    { id: 'search', name: 'Search Service', icon: Search, color: '#3498db' },
    { id: 'storage', name: 'Storage Service', icon: Database, color: '#2ecc71' },
    { id: 'schema', name: 'Schema Service', icon: FileText, color: '#f39c12' },
    { id: 'legal', name: 'Legal Service', icon: Scale, color: '#9b59b6' },
    { id: 'ai', name: 'AI Service', icon: Brain, color: '#e74c3c' }
  ];

  const renderSearchService = () => (
    <div style={{ padding: '2rem' }}>
      <h3 style={{ marginBottom: '1rem', color: '#2c3e50' }}>Search Service</h3>
      <div style={{ 
        background: '#f8f9fa', 
        padding: '1rem', 
        borderRadius: '4px',
        border: '1px solid #dee2e6'
      }}>
        <p style={{ color: '#666', margin: 0 }}>
          Connected to: {process.env.REACT_APP_SEARCH_API_URL}
        </p>
        <p style={{ color: '#666', margin: '0.5rem 0 0 0', fontSize: '14px' }}>
          GraphQL endpoint ready for OSDU search operations
        </p>
      </div>
    </div>
  );

  const renderServiceContent = () => {
    switch (activeService) {
      case 'search':
        return renderSearchService();
      default:
        return (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
            <h3>{services.find(s => s.id === activeService)?.name}</h3>
            <p>Service integration coming soon...</p>
          </div>
        );
    }
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ 
        background: '#2c3e50', 
        color: 'white', 
        padding: '1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '18px' }}>Serverless EDI</h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '12px', opacity: 0.8 }}>
            Authenticated as {user?.username}
          </p>
        </div>
        <div style={{ fontSize: '12px', opacity: 0.8 }}>
          AWS Cognito • GraphQL APIs
        </div>
      </div>

      {/* Service Tabs */}
      <div style={{ 
        background: '#34495e', 
        display: 'flex', 
        gap: '1px',
        padding: '0'
      }}>
        {services.map(service => {
          const IconComponent = service.icon;
          const isActive = activeService === service.id;
          
          return (
            <button
              key={service.id}
              onClick={() => setActiveService(service.id)}
              style={{
                padding: '0.75rem 1rem',
                background: isActive ? '#3498db' : '#34495e',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '12px',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.target.style.background = '#4a6278';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.target.style.background = '#34495e';
              }}
            >
              <IconComponent size={14} />
              {service.name}
            </button>
          );
        })}
      </div>

      {/* Service Content */}
      <div style={{ flex: 1, background: 'white', overflow: 'auto' }}>
        {renderServiceContent()}
      </div>
    </div>
  );
};

export default ServerlessEDI;
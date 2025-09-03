import React, { useState } from 'react';
import { Menu, Database, FileText, Search, Settings } from 'lucide-react';
import EntityBrowser from './EntityBrowser';
import DataBrowser from './DataBrowser';
import SearchBrowser from './SearchBrowser';
import OsduTestPage from './OsduTestPage';

const MainNavigation = ({ entities, selectedEntity, onEntitySelect, onRecordSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(null);

  const sections = [
    { id: 'entities', label: 'OSDU Entities', icon: Database },
    { id: 'data', label: 'OSDU Data', icon: FileText },
    { id: 'search', label: 'OSDU Search', icon: Search },
    { id: 'test', label: 'OSDU Service Test', icon: Settings }
  ];

  const handleSectionClick = (sectionId) => {
    setActiveSection(sectionId);
  };

  const handleClose = () => {
    setIsOpen(false);
    setActiveSection(null);
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'entities':
        return (
          <EntityBrowser
            entities={entities}
            selectedEntity={selectedEntity}
            onEntitySelect={onEntitySelect}
            isOpen={true}
            onClose={handleClose}
          />
        );
      case 'data':
        return (
          <DataBrowser
            isOpen={true}
            onClose={handleClose}
            onOrganisationSelect={onRecordSelect}
          />
        );
      case 'search':
        return (
          <SearchBrowser
            isOpen={true}
            onClose={handleClose}
          />
        );
      case 'test':
        return (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'white',
            zIndex: 1002,
            overflow: 'auto'
          }}>
            <div style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              zIndex: 1003
            }}>
              <button
                onClick={handleClose}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
            <OsduTestPage />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'none',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
          padding: '0.5rem'
        }}
      >
        <Menu size={24} />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 1001
          }}
          onClick={handleClose}
        />
      )}

      {/* Navigation Menu */}
      {isOpen && !activeSection && (
        <div style={{
          position: 'fixed',
          top: '80px',
          left: '20px',
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1002,
          padding: '1rem'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '16px', color: '#333' }}>
            OSDU Data Explorer
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {sections.map(section => {
              const IconComponent = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => handleSectionClick(section.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    background: 'none',
                    border: '1px solid #e0e0e0',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: '#333',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#f5f5f5';
                    e.target.style.borderColor = '#007bff';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'none';
                    e.target.style.borderColor = '#e0e0e0';
                  }}
                >
                  <IconComponent size={18} />
                  {section.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Active Section */}
      {renderActiveSection()}
    </>
  );
};

export default MainNavigation;
import React, { useState } from 'react';

const extractEntityName = (data, fileName) => {
  // Try to extract from kind field first
  if (data.kind && typeof data.kind === 'string') {
    const kindMatch = data.kind.match(/^[\w\-\.]+:[\w\-\.]+:([\w\-\.]+):[0-9]+\.[0-9]+\.[0-9]+$/);
    if (kindMatch) {
      const entityPart = kindMatch[1];
      // Remove master-data-- or work-product-component-- prefixes
      const cleanEntity = entityPart.replace(/^(master-data--|work-product-component--|reference-data--)/, '');
      // Get version from kind
      const versionMatch = data.kind.match(/:([0-9]+\.[0-9]+\.[0-9]+)$/);
      const version = versionMatch ? versionMatch[1] : '';
      return version ? `${cleanEntity}.${version}` : cleanEntity;
    }
  }
  
  // Fallback to filename
  return fileName.replace('.json', '').split('.')[0];
};

const FileSelector = ({ onFileSelect }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleFileSelect = async (event) => {
    const files = event.target.files;
    if (files.length > 0) {
      const file = files[0];
      setIsLoading(true);
      
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        
        // Extract entity name from kind field or fallback to filename
        const entityName = extractEntityName(data, file.name);
        
        onFileSelect({
          name: file.name,
          schema: data,
          example: data // For now, use schema as example
        });
        

      } catch (error) {
        console.error('Error loading file:', error);
        alert('Error loading file: ' + error.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleFolderSelect = async (event) => {
    const files = event.target.files;
    if (files.length > 0) {
      setIsLoading(true);
      
      try {
        const fileList = [];
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          if (file.name.endsWith('.json')) {
            const text = await file.text();
            const data = JSON.parse(text);
            const entityName = extractEntityName(data, file.name);
            
            fileList.push({
              name: file.name,
              path: file.webkitRelativePath || file.name,
              schema: data,
              example: data
            });
          }
        }
        
        // For now, just select the first file
        if (fileList.length > 0) {
          onFileSelect(fileList[0]);

        }
      } catch (error) {
        console.error('Error loading folder:', error);
        alert('Error loading folder: ' + error.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <div>
        <label style={{ 
          padding: '0.5rem 1rem', 
          background: '#3498db', 
          color: 'white', 
          borderRadius: '4px', 
          cursor: 'pointer',
          fontSize: '14px'
        }}>
          {isLoading ? 'Loading...' : 'Select Schema File'}
          <input
            type="file"
            accept=".json"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            disabled={isLoading}
          />
        </label>
      </div>
    </div>
  );
};

export default FileSelector;
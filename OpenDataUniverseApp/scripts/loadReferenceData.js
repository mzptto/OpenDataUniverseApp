const fs = require('fs');
const path = require('path');

const referenceDataPath = 'C:\\Users\\mzptto\\OneDrive - amazon.com\\EDI\\OSDU Data Model\\datadefinitions\\ReferenceValues\\Manifests\\reference-data';
const outputPath = path.join(__dirname, '..', 'src', 'data', 'referenceData.js');

function extractReferenceType(kind) {
  if (!kind) return null;
  
  // Extract reference type from kind like "osdu:wks:reference-data--ActivityLevel:1.0.0"
  const match = kind.match(/reference-data--([^:]+):/);
  return match ? match[1] : null;
}

function loadReferenceData() {
  const referenceData = {};
  const folders = ['FIXED', 'LOCAL', 'OPEN'];
  
  console.log('Loading reference data from:', referenceDataPath);
  
  for (const folder of folders) {
    const folderPath = path.join(referenceDataPath, folder);
    
    if (fs.existsSync(folderPath)) {
      const files = fs.readdirSync(folderPath).filter(file => file.endsWith('.json'));
      console.log(`Processing ${files.length} files in ${folder}`);
      
      for (const file of files) {
        try {
          const filePath = path.join(folderPath, file);
          const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          
          if (content.ReferenceData && Array.isArray(content.ReferenceData)) {
            const referenceType = extractReferenceType(content.ReferenceData[0]?.kind);
            
            if (referenceType) {
              const values = content.ReferenceData.map(item => ({
                id: item.id,
                name: item.data.Name,
                code: item.data.Code,
                description: item.data.Description || item.data.Name,
                source: folder
              }));
              
              referenceData[referenceType] = values;
              console.log(`  Loaded ${values.length} values for ${referenceType}`);
            }
          }
        } catch (error) {
          console.error(`Error processing ${file}:`, error.message);
        }
      }
    }
  }
  
  return referenceData;
}

function generateReferenceDataFile() {
  const referenceData = loadReferenceData();
  const totalTypes = Object.keys(referenceData).length;
  const totalValues = Object.values(referenceData).reduce((sum, values) => sum + values.length, 0);
  
  console.log(`\nLoaded ${totalTypes} reference data types with ${totalValues} total values`);
  
  const fileContent = `// Auto-generated reference data from OSDU Manifests
// Generated on: ${new Date().toISOString()}
// Total types: ${totalTypes}
// Total values: ${totalValues}

export const referenceData = ${JSON.stringify(referenceData, null, 2)};

export class ReferenceDataManager {
  static getReferenceValues(referenceType) {
    return referenceData[referenceType] || [];
  }

  static getAllReferenceTypes() {
    return Object.keys(referenceData);
  }

  static isReferenceField(pattern) {
    if (!pattern) return null;
    
    // Look for patterns like "^[\\\\w\\\\-\\\\.]+:reference-data--ActivityLevel:[\\\\w\\\\-\\\\.\\\\:\\\\%]+$"
    const match = pattern.match(/reference-data--([^:]+):/);
    return match ? match[1] : null;
  }

  static getReferenceValuesForProperty(schemaProperty) {
    if (!schemaProperty) return null;
    
    const referenceType = this.isReferenceField(schemaProperty.pattern);
    if (referenceType) {
      return this.getReferenceValues(referenceType);
    }
    
    return null;
  }

  static findReferenceTypeByPattern(pattern) {
    if (!pattern) return null;
    
    // Handle different pattern formats
    const patterns = [
      /reference-data--([^:]+):/,
      /reference-data--([^\\\\]+)/,
      /--([^:]+):/
    ];
    
    for (const regex of patterns) {
      const match = pattern.match(regex);
      if (match && referenceData[match[1]]) {
        return match[1];
      }
    }
    
    return null;
  }
}

export default referenceData;
`;

  fs.writeFileSync(outputPath, fileContent, 'utf8');
  console.log(`\nReference data file generated: ${outputPath}`);
  
  // Generate summary
  console.log('\nReference Data Summary:');
  Object.entries(referenceData)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([type, values]) => {
      console.log(`  ${type}: ${values.length} values`);
    });
}

if (require.main === module) {
  generateReferenceDataFile();
}

module.exports = { loadReferenceData, generateReferenceDataFile };
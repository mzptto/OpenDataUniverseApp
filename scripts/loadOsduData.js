const fs = require('fs').promises;
const path = require('path');

/**
 * Script to load OSDU data from your actual data definitions folder
 * Run this to generate a data file for the React app
 */

const OSDU_BASE_PATH = 'C:\\Users\\mzptto\\OneDrive - amazon.com\\EDI\\OSDU Data Model\\datadefinitions';
const DIAGRAMS_PATH = path.join(OSDU_BASE_PATH, 'E-R', '_diagrams');

async function loadOsduEntities() {
  const entities = [];
  
  try {
    // Get all entity types from diagrams directory
    const entityTypes = await fs.readdir(DIAGRAMS_PATH);
    
    for (const entityType of entityTypes) {
      const entityTypePath = path.join(DIAGRAMS_PATH, entityType);
      const stat = await fs.stat(entityTypePath);
      
      if (!stat.isDirectory() || entityType === 'abstract' || entityType === 'content' || entityType === 'type' || entityType === 'FragmentRelations') continue;
      
      console.log(`Loading ${entityType} entities...`);
      
      try {
        const pumlFiles = await fs.readdir(entityTypePath);
        
        for (const pumlFile of pumlFiles) {
          if (!pumlFile.endsWith('.puml') || pumlFile.includes('.ref.')) continue;
          
          const match = pumlFile.match(/^([A-Za-z0-9\.]+)\.(\d+\.\d+\.\d+)\.puml$/);
          if (!match) continue;
          
          const [, entityName, version] = match;
          
          try {
            // Load PlantUML content
            const pumlPath = path.join(entityTypePath, pumlFile);
            const pumlContent = await fs.readFile(pumlPath, 'utf8');
            
            // Try to load schema
            let schema = null;
            try {
              const schemaPath = path.join(OSDU_BASE_PATH, 'Generated', entityType, `${entityName}.${version}.json`);
              const schemaContent = await fs.readFile(schemaPath, 'utf8');
              schema = JSON.parse(schemaContent);
            } catch (error) {
              // Schema not found, continue without it
            }
            
            // Try to load example
            let example = null;
            try {
              const examplePath = path.join(OSDU_BASE_PATH, 'Examples', entityType, `${entityName}.${version}.json`);
              const exampleContent = await fs.readFile(examplePath, 'utf8');
              example = JSON.parse(exampleContent);
            } catch (error) {
              // Example not found, continue without it
            }
            
            entities.push({
              id: `${entityName.toLowerCase()}-${version}`,
              name: entityName,
              type: entityType,
              version: version,
              pumlContent: pumlContent,
              schema: schema,
              example: example
            });
            
            console.log(`Loaded: ${entityName} v${version} (${entityType})`);
            
          } catch (error) {
            console.warn(`Failed to load ${entityName} v${version} (${entityType}):`, error.message);
          }
        }
      } catch (error) {
        console.warn(`Could not read ${entityType} directory:`, error.message);
      }
    }
    
    // Save to data file
    const outputPath = path.join(__dirname, '..', 'src', 'data', 'osduEntities.js');
    const outputContent = `// Auto-generated OSDU entities data
// Generated on ${new Date().toISOString()}

export const osduEntities = ${JSON.stringify(entities, null, 2)};
`;
    
    await fs.writeFile(outputPath, outputContent);
    console.log(`\\nGenerated ${entities.length} entities to src/data/osduEntities.js`);
    
  } catch (error) {
    console.error('Error loading OSDU data:', error);
  }
}

// Run if called directly
if (require.main === module) {
  loadOsduEntities();
}

module.exports = { loadOsduEntities };
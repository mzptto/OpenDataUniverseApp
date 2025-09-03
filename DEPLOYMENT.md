# OSDU Data Model Explorer - Deployment Guide

## Quick Start

### 1. Load Your OSDU Data
```bash
# Run the Python script to load your actual OSDU data
python scripts/loadOsduData.py

# This will generate src/data/osduEntities.js with 190+ real entities
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm start
```

The application will open at `http://localhost:3000` with your real OSDU data loaded.

## Features Demonstrated

### ✅ **Interactive Entity Browser**
- 190+ real OSDU entities loaded from your data
- Search functionality across entity names and types
- Version information display

### ✅ **PlantUML Diagram Visualization**
- Converts your actual .puml files to interactive diagrams
- Color-coded by entity type (master-data, reference-data, etc.)
- Click-to-explore node relationships

### ✅ **Schema & Data Explorer**
- Real JSON schemas from your Generated/ folder
- Actual example data from your Examples/ folder
- Interactive JSON tree viewer with syntax highlighting

### ✅ **Node-Level Inspection**
- Click any diagram node to see its specific properties
- Toggle between schema definition and example data
- Deep property exploration

## Architecture Overview

```
OSDU Data Explorer
├── Entity Browser (Left Panel)
│   ├── Search & Filter
│   ├── Entity List (190+ entities)
│   └── Version Selection
├── Diagram Viewer (Main Area)
│   ├── PlantUML Parser
│   ├── Interactive Nodes
│   └── Relationship Display
└── Properties Panel (Bottom)
    ├── Schema View (JSON Tree)
    ├── Example Data View
    └── Node-Specific Details
```

## Data Integration

Your OSDU data is automatically loaded from:
- **PlantUML Diagrams**: `E-R/_diagrams/master-data/*.puml`
- **JSON Schemas**: `Generated/master-data/*.json`
- **Example Data**: `Examples/master-data/*.json`

## Extending the Application

### Add More Entity Types
```python
# Modify scripts/loadOsduData.py to include other types:
entity_types = [
    "master-data",
    "work-product-component", 
    "reference-data",
    "abstract"
]
```

### Enhanced Visualizations
```javascript
// Add to src/components/DiagramViewer.js
import * as d3 from 'd3';
import { Network } from 'vis-network';

// Implement force-directed graphs, network analysis, etc.
```

### Real-time Updates
```javascript
// Add file watching for live updates
import chokidar from 'chokidar';

chokidar.watch('./path/to/osdu/data').on('change', () => {
  // Reload entity data
});
```

## Production Deployment

### Build for Production
```bash
npm run build
```

### Deploy to AWS S3 + CloudFront
```bash
# Upload build/ folder to S3 bucket
aws s3 sync build/ s3://your-bucket-name

# Configure CloudFront distribution
# Enable HTTPS and custom domain
```

### Deploy to Azure Static Web Apps
```bash
# Connect GitHub repository
# Configure build settings:
# - App location: /
# - Build location: build
# - Build command: npm run build
```

## Advanced Features to Implement

### 1. **Graph Analysis**
- Dependency tracking between entities
- Impact analysis for schema changes
- Circular dependency detection

### 2. **Data Validation**
- Validate example data against schemas
- Schema compatibility checking
- Breaking change detection

### 3. **Collaborative Features**
- Schema annotations and comments
- Change proposals and reviews
- Version comparison tools

### 4. **Export Capabilities**
- Generate documentation (PDF, HTML)
- Export diagrams (PNG, SVG, PDF)
- Schema migration scripts

## Performance Optimization

### Large Dataset Handling
```javascript
// Implement virtual scrolling for entity lists
import { FixedSizeList as List } from 'react-window';

// Lazy load diagrams and schemas
const DiagramViewer = React.lazy(() => import('./DiagramViewer'));
```

### Caching Strategy
```javascript
// Cache parsed diagrams and schemas
const cache = new Map();

const getCachedEntity = (entityId) => {
  if (!cache.has(entityId)) {
    cache.set(entityId, parseEntity(entityId));
  }
  return cache.get(entityId);
};
```

## Troubleshooting

### Common Issues

1. **Missing Entity Data**
   - Ensure all three files exist: .puml, schema.json, example.json
   - Check file naming conventions match exactly

2. **PlantUML Parsing Errors**
   - Verify PlantUML syntax is valid
   - Check for special characters in entity names

3. **Performance Issues**
   - Implement pagination for large entity lists
   - Use React.memo for expensive components
   - Consider data virtualization

### Debug Mode
```javascript
// Add to App.js for debugging
const DEBUG = process.env.NODE_ENV === 'development';

if (DEBUG) {
  console.log('Loaded entities:', entities.length);
  console.log('Selected entity:', selectedEntity);
}
```

## Next Steps

1. **Enhance Diagram Rendering**: Implement proper graph layout algorithms
2. **Add More Entity Types**: Include work-product-component, reference-data
3. **Build Analysis Tools**: Schema evolution tracking, dependency graphs
4. **Create Documentation Generator**: Auto-generate entity documentation
5. **Implement Search**: Full-text search across schemas and examples
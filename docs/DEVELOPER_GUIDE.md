# Developer Guide

## Architecture Overview

The OSDU Data Model Explorer is built as a React single-page application with the following key architectural components:

### Frontend Architecture
- **React 18** with functional components and hooks
- **Component-based architecture** with clear separation of concerns
- **State management** using React hooks (useState, useEffect, useCallback)
- **AWS Amplify** for authentication and AWS service integration
- **PlantUML rendering** via @hpcc-js/wasm for diagram visualization

### Backend Integration
- **AWS Cognito** for authentication
- **GraphQL APIs** for OSDU data access
- **OpenSearch** for direct data queries
- **Express proxy server** for CORS handling

## Project Structure

```
src/
├── components/           # React components
│   ├── AuthWrapper.js   # AWS Cognito authentication wrapper
│   ├── DiagramViewer.js # PlantUML diagram rendering
│   ├── EntityBrowser.js # Entity navigation and search
│   ├── OsduDataBrowser.js # Live OSDU data browser
│   ├── PropertiesPanel.js # Schema and data display
│   └── ...
├── services/            # External service integrations
│   └── osduApi.js      # OSDU backend API client
├── utils/              # Utility functions
│   ├── dataLoader.js   # Entity data loading and processing
│   ├── exportUtils.js  # Data export functionality
│   └── ...
├── data/               # Static data and sample entities
│   ├── osduEntities.js # Pre-loaded OSDU entity definitions
│   └── sampleData.js   # Sample data for development
├── config/             # Configuration files
│   └── awsConfig.js    # AWS Amplify configuration
└── App.js              # Main application component
```

## Development Setup

### Prerequisites
- Node.js 14+ and npm
- AWS account with Cognito User Pool configured
- Access to OSDU backend APIs (optional for development)

### Installation

1. **Clone and install dependencies**:
```bash
git clone <repository-url>
cd OpenDataUniverseApp
npm install
```

2. **Environment Configuration**:
Create `.env` file with required variables:
```bash
# OSDU API Endpoints
REACT_APP_SEARCH_API_URL=https://your-osdu-search-endpoint
REACT_APP_SCHEMA_API_URL=https://your-osdu-schema-endpoint
REACT_APP_OPENSEARCH_ENDPOINT=https://your-opensearch-endpoint

# AWS Cognito Configuration
REACT_APP_AWS_REGION=us-east-1
REACT_APP_USER_POOL_ID=us-east-1_xxxxxxxxx
REACT_APP_USER_POOL_WEB_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
```

3. **Start development server**:
```bash
npm start
```

4. **Start proxy server** (for CORS handling):
```bash
npm run server
```

5. **Run both together**:
```bash
npm run dev
```

## Key Components Deep Dive

### App.js - Main Application

**Responsibilities**:
- Global state management
- Entity loading and chunking
- Event handling coordination
- Authentication wrapper integration

**Key State**:
```javascript
const [entities, setEntities] = useState(sampleEntities);
const [appState, setAppState] = useState({
  selectedEntity: null,
  selectedNode: null,
  sidebarOpen: false,
  liveDataMode: false
});
```

**Performance Optimizations**:
- Lazy loading of entities with `DataLoader.loadOsduEntitiesLazy()`
- Chunked loading to prevent UI blocking
- Transform state caching per entity
- Memoized event handlers with `useCallback`

### DiagramViewer.js - PlantUML Rendering

**Key Features**:
- PlantUML to SVG conversion using @hpcc-js/wasm
- Interactive node clicking with event delegation
- Zoom and pan functionality with transform persistence
- Dynamic diagram generation from OSDU records

**Implementation Details**:
```javascript
// PlantUML rendering
const renderDiagram = async (pumlContent) => {
  const hpccWasm = await import('@hpcc-js/wasm');
  const hpcc = await hpccWasm.wasmFolder();
  const svg = await hpcc.render(pumlContent);
  return svg;
};

// Interactive node handling
const handleSvgClick = (event) => {
  const clickedElement = event.target.closest('[data-node-name]');
  if (clickedElement && onNodeClick) {
    const nodeName = clickedElement.getAttribute('data-node-name');
    onNodeClick(nodeName);
  }
};
```

### OsduDataBrowser.js - Live Data Integration

**Responsibilities**:
- Real-time OSDU backend queries
- Organisation record search and display
- Connection testing and error handling
- Record selection and processing

**API Integration Pattern**:
```javascript
const searchData = async () => {
  try {
    setLoading(true);
    const results = await OSDUApi.searchOrganisations();
    setRecords(results);
  } catch (error) {
    setError(error.message);
  } finally {
    setLoading(false);
  }
};
```

### DataLoader Utility

**Performance Features**:
- Lazy loading with dynamic imports
- Chunked processing to prevent UI blocking
- Memory-efficient entity loading
- Error handling and fallback mechanisms

**Implementation**:
```javascript
export class DataLoader {
  static async loadOsduEntitiesLazy() {
    try {
      const { osduEntities } = await import('../data/osduEntities.js');
      return osduEntities;
    } catch (error) {
      console.warn('Failed to load osduEntities:', error);
      return [];
    }
  }

  static async loadEntitiesInChunks(entities, callback, chunkSize = 50) {
    for (let i = 0; i < entities.length; i += chunkSize) {
      const chunk = entities.slice(0, i + chunkSize);
      callback(chunk);
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }
}
```

## Authentication Integration

### AWS Amplify Setup

The application uses AWS Amplify for Cognito integration:

```javascript
// config/awsConfig.js
import { Amplify } from 'aws-amplify';

Amplify.configure({
  Auth: {
    Cognito: {
      region: process.env.REACT_APP_AWS_REGION,
      userPoolId: process.env.REACT_APP_USER_POOL_ID,
      userPoolClientId: process.env.REACT_APP_USER_POOL_WEB_CLIENT_ID,
    }
  }
});
```

### Token Management

Automatic token refresh and management:

```javascript
const getAuthToken = async () => {
  const session = await fetchAuthSession({ forceRefresh: false });
  return session.tokens?.accessToken?.toString() || 
         session.tokens?.idToken?.toString();
};
```

## Data Processing Patterns

### Entity Matching Algorithm

The application uses sophisticated matching to connect uploaded data with known schemas:

```javascript
const matchEntity = (fileData, entities) => {
  // Extract from kind field
  const kind = fileData.schema?.kind;
  if (kind) {
    const kindMatch = kind.match(/^[\w\-.]+:[\w\-.]+:([\w\-.]+):([0-9]+\.[0-9]+\.[0-9]+)$/);
    if (kindMatch) {
      const [, entityPart, version] = kindMatch;
      const base = entityPart.replace(/^(master-data--|work-product-component--|reference-data--)/, '');
      return entities.find(e => e.name.toLowerCase() === base.toLowerCase() && e.version === version);
    }
  }
  
  // Fallback to filename matching
  const fileName = fileData.name.replace('.json', '').split('.')[0];
  return entities.find(e => e.name.toLowerCase().includes(fileName.toLowerCase()));
};
```

### Dynamic PlantUML Generation

For live OSDU records without predefined diagrams:

```javascript
const generateRecordPuml = (record) => {
  const className = (record.kind || record.type || 'OSDURecord').replace(/[^a-zA-Z0-9]/g, '_');
  const properties = Object.keys(record).slice(0, 15).map(key => {
    const value = record[key];
    const type = Array.isArray(value) ? `${typeof value[0] || 'unknown'}[]` : typeof value;
    return `  +${key}: ${type}`;
  }).join('\n');
  
  return `@startuml
class "${className}" {
${properties}
}
note right of "${className}"
  Live OSDU Record
  ${Object.keys(record).length} properties
end note
@enduml`;
};
```

## Performance Optimization

### Chunked Loading Strategy

Large entity datasets are loaded in chunks to prevent UI blocking:

```javascript
const loadEntitiesInChunks = async (entities, callback, chunkSize = 50) => {
  for (let i = 0; i < entities.length; i += chunkSize) {
    const chunk = entities.slice(0, i + chunkSize);
    callback(chunk);
    // Yield control to prevent blocking
    await new Promise(resolve => setTimeout(resolve, 10));
  }
};
```

### Transform State Caching

Diagram zoom/pan states are cached per entity:

```javascript
const [entityTransforms, setEntityTransforms] = useState(new Map());

const handleTransformChange = useCallback((entityName, transform) => {
  setEntityTransforms(prev => {
    const newMap = new Map(prev);
    newMap.set(entityName, transform);
    return newMap;
  });
}, []);
```

### Memory Management

- Lazy imports for large data files
- Component-level error boundaries
- Cleanup of event listeners and timeouts
- Efficient re-rendering with React.memo and useCallback

## Error Handling Strategy

### Component-Level Error Boundaries

```javascript
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong. Please refresh the page.</div>;
    }
    return this.props.children;
  }
}
```

### API Error Handling

Consistent error handling across all API calls:

```javascript
const handleApiCall = async (apiFunction) => {
  try {
    setLoading(true);
    setError(null);
    const result = await apiFunction();
    return result;
  } catch (error) {
    const errorMessage = error.message || 'An unexpected error occurred';
    setError(errorMessage);
    console.error('API call failed:', error);
    throw error;
  } finally {
    setLoading(false);
  }
};
```

## Testing Strategy

### Unit Testing

Test individual components and utilities:

```javascript
// Example test for DataLoader
import { DataLoader } from '../utils/dataLoader';

describe('DataLoader', () => {
  test('loads entities lazily', async () => {
    const entities = await DataLoader.loadOsduEntitiesLazy();
    expect(Array.isArray(entities)).toBe(true);
  });

  test('processes entities in chunks', async () => {
    const mockEntities = new Array(100).fill({}).map((_, i) => ({ id: i }));
    const chunks = [];
    
    await DataLoader.loadEntitiesInChunks(mockEntities, (chunk) => {
      chunks.push(chunk.length);
    }, 25);
    
    expect(chunks).toEqual([25, 50, 75, 100]);
  });
});
```

### Integration Testing

Test component interactions and API integrations:

```javascript
// Example integration test
import { render, screen, waitFor } from '@testing-library/react';
import { OSDUApi } from '../services/osduApi';
import OsduDataBrowser from '../components/OsduDataBrowser';

jest.mock('../services/osduApi');

test('loads and displays OSDU records', async () => {
  const mockRecords = [
    { id: '1', organisationName: 'Test Org', kind: 'Organisation' }
  ];
  
  OSDUApi.searchOrganisations.mockResolvedValue(mockRecords);
  
  render(<OsduDataBrowser isOpen={true} onClose={() => {}} onRecordSelect={() => {}} />);
  
  await waitFor(() => {
    expect(screen.getByText('Test Org')).toBeInTheDocument();
  });
});
```

## Deployment Considerations

### Build Optimization

```bash
# Production build with optimizations
npm run build

# Analyze bundle size
npm install -g webpack-bundle-analyzer
npx webpack-bundle-analyzer build/static/js/*.js
```

### Environment-Specific Configuration

Use different environment files for different deployment stages:
- `.env.development` - Local development
- `.env.staging` - Staging environment
- `.env.production` - Production environment

### Security Best Practices

- Environment variables for sensitive configuration
- Token refresh handling
- CORS configuration via proxy server
- Input validation and sanitization
- Error message sanitization in production

## Extending the Application

### Adding New Components

1. Create component in `src/components/`
2. Follow existing patterns for props and state management
3. Add error boundary wrapping if needed
4. Include proper TypeScript-style prop documentation

### Adding New Data Sources

1. Extend `OSDUApi` class with new methods
2. Add corresponding error handling
3. Update data processing utilities
4. Add integration tests

### Adding New Visualization Types

1. Create new viewer component
2. Implement data transformation utilities
3. Add to main application routing
4. Include performance optimizations

This developer guide provides the foundation for understanding, maintaining, and extending the OSDU Data Model Explorer application.
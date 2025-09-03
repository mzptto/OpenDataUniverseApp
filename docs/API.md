# API Documentation

## Overview

The OSDU Data Model Explorer provides both internal APIs for component communication and external APIs for OSDU data integration.

## Internal APIs

### OSDUApi Class

The main service class for OSDU backend integration.

#### Authentication Methods

##### `testConnection()`
Tests AWS Cognito authentication status.

```javascript
const result = await OSDUApi.testConnection();
// Returns: { success: boolean, user?: object, error?: string }
```

##### `testGraphQLConnection()`
Tests GraphQL endpoint connectivity.

```javascript
const result = await OSDUApi.testGraphQLConnection();
// Returns: { success: boolean, result?: object, status?: number, error?: string }
```

#### Search Methods

##### `searchOrganisations()`
Searches for Organisation records in OSDU.

```javascript
const organisations = await OSDUApi.searchOrganisations();
// Returns: Array<{
//   id: string,
//   kind: string,
//   organisationName: string,
//   organisationId: string,
//   fullRecord: object
// }>
```

##### `getRecordById(id)`
Retrieves a specific record by ID.

```javascript
const record = await OSDUApi.getRecordById('namespace:type:id:version');
// Returns: {
//   id: string,
//   kind: string,
//   version: string,
//   acl: object,
//   legal: object,
//   data: object
// }
```

##### `searchOpenSearch(query, index)`
Direct OpenSearch queries (if available).

```javascript
const results = await OSDUApi.searchOpenSearch('*', 'osdu-*');
// Returns: Array<{
//   id: string,
//   index: string,
//   kind: string,
//   organisationName: string,
//   organisationId: string,
//   fullRecord: object
// }>
```

### DataLoader Utility

Handles loading and processing of OSDU entity data.

#### Methods

##### `loadOsduEntitiesLazy()`
Lazy loads OSDU entities for performance.

```javascript
const entities = await DataLoader.loadOsduEntitiesLazy();
// Returns: Array<Entity>
```

##### `loadEntitiesInChunks(entities, callback)`
Loads entities in chunks to prevent UI blocking.

```javascript
await DataLoader.loadEntitiesInChunks(entities, (chunkedEntities) => {
  setEntities(chunkedEntities);
});
```

## Component APIs

### App Component Props

Main application component managing global state.

#### State Structure

```javascript
const appState = {
  selectedEntity: Entity | null,
  selectedNode: string | null,
  sidebarOpen: boolean,
  liveDataMode: boolean
};
```

#### Event Handlers

- `handleEntitySelect(entity)` - Selects an entity for viewing
- `handleRecordSelect(record)` - Processes live OSDU record selection
- `handleFileSelect(fileData)` - Handles file upload/selection
- `handleNodeClick(nodeName)` - Handles diagram node clicks

### EntityBrowser Component

#### Props
```javascript
{
  entities: Array<Entity>,
  selectedEntity: Entity | null,
  onEntitySelect: (entity: Entity) => void
}
```

### DiagramViewer Component

#### Props
```javascript
{
  pumlContent: string,
  onNodeClick: (nodeName: string) => void,
  entityName: string,
  entityVersion: string,
  kind: string,
  onTransformChange: (entityName: string, transform: object) => void,
  initialTransform: object | null,
  exampleData: object,
  fileName: string
}
```

### PropertiesPanel Component

#### Props
```javascript
{
  schema: object | null,
  example: object | null,
  selectedNode: string | null
}
```

### OsduDataBrowser Component

#### Props
```javascript
{
  isOpen: boolean,
  onClose: () => void,
  onRecordSelect: (record: object) => void
}
```

## Data Structures

### Entity Object

```javascript
{
  id: string,
  name: string,
  type: string,
  version: string,
  pumlContent: string,
  schema: {
    title: string,
    description: string,
    type: string,
    properties: object
  },
  example: object
}
```

### OSDU Record Object

```javascript
{
  id: string,
  kind: string,
  version: string,
  acl: {
    viewers: Array<string>,
    owners: Array<string>
  },
  legal: {
    legaltags: Array<string>,
    otherRelevantDataCountries: Array<string>
  },
  data: object
}
```

## Environment Variables

Required environment variables for API integration:

```bash
REACT_APP_SEARCH_API_URL=https://your-osdu-search-endpoint
REACT_APP_SCHEMA_API_URL=https://your-osdu-schema-endpoint
REACT_APP_OPENSEARCH_ENDPOINT=https://your-opensearch-endpoint

# AWS Cognito Configuration
REACT_APP_AWS_REGION=us-east-1
REACT_APP_USER_POOL_ID=us-east-1_xxxxxxxxx
REACT_APP_USER_POOL_WEB_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Error Handling

### Common Error Types

#### Authentication Errors
```javascript
{
  success: false,
  error: "No auth token available"
}
```

#### GraphQL Errors
```javascript
{
  errors: [
    {
      message: "Query validation error",
      locations: [{ line: 1, column: 1 }]
    }
  ]
}
```

#### Network Errors
```javascript
{
  success: false,
  error: "Network request failed",
  status: 500
}
```

## Rate Limiting

The application implements client-side rate limiting for OSDU API calls:
- Maximum 10 concurrent requests
- 1-second delay between batch operations
- Automatic retry with exponential backoff

## Security Considerations

- All API calls require valid AWS Cognito JWT tokens
- Tokens are automatically refreshed when expired
- CORS is handled by the backend proxy server
- Sensitive data is not logged in production builds

## Testing APIs

Use the built-in connection test component to verify API connectivity:

```javascript
// Test authentication
const authResult = await OSDUApi.testConnection();

// Test GraphQL endpoint
const graphqlResult = await OSDUApi.testGraphQLConnection();

// Test search functionality
const searchResult = await OSDUApi.testOrganisationSearch();
```
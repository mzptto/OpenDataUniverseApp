# Architecture Documentation

## System Overview

The OSDU Data Model Explorer is a modern web application designed to visualize and explore OSDU (Open Subsurface Data Universe) data models, schemas, and relationships. The architecture follows a client-server pattern with React frontend and AWS cloud services integration.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Browser                           │
├─────────────────────────────────────────────────────────────┤
│  React Application (OSDU Data Model Explorer)              │
│  ├── Authentication (AWS Amplify/Cognito)                  │
│  ├── Data Visualization (PlantUML/SVG)                     │
│  ├── State Management (React Hooks)                        │
│  └── API Integration (GraphQL/REST)                        │
├─────────────────────────────────────────────────────────────┤
│                   Proxy Server (Express)                   │
│  ├── CORS Handling                                         │
│  ├── Request Routing                                       │
│  └── Development Support                                   │
├─────────────────────────────────────────────────────────────┤
│                    AWS Cloud Services                      │
│  ├── Cognito (Authentication)                              │
│  ├── API Gateway (Optional)                                │
│  └── CloudFront (CDN)                                      │
├─────────────────────────────────────────────────────────────┤
│                    OSDU Backend                             │
│  ├── Search Service (GraphQL)                              │
│  ├── Schema Service (GraphQL)                              │
│  ├── Storage Service                                       │
│  └── OpenSearch (Direct Queries)                           │
└─────────────────────────────────────────────────────────────┘
```

## Frontend Architecture

### Component Hierarchy

```
App
├── AuthWrapper
│   └── ErrorBoundary
│       ├── ConnectionTest
│       ├── MainNavigation
│       │   └── EntityBrowser
│       ├── OsduDataBrowser
│       │   ├── SearchBrowser
│       │   └── DataBrowser
│       ├── FileSelector
│       ├── DiagramViewer
│       │   └── PlantUML Renderer
│       └── PropertiesPanel
│           ├── Schema Viewer
│           └── Example Data Viewer
```

### State Management Architecture

The application uses React's built-in state management with hooks:

```javascript
// Global Application State
const [entities, setEntities] = useState(sampleEntities);
const [appState, setAppState] = useState({
  selectedEntity: null,
  selectedNode: null,
  sidebarOpen: false,
  liveDataMode: false
});

// Performance Optimizations
const [entityTransforms, setEntityTransforms] = useState(new Map());
const [isLoadingEntities, setIsLoadingEntities] = useState(true);
```

### Data Flow Architecture

```
User Interaction
      ↓
Event Handlers (useCallback)
      ↓
State Updates (useState)
      ↓
Component Re-renders
      ↓
Side Effects (useEffect)
      ↓
API Calls / Data Processing
      ↓
State Updates
      ↓
UI Updates
```

## Backend Integration Architecture

### Authentication Flow

```
1. User Access → AWS Cognito Login
2. Cognito → JWT Token Generation
3. Token Storage → AWS Amplify Session
4. API Requests → Token Attachment
5. Token Refresh → Automatic Handling
```

### API Integration Patterns

#### GraphQL Integration
```javascript
// Service Layer Pattern
class OSDUApi {
  static async executeGraphQL(query, variables) {
    const token = await getAuthToken();
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify({ query, variables })
    });
    return response.json();
  }
}
```

#### Error Handling Architecture
```javascript
// Centralized Error Handling
const handleApiCall = async (apiFunction) => {
  try {
    setLoading(true);
    setError(null);
    return await apiFunction();
  } catch (error) {
    setError(error.message);
    trackError(error);
    throw error;
  } finally {
    setLoading(false);
  }
};
```

## Data Processing Architecture

### Entity Loading Strategy

```
Static Data Loading:
├── Sample Entities (Development)
├── Pre-loaded OSDU Entities
└── Chunked Loading (Performance)

Dynamic Data Loading:
├── File Upload Processing
├── Live OSDU Backend Queries
└── Real-time Schema Matching
```

### Data Transformation Pipeline

```
Raw Data Input
      ↓
Data Validation
      ↓
Schema Matching
      ↓
Entity Creation
      ↓
PlantUML Generation
      ↓
Diagram Rendering
      ↓
Interactive Display
```

## Visualization Architecture

### PlantUML Rendering Pipeline

```javascript
// Rendering Architecture
PlantUML Source
      ↓
@hpcc-js/wasm Processing
      ↓
SVG Generation
      ↓
DOM Injection
      ↓
Event Listener Attachment
      ↓
Interactive Diagram
```

### Diagram Interaction System

```javascript
// Event Delegation Pattern
const handleSvgClick = (event) => {
  const clickedElement = event.target.closest('[data-node-name]');
  if (clickedElement) {
    const nodeName = clickedElement.getAttribute('data-node-name');
    onNodeClick(nodeName);
  }
};
```

## Performance Architecture

### Loading Optimization Strategy

```
Lazy Loading:
├── Dynamic Imports
├── Code Splitting
└── Component Lazy Loading

Chunked Processing:
├── Entity Loading in Batches
├── UI Non-blocking Updates
└── Progressive Enhancement

Caching Strategy:
├── Transform State Caching
├── API Response Caching
└── Component Memoization
```

### Memory Management

```javascript
// Memory Optimization Patterns
const MemoizedComponent = React.memo(Component);
const memoizedCallback = useCallback(callback, dependencies);
const memoizedValue = useMemo(() => computation, dependencies);

// Cleanup Patterns
useEffect(() => {
  const cleanup = () => {
    // Remove event listeners
    // Clear timeouts
    // Cancel API requests
  };
  return cleanup;
}, []);
```

## Security Architecture

### Authentication Security

```
Token Management:
├── JWT Token Storage (Memory)
├── Automatic Token Refresh
├── Secure Token Transmission
└── Token Expiration Handling

API Security:
├── HTTPS Only Communication
├── CORS Configuration
├── Request Validation
└── Error Message Sanitization
```

### Data Security

```
Client-Side Security:
├── Input Validation
├── XSS Prevention
├── Content Security Policy
└── Secure Data Handling

Backend Security:
├── Authentication Required
├── Authorization Checks
├── Rate Limiting
└── Audit Logging
```

## Scalability Architecture

### Frontend Scalability

```
Performance Scaling:
├── Code Splitting
├── Lazy Loading
├── Virtual Scrolling (Future)
└── Service Worker Caching (Future)

Data Scaling:
├── Chunked Data Loading
├── Progressive Data Fetching
├── Efficient State Management
└── Memory Optimization
```

### Backend Scalability

```
API Scaling:
├── GraphQL Query Optimization
├── Batch Request Handling
├── Connection Pooling
└── Caching Strategies

Infrastructure Scaling:
├── CDN Distribution
├── Load Balancing
├── Auto Scaling Groups
└── Database Optimization
```

## Deployment Architecture

### Development Environment

```
Local Development:
├── React Dev Server (Port 3000)
├── Express Proxy Server (Port 3001)
├── Hot Module Replacement
└── Development Tools Integration
```

### Production Environment

```
Production Deployment:
├── Static Build Generation
├── CDN Distribution (CloudFront)
├── HTTPS Termination
└── Performance Monitoring

Container Architecture:
├── Docker Containerization
├── Kubernetes Orchestration
├── Health Checks
└── Rolling Updates
```

## Integration Architecture

### OSDU Platform Integration

```
OSDU Services Integration:
├── Search Service (GraphQL)
├── Schema Service (GraphQL)
├── Storage Service (REST)
└── Legal Service (REST)

Data Model Integration:
├── Schema Validation
├── Kind-based Routing
├── Version Management
└── Metadata Handling
```

### AWS Services Integration

```
AWS Integration:
├── Cognito (Authentication)
├── Amplify (Frontend Hosting)
├── API Gateway (Optional)
├── CloudFront (CDN)
├── S3 (Static Assets)
└── CloudWatch (Monitoring)
```

## Monitoring and Observability

### Application Monitoring

```javascript
// Performance Monitoring
const trackPerformance = (metric, value) => {
  if (process.env.NODE_ENV === 'production') {
    // Send to monitoring service
    console.log(`${metric}: ${value}ms`);
  }
};

// Error Tracking
const trackError = (error, context) => {
  // Error reporting service integration
  console.error('Error:', error, context);
};
```

### Health Checks

```javascript
// Connection Health Monitoring
const healthCheck = async () => {
  const checks = await Promise.allSettled([
    OSDUApi.testConnection(),
    OSDUApi.testGraphQLConnection(),
    checkDataIntegrity()
  ]);
  
  return checks.map(check => ({
    status: check.status,
    result: check.value || check.reason
  }));
};
```

## Future Architecture Considerations

### Planned Enhancements

```
Performance Improvements:
├── Virtual Scrolling for Large Datasets
├── Service Worker Implementation
├── Advanced Caching Strategies
└── WebAssembly Integration

Feature Enhancements:
├── Real-time Collaboration
├── Advanced Search Capabilities
├── Data Export/Import
└── Custom Visualization Types

Infrastructure Improvements:
├── Microservices Architecture
├── Event-Driven Updates
├── Advanced Monitoring
└── Multi-tenant Support
```

### Scalability Roadmap

```
Short Term:
├── Component Library Extraction
├── Advanced State Management
├── Performance Optimization
└── Testing Infrastructure

Long Term:
├── Micro-frontend Architecture
├── Real-time Data Streaming
├── Advanced Analytics
└── Machine Learning Integration
```

This architecture documentation provides a comprehensive overview of the system design, patterns, and considerations that guide the OSDU Data Model Explorer application development and deployment.
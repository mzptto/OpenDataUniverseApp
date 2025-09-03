# Configuration Guide

## Environment Variables

The OSDU Data Model Explorer requires several environment variables for proper operation. Create a `.env` file in the project root with the following configuration:

### Required Variables

#### OSDU API Endpoints
```bash
# GraphQL endpoint for OSDU search operations
REACT_APP_SEARCH_API_URL=https://your-osdu-domain/api/search/v2/query

# GraphQL endpoint for OSDU schema operations  
REACT_APP_SCHEMA_API_URL=https://your-osdu-domain/api/schema-service/v1/schema

# OpenSearch endpoint for direct queries (optional)
REACT_APP_OPENSEARCH_ENDPOINT=https://your-opensearch-domain
```

#### AWS Cognito Configuration
```bash
# AWS region where your Cognito User Pool is located
REACT_APP_AWS_REGION=us-east-1

# Cognito User Pool ID
REACT_APP_USER_POOL_ID=us-east-1_xxxxxxxxx

# Cognito User Pool Web Client ID
REACT_APP_USER_POOL_WEB_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Optional Variables

#### Development Configuration
```bash
# Enable development mode features
REACT_APP_DEV_MODE=true

# Enable detailed logging
REACT_APP_DEBUG_LOGGING=true

# Mock data mode (for development without backend)
REACT_APP_MOCK_DATA=false

# Custom data source paths
REACT_APP_CUSTOM_ENTITIES_PATH=/path/to/custom/entities
```

#### Performance Tuning
```bash
# Entity loading chunk size (default: 50)
REACT_APP_CHUNK_SIZE=50

# API request timeout in milliseconds (default: 30000)
REACT_APP_API_TIMEOUT=30000

# Maximum concurrent API requests (default: 10)
REACT_APP_MAX_CONCURRENT_REQUESTS=10
```

## AWS Cognito Setup

### User Pool Configuration

1. **Create User Pool**:
   - Sign in to AWS Console
   - Navigate to Amazon Cognito
   - Create a new User Pool
   - Configure sign-in options (email, username)

2. **App Client Configuration**:
   ```json
   {
     "ClientName": "osdu-data-explorer",
     "ExplicitAuthFlows": [
       "ALLOW_USER_SRP_AUTH",
       "ALLOW_REFRESH_TOKEN_AUTH"
     ],
     "GenerateSecret": false,
     "ReadAttributes": ["email", "name"],
     "WriteAttributes": ["email", "name"]
   }
   ```

3. **Domain Configuration**:
   - Set up a custom domain or use Cognito domain
   - Configure callback URLs for your application
   - Set logout URLs

### Identity Pool (Optional)

If using AWS services beyond authentication:

```json
{
  "IdentityPoolName": "osdu_data_explorer_identity_pool",
  "AllowUnauthenticatedIdentities": false,
  "CognitoIdentityProviders": [
    {
      "ProviderName": "cognito-idp.us-east-1.amazonaws.com/us-east-1_xxxxxxxxx",
      "ClientId": "xxxxxxxxxxxxxxxxxxxxxxxxxx"
    }
  ]
}
```

## OSDU Backend Configuration

### GraphQL Endpoint Setup

Ensure your OSDU deployment has the following services configured:

#### Search Service
- **Endpoint**: `/api/search/v2/query`
- **Required Queries**:
  - `search(input: SearchInput): SearchResults`
  - `getRecord(id: String!): Record`

#### Schema Service  
- **Endpoint**: `/api/schema-service/v1/schema`
- **Required Queries**:
  - `getSchema(kind: String!): Schema`
  - `listSchemas(): [Schema]`

### CORS Configuration

Configure CORS on your OSDU backend to allow requests from your application domain:

```json
{
  "allowedOrigins": [
    "http://localhost:3000",
    "https://your-app-domain.com"
  ],
  "allowedMethods": ["GET", "POST", "OPTIONS"],
  "allowedHeaders": [
    "Content-Type",
    "Authorization",
    "X-Requested-With"
  ],
  "allowCredentials": true
}
```

## Proxy Server Configuration

The application includes an Express proxy server for development CORS handling.

### server.js Configuration

```javascript
const express = require('express');
const cors = require('cors');
const app = express();

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Proxy configuration
app.use('/api/search', createProxyMiddleware({
  target: process.env.REACT_APP_SEARCH_API_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api/search': ''
  }
}));

app.listen(3001, () => {
  console.log('Proxy server running on port 3001');
});
```

### Environment-Specific Proxy

Create different proxy configurations for different environments:

```bash
# Development
PROXY_TARGET_SEARCH=http://localhost:8080/api/search
PROXY_TARGET_SCHEMA=http://localhost:8081/api/schema

# Staging  
PROXY_TARGET_SEARCH=https://staging-osdu.company.com/api/search
PROXY_TARGET_SCHEMA=https://staging-osdu.company.com/api/schema

# Production
PROXY_TARGET_SEARCH=https://osdu.company.com/api/search
PROXY_TARGET_SCHEMA=https://osdu.company.com/api/schema
```

## Data Source Configuration

### Static Entity Data

Configure the path to your OSDU entity definitions:

```javascript
// src/data/osduEntities.js
export const osduEntities = [
  {
    id: 'organisation-1.0.0',
    name: 'Organisation',
    version: '1.0.0',
    type: 'master-data',
    pumlContent: '...',
    schema: { ... },
    example: { ... }
  }
  // ... more entities
];
```

### Dynamic Data Loading

Configure dynamic loading from external sources:

```javascript
// src/utils/dataLoader.js
export class DataLoader {
  static async loadFromExternalSource() {
    const response = await fetch(process.env.REACT_APP_EXTERNAL_DATA_URL);
    return response.json();
  }
}
```

## Build Configuration

### Development Build

```json
{
  "scripts": {
    "start": "react-scripts start",
    "dev": "concurrently \"npm run server\" \"npm start\"",
    "server": "node server.js"
  }
}
```

### Production Build

```json
{
  "scripts": {
    "build": "react-scripts build",
    "build:analyze": "npm run build && npx webpack-bundle-analyzer build/static/js/*.js"
  }
}
```

### Environment-Specific Builds

```bash
# Development
npm run build:dev

# Staging
npm run build:staging

# Production  
npm run build:prod
```

## Security Configuration

### Content Security Policy

Add CSP headers for enhanced security:

```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self' https://*.amazonaws.com https://your-osdu-domain.com;
  font-src 'self';
">
```

### Authentication Token Configuration

```javascript
// src/config/awsConfig.js
import { Amplify } from 'aws-amplify';

Amplify.configure({
  Auth: {
    Cognito: {
      region: process.env.REACT_APP_AWS_REGION,
      userPoolId: process.env.REACT_APP_USER_POOL_ID,
      userPoolClientId: process.env.REACT_APP_USER_POOL_WEB_CLIENT_ID,
      loginWith: {
        oauth: {
          domain: 'your-cognito-domain.auth.us-east-1.amazoncognito.com',
          scopes: ['openid', 'email', 'profile'],
          redirectSignIn: 'http://localhost:3000/',
          redirectSignOut: 'http://localhost:3000/',
          responseType: 'code'
        }
      }
    }
  }
});
```

## Performance Configuration

### Bundle Optimization

```javascript
// webpack.config.js (if ejected)
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'all',
        }
      }
    }
  }
};
```

### Lazy Loading Configuration

```javascript
// src/utils/dataLoader.js
export class DataLoader {
  static chunkSize = parseInt(process.env.REACT_APP_CHUNK_SIZE) || 50;
  static loadDelay = parseInt(process.env.REACT_APP_LOAD_DELAY) || 10;
  
  static async loadEntitiesInChunks(entities, callback) {
    for (let i = 0; i < entities.length; i += this.chunkSize) {
      const chunk = entities.slice(0, i + this.chunkSize);
      callback(chunk);
      await new Promise(resolve => setTimeout(resolve, this.loadDelay));
    }
  }
}
```

## Monitoring Configuration

### Error Tracking

```javascript
// src/utils/errorTracking.js
export const trackError = (error, context) => {
  if (process.env.NODE_ENV === 'production') {
    // Send to error tracking service
    console.error('Error tracked:', error, context);
  } else {
    console.error('Development error:', error, context);
  }
};
```

### Performance Monitoring

```javascript
// src/utils/performance.js
export const trackPerformance = (metric, value) => {
  if (process.env.REACT_APP_PERFORMANCE_TRACKING === 'true') {
    console.log(`Performance metric: ${metric} = ${value}ms`);
  }
};
```

## Deployment Configuration

### Docker Configuration

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=0 /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Kubernetes Configuration

```yaml
# k8s-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: osdu-data-explorer
spec:
  replicas: 3
  selector:
    matchLabels:
      app: osdu-data-explorer
  template:
    metadata:
      labels:
        app: osdu-data-explorer
    spec:
      containers:
      - name: osdu-data-explorer
        image: osdu-data-explorer:latest
        ports:
        - containerPort: 80
        env:
        - name: REACT_APP_SEARCH_API_URL
          valueFrom:
            configMapKeyRef:
              name: osdu-config
              key: search-api-url
```

## Troubleshooting Configuration Issues

### Common Configuration Problems

1. **CORS Errors**:
   - Verify OSDU backend CORS settings
   - Check proxy server configuration
   - Ensure correct origin headers

2. **Authentication Failures**:
   - Verify Cognito User Pool configuration
   - Check client ID and region settings
   - Ensure proper callback URLs

3. **API Connection Issues**:
   - Verify endpoint URLs are correct
   - Check network connectivity
   - Validate authentication tokens

### Debug Configuration

Enable debug mode for troubleshooting:

```bash
REACT_APP_DEBUG_LOGGING=true
REACT_APP_DEV_MODE=true
```

This will enable detailed console logging and development features to help diagnose configuration issues.
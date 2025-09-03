# OSDU Data Model Explorer - Quick Start Guide

## 🚀 Starting the Application

### Option 1: Start Both Services Together (Recommended)
```bash
npm start
```
This will start:
- **React App** on http://localhost:3000
- **OSDU Proxy Server** on http://localhost:3001

### Option 2: Start Services Separately
```bash
# Terminal 1 - Start the proxy server
npm run server

# Terminal 2 - Start the React app  
npm run client
```

## 📁 Project Structure

```
OpenDataUniverseApp/
├── src/                    # React application source
│   ├── components/         # React components
│   ├── data/              # OSDU entities and sample data
│   └── utils/             # Utility functions
├── server.js              # OSDU proxy server (port 3001)
├── package.json           # Unified dependencies
└── public/                # Static assets
```

## 🔧 Features

### VS Code-Style Interface
- **Activity Bar**: Left-side icons for navigation
- **Sidebar**: Slide-out panels for entities and search
- **Main View**: Diagram viewer and search results

### OSDU Integration
- **Entity Browser**: Browse 1000+ OSDU entities with E-R diagrams
- **Search Service**: Full OSDU search with filters and pagination
- **Token Management**: Built-in token refresh functionality
- **Live Data**: Upload and visualize real OSDU data files

## 🔍 Using the Search Feature

1. Click the **Search icon** in the activity bar
2. Select **Data Type** filter (Master Data, Reference Data, etc.)
3. Enter search terms
4. Click **Search** button
5. Results appear in a sortable table
6. Click entity names to download full records

## 🔑 Token Management

1. Click **Update Token** in the search sidebar
2. Paste your OSDU bearer token
3. Click **Update Token** to save

## 📊 Entity Browser

1. Click the **Folder icon** in the activity bar
2. Browse entities by type
3. Use search to filter entities
4. Click any entity to view its E-R diagram and schema

## 🛠️ Development

- **React App**: Standard Create React App setup
- **Proxy Server**: Express.js server for OSDU API calls
- **CORS**: Configured for local development
- **Hot Reload**: Both client and server support hot reloading

## 📝 Notes

- The proxy server handles OSDU authentication and CORS
- All OSDU API calls are proxied through localhost:3001
- Entity data is loaded lazily for better performance
- Diagrams are rendered using PlantUML and @hpcc-js/wasm
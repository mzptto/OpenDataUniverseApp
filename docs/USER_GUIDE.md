# User Guide

## Getting Started

The OSDU Data Model Explorer is an interactive web application for visualizing and exploring OSDU (Open Subsurface Data Universe) data model schemas, relationships, and example data.

### First Launch

1. Open your browser and navigate to the application URL
2. Sign in with your AWS Cognito credentials when prompted
3. Wait for the application to load OSDU entities (this may take a moment)

## Main Interface

### Header Section

- **Title**: "OSDU Data Model Explorer" with entity count
- **Navigation Menu**: Access to different entity types
- **OSDU Data Button**: Opens live data browser
- **Live Data Toggle**: Switch between static and live data modes
- **File Selector**: Upload JSON files for analysis (when in Live Data mode)

### Main Content Area

The interface is divided into two main sections:

#### Diagram Viewer (Top)
- Displays E-R diagrams generated from PlantUML content
- Interactive nodes that can be clicked for detailed information
- Zoom and pan controls for large diagrams
- Transform state is preserved when switching between entities

#### Properties Panel (Bottom)
- Shows detailed schema information and example data
- Syntax-highlighted JSON display
- Toggleable between schema view and example data view

## Core Features

### 1. Entity Browser

**Location**: Left navigation menu

**Purpose**: Browse and search through available OSDU entity types

**How to Use**:
1. Click on the navigation menu to expand entity list
2. Scroll through available entities or use search functionality
3. Click on any entity to load its diagram and properties
4. Entity count is displayed in the header

### 2. Interactive Diagrams

**Location**: Main diagram viewer area

**Purpose**: Visual representation of entity relationships and structure

**How to Use**:
1. View the automatically generated E-R diagram
2. Use mouse wheel to zoom in/out
3. Click and drag to pan around large diagrams
4. Click on any node to see its specific properties in the bottom panel
5. Diagram transforms (zoom/pan) are remembered per entity

### 3. Schema Explorer

**Location**: Bottom properties panel

**Purpose**: Examine detailed JSON schema properties

**How to Use**:
1. Select an entity to view its schema
2. Click on diagram nodes to focus on specific properties
3. Use the syntax highlighting to understand schema structure
4. Toggle between schema and example data views

### 4. Live Data Mode

**Location**: Header toggle button and file selector

**Purpose**: Analyze real OSDU data files and live backend data

**How to Use**:
1. Click "Live Data" button to enable live data mode
2. **File Upload**: Use the file selector to upload JSON files
3. **Live Backend**: Click "OSDU Data" to browse live backend records
4. The application will automatically match uploaded data to known schemas
5. Click "Exit Live Data" to return to static mode

### 5. OSDU Data Browser

**Location**: Sidebar (opened via "OSDU Data" button)

**Purpose**: Search and browse live OSDU backend data

**How to Use**:
1. Click "OSDU Data" button to open the browser
2. The system will automatically search for available records
3. Browse through Organisation records and other data types
4. Click on any record to load it into the main viewer
5. Use the connection test to verify backend connectivity

## Working with Different Data Types

### Schema Files
- Upload `.json` files containing JSON schemas
- The application will attempt to match schemas to known entities
- Schema properties will be displayed with syntax highlighting

### Example Data Files
- Upload `.json` files containing example OSDU records
- The system will extract entity information from the `kind` field
- Data will be matched to corresponding schemas when available

### PlantUML Diagrams
- Diagrams are automatically generated from entity definitions
- Interactive elements allow exploration of relationships
- Visual representation helps understand data model structure

## Tips and Best Practices

### Performance Optimization
- Entities are loaded in chunks to prevent UI blocking
- Large datasets may take time to load initially
- Diagram transforms are cached to improve navigation speed

### Data Exploration
- Start with well-known entities like Organisation or Well
- Use the search functionality to quickly find specific entities
- Click on diagram nodes to understand property relationships
- Compare schema definitions with example data

### Troubleshooting
- Use the connection test to verify backend connectivity
- Check browser console for detailed error messages
- Ensure proper authentication credentials are configured
- Verify environment variables are set correctly

### File Management
- Supported file formats: JSON
- Files should contain valid OSDU schema or data structures
- Large files may take time to process and display

## Keyboard Shortcuts

- **Zoom In**: Mouse wheel up or Ctrl/Cmd + Plus
- **Zoom Out**: Mouse wheel down or Ctrl/Cmd + Minus
- **Pan**: Click and drag on diagram
- **Reset View**: Double-click on diagram background

## Common Workflows

### Exploring a New Entity Type
1. Open the navigation menu
2. Search for or select the desired entity
3. Review the E-R diagram structure
4. Click on nodes to examine specific properties
5. Toggle to example data to see real-world usage

### Analyzing Uploaded Data
1. Enable Live Data mode
2. Upload your JSON file using the file selector
3. Review the automatically generated diagram
4. Examine how your data maps to the schema
5. Use node clicks to focus on specific data sections

### Comparing Entities
1. Navigate between different entities using the menu
2. Compare diagram structures and complexity
3. Note common patterns and relationships
4. Use the properties panel to understand differences

## Advanced Features

### Transform Persistence
- Zoom and pan settings are remembered per entity
- Switching between entities preserves your viewing preferences
- Useful for comparing similar entities at the same scale

### Dynamic Schema Matching
- Uploaded files are automatically matched to known schemas
- The system extracts entity names from `kind` fields
- Fallback matching uses filename patterns

### Real-time Data Integration
- Live connection to OSDU backend systems
- Automatic authentication token management
- Real-time search and data retrieval capabilities
# OSDU Data Model Explorer

An interactive React application for visualizing and exploring OSDU (Open Subsurface Data Universe) data model schemas, relationships, and example data.

## Features

- **Interactive Entity Browser**: Browse and search through OSDU entity types
- **Visual Diagram Rendering**: Convert PlantUML diagrams to interactive visualizations
- **Schema Explorer**: Examine JSON schema properties with syntax highlighting
- **Example Data Viewer**: View sample data instances with schema mapping
- **Node-Level Inspection**: Click on diagram nodes to see specific properties and data

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. **Browse Entities**: Use the left sidebar to search and select different OSDU entity types
2. **Explore Diagrams**: View the visual representation of entity relationships
3. **Click Nodes**: Click on any node in the diagram to see its specific properties
4. **Toggle Views**: Switch between schema and example data in the bottom panel

## Architecture

### Components
- `EntityBrowser`: Left sidebar for entity navigation
- `DiagramViewer`: Main diagram visualization area
- `PropertiesPanel`: Bottom panel showing schema/data details

### Data Integration
To integrate with your OSDU data:

1. **Add Real Data**: Replace `src/data/sampleData.js` with your actual OSDU schemas
2. **Load PlantUML Files**: Import `.puml` files from your E-R diagrams folder
3. **Connect Schemas**: Link JSON schema files from your Generated folder
4. **Include Examples**: Add example JSON files from your Examples folder

### Example Integration Script

```javascript
// src/utils/dataLoader.js
export const loadOsduData = async () => {
  const entities = [];
  
  // Load from your OSDU data folders
  const pumlFiles = await loadPumlFiles('./E-R/_diagrams/');
  const schemaFiles = await loadSchemaFiles('./Generated/');
  const exampleFiles = await loadExampleFiles('./Examples/');
  
  // Combine into entity objects
  return entities;
};
```

## Extending the Application

### Adding New Visualizations
- Implement additional diagram renderers (D3.js, Cytoscape.js)
- Add graph analysis features (dependency tracking, impact analysis)

### Enhanced Data Views
- Add tabular data views
- Implement data validation against schemas
- Create data transformation utilities

### Advanced Features
- Real-time schema updates
- Collaborative annotations
- Export capabilities (PDF, PNG, JSON)

## Development

### Project Structure
```
src/
├── components/          # React components
├── utils/              # Utility functions
├── data/               # Sample data
└── App.js              # Main application
```

### Adding New Entity Types
1. Add entity data to `src/data/sampleData.js`
2. Include PlantUML content, JSON schema, and example data
3. The application will automatically render the new entity

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the Apache License 2.0 - see the LICENSE file for details.
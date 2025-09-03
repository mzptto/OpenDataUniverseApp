# Documentation Index

Welcome to the OSDU Data Model Explorer documentation. This comprehensive guide covers all aspects of the application from user interaction to technical implementation.

## Quick Start

New to the OSDU Data Model Explorer? Start here:

1. **[User Guide](USER_GUIDE.md)** - Learn how to use the application
2. **[Configuration Guide](CONFIGURATION.md)** - Set up your environment
3. **[API Documentation](API.md)** - Understand the available APIs

## Documentation Structure

### For End Users

- **[User Guide](USER_GUIDE.md)**
  - Getting started with the application
  - Feature overview and usage instructions
  - Common workflows and best practices
  - Troubleshooting tips

### For Developers

- **[Developer Guide](DEVELOPER_GUIDE.md)**
  - Architecture deep dive
  - Development setup and workflow
  - Component documentation
  - Testing strategies
  - Performance optimization

- **[API Documentation](API.md)**
  - Internal component APIs
  - External service integrations
  - Data structures and interfaces
  - Error handling patterns

### For System Administrators

- **[Configuration Guide](CONFIGURATION.md)**
  - Environment variable setup
  - AWS Cognito configuration
  - OSDU backend integration
  - Security configuration
  - Deployment options

- **[Architecture Documentation](ARCHITECTURE.md)**
  - System design overview
  - Component relationships
  - Data flow patterns
  - Security architecture
  - Scalability considerations

## Application Overview

The OSDU Data Model Explorer is an interactive React application designed to visualize and explore OSDU (Open Subsurface Data Universe) data model schemas, relationships, and example data.

### Key Features

- **Interactive Entity Browser**: Browse and search through OSDU entity types
- **Visual Diagram Rendering**: Convert PlantUML diagrams to interactive visualizations
- **Schema Explorer**: Examine JSON schema properties with syntax highlighting
- **Example Data Viewer**: View sample data instances with schema mapping
- **Live Data Integration**: Connect to OSDU backend for real-time data exploration
- **File Upload Support**: Analyze local JSON files and schemas

### Technology Stack

- **Frontend**: React 18, AWS Amplify, PlantUML rendering
- **Authentication**: AWS Cognito
- **Visualization**: @hpcc-js/wasm for PlantUML to SVG conversion
- **Backend Integration**: GraphQL APIs, OpenSearch
- **Development**: Node.js, Express proxy server

## Getting Started

### Prerequisites

- Node.js 14+ and npm
- AWS account with Cognito User Pool
- Access to OSDU backend APIs (optional for development)

### Quick Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Open application**:
   Navigate to [http://localhost:3000](http://localhost:3000)

For detailed setup instructions, see the [Configuration Guide](CONFIGURATION.md).

## Documentation Conventions

### Code Examples

All code examples in this documentation use the following conventions:

- **JavaScript/React**: ES6+ syntax with functional components
- **Environment Variables**: Prefixed with `REACT_APP_`
- **File Paths**: Relative to project root unless specified
- **API Endpoints**: Use placeholder URLs that should be replaced

### Terminology

- **Entity**: An OSDU data model definition with schema, examples, and diagrams
- **Schema**: JSON Schema definition for data validation and structure
- **PlantUML**: Text-based diagram markup language
- **Kind**: OSDU identifier format (namespace:type:entity:version)
- **Live Data**: Real-time data from OSDU backend services

## Support and Contribution

### Getting Help

1. **Check Documentation**: Start with the relevant guide above
2. **Review Examples**: Look at the `examples/` directory
3. **Check Issues**: Review existing GitHub issues
4. **Debug Mode**: Enable debug logging for troubleshooting

### Contributing

1. **Read Developer Guide**: Understand the architecture and patterns
2. **Follow Conventions**: Use existing code style and patterns
3. **Add Tests**: Include tests for new functionality
4. **Update Documentation**: Keep documentation current with changes

## Version History

### Current Version: 1.0.0

- Initial release with core functionality
- OSDU backend integration
- Interactive diagram visualization
- AWS Cognito authentication
- File upload and analysis

### Planned Features

- Enhanced search capabilities
- Real-time collaboration
- Advanced data export options
- Performance optimizations
- Additional visualization types

## License

This project is licensed under the Apache License 2.0. See the LICENSE file for details.

## Related Resources

### OSDU Community

- [OSDU Data Platform](https://community.opengroup.org/osdu/platform)
- [OSDU Data Definitions](https://community.opengroup.org/osdu/data/data-definitions)
- [OSDU Schema Documentation](https://community.opengroup.org/osdu/data/data-definitions/-/tree/master/E-R)

### AWS Resources

- [AWS Amplify Documentation](https://docs.amplify.aws/)
- [Amazon Cognito Documentation](https://docs.aws.amazon.com/cognito/)
- [AWS SDK for JavaScript](https://docs.aws.amazon.com/sdk-for-javascript/)

### Development Tools

- [React Documentation](https://reactjs.org/docs/)
- [PlantUML Documentation](https://plantuml.com/)
- [GraphQL Documentation](https://graphql.org/learn/)

---

**Need help?** Check the specific documentation sections above or review the troubleshooting sections in each guide.
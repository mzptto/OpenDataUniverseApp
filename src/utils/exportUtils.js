export class ExportUtils {
  static downloadJSON(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  static downloadCSV(entities, filename) {
    const headers = ['Name', 'Type', 'Version', 'Has Schema', 'Has Example', 'Has Diagram'];
    const rows = entities.map(entity => [
      entity.name,
      entity.type,
      entity.version,
      entity.schema ? 'Yes' : 'No',
      entity.example ? 'Yes' : 'No',
      entity.pumlContent ? 'Yes' : 'No'
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  static async downloadDiagramAsSVG(entityName) {
    const svgElement = document.querySelector('.diagram-container svg');
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${entityName}-diagram.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  static generateDocumentation(entities) {
    let markdown = '# OSDU Data Model Documentation\n\n';
    
    entities.forEach(entity => {
      markdown += `## ${entity.name} (v${entity.version})\n\n`;
      markdown += `**Type:** ${entity.type}\n\n`;
      
      if (entity.schema?.description) {
        markdown += `**Description:** ${entity.schema.description}\n\n`;
      }
      
      if (entity.schema?.properties?.data?.allOf) {
        markdown += '**Properties:**\n';
        entity.schema.properties.data.allOf.forEach(section => {
          if (section.properties) {
            Object.entries(section.properties).forEach(([key, prop]) => {
              markdown += `- **${key}**: ${prop.description || prop.type || 'No description'}\n`;
            });
          }
        });
        markdown += '\n';
      }
      
      markdown += '---\n\n';
    });

    return markdown;
  }
}
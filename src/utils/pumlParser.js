export class PlantUMLParser {
  static convertToDot(puml) {
    let dot = 'digraph Wellbore {\n';
    dot += '    rankdir=TB;\n';
    dot += '    node [shape=none, margin=0, fontname="Helvetica"]\n';
    dot += '    edge [fontname="Helvetica"]\n\n';
    
    const lines = puml.split('\n');
    const nodes = new Map();
    const edges = [];
    
    const cleanId = (name) => {
      return name.replace(/<[^>]*>/g, '').replace(/·/g, '.').replace(/[\[\]]/g, '').trim().replace(/[^\w]/g, '_');
    };
    
    lines.forEach(line => {
      const trimmed = line.trim();
      
      // Parse main class with size
      let match = trimmed.match(/class\s+"<size:\d+>([^<]+)<\/size>"\s+as\s+([^\s]+)\s+<<([^>]+)>>/);
      if (match) {
        const [, displayName, id, stereotype] = match;
        const cleanDisplayName = displayName.replace(/<[^>]*>/g, '').replace(/·/g, '.').trim();
        const cleanId = id.replace(/·/g, '_').replace(/[^\w]/g, '_');
        nodes.set(cleanId, { label: cleanDisplayName, stereotype, isMain: true });
      } else {
        // Parse regular class
        match = trimmed.match(/class\s+"([^"]+)"\s+as\s+([^\s]+)\s+<<([^>]+)>>/);
        if (match) {
          const [, displayName, id, stereotype] = match;
          const cleanDisplayName = displayName.replace(/<[^>]*>/g, '').replace(/·/g, '.').trim();
          const cleanId = id.replace(/·/g, '_').replace(/[^\w]/g, '_');
          nodes.set(cleanId, { label: cleanDisplayName, stereotype });
        } else {
          match = trimmed.match(/class\s+"([^"]+)"\s+<<([^>]+)>>/);
          if (match) {
            const [, displayName, stereotype] = match;
            const cleanDisplayName = displayName.replace(/<[^>]*>/g, '').replace(/·/g, '.').trim();
            const cleanId = displayName.replace(/[\s<>·\[\]]/g, '').replace(/[^\w]/g, '_');
            nodes.set(cleanId, { label: cleanDisplayName, stereotype });
          }
        }
      }
      
      // Parse abstract
      const abstractMatch = trimmed.match(/abstract\s+"([^"]+)"\s+<<([^>]+)>>/);
      if (abstractMatch) {
        const [, displayName, stereotype] = abstractMatch;
        const cleanDisplayName = displayName.replace(/·/g, '.').trim();
        const id = displayName.replace(/[\s\[\]·]/g, '').replace(/[^\w]/g, '_');
        nodes.set(id, { label: cleanDisplayName, stereotype });
      }
      
      // Parse relationships
      let relMatch = trimmed.match(/"([^"]+)"\s*(\*--|-->|->|\|>|-\|>|-right-\|>)\s*"([^"]+)"\s*"([^"]+)"\s*:\s*"([^"]+)"/);
      if (relMatch) {
        const [, from, arrow, , to, label] = relMatch;
        const fromId = cleanId(from);
        const toId = cleanId(to);
        const type = arrow === '*--' ? 'composition' : 'regular';
        edges.push({ from: fromId, to: toId, type, label });
      } else {
        relMatch = trimmed.match(/"([^"]+)"\s*(\*--|-->|->|\|>|-\|>|-right-\|>)\s*"([^"]+)"\s*"([^"]+)"/);
        if (relMatch) {
          const [, from, arrow, , to] = relMatch;
          const fromId = cleanId(from);
          const toId = cleanId(to);
          const type = arrow === '*--' ? 'composition' : 'regular';
          edges.push({ from: fromId, to: toId, type });
        } else {
          relMatch = trimmed.match(/"([^"]+)"\s*(-right-\|>|-\|>|\|>)\s*"([^"]+)"/);
          if (relMatch) {
            const [, from, arrow, to] = relMatch;
            const fromId = cleanId(from);
            const toId = cleanId(to);
            edges.push({ from: fromId, to: toId, type: 'inheritance' });
          }
        }
      }
    });
    
    // Add nodes
    for (const [id, node] of nodes) {
      const color = this.getColorForStereotype(node.stereotype);
      const fontSize = node.isMain ? '36' : '12';
      
      dot += `    ${id} [label=<<table border="0" cellborder="1" cellspacing="0">\n`;
      if (node.isMain) {
        dot += `        <tr><td port="f0" bgcolor="${color}"><font point-size="${fontSize}">${node.label}</font></td></tr>\n`;
      } else {
        dot += `        <tr><td bgcolor="${color}">${node.label}</td></tr>\n`;
      }
      dot += `        <tr><td bgcolor="${color}"><i>«${node.stereotype}»</i></td></tr>\n`;
      dot += `    </table>>]\n\n`;
    }
    
    // Add edges
    for (const edge of edges) {
      if (edge.type === 'composition') {
        dot += `    ${edge.from} -> ${edge.to} [dir=both, arrowhead=none, arrowtail=diamond];\n`;
      } else {
        dot += `    ${edge.from} -> ${edge.to}`;
        if (edge.label) {
          dot += ` [label="${edge.label}"]`;
        }
        dot += `;\n`;
      }
    }
    
    dot += '}\n';
    return dot;
  }

  static getColorForStereotype(stereotype) {
    const colors = {
      'master-data': '#ffa080',
      'work-product-component': '#f9d949',
      'abstract': '#97ccf6',
      'dataset': '#ddddff',
      'reference-data': '#79dfdf',
      'any-group-type': '#ddffee',
      'Abstraction': '#97ccf6',
      'nested array': '#f1f1f1',
      'nested': '#f1f1f1'
    };
    return colors[stereotype] || '#ffffff';
  }
}
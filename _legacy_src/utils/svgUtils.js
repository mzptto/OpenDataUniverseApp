export class SVGUtils {
  static ensureStyles(svgElement) {
    if (!svgElement.querySelector('style[data-diagram-viewer]')) {
      const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
      style.setAttribute('data-diagram-viewer', '');
      style.textContent = `
        .dv-faded { opacity: 0.14 !important; }
        g.node.dv-highlight polygon,
        g.node.dv-highlight path,
        g.node.dv-highlight rect {
          stroke: #1976d2;
          stroke-width: 2;
        }
        g.edge.dv-highlight path {
          stroke: #1976d2;
          stroke-width: 2;
        }
        g.edge.dv-highlight polygon {
          fill: #1976d2;
          stroke: #1976d2;
        }
      `;
      svgElement.appendChild(style);
    }
  }

  static buildAdjacency(svgElement) {
    const adj = new Map();
    svgElement.querySelectorAll('g.node').forEach(n => {
      const id = n.querySelector('title')?.textContent?.trim();
      if (id) adj.set(id, new Set());
    });
    svgElement.querySelectorAll('g.edge').forEach(e => {
      const t = e.querySelector('title')?.textContent?.trim();
      if (!t) return;
      const parts = t.split(/--|->/).map(s => s.trim());
      if (parts.length === 2) {
        const [a, b] = parts;
        if (adj.has(a) && adj.has(b)) {
          adj.get(a).add(b);
          adj.get(b).add(a);
        }
      }
    });
    return adj;
  }

  static clearFocus(svgElement) {
    svgElement.querySelectorAll('g.node, g.edge').forEach(el => {
      el.classList.remove('dv-highlight');
      el.classList.remove('dv-faded');
    });
  }

  static analyzeDataPresence(data) {
    const presentFields = new Set();
    const traverse = (obj, path = '', depth = 0, maxDepth = 10) => {
      if (!obj || typeof obj !== 'object' || depth > maxDepth) return;
      
      for (const [key, value] of Object.entries(obj)) {
        const fieldPath = path ? `${path}.${key}` : key;
        if (value !== null && value !== undefined && value !== '') {
          presentFields.add(key);
          presentFields.add(fieldPath);
          if (Array.isArray(value) && value.length > 0) {
            const itemKeys = new Set();
            value.forEach((item, index) => {
              if (typeof item === 'object' && item !== null) {
                traverse(item, `${fieldPath}[${index}]`, depth + 1, maxDepth);
                Object.keys(item).forEach(subKey => itemKeys.add(subKey));
              }
            });
            itemKeys.forEach(subKey => presentFields.add(subKey));
          } else if (typeof value === 'object') {
            traverse(value, fieldPath, depth + 1, maxDepth);
          }
        }
      }
    };
    if (data) traverse(data);
    return presentFields;
  }
}
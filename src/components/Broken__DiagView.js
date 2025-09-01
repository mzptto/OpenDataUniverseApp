import React, { useEffect, useRef, useState } from 'react';

const DiagramViewer = ({ pumlContent, onNodeClick, entityName, onTransformChange, initialTransform }) => {
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const transformRef = useRef({ scale: 1, translateX: 0, translateY: 0 });
  const isDraggingRef = useRef(false);
  const [loading, setLoading] = useState(false);

  // Apply transform directly to SVG
  const applyTransform = () => {
    if (svgRef.current) {
      const g = svgRef.current.querySelector('g');
      if (g) {
        const { scale, translateX, translateY } = transformRef.current;
        g.setAttribute('transform', `translate(${translateX}, ${translateY}) scale(${scale})`);
        
        // Save transform state
        if (entityName && onTransformChange) {
          onTransformChange(entityName, { ...transformRef.current });
        }
      }
    }
  };

  useEffect(() => {
    if (!pumlContent) return;

    let isCancelled = false;
    
    const renderDiagram = async () => {
      setLoading(true);
      
      try {
        const { Graphviz } = await import('@hpcc-js/wasm');
        if (isCancelled) return;
        
        const graphviz = await Graphviz.load();
        if (isCancelled) return;
        
        const dotContent = convertPumlToDot(pumlContent);
        const svg = graphviz.dot(dotContent);
        
        // Use setTimeout to ensure container ref is available
        setTimeout(() => {
          if (isCancelled || !containerRef.current) {
            return;
          }
          
          containerRef.current.innerHTML = svg;
          
          const svgElement = containerRef.current.querySelector('svg');
          if (svgElement && !isCancelled) {
            svgRef.current = svgElement;
            svgElement.style.width = '100%';
            svgElement.style.height = '100%';
            svgElement.style.cursor = 'grab';
            svgElement.style.userSelect = 'none';
            svgElement.style.webkitUserSelect = 'none';
            svgElement.style.mozUserSelect = 'none';
            svgElement.style.msUserSelect = 'none';
            
            // Use saved transform or smart centering
            if (initialTransform) {
              transformRef.current = initialTransform;
            } else {
              // Smart centering for new diagrams
              const bbox = svgElement.getBBox();
              const containerRect = containerRef.current.getBoundingClientRect();
              const scale = Math.min(
                containerRect.width / (bbox.width + 100),
                containerRect.height / (bbox.height + 100),
                1
              );
              transformRef.current = {
                scale: Math.max(0.3, scale),
                translateX: (containerRect.width - bbox.width * scale) / 2 - bbox.x * scale,
                translateY: (containerRect.height - bbox.height * scale) / 2 - bbox.y * scale
              };
            }
            applyTransform();
          }
        }, 0);

      } catch (error) {
        console.error('Diagram rendering error:', error);
      }
      setLoading(false);
    };

    let cleanup = null;
    renderDiagram().then(cleanupFn => {
      if (!isCancelled) {
        cleanup = cleanupFn;
      }
    });
    
    return () => {
      isCancelled = true;
      if (cleanup) cleanup();
    };
  }, [pumlContent, onNodeClick]);

  const convertPumlToDot = (puml) => {
    let dot = 'digraph Wellbore {\n';
    dot += '    rankdir=TB;\n';
    dot += '    node [shape=none, margin=0, fontname="Helvetica"]\n';
    dot += '    edge [fontname="Helvetica"]\n\n';
    
    const lines = puml.split('\n');
    const nodes = new Map();
    const edges = [];
    
    // Consistent ID cleaning function
    const cleanId = (name) => {
      return name.replace(/<[^>]*>/g, '').replace(/��/g, '.').replace(/[\[\]]/g, '').trim().replace(/[^\w]/g, '_');
    };
    
    lines.forEach(line => {
      const trimmed = line.trim();
      
      // Parse main class with size
      let match = trimmed.match(/class\s+"<size:\d+>([^<]+)<\/size>"\s+as\s+([^\s]+)\s+<<([^>]+)>>/);
      if (match) {
        const [, displayName, id, stereotype] = match;
        const cleanDisplayName = displayName.replace(/<[^>]*>/g, '').replace(/��/g, '.').trim();
        const cleanId = id.replace(/��/g, '_').replace(/[^\w]/g, '_');
        nodes.set(cleanId, { label: cleanDisplayName, stereotype, isMain: true });
      } else {
        // Parse regular class
        match = trimmed.match(/class\s+"([^"]+)"\s+as\s+([^\s]+)\s+<<([^>]+)>>/);
        if (match) {
          const [, displayName, id, stereotype] = match;
          const cleanDisplayName = displayName.replace(/<[^>]*>/g, '').replace(/��/g, '.').trim();
          const cleanId = id.replace(/��/g, '_').replace(/[^\w]/g, '_');
          nodes.set(cleanId, { label: cleanDisplayName, stereotype });
        } else {
          match = trimmed.match(/class\s+"([^"]+)"\s+<<([^>]+)>>/);
          if (match) {
            const [, displayName, stereotype] = match;
            const cleanDisplayName = displayName.replace(/<[^>]*>/g, '').replace(/��/g, '.').trim();
            const cleanId = displayName.replace(/[\s<>��\[\]]/g, '').replace(/[^\w]/g, '_');
            nodes.set(cleanId, { label: cleanDisplayName, stereotype });
          }
        }
      }
      
      // Parse abstract
      const abstractMatch = trimmed.match(/abstract\s+"([^"]+)"\s+<<([^>]+)>>/);
      if (abstractMatch) {
        const [, displayName, stereotype] = abstractMatch;
        const cleanDisplayName = displayName.replace(/��/g, '.').trim();
        const id = displayName.replace(/[\s\[\]��]/g, '').replace(/[^\w]/g, '_');
        nodes.set(id, { label: cleanDisplayName, stereotype });
      }
      
      // Parse relationships with labels like: "GeoContexts[]" --> "1" "Basin" : "BasinID"
      let relMatch = trimmed.match(/"([^"]+)"\s*(\*--|-->|->|\|>|-\|>|-right-\|>)\s*"([^"]+)"\s*"([^"]+)"\s*:\s*"([^"]+)"/);
      if (relMatch) {
        const [, from, arrow, , to, label] = relMatch;
        const fromId = cleanId(from);
        const toId = cleanId(to);
        const type = arrow === '*--' ? 'composition' : 'regular';
        edges.push({ from: fromId, to: toId, type, label });
      } else {
        // Parse relationships without multiplicity like: "Wellbore" --> "1" "Organisation"
        relMatch = trimmed.match(/"([^"]+)"\s*(\*--|-->|->|\|>|-\|>|-right-\|>)\s*"([^"]+)"\s*"([^"]+)"/);
        if (relMatch) {
          const [, from, arrow, , to] = relMatch;
          const fromId = cleanId(from);
          const toId = cleanId(to);
          const type = arrow === '*--' ? 'composition' : 'regular';
          edges.push({ from: fromId, to: toId, type });
        } else {
          // Parse inheritance relationships like: "FileCollection��SEGY" -right-|> "AbstractCommonResources"
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
      const color = getColorForStereotype(node.stereotype);
      const fontSize = node.isMain ? '36' : '12';
      
      dot += `    ${id} [label=<<table border="0" cellborder="1" cellspacing="0">\n`;
      if (node.isMain) {
        dot += `        <tr><td port="f0" bgcolor="${color}"><font point-size="${fontSize}">${node.label}</font></td></tr>\n`;
      } else {
        dot += `        <tr><td bgcolor="${color}">${node.label}</td></tr>\n`;
      }
      dot += `        <tr><td bgcolor="${color}"><i>��${node.stereotype}��</i></td></tr>\n`;
      dot += `    </table>>\n\n`;
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
  };

  const getColorForStereotype = (stereotype) => {
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
  };

  const handleCenter = () => {
    transformRef.current = { scale: 1, translateX: 0, translateY: 0 };
    applyTransform();
  };

  const handleZoomIn = () => {
    const transform = transformRef.current;
    transform.scale = Math.min(2, transform.scale * 1.2);
    applyTransform();
  };

  const handleZoomOut = () => {
    const transform = transformRef.current;
    transform.scale = Math.max(0.3, transform.scale * 0.8);
    applyTransform();
  };

  if (loading) {
    return <div className="loading">Parsing diagram...</div>;
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      <div style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        zIndex: 1000
      }}>
        <button
          onClick={handleCenter}
          style={{
            width: '44px',
            height: '44px',
            border: 'none',
            borderRadius: '50%',
            background: '#3498db',
            color: 'white',
            fontSize: '20px',
            cursor: 'pointer',
            boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s'
          }}
          title="Center diagram"
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
        >
          �O'
        </button>
        <button
          onClick={handleZoomIn}
          style={{
            width: '44px',
            height: '44px',
            border: 'none',
            borderRadius: '50%',
            background: '#2ecc71',
            color: 'white',
            fontSize: '24px',
            cursor: 'pointer',
            boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s'
          }}
          title="Zoom in"
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
        >
          +
        </button>
        <button
          onClick={handleZoomOut}
          style={{
            width: '44px',
            height: '44px',
            border: 'none',
            borderRadius: '50%',
            background: '#e74c3c',
            color: 'white',
            fontSize: '24px',
            cursor: 'pointer',
            boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s'
          }}
          title="Zoom out"
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
        >
          �^'
        </button>
      </div>
    </div>
  );
};

export default DiagramViewer;

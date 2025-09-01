import React, { useEffect, useRef, useState } from 'react';
import { Maximize2 } from 'lucide-react';

// 1 - Node selections at the top node, should display the Entity details [ALC, Legal, Version, Partition etc...]
// 2 - Hover over node should show the entityID value recoreded there.
// 3 - Grey out data nodes that are not filled in within the loaded json record.
// 4 - Upgrade the interaction with properties.
// 5 - Apply 5 buttons on the top right showing the aspects of data quality [DQ, TA, Lineage, ]

// Helpers to format overlay label
const spacify = (s) => (s ? s.replace(/(?<!^)(?=[A-Z])/g, ' ').trim() : '');
const kebabCase = (s) => (spacify(s).toLowerCase().split(/\s+/).join('-'));
// Heuristic: try to pull the semantic version from PUML text when not provided
const extractVersionFromPuml = (puml, entityName) => {
  try {
    if (!puml) return '';
    const semverRe = /([0-9]+\.[0-9]+\.[0-9]+)/g;
    // Look for kind-like tokens that include the entity name and a semver at the end
    const lines = puml.split('\n');
    for (const line of lines) {
      if (entityName && line.includes(entityName)) {
        const m = [...line.matchAll(semverRe)];
        if (m && m.length > 0) {
          return m[m.length - 1][1];
        }
      }
    }
    // Fallback: first semver anywhere
    const any = semverRe.exec(puml);
    return any ? any[1] : '';
  } catch (_) {
    return '';
  }
};

const deriveEntityLabel = ({ entityName, entityVersion, entityNameVersion, kind, pumlContent }) => {
  // 1) Explicit name + version
  if (entityName && entityVersion) {
    const title = spacify(entityName);
    const sub = `${kebabCase(entityName)} - v ${entityVersion}`;
    return { title, sub };
  }
  // 2) Combined form: Name.1.0.1
  const env = entityNameVersion || entityName;
  if (typeof env === 'string') {
    const parts = env.split('.');
    if (parts.length >= 4) {
      const version = parts.slice(-3).join('.');
      const name = parts.slice(0, -3).join('.');
      return { title: spacify(name), sub: `${kebabCase(name)} - v ${version}` };
    }
  }
  // 3) Kind: osdu:wks:group--Entity:1.0.1
  if (typeof kind === 'string' && kind.split(':').length === 4) {
    const [, , groupEntity, version] = kind.split(':');
    const entity = (groupEntity || '').split('--').pop() || groupEntity;
    return { title: spacify(entity), sub: `${kebabCase(entity)} - v ${version}` };
  }
  // 4) Try to extract from PUML
  const maybeVersion = extractVersionFromPuml(pumlContent || '', entityName || '');
  if (entityName && maybeVersion) {
    const title = spacify(entityName);
    return { title, sub: `${kebabCase(entityName)} - v ${maybeVersion}` };
  }
  // Fallback
  const title = spacify(entityName || '');
  const sub = title ? kebabCase(title) : '';
  return { title, sub };
};

const DiagramViewer = ({ pumlContent, onNodeClick, entityName, entityVersion, entityNameVersion, kind, onTransformChange, initialTransform }) => {
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const transformRef = useRef({ scale: 1, translateX: 0, translateY: 0 });
  const isDraggingRef = useRef(false);
  const [loading, setLoading] = useState(false);

  // Apply transform directly to SVG
  const applyTransform = () => {
    if (svgRef.current) {
      const g = svgRef.current.querySelector('#viewport') || svgRef.current.querySelector('g');
      if (g) {
        const { scale, translateX, translateY } = transformRef.current;
        g.setAttribute('transform', `translate(${translateX}, ${translateY}) scale(${scale})`);
      }
    }
  };

  

  useEffect(() => {
    if (!pumlContent) return;

    let isCancelled = false;
    
    const renderDiagram = async () => {
      setLoading(true);
      
      try {
        console.log('[DiagramViewer] Start render. PUML length:', pumlContent?.length || 0);
        const { Graphviz } = await import('@hpcc-js/wasm');
        if (isCancelled) return;
        
        const graphviz = await Graphviz.load();
        if (isCancelled) return;
        
        const dotContent = convertPumlToDot(pumlContent);
        console.log('[DiagramViewer] DOT length:', dotContent.length);
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
            const crect = containerRef.current.getBoundingClientRect();
            console.log('[DiagramViewer] Container size on insert:', crect.width, crect.height);
            
            // Ensure a dedicated viewport group for transforms
            const rootG = svgElement.querySelector('g');
            if (rootG && !svgElement.querySelector('#viewport')) {
              const viewport = document.createElementNS('http://www.w3.org/2000/svg', 'g');
              viewport.setAttribute('id', 'viewport');
              rootG.parentNode.insertBefore(viewport, rootG);
              viewport.appendChild(rootG);
            }

            // Track listeners for cleanup and implement pan/zoom
            let startX = 0, startY = 0;
            const onDown = (e) => {
              if (e.button !== 0) return;
              if (e.target.closest && e.target.closest('g.node')) return;
              isDraggingRef.current = true;
              svgElement.style.cursor = 'grabbing';
              startX = e.clientX;
              startY = e.clientY;
            };
            const onMove = (e) => {
              if (!isDraggingRef.current) return;
              const dx = e.clientX - startX;
              const dy = e.clientY - startY;
              startX = e.clientX;
              startY = e.clientY;
              const t = transformRef.current;
              t.translateX += dx;
              t.translateY += dy;
              applyTransform();
            };
            const endDrag = () => {
              if (!isDraggingRef.current) return;
              isDraggingRef.current = false;
              svgElement.style.cursor = 'grab';
              if (entityName && onTransformChange) onTransformChange(entityName, { ...transformRef.current });
            };
            const onWheel = (e) => {
              e.preventDefault();
              const rect = svgElement.getBoundingClientRect();
              const mx = e.clientX - rect.left;
              const my = e.clientY - rect.top;
              const { scale, translateX, translateY } = transformRef.current;
              const factor = e.deltaY < 0 ? 1.1 : 0.9;
              const newScale = Math.min(2, Math.max(0.3, scale * factor));
              const k = newScale / scale;
              transformRef.current = {
                scale: newScale,
                translateX: mx - k * (mx - translateX),
                translateY: my - k * (my - translateY)
              };
              applyTransform();
              if (entityName && onTransformChange) onTransformChange(entityName, { ...transformRef.current });
            };
            svgElement.addEventListener('mousedown', onDown);
            window.addEventListener('mousemove', onMove);
            window.addEventListener('mouseup', endDrag);
            svgElement.addEventListener('wheel', onWheel, { passive: false });

            // Inject styles for highlight/fade visualization (once)
            const ensureStyles = () => {
              if (!svgElement.querySelector('style[data-diagram-viewer]')) {
                const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
                style.setAttribute('data-diagram-viewer', '');
                style.textContent = `
                  .dv-faded { opacity: 0.14; }
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
            };

            // Build adjacency from Graphviz SVG (using edge <title> like "A->B")
            const buildAdjacency = () => {
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
            };

            const adjacency = buildAdjacency();

            const clearFocus = () => {
              svgElement.querySelectorAll('g.node, g.edge').forEach(el => {
                el.classList.remove('dv-highlight');
                el.classList.remove('dv-faded');
              });
            };

            const focusNode = (id) => {
              ensureStyles();
              clearFocus();
              const neighborhood = new Set([id]);
              (adjacency.get(id) || new Set()).forEach(n => neighborhood.add(n));

              // Nodes
              svgElement.querySelectorAll('g.node').forEach(node => {
                const nid = node.querySelector('title')?.textContent?.trim();
                if (!nid) return;
                if (neighborhood.has(nid)) node.classList.add('dv-highlight');
                else node.classList.add('dv-faded');
              });
              // Edges
              svgElement.querySelectorAll('g.edge').forEach(edge => {
                const t = edge.querySelector('title')?.textContent?.trim();
                if (!t) { edge.classList.add('dv-faded'); return; }
                const parts = t.split(/--|->/).map(s => s.trim());
                if (parts.length === 2) {
                  const [a, b] = parts;
                  const inFocus = neighborhood.has(a) && neighborhood.has(b);
                  edge.classList.add(inFocus ? 'dv-highlight' : 'dv-faded');
                } else {
                  edge.classList.add('dv-faded');
                }
              });
            };

            // Make nodes clickable; use Graphviz <title> text as id
            svgElement.querySelectorAll('g.node').forEach(node => {
              node.style.cursor = 'pointer';
              node.addEventListener('click', (event) => {
                if (event.stopPropagation) event.stopPropagation();
                const titleEl = node.querySelector('title');
                const id = titleEl && titleEl.textContent ? titleEl.textContent.trim() : null;
                if (id) {
                  focusNode(id);
                  if (onNodeClick) onNodeClick(id);
                }
              });
            });

            // Click on background clears focus
            const onSvgClick = (e) => {
              if (e.target.closest && e.target.closest('g.node')) return; // ignore node clicks
              clearFocus();
              if (onNodeClick) onNodeClick(null);
            };
            svgElement.addEventListener('click', onSvgClick);

            // Use saved transform or smart centering after layout
            const smartCenter = () => {
              try {
                const viewportG = (svgElement.querySelector('#viewport') || svgElement.querySelector('g'));
                if (!viewportG) return;
                const bbox = viewportG.getBBox();
                const rect = containerRef.current?.getBoundingClientRect?.();
                const cw = rect?.width || 0;
                const ch = rect?.height || 0;
                if (cw < 2 || ch < 2) {
                  // Defer until container has a real size
                  console.log('[DiagramViewer] Deferring center; container size:', cw, ch);
                  requestAnimationFrame(() => smartCenter());
                  return;
                }
                const scale = Math.min(cw / (bbox.width + 100), ch / (bbox.height + 100), 1);
                transformRef.current = {
                  scale: Math.max(0.3, scale),
                  translateX: (cw - bbox.width * Math.max(0.3, scale)) / 2 - bbox.x * Math.max(0.3, scale),
                  translateY: (ch - bbox.height * Math.max(0.3, scale)) / 2 - bbox.y * Math.max(0.3, scale)
                };
                applyTransform();
                console.log('[DiagramViewer] Applied transform:', transformRef.current);
                if (entityName && onTransformChange) onTransformChange(entityName, { ...transformRef.current });
              } catch {}
            };

            if (initialTransform) {
              transformRef.current = initialTransform;
              applyTransform();
            } else {
              // Defer centering to next frame(s) to ensure layout size is available
              requestAnimationFrame(() => smartCenter());
            }


            // Provide cleanup for listeners on rerender/unmount
            cleanup = () => {
              try {
                svgElement.removeEventListener('mousedown', onDown);
                window.removeEventListener('mousemove', onMove);
                window.removeEventListener('mouseup', endDrag);
                svgElement.removeEventListener('wheel', onWheel);
                svgElement.removeEventListener('click', onSvgClick);
              } catch {}
            };
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
  }, [pumlContent]);

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
          // Parse inheritance relationships like: "FileCollection·SEGY" -right-|> "AbstractCommonResources"
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
    if (entityName && onTransformChange) onTransformChange(entityName, { ...transformRef.current });
  };

  const handleZoomIn = () => {
    const transform = transformRef.current;
    transform.scale = Math.min(2, transform.scale * 1.2);
    applyTransform();
    if (entityName && onTransformChange) onTransformChange(entityName, { ...transformRef.current });
  };

  const handleZoomOut = () => {
    const transform = transformRef.current;
    transform.scale = Math.max(0.3, transform.scale * 0.8);
    applyTransform();
    if (entityName && onTransformChange) onTransformChange(entityName, { ...transformRef.current });
  };

  const { title, sub } = deriveEntityLabel({ entityName, entityVersion, entityNameVersion, kind, pumlContent });

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      {(title || sub) && (
        <div style={{
          position: 'absolute',
          top: 8,
          left: 8,
          zIndex: 1000,
          pointerEvents: 'none',
          background: 'rgba(255,255,255,0.85)',
          borderRadius: 6,
          padding: '6px 10px',
          boxShadow: '0 1px 2px rgba(0,0,0,0.08)'
        }}>
          {title && (<div style={{ fontWeight: 600, lineHeight: 1.1 }}>{title}</div>)}
          {sub && (<div style={{ color: '#6B7280', fontSize: 12, marginTop: 2, lineHeight: 1.1 }}>{sub}</div>)}
        </div>
      )}
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      {loading && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(255,255,255,0.7)',
          zIndex: 2
        }}>
          <div className="loading">Parsing diagram...</div>
        </div>
      )}
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
          <Maximize2 size={20} strokeWidth={2.5} />
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
          −
        </button>
      </div>
    </div>
  );
};

export default DiagramViewer;

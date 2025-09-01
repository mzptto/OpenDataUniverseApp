import React, { useEffect, useRef, useState } from 'react';
import { Maximize2 } from 'lucide-react';
import { PlantUMLParser } from '../utils/pumlParser';
import { SVGUtils } from '../utils/svgUtils';
import { EntityLabelUtils } from '../utils/entityLabelUtils';

// 1 - Node selections at the top node, should display the Entity details [ALC, Legal, Version, Partition etc...]
// 2 - Hover over node should show the entityID value recoreded there.
// 3 - Grey out data nodes that are not filled in within the loaded json record.
// 4 - Upgrade the interaction with properties.
// 5 - Apply 5 buttons on the top right showing the aspects of data quality [DQ, TA, Lineage, ]

const DiagramViewer = ({ pumlContent, onNodeClick, entityName, entityVersion, entityNameVersion, kind, onTransformChange, initialTransform, exampleData, fileName }) => {
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
        
        const dotContent = PlantUMLParser.convertToDot(pumlContent);
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

            const adjacency = SVGUtils.buildAdjacency(svgElement);

            const applyDataBasedGreying = () => {
              if (!exampleData) return;
              
              const presentFields = SVGUtils.analyzeDataPresence(exampleData);
              const nodes = svgElement.querySelectorAll('g.node');
              const edges = svgElement.querySelectorAll('g.edge');
              
              // Track which nodes are active
              const activeNodes = new Set();
              
              nodes.forEach((node) => {
                const titleEl = node.querySelector('title');
                const nodeId = titleEl?.textContent?.trim();
                if (!nodeId) return;
                
                // Main node and reference data nodes are always active
                const isMainNode = Array.from(nodes).indexOf(node) === 0;
                const isReferenceData = nodeId === 'ReferenceDataRelationships';
                if (isMainNode || isReferenceData) {
                  activeNodes.add(nodeId);
                  return;
                }
                
                // Check for connection in data
                const hasConnection = Array.from(presentFields).some(field => 
                  field.includes(nodeId) && field.endsWith('ID')
                );
                
                if (hasConnection) {
                  activeNodes.add(nodeId);
                } else {
                  node.classList.add('dv-faded');
                }
              });
              
              // Fade edges that don't connect two active nodes
              edges.forEach((edge) => {
                const titleEl = edge.querySelector('title');
                const edgeTitle = titleEl?.textContent?.trim();
                if (!edgeTitle) return;
                
                const parts = edgeTitle.split(/--|->/).map(s => s.trim());
                if (parts.length === 2) {
                  const [from, to] = parts;
                  if (!activeNodes.has(from) || !activeNodes.has(to)) {
                    edge.classList.add('dv-faded');
                  }
                }
              });
            };

            const focusNode = (id) => {
              SVGUtils.ensureStyles(svgElement);
              SVGUtils.clearFocus(svgElement);
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
              SVGUtils.clearFocus(svgElement);
              applyDataBasedGreying(); // Reapply data-based greying after clearing focus
              if (onNodeClick) onNodeClick(null);
            };
            svgElement.addEventListener('click', onSvgClick);
            
            // Apply initial data-based greying (after ensuring styles exist)
            SVGUtils.ensureStyles(svgElement);
            applyDataBasedGreying();

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
              } catch (error) {
                console.warn('[DiagramViewer] Smart center failed:', error);
              }
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
              } catch (error) {
                console.warn('[DiagramViewer] Cleanup failed:', error);
              }
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
  }, [pumlContent, exampleData]);



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

  const { title, sub } = EntityLabelUtils.deriveEntityLabel({ entityName, entityVersion, entityNameVersion, kind, pumlContent });

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
          {fileName ? (
            <div>
              <div style={{ fontWeight: 600, lineHeight: 1.1 }}>Record: {fileName}</div>
              {kind && (
                <div style={{ color: '#6B7280', fontSize: 12, marginTop: 2, lineHeight: 1.1 }}>
                  Kind: {kind.split(':').slice(2).join(':')}
                </div>
              )}
            </div>
          ) : (
            <div>
              {title && (<div style={{ fontWeight: 600, lineHeight: 1.1 }}>{title}</div>)}
              {sub && (<div style={{ color: '#6B7280', fontSize: 12, marginTop: 2, lineHeight: 1.1 }}>{sub}</div>)}
            </div>
          )}
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

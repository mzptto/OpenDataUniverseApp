import React, { useEffect, useRef, useState } from 'react';
import { Maximize2 } from 'lucide-react';

const OSDUHierarchyViewer = () => {
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const transformRef = useRef({ scale: 1, translateX: 0, translateY: 0 });
  const isDraggingRef = useRef(false);
  const [loading, setLoading] = useState(false);

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
    const dotContent = `digraph OSDU_Master_Data_Hierarchy {
    rankdir=TB;
    node [shape=box, style=filled, fontname="Helvetica-Bold", fontsize=10];
    edge [fontname="Helvetica", fontsize=8];
    
    subgraph cluster_legend {
        label="Legend";
        style=filled;
        color=lightgrey;
        fontsize=12;
        
        legend_master [label="Master Data", fillcolor="#ffa080", width=1.2, height=0.4];
        legend_wpc [label="Work Product", fillcolor="#f9d949", width=1.2, height=0.4];
        legend_dataset [label="Dataset", fillcolor="#ddddff", width=1.2, height=0.4];
        
        {rank=same; legend_master; legend_wpc; legend_dataset;}
    }
    
    Organisation [label="Organisation\\n(Field Operator)\\n\\n• Owns/operates assets\\n• Provides technical assurance\\n• Manages licenses", fillcolor="#ffa080", width=2.5];
    Field [label="Field\\n(Oil/Gas Field)\\n\\n• Physical asset boundary\\n• Contains multiple wells\\n• Has seismic surveys", fillcolor="#ffa080", width=2.5];
    Well [label="Well\\n(Drilling Location)\\n\\n• Surface location\\n• Multiple wellbores\\n• Activities & licenses", fillcolor="#ffa080", width=2.5];
    Wellbore [label="Wellbore\\n(Drilled Hole)\\n\\n• 3D trajectory\\n• Downhole data\\n• Geological markers", fillcolor="#ffa080", width=2.5];
    
    subgraph cluster_field_data {
        label="Field-Level Data";
        style=filled;
        color="#fff2e6";
        
        SeismicTraceData [label="Seismic\\nTrace Data\\n\\n• Raw seismic\\n• Processed volumes\\n• Survey geometry", fillcolor="#f9d949"];
        SeismicHorizon [label="Seismic\\nHorizon\\n\\n• Interpreted surfaces\\n• Time/depth maps\\n• Structural features", fillcolor="#f9d949"];
        SeismicBinGrid [label="Seismic\\nBin Grid\\n\\n• Survey layout\\n• Acquisition geometry\\n• Processing grids", fillcolor="#f9d949"];
    }
    
    subgraph cluster_well_data {
        label="Well-Level Data";
        style=filled;
        color="#fff2e6";
        
        WellActivity [label="Well Activity\\n\\n• Drilling operations\\n• Completion work\\n• Workover activities", fillcolor="#ffa080"];
        WellLicense [label="Well License\\n\\n• Drilling permits\\n• Operating licenses\\n• Regulatory compliance", fillcolor="#ffa080"];
    }
    
    subgraph cluster_wellbore_data {
        label="Wellbore-Level Data";
        style=filled;
        color="#fff2e6";
        
        WellboreTrajectory [label="Wellbore\\nTrajectory\\n\\n• 3D path\\n• Survey points\\n• Directional data", fillcolor="#f9d949"];
        WellLog [label="Well Log\\n\\n• Downhole measurements\\n• Petrophysical data\\n• Formation evaluation", fillcolor="#f9d949"];
        WellboreMarkerSet [label="Wellbore\\nMarker Set\\n\\n• Geological markers\\n• Formation tops\\n• Stratigraphic picks", fillcolor="#f9d949"];
        WellboreIntervalSet [label="Wellbore\\nInterval Set\\n\\n• Defined intervals\\n• Completion zones\\n• Production intervals", fillcolor="#f9d949"];
    }
    
    subgraph cluster_files {
        label="Dataset Storage";
        style=filled;
        color="#f0f8ff";
        
        SeismicFiles [label="Seismic Files\\n\\n• SEG-Y format\\n• HDF5 volumes\\n• Binary grids", fillcolor="#ddddff"];
        WellDataFiles [label="Well Data Files\\n\\n• EML/WITSML\\n• LAS files\\n• Generic formats", fillcolor="#ddddff"];
        TrajectoryFiles [label="Trajectory Files\\n\\n• EML trajectory\\n• Survey data\\n• Directional files", fillcolor="#ddddff"];
    }
    
    Organisation -> Field [label="owns/operates", color=red, penwidth=4, fontcolor=red];
    Field -> Well [label="contains", color=red, penwidth=4, fontcolor=red];
    Well -> Wellbore [label="contains", color=red, penwidth=4, fontcolor=red];
    
    Field -> SeismicTraceData [label="has", color=blue, penwidth=2];
    Field -> SeismicHorizon [label="has", color=blue, penwidth=2];
    Field -> SeismicBinGrid [label="has", color=blue, penwidth=2];
    
    Well -> WellActivity [label="has", color=blue, penwidth=2];
    Well -> WellLicense [label="has", color=blue, penwidth=2];
    
    Wellbore -> WellboreTrajectory [label="has", color=blue, penwidth=2];
    Wellbore -> WellLog [label="has", color=blue, penwidth=2];
    Wellbore -> WellboreMarkerSet [label="has", color=blue, penwidth=2];
    Wellbore -> WellboreIntervalSet [label="has", color=blue, penwidth=2];
    
    SeismicTraceData -> SeismicFiles [label="stored in", color=green, style=dashed, penwidth=2];
    SeismicHorizon -> SeismicFiles [label="stored in", color=green, style=dashed, penwidth=2];
    SeismicBinGrid -> SeismicFiles [label="stored in", color=green, style=dashed, penwidth=2];
    
    WellLog -> WellDataFiles [label="stored in", color=green, style=dashed, penwidth=2];
    WellActivity -> WellDataFiles [label="stored in", color=green, style=dashed, penwidth=2];
    WellLicense -> WellDataFiles [label="stored in", color=green, style=dashed, penwidth=2];
    
    WellboreTrajectory -> TrajectoryFiles [label="stored in", color=green, style=dashed, penwidth=2];
    WellboreMarkerSet -> TrajectoryFiles [label="stored in", color=green, style=dashed, penwidth=2];
    WellboreIntervalSet -> TrajectoryFiles [label="stored in", color=green, style=dashed, penwidth=2];
    
    Organisation -> Well [label="operates", style=dotted, color=gray];
    Organisation -> Wellbore [label="operates", style=dotted, color=gray];
    
    Field -> Wellbore [label="geo context", style=dotted, color=purple];
}`;

    const renderDiagram = async () => {
      setLoading(true);
      try {
        const { Graphviz } = await import('@hpcc-js/wasm');
        const graphviz = await Graphviz.load();
        const svg = graphviz.dot(dotContent);
        
        containerRef.current.innerHTML = svg;
        const svgElement = containerRef.current.querySelector('svg');
        
        if (svgElement) {
          svgRef.current = svgElement;
          svgElement.style.width = '100%';
          svgElement.style.height = '100%';
          svgElement.style.cursor = 'grab';
          
          const rootG = svgElement.querySelector('g');
          if (rootG && !svgElement.querySelector('#viewport')) {
            const viewport = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            viewport.setAttribute('id', 'viewport');
            rootG.parentNode.insertBefore(viewport, rootG);
            viewport.appendChild(rootG);
          }

          let startX = 0, startY = 0;
          const onDown = (e) => {
            if (e.button !== 0) return;
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
            transformRef.current.translateX += dx;
            transformRef.current.translateY += dy;
            applyTransform();
          };
          const endDrag = () => {
            isDraggingRef.current = false;
            svgElement.style.cursor = 'grab';
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
          };
          
          svgElement.addEventListener('mousedown', onDown);
          window.addEventListener('mousemove', onMove);
          window.addEventListener('mouseup', endDrag);
          svgElement.addEventListener('wheel', onWheel, { passive: false });
          
          // Apply immediate centering like the blue button does
          transformRef.current = { scale: 1, translateX: 0, translateY: 0 };
          applyTransform();
        }
      } catch (error) {
        console.error('Diagram rendering error:', error);
      }
      setLoading(false);
    };

    renderDiagram();
  }, []);

  const handleCenter = () => {
    transformRef.current = { scale: 1, translateX: 0, translateY: 0 };
    applyTransform();
  };

  const handleZoomIn = () => {
    transformRef.current.scale = Math.min(2, transformRef.current.scale * 1.2);
    applyTransform();
  };

  const handleZoomOut = () => {
    transformRef.current.scale = Math.max(0.3, transformRef.current.scale * 0.8);
    applyTransform();
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
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
          <div>Rendering hierarchy...</div>
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
        <button onClick={handleCenter} style={{
          width: '44px', height: '44px', border: 'none', borderRadius: '50%',
          background: '#3498db', color: 'white', cursor: 'pointer',
          boxShadow: '0 4px 8px rgba(0,0,0,0.3)', display: 'flex',
          alignItems: 'center', justifyContent: 'center'
        }} title="Center diagram">
          <Maximize2 size={20} />
        </button>
        <button onClick={handleZoomIn} style={{
          width: '44px', height: '44px', border: 'none', borderRadius: '50%',
          background: '#2ecc71', color: 'white', fontSize: '24px', cursor: 'pointer',
          boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
        }} title="Zoom in">+</button>
        <button onClick={handleZoomOut} style={{
          width: '44px', height: '44px', border: 'none', borderRadius: '50%',
          background: '#e74c3c', color: 'white', fontSize: '24px', cursor: 'pointer',
          boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
        }} title="Zoom out">−</button>
      </div>
    </div>
  );
};

export default OSDUHierarchyViewer;
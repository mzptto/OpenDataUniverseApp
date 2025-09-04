// OSDU Data Model Hierarchical Analysis
// Based on analysis of E-R diagrams and entity relationships

export const osduHierarchicalRelationships = {
  // Master Data Hierarchy (Top-Down Ownership/Containment)
  masterDataHierarchy: {
    Organisation: {
      description: "Field Operator Organization - owns and operates assets",
      relationships: {
        owns: ["Field"],
        operates: ["Well", "Wellbore"]
      },
      color: "#ffa080"
    },
    Field: {
      description: "Oil/Gas Field - physical asset containing wells",
      relationships: {
        contains: ["Well"],
        hasData: ["SeismicTraceData", "SeismicHorizon", "SeismicBinGrid"]
      },
      color: "#ffb366"
    },
    Well: {
      description: "Well - drilling location with multiple wellbores",
      relationships: {
        contains: ["Wellbore"],
        hasData: ["WellActivity", "WellLicense"],
        operatedBy: ["Organisation"]
      },
      color: "#ffb366"
    },
    Wellbore: {
      description: "Wellbore - actual drilled hole with trajectory and logs",
      relationships: {
        belongsTo: ["Well"],
        hasData: ["WellboreTrajectory", "WellLog", "WellboreMarkerSet", "WellboreIntervalSet"],
        operatedBy: ["Organisation"]
      },
      color: "#ffb366"
    }
  },

  // Work Product Components (Data attached to assets)
  workProductComponents: {
    // Field-level data
    SeismicTraceData: {
      description: "Seismic survey data for field exploration",
      attachedTo: "Field",
      dataFiles: ["File.Generic", "File.HDF5"],
      color: "#f9d949"
    },
    SeismicHorizon: {
      description: "Interpreted seismic horizons",
      attachedTo: "Field", 
      dataFiles: ["File.Generic"],
      color: "#f9d949"
    },
    SeismicBinGrid: {
      description: "Seismic survey grid definitions",
      attachedTo: "Field",
      dataFiles: ["File.Generic"],
      color: "#f9d949"
    },

    // Well-level data
    WellActivity: {
      description: "Well operations and activities",
      attachedTo: "Well",
      dataFiles: ["File.Generic"],
      color: "#ffb366"
    },
    WellLicense: {
      description: "Well drilling and operating licenses",
      attachedTo: "Well",
      dataFiles: ["File.Generic"],
      color: "#ffb366"
    },

    // Wellbore-level data
    WellboreTrajectory: {
      description: "3D path of the wellbore",
      attachedTo: "Wellbore",
      dataFiles: ["File.Generic", "File.EML"],
      color: "#f9d949"
    },
    WellLog: {
      description: "Downhole measurements and logs",
      attachedTo: "Wellbore",
      dataFiles: ["File.Generic", "File.EML"],
      color: "#f9d949"
    },
    WellboreMarkerSet: {
      description: "Geological markers along wellbore",
      attachedTo: "Wellbore",
      dataFiles: ["File.Generic"],
      color: "#f9d949"
    },
    WellboreIntervalSet: {
      description: "Defined intervals along wellbore",
      attachedTo: "Wellbore", 
      dataFiles: ["File.Generic"],
      color: "#f9d949"
    }
  },

  // Dataset/File Types
  datasetTypes: {
    "File.Generic": {
      description: "Generic file container",
      color: "#ddddff"
    },
    "File.EML": {
      description: "EnergyML format files",
      color: "#ddddff"
    },
    "File.HDF5": {
      description: "HDF5 hierarchical data files",
      color: "#ddddff"
    },
    "File.GeoJSON": {
      description: "Geographic JSON files",
      color: "#ddddff"
    }
  },

  // Key relationship patterns identified from PlantUML analysis
  relationshipPatterns: {
    ownership: {
      description: "Organisation owns Fields through GeoContexts",
      pattern: "Organisation -> Field (via GeoContexts.FieldID)"
    },
    containment: {
      description: "Physical asset containment hierarchy",
      pattern: "Field -> Well -> Wellbore"
    },
    operation: {
      description: "Operational responsibility",
      pattern: "Organisation operates Wells and Wellbores (CurrentOperatorID, InitialOperatorID)"
    },
    dataAttachment: {
      description: "Work product components attached to master data",
      pattern: "MasterData -> WorkProductComponent (via relationships in schemas)"
    },
    dataStorage: {
      description: "Work product components stored in dataset files",
      pattern: "WorkProductComponent -> Dataset/File"
    }
  }
};

// Generate DOT notation for visualization
export const generateOSDUHierarchyDOT = () => {
  return `digraph OSDU_Hierarchy {
    // Graph settings
    rankdir=TB;
    node [shape=box, style=filled, fontname="Arial", fontsize=10];
    edge [fontname="Arial", fontsize=8];
    
    // Legend
    subgraph cluster_legend {
        label="OSDU Data Model Hierarchy";
        style=filled;
        color=lightgrey;
        
        org_legend [label="Organisation\\n(Master Data)", fillcolor="#ffa080"];
        asset_legend [label="Physical Assets\\n(Master Data)", fillcolor="#ffb366"];
        data_legend [label="Work Product\\nComponents", fillcolor="#f9d949"];
        dataset_legend [label="Datasets/Files", fillcolor="#ddddff"];
    }
    
    // Master Data Entities
    Organisation [label="Organisation\\n(Field Operator)", fillcolor="#ffa080"];
    Field [label="Field\\n(Oil/Gas Field)", fillcolor="#ffb366"];
    Well [label="Well", fillcolor="#ffb366"];
    Wellbore [label="Wellbore", fillcolor="#ffb366"];
    
    // Field-level Work Product Components
    SeismicTraceData [label="Seismic\\nTrace Data", fillcolor="#f9d949"];
    SeismicHorizon [label="Seismic\\nHorizon", fillcolor="#f9d949"];
    SeismicBinGrid [label="Seismic\\nBin Grid", fillcolor="#f9d949"];
    
    // Well-level Work Product Components
    WellActivity [label="Well\\nActivity", fillcolor="#ffb366"];
    WellLicense [label="Well\\nLicense", fillcolor="#ffb366"];
    
    // Wellbore-level Work Product Components
    WellboreTrajectory [label="Wellbore\\nTrajectory", fillcolor="#f9d949"];
    WellLog [label="Well Log", fillcolor="#f9d949"];
    WellboreMarkerSet [label="Wellbore\\nMarker Set", fillcolor="#f9d949"];
    WellboreIntervalSet [label="Wellbore\\nInterval Set", fillcolor="#f9d949"];
    
    // Dataset/File Types
    SeismicFiles [label="Seismic\\nDataset Files\\n(HDF5, Generic)", fillcolor="#ddddff"];
    WellLogFiles [label="Well Log\\nDataset Files\\n(EML, Generic)", fillcolor="#ddddff"];
    TrajectoryFiles [label="Trajectory\\nDataset Files\\n(EML, Generic)", fillcolor="#ddddff"];
    
    // Primary hierarchy (ownership/containment)
    Organisation -> Field [label="owns/operates", color=red, penwidth=3];
    Field -> Well [label="contains", color=red, penwidth=3];
    Well -> Wellbore [label="contains", color=red, penwidth=3];
    
    // Data attachment relationships
    Field -> SeismicTraceData [label="has seismic data", color=blue, penwidth=2];
    Field -> SeismicHorizon [label="has interpretations", color=blue, penwidth=2];
    Field -> SeismicBinGrid [label="has survey grids", color=blue, penwidth=2];
    
    Well -> WellActivity [label="has activities", color=blue, penwidth=2];
    Well -> WellLicense [label="has licenses", color=blue, penwidth=2];
    
    Wellbore -> WellboreTrajectory [label="has trajectory", color=blue, penwidth=2];
    Wellbore -> WellLog [label="has logs", color=blue, penwidth=2];
    Wellbore -> WellboreMarkerSet [label="has markers", color=blue, penwidth=2];
    Wellbore -> WellboreIntervalSet [label="has intervals", color=blue, penwidth=2];
    
    // Data storage relationships
    SeismicTraceData -> SeismicFiles [label="stored in", color=green, style=dashed];
    SeismicHorizon -> SeismicFiles [label="stored in", color=green, style=dashed];
    SeismicBinGrid -> SeismicFiles [label="stored in", color=green, style=dashed];
    
    WellLog -> WellLogFiles [label="stored in", color=green, style=dashed];
    WellboreTrajectory -> TrajectoryFiles [label="stored in", color=green, style=dashed];
    
    // Operational relationships (dotted)
    Organisation -> Well [label="operates", style=dotted, color=gray];
    Organisation -> Wellbore [label="operates", style=dotted, color=gray];
}`;
};
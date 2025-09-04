import React from 'react';
import { 
  Database, HardDrive, Server, Cloud, Archive, FolderOpen, Files,
  Building2, Factory, Home, MapPin, Globe, Users, User,
  BarChart3, BarChart, LineChart, PieChart, TrendingUp, Activity, Zap,
  FileText, File, FileJson, FileSpreadsheet, FileImage, BookOpen, Scroll,
  Cog, Wrench, Cpu, CircuitBoard, Gauge, Thermometer, Droplets,
  Fuel, Flame, Mountain, Waves, Compass, Target,
  GitBranch, Workflow, ArrowRight, Repeat, Play, Pause, CheckCircle
} from 'lucide-react';

const IconPreview = () => {
  const iconCategories = [
    {
      title: "Data & Storage",
      icons: [
        { name: "Database", component: Database },
        { name: "HardDrive", component: HardDrive },
        { name: "Server", component: Server },
        { name: "Cloud", component: Cloud },
        { name: "Archive", component: Archive },
        { name: "FolderOpen", component: FolderOpen },
        { name: "Files", component: Files }
      ]
    },
    {
      title: "Business & Organization",
      icons: [
        { name: "Building2", component: Building2 },
        { name: "Factory", component: Factory },
        { name: "Home", component: Home },
        { name: "MapPin", component: MapPin },
        { name: "Globe", component: Globe },
        { name: "Users", component: Users },
        { name: "User", component: User }
      ]
    },
    {
      title: "Charts & Analytics",
      icons: [
        { name: "BarChart3", component: BarChart3 },
        { name: "BarChart", component: BarChart },
        { name: "LineChart", component: LineChart },
        { name: "PieChart", component: PieChart },
        { name: "TrendingUp", component: TrendingUp },
        { name: "Activity", component: Activity },
        { name: "Zap", component: Zap }
      ]
    },
    {
      title: "Documents & Files",
      icons: [
        { name: "FileText", component: FileText },
        { name: "File", component: File },
        { name: "FileJson", component: FileJson },
        { name: "FileSpreadsheet", component: FileSpreadsheet },
        { name: "FileImage", component: FileImage },
        { name: "BookOpen", component: BookOpen },
        { name: "Scroll", component: Scroll }
      ]
    },
    {
      title: "Technical & Engineering",
      icons: [
        { name: "Cog", component: Cog },
        { name: "Wrench", component: Wrench },
        { name: "Cpu", component: Cpu },
        { name: "CircuitBoard", component: CircuitBoard },
        { name: "Gauge", component: Gauge },
        { name: "Thermometer", component: Thermometer },
        { name: "Droplets", component: Droplets }
      ]
    },
    {
      title: "Energy & Industrial",
      icons: [
        { name: "Zap", component: Zap },
        { name: "Fuel", component: Fuel },
        { name: "Flame", component: Flame },
        { name: "Mountain", component: Mountain },
        { name: "Waves", component: Waves },
        { name: "Compass", component: Compass },
        { name: "Target", component: Target }
      ]
    },
    {
      title: "Workflow & Process",
      icons: [
        { name: "GitBranch", component: GitBranch },
        { name: "Workflow", component: Workflow },
        { name: "ArrowRight", component: ArrowRight },
        { name: "Repeat", component: Repeat },
        { name: "Play", component: Play },
        { name: "Pause", component: Pause },
        { name: "CheckCircle", component: CheckCircle }
      ]
    }
  ];

  return (
    <div style={{ padding: '2rem', background: 'white', height: '100%', overflow: 'auto' }}>
      <h1 style={{ marginBottom: '2rem', color: '#333' }}>Lucide React Icons Preview</h1>
      
      {iconCategories.map((category, categoryIndex) => (
        <div key={categoryIndex} style={{ marginBottom: '3rem' }}>
          <h2 style={{ 
            marginBottom: '1rem', 
            color: '#2c3e50', 
            borderBottom: '2px solid #3498db',
            paddingBottom: '0.5rem'
          }}>
            {category.title}
          </h2>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', 
            gap: '1rem' 
          }}>
            {category.icons.map((icon, iconIndex) => {
              const IconComponent = icon.component;
              return (
                <div 
                  key={iconIndex}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '1rem',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    background: '#f8f9fa',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#e9ecef';
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = '#f8f9fa';
                    e.target.style.transform = 'translateY(0)';
                  }}
                  onClick={() => {
                    navigator.clipboard.writeText(icon.name);
                    alert(`Copied "${icon.name}" to clipboard!`);
                  }}
                  title={`Click to copy: ${icon.name}`}
                >
                  <IconComponent size={32} color="#2c3e50" style={{ marginBottom: '0.5rem' }} />
                  <span style={{ 
                    fontSize: '12px', 
                    color: '#666', 
                    textAlign: 'center',
                    fontFamily: 'monospace'
                  }}>
                    {icon.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
      
      <div style={{ 
        marginTop: '3rem', 
        padding: '1rem', 
        background: '#e8f4fd', 
        borderRadius: '8px',
        border: '1px solid #3498db'
      }}>
        <h3 style={{ color: '#2c3e50', marginBottom: '0.5rem' }}>How to Use:</h3>
        <p style={{ color: '#666', margin: 0 }}>
          Click any icon to copy its name to clipboard. Then add it to your import statement and use in your categoryMap.
        </p>
      </div>
    </div>
  );
};

export default IconPreview;
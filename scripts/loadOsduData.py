import os
import json
import re
from pathlib import Path

"""
Python script to load OSDU data from your actual data definitions folder
Run this to generate a data file for the React app
"""

OSDU_BASE_PATH = r"c:\Users\mzptto\OneDrive - amazon.com\EDI\OSDU Data Model\datadefinitions"

def load_osdu_entities():
    entities = []
    
    try:
        # Get all entity types from master-data
        master_data_path = Path(OSDU_BASE_PATH) / "E-R" / "_diagrams" / "master-data"
        
        if not master_data_path.exists():
            print(f"Path not found: {master_data_path}")
            return
            
        puml_files = [f for f in master_data_path.glob("*.puml") if ".ref." not in f.name]
        
        for puml_file in puml_files:
            match = re.match(r'^(\w+)\.(\d+\.\d+\.\d+)\.puml$', puml_file.name)
            if not match:
                continue
                
            entity_name, version = match.groups()
            
            try:
                # Load PlantUML content
                with open(puml_file, 'r', encoding='utf-8') as f:
                    puml_content = f.read()
                
                # Load schema
                schema_path = Path(OSDU_BASE_PATH) / "Generated" / "master-data" / f"{entity_name}.{version}.json"
                with open(schema_path, 'r', encoding='utf-8') as f:
                    schema = json.load(f)
                
                # Load example
                example_path = Path(OSDU_BASE_PATH) / "Examples" / "master-data" / f"{entity_name}.{version}.json"
                with open(example_path, 'r', encoding='utf-8') as f:
                    example = json.load(f)
                
                entities.append({
                    "id": f"{entity_name.lower()}-{version}",
                    "name": entity_name,
                    "type": "master-data",
                    "version": version,
                    "pumlContent": puml_content,
                    "schema": schema,
                    "example": example
                })
                
                print(f"Loaded: {entity_name} v{version}")
                
            except Exception as error:
                print(f"Failed to load {entity_name} v{version}: {error}")
        
        # Save to data file
        output_path = Path(__file__).parent.parent / "src" / "data" / "osduEntities.js"
        output_content = f"""// Auto-generated OSDU entities data
// Generated on {json.dumps(str(Path(__file__).stat().st_mtime))}

export const osduEntities = {json.dumps(entities, indent=2)};
"""
        
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(output_content)
            
        print(f"\nGenerated {len(entities)} entities to src/data/osduEntities.js")
        
    except Exception as error:
        print(f"Error loading OSDU data: {error}")

if __name__ == "__main__":
    load_osdu_entities()
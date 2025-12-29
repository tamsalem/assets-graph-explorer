# Assets Graph Explorer

A modern React application for visualizing asset relationships from CSV data. Built with React, TypeScript, TailwindCSS, and Cytoscape.js.

## Features

### Core Functionality
- **CSV Upload**: Drag & drop or browse CSV files with asset relationships
- **Starting Nodes**: Specify one or multiple node IDs to explore
- **Subgraph Extraction**: Automatically extracts ancestors and descendants
- **Cycle Handling**: Robust traversal that handles cycles
- **Multiple Islands**: Supports disconnected graph components

### Visualization
- **Dual Node Labels**: Displays both asset type and ID
- **Type Colors**: Consistent color mapping per asset type
- **Interactive Legend**: Toggle types on/off to filter
- **Layout Options**: Hierarchical (Dagre) or Force-directed (fCoSE)
- **Pan & Zoom**: Full interactive navigation
- **Minimap**: Visual overview of entire graph

### Advanced Features
- **Search**: Find nodes by ID with auto-focus
- **Node Details Panel**: Click nodes to view ID, type, degree, parents, and children
- **Label Modes**: Show type only, ID only, or both
- **Toggle Controls**: Show/hide labels and legend
- **Fit to View**: Auto-fit graph to viewport

## CSV Format

Required columns:

```csv
assetId,parentAssetId,assetType,parentAssetType
8b0cd398...,364248bd...,IaC Resource,Container Image
8b2b0cfc...,9bafd844...,IaC Resource,VM Instance
```

- **assetId**: Child node identifier
- **parentAssetId**: Parent node identifier  
- **assetType**: Type of the child asset
- **parentAssetType**: Type of the parent asset

Each row defines a directed edge: `assetId -> parentAssetId` (child -> parent)

## Starting Nodes

Enter one or more asset IDs, separated by commas or newlines:

```
8b3a98c8d30b39a8c9432055f9d6652b988375707ac5327ed04d29ac2bd1cc55
240d42a2c1e3b0943968d9fb00d82e9069ebe76ba18d2506e2b0673b41482dbc
```

## Installation

### Prerequisites
- Node.js 22.12.0+
- npm 10.7.0+

### Setup

```bash
npm install
npm run dev
```

Application runs at `http://localhost:5173`

### Build

```bash
npm run build
```

Production build outputs to `dist/`

## Project Structure

```
graph-explorer/
├── src/
│   ├── components/
│   │   ├── LandingPage.tsx      # CSV upload and input
│   │   ├── GraphView.tsx        # Graph visualization
│   │   ├── GraphToolbar.tsx     # Controls
│   │   └── NodeDetailsPanel.tsx # Node info panel
│   ├── utils/
│   │   ├── csv.ts               # CSV parsing
│   │   └── graph.ts             # Graph algorithms
│   └── App.tsx
├── electron/                     # Electron main process
└── package.json
```

## Usage Examples

### Single Starting Node

**CSV:**
```csv
assetId,parentAssetId,assetType,parentAssetType
A,B,IaC Resource,IaC Resource
B,C,IaC Resource,Container Image
C,D,Container Image,VM Instance
```

**Starting Node:** `C`  
**Result:** Graph shows `A -> B -> C -> D`

### Multiple Starting Nodes

**Starting Nodes:** `B, X`  
**Result:** Two disconnected islands

### Cycles

**CSV:**
```csv
assetId,parentAssetId,assetType,parentAssetType
A,B,IaC Resource,IaC Resource
B,C,IaC Resource,IaC Resource
C,A,IaC Resource,IaC Resource
```

**Result:** Graph correctly handles cycle `A -> B -> C -> A`

## Technologies

- React 19.2.0
- TypeScript 5.9.3
- Vite 7.2.4
- TailwindCSS 4.x
- Cytoscape.js with Dagre and fCoSE layouts
- PapaParse for CSV parsing
- Electron 39.2.7

## Troubleshooting

### CSV Parse Errors
- Ensure headers: `assetId,parentAssetId,assetType,parentAssetType`
- Check for missing required fields
- Verify UTF-8 encoding

### Starting Nodes Not Found
- Verify node IDs exist in CSV
- Check for whitespace
- IDs are case-sensitive

### Graph Not Rendering
- Check browser console for errors
- Ensure dependencies installed
- Try refreshing page

## License

MIT

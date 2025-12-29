# Assets Graph Explorer

A modern, futuristic React web application for visualizing asset relationships from CSV data. Built with React, TypeScript, TailwindCSS, and Cytoscape.js.

## Features

### 🎯 Core Functionality
- **CSV Upload**: Drag & drop or browse to upload CSV files containing asset relationships
- **Starting Nodes**: Specify one or multiple starting node IDs to explore
- **Subgraph Extraction**: Automatically extracts all ancestors and descendants of starting nodes
- **Cycle Handling**: Robust graph traversal that handles cycles without infinite loops
- **Multiple Islands**: Supports disconnected graph components

### 🎨 Visualization
- **Dual Node Labels**: Each node displays both `assetCategory` and `assetId`
- **Category Colors**: Consistent color mapping for each asset category
- **Interactive Legend**: Toggle categories on/off to filter the graph
- **Layout Options**:
  - Hierarchical (DAG-like) layout using Dagre
  - Force-directed layout using fCoSE
- **Pan & Zoom**: Full interactive graph navigation
- **Minimap**: Visual overview of the entire graph

### 🔍 Advanced Features
- **Search**: Find nodes by asset ID with auto-focus and highlight
- **Node Details Panel**: Click any node to view:
  - Asset ID (full value)
  - Asset Category
  - In-degree and out-degree
  - List of parent nodes
  - List of child nodes
- **Label Modes**:
  - Show both category and ID
  - Show category only
  - Show ID only
- **Toggle Controls**:
  - Show/hide labels
  - Show/hide legend
- **Fit to View**: Auto-fit graph to viewport

### ⚡ Performance
- **Efficient Data Structures**: Uses adjacency maps for O(1) lookups
- **BFS Traversal**: Optimized graph traversal in both directions
- **Deduplication**: Automatic node and edge deduplication
- **Scalable**: Handles graphs with 10k-100k+ edges

## CSV Format

The application expects a CSV file with the following structure:

```csv
assetId,parentAssetId,assetCategory
8b0cd398...,364248bd...,IaC Resource
8b2b0cfc...,9bafd844...,IaC Resource
8b11adbc...,5f6e7968...,Container Image
```

### Required Columns
- **assetId**: Unique identifier for the asset (child node)
- **parentAssetId**: Identifier of the parent asset
- **assetCategory**: Category/type of the asset

### Graph Semantics
- Each row defines a directed edge: `assetId -> parentAssetId` (child -> parent)
- Missing parent nodes are automatically created with category "Unknown"
- Duplicate edges are automatically deduplicated

## Starting Nodes Format

Enter one or more asset IDs, separated by commas or newlines:

```
8b3a98c8d30b39a8c9432055f9d6652b988375707ac5327ed04d29ac2bd1cc55
240d42a2c1e3b0943968d9fb00d82e9069ebe76ba18d2506e2b0673b41482dbc
```

## Installation & Setup

### Prerequisites
- Node.js 20.19.0+ or 22.12.0+
- npm 10.7.0+

### Install Dependencies

```bash
cd graph-explorer
npm install
```

### Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The production build will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
graph-explorer/
├── src/
│   ├── components/
│   │   ├── LandingPage.tsx    # CSV upload and starting nodes input
│   │   └── GraphView.tsx      # Graph visualization and controls
│   ├── utils/
│   │   ├── csv.ts             # CSV parsing and validation
│   │   └── graph.ts           # Graph algorithms and utilities
│   ├── types/
│   │   ├── react-cytoscapejs.d.ts      # Type definitions
│   │   └── cytoscape-extensions.d.ts   # Type definitions
│   ├── App.tsx                # Main application component
│   ├── main.tsx               # Application entry point
│   └── index.css              # Global styles with Tailwind
├── public/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

## Category Color Mapping

Categories are automatically assigned consistent colors using a hash-based algorithm:

- Each unique category gets a distinct color from a predefined palette
- Colors remain consistent across sessions for the same category name
- The palette includes 12 vibrant colors optimized for dark backgrounds

### Color Palette
- Red (#ef4444)
- Amber (#f59e0b)
- Emerald (#10b981)
- Blue (#3b82f6)
- Violet (#8b5cf6)
- Pink (#ec4899)
- Cyan (#06b6d4)
- Lime (#84cc16)
- Orange (#f97316)
- Indigo (#6366f1)
- Teal (#14b8a6)
- Purple (#a855f7)

## Usage Examples

### Example 1: Single Starting Node

**CSV Data:**
```csv
assetId,parentAssetId,assetCategory
A,B,IaC Resource
B,C,IaC Resource
C,D,Container Image
X,Y,VM Instance
```

**Starting Node:** `C`

**Result:** Graph shows `A -> B -> C -> D` (X and Y are not included)

### Example 2: Multiple Starting Nodes

**CSV Data:**
```csv
assetId,parentAssetId,assetCategory
A,B,IaC Resource
B,C,IaC Resource
C,D,Container Image
X,Y,VM Instance
```

**Starting Nodes:** `B, X`

**Result:** Two disconnected islands:
- Island 1: `A -> B -> C -> D`
- Island 2: `X -> Y`

### Example 3: Cycles

**CSV Data:**
```csv
assetId,parentAssetId,assetCategory
A,B,IaC Resource
B,C,IaC Resource
C,A,IaC Resource
```

**Starting Node:** `A`

**Result:** Graph shows `A -> B -> C -> A` (cycle is handled correctly)

## Performance Notes

### Optimization Strategies
1. **Adjacency Maps**: O(1) lookups for parent/child relationships
2. **BFS with Visited Set**: Prevents infinite loops in cyclic graphs
3. **Lazy Rendering**: Cytoscape.js handles large graphs efficiently
4. **Filtered Rendering**: Only render nodes matching selected categories

### Scalability
- Tested with graphs containing 100k+ nodes
- CSV parsing uses streaming for large files
- Graph extraction is optimized for sparse graphs
- UI remains responsive during graph operations

### Tips for Large Graphs
- Use category filters to reduce visible nodes
- Start with hierarchical layout for better initial positioning
- Use search to quickly locate specific nodes
- Zoom controls help navigate dense areas

## Technologies Used

- **React 19.2.0**: UI framework
- **TypeScript 5.9.3**: Type safety
- **Vite 7.2.4**: Build tool and dev server
- **TailwindCSS 3.x**: Utility-first CSS framework
- **Cytoscape.js**: Graph visualization library
- **react-cytoscapejs**: React wrapper for Cytoscape.js
- **cytoscape-dagre**: Hierarchical layout algorithm
- **cytoscape-fcose**: Force-directed layout algorithm
- **PapaParse**: CSV parsing library

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Known Limitations

- Very large graphs (500k+ nodes) may experience performance degradation
- Binary file formats (PDF, DOCX) are not supported for CSV upload
- Maximum file size depends on browser memory limits

## Troubleshooting

### CSV Parse Errors
- Ensure CSV has headers: `assetId,parentAssetId,assetCategory`
- Check for missing required fields
- Verify file encoding is UTF-8

### Starting Nodes Not Found
- Verify node IDs exist in the CSV data
- Check for extra whitespace or special characters
- IDs are case-sensitive

### Graph Not Rendering
- Check browser console for errors
- Ensure all dependencies are installed
- Try refreshing the page

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and questions, please open an issue on the GitHub repository.

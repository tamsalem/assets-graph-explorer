import { useEffect, useRef, useState, useMemo } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';
import fcose from 'cytoscape-fcose';
import type { Core, ElementDefinition } from 'cytoscape';
import { buildAdjacencyMaps, extractSubgraph, getTypeColor, truncateAssetId, detectIslands, findPathsFrom, findPathsTo, findPathEdges } from '../utils/graph';
import type { ParseResult } from '../utils/csv';
import type { GraphNode } from '../utils/graph';
import { getStylesheet, getLayoutConfig, GRAPH_COLORS } from './GraphConfig';
import { NodeDetailsPanel } from './NodeDetailsPanel';
import { GraphToolbar } from './GraphToolbar';

// Register layout extensions
cytoscape.use(dagre);
cytoscape.use(fcose);

interface GraphViewProps {
  parseResult: ParseResult;
  startingNodes: string[];
  onBack: () => void;
}

type LayoutType = 'dagre' | 'fcose';
type LabelMode = 'both' | 'category' | 'assetId';

export const GraphView = ({ parseResult, startingNodes, onBack }: GraphViewProps) => {
  const cyRef = useRef<Core | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [highlightedPaths, setHighlightedPaths] = useState<{
    fromNodes: Set<string>;
    toNodes: Set<string>;
    fromEdges: Set<string>;
    toEdges: Set<string>;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showLabels, setShowLabels] = useState(true);
  const [labelMode, setLabelMode] = useState<LabelMode>('both');
  const [layout, setLayout] = useState<LayoutType>('dagre');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [zoomLevel, setZoomLevel] = useState(1);

  // Build graph data
  const graphData = useMemo(() => {
    const adjacencyMaps = buildAdjacencyMaps(parseResult.data);
    return extractSubgraph(startingNodes, adjacencyMaps);
  }, [parseResult, startingNodes]);

  // Type colors
  const typeColors = useMemo(() => {
    const colors = new Map<string, string>();
    parseResult.types.forEach((type) => {
      colors.set(type, getTypeColor(type));
    });
    return colors;
  }, [parseResult.types]);

  // Filter nodes by selected type
  const filteredNodes = useMemo(() => {
    if (selectedType === 'all') {
      return Array.from(graphData.nodes.values());
    }
    return Array.from(graphData.nodes.values()).filter((node) =>
      node.type === selectedType
    );
  }, [graphData.nodes, selectedType]);

  // Detect islands from filtered nodes
  const islands = useMemo(() => {
    // Create a subgraph with only filtered nodes
    const filteredNodeIds = new Set(filteredNodes.map(n => n.id));
    const filteredGraphData = {
      nodes: new Map(
        Array.from(graphData.nodes.entries()).filter(([id]) => filteredNodeIds.has(id))
      ),
      edges: graphData.edges.filter(
        edge => filteredNodeIds.has(edge.source) && filteredNodeIds.has(edge.target)
      ),
    };
    return detectIslands(filteredGraphData);
  }, [graphData, filteredNodes]);

  const longestIsland = islands.length > 0 ? islands[islands.length - 1] : null;

  // Helper function to get label text
  const getLabelText = (node: GraphNode, mode: LabelMode): string => {
    const truncatedId = truncateAssetId(node.id, 10);
    switch (mode) {
      case 'category':
        return node.type;
      case 'assetId':
        return truncatedId;
      case 'both':
      default:
        return `${node.type}\n${truncatedId}`;
    }
  };

  // Convert to Cytoscape elements
  const elements: ElementDefinition[] = useMemo(() => {
    const filteredNodeIds = new Set(filteredNodes.map((n) => n.id));
    const startingNodeSet = new Set(startingNodes);
    
    const nodes: ElementDefinition[] = filteredNodes.map((node) => ({
      data: {
        id: node.id,
        label: getLabelText(node, labelMode),
        type: node.type,
        color: typeColors.get(node.type) || '#888',
        inDegree: node.inDegree,
        outDegree: node.outDegree,
        parents: node.parents,
        children: node.children,
        isStartingNode: startingNodeSet.has(node.id),
      },
    }));

    const edges: ElementDefinition[] = graphData.edges
      .filter((edge) => filteredNodeIds.has(edge.source) && filteredNodeIds.has(edge.target))
      .map((edge) => ({
        data: {
          id: `${edge.source}->${edge.target}`,
          source: edge.source,
          target: edge.target,
        },
      }));

    return [...nodes, ...edges];
  }, [filteredNodes, graphData.edges, typeColors, labelMode, startingNodes]);

  // Cytoscape stylesheet
  const stylesheet = useMemo(() => getStylesheet(showLabels), [showLabels]);

  // Layout configuration
  const layoutConfig = useMemo(() => getLayoutConfig(layout), [layout]);

  // Resize graph when panel opens/closes
  useEffect(() => {
    if (cyRef.current) {
      cyRef.current.resize();
    }
  }, [selectedNode]);

  // Handle node selection and custom island positioning
  useEffect(() => {
    if (!cyRef.current) return;

    const cy = cyRef.current;

    const handleNodeTap = (evt: any) => {
      const node = evt.target;
      const nodeData = graphData.nodes.get(node.id());
      if (!nodeData) return;
      
      console.log('Node tapped:', nodeData.id);
      setSelectedNode(nodeData);
      
      // Calculate all paths
      const pathsFrom = findPathsFrom(nodeData.id, graphData);
      const pathsTo = findPathsTo(nodeData.id, graphData);
      const { fromEdges, toEdges } = findPathEdges(nodeData.id, graphData);
      
      console.log('Paths calculated:', {
        fromNodes: pathsFrom.size,
        toNodes: pathsTo.size,
        fromEdges: fromEdges.size,
        toEdges: toEdges.size
      });

      setHighlightedPaths({
        fromNodes: pathsFrom,
        toNodes: pathsTo,
        fromEdges,
        toEdges,
      });
      
      // Batch updates for better performance
      cy.batch(() => {
        // Reset all classes first
        cy.elements().removeClass('dimmed highlight-selected highlight-connected highlight-parent-subgraph highlight-child-subgraph');
        
        // Dim all elements
        cy.elements().addClass('dimmed');
        
        // Highlight the selected node (Green)
        node.removeClass('dimmed').addClass('highlight-selected');
        
        // Highlight ancestor nodes (Blue)
        pathsFrom.forEach(nodeId => {
          const ancestorNode = cy.getElementById(nodeId);
          if (ancestorNode.length) {
            ancestorNode.removeClass('dimmed').addClass('highlight-connected');
          }
        });
        
        // Highlight descendant nodes (Blue)
        pathsTo.forEach(nodeId => {
          const descendantNode = cy.getElementById(nodeId);
          if (descendantNode.length) {
            descendantNode.removeClass('dimmed').addClass('highlight-connected');
          }
        });
        
        // Highlight edges
        cy.edges().forEach(edge => {
          const edgeId = edge.data('id');
          
          // Edge in paths FROM selected node (Red - Parent Subgraph)
          if (fromEdges.has(edgeId)) {
            edge.removeClass('dimmed').addClass('highlight-parent-subgraph');
          }
          // Edge in paths TO selected node (Blue - Child Subgraph)
          else if (toEdges.has(edgeId)) {
            edge.removeClass('dimmed').addClass('highlight-child-subgraph');
          }
        });
      });
    };

    const handleBackgroundTap = (evt: any) => {
      if (evt.target !== cy) return;

      setSelectedNode(null);
      setHighlightedPaths(null);
      
      // Reset all styles to default
      if (cy) {
        cy.nodes().style({
          'opacity': 1,
          'border-width': 4,
          'border-color': GRAPH_COLORS.nodeBorder
        });
        
        cy.edges().style({
          'opacity': 0.9,
          'width': 3,
          'line-color': GRAPH_COLORS.edgeDefault,
          'target-arrow-color': GRAPH_COLORS.edgeDefault,
          'source-arrow-color': GRAPH_COLORS.edgeDefault
        });
        
        // Restore starting node borders
        const startingNodeSet = new Set(startingNodes);
        cy.nodes().forEach(n => {
          if (startingNodeSet.has(n.id())) {
            n.style({
              'border-width': '6',
              'border-color': GRAPH_COLORS.selectionBorder
            });
          }
        });

        // Remove all classes
        cy.elements().removeClass('dimmed highlight-selected highlight-connected highlight-parent-subgraph highlight-child-subgraph');
      }
    };

    const handleZoom = () => {
      setZoomLevel(cy.zoom());
    };

    cy.on('tap', 'node', handleNodeTap);
    cy.on('tap', handleBackgroundTap);
    cy.on('zoom', handleZoom);

    // Custom positioning: smallest islands on right, largest island on left
    const positionIslandsBySize = () => {
      if (islands.length <= 1) return;

      // Islands are already sorted smallest to largest from detectIslands
      const islandSpacing = 200;
      
      // Get bounding boxes for all islands
      const islandData = islands.map(island => {
        const islandNodeIds = Array.from(island.nodes);
        const islandNodes = cy.nodes().filter(node => islandNodeIds.includes(node.id()));
        const bb = islandNodes.boundingBox();
        return {
          island,
          nodes: islandNodes,
          width: bb.w,
          height: bb.h,
          centerX: (bb.x1 + bb.x2) / 2,
          centerY: (bb.y1 + bb.y2) / 2,
        };
      });

      // Separate small islands (size < 5) from large ones
      const smallIslands = islandData.filter(d => d.island.size < 5);
      const largeIslands = islandData.filter(d => d.island.size >= 5);

      // Position large islands linearly from right to left
      let currentX = 0;
      
      // Process large islands first (from right to left)
      // Since they are sorted smallest to largest, we iterate backwards to place largest on left?
      // No, we want smallest on right.
      // detectIslands returns [smallest ... largest]
      // So we want to place them: [Largest] ... [Medium] ... [Smallest]
      // Let's place them from Right to Left starting with Smallest.
      
      // Start placing from X = 0 and move Left (negative X)
      
      // First, handle small islands in a grid/cloud on the far right
      if (smallIslands.length > 0) {
        const cols = Math.ceil(Math.sqrt(smallIslands.length));
        const cellSize = 200; // Fixed cell size for small islands
        
        smallIslands.forEach((data, i) => {
          const col = i % cols;
          const row = Math.floor(i / cols);
          
          const targetX = currentX + (col * cellSize);
          const targetY = row * cellSize;
          
          const shiftX = targetX - data.centerX;
          const shiftY = targetY - data.centerY;
          
          data.nodes.forEach(node => {
            const pos = node.position();
            node.position({
              x: pos.x + shiftX,
              y: pos.y + shiftY
            });
          });
        });
        
        // Move currentX to the left of the grid
        currentX -= (cols * cellSize) + islandSpacing;
      }

      // Now place large islands linearly to the left
      // We iterate through largeIslands (which are sorted smallest -> largest)
      // We want smallest on right (closest to currentX) and largest on left (furthest)
      // So we iterate normally
      largeIslands.forEach(data => {
        // Place this island to the left of currentX
        const targetX = currentX - (data.width / 2);
        
        const shiftX = targetX - data.centerX;
        // Align vertically to 0
        const shiftY = 0 - data.centerY;
        
        data.nodes.forEach(node => {
          const pos = node.position();
          node.position({
            x: pos.x + shiftX,
            y: pos.y + shiftY
          });
        });
        
        // Update currentX for next island
        currentX -= data.width + islandSpacing;
      });

      // Fit view after repositioning
      cy.fit(undefined, 50);
    };

    // Position islands after layout completes
    const layoutEndHandler = () => {
      setTimeout(positionIslandsBySize, 100);
    };

    cy.on('layoutstop', layoutEndHandler);

    return () => {
      cy.off('tap', 'node', handleNodeTap);
      cy.off('tap', handleBackgroundTap);
      cy.off('zoom', handleZoom);
      cy.off('layoutstop', layoutEndHandler);
    };
  }, [graphData.nodes, islands, startingNodes]);

  // Search functionality
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!cyRef.current || !query.trim()) return;

    const cy = cyRef.current;
    const matchingNode = cy.nodes().filter((node) => {
      const id = node.id();
      return id.toLowerCase().includes(query.toLowerCase());
    });

    if (matchingNode.length > 0) {
      cy.animate({
        fit: {
          eles: matchingNode,
          padding: 50,
        },
        duration: 500,
      });
      matchingNode.select();
      const nodeData = graphData.nodes.get(matchingNode[0].id());
      if (nodeData) {
        setSelectedNode(nodeData);
      }
    }
  };

  const handleFitView = () => {
    if (cyRef.current) {
      cyRef.current.fit(undefined, 50);
    }
  };

  const handleZoomToLongestIsland = () => {
    if (!cyRef.current || !longestIsland) return;

    const cy = cyRef.current;
    const islandNodeIds = Array.from(longestIsland.nodes);
    const islandNodes = cy.nodes().filter((node) => islandNodeIds.includes(node.id()));

    if (islandNodes.length > 0) {
      // First fit to the island
      cy.fit(islandNodes, 100);
      
      // Then animate a slight zoom out for better view
      setTimeout(() => {
        const currentZoom = cy.zoom();
        cy.animate({
          zoom: currentZoom * 0.9,
          center: {
            eles: islandNodes
          },
          duration: 500,
        });
      }, 100);
    }
  };

  const handleTypeChange = (type: string) => {
    setSelectedType(type);
  };

  const handleLayoutChange = (newLayout: LayoutType) => {
    setLayout(newLayout);
    if (cyRef.current) {
      cyRef.current.layout(layoutConfig).run();
    }
  };

  const handleCloseDetails = () => {
    setSelectedNode(null);
    setHighlightedPaths(null);
    if (cyRef.current) {
      const cy = cyRef.current;
      // Reset all classes
      cy.batch(() => {
        cy.elements().removeClass('dimmed highlight-selected highlight-connected highlight-parent-subgraph highlight-child-subgraph');
      });
      
      // Reset styles
      cy.nodes().style({
        'opacity': 1,
        'border-width': 4,
        'border-color': GRAPH_COLORS.nodeBorder
      });
      
      cy.edges().style({
        'opacity': 0.9,
        'width': 3,
        'line-color': GRAPH_COLORS.edgeDefault,
        'target-arrow-color': GRAPH_COLORS.edgeDefault,
        'source-arrow-color': GRAPH_COLORS.edgeDefault
      });
      
      // Restore starting node borders
      const startingNodeSet = new Set(startingNodes);
      cy.nodes().forEach(n => {
        if (startingNodeSet.has(n.id())) {
          n.style({
            'border-width': '6',
            'border-color': GRAPH_COLORS.selectionBorder
          });
        }
      });
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden">
      <GraphToolbar
        onBack={onBack}
        nodeCount={filteredNodes.length}
        edgeCount={graphData.edges.length}
        islandCount={islands.length}
        longestIsland={longestIsland}
        searchQuery={searchQuery}
        onSearch={handleSearch}
        layout={layout}
        onLayoutChange={handleLayoutChange}
        selectedType={selectedType}
        onTypeChange={handleTypeChange}
        parseResult={parseResult}
        graphDataNodes={graphData.nodes}
        labelMode={labelMode}
        onLabelModeChange={setLabelMode}
        showLabels={showLabels}
        onToggleLabels={() => setShowLabels(!showLabels)}
        onFitView={handleFitView}
        onZoomToLongestIsland={handleZoomToLongestIsland}
      />

      {/* Main Content */}
      <div className="flex-1 flex relative">
        {/* Graph Canvas */}
        <div className="flex-1 relative">
          <CytoscapeComponent
            elements={elements}
            style={{ width: '100%', height: '100%' }}
            stylesheet={stylesheet}
            layout={layoutConfig}
            cy={(cy: Core) => {
              cyRef.current = cy;
            }}
            className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
          />

          {/* Zoom Level Indicator */}
          <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur-sm border border-slate-700/50 rounded-lg px-4 py-2 text-sm text-slate-300 shadow-lg">
            Zoom: {(zoomLevel * 100).toFixed(0)}%
          </div>
        </div>

        {/* Node Details Panel */}
        <NodeDetailsPanel
          selectedNode={selectedNode}
          typeColor={selectedNode ? (typeColors.get(selectedNode.type) || '#888') : '#888'}
          highlightedPaths={highlightedPaths}
          isStartingNode={selectedNode ? startingNodes.includes(selectedNode.id) : false}
          onClose={handleCloseDetails}
        />
      </div>
    </div>
  );
};

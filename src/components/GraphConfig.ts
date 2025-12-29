import type { StylesheetStyle } from 'cytoscape';

export const GRAPH_COLORS = {
  nodeBorder: '#0f172a',
  nodeTextOutline: '#0f172a',
  selectionBorder: '#fbbf24',
  highlightSelected: '#10b981', // Green
  highlightConnected: '#3b82f6', // Blue
  edgeDefault: '#64748b',
  edgeParentSubgraph: '#ef4444', // Red
  edgeChildSubgraph: '#3b82f6', // Blue
  text: '#ffffff',
};

export const getStylesheet = (showLabels: boolean): StylesheetStyle[] => [
  {
    selector: 'node',
    style: {
      'background-color': 'data(color)',
      'label': showLabels ? 'data(label)' : '',
      'color': GRAPH_COLORS.text,
      'text-valign': 'center',
      'text-halign': 'center',
      'font-size': '12px',
      'font-family': 'system-ui, -apple-system, sans-serif',
      'font-weight': 'bold',
      'text-wrap': 'wrap',
      'text-max-width': '120px',
      'width': 60,
      'height': 60,
      'border-width': 4,
      'border-color': GRAPH_COLORS.nodeBorder,
      'text-outline-width': 4,
      'text-outline-color': GRAPH_COLORS.nodeTextOutline,
      'transition-property': 'border-width, border-color, width, height, opacity, background-color',
      'transition-duration': '0.2s',
    } as any,
  },
  {
    selector: 'node[?isStartingNode]',
    style: {
      'border-width': 6,
      'border-color': GRAPH_COLORS.selectionBorder,
    } as any,
  },
  {
    selector: 'node:selected',
    style: {
      'border-width': 5,
      'border-color': GRAPH_COLORS.selectionBorder,
      'background-color': 'data(color)',
      'width': 70,
      'height': 70,
      'z-index': 999,
    } as any,
  },
  {
    selector: 'node.dimmed',
    style: {
      'opacity': 0.3,
      'border-width': 4,
      'border-color': GRAPH_COLORS.nodeBorder,
    } as any,
  },
  {
    selector: 'node.highlight-selected',
    style: {
      'opacity': 1,
      'background-color': GRAPH_COLORS.highlightSelected,
      'border-width': 8,
      'border-color': GRAPH_COLORS.selectionBorder,
    } as any,
  },
  {
    selector: 'node.highlight-connected',
    style: {
      'opacity': 1,
      'background-color': GRAPH_COLORS.highlightConnected,
      'border-width': 6,
      'border-color': GRAPH_COLORS.highlightConnected,
    } as any,
  },
  {
    selector: 'edge',
    style: {
      'width': 3,
      'line-color': GRAPH_COLORS.edgeDefault,
      'target-arrow-color': GRAPH_COLORS.edgeDefault,
      'target-arrow-shape': 'triangle',
      'source-arrow-color': GRAPH_COLORS.edgeDefault,
      'source-arrow-shape': 'circle',
      'curve-style': 'bezier',
      'arrow-scale': 2,
      'opacity': 0.9,
      'transition-property': 'line-color, target-arrow-color, source-arrow-color, width, opacity',
      'transition-duration': '0.2s',
    } as any,
  },
  {
    selector: 'edge.dimmed',
    style: {
      'opacity': 0.2,
      'width': 3,
      'line-color': GRAPH_COLORS.edgeDefault,
      'target-arrow-color': GRAPH_COLORS.edgeDefault,
      'source-arrow-color': GRAPH_COLORS.edgeDefault,
    } as any,
  },
  {
    selector: 'edge.highlight-parent-subgraph',
    style: {
      'opacity': 1,
      'width': 5,
      'line-color': GRAPH_COLORS.edgeParentSubgraph,
      'target-arrow-color': GRAPH_COLORS.edgeParentSubgraph,
      'source-arrow-color': GRAPH_COLORS.edgeParentSubgraph,
    } as any,
  },
  {
    selector: 'edge.highlight-child-subgraph',
    style: {
      'opacity': 1,
      'width': 5,
      'line-color': GRAPH_COLORS.edgeChildSubgraph,
      'target-arrow-color': GRAPH_COLORS.edgeChildSubgraph,
      'source-arrow-color': GRAPH_COLORS.edgeChildSubgraph,
    } as any,
  },
  {
    selector: 'edge:selected',
    style: {
      'line-color': GRAPH_COLORS.selectionBorder,
      'target-arrow-color': GRAPH_COLORS.selectionBorder,
      'source-arrow-color': GRAPH_COLORS.selectionBorder,
      'width': 5,
      'opacity': 1,
      'z-index': 999,
    } as any,
  },
  {
    selector: 'edge:active',
    style: {
      'overlay-opacity': 0.3,
      'overlay-color': GRAPH_COLORS.selectionBorder,
    } as any,
  },
];

export const getLayoutConfig = (layout: 'dagre' | 'fcose') => ({
  name: layout,
  ...(layout === 'dagre'
    ? {
        rankDir: 'TB',
        nodeSep: 200,
        rankSep: 250,
        ranker: 'longest-path',
        animate: false,
        fit: true,
        padding: 120,
        edgeSep: 50,
        align: 'DL',
        spacingFactor: 1.5,
      }
    : {
        quality: 'proof',
        randomize: false,
        animate: false,
        fit: true,
        padding: 120,
        nodeSeparation: 200,
        idealEdgeLength: 250,
        edgeElasticity: 0.05,
        nestingFactor: 0.1,
        gravity: 0.05,
        numIter: 10000,
        tile: true,
        tilingPaddingVertical: 100,
        tilingPaddingHorizontal: 100,
        initialEnergyOnIncremental: 0.3,
        nodeDimensionsIncludeLabels: true,
      }),
});
import type { CSVRow } from './csv';

export interface GraphNode {
  id: string;
  type: string;
  inDegree: number;
  outDegree: number;
  parents: string[];
  children: string[];
}

export interface GraphEdge {
  source: string;
  target: string;
}

export interface GraphData {
  nodes: Map<string, GraphNode>;
  edges: GraphEdge[];
}

export interface AdjacencyMaps {
  outAdj: Map<string, Set<string>>; // assetId -> Set of parentAssetIds
  inAdj: Map<string, Set<string>>;  // parentAssetId -> Set of childAssetIds (reverse)
  nodeTypes: Map<string, string>;
}

/**
 * Build adjacency maps from CSV data for efficient graph traversal
 */
export const buildAdjacencyMaps = (data: CSVRow[]): AdjacencyMaps => {
  const outAdj = new Map<string, Set<string>>();
  const inAdj = new Map<string, Set<string>>();
  const nodeTypes = new Map<string, string>();

  data.forEach((row) => {
    const { assetId, parentAssetId, assetType, parentAssetType } = row;

    // Store type for assetId
    if (!nodeTypes.has(assetId)) {
      nodeTypes.set(assetId, assetType);
    }

    // Store type for parentAssetId
    if (!nodeTypes.has(parentAssetId)) {
      nodeTypes.set(parentAssetId, parentAssetType);
    }

    // Build outgoing adjacency (child -> parent)
    if (!outAdj.has(assetId)) {
      outAdj.set(assetId, new Set());
    }
    outAdj.get(assetId)!.add(parentAssetId);

    // Build incoming adjacency (parent -> children)
    if (!inAdj.has(parentAssetId)) {
      inAdj.set(parentAssetId, new Set());
    }
    inAdj.get(parentAssetId)!.add(assetId);
  });

  return { outAdj, inAdj, nodeTypes };
};

/**
 * Extract subgraph containing all ancestors and descendants of starting nodes
 * Uses BFS to traverse in both directions, handles cycles with visited set
 */
export const extractSubgraph = (
  startingNodes: string[],
  adjacencyMaps: AdjacencyMaps
): GraphData => {
  const { outAdj, inAdj, nodeTypes } = adjacencyMaps;
  const reachableNodes = new Set<string>();
  const edges: GraphEdge[] = [];
  const edgeSet = new Set<string>();

  // BFS to find all ancestors (traverse upward via outAdj)
  const findAncestors = (startNode: string) => {
    const queue: string[] = [startNode];
    const visited = new Set<string>();

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (visited.has(current)) continue;
      visited.add(current);
      reachableNodes.add(current);

      const parents = outAdj.get(current);
      if (parents) {
        parents.forEach((parent) => {
          const edgeKey = `${current}->${parent}`;
          if (!edgeSet.has(edgeKey)) {
            edgeSet.add(edgeKey);
            edges.push({ source: current, target: parent });
          }
          if (!visited.has(parent)) {
            queue.push(parent);
          }
        });
      }
    }
  };

  // BFS to find all descendants (traverse downward via inAdj)
  const findDescendants = (startNode: string) => {
    const queue: string[] = [startNode];
    const visited = new Set<string>();

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (visited.has(current)) continue;
      visited.add(current);
      reachableNodes.add(current);

      const children = inAdj.get(current);
      if (children) {
        children.forEach((child) => {
          const edgeKey = `${child}->${current}`;
          if (!edgeSet.has(edgeKey)) {
            edgeSet.add(edgeKey);
            edges.push({ source: child, target: current });
          }
          if (!visited.has(child)) {
            queue.push(child);
          }
        });
      }
    }
  };

  // Traverse from each starting node
  startingNodes.forEach((startNode) => {
    // Add the starting node even if it doesn't exist in the data
    // It will appear as an isolated island with "Unknown" type
    reachableNodes.add(startNode);
    
    if (nodeTypes.has(startNode)) {
      findAncestors(startNode);
      findDescendants(startNode);
    } else {
      // Node doesn't exist in CSV, mark it as Unknown type
      nodeTypes.set(startNode, 'Unknown');
    }
  });

  // Build node map with metadata
  const nodes = new Map<string, GraphNode>();
  reachableNodes.forEach((nodeId) => {
    const parents = Array.from(outAdj.get(nodeId) || []).filter((p) =>
      reachableNodes.has(p)
    );
    const children = Array.from(inAdj.get(nodeId) || []).filter((c) =>
      reachableNodes.has(c)
    );

    nodes.set(nodeId, {
      id: nodeId,
      type: nodeTypes.get(nodeId) || 'Unknown',
      inDegree: children.length,
      outDegree: parents.length,
      parents,
      children,
    });
  });

  return { nodes, edges };
};

/**
 * Generate consistent color for a type using hash
 */
export const getTypeColor = (type: string): string => {
  const colors = [
    '#ef4444', // red
    '#10b981', // emerald
    '#3b82f6', // blue
    '#8b5cf6', // violet
    '#ec4899', // pink
    '#06b6d4', // cyan
    '#84cc16', // lime
    '#f97316', // orange
    '#6366f1', // indigo
    '#14b8a6', // teal
    '#a855f7', // purple
    '#f43f5e', // rose
    '#22c55e', // green
    '#0ea5e9', // sky
    '#d946ef', // fuchsia
    '#fb923c', // orange-400
    '#4ade80', // green-400
    '#60a5fa', // blue-400
    '#c084fc', // purple-400
    '#f472b6', // pink-400
    '#2dd4bf', // teal-400
  ];

  // Simple hash function
  let hash = 0;
  for (let i = 0; i < type.length; i++) {
    hash = type.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

/**
 * Truncate long asset IDs for display
 */
export const truncateAssetId = (assetId: string, maxLength: number = 12): string => {
  if (assetId.length <= maxLength) return assetId;
  return assetId.substring(0, maxLength) + '...';
};

export interface Island {
  nodes: Set<string>;
  size: number;
}

/**
 * Detect connected components (islands) in the graph
 * Treats the graph as undirected for connectivity purposes
 * Returns array of islands sorted by size (smallest first for right-to-left positioning)
 */
export const detectIslands = (graphData: GraphData): Island[] => {
  const visited = new Set<string>();
  const islands: Island[] = [];

  // Build undirected adjacency for connectivity
  const adjacency = new Map<string, Set<string>>();
  
  // Add all nodes to adjacency map
  graphData.nodes.forEach((_, nodeId) => {
    if (!adjacency.has(nodeId)) {
      adjacency.set(nodeId, new Set());
    }
  });
  
  // Add edges in both directions (treat as undirected)
  graphData.edges.forEach(edge => {
    if (!adjacency.has(edge.source)) {
      adjacency.set(edge.source, new Set());
    }
    if (!adjacency.has(edge.target)) {
      adjacency.set(edge.target, new Set());
    }
    adjacency.get(edge.source)!.add(edge.target);
    adjacency.get(edge.target)!.add(edge.source);
  });

  const bfs = (startNode: string): Set<string> => {
    const island = new Set<string>();
    const queue: string[] = [startNode];
    
    while (queue.length > 0) {
      const current = queue.shift()!;
      if (visited.has(current)) continue;
      
      visited.add(current);
      island.add(current);
      
      // Visit all neighbors
      const neighbors = adjacency.get(current);
      if (neighbors) {
        neighbors.forEach(neighbor => {
          if (!visited.has(neighbor)) {
            queue.push(neighbor);
          }
        });
      }
    }
    
    return island;
  };

  // Find all islands
  graphData.nodes.forEach((_, nodeId) => {
    if (!visited.has(nodeId)) {
      const island = bfs(nodeId);
      islands.push({
        nodes: island,
        size: island.size,
      });
    }
  });

  // Sort by size ASCENDING (smallest first) - this is what we want for right-to-left positioning
  // Secondary sort by first node ID for deterministic order
  return islands.sort((a, b) => {
    if (a.size !== b.size) {
      return a.size - b.size;
    }
    const aFirst = Array.from(a.nodes)[0] || '';
    const bFirst = Array.from(b.nodes)[0] || '';
    return aFirst.localeCompare(bFirst);
  });
};

/**
 * Find all paths from a given node (descendants)
 * Returns set of node IDs that are reachable from the start node
 */
export const findPathsFrom = (
  startNodeId: string,
  graphData: GraphData
): Set<string> => {
  const reachable = new Set<string>();
  const visited = new Set<string>();
  const queue: string[] = [startNodeId];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visited.has(current)) continue;
    visited.add(current);
    reachable.add(current);

    const node = graphData.nodes.get(current);
    if (node) {
      // Follow outgoing edges (to parents)
      node.parents.forEach(parentId => {
        if (!visited.has(parentId)) {
          queue.push(parentId);
        }
      });
    }
  }

  // Remove the start node itself
  reachable.delete(startNodeId);
  return reachable;
};

/**
 * Find all paths to a given node (ancestors)
 * Returns set of node IDs that can reach the target node
 */
export const findPathsTo = (
  targetNodeId: string,
  graphData: GraphData
): Set<string> => {
  const reachable = new Set<string>();
  const visited = new Set<string>();
  const queue: string[] = [targetNodeId];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visited.has(current)) continue;
    visited.add(current);
    reachable.add(current);

    const node = graphData.nodes.get(current);
    if (node) {
      // Follow incoming edges (from children)
      node.children.forEach(childId => {
        if (!visited.has(childId)) {
          queue.push(childId);
        }
      });
    }
  }

  // Remove the target node itself
  reachable.delete(targetNodeId);
  return reachable;
};

/**
 * Find all edges involved in paths from/to a node
 */
export const findPathEdges = (
  nodeId: string,
  graphData: GraphData
): { fromEdges: Set<string>; toEdges: Set<string> } => {
  const pathsFrom = findPathsFrom(nodeId, graphData);
  const pathsTo = findPathsTo(nodeId, graphData);
  
  const fromEdges = new Set<string>();
  const toEdges = new Set<string>();

  graphData.edges.forEach((edge) => {
    const edgeId = `${edge.source}->${edge.target}`;
    
    // Check if this edge is part of paths FROM the selected node
    if (
      (edge.source === nodeId && pathsFrom.has(edge.target)) ||
      (pathsFrom.has(edge.source) && pathsFrom.has(edge.target)) ||
      (pathsFrom.has(edge.source) && edge.target === nodeId)
    ) {
      fromEdges.add(edgeId);
    }
    
    // Check if this edge is part of paths TO the selected node
    if (
      (edge.target === nodeId && pathsTo.has(edge.source)) ||
      (pathsTo.has(edge.source) && pathsTo.has(edge.target)) ||
      (pathsTo.has(edge.target) && edge.source === nodeId)
    ) {
      toEdges.add(edgeId);
    }
  });

  return { fromEdges, toEdges };
};
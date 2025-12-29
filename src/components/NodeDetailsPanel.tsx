import { truncateAssetId } from '../utils/graph';
import type { GraphNode } from '../utils/graph';

interface NodeDetailsPanelProps {
  selectedNode: GraphNode | null;
  typeColor: string;
  highlightedPaths: {
    fromNodes: Set<string>;
    toNodes: Set<string>;
    fromEdges: Set<string>;
    toEdges: Set<string>;
  } | null;
  isStartingNode: boolean;
  onClose: () => void;
}

export const NodeDetailsPanel = ({
  selectedNode,
  typeColor,
  highlightedPaths,
  isStartingNode,
  onClose,
}: NodeDetailsPanelProps) => {
  if (!selectedNode) {
    return (
      <div className="w-80 flex-shrink-0 z-10 bg-slate-900/80 backdrop-blur-sm border-l border-slate-700/50 p-6 flex flex-col items-center justify-center text-center shadow-xl">
        <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4 border border-slate-700/30">
          <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
          </svg>
        </div>
        <h3 className="text-slate-200 font-bold text-lg mb-2">No Node Selected</h3>
        <p className="text-slate-400 text-sm">
          Click on any node in the graph to view its details and connections.
        </p>
      </div>
    );
  }

  return (
    <div className="w-80 flex-shrink-0 z-10 bg-slate-900/80 backdrop-blur-sm border-l border-slate-700/50 p-6 overflow-y-auto shadow-xl">
      <div className="flex items-start justify-between mb-6">
        <h3 className="text-slate-200 font-bold text-xl">Node Details</h3>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-200 transition-all duration-200 hover:scale-110 active:scale-95"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="space-y-4">
        {/* Starting Node Indicator */}
        {isStartingNode && (
          <div className="bg-amber-900/20 border border-amber-700/30 rounded-lg p-3 flex items-center space-x-3">
            <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)] animate-pulse" />
            <span className="text-amber-400 font-semibold text-sm">Starting Node</span>
          </div>
        )}

        {/* Type Badge */}
        <div>
          <label className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Asset Type</label>
          <div className="mt-2 flex items-center space-x-3 bg-slate-800/50 rounded-lg p-3">
            <div
              className="w-4 h-4 rounded-full shadow-lg"
              style={{
                backgroundColor: typeColor,
                boxShadow: `0 0 12px ${typeColor}60`
              }}
            />
            <span className="text-slate-200 font-semibold text-lg">{selectedNode.type}</span>
          </div>
        </div>

        {/* Asset ID */}
        <div>
          <label className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Asset ID</label>
          <div className="mt-2 bg-slate-800/50 rounded-lg p-3 font-mono text-xs text-slate-300 break-all border border-slate-700/30">
            {selectedNode.id}
          </div>
        </div>

        {/* Degrees */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/30">
            <label className="text-slate-400 text-xs uppercase tracking-wider font-semibold">In-Degree</label>
            <div className="mt-2 text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              {selectedNode.inDegree}
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/30">
            <label className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Out-Degree</label>
            <div className="mt-2 text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {selectedNode.outDegree}
            </div>
          </div>
        </div>

        {/* Connected Subgraph Info */}
        {highlightedPaths && (
          <div className="bg-gradient-to-br from-slate-800/70 to-slate-800/50 rounded-lg p-4 border border-slate-700/50">
            <label className="text-slate-300 text-sm font-semibold mb-3 block">Connected Subgraph</label>
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-emerald-900/20 rounded p-2 border border-emerald-700/30">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50"></div>
                  <span className="text-xs text-slate-300">Ancestors</span>
                </div>
                <span className="text-sm font-bold text-emerald-400">{highlightedPaths.fromNodes.size}</span>
              </div>
              <div className="flex items-center justify-between bg-blue-900/20 rounded p-2 border border-blue-700/30">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50"></div>
                  <span className="text-xs text-slate-300">Descendants</span>
                </div>
                <span className="text-sm font-bold text-blue-400">{highlightedPaths.toNodes.size}</span>
              </div>
              {Array.from(highlightedPaths.fromNodes).some(id => highlightedPaths.toNodes.has(id)) && (
                <div className="flex items-center justify-between bg-purple-900/20 rounded p-2 border border-purple-700/30">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500 shadow-lg shadow-purple-500/50"></div>
                    <span className="text-xs text-slate-300">Bidirectional</span>
                  </div>
                  <span className="text-sm font-bold text-purple-400">
                    {Array.from(highlightedPaths.fromNodes).filter(id => highlightedPaths.toNodes.has(id)).length}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Parents */}
        {selectedNode.parents.length > 0 && (
          <div>
            <label className="text-slate-400 text-xs uppercase tracking-wider font-semibold">
              Parents ({selectedNode.parents.length})
            </label>
            <div className="mt-2 space-y-2 max-h-60 overflow-y-auto pr-2" style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#475569 #1e293b'
            }}>
              {selectedNode.parents.map((parentId) => (
                <div
                  key={parentId}
                  className="bg-slate-800/50 rounded-lg p-3 font-mono text-xs text-slate-300 truncate border border-slate-700/30 hover:bg-slate-700/50 transition-colors duration-200"
                  title={parentId}
                >
                  {truncateAssetId(parentId, 20)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Children */}
        {selectedNode.children.length > 0 && (
          <div>
            <label className="text-slate-400 text-xs uppercase tracking-wider font-semibold">
              Children ({selectedNode.children.length})
            </label>
            <div className="mt-2 space-y-2 max-h-60 overflow-y-auto pr-2" style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#475569 #1e293b'
            }}>
              {selectedNode.children.map((childId) => (
                <div
                  key={childId}
                  className="bg-slate-800/50 rounded-lg p-3 font-mono text-xs text-slate-300 truncate border border-slate-700/30 hover:bg-slate-700/50 transition-colors duration-200"
                  title={childId}
                >
                  {truncateAssetId(childId, 20)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
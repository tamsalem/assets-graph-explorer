import type { ParseResult } from '../utils/csv';
import type { Island } from '../utils/graph';

interface GraphToolbarProps {
  onBack: () => void;
  nodeCount: number;
  edgeCount: number;
  islandCount: number;
  longestIsland: Island | null;
  searchQuery: string;
  onSearch: (query: string) => void;
  layout: 'dagre' | 'fcose';
  onLayoutChange: (layout: 'dagre' | 'fcose') => void;
  selectedType: string;
  onTypeChange: (type: string) => void;
  parseResult: ParseResult;
  graphDataNodes: Map<string, any>;
  labelMode: 'both' | 'category' | 'assetId';
  onLabelModeChange: (mode: 'both' | 'category' | 'assetId') => void;
  showLabels: boolean;
  onToggleLabels: () => void;
  onFitView: () => void;
  onZoomToLongestIsland: () => void;
}

export const GraphToolbar = ({
  onBack,
  nodeCount,
  edgeCount,
  islandCount,
  longestIsland,
  searchQuery,
  onSearch,
  layout,
  onLayoutChange,
  selectedType,
  onTypeChange,
  parseResult,
  graphDataNodes,
  labelMode,
  onLabelModeChange,
  showLabels,
  onToggleLabels,
  onFitView,
  onZoomToLongestIsland,
}: GraphToolbarProps) => {
  return (
    <div className="bg-slate-900/95 backdrop-blur-md border-b border-slate-700/50 px-4 py-3 flex flex-col gap-3 shadow-xl z-20">
      {/* Top Row: Navigation & Stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-slate-300 hover:text-white hover:bg-slate-800/50 px-3 py-1.5 rounded-lg transition-all duration-200 group"
            title="Back to upload"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="font-medium">Back</span>
          </button>
          
          <div className="h-6 w-px bg-slate-700/50" />
          
          <div className="flex items-center space-x-3 text-sm">
            <div className="flex items-center space-x-2 text-slate-400 bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700/30">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span>{nodeCount} nodes</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-400 bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700/30">
              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
              <span>{edgeCount} edges</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-400 bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700/30">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>{islandCount} islands</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Search */}
          <div className="relative group">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Search node ID..."
              className="bg-slate-800/50 border border-slate-600/50 rounded-lg px-4 py-1.5 pl-9 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64 text-sm transition-all duration-200 group-hover:bg-slate-800"
            />
            <svg
              className="absolute left-3 top-2 w-4 h-4 text-slate-500 group-hover:text-slate-400 transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Bottom Row: Controls */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800/50">
        <div className="flex items-center space-x-4">
          {/* View Controls Group */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">View</span>
            <select
              value={layout}
              onChange={(e) => onLayoutChange(e.target.value as 'dagre' | 'fcose')}
              className="bg-slate-800/50 border border-slate-600/50 rounded-md px-3 py-1 text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer hover:bg-slate-800"
            >
              <option value="dagre">Hierarchical (Dagre)</option>
              <option value="fcose">Force-Directed (fCoSE)</option>
            </select>

            <select
              value={labelMode}
              onChange={(e) => onLabelModeChange(e.target.value as any)}
              className="bg-slate-800/50 border border-slate-600/50 rounded-md px-3 py-1 text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer hover:bg-slate-800"
            >
              <option value="both">Labels: Type + ID</option>
              <option value="category">Labels: Type Only</option>
              <option value="assetId">Labels: ID Only</option>
            </select>

            <button
              onClick={onToggleLabels}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
                showLabels
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'bg-slate-800/50 text-slate-400 border border-slate-600/50 hover:bg-slate-800'
              }`}
            >
              {showLabels ? 'Labels On' : 'Labels Off'}
            </button>
          </div>

          <div className="h-4 w-px bg-slate-700/50" />

          {/* Filter Group */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Filter</span>
            <select
              value={selectedType}
              onChange={(e) => onTypeChange(e.target.value)}
              className="bg-slate-800/50 border border-slate-600/50 rounded-md px-3 py-1 text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer hover:bg-slate-800 max-w-[200px]"
            >
              <option value="all">All Types ({graphDataNodes.size})</option>
              {Array.from(parseResult.types).sort().map((type) => {
                const count = Array.from(graphDataNodes.values()).filter((n: any) => n.type === type).length;
                if (count === 0) return null;
                return (
                  <option key={type} value={type}>
                    {type} ({count})
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Actions Group */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onFitView}
            className="flex items-center space-x-1.5 px-3 py-1 bg-slate-800/50 border border-slate-600/50 rounded-md text-slate-300 hover:bg-slate-700 hover:text-white transition-all duration-200 text-xs font-medium"
            title="Fit all nodes in view"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
            <span>Fit View</span>
          </button>

          {longestIsland && longestIsland.size > 1 && (
            <button
              onClick={onZoomToLongestIsland}
              className="flex items-center space-x-1.5 px-3 py-1 bg-emerald-900/30 border border-emerald-700/50 rounded-md text-emerald-400 hover:bg-emerald-900/50 hover:text-emerald-300 transition-all duration-200 text-xs font-medium"
              title={`Zoom to longest island (${longestIsland.size} nodes)`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
              <span>Focus Largest ({longestIsland.size})</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
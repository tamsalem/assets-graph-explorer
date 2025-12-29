import { useState, useRef } from 'react';
import type { ChangeEvent } from 'react';
import { parseCSV, parseStartingNodes } from '../utils/csv';
import type { ParseResult } from '../utils/csv';

interface LandingPageProps {
  onLoadGraph: (parseResult: ParseResult, startingNodes: string[]) => void;
}

export const LandingPage = ({ onLoadGraph }: LandingPageProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [startingNodesInput, setStartingNodesInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
      setError('Please select a valid CSV file');
      return;
    }
    setFile(selectedFile);
    setError(null);
    setParseResult(null);
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleLoadGraph = async () => {
    if (!file) {
      setError('Please select a CSV file');
      return;
    }

    if (!startingNodesInput.trim()) {
      setError('Please provide at least one starting node ID');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await parseCSV(file);
      setParseResult(result);

      const startingNodes = parseStartingNodes(startingNodesInput);
      
      // All starting nodes will be included, even if not in CSV
      // They will appear as isolated islands with "Unknown" category
      onLoadGraph(result, startingNodes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse CSV file');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-10 animate-fade-in">
          <div className="inline-block mb-4">
            <svg className="w-20 h-20 mx-auto text-blue-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h1 className="text-4xl font-extrabold mb-4 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient">
            Graph Explorer
          </h1>
          <p className="text-slate-400 text-xl font-medium">
            Visualize complex asset relationships with interactive graphs
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-2xl p-8 space-y-3 animate-slide-up">
          {/* File Upload */}
          <div>
            <label className="block text-slate-200 font-bold mb-3 text-lg flex items-center">
              <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm mr-3 shadow-lg">1</span>
              Upload CSV File
            </label>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 transform ${
                isDragging
                  ? 'border-blue-500 bg-blue-500/10 scale-105 shadow-lg shadow-blue-500/20'
                  : 'border-slate-600/50 hover:border-blue-500/50 hover:bg-blue-500/5 hover:scale-102'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileInputChange}
                className="hidden"
              />
              <div className="space-y-3">
                <svg
                  className={`mx-auto h-14 w-14 transition-colors duration-300 ${
                    isDragging ? 'text-blue-400' : 'text-slate-500'
                  }`}
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {file ? (
                  <div className="animate-fade-in">
                    <p className="text-blue-400 font-semibold text-lg">{file.name}</p>
                    <p className="text-slate-400 text-sm mt-1">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-slate-200 font-medium text-lg">
                      Drag & drop your CSV file here
                    </p>
                    <p className="text-slate-400 text-sm mt-2">
                      or click to browse
                    </p>
                    <p className="text-slate-500 text-xs mt-3 font-mono">
                      Format: assetId, parentAssetId, assetType, parentAssetType
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Starting Nodes Input */}
          <div>
            <label className="block text-slate-200 font-bold mb-3 text-lg flex items-center">
              <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm mr-3 shadow-lg">2</span>
              Enter Starting Node IDs
            </label>
            <textarea
              value={startingNodesInput}
              onChange={(e) => setStartingNodesInput(e.target.value)}
              placeholder="Enter asset IDs (comma or newline separated)&#10;Example:&#10;8b3a98c8d30b39a8c9432055f9d6652b988375707ac5327ed04d29ac2bd1cc55&#10;240d42a2c1e3b0943968d9fb00d82e9069ebe76ba18d2506e2b0673b41482dbc"
              className="w-full bg-slate-800/50 border border-slate-600/50 rounded-lg p-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm transition-all duration-200 hover:border-slate-500"
              rows={4}
            />
            <p className="text-slate-400 text-xs mt-2 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Separate multiple IDs with commas or newlines
            </p>
          </div>

          {/* Parse Summary */}
          {parseResult && (
            <div className="bg-slate-800/50 border border-slate-700/30 rounded-lg p-5 animate-fade-in">
              <h3 className="text-slate-200 font-bold mb-4 text-lg flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Parse Summary
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-slate-900/50 rounded-lg p-3">
                  <span className="text-slate-400 text-xs uppercase tracking-wide">Total Rows</span>
                  <div className="text-slate-200 font-bold text-xl mt-1">
                    {parseResult.totalRows}
                  </div>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-3">
                  <span className="text-slate-400 text-xs uppercase tracking-wide">Unique Nodes</span>
                  <div className="text-slate-200 font-bold text-xl mt-1">
                    {parseResult.uniqueNodes}
                  </div>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-3">
                  <span className="text-slate-400 text-xs uppercase tracking-wide">Unique Edges</span>
                  <div className="text-slate-200 font-bold text-xl mt-1">
                    {parseResult.uniqueEdges}
                  </div>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-3">
                  <span className="text-slate-400 text-xs uppercase tracking-wide">Invalid Rows</span>
                  <div className={`font-bold text-xl mt-1 ${parseResult.invalidRows > 0 ? 'text-yellow-400' : 'text-green-400'}`}>
                    {parseResult.invalidRows}
                  </div>
                </div>
                <div className="col-span-2 bg-slate-900/50 rounded-lg p-3">
                  <span className="text-slate-400 text-xs uppercase tracking-wide block mb-2">Asset Types</span>
                  <div className="text-slate-200 font-medium text-sm">
                    {Array.from(parseResult.types).join(', ')}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 animate-shake">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-400 text-sm font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Load Button */}
          <button
            onClick={handleLoadGraph}
            disabled={isLoading || !file || !startingNodesInput.trim()}
            className="w-full bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 hover:from-blue-600 hover:via-purple-700 hover:to-pink-700 disabled:from-slate-700 disabled:to-slate-800 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-xl hover:shadow-2xl disabled:shadow-none disabled:opacity-50 text-lg"
          >
            {isLoading ? (
              <span className="flex items-center justify-center animate-pulse">
                <svg
                  className="animate-spin -ml-1 mr-3 h-6 w-6 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span className="font-bold">Loading Graph...</span>
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Load Graph
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
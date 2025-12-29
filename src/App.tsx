import { useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { GraphView } from './components/GraphView';
import type { ParseResult } from './utils/csv';

function App() {
  const [graphData, setGraphData] = useState<{
    parseResult: ParseResult;
    startingNodes: string[];
  } | null>(null);

  const handleLoadGraph = (parseResult: ParseResult, startingNodes: string[]) => {
    setGraphData({ parseResult, startingNodes });
  };

  const handleBack = () => {
    setGraphData(null);
  };

  return (
    <>
      {graphData ? (
        <GraphView
          parseResult={graphData.parseResult}
          startingNodes={graphData.startingNodes}
          onBack={handleBack}
        />
      ) : (
        <LandingPage onLoadGraph={handleLoadGraph} />
      )}
    </>
  );
}

export default App;

declare module 'react-cytoscapejs' {
  import { Component } from 'react';
  import type { Core, ElementDefinition, Stylesheet, LayoutOptions } from 'cytoscape';

  interface CytoscapeComponentProps {
    elements: ElementDefinition[];
    style?: React.CSSProperties;
    stylesheet?: Stylesheet[];
    layout?: LayoutOptions;
    cy?: (cy: Core) => void;
    className?: string;
  }

  export default class CytoscapeComponent extends Component<CytoscapeComponentProps> {}
}
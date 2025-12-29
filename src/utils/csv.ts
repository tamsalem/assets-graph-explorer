import Papa from 'papaparse';

export interface CSVRow {
  assetId: string;
  parentAssetId: string;
  assetType: string;
  parentAssetType: string;
}

export interface ParseResult {
  data: CSVRow[];
  totalRows: number;
  uniqueNodes: number;
  uniqueEdges: number;
  invalidRows: number;
  types: Set<string>;
}

export const parseCSV = (file: File): Promise<ParseResult> => {
  return new Promise((resolve, reject) => {
    Papa.parse<CSVRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const validRows: CSVRow[] = [];
        const nodeSet = new Set<string>();
        const edgeSet = new Set<string>();
        const types = new Set<string>();
        let invalidRows = 0;

        results.data.forEach((row) => {
          // Validate row has required fields
          if (row.assetId && row.parentAssetId && row.assetType && row.parentAssetType) {
            validRows.push(row);
            nodeSet.add(row.assetId);
            nodeSet.add(row.parentAssetId);
            edgeSet.add(`${row.assetId}->${row.parentAssetId}`);
            types.add(row.assetType);
            types.add(row.parentAssetType);
          } else {
            invalidRows++;
          }
        });

        resolve({
          data: validRows,
          totalRows: results.data.length,
          uniqueNodes: nodeSet.size,
          uniqueEdges: edgeSet.size,
          invalidRows,
          types,
        });
      },
      error: (error) => {
        reject(error);
      },
    });
  });
};

export const parseStartingNodes = (input: string): string[] => {
  return input
    .split(/[\n,]/)
    .map((id) => id.trim())
    .filter((id) => id.length > 0);
};
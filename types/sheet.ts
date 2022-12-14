export type Cell = {
  value: string;
  id: string;
  row: number;
  column: string;
  isEditing: boolean;
  hasError: boolean;
  dependencyError?: string;
  dependencies: string[];
  dependents: string[];
  evaluated: null | any;
};

export type Row = {
  index: number;
  cells: Cell[];
};

export type Sheet = {
  owner: string;
  rows: Row[];
  continuous: boolean;
  columns: {
    width: number;
  }[];
  name: string;
  id: string;
};

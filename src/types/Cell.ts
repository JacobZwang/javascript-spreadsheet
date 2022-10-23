type Cell = {
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

export default Cell;

import { CAPITAL_ALPHABET } from "~~/utils/alphabet";

export function createDefaultSheet() {
  return {
    name: "Unnamed Sheet",
    rows: Array.from({ length: 20 }, (_, i) => ({
      index: i,
      cells: Array.from({ length: 20 }, (_, j) => ({
        value: "",
        id: CAPITAL_ALPHABET[j] + i,
        row: i,
        column: CAPITAL_ALPHABET[j],
        isEditing: false,
        hasError: false,
        dependencyError: undefined,
        dependencies: [],
        dependents: [],
        evaluated: null,
      })),
    })),
    columns: Array.from({ length: 21 }, () => ({
      width: 250,
    })),
    /** determines if app should recompute values every frame */
    continuous: false,
  };
}

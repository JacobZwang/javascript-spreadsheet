type CellProxy = {
  setFromValue(any: any): void;
  setFromString(str: string): void;
};

declare interface Window {
  sheet: {
    rows(): CellProxy[][];
    update(): void;
  };
}

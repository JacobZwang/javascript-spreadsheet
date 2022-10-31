import mongoose from "mongoose";
import { Sheet } from "~~/types/sheet";

// TODO : something like the below for cleaner type defs
// type IntoConstructors<T> = {
//   [P in keyof T]: T[P] extends boolean ? Boolean : T[P];
// }
// type SheetSchema = IntoConstructors<Sheet>

type U = unknown;

const schema = new mongoose.Schema(
  <Sheet>{
    columns: [{ width: Number as U as number }],
    continuous: Boolean as U as boolean,
    id: String as U as string,
    name: String as U as string,
    owner: String as U as string,
    rows: [
      {
        cells: [
          {
            column: String as U as string,
            dependencies: [String as U as string],
            dependents: [String as U as string],
            evaluated: String as U as string,
            hasError: Boolean as U as boolean,
            isEditing: Boolean as U as boolean,
            row: Number as U as number,
            value: String as U as string,
            dependencyError: String as U as string,
            id: String as U as string,
          },
        ],
        index: Number as U as number,
      },
    ],
  },
  { timestamps: true, strict: true, strictQuery: true }
);

export default mongoose.model("Sheet", schema, "sheet");

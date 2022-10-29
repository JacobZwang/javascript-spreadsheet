<script lang="ts" setup>
import intoCode from "@/utils/intoCode";
import { onMounted, onUpdated, reactive, ref } from "vue";
import SheetCell from "@/components/sheet/SheetCell.vue";
import { useDebugStore } from "@/stores/options";
import type { Row } from "@/types/sheet";
import { CAPITAL_ALPHABET } from "@/utils/alphabet";

const props = defineProps<{
  /** used for identifying sheet in local storage */
  id: string;
}>();

const debug = useDebugStore();

/** stores the values of the expressions and the saved visual state of the table */
const state = reactive<{
  rows: Row[];
  continuous: boolean;
  columns: {
    width: number;
  }[];
}>({
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
});

// keep track of if the sheet it already looping to ensure we don't have multiple loops
const looping = ref(false);

function getCell(id: string) {
  const column = id[0];
  const row = parseInt(id.slice(1));

  return state.rows[row].cells[CAPITAL_ALPHABET.indexOf(column)];
}

/** saves the sheet to local storage */
function save() {
  localStorage.setItem(
    `sheet-${props.id}`,
    JSON.stringify({
      rows: state.rows,
    })
  );
}

/** loads the sheet from local storage */
function load() {
  const raw = localStorage.getItem(`sheet-${props.id}`);
  if (!raw) return;
  let saved;
  try {
    saved = JSON.parse(raw);
  } catch {
    return;
  }

  if (saved) {
    state.rows = saved.rows;
  }
}

/** reruns all logic and updates the state of the sheet */
function tick() {
  updateDependencies();

  // if continuous mode is enabled, recompute every frame
  if (state.continuous && !looping.value) {
    looping.value = true;

    const loop = () => {
      if (!state.continuous) return;
      updateDependencies();
      requestAnimationFrame(loop);
    };

    loop();
  }
}

/** updates each cells dependencies */
function updateDependencies() {
  // reset computed values of cell
  state.rows.forEach((row) => {
    row.cells.forEach((cell) => {
      cell.dependencies = [];
      cell.dependents = [];
      cell.evaluated = null;
      cell.dependencyError = undefined;
    });
  });

  state.rows.forEach((row) => {
    row.cells.forEach((cell) => {
      // check if has any dependencies
      const matches = cell.value.match(/[A-Z]+\d+/g);

      // add dependencies to cell
      if (matches) {
        matches.forEach((match) => {
          const column = match[0];
          const row = parseInt(match.slice(1));

          state.rows[row].cells[
            CAPITAL_ALPHABET.indexOf(column)
          ].dependents.push(cell.id);

          cell.dependencies.push(
            state.rows[row].cells[CAPITAL_ALPHABET.indexOf(column)].id
          );
        });
      }
    });
  });

  // evaluate each cell
  // TODO: cache values that can be
  let evaluated = [];
  let todo = state.rows.map((r) => r.cells).flat();
  let count = 0; // TODO: detect infinite loops so that max iterations isn't needed
  while (todo.length && count < 10000) {
    count++;

    const next = todo.shift()!;

    if (next.dependencies.some((d) => getCell(d).evaluated === null)) {
      todo.push(next);
    } else {
      // check if any dependencies have errors
      const error = next.dependencies.find(
        (d) => getCell(d).hasError || getCell(d).dependencyError
      );

      if (error) {
        // show which cell has error in evaluated instead of displaying it's own error
        next.evaluated =
          getCell(error).dependencyError || `Error in dependency ${error}`;
        next.dependencyError = next.evaluated;
      } else {
        // attempt to evaluate cell expression
        try {
          if (next.value) {
            next.evaluated = eval("(" + next.value + ")");
          }

          next.hasError = false;
        } catch (e) {
          // mark cell as having error so other cells will know
          const error = e as Error;
          next.evaluated = error?.message ?? "Unknown Error";
          next.hasError = true;
        }
      }

      // @ts-expect-error: typescript will hate this,
      // but it's necessary for cell global variables in the eval
      window[next.id] = next.evaluated;

      evaluated.push(next);
    }
  }

  save();
}

onMounted(() => {
  // exposes api methods to global window object.
  // useful for settings cell values in bulk
  // @ts-expect-error: typescript won't let you use method
  // and string indexing so it's impossible to type this
  window.sheet = {
    update() {
      tick();
    },
    // so you can do something like
    // window.sheet.rows().flat().forEach((cell, i) => cell.setFromValue({num: i}))
    rows() {
      return state.rows.map((row) =>
        row.cells.map((c) => ({
          setFromValue(any: any) {
            c.value = intoCode(any);
          },
          setFromString(any: string) {
            c.value = any;
          },
        }))
      );
    },
  };

  // the first column is the row indexes so it should be smaller
  state.columns[0].width = 50;

  load(); // load from local storage

  // compute initial values
  updateDependencies();
  tick();

  // expose rows and columns as indexes on the window object
  state.rows.forEach((r, i) => {
    r.cells.forEach((c) => {
      const row = new Array(20) as string[];
      window.sheet[c.column] ??= row; // so you can do window.sheet["A"][0]
      window.sheet[i] ??= window.sheet[c.column]; // so you can do window.sheet[0][0]

      // so that we can set values like window.sheet[0][0] = {message: "Hello world!"}
      Object.defineProperty(window.sheet[c.column], c.row, {
        get: () => c.evaluated,
        set: (value) => {
          c.value = intoCode(value);
          updateDependencies();
        },
      });
    });
  });
});

onUpdated(() => {
  if (!state.continuous) looping.value = false;
});
</script>

<template>
  <div class="flex items-center justify-center p-4 gap-8">
    <div class="inline-flex text-sm whitespace-nowrap gap-4 items-center">
      <input type="checkbox" v-model="state.continuous" />
      <p>continuous refresh</p>
    </div>
    <div class="inline-flex text-sm whitespace-nowrap gap-4 items-center">
      <input type="checkbox" v-model="debug.showDebug" />
      <p>show debug info</p>
    </div>
  </div>

  <div
    class="grid"
    :style="{
      gridTemplateColumns: state.columns.map((c) => c.width + 'px').join(' '),
    }"
    v-for="row in state.rows"
    :key="row.index"
  >
    <!-- row indexes -->
    <div
      class="text-center input !bg-gray-700 mt-auto"
      :class="{
        'h-full': debug.showDebug,
      }"
    >
      {{ row.index }}
    </div>

    <div v-for="cell in row.cells" :key="cell.column">
      <!-- column headers -->
      <div v-if="cell.row === 0" class="text-center input !bg-gray-800">
        {{ cell.column }}
      </div>

      <!-- the cell input and display -->
      <!-- when blurred it triggers an update to recompute the sheet -->
      <SheetCell :cell="cell" @update="tick" />

      <!-- show json output of cell if debug mode on -->
      <div v-if="debug.showDebug" class="text-xs whitespace-pre-wrap">
        {{ JSON.stringify(cell, null, 4) }}
      </div>
    </div>
  </div>
</template>

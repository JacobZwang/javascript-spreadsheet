<script lang="ts" setup>
import intoCode from "~/utils/intoCode";
import { onMounted, onUpdated, reactive, ref, watch } from "vue";
import { useDebugStore } from "~/stores/options";
import type { Row, Sheet } from "~/types/sheet";
import { CAPITAL_ALPHABET } from "~/utils/alphabet";
import type { UserSession } from "~/types/session";

const props = defineProps<{
  /** used for identifying sheet in local storage */
  sheet: Sheet;
  id: string;
}>();

const debug = useDebugStore();

const session = inject("session") as UserSession;

/** stores the values of the expressions and the saved visual state of the table */
const state = reactive<Sheet>(props.sheet);

// the first column is the row indexes so it should be smaller
state.columns[0].width = 50;

// keep track of if the sheet it already looping to ensure we don't have multiple loops
const looping = ref(false);

function getCell(id: string) {
  const column = id[0];
  const row = parseInt(id.slice(1));

  return state.rows[row].cells[CAPITAL_ALPHABET.indexOf(column)];
}

/** saves the sheet to local storage */
function saveLocal() {
  localStorage.setItem(
    `sheet-${props.id}`,
    JSON.stringify({
      rows: state.rows,
    })
  );
}

function saveCloud() {
  fetch("/api/sheets/" + props.id, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...state,
    }),
  });
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

      window[next.id] = next.evaluated;

      evaluated.push(next);
    }
  }

  saveLocal();
}

onMounted(() => {
  // exposes api methods to global window object.
  // useful for settings cell values in bulk
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

  if (!props.sheet) load(); // load from local storage

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

watch(state, () => {
  if (!looping.value && state.continuous) tick();
});
</script>

<template>
  <Teleport to="#menu-portal">
    <button
      class="btn btn-sm btn-primary"
      @click="saveCloud"
      :class="{ 'btn-disabled': state.owner !== session?.user?.id }"
    >
      save
    </button>
    <label class="inline-flex text-sm whitespace-nowrap gap-4 items-center">
      <input
        type="checkbox"
        class="checkbox checkbox-sm"
        v-model="state.continuous"
      />
      <p>continuous refresh</p>
    </label>
    <label class="inline-flex text-sm whitespace-nowrap gap-4 items-center">
      <input
        type="checkbox"
        class="checkbox checkbox-sm"
        v-model="debug.showDebug"
      />
      <p>show debug info</p>
    </label>
  </Teleport>

  <div class="w-screen h-full overflow-scroll">
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
        class="text-center sheet-input !bg-gray-700 mt-auto"
        :class="{
          'h-full': debug.showDebug,
        }"
      >
        {{ row.index }}
      </div>

      <div v-for="cell in row.cells" :key="cell.column">
        <!-- column headers -->
        <div v-if="cell.row === 0" class="text-center sheet-input !bg-gray-800">
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
  </div>
</template>

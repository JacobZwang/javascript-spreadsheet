<script lang="ts" setup>
import { onMounted, onUpdated, reactive, ref } from "vue";
import Cell from "../components/SheetCell.vue";

const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const showDebug = ref(false);
const continuous = ref(true);
const looping = ref(false);
const postScript = ref("");

const state = reactive({
  rows: Array.from({ length: 20 }, (_, i) => ({
    index: i,
    cells: Array.from({ length: 20 }, (_, j) => ({
      value: "",
      id: letters[j] + i,
      row: i,
      column: letters[j],
      isEditing: false,
      hasError: false,
      dependencyError: undefined,
      dependencies: [],
      dependents: [],
      evaluated: null,
    })),
  })),
});

const columns = reactive(
  Array.from({ length: 21 }, () => ({
    width: 250,
  }))
);

function getCell(id: string) {
  const column = id[0];
  const row = parseInt(id.slice(1));

  return state.rows[row].cells[letters.indexOf(column)];
}

function save() {
  localStorage.setItem("sheet", JSON.stringify(state.rows));
}

function load() {
  const raw = localStorage.getItem("sheet");
  if (!raw) return;
  let saved;
  try {
    saved = JSON.parse(raw);
  } catch {
    return;
  }

  if (saved) {
    state.rows = saved;
  }
}

function tick() {
  updateDependencies();

  if (continuous.value && !looping.value) {
    looping.value = true;

    const loop = () => {
      if (!continuous.value) return;
      updateDependencies();
      requestAnimationFrame(loop);
    };

    loop();
  }
}

function updateDependencies() {
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
      const matches = cell.value.match(/[A-Z]+\d+/g);

      if (matches) {
        matches.forEach((match) => {
          const column = match[0];
          const row = parseInt(match.slice(1));

          state.rows[row].cells[letters.indexOf(column)].dependents.push(
            cell.id
          );

          cell.dependencies.push(
            state.rows[row].cells[letters.indexOf(column)].id
          );
        });
      }
    });
  });

  let evaluated = [];
  let todo = state.rows.map((r) => r.cells).flat();

  let count = 0; // TODO: detect infinite loops so that max iterations isn't needed
  while (todo.length && count < 10000) {
    count++;

    const next = todo.shift();

    if (next.dependencies.some((d) => getCell(d).evaluated === null)) {
      todo.push(next);
    } else {
      const error = next.dependencies.find(
        (d) => getCell(d).hasError || getCell(d).dependencyError
      );

      if (error) {
        next.evaluated =
          getCell(error).dependencyError || `Error in dependency ${error}`;

        next.dependencyError = next.evaluated;
      } else {
        try {
          if (next.value) {
            next.evaluated = eval("(" + next.value + ")");
          }

          next.hasError = false;
        } catch (e) {
          next.evaluated = e.message;
          next.hasError = true;
        }
      }

      window[next.id] = next.evaluated;
      evaluated.push(next);
    }
  }

  save();
}

onMounted(() => {
  window.sheet = {};

  columns[0].width = 50;
  load();
  updateDependencies();
  tick();

  state.rows.forEach((r) => {
    r.cells.forEach((c) => {
      window.sheet[c.column] ??= new Array(20);

      Object.defineProperty(window.sheet[c.column], c.row, {
        get: () => c.evaluated,
        set: (value) => {
          c.value = value;
          updateDependencies();
        },
      });
    });
  });
});

onUpdated(() => {
  tick();
  if (!continuous.value) looping.value = false;
});
</script>

<template>
  <div class="flex items-center justify-center p-4">
    <div class="inline-flex text-sm whitespace-nowrap gap-4 items-center">
      <input type="checkbox" v-model="continuous" />
      <p>continuous refresh</p>
    </div>
  </div>

  <div
    class="grid"
    :style="{
      gridTemplateColumns: columns.map((c) => c.width + 'px').join(' '),
    }"
    v-for="row in state.rows"
    :key="row.index"
  >
    <div class="text-center input !bg-gray-700 mt-auto">
      {{ row.index }}
    </div>

    <div v-for="cell in row.cells" :key="cell.column">
      <div v-if="cell.row === 0" class="text-center input !bg-gray-800">
        {{ cell.column }}
      </div>

      <Cell :cell="cell" @update="tick" />
    </div>
  </div>

  <div>
    <textarea name="" id="" cols="30" rows="10" :value="postScript"> </textarea>
  </div>

  <div v-if="showDebug">
    <div
      class="grid"
      :style="{
        gridTemplateColumns: columns.map((c) => c.width + 'px').join(' '),
      }"
      v-for="row in state.rows"
      :key="row.index"
    >
      <div v-for="cell in row.cells" :key="cell.column" class="mb-2 px-1">
        <div class="text-xs whitespace-pre-wrap">
          {{ JSON.stringify(cell, null, 4) }}
        </div>
      </div>
    </div>
  </div>
</template>

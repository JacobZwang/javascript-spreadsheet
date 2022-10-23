<script lang="ts">
import Cell from "../components/SheetCell.vue";

const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export default {
  data() {
    return {
      showDebug: false,
      columns: Array.from({ length: 20 }, () => ({
        width: 250,
      })),
      rows: Array.from({ length: 20 }, (_, i) => ({
        index: i,
        cells: Array.from({ length: 20 }, (_, j) => ({
          value: "",
          id: letters[j] + i,
          column: letters[j],
          isEditing: false,
          hasError: false,
          dependencyError: undefined,
          dependencies: [],
          dependents: [],
          evaluated: null,
        })),
      })),
    };
  },
  components: { Cell },
  methods: {
    getCell(id) {
      const column = id[0];
      const row = parseInt(id.slice(1));

      return this.rows[row].cells[letters.indexOf(column)];
    },

    updateDependencies() {
      this.rows.forEach((row) => {
        row.cells.forEach((cell) => {
          cell.dependencies = [];
          cell.dependents = [];
          cell.evaluated = null;
          cell.dependencyError = undefined;
        });
      });

      this.rows.forEach((row) => {
        row.cells.forEach((cell) => {
          const matches = cell.value.match(/[A-Z]+\d+/g);

          if (matches) {
            matches.forEach((match) => {
              const column = match[0];
              const row = parseInt(match.slice(1));

              this.rows[row].cells[letters.indexOf(column)].dependents.push(
                cell.id
              );

              cell.dependencies.push(
                this.rows[row].cells[letters.indexOf(column)].id
              );
            });
          }
        });
      });

      let evaluated = [];
      let todo = this.rows.map((r) => r.cells).flat();

      let count = 0; // TODO: detect infinite loops so that max iterations isn't needed
      while (todo.length && count < 10000) {
        count++;

        const next = todo.shift();

        if (next.dependencies.some((d) => this.getCell(d).evaluated === null)) {
          todo.push(next);
        } else {
          const error = next.dependencies.find(
            (d) => this.getCell(d).hasError || this.getCell(d).dependencyError
          );

          if (error) {
            next.evaluated =
              this.getCell(error).dependencyError ||
              `Error in dependency ${error}`;

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
    },
  },
};
</script>

<template>
  <div
    class="grid"
    :style="{
      gridTemplateColumns: columns.map((c) => c.width + 'px').join(' '),
    }"
    v-for="row in rows"
    :key="row.index"
  >
    <div v-for="cell in row.cells" :key="cell.column">
      <Cell :cell="cell" @update="updateDependencies" />
    </div>
  </div>

  <div v-if="showDebug">
    <div
      class="grid"
      :style="{
        gridTemplateColumns: columns.map((c) => c.width + 'px').join(' '),
      }"
      v-for="row in rows"
      :key="row.index"
    >
      <div v-for="cell in row.cells" :key="cell.column" class="mb-2 px-1">
        <div
          v-for="[key, value] in Object.entries(cell)"
          class="text-xs"
          :key="key"
        >
          {{ key }}: {{ value }}
        </div>
      </div>
    </div>
  </div>
</template>

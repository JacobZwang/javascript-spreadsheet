<script lang="ts">
import Cell from "../components/SheetCell.vue";

export default {
  data() {
    return {
      columns: Array.from({ length: 20 }, () => ({
        width: 250,
      })),
      rows: Array.from({ length: 20 }, (_, i) => ({
        index: i,
        cells: Array.from({ length: 20 }, (_, j) => ({
          value: "",
          column: j,
          isEditing: false,
        })),
      })),
    };
  },
  components: { Cell },
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
      <Cell :cell="cell" />
    </div>
  </div>

  <div
    class="grid"
    :style="{
      gridTemplateColumns: columns.map((c) => c.width + 'px').join(' '),
    }"
    v-for="row in rows"
    :key="row.index"
  >
    <div v-for="cell in row.cells" :key="cell.column" class="mb-2">
      <div v-for="[key, value] in Object.entries(cell)" class="text-xs">
        {{ key }}: {{ value }}
      </div>
    </div>
  </div>
</template>

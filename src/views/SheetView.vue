<script lang="ts">
export default {
  data() {
    return {
      columns: Array.from({ length: 20 }, () => ({
        width: 150,
      })),
      rows: Array.from({ length: 20 }, (_, i) => ({
        index: i,
        cells: Array.from({ length: 20 }, (_, j) => ({
          value: "",
          column: j,
        })),
      })),
    };
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
      <input v-model="cell.value" />
    </div>
  </div>
</template>

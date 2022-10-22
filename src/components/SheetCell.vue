<script lang="ts">
export default {
  props: ["cell"],
  data() {
    return {};
  },
};
</script>

<template>
  <input
    v-model="cell.value"
    @focus="() => (cell.isEditing = true)"
    @blur="() => (cell.isEditing = false)"
  />
</template>

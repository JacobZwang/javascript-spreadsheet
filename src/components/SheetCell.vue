<!-- eslint-disable vue/no-side-effects-in-computed-properties -->
<script lang="ts">
export default {
  props: ["cell"],
  updated() {
    if (this.cell.isEditing) {
      this.$refs.input?.focus();
    }
  },
  computed: {
    value() {
      let value = "";

      try {
        value = eval(this.cell.value);
        this.cell.hasError = false;
      } catch (e) {
        value = e.message;
        this.cell.hasError = true;
      }

      return value;
    },
  },
};
</script>

<template>
  <input
    v-if="cell.isEditing"
    v-model="cell.value"
    @blur="() => (cell.isEditing = false)"
    ref="input"
  />
  <input
    @focus="() => (cell.isEditing = true)"
    v-else
    :value="value"
    :class="{
      'bg-red-500/25': cell.hasError,
    }"
  />
</template>

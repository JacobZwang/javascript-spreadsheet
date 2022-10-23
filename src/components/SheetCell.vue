<!-- eslint-disable vue/no-side-effects-in-computed-properties -->
<script lang="ts">
export default {
  props: ["cell"],
  emits: ["update"],
  updated() {
    if (this.cell.isEditing) {
      this.$refs.input?.focus();
    }
  },
};
</script>

<template>
  <div class="grid swap">
    <input
      v-if="cell.isEditing"
      v-model="cell.value"
      @blur="
        () => {
          cell.isEditing = false;
          $emit('update');
        }
      "
      ref="input"
    />
    <input
      @focus="() => (cell.isEditing = true)"
      v-else
      :value="cell.evaluated"
      :class="{
        'bg-red-500/25': cell.hasError,
        'bg-orange-500/25': cell.dependencyError,
      }"
    />

    <div
      v-if="!cell.isEditing"
      class="text-xs text-right px-1 pointer-events-none text-gray-500"
    >
      {{ cell.value }}
    </div>
  </div>
</template>

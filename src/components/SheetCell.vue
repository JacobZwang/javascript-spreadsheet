<script lang="ts" setup>
import { computed, onUpdated, ref } from "vue";
import type Cell from "../types/Cell";

const props = defineProps<{
  cell: Cell;
}>();

const showId = ref(false);
const input = ref<null | HTMLInputElement>(null);

onUpdated(() => {
  if (props.cell.isEditing) {
    input.value?.focus();
  }
});

const value = computed(() =>
  typeof props.cell.evaluated === "object" && props.cell.evaluated !== null
    ? JSON.stringify(props.cell.evaluated).replace(/"([^"]+)":/g, "$1:")
    : props.cell.evaluated
);
</script>

<template>
  <div class="grid swap overflow-hidden">
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
      :value="value"
      :class="{
        'bg-red-500/25': cell.hasError,
        'bg-orange-500/25': cell.dependencyError,
      }"
    />

    <div
      v-if="!cell.isEditing"
      class="text-xs text-right px-1 pointer-events-none text-gray-500 whitespace-nowrap"
    >
      {{ cell.value }}
    </div>

    <div
      v-if="showId"
      class="text-xs text-left px-1 pointer-events-none text-gray-500"
    >
      {{ cell.id }}
    </div>
  </div>
</template>

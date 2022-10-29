<script lang="ts" setup>
import { useDebugStore } from "~/stores/options";
import { computed, onUpdated, ref } from "vue";
import type { Cell } from "~/types/sheet";

const debug = useDebugStore();
const props = defineProps<{
  cell: Cell;
}>();

// we need a ref to this input so that we can focus it as explained below
const input = ref<null | HTMLInputElement>(null);

onUpdated(() => {
  // when the evaluated input is clicked, it goes away and is replaced by this input.
  // we need to focus this new input so that the user doesn't need to click again
  if (props.cell.isEditing) {
    input.value?.focus();
  }
});

// make json look prettier by removing quotes
const prettyEvaluated = computed(() =>
  typeof props.cell.evaluated === "object" && props.cell.evaluated !== null
    ? JSON.stringify(props.cell.evaluated).replace(/"([^"]+)":/g, "$1:")
    : props.cell.evaluated
);
</script>

<template>
  <div class="grid swap overflow-hidden">
    <!-- show input with raw source value when editing -->
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
    <!-- show an input with the computed value when not editing -->
    <input
      @focus="() => (cell.isEditing = true)"
      v-else
      :value="prettyEvaluated"
      :class="{
        'bg-red-500/25': cell.hasError,
        'bg-orange-500/25': cell.dependencyError,
      }"
    />
    <!-- show raw source value in upper right corner when not editing -->
    <div
      v-if="!cell.isEditing"
      class="text-xs text-right px-1 pointer-events-none text-gray-500 whitespace-nowrap"
    >
      {{ cell.value }}
    </div>
    <!-- show cell id name and number when in debug mode -->
    <div
      v-if="debug.showDebug"
      class="text-xs text-left px-1 pointer-events-none text-gray-500"
    >
      {{ cell.id }}
    </div>
  </div>
</template>

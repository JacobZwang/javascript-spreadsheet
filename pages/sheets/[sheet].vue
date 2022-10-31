<script lang="ts" setup>
import { Sheet } from "~~/types/sheet";

const route = useRoute();
const id = route.params.sheet as string;

const { data } = (await useFetch("/api/sheets/" + id, {
  headers: useRequestHeaders(["cookie"]),
})) as unknown as { data: Sheet };
</script>

<template>
  <div>
    <SheetRoot :sheet="data" :id="data.id" />
  </div>
</template>

import { defineStore } from "pinia";

export const useDebugStore = defineStore("debug", {
  state() {
    return {
      showDebug: false,
    };
  },
});

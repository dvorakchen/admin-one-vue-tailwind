import { defineStore } from "pinia";
import { ref } from "vue";

export const useLayoutStore = defineStore("layout-store", () => {
  const isAsideExpanded = ref(false);

  return {
    isAsideExpanded,
  };
});

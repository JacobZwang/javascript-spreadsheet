import { createRouter, createWebHistory } from "vue-router";
import Sheet from "../views/SheetView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: Sheet,
    },
  ],
});

export default router;

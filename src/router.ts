import { createRouter, createWebHashHistory } from "vue-router";
import Dashboard from "@/views/Dashboard.vue";
import HomePage from "@/views/HomePage.vue";
import Login from "./views/Login.vue";

const routes = [
  {
    path: "/login",
    component: Login,
  },
  {
    path: "/",
    redirect: "/home/dashboard",
  },
  {
    path: "/home",
    name: "home",
    component: HomePage,
    children: [
      {
        path: "",
        name: "redirect-to-dashboard",
        redirect: "/home/dashboard",
      },
      {
        path: "dashboard",
        name: "dashboard",
        component: Dashboard,
      },
      {
        path: "meme",
        name: "meme",
        component: () => import("@/views/Meme.vue"),
      },

      {
        path: "profile",
        name: "profile",
        component: () => import("@/views/Profile.vue"),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    return savedPosition || { top: 0 };
  },
});

const DEFAULT_TITLE = "D42X 后台管理";

router.afterEach((to) => {
  return (to.meta.title ? `${to.meta.title} - ` : "") + DEFAULT_TITLE;
});

export default router;

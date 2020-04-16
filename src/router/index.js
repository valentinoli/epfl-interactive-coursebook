import Vue from "vue";
import VueRouter from "vue-router";
const DEFAULT_TITLE = "EPFL Coursebook";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Home",
    component: () => import("../views/Home.vue")
  },
  {
    path: "/about",
    name: "About",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import("../views/About.vue")
  }
];

const router = new VueRouter({
  routes
});

router.afterEach(to => {
  Vue.nextTick(() => {
    document.title =
      to.path === "/" ? DEFAULT_TITLE : `${DEFAULT_TITLE} - ${to.name}`;
  });
});

export default router;

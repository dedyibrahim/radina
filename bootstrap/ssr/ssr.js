import { createSSRApp, h } from "vue";
import { renderToString } from "@vue/server-renderer";
import { createInertiaApp } from "@inertiajs/vue3";
import createServer from "@inertiajs/vue3/server";
async function resolvePageComponent(path, pages) {
  for (const p of Array.isArray(path) ? path : [path]) {
    const page = pages[p];
    if (typeof page === "undefined") {
      continue;
    }
    return typeof page === "function" ? page() : page;
  }
  throw new Error(`Page not found: ${path}`);
}
const appName = "Radina News";
createServer(
  (page) => createInertiaApp({
    page,
    render: renderToString,
    title: (title) => `${title} | ${appName}`,
    resolve: (name) => resolvePageComponent(`./Pages/${name}.vue`, /* @__PURE__ */ Object.assign({ "./Pages/Admin/Dashboard.vue": () => import("./assets/Dashboard-7Avdqj8h.js"), "./Pages/Admin/NewsManager.vue": () => import("./assets/NewsManager-e-tQy050.js"), "./Pages/News/About.vue": () => import("./assets/About-BR4QqSoe.js"), "./Pages/News/Archive.vue": () => import("./assets/Archive-CF08YE5o.js"), "./Pages/News/ArticleShow.vue": () => import("./assets/ArticleShow-D0CP4-Kp.js"), "./Pages/News/Home.vue": () => import("./assets/Home-C2MGhybb.js") })),
    setup({ App, props, plugin }) {
      return createSSRApp({ render: () => h(App, props) }).use(plugin);
    }
  })
);

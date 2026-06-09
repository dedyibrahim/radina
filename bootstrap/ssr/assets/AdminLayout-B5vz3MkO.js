import { ref, computed, watch, onBeforeUnmount, mergeProps, unref, withCtx, createTextVNode, createVNode, toDisplayString, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent, ssrRenderSlot, ssrRenderClass, ssrRenderAttr, ssrRenderList } from "vue/server-renderer";
import { usePage, Link } from "@inertiajs/vue3";
const _sfc_main = {
  __name: "AdminLayout",
  __ssrInlineRender: true,
  props: {
    activeSection: {
      type: String,
      default: "news"
    },
    isAdmin: Boolean
  },
  emits: ["navigate"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const page = usePage();
    const drawerOpen = ref(false);
    const desktopDrawerOpen = ref(true);
    const user = computed(() => {
      var _a;
      return ((_a = page.props.auth) == null ? void 0 : _a.user) || {};
    });
    const portal = computed(() => page.props.portal || {});
    const menuItems = computed(() => [
      {
        key: "news",
        label: props.isAdmin ? "Berita" : "Tulis Berita",
        description: props.isAdmin ? "Tulis dan kelola artikel" : "Kirim tulisan baru"
      },
      ...props.isAdmin ? [
        { key: "categories", label: "Kategori", description: "Atur kanal berita" },
        { key: "payments", label: "Pembayaran", description: "Honor dan withdrawal" },
        { key: "licenses", label: "Lisensi", description: "Kelola lisensi aplikasi" },
        { key: "users", label: "Pengguna", description: "Atur admin dan penulis" }
      ] : [
        { key: "earnings", label: "Pendapatan", description: "Saldo dan withdrawal" },
        { key: "bank", label: "Rekening", description: "Atur rekening pencairan" }
      ]
    ]);
    watch(drawerOpen, (isOpen) => {
      document.body.style.overflow = isOpen ? "hidden" : "";
    });
    onBeforeUnmount(() => {
      document.body.style.overflow = "";
    });
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b;
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: ["min-h-screen bg-slate-100 transition-[padding] duration-300", desktopDrawerOpen.value ? "lg:pl-72" : "lg:pl-0"]
      }, _attrs))}><header class="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur"><div class="flex min-h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8"><div class="flex min-w-0 items-center gap-3"><button type="button" class="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-slate-950 text-white hover:bg-blue-700" aria-label="Buka atau tutup menu dashboard"><svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M4 6h16M4 12h16M4 18h16"></path></svg></button><div class="min-w-0"><p class="truncate text-lg font-bold text-slate-950">Dashboard Radina News</p><p class="text-xs text-slate-500">${ssrInterpolate(__props.isAdmin ? "Administrator" : "Penulis")}</p></div></div><div class="flex items-center gap-2">`);
      _push(ssrRenderComponent(unref(Link), {
        href: "/",
        class: "rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-blue-700"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` Lihat Portal `);
          } else {
            return [
              createTextVNode(" Lihat Portal ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div></header><main class="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">`);
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</main>`);
      if (drawerOpen.value) {
        _push(`<div class="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden"></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<aside class="${ssrRenderClass([[
        drawerOpen.value ? "translate-x-0" : "-translate-x-full",
        desktopDrawerOpen.value ? "lg:translate-x-0" : "lg:-translate-x-full"
      ], "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-800 bg-slate-950 text-slate-300 shadow-2xl transition-transform duration-300"])}"><div class="flex items-center justify-between border-b border-white/10 p-5">`);
      _push(ssrRenderComponent(unref(Link), {
        href: "/",
        class: "flex items-center gap-3"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<img${ssrRenderAttr("src", portal.value.mark || portal.value.logo)}${ssrRenderAttr("alt", portal.value.name)} class="h-12 w-12 rounded-xl bg-white object-contain"${_scopeId}><div${_scopeId}><p class="font-bold text-white"${_scopeId}>${ssrInterpolate(portal.value.name)}</p><p class="text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-300"${_scopeId}>Management Panel</p></div>`);
          } else {
            return [
              createVNode("img", {
                src: portal.value.mark || portal.value.logo,
                alt: portal.value.name,
                class: "h-12 w-12 rounded-xl bg-white object-contain"
              }, null, 8, ["src", "alt"]),
              createVNode("div", null, [
                createVNode("p", { class: "font-bold text-white" }, toDisplayString(portal.value.name), 1),
                createVNode("p", { class: "text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-300" }, "Management Panel")
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<button type="button" class="text-slate-400 hover:text-white" aria-label="Tutup menu"><svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M6 6l12 12M18 6 6 18"></path></svg></button></div><nav class="flex-1 space-y-2 overflow-y-auto p-4"><!--[-->`);
      ssrRenderList(menuItems.value, (item) => {
        _push(`<button type="button" class="${ssrRenderClass([__props.activeSection === item.key ? "bg-blue-600 text-white shadow-lg shadow-blue-950/40" : "text-slate-300 hover:bg-white/5 hover:text-white", "w-full rounded-xl px-4 py-3 text-left transition"])}"><span class="block text-sm font-bold">${ssrInterpolate(item.label)}</span><span class="${ssrRenderClass([__props.activeSection === item.key ? "text-blue-100" : "text-slate-500", "mt-1 block text-xs"])}">${ssrInterpolate(item.description)}</span></button>`);
      });
      _push(`<!--]--></nav><div class="border-t border-white/10 p-4"><div class="rounded-xl bg-white/5 p-4"><div class="flex items-center gap-3"><span class="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-blue-600 font-bold text-white">${ssrInterpolate((_b = (_a = user.value.name) == null ? void 0 : _a.charAt(0)) == null ? void 0 : _b.toUpperCase())}</span><div class="min-w-0"><p class="truncate text-sm font-bold text-white">${ssrInterpolate(user.value.name)}</p><p class="truncate text-xs text-slate-400">${ssrInterpolate(user.value.email)}</p></div></div><div class="mt-3 flex items-center justify-between"><span class="rounded-full bg-blue-500/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-300">${ssrInterpolate(user.value.role === "admin" ? "Admin" : "Penulis")}</span><button type="button" class="text-xs font-semibold text-rose-300 hover:text-rose-200"> Keluar </button></div></div></div></aside></div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Layouts/AdminLayout.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  _sfc_main as _
};

import { withCtx, unref, createVNode, toDisplayString, openBlock, createBlock, Fragment, renderList, useSSRContext } from "vue";
import { ssrRenderComponent, ssrInterpolate, ssrRenderList } from "vue/server-renderer";
import { _ as _sfc_main$2 } from "./SeoHead-B3gH-eD3.js";
import { u as useNewsLocale, _ as _sfc_main$1 } from "./NewsLayout-DM3H2upC.js";
import "@inertiajs/vue3";
const _sfc_main = {
  __name: "About",
  __ssrInlineRender: true,
  props: {
    seo: Object,
    stats: Array
  },
  setup(__props) {
    const { t } = useNewsLocale();
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(_sfc_main$1, _attrs, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_sfc_main$2, { seo: __props.seo }, null, _parent2, _scopeId));
            _push2(`<section class="overflow-hidden rounded-2xl border border-slate-200 bg-white"${_scopeId}><div class="grid gap-8 p-6 sm:p-10 lg:grid-cols-[1fr_360px] lg:items-center"${_scopeId}><div${_scopeId}><span class="news-kicker"${_scopeId}>${ssrInterpolate(unref(t)("aboutNewsroom"))}</span><h1 class="mt-5 max-w-4xl text-4xl font-semibold leading-tight sm:text-5xl"${_scopeId}>${ssrInterpolate(unref(t)("aboutTitle"))}</h1><p class="mt-5 max-w-3xl text-base leading-8 text-slate-600"${_scopeId}>${ssrInterpolate(unref(t)("aboutDescription"))}</p></div><div class="grid grid-cols-3 gap-3 lg:grid-cols-1"${_scopeId}><!--[-->`);
            ssrRenderList(__props.stats, (item) => {
              _push2(`<div class="rounded-xl border border-blue-100 bg-blue-50/60 p-4 lg:flex lg:items-center lg:justify-between"${_scopeId}><p class="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500"${_scopeId}>${ssrInterpolate(item.label)}</p><p class="mt-2 text-3xl font-bold text-blue-800 lg:mt-0"${_scopeId}>${ssrInterpolate(item.value)}</p></div>`);
            });
            _push2(`<!--]--></div></div></section><section class="mt-8 grid gap-5 md:grid-cols-3"${_scopeId}><div class="rounded-2xl border border-slate-200 bg-white p-6"${_scopeId}><h2 class="text-2xl font-semibold"${_scopeId}>${ssrInterpolate(unref(t)("editorial"))}</h2><p class="mt-3 text-sm leading-7 text-slate-600"${_scopeId}>${ssrInterpolate(unref(t)("editorialDescription"))}</p></div><div class="rounded-2xl border border-slate-200 bg-white p-6"${_scopeId}><h2 class="text-2xl font-semibold"${_scopeId}>${ssrInterpolate(unref(t)("technology"))}</h2><p class="mt-3 text-sm leading-7 text-slate-600"${_scopeId}>${ssrInterpolate(unref(t)("technologyDescription"))}</p></div><div class="rounded-2xl border border-slate-200 bg-white p-6"${_scopeId}><h2 class="text-2xl font-semibold"${_scopeId}>${ssrInterpolate(unref(t)("seo"))}</h2><p class="mt-3 text-sm leading-7 text-slate-600"${_scopeId}>${ssrInterpolate(unref(t)("seoDescription"))}</p></div></section>`);
          } else {
            return [
              createVNode(_sfc_main$2, { seo: __props.seo }, null, 8, ["seo"]),
              createVNode("section", { class: "overflow-hidden rounded-2xl border border-slate-200 bg-white" }, [
                createVNode("div", { class: "grid gap-8 p-6 sm:p-10 lg:grid-cols-[1fr_360px] lg:items-center" }, [
                  createVNode("div", null, [
                    createVNode("span", { class: "news-kicker" }, toDisplayString(unref(t)("aboutNewsroom")), 1),
                    createVNode("h1", { class: "mt-5 max-w-4xl text-4xl font-semibold leading-tight sm:text-5xl" }, toDisplayString(unref(t)("aboutTitle")), 1),
                    createVNode("p", { class: "mt-5 max-w-3xl text-base leading-8 text-slate-600" }, toDisplayString(unref(t)("aboutDescription")), 1)
                  ]),
                  createVNode("div", { class: "grid grid-cols-3 gap-3 lg:grid-cols-1" }, [
                    (openBlock(true), createBlock(Fragment, null, renderList(__props.stats, (item) => {
                      return openBlock(), createBlock("div", {
                        key: item.label,
                        class: "rounded-xl border border-blue-100 bg-blue-50/60 p-4 lg:flex lg:items-center lg:justify-between"
                      }, [
                        createVNode("p", { class: "text-xs font-semibold uppercase tracking-[0.12em] text-slate-500" }, toDisplayString(item.label), 1),
                        createVNode("p", { class: "mt-2 text-3xl font-bold text-blue-800 lg:mt-0" }, toDisplayString(item.value), 1)
                      ]);
                    }), 128))
                  ])
                ])
              ]),
              createVNode("section", { class: "mt-8 grid gap-5 md:grid-cols-3" }, [
                createVNode("div", { class: "rounded-2xl border border-slate-200 bg-white p-6" }, [
                  createVNode("h2", { class: "text-2xl font-semibold" }, toDisplayString(unref(t)("editorial")), 1),
                  createVNode("p", { class: "mt-3 text-sm leading-7 text-slate-600" }, toDisplayString(unref(t)("editorialDescription")), 1)
                ]),
                createVNode("div", { class: "rounded-2xl border border-slate-200 bg-white p-6" }, [
                  createVNode("h2", { class: "text-2xl font-semibold" }, toDisplayString(unref(t)("technology")), 1),
                  createVNode("p", { class: "mt-3 text-sm leading-7 text-slate-600" }, toDisplayString(unref(t)("technologyDescription")), 1)
                ]),
                createVNode("div", { class: "rounded-2xl border border-slate-200 bg-white p-6" }, [
                  createVNode("h2", { class: "text-2xl font-semibold" }, toDisplayString(unref(t)("seo")), 1),
                  createVNode("p", { class: "mt-3 text-sm leading-7 text-slate-600" }, toDisplayString(unref(t)("seoDescription")), 1)
                ])
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/News/About.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  _sfc_main as default
};

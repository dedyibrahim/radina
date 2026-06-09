import { ref, watch, withCtx, unref, createTextVNode, toDisplayString, createVNode, openBlock, createBlock, createCommentVNode, withModifiers, withDirectives, vModelText, Fragment, renderList, useSSRContext } from "vue";
import { ssrRenderComponent, ssrRenderClass, ssrRenderAttr, ssrInterpolate, ssrRenderList } from "vue/server-renderer";
import { Link, router } from "@inertiajs/vue3";
import { _ as _sfc_main$3 } from "./ArticleCard-8kgce7ST.js";
import { _ as _sfc_main$4 } from "./PaginationLinks-DDGWEAke.js";
import { _ as _sfc_main$2 } from "./SeoHead-B3gH-eD3.js";
import { u as useNewsLocale, _ as _sfc_main$1 } from "./NewsLayout-DM3H2upC.js";
const _sfc_main = {
  __name: "Archive",
  __ssrInlineRender: true,
  props: {
    seo: Object,
    pageTitle: String,
    pageDescription: String,
    pageCover: {
      type: String,
      default: null
    },
    filters: Object,
    articles: Object,
    highlights: Array,
    trending: Array,
    context: {
      type: Object,
      default: null
    }
  },
  setup(__props) {
    var _a;
    const props = __props;
    const searchTerm = ref(((_a = props.filters) == null ? void 0 : _a.q) || "");
    const { t } = useNewsLocale();
    watch(
      () => {
        var _a2;
        return (_a2 = props.filters) == null ? void 0 : _a2.q;
      },
      (value) => {
        searchTerm.value = value || "";
      }
    );
    const submitSearch = () => {
      router.get("/berita", searchTerm.value ? { q: searchTerm.value } : {});
    };
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(_sfc_main$1, _attrs, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_sfc_main$2, { seo: __props.seo }, null, _parent2, _scopeId));
            _push2(`<section class="${ssrRenderClass([__props.pageCover ? "min-h-[340px] bg-slate-950 text-white" : "bg-gradient-to-br from-white to-blue-50/50", "relative overflow-hidden rounded-2xl border border-slate-200"])}"${_scopeId}>`);
            if (__props.pageCover) {
              _push2(`<img${ssrRenderAttr("src", __props.pageCover)}${ssrRenderAttr("alt", __props.pageTitle)} class="absolute inset-0 h-full w-full object-cover"${_scopeId}>`);
            } else {
              _push2(`<!---->`);
            }
            if (__props.pageCover) {
              _push2(`<div class="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/70 to-slate-950/20"${_scopeId}></div>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`<div class="relative flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-end lg:justify-between"${_scopeId}><div class="${ssrRenderClass([{ "self-end": __props.pageCover }, "max-w-3xl"])}"${_scopeId}>`);
            if (__props.context) {
              _push2(`<span class="news-kicker"${_scopeId}>${ssrInterpolate(__props.context.label)} / ${ssrInterpolate(__props.context.value)}</span>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`<h1 class="mt-4 text-4xl font-semibold leading-tight sm:text-5xl"${_scopeId}>${ssrInterpolate(__props.pageTitle)}</h1><p class="${ssrRenderClass([__props.pageCover ? "text-slate-200" : "text-slate-600", "mt-4 text-sm leading-7 sm:text-base"])}"${_scopeId}>${ssrInterpolate(__props.pageDescription)}</p></div><form class="flex w-full max-w-md gap-2"${_scopeId}><input${ssrRenderAttr("value", searchTerm.value)} type="search"${ssrRenderAttr("placeholder", unref(t)("archiveSearch"))} class="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"${_scopeId}><button type="submit" class="rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800"${_scopeId}>${ssrInterpolate(unref(t)("search"))}</button></form></div></section><section class="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]"${_scopeId}><div${_scopeId}><div class="grid gap-6 md:grid-cols-2"${_scopeId}><!--[-->`);
            ssrRenderList(__props.articles.data, (article) => {
              _push2(ssrRenderComponent(_sfc_main$3, {
                key: article.slug,
                article
              }, null, _parent2, _scopeId));
            });
            _push2(`<!--]--></div><div class="mt-8"${_scopeId}>`);
            _push2(ssrRenderComponent(_sfc_main$4, {
              links: __props.articles.links
            }, null, _parent2, _scopeId));
            _push2(`</div></div><aside class="space-y-6"${_scopeId}><div class="rounded-2xl border border-slate-200 bg-white p-5"${_scopeId}><span class="news-kicker"${_scopeId}>${ssrInterpolate(unref(t)("highlights"))}</span><h2 class="mt-3 text-xl font-semibold"${_scopeId}>${ssrInterpolate(unref(t)("quickPicks"))}</h2><p class="mt-2 text-sm leading-6 text-slate-500"${_scopeId}>${ssrInterpolate(unref(t)("quickPicksDescription"))}</p><div class="mt-4 divide-y divide-slate-200"${_scopeId}><!--[-->`);
            ssrRenderList(__props.highlights, (item) => {
              _push2(`<article class="py-4 first:pt-0 last:pb-0"${_scopeId}><p class="news-meta"${_scopeId}>${ssrInterpolate(item.category)}</p>`);
              _push2(ssrRenderComponent(unref(Link), {
                href: item.url,
                class: "mt-1.5 block text-sm font-semibold leading-6 text-slate-900 hover:text-blue-700"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`${ssrInterpolate(item.title)}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(item.title), 1)
                    ];
                  }
                }),
                _: 2
              }, _parent2, _scopeId));
              _push2(`</article>`);
            });
            _push2(`<!--]--></div></div><div class="rounded-2xl border border-slate-200 bg-white p-5"${_scopeId}><h2 class="text-xl font-semibold"${_scopeId}>${ssrInterpolate(unref(t)("trending"))}</h2><div class="mt-4 divide-y divide-slate-200"${_scopeId}><!--[-->`);
            ssrRenderList(__props.trending, (item, index) => {
              _push2(`<article class="flex gap-3 py-4 first:pt-0 last:pb-0"${_scopeId}><span class="text-xl font-bold text-slate-200"${_scopeId}>${ssrInterpolate(index + 1)}</span><div${_scopeId}>`);
              _push2(ssrRenderComponent(unref(Link), {
                href: item.url,
                class: "block text-sm font-semibold leading-6 text-slate-900 hover:text-blue-700"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`${ssrInterpolate(item.title)}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(item.title), 1)
                    ];
                  }
                }),
                _: 2
              }, _parent2, _scopeId));
              _push2(`<p class="mt-1 text-[11px] text-slate-500"${_scopeId}>${ssrInterpolate(new Intl.NumberFormat("id-ID").format(item.viewsCount))} ${ssrInterpolate(unref(t)("views"))}</p></div></article>`);
            });
            _push2(`<!--]--></div></div></aside></section>`);
          } else {
            return [
              createVNode(_sfc_main$2, { seo: __props.seo }, null, 8, ["seo"]),
              createVNode("section", {
                class: ["relative overflow-hidden rounded-2xl border border-slate-200", __props.pageCover ? "min-h-[340px] bg-slate-950 text-white" : "bg-gradient-to-br from-white to-blue-50/50"]
              }, [
                __props.pageCover ? (openBlock(), createBlock("img", {
                  key: 0,
                  src: __props.pageCover,
                  alt: __props.pageTitle,
                  class: "absolute inset-0 h-full w-full object-cover"
                }, null, 8, ["src", "alt"])) : createCommentVNode("", true),
                __props.pageCover ? (openBlock(), createBlock("div", {
                  key: 1,
                  class: "absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/70 to-slate-950/20"
                })) : createCommentVNode("", true),
                createVNode("div", { class: "relative flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-end lg:justify-between" }, [
                  createVNode("div", {
                    class: ["max-w-3xl", { "self-end": __props.pageCover }]
                  }, [
                    __props.context ? (openBlock(), createBlock("span", {
                      key: 0,
                      class: "news-kicker"
                    }, toDisplayString(__props.context.label) + " / " + toDisplayString(__props.context.value), 1)) : createCommentVNode("", true),
                    createVNode("h1", { class: "mt-4 text-4xl font-semibold leading-tight sm:text-5xl" }, toDisplayString(__props.pageTitle), 1),
                    createVNode("p", {
                      class: ["mt-4 text-sm leading-7 sm:text-base", __props.pageCover ? "text-slate-200" : "text-slate-600"]
                    }, toDisplayString(__props.pageDescription), 3)
                  ], 2),
                  createVNode("form", {
                    class: "flex w-full max-w-md gap-2",
                    onSubmit: withModifiers(submitSearch, ["prevent"])
                  }, [
                    withDirectives(createVNode("input", {
                      "onUpdate:modelValue": ($event) => searchTerm.value = $event,
                      type: "search",
                      placeholder: unref(t)("archiveSearch"),
                      class: "min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    }, null, 8, ["onUpdate:modelValue", "placeholder"]), [
                      [vModelText, searchTerm.value]
                    ]),
                    createVNode("button", {
                      type: "submit",
                      class: "rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800"
                    }, toDisplayString(unref(t)("search")), 1)
                  ], 32)
                ])
              ], 2),
              createVNode("section", { class: "mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]" }, [
                createVNode("div", null, [
                  createVNode("div", { class: "grid gap-6 md:grid-cols-2" }, [
                    (openBlock(true), createBlock(Fragment, null, renderList(__props.articles.data, (article) => {
                      return openBlock(), createBlock(_sfc_main$3, {
                        key: article.slug,
                        article
                      }, null, 8, ["article"]);
                    }), 128))
                  ]),
                  createVNode("div", { class: "mt-8" }, [
                    createVNode(_sfc_main$4, {
                      links: __props.articles.links
                    }, null, 8, ["links"])
                  ])
                ]),
                createVNode("aside", { class: "space-y-6" }, [
                  createVNode("div", { class: "rounded-2xl border border-slate-200 bg-white p-5" }, [
                    createVNode("span", { class: "news-kicker" }, toDisplayString(unref(t)("highlights")), 1),
                    createVNode("h2", { class: "mt-3 text-xl font-semibold" }, toDisplayString(unref(t)("quickPicks")), 1),
                    createVNode("p", { class: "mt-2 text-sm leading-6 text-slate-500" }, toDisplayString(unref(t)("quickPicksDescription")), 1),
                    createVNode("div", { class: "mt-4 divide-y divide-slate-200" }, [
                      (openBlock(true), createBlock(Fragment, null, renderList(__props.highlights, (item) => {
                        return openBlock(), createBlock("article", {
                          key: item.url,
                          class: "py-4 first:pt-0 last:pb-0"
                        }, [
                          createVNode("p", { class: "news-meta" }, toDisplayString(item.category), 1),
                          createVNode(unref(Link), {
                            href: item.url,
                            class: "mt-1.5 block text-sm font-semibold leading-6 text-slate-900 hover:text-blue-700"
                          }, {
                            default: withCtx(() => [
                              createTextVNode(toDisplayString(item.title), 1)
                            ]),
                            _: 2
                          }, 1032, ["href"])
                        ]);
                      }), 128))
                    ])
                  ]),
                  createVNode("div", { class: "rounded-2xl border border-slate-200 bg-white p-5" }, [
                    createVNode("h2", { class: "text-xl font-semibold" }, toDisplayString(unref(t)("trending")), 1),
                    createVNode("div", { class: "mt-4 divide-y divide-slate-200" }, [
                      (openBlock(true), createBlock(Fragment, null, renderList(__props.trending, (item, index) => {
                        return openBlock(), createBlock("article", {
                          key: item.url,
                          class: "flex gap-3 py-4 first:pt-0 last:pb-0"
                        }, [
                          createVNode("span", { class: "text-xl font-bold text-slate-200" }, toDisplayString(index + 1), 1),
                          createVNode("div", null, [
                            createVNode(unref(Link), {
                              href: item.url,
                              class: "block text-sm font-semibold leading-6 text-slate-900 hover:text-blue-700"
                            }, {
                              default: withCtx(() => [
                                createTextVNode(toDisplayString(item.title), 1)
                              ]),
                              _: 2
                            }, 1032, ["href"]),
                            createVNode("p", { class: "mt-1 text-[11px] text-slate-500" }, toDisplayString(new Intl.NumberFormat("id-ID").format(item.viewsCount)) + " " + toDisplayString(unref(t)("views")), 1)
                          ])
                        ]);
                      }), 128))
                    ])
                  ])
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/News/Archive.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  _sfc_main as default
};

import { mergeProps, useSSRContext, computed, withCtx, unref, createTextVNode, toDisplayString, createVNode, openBlock, createBlock, createCommentVNode, Fragment, renderList } from "vue";
import { ssrRenderAttrs, ssrInterpolate, ssrRenderSlot, ssrRenderComponent, ssrRenderList, ssrRenderStyle } from "vue/server-renderer";
import { Link } from "@inertiajs/vue3";
import { _ as _sfc_main$4 } from "./ArticleCard-8kgce7ST.js";
import { _ as _sfc_main$3 } from "./SeoHead-B3gH-eD3.js";
import { u as useNewsLocale, _ as _sfc_main$2 } from "./NewsLayout-DM3H2upC.js";
const _sfc_main$1 = {
  __name: "SectionHeader",
  __ssrInlineRender: true,
  props: {
    eyebrow: {
      type: String,
      default: ""
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: ""
    }
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex flex-col gap-4 md:flex-row md:items-end md:justify-between" }, _attrs))}><div class="max-w-3xl">`);
      if (__props.eyebrow) {
        _push(`<span class="news-kicker">${ssrInterpolate(__props.eyebrow)}</span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<h2 class="mt-4 text-3xl leading-tight md:text-[2.35rem]">${ssrInterpolate(__props.title)}</h2>`);
      if (__props.description) {
        _push(`<p class="mt-3 max-w-2xl text-sm leading-7 text-slate-600 md:text-base">${ssrInterpolate(__props.description)}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</div>`);
    };
  }
};
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Components/SectionHeader.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = {
  __name: "Home",
  __ssrInlineRender: true,
  props: {
    seo: Object,
    hero: Object,
    breaking: Array,
    editorsPick: Array,
    latest: Array,
    trending: Array,
    categories: Array,
    popularTags: Array
  },
  setup(__props) {
    const props = __props;
    const { t } = useNewsLocale();
    const latestArticles = computed(() => props.latest || []);
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(_sfc_main$2, _attrs, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_sfc_main$3, { seo: __props.seo }, null, _parent2, _scopeId));
            _push2(`<section class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]"${_scopeId}>`);
            if (__props.hero) {
              _push2(ssrRenderComponent(_sfc_main$4, {
                article: __props.hero,
                featured: ""
              }, null, _parent2, _scopeId));
            } else {
              _push2(`<!---->`);
            }
            _push2(`<aside class="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.05)] sm:p-6"${_scopeId}><div class="flex items-center justify-between gap-3"${_scopeId}><span class="news-kicker"${_scopeId}>${ssrInterpolate(unref(t)("breaking"))}</span><span class="news-meta"${_scopeId}>${ssrInterpolate(unref(t)("fastUpdate"))}</span></div><div class="mt-5 divide-y divide-slate-200"${_scopeId}><!--[-->`);
            ssrRenderList(__props.breaking, (item, index) => {
              _push2(`<article class="grid grid-cols-[28px_1fr] gap-3 py-4 first:pt-0 last:pb-0"${_scopeId}><span class="text-sm font-bold text-blue-700"${_scopeId}>${ssrInterpolate(String(index + 1).padStart(2, "0"))}</span><div class="min-w-0"${_scopeId}><div class="flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500"${_scopeId}>`);
              if (item.categoryUrl) {
                _push2(ssrRenderComponent(unref(Link), {
                  href: item.categoryUrl,
                  class: "text-blue-700"
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`${ssrInterpolate(item.category)}`);
                    } else {
                      return [
                        createTextVNode(toDisplayString(item.category), 1)
                      ];
                    }
                  }),
                  _: 2
                }, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              _push2(`<span${_scopeId}>${ssrInterpolate(item.publishedLabel)}</span></div>`);
              _push2(ssrRenderComponent(unref(Link), {
                href: item.url,
                class: "mt-1.5 block text-[15px] font-semibold leading-6 text-slate-900 transition hover:text-blue-700"
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
              _push2(`</div></article>`);
            });
            _push2(`<!--]--></div></aside></section><section class="mt-14"${_scopeId}>`);
            _push2(ssrRenderComponent(_sfc_main$1, {
              eyebrow: unref(t)("editorChoice"),
              title: unref(t)("editorChoiceTitle"),
              description: unref(t)("editorChoiceDescription")
            }, null, _parent2, _scopeId));
            _push2(`<div class="mt-7 grid gap-6 md:grid-cols-2 xl:grid-cols-3"${_scopeId}><!--[-->`);
            ssrRenderList(__props.editorsPick, (article) => {
              _push2(ssrRenderComponent(_sfc_main$4, {
                key: article.slug,
                article
              }, null, _parent2, _scopeId));
            });
            _push2(`<!--]--></div></section><section class="mt-14 grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]"${_scopeId}><div${_scopeId}>`);
            _push2(ssrRenderComponent(_sfc_main$1, {
              eyebrow: unref(t)("latest"),
              title: unref(t)("latestTitle"),
              description: unref(t)("latestDescription")
            }, null, _parent2, _scopeId));
            _push2(`<div class="mt-7 grid gap-6 md:grid-cols-2"${_scopeId}><!--[-->`);
            ssrRenderList(latestArticles.value, (article) => {
              _push2(ssrRenderComponent(_sfc_main$4, {
                key: article.slug,
                article
              }, null, _parent2, _scopeId));
            });
            _push2(`<!--]--></div></div><aside class="space-y-6"${_scopeId}><div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.05)]"${_scopeId}><h3 class="text-xl font-semibold"${_scopeId}>${ssrInterpolate(unref(t)("trending"))}</h3><div class="mt-4 divide-y divide-slate-200"${_scopeId}><!--[-->`);
            ssrRenderList(__props.trending, (item, index) => {
              _push2(`<article class="flex gap-3 py-4 first:pt-0 last:pb-0"${_scopeId}><span class="text-2xl font-bold text-slate-200"${_scopeId}>${ssrInterpolate(index + 1)}</span><div${_scopeId}>`);
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
            _push2(`<!--]--></div></div><div class="rounded-2xl border border-slate-200 bg-white p-5"${_scopeId}><h3 class="text-xl font-semibold"${_scopeId}>${ssrInterpolate(unref(t)("popularTopics"))}</h3><div class="mt-4 flex flex-wrap gap-2"${_scopeId}><!--[-->`);
            ssrRenderList(__props.popularTags, (tag) => {
              _push2(ssrRenderComponent(unref(Link), {
                key: tag.slug,
                href: tag.url,
                class: "rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-blue-50 hover:text-blue-700"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(` #${ssrInterpolate(tag.name)}`);
                  } else {
                    return [
                      createTextVNode(" #" + toDisplayString(tag.name), 1)
                    ];
                  }
                }),
                _: 2
              }, _parent2, _scopeId));
            });
            _push2(`<!--]--></div></div></aside></section><section class="mt-14"${_scopeId}>`);
            _push2(ssrRenderComponent(_sfc_main$1, {
              eyebrow: unref(t)("categories"),
              title: unref(t)("categoriesTitle"),
              description: unref(t)("categoriesDescription")
            }, null, _parent2, _scopeId));
            _push2(`<div class="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-3"${_scopeId}><!--[-->`);
            ssrRenderList(__props.categories, (category) => {
              _push2(ssrRenderComponent(unref(Link), {
                key: category.slug,
                href: category.url,
                class: "rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`<div class="flex items-center justify-between gap-3"${_scopeId2}><span class="text-sm font-bold" style="${ssrRenderStyle({ color: category.accentColor })}"${_scopeId2}>${ssrInterpolate(category.name)}</span><span class="text-xs text-slate-500"${_scopeId2}>${ssrInterpolate(category.articlesCount)} ${ssrInterpolate(unref(t)("articles"))}</span></div><p class="mt-3 text-sm leading-6 text-slate-600"${_scopeId2}>${ssrInterpolate(category.description)}</p>`);
                    if (category.spotlight) {
                      _push3(`<div class="mt-4 border-t border-slate-100 pt-4"${_scopeId2}><p class="news-meta"${_scopeId2}>${ssrInterpolate(unref(t)("latestHighlight"))}</p><p class="mt-1.5 line-clamp-2 text-sm font-semibold leading-6 text-slate-900"${_scopeId2}>${ssrInterpolate(category.spotlight.title)}</p></div>`);
                    } else {
                      _push3(`<!---->`);
                    }
                  } else {
                    return [
                      createVNode("div", { class: "flex items-center justify-between gap-3" }, [
                        createVNode("span", {
                          class: "text-sm font-bold",
                          style: { color: category.accentColor }
                        }, toDisplayString(category.name), 5),
                        createVNode("span", { class: "text-xs text-slate-500" }, toDisplayString(category.articlesCount) + " " + toDisplayString(unref(t)("articles")), 1)
                      ]),
                      createVNode("p", { class: "mt-3 text-sm leading-6 text-slate-600" }, toDisplayString(category.description), 1),
                      category.spotlight ? (openBlock(), createBlock("div", {
                        key: 0,
                        class: "mt-4 border-t border-slate-100 pt-4"
                      }, [
                        createVNode("p", { class: "news-meta" }, toDisplayString(unref(t)("latestHighlight")), 1),
                        createVNode("p", { class: "mt-1.5 line-clamp-2 text-sm font-semibold leading-6 text-slate-900" }, toDisplayString(category.spotlight.title), 1)
                      ])) : createCommentVNode("", true)
                    ];
                  }
                }),
                _: 2
              }, _parent2, _scopeId));
            });
            _push2(`<!--]--></div></section>`);
          } else {
            return [
              createVNode(_sfc_main$3, { seo: __props.seo }, null, 8, ["seo"]),
              createVNode("section", { class: "grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]" }, [
                __props.hero ? (openBlock(), createBlock(_sfc_main$4, {
                  key: 0,
                  article: __props.hero,
                  featured: ""
                }, null, 8, ["article"])) : createCommentVNode("", true),
                createVNode("aside", { class: "rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.05)] sm:p-6" }, [
                  createVNode("div", { class: "flex items-center justify-between gap-3" }, [
                    createVNode("span", { class: "news-kicker" }, toDisplayString(unref(t)("breaking")), 1),
                    createVNode("span", { class: "news-meta" }, toDisplayString(unref(t)("fastUpdate")), 1)
                  ]),
                  createVNode("div", { class: "mt-5 divide-y divide-slate-200" }, [
                    (openBlock(true), createBlock(Fragment, null, renderList(__props.breaking, (item, index) => {
                      return openBlock(), createBlock("article", {
                        key: item.url,
                        class: "grid grid-cols-[28px_1fr] gap-3 py-4 first:pt-0 last:pb-0"
                      }, [
                        createVNode("span", { class: "text-sm font-bold text-blue-700" }, toDisplayString(String(index + 1).padStart(2, "0")), 1),
                        createVNode("div", { class: "min-w-0" }, [
                          createVNode("div", { class: "flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500" }, [
                            item.categoryUrl ? (openBlock(), createBlock(unref(Link), {
                              key: 0,
                              href: item.categoryUrl,
                              class: "text-blue-700"
                            }, {
                              default: withCtx(() => [
                                createTextVNode(toDisplayString(item.category), 1)
                              ]),
                              _: 2
                            }, 1032, ["href"])) : createCommentVNode("", true),
                            createVNode("span", null, toDisplayString(item.publishedLabel), 1)
                          ]),
                          createVNode(unref(Link), {
                            href: item.url,
                            class: "mt-1.5 block text-[15px] font-semibold leading-6 text-slate-900 transition hover:text-blue-700"
                          }, {
                            default: withCtx(() => [
                              createTextVNode(toDisplayString(item.title), 1)
                            ]),
                            _: 2
                          }, 1032, ["href"])
                        ])
                      ]);
                    }), 128))
                  ])
                ])
              ]),
              createVNode("section", { class: "mt-14" }, [
                createVNode(_sfc_main$1, {
                  eyebrow: unref(t)("editorChoice"),
                  title: unref(t)("editorChoiceTitle"),
                  description: unref(t)("editorChoiceDescription")
                }, null, 8, ["eyebrow", "title", "description"]),
                createVNode("div", { class: "mt-7 grid gap-6 md:grid-cols-2 xl:grid-cols-3" }, [
                  (openBlock(true), createBlock(Fragment, null, renderList(__props.editorsPick, (article) => {
                    return openBlock(), createBlock(_sfc_main$4, {
                      key: article.slug,
                      article
                    }, null, 8, ["article"]);
                  }), 128))
                ])
              ]),
              createVNode("section", { class: "mt-14 grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]" }, [
                createVNode("div", null, [
                  createVNode(_sfc_main$1, {
                    eyebrow: unref(t)("latest"),
                    title: unref(t)("latestTitle"),
                    description: unref(t)("latestDescription")
                  }, null, 8, ["eyebrow", "title", "description"]),
                  createVNode("div", { class: "mt-7 grid gap-6 md:grid-cols-2" }, [
                    (openBlock(true), createBlock(Fragment, null, renderList(latestArticles.value, (article) => {
                      return openBlock(), createBlock(_sfc_main$4, {
                        key: article.slug,
                        article
                      }, null, 8, ["article"]);
                    }), 128))
                  ])
                ]),
                createVNode("aside", { class: "space-y-6" }, [
                  createVNode("div", { class: "rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.05)]" }, [
                    createVNode("h3", { class: "text-xl font-semibold" }, toDisplayString(unref(t)("trending")), 1),
                    createVNode("div", { class: "mt-4 divide-y divide-slate-200" }, [
                      (openBlock(true), createBlock(Fragment, null, renderList(__props.trending, (item, index) => {
                        return openBlock(), createBlock("article", {
                          key: item.url,
                          class: "flex gap-3 py-4 first:pt-0 last:pb-0"
                        }, [
                          createVNode("span", { class: "text-2xl font-bold text-slate-200" }, toDisplayString(index + 1), 1),
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
                  ]),
                  createVNode("div", { class: "rounded-2xl border border-slate-200 bg-white p-5" }, [
                    createVNode("h3", { class: "text-xl font-semibold" }, toDisplayString(unref(t)("popularTopics")), 1),
                    createVNode("div", { class: "mt-4 flex flex-wrap gap-2" }, [
                      (openBlock(true), createBlock(Fragment, null, renderList(__props.popularTags, (tag) => {
                        return openBlock(), createBlock(unref(Link), {
                          key: tag.slug,
                          href: tag.url,
                          class: "rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-blue-50 hover:text-blue-700"
                        }, {
                          default: withCtx(() => [
                            createTextVNode(" #" + toDisplayString(tag.name), 1)
                          ]),
                          _: 2
                        }, 1032, ["href"]);
                      }), 128))
                    ])
                  ])
                ])
              ]),
              createVNode("section", { class: "mt-14" }, [
                createVNode(_sfc_main$1, {
                  eyebrow: unref(t)("categories"),
                  title: unref(t)("categoriesTitle"),
                  description: unref(t)("categoriesDescription")
                }, null, 8, ["eyebrow", "title", "description"]),
                createVNode("div", { class: "mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-3" }, [
                  (openBlock(true), createBlock(Fragment, null, renderList(__props.categories, (category) => {
                    return openBlock(), createBlock(unref(Link), {
                      key: category.slug,
                      href: category.url,
                      class: "rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
                    }, {
                      default: withCtx(() => [
                        createVNode("div", { class: "flex items-center justify-between gap-3" }, [
                          createVNode("span", {
                            class: "text-sm font-bold",
                            style: { color: category.accentColor }
                          }, toDisplayString(category.name), 5),
                          createVNode("span", { class: "text-xs text-slate-500" }, toDisplayString(category.articlesCount) + " " + toDisplayString(unref(t)("articles")), 1)
                        ]),
                        createVNode("p", { class: "mt-3 text-sm leading-6 text-slate-600" }, toDisplayString(category.description), 1),
                        category.spotlight ? (openBlock(), createBlock("div", {
                          key: 0,
                          class: "mt-4 border-t border-slate-100 pt-4"
                        }, [
                          createVNode("p", { class: "news-meta" }, toDisplayString(unref(t)("latestHighlight")), 1),
                          createVNode("p", { class: "mt-1.5 line-clamp-2 text-sm font-semibold leading-6 text-slate-900" }, toDisplayString(category.spotlight.title), 1)
                        ])) : createCommentVNode("", true)
                      ]),
                      _: 2
                    }, 1032, ["href"]);
                  }), 128))
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/News/Home.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  _sfc_main as default
};

import { withCtx, unref, createTextVNode, toDisplayString, createVNode, openBlock, createBlock, Fragment, renderList, useSSRContext } from "vue";
import { ssrRenderComponent, ssrInterpolate, ssrRenderAttr, ssrRenderList } from "vue/server-renderer";
import { Link } from "@inertiajs/vue3";
import { _ as _sfc_main$3 } from "./ArticleCard-8kgce7ST.js";
import { _ as _sfc_main$2 } from "./SeoHead-B3gH-eD3.js";
import { u as useNewsLocale, _ as _sfc_main$1 } from "./NewsLayout-DM3H2upC.js";
const _sfc_main = {
  __name: "ArticleShow",
  __ssrInlineRender: true,
  props: {
    seo: Object,
    article: Object,
    related: Array,
    trending: Array
  },
  setup(__props) {
    const { t } = useNewsLocale();
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(_sfc_main$1, _attrs, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_sfc_main$2, { seo: __props.seo }, null, _parent2, _scopeId));
            _push2(`<article${_scopeId}><header class="mx-auto max-w-4xl text-center"${_scopeId}><div class="flex flex-wrap items-center justify-center gap-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500"${_scopeId}>`);
            _push2(ssrRenderComponent(unref(Link), {
              href: __props.article.category.url,
              class: "rounded-full px-3 py-1",
              style: { backgroundColor: `${__props.article.category.accentColor}18`, color: __props.article.category.accentColor }
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`${ssrInterpolate(__props.article.category.name)}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(__props.article.category.name), 1)
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`<span${_scopeId}>${ssrInterpolate(__props.article.publishedLabel)}</span><span${_scopeId}>${ssrInterpolate(__props.article.readingTime)} ${ssrInterpolate(unref(t)("readMinutes"))}</span></div><h1 class="mt-5 text-balance text-4xl font-semibold leading-tight text-slate-950 sm:text-5xl lg:text-6xl"${_scopeId}>${ssrInterpolate(__props.article.title)}</h1><p class="mx-auto mt-5 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg"${_scopeId}>${ssrInterpolate(__props.article.excerpt)}</p><div class="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm text-slate-500"${_scopeId}><span class="font-semibold text-slate-800"${_scopeId}>${ssrInterpolate(__props.article.author.name)}</span><span${_scopeId}>/</span><span${_scopeId}>${ssrInterpolate(new Intl.NumberFormat("id-ID").format(__props.article.viewsCount))} ${ssrInterpolate(unref(t)("views"))}</span></div></header><img${ssrRenderAttr("src", __props.article.coverImage)}${ssrRenderAttr("alt", __props.article.coverAlt)} class="mt-8 aspect-[16/8] w-full rounded-2xl object-cover shadow-[0_18px_45px_rgba(15,23,42,0.12)]"${_scopeId}><div class="mt-10 grid gap-8 xl:grid-cols-[minmax(0,760px)_300px] xl:justify-center"${_scopeId}><div class="rounded-2xl border border-slate-200 bg-white p-6 sm:p-9"${_scopeId}><div class="news-prose"${_scopeId}>${__props.article.content ?? ""}</div><div class="mt-8 flex flex-wrap gap-2 border-t border-slate-200 pt-6"${_scopeId}><!--[-->`);
            ssrRenderList(__props.article.tags, (tag) => {
              _push2(ssrRenderComponent(unref(Link), {
                key: tag.slug,
                href: tag.url,
                class: "rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-blue-50 hover:text-blue-700"
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
            _push2(`<!--]--></div></div><aside class="space-y-6"${_scopeId}><div class="rounded-2xl border border-slate-200 bg-white p-5"${_scopeId}><h2 class="text-xl font-semibold"${_scopeId}>${ssrInterpolate(unref(t)("rising"))}</h2><div class="mt-4 divide-y divide-slate-200"${_scopeId}><!--[-->`);
            ssrRenderList(__props.trending, (item) => {
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
            _push2(`<!--]--></div></div><div class="rounded-2xl border border-slate-200 bg-white p-5"${_scopeId}><h2 class="text-xl font-semibold"${_scopeId}>${ssrInterpolate(unref(t)("share"))}</h2><div class="mt-4 flex flex-wrap gap-2 text-xs font-semibold"${_scopeId}><a${ssrRenderAttr("href", `https://twitter.com/intent/tweet?url=${encodeURIComponent(__props.article.url)}&text=${encodeURIComponent(__props.article.title)}`)} target="_blank" rel="noreferrer" class="rounded-full border border-slate-300 px-3 py-2 hover:border-blue-400 hover:text-blue-700"${_scopeId}>X</a><a${ssrRenderAttr("href", `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(__props.article.url)}`)} target="_blank" rel="noreferrer" class="rounded-full border border-slate-300 px-3 py-2 hover:border-blue-400 hover:text-blue-700"${_scopeId}>LinkedIn</a></div></div></aside></div></article><section class="mt-14"${_scopeId}><h2 class="text-3xl font-semibold"${_scopeId}>${ssrInterpolate(unref(t)("relatedArticles"))}</h2><div class="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-4"${_scopeId}><!--[-->`);
            ssrRenderList(__props.related, (item) => {
              _push2(ssrRenderComponent(_sfc_main$3, {
                key: item.slug,
                article: item
              }, null, _parent2, _scopeId));
            });
            _push2(`<!--]--></div></section>`);
          } else {
            return [
              createVNode(_sfc_main$2, { seo: __props.seo }, null, 8, ["seo"]),
              createVNode("article", null, [
                createVNode("header", { class: "mx-auto max-w-4xl text-center" }, [
                  createVNode("div", { class: "flex flex-wrap items-center justify-center gap-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500" }, [
                    createVNode(unref(Link), {
                      href: __props.article.category.url,
                      class: "rounded-full px-3 py-1",
                      style: { backgroundColor: `${__props.article.category.accentColor}18`, color: __props.article.category.accentColor }
                    }, {
                      default: withCtx(() => [
                        createTextVNode(toDisplayString(__props.article.category.name), 1)
                      ]),
                      _: 1
                    }, 8, ["href", "style"]),
                    createVNode("span", null, toDisplayString(__props.article.publishedLabel), 1),
                    createVNode("span", null, toDisplayString(__props.article.readingTime) + " " + toDisplayString(unref(t)("readMinutes")), 1)
                  ]),
                  createVNode("h1", { class: "mt-5 text-balance text-4xl font-semibold leading-tight text-slate-950 sm:text-5xl lg:text-6xl" }, toDisplayString(__props.article.title), 1),
                  createVNode("p", { class: "mx-auto mt-5 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg" }, toDisplayString(__props.article.excerpt), 1),
                  createVNode("div", { class: "mt-6 flex flex-wrap items-center justify-center gap-3 text-sm text-slate-500" }, [
                    createVNode("span", { class: "font-semibold text-slate-800" }, toDisplayString(__props.article.author.name), 1),
                    createVNode("span", null, "/"),
                    createVNode("span", null, toDisplayString(new Intl.NumberFormat("id-ID").format(__props.article.viewsCount)) + " " + toDisplayString(unref(t)("views")), 1)
                  ])
                ]),
                createVNode("img", {
                  src: __props.article.coverImage,
                  alt: __props.article.coverAlt,
                  class: "mt-8 aspect-[16/8] w-full rounded-2xl object-cover shadow-[0_18px_45px_rgba(15,23,42,0.12)]"
                }, null, 8, ["src", "alt"]),
                createVNode("div", { class: "mt-10 grid gap-8 xl:grid-cols-[minmax(0,760px)_300px] xl:justify-center" }, [
                  createVNode("div", { class: "rounded-2xl border border-slate-200 bg-white p-6 sm:p-9" }, [
                    createVNode("div", {
                      class: "news-prose",
                      innerHTML: __props.article.content
                    }, null, 8, ["innerHTML"]),
                    createVNode("div", { class: "mt-8 flex flex-wrap gap-2 border-t border-slate-200 pt-6" }, [
                      (openBlock(true), createBlock(Fragment, null, renderList(__props.article.tags, (tag) => {
                        return openBlock(), createBlock(unref(Link), {
                          key: tag.slug,
                          href: tag.url,
                          class: "rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                        }, {
                          default: withCtx(() => [
                            createTextVNode(" #" + toDisplayString(tag.name), 1)
                          ]),
                          _: 2
                        }, 1032, ["href"]);
                      }), 128))
                    ])
                  ]),
                  createVNode("aside", { class: "space-y-6" }, [
                    createVNode("div", { class: "rounded-2xl border border-slate-200 bg-white p-5" }, [
                      createVNode("h2", { class: "text-xl font-semibold" }, toDisplayString(unref(t)("rising")), 1),
                      createVNode("div", { class: "mt-4 divide-y divide-slate-200" }, [
                        (openBlock(true), createBlock(Fragment, null, renderList(__props.trending, (item) => {
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
                      createVNode("h2", { class: "text-xl font-semibold" }, toDisplayString(unref(t)("share")), 1),
                      createVNode("div", { class: "mt-4 flex flex-wrap gap-2 text-xs font-semibold" }, [
                        createVNode("a", {
                          href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(__props.article.url)}&text=${encodeURIComponent(__props.article.title)}`,
                          target: "_blank",
                          rel: "noreferrer",
                          class: "rounded-full border border-slate-300 px-3 py-2 hover:border-blue-400 hover:text-blue-700"
                        }, "X", 8, ["href"]),
                        createVNode("a", {
                          href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(__props.article.url)}`,
                          target: "_blank",
                          rel: "noreferrer",
                          class: "rounded-full border border-slate-300 px-3 py-2 hover:border-blue-400 hover:text-blue-700"
                        }, "LinkedIn", 8, ["href"])
                      ])
                    ])
                  ])
                ])
              ]),
              createVNode("section", { class: "mt-14" }, [
                createVNode("h2", { class: "text-3xl font-semibold" }, toDisplayString(unref(t)("relatedArticles")), 1),
                createVNode("div", { class: "mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-4" }, [
                  (openBlock(true), createBlock(Fragment, null, renderList(__props.related, (item) => {
                    return openBlock(), createBlock(_sfc_main$3, {
                      key: item.slug,
                      article: item
                    }, null, 8, ["article"]);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/News/ArticleShow.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  _sfc_main as default
};

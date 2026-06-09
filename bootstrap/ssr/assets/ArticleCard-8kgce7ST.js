import { mergeProps, unref, withCtx, createVNode, openBlock, createBlock, toDisplayString, createCommentVNode, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderAttr, ssrRenderStyle, ssrInterpolate, ssrRenderClass } from "vue/server-renderer";
import { Link } from "@inertiajs/vue3";
import { u as useNewsLocale } from "./NewsLayout-DM3H2upC.js";
const _sfc_main = {
  __name: "ArticleCard",
  __ssrInlineRender: true,
  props: {
    article: {
      type: Object,
      required: true
    },
    featured: {
      type: Boolean,
      default: false
    }
  },
  setup(__props) {
    const { t } = useNewsLocale();
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<article${ssrRenderAttrs(mergeProps({ class: "group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.05)] transition duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_16px_36px_rgba(15,23,42,0.09)]" }, _attrs))}>`);
      _push(ssrRenderComponent(unref(Link), {
        href: __props.article.url,
        class: ["relative block overflow-hidden", __props.featured ? "aspect-[16/9]" : "aspect-[16/10]"]
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<img${ssrRenderAttr("src", __props.article.coverImage)}${ssrRenderAttr("alt", __props.article.coverAlt)} class="h-full w-full object-cover transition duration-500 group-hover:scale-[1.025]"${_scopeId}>`);
            if (__props.article.category) {
              _push2(`<span class="absolute bottom-4 left-4 rounded-full bg-white/95 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] shadow-sm backdrop-blur" style="${ssrRenderStyle({ color: __props.article.category.accentColor })}"${_scopeId}>${ssrInterpolate(__props.article.category.name)}</span>`);
            } else {
              _push2(`<!---->`);
            }
          } else {
            return [
              createVNode("img", {
                src: __props.article.coverImage,
                alt: __props.article.coverAlt,
                class: "h-full w-full object-cover transition duration-500 group-hover:scale-[1.025]"
              }, null, 8, ["src", "alt"]),
              __props.article.category ? (openBlock(), createBlock("span", {
                key: 0,
                class: "absolute bottom-4 left-4 rounded-full bg-white/95 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] shadow-sm backdrop-blur",
                style: { color: __props.article.category.accentColor }
              }, toDisplayString(__props.article.category.name), 5)) : createCommentVNode("", true)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="flex flex-1 flex-col p-5 sm:p-6"><div class="flex flex-wrap items-center gap-2 text-[11px] font-medium text-slate-500"><span>${ssrInterpolate(__props.article.publishedLabel)}</span><span class="text-slate-300">/</span><span>${ssrInterpolate(__props.article.readingTime)} ${ssrInterpolate(unref(t)("readMinutes"))}</span></div>`);
      _push(ssrRenderComponent(unref(Link), {
        href: __props.article.url,
        class: "mt-3"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<h3 class="${ssrRenderClass([__props.featured ? "text-2xl sm:text-[2rem]" : "text-xl", "text-balance font-semibold leading-tight text-slate-950 transition group-hover:text-blue-700"])}"${_scopeId}>${ssrInterpolate(__props.article.title)}</h3>`);
          } else {
            return [
              createVNode("h3", {
                class: ["text-balance font-semibold leading-tight text-slate-950 transition group-hover:text-blue-700", __props.featured ? "text-2xl sm:text-[2rem]" : "text-xl"]
              }, toDisplayString(__props.article.title), 3)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<p class="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">${ssrInterpolate(__props.article.excerpt)}</p><div class="mt-auto flex items-center justify-between gap-3 pt-5 text-xs text-slate-500">`);
      if (__props.article.author) {
        _push(`<span class="truncate font-medium text-slate-700">${ssrInterpolate(__props.article.author.name)}</span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<span class="shrink-0">${ssrInterpolate(new Intl.NumberFormat("id-ID").format(__props.article.viewsCount))} ${ssrInterpolate(unref(t)("views"))}</span></div></div></article>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Components/ArticleCard.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  _sfc_main as _
};

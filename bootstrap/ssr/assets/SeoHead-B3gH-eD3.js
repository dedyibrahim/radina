import { computed, unref, withCtx, createVNode, resolveDynamicComponent, toDisplayString, openBlock, createBlock, createCommentVNode, Fragment, renderList, useSSRContext } from "vue";
import { ssrRenderComponent, ssrInterpolate, ssrRenderAttr, ssrRenderList, ssrRenderVNode } from "vue/server-renderer";
import { usePage, Head } from "@inertiajs/vue3";
const _sfc_main = {
  __name: "SeoHead",
  __ssrInlineRender: true,
  props: {
    seo: {
      type: Object,
      required: true
    }
  },
  setup(__props) {
    const props = __props;
    const page = usePage();
    const siteName = computed(() => {
      var _a;
      return ((_a = page.props.portal) == null ? void 0 : _a.name) || "Radina News";
    });
    const description = computed(() => {
      var _a;
      return props.seo.description || ((_a = page.props.portal) == null ? void 0 : _a.description) || "";
    });
    const image = computed(() => {
      var _a;
      return props.seo.image || ((_a = page.props.portal) == null ? void 0 : _a.defaultImage) || "";
    });
    const url = computed(() => {
      var _a;
      return props.seo.url || ((_a = page.props.portal) == null ? void 0 : _a.baseUrl) || "";
    });
    const keywords = computed(() => props.seo.keywords || "");
    const jsonLdBlocks = computed(() => (props.seo.jsonLd || []).filter(Boolean));
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(unref(Head), _attrs, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<title${_scopeId}>${ssrInterpolate(__props.seo.title)}</title><meta name="description"${ssrRenderAttr("content", description.value)}${_scopeId}><meta name="robots"${ssrRenderAttr("content", __props.seo.robots)}${_scopeId}>`);
            if (keywords.value) {
              _push2(`<meta name="keywords"${ssrRenderAttr("content", keywords.value)}${_scopeId}>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`<link rel="canonical"${ssrRenderAttr("href", url.value)}${_scopeId}><meta property="og:site_name"${ssrRenderAttr("content", siteName.value)}${_scopeId}><meta property="og:title"${ssrRenderAttr("content", __props.seo.title)}${_scopeId}><meta property="og:description"${ssrRenderAttr("content", description.value)}${_scopeId}><meta property="og:type"${ssrRenderAttr("content", __props.seo.type)}${_scopeId}><meta property="og:url"${ssrRenderAttr("content", url.value)}${_scopeId}><meta property="og:image"${ssrRenderAttr("content", image.value)}${_scopeId}><meta name="twitter:card" content="summary_large_image"${_scopeId}><meta name="twitter:title"${ssrRenderAttr("content", __props.seo.title)}${_scopeId}><meta name="twitter:description"${ssrRenderAttr("content", description.value)}${_scopeId}><meta name="twitter:image"${ssrRenderAttr("content", image.value)}${_scopeId}>`);
            if (__props.seo.publishedAt) {
              _push2(`<meta property="article:published_time"${ssrRenderAttr("content", __props.seo.publishedAt)}${_scopeId}>`);
            } else {
              _push2(`<!---->`);
            }
            if (__props.seo.updatedAt) {
              _push2(`<meta property="article:modified_time"${ssrRenderAttr("content", __props.seo.updatedAt)}${_scopeId}>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`<!--[-->`);
            ssrRenderList(jsonLdBlocks.value, (schema, index) => {
              ssrRenderVNode(_push2, createVNode(resolveDynamicComponent("script"), {
                key: `schema-${index}`,
                type: "application/ld+json"
              }, null), _parent2, _scopeId);
            });
            _push2(`<!--]-->`);
          } else {
            return [
              createVNode("title", null, toDisplayString(__props.seo.title), 1),
              createVNode("meta", {
                name: "description",
                content: description.value
              }, null, 8, ["content"]),
              createVNode("meta", {
                name: "robots",
                content: __props.seo.robots
              }, null, 8, ["content"]),
              keywords.value ? (openBlock(), createBlock("meta", {
                key: 0,
                name: "keywords",
                content: keywords.value
              }, null, 8, ["content"])) : createCommentVNode("", true),
              createVNode("link", {
                rel: "canonical",
                href: url.value
              }, null, 8, ["href"]),
              createVNode("meta", {
                property: "og:site_name",
                content: siteName.value
              }, null, 8, ["content"]),
              createVNode("meta", {
                property: "og:title",
                content: __props.seo.title
              }, null, 8, ["content"]),
              createVNode("meta", {
                property: "og:description",
                content: description.value
              }, null, 8, ["content"]),
              createVNode("meta", {
                property: "og:type",
                content: __props.seo.type
              }, null, 8, ["content"]),
              createVNode("meta", {
                property: "og:url",
                content: url.value
              }, null, 8, ["content"]),
              createVNode("meta", {
                property: "og:image",
                content: image.value
              }, null, 8, ["content"]),
              createVNode("meta", {
                name: "twitter:card",
                content: "summary_large_image"
              }),
              createVNode("meta", {
                name: "twitter:title",
                content: __props.seo.title
              }, null, 8, ["content"]),
              createVNode("meta", {
                name: "twitter:description",
                content: description.value
              }, null, 8, ["content"]),
              createVNode("meta", {
                name: "twitter:image",
                content: image.value
              }, null, 8, ["content"]),
              __props.seo.publishedAt ? (openBlock(), createBlock("meta", {
                key: 1,
                property: "article:published_time",
                content: __props.seo.publishedAt
              }, null, 8, ["content"])) : createCommentVNode("", true),
              __props.seo.updatedAt ? (openBlock(), createBlock("meta", {
                key: 2,
                property: "article:modified_time",
                content: __props.seo.updatedAt
              }, null, 8, ["content"])) : createCommentVNode("", true),
              (openBlock(true), createBlock(Fragment, null, renderList(jsonLdBlocks.value, (schema, index) => {
                return openBlock(), createBlock(resolveDynamicComponent("script"), {
                  key: `schema-${index}`,
                  type: "application/ld+json",
                  innerHTML: JSON.stringify(schema)
                }, null, 8, ["innerHTML"]);
              }), 128))
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Components/SeoHead.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  _sfc_main as _
};

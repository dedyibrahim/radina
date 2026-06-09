import { ref, computed, watch, onBeforeUnmount, mergeProps, unref, withCtx, createTextVNode, createVNode, toDisplayString, useSSRContext, openBlock, createBlock, createCommentVNode, withDirectives, withModifiers, vModelText, Fragment, renderList, vShow, vModelSelect, vModelCheckbox } from "vue";
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent, ssrRenderSlot, ssrRenderClass, ssrRenderAttr, ssrRenderList, ssrRenderStyle, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual } from "vue/server-renderer";
import { usePage, Link, useForm, router } from "@inertiajs/vue3";
import { _ as _sfc_main$3 } from "./PaginationLinks-DDGWEAke.js";
import { _ as _sfc_main$2 } from "./SeoHead-B3gH-eD3.js";
const _sfc_main$1 = {
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
        { key: "licenses", label: "Lisensi", description: "Kelola lisensi aplikasi" },
        { key: "users", label: "Pengguna", description: "Atur admin dan penulis" }
      ] : []
    ]);
    watch(drawerOpen, (isOpen) => {
      document.body.style.overflow = isOpen ? "hidden" : "";
    });
    onBeforeUnmount(() => {
      document.body.style.overflow = "";
    });
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen bg-slate-100 lg:pr-72" }, _attrs))}><header class="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur"><div class="flex min-h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8"><div class="min-w-0"><p class="truncate text-lg font-bold text-slate-950">Dashboard Radina News</p><p class="text-xs text-slate-500">${ssrInterpolate(__props.isAdmin ? "Administrator" : "Penulis")}</p></div><div class="flex items-center gap-2">`);
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
      _push(`<button type="button" class="grid h-10 w-10 place-items-center rounded-lg bg-slate-950 text-white lg:hidden" aria-label="Buka menu dashboard"><svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M4 6h16M4 12h16M4 18h16"></path></svg></button></div></div></header><main class="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">`);
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</main>`);
      if (drawerOpen.value) {
        _push(`<div class="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden"></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<aside class="${ssrRenderClass([{ "translate-x-0": drawerOpen.value }, "fixed inset-y-0 right-0 z-50 flex w-72 translate-x-full flex-col border-l border-slate-800 bg-slate-950 text-slate-300 shadow-2xl transition-transform duration-300 lg:translate-x-0"])}"><div class="flex items-center justify-between border-b border-white/10 p-5">`);
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
      _push(`<button type="button" class="text-slate-400 lg:hidden" aria-label="Tutup menu"><svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M6 6l12 12M18 6 6 18"></path></svg></button></div><nav class="flex-1 space-y-2 overflow-y-auto p-4"><!--[-->`);
      ssrRenderList(menuItems.value, (item) => {
        _push(`<button type="button" class="${ssrRenderClass([__props.activeSection === item.key ? "bg-blue-600 text-white shadow-lg shadow-blue-950/40" : "text-slate-300 hover:bg-white/5 hover:text-white", "w-full rounded-xl px-4 py-3 text-left transition"])}"><span class="block text-sm font-bold">${ssrInterpolate(item.label)}</span><span class="${ssrRenderClass([__props.activeSection === item.key ? "text-blue-100" : "text-slate-500", "mt-1 block text-xs"])}">${ssrInterpolate(item.description)}</span></button>`);
      });
      _push(`<!--]--></nav><div class="border-t border-white/10 p-4"><div class="rounded-xl bg-white/5 p-4"><div class="flex items-center gap-3"><span class="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-blue-600 font-bold text-white">${ssrInterpolate((_b = (_a = user.value.name) == null ? void 0 : _a.charAt(0)) == null ? void 0 : _b.toUpperCase())}</span><div class="min-w-0"><p class="truncate text-sm font-bold text-white">${ssrInterpolate(user.value.name)}</p><p class="truncate text-xs text-slate-400">${ssrInterpolate(user.value.email)}</p></div></div><div class="mt-3 flex items-center justify-between"><span class="rounded-full bg-blue-500/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-300">${ssrInterpolate(user.value.role === "admin" ? "Admin" : "Penulis")}</span><button type="button" class="text-xs font-semibold text-rose-300 hover:text-rose-200"> Keluar </button></div></div></div></aside></div>`);
    };
  }
};
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Layouts/AdminLayout.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = {
  __name: "Dashboard",
  __ssrInlineRender: true,
  props: {
    seo: Object,
    stats: Object,
    newsStats: Object,
    categories: Array,
    editCategory: {
      type: Object,
      default: null
    },
    storeCategoryUrl: String,
    recentNews: Array,
    storeNewsUrl: String,
    defaultCoverImage: String,
    activeSection: String,
    isAdmin: Boolean,
    licenses: Object,
    editLicense: {
      type: Object,
      default: null
    },
    formDefaults: Object,
    users: Array,
    editUser: {
      type: Object,
      default: null
    },
    storeUserUrl: String
  },
  setup(__props) {
    const props = __props;
    const page = usePage();
    const flashStatus = computed(() => {
      var _a;
      return ((_a = page.props.flash) == null ? void 0 : _a.status) || "";
    });
    const newLicenseKey = computed(() => {
      var _a;
      return ((_a = page.props.flash) == null ? void 0 : _a.newLicenseKey) || "";
    });
    const currentAuthor = computed(() => {
      var _a;
      return ((_a = page.props.auth) == null ? void 0 : _a.user) || null;
    });
    const isEditMode = computed(() => !!props.editLicense);
    const activePanel = ref(props.activeSection || "news");
    const newsFileInput = ref(null);
    const categoryFileInput = ref(null);
    const isCategoryEditMode = computed(() => !!props.editCategory);
    const isUserEditMode = computed(() => !!props.editUser);
    const form = useForm({
      customer_name: props.formDefaults.customer_name,
      product_name: props.formDefaults.product_name,
      max_activations: props.formDefaults.max_activations,
      expires_at: props.formDefaults.expires_at,
      notes: props.formDefaults.notes
    });
    const newsDefaults = () => {
      var _a;
      return {
        category_id: ((_a = props.categories[0]) == null ? void 0 : _a.id) || "",
        title: "",
        title_en: "",
        excerpt: "",
        excerpt_en: "",
        content: "",
        content_en: "",
        cover_image: null,
        cover_image_url: props.defaultCoverImage,
        cover_image_alt: "",
        cover_image_alt_en: "",
        status: "draft",
        is_featured: false,
        published_at: "",
        seo_title: "",
        seo_title_en: "",
        seo_description: "",
        seo_description_en: "",
        seo_keywords: "",
        seo_keywords_en: "",
        tags: "",
        redirect_to: "dashboard"
      };
    };
    const newsForm = useForm(newsDefaults());
    const categoryDefaults = () => ({
      name: "",
      name_en: "",
      description: "",
      description_en: "",
      accent_color: "#2563EB",
      cover_image: null,
      cover_image_url: "",
      seo_title: "",
      seo_title_en: "",
      seo_description: "",
      seo_description_en: ""
    });
    const categoryForm = useForm(categoryDefaults());
    const userDefaults = () => ({
      name: "",
      email: "",
      role: "writer",
      password: "",
      password_confirmation: ""
    });
    const userForm = useForm(userDefaults());
    const hydrateForm = () => {
      var _a, _b, _c, _d, _e;
      form.customer_name = ((_a = props.editLicense) == null ? void 0 : _a.customerName) || props.formDefaults.customer_name;
      form.product_name = ((_b = props.editLicense) == null ? void 0 : _b.productName) || props.formDefaults.product_name;
      form.max_activations = ((_c = props.editLicense) == null ? void 0 : _c.maxActivations) || props.formDefaults.max_activations;
      form.expires_at = ((_d = props.editLicense) == null ? void 0 : _d.expiresAt) || props.formDefaults.expires_at;
      form.notes = ((_e = props.editLicense) == null ? void 0 : _e.notes) || props.formDefaults.notes;
      form.clearErrors();
    };
    watch(() => props.editLicense, hydrateForm, { immediate: true });
    const hydrateCategoryForm = () => {
      const category = props.editCategory;
      Object.assign(categoryForm, category ? {
        name: category.name || "",
        name_en: category.nameEn || "",
        description: category.description || "",
        description_en: category.descriptionEn || "",
        accent_color: category.accentColor || "#2563EB",
        cover_image: null,
        cover_image_url: category.coverImage || "",
        seo_title: category.seoTitle || "",
        seo_title_en: category.seoTitleEn || "",
        seo_description: category.seoDescription || "",
        seo_description_en: category.seoDescriptionEn || ""
      } : categoryDefaults());
      categoryForm.clearErrors();
    };
    watch(() => props.editCategory, hydrateCategoryForm, { immediate: true });
    const hydrateUserForm = () => {
      Object.assign(userForm, props.editUser ? {
        name: props.editUser.name,
        email: props.editUser.email,
        role: props.editUser.role,
        password: "",
        password_confirmation: ""
      } : userDefaults());
      userForm.clearErrors();
    };
    watch(() => props.editUser, hydrateUserForm, { immediate: true });
    const submit = () => {
      if (props.editLicense) {
        form.patch(props.editLicense.updateUrl, { preserveScroll: true });
        return;
      }
      form.post("/licenses", {
        preserveScroll: true,
        onSuccess: () => form.reset("customer_name", "expires_at", "notes")
      });
    };
    const selectNewsFile = (event) => {
      var _a;
      newsForm.cover_image = ((_a = event.target.files) == null ? void 0 : _a[0]) || null;
    };
    const submitNews = () => {
      newsForm.transform((data) => ({
        ...data,
        is_featured: data.is_featured ? 1 : 0
      })).post(props.storeNewsUrl, {
        forceFormData: true,
        preserveScroll: true,
        onSuccess: () => {
          newsForm.reset();
          Object.assign(newsForm, newsDefaults());
          if (newsFileInput.value) {
            newsFileInput.value.value = "";
          }
        }
      });
    };
    const selectCategoryFile = (event) => {
      var _a;
      categoryForm.cover_image = ((_a = event.target.files) == null ? void 0 : _a[0]) || null;
    };
    const submitCategory = () => {
      categoryForm.transform((data) => ({
        ...data,
        ...isCategoryEditMode.value ? { _method: "patch" } : {}
      })).post(isCategoryEditMode.value ? props.editCategory.updateUrl : props.storeCategoryUrl, {
        forceFormData: true,
        preserveScroll: true,
        onSuccess: () => {
          if (!isCategoryEditMode.value) {
            categoryForm.reset();
            Object.assign(categoryForm, categoryDefaults());
          }
          if (categoryFileInput.value) {
            categoryFileInput.value.value = "";
          }
        }
      });
    };
    const copyText = async (value) => {
      var _a;
      if ((_a = navigator == null ? void 0 : navigator.clipboard) == null ? void 0 : _a.writeText) {
        await navigator.clipboard.writeText(value);
      }
    };
    const toggleStatus = (license) => {
      router.patch(license.toggleUrl, {}, { preserveScroll: true });
    };
    const removeLicense = (license) => {
      if (window.confirm(`Hapus lisensi ${license.key}? Tindakan ini tidak bisa dibatalkan.`)) {
        router.delete(license.destroyUrl, { preserveScroll: true });
      }
    };
    const removeCategory = (category) => {
      if (category.articlesCount > 0) {
        window.alert(`Kategori "${category.name}" masih digunakan oleh ${category.articlesCount} berita.`);
        return;
      }
      if (window.confirm(`Hapus kategori "${category.name}"?`)) {
        router.delete(category.destroyUrl, { preserveScroll: true });
      }
    };
    const submitUser = () => {
      if (isUserEditMode.value) {
        userForm.patch(props.editUser.updateUrl, { preserveScroll: true });
        return;
      }
      userForm.post(props.storeUserUrl, {
        preserveScroll: true,
        onSuccess: () => {
          userForm.reset();
          Object.assign(userForm, userDefaults());
        }
      });
    };
    const removeUser = (account) => {
      var _a;
      if (account.id === ((_a = currentAuthor.value) == null ? void 0 : _a.id)) {
        window.alert("Akun yang sedang digunakan tidak dapat dihapus.");
        return;
      }
      if (account.articlesCount > 0) {
        window.alert(`Akun "${account.name}" masih memiliki ${account.articlesCount} artikel.`);
        return;
      }
      if (window.confirm(`Hapus akun "${account.name}"?`)) {
        router.delete(account.destroyUrl, { preserveScroll: true });
      }
    };
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(_sfc_main$1, mergeProps({
        "active-section": activePanel.value,
        "is-admin": __props.isAdmin,
        onNavigate: ($event) => activePanel.value = $event
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j;
          if (_push2) {
            _push2(ssrRenderComponent(_sfc_main$2, { seo: __props.seo }, null, _parent2, _scopeId));
            _push2(`<section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"${_scopeId}><div class="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between"${_scopeId}><div${_scopeId}><span class="news-kicker"${_scopeId}>Panel Pengelola</span><h1 class="mt-4 text-4xl font-semibold sm:text-5xl"${_scopeId}>Dashboard Radina News</h1><p class="mt-3 max-w-2xl text-sm leading-7 text-slate-600"${_scopeId}>${ssrInterpolate(__props.isAdmin ? "Kelola berita, kategori, lisensi, dan pengguna dari satu dashboard." : "Tulis artikel baru dan kirimkan sebagai draft untuk diperiksa admin.")}</p></div><div class="flex flex-wrap gap-3"${_scopeId}>`);
            _push2(ssrRenderComponent(unref(Link), {
              href: "/",
              class: "rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:border-blue-300 hover:text-blue-700"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(` Lihat Portal `);
                } else {
                  return [
                    createTextVNode(" Lihat Portal ")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</div></div></section>`);
            if (flashStatus.value) {
              _push2(`<section class="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800"${_scopeId}>${ssrInterpolate(flashStatus.value)}</section>`);
            } else {
              _push2(`<!---->`);
            }
            if (newLicenseKey.value && activePanel.value === "licenses") {
              _push2(`<section class="mt-4 rounded-xl border border-blue-200 bg-blue-50 px-5 py-4"${_scopeId}><div class="flex flex-wrap items-center justify-between gap-3"${_scopeId}><div${_scopeId}><p class="text-xs font-bold uppercase tracking-[0.16em] text-blue-700"${_scopeId}>Lisensi baru</p><p class="mt-2 font-mono text-base text-slate-900"${_scopeId}>${ssrInterpolate(newLicenseKey.value)}</p></div><button type="button" class="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm"${_scopeId}> Copy Key </button></div></section>`);
            } else {
              _push2(`<!---->`);
            }
            if (__props.isAdmin) {
              _push2(`<section class="mt-6" style="${ssrRenderStyle(activePanel.value === "categories" ? null : { display: "none" })}"${_scopeId}><div class="mb-6 grid gap-4 sm:grid-cols-3"${_scopeId}><div class="admin-stat"${_scopeId}><span${_scopeId}>Total kategori</span><strong${_scopeId}>${ssrInterpolate(__props.categories.length)}</strong></div><div class="admin-stat"${_scopeId}><span${_scopeId}>Kategori aktif</span><strong${_scopeId}>${ssrInterpolate(__props.categories.filter((category) => category.articlesCount > 0).length)}</strong></div><div class="admin-stat"${_scopeId}><span${_scopeId}>Total artikel</span><strong${_scopeId}>${ssrInterpolate(__props.categories.reduce((total, category) => total + category.articlesCount, 0))}</strong></div></div><div class="grid gap-6 xl:grid-cols-[minmax(0,480px)_minmax(0,1fr)]"${_scopeId}><div class="rounded-2xl border border-slate-200 bg-white p-6"${_scopeId}><div class="flex items-start justify-between gap-4"${_scopeId}><div${_scopeId}><h2 class="text-2xl font-semibold"${_scopeId}>${ssrInterpolate(isCategoryEditMode.value ? "Edit Kategori" : "Buat Kategori")}</h2><p class="mt-2 text-sm leading-6 text-slate-500"${_scopeId}> Informasi kategori ini tampil pada menu, halaman kategori, dan hasil pencarian. </p></div>`);
              if (isCategoryEditMode.value) {
                _push2(ssrRenderComponent(unref(Link), {
                  href: "/dashboard?section=categories",
                  class: "text-sm font-semibold text-blue-700"
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(` Batal `);
                    } else {
                      return [
                        createTextVNode(" Batal ")
                      ];
                    }
                  }),
                  _: 1
                }, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div><form class="mt-6 space-y-5"${_scopeId}><div class="grid gap-4 sm:grid-cols-2"${_scopeId}><div${_scopeId}><label class="admin-label"${_scopeId}>Nama Indonesia</label><input${ssrRenderAttr("value", unref(categoryForm).name)} type="text" class="admin-input"${_scopeId}>`);
              if (unref(categoryForm).errors.name) {
                _push2(`<p class="admin-error"${_scopeId}>${ssrInterpolate(unref(categoryForm).errors.name)}</p>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div><div${_scopeId}><label class="admin-label"${_scopeId}>English Name</label><input${ssrRenderAttr("value", unref(categoryForm).name_en)} type="text" class="admin-input"${_scopeId}>`);
              if (unref(categoryForm).errors.name_en) {
                _push2(`<p class="admin-error"${_scopeId}>${ssrInterpolate(unref(categoryForm).errors.name_en)}</p>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div></div><div${_scopeId}><label class="admin-label"${_scopeId}>Deskripsi Indonesia</label><textarea rows="4" class="admin-input"${_scopeId}>${ssrInterpolate(unref(categoryForm).description)}</textarea>`);
              if (unref(categoryForm).errors.description) {
                _push2(`<p class="admin-error"${_scopeId}>${ssrInterpolate(unref(categoryForm).errors.description)}</p>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div><div${_scopeId}><label class="admin-label"${_scopeId}>English Description</label><textarea rows="4" class="admin-input"${_scopeId}>${ssrInterpolate(unref(categoryForm).description_en)}</textarea>`);
              if (unref(categoryForm).errors.description_en) {
                _push2(`<p class="admin-error"${_scopeId}>${ssrInterpolate(unref(categoryForm).errors.description_en)}</p>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div><div${_scopeId}><label class="admin-label"${_scopeId}>Warna kategori</label><div class="flex items-center gap-3"${_scopeId}><input${ssrRenderAttr("value", unref(categoryForm).accent_color)} type="color" class="h-11 w-14 cursor-pointer rounded-lg border border-slate-300 bg-white p-1"${_scopeId}><input${ssrRenderAttr("value", unref(categoryForm).accent_color)} type="text" class="admin-input" placeholder="#2563EB"${_scopeId}></div>`);
              if (unref(categoryForm).errors.accent_color) {
                _push2(`<p class="admin-error"${_scopeId}>${ssrInterpolate(unref(categoryForm).errors.accent_color)}</p>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div><div class="rounded-xl border border-slate-200 p-4"${_scopeId}><h3 class="font-semibold text-slate-900"${_scopeId}>Gambar Kategori</h3><div class="mt-4 space-y-4"${_scopeId}><div${_scopeId}><label class="admin-label"${_scopeId}>Upload gambar</label><input type="file" accept="image/*" class="admin-input"${_scopeId}></div><div${_scopeId}><label class="admin-label"${_scopeId}>Atau URL/path gambar</label><input${ssrRenderAttr("value", unref(categoryForm).cover_image_url)} type="text" class="admin-input"${_scopeId}></div>`);
              if (unref(categoryForm).cover_image_url) {
                _push2(`<img${ssrRenderAttr("src", unref(categoryForm).cover_image_url)} alt="" class="aspect-video w-full rounded-xl object-cover"${_scopeId}>`);
              } else {
                _push2(`<!---->`);
              }
              if (unref(categoryForm).errors.cover_image || unref(categoryForm).errors.cover_image_url) {
                _push2(`<p class="admin-error"${_scopeId}>${ssrInterpolate(unref(categoryForm).errors.cover_image || unref(categoryForm).errors.cover_image_url)}</p>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div></div><details class="rounded-xl border border-slate-200 p-4"${_scopeId}><summary class="cursor-pointer text-sm font-semibold text-slate-800"${_scopeId}>Pengaturan SEO Kategori</summary><div class="mt-4 grid gap-4"${_scopeId}><input${ssrRenderAttr("value", unref(categoryForm).seo_title)} type="text" class="admin-input" placeholder="SEO title Indonesia"${_scopeId}><textarea rows="2" class="admin-input" placeholder="SEO description Indonesia"${_scopeId}>${ssrInterpolate(unref(categoryForm).seo_description)}</textarea><input${ssrRenderAttr("value", unref(categoryForm).seo_title_en)} type="text" class="admin-input" placeholder="SEO title English"${_scopeId}><textarea rows="2" class="admin-input" placeholder="SEO description English"${_scopeId}>${ssrInterpolate(unref(categoryForm).seo_description_en)}</textarea></div></details><button type="submit" class="w-full rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:opacity-60"${ssrIncludeBooleanAttr(unref(categoryForm).processing) ? " disabled" : ""}${_scopeId}>${ssrInterpolate(unref(categoryForm).processing ? "Menyimpan..." : isCategoryEditMode.value ? "Simpan Kategori" : "Buat Kategori")}</button></form></div><div class="overflow-hidden rounded-2xl border border-slate-200 bg-white"${_scopeId}><div class="border-b border-slate-200 px-6 py-5"${_scopeId}><h2 class="text-2xl font-semibold"${_scopeId}>Daftar Kategori</h2><p class="mt-1 text-sm text-slate-500"${_scopeId}>Kategori berikut diambil langsung dari database.</p></div><div class="grid gap-4 p-5 md:grid-cols-2"${_scopeId}><!--[-->`);
              ssrRenderList(__props.categories, (category) => {
                _push2(`<article class="overflow-hidden rounded-2xl border border-slate-200 bg-white"${_scopeId}><div class="relative aspect-[16/8] bg-slate-100"${_scopeId}>`);
                if (category.coverImage) {
                  _push2(`<img${ssrRenderAttr("src", category.coverImage)}${ssrRenderAttr("alt", category.name)} class="h-full w-full object-cover"${_scopeId}>`);
                } else {
                  _push2(`<div class="grid h-full place-items-center text-sm text-slate-400"${_scopeId}>Belum ada gambar</div>`);
                }
                _push2(`<span class="absolute bottom-3 left-3 rounded-full px-3 py-1 text-xs font-bold text-white shadow-sm" style="${ssrRenderStyle({ backgroundColor: category.accentColor })}"${_scopeId}>${ssrInterpolate(category.articlesCount)} artikel </span></div><div class="p-4"${_scopeId}><div class="flex items-start justify-between gap-3"${_scopeId}><div${_scopeId}><h3 class="font-bold text-slate-950"${_scopeId}>${ssrInterpolate(category.name)}</h3>`);
                if (category.nameEn) {
                  _push2(`<p class="mt-0.5 text-xs text-slate-500"${_scopeId}>${ssrInterpolate(category.nameEn)}</p>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</div><span class="mt-1 h-3 w-3 shrink-0 rounded-full" style="${ssrRenderStyle({ backgroundColor: category.accentColor })}"${_scopeId}></span></div><p class="mt-3 line-clamp-3 text-sm leading-6 text-slate-600"${_scopeId}>${ssrInterpolate(category.description || "Belum ada deskripsi kategori.")}</p><div class="mt-4 flex flex-wrap gap-2"${_scopeId}><a${ssrRenderAttr("href", category.publicUrl)} target="_blank" class="admin-action"${_scopeId}>Lihat</a>`);
                _push2(ssrRenderComponent(unref(Link), {
                  href: category.editUrl,
                  class: "admin-action"
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`Edit`);
                    } else {
                      return [
                        createTextVNode("Edit")
                      ];
                    }
                  }),
                  _: 2
                }, _parent2, _scopeId));
                _push2(`<button type="button" class="admin-action text-rose-700 disabled:cursor-not-allowed disabled:opacity-40"${ssrIncludeBooleanAttr(category.articlesCount > 0) ? " disabled" : ""}${_scopeId}> Hapus </button></div></div></article>`);
              });
              _push2(`<!--]--></div></div></div></section>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`<section class="mt-6" style="${ssrRenderStyle(activePanel.value === "news" ? null : { display: "none" })}"${_scopeId}><div class="mb-6 grid gap-4 sm:grid-cols-3"${_scopeId}><div class="admin-stat"${_scopeId}><span${_scopeId}>Total berita</span><strong${_scopeId}>${ssrInterpolate(__props.newsStats.total)}</strong></div><div class="admin-stat"${_scopeId}><span${_scopeId}>Published</span><strong${_scopeId}>${ssrInterpolate(__props.newsStats.published)}</strong></div><div class="admin-stat"${_scopeId}><span${_scopeId}>Draft</span><strong${_scopeId}>${ssrInterpolate(__props.newsStats.draft)}</strong></div></div><div class="grid gap-6 xl:grid-cols-[minmax(0,560px)_minmax(0,1fr)]"${_scopeId}><div class="rounded-2xl border border-slate-200 bg-white p-6"${_scopeId}><h2 class="text-2xl font-semibold"${_scopeId}>Buat Berita</h2><p class="mt-2 text-sm text-slate-500"${_scopeId}>Kolom Indonesia wajib. Bahasa Inggris dan SEO dapat dilengkapi bila diperlukan.</p><div class="mt-4 flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3"${_scopeId}><span class="grid h-9 w-9 place-items-center rounded-full bg-blue-700 text-sm font-bold text-white"${_scopeId}>${ssrInterpolate((_c = (_b = (_a = currentAuthor.value) == null ? void 0 : _a.name) == null ? void 0 : _b.charAt(0)) == null ? void 0 : _c.toUpperCase())}</span><div class="min-w-0"${_scopeId}><p class="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-700"${_scopeId}>Penulis dari session login</p><p class="truncate text-sm font-semibold text-slate-900"${_scopeId}>${ssrInterpolate((_d = currentAuthor.value) == null ? void 0 : _d.name)}</p><p class="truncate text-xs text-slate-500"${_scopeId}>${ssrInterpolate((_e = currentAuthor.value) == null ? void 0 : _e.email)}</p></div></div><form class="mt-6 space-y-5"${_scopeId}><div class="grid gap-4 sm:grid-cols-2"${_scopeId}><div${_scopeId}><label class="admin-label"${_scopeId}>Kategori</label><select class="admin-input"${_scopeId}><!--[-->`);
            ssrRenderList(__props.categories, (category) => {
              _push2(`<option${ssrRenderAttr("value", category.id)}${ssrIncludeBooleanAttr(Array.isArray(unref(newsForm).category_id) ? ssrLooseContain(unref(newsForm).category_id, category.id) : ssrLooseEqual(unref(newsForm).category_id, category.id)) ? " selected" : ""}${_scopeId}>${ssrInterpolate(category.name)}</option>`);
            });
            _push2(`<!--]--></select>`);
            if (unref(newsForm).errors.category_id) {
              _push2(`<p class="admin-error"${_scopeId}>${ssrInterpolate(unref(newsForm).errors.category_id)}</p>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div>`);
            if (__props.isAdmin) {
              _push2(`<div${_scopeId}><label class="admin-label"${_scopeId}>Status</label><select class="admin-input"${_scopeId}><option value="draft"${ssrIncludeBooleanAttr(Array.isArray(unref(newsForm).status) ? ssrLooseContain(unref(newsForm).status, "draft") : ssrLooseEqual(unref(newsForm).status, "draft")) ? " selected" : ""}${_scopeId}>Draft</option><option value="published"${ssrIncludeBooleanAttr(Array.isArray(unref(newsForm).status) ? ssrLooseContain(unref(newsForm).status, "published") : ssrLooseEqual(unref(newsForm).status, "published")) ? " selected" : ""}${_scopeId}>Published</option></select></div>`);
            } else {
              _push2(`<div${_scopeId}><label class="admin-label"${_scopeId}>Status</label><div class="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800"${_scopeId}> Draft — menunggu pemeriksaan admin </div></div>`);
            }
            _push2(`</div><div${_scopeId}><label class="admin-label"${_scopeId}>Judul berita</label><input${ssrRenderAttr("value", unref(newsForm).title)} type="text" class="admin-input"${_scopeId}>`);
            if (unref(newsForm).errors.title) {
              _push2(`<p class="admin-error"${_scopeId}>${ssrInterpolate(unref(newsForm).errors.title)}</p>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div><div${_scopeId}><label class="admin-label"${_scopeId}>Ringkasan</label><textarea rows="3" class="admin-input"${_scopeId}>${ssrInterpolate(unref(newsForm).excerpt)}</textarea>`);
            if (unref(newsForm).errors.excerpt) {
              _push2(`<p class="admin-error"${_scopeId}>${ssrInterpolate(unref(newsForm).errors.excerpt)}</p>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div><div${_scopeId}><label class="admin-label"${_scopeId}>Isi berita</label><textarea rows="10" class="admin-input" placeholder="Tulis isi berita di sini..."${_scopeId}>${ssrInterpolate(unref(newsForm).content)}</textarea>`);
            if (unref(newsForm).errors.content) {
              _push2(`<p class="admin-error"${_scopeId}>${ssrInterpolate(unref(newsForm).errors.content)}</p>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div><details class="rounded-xl border border-slate-200 p-4"${_scopeId}><summary class="cursor-pointer text-sm font-semibold text-slate-800"${_scopeId}>Versi Bahasa Inggris</summary><div class="mt-4 space-y-4"${_scopeId}><div${_scopeId}><label class="admin-label"${_scopeId}>English title</label><input${ssrRenderAttr("value", unref(newsForm).title_en)} type="text" class="admin-input"${_scopeId}></div><div${_scopeId}><label class="admin-label"${_scopeId}>English excerpt</label><textarea rows="3" class="admin-input"${_scopeId}>${ssrInterpolate(unref(newsForm).excerpt_en)}</textarea></div><div${_scopeId}><label class="admin-label"${_scopeId}>English content</label><textarea rows="8" class="admin-input"${_scopeId}>${ssrInterpolate(unref(newsForm).content_en)}</textarea></div></div></details><div class="rounded-xl border border-slate-200 p-4"${_scopeId}><h3 class="font-semibold text-slate-900"${_scopeId}>Gambar Berita</h3><div class="mt-4 space-y-4"${_scopeId}><div${_scopeId}><label class="admin-label"${_scopeId}>Upload gambar</label><input type="file" accept="image/*" class="admin-input"${_scopeId}></div><div${_scopeId}><label class="admin-label"${_scopeId}>Atau URL/path gambar</label><input${ssrRenderAttr("value", unref(newsForm).cover_image_url)} type="text" class="admin-input"${_scopeId}></div><div class="grid gap-4 sm:grid-cols-2"${_scopeId}><div${_scopeId}><label class="admin-label"${_scopeId}>Alt gambar</label><input${ssrRenderAttr("value", unref(newsForm).cover_image_alt)} type="text" class="admin-input"${_scopeId}></div><div${_scopeId}><label class="admin-label"${_scopeId}>Alt image EN</label><input${ssrRenderAttr("value", unref(newsForm).cover_image_alt_en)} type="text" class="admin-input"${_scopeId}></div></div>`);
            if (unref(newsForm).cover_image_url) {
              _push2(`<img${ssrRenderAttr("src", unref(newsForm).cover_image_url)} alt="" class="aspect-video w-full rounded-xl object-cover"${_scopeId}>`);
            } else {
              _push2(`<!---->`);
            }
            if (unref(newsForm).errors.cover_image || unref(newsForm).errors.cover_image_url) {
              _push2(`<p class="admin-error"${_scopeId}>${ssrInterpolate(unref(newsForm).errors.cover_image || unref(newsForm).errors.cover_image_url)}</p>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div></div>`);
            if (__props.isAdmin) {
              _push2(`<div class="grid gap-4 sm:grid-cols-2"${_scopeId}><div${_scopeId}><label class="admin-label"${_scopeId}>Tanggal terbit</label><input${ssrRenderAttr("value", unref(newsForm).published_at)} type="datetime-local" class="admin-input"${_scopeId}></div><label class="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700"${_scopeId}><input${ssrIncludeBooleanAttr(Array.isArray(unref(newsForm).is_featured) ? ssrLooseContain(unref(newsForm).is_featured, null) : unref(newsForm).is_featured) ? " checked" : ""} type="checkbox" class="rounded border-slate-300 text-blue-700 focus:ring-blue-500"${_scopeId}> Featured di homepage </label></div>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`<div${_scopeId}><label class="admin-label"${_scopeId}>Tags</label><input${ssrRenderAttr("value", unref(newsForm).tags)} type="text" class="admin-input" placeholder="Teknologi, Bisnis, Nasional"${_scopeId}></div>`);
            if (__props.isAdmin) {
              _push2(`<details class="rounded-xl border border-slate-200 p-4"${_scopeId}><summary class="cursor-pointer text-sm font-semibold text-slate-800"${_scopeId}>Pengaturan SEO</summary><div class="mt-4 grid gap-4"${_scopeId}><input${ssrRenderAttr("value", unref(newsForm).seo_title)} type="text" class="admin-input" placeholder="SEO title Indonesia"${_scopeId}><textarea rows="2" class="admin-input" placeholder="SEO description Indonesia"${_scopeId}>${ssrInterpolate(unref(newsForm).seo_description)}</textarea><input${ssrRenderAttr("value", unref(newsForm).seo_keywords)} type="text" class="admin-input" placeholder="keyword, indonesia"${_scopeId}><input${ssrRenderAttr("value", unref(newsForm).seo_title_en)} type="text" class="admin-input" placeholder="SEO title English"${_scopeId}><textarea rows="2" class="admin-input" placeholder="SEO description English"${_scopeId}>${ssrInterpolate(unref(newsForm).seo_description_en)}</textarea><input${ssrRenderAttr("value", unref(newsForm).seo_keywords_en)} type="text" class="admin-input" placeholder="keywords, english"${_scopeId}></div></details>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`<button type="submit" class="w-full rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60"${ssrIncludeBooleanAttr(unref(newsForm).processing) ? " disabled" : ""}${_scopeId}>${ssrInterpolate(unref(newsForm).processing ? "Menyimpan..." : "Buat Berita")}</button></form></div><div class="overflow-hidden rounded-2xl border border-slate-200 bg-white"${_scopeId}><div class="flex items-center justify-between gap-4 border-b border-slate-200 px-6 py-5"${_scopeId}><div${_scopeId}><h2 class="text-2xl font-semibold"${_scopeId}>Berita Terbaru</h2><p class="mt-1 text-sm text-slate-500"${_scopeId}>Artikel yang terakhir diperbarui.</p></div>`);
            if (__props.isAdmin) {
              _push2(ssrRenderComponent(unref(Link), {
                href: "/dashboard/berita",
                class: "text-sm font-semibold text-blue-700"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`Kelola semua`);
                  } else {
                    return [
                      createTextVNode("Kelola semua")
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div><div class="divide-y divide-slate-100"${_scopeId}><!--[-->`);
            ssrRenderList(__props.recentNews, (article) => {
              _push2(`<article class="grid gap-4 p-5 sm:grid-cols-[100px_minmax(0,1fr)]"${_scopeId}><img${ssrRenderAttr("src", article.coverImage)}${ssrRenderAttr("alt", article.title)} class="aspect-video w-full rounded-xl object-cover sm:aspect-square"${_scopeId}><div class="min-w-0"${_scopeId}><p class="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500"${_scopeId}>${ssrInterpolate(article.categoryName)} · <span class="${ssrRenderClass(article.status === "published" ? "text-emerald-700" : "text-amber-700")}"${_scopeId}>${ssrInterpolate(article.status)}</span></p><h3 class="mt-2 font-semibold leading-6 text-slate-950"${_scopeId}>${ssrInterpolate(article.title)}</h3><p class="mt-1 text-xs text-slate-500"${_scopeId}>${ssrInterpolate(article.updatedAt)} · ${ssrInterpolate(article.authorName)}</p><div class="mt-3 flex gap-2"${_scopeId}>`);
              if (article.status === "published") {
                _push2(`<a${ssrRenderAttr("href", article.publicUrl)} target="_blank" class="admin-action"${_scopeId}>Lihat</a>`);
              } else {
                _push2(`<!---->`);
              }
              if (article.editUrl) {
                _push2(ssrRenderComponent(unref(Link), {
                  href: article.editUrl,
                  class: "admin-action"
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`Edit`);
                    } else {
                      return [
                        createTextVNode("Edit")
                      ];
                    }
                  }),
                  _: 2
                }, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div></div></article>`);
            });
            _push2(`<!--]--></div></div></div></section>`);
            if (__props.isAdmin) {
              _push2(`<section class="mt-6" style="${ssrRenderStyle(activePanel.value === "licenses" ? null : { display: "none" })}"${_scopeId}><div class="mb-6 grid gap-4 sm:grid-cols-3"${_scopeId}><div class="admin-stat"${_scopeId}><span${_scopeId}>Total lisensi</span><strong${_scopeId}>${ssrInterpolate(__props.stats.total)}</strong></div><div class="admin-stat"${_scopeId}><span${_scopeId}>Aktif</span><strong${_scopeId}>${ssrInterpolate(__props.stats.active)}</strong></div><div class="admin-stat"${_scopeId}><span${_scopeId}>Expired</span><strong${_scopeId}>${ssrInterpolate(__props.stats.expired)}</strong></div></div><div class="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]"${_scopeId}><div class="rounded-2xl border border-slate-200 bg-white p-6"${_scopeId}><div class="flex items-start justify-between gap-4"${_scopeId}><div${_scopeId}><h2 class="text-2xl font-semibold"${_scopeId}>${ssrInterpolate(isEditMode.value ? "Edit Lisensi" : "Tambah Lisensi")}</h2><p class="mt-2 text-sm text-slate-500"${_scopeId}>${ssrInterpolate(isEditMode.value ? "Perbarui lisensi yang dipilih." : "Buat key lisensi baru.")}</p></div>`);
              if (isEditMode.value) {
                _push2(ssrRenderComponent(unref(Link), {
                  href: "/dashboard?section=licenses",
                  class: "text-sm font-semibold text-blue-700"
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`Batal`);
                    } else {
                      return [
                        createTextVNode("Batal")
                      ];
                    }
                  }),
                  _: 1
                }, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div><form class="mt-6 space-y-4"${_scopeId}><div${_scopeId}><label class="mb-1.5 block text-sm font-semibold text-slate-700"${_scopeId}>Nama Customer</label><input${ssrRenderAttr("value", unref(form).customer_name)} type="text" class="admin-input"${_scopeId}>`);
              if (unref(form).errors.customer_name) {
                _push2(`<p class="mt-1 text-xs text-rose-600"${_scopeId}>${ssrInterpolate(unref(form).errors.customer_name)}</p>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div><div${_scopeId}><label class="mb-1.5 block text-sm font-semibold text-slate-700"${_scopeId}>Nama Produk</label><input${ssrRenderAttr("value", unref(form).product_name)} type="text" class="admin-input"${_scopeId}>`);
              if (unref(form).errors.product_name) {
                _push2(`<p class="mt-1 text-xs text-rose-600"${_scopeId}>${ssrInterpolate(unref(form).errors.product_name)}</p>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div><div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-1"${_scopeId}><div${_scopeId}><label class="mb-1.5 block text-sm font-semibold text-slate-700"${_scopeId}>Maks Aktivasi</label><input${ssrRenderAttr("value", unref(form).max_activations)} type="number" min="1" max="1000" class="admin-input"${_scopeId}></div><div${_scopeId}><label class="mb-1.5 block text-sm font-semibold text-slate-700"${_scopeId}>Tanggal Berakhir</label><input${ssrRenderAttr("value", unref(form).expires_at)} type="date" class="admin-input"${_scopeId}></div></div><div${_scopeId}><label class="mb-1.5 block text-sm font-semibold text-slate-700"${_scopeId}>Catatan</label><textarea rows="3" class="admin-input"${_scopeId}>${ssrInterpolate(unref(form).notes)}</textarea></div><button type="submit" class="w-full rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800"${ssrIncludeBooleanAttr(unref(form).processing) ? " disabled" : ""}${_scopeId}>${ssrInterpolate(unref(form).processing ? "Menyimpan..." : isEditMode.value ? "Simpan Perubahan" : "Tambah Lisensi")}</button></form></div><div class="overflow-hidden rounded-2xl border border-slate-200 bg-white"${_scopeId}><div class="border-b border-slate-200 px-6 py-5"${_scopeId}><h2 class="text-2xl font-semibold"${_scopeId}>Daftar Lisensi</h2><p class="mt-1 text-sm text-slate-500"${_scopeId}>Kelola key, status, dan masa aktif lisensi.</p></div><div class="overflow-x-auto"${_scopeId}><table class="min-w-full text-left text-sm"${_scopeId}><thead class="bg-slate-50 text-xs uppercase tracking-[0.12em] text-slate-500"${_scopeId}><tr${_scopeId}><th class="px-5 py-4"${_scopeId}>Key / Customer</th><th class="px-5 py-4"${_scopeId}>Status</th><th class="px-5 py-4"${_scopeId}>Aktivasi</th><th class="px-5 py-4"${_scopeId}>Expired</th><th class="px-5 py-4"${_scopeId}>Aksi</th></tr></thead><tbody class="divide-y divide-slate-100"${_scopeId}><!--[-->`);
              ssrRenderList(__props.licenses.data, (license) => {
                _push2(`<tr class="align-top"${_scopeId}><td class="px-5 py-4"${_scopeId}><p class="font-mono text-xs font-semibold text-slate-900"${_scopeId}>${ssrInterpolate(license.key)}</p><p class="mt-1 font-semibold text-slate-800"${_scopeId}>${ssrInterpolate(license.customerName)}</p><p class="text-xs text-slate-500"${_scopeId}>${ssrInterpolate(license.productName)}</p></td><td class="px-5 py-4"${_scopeId}><span class="${ssrRenderClass([{
                  "bg-emerald-100 text-emerald-800": license.statusTone === "emerald",
                  "bg-amber-100 text-amber-800": license.statusTone === "amber",
                  "bg-rose-100 text-rose-800": license.statusTone === "rose"
                }, "rounded-full px-2.5 py-1 text-xs font-semibold"])}"${_scopeId}>${ssrInterpolate(license.statusLabel)}</span></td><td class="px-5 py-4 text-slate-700"${_scopeId}>${ssrInterpolate(license.activationsCount)} / ${ssrInterpolate(license.maxActivations)}</td><td class="px-5 py-4 text-slate-600"${_scopeId}>${ssrInterpolate(license.expiresAt || "Never")}</td><td class="px-5 py-4"${_scopeId}><div class="flex flex-wrap gap-2"${_scopeId}><button type="button" class="admin-action"${_scopeId}>Copy</button>`);
                _push2(ssrRenderComponent(unref(Link), {
                  href: license.editUrl,
                  class: "admin-action"
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`Edit`);
                    } else {
                      return [
                        createTextVNode("Edit")
                      ];
                    }
                  }),
                  _: 2
                }, _parent2, _scopeId));
                _push2(`<button type="button" class="admin-action"${_scopeId}>${ssrInterpolate(license.status === "active" ? "Nonaktifkan" : "Aktifkan")}</button><button type="button" class="admin-action text-rose-700"${_scopeId}>Hapus</button></div></td></tr>`);
              });
              _push2(`<!--]--></tbody></table></div><div class="border-t border-slate-200 px-6 py-5"${_scopeId}>`);
              _push2(ssrRenderComponent(_sfc_main$3, {
                links: __props.licenses.links
              }, null, _parent2, _scopeId));
              _push2(`</div></div></div></section>`);
            } else {
              _push2(`<!---->`);
            }
            if (__props.isAdmin) {
              _push2(`<section class="mt-6" style="${ssrRenderStyle(activePanel.value === "users" ? null : { display: "none" })}"${_scopeId}><div class="mb-6 grid gap-4 sm:grid-cols-3"${_scopeId}><div class="admin-stat"${_scopeId}><span${_scopeId}>Total pengguna</span><strong${_scopeId}>${ssrInterpolate(__props.users.length)}</strong></div><div class="admin-stat"${_scopeId}><span${_scopeId}>Admin</span><strong${_scopeId}>${ssrInterpolate(__props.users.filter((account) => account.role === "admin").length)}</strong></div><div class="admin-stat"${_scopeId}><span${_scopeId}>Penulis</span><strong${_scopeId}>${ssrInterpolate(__props.users.filter((account) => account.role === "writer").length)}</strong></div></div><div class="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]"${_scopeId}><div class="rounded-2xl border border-slate-200 bg-white p-6"${_scopeId}><div class="flex items-start justify-between gap-4"${_scopeId}><div${_scopeId}><h2 class="text-2xl font-semibold"${_scopeId}>${ssrInterpolate(isUserEditMode.value ? "Edit Pengguna" : "Tambah Pengguna")}</h2><p class="mt-2 text-sm text-slate-500"${_scopeId}>Admin memiliki akses penuh. Penulis hanya dapat mengirim tulisan.</p></div>`);
              if (isUserEditMode.value) {
                _push2(ssrRenderComponent(unref(Link), {
                  href: "/dashboard?section=users",
                  class: "text-sm font-semibold text-blue-700"
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`Batal`);
                    } else {
                      return [
                        createTextVNode("Batal")
                      ];
                    }
                  }),
                  _: 1
                }, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div><form class="mt-6 space-y-4"${_scopeId}><div${_scopeId}><label class="admin-label"${_scopeId}>Nama</label><input${ssrRenderAttr("value", unref(userForm).name)} type="text" class="admin-input"${_scopeId}>`);
              if (unref(userForm).errors.name) {
                _push2(`<p class="admin-error"${_scopeId}>${ssrInterpolate(unref(userForm).errors.name)}</p>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div><div${_scopeId}><label class="admin-label"${_scopeId}>Email Login</label><input${ssrRenderAttr("value", unref(userForm).email)} type="email" class="admin-input"${_scopeId}>`);
              if (unref(userForm).errors.email) {
                _push2(`<p class="admin-error"${_scopeId}>${ssrInterpolate(unref(userForm).errors.email)}</p>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div><div${_scopeId}><label class="admin-label"${_scopeId}>Level Akses</label><select class="admin-input"${_scopeId}><option value="admin"${ssrIncludeBooleanAttr(Array.isArray(unref(userForm).role) ? ssrLooseContain(unref(userForm).role, "admin") : ssrLooseEqual(unref(userForm).role, "admin")) ? " selected" : ""}${_scopeId}>Admin</option><option value="writer"${ssrIncludeBooleanAttr(Array.isArray(unref(userForm).role) ? ssrLooseContain(unref(userForm).role, "writer") : ssrLooseEqual(unref(userForm).role, "writer")) ? " selected" : ""}${_scopeId}>Penulis</option></select>`);
              if (unref(userForm).errors.role) {
                _push2(`<p class="admin-error"${_scopeId}>${ssrInterpolate(unref(userForm).errors.role)}</p>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div><div${_scopeId}><label class="admin-label"${_scopeId}>${ssrInterpolate(isUserEditMode.value ? "Password baru (opsional)" : "Password")}</label><input${ssrRenderAttr("value", unref(userForm).password)} type="password" class="admin-input"${_scopeId}>`);
              if (unref(userForm).errors.password) {
                _push2(`<p class="admin-error"${_scopeId}>${ssrInterpolate(unref(userForm).errors.password)}</p>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div><div${_scopeId}><label class="admin-label"${_scopeId}>Konfirmasi Password</label><input${ssrRenderAttr("value", unref(userForm).password_confirmation)} type="password" class="admin-input"${_scopeId}></div><button type="submit" class="w-full rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800"${ssrIncludeBooleanAttr(unref(userForm).processing) ? " disabled" : ""}${_scopeId}>${ssrInterpolate(unref(userForm).processing ? "Menyimpan..." : isUserEditMode.value ? "Simpan Pengguna" : "Tambah Pengguna")}</button></form></div><div class="overflow-hidden rounded-2xl border border-slate-200 bg-white"${_scopeId}><div class="border-b border-slate-200 px-6 py-5"${_scopeId}><h2 class="text-2xl font-semibold"${_scopeId}>Daftar Pengguna</h2><p class="mt-1 text-sm text-slate-500"${_scopeId}>Kelola akun dan level akses dashboard.</p></div><div class="overflow-x-auto"${_scopeId}><table class="min-w-full text-left text-sm"${_scopeId}><thead class="bg-slate-50 text-xs uppercase tracking-[0.12em] text-slate-500"${_scopeId}><tr${_scopeId}><th class="px-5 py-4"${_scopeId}>Pengguna</th><th class="px-5 py-4"${_scopeId}>Level</th><th class="px-5 py-4"${_scopeId}>Artikel</th><th class="px-5 py-4"${_scopeId}>Aksi</th></tr></thead><tbody class="divide-y divide-slate-100"${_scopeId}><!--[-->`);
              ssrRenderList(__props.users, (account) => {
                var _a2;
                _push2(`<tr${_scopeId}><td class="px-5 py-4"${_scopeId}><p class="font-semibold text-slate-900"${_scopeId}>${ssrInterpolate(account.name)}</p><p class="text-xs text-slate-500"${_scopeId}>${ssrInterpolate(account.email)}</p></td><td class="px-5 py-4"${_scopeId}><span class="${ssrRenderClass([account.role === "admin" ? "bg-blue-100 text-blue-800" : "bg-emerald-100 text-emerald-800", "rounded-full px-2.5 py-1 text-xs font-bold"])}"${_scopeId}>${ssrInterpolate(account.roleLabel)}</span></td><td class="px-5 py-4 text-slate-600"${_scopeId}>${ssrInterpolate(account.articlesCount)}</td><td class="px-5 py-4"${_scopeId}><div class="flex flex-wrap gap-2"${_scopeId}>`);
                _push2(ssrRenderComponent(unref(Link), {
                  href: account.editUrl,
                  class: "admin-action"
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`Edit`);
                    } else {
                      return [
                        createTextVNode("Edit")
                      ];
                    }
                  }),
                  _: 2
                }, _parent2, _scopeId));
                _push2(`<button type="button" class="admin-action text-rose-700 disabled:opacity-40"${ssrIncludeBooleanAttr(account.id === ((_a2 = currentAuthor.value) == null ? void 0 : _a2.id) || account.articlesCount > 0) ? " disabled" : ""}${_scopeId}> Hapus </button></div></td></tr>`);
              });
              _push2(`<!--]--></tbody></table></div></div></div></section>`);
            } else {
              _push2(`<!---->`);
            }
          } else {
            return [
              createVNode(_sfc_main$2, { seo: __props.seo }, null, 8, ["seo"]),
              createVNode("section", { class: "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8" }, [
                createVNode("div", { class: "flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between" }, [
                  createVNode("div", null, [
                    createVNode("span", { class: "news-kicker" }, "Panel Pengelola"),
                    createVNode("h1", { class: "mt-4 text-4xl font-semibold sm:text-5xl" }, "Dashboard Radina News"),
                    createVNode("p", { class: "mt-3 max-w-2xl text-sm leading-7 text-slate-600" }, toDisplayString(__props.isAdmin ? "Kelola berita, kategori, lisensi, dan pengguna dari satu dashboard." : "Tulis artikel baru dan kirimkan sebagai draft untuk diperiksa admin."), 1)
                  ]),
                  createVNode("div", { class: "flex flex-wrap gap-3" }, [
                    createVNode(unref(Link), {
                      href: "/",
                      class: "rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:border-blue-300 hover:text-blue-700"
                    }, {
                      default: withCtx(() => [
                        createTextVNode(" Lihat Portal ")
                      ]),
                      _: 1
                    })
                  ])
                ])
              ]),
              flashStatus.value ? (openBlock(), createBlock("section", {
                key: 0,
                class: "mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800"
              }, toDisplayString(flashStatus.value), 1)) : createCommentVNode("", true),
              newLicenseKey.value && activePanel.value === "licenses" ? (openBlock(), createBlock("section", {
                key: 1,
                class: "mt-4 rounded-xl border border-blue-200 bg-blue-50 px-5 py-4"
              }, [
                createVNode("div", { class: "flex flex-wrap items-center justify-between gap-3" }, [
                  createVNode("div", null, [
                    createVNode("p", { class: "text-xs font-bold uppercase tracking-[0.16em] text-blue-700" }, "Lisensi baru"),
                    createVNode("p", { class: "mt-2 font-mono text-base text-slate-900" }, toDisplayString(newLicenseKey.value), 1)
                  ]),
                  createVNode("button", {
                    type: "button",
                    class: "rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm",
                    onClick: ($event) => copyText(newLicenseKey.value)
                  }, " Copy Key ", 8, ["onClick"])
                ])
              ])) : createCommentVNode("", true),
              __props.isAdmin ? withDirectives((openBlock(), createBlock("section", {
                key: 2,
                class: "mt-6"
              }, [
                createVNode("div", { class: "mb-6 grid gap-4 sm:grid-cols-3" }, [
                  createVNode("div", { class: "admin-stat" }, [
                    createVNode("span", null, "Total kategori"),
                    createVNode("strong", null, toDisplayString(__props.categories.length), 1)
                  ]),
                  createVNode("div", { class: "admin-stat" }, [
                    createVNode("span", null, "Kategori aktif"),
                    createVNode("strong", null, toDisplayString(__props.categories.filter((category) => category.articlesCount > 0).length), 1)
                  ]),
                  createVNode("div", { class: "admin-stat" }, [
                    createVNode("span", null, "Total artikel"),
                    createVNode("strong", null, toDisplayString(__props.categories.reduce((total, category) => total + category.articlesCount, 0)), 1)
                  ])
                ]),
                createVNode("div", { class: "grid gap-6 xl:grid-cols-[minmax(0,480px)_minmax(0,1fr)]" }, [
                  createVNode("div", { class: "rounded-2xl border border-slate-200 bg-white p-6" }, [
                    createVNode("div", { class: "flex items-start justify-between gap-4" }, [
                      createVNode("div", null, [
                        createVNode("h2", { class: "text-2xl font-semibold" }, toDisplayString(isCategoryEditMode.value ? "Edit Kategori" : "Buat Kategori"), 1),
                        createVNode("p", { class: "mt-2 text-sm leading-6 text-slate-500" }, " Informasi kategori ini tampil pada menu, halaman kategori, dan hasil pencarian. ")
                      ]),
                      isCategoryEditMode.value ? (openBlock(), createBlock(unref(Link), {
                        key: 0,
                        href: "/dashboard?section=categories",
                        class: "text-sm font-semibold text-blue-700"
                      }, {
                        default: withCtx(() => [
                          createTextVNode(" Batal ")
                        ]),
                        _: 1
                      })) : createCommentVNode("", true)
                    ]),
                    createVNode("form", {
                      class: "mt-6 space-y-5",
                      onSubmit: withModifiers(submitCategory, ["prevent"])
                    }, [
                      createVNode("div", { class: "grid gap-4 sm:grid-cols-2" }, [
                        createVNode("div", null, [
                          createVNode("label", { class: "admin-label" }, "Nama Indonesia"),
                          withDirectives(createVNode("input", {
                            "onUpdate:modelValue": ($event) => unref(categoryForm).name = $event,
                            type: "text",
                            class: "admin-input"
                          }, null, 8, ["onUpdate:modelValue"]), [
                            [vModelText, unref(categoryForm).name]
                          ]),
                          unref(categoryForm).errors.name ? (openBlock(), createBlock("p", {
                            key: 0,
                            class: "admin-error"
                          }, toDisplayString(unref(categoryForm).errors.name), 1)) : createCommentVNode("", true)
                        ]),
                        createVNode("div", null, [
                          createVNode("label", { class: "admin-label" }, "English Name"),
                          withDirectives(createVNode("input", {
                            "onUpdate:modelValue": ($event) => unref(categoryForm).name_en = $event,
                            type: "text",
                            class: "admin-input"
                          }, null, 8, ["onUpdate:modelValue"]), [
                            [vModelText, unref(categoryForm).name_en]
                          ]),
                          unref(categoryForm).errors.name_en ? (openBlock(), createBlock("p", {
                            key: 0,
                            class: "admin-error"
                          }, toDisplayString(unref(categoryForm).errors.name_en), 1)) : createCommentVNode("", true)
                        ])
                      ]),
                      createVNode("div", null, [
                        createVNode("label", { class: "admin-label" }, "Deskripsi Indonesia"),
                        withDirectives(createVNode("textarea", {
                          "onUpdate:modelValue": ($event) => unref(categoryForm).description = $event,
                          rows: "4",
                          class: "admin-input"
                        }, null, 8, ["onUpdate:modelValue"]), [
                          [vModelText, unref(categoryForm).description]
                        ]),
                        unref(categoryForm).errors.description ? (openBlock(), createBlock("p", {
                          key: 0,
                          class: "admin-error"
                        }, toDisplayString(unref(categoryForm).errors.description), 1)) : createCommentVNode("", true)
                      ]),
                      createVNode("div", null, [
                        createVNode("label", { class: "admin-label" }, "English Description"),
                        withDirectives(createVNode("textarea", {
                          "onUpdate:modelValue": ($event) => unref(categoryForm).description_en = $event,
                          rows: "4",
                          class: "admin-input"
                        }, null, 8, ["onUpdate:modelValue"]), [
                          [vModelText, unref(categoryForm).description_en]
                        ]),
                        unref(categoryForm).errors.description_en ? (openBlock(), createBlock("p", {
                          key: 0,
                          class: "admin-error"
                        }, toDisplayString(unref(categoryForm).errors.description_en), 1)) : createCommentVNode("", true)
                      ]),
                      createVNode("div", null, [
                        createVNode("label", { class: "admin-label" }, "Warna kategori"),
                        createVNode("div", { class: "flex items-center gap-3" }, [
                          withDirectives(createVNode("input", {
                            "onUpdate:modelValue": ($event) => unref(categoryForm).accent_color = $event,
                            type: "color",
                            class: "h-11 w-14 cursor-pointer rounded-lg border border-slate-300 bg-white p-1"
                          }, null, 8, ["onUpdate:modelValue"]), [
                            [vModelText, unref(categoryForm).accent_color]
                          ]),
                          withDirectives(createVNode("input", {
                            "onUpdate:modelValue": ($event) => unref(categoryForm).accent_color = $event,
                            type: "text",
                            class: "admin-input",
                            placeholder: "#2563EB"
                          }, null, 8, ["onUpdate:modelValue"]), [
                            [vModelText, unref(categoryForm).accent_color]
                          ])
                        ]),
                        unref(categoryForm).errors.accent_color ? (openBlock(), createBlock("p", {
                          key: 0,
                          class: "admin-error"
                        }, toDisplayString(unref(categoryForm).errors.accent_color), 1)) : createCommentVNode("", true)
                      ]),
                      createVNode("div", { class: "rounded-xl border border-slate-200 p-4" }, [
                        createVNode("h3", { class: "font-semibold text-slate-900" }, "Gambar Kategori"),
                        createVNode("div", { class: "mt-4 space-y-4" }, [
                          createVNode("div", null, [
                            createVNode("label", { class: "admin-label" }, "Upload gambar"),
                            createVNode("input", {
                              ref_key: "categoryFileInput",
                              ref: categoryFileInput,
                              type: "file",
                              accept: "image/*",
                              class: "admin-input",
                              onChange: selectCategoryFile
                            }, null, 544)
                          ]),
                          createVNode("div", null, [
                            createVNode("label", { class: "admin-label" }, "Atau URL/path gambar"),
                            withDirectives(createVNode("input", {
                              "onUpdate:modelValue": ($event) => unref(categoryForm).cover_image_url = $event,
                              type: "text",
                              class: "admin-input"
                            }, null, 8, ["onUpdate:modelValue"]), [
                              [vModelText, unref(categoryForm).cover_image_url]
                            ])
                          ]),
                          unref(categoryForm).cover_image_url ? (openBlock(), createBlock("img", {
                            key: 0,
                            src: unref(categoryForm).cover_image_url,
                            alt: "",
                            class: "aspect-video w-full rounded-xl object-cover"
                          }, null, 8, ["src"])) : createCommentVNode("", true),
                          unref(categoryForm).errors.cover_image || unref(categoryForm).errors.cover_image_url ? (openBlock(), createBlock("p", {
                            key: 1,
                            class: "admin-error"
                          }, toDisplayString(unref(categoryForm).errors.cover_image || unref(categoryForm).errors.cover_image_url), 1)) : createCommentVNode("", true)
                        ])
                      ]),
                      createVNode("details", { class: "rounded-xl border border-slate-200 p-4" }, [
                        createVNode("summary", { class: "cursor-pointer text-sm font-semibold text-slate-800" }, "Pengaturan SEO Kategori"),
                        createVNode("div", { class: "mt-4 grid gap-4" }, [
                          withDirectives(createVNode("input", {
                            "onUpdate:modelValue": ($event) => unref(categoryForm).seo_title = $event,
                            type: "text",
                            class: "admin-input",
                            placeholder: "SEO title Indonesia"
                          }, null, 8, ["onUpdate:modelValue"]), [
                            [vModelText, unref(categoryForm).seo_title]
                          ]),
                          withDirectives(createVNode("textarea", {
                            "onUpdate:modelValue": ($event) => unref(categoryForm).seo_description = $event,
                            rows: "2",
                            class: "admin-input",
                            placeholder: "SEO description Indonesia"
                          }, null, 8, ["onUpdate:modelValue"]), [
                            [vModelText, unref(categoryForm).seo_description]
                          ]),
                          withDirectives(createVNode("input", {
                            "onUpdate:modelValue": ($event) => unref(categoryForm).seo_title_en = $event,
                            type: "text",
                            class: "admin-input",
                            placeholder: "SEO title English"
                          }, null, 8, ["onUpdate:modelValue"]), [
                            [vModelText, unref(categoryForm).seo_title_en]
                          ]),
                          withDirectives(createVNode("textarea", {
                            "onUpdate:modelValue": ($event) => unref(categoryForm).seo_description_en = $event,
                            rows: "2",
                            class: "admin-input",
                            placeholder: "SEO description English"
                          }, null, 8, ["onUpdate:modelValue"]), [
                            [vModelText, unref(categoryForm).seo_description_en]
                          ])
                        ])
                      ]),
                      createVNode("button", {
                        type: "submit",
                        class: "w-full rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:opacity-60",
                        disabled: unref(categoryForm).processing
                      }, toDisplayString(unref(categoryForm).processing ? "Menyimpan..." : isCategoryEditMode.value ? "Simpan Kategori" : "Buat Kategori"), 9, ["disabled"])
                    ], 32)
                  ]),
                  createVNode("div", { class: "overflow-hidden rounded-2xl border border-slate-200 bg-white" }, [
                    createVNode("div", { class: "border-b border-slate-200 px-6 py-5" }, [
                      createVNode("h2", { class: "text-2xl font-semibold" }, "Daftar Kategori"),
                      createVNode("p", { class: "mt-1 text-sm text-slate-500" }, "Kategori berikut diambil langsung dari database.")
                    ]),
                    createVNode("div", { class: "grid gap-4 p-5 md:grid-cols-2" }, [
                      (openBlock(true), createBlock(Fragment, null, renderList(__props.categories, (category) => {
                        return openBlock(), createBlock("article", {
                          key: category.id,
                          class: "overflow-hidden rounded-2xl border border-slate-200 bg-white"
                        }, [
                          createVNode("div", { class: "relative aspect-[16/8] bg-slate-100" }, [
                            category.coverImage ? (openBlock(), createBlock("img", {
                              key: 0,
                              src: category.coverImage,
                              alt: category.name,
                              class: "h-full w-full object-cover"
                            }, null, 8, ["src", "alt"])) : (openBlock(), createBlock("div", {
                              key: 1,
                              class: "grid h-full place-items-center text-sm text-slate-400"
                            }, "Belum ada gambar")),
                            createVNode("span", {
                              class: "absolute bottom-3 left-3 rounded-full px-3 py-1 text-xs font-bold text-white shadow-sm",
                              style: { backgroundColor: category.accentColor }
                            }, toDisplayString(category.articlesCount) + " artikel ", 5)
                          ]),
                          createVNode("div", { class: "p-4" }, [
                            createVNode("div", { class: "flex items-start justify-between gap-3" }, [
                              createVNode("div", null, [
                                createVNode("h3", { class: "font-bold text-slate-950" }, toDisplayString(category.name), 1),
                                category.nameEn ? (openBlock(), createBlock("p", {
                                  key: 0,
                                  class: "mt-0.5 text-xs text-slate-500"
                                }, toDisplayString(category.nameEn), 1)) : createCommentVNode("", true)
                              ]),
                              createVNode("span", {
                                class: "mt-1 h-3 w-3 shrink-0 rounded-full",
                                style: { backgroundColor: category.accentColor }
                              }, null, 4)
                            ]),
                            createVNode("p", { class: "mt-3 line-clamp-3 text-sm leading-6 text-slate-600" }, toDisplayString(category.description || "Belum ada deskripsi kategori."), 1),
                            createVNode("div", { class: "mt-4 flex flex-wrap gap-2" }, [
                              createVNode("a", {
                                href: category.publicUrl,
                                target: "_blank",
                                class: "admin-action"
                              }, "Lihat", 8, ["href"]),
                              createVNode(unref(Link), {
                                href: category.editUrl,
                                class: "admin-action"
                              }, {
                                default: withCtx(() => [
                                  createTextVNode("Edit")
                                ]),
                                _: 1
                              }, 8, ["href"]),
                              createVNode("button", {
                                type: "button",
                                class: "admin-action text-rose-700 disabled:cursor-not-allowed disabled:opacity-40",
                                disabled: category.articlesCount > 0,
                                onClick: ($event) => removeCategory(category)
                              }, " Hapus ", 8, ["disabled", "onClick"])
                            ])
                          ])
                        ]);
                      }), 128))
                    ])
                  ])
                ])
              ], 512)), [
                [vShow, activePanel.value === "categories"]
              ]) : createCommentVNode("", true),
              withDirectives(createVNode("section", { class: "mt-6" }, [
                createVNode("div", { class: "mb-6 grid gap-4 sm:grid-cols-3" }, [
                  createVNode("div", { class: "admin-stat" }, [
                    createVNode("span", null, "Total berita"),
                    createVNode("strong", null, toDisplayString(__props.newsStats.total), 1)
                  ]),
                  createVNode("div", { class: "admin-stat" }, [
                    createVNode("span", null, "Published"),
                    createVNode("strong", null, toDisplayString(__props.newsStats.published), 1)
                  ]),
                  createVNode("div", { class: "admin-stat" }, [
                    createVNode("span", null, "Draft"),
                    createVNode("strong", null, toDisplayString(__props.newsStats.draft), 1)
                  ])
                ]),
                createVNode("div", { class: "grid gap-6 xl:grid-cols-[minmax(0,560px)_minmax(0,1fr)]" }, [
                  createVNode("div", { class: "rounded-2xl border border-slate-200 bg-white p-6" }, [
                    createVNode("h2", { class: "text-2xl font-semibold" }, "Buat Berita"),
                    createVNode("p", { class: "mt-2 text-sm text-slate-500" }, "Kolom Indonesia wajib. Bahasa Inggris dan SEO dapat dilengkapi bila diperlukan."),
                    createVNode("div", { class: "mt-4 flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3" }, [
                      createVNode("span", { class: "grid h-9 w-9 place-items-center rounded-full bg-blue-700 text-sm font-bold text-white" }, toDisplayString((_h = (_g = (_f = currentAuthor.value) == null ? void 0 : _f.name) == null ? void 0 : _g.charAt(0)) == null ? void 0 : _h.toUpperCase()), 1),
                      createVNode("div", { class: "min-w-0" }, [
                        createVNode("p", { class: "text-[10px] font-bold uppercase tracking-[0.16em] text-blue-700" }, "Penulis dari session login"),
                        createVNode("p", { class: "truncate text-sm font-semibold text-slate-900" }, toDisplayString((_i = currentAuthor.value) == null ? void 0 : _i.name), 1),
                        createVNode("p", { class: "truncate text-xs text-slate-500" }, toDisplayString((_j = currentAuthor.value) == null ? void 0 : _j.email), 1)
                      ])
                    ]),
                    createVNode("form", {
                      class: "mt-6 space-y-5",
                      onSubmit: withModifiers(submitNews, ["prevent"])
                    }, [
                      createVNode("div", { class: "grid gap-4 sm:grid-cols-2" }, [
                        createVNode("div", null, [
                          createVNode("label", { class: "admin-label" }, "Kategori"),
                          withDirectives(createVNode("select", {
                            "onUpdate:modelValue": ($event) => unref(newsForm).category_id = $event,
                            class: "admin-input"
                          }, [
                            (openBlock(true), createBlock(Fragment, null, renderList(__props.categories, (category) => {
                              return openBlock(), createBlock("option", {
                                key: category.id,
                                value: category.id
                              }, toDisplayString(category.name), 9, ["value"]);
                            }), 128))
                          ], 8, ["onUpdate:modelValue"]), [
                            [vModelSelect, unref(newsForm).category_id]
                          ]),
                          unref(newsForm).errors.category_id ? (openBlock(), createBlock("p", {
                            key: 0,
                            class: "admin-error"
                          }, toDisplayString(unref(newsForm).errors.category_id), 1)) : createCommentVNode("", true)
                        ]),
                        __props.isAdmin ? (openBlock(), createBlock("div", { key: 0 }, [
                          createVNode("label", { class: "admin-label" }, "Status"),
                          withDirectives(createVNode("select", {
                            "onUpdate:modelValue": ($event) => unref(newsForm).status = $event,
                            class: "admin-input"
                          }, [
                            createVNode("option", { value: "draft" }, "Draft"),
                            createVNode("option", { value: "published" }, "Published")
                          ], 8, ["onUpdate:modelValue"]), [
                            [vModelSelect, unref(newsForm).status]
                          ])
                        ])) : (openBlock(), createBlock("div", { key: 1 }, [
                          createVNode("label", { class: "admin-label" }, "Status"),
                          createVNode("div", { class: "rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800" }, " Draft — menunggu pemeriksaan admin ")
                        ]))
                      ]),
                      createVNode("div", null, [
                        createVNode("label", { class: "admin-label" }, "Judul berita"),
                        withDirectives(createVNode("input", {
                          "onUpdate:modelValue": ($event) => unref(newsForm).title = $event,
                          type: "text",
                          class: "admin-input"
                        }, null, 8, ["onUpdate:modelValue"]), [
                          [vModelText, unref(newsForm).title]
                        ]),
                        unref(newsForm).errors.title ? (openBlock(), createBlock("p", {
                          key: 0,
                          class: "admin-error"
                        }, toDisplayString(unref(newsForm).errors.title), 1)) : createCommentVNode("", true)
                      ]),
                      createVNode("div", null, [
                        createVNode("label", { class: "admin-label" }, "Ringkasan"),
                        withDirectives(createVNode("textarea", {
                          "onUpdate:modelValue": ($event) => unref(newsForm).excerpt = $event,
                          rows: "3",
                          class: "admin-input"
                        }, null, 8, ["onUpdate:modelValue"]), [
                          [vModelText, unref(newsForm).excerpt]
                        ]),
                        unref(newsForm).errors.excerpt ? (openBlock(), createBlock("p", {
                          key: 0,
                          class: "admin-error"
                        }, toDisplayString(unref(newsForm).errors.excerpt), 1)) : createCommentVNode("", true)
                      ]),
                      createVNode("div", null, [
                        createVNode("label", { class: "admin-label" }, "Isi berita"),
                        withDirectives(createVNode("textarea", {
                          "onUpdate:modelValue": ($event) => unref(newsForm).content = $event,
                          rows: "10",
                          class: "admin-input",
                          placeholder: "Tulis isi berita di sini..."
                        }, null, 8, ["onUpdate:modelValue"]), [
                          [vModelText, unref(newsForm).content]
                        ]),
                        unref(newsForm).errors.content ? (openBlock(), createBlock("p", {
                          key: 0,
                          class: "admin-error"
                        }, toDisplayString(unref(newsForm).errors.content), 1)) : createCommentVNode("", true)
                      ]),
                      createVNode("details", { class: "rounded-xl border border-slate-200 p-4" }, [
                        createVNode("summary", { class: "cursor-pointer text-sm font-semibold text-slate-800" }, "Versi Bahasa Inggris"),
                        createVNode("div", { class: "mt-4 space-y-4" }, [
                          createVNode("div", null, [
                            createVNode("label", { class: "admin-label" }, "English title"),
                            withDirectives(createVNode("input", {
                              "onUpdate:modelValue": ($event) => unref(newsForm).title_en = $event,
                              type: "text",
                              class: "admin-input"
                            }, null, 8, ["onUpdate:modelValue"]), [
                              [vModelText, unref(newsForm).title_en]
                            ])
                          ]),
                          createVNode("div", null, [
                            createVNode("label", { class: "admin-label" }, "English excerpt"),
                            withDirectives(createVNode("textarea", {
                              "onUpdate:modelValue": ($event) => unref(newsForm).excerpt_en = $event,
                              rows: "3",
                              class: "admin-input"
                            }, null, 8, ["onUpdate:modelValue"]), [
                              [vModelText, unref(newsForm).excerpt_en]
                            ])
                          ]),
                          createVNode("div", null, [
                            createVNode("label", { class: "admin-label" }, "English content"),
                            withDirectives(createVNode("textarea", {
                              "onUpdate:modelValue": ($event) => unref(newsForm).content_en = $event,
                              rows: "8",
                              class: "admin-input"
                            }, null, 8, ["onUpdate:modelValue"]), [
                              [vModelText, unref(newsForm).content_en]
                            ])
                          ])
                        ])
                      ]),
                      createVNode("div", { class: "rounded-xl border border-slate-200 p-4" }, [
                        createVNode("h3", { class: "font-semibold text-slate-900" }, "Gambar Berita"),
                        createVNode("div", { class: "mt-4 space-y-4" }, [
                          createVNode("div", null, [
                            createVNode("label", { class: "admin-label" }, "Upload gambar"),
                            createVNode("input", {
                              ref_key: "newsFileInput",
                              ref: newsFileInput,
                              type: "file",
                              accept: "image/*",
                              class: "admin-input",
                              onChange: selectNewsFile
                            }, null, 544)
                          ]),
                          createVNode("div", null, [
                            createVNode("label", { class: "admin-label" }, "Atau URL/path gambar"),
                            withDirectives(createVNode("input", {
                              "onUpdate:modelValue": ($event) => unref(newsForm).cover_image_url = $event,
                              type: "text",
                              class: "admin-input"
                            }, null, 8, ["onUpdate:modelValue"]), [
                              [vModelText, unref(newsForm).cover_image_url]
                            ])
                          ]),
                          createVNode("div", { class: "grid gap-4 sm:grid-cols-2" }, [
                            createVNode("div", null, [
                              createVNode("label", { class: "admin-label" }, "Alt gambar"),
                              withDirectives(createVNode("input", {
                                "onUpdate:modelValue": ($event) => unref(newsForm).cover_image_alt = $event,
                                type: "text",
                                class: "admin-input"
                              }, null, 8, ["onUpdate:modelValue"]), [
                                [vModelText, unref(newsForm).cover_image_alt]
                              ])
                            ]),
                            createVNode("div", null, [
                              createVNode("label", { class: "admin-label" }, "Alt image EN"),
                              withDirectives(createVNode("input", {
                                "onUpdate:modelValue": ($event) => unref(newsForm).cover_image_alt_en = $event,
                                type: "text",
                                class: "admin-input"
                              }, null, 8, ["onUpdate:modelValue"]), [
                                [vModelText, unref(newsForm).cover_image_alt_en]
                              ])
                            ])
                          ]),
                          unref(newsForm).cover_image_url ? (openBlock(), createBlock("img", {
                            key: 0,
                            src: unref(newsForm).cover_image_url,
                            alt: "",
                            class: "aspect-video w-full rounded-xl object-cover"
                          }, null, 8, ["src"])) : createCommentVNode("", true),
                          unref(newsForm).errors.cover_image || unref(newsForm).errors.cover_image_url ? (openBlock(), createBlock("p", {
                            key: 1,
                            class: "admin-error"
                          }, toDisplayString(unref(newsForm).errors.cover_image || unref(newsForm).errors.cover_image_url), 1)) : createCommentVNode("", true)
                        ])
                      ]),
                      __props.isAdmin ? (openBlock(), createBlock("div", {
                        key: 0,
                        class: "grid gap-4 sm:grid-cols-2"
                      }, [
                        createVNode("div", null, [
                          createVNode("label", { class: "admin-label" }, "Tanggal terbit"),
                          withDirectives(createVNode("input", {
                            "onUpdate:modelValue": ($event) => unref(newsForm).published_at = $event,
                            type: "datetime-local",
                            class: "admin-input"
                          }, null, 8, ["onUpdate:modelValue"]), [
                            [vModelText, unref(newsForm).published_at]
                          ])
                        ]),
                        createVNode("label", { class: "flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700" }, [
                          withDirectives(createVNode("input", {
                            "onUpdate:modelValue": ($event) => unref(newsForm).is_featured = $event,
                            type: "checkbox",
                            class: "rounded border-slate-300 text-blue-700 focus:ring-blue-500"
                          }, null, 8, ["onUpdate:modelValue"]), [
                            [vModelCheckbox, unref(newsForm).is_featured]
                          ]),
                          createTextVNode(" Featured di homepage ")
                        ])
                      ])) : createCommentVNode("", true),
                      createVNode("div", null, [
                        createVNode("label", { class: "admin-label" }, "Tags"),
                        withDirectives(createVNode("input", {
                          "onUpdate:modelValue": ($event) => unref(newsForm).tags = $event,
                          type: "text",
                          class: "admin-input",
                          placeholder: "Teknologi, Bisnis, Nasional"
                        }, null, 8, ["onUpdate:modelValue"]), [
                          [vModelText, unref(newsForm).tags]
                        ])
                      ]),
                      __props.isAdmin ? (openBlock(), createBlock("details", {
                        key: 1,
                        class: "rounded-xl border border-slate-200 p-4"
                      }, [
                        createVNode("summary", { class: "cursor-pointer text-sm font-semibold text-slate-800" }, "Pengaturan SEO"),
                        createVNode("div", { class: "mt-4 grid gap-4" }, [
                          withDirectives(createVNode("input", {
                            "onUpdate:modelValue": ($event) => unref(newsForm).seo_title = $event,
                            type: "text",
                            class: "admin-input",
                            placeholder: "SEO title Indonesia"
                          }, null, 8, ["onUpdate:modelValue"]), [
                            [vModelText, unref(newsForm).seo_title]
                          ]),
                          withDirectives(createVNode("textarea", {
                            "onUpdate:modelValue": ($event) => unref(newsForm).seo_description = $event,
                            rows: "2",
                            class: "admin-input",
                            placeholder: "SEO description Indonesia"
                          }, null, 8, ["onUpdate:modelValue"]), [
                            [vModelText, unref(newsForm).seo_description]
                          ]),
                          withDirectives(createVNode("input", {
                            "onUpdate:modelValue": ($event) => unref(newsForm).seo_keywords = $event,
                            type: "text",
                            class: "admin-input",
                            placeholder: "keyword, indonesia"
                          }, null, 8, ["onUpdate:modelValue"]), [
                            [vModelText, unref(newsForm).seo_keywords]
                          ]),
                          withDirectives(createVNode("input", {
                            "onUpdate:modelValue": ($event) => unref(newsForm).seo_title_en = $event,
                            type: "text",
                            class: "admin-input",
                            placeholder: "SEO title English"
                          }, null, 8, ["onUpdate:modelValue"]), [
                            [vModelText, unref(newsForm).seo_title_en]
                          ]),
                          withDirectives(createVNode("textarea", {
                            "onUpdate:modelValue": ($event) => unref(newsForm).seo_description_en = $event,
                            rows: "2",
                            class: "admin-input",
                            placeholder: "SEO description English"
                          }, null, 8, ["onUpdate:modelValue"]), [
                            [vModelText, unref(newsForm).seo_description_en]
                          ]),
                          withDirectives(createVNode("input", {
                            "onUpdate:modelValue": ($event) => unref(newsForm).seo_keywords_en = $event,
                            type: "text",
                            class: "admin-input",
                            placeholder: "keywords, english"
                          }, null, 8, ["onUpdate:modelValue"]), [
                            [vModelText, unref(newsForm).seo_keywords_en]
                          ])
                        ])
                      ])) : createCommentVNode("", true),
                      createVNode("button", {
                        type: "submit",
                        class: "w-full rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60",
                        disabled: unref(newsForm).processing
                      }, toDisplayString(unref(newsForm).processing ? "Menyimpan..." : "Buat Berita"), 9, ["disabled"])
                    ], 32)
                  ]),
                  createVNode("div", { class: "overflow-hidden rounded-2xl border border-slate-200 bg-white" }, [
                    createVNode("div", { class: "flex items-center justify-between gap-4 border-b border-slate-200 px-6 py-5" }, [
                      createVNode("div", null, [
                        createVNode("h2", { class: "text-2xl font-semibold" }, "Berita Terbaru"),
                        createVNode("p", { class: "mt-1 text-sm text-slate-500" }, "Artikel yang terakhir diperbarui.")
                      ]),
                      __props.isAdmin ? (openBlock(), createBlock(unref(Link), {
                        key: 0,
                        href: "/dashboard/berita",
                        class: "text-sm font-semibold text-blue-700"
                      }, {
                        default: withCtx(() => [
                          createTextVNode("Kelola semua")
                        ]),
                        _: 1
                      })) : createCommentVNode("", true)
                    ]),
                    createVNode("div", { class: "divide-y divide-slate-100" }, [
                      (openBlock(true), createBlock(Fragment, null, renderList(__props.recentNews, (article) => {
                        return openBlock(), createBlock("article", {
                          key: article.id,
                          class: "grid gap-4 p-5 sm:grid-cols-[100px_minmax(0,1fr)]"
                        }, [
                          createVNode("img", {
                            src: article.coverImage,
                            alt: article.title,
                            class: "aspect-video w-full rounded-xl object-cover sm:aspect-square"
                          }, null, 8, ["src", "alt"]),
                          createVNode("div", { class: "min-w-0" }, [
                            createVNode("p", { class: "text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500" }, [
                              createTextVNode(toDisplayString(article.categoryName) + " · ", 1),
                              createVNode("span", {
                                class: article.status === "published" ? "text-emerald-700" : "text-amber-700"
                              }, toDisplayString(article.status), 3)
                            ]),
                            createVNode("h3", { class: "mt-2 font-semibold leading-6 text-slate-950" }, toDisplayString(article.title), 1),
                            createVNode("p", { class: "mt-1 text-xs text-slate-500" }, toDisplayString(article.updatedAt) + " · " + toDisplayString(article.authorName), 1),
                            createVNode("div", { class: "mt-3 flex gap-2" }, [
                              article.status === "published" ? (openBlock(), createBlock("a", {
                                key: 0,
                                href: article.publicUrl,
                                target: "_blank",
                                class: "admin-action"
                              }, "Lihat", 8, ["href"])) : createCommentVNode("", true),
                              article.editUrl ? (openBlock(), createBlock(unref(Link), {
                                key: 1,
                                href: article.editUrl,
                                class: "admin-action"
                              }, {
                                default: withCtx(() => [
                                  createTextVNode("Edit")
                                ]),
                                _: 1
                              }, 8, ["href"])) : createCommentVNode("", true)
                            ])
                          ])
                        ]);
                      }), 128))
                    ])
                  ])
                ])
              ], 512), [
                [vShow, activePanel.value === "news"]
              ]),
              __props.isAdmin ? withDirectives((openBlock(), createBlock("section", {
                key: 3,
                class: "mt-6"
              }, [
                createVNode("div", { class: "mb-6 grid gap-4 sm:grid-cols-3" }, [
                  createVNode("div", { class: "admin-stat" }, [
                    createVNode("span", null, "Total lisensi"),
                    createVNode("strong", null, toDisplayString(__props.stats.total), 1)
                  ]),
                  createVNode("div", { class: "admin-stat" }, [
                    createVNode("span", null, "Aktif"),
                    createVNode("strong", null, toDisplayString(__props.stats.active), 1)
                  ]),
                  createVNode("div", { class: "admin-stat" }, [
                    createVNode("span", null, "Expired"),
                    createVNode("strong", null, toDisplayString(__props.stats.expired), 1)
                  ])
                ]),
                createVNode("div", { class: "grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]" }, [
                  createVNode("div", { class: "rounded-2xl border border-slate-200 bg-white p-6" }, [
                    createVNode("div", { class: "flex items-start justify-between gap-4" }, [
                      createVNode("div", null, [
                        createVNode("h2", { class: "text-2xl font-semibold" }, toDisplayString(isEditMode.value ? "Edit Lisensi" : "Tambah Lisensi"), 1),
                        createVNode("p", { class: "mt-2 text-sm text-slate-500" }, toDisplayString(isEditMode.value ? "Perbarui lisensi yang dipilih." : "Buat key lisensi baru."), 1)
                      ]),
                      isEditMode.value ? (openBlock(), createBlock(unref(Link), {
                        key: 0,
                        href: "/dashboard?section=licenses",
                        class: "text-sm font-semibold text-blue-700"
                      }, {
                        default: withCtx(() => [
                          createTextVNode("Batal")
                        ]),
                        _: 1
                      })) : createCommentVNode("", true)
                    ]),
                    createVNode("form", {
                      class: "mt-6 space-y-4",
                      onSubmit: withModifiers(submit, ["prevent"])
                    }, [
                      createVNode("div", null, [
                        createVNode("label", { class: "mb-1.5 block text-sm font-semibold text-slate-700" }, "Nama Customer"),
                        withDirectives(createVNode("input", {
                          "onUpdate:modelValue": ($event) => unref(form).customer_name = $event,
                          type: "text",
                          class: "admin-input"
                        }, null, 8, ["onUpdate:modelValue"]), [
                          [vModelText, unref(form).customer_name]
                        ]),
                        unref(form).errors.customer_name ? (openBlock(), createBlock("p", {
                          key: 0,
                          class: "mt-1 text-xs text-rose-600"
                        }, toDisplayString(unref(form).errors.customer_name), 1)) : createCommentVNode("", true)
                      ]),
                      createVNode("div", null, [
                        createVNode("label", { class: "mb-1.5 block text-sm font-semibold text-slate-700" }, "Nama Produk"),
                        withDirectives(createVNode("input", {
                          "onUpdate:modelValue": ($event) => unref(form).product_name = $event,
                          type: "text",
                          class: "admin-input"
                        }, null, 8, ["onUpdate:modelValue"]), [
                          [vModelText, unref(form).product_name]
                        ]),
                        unref(form).errors.product_name ? (openBlock(), createBlock("p", {
                          key: 0,
                          class: "mt-1 text-xs text-rose-600"
                        }, toDisplayString(unref(form).errors.product_name), 1)) : createCommentVNode("", true)
                      ]),
                      createVNode("div", { class: "grid gap-4 sm:grid-cols-2 xl:grid-cols-1" }, [
                        createVNode("div", null, [
                          createVNode("label", { class: "mb-1.5 block text-sm font-semibold text-slate-700" }, "Maks Aktivasi"),
                          withDirectives(createVNode("input", {
                            "onUpdate:modelValue": ($event) => unref(form).max_activations = $event,
                            type: "number",
                            min: "1",
                            max: "1000",
                            class: "admin-input"
                          }, null, 8, ["onUpdate:modelValue"]), [
                            [vModelText, unref(form).max_activations]
                          ])
                        ]),
                        createVNode("div", null, [
                          createVNode("label", { class: "mb-1.5 block text-sm font-semibold text-slate-700" }, "Tanggal Berakhir"),
                          withDirectives(createVNode("input", {
                            "onUpdate:modelValue": ($event) => unref(form).expires_at = $event,
                            type: "date",
                            class: "admin-input"
                          }, null, 8, ["onUpdate:modelValue"]), [
                            [vModelText, unref(form).expires_at]
                          ])
                        ])
                      ]),
                      createVNode("div", null, [
                        createVNode("label", { class: "mb-1.5 block text-sm font-semibold text-slate-700" }, "Catatan"),
                        withDirectives(createVNode("textarea", {
                          "onUpdate:modelValue": ($event) => unref(form).notes = $event,
                          rows: "3",
                          class: "admin-input"
                        }, null, 8, ["onUpdate:modelValue"]), [
                          [vModelText, unref(form).notes]
                        ])
                      ]),
                      createVNode("button", {
                        type: "submit",
                        class: "w-full rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800",
                        disabled: unref(form).processing
                      }, toDisplayString(unref(form).processing ? "Menyimpan..." : isEditMode.value ? "Simpan Perubahan" : "Tambah Lisensi"), 9, ["disabled"])
                    ], 32)
                  ]),
                  createVNode("div", { class: "overflow-hidden rounded-2xl border border-slate-200 bg-white" }, [
                    createVNode("div", { class: "border-b border-slate-200 px-6 py-5" }, [
                      createVNode("h2", { class: "text-2xl font-semibold" }, "Daftar Lisensi"),
                      createVNode("p", { class: "mt-1 text-sm text-slate-500" }, "Kelola key, status, dan masa aktif lisensi.")
                    ]),
                    createVNode("div", { class: "overflow-x-auto" }, [
                      createVNode("table", { class: "min-w-full text-left text-sm" }, [
                        createVNode("thead", { class: "bg-slate-50 text-xs uppercase tracking-[0.12em] text-slate-500" }, [
                          createVNode("tr", null, [
                            createVNode("th", { class: "px-5 py-4" }, "Key / Customer"),
                            createVNode("th", { class: "px-5 py-4" }, "Status"),
                            createVNode("th", { class: "px-5 py-4" }, "Aktivasi"),
                            createVNode("th", { class: "px-5 py-4" }, "Expired"),
                            createVNode("th", { class: "px-5 py-4" }, "Aksi")
                          ])
                        ]),
                        createVNode("tbody", { class: "divide-y divide-slate-100" }, [
                          (openBlock(true), createBlock(Fragment, null, renderList(__props.licenses.data, (license) => {
                            return openBlock(), createBlock("tr", {
                              key: license.id,
                              class: "align-top"
                            }, [
                              createVNode("td", { class: "px-5 py-4" }, [
                                createVNode("p", { class: "font-mono text-xs font-semibold text-slate-900" }, toDisplayString(license.key), 1),
                                createVNode("p", { class: "mt-1 font-semibold text-slate-800" }, toDisplayString(license.customerName), 1),
                                createVNode("p", { class: "text-xs text-slate-500" }, toDisplayString(license.productName), 1)
                              ]),
                              createVNode("td", { class: "px-5 py-4" }, [
                                createVNode("span", {
                                  class: ["rounded-full px-2.5 py-1 text-xs font-semibold", {
                                    "bg-emerald-100 text-emerald-800": license.statusTone === "emerald",
                                    "bg-amber-100 text-amber-800": license.statusTone === "amber",
                                    "bg-rose-100 text-rose-800": license.statusTone === "rose"
                                  }]
                                }, toDisplayString(license.statusLabel), 3)
                              ]),
                              createVNode("td", { class: "px-5 py-4 text-slate-700" }, toDisplayString(license.activationsCount) + " / " + toDisplayString(license.maxActivations), 1),
                              createVNode("td", { class: "px-5 py-4 text-slate-600" }, toDisplayString(license.expiresAt || "Never"), 1),
                              createVNode("td", { class: "px-5 py-4" }, [
                                createVNode("div", { class: "flex flex-wrap gap-2" }, [
                                  createVNode("button", {
                                    type: "button",
                                    class: "admin-action",
                                    onClick: ($event) => copyText(license.key)
                                  }, "Copy", 8, ["onClick"]),
                                  createVNode(unref(Link), {
                                    href: license.editUrl,
                                    class: "admin-action"
                                  }, {
                                    default: withCtx(() => [
                                      createTextVNode("Edit")
                                    ]),
                                    _: 1
                                  }, 8, ["href"]),
                                  createVNode("button", {
                                    type: "button",
                                    class: "admin-action",
                                    onClick: ($event) => toggleStatus(license)
                                  }, toDisplayString(license.status === "active" ? "Nonaktifkan" : "Aktifkan"), 9, ["onClick"]),
                                  createVNode("button", {
                                    type: "button",
                                    class: "admin-action text-rose-700",
                                    onClick: ($event) => removeLicense(license)
                                  }, "Hapus", 8, ["onClick"])
                                ])
                              ])
                            ]);
                          }), 128))
                        ])
                      ])
                    ]),
                    createVNode("div", { class: "border-t border-slate-200 px-6 py-5" }, [
                      createVNode(_sfc_main$3, {
                        links: __props.licenses.links
                      }, null, 8, ["links"])
                    ])
                  ])
                ])
              ], 512)), [
                [vShow, activePanel.value === "licenses"]
              ]) : createCommentVNode("", true),
              __props.isAdmin ? withDirectives((openBlock(), createBlock("section", {
                key: 4,
                class: "mt-6"
              }, [
                createVNode("div", { class: "mb-6 grid gap-4 sm:grid-cols-3" }, [
                  createVNode("div", { class: "admin-stat" }, [
                    createVNode("span", null, "Total pengguna"),
                    createVNode("strong", null, toDisplayString(__props.users.length), 1)
                  ]),
                  createVNode("div", { class: "admin-stat" }, [
                    createVNode("span", null, "Admin"),
                    createVNode("strong", null, toDisplayString(__props.users.filter((account) => account.role === "admin").length), 1)
                  ]),
                  createVNode("div", { class: "admin-stat" }, [
                    createVNode("span", null, "Penulis"),
                    createVNode("strong", null, toDisplayString(__props.users.filter((account) => account.role === "writer").length), 1)
                  ])
                ]),
                createVNode("div", { class: "grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]" }, [
                  createVNode("div", { class: "rounded-2xl border border-slate-200 bg-white p-6" }, [
                    createVNode("div", { class: "flex items-start justify-between gap-4" }, [
                      createVNode("div", null, [
                        createVNode("h2", { class: "text-2xl font-semibold" }, toDisplayString(isUserEditMode.value ? "Edit Pengguna" : "Tambah Pengguna"), 1),
                        createVNode("p", { class: "mt-2 text-sm text-slate-500" }, "Admin memiliki akses penuh. Penulis hanya dapat mengirim tulisan.")
                      ]),
                      isUserEditMode.value ? (openBlock(), createBlock(unref(Link), {
                        key: 0,
                        href: "/dashboard?section=users",
                        class: "text-sm font-semibold text-blue-700"
                      }, {
                        default: withCtx(() => [
                          createTextVNode("Batal")
                        ]),
                        _: 1
                      })) : createCommentVNode("", true)
                    ]),
                    createVNode("form", {
                      class: "mt-6 space-y-4",
                      onSubmit: withModifiers(submitUser, ["prevent"])
                    }, [
                      createVNode("div", null, [
                        createVNode("label", { class: "admin-label" }, "Nama"),
                        withDirectives(createVNode("input", {
                          "onUpdate:modelValue": ($event) => unref(userForm).name = $event,
                          type: "text",
                          class: "admin-input"
                        }, null, 8, ["onUpdate:modelValue"]), [
                          [vModelText, unref(userForm).name]
                        ]),
                        unref(userForm).errors.name ? (openBlock(), createBlock("p", {
                          key: 0,
                          class: "admin-error"
                        }, toDisplayString(unref(userForm).errors.name), 1)) : createCommentVNode("", true)
                      ]),
                      createVNode("div", null, [
                        createVNode("label", { class: "admin-label" }, "Email Login"),
                        withDirectives(createVNode("input", {
                          "onUpdate:modelValue": ($event) => unref(userForm).email = $event,
                          type: "email",
                          class: "admin-input"
                        }, null, 8, ["onUpdate:modelValue"]), [
                          [vModelText, unref(userForm).email]
                        ]),
                        unref(userForm).errors.email ? (openBlock(), createBlock("p", {
                          key: 0,
                          class: "admin-error"
                        }, toDisplayString(unref(userForm).errors.email), 1)) : createCommentVNode("", true)
                      ]),
                      createVNode("div", null, [
                        createVNode("label", { class: "admin-label" }, "Level Akses"),
                        withDirectives(createVNode("select", {
                          "onUpdate:modelValue": ($event) => unref(userForm).role = $event,
                          class: "admin-input"
                        }, [
                          createVNode("option", { value: "admin" }, "Admin"),
                          createVNode("option", { value: "writer" }, "Penulis")
                        ], 8, ["onUpdate:modelValue"]), [
                          [vModelSelect, unref(userForm).role]
                        ]),
                        unref(userForm).errors.role ? (openBlock(), createBlock("p", {
                          key: 0,
                          class: "admin-error"
                        }, toDisplayString(unref(userForm).errors.role), 1)) : createCommentVNode("", true)
                      ]),
                      createVNode("div", null, [
                        createVNode("label", { class: "admin-label" }, toDisplayString(isUserEditMode.value ? "Password baru (opsional)" : "Password"), 1),
                        withDirectives(createVNode("input", {
                          "onUpdate:modelValue": ($event) => unref(userForm).password = $event,
                          type: "password",
                          class: "admin-input"
                        }, null, 8, ["onUpdate:modelValue"]), [
                          [vModelText, unref(userForm).password]
                        ]),
                        unref(userForm).errors.password ? (openBlock(), createBlock("p", {
                          key: 0,
                          class: "admin-error"
                        }, toDisplayString(unref(userForm).errors.password), 1)) : createCommentVNode("", true)
                      ]),
                      createVNode("div", null, [
                        createVNode("label", { class: "admin-label" }, "Konfirmasi Password"),
                        withDirectives(createVNode("input", {
                          "onUpdate:modelValue": ($event) => unref(userForm).password_confirmation = $event,
                          type: "password",
                          class: "admin-input"
                        }, null, 8, ["onUpdate:modelValue"]), [
                          [vModelText, unref(userForm).password_confirmation]
                        ])
                      ]),
                      createVNode("button", {
                        type: "submit",
                        class: "w-full rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800",
                        disabled: unref(userForm).processing
                      }, toDisplayString(unref(userForm).processing ? "Menyimpan..." : isUserEditMode.value ? "Simpan Pengguna" : "Tambah Pengguna"), 9, ["disabled"])
                    ], 32)
                  ]),
                  createVNode("div", { class: "overflow-hidden rounded-2xl border border-slate-200 bg-white" }, [
                    createVNode("div", { class: "border-b border-slate-200 px-6 py-5" }, [
                      createVNode("h2", { class: "text-2xl font-semibold" }, "Daftar Pengguna"),
                      createVNode("p", { class: "mt-1 text-sm text-slate-500" }, "Kelola akun dan level akses dashboard.")
                    ]),
                    createVNode("div", { class: "overflow-x-auto" }, [
                      createVNode("table", { class: "min-w-full text-left text-sm" }, [
                        createVNode("thead", { class: "bg-slate-50 text-xs uppercase tracking-[0.12em] text-slate-500" }, [
                          createVNode("tr", null, [
                            createVNode("th", { class: "px-5 py-4" }, "Pengguna"),
                            createVNode("th", { class: "px-5 py-4" }, "Level"),
                            createVNode("th", { class: "px-5 py-4" }, "Artikel"),
                            createVNode("th", { class: "px-5 py-4" }, "Aksi")
                          ])
                        ]),
                        createVNode("tbody", { class: "divide-y divide-slate-100" }, [
                          (openBlock(true), createBlock(Fragment, null, renderList(__props.users, (account) => {
                            var _a2;
                            return openBlock(), createBlock("tr", {
                              key: account.id
                            }, [
                              createVNode("td", { class: "px-5 py-4" }, [
                                createVNode("p", { class: "font-semibold text-slate-900" }, toDisplayString(account.name), 1),
                                createVNode("p", { class: "text-xs text-slate-500" }, toDisplayString(account.email), 1)
                              ]),
                              createVNode("td", { class: "px-5 py-4" }, [
                                createVNode("span", {
                                  class: ["rounded-full px-2.5 py-1 text-xs font-bold", account.role === "admin" ? "bg-blue-100 text-blue-800" : "bg-emerald-100 text-emerald-800"]
                                }, toDisplayString(account.roleLabel), 3)
                              ]),
                              createVNode("td", { class: "px-5 py-4 text-slate-600" }, toDisplayString(account.articlesCount), 1),
                              createVNode("td", { class: "px-5 py-4" }, [
                                createVNode("div", { class: "flex flex-wrap gap-2" }, [
                                  createVNode(unref(Link), {
                                    href: account.editUrl,
                                    class: "admin-action"
                                  }, {
                                    default: withCtx(() => [
                                      createTextVNode("Edit")
                                    ]),
                                    _: 1
                                  }, 8, ["href"]),
                                  createVNode("button", {
                                    type: "button",
                                    class: "admin-action text-rose-700 disabled:opacity-40",
                                    disabled: account.id === ((_a2 = currentAuthor.value) == null ? void 0 : _a2.id) || account.articlesCount > 0,
                                    onClick: ($event) => removeUser(account)
                                  }, " Hapus ", 8, ["disabled", "onClick"])
                                ])
                              ])
                            ]);
                          }), 128))
                        ])
                      ])
                    ])
                  ])
                ])
              ], 512)), [
                [vShow, activePanel.value === "users"]
              ]) : createCommentVNode("", true)
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Admin/Dashboard.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  _sfc_main as default
};

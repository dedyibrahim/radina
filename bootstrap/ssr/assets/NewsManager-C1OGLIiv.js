import { ref, computed, watch, mergeProps, unref, withCtx, createTextVNode, createVNode, openBlock, createBlock, toDisplayString, createCommentVNode, withModifiers, withDirectives, Fragment, renderList, vModelSelect, vModelText, vModelCheckbox, useSSRContext } from "vue";
import { ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderClass } from "vue/server-renderer";
import { usePage, useForm, router, Link } from "@inertiajs/vue3";
import { _ as _sfc_main$3 } from "./PaginationLinks-DDGWEAke.js";
import { _ as _sfc_main$2 } from "./SeoHead-B3gH-eD3.js";
import { _ as _sfc_main$1 } from "./AdminLayout-B5vz3MkO.js";
const _sfc_main = {
  __name: "NewsManager",
  __ssrInlineRender: true,
  props: {
    seo: Object,
    stats: Object,
    categories: Array,
    articleAuthors: Array,
    articles: Object,
    editArticle: {
      type: Object,
      default: null
    },
    storeUrl: String,
    defaultCoverImage: String
  },
  setup(__props) {
    const props = __props;
    const page = usePage();
    const fileInput = ref(null);
    const flashStatus = computed(() => {
      var _a;
      return ((_a = page.props.flash) == null ? void 0 : _a.status) || "";
    });
    const isEditMode = computed(() => !!props.editArticle);
    const currentAuthor = computed(() => {
      var _a;
      return ((_a = page.props.auth) == null ? void 0 : _a.user) || null;
    });
    const defaults = () => {
      var _a, _b;
      return {
        category_id: ((_a = props.categories[0]) == null ? void 0 : _a.id) || "",
        assigned_user_id: ((_b = currentAuthor.value) == null ? void 0 : _b.id) || "",
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
        editorial_status: "pending",
        fact_check_status: "pending",
        review_note: "",
        is_featured: false,
        published_at: "",
        seo_title: "",
        seo_title_en: "",
        seo_description: "",
        seo_description_en: "",
        seo_keywords: "",
        seo_keywords_en: "",
        tags: ""
      };
    };
    const form = useForm(defaults());
    const hydrateForm = () => {
      const article = props.editArticle;
      if (!article) {
        Object.assign(form, defaults());
        form.clearErrors();
        return;
      }
      Object.assign(form, {
        category_id: article.categoryId,
        assigned_user_id: article.assignedUserId,
        title: article.title || "",
        title_en: article.titleEn || "",
        excerpt: article.excerpt || "",
        excerpt_en: article.excerptEn || "",
        content: article.content || "",
        content_en: article.contentEn || "",
        cover_image: null,
        cover_image_url: article.coverImage || "",
        cover_image_alt: article.coverImageAlt || "",
        cover_image_alt_en: article.coverImageAltEn || "",
        status: article.status,
        editorial_status: article.editorialStatus,
        fact_check_status: article.factCheckStatus,
        review_note: article.reviewNote || "",
        is_featured: article.isFeatured,
        published_at: article.publishedAt || "",
        seo_title: article.seoTitle || "",
        seo_title_en: article.seoTitleEn || "",
        seo_description: article.seoDescription || "",
        seo_description_en: article.seoDescriptionEn || "",
        seo_keywords: article.seoKeywords || "",
        seo_keywords_en: article.seoKeywordsEn || "",
        tags: article.tags || ""
      });
      form.clearErrors();
    };
    watch(() => props.editArticle, hydrateForm, { immediate: true });
    const selectFile = (event) => {
      var _a;
      form.cover_image = ((_a = event.target.files) == null ? void 0 : _a[0]) || null;
    };
    const submit = () => {
      form.transform((data) => ({
        ...data,
        ...isEditMode.value ? { _method: "patch" } : {},
        is_featured: data.is_featured ? 1 : 0
      })).post(isEditMode.value ? props.editArticle.updateUrl : props.storeUrl, {
        forceFormData: true,
        preserveScroll: true,
        onSuccess: () => {
          if (!isEditMode.value) {
            form.reset();
            Object.assign(form, defaults());
          }
          if (fileInput.value) {
            fileInput.value.value = "";
          }
        }
      });
    };
    const removeArticle = (article) => {
      if (window.confirm(`Hapus berita "${article.title}"?`)) {
        router.delete(article.destroyUrl, { preserveScroll: true });
      }
    };
    const reassignArticle = (article, authorId, selectElement) => {
      const author = props.articleAuthors.find((candidate) => candidate.id === Number(authorId));
      if (!author || !window.confirm(`Alihkan artikel "${article.title}" kepada ${author.name}?`)) {
        selectElement.value = article.authorId;
        return;
      }
      router.patch(article.reassignUrl, {
        assigned_user_id: author.id
      }, {
        preserveScroll: true,
        onError: () => {
          selectElement.value = article.authorId;
        }
      });
    };
    const approveAndVerify = (article) => {
      if (window.confirm(`Setujui, verifikasi fakta, dan terbitkan "${article.title}"? Honor penulis akan langsung dikreditkan.`)) {
        router.patch(article.reviewUrl, {
          editorial_status: "approved",
          fact_check_status: "verified",
          review_note: ""
        }, { preserveScroll: true });
      }
    };
    const rejectArticle = (article) => {
      const note = window.prompt(`Alasan penolakan artikel "${article.title}":`);
      if (!note) {
        return;
      }
      router.patch(article.reviewUrl, {
        editorial_status: "rejected",
        fact_check_status: "rejected",
        review_note: note
      }, { preserveScroll: true });
    };
    const formatRupiah = (amount) => new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(Number(amount || 0));
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(_sfc_main$1, mergeProps({
        "is-admin": true,
        "active-section": "news",
        onNavigate: ($event) => unref(router).visit(`/dashboard?section=${$event}`)
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l;
          if (_push2) {
            _push2(ssrRenderComponent(_sfc_main$2, { seo: __props.seo }, null, _parent2, _scopeId));
            _push2(`<section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"${_scopeId}><div class="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between"${_scopeId}><div${_scopeId}><span class="news-kicker"${_scopeId}>Panel Berita</span><h1 class="mt-4 text-4xl font-semibold sm:text-5xl"${_scopeId}>Kelola Berita</h1><p class="mt-3 max-w-2xl text-sm leading-7 text-slate-600"${_scopeId}> Buat, edit, terbitkan, dan hapus artikel Indonesia maupun Inggris. </p></div><div class="flex flex-wrap gap-3"${_scopeId}>`);
            _push2(ssrRenderComponent(unref(Link), {
              href: "/dashboard",
              class: "rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:border-blue-300 hover:text-blue-700"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(` Dashboard Utama `);
                } else {
                  return [
                    createTextVNode(" Dashboard Utama ")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(unref(Link), {
              href: "/",
              class: "rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800"
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
            _push2(`<section class="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"${_scopeId}><div class="admin-stat"${_scopeId}><span${_scopeId}>Total</span><strong${_scopeId}>${ssrInterpolate(__props.stats.total)}</strong></div><div class="admin-stat"${_scopeId}><span${_scopeId}>Published</span><strong${_scopeId}>${ssrInterpolate(__props.stats.published)}</strong></div><div class="admin-stat"${_scopeId}><span${_scopeId}>Draft</span><strong${_scopeId}>${ssrInterpolate(__props.stats.draft)}</strong></div><div class="admin-stat"${_scopeId}><span${_scopeId}>Featured</span><strong${_scopeId}>${ssrInterpolate(__props.stats.featured)}</strong></div></section><section class="mt-8 grid gap-6 xl:grid-cols-[minmax(0,520px)_minmax(0,1fr)]"${_scopeId}><div class="rounded-2xl border border-slate-200 bg-white p-6"${_scopeId}><div class="flex items-start justify-between gap-4"${_scopeId}><div${_scopeId}><h2 class="text-2xl font-semibold"${_scopeId}>${ssrInterpolate(isEditMode.value ? "Edit Berita" : "Buat Berita")}</h2><p class="mt-1 text-sm text-slate-500"${_scopeId}>Kolom Indonesia wajib. Kolom Inggris bersifat opsional.</p>`);
            if (!isEditMode.value) {
              _push2(`<p class="mt-2 text-xs font-semibold text-blue-700"${_scopeId}> Penulis: ${ssrInterpolate((_a = currentAuthor.value) == null ? void 0 : _a.name)} (akun login) </p>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div>`);
            if (isEditMode.value) {
              _push2(ssrRenderComponent(unref(Link), {
                href: "/dashboard/berita",
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
            _push2(`</div><form class="mt-6 space-y-5"${_scopeId}><div class="grid gap-4 sm:grid-cols-3"${_scopeId}><div${_scopeId}><label class="admin-label"${_scopeId}>Kategori</label><select class="admin-input"${_scopeId}><!--[-->`);
            ssrRenderList(__props.categories, (category) => {
              _push2(`<option${ssrRenderAttr("value", category.id)}${ssrIncludeBooleanAttr(Array.isArray(unref(form).category_id) ? ssrLooseContain(unref(form).category_id, category.id) : ssrLooseEqual(unref(form).category_id, category.id)) ? " selected" : ""}${_scopeId}>${ssrInterpolate(category.name)}</option>`);
            });
            _push2(`<!--]--></select>`);
            if (unref(form).errors.category_id) {
              _push2(`<p class="admin-error"${_scopeId}>${ssrInterpolate(unref(form).errors.category_id)}</p>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div><div${_scopeId}><label class="admin-label"${_scopeId}>Penulis artikel</label><select class="admin-input"${ssrIncludeBooleanAttr(!!((_b = __props.editArticle) == null ? void 0 : _b.earningAmount)) ? " disabled" : ""}${_scopeId}><!--[-->`);
            ssrRenderList(__props.articleAuthors, (author) => {
              _push2(`<option${ssrRenderAttr("value", author.id)}${ssrIncludeBooleanAttr(Array.isArray(unref(form).assigned_user_id) ? ssrLooseContain(unref(form).assigned_user_id, author.id) : ssrLooseEqual(unref(form).assigned_user_id, author.id)) ? " selected" : ""}${_scopeId}>${ssrInterpolate(author.name)} · ${ssrInterpolate(author.roleLabel)}</option>`);
            });
            _push2(`<!--]--></select>`);
            if (unref(form).errors.assigned_user_id) {
              _push2(`<p class="admin-error"${_scopeId}>${ssrInterpolate(unref(form).errors.assigned_user_id)}</p>`);
            } else {
              _push2(`<p class="mt-1 text-xs text-slate-500"${_scopeId}>${ssrInterpolate(((_c = __props.editArticle) == null ? void 0 : _c.earningAmount) ? "Dikunci karena honor sudah dikreditkan." : "Admin dapat mengalihkan kepemilikan sebelum honor masuk.")}</p>`);
            }
            _push2(`</div><div${_scopeId}><label class="admin-label"${_scopeId}>Status publik</label><div class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700"${_scopeId}>${ssrInterpolate(unref(form).editorial_status === "approved" && unref(form).fact_check_status === "verified" ? "Published" : "Draft")}</div></div></div><div class="rounded-xl border border-blue-200 bg-blue-50/60 p-4"${_scopeId}><h3 class="font-semibold text-slate-900"${_scopeId}>Review Redaksi dan Verifikasi Fakta</h3><p class="mt-1 text-xs leading-5 text-slate-600"${_scopeId}> Artikel hanya diterbitkan dan menghasilkan honor jika editorial disetujui serta fakta terverifikasi. </p><div class="mt-4 grid gap-4 sm:grid-cols-2"${_scopeId}><div${_scopeId}><label class="admin-label"${_scopeId}>Keputusan editorial</label><select class="admin-input"${ssrIncludeBooleanAttr(!!((_d = __props.editArticle) == null ? void 0 : _d.earningAmount)) ? " disabled" : ""}${_scopeId}><option value="pending"${ssrIncludeBooleanAttr(Array.isArray(unref(form).editorial_status) ? ssrLooseContain(unref(form).editorial_status, "pending") : ssrLooseEqual(unref(form).editorial_status, "pending")) ? " selected" : ""}${_scopeId}>Menunggu review</option><option value="approved"${ssrIncludeBooleanAttr(Array.isArray(unref(form).editorial_status) ? ssrLooseContain(unref(form).editorial_status, "approved") : ssrLooseEqual(unref(form).editorial_status, "approved")) ? " selected" : ""}${_scopeId}>Disetujui</option><option value="rejected"${ssrIncludeBooleanAttr(Array.isArray(unref(form).editorial_status) ? ssrLooseContain(unref(form).editorial_status, "rejected") : ssrLooseEqual(unref(form).editorial_status, "rejected")) ? " selected" : ""}${_scopeId}>Ditolak</option></select>`);
            if (unref(form).errors.editorial_status) {
              _push2(`<p class="admin-error"${_scopeId}>${ssrInterpolate(unref(form).errors.editorial_status)}</p>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div><div${_scopeId}><label class="admin-label"${_scopeId}>Verifikasi fakta</label><select class="admin-input"${ssrIncludeBooleanAttr(!!((_e = __props.editArticle) == null ? void 0 : _e.earningAmount)) ? " disabled" : ""}${_scopeId}><option value="pending"${ssrIncludeBooleanAttr(Array.isArray(unref(form).fact_check_status) ? ssrLooseContain(unref(form).fact_check_status, "pending") : ssrLooseEqual(unref(form).fact_check_status, "pending")) ? " selected" : ""}${_scopeId}>Belum diperiksa</option><option value="verified"${ssrIncludeBooleanAttr(Array.isArray(unref(form).fact_check_status) ? ssrLooseContain(unref(form).fact_check_status, "verified") : ssrLooseEqual(unref(form).fact_check_status, "verified")) ? " selected" : ""}${_scopeId}>Terverifikasi</option><option value="rejected"${ssrIncludeBooleanAttr(Array.isArray(unref(form).fact_check_status) ? ssrLooseContain(unref(form).fact_check_status, "rejected") : ssrLooseEqual(unref(form).fact_check_status, "rejected")) ? " selected" : ""}${_scopeId}>Tidak valid</option></select>`);
            if (unref(form).errors.fact_check_status) {
              _push2(`<p class="admin-error"${_scopeId}>${ssrInterpolate(unref(form).errors.fact_check_status)}</p>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div></div><div class="mt-4"${_scopeId}><label class="admin-label"${_scopeId}>Catatan review</label><textarea rows="3" class="admin-input" placeholder="Catatan koreksi atau alasan penolakan"${_scopeId}>${ssrInterpolate(unref(form).review_note)}</textarea></div>`);
            if ((_f = __props.editArticle) == null ? void 0 : _f.earningAmount) {
              _push2(`<div class="mt-4 rounded-lg bg-emerald-100 px-4 py-3 text-sm font-semibold text-emerald-800"${_scopeId}> Honor ${ssrInterpolate(formatRupiah(__props.editArticle.earningAmount))} sudah dikreditkan dan status persetujuan dikunci. </div>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div><div${_scopeId}><label class="admin-label"${_scopeId}>Judul Indonesia</label><input${ssrRenderAttr("value", unref(form).title)} type="text" class="admin-input"${_scopeId}>`);
            if (unref(form).errors.title) {
              _push2(`<p class="admin-error"${_scopeId}>${ssrInterpolate(unref(form).errors.title)}</p>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div><div${_scopeId}><label class="admin-label"${_scopeId}>Ringkasan Indonesia</label><textarea rows="3" class="admin-input"${_scopeId}>${ssrInterpolate(unref(form).excerpt)}</textarea>`);
            if (unref(form).errors.excerpt) {
              _push2(`<p class="admin-error"${_scopeId}>${ssrInterpolate(unref(form).errors.excerpt)}</p>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div><div${_scopeId}><label class="admin-label"${_scopeId}>Konten Indonesia</label><textarea rows="10" class="admin-input font-mono text-xs" placeholder="&lt;p&gt;Isi artikel...&lt;/p&gt;"${_scopeId}>${ssrInterpolate(unref(form).content)}</textarea>`);
            if (unref(form).errors.content) {
              _push2(`<p class="admin-error"${_scopeId}>${ssrInterpolate(unref(form).errors.content)}</p>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div><details class="rounded-xl border border-slate-200 p-4"${_scopeId}><summary class="cursor-pointer text-sm font-semibold text-slate-800"${_scopeId}>Versi Inggris</summary><div class="mt-4 space-y-4"${_scopeId}><div${_scopeId}><label class="admin-label"${_scopeId}>English Title</label><input${ssrRenderAttr("value", unref(form).title_en)} type="text" class="admin-input"${_scopeId}></div><div${_scopeId}><label class="admin-label"${_scopeId}>English Excerpt</label><textarea rows="3" class="admin-input"${_scopeId}>${ssrInterpolate(unref(form).excerpt_en)}</textarea></div><div${_scopeId}><label class="admin-label"${_scopeId}>English Content</label><textarea rows="8" class="admin-input font-mono text-xs"${_scopeId}>${ssrInterpolate(unref(form).content_en)}</textarea></div></div></details><div class="rounded-xl border border-slate-200 p-4"${_scopeId}><h3 class="font-semibold text-slate-900"${_scopeId}>Gambar Berita</h3><div class="mt-4 space-y-4"${_scopeId}><div${_scopeId}><label class="admin-label"${_scopeId}>Upload gambar</label><input type="file" accept="image/*" class="admin-input"${_scopeId}></div><div${_scopeId}><label class="admin-label"${_scopeId}>Atau URL/path gambar</label><input${ssrRenderAttr("value", unref(form).cover_image_url)} type="text" class="admin-input"${_scopeId}></div><div class="grid gap-4 sm:grid-cols-2"${_scopeId}><div${_scopeId}><label class="admin-label"${_scopeId}>Alt gambar</label><input${ssrRenderAttr("value", unref(form).cover_image_alt)} type="text" class="admin-input"${_scopeId}></div><div${_scopeId}><label class="admin-label"${_scopeId}>Alt image EN</label><input${ssrRenderAttr("value", unref(form).cover_image_alt_en)} type="text" class="admin-input"${_scopeId}></div></div>`);
            if (unref(form).cover_image_url) {
              _push2(`<img${ssrRenderAttr("src", unref(form).cover_image_url)} alt="" class="aspect-video w-full rounded-xl object-cover"${_scopeId}>`);
            } else {
              _push2(`<!---->`);
            }
            if (unref(form).errors.cover_image || unref(form).errors.cover_image_url) {
              _push2(`<p class="admin-error"${_scopeId}>${ssrInterpolate(unref(form).errors.cover_image || unref(form).errors.cover_image_url)}</p>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div></div><div class="grid gap-4 sm:grid-cols-2"${_scopeId}><div${_scopeId}><label class="admin-label"${_scopeId}>Tanggal terbit</label><input${ssrRenderAttr("value", unref(form).published_at)} type="datetime-local" class="admin-input"${_scopeId}></div><label class="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700"${_scopeId}><input${ssrIncludeBooleanAttr(Array.isArray(unref(form).is_featured) ? ssrLooseContain(unref(form).is_featured, null) : unref(form).is_featured) ? " checked" : ""} type="checkbox" class="rounded border-slate-300 text-blue-700 focus:ring-blue-500"${_scopeId}> Featured di homepage </label></div><div${_scopeId}><label class="admin-label"${_scopeId}>Tags, pisahkan dengan koma</label><input${ssrRenderAttr("value", unref(form).tags)} type="text" class="admin-input" placeholder="AI, Bisnis, Teknologi"${_scopeId}></div><details class="rounded-xl border border-slate-200 p-4"${_scopeId}><summary class="cursor-pointer text-sm font-semibold text-slate-800"${_scopeId}>SEO</summary><div class="mt-4 grid gap-4"${_scopeId}><input${ssrRenderAttr("value", unref(form).seo_title)} type="text" class="admin-input" placeholder="SEO title Indonesia"${_scopeId}><textarea rows="2" class="admin-input" placeholder="SEO description Indonesia"${_scopeId}>${ssrInterpolate(unref(form).seo_description)}</textarea><input${ssrRenderAttr("value", unref(form).seo_keywords)} type="text" class="admin-input" placeholder="keyword, indonesia"${_scopeId}><input${ssrRenderAttr("value", unref(form).seo_title_en)} type="text" class="admin-input" placeholder="SEO title English"${_scopeId}><textarea rows="2" class="admin-input" placeholder="SEO description English"${_scopeId}>${ssrInterpolate(unref(form).seo_description_en)}</textarea><input${ssrRenderAttr("value", unref(form).seo_keywords_en)} type="text" class="admin-input" placeholder="keywords, english"${_scopeId}></div></details><button type="submit" class="w-full rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800"${ssrIncludeBooleanAttr(unref(form).processing) ? " disabled" : ""}${_scopeId}>${ssrInterpolate(unref(form).processing ? "Menyimpan..." : isEditMode.value ? "Simpan Perubahan" : "Buat Berita")}</button></form></div><div class="overflow-hidden rounded-2xl border border-slate-200 bg-white"${_scopeId}><div class="border-b border-slate-200 px-6 py-5"${_scopeId}><h2 class="text-2xl font-semibold"${_scopeId}>Daftar Berita</h2><p class="mt-1 text-sm text-slate-500"${_scopeId}>Artikel terbaru yang tersimpan di Radina News.</p></div><div class="divide-y divide-slate-100"${_scopeId}><!--[-->`);
            ssrRenderList(__props.articles.data, (article) => {
              _push2(`<article class="grid gap-4 p-5 sm:grid-cols-[120px_minmax(0,1fr)]"${_scopeId}><img${ssrRenderAttr("src", article.coverImage)}${ssrRenderAttr("alt", article.title)} class="aspect-video w-full rounded-xl object-cover sm:aspect-square"${_scopeId}><div class="min-w-0"${_scopeId}><div class="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500"${_scopeId}><span${_scopeId}>${ssrInterpolate(article.categoryName)}</span><span${_scopeId}>/</span><span class="${ssrRenderClass(article.status === "published" ? "text-emerald-700" : "text-amber-700")}"${_scopeId}>${ssrInterpolate(article.status)}</span>`);
              if (article.isFeatured) {
                _push2(`<span class="text-blue-700"${_scopeId}>Featured</span>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div><h3 class="mt-2 text-lg font-semibold leading-6 text-slate-950"${_scopeId}>${ssrInterpolate(article.title)}</h3><p class="mt-1 text-xs text-slate-500"${_scopeId}>Diperbarui ${ssrInterpolate(article.updatedAt)} oleh ${ssrInterpolate(article.authorName)}</p><div class="mt-2 flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-wider"${_scopeId}><span class="rounded-full bg-slate-100 px-2 py-1 text-slate-600"${_scopeId}>Editorial: ${ssrInterpolate(article.editorialStatus)}</span><span class="rounded-full bg-slate-100 px-2 py-1 text-slate-600"${_scopeId}>Fakta: ${ssrInterpolate(article.factCheckStatus)}</span>`);
              if (article.earningAmount) {
                _push2(`<span class="rounded-full bg-emerald-100 px-2 py-1 text-emerald-700"${_scopeId}> Honor ${ssrInterpolate(formatRupiah(article.earningAmount))}</span>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div>`);
              if (article.reviewNote) {
                _push2(`<p class="mt-2 text-xs leading-5 text-slate-500"${_scopeId}>Catatan: ${ssrInterpolate(article.reviewNote)}</p>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`<div class="mt-3"${_scopeId}><label class="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500"${_scopeId}>Alihkan penulis</label><select${ssrRenderAttr("value", article.authorId)} class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"${ssrIncludeBooleanAttr(!!article.earningAmount) ? " disabled" : ""}${_scopeId}><!--[-->`);
              ssrRenderList(__props.articleAuthors, (author) => {
                _push2(`<option${ssrRenderAttr("value", author.id)}${_scopeId}>${ssrInterpolate(author.name)} · ${ssrInterpolate(author.roleLabel)}</option>`);
              });
              _push2(`<!--]--></select></div><div class="mt-4 flex flex-wrap gap-2"${_scopeId}>`);
              if (article.status === "published") {
                _push2(`<a${ssrRenderAttr("href", article.publicUrl)} target="_blank" class="admin-action"${_scopeId}>Lihat</a>`);
              } else {
                _push2(`<!---->`);
              }
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
              if (!article.earningAmount) {
                _push2(`<button type="button" class="admin-action text-emerald-700"${_scopeId}> Setujui &amp; Verifikasi </button>`);
              } else {
                _push2(`<!---->`);
              }
              if (!article.earningAmount) {
                _push2(`<button type="button" class="admin-action text-amber-700"${_scopeId}> Tolak </button>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`<button type="button" class="admin-action text-rose-700"${_scopeId}>Hapus</button></div></div></article>`);
            });
            _push2(`<!--]--></div><div class="border-t border-slate-200 px-6 py-5"${_scopeId}>`);
            _push2(ssrRenderComponent(_sfc_main$3, {
              links: __props.articles.links
            }, null, _parent2, _scopeId));
            _push2(`</div></div></section>`);
          } else {
            return [
              createVNode(_sfc_main$2, { seo: __props.seo }, null, 8, ["seo"]),
              createVNode("section", { class: "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8" }, [
                createVNode("div", { class: "flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between" }, [
                  createVNode("div", null, [
                    createVNode("span", { class: "news-kicker" }, "Panel Berita"),
                    createVNode("h1", { class: "mt-4 text-4xl font-semibold sm:text-5xl" }, "Kelola Berita"),
                    createVNode("p", { class: "mt-3 max-w-2xl text-sm leading-7 text-slate-600" }, " Buat, edit, terbitkan, dan hapus artikel Indonesia maupun Inggris. ")
                  ]),
                  createVNode("div", { class: "flex flex-wrap gap-3" }, [
                    createVNode(unref(Link), {
                      href: "/dashboard",
                      class: "rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:border-blue-300 hover:text-blue-700"
                    }, {
                      default: withCtx(() => [
                        createTextVNode(" Dashboard Utama ")
                      ]),
                      _: 1
                    }),
                    createVNode(unref(Link), {
                      href: "/",
                      class: "rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800"
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
              createVNode("section", { class: "mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" }, [
                createVNode("div", { class: "admin-stat" }, [
                  createVNode("span", null, "Total"),
                  createVNode("strong", null, toDisplayString(__props.stats.total), 1)
                ]),
                createVNode("div", { class: "admin-stat" }, [
                  createVNode("span", null, "Published"),
                  createVNode("strong", null, toDisplayString(__props.stats.published), 1)
                ]),
                createVNode("div", { class: "admin-stat" }, [
                  createVNode("span", null, "Draft"),
                  createVNode("strong", null, toDisplayString(__props.stats.draft), 1)
                ]),
                createVNode("div", { class: "admin-stat" }, [
                  createVNode("span", null, "Featured"),
                  createVNode("strong", null, toDisplayString(__props.stats.featured), 1)
                ])
              ]),
              createVNode("section", { class: "mt-8 grid gap-6 xl:grid-cols-[minmax(0,520px)_minmax(0,1fr)]" }, [
                createVNode("div", { class: "rounded-2xl border border-slate-200 bg-white p-6" }, [
                  createVNode("div", { class: "flex items-start justify-between gap-4" }, [
                    createVNode("div", null, [
                      createVNode("h2", { class: "text-2xl font-semibold" }, toDisplayString(isEditMode.value ? "Edit Berita" : "Buat Berita"), 1),
                      createVNode("p", { class: "mt-1 text-sm text-slate-500" }, "Kolom Indonesia wajib. Kolom Inggris bersifat opsional."),
                      !isEditMode.value ? (openBlock(), createBlock("p", {
                        key: 0,
                        class: "mt-2 text-xs font-semibold text-blue-700"
                      }, " Penulis: " + toDisplayString((_g = currentAuthor.value) == null ? void 0 : _g.name) + " (akun login) ", 1)) : createCommentVNode("", true)
                    ]),
                    isEditMode.value ? (openBlock(), createBlock(unref(Link), {
                      key: 0,
                      href: "/dashboard/berita",
                      class: "text-sm font-semibold text-blue-700"
                    }, {
                      default: withCtx(() => [
                        createTextVNode("Batal")
                      ]),
                      _: 1
                    })) : createCommentVNode("", true)
                  ]),
                  createVNode("form", {
                    class: "mt-6 space-y-5",
                    onSubmit: withModifiers(submit, ["prevent"])
                  }, [
                    createVNode("div", { class: "grid gap-4 sm:grid-cols-3" }, [
                      createVNode("div", null, [
                        createVNode("label", { class: "admin-label" }, "Kategori"),
                        withDirectives(createVNode("select", {
                          "onUpdate:modelValue": ($event) => unref(form).category_id = $event,
                          class: "admin-input"
                        }, [
                          (openBlock(true), createBlock(Fragment, null, renderList(__props.categories, (category) => {
                            return openBlock(), createBlock("option", {
                              key: category.id,
                              value: category.id
                            }, toDisplayString(category.name), 9, ["value"]);
                          }), 128))
                        ], 8, ["onUpdate:modelValue"]), [
                          [vModelSelect, unref(form).category_id]
                        ]),
                        unref(form).errors.category_id ? (openBlock(), createBlock("p", {
                          key: 0,
                          class: "admin-error"
                        }, toDisplayString(unref(form).errors.category_id), 1)) : createCommentVNode("", true)
                      ]),
                      createVNode("div", null, [
                        createVNode("label", { class: "admin-label" }, "Penulis artikel"),
                        withDirectives(createVNode("select", {
                          "onUpdate:modelValue": ($event) => unref(form).assigned_user_id = $event,
                          class: "admin-input",
                          disabled: !!((_h = __props.editArticle) == null ? void 0 : _h.earningAmount)
                        }, [
                          (openBlock(true), createBlock(Fragment, null, renderList(__props.articleAuthors, (author) => {
                            return openBlock(), createBlock("option", {
                              key: author.id,
                              value: author.id
                            }, toDisplayString(author.name) + " · " + toDisplayString(author.roleLabel), 9, ["value"]);
                          }), 128))
                        ], 8, ["onUpdate:modelValue", "disabled"]), [
                          [vModelSelect, unref(form).assigned_user_id]
                        ]),
                        unref(form).errors.assigned_user_id ? (openBlock(), createBlock("p", {
                          key: 0,
                          class: "admin-error"
                        }, toDisplayString(unref(form).errors.assigned_user_id), 1)) : (openBlock(), createBlock("p", {
                          key: 1,
                          class: "mt-1 text-xs text-slate-500"
                        }, toDisplayString(((_i = __props.editArticle) == null ? void 0 : _i.earningAmount) ? "Dikunci karena honor sudah dikreditkan." : "Admin dapat mengalihkan kepemilikan sebelum honor masuk."), 1))
                      ]),
                      createVNode("div", null, [
                        createVNode("label", { class: "admin-label" }, "Status publik"),
                        createVNode("div", { class: "rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700" }, toDisplayString(unref(form).editorial_status === "approved" && unref(form).fact_check_status === "verified" ? "Published" : "Draft"), 1)
                      ])
                    ]),
                    createVNode("div", { class: "rounded-xl border border-blue-200 bg-blue-50/60 p-4" }, [
                      createVNode("h3", { class: "font-semibold text-slate-900" }, "Review Redaksi dan Verifikasi Fakta"),
                      createVNode("p", { class: "mt-1 text-xs leading-5 text-slate-600" }, " Artikel hanya diterbitkan dan menghasilkan honor jika editorial disetujui serta fakta terverifikasi. "),
                      createVNode("div", { class: "mt-4 grid gap-4 sm:grid-cols-2" }, [
                        createVNode("div", null, [
                          createVNode("label", { class: "admin-label" }, "Keputusan editorial"),
                          withDirectives(createVNode("select", {
                            "onUpdate:modelValue": ($event) => unref(form).editorial_status = $event,
                            class: "admin-input",
                            disabled: !!((_j = __props.editArticle) == null ? void 0 : _j.earningAmount)
                          }, [
                            createVNode("option", { value: "pending" }, "Menunggu review"),
                            createVNode("option", { value: "approved" }, "Disetujui"),
                            createVNode("option", { value: "rejected" }, "Ditolak")
                          ], 8, ["onUpdate:modelValue", "disabled"]), [
                            [vModelSelect, unref(form).editorial_status]
                          ]),
                          unref(form).errors.editorial_status ? (openBlock(), createBlock("p", {
                            key: 0,
                            class: "admin-error"
                          }, toDisplayString(unref(form).errors.editorial_status), 1)) : createCommentVNode("", true)
                        ]),
                        createVNode("div", null, [
                          createVNode("label", { class: "admin-label" }, "Verifikasi fakta"),
                          withDirectives(createVNode("select", {
                            "onUpdate:modelValue": ($event) => unref(form).fact_check_status = $event,
                            class: "admin-input",
                            disabled: !!((_k = __props.editArticle) == null ? void 0 : _k.earningAmount)
                          }, [
                            createVNode("option", { value: "pending" }, "Belum diperiksa"),
                            createVNode("option", { value: "verified" }, "Terverifikasi"),
                            createVNode("option", { value: "rejected" }, "Tidak valid")
                          ], 8, ["onUpdate:modelValue", "disabled"]), [
                            [vModelSelect, unref(form).fact_check_status]
                          ]),
                          unref(form).errors.fact_check_status ? (openBlock(), createBlock("p", {
                            key: 0,
                            class: "admin-error"
                          }, toDisplayString(unref(form).errors.fact_check_status), 1)) : createCommentVNode("", true)
                        ])
                      ]),
                      createVNode("div", { class: "mt-4" }, [
                        createVNode("label", { class: "admin-label" }, "Catatan review"),
                        withDirectives(createVNode("textarea", {
                          "onUpdate:modelValue": ($event) => unref(form).review_note = $event,
                          rows: "3",
                          class: "admin-input",
                          placeholder: "Catatan koreksi atau alasan penolakan"
                        }, null, 8, ["onUpdate:modelValue"]), [
                          [vModelText, unref(form).review_note]
                        ])
                      ]),
                      ((_l = __props.editArticle) == null ? void 0 : _l.earningAmount) ? (openBlock(), createBlock("div", {
                        key: 0,
                        class: "mt-4 rounded-lg bg-emerald-100 px-4 py-3 text-sm font-semibold text-emerald-800"
                      }, " Honor " + toDisplayString(formatRupiah(__props.editArticle.earningAmount)) + " sudah dikreditkan dan status persetujuan dikunci. ", 1)) : createCommentVNode("", true)
                    ]),
                    createVNode("div", null, [
                      createVNode("label", { class: "admin-label" }, "Judul Indonesia"),
                      withDirectives(createVNode("input", {
                        "onUpdate:modelValue": ($event) => unref(form).title = $event,
                        type: "text",
                        class: "admin-input"
                      }, null, 8, ["onUpdate:modelValue"]), [
                        [vModelText, unref(form).title]
                      ]),
                      unref(form).errors.title ? (openBlock(), createBlock("p", {
                        key: 0,
                        class: "admin-error"
                      }, toDisplayString(unref(form).errors.title), 1)) : createCommentVNode("", true)
                    ]),
                    createVNode("div", null, [
                      createVNode("label", { class: "admin-label" }, "Ringkasan Indonesia"),
                      withDirectives(createVNode("textarea", {
                        "onUpdate:modelValue": ($event) => unref(form).excerpt = $event,
                        rows: "3",
                        class: "admin-input"
                      }, null, 8, ["onUpdate:modelValue"]), [
                        [vModelText, unref(form).excerpt]
                      ]),
                      unref(form).errors.excerpt ? (openBlock(), createBlock("p", {
                        key: 0,
                        class: "admin-error"
                      }, toDisplayString(unref(form).errors.excerpt), 1)) : createCommentVNode("", true)
                    ]),
                    createVNode("div", null, [
                      createVNode("label", { class: "admin-label" }, "Konten Indonesia"),
                      withDirectives(createVNode("textarea", {
                        "onUpdate:modelValue": ($event) => unref(form).content = $event,
                        rows: "10",
                        class: "admin-input font-mono text-xs",
                        placeholder: "<p>Isi artikel...</p>"
                      }, null, 8, ["onUpdate:modelValue"]), [
                        [vModelText, unref(form).content]
                      ]),
                      unref(form).errors.content ? (openBlock(), createBlock("p", {
                        key: 0,
                        class: "admin-error"
                      }, toDisplayString(unref(form).errors.content), 1)) : createCommentVNode("", true)
                    ]),
                    createVNode("details", { class: "rounded-xl border border-slate-200 p-4" }, [
                      createVNode("summary", { class: "cursor-pointer text-sm font-semibold text-slate-800" }, "Versi Inggris"),
                      createVNode("div", { class: "mt-4 space-y-4" }, [
                        createVNode("div", null, [
                          createVNode("label", { class: "admin-label" }, "English Title"),
                          withDirectives(createVNode("input", {
                            "onUpdate:modelValue": ($event) => unref(form).title_en = $event,
                            type: "text",
                            class: "admin-input"
                          }, null, 8, ["onUpdate:modelValue"]), [
                            [vModelText, unref(form).title_en]
                          ])
                        ]),
                        createVNode("div", null, [
                          createVNode("label", { class: "admin-label" }, "English Excerpt"),
                          withDirectives(createVNode("textarea", {
                            "onUpdate:modelValue": ($event) => unref(form).excerpt_en = $event,
                            rows: "3",
                            class: "admin-input"
                          }, null, 8, ["onUpdate:modelValue"]), [
                            [vModelText, unref(form).excerpt_en]
                          ])
                        ]),
                        createVNode("div", null, [
                          createVNode("label", { class: "admin-label" }, "English Content"),
                          withDirectives(createVNode("textarea", {
                            "onUpdate:modelValue": ($event) => unref(form).content_en = $event,
                            rows: "8",
                            class: "admin-input font-mono text-xs"
                          }, null, 8, ["onUpdate:modelValue"]), [
                            [vModelText, unref(form).content_en]
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
                            ref_key: "fileInput",
                            ref: fileInput,
                            type: "file",
                            accept: "image/*",
                            class: "admin-input",
                            onChange: selectFile
                          }, null, 544)
                        ]),
                        createVNode("div", null, [
                          createVNode("label", { class: "admin-label" }, "Atau URL/path gambar"),
                          withDirectives(createVNode("input", {
                            "onUpdate:modelValue": ($event) => unref(form).cover_image_url = $event,
                            type: "text",
                            class: "admin-input"
                          }, null, 8, ["onUpdate:modelValue"]), [
                            [vModelText, unref(form).cover_image_url]
                          ])
                        ]),
                        createVNode("div", { class: "grid gap-4 sm:grid-cols-2" }, [
                          createVNode("div", null, [
                            createVNode("label", { class: "admin-label" }, "Alt gambar"),
                            withDirectives(createVNode("input", {
                              "onUpdate:modelValue": ($event) => unref(form).cover_image_alt = $event,
                              type: "text",
                              class: "admin-input"
                            }, null, 8, ["onUpdate:modelValue"]), [
                              [vModelText, unref(form).cover_image_alt]
                            ])
                          ]),
                          createVNode("div", null, [
                            createVNode("label", { class: "admin-label" }, "Alt image EN"),
                            withDirectives(createVNode("input", {
                              "onUpdate:modelValue": ($event) => unref(form).cover_image_alt_en = $event,
                              type: "text",
                              class: "admin-input"
                            }, null, 8, ["onUpdate:modelValue"]), [
                              [vModelText, unref(form).cover_image_alt_en]
                            ])
                          ])
                        ]),
                        unref(form).cover_image_url ? (openBlock(), createBlock("img", {
                          key: 0,
                          src: unref(form).cover_image_url,
                          alt: "",
                          class: "aspect-video w-full rounded-xl object-cover"
                        }, null, 8, ["src"])) : createCommentVNode("", true),
                        unref(form).errors.cover_image || unref(form).errors.cover_image_url ? (openBlock(), createBlock("p", {
                          key: 1,
                          class: "admin-error"
                        }, toDisplayString(unref(form).errors.cover_image || unref(form).errors.cover_image_url), 1)) : createCommentVNode("", true)
                      ])
                    ]),
                    createVNode("div", { class: "grid gap-4 sm:grid-cols-2" }, [
                      createVNode("div", null, [
                        createVNode("label", { class: "admin-label" }, "Tanggal terbit"),
                        withDirectives(createVNode("input", {
                          "onUpdate:modelValue": ($event) => unref(form).published_at = $event,
                          type: "datetime-local",
                          class: "admin-input"
                        }, null, 8, ["onUpdate:modelValue"]), [
                          [vModelText, unref(form).published_at]
                        ])
                      ]),
                      createVNode("label", { class: "flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700" }, [
                        withDirectives(createVNode("input", {
                          "onUpdate:modelValue": ($event) => unref(form).is_featured = $event,
                          type: "checkbox",
                          class: "rounded border-slate-300 text-blue-700 focus:ring-blue-500"
                        }, null, 8, ["onUpdate:modelValue"]), [
                          [vModelCheckbox, unref(form).is_featured]
                        ]),
                        createTextVNode(" Featured di homepage ")
                      ])
                    ]),
                    createVNode("div", null, [
                      createVNode("label", { class: "admin-label" }, "Tags, pisahkan dengan koma"),
                      withDirectives(createVNode("input", {
                        "onUpdate:modelValue": ($event) => unref(form).tags = $event,
                        type: "text",
                        class: "admin-input",
                        placeholder: "AI, Bisnis, Teknologi"
                      }, null, 8, ["onUpdate:modelValue"]), [
                        [vModelText, unref(form).tags]
                      ])
                    ]),
                    createVNode("details", { class: "rounded-xl border border-slate-200 p-4" }, [
                      createVNode("summary", { class: "cursor-pointer text-sm font-semibold text-slate-800" }, "SEO"),
                      createVNode("div", { class: "mt-4 grid gap-4" }, [
                        withDirectives(createVNode("input", {
                          "onUpdate:modelValue": ($event) => unref(form).seo_title = $event,
                          type: "text",
                          class: "admin-input",
                          placeholder: "SEO title Indonesia"
                        }, null, 8, ["onUpdate:modelValue"]), [
                          [vModelText, unref(form).seo_title]
                        ]),
                        withDirectives(createVNode("textarea", {
                          "onUpdate:modelValue": ($event) => unref(form).seo_description = $event,
                          rows: "2",
                          class: "admin-input",
                          placeholder: "SEO description Indonesia"
                        }, null, 8, ["onUpdate:modelValue"]), [
                          [vModelText, unref(form).seo_description]
                        ]),
                        withDirectives(createVNode("input", {
                          "onUpdate:modelValue": ($event) => unref(form).seo_keywords = $event,
                          type: "text",
                          class: "admin-input",
                          placeholder: "keyword, indonesia"
                        }, null, 8, ["onUpdate:modelValue"]), [
                          [vModelText, unref(form).seo_keywords]
                        ]),
                        withDirectives(createVNode("input", {
                          "onUpdate:modelValue": ($event) => unref(form).seo_title_en = $event,
                          type: "text",
                          class: "admin-input",
                          placeholder: "SEO title English"
                        }, null, 8, ["onUpdate:modelValue"]), [
                          [vModelText, unref(form).seo_title_en]
                        ]),
                        withDirectives(createVNode("textarea", {
                          "onUpdate:modelValue": ($event) => unref(form).seo_description_en = $event,
                          rows: "2",
                          class: "admin-input",
                          placeholder: "SEO description English"
                        }, null, 8, ["onUpdate:modelValue"]), [
                          [vModelText, unref(form).seo_description_en]
                        ]),
                        withDirectives(createVNode("input", {
                          "onUpdate:modelValue": ($event) => unref(form).seo_keywords_en = $event,
                          type: "text",
                          class: "admin-input",
                          placeholder: "keywords, english"
                        }, null, 8, ["onUpdate:modelValue"]), [
                          [vModelText, unref(form).seo_keywords_en]
                        ])
                      ])
                    ]),
                    createVNode("button", {
                      type: "submit",
                      class: "w-full rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800",
                      disabled: unref(form).processing
                    }, toDisplayString(unref(form).processing ? "Menyimpan..." : isEditMode.value ? "Simpan Perubahan" : "Buat Berita"), 9, ["disabled"])
                  ], 32)
                ]),
                createVNode("div", { class: "overflow-hidden rounded-2xl border border-slate-200 bg-white" }, [
                  createVNode("div", { class: "border-b border-slate-200 px-6 py-5" }, [
                    createVNode("h2", { class: "text-2xl font-semibold" }, "Daftar Berita"),
                    createVNode("p", { class: "mt-1 text-sm text-slate-500" }, "Artikel terbaru yang tersimpan di Radina News.")
                  ]),
                  createVNode("div", { class: "divide-y divide-slate-100" }, [
                    (openBlock(true), createBlock(Fragment, null, renderList(__props.articles.data, (article) => {
                      return openBlock(), createBlock("article", {
                        key: article.id,
                        class: "grid gap-4 p-5 sm:grid-cols-[120px_minmax(0,1fr)]"
                      }, [
                        createVNode("img", {
                          src: article.coverImage,
                          alt: article.title,
                          class: "aspect-video w-full rounded-xl object-cover sm:aspect-square"
                        }, null, 8, ["src", "alt"]),
                        createVNode("div", { class: "min-w-0" }, [
                          createVNode("div", { class: "flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500" }, [
                            createVNode("span", null, toDisplayString(article.categoryName), 1),
                            createVNode("span", null, "/"),
                            createVNode("span", {
                              class: article.status === "published" ? "text-emerald-700" : "text-amber-700"
                            }, toDisplayString(article.status), 3),
                            article.isFeatured ? (openBlock(), createBlock("span", {
                              key: 0,
                              class: "text-blue-700"
                            }, "Featured")) : createCommentVNode("", true)
                          ]),
                          createVNode("h3", { class: "mt-2 text-lg font-semibold leading-6 text-slate-950" }, toDisplayString(article.title), 1),
                          createVNode("p", { class: "mt-1 text-xs text-slate-500" }, "Diperbarui " + toDisplayString(article.updatedAt) + " oleh " + toDisplayString(article.authorName), 1),
                          createVNode("div", { class: "mt-2 flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-wider" }, [
                            createVNode("span", { class: "rounded-full bg-slate-100 px-2 py-1 text-slate-600" }, "Editorial: " + toDisplayString(article.editorialStatus), 1),
                            createVNode("span", { class: "rounded-full bg-slate-100 px-2 py-1 text-slate-600" }, "Fakta: " + toDisplayString(article.factCheckStatus), 1),
                            article.earningAmount ? (openBlock(), createBlock("span", {
                              key: 0,
                              class: "rounded-full bg-emerald-100 px-2 py-1 text-emerald-700"
                            }, " Honor " + toDisplayString(formatRupiah(article.earningAmount)), 1)) : createCommentVNode("", true)
                          ]),
                          article.reviewNote ? (openBlock(), createBlock("p", {
                            key: 0,
                            class: "mt-2 text-xs leading-5 text-slate-500"
                          }, "Catatan: " + toDisplayString(article.reviewNote), 1)) : createCommentVNode("", true),
                          createVNode("div", { class: "mt-3" }, [
                            createVNode("label", { class: "mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500" }, "Alihkan penulis"),
                            createVNode("select", {
                              value: article.authorId,
                              class: "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400",
                              disabled: !!article.earningAmount,
                              onChange: ($event) => reassignArticle(article, $event.target.value, $event.target)
                            }, [
                              (openBlock(true), createBlock(Fragment, null, renderList(__props.articleAuthors, (author) => {
                                return openBlock(), createBlock("option", {
                                  key: author.id,
                                  value: author.id
                                }, toDisplayString(author.name) + " · " + toDisplayString(author.roleLabel), 9, ["value"]);
                              }), 128))
                            ], 40, ["value", "disabled", "onChange"])
                          ]),
                          createVNode("div", { class: "mt-4 flex flex-wrap gap-2" }, [
                            article.status === "published" ? (openBlock(), createBlock("a", {
                              key: 0,
                              href: article.publicUrl,
                              target: "_blank",
                              class: "admin-action"
                            }, "Lihat", 8, ["href"])) : createCommentVNode("", true),
                            createVNode(unref(Link), {
                              href: article.editUrl,
                              class: "admin-action"
                            }, {
                              default: withCtx(() => [
                                createTextVNode("Edit")
                              ]),
                              _: 1
                            }, 8, ["href"]),
                            !article.earningAmount ? (openBlock(), createBlock("button", {
                              key: 1,
                              type: "button",
                              class: "admin-action text-emerald-700",
                              onClick: ($event) => approveAndVerify(article)
                            }, " Setujui & Verifikasi ", 8, ["onClick"])) : createCommentVNode("", true),
                            !article.earningAmount ? (openBlock(), createBlock("button", {
                              key: 2,
                              type: "button",
                              class: "admin-action text-amber-700",
                              onClick: ($event) => rejectArticle(article)
                            }, " Tolak ", 8, ["onClick"])) : createCommentVNode("", true),
                            createVNode("button", {
                              type: "button",
                              class: "admin-action text-rose-700",
                              onClick: ($event) => removeArticle(article)
                            }, "Hapus", 8, ["onClick"])
                          ])
                        ])
                      ]);
                    }), 128))
                  ]),
                  createVNode("div", { class: "border-t border-slate-200 px-6 py-5" }, [
                    createVNode(_sfc_main$3, {
                      links: __props.articles.links
                    }, null, 8, ["links"])
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Admin/NewsManager.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  _sfc_main as default
};

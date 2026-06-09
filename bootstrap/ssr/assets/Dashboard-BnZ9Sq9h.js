import { computed, ref, watch, mergeProps, withCtx, unref, createTextVNode, createVNode, toDisplayString, openBlock, createBlock, createCommentVNode, withDirectives, withModifiers, vModelText, Fragment, renderList, vShow, vModelSelect, vModelCheckbox, useSSRContext } from "vue";
import { ssrRenderComponent, ssrInterpolate, ssrRenderStyle, ssrRenderAttr, ssrIncludeBooleanAttr, ssrRenderList, ssrRenderClass, ssrLooseContain, ssrLooseEqual } from "vue/server-renderer";
import { usePage, useForm, Link, router } from "@inertiajs/vue3";
import { _ as _sfc_main$3 } from "./PaginationLinks-DDGWEAke.js";
import { _ as _sfc_main$2 } from "./SeoHead-B3gH-eD3.js";
import { _ as _sfc_main$1 } from "./AdminLayout-B5vz3MkO.js";
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
    articleAuthors: Array,
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
    storeUserUrl: String,
    paymentSummary: Object,
    writerEarnings: Array,
    writerWithdrawals: Array,
    adminWithdrawals: Array,
    bankAccount: Object,
    withdrawalStoreUrl: String
  },
  setup(__props) {
    var _a, _b, _c, _d;
    const props = __props;
    const page = usePage();
    const flashStatus = computed(() => {
      var _a2;
      return ((_a2 = page.props.flash) == null ? void 0 : _a2.status) || "";
    });
    const newLicenseKey = computed(() => {
      var _a2;
      return ((_a2 = page.props.flash) == null ? void 0 : _a2.newLicenseKey) || "";
    });
    const currentAuthor = computed(() => {
      var _a2;
      return ((_a2 = page.props.auth) == null ? void 0 : _a2.user) || null;
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
      var _a2, _b2;
      return {
        category_id: ((_a2 = props.categories[0]) == null ? void 0 : _a2.id) || "",
        assigned_user_id: props.isAdmin ? ((_b2 = currentAuthor.value) == null ? void 0 : _b2.id) || "" : "",
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
    const userDefaults = () => {
      var _a2;
      return {
        name: "",
        email: "",
        role: "writer",
        article_fee: ((_a2 = props.paymentSummary) == null ? void 0 : _a2.defaultArticleFee) || 25e3,
        password: "",
        password_confirmation: ""
      };
    };
    const userForm = useForm(userDefaults());
    const withdrawalForm = useForm({
      amount: ((_a = props.paymentSummary) == null ? void 0 : _a.availableBalance) || ""
    });
    const bankForm = useForm({
      bank_name: ((_b = props.bankAccount) == null ? void 0 : _b.bankName) || "",
      bank_account_number: ((_c = props.bankAccount) == null ? void 0 : _c.accountNumber) || "",
      bank_account_holder: ((_d = props.bankAccount) == null ? void 0 : _d.accountHolder) || ""
    });
    const hydrateForm = () => {
      var _a2, _b2, _c2, _d2, _e;
      form.customer_name = ((_a2 = props.editLicense) == null ? void 0 : _a2.customerName) || props.formDefaults.customer_name;
      form.product_name = ((_b2 = props.editLicense) == null ? void 0 : _b2.productName) || props.formDefaults.product_name;
      form.max_activations = ((_c2 = props.editLicense) == null ? void 0 : _c2.maxActivations) || props.formDefaults.max_activations;
      form.expires_at = ((_d2 = props.editLicense) == null ? void 0 : _d2.expiresAt) || props.formDefaults.expires_at;
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
        article_fee: props.editUser.articleFee,
        password: "",
        password_confirmation: ""
      } : userDefaults());
      userForm.clearErrors();
    };
    const formatRupiah = (amount) => new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(Number(amount || 0));
    const submitBank = () => {
      bankForm.patch(props.bankAccount.updateUrl, { preserveScroll: true });
    };
    const submitWithdrawal = () => {
      withdrawalForm.post(props.withdrawalStoreUrl, {
        preserveScroll: true,
        onSuccess: () => {
          withdrawalForm.amount = "";
        }
      });
    };
    const updateWithdrawal = (withdrawal, status) => {
      const labels = {
        approved: "menyetujui",
        paid: "menandai sudah dibayar",
        rejected: "menolak"
      };
      const note = window.prompt(`Catatan admin untuk ${labels[status]} withdrawal ini (opsional):`, withdrawal.adminNote || "");
      if (note === null) {
        return;
      }
      router.patch(withdrawal.updateUrl, { status, admin_note: note }, { preserveScroll: true });
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
      var _a2;
      newsForm.cover_image = ((_a2 = event.target.files) == null ? void 0 : _a2[0]) || null;
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
      var _a2;
      categoryForm.cover_image = ((_a2 = event.target.files) == null ? void 0 : _a2[0]) || null;
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
      var _a2;
      if ((_a2 = navigator == null ? void 0 : navigator.clipboard) == null ? void 0 : _a2.writeText) {
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
      var _a2;
      if (account.id === ((_a2 = currentAuthor.value) == null ? void 0 : _a2.id)) {
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
          var _a2, _b2, _c2, _d2, _e, _f, _g, _h, _i, _j;
          if (_push2) {
            _push2(ssrRenderComponent(_sfc_main$2, { seo: __props.seo }, null, _parent2, _scopeId));
            _push2(`<section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"${_scopeId}><div class="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between"${_scopeId}><div${_scopeId}><span class="news-kicker"${_scopeId}>Panel Pengelola</span><h1 class="mt-4 text-4xl font-semibold sm:text-5xl"${_scopeId}>Dashboard Radina News</h1><p class="mt-3 max-w-2xl text-sm leading-7 text-slate-600"${_scopeId}>${ssrInterpolate(__props.isAdmin ? "Kelola berita, pembayaran penulis, kategori, lisensi, dan pengguna dari satu dashboard." : "Tulis artikel, pantau honor, dan ajukan withdrawal setelah tulisan disetujui.")}</p></div><div class="flex flex-wrap gap-3"${_scopeId}>`);
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
            if (!__props.isAdmin) {
              _push2(`<section class="mt-6" style="${ssrRenderStyle(activePanel.value === "earnings" ? null : { display: "none" })}"${_scopeId}><div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"${_scopeId}><div class="admin-stat"${_scopeId}><span${_scopeId}>Saldo tersedia</span><strong${_scopeId}>${ssrInterpolate(formatRupiah(__props.paymentSummary.availableBalance))}</strong></div><div class="admin-stat"${_scopeId}><span${_scopeId}>Total honor</span><strong${_scopeId}>${ssrInterpolate(formatRupiah(__props.paymentSummary.totalEarnings))}</strong></div><div class="admin-stat"${_scopeId}><span${_scopeId}>Dalam proses</span><strong${_scopeId}>${ssrInterpolate(formatRupiah(__props.paymentSummary.reservedAmount))}</strong></div><div class="admin-stat"${_scopeId}><span${_scopeId}>Honor per artikel</span><strong${_scopeId}>${ssrInterpolate(formatRupiah(__props.paymentSummary.articleFee))}</strong></div></div><div class="mt-6 grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]"${_scopeId}><div class="rounded-2xl border border-slate-200 bg-white p-6"${_scopeId}><h2 class="text-2xl font-semibold"${_scopeId}>Ajukan Withdrawal</h2><p class="mt-2 text-sm leading-6 text-slate-500"${_scopeId}> Minimum pencairan ${ssrInterpolate(formatRupiah(__props.paymentSummary.minimumWithdrawal))}. Saldo langsung direservasi saat pengajuan dibuat. </p>`);
              if (!__props.paymentSummary.bankComplete) {
                _push2(`<div class="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"${_scopeId}> Lengkapi rekening pencairan pada menu Rekening sebelum mengajukan withdrawal. </div>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`<form class="mt-5 space-y-4"${_scopeId}><div${_scopeId}><label class="admin-label"${_scopeId}>Nominal withdrawal</label><input${ssrRenderAttr("value", unref(withdrawalForm).amount)} type="number"${ssrRenderAttr("min", __props.paymentSummary.minimumWithdrawal)}${ssrRenderAttr("max", __props.paymentSummary.availableBalance)} step="1000" class="admin-input"${_scopeId}>`);
              if (unref(withdrawalForm).errors.amount) {
                _push2(`<p class="admin-error"${_scopeId}>${ssrInterpolate(unref(withdrawalForm).errors.amount)}</p>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div><button type="submit" class="w-full rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"${ssrIncludeBooleanAttr(unref(withdrawalForm).processing || !__props.paymentSummary.bankComplete || __props.paymentSummary.availableBalance < __props.paymentSummary.minimumWithdrawal) ? " disabled" : ""}${_scopeId}>${ssrInterpolate(unref(withdrawalForm).processing ? "Mengajukan..." : "Ajukan Withdrawal")}</button></form></div><div class="space-y-6"${_scopeId}><div class="overflow-hidden rounded-2xl border border-slate-200 bg-white"${_scopeId}><div class="border-b border-slate-200 px-6 py-5"${_scopeId}><h2 class="text-2xl font-semibold"${_scopeId}>Riwayat Honor</h2><p class="mt-1 text-sm text-slate-500"${_scopeId}>Honor masuk setelah artikel disetujui dan fakta terverifikasi.</p></div>`);
              if (__props.writerEarnings.length) {
                _push2(`<div class="divide-y divide-slate-100"${_scopeId}><!--[-->`);
                ssrRenderList(__props.writerEarnings, (earning) => {
                  _push2(`<div class="flex flex-col gap-2 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"${_scopeId}><div${_scopeId}><p class="font-semibold text-slate-900"${_scopeId}>${ssrInterpolate(earning.articleTitle)}</p><p class="mt-1 text-xs text-slate-500"${_scopeId}>${ssrInterpolate(earning.creditedAt)} · ${ssrInterpolate(earning.description)}</p></div><strong class="text-emerald-700"${_scopeId}>+${ssrInterpolate(formatRupiah(earning.amount))}</strong></div>`);
                });
                _push2(`<!--]--></div>`);
              } else {
                _push2(`<p class="px-6 py-8 text-sm text-slate-500"${_scopeId}>Belum ada honor yang dikreditkan.</p>`);
              }
              _push2(`</div><div class="overflow-hidden rounded-2xl border border-slate-200 bg-white"${_scopeId}><div class="border-b border-slate-200 px-6 py-5"${_scopeId}><h2 class="text-2xl font-semibold"${_scopeId}>Riwayat Withdrawal</h2></div>`);
              if (__props.writerWithdrawals.length) {
                _push2(`<div class="divide-y divide-slate-100"${_scopeId}><!--[-->`);
                ssrRenderList(__props.writerWithdrawals, (withdrawal) => {
                  _push2(`<div class="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"${_scopeId}><div${_scopeId}><p class="font-semibold text-slate-900"${_scopeId}>${ssrInterpolate(formatRupiah(withdrawal.amount))} · ${ssrInterpolate(withdrawal.bankName)}</p><p class="mt-1 text-xs text-slate-500"${_scopeId}>${ssrInterpolate(withdrawal.requestedAt)} · ${ssrInterpolate(withdrawal.accountNumber)}</p>`);
                  if (withdrawal.adminNote) {
                    _push2(`<p class="mt-1 text-xs text-slate-500"${_scopeId}>Catatan: ${ssrInterpolate(withdrawal.adminNote)}</p>`);
                  } else {
                    _push2(`<!---->`);
                  }
                  _push2(`</div><span class="${ssrRenderClass([{
                    "bg-amber-100 text-amber-800": withdrawal.status === "pending",
                    "bg-blue-100 text-blue-800": withdrawal.status === "approved",
                    "bg-emerald-100 text-emerald-800": withdrawal.status === "paid",
                    "bg-rose-100 text-rose-800": withdrawal.status === "rejected"
                  }, "w-fit rounded-full px-3 py-1 text-xs font-bold"])}"${_scopeId}>${ssrInterpolate(withdrawal.statusLabel)}</span></div>`);
                });
                _push2(`<!--]--></div>`);
              } else {
                _push2(`<p class="px-6 py-8 text-sm text-slate-500"${_scopeId}>Belum ada pengajuan withdrawal.</p>`);
              }
              _push2(`</div></div></div></section>`);
            } else {
              _push2(`<!---->`);
            }
            if (!__props.isAdmin) {
              _push2(`<section class="mt-6" style="${ssrRenderStyle(activePanel.value === "bank" ? null : { display: "none" })}"${_scopeId}><div class="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 sm:p-8"${_scopeId}><span class="news-kicker"${_scopeId}>Pengaturan Penulis</span><h2 class="mt-4 text-3xl font-semibold"${_scopeId}>Rekening Pencairan</h2><p class="mt-2 text-sm leading-6 text-slate-500"${_scopeId}> Rekening ini digunakan sebagai tujuan setiap pengajuan withdrawal. Pastikan nama pemilik sesuai dengan data bank. </p><form class="mt-7 space-y-5"${_scopeId}><div${_scopeId}><label class="admin-label"${_scopeId}>Nama bank atau e-wallet</label><input${ssrRenderAttr("value", unref(bankForm).bank_name)} type="text" class="admin-input" placeholder="BCA, BRI, Mandiri, DANA"${_scopeId}>`);
              if (unref(bankForm).errors.bank_name) {
                _push2(`<p class="admin-error"${_scopeId}>${ssrInterpolate(unref(bankForm).errors.bank_name)}</p>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div><div${_scopeId}><label class="admin-label"${_scopeId}>Nomor rekening</label><input${ssrRenderAttr("value", unref(bankForm).bank_account_number)} type="text" inputmode="numeric" class="admin-input" placeholder="Hanya angka"${_scopeId}>`);
              if (unref(bankForm).errors.bank_account_number) {
                _push2(`<p class="admin-error"${_scopeId}>${ssrInterpolate(unref(bankForm).errors.bank_account_number)}</p>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div><div${_scopeId}><label class="admin-label"${_scopeId}>Nama pemilik rekening</label><input${ssrRenderAttr("value", unref(bankForm).bank_account_holder)} type="text" class="admin-input"${_scopeId}>`);
              if (unref(bankForm).errors.bank_account_holder) {
                _push2(`<p class="admin-error"${_scopeId}>${ssrInterpolate(unref(bankForm).errors.bank_account_holder)}</p>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div><button type="submit" class="w-full rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800"${ssrIncludeBooleanAttr(unref(bankForm).processing) ? " disabled" : ""}${_scopeId}>${ssrInterpolate(unref(bankForm).processing ? "Menyimpan..." : "Simpan Rekening")}</button></form></div></section>`);
            } else {
              _push2(`<!---->`);
            }
            if (__props.isAdmin) {
              _push2(`<section class="mt-6" style="${ssrRenderStyle(activePanel.value === "payments" ? null : { display: "none" })}"${_scopeId}><div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"${_scopeId}><div class="admin-stat"${_scopeId}><span${_scopeId}>Total honor</span><strong${_scopeId}>${ssrInterpolate(formatRupiah(__props.paymentSummary.totalEarnings))}</strong></div><div class="admin-stat"${_scopeId}><span${_scopeId}>Withdrawal menunggu</span><strong${_scopeId}>${ssrInterpolate(__props.paymentSummary.pendingWithdrawals)}</strong></div><div class="admin-stat"${_scopeId}><span${_scopeId}>Nominal menunggu</span><strong${_scopeId}>${ssrInterpolate(formatRupiah(__props.paymentSummary.pendingAmount))}</strong></div><div class="admin-stat"${_scopeId}><span${_scopeId}>Sudah dibayar</span><strong${_scopeId}>${ssrInterpolate(formatRupiah(__props.paymentSummary.paidAmount))}</strong></div></div><div class="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white"${_scopeId}><div class="border-b border-slate-200 px-6 py-5"${_scopeId}><h2 class="text-2xl font-semibold"${_scopeId}>Permintaan Withdrawal</h2><p class="mt-1 text-sm text-slate-500"${_scopeId}> Minimum withdrawal ${ssrInterpolate(formatRupiah(__props.paymentSummary.minimumWithdrawal))}. Setujui setelah rekening diperiksa, lalu tandai dibayar setelah transfer. </p></div><div class="overflow-x-auto"${_scopeId}><table class="min-w-full text-left text-sm"${_scopeId}><thead class="bg-slate-50 text-xs uppercase tracking-[0.12em] text-slate-500"${_scopeId}><tr${_scopeId}><th class="px-5 py-4"${_scopeId}>Penulis</th><th class="px-5 py-4"${_scopeId}>Nominal</th><th class="px-5 py-4"${_scopeId}>Rekening</th><th class="px-5 py-4"${_scopeId}>Status</th><th class="px-5 py-4"${_scopeId}>Aksi</th></tr></thead><tbody class="divide-y divide-slate-100"${_scopeId}><!--[-->`);
              ssrRenderList(__props.adminWithdrawals, (withdrawal) => {
                _push2(`<tr class="align-top"${_scopeId}><td class="px-5 py-4"${_scopeId}><p class="font-semibold text-slate-900"${_scopeId}>${ssrInterpolate(withdrawal.writerName)}</p><p class="text-xs text-slate-500"${_scopeId}>${ssrInterpolate(withdrawal.writerEmail)}</p><p class="mt-1 text-xs text-slate-500"${_scopeId}>${ssrInterpolate(withdrawal.requestedAt)}</p></td><td class="px-5 py-4 font-bold text-slate-900"${_scopeId}>${ssrInterpolate(formatRupiah(withdrawal.amount))}</td><td class="px-5 py-4"${_scopeId}><p class="font-semibold"${_scopeId}>${ssrInterpolate(withdrawal.bankName)}</p><p class="text-xs text-slate-500"${_scopeId}>${ssrInterpolate(withdrawal.accountNumber)}</p><p class="text-xs text-slate-500"${_scopeId}>${ssrInterpolate(withdrawal.accountHolder)}</p></td><td class="px-5 py-4"${_scopeId}><span class="${ssrRenderClass([{
                  "bg-amber-100 text-amber-800": withdrawal.status === "pending",
                  "bg-blue-100 text-blue-800": withdrawal.status === "approved",
                  "bg-emerald-100 text-emerald-800": withdrawal.status === "paid",
                  "bg-rose-100 text-rose-800": withdrawal.status === "rejected"
                }, "rounded-full px-2.5 py-1 text-xs font-bold"])}"${_scopeId}>${ssrInterpolate(withdrawal.statusLabel)}</span>`);
                if (withdrawal.adminNote) {
                  _push2(`<p class="mt-2 max-w-xs text-xs text-slate-500"${_scopeId}>${ssrInterpolate(withdrawal.adminNote)}</p>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</td><td class="px-5 py-4"${_scopeId}>`);
                if (withdrawal.status !== "paid" && withdrawal.status !== "rejected") {
                  _push2(`<div class="flex flex-wrap gap-2"${_scopeId}>`);
                  if (withdrawal.status === "pending") {
                    _push2(`<button type="button" class="admin-action text-blue-700"${_scopeId}>Setujui</button>`);
                  } else {
                    _push2(`<!---->`);
                  }
                  if (withdrawal.status === "approved") {
                    _push2(`<button type="button" class="admin-action text-emerald-700"${_scopeId}>Sudah Dibayar</button>`);
                  } else {
                    _push2(`<!---->`);
                  }
                  _push2(`<button type="button" class="admin-action text-rose-700"${_scopeId}>Tolak</button></div>`);
                } else {
                  _push2(`<span class="text-xs text-slate-400"${_scopeId}>Selesai</span>`);
                }
                _push2(`</td></tr>`);
              });
              _push2(`<!--]-->`);
              if (!__props.adminWithdrawals.length) {
                _push2(`<tr${_scopeId}><td colspan="5" class="px-6 py-10 text-center text-slate-500"${_scopeId}>Belum ada permintaan withdrawal.</td></tr>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</tbody></table></div></div></section>`);
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
            _push2(`<section class="mt-6" style="${ssrRenderStyle(activePanel.value === "news" ? null : { display: "none" })}"${_scopeId}><div class="mb-6 grid gap-4 sm:grid-cols-3"${_scopeId}><div class="admin-stat"${_scopeId}><span${_scopeId}>Total berita</span><strong${_scopeId}>${ssrInterpolate(__props.newsStats.total)}</strong></div><div class="admin-stat"${_scopeId}><span${_scopeId}>Published</span><strong${_scopeId}>${ssrInterpolate(__props.newsStats.published)}</strong></div><div class="admin-stat"${_scopeId}><span${_scopeId}>Draft</span><strong${_scopeId}>${ssrInterpolate(__props.newsStats.draft)}</strong></div></div><div class="grid gap-6 xl:grid-cols-[minmax(0,560px)_minmax(0,1fr)]"${_scopeId}><div class="rounded-2xl border border-slate-200 bg-white p-6"${_scopeId}><h2 class="text-2xl font-semibold"${_scopeId}>Buat Berita</h2><p class="mt-2 text-sm text-slate-500"${_scopeId}>Kolom Indonesia wajib. Bahasa Inggris dan SEO dapat dilengkapi bila diperlukan.</p><div class="mt-4 flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3"${_scopeId}><span class="grid h-9 w-9 place-items-center rounded-full bg-blue-700 text-sm font-bold text-white"${_scopeId}>${ssrInterpolate((_c2 = (_b2 = (_a2 = currentAuthor.value) == null ? void 0 : _a2.name) == null ? void 0 : _b2.charAt(0)) == null ? void 0 : _c2.toUpperCase())}</span><div class="min-w-0"${_scopeId}><p class="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-700"${_scopeId}>${ssrInterpolate(__props.isAdmin ? "Admin pembuat artikel" : "Penulis dari session login")}</p><p class="truncate text-sm font-semibold text-slate-900"${_scopeId}>${ssrInterpolate((_d2 = currentAuthor.value) == null ? void 0 : _d2.name)}</p><p class="truncate text-xs text-slate-500"${_scopeId}>${ssrInterpolate((_e = currentAuthor.value) == null ? void 0 : _e.email)}</p></div></div><form class="mt-6 space-y-5"${_scopeId}><div class="${ssrRenderClass([{ "xl:grid-cols-3": __props.isAdmin }, "grid gap-4 sm:grid-cols-2"])}"${_scopeId}><div${_scopeId}><label class="admin-label"${_scopeId}>Kategori</label><select class="admin-input"${_scopeId}><!--[-->`);
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
              _push2(`<div${_scopeId}><label class="admin-label"${_scopeId}>Penulis artikel</label><select class="admin-input"${_scopeId}><!--[-->`);
              ssrRenderList(__props.articleAuthors, (author) => {
                _push2(`<option${ssrRenderAttr("value", author.id)}${ssrIncludeBooleanAttr(Array.isArray(unref(newsForm).assigned_user_id) ? ssrLooseContain(unref(newsForm).assigned_user_id, author.id) : ssrLooseEqual(unref(newsForm).assigned_user_id, author.id)) ? " selected" : ""}${_scopeId}>${ssrInterpolate(author.name)} · ${ssrInterpolate(author.roleLabel)}</option>`);
              });
              _push2(`<!--]--></select>`);
              if (unref(newsForm).errors.assigned_user_id) {
                _push2(`<p class="admin-error"${_scopeId}>${ssrInterpolate(unref(newsForm).errors.assigned_user_id)}</p>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div>`);
            } else {
              _push2(`<!---->`);
            }
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
              _push2(`<article class="grid gap-4 p-5 sm:grid-cols-[100px_minmax(0,1fr)]"${_scopeId}><img${ssrRenderAttr("src", article.coverImage)}${ssrRenderAttr("alt", article.title)} class="aspect-video w-full rounded-xl object-cover sm:aspect-square"${_scopeId}><div class="min-w-0"${_scopeId}><p class="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500"${_scopeId}>${ssrInterpolate(article.categoryName)} · <span class="${ssrRenderClass(article.status === "published" ? "text-emerald-700" : "text-amber-700")}"${_scopeId}>${ssrInterpolate(article.status)}</span></p><h3 class="mt-2 font-semibold leading-6 text-slate-950"${_scopeId}>${ssrInterpolate(article.title)}</h3><p class="mt-1 text-xs text-slate-500"${_scopeId}>${ssrInterpolate(article.updatedAt)} · ${ssrInterpolate(article.authorName)}</p><div class="mt-2 flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-wider"${_scopeId}><span class="rounded-full bg-slate-100 px-2 py-1 text-slate-600"${_scopeId}>Editorial: ${ssrInterpolate(article.editorialStatus)}</span><span class="rounded-full bg-slate-100 px-2 py-1 text-slate-600"${_scopeId}>Fakta: ${ssrInterpolate(article.factCheckStatus)}</span>`);
              if (article.earningAmount) {
                _push2(`<span class="rounded-full bg-emerald-100 px-2 py-1 text-emerald-700"${_scopeId}> Honor ${ssrInterpolate(formatRupiah(article.earningAmount))}</span>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div><div class="mt-3 flex gap-2"${_scopeId}>`);
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
              _push2(`</div>`);
              if (unref(userForm).role === "writer") {
                _push2(`<div${_scopeId}><label class="admin-label"${_scopeId}>Honor per artikel</label><input${ssrRenderAttr("value", unref(userForm).article_fee)} type="number" min="0" step="1000" class="admin-input"${_scopeId}><p class="mt-1 text-xs text-slate-500"${_scopeId}>Dikreditkan sekali setelah artikel disetujui dan fakta terverifikasi.</p>`);
                if (unref(userForm).errors.article_fee) {
                  _push2(`<p class="admin-error"${_scopeId}>${ssrInterpolate(unref(userForm).errors.article_fee)}</p>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</div>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`<div${_scopeId}><label class="admin-label"${_scopeId}>${ssrInterpolate(isUserEditMode.value ? "Password baru (opsional)" : "Password")}</label><input${ssrRenderAttr("value", unref(userForm).password)} type="password" class="admin-input"${_scopeId}>`);
              if (unref(userForm).errors.password) {
                _push2(`<p class="admin-error"${_scopeId}>${ssrInterpolate(unref(userForm).errors.password)}</p>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div><div${_scopeId}><label class="admin-label"${_scopeId}>Konfirmasi Password</label><input${ssrRenderAttr("value", unref(userForm).password_confirmation)} type="password" class="admin-input"${_scopeId}></div><button type="submit" class="w-full rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800"${ssrIncludeBooleanAttr(unref(userForm).processing) ? " disabled" : ""}${_scopeId}>${ssrInterpolate(unref(userForm).processing ? "Menyimpan..." : isUserEditMode.value ? "Simpan Pengguna" : "Tambah Pengguna")}</button></form></div><div class="overflow-hidden rounded-2xl border border-slate-200 bg-white"${_scopeId}><div class="border-b border-slate-200 px-6 py-5"${_scopeId}><h2 class="text-2xl font-semibold"${_scopeId}>Daftar Pengguna</h2><p class="mt-1 text-sm text-slate-500"${_scopeId}>Kelola akun dan level akses dashboard.</p></div><div class="overflow-x-auto"${_scopeId}><table class="min-w-full text-left text-sm"${_scopeId}><thead class="bg-slate-50 text-xs uppercase tracking-[0.12em] text-slate-500"${_scopeId}><tr${_scopeId}><th class="px-5 py-4"${_scopeId}>Pengguna</th><th class="px-5 py-4"${_scopeId}>Level</th><th class="px-5 py-4"${_scopeId}>Honor / Saldo</th><th class="px-5 py-4"${_scopeId}>Artikel</th><th class="px-5 py-4"${_scopeId}>Aksi</th></tr></thead><tbody class="divide-y divide-slate-100"${_scopeId}><!--[-->`);
              ssrRenderList(__props.users, (account) => {
                var _a3;
                _push2(`<tr${_scopeId}><td class="px-5 py-4"${_scopeId}><p class="font-semibold text-slate-900"${_scopeId}>${ssrInterpolate(account.name)}</p><p class="text-xs text-slate-500"${_scopeId}>${ssrInterpolate(account.email)}</p></td><td class="px-5 py-4"${_scopeId}><span class="${ssrRenderClass([account.role === "admin" ? "bg-blue-100 text-blue-800" : "bg-emerald-100 text-emerald-800", "rounded-full px-2.5 py-1 text-xs font-bold"])}"${_scopeId}>${ssrInterpolate(account.roleLabel)}</span></td><td class="px-5 py-4"${_scopeId}>`);
                if (account.role === "writer") {
                  _push2(`<!--[--><p class="font-semibold text-slate-900"${_scopeId}>${ssrInterpolate(formatRupiah(account.articleFee))} / artikel</p><p class="text-xs text-slate-500"${_scopeId}>Total ${ssrInterpolate(formatRupiah(account.totalEarnings))}</p><!--]-->`);
                } else {
                  _push2(`<span class="text-xs text-slate-400"${_scopeId}>Tidak berlaku</span>`);
                }
                _push2(`</td><td class="px-5 py-4 text-slate-600"${_scopeId}>${ssrInterpolate(account.articlesCount)}</td><td class="px-5 py-4"${_scopeId}><div class="flex flex-wrap gap-2"${_scopeId}>`);
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
                _push2(`<button type="button" class="admin-action text-rose-700 disabled:opacity-40"${ssrIncludeBooleanAttr(account.id === ((_a3 = currentAuthor.value) == null ? void 0 : _a3.id) || account.articlesCount > 0) ? " disabled" : ""}${_scopeId}> Hapus </button></div></td></tr>`);
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
                    createVNode("p", { class: "mt-3 max-w-2xl text-sm leading-7 text-slate-600" }, toDisplayString(__props.isAdmin ? "Kelola berita, pembayaran penulis, kategori, lisensi, dan pengguna dari satu dashboard." : "Tulis artikel, pantau honor, dan ajukan withdrawal setelah tulisan disetujui."), 1)
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
              !__props.isAdmin ? withDirectives((openBlock(), createBlock("section", {
                key: 2,
                class: "mt-6"
              }, [
                createVNode("div", { class: "grid gap-4 sm:grid-cols-2 xl:grid-cols-4" }, [
                  createVNode("div", { class: "admin-stat" }, [
                    createVNode("span", null, "Saldo tersedia"),
                    createVNode("strong", null, toDisplayString(formatRupiah(__props.paymentSummary.availableBalance)), 1)
                  ]),
                  createVNode("div", { class: "admin-stat" }, [
                    createVNode("span", null, "Total honor"),
                    createVNode("strong", null, toDisplayString(formatRupiah(__props.paymentSummary.totalEarnings)), 1)
                  ]),
                  createVNode("div", { class: "admin-stat" }, [
                    createVNode("span", null, "Dalam proses"),
                    createVNode("strong", null, toDisplayString(formatRupiah(__props.paymentSummary.reservedAmount)), 1)
                  ]),
                  createVNode("div", { class: "admin-stat" }, [
                    createVNode("span", null, "Honor per artikel"),
                    createVNode("strong", null, toDisplayString(formatRupiah(__props.paymentSummary.articleFee)), 1)
                  ])
                ]),
                createVNode("div", { class: "mt-6 grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]" }, [
                  createVNode("div", { class: "rounded-2xl border border-slate-200 bg-white p-6" }, [
                    createVNode("h2", { class: "text-2xl font-semibold" }, "Ajukan Withdrawal"),
                    createVNode("p", { class: "mt-2 text-sm leading-6 text-slate-500" }, " Minimum pencairan " + toDisplayString(formatRupiah(__props.paymentSummary.minimumWithdrawal)) + ". Saldo langsung direservasi saat pengajuan dibuat. ", 1),
                    !__props.paymentSummary.bankComplete ? (openBlock(), createBlock("div", {
                      key: 0,
                      class: "mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"
                    }, " Lengkapi rekening pencairan pada menu Rekening sebelum mengajukan withdrawal. ")) : createCommentVNode("", true),
                    createVNode("form", {
                      class: "mt-5 space-y-4",
                      onSubmit: withModifiers(submitWithdrawal, ["prevent"])
                    }, [
                      createVNode("div", null, [
                        createVNode("label", { class: "admin-label" }, "Nominal withdrawal"),
                        withDirectives(createVNode("input", {
                          "onUpdate:modelValue": ($event) => unref(withdrawalForm).amount = $event,
                          type: "number",
                          min: __props.paymentSummary.minimumWithdrawal,
                          max: __props.paymentSummary.availableBalance,
                          step: "1000",
                          class: "admin-input"
                        }, null, 8, ["onUpdate:modelValue", "min", "max"]), [
                          [vModelText, unref(withdrawalForm).amount]
                        ]),
                        unref(withdrawalForm).errors.amount ? (openBlock(), createBlock("p", {
                          key: 0,
                          class: "admin-error"
                        }, toDisplayString(unref(withdrawalForm).errors.amount), 1)) : createCommentVNode("", true)
                      ]),
                      createVNode("button", {
                        type: "submit",
                        class: "w-full rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50",
                        disabled: unref(withdrawalForm).processing || !__props.paymentSummary.bankComplete || __props.paymentSummary.availableBalance < __props.paymentSummary.minimumWithdrawal
                      }, toDisplayString(unref(withdrawalForm).processing ? "Mengajukan..." : "Ajukan Withdrawal"), 9, ["disabled"])
                    ], 32)
                  ]),
                  createVNode("div", { class: "space-y-6" }, [
                    createVNode("div", { class: "overflow-hidden rounded-2xl border border-slate-200 bg-white" }, [
                      createVNode("div", { class: "border-b border-slate-200 px-6 py-5" }, [
                        createVNode("h2", { class: "text-2xl font-semibold" }, "Riwayat Honor"),
                        createVNode("p", { class: "mt-1 text-sm text-slate-500" }, "Honor masuk setelah artikel disetujui dan fakta terverifikasi.")
                      ]),
                      __props.writerEarnings.length ? (openBlock(), createBlock("div", {
                        key: 0,
                        class: "divide-y divide-slate-100"
                      }, [
                        (openBlock(true), createBlock(Fragment, null, renderList(__props.writerEarnings, (earning) => {
                          return openBlock(), createBlock("div", {
                            key: earning.id,
                            class: "flex flex-col gap-2 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
                          }, [
                            createVNode("div", null, [
                              createVNode("p", { class: "font-semibold text-slate-900" }, toDisplayString(earning.articleTitle), 1),
                              createVNode("p", { class: "mt-1 text-xs text-slate-500" }, toDisplayString(earning.creditedAt) + " · " + toDisplayString(earning.description), 1)
                            ]),
                            createVNode("strong", { class: "text-emerald-700" }, "+" + toDisplayString(formatRupiah(earning.amount)), 1)
                          ]);
                        }), 128))
                      ])) : (openBlock(), createBlock("p", {
                        key: 1,
                        class: "px-6 py-8 text-sm text-slate-500"
                      }, "Belum ada honor yang dikreditkan."))
                    ]),
                    createVNode("div", { class: "overflow-hidden rounded-2xl border border-slate-200 bg-white" }, [
                      createVNode("div", { class: "border-b border-slate-200 px-6 py-5" }, [
                        createVNode("h2", { class: "text-2xl font-semibold" }, "Riwayat Withdrawal")
                      ]),
                      __props.writerWithdrawals.length ? (openBlock(), createBlock("div", {
                        key: 0,
                        class: "divide-y divide-slate-100"
                      }, [
                        (openBlock(true), createBlock(Fragment, null, renderList(__props.writerWithdrawals, (withdrawal) => {
                          return openBlock(), createBlock("div", {
                            key: withdrawal.id,
                            class: "flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
                          }, [
                            createVNode("div", null, [
                              createVNode("p", { class: "font-semibold text-slate-900" }, toDisplayString(formatRupiah(withdrawal.amount)) + " · " + toDisplayString(withdrawal.bankName), 1),
                              createVNode("p", { class: "mt-1 text-xs text-slate-500" }, toDisplayString(withdrawal.requestedAt) + " · " + toDisplayString(withdrawal.accountNumber), 1),
                              withdrawal.adminNote ? (openBlock(), createBlock("p", {
                                key: 0,
                                class: "mt-1 text-xs text-slate-500"
                              }, "Catatan: " + toDisplayString(withdrawal.adminNote), 1)) : createCommentVNode("", true)
                            ]),
                            createVNode("span", {
                              class: ["w-fit rounded-full px-3 py-1 text-xs font-bold", {
                                "bg-amber-100 text-amber-800": withdrawal.status === "pending",
                                "bg-blue-100 text-blue-800": withdrawal.status === "approved",
                                "bg-emerald-100 text-emerald-800": withdrawal.status === "paid",
                                "bg-rose-100 text-rose-800": withdrawal.status === "rejected"
                              }]
                            }, toDisplayString(withdrawal.statusLabel), 3)
                          ]);
                        }), 128))
                      ])) : (openBlock(), createBlock("p", {
                        key: 1,
                        class: "px-6 py-8 text-sm text-slate-500"
                      }, "Belum ada pengajuan withdrawal."))
                    ])
                  ])
                ])
              ], 512)), [
                [vShow, activePanel.value === "earnings"]
              ]) : createCommentVNode("", true),
              !__props.isAdmin ? withDirectives((openBlock(), createBlock("section", {
                key: 3,
                class: "mt-6"
              }, [
                createVNode("div", { class: "mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 sm:p-8" }, [
                  createVNode("span", { class: "news-kicker" }, "Pengaturan Penulis"),
                  createVNode("h2", { class: "mt-4 text-3xl font-semibold" }, "Rekening Pencairan"),
                  createVNode("p", { class: "mt-2 text-sm leading-6 text-slate-500" }, " Rekening ini digunakan sebagai tujuan setiap pengajuan withdrawal. Pastikan nama pemilik sesuai dengan data bank. "),
                  createVNode("form", {
                    class: "mt-7 space-y-5",
                    onSubmit: withModifiers(submitBank, ["prevent"])
                  }, [
                    createVNode("div", null, [
                      createVNode("label", { class: "admin-label" }, "Nama bank atau e-wallet"),
                      withDirectives(createVNode("input", {
                        "onUpdate:modelValue": ($event) => unref(bankForm).bank_name = $event,
                        type: "text",
                        class: "admin-input",
                        placeholder: "BCA, BRI, Mandiri, DANA"
                      }, null, 8, ["onUpdate:modelValue"]), [
                        [vModelText, unref(bankForm).bank_name]
                      ]),
                      unref(bankForm).errors.bank_name ? (openBlock(), createBlock("p", {
                        key: 0,
                        class: "admin-error"
                      }, toDisplayString(unref(bankForm).errors.bank_name), 1)) : createCommentVNode("", true)
                    ]),
                    createVNode("div", null, [
                      createVNode("label", { class: "admin-label" }, "Nomor rekening"),
                      withDirectives(createVNode("input", {
                        "onUpdate:modelValue": ($event) => unref(bankForm).bank_account_number = $event,
                        type: "text",
                        inputmode: "numeric",
                        class: "admin-input",
                        placeholder: "Hanya angka"
                      }, null, 8, ["onUpdate:modelValue"]), [
                        [vModelText, unref(bankForm).bank_account_number]
                      ]),
                      unref(bankForm).errors.bank_account_number ? (openBlock(), createBlock("p", {
                        key: 0,
                        class: "admin-error"
                      }, toDisplayString(unref(bankForm).errors.bank_account_number), 1)) : createCommentVNode("", true)
                    ]),
                    createVNode("div", null, [
                      createVNode("label", { class: "admin-label" }, "Nama pemilik rekening"),
                      withDirectives(createVNode("input", {
                        "onUpdate:modelValue": ($event) => unref(bankForm).bank_account_holder = $event,
                        type: "text",
                        class: "admin-input"
                      }, null, 8, ["onUpdate:modelValue"]), [
                        [vModelText, unref(bankForm).bank_account_holder]
                      ]),
                      unref(bankForm).errors.bank_account_holder ? (openBlock(), createBlock("p", {
                        key: 0,
                        class: "admin-error"
                      }, toDisplayString(unref(bankForm).errors.bank_account_holder), 1)) : createCommentVNode("", true)
                    ]),
                    createVNode("button", {
                      type: "submit",
                      class: "w-full rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800",
                      disabled: unref(bankForm).processing
                    }, toDisplayString(unref(bankForm).processing ? "Menyimpan..." : "Simpan Rekening"), 9, ["disabled"])
                  ], 32)
                ])
              ], 512)), [
                [vShow, activePanel.value === "bank"]
              ]) : createCommentVNode("", true),
              __props.isAdmin ? withDirectives((openBlock(), createBlock("section", {
                key: 4,
                class: "mt-6"
              }, [
                createVNode("div", { class: "grid gap-4 sm:grid-cols-2 xl:grid-cols-4" }, [
                  createVNode("div", { class: "admin-stat" }, [
                    createVNode("span", null, "Total honor"),
                    createVNode("strong", null, toDisplayString(formatRupiah(__props.paymentSummary.totalEarnings)), 1)
                  ]),
                  createVNode("div", { class: "admin-stat" }, [
                    createVNode("span", null, "Withdrawal menunggu"),
                    createVNode("strong", null, toDisplayString(__props.paymentSummary.pendingWithdrawals), 1)
                  ]),
                  createVNode("div", { class: "admin-stat" }, [
                    createVNode("span", null, "Nominal menunggu"),
                    createVNode("strong", null, toDisplayString(formatRupiah(__props.paymentSummary.pendingAmount)), 1)
                  ]),
                  createVNode("div", { class: "admin-stat" }, [
                    createVNode("span", null, "Sudah dibayar"),
                    createVNode("strong", null, toDisplayString(formatRupiah(__props.paymentSummary.paidAmount)), 1)
                  ])
                ]),
                createVNode("div", { class: "mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white" }, [
                  createVNode("div", { class: "border-b border-slate-200 px-6 py-5" }, [
                    createVNode("h2", { class: "text-2xl font-semibold" }, "Permintaan Withdrawal"),
                    createVNode("p", { class: "mt-1 text-sm text-slate-500" }, " Minimum withdrawal " + toDisplayString(formatRupiah(__props.paymentSummary.minimumWithdrawal)) + ". Setujui setelah rekening diperiksa, lalu tandai dibayar setelah transfer. ", 1)
                  ]),
                  createVNode("div", { class: "overflow-x-auto" }, [
                    createVNode("table", { class: "min-w-full text-left text-sm" }, [
                      createVNode("thead", { class: "bg-slate-50 text-xs uppercase tracking-[0.12em] text-slate-500" }, [
                        createVNode("tr", null, [
                          createVNode("th", { class: "px-5 py-4" }, "Penulis"),
                          createVNode("th", { class: "px-5 py-4" }, "Nominal"),
                          createVNode("th", { class: "px-5 py-4" }, "Rekening"),
                          createVNode("th", { class: "px-5 py-4" }, "Status"),
                          createVNode("th", { class: "px-5 py-4" }, "Aksi")
                        ])
                      ]),
                      createVNode("tbody", { class: "divide-y divide-slate-100" }, [
                        (openBlock(true), createBlock(Fragment, null, renderList(__props.adminWithdrawals, (withdrawal) => {
                          return openBlock(), createBlock("tr", {
                            key: withdrawal.id,
                            class: "align-top"
                          }, [
                            createVNode("td", { class: "px-5 py-4" }, [
                              createVNode("p", { class: "font-semibold text-slate-900" }, toDisplayString(withdrawal.writerName), 1),
                              createVNode("p", { class: "text-xs text-slate-500" }, toDisplayString(withdrawal.writerEmail), 1),
                              createVNode("p", { class: "mt-1 text-xs text-slate-500" }, toDisplayString(withdrawal.requestedAt), 1)
                            ]),
                            createVNode("td", { class: "px-5 py-4 font-bold text-slate-900" }, toDisplayString(formatRupiah(withdrawal.amount)), 1),
                            createVNode("td", { class: "px-5 py-4" }, [
                              createVNode("p", { class: "font-semibold" }, toDisplayString(withdrawal.bankName), 1),
                              createVNode("p", { class: "text-xs text-slate-500" }, toDisplayString(withdrawal.accountNumber), 1),
                              createVNode("p", { class: "text-xs text-slate-500" }, toDisplayString(withdrawal.accountHolder), 1)
                            ]),
                            createVNode("td", { class: "px-5 py-4" }, [
                              createVNode("span", {
                                class: ["rounded-full px-2.5 py-1 text-xs font-bold", {
                                  "bg-amber-100 text-amber-800": withdrawal.status === "pending",
                                  "bg-blue-100 text-blue-800": withdrawal.status === "approved",
                                  "bg-emerald-100 text-emerald-800": withdrawal.status === "paid",
                                  "bg-rose-100 text-rose-800": withdrawal.status === "rejected"
                                }]
                              }, toDisplayString(withdrawal.statusLabel), 3),
                              withdrawal.adminNote ? (openBlock(), createBlock("p", {
                                key: 0,
                                class: "mt-2 max-w-xs text-xs text-slate-500"
                              }, toDisplayString(withdrawal.adminNote), 1)) : createCommentVNode("", true)
                            ]),
                            createVNode("td", { class: "px-5 py-4" }, [
                              withdrawal.status !== "paid" && withdrawal.status !== "rejected" ? (openBlock(), createBlock("div", {
                                key: 0,
                                class: "flex flex-wrap gap-2"
                              }, [
                                withdrawal.status === "pending" ? (openBlock(), createBlock("button", {
                                  key: 0,
                                  type: "button",
                                  class: "admin-action text-blue-700",
                                  onClick: ($event) => updateWithdrawal(withdrawal, "approved")
                                }, "Setujui", 8, ["onClick"])) : createCommentVNode("", true),
                                withdrawal.status === "approved" ? (openBlock(), createBlock("button", {
                                  key: 1,
                                  type: "button",
                                  class: "admin-action text-emerald-700",
                                  onClick: ($event) => updateWithdrawal(withdrawal, "paid")
                                }, "Sudah Dibayar", 8, ["onClick"])) : createCommentVNode("", true),
                                createVNode("button", {
                                  type: "button",
                                  class: "admin-action text-rose-700",
                                  onClick: ($event) => updateWithdrawal(withdrawal, "rejected")
                                }, "Tolak", 8, ["onClick"])
                              ])) : (openBlock(), createBlock("span", {
                                key: 1,
                                class: "text-xs text-slate-400"
                              }, "Selesai"))
                            ])
                          ]);
                        }), 128)),
                        !__props.adminWithdrawals.length ? (openBlock(), createBlock("tr", { key: 0 }, [
                          createVNode("td", {
                            colspan: "5",
                            class: "px-6 py-10 text-center text-slate-500"
                          }, "Belum ada permintaan withdrawal.")
                        ])) : createCommentVNode("", true)
                      ])
                    ])
                  ])
                ])
              ], 512)), [
                [vShow, activePanel.value === "payments"]
              ]) : createCommentVNode("", true),
              __props.isAdmin ? withDirectives((openBlock(), createBlock("section", {
                key: 5,
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
                        createVNode("p", { class: "text-[10px] font-bold uppercase tracking-[0.16em] text-blue-700" }, toDisplayString(__props.isAdmin ? "Admin pembuat artikel" : "Penulis dari session login"), 1),
                        createVNode("p", { class: "truncate text-sm font-semibold text-slate-900" }, toDisplayString((_i = currentAuthor.value) == null ? void 0 : _i.name), 1),
                        createVNode("p", { class: "truncate text-xs text-slate-500" }, toDisplayString((_j = currentAuthor.value) == null ? void 0 : _j.email), 1)
                      ])
                    ]),
                    createVNode("form", {
                      class: "mt-6 space-y-5",
                      onSubmit: withModifiers(submitNews, ["prevent"])
                    }, [
                      createVNode("div", {
                        class: ["grid gap-4 sm:grid-cols-2", { "xl:grid-cols-3": __props.isAdmin }]
                      }, [
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
                          createVNode("label", { class: "admin-label" }, "Penulis artikel"),
                          withDirectives(createVNode("select", {
                            "onUpdate:modelValue": ($event) => unref(newsForm).assigned_user_id = $event,
                            class: "admin-input"
                          }, [
                            (openBlock(true), createBlock(Fragment, null, renderList(__props.articleAuthors, (author) => {
                              return openBlock(), createBlock("option", {
                                key: author.id,
                                value: author.id
                              }, toDisplayString(author.name) + " · " + toDisplayString(author.roleLabel), 9, ["value"]);
                            }), 128))
                          ], 8, ["onUpdate:modelValue"]), [
                            [vModelSelect, unref(newsForm).assigned_user_id]
                          ]),
                          unref(newsForm).errors.assigned_user_id ? (openBlock(), createBlock("p", {
                            key: 0,
                            class: "admin-error"
                          }, toDisplayString(unref(newsForm).errors.assigned_user_id), 1)) : createCommentVNode("", true)
                        ])) : createCommentVNode("", true),
                        __props.isAdmin ? (openBlock(), createBlock("div", { key: 1 }, [
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
                        ])) : (openBlock(), createBlock("div", { key: 2 }, [
                          createVNode("label", { class: "admin-label" }, "Status"),
                          createVNode("div", { class: "rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800" }, " Draft — menunggu pemeriksaan admin ")
                        ]))
                      ], 2),
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
                            createVNode("div", { class: "mt-2 flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-wider" }, [
                              createVNode("span", { class: "rounded-full bg-slate-100 px-2 py-1 text-slate-600" }, "Editorial: " + toDisplayString(article.editorialStatus), 1),
                              createVNode("span", { class: "rounded-full bg-slate-100 px-2 py-1 text-slate-600" }, "Fakta: " + toDisplayString(article.factCheckStatus), 1),
                              article.earningAmount ? (openBlock(), createBlock("span", {
                                key: 0,
                                class: "rounded-full bg-emerald-100 px-2 py-1 text-emerald-700"
                              }, " Honor " + toDisplayString(formatRupiah(article.earningAmount)), 1)) : createCommentVNode("", true)
                            ]),
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
                key: 6,
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
                key: 7,
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
                      unref(userForm).role === "writer" ? (openBlock(), createBlock("div", { key: 0 }, [
                        createVNode("label", { class: "admin-label" }, "Honor per artikel"),
                        withDirectives(createVNode("input", {
                          "onUpdate:modelValue": ($event) => unref(userForm).article_fee = $event,
                          type: "number",
                          min: "0",
                          step: "1000",
                          class: "admin-input"
                        }, null, 8, ["onUpdate:modelValue"]), [
                          [vModelText, unref(userForm).article_fee]
                        ]),
                        createVNode("p", { class: "mt-1 text-xs text-slate-500" }, "Dikreditkan sekali setelah artikel disetujui dan fakta terverifikasi."),
                        unref(userForm).errors.article_fee ? (openBlock(), createBlock("p", {
                          key: 0,
                          class: "admin-error"
                        }, toDisplayString(unref(userForm).errors.article_fee), 1)) : createCommentVNode("", true)
                      ])) : createCommentVNode("", true),
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
                            createVNode("th", { class: "px-5 py-4" }, "Honor / Saldo"),
                            createVNode("th", { class: "px-5 py-4" }, "Artikel"),
                            createVNode("th", { class: "px-5 py-4" }, "Aksi")
                          ])
                        ]),
                        createVNode("tbody", { class: "divide-y divide-slate-100" }, [
                          (openBlock(true), createBlock(Fragment, null, renderList(__props.users, (account) => {
                            var _a3;
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
                              createVNode("td", { class: "px-5 py-4" }, [
                                account.role === "writer" ? (openBlock(), createBlock(Fragment, { key: 0 }, [
                                  createVNode("p", { class: "font-semibold text-slate-900" }, toDisplayString(formatRupiah(account.articleFee)) + " / artikel", 1),
                                  createVNode("p", { class: "text-xs text-slate-500" }, "Total " + toDisplayString(formatRupiah(account.totalEarnings)), 1)
                                ], 64)) : (openBlock(), createBlock("span", {
                                  key: 1,
                                  class: "text-xs text-slate-400"
                                }, "Tidak berlaku"))
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
                                    disabled: account.id === ((_a3 = currentAuthor.value) == null ? void 0 : _a3.id) || account.articlesCount > 0,
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

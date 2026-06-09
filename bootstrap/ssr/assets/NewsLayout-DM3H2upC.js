import { computed, ref, watch, onMounted, onBeforeUnmount, mergeProps, unref, withCtx, createTextVNode, createVNode, toDisplayString, openBlock, createBlock, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrInterpolate, ssrRenderAttr, ssrRenderComponent, ssrRenderClass, ssrRenderList, ssrRenderTeleport, ssrRenderSlot } from "vue/server-renderer";
import { usePage, Link } from "@inertiajs/vue3";
const messages = {
  id: {
    edition: "Edisi",
    mainPortal: "Portal berita utama",
    digitalNewsPortal: "Portal Berita Digital",
    searchPlaceholder: "Cari berita, isu, atau tokoh",
    search: "Cari",
    profile: "Profil",
    licenseDashboard: "Dashboard Lisensi",
    breaking: "Breaking",
    fastUpdate: "Update cepat",
    editorChoice: "Pilihan utama",
    editorChoiceTitle: "Liputan pilihan dengan konteks yang kuat",
    editorChoiceDescription: "Kurasi berita penting yang layak dibaca lebih dulu oleh pembaca Radina News.",
    latest: "Terbaru",
    latestTitle: "Berita terbaru hari ini",
    latestDescription: "Perkembangan terbaru dari teknologi, bisnis, startup, data, dan gaya hidup digital.",
    trending: "Sedang ramai dibaca",
    popularTopics: "Topik populer",
    categories: "Kategori",
    categoryMenu: "Kategori",
    categoriesTitle: "Jelajahi kanal berita",
    categoriesDescription: "Temukan berita berdasarkan topik yang paling relevan dengan kebutuhan Anda.",
    articles: "artikel",
    latestHighlight: "Sorotan terbaru",
    readMinutes: "menit baca",
    views: "tayangan",
    newsroomProfile: "Profil Radina News",
    dashboardLogin: "Login Dashboard",
    manageNews: "Kelola Berita",
    logout: "Keluar",
    archiveSearch: "Cari di arsip berita",
    highlights: "Sorotan",
    quickPicks: "Pilihan cepat",
    quickPicksDescription: "Artikel penting yang layak dibuka lebih dulu.",
    share: "Bagikan",
    rising: "Sedang naik",
    relatedArticles: "Artikel terkait",
    aboutNewsroom: "Tentang Radina News",
    aboutTitle: "Informasi yang jernih untuk keputusan yang lebih baik",
    aboutDescription: "Radina News menghadirkan berita terkini dan laporan mendalam dengan bahasa yang lugas, mudah dipahami, dan relevan bagi pembaca.",
    editorial: "Tepercaya",
    editorialDescription: "Setiap informasi disajikan secara bertanggung jawab dengan memperhatikan ketepatan fakta dan konteks.",
    technology: "Relevan",
    technologyDescription: "Topik dipilih berdasarkan perkembangan yang berdampak pada masyarakat, bisnis, dan kehidupan sehari-hari.",
    seo: "Mudah Diakses",
    seoDescription: "Berita dapat dibaca dengan nyaman di berbagai perangkat dan ditemukan kembali melalui kategori maupun pencarian.",
    footerEyebrow: "Terhubung dengan informasi",
    footerTitle: "Berita penting, konteks jelas, langsung ke Anda.",
    footerDescription: "Ikuti kanal Radina News dan temukan liputan terbaru dari berbagai kategori.",
    explore: "Jelajahi",
    newsroom: "Informasi",
    contactUs: "Hubungi kami",
    followUs: "Ikuti kami",
    allRightsReserved: "Seluruh hak cipta dilindungi.",
    editorialStandard: "Informasi cepat dengan konteks yang dapat dipercaya."
  },
  en: {
    edition: "Edition",
    mainPortal: "Main news portal",
    digitalNewsPortal: "Digital News Portal",
    searchPlaceholder: "Search news, issues, or people",
    search: "Search",
    profile: "Profile",
    licenseDashboard: "License Dashboard",
    breaking: "Breaking",
    fastUpdate: "Quick updates",
    editorChoice: "Editor's picks",
    editorChoiceTitle: "Selected stories with stronger context",
    editorChoiceDescription: "A curated selection of important stories worth reading first on Radina News.",
    latest: "Latest",
    latestTitle: "Latest news today",
    latestDescription: "Recent developments in technology, business, startups, data, and digital lifestyle.",
    trending: "Most read",
    popularTopics: "Popular topics",
    categories: "Categories",
    categoryMenu: "Categories",
    categoriesTitle: "Explore news channels",
    categoriesDescription: "Find stories based on the topics most relevant to you.",
    articles: "articles",
    latestHighlight: "Latest highlight",
    readMinutes: "min read",
    views: "views",
    newsroomProfile: "Radina News Profile",
    dashboardLogin: "Dashboard Login",
    manageNews: "Manage News",
    logout: "Logout",
    archiveSearch: "Search the news archive",
    highlights: "Highlights",
    quickPicks: "Quick picks",
    quickPicksDescription: "Important stories worth opening first.",
    share: "Share",
    rising: "Rising stories",
    relatedArticles: "Related stories",
    aboutNewsroom: "About Radina News",
    aboutTitle: "Clear information for better decisions",
    aboutDescription: "Radina News delivers current stories and in-depth reports in clear, accessible language that matters to readers.",
    editorial: "Trusted",
    editorialDescription: "Information is presented responsibly with careful attention to facts and context.",
    technology: "Relevant",
    technologyDescription: "Coverage focuses on developments that affect society, business, and everyday life.",
    seo: "Accessible",
    seoDescription: "Stories are comfortable to read across devices and easy to revisit through categories and search.",
    footerEyebrow: "Stay connected with information",
    footerTitle: "Important stories, clear context, delivered to you.",
    footerDescription: "Follow Radina News and discover the latest coverage across our news channels.",
    explore: "Explore",
    newsroom: "Information",
    contactUs: "Contact us",
    followUs: "Follow us",
    allRightsReserved: "All rights reserved.",
    editorialStandard: "Fast information with context you can trust."
  }
};
function useNewsLocale() {
  const page = usePage();
  const locale = computed(() => page.props.locale || "id");
  const t = (key) => {
    var _a;
    return ((_a = messages[locale.value]) == null ? void 0 : _a[key]) || messages.id[key] || key;
  };
  return {
    locale,
    t
  };
}
const _sfc_main = {
  __name: "NewsLayout",
  __ssrInlineRender: true,
  setup(__props) {
    var _a;
    const page = usePage();
    const searchTerm = ref(((_a = page.props.filters) == null ? void 0 : _a.q) || "");
    const categoryDrawerOpen = ref(false);
    const navigation = computed(() => page.props.navigation || { categories: [] });
    const portal = computed(() => page.props.portal || {});
    const authUser = computed(() => {
      var _a2;
      return ((_a2 = page.props.auth) == null ? void 0 : _a2.user) || null;
    });
    const { locale, t } = useNewsLocale();
    const editionLabel = computed(() => new Intl.DateTimeFormat(
      locale.value === "en" ? "en-US" : "id-ID",
      {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
      }
    ).format(/* @__PURE__ */ new Date()));
    watch(
      () => {
        var _a2;
        return (_a2 = page.props.filters) == null ? void 0 : _a2.q;
      },
      (value) => {
        searchTerm.value = value || "";
      }
    );
    watch(
      () => page.url,
      () => {
        categoryDrawerOpen.value = false;
      }
    );
    watch(categoryDrawerOpen, (isOpen) => {
      if (typeof document !== "undefined") {
        document.body.style.overflow = isOpen ? "hidden" : "";
      }
    });
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        categoryDrawerOpen.value = false;
      }
    };
    onMounted(() => {
      window.addEventListener("keydown", handleEscape);
    });
    onBeforeUnmount(() => {
      window.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    });
    const isActive = (url) => {
      if (!url) {
        return false;
      }
      return url === "/" ? page.url === "/" : page.url.startsWith(url);
    };
    return (_ctx, _push, _parent, _attrs) => {
      var _a2;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "news-shell" }, _attrs))}><div class="border-b border-slate-200/80 bg-slate-950 text-slate-300"><div class="mx-auto flex min-h-9 max-w-7xl items-center justify-between gap-4 px-4 text-[11px] sm:px-6 lg:px-8"><span class="truncate uppercase tracking-[0.14em]">${ssrInterpolate(unref(t)("edition"))} ${ssrInterpolate(editionLabel.value)}</span><div class="flex shrink-0 items-center gap-3"><a href="/rss.xml" class="hidden transition hover:text-white sm:inline">RSS</a><a${ssrRenderAttr("href", (_a2 = portal.value.socials) == null ? void 0 : _a2.instagram)} target="_blank" rel="noreferrer" class="hidden transition hover:text-white sm:inline">Instagram</a><span class="hidden h-3 w-px bg-slate-700 sm:block"></span>`);
      if (authUser.value) {
        _push(`<!--[--><span class="hidden text-slate-400 lg:inline">${ssrInterpolate(authUser.value.name)}</span>`);
        _push(ssrRenderComponent(unref(Link), {
          href: "/dashboard",
          class: "hidden font-semibold transition hover:text-white sm:inline"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` Dashboard `);
            } else {
              return [
                createTextVNode(" Dashboard ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<!--]-->`);
      } else {
        _push(`<a href="/login" class="font-semibold text-white transition hover:text-blue-200">${ssrInterpolate(unref(t)("dashboardLogin"))}</a>`);
      }
      _push(`<div class="flex items-center rounded-full border border-slate-700 p-0.5"><button type="button" class="${ssrRenderClass([unref(locale) === "id" ? "bg-white text-slate-950" : "text-slate-400 hover:text-white", "rounded-full px-2 py-0.5 font-semibold transition"])}"> ID </button><button type="button" class="${ssrRenderClass([unref(locale) === "en" ? "bg-white text-slate-950" : "text-slate-400 hover:text-white", "rounded-full px-2 py-0.5 font-semibold transition"])}"> EN </button></div>`);
      if (authUser.value) {
        _push(`<button type="button" class="hidden transition hover:text-white sm:inline">${ssrInterpolate(unref(t)("logout"))}</button>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div></div><header class="border-b border-slate-200/80 bg-white/95 shadow-[0_8px_30px_rgba(15,23,42,0.04)]"><div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><div class="flex flex-col gap-5 py-4 md:flex-row md:items-center md:justify-between">`);
      _push(ssrRenderComponent(unref(Link), {
        href: "/",
        class: "flex min-w-0 items-center gap-4 sm:gap-5"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<img${ssrRenderAttr("src", portal.value.mark || portal.value.logo)}${ssrRenderAttr("alt", portal.value.name)} class="h-16 w-16 shrink-0 rounded-xl object-contain sm:h-20 sm:w-20 lg:h-24 lg:w-24"${_scopeId}><div class="min-w-0 border-l border-slate-200 pl-4 sm:pl-5"${_scopeId}><p class="truncate text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl"${_scopeId}>${ssrInterpolate(portal.value.name)}</p><p class="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.25em] text-blue-700 sm:text-xs"${_scopeId}>${ssrInterpolate(unref(t)("digitalNewsPortal"))}</p></div>`);
          } else {
            return [
              createVNode("img", {
                src: portal.value.mark || portal.value.logo,
                alt: portal.value.name,
                class: "h-16 w-16 shrink-0 rounded-xl object-contain sm:h-20 sm:w-20 lg:h-24 lg:w-24"
              }, null, 8, ["src", "alt"]),
              createVNode("div", { class: "min-w-0 border-l border-slate-200 pl-4 sm:pl-5" }, [
                createVNode("p", { class: "truncate text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl" }, toDisplayString(portal.value.name), 1),
                createVNode("p", { class: "mt-0.5 text-[10px] font-semibold uppercase tracking-[0.25em] text-blue-700 sm:text-xs" }, toDisplayString(unref(t)("digitalNewsPortal")), 1)
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<form class="flex w-full gap-2 md:max-w-md lg:max-w-lg"><input${ssrRenderAttr("value", searchTerm.value)} type="search"${ssrRenderAttr("placeholder", unref(t)("searchPlaceholder"))} class="min-w-0 flex-1 rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"><button type="submit" class="rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800">${ssrInterpolate(unref(t)("search"))}</button></form></div></div><div class="border-t border-blue-800 bg-blue-700"><div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 md:hidden"><span class="text-[11px] font-bold uppercase tracking-[0.16em] text-blue-100">${ssrInterpolate(unref(t)("categoryMenu"))}</span><button type="button" class="inline-flex items-center gap-2 rounded-lg border border-blue-400/70 bg-blue-800/40 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-800" aria-controls="mobile-category-drawer"${ssrRenderAttr("aria-expanded", categoryDrawerOpen.value)}><svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" d="M4 6h16M4 12h16M4 18h16"></path></svg> ${ssrInterpolate(unref(t)("categoryMenu"))}</button></div><div class="mx-auto hidden max-w-7xl items-center gap-3 overflow-x-auto px-4 py-2.5 sm:px-6 md:flex lg:px-8"><span class="sticky left-0 z-10 shrink-0 border-r border-blue-500 bg-blue-700 pr-3 text-[11px] font-bold uppercase tracking-[0.16em] text-blue-100">${ssrInterpolate(unref(t)("categoryMenu"))}</span><!--[-->`);
      ssrRenderList(navigation.value.categories, (category) => {
        _push(ssrRenderComponent(unref(Link), {
          key: category.slug,
          href: category.url,
          class: ["whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/15", isActive(category.url) ? "bg-white text-blue-800 hover:bg-white" : ""]
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(category.name)}`);
            } else {
              return [
                createTextVNode(toDisplayString(category.name), 1)
              ];
            }
          }),
          _: 2
        }, _parent));
      });
      _push(`<!--]--></div></div></header>`);
      ssrRenderTeleport(_push, (_push2) => {
        if (categoryDrawerOpen.value) {
          _push2(`<div class="fixed inset-0 z-50 bg-slate-950/55 backdrop-blur-[2px] md:hidden" aria-hidden="true"></div>`);
        } else {
          _push2(`<!---->`);
        }
        if (categoryDrawerOpen.value) {
          _push2(`<aside id="mobile-category-drawer" class="fixed inset-y-0 left-0 z-[60] flex w-[84%] max-w-sm flex-col bg-white shadow-2xl md:hidden" role="dialog" aria-modal="true"${ssrRenderAttr("aria-label", unref(t)("categoryMenu"))}><div class="flex items-center justify-between border-b border-slate-200 px-5 py-4"><div><p class="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">${ssrInterpolate(portal.value.name)}</p><h2 class="mt-1 text-lg font-bold text-slate-950">${ssrInterpolate(unref(t)("categoryMenu"))}</h2></div><button type="button" class="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-slate-200" aria-label="Tutup menu kategori"><svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M6 6l12 12M18 6 6 18"></path></svg></button></div><nav class="flex-1 overflow-y-auto p-4"><!--[-->`);
          ssrRenderList(navigation.value.categories, (category) => {
            _push2(ssrRenderComponent(unref(Link), {
              key: category.slug,
              href: category.url,
              class: ["mb-1 flex items-center justify-between rounded-xl px-4 py-3.5 text-sm font-semibold transition", isActive(category.url) ? "bg-blue-700 text-white shadow-sm" : "text-slate-700 hover:bg-blue-50 hover:text-blue-800"],
              onClick: ($event) => categoryDrawerOpen.value = false
            }, {
              default: withCtx((_, _push3, _parent2, _scopeId) => {
                if (_push3) {
                  _push3(`<span${_scopeId}>${ssrInterpolate(category.name)}</span><svg class="h-4 w-4 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" d="m9 18 6-6-6-6"${_scopeId}></path></svg>`);
                } else {
                  return [
                    createVNode("span", null, toDisplayString(category.name), 1),
                    (openBlock(), createBlock("svg", {
                      class: "h-4 w-4 opacity-70",
                      viewBox: "0 0 24 24",
                      fill: "none",
                      stroke: "currentColor",
                      "stroke-width": "2",
                      "aria-hidden": "true"
                    }, [
                      createVNode("path", {
                        "stroke-linecap": "round",
                        "stroke-linejoin": "round",
                        d: "m9 18 6-6-6-6"
                      })
                    ]))
                  ];
                }
              }),
              _: 2
            }, _parent));
          });
          _push2(`<!--]--></nav></aside>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
      _push(`<main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">`);
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</main><footer class="relative overflow-hidden bg-slate-950 text-slate-300"><div class="pointer-events-none absolute -right-28 top-0 h-80 w-80 rounded-full bg-blue-600/20 blur-3xl"></div><div class="pointer-events-none absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl"></div><div class="relative border-b border-white/10"><div class="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8"><div class="max-w-2xl"><p class="text-xs font-bold uppercase tracking-[0.2em] text-blue-300">${ssrInterpolate(unref(t)("footerEyebrow"))}</p><h2 class="mt-3 text-2xl font-bold leading-tight text-white sm:text-3xl">${ssrInterpolate(unref(t)("footerTitle"))}</h2><p class="mt-3 text-sm leading-7 text-slate-400">${ssrInterpolate(unref(t)("footerDescription"))}</p></div><div class="flex shrink-0 flex-wrap gap-3"><a href="/rss.xml" class="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-500"><svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M5 3a2 2 0 1 0 0 4c6.63 0 12 5.37 12 12a2 2 0 1 0 4 0C21 10.16 13.84 3 5 3Zm0 6a2 2 0 1 0 0 4c3.31 0 6 2.69 6 6a2 2 0 1 0 4 0c0-5.52-4.48-10-10-10Zm0 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z"></path></svg> RSS Feed </a><a${ssrRenderAttr("href", `tel:${portal.value.contactPhone}`)} class="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-bold text-white transition hover:border-blue-400/60 hover:bg-white/10">${ssrInterpolate(unref(t)("contactUs"))}</a></div></div></div><div class="relative mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.35fr_0.75fr_0.75fr_1fr] lg:px-8"><div>`);
      _push(ssrRenderComponent(unref(Link), {
        href: "/",
        class: "inline-flex items-center gap-4"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span class="grid h-14 w-14 place-items-center rounded-2xl bg-white shadow-lg shadow-blue-950/40"${_scopeId}><img${ssrRenderAttr("src", portal.value.mark || portal.value.logo)}${ssrRenderAttr("alt", portal.value.name)} class="h-11 w-11 object-contain"${_scopeId}></span><span${_scopeId}><strong class="block text-xl text-white"${_scopeId}>${ssrInterpolate(portal.value.name)}</strong><span class="mt-1 block text-[10px] font-bold uppercase tracking-[0.22em] text-blue-300"${_scopeId}>${ssrInterpolate(unref(t)("digitalNewsPortal"))}</span></span>`);
          } else {
            return [
              createVNode("span", { class: "grid h-14 w-14 place-items-center rounded-2xl bg-white shadow-lg shadow-blue-950/40" }, [
                createVNode("img", {
                  src: portal.value.mark || portal.value.logo,
                  alt: portal.value.name,
                  class: "h-11 w-11 object-contain"
                }, null, 8, ["src", "alt"])
              ]),
              createVNode("span", null, [
                createVNode("strong", { class: "block text-xl text-white" }, toDisplayString(portal.value.name), 1),
                createVNode("span", { class: "mt-1 block text-[10px] font-bold uppercase tracking-[0.22em] text-blue-300" }, toDisplayString(unref(t)("digitalNewsPortal")), 1)
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<p class="mt-5 max-w-sm text-sm leading-7 text-slate-400">${ssrInterpolate(portal.value.description)}</p><p class="mt-4 max-w-sm border-l-2 border-blue-500 pl-4 text-xs font-semibold leading-6 text-slate-300">${ssrInterpolate(unref(t)("editorialStandard"))}</p></div><div><h3 class="text-xs font-bold uppercase tracking-[0.18em] text-white">${ssrInterpolate(unref(t)("explore"))}</h3><nav class="mt-5 grid gap-3 text-sm">`);
      _push(ssrRenderComponent(unref(Link), {
        href: "/",
        class: "transition hover:translate-x-1 hover:text-blue-300"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(unref(t)("mainPortal"))}`);
          } else {
            return [
              createTextVNode(toDisplayString(unref(t)("mainPortal")), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(unref(Link), {
        href: "/berita",
        class: "transition hover:translate-x-1 hover:text-blue-300"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(unref(t)("latest"))}`);
          } else {
            return [
              createTextVNode(toDisplayString(unref(t)("latest")), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<!--[-->`);
      ssrRenderList(navigation.value.categories.slice(0, 3), (category) => {
        _push(ssrRenderComponent(unref(Link), {
          key: `footer-${category.slug}`,
          href: category.url,
          class: "transition hover:translate-x-1 hover:text-blue-300"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(category.name)}`);
            } else {
              return [
                createTextVNode(toDisplayString(category.name), 1)
              ];
            }
          }),
          _: 2
        }, _parent));
      });
      _push(`<!--]--></nav></div><div><h3 class="text-xs font-bold uppercase tracking-[0.18em] text-white">${ssrInterpolate(unref(t)("newsroom"))}</h3><nav class="mt-5 grid gap-3 text-sm">`);
      _push(ssrRenderComponent(unref(Link), {
        href: "/tentang",
        class: "transition hover:translate-x-1 hover:text-blue-300"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(unref(t)("aboutNewsroom"))}`);
          } else {
            return [
              createTextVNode(toDisplayString(unref(t)("aboutNewsroom")), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<a href="/sitemap.xml" class="transition hover:translate-x-1 hover:text-blue-300">Sitemap</a><a href="/rss.xml" class="transition hover:translate-x-1 hover:text-blue-300">RSS Feed</a><a${ssrRenderAttr("href", `tel:${portal.value.contactPhone}`)} class="transition hover:translate-x-1 hover:text-blue-300">${ssrInterpolate(unref(t)("contactUs"))}</a></nav></div><div><h3 class="text-xs font-bold uppercase tracking-[0.18em] text-white">${ssrInterpolate(unref(t)("contactUs"))}</h3><div class="mt-5 space-y-4 text-sm"><a${ssrRenderAttr("href", `tel:${portal.value.contactPhone}`)} class="flex items-start gap-3 transition hover:text-blue-300"><svg class="mt-0.5 h-4 w-4 shrink-0 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.63a2 2 0 0 1-.45 2.11L8 9.73a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.85.29 1.73.5 2.63.62A2 2 0 0 1 22 16.92Z"></path></svg><span>${ssrInterpolate(portal.value.contactPhone)}</span></a><div class="flex items-start gap-3"><svg class="mt-0.5 h-4 w-4 shrink-0 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"></path><circle cx="12" cy="10" r="2.5"></circle></svg><span>${ssrInterpolate(portal.value.address)}</span></div></div><div class="mt-6"><p class="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">${ssrInterpolate(unref(t)("followUs"))}</p><div class="mt-3 flex flex-wrap gap-2"><!--[-->`);
      ssrRenderList(portal.value.socials, (url, network) => {
        _push(`<a${ssrRenderAttr("href", url)} target="_blank" rel="noreferrer" class="grid h-9 min-w-9 place-items-center rounded-lg border border-white/10 bg-white/5 px-2 text-[10px] font-bold uppercase text-slate-300 transition hover:-translate-y-0.5 hover:border-blue-400/60 hover:bg-blue-500 hover:text-white"${ssrRenderAttr("aria-label", network)}>${ssrInterpolate(network === "linkedin" ? "in" : network === "youtube" ? "YT" : network === "instagram" ? "IG" : "X")}</a>`);
      });
      _push(`<!--]--></div></div></div></div><div class="relative border-t border-white/10"><div class="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8"><p>© ${ssrInterpolate((/* @__PURE__ */ new Date()).getFullYear())} ${ssrInterpolate(portal.value.name)}. ${ssrInterpolate(unref(t)("allRightsReserved"))}</p><div class="flex items-center gap-2"><span class="h-1.5 w-1.5 rounded-full bg-emerald-400"></span><span>Radina News</span></div></div></div></footer></div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Layouts/NewsLayout.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  _sfc_main as _,
  useNewsLocale as u
};

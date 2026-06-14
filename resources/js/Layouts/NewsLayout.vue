<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { Link, router, usePage } from '@inertiajs/vue3';
import { useNewsLocale } from '../Composables/useNewsLocale';

const page = usePage();
const searchTerm = ref(page.props.filters?.q || '');
const categoryDrawerOpen = ref(false);
const navigation = computed(() => page.props.navigation || { categories: [] });
const portal = computed(() => page.props.portal || {});
const authUser = computed(() => page.props.auth?.user || null);
const { locale, t } = useNewsLocale();

const editionLabel = computed(() => new Intl.DateTimeFormat(
    locale.value === 'en' ? 'en-US' : 'id-ID',
    {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }
).format(new Date()));

watch(
    () => page.props.filters?.q,
    (value) => {
        searchTerm.value = value || '';
    }
);

watch(
    () => page.url,
    () => {
        categoryDrawerOpen.value = false;
    }
);

watch(categoryDrawerOpen, (isOpen) => {
    if (typeof document !== 'undefined') {
        document.body.style.overflow = isOpen ? 'hidden' : '';
    }
});

const handleEscape = (event) => {
    if (event.key === 'Escape') {
        categoryDrawerOpen.value = false;
    }
};

onMounted(() => {
    window.addEventListener('keydown', handleEscape);
});

onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleEscape);
    document.body.style.overflow = '';
});

const submitSearch = () => {
    router.get('/berita', searchTerm.value ? { q: searchTerm.value } : {}, {
        preserveState: true,
        preserveScroll: true,
    });
};

const switchLanguage = (nextLocale) => {
    if (nextLocale === locale.value) {
        return;
    }

    router.post(`/language/${nextLocale}`, {}, {
        preserveScroll: true,
    });
};

const logout = () => {
    router.post('/logout');
};

const isActive = (url) => {
    if (!url) {
        return false;
    }

    return url === '/' ? page.url === '/' : page.url.startsWith(url);
};
</script>

<template>
    <div class="news-shell">
        <div class="border-b border-slate-200/80 bg-slate-950 text-slate-300">
            <div class="mx-auto flex min-h-9 max-w-7xl items-center justify-between gap-4 px-4 text-[11px] sm:px-6 lg:px-8">
                <span class="truncate uppercase tracking-[0.14em]">
                    {{ t('edition') }} {{ editionLabel }}
                </span>

                <div class="flex shrink-0 items-center gap-3">
                    <a href="/rss.xml" class="hidden transition hover:text-white sm:inline">RSS</a>
                    <a :href="portal.socials?.instagram" target="_blank" rel="noreferrer" class="hidden transition hover:text-white sm:inline">Instagram</a>
                    <span class="hidden h-3 w-px bg-slate-700 sm:block" />
                    <template v-if="authUser">
                        <span class="hidden text-slate-400 lg:inline">
                            {{ authUser.name }}
                        </span>
                        <Link href="/dashboard" class="hidden font-semibold transition hover:text-white sm:inline">
                            Dashboard
                        </Link>
                    </template>
                    <template v-else>
                        <a href="/login" class="font-semibold text-white transition hover:text-blue-200">
                            {{ t('dashboardLogin') }}
                        </a>
                    </template>
                    <div class="flex items-center rounded-full border border-slate-700 p-0.5">
                        <button
                            type="button"
                            class="rounded-full px-2 py-0.5 font-semibold transition"
                            :class="locale === 'id' ? 'bg-white text-slate-950' : 'text-slate-400 hover:text-white'"
                            @click="switchLanguage('id')"
                        >
                            ID
                        </button>
                        <button
                            type="button"
                            class="rounded-full px-2 py-0.5 font-semibold transition"
                            :class="locale === 'en' ? 'bg-white text-slate-950' : 'text-slate-400 hover:text-white'"
                            @click="switchLanguage('en')"
                        >
                            EN
                        </button>
                    </div>
                    <template v-if="authUser">
                        <button type="button" class="hidden transition hover:text-white sm:inline" @click="logout">
                            {{ t('logout') }}
                        </button>
                    </template>
                </div>
            </div>
        </div>

        <header class="border-b border-slate-200/80 bg-white/95 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
            <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div class="flex flex-col gap-5 py-4 md:flex-row md:items-center md:justify-between">
                    <Link href="/" class="flex min-w-0 items-center gap-4 sm:gap-5">
                        <img
                            :src="portal.mark || portal.logo"
                            :alt="portal.name"
                            class="h-16 w-16 shrink-0 rounded-xl object-contain sm:h-20 sm:w-20 lg:h-24 lg:w-24"
                        >
                        <div class="min-w-0 border-l border-slate-200 pl-4 sm:pl-5">
                            <p class="truncate text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">{{ portal.name }}</p>
                            <p class="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.25em] text-blue-700 sm:text-xs">
                                {{ t('digitalNewsPortal') }}
                            </p>
                        </div>
                    </Link>

                    <form class="flex w-full gap-2 md:max-w-md lg:max-w-lg" @submit.prevent="submitSearch">
                        <input
                            v-model="searchTerm"
                            type="search"
                            :placeholder="t('searchPlaceholder')"
                            class="min-w-0 flex-1 rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                        >
                        <button
                            type="submit"
                            class="rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800"
                        >
                            {{ t('search') }}
                        </button>
                    </form>
                </div>

            </div>

            <div class="border-t border-blue-800 bg-blue-700">
                <div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 md:hidden">
                    <span class="text-[11px] font-bold uppercase tracking-[0.16em] text-blue-100">
                        {{ t('categoryMenu') }}
                    </span>
                    <button
                        type="button"
                        class="inline-flex items-center gap-2 rounded-lg border border-blue-400/70 bg-blue-800/40 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-800"
                        aria-controls="mobile-category-drawer"
                        :aria-expanded="categoryDrawerOpen"
                        @click="categoryDrawerOpen = true"
                    >
                        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                            <path stroke-linecap="round" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                        {{ t('categoryMenu') }}
                    </button>
                </div>

                <div class="mx-auto hidden max-w-7xl items-center gap-3 overflow-x-auto px-4 py-2.5 sm:px-6 md:flex lg:px-8">
                    <span class="sticky left-0 z-10 shrink-0 border-r border-blue-500 bg-blue-700 pr-3 text-[11px] font-bold uppercase tracking-[0.16em] text-blue-100">
                        {{ t('categoryMenu') }}
                    </span>
                    <Link
                        v-for="category in navigation.categories"
                        :key="category.slug"
                        :href="category.url"
                        class="whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/15"
                        :class="isActive(category.url) ? 'bg-white text-blue-800 hover:bg-white' : ''"
                    >
                        {{ category.name }}
                    </Link>
                </div>
            </div>
        </header>

        <Teleport to="body">
            <Transition
                enter-active-class="transition-opacity duration-200"
                enter-from-class="opacity-0"
                enter-to-class="opacity-100"
                leave-active-class="transition-opacity duration-200"
                leave-from-class="opacity-100"
                leave-to-class="opacity-0"
            >
                <div
                    v-if="categoryDrawerOpen"
                    class="fixed inset-0 z-50 bg-slate-950/55 backdrop-blur-[2px] md:hidden"
                    aria-hidden="true"
                    @click="categoryDrawerOpen = false"
                />
            </Transition>

            <Transition
                enter-active-class="transition-transform duration-300 ease-out"
                enter-from-class="-translate-x-full"
                enter-to-class="translate-x-0"
                leave-active-class="transition-transform duration-200 ease-in"
                leave-from-class="translate-x-0"
                leave-to-class="-translate-x-full"
            >
                <aside
                    v-if="categoryDrawerOpen"
                    id="mobile-category-drawer"
                    class="fixed inset-y-0 left-0 z-[60] flex w-[84%] max-w-sm flex-col bg-white shadow-2xl md:hidden"
                    role="dialog"
                    aria-modal="true"
                    :aria-label="t('categoryMenu')"
                >
                    <div class="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                        <div>
                            <p class="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">{{ portal.name }}</p>
                            <h2 class="mt-1 text-lg font-bold text-slate-950">{{ t('categoryMenu') }}</h2>
                        </div>
                        <button
                            type="button"
                            class="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-slate-200"
                            aria-label="Tutup menu kategori"
                            @click="categoryDrawerOpen = false"
                        >
                            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M6 6l12 12M18 6 6 18" />
                            </svg>
                        </button>
                    </div>

                    <nav class="flex-1 overflow-y-auto p-4">
                        <Link
                            v-for="category in navigation.categories"
                            :key="category.slug"
                            :href="category.url"
                            class="mb-1 flex items-center justify-between rounded-xl px-4 py-3.5 text-sm font-semibold transition"
                            :class="isActive(category.url)
                                ? 'bg-blue-700 text-white shadow-sm'
                                : 'text-slate-700 hover:bg-blue-50 hover:text-blue-800'"
                            @click="categoryDrawerOpen = false"
                        >
                            <span>{{ category.name }}</span>
                            <svg class="h-4 w-4 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                                <path stroke-linecap="round" stroke-linejoin="round" d="m9 18 6-6-6-6" />
                            </svg>
                        </Link>
                    </nav>
                </aside>
            </Transition>
        </Teleport>

        <main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
            <slot />
        </main>

        <footer class="relative overflow-hidden bg-slate-950 text-slate-300">
            <div class="pointer-events-none absolute -right-28 top-0 h-80 w-80 rounded-full bg-blue-600/20 blur-3xl" />
            <div class="pointer-events-none absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />

            <div class="relative border-b border-white/10">
                <div class="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
                    <div class="max-w-2xl">
                        <p class="text-xs font-bold uppercase tracking-[0.2em] text-blue-300">{{ t('footerEyebrow') }}</p>
                        <h2 class="mt-3 text-2xl font-bold leading-tight text-white sm:text-3xl">{{ t('footerTitle') }}</h2>
                        <p class="mt-3 text-sm leading-7 text-slate-400">{{ t('footerDescription') }}</p>
                    </div>
                    <div class="flex shrink-0 flex-wrap gap-3">
                        <a
                            href="/rss.xml"
                            class="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-500"
                        >
                            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                <path d="M5 3a2 2 0 1 0 0 4c6.63 0 12 5.37 12 12a2 2 0 1 0 4 0C21 10.16 13.84 3 5 3Zm0 6a2 2 0 1 0 0 4c3.31 0 6 2.69 6 6a2 2 0 1 0 4 0c0-5.52-4.48-10-10-10Zm0 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" />
                            </svg>
                            RSS Feed
                        </a>
                        <a
                            :href="`tel:${portal.contactPhone}`"
                            class="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-bold text-white transition hover:border-blue-400/60 hover:bg-white/10"
                        >
                            {{ t('contactUs') }}
                        </a>
                    </div>
                </div>
            </div>

            <div class="relative mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.35fr_0.75fr_0.75fr_1fr] lg:px-8">
                <div>
                    <Link href="/" class="inline-flex items-center gap-4">
                        <span class="grid h-14 w-14 place-items-center rounded-2xl bg-white shadow-lg shadow-blue-950/40">
                            <img :src="portal.mark || portal.logo" :alt="portal.name" class="h-11 w-11 object-contain">
                        </span>
                        <span>
                            <strong class="block text-xl text-white">{{ portal.name }}</strong>
                            <span class="mt-1 block text-[10px] font-bold uppercase tracking-[0.22em] text-blue-300">{{ t('digitalNewsPortal') }}</span>
                        </span>
                    </Link>
                    <p class="mt-5 max-w-sm text-sm leading-7 text-slate-400">{{ portal.description }}</p>
                    <p class="mt-4 max-w-sm border-l-2 border-blue-500 pl-4 text-xs font-semibold leading-6 text-slate-300">
                        {{ t('editorialStandard') }}
                    </p>
                </div>

                <div>
                    <h3 class="text-xs font-bold uppercase tracking-[0.18em] text-white">{{ t('explore') }}</h3>
                    <nav class="mt-5 grid gap-3 text-sm">
                        <Link href="/" class="transition hover:translate-x-1 hover:text-blue-300">{{ t('mainPortal') }}</Link>
                        <Link href="/berita" class="transition hover:translate-x-1 hover:text-blue-300">{{ t('latest') }}</Link>
                        <Link
                            v-for="category in navigation.categories.slice(0, 3)"
                            :key="`footer-${category.slug}`"
                            :href="category.url"
                            class="transition hover:translate-x-1 hover:text-blue-300"
                        >
                            {{ category.name }}
                        </Link>
                    </nav>
                </div>

                <div>
                    <h3 class="text-xs font-bold uppercase tracking-[0.18em] text-white">{{ t('newsroom') }}</h3>
                    <nav class="mt-5 grid gap-3 text-sm">
                        <Link href="/tentang" class="transition hover:translate-x-1 hover:text-blue-300">{{ t('aboutNewsroom') }}</Link>
                        <Link href="/persyaratan-layanan" class="transition hover:translate-x-1 hover:text-blue-300">{{ t('termsOfService') }}</Link>
                        <Link href="/kebijakan-privasi" class="transition hover:translate-x-1 hover:text-blue-300">{{ t('privacyPolicy') }}</Link>
                        <a href="/sitemap.xml" class="transition hover:translate-x-1 hover:text-blue-300">Sitemap</a>
                        <a href="/rss.xml" class="transition hover:translate-x-1 hover:text-blue-300">RSS Feed</a>
                        <a :href="`tel:${portal.contactPhone}`" class="transition hover:translate-x-1 hover:text-blue-300">{{ t('contactUs') }}</a>
                    </nav>
                </div>

                <div>
                    <h3 class="text-xs font-bold uppercase tracking-[0.18em] text-white">{{ t('contactUs') }}</h3>
                    <div class="mt-5 space-y-4 text-sm">
                        <a :href="`tel:${portal.contactPhone}`" class="flex items-start gap-3 transition hover:text-blue-300">
                            <svg class="mt-0.5 h-4 w-4 shrink-0 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.63a2 2 0 0 1-.45 2.11L8 9.73a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.85.29 1.73.5 2.63.62A2 2 0 0 1 22 16.92Z" />
                            </svg>
                            <span>{{ portal.contactPhone }}</span>
                        </a>
                        <div class="flex items-start gap-3">
                            <svg class="mt-0.5 h-4 w-4 shrink-0 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
                                <circle cx="12" cy="10" r="2.5" />
                            </svg>
                            <span>{{ portal.address }}</span>
                        </div>
                    </div>

                    <div class="mt-6">
                        <p class="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">{{ t('followUs') }}</p>
                        <div class="mt-3 flex flex-wrap gap-2">
                            <a
                                v-for="(url, network) in portal.socials"
                                :key="network"
                                :href="url"
                                target="_blank"
                                rel="noreferrer"
                                class="grid h-9 min-w-9 place-items-center rounded-lg border border-white/10 bg-white/5 px-2 text-[10px] font-bold uppercase text-slate-300 transition hover:-translate-y-0.5 hover:border-blue-400/60 hover:bg-blue-500 hover:text-white"
                                :aria-label="network"
                            >
                                {{ network === 'linkedin' ? 'in' : network === 'youtube' ? 'YT' : network === 'instagram' ? 'IG' : 'X' }}
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <div class="relative border-t border-white/10">
                <div class="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
                    <p>&copy; {{ new Date().getFullYear() }} {{ portal.name }}. {{ t('allRightsReserved') }}</p>
                    <div class="flex items-center gap-2">
                        <span class="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        <span>Radina News</span>
                    </div>
                </div>
            </div>
        </footer>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { Link, router } from '@inertiajs/vue3';
import ArticleCard from '../../Components/ArticleCard.vue';
import PaginationLinks from '../../Components/PaginationLinks.vue';
import SeoHead from '../../Components/SeoHead.vue';
import NewsLayout from '../../Layouts/NewsLayout.vue';
import { useNewsLocale } from '../../Composables/useNewsLocale';

const props = defineProps({
    seo: Object,
    pageTitle: String,
    pageDescription: String,
    pageCover: {
        type: String,
        default: null,
    },
    filters: Object,
    articles: Object,
    highlights: Array,
    trending: Array,
    context: {
        type: Object,
        default: null,
    },
});

const searchTerm = ref(props.filters?.q || '');
const { t } = useNewsLocale();

watch(
    () => props.filters?.q,
    (value) => {
        searchTerm.value = value || '';
    }
);

const submitSearch = () => {
    router.get('/berita', searchTerm.value ? { q: searchTerm.value } : {});
};
</script>

<template>
    <NewsLayout>
        <SeoHead :seo="seo" />

        <section
            class="relative overflow-hidden rounded-2xl border border-slate-200"
            :class="pageCover ? 'min-h-[340px] bg-slate-950 text-white' : 'bg-gradient-to-br from-white to-blue-50/50'"
        >
            <img
                v-if="pageCover"
                :src="pageCover"
                :alt="pageTitle"
                class="absolute inset-0 h-full w-full object-cover"
            >
            <div v-if="pageCover" class="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/70 to-slate-950/20"></div>

            <div class="relative flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-end lg:justify-between">
                <div class="max-w-3xl" :class="{ 'self-end': pageCover }">
                    <span v-if="context" class="news-kicker">{{ context.label }} / {{ context.value }}</span>
                    <h1 class="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">{{ pageTitle }}</h1>
                    <p class="mt-4 text-sm leading-7 sm:text-base" :class="pageCover ? 'text-slate-200' : 'text-slate-600'">
                        {{ pageDescription }}
                    </p>
                </div>
                <form class="flex w-full max-w-md gap-2" @submit.prevent="submitSearch">
                    <input
                        v-model="searchTerm"
                        type="search"
                        :placeholder="t('archiveSearch')"
                        class="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                    <button type="submit" class="rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800">
                        {{ t('search') }}
                    </button>
                </form>
            </div>
        </section>

        <section class="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div>
                <div class="grid gap-6 md:grid-cols-2">
                    <ArticleCard v-for="article in articles.data" :key="article.slug" :article="article" />
                </div>
                <div class="mt-8">
                    <PaginationLinks :links="articles.links" />
                </div>
            </div>

            <aside class="space-y-6">
                <div class="rounded-2xl border border-slate-200 bg-white p-5">
                    <span class="news-kicker">{{ t('highlights') }}</span>
                    <h2 class="mt-3 text-xl font-semibold">{{ t('quickPicks') }}</h2>
                    <p class="mt-2 text-sm leading-6 text-slate-500">{{ t('quickPicksDescription') }}</p>
                    <div class="mt-4 divide-y divide-slate-200">
                        <article v-for="item in highlights" :key="item.url" class="py-4 first:pt-0 last:pb-0">
                            <p class="news-meta">{{ item.category }}</p>
                            <Link :href="item.url" class="mt-1.5 block text-sm font-semibold leading-6 text-slate-900 hover:text-blue-700">
                                {{ item.title }}
                            </Link>
                        </article>
                    </div>
                </div>

                <div class="rounded-2xl border border-slate-200 bg-white p-5">
                    <h2 class="text-xl font-semibold">{{ t('trending') }}</h2>
                    <div class="mt-4 divide-y divide-slate-200">
                        <article v-for="(item, index) in trending" :key="item.url" class="flex gap-3 py-4 first:pt-0 last:pb-0">
                            <span class="text-xl font-bold text-slate-200">{{ index + 1 }}</span>
                            <div>
                                <Link :href="item.url" class="block text-sm font-semibold leading-6 text-slate-900 hover:text-blue-700">
                                    {{ item.title }}
                                </Link>
                                <p class="mt-1 text-[11px] text-slate-500">
                                    {{ new Intl.NumberFormat('id-ID').format(item.viewsCount) }} {{ t('views') }}
                                </p>
                            </div>
                        </article>
                    </div>
                </div>
            </aside>
        </section>
    </NewsLayout>
</template>

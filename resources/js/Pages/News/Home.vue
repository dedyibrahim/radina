<script setup>
import { computed } from 'vue';
import { Link } from '@inertiajs/vue3';
import ArticleCard from '../../Components/ArticleCard.vue';
import SectionHeader from '../../Components/SectionHeader.vue';
import SeoHead from '../../Components/SeoHead.vue';
import NewsLayout from '../../Layouts/NewsLayout.vue';
import { useNewsLocale } from '../../Composables/useNewsLocale';

const props = defineProps({
    seo: Object,
    hero: Object,
    breaking: Array,
    editorsPick: Array,
    latest: Array,
    trending: Array,
    categories: Array,
    popularTags: Array,
});

const { t } = useNewsLocale();
const latestArticles = computed(() => props.latest || []);
</script>

<template>
    <NewsLayout>
        <SeoHead :seo="seo" />

        <section class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
            <ArticleCard v-if="hero" :article="hero" featured />

            <aside class="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.05)] sm:p-6">
                <div class="flex items-center justify-between gap-3">
                    <span class="news-kicker">{{ t('breaking') }}</span>
                    <span class="news-meta">{{ t('fastUpdate') }}</span>
                </div>
                <div class="mt-5 divide-y divide-slate-200">
                    <article v-for="(item, index) in breaking" :key="item.url" class="grid grid-cols-[28px_1fr] gap-3 py-4 first:pt-0 last:pb-0">
                        <span class="text-sm font-bold text-blue-700">{{ String(index + 1).padStart(2, '0') }}</span>
                        <div class="min-w-0">
                            <div class="flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                                <Link v-if="item.categoryUrl" :href="item.categoryUrl" class="text-blue-700">{{ item.category }}</Link>
                                <span>{{ item.publishedLabel }}</span>
                            </div>
                            <Link :href="item.url" class="mt-1.5 block text-[15px] font-semibold leading-6 text-slate-900 transition hover:text-blue-700">
                                {{ item.title }}
                            </Link>
                        </div>
                    </article>
                </div>
            </aside>
        </section>

        <section class="mt-14">
            <SectionHeader
                :eyebrow="t('editorChoice')"
                :title="t('editorChoiceTitle')"
                :description="t('editorChoiceDescription')"
            />
            <div class="mt-7 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                <ArticleCard v-for="article in editorsPick" :key="article.slug" :article="article" />
            </div>
        </section>

        <section class="mt-14 grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div>
                <SectionHeader
                    :eyebrow="t('latest')"
                    :title="t('latestTitle')"
                    :description="t('latestDescription')"
                />
                <div class="mt-7 grid gap-6 md:grid-cols-2">
                    <ArticleCard v-for="article in latestArticles" :key="article.slug" :article="article" />
                </div>
            </div>

            <aside class="space-y-6">
                <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
                    <h3 class="text-xl font-semibold">{{ t('trending') }}</h3>
                    <div class="mt-4 divide-y divide-slate-200">
                        <article v-for="(item, index) in trending" :key="item.url" class="flex gap-3 py-4 first:pt-0 last:pb-0">
                            <span class="text-2xl font-bold text-slate-200">{{ index + 1 }}</span>
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

                <div class="rounded-2xl border border-slate-200 bg-white p-5">
                    <h3 class="text-xl font-semibold">{{ t('popularTopics') }}</h3>
                    <div class="mt-4 flex flex-wrap gap-2">
                        <Link
                            v-for="tag in popularTags"
                            :key="tag.slug"
                            :href="tag.url"
                            class="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-blue-50 hover:text-blue-700"
                        >
                            #{{ tag.name }}
                        </Link>
                    </div>
                </div>
            </aside>
        </section>

        <section class="mt-14">
            <SectionHeader
                :eyebrow="t('categories')"
                :title="t('categoriesTitle')"
                :description="t('categoriesDescription')"
            />
            <div class="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                <Link
                    v-for="category in categories"
                    :key="category.slug"
                    :href="category.url"
                    class="rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
                >
                    <div class="flex items-center justify-between gap-3">
                        <span class="text-sm font-bold" :style="{ color: category.accentColor }">{{ category.name }}</span>
                        <span class="text-xs text-slate-500">{{ category.articlesCount }} {{ t('articles') }}</span>
                    </div>
                    <p class="mt-3 text-sm leading-6 text-slate-600">{{ category.description }}</p>
                    <div v-if="category.spotlight" class="mt-4 border-t border-slate-100 pt-4">
                        <p class="news-meta">{{ t('latestHighlight') }}</p>
                        <p class="mt-1.5 line-clamp-2 text-sm font-semibold leading-6 text-slate-900">{{ category.spotlight.title }}</p>
                    </div>
                </Link>
            </div>
        </section>
    </NewsLayout>
</template>

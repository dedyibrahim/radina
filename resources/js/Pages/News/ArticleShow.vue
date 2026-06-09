<script setup>
import { Link } from '@inertiajs/vue3';
import ArticleCard from '../../Components/ArticleCard.vue';
import SeoHead from '../../Components/SeoHead.vue';
import NewsLayout from '../../Layouts/NewsLayout.vue';
import { useNewsLocale } from '../../Composables/useNewsLocale';

defineProps({
    seo: Object,
    article: Object,
    related: Array,
    trending: Array,
});

const { t } = useNewsLocale();
</script>

<template>
    <NewsLayout>
        <SeoHead :seo="seo" />

        <article>
            <header class="mx-auto max-w-4xl text-center">
                <div class="flex flex-wrap items-center justify-center gap-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    <Link
                        :href="article.category.url"
                        class="rounded-full px-3 py-1"
                        :style="{ backgroundColor: `${article.category.accentColor}18`, color: article.category.accentColor }"
                    >
                        {{ article.category.name }}
                    </Link>
                    <span>{{ article.publishedLabel }}</span>
                    <span>{{ article.readingTime }} {{ t('readMinutes') }}</span>
                </div>

                <h1 class="mt-5 text-balance text-4xl font-semibold leading-tight text-slate-950 sm:text-5xl lg:text-6xl">
                    {{ article.title }}
                </h1>
                <p class="mx-auto mt-5 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
                    {{ article.excerpt }}
                </p>
                <div class="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm text-slate-500">
                    <span class="font-semibold text-slate-800">{{ article.author.name }}</span>
                    <span>/</span>
                    <span>{{ new Intl.NumberFormat('id-ID').format(article.viewsCount) }} {{ t('views') }}</span>
                </div>
            </header>

            <img
                :src="article.coverImage"
                :alt="article.coverAlt"
                class="mt-8 aspect-[16/8] w-full rounded-2xl object-cover shadow-[0_18px_45px_rgba(15,23,42,0.12)]"
            >

            <div class="mt-10 grid gap-8 xl:grid-cols-[minmax(0,760px)_300px] xl:justify-center">
                <div class="rounded-2xl border border-slate-200 bg-white p-6 sm:p-9">
                    <div class="news-prose" v-html="article.content" />
                    <div class="mt-8 flex flex-wrap gap-2 border-t border-slate-200 pt-6">
                        <Link
                            v-for="tag in article.tags"
                            :key="tag.slug"
                            :href="tag.url"
                            class="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                        >
                            #{{ tag.name }}
                        </Link>
                    </div>
                </div>

                <aside class="space-y-6">
                    <div class="rounded-2xl border border-slate-200 bg-white p-5">
                        <h2 class="text-xl font-semibold">{{ t('rising') }}</h2>
                        <div class="mt-4 divide-y divide-slate-200">
                            <article v-for="item in trending" :key="item.url" class="py-4 first:pt-0 last:pb-0">
                                <p class="news-meta">{{ item.category }}</p>
                                <Link :href="item.url" class="mt-1.5 block text-sm font-semibold leading-6 text-slate-900 hover:text-blue-700">
                                    {{ item.title }}
                                </Link>
                            </article>
                        </div>
                    </div>

                    <div class="rounded-2xl border border-slate-200 bg-white p-5">
                        <h2 class="text-xl font-semibold">{{ t('share') }}</h2>
                        <div class="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
                            <a :href="`https://twitter.com/intent/tweet?url=${encodeURIComponent(article.url)}&text=${encodeURIComponent(article.title)}`" target="_blank" rel="noreferrer" class="rounded-full border border-slate-300 px-3 py-2 hover:border-blue-400 hover:text-blue-700">X</a>
                            <a :href="`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(article.url)}`" target="_blank" rel="noreferrer" class="rounded-full border border-slate-300 px-3 py-2 hover:border-blue-400 hover:text-blue-700">LinkedIn</a>
                        </div>
                    </div>
                </aside>
            </div>
        </article>

        <section class="mt-14">
            <h2 class="text-3xl font-semibold">{{ t('relatedArticles') }}</h2>
            <div class="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                <ArticleCard v-for="item in related" :key="item.slug" :article="item" />
            </div>
        </section>
    </NewsLayout>
</template>

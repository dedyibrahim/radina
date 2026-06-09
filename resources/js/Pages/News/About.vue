<script setup>
import SeoHead from '../../Components/SeoHead.vue';
import NewsLayout from '../../Layouts/NewsLayout.vue';
import { useNewsLocale } from '../../Composables/useNewsLocale';

defineProps({
    seo: Object,
    stats: Array,
});

const { t } = useNewsLocale();
</script>

<template>
    <NewsLayout>
        <SeoHead :seo="seo" />

        <section class="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div class="grid gap-8 p-6 sm:p-10 lg:grid-cols-[1fr_360px] lg:items-center">
                <div>
                    <span class="news-kicker">{{ t('aboutNewsroom') }}</span>
                    <h1 class="mt-5 max-w-4xl text-4xl font-semibold leading-tight sm:text-5xl">{{ t('aboutTitle') }}</h1>
                    <p class="mt-5 max-w-3xl text-base leading-8 text-slate-600">{{ t('aboutDescription') }}</p>
                </div>
                <div class="grid grid-cols-3 gap-3 lg:grid-cols-1">
                    <div v-for="item in stats" :key="item.label" class="rounded-xl border border-blue-100 bg-blue-50/60 p-4 lg:flex lg:items-center lg:justify-between">
                        <p class="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{{ item.label }}</p>
                        <p class="mt-2 text-3xl font-bold text-blue-800 lg:mt-0">{{ item.value }}</p>
                    </div>
                </div>
            </div>
        </section>

        <section class="mt-8 grid gap-5 md:grid-cols-3">
            <div class="rounded-2xl border border-slate-200 bg-white p-6">
                <h2 class="text-2xl font-semibold">{{ t('editorial') }}</h2>
                <p class="mt-3 text-sm leading-7 text-slate-600">{{ t('editorialDescription') }}</p>
            </div>
            <div class="rounded-2xl border border-slate-200 bg-white p-6">
                <h2 class="text-2xl font-semibold">{{ t('technology') }}</h2>
                <p class="mt-3 text-sm leading-7 text-slate-600">{{ t('technologyDescription') }}</p>
            </div>
            <div class="rounded-2xl border border-slate-200 bg-white p-6">
                <h2 class="text-2xl font-semibold">{{ t('seo') }}</h2>
                <p class="mt-3 text-sm leading-7 text-slate-600">{{ t('seoDescription') }}</p>
            </div>
        </section>
    </NewsLayout>
</template>

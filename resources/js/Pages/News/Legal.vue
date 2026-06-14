<script setup>
import Breadcrumbs from '../../Components/Breadcrumbs.vue';
import SeoHead from '../../Components/SeoHead.vue';
import NewsLayout from '../../Layouts/NewsLayout.vue';
import { useNewsLocale } from '../../Composables/useNewsLocale';

defineProps({
    seo: Object,
    document: Object,
});

const { t } = useNewsLocale();
</script>

<template>
    <NewsLayout>
        <SeoHead :seo="seo" />

        <div class="mx-auto max-w-6xl">
            <Breadcrumbs :items="[{ label: t('home'), url: '/' }, { label: document.title }]" />

            <header class="mt-5 rounded-2xl border border-blue-100 bg-gradient-to-br from-white via-blue-50/60 to-cyan-50/50 p-6 sm:p-10">
                <span class="news-kicker">Dokumen Hukum</span>
                <h1 class="mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">{{ document.title }}</h1>
                <p class="mt-5 max-w-4xl text-base leading-8 text-slate-600">{{ document.summary }}</p>
                <p class="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Terakhir diperbarui: {{ document.updatedAt }}
                </p>
            </header>

            <div class="mt-8 grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
                <aside class="lg:sticky lg:top-6 lg:self-start">
                    <div class="rounded-2xl border border-slate-200 bg-white p-5">
                        <h2 class="text-sm font-bold uppercase tracking-[0.14em] text-slate-900">Daftar Isi</h2>
                        <nav class="mt-4 max-h-[65vh] space-y-2 overflow-y-auto pr-2 text-sm">
                            <a
                                v-for="(section, index) in document.sections"
                                :key="section.title"
                                :href="`#bagian-${index + 1}`"
                                class="block rounded-lg px-3 py-2 leading-5 text-slate-600 transition hover:bg-blue-50 hover:text-blue-800"
                            >
                                {{ section.title }}
                            </a>
                        </nav>
                    </div>
                </aside>

                <main class="space-y-5">
                    <section
                        v-for="(section, index) in document.sections"
                        :id="`bagian-${index + 1}`"
                        :key="section.title"
                        class="scroll-mt-6 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8"
                    >
                        <h2 class="text-2xl font-semibold leading-tight text-slate-950">{{ section.title }}</h2>

                        <div v-if="section.paragraphs?.length" class="mt-4 space-y-4">
                            <p v-for="paragraph in section.paragraphs" :key="paragraph" class="text-sm leading-7 text-slate-600 sm:text-base sm:leading-8">
                                {{ paragraph }}
                            </p>
                        </div>

                        <ul v-if="section.items?.length" class="mt-5 space-y-3">
                            <li v-for="item in section.items" :key="item" class="flex gap-3 text-sm leading-7 text-slate-600 sm:text-base">
                                <span class="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600"></span>
                                <span>{{ item }}</span>
                            </li>
                        </ul>

                        <div v-if="section.links?.length" class="mt-5 grid gap-3">
                            <a
                                v-for="link in section.links"
                                :key="link.url"
                                :href="link.url"
                                target="_blank"
                                rel="noreferrer"
                                class="rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3 text-sm font-semibold leading-6 text-blue-800 transition hover:border-blue-300 hover:bg-blue-50"
                            >
                                {{ link.label }}
                            </a>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    </NewsLayout>
</template>

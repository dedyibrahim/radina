<script setup>
import { Link } from '@inertiajs/vue3';
import ArticleCard from '../../Components/ArticleCard.vue';
import SeoHead from '../../Components/SeoHead.vue';
import NewsLayout from '../../Layouts/NewsLayout.vue';
import { useNewsLocale } from '../../Composables/useNewsLocale';

defineProps({
    seo: {
        type: Object,
        required: true,
    },
    latestArticles: {
        type: Array,
        default: () => [],
    },
});

const { t } = useNewsLocale();
</script>

<template>
    <NewsLayout>
        <SeoHead :seo="seo" />

        <section class="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
            <div class="grid min-h-[520px] lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                <div class="relative flex flex-col justify-between overflow-hidden bg-slate-950 p-8 text-white sm:p-10">
                    <div class="absolute inset-0 opacity-40">
                        <div class="absolute -left-24 top-10 h-64 w-64 rounded-full bg-blue-600 blur-3xl"></div>
                        <div class="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-cyan-400 blur-3xl"></div>
                    </div>
                    <div class="relative">
                        <p class="text-xs font-bold uppercase tracking-[0.35em] text-blue-200">404 / Not Found</p>
                        <h1 class="mt-6 max-w-xl text-4xl font-black leading-[0.95] tracking-tight sm:text-6xl">
                            Halaman ini tidak ditemukan.
                        </h1>
                        <p class="mt-6 max-w-lg text-base leading-7 text-slate-300">
                            Link mungkin berubah, berita sudah dipindahkan, atau alamat yang dibuka tidak lengkap. Anda tetap bisa kembali ke portal dan membaca berita terbaru.
                        </p>
                    </div>

                    <div class="relative mt-10 flex flex-wrap gap-3">
                        <Link href="/" class="rounded-full bg-white px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-blue-50">
                            Kembali ke Beranda
                        </Link>
                        <Link href="/berita" class="rounded-full border border-white/25 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10">
                            Buka Arsip Berita
                        </Link>
                    </div>
                </div>

                <div class="bg-gradient-to-br from-slate-50 to-blue-50/60 p-8 sm:p-10">
                    <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p class="news-kicker">{{ t('latest') }}</p>
                            <h2 class="mt-2 text-2xl font-bold text-slate-950">Berita yang bisa Anda baca</h2>
                        </div>
                        <Link href="/berita" class="text-sm font-bold text-blue-700 hover:text-blue-900">
                            Lihat semua →
                        </Link>
                    </div>

                    <div v-if="latestArticles.length" class="mt-6 grid gap-4 sm:grid-cols-2">
                        <ArticleCard
                            v-for="article in latestArticles.slice(0, 4)"
                            :key="article.slug"
                            :article="article"
                        />
                    </div>

                    <div v-else class="mt-6 rounded-3xl border border-dashed border-slate-300 bg-white/80 p-8 text-center">
                        <p class="text-sm leading-6 text-slate-600">
                            Belum ada rekomendasi berita yang tersedia saat ini.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    </NewsLayout>
</template>

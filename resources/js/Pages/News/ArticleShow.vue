<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { Link } from '@inertiajs/vue3';
import ArticleBody from '../../Components/ArticleBody.vue';
import ArticleCard from '../../Components/ArticleCard.vue';
import Breadcrumbs from '../../Components/Breadcrumbs.vue';
import SeoHead from '../../Components/SeoHead.vue';
import NewsLayout from '../../Layouts/NewsLayout.vue';
import { useNewsLocale } from '../../Composables/useNewsLocale';
import { initializeGooglePublisherCenter } from '../../Support/googlePublisherCenter';

const props = defineProps({
    seo: Object,
    article: Object,
    publisherCenter: Object,
    related: Array,
    trending: Array,
});

const { t } = useNewsLocale();
const zoomedImage = ref(null);

const openImage = (image) => {
    zoomedImage.value = image;
};

const closeImage = () => {
    zoomedImage.value = null;
};

const handleEscape = (event) => {
    if (event.key === 'Escape') {
        closeImage();
    }
};

watch(zoomedImage, (image) => {
    document.body.style.overflow = image ? 'hidden' : '';
});

onMounted(() => {
    window.addEventListener('keydown', handleEscape);

    if (props.publisherCenter?.enabled) {
        initializeGooglePublisherCenter(props.publisherCenter);
    }
});
onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleEscape);
    document.body.style.overflow = '';
});
</script>

<template>
    <NewsLayout>
        <SeoHead :seo="seo" />

        <article>
            <Breadcrumbs
                class="mx-auto mb-6 max-w-4xl"
                :items="[
                    { label: t('home'), url: '/' },
                    { label: article.category.name, url: article.category.url },
                    { label: article.title },
                ]"
            />
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

            <button type="button" class="mt-8 block w-full overflow-hidden rounded-2xl" @click="openImage({
                url: article.coverImage,
                altText: article.coverAlt,
                caption: article.coverAlt,
            })">
                <img
                    :src="article.coverImage"
                    :alt="article.coverAlt"
                    class="aspect-[16/8] w-full object-cover shadow-[0_18px_45px_rgba(15,23,42,0.12)] transition duration-300 hover:scale-[1.01]"
                >
            </button>

            <div class="mt-10 grid gap-8 xl:grid-cols-[minmax(0,760px)_300px] xl:justify-center">
                <div class="rounded-2xl border border-slate-200 bg-white p-6 sm:p-9">
                    <ArticleBody :content="article.content" :images="article.images" @zoom="openImage" />
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

        <Teleport to="body">
            <div
                v-if="zoomedImage"
                class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/95 p-4 sm:p-8"
                role="dialog"
                aria-modal="true"
                :aria-label="zoomedImage.altText || 'Pratinjau gambar artikel'"
                @click.self="closeImage"
            >
                <button
                    type="button"
                    class="absolute right-4 top-4 rounded-full bg-white/10 px-4 py-2 text-2xl text-white transition hover:bg-white/20"
                    aria-label="Tutup gambar"
                    @click="closeImage"
                >
                    &times;
                </button>
                <figure class="flex max-h-full max-w-6xl flex-col items-center">
                    <img
                        :src="zoomedImage.url"
                        :alt="zoomedImage.altText"
                        class="max-h-[82vh] max-w-full rounded-xl object-contain"
                    >
                    <figcaption v-if="zoomedImage.caption" class="mt-4 max-w-3xl text-center text-sm leading-6 text-slate-200">
                        {{ zoomedImage.caption }}
                    </figcaption>
                </figure>
            </div>
        </Teleport>
    </NewsLayout>
</template>

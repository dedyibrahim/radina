<script setup>
import { Link } from '@inertiajs/vue3';
import { useNewsLocale } from '../Composables/useNewsLocale';

defineProps({
    article: {
        type: Object,
        required: true,
    },
    featured: {
        type: Boolean,
        default: false,
    },
});

const { t } = useNewsLocale();
</script>

<template>
    <article
        class="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.05)] transition duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_16px_36px_rgba(15,23,42,0.09)]"
    >
        <Link :href="article.url" class="relative block overflow-hidden" :class="featured ? 'aspect-[16/9]' : 'aspect-[16/10]'">
            <img
                :src="article.coverImage"
                :alt="article.coverAlt"
                class="h-full w-full object-cover transition duration-500 group-hover:scale-[1.025]"
            >
            <span
                v-if="article.category"
                class="absolute bottom-4 left-4 rounded-full bg-white/95 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] shadow-sm backdrop-blur"
                :style="{ color: article.category.accentColor }"
            >
                {{ article.category.name }}
            </span>
        </Link>

        <div class="flex flex-1 flex-col p-5 sm:p-6">
            <div class="flex flex-wrap items-center gap-2 text-[11px] font-medium text-slate-500">
                <span>{{ article.publishedLabel }}</span>
                <span class="text-slate-300">/</span>
                <span>{{ article.readingTime }} {{ t('readMinutes') }}</span>
            </div>

            <Link :href="article.url" class="mt-3">
                <h3
                    class="text-balance font-semibold leading-tight text-slate-950 transition group-hover:text-blue-700"
                    :class="featured ? 'text-2xl sm:text-[2rem]' : 'text-xl'"
                >
                    {{ article.title }}
                </h3>
            </Link>

            <p class="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                {{ article.excerpt }}
            </p>

            <div class="mt-auto flex items-center justify-between gap-3 pt-5 text-xs text-slate-500">
                <span v-if="article.author" class="truncate font-medium text-slate-700">{{ article.author.name }}</span>
                <span class="shrink-0">{{ new Intl.NumberFormat('id-ID').format(article.viewsCount) }} {{ t('views') }}</span>
            </div>
        </div>
    </article>
</template>

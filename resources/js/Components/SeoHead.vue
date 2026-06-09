<script setup>
import { computed } from 'vue';
import { Head, usePage } from '@inertiajs/vue3';

const props = defineProps({
    seo: {
        type: Object,
        required: true,
    },
});

const page = usePage();

const siteName = computed(() => page.props.portal?.name || 'Radina News');
const description = computed(() => props.seo.description || page.props.portal?.description || '');
const image = computed(() => props.seo.image || page.props.portal?.defaultImage || '');
const url = computed(() => props.seo.url || page.props.portal?.baseUrl || '');
const keywords = computed(() => props.seo.keywords || '');
const jsonLdBlocks = computed(() => (props.seo.jsonLd || []).filter(Boolean));
</script>

<template>
    <Head>
        <title>{{ seo.title }}</title>
        <meta name="description" :content="description" />
        <meta name="robots" :content="seo.robots" />
        <meta v-if="keywords" name="keywords" :content="keywords" />

        <link rel="canonical" :href="url" />

        <meta property="og:site_name" :content="siteName" />
        <meta property="og:title" :content="seo.title" />
        <meta property="og:description" :content="description" />
        <meta property="og:type" :content="seo.type" />
        <meta property="og:url" :content="url" />
        <meta property="og:image" :content="image" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" :content="seo.title" />
        <meta name="twitter:description" :content="description" />
        <meta name="twitter:image" :content="image" />

        <meta v-if="seo.publishedAt" property="article:published_time" :content="seo.publishedAt" />
        <meta v-if="seo.updatedAt" property="article:modified_time" :content="seo.updatedAt" />

        <component
            :is="'script'"
            v-for="(schema, index) in jsonLdBlocks"
            :key="`schema-${index}`"
            type="application/ld+json"
            v-html="JSON.stringify(schema)"
        />
    </Head>
</template>

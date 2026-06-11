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
        <meta head-key="description" name="description" :content="description" />
        <meta head-key="robots" name="robots" :content="seo.robots" />
        <meta v-if="keywords" head-key="keywords" name="keywords" :content="keywords" />

        <link head-key="canonical" rel="canonical" :href="url" />

        <meta head-key="og-site-name" property="og:site_name" :content="siteName" />
        <meta head-key="og-title" property="og:title" :content="seo.title" />
        <meta head-key="og-description" property="og:description" :content="description" />
        <meta head-key="og-type" property="og:type" :content="seo.type" />
        <meta head-key="og-url" property="og:url" :content="url" />
        <meta head-key="og-image" property="og:image" :content="image" />
        <meta head-key="og-image-secure-url" property="og:image:secure_url" :content="image" />
        <meta v-if="seo.imageWidth" head-key="og-image-width" property="og:image:width" :content="seo.imageWidth" />
        <meta v-if="seo.imageHeight" head-key="og-image-height" property="og:image:height" :content="seo.imageHeight" />
        <meta v-if="seo.imageType" head-key="og-image-type" property="og:image:type" :content="seo.imageType" />
        <meta head-key="og-image-alt" property="og:image:alt" :content="seo.imageAlt || seo.title" />
        <link head-key="image-src" rel="image_src" :href="image" />

        <meta head-key="twitter-card" name="twitter:card" content="summary_large_image" />
        <meta head-key="twitter-title" name="twitter:title" :content="seo.title" />
        <meta head-key="twitter-description" name="twitter:description" :content="description" />
        <meta head-key="twitter-image" name="twitter:image" :content="image" />
        <meta head-key="twitter-image-alt" name="twitter:image:alt" :content="seo.imageAlt || seo.title" />

        <meta v-if="seo.publishedAt" head-key="article-published-at" property="article:published_time" :content="seo.publishedAt" />
        <meta v-if="seo.updatedAt" head-key="article-updated-at" property="article:modified_time" :content="seo.updatedAt" />

        <component
            :is="'script'"
            v-for="(schema, index) in jsonLdBlocks"
            :key="`schema-${index}`"
            :head-key="`schema-${index}`"
            type="application/ld+json"
            v-html="JSON.stringify(schema)"
        />
    </Head>
</template>

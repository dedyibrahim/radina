<script setup>
defineProps({
    eyebrow: {
        type: String,
        default: '',
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        default: '',
    },
});
</script>

<template>
    <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div class="max-w-3xl">
            <span v-if="eyebrow" class="news-kicker">{{ eyebrow }}</span>
            <h2 class="mt-4 text-3xl leading-tight md:text-[2.35rem]">{{ title }}</h2>
            <p v-if="description" class="mt-3 max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
                {{ description }}
            </p>
        </div>
        <slot />
    </div>
</template>

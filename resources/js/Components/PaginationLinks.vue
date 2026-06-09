<script setup>
import { Link } from '@inertiajs/vue3';

defineProps({
    links: {
        type: Array,
        required: true,
    },
});
</script>

<template>
    <nav class="flex flex-wrap items-center gap-2">
        <Link
            v-for="link in links"
            :key="`${link.label}-${link.url}`"
            :href="link.url || ''"
            class="rounded-full border px-4 py-2 text-sm font-medium transition"
            :class="[
                link.active
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-300 bg-white text-slate-600 hover:border-slate-500 hover:text-slate-900',
                !link.url ? 'pointer-events-none opacity-40' : '',
            ]"
            preserve-scroll
        >
            {{ link.label }}
        </Link>
    </nav>
</template>

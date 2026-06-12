<script setup>
import { Link } from '@inertiajs/vue3';

defineProps({
    items: {
        type: Array,
        default: () => [],
    },
    light: {
        type: Boolean,
        default: false,
    },
});
</script>

<template>
    <nav aria-label="Breadcrumb">
        <ol
            class="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em]"
            :class="light ? 'text-slate-300' : 'text-slate-500'"
        >
            <li v-for="(item, index) in items" :key="`${item.label}-${index}`" class="flex items-center gap-2">
                <span v-if="index" aria-hidden="true" :class="light ? 'text-white/40' : 'text-slate-300'">/</span>
                <Link
                    v-if="item.url && index < items.length - 1"
                    :href="item.url"
                    class="transition"
                    :class="light ? 'hover:text-white' : 'hover:text-blue-700'"
                >
                    {{ item.label }}
                </Link>
                <span v-else :class="index === items.length - 1 ? (light ? 'text-white' : 'text-slate-800') : ''">
                    {{ item.label }}
                </span>
            </li>
        </ol>
    </nav>
</template>

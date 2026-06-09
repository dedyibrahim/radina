<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { Link, router, usePage } from '@inertiajs/vue3';

const props = defineProps({
    activeSection: {
        type: String,
        default: 'news',
    },
    isAdmin: Boolean,
});

const emit = defineEmits(['navigate']);
const page = usePage();
const drawerOpen = ref(false);
const desktopDrawerOpen = ref(true);
const user = computed(() => page.props.auth?.user || {});
const portal = computed(() => page.props.portal || {});

const menuItems = computed(() => [
    {
        key: 'news',
        label: props.isAdmin ? 'Berita' : 'Tulis Berita',
        description: props.isAdmin ? 'Tulis dan kelola artikel' : 'Kirim tulisan baru',
    },
    ...(props.isAdmin ? [
        { key: 'categories', label: 'Kategori', description: 'Atur kanal berita' },
        { key: 'payments', label: 'Pembayaran', description: 'Honor dan withdrawal' },
        { key: 'licenses', label: 'Lisensi', description: 'Kelola lisensi aplikasi' },
        { key: 'users', label: 'Pengguna', description: 'Atur admin dan penulis' },
    ] : [
        { key: 'earnings', label: 'Pendapatan', description: 'Saldo dan withdrawal' },
        { key: 'bank', label: 'Rekening', description: 'Atur rekening pencairan' },
    ]),
]);

watch(drawerOpen, (isOpen) => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
});

onBeforeUnmount(() => {
    document.body.style.overflow = '';
});

const navigate = (section) => {
    drawerOpen.value = false;
    emit('navigate', section);
};

const isDesktop = () => typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches;

const toggleDrawer = () => {
    if (isDesktop()) {
        desktopDrawerOpen.value = !desktopDrawerOpen.value;
        return;
    }

    drawerOpen.value = true;
};

const closeDrawer = () => {
    if (isDesktop()) {
        desktopDrawerOpen.value = false;
        return;
    }

    drawerOpen.value = false;
};

const logout = () => {
    router.post('/logout');
};
</script>

<template>
    <div
        class="min-h-screen bg-slate-100 transition-[padding] duration-300"
        :class="desktopDrawerOpen ? 'lg:pl-72' : 'lg:pl-0'"
    >
        <header class="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
            <div class="flex min-h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
                <div class="flex min-w-0 items-center gap-3">
                    <button
                        type="button"
                        class="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-slate-950 text-white hover:bg-blue-700"
                        aria-label="Buka atau tutup menu dashboard"
                        @click="toggleDrawer"
                    >
                        <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <div class="min-w-0">
                        <p class="truncate text-lg font-bold text-slate-950">Dashboard Radina News</p>
                        <p class="text-xs text-slate-500">{{ isAdmin ? 'Administrator' : 'Penulis' }}</p>
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    <Link href="/" class="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-blue-700">
                        Lihat Portal
                    </Link>
                </div>
            </div>
        </header>

        <main class="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <slot />
        </main>

        <div
            v-if="drawerOpen"
            class="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden"
            @click="drawerOpen = false"
        />

        <aside
            class="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-800 bg-slate-950 text-slate-300 shadow-2xl transition-transform duration-300"
            :class="[
                drawerOpen ? 'translate-x-0' : '-translate-x-full',
                desktopDrawerOpen ? 'lg:translate-x-0' : 'lg:-translate-x-full',
            ]"
        >
            <div class="flex items-center justify-between border-b border-white/10 p-5">
                <Link href="/" class="flex items-center gap-3">
                    <img :src="portal.mark || portal.logo" :alt="portal.name" class="h-12 w-12 rounded-xl bg-white object-contain">
                    <div>
                        <p class="font-bold text-white">{{ portal.name }}</p>
                        <p class="text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-300">Management Panel</p>
                    </div>
                </Link>
                <button type="button" class="text-slate-400 hover:text-white" aria-label="Tutup menu" @click="closeDrawer">
                    <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" d="M6 6l12 12M18 6 6 18" />
                    </svg>
                </button>
            </div>

            <nav class="flex-1 space-y-2 overflow-y-auto p-4">
                <button
                    v-for="item in menuItems"
                    :key="item.key"
                    type="button"
                    class="w-full rounded-xl px-4 py-3 text-left transition"
                    :class="activeSection === item.key
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-950/40'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'"
                    @click="navigate(item.key)"
                >
                    <span class="block text-sm font-bold">{{ item.label }}</span>
                    <span class="mt-1 block text-xs" :class="activeSection === item.key ? 'text-blue-100' : 'text-slate-500'">
                        {{ item.description }}
                    </span>
                </button>
            </nav>

            <div class="border-t border-white/10 p-4">
                <div class="rounded-xl bg-white/5 p-4">
                    <div class="flex items-center gap-3">
                        <span class="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-blue-600 font-bold text-white">
                            {{ user.name?.charAt(0)?.toUpperCase() }}
                        </span>
                        <div class="min-w-0">
                            <p class="truncate text-sm font-bold text-white">{{ user.name }}</p>
                            <p class="truncate text-xs text-slate-400">{{ user.email }}</p>
                        </div>
                    </div>
                    <div class="mt-3 flex items-center justify-between">
                        <span class="rounded-full bg-blue-500/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-300">
                            {{ user.role === 'admin' ? 'Admin' : 'Penulis' }}
                        </span>
                        <button type="button" class="text-xs font-semibold text-rose-300 hover:text-rose-200" @click="logout">
                            Keluar
                        </button>
                    </div>
                </div>
            </div>
        </aside>
    </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { Link, router, usePage } from '@inertiajs/vue3';
import AdminLayout from '../../Layouts/AdminLayout.vue';
import PaginationLinks from '../../Components/PaginationLinks.vue';
import SeoHead from '../../Components/SeoHead.vue';

const props = defineProps({
    seo: Object,
    stats: Object,
    filters: Object,
    articles: Object,
    articleAuthors: Array,
    createUrl: String,
});

const page = usePage();
const flashStatus = computed(() => page.props.flash?.status || '');
const search = ref(props.filters.q || '');
const approval = ref(props.filters.approval || 'all');

const navigatePanel = (section) => {
    if (section !== 'news') {
        router.visit(`/dashboard?section=${section}`);
    }
};

const applyFilters = () => {
    router.get('/dashboard/berita', {
        q: search.value || undefined,
        approval: approval.value === 'all' ? undefined : approval.value,
    }, {
        preserveState: true,
        replace: true,
    });
};

const formatRupiah = (amount) => new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
}).format(Number(amount || 0));

const reassignArticle = (article, authorId, selectElement) => {
    const author = props.articleAuthors.find((candidate) => candidate.id === Number(authorId));
    if (!author || !window.confirm(`Alihkan artikel "${article.title}" kepada ${author.name}?`)) {
        selectElement.value = article.authorId;
        return;
    }

    router.patch(article.reassignUrl, { assigned_user_id: author.id }, {
        preserveScroll: true,
        onError: () => {
            selectElement.value = article.authorId;
        },
    });
};

const approveAndVerify = (article) => {
    if (window.confirm(`Setujui, verifikasi fakta, dan terbitkan "${article.title}"?`)) {
        router.patch(article.reviewUrl, {
            editorial_status: 'approved',
            fact_check_status: 'verified',
            review_note: '',
        }, { preserveScroll: true });
    }
};

const rejectArticle = (article) => {
    const note = window.prompt(`Alasan penolakan artikel "${article.title}":`);
    if (note) {
        router.patch(article.reviewUrl, {
            editorial_status: 'rejected',
            fact_check_status: 'rejected',
            review_note: note,
        }, { preserveScroll: true });
    }
};

const removeArticle = (article) => {
    if (window.confirm(`Hapus berita "${article.title}"?`)) {
        router.delete(article.destroyUrl, { preserveScroll: true });
    }
};
</script>

<template>
    <AdminLayout :is-admin="true" active-section="news" @navigate="navigatePanel">
        <SeoHead :seo="seo" />

        <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div class="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <span class="news-kicker">Panel Berita</span>
                    <h1 class="mt-4 text-4xl font-semibold">Daftar Berita</h1>
                    <p class="mt-3 text-sm leading-7 text-slate-600">Informasi artikel, status persetujuan, penulis, honor, dan waktu pembaruan.</p>
                </div>
                <Link :href="createUrl" class="rounded-xl bg-blue-700 px-5 py-3 text-center text-sm font-semibold text-white hover:bg-blue-800">
                    + Tambah Berita
                </Link>
            </div>
        </section>

        <section v-if="flashStatus" class="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800">
            {{ flashStatus }}
        </section>

        <section class="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <button class="admin-stat text-left" @click="approval = 'all'; applyFilters()"><span>Total</span><strong>{{ stats.total }}</strong></button>
            <button class="admin-stat text-left" @click="approval = 'approved'; applyFilters()"><span>Disetujui</span><strong>{{ stats.approved }}</strong></button>
            <button class="admin-stat text-left" @click="approval = 'pending'; applyFilters()"><span>Menunggu</span><strong>{{ stats.pending }}</strong></button>
            <button class="admin-stat text-left" @click="approval = 'rejected'; applyFilters()"><span>Ditolak</span><strong>{{ stats.rejected }}</strong></button>
        </section>

        <form class="mt-6 grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 md:grid-cols-[minmax(0,1fr)_220px_auto]" @submit.prevent="applyFilters">
            <input v-model="search" type="search" class="admin-input" placeholder="Cari judul, ringkasan, penulis, atau kategori">
            <select v-model="approval" class="admin-input">
                <option value="all">Semua status</option>
                <option value="approved">Sudah disetujui</option>
                <option value="pending">Menunggu persetujuan</option>
                <option value="rejected">Ditolak</option>
            </select>
            <button type="submit" class="rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white">Terapkan</button>
        </form>

        <section class="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div v-if="articles.data.length" class="divide-y divide-slate-100">
                <article v-for="article in articles.data" :key="article.id" class="grid gap-5 p-5 lg:grid-cols-[160px_minmax(0,1fr)_230px]">
                    <img :src="article.coverImage" :alt="article.title" class="aspect-video w-full rounded-xl object-cover lg:aspect-square">
                    <div class="min-w-0">
                        <div class="flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-wider">
                            <span class="rounded-full bg-slate-100 px-2 py-1 text-slate-600">{{ article.categoryName }}</span>
                            <span class="rounded-full px-2 py-1" :class="article.editorialStatus === 'approved' ? 'bg-emerald-100 text-emerald-700' : article.editorialStatus === 'rejected' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'">
                                Editorial {{ article.editorialStatus }}
                            </span>
                            <span class="rounded-full px-2 py-1" :class="article.factCheckStatus === 'verified' ? 'bg-blue-100 text-blue-700' : article.factCheckStatus === 'rejected' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'">
                                Fakta {{ article.factCheckStatus }}
                            </span>
                        </div>
                        <h2 class="mt-3 text-xl font-semibold leading-7 text-slate-950">{{ article.title }}</h2>
                        <p class="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{{ article.excerpt }}</p>
                        <p class="mt-2 text-sm text-slate-500">Penulis: {{ article.authorName }} · Diperbarui {{ article.updatedAt }}</p>
                        <p v-if="article.publishedLabel" class="mt-1 text-xs text-slate-500">Terbit: {{ article.publishedLabel }}</p>
                        <p v-if="article.reviewNote" class="mt-2 text-sm leading-6 text-slate-600">Catatan: {{ article.reviewNote }}</p>
                        <div class="mt-4 flex flex-wrap gap-2">
                            <a v-if="article.status === 'published'" :href="article.publicUrl" target="_blank" class="admin-action">Lihat</a>
                            <Link :href="article.editUrl" class="admin-action">Edit</Link>
                            <button v-if="!article.earningAmount" type="button" class="admin-action text-emerald-700" @click="approveAndVerify(article)">Setujui</button>
                            <button v-if="!article.earningAmount" type="button" class="admin-action text-amber-700" @click="rejectArticle(article)">Tolak</button>
                            <button type="button" class="admin-action text-rose-700" @click="removeArticle(article)">Hapus</button>
                        </div>
                    </div>
                    <aside class="rounded-xl bg-slate-50 p-4">
                        <p class="text-xs font-bold uppercase tracking-wider text-slate-500">Honor</p>
                        <p class="mt-2 text-lg font-semibold" :class="article.earningAmount ? 'text-emerald-700' : 'text-slate-500'">
                            {{ article.earningAmount ? formatRupiah(article.earningAmount) : 'Belum ada' }}
                        </p>
                        <div class="mt-4">
                            <label class="admin-label">Penulis</label>
                            <select
                                :value="article.authorId"
                                class="admin-input text-xs"
                                :disabled="!!article.earningAmount"
                                @change="reassignArticle(article, $event.target.value, $event.target)"
                            >
                                <option v-for="author in articleAuthors" :key="author.id" :value="author.id">{{ author.name }}</option>
                            </select>
                            <p v-if="article.earningAmount" class="mt-2 text-xs leading-5 text-slate-500">Penulis dan status terkunci, tetapi isi artikel tetap dapat diedit.</p>
                        </div>
                    </aside>
                </article>
            </div>
            <p v-else class="p-10 text-center text-sm text-slate-500">Tidak ada berita yang sesuai dengan filter.</p>
            <div class="border-t border-slate-200 px-6 py-5">
                <PaginationLinks :links="articles.links" />
            </div>
        </section>
    </AdminLayout>
</template>

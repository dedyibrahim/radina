<script setup>
import { computed, ref, watch } from 'vue';
import { Link, router, useForm, usePage } from '@inertiajs/vue3';
import ArticleImageFields from '../../Components/ArticleImageFields.vue';
import PaginationLinks from '../../Components/PaginationLinks.vue';
import SeoHead from '../../Components/SeoHead.vue';
import AdminLayout from '../../Layouts/AdminLayout.vue';

const props = defineProps({
    seo: Object,
    stats: Object,
    categories: Array,
    articleAuthors: Array,
    articles: Object,
    editArticle: {
        type: Object,
        default: null,
    },
    storeUrl: String,
    defaultCoverImage: String,
});

const page = usePage();
const fileInput = ref(null);
const flashStatus = computed(() => page.props.flash?.status || '');
const isEditMode = computed(() => !!props.editArticle);
const currentAuthor = computed(() => page.props.auth?.user || null);

const defaults = () => ({
    category_id: props.categories[0]?.id || '',
    assigned_user_id: currentAuthor.value?.id || '',
    title: '',
    title_en: '',
    excerpt: '',
    excerpt_en: '',
    content: '',
    content_en: '',
    cover_image: null,
    cover_image_url: props.defaultCoverImage,
    cover_image_alt: '',
    cover_image_alt_en: '',
    status: 'draft',
    editorial_status: 'pending',
    fact_check_status: 'pending',
    review_note: '',
    is_featured: false,
    published_at: '',
    seo_title: '',
    seo_title_en: '',
    seo_description: '',
    seo_description_en: '',
    seo_keywords: '',
    seo_keywords_en: '',
    tags: '',
    article_images: [],
    existing_images: [],
});

const form = useForm(defaults());

const hydrateForm = () => {
    const article = props.editArticle;

    if (!article) {
        Object.assign(form, defaults());
        form.clearErrors();
        return;
    }

    Object.assign(form, {
        category_id: article.categoryId,
        assigned_user_id: article.assignedUserId,
        title: article.title || '',
        title_en: article.titleEn || '',
        excerpt: article.excerpt || '',
        excerpt_en: article.excerptEn || '',
        content: article.content || '',
        content_en: article.contentEn || '',
        cover_image: null,
        cover_image_url: article.coverImage || '',
        cover_image_alt: article.coverImageAlt || '',
        cover_image_alt_en: article.coverImageAltEn || '',
        status: article.status,
        editorial_status: article.editorialStatus,
        fact_check_status: article.factCheckStatus,
        review_note: article.reviewNote || '',
        is_featured: article.isFeatured,
        published_at: article.publishedAt || '',
        seo_title: article.seoTitle || '',
        seo_title_en: article.seoTitleEn || '',
        seo_description: article.seoDescription || '',
        seo_description_en: article.seoDescriptionEn || '',
        seo_keywords: article.seoKeywords || '',
        seo_keywords_en: article.seoKeywordsEn || '',
        tags: article.tags || '',
        article_images: [],
        existing_images: (article.images || []).map((image) => ({
            id: image.id,
            url: image.url,
            alt_text: image.altText || '',
            caption: image.caption || '',
            position_after_paragraph: image.positionAfterParagraph || 0,
            destroyUrl: image.destroyUrl,
        })),
    });
    form.clearErrors();
};

watch(() => props.editArticle, hydrateForm, { immediate: true });

const selectFile = (event) => {
    form.cover_image = event.target.files?.[0] || null;
};

const submit = () => {
    form
        .transform((data) => ({
            ...data,
            ...(isEditMode.value ? { _method: 'patch' } : {}),
            is_featured: data.is_featured ? 1 : 0,
        }))
        .post(isEditMode.value ? props.editArticle.updateUrl : props.storeUrl, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                if (!isEditMode.value) {
                    form.reset();
                    Object.assign(form, defaults());
                }
                if (fileInput.value) {
                    fileInput.value.value = '';
                }
            },
        });
};

const removeArticle = (article) => {
    if (window.confirm(`Hapus berita "${article.title}"?`)) {
        router.delete(article.destroyUrl, { preserveScroll: true });
    }
};

const reassignArticle = (article, authorId, selectElement) => {
    const author = props.articleAuthors.find((candidate) => candidate.id === Number(authorId));

    if (!author || !window.confirm(`Alihkan artikel "${article.title}" kepada ${author.name}?`)) {
        selectElement.value = article.authorId;
        return;
    }

    router.patch(article.reassignUrl, {
        assigned_user_id: author.id,
    }, {
        preserveScroll: true,
        onError: () => {
            selectElement.value = article.authorId;
        },
    });
};

const approveAndVerify = (article) => {
    if (window.confirm(`Setujui, verifikasi fakta, dan terbitkan "${article.title}"? Honor penulis akan langsung dikreditkan.`)) {
        router.patch(article.reviewUrl, {
            editorial_status: 'approved',
            fact_check_status: 'verified',
            review_note: '',
        }, { preserveScroll: true });
    }
};

const rejectArticle = (article) => {
    const note = window.prompt(`Alasan penolakan artikel "${article.title}":`);
    if (!note) {
        return;
    }

    router.patch(article.reviewUrl, {
        editorial_status: 'rejected',
        fact_check_status: 'rejected',
        review_note: note,
    }, { preserveScroll: true });
};

const formatRupiah = (amount) => new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
}).format(Number(amount || 0));
</script>

<template>
    <AdminLayout
        :is-admin="true"
        active-section="news"
        @navigate="router.visit(`/dashboard?section=${$event}`)"
    >
        <SeoHead :seo="seo" />

        <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div class="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <span class="news-kicker">Panel Berita</span>
                    <h1 class="mt-4 text-4xl font-semibold sm:text-5xl">Kelola Berita</h1>
                    <p class="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                        Buat, edit, terbitkan, dan hapus artikel Indonesia maupun Inggris.
                    </p>
                </div>
                <div class="flex flex-wrap gap-3">
                    <Link href="/dashboard" class="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:border-blue-300 hover:text-blue-700">
                        Dashboard Utama
                    </Link>
                    <Link href="/" class="rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800">
                        Lihat Portal
                    </Link>
                </div>
            </div>
        </section>

        <section v-if="flashStatus" class="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800">
            {{ flashStatus }}
        </section>

        <section class="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div class="admin-stat"><span>Total</span><strong>{{ stats.total }}</strong></div>
            <div class="admin-stat"><span>Published</span><strong>{{ stats.published }}</strong></div>
            <div class="admin-stat"><span>Draft</span><strong>{{ stats.draft }}</strong></div>
            <div class="admin-stat"><span>Featured</span><strong>{{ stats.featured }}</strong></div>
        </section>

        <section class="mt-8 grid gap-6 xl:grid-cols-[minmax(0,520px)_minmax(0,1fr)]">
            <div class="rounded-2xl border border-slate-200 bg-white p-6">
                <div class="flex items-start justify-between gap-4">
                    <div>
                        <h2 class="text-2xl font-semibold">{{ isEditMode ? 'Edit Berita' : 'Buat Berita' }}</h2>
                        <p class="mt-1 text-sm text-slate-500">Kolom Indonesia wajib. Kolom Inggris bersifat opsional.</p>
                        <p v-if="!isEditMode" class="mt-2 text-xs font-semibold text-blue-700">
                            Penulis: {{ currentAuthor?.name }} (akun login)
                        </p>
                    </div>
                    <Link v-if="isEditMode" href="/dashboard/berita" class="text-sm font-semibold text-blue-700">Batal</Link>
                </div>

                <form class="mt-6 space-y-5" @submit.prevent="submit">
                    <div class="grid gap-4 sm:grid-cols-3">
                        <div>
                            <label class="admin-label">Kategori</label>
                            <select v-model="form.category_id" class="admin-input">
                                <option v-for="category in categories" :key="category.id" :value="category.id">
                                    {{ category.name }}
                                </option>
                            </select>
                            <p v-if="form.errors.category_id" class="admin-error">{{ form.errors.category_id }}</p>
                        </div>
                        <div>
                            <label class="admin-label">Penulis artikel</label>
                            <select
                                v-model="form.assigned_user_id"
                                class="admin-input"
                                :disabled="!!editArticle?.earningAmount"
                            >
                                <option v-for="author in articleAuthors" :key="author.id" :value="author.id">
                                    {{ author.name }} · {{ author.roleLabel }}
                                </option>
                            </select>
                            <p v-if="form.errors.assigned_user_id" class="admin-error">{{ form.errors.assigned_user_id }}</p>
                            <p v-else class="mt-1 text-xs text-slate-500">
                                {{ editArticle?.earningAmount
                                    ? 'Dikunci karena honor sudah dikreditkan.'
                                    : 'Admin dapat mengalihkan kepemilikan sebelum honor masuk.' }}
                            </p>
                        </div>
                        <div>
                            <label class="admin-label">Status publik</label>
                            <div class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                                {{ form.editorial_status === 'approved' && form.fact_check_status === 'verified' ? 'Published' : 'Draft' }}
                            </div>
                        </div>
                    </div>

                    <div class="rounded-xl border border-blue-200 bg-blue-50/60 p-4">
                        <h3 class="font-semibold text-slate-900">Review Redaksi dan Verifikasi Fakta</h3>
                        <p class="mt-1 text-xs leading-5 text-slate-600">
                            Artikel hanya diterbitkan dan menghasilkan honor jika editorial disetujui serta fakta terverifikasi.
                        </p>
                        <div class="mt-4 grid gap-4 sm:grid-cols-2">
                            <div>
                                <label class="admin-label">Keputusan editorial</label>
                                <select v-model="form.editorial_status" class="admin-input" :disabled="!!editArticle?.earningAmount">
                                    <option value="pending">Menunggu review</option>
                                    <option value="approved">Disetujui</option>
                                    <option value="rejected">Ditolak</option>
                                </select>
                                <p v-if="form.errors.editorial_status" class="admin-error">{{ form.errors.editorial_status }}</p>
                            </div>
                            <div>
                                <label class="admin-label">Verifikasi fakta</label>
                                <select v-model="form.fact_check_status" class="admin-input" :disabled="!!editArticle?.earningAmount">
                                    <option value="pending">Belum diperiksa</option>
                                    <option value="verified">Terverifikasi</option>
                                    <option value="rejected">Tidak valid</option>
                                </select>
                                <p v-if="form.errors.fact_check_status" class="admin-error">{{ form.errors.fact_check_status }}</p>
                            </div>
                        </div>
                        <div class="mt-4">
                            <label class="admin-label">Catatan review</label>
                            <textarea v-model="form.review_note" rows="3" class="admin-input" placeholder="Catatan koreksi atau alasan penolakan"></textarea>
                        </div>
                        <div v-if="editArticle?.earningAmount" class="mt-4 rounded-lg bg-emerald-100 px-4 py-3 text-sm font-semibold text-emerald-800">
                            Honor {{ formatRupiah(editArticle.earningAmount) }} sudah dikreditkan dan status persetujuan dikunci.
                        </div>
                    </div>

                    <div>
                        <label class="admin-label">Judul Indonesia</label>
                        <input v-model="form.title" type="text" class="admin-input">
                        <p v-if="form.errors.title" class="admin-error">{{ form.errors.title }}</p>
                    </div>
                    <div>
                        <label class="admin-label">Ringkasan Indonesia</label>
                        <textarea v-model="form.excerpt" rows="3" class="admin-input" />
                        <p v-if="form.errors.excerpt" class="admin-error">{{ form.errors.excerpt }}</p>
                    </div>
                    <div>
                        <label class="admin-label">Konten Indonesia</label>
                        <textarea v-model="form.content" rows="10" class="admin-input font-mono text-xs" placeholder="<p>Isi artikel...</p>" />
                        <p v-if="form.errors.content" class="admin-error">{{ form.errors.content }}</p>
                    </div>

                    <details class="rounded-xl border border-slate-200 p-4">
                        <summary class="cursor-pointer text-sm font-semibold text-slate-800">Versi Inggris</summary>
                        <div class="mt-4 space-y-4">
                            <div><label class="admin-label">English Title</label><input v-model="form.title_en" type="text" class="admin-input"></div>
                            <div><label class="admin-label">English Excerpt</label><textarea v-model="form.excerpt_en" rows="3" class="admin-input" /></div>
                            <div><label class="admin-label">English Content</label><textarea v-model="form.content_en" rows="8" class="admin-input font-mono text-xs" /></div>
                        </div>
                    </details>

                    <div class="rounded-xl border border-slate-200 p-4">
                        <h3 class="font-semibold text-slate-900">Gambar Berita</h3>
                        <div class="mt-4 space-y-4">
                            <div><label class="admin-label">Upload gambar</label><input ref="fileInput" type="file" accept="image/*" class="admin-input" @change="selectFile"></div>
                            <div><label class="admin-label">Atau URL/path gambar</label><input v-model="form.cover_image_url" type="text" class="admin-input"></div>
                            <div class="grid gap-4 sm:grid-cols-2">
                                <div><label class="admin-label">Alt gambar</label><input v-model="form.cover_image_alt" type="text" class="admin-input"></div>
                                <div><label class="admin-label">Alt image EN</label><input v-model="form.cover_image_alt_en" type="text" class="admin-input"></div>
                            </div>
                            <img v-if="form.cover_image_url" :src="form.cover_image_url" alt="" class="aspect-video w-full rounded-xl object-cover">
                            <p v-if="form.errors.cover_image || form.errors.cover_image_url" class="admin-error">
                                {{ form.errors.cover_image || form.errors.cover_image_url }}
                            </p>
                        </div>
                    </div>

                    <ArticleImageFields
                        v-model="form.article_images"
                        v-model:existing-images="form.existing_images"
                        :errors="form.errors"
                    />

                    <div class="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label class="admin-label">Tanggal terbit</label>
                            <input v-model="form.published_at" type="datetime-local" class="admin-input">
                        </div>
                        <label class="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">
                            <input v-model="form.is_featured" type="checkbox" class="rounded border-slate-300 text-blue-700 focus:ring-blue-500">
                            Featured di homepage
                        </label>
                    </div>

                    <div>
                        <label class="admin-label">Tags, pisahkan dengan koma</label>
                        <input v-model="form.tags" type="text" class="admin-input" placeholder="AI, Bisnis, Teknologi">
                    </div>

                    <details class="rounded-xl border border-slate-200 p-4">
                        <summary class="cursor-pointer text-sm font-semibold text-slate-800">SEO</summary>
                        <div class="mt-4 grid gap-4">
                            <input v-model="form.seo_title" type="text" class="admin-input" placeholder="SEO title Indonesia">
                            <textarea v-model="form.seo_description" rows="2" class="admin-input" placeholder="SEO description Indonesia" />
                            <input v-model="form.seo_keywords" type="text" class="admin-input" placeholder="keyword, indonesia">
                            <input v-model="form.seo_title_en" type="text" class="admin-input" placeholder="SEO title English">
                            <textarea v-model="form.seo_description_en" rows="2" class="admin-input" placeholder="SEO description English" />
                            <input v-model="form.seo_keywords_en" type="text" class="admin-input" placeholder="keywords, english">
                        </div>
                    </details>

                    <button type="submit" class="w-full rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800" :disabled="form.processing">
                        {{ form.processing ? 'Menyimpan...' : (isEditMode ? 'Simpan Perubahan' : 'Buat Berita') }}
                    </button>
                </form>
            </div>

            <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <div class="border-b border-slate-200 px-6 py-5">
                    <h2 class="text-2xl font-semibold">Daftar Berita</h2>
                    <p class="mt-1 text-sm text-slate-500">Artikel terbaru yang tersimpan di Radina News.</p>
                </div>
                <div class="divide-y divide-slate-100">
                    <article v-for="article in articles.data" :key="article.id" class="grid gap-4 p-5 sm:grid-cols-[120px_minmax(0,1fr)]">
                        <img :src="article.coverImage" :alt="article.title" class="aspect-video w-full rounded-xl object-cover sm:aspect-square">
                        <div class="min-w-0">
                            <div class="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                                <span>{{ article.categoryName }}</span>
                                <span>/</span>
                                <span :class="article.status === 'published' ? 'text-emerald-700' : 'text-amber-700'">{{ article.status }}</span>
                                <span v-if="article.isFeatured" class="text-blue-700">Featured</span>
                            </div>
                            <h3 class="mt-2 text-lg font-semibold leading-6 text-slate-950">{{ article.title }}</h3>
                            <p class="mt-1 text-xs text-slate-500">Diperbarui {{ article.updatedAt }} oleh {{ article.authorName }}</p>
                            <div class="mt-2 flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-wider">
                                <span class="rounded-full bg-slate-100 px-2 py-1 text-slate-600">Editorial: {{ article.editorialStatus }}</span>
                                <span class="rounded-full bg-slate-100 px-2 py-1 text-slate-600">Fakta: {{ article.factCheckStatus }}</span>
                                <span v-if="article.earningAmount" class="rounded-full bg-emerald-100 px-2 py-1 text-emerald-700">
                                    Honor {{ formatRupiah(article.earningAmount) }}
                                </span>
                            </div>
                            <p v-if="article.reviewNote" class="mt-2 text-xs leading-5 text-slate-500">Catatan: {{ article.reviewNote }}</p>
                            <div class="mt-3">
                                <label class="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">Alihkan penulis</label>
                                <select
                                    :value="article.authorId"
                                    class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                                    :disabled="!!article.earningAmount"
                                    @change="reassignArticle(article, $event.target.value, $event.target)"
                                >
                                    <option v-for="author in articleAuthors" :key="author.id" :value="author.id">
                                        {{ author.name }} · {{ author.roleLabel }}
                                    </option>
                                </select>
                            </div>
                            <div class="mt-4 flex flex-wrap gap-2">
                                <a v-if="article.status === 'published'" :href="article.publicUrl" target="_blank" class="admin-action">Lihat</a>
                                <Link :href="article.editUrl" class="admin-action">Edit</Link>
                                <button
                                    v-if="!article.earningAmount"
                                    type="button"
                                    class="admin-action text-emerald-700"
                                    @click="approveAndVerify(article)"
                                >
                                    Setujui & Verifikasi
                                </button>
                                <button
                                    v-if="!article.earningAmount"
                                    type="button"
                                    class="admin-action text-amber-700"
                                    @click="rejectArticle(article)"
                                >
                                    Tolak
                                </button>
                                <button type="button" class="admin-action text-rose-700" @click="removeArticle(article)">Hapus</button>
                            </div>
                        </div>
                    </article>
                </div>
                <div class="border-t border-slate-200 px-6 py-5">
                    <PaginationLinks :links="articles.links" />
                </div>
            </div>
        </section>
    </AdminLayout>
</template>

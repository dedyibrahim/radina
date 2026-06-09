<script setup>
import { computed, ref, watch } from 'vue';
import { Link, router, useForm, usePage } from '@inertiajs/vue3';
import PaginationLinks from '../../Components/PaginationLinks.vue';
import SeoHead from '../../Components/SeoHead.vue';
import NewsLayout from '../../Layouts/NewsLayout.vue';

const props = defineProps({
    seo: Object,
    stats: Object,
    categories: Array,
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
    is_featured: false,
    published_at: '',
    seo_title: '',
    seo_title_en: '',
    seo_description: '',
    seo_description_en: '',
    seo_keywords: '',
    seo_keywords_en: '',
    tags: '',
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
        is_featured: article.isFeatured,
        published_at: article.publishedAt || '',
        seo_title: article.seoTitle || '',
        seo_title_en: article.seoTitleEn || '',
        seo_description: article.seoDescription || '',
        seo_description_en: article.seoDescriptionEn || '',
        seo_keywords: article.seoKeywords || '',
        seo_keywords_en: article.seoKeywordsEn || '',
        tags: article.tags || '',
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
</script>

<template>
    <NewsLayout>
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
                    <div class="grid gap-4 sm:grid-cols-2">
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
                            <label class="admin-label">Status</label>
                            <select v-model="form.status" class="admin-input">
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                            </select>
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
                            <div class="mt-4 flex flex-wrap gap-2">
                                <a v-if="article.status === 'published'" :href="article.publicUrl" target="_blank" class="admin-action">Lihat</a>
                                <Link :href="article.editUrl" class="admin-action">Edit</Link>
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
    </NewsLayout>
</template>

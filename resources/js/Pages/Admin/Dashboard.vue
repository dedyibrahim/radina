<script setup>
import { computed, ref, watch } from 'vue';
import { Link, router, useForm, usePage } from '@inertiajs/vue3';
import PaginationLinks from '../../Components/PaginationLinks.vue';
import SeoHead from '../../Components/SeoHead.vue';
import AdminLayout from '../../Layouts/AdminLayout.vue';

const props = defineProps({
    seo: Object,
    stats: Object,
    newsStats: Object,
    categories: Array,
    editCategory: {
        type: Object,
        default: null,
    },
    storeCategoryUrl: String,
    recentNews: Array,
    storeNewsUrl: String,
    defaultCoverImage: String,
    activeSection: String,
    isAdmin: Boolean,
    licenses: Object,
    editLicense: {
        type: Object,
        default: null,
    },
    formDefaults: Object,
    users: Array,
    editUser: {
        type: Object,
        default: null,
    },
    storeUserUrl: String,
});

const page = usePage();
const flashStatus = computed(() => page.props.flash?.status || '');
const newLicenseKey = computed(() => page.props.flash?.newLicenseKey || '');
const currentAuthor = computed(() => page.props.auth?.user || null);
const isEditMode = computed(() => !!props.editLicense);
const activePanel = ref(props.activeSection || 'news');
const newsFileInput = ref(null);
const categoryFileInput = ref(null);
const isCategoryEditMode = computed(() => !!props.editCategory);
const isUserEditMode = computed(() => !!props.editUser);

const form = useForm({
    customer_name: props.formDefaults.customer_name,
    product_name: props.formDefaults.product_name,
    max_activations: props.formDefaults.max_activations,
    expires_at: props.formDefaults.expires_at,
    notes: props.formDefaults.notes,
});

const newsDefaults = () => ({
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
    redirect_to: 'dashboard',
});

const newsForm = useForm(newsDefaults());

const categoryDefaults = () => ({
    name: '',
    name_en: '',
    description: '',
    description_en: '',
    accent_color: '#2563EB',
    cover_image: null,
    cover_image_url: '',
    seo_title: '',
    seo_title_en: '',
    seo_description: '',
    seo_description_en: '',
});

const categoryForm = useForm(categoryDefaults());

const userDefaults = () => ({
    name: '',
    email: '',
    role: 'writer',
    password: '',
    password_confirmation: '',
});

const userForm = useForm(userDefaults());

const hydrateForm = () => {
    form.customer_name = props.editLicense?.customerName || props.formDefaults.customer_name;
    form.product_name = props.editLicense?.productName || props.formDefaults.product_name;
    form.max_activations = props.editLicense?.maxActivations || props.formDefaults.max_activations;
    form.expires_at = props.editLicense?.expiresAt || props.formDefaults.expires_at;
    form.notes = props.editLicense?.notes || props.formDefaults.notes;
    form.clearErrors();
};

watch(() => props.editLicense, hydrateForm, { immediate: true });

const hydrateCategoryForm = () => {
    const category = props.editCategory;

    Object.assign(categoryForm, category ? {
        name: category.name || '',
        name_en: category.nameEn || '',
        description: category.description || '',
        description_en: category.descriptionEn || '',
        accent_color: category.accentColor || '#2563EB',
        cover_image: null,
        cover_image_url: category.coverImage || '',
        seo_title: category.seoTitle || '',
        seo_title_en: category.seoTitleEn || '',
        seo_description: category.seoDescription || '',
        seo_description_en: category.seoDescriptionEn || '',
    } : categoryDefaults());
    categoryForm.clearErrors();
};

watch(() => props.editCategory, hydrateCategoryForm, { immediate: true });

const hydrateUserForm = () => {
    Object.assign(userForm, props.editUser ? {
        name: props.editUser.name,
        email: props.editUser.email,
        role: props.editUser.role,
        password: '',
        password_confirmation: '',
    } : userDefaults());
    userForm.clearErrors();
};

watch(() => props.editUser, hydrateUserForm, { immediate: true });

const submit = () => {
    if (props.editLicense) {
        form.patch(props.editLicense.updateUrl, { preserveScroll: true });
        return;
    }

    form.post('/licenses', {
        preserveScroll: true,
        onSuccess: () => form.reset('customer_name', 'expires_at', 'notes'),
    });
};

const selectNewsFile = (event) => {
    newsForm.cover_image = event.target.files?.[0] || null;
};

const submitNews = () => {
    newsForm
        .transform((data) => ({
            ...data,
            is_featured: data.is_featured ? 1 : 0,
        }))
        .post(props.storeNewsUrl, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                newsForm.reset();
                Object.assign(newsForm, newsDefaults());

                if (newsFileInput.value) {
                    newsFileInput.value.value = '';
                }
            },
        });
};

const selectCategoryFile = (event) => {
    categoryForm.cover_image = event.target.files?.[0] || null;
};

const submitCategory = () => {
    categoryForm
        .transform((data) => ({
            ...data,
            ...(isCategoryEditMode.value ? { _method: 'patch' } : {}),
        }))
        .post(isCategoryEditMode.value ? props.editCategory.updateUrl : props.storeCategoryUrl, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                if (!isCategoryEditMode.value) {
                    categoryForm.reset();
                    Object.assign(categoryForm, categoryDefaults());
                }

                if (categoryFileInput.value) {
                    categoryFileInput.value.value = '';
                }
            },
        });
};

const copyText = async (value) => {
    if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
    }
};

const toggleStatus = (license) => {
    router.patch(license.toggleUrl, {}, { preserveScroll: true });
};

const removeLicense = (license) => {
    if (window.confirm(`Hapus lisensi ${license.key}? Tindakan ini tidak bisa dibatalkan.`)) {
        router.delete(license.destroyUrl, { preserveScroll: true });
    }
};

const removeCategory = (category) => {
    if (category.articlesCount > 0) {
        window.alert(`Kategori "${category.name}" masih digunakan oleh ${category.articlesCount} berita.`);
        return;
    }

    if (window.confirm(`Hapus kategori "${category.name}"?`)) {
        router.delete(category.destroyUrl, { preserveScroll: true });
    }
};

const submitUser = () => {
    if (isUserEditMode.value) {
        userForm.patch(props.editUser.updateUrl, { preserveScroll: true });
        return;
    }

    userForm.post(props.storeUserUrl, {
        preserveScroll: true,
        onSuccess: () => {
            userForm.reset();
            Object.assign(userForm, userDefaults());
        },
    });
};

const removeUser = (account) => {
    if (account.id === currentAuthor.value?.id) {
        window.alert('Akun yang sedang digunakan tidak dapat dihapus.');
        return;
    }

    if (account.articlesCount > 0) {
        window.alert(`Akun "${account.name}" masih memiliki ${account.articlesCount} artikel.`);
        return;
    }

    if (window.confirm(`Hapus akun "${account.name}"?`)) {
        router.delete(account.destroyUrl, { preserveScroll: true });
    }
};
</script>

<template>
    <AdminLayout :active-section="activePanel" :is-admin="isAdmin" @navigate="activePanel = $event">
        <SeoHead :seo="seo" />

        <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div class="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <span class="news-kicker">Panel Pengelola</span>
                    <h1 class="mt-4 text-4xl font-semibold sm:text-5xl">Dashboard Radina News</h1>
                    <p class="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                        {{ isAdmin
                            ? 'Kelola berita, kategori, lisensi, dan pengguna dari satu dashboard.'
                            : 'Tulis artikel baru dan kirimkan sebagai draft untuk diperiksa admin.' }}
                    </p>
                </div>
                <div class="flex flex-wrap gap-3">
                    <Link href="/" class="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:border-blue-300 hover:text-blue-700">
                        Lihat Portal
                    </Link>
                </div>
            </div>
        </section>

        <section v-if="flashStatus" class="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800">
            {{ flashStatus }}
        </section>

        <section v-if="newLicenseKey && activePanel === 'licenses'" class="mt-4 rounded-xl border border-blue-200 bg-blue-50 px-5 py-4">
            <div class="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <p class="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">Lisensi baru</p>
                    <p class="mt-2 font-mono text-base text-slate-900">{{ newLicenseKey }}</p>
                </div>
                <button type="button" class="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm" @click="copyText(newLicenseKey)">
                    Copy Key
                </button>
            </div>
        </section>

        <section v-if="isAdmin" v-show="activePanel === 'categories'" class="mt-6">
            <div class="mb-6 grid gap-4 sm:grid-cols-3">
                <div class="admin-stat"><span>Total kategori</span><strong>{{ categories.length }}</strong></div>
                <div class="admin-stat">
                    <span>Kategori aktif</span>
                    <strong>{{ categories.filter((category) => category.articlesCount > 0).length }}</strong>
                </div>
                <div class="admin-stat">
                    <span>Total artikel</span>
                    <strong>{{ categories.reduce((total, category) => total + category.articlesCount, 0) }}</strong>
                </div>
            </div>

            <div class="grid gap-6 xl:grid-cols-[minmax(0,480px)_minmax(0,1fr)]">
                <div class="rounded-2xl border border-slate-200 bg-white p-6">
                    <div class="flex items-start justify-between gap-4">
                        <div>
                            <h2 class="text-2xl font-semibold">{{ isCategoryEditMode ? 'Edit Kategori' : 'Buat Kategori' }}</h2>
                            <p class="mt-2 text-sm leading-6 text-slate-500">
                                Informasi kategori ini tampil pada menu, halaman kategori, dan hasil pencarian.
                            </p>
                        </div>
                        <Link
                            v-if="isCategoryEditMode"
                            href="/dashboard?section=categories"
                            class="text-sm font-semibold text-blue-700"
                        >
                            Batal
                        </Link>
                    </div>

                    <form class="mt-6 space-y-5" @submit.prevent="submitCategory">
                        <div class="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label class="admin-label">Nama Indonesia</label>
                                <input v-model="categoryForm.name" type="text" class="admin-input">
                                <p v-if="categoryForm.errors.name" class="admin-error">{{ categoryForm.errors.name }}</p>
                            </div>
                            <div>
                                <label class="admin-label">English Name</label>
                                <input v-model="categoryForm.name_en" type="text" class="admin-input">
                                <p v-if="categoryForm.errors.name_en" class="admin-error">{{ categoryForm.errors.name_en }}</p>
                            </div>
                        </div>

                        <div>
                            <label class="admin-label">Deskripsi Indonesia</label>
                            <textarea v-model="categoryForm.description" rows="4" class="admin-input"></textarea>
                            <p v-if="categoryForm.errors.description" class="admin-error">{{ categoryForm.errors.description }}</p>
                        </div>

                        <div>
                            <label class="admin-label">English Description</label>
                            <textarea v-model="categoryForm.description_en" rows="4" class="admin-input"></textarea>
                            <p v-if="categoryForm.errors.description_en" class="admin-error">{{ categoryForm.errors.description_en }}</p>
                        </div>

                        <div>
                            <label class="admin-label">Warna kategori</label>
                            <div class="flex items-center gap-3">
                                <input v-model="categoryForm.accent_color" type="color" class="h-11 w-14 cursor-pointer rounded-lg border border-slate-300 bg-white p-1">
                                <input v-model="categoryForm.accent_color" type="text" class="admin-input" placeholder="#2563EB">
                            </div>
                            <p v-if="categoryForm.errors.accent_color" class="admin-error">{{ categoryForm.errors.accent_color }}</p>
                        </div>

                        <div class="rounded-xl border border-slate-200 p-4">
                            <h3 class="font-semibold text-slate-900">Gambar Kategori</h3>
                            <div class="mt-4 space-y-4">
                                <div>
                                    <label class="admin-label">Upload gambar</label>
                                    <input ref="categoryFileInput" type="file" accept="image/*" class="admin-input" @change="selectCategoryFile">
                                </div>
                                <div>
                                    <label class="admin-label">Atau URL/path gambar</label>
                                    <input v-model="categoryForm.cover_image_url" type="text" class="admin-input">
                                </div>
                                <img
                                    v-if="categoryForm.cover_image_url"
                                    :src="categoryForm.cover_image_url"
                                    alt=""
                                    class="aspect-video w-full rounded-xl object-cover"
                                >
                                <p v-if="categoryForm.errors.cover_image || categoryForm.errors.cover_image_url" class="admin-error">
                                    {{ categoryForm.errors.cover_image || categoryForm.errors.cover_image_url }}
                                </p>
                            </div>
                        </div>

                        <details class="rounded-xl border border-slate-200 p-4">
                            <summary class="cursor-pointer text-sm font-semibold text-slate-800">Pengaturan SEO Kategori</summary>
                            <div class="mt-4 grid gap-4">
                                <input v-model="categoryForm.seo_title" type="text" class="admin-input" placeholder="SEO title Indonesia">
                                <textarea v-model="categoryForm.seo_description" rows="2" class="admin-input" placeholder="SEO description Indonesia"></textarea>
                                <input v-model="categoryForm.seo_title_en" type="text" class="admin-input" placeholder="SEO title English">
                                <textarea v-model="categoryForm.seo_description_en" rows="2" class="admin-input" placeholder="SEO description English"></textarea>
                            </div>
                        </details>

                        <button
                            type="submit"
                            class="w-full rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:opacity-60"
                            :disabled="categoryForm.processing"
                        >
                            {{ categoryForm.processing ? 'Menyimpan...' : (isCategoryEditMode ? 'Simpan Kategori' : 'Buat Kategori') }}
                        </button>
                    </form>
                </div>

                <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    <div class="border-b border-slate-200 px-6 py-5">
                        <h2 class="text-2xl font-semibold">Daftar Kategori</h2>
                        <p class="mt-1 text-sm text-slate-500">Kategori berikut diambil langsung dari database.</p>
                    </div>

                    <div class="grid gap-4 p-5 md:grid-cols-2">
                        <article
                            v-for="category in categories"
                            :key="category.id"
                            class="overflow-hidden rounded-2xl border border-slate-200 bg-white"
                        >
                            <div class="relative aspect-[16/8] bg-slate-100">
                                <img
                                    v-if="category.coverImage"
                                    :src="category.coverImage"
                                    :alt="category.name"
                                    class="h-full w-full object-cover"
                                >
                                <div v-else class="grid h-full place-items-center text-sm text-slate-400">Belum ada gambar</div>
                                <span
                                    class="absolute bottom-3 left-3 rounded-full px-3 py-1 text-xs font-bold text-white shadow-sm"
                                    :style="{ backgroundColor: category.accentColor }"
                                >
                                    {{ category.articlesCount }} artikel
                                </span>
                            </div>
                            <div class="p-4">
                                <div class="flex items-start justify-between gap-3">
                                    <div>
                                        <h3 class="font-bold text-slate-950">{{ category.name }}</h3>
                                        <p v-if="category.nameEn" class="mt-0.5 text-xs text-slate-500">{{ category.nameEn }}</p>
                                    </div>
                                    <span class="mt-1 h-3 w-3 shrink-0 rounded-full" :style="{ backgroundColor: category.accentColor }"></span>
                                </div>
                                <p class="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                                    {{ category.description || 'Belum ada deskripsi kategori.' }}
                                </p>
                                <div class="mt-4 flex flex-wrap gap-2">
                                    <a :href="category.publicUrl" target="_blank" class="admin-action">Lihat</a>
                                    <Link :href="category.editUrl" class="admin-action">Edit</Link>
                                    <button
                                        type="button"
                                        class="admin-action text-rose-700 disabled:cursor-not-allowed disabled:opacity-40"
                                        :disabled="category.articlesCount > 0"
                                        @click="removeCategory(category)"
                                    >
                                        Hapus
                                    </button>
                                </div>
                            </div>
                        </article>
                    </div>
                </div>
            </div>
        </section>

        <section v-show="activePanel === 'news'" class="mt-6">
            <div class="mb-6 grid gap-4 sm:grid-cols-3">
                <div class="admin-stat"><span>Total berita</span><strong>{{ newsStats.total }}</strong></div>
                <div class="admin-stat"><span>Published</span><strong>{{ newsStats.published }}</strong></div>
                <div class="admin-stat"><span>Draft</span><strong>{{ newsStats.draft }}</strong></div>
            </div>

            <div class="grid gap-6 xl:grid-cols-[minmax(0,560px)_minmax(0,1fr)]">
                <div class="rounded-2xl border border-slate-200 bg-white p-6">
                    <h2 class="text-2xl font-semibold">Buat Berita</h2>
                    <p class="mt-2 text-sm text-slate-500">Kolom Indonesia wajib. Bahasa Inggris dan SEO dapat dilengkapi bila diperlukan.</p>
                    <div class="mt-4 flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
                        <span class="grid h-9 w-9 place-items-center rounded-full bg-blue-700 text-sm font-bold text-white">
                            {{ currentAuthor?.name?.charAt(0)?.toUpperCase() }}
                        </span>
                        <div class="min-w-0">
                            <p class="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-700">Penulis dari session login</p>
                            <p class="truncate text-sm font-semibold text-slate-900">{{ currentAuthor?.name }}</p>
                            <p class="truncate text-xs text-slate-500">{{ currentAuthor?.email }}</p>
                        </div>
                    </div>

                    <form class="mt-6 space-y-5" @submit.prevent="submitNews">
                        <div class="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label class="admin-label">Kategori</label>
                                <select v-model="newsForm.category_id" class="admin-input">
                                    <option v-for="category in categories" :key="category.id" :value="category.id">
                                        {{ category.name }}
                                    </option>
                                </select>
                                <p v-if="newsForm.errors.category_id" class="admin-error">{{ newsForm.errors.category_id }}</p>
                            </div>
                            <div v-if="isAdmin">
                                <label class="admin-label">Status</label>
                                <select v-model="newsForm.status" class="admin-input">
                                    <option value="draft">Draft</option>
                                    <option value="published">Published</option>
                                </select>
                            </div>
                            <div v-else>
                                <label class="admin-label">Status</label>
                                <div class="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
                                    Draft — menunggu pemeriksaan admin
                                </div>
                            </div>
                        </div>

                        <div>
                            <label class="admin-label">Judul berita</label>
                            <input v-model="newsForm.title" type="text" class="admin-input">
                            <p v-if="newsForm.errors.title" class="admin-error">{{ newsForm.errors.title }}</p>
                        </div>
                        <div>
                            <label class="admin-label">Ringkasan</label>
                            <textarea v-model="newsForm.excerpt" rows="3" class="admin-input"></textarea>
                            <p v-if="newsForm.errors.excerpt" class="admin-error">{{ newsForm.errors.excerpt }}</p>
                        </div>
                        <div>
                            <label class="admin-label">Isi berita</label>
                            <textarea v-model="newsForm.content" rows="10" class="admin-input" placeholder="Tulis isi berita di sini..."></textarea>
                            <p v-if="newsForm.errors.content" class="admin-error">{{ newsForm.errors.content }}</p>
                        </div>

                        <details class="rounded-xl border border-slate-200 p-4">
                            <summary class="cursor-pointer text-sm font-semibold text-slate-800">Versi Bahasa Inggris</summary>
                            <div class="mt-4 space-y-4">
                                <div><label class="admin-label">English title</label><input v-model="newsForm.title_en" type="text" class="admin-input"></div>
                                <div><label class="admin-label">English excerpt</label><textarea v-model="newsForm.excerpt_en" rows="3" class="admin-input"></textarea></div>
                                <div><label class="admin-label">English content</label><textarea v-model="newsForm.content_en" rows="8" class="admin-input"></textarea></div>
                            </div>
                        </details>

                        <div class="rounded-xl border border-slate-200 p-4">
                            <h3 class="font-semibold text-slate-900">Gambar Berita</h3>
                            <div class="mt-4 space-y-4">
                                <div>
                                    <label class="admin-label">Upload gambar</label>
                                    <input ref="newsFileInput" type="file" accept="image/*" class="admin-input" @change="selectNewsFile">
                                </div>
                                <div>
                                    <label class="admin-label">Atau URL/path gambar</label>
                                    <input v-model="newsForm.cover_image_url" type="text" class="admin-input">
                                </div>
                                <div class="grid gap-4 sm:grid-cols-2">
                                    <div><label class="admin-label">Alt gambar</label><input v-model="newsForm.cover_image_alt" type="text" class="admin-input"></div>
                                    <div><label class="admin-label">Alt image EN</label><input v-model="newsForm.cover_image_alt_en" type="text" class="admin-input"></div>
                                </div>
                                <img v-if="newsForm.cover_image_url" :src="newsForm.cover_image_url" alt="" class="aspect-video w-full rounded-xl object-cover">
                                <p v-if="newsForm.errors.cover_image || newsForm.errors.cover_image_url" class="admin-error">
                                    {{ newsForm.errors.cover_image || newsForm.errors.cover_image_url }}
                                </p>
                            </div>
                        </div>

                        <div v-if="isAdmin" class="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label class="admin-label">Tanggal terbit</label>
                                <input v-model="newsForm.published_at" type="datetime-local" class="admin-input">
                            </div>
                            <label class="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">
                                <input v-model="newsForm.is_featured" type="checkbox" class="rounded border-slate-300 text-blue-700 focus:ring-blue-500">
                                Featured di homepage
                            </label>
                        </div>

                        <div>
                            <label class="admin-label">Tags</label>
                            <input v-model="newsForm.tags" type="text" class="admin-input" placeholder="Teknologi, Bisnis, Nasional">
                        </div>

                        <details v-if="isAdmin" class="rounded-xl border border-slate-200 p-4">
                            <summary class="cursor-pointer text-sm font-semibold text-slate-800">Pengaturan SEO</summary>
                            <div class="mt-4 grid gap-4">
                                <input v-model="newsForm.seo_title" type="text" class="admin-input" placeholder="SEO title Indonesia">
                                <textarea v-model="newsForm.seo_description" rows="2" class="admin-input" placeholder="SEO description Indonesia"></textarea>
                                <input v-model="newsForm.seo_keywords" type="text" class="admin-input" placeholder="keyword, indonesia">
                                <input v-model="newsForm.seo_title_en" type="text" class="admin-input" placeholder="SEO title English">
                                <textarea v-model="newsForm.seo_description_en" rows="2" class="admin-input" placeholder="SEO description English"></textarea>
                                <input v-model="newsForm.seo_keywords_en" type="text" class="admin-input" placeholder="keywords, english">
                            </div>
                        </details>

                        <button type="submit" class="w-full rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60" :disabled="newsForm.processing">
                            {{ newsForm.processing ? 'Menyimpan...' : 'Buat Berita' }}
                        </button>
                    </form>
                </div>

                <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    <div class="flex items-center justify-between gap-4 border-b border-slate-200 px-6 py-5">
                        <div>
                            <h2 class="text-2xl font-semibold">Berita Terbaru</h2>
                            <p class="mt-1 text-sm text-slate-500">Artikel yang terakhir diperbarui.</p>
                        </div>
                        <Link v-if="isAdmin" href="/dashboard/berita" class="text-sm font-semibold text-blue-700">Kelola semua</Link>
                    </div>
                    <div class="divide-y divide-slate-100">
                        <article v-for="article in recentNews" :key="article.id" class="grid gap-4 p-5 sm:grid-cols-[100px_minmax(0,1fr)]">
                            <img :src="article.coverImage" :alt="article.title" class="aspect-video w-full rounded-xl object-cover sm:aspect-square">
                            <div class="min-w-0">
                                <p class="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                                    {{ article.categoryName }} ·
                                    <span :class="article.status === 'published' ? 'text-emerald-700' : 'text-amber-700'">{{ article.status }}</span>
                                </p>
                                <h3 class="mt-2 font-semibold leading-6 text-slate-950">{{ article.title }}</h3>
                                <p class="mt-1 text-xs text-slate-500">{{ article.updatedAt }} · {{ article.authorName }}</p>
                                <div class="mt-3 flex gap-2">
                                    <a v-if="article.status === 'published'" :href="article.publicUrl" target="_blank" class="admin-action">Lihat</a>
                                    <Link v-if="article.editUrl" :href="article.editUrl" class="admin-action">Edit</Link>
                                </div>
                            </div>
                        </article>
                    </div>
                </div>
            </div>
        </section>

        <section v-if="isAdmin" v-show="activePanel === 'licenses'" class="mt-6">
            <div class="mb-6 grid gap-4 sm:grid-cols-3">
                <div class="admin-stat"><span>Total lisensi</span><strong>{{ stats.total }}</strong></div>
                <div class="admin-stat"><span>Aktif</span><strong>{{ stats.active }}</strong></div>
                <div class="admin-stat"><span>Expired</span><strong>{{ stats.expired }}</strong></div>
            </div>

            <div class="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
            <div class="rounded-2xl border border-slate-200 bg-white p-6">
                <div class="flex items-start justify-between gap-4">
                    <div>
                        <h2 class="text-2xl font-semibold">{{ isEditMode ? 'Edit Lisensi' : 'Tambah Lisensi' }}</h2>
                        <p class="mt-2 text-sm text-slate-500">{{ isEditMode ? 'Perbarui lisensi yang dipilih.' : 'Buat key lisensi baru.' }}</p>
                    </div>
                    <Link v-if="isEditMode" href="/dashboard?section=licenses" class="text-sm font-semibold text-blue-700">Batal</Link>
                </div>

                <form class="mt-6 space-y-4" @submit.prevent="submit">
                    <div>
                        <label class="mb-1.5 block text-sm font-semibold text-slate-700">Nama Customer</label>
                        <input v-model="form.customer_name" type="text" class="admin-input">
                        <p v-if="form.errors.customer_name" class="mt-1 text-xs text-rose-600">{{ form.errors.customer_name }}</p>
                    </div>
                    <div>
                        <label class="mb-1.5 block text-sm font-semibold text-slate-700">Nama Produk</label>
                        <input v-model="form.product_name" type="text" class="admin-input">
                        <p v-if="form.errors.product_name" class="mt-1 text-xs text-rose-600">{{ form.errors.product_name }}</p>
                    </div>
                    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                        <div>
                            <label class="mb-1.5 block text-sm font-semibold text-slate-700">Maks Aktivasi</label>
                            <input v-model="form.max_activations" type="number" min="1" max="1000" class="admin-input">
                        </div>
                        <div>
                            <label class="mb-1.5 block text-sm font-semibold text-slate-700">Tanggal Berakhir</label>
                            <input v-model="form.expires_at" type="date" class="admin-input">
                        </div>
                    </div>
                    <div>
                        <label class="mb-1.5 block text-sm font-semibold text-slate-700">Catatan</label>
                        <textarea v-model="form.notes" rows="3" class="admin-input" />
                    </div>
                    <button type="submit" class="w-full rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800" :disabled="form.processing">
                        {{ form.processing ? 'Menyimpan...' : (isEditMode ? 'Simpan Perubahan' : 'Tambah Lisensi') }}
                    </button>
                </form>
            </div>

            <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <div class="border-b border-slate-200 px-6 py-5">
                    <h2 class="text-2xl font-semibold">Daftar Lisensi</h2>
                    <p class="mt-1 text-sm text-slate-500">Kelola key, status, dan masa aktif lisensi.</p>
                </div>
                <div class="overflow-x-auto">
                    <table class="min-w-full text-left text-sm">
                        <thead class="bg-slate-50 text-xs uppercase tracking-[0.12em] text-slate-500">
                            <tr>
                                <th class="px-5 py-4">Key / Customer</th>
                                <th class="px-5 py-4">Status</th>
                                <th class="px-5 py-4">Aktivasi</th>
                                <th class="px-5 py-4">Expired</th>
                                <th class="px-5 py-4">Aksi</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100">
                            <tr v-for="license in licenses.data" :key="license.id" class="align-top">
                                <td class="px-5 py-4">
                                    <p class="font-mono text-xs font-semibold text-slate-900">{{ license.key }}</p>
                                    <p class="mt-1 font-semibold text-slate-800">{{ license.customerName }}</p>
                                    <p class="text-xs text-slate-500">{{ license.productName }}</p>
                                </td>
                                <td class="px-5 py-4">
                                    <span class="rounded-full px-2.5 py-1 text-xs font-semibold" :class="{
                                        'bg-emerald-100 text-emerald-800': license.statusTone === 'emerald',
                                        'bg-amber-100 text-amber-800': license.statusTone === 'amber',
                                        'bg-rose-100 text-rose-800': license.statusTone === 'rose',
                                    }">
                                        {{ license.statusLabel }}
                                    </span>
                                </td>
                                <td class="px-5 py-4 text-slate-700">{{ license.activationsCount }} / {{ license.maxActivations }}</td>
                                <td class="px-5 py-4 text-slate-600">{{ license.expiresAt || 'Never' }}</td>
                                <td class="px-5 py-4">
                                    <div class="flex flex-wrap gap-2">
                                        <button type="button" class="admin-action" @click="copyText(license.key)">Copy</button>
                                        <Link :href="license.editUrl" class="admin-action">Edit</Link>
                                        <button type="button" class="admin-action" @click="toggleStatus(license)">
                                            {{ license.status === 'active' ? 'Nonaktifkan' : 'Aktifkan' }}
                                        </button>
                                        <button type="button" class="admin-action text-rose-700" @click="removeLicense(license)">Hapus</button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="border-t border-slate-200 px-6 py-5">
                    <PaginationLinks :links="licenses.links" />
                </div>
            </div>
            </div>
        </section>

        <section v-if="isAdmin" v-show="activePanel === 'users'" class="mt-6">
            <div class="mb-6 grid gap-4 sm:grid-cols-3">
                <div class="admin-stat"><span>Total pengguna</span><strong>{{ users.length }}</strong></div>
                <div class="admin-stat"><span>Admin</span><strong>{{ users.filter((account) => account.role === 'admin').length }}</strong></div>
                <div class="admin-stat"><span>Penulis</span><strong>{{ users.filter((account) => account.role === 'writer').length }}</strong></div>
            </div>

            <div class="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
                <div class="rounded-2xl border border-slate-200 bg-white p-6">
                    <div class="flex items-start justify-between gap-4">
                        <div>
                            <h2 class="text-2xl font-semibold">{{ isUserEditMode ? 'Edit Pengguna' : 'Tambah Pengguna' }}</h2>
                            <p class="mt-2 text-sm text-slate-500">Admin memiliki akses penuh. Penulis hanya dapat mengirim tulisan.</p>
                        </div>
                        <Link v-if="isUserEditMode" href="/dashboard?section=users" class="text-sm font-semibold text-blue-700">Batal</Link>
                    </div>

                    <form class="mt-6 space-y-4" @submit.prevent="submitUser">
                        <div>
                            <label class="admin-label">Nama</label>
                            <input v-model="userForm.name" type="text" class="admin-input">
                            <p v-if="userForm.errors.name" class="admin-error">{{ userForm.errors.name }}</p>
                        </div>
                        <div>
                            <label class="admin-label">Email Login</label>
                            <input v-model="userForm.email" type="email" class="admin-input">
                            <p v-if="userForm.errors.email" class="admin-error">{{ userForm.errors.email }}</p>
                        </div>
                        <div>
                            <label class="admin-label">Level Akses</label>
                            <select v-model="userForm.role" class="admin-input">
                                <option value="admin">Admin</option>
                                <option value="writer">Penulis</option>
                            </select>
                            <p v-if="userForm.errors.role" class="admin-error">{{ userForm.errors.role }}</p>
                        </div>
                        <div>
                            <label class="admin-label">{{ isUserEditMode ? 'Password baru (opsional)' : 'Password' }}</label>
                            <input v-model="userForm.password" type="password" class="admin-input">
                            <p v-if="userForm.errors.password" class="admin-error">{{ userForm.errors.password }}</p>
                        </div>
                        <div>
                            <label class="admin-label">Konfirmasi Password</label>
                            <input v-model="userForm.password_confirmation" type="password" class="admin-input">
                        </div>
                        <button type="submit" class="w-full rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800" :disabled="userForm.processing">
                            {{ userForm.processing ? 'Menyimpan...' : (isUserEditMode ? 'Simpan Pengguna' : 'Tambah Pengguna') }}
                        </button>
                    </form>
                </div>

                <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    <div class="border-b border-slate-200 px-6 py-5">
                        <h2 class="text-2xl font-semibold">Daftar Pengguna</h2>
                        <p class="mt-1 text-sm text-slate-500">Kelola akun dan level akses dashboard.</p>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="min-w-full text-left text-sm">
                            <thead class="bg-slate-50 text-xs uppercase tracking-[0.12em] text-slate-500">
                                <tr>
                                    <th class="px-5 py-4">Pengguna</th>
                                    <th class="px-5 py-4">Level</th>
                                    <th class="px-5 py-4">Artikel</th>
                                    <th class="px-5 py-4">Aksi</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100">
                                <tr v-for="account in users" :key="account.id">
                                    <td class="px-5 py-4">
                                        <p class="font-semibold text-slate-900">{{ account.name }}</p>
                                        <p class="text-xs text-slate-500">{{ account.email }}</p>
                                    </td>
                                    <td class="px-5 py-4">
                                        <span class="rounded-full px-2.5 py-1 text-xs font-bold" :class="account.role === 'admin' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'">
                                            {{ account.roleLabel }}
                                        </span>
                                    </td>
                                    <td class="px-5 py-4 text-slate-600">{{ account.articlesCount }}</td>
                                    <td class="px-5 py-4">
                                        <div class="flex flex-wrap gap-2">
                                            <Link :href="account.editUrl" class="admin-action">Edit</Link>
                                            <button
                                                type="button"
                                                class="admin-action text-rose-700 disabled:opacity-40"
                                                :disabled="account.id === currentAuthor?.id || account.articlesCount > 0"
                                                @click="removeUser(account)"
                                            >
                                                Hapus
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </section>
    </AdminLayout>
</template>

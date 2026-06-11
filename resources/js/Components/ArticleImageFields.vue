<script setup>
import { router } from '@inertiajs/vue3';

const props = defineProps({
    modelValue: {
        type: Array,
        default: () => [],
    },
    existingImages: {
        type: Array,
        default: () => [],
    },
    errors: {
        type: Object,
        default: () => ({}),
    },
});

const emit = defineEmits(['update:modelValue', 'update:existingImages']);

const addFiles = (event) => {
    const additions = [...(event.target.files || [])].map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
        alt_text: '',
        caption: '',
        position_after_paragraph: 1,
    }));

    emit('update:modelValue', [...props.modelValue, ...additions]);
    event.target.value = '';
};

const updateNewImage = (index, field, value) => {
    const images = props.modelValue.map((image, imageIndex) => (
        imageIndex === index ? { ...image, [field]: value } : image
    ));
    emit('update:modelValue', images);
};

const removeNewImage = (index) => {
    const image = props.modelValue[index];
    if (image?.previewUrl) {
        URL.revokeObjectURL(image.previewUrl);
    }

    emit('update:modelValue', props.modelValue.filter((_, imageIndex) => imageIndex !== index));
};

const updateExistingImage = (index, field, value) => {
    const images = props.existingImages.map((image, imageIndex) => (
        imageIndex === index ? { ...image, [field]: value } : image
    ));
    emit('update:existingImages', images);
};

const removeExistingImage = (image) => {
    if (window.confirm('Hapus gambar ini dari artikel?')) {
        router.delete(image.destroyUrl, { preserveScroll: true });
    }
};

const fieldError = (group, index, field) => props.errors[`${group}.${index}.${field}`];
</script>

<template>
    <div class="rounded-xl border border-slate-200 p-4">
        <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
                <h3 class="font-semibold text-slate-900">Gambar Isi Artikel</h3>
                <p class="mt-1 text-xs leading-5 text-slate-500">
                    Tambahkan gambar langkah tutorial. Posisi 0 tampil sebelum isi, posisi 1 setelah paragraf pertama.
                </p>
            </div>
            <label class="cursor-pointer rounded-lg bg-blue-50 px-4 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100">
                Tambah gambar
                <input type="file" accept="image/*" multiple class="hidden" @change="addFiles">
            </label>
        </div>

        <div v-if="existingImages.length" class="mt-5 space-y-4">
            <p class="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Gambar tersimpan</p>
            <article
                v-for="(image, index) in existingImages"
                :key="image.id"
                class="grid gap-4 rounded-xl border border-slate-200 p-4 lg:grid-cols-[180px_minmax(0,1fr)]"
            >
                <img :src="image.url" :alt="image.alt_text" class="aspect-video w-full rounded-lg object-cover">
                <div class="space-y-3">
                    <input
                        :value="image.alt_text"
                        type="text"
                        class="admin-input"
                        placeholder="Alt text gambar"
                        @input="updateExistingImage(index, 'alt_text', $event.target.value)"
                    >
                    <input
                        :value="image.caption"
                        type="text"
                        class="admin-input"
                        placeholder="Caption gambar (opsional)"
                        @input="updateExistingImage(index, 'caption', $event.target.value)"
                    >
                    <div class="flex items-end gap-3">
                        <div class="max-w-48 flex-1">
                            <label class="admin-label">Setelah paragraf</label>
                            <input
                                :value="image.position_after_paragraph"
                                type="number"
                                min="0"
                                class="admin-input"
                                @input="updateExistingImage(index, 'position_after_paragraph', Number($event.target.value))"
                            >
                        </div>
                        <button type="button" class="rounded-lg px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50" @click="removeExistingImage(image)">
                            Hapus
                        </button>
                    </div>
                </div>
            </article>
        </div>

        <div v-if="modelValue.length" class="mt-5 space-y-4">
            <p class="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Gambar baru</p>
            <article
                v-for="(image, index) in modelValue"
                :key="`${image.file.name}-${index}`"
                class="grid gap-4 rounded-xl border border-blue-200 bg-blue-50/30 p-4 lg:grid-cols-[180px_minmax(0,1fr)]"
            >
                <img :src="image.previewUrl" alt="" class="aspect-video w-full rounded-lg object-cover">
                <div class="space-y-3">
                    <input
                        :value="image.alt_text"
                        type="text"
                        class="admin-input"
                        placeholder="Alt text gambar"
                        @input="updateNewImage(index, 'alt_text', $event.target.value)"
                    >
                    <p v-if="fieldError('article_images', index, 'alt_text')" class="admin-error">
                        {{ fieldError('article_images', index, 'alt_text') }}
                    </p>
                    <input
                        :value="image.caption"
                        type="text"
                        class="admin-input"
                        placeholder="Caption gambar (opsional)"
                        @input="updateNewImage(index, 'caption', $event.target.value)"
                    >
                    <div class="flex items-end gap-3">
                        <div class="max-w-48 flex-1">
                            <label class="admin-label">Setelah paragraf</label>
                            <input
                                :value="image.position_after_paragraph"
                                type="number"
                                min="0"
                                class="admin-input"
                                @input="updateNewImage(index, 'position_after_paragraph', Number($event.target.value))"
                            >
                        </div>
                        <button type="button" class="rounded-lg px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50" @click="removeNewImage(index)">
                            Batal
                        </button>
                    </div>
                    <p v-if="fieldError('article_images', index, 'file')" class="admin-error">
                        {{ fieldError('article_images', index, 'file') }}
                    </p>
                </div>
            </article>
        </div>
    </div>
</template>

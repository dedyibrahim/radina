<script setup>
import { computed } from 'vue';

const props = defineProps({
    content: {
        type: String,
        default: '',
    },
    images: {
        type: Array,
        default: () => [],
    },
});

const emit = defineEmits(['zoom']);

const blocks = computed(() => {
    const result = [];
    const imagesByPosition = new Map();

    [...props.images]
        .sort((first, second) => first.positionAfterParagraph - second.positionAfterParagraph || first.id - second.id)
        .forEach((image) => {
            const position = Math.max(0, Number(image.positionAfterParagraph || 0));
            imagesByPosition.set(position, [...(imagesByPosition.get(position) || []), image]);
        });

    const appendImages = (position) => {
        (imagesByPosition.get(position) || []).forEach((image) => {
            result.push({ type: 'image', image, key: `image-${image.id}` });
        });
        imagesByPosition.delete(position);
    };

    appendImages(0);

    const paragraphPattern = /<\/p\s*>/gi;
    let cursor = 0;
    let paragraphNumber = 0;
    let match;

    while ((match = paragraphPattern.exec(props.content)) !== null) {
        const end = match.index + match[0].length;
        result.push({
            type: 'html',
            html: props.content.slice(cursor, end),
            key: `content-${cursor}`,
        });
        cursor = end;
        paragraphNumber += 1;
        appendImages(paragraphNumber);
    }

    if (cursor < props.content.length) {
        result.push({
            type: 'html',
            html: props.content.slice(cursor),
            key: `content-${cursor}`,
        });
    }

    [...imagesByPosition.values()].flat().forEach((image) => {
        result.push({ type: 'image', image, key: `image-${image.id}` });
    });

    return result;
});

const handleContentClick = (event) => {
    const image = event.target.closest('img');

    if (!image) {
        return;
    }

    emit('zoom', {
        url: image.currentSrc || image.src,
        altText: image.alt || '',
        caption: image.getAttribute('title') || '',
    });
};
</script>

<template>
    <div class="news-prose" @click="handleContentClick">
        <template v-for="block in blocks" :key="block.key">
            <div v-if="block.type === 'html'" v-html="block.html" />
            <figure v-else class="my-7">
                <button
                    type="button"
                    class="group block w-full overflow-hidden rounded-2xl bg-slate-100 text-left"
                    @click="$emit('zoom', block.image)"
                >
                    <img
                        :src="block.image.url"
                        :alt="block.image.altText"
                        loading="lazy"
                        class="max-h-[680px] w-full object-contain transition duration-300 group-hover:scale-[1.01]"
                    >
                </button>
                <figcaption v-if="block.image.caption" class="mt-3 text-center text-sm leading-6 text-slate-500">
                    {{ block.image.caption }}
                </figcaption>
            </figure>
        </template>
    </div>
</template>

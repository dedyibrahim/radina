<?php

namespace App\Support;

class ArticleContentFormatter
{
    public static function format(?string $content): string
    {
        if ($content === null || trim($content) === '') {
            return '';
        }

        if (strip_tags($content) !== $content) {
            return $content;
        }

        $normalizedContent = str_replace(
            ['\\r\\n', '\\n', '\\r', "\r\n", "\r"],
            ["\n", "\n", "\n", "\n", "\n"],
            trim($content)
        );

        $paragraphs = preg_split('/\n{2,}/', $normalizedContent) ?: [];

        return collect($paragraphs)
            ->map(fn (string $paragraph): string => sprintf(
                '<p>%s</p>',
                nl2br(htmlspecialchars(trim($paragraph), ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'), false)
            ))
            ->filter(fn (string $paragraph): bool => $paragraph !== '<p></p>')
            ->implode("\n");
    }
}

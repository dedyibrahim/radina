<?php

namespace Tests\Unit;

use App\Support\ArticleContentFormatter;
use PHPUnit\Framework\TestCase;

class ArticleContentFormatterTest extends TestCase
{
    public function test_plain_text_is_converted_to_paragraphs_and_line_breaks(): void
    {
        $content = "Paragraf pertama.\nBaris kedua.\n\nParagraf berikutnya.";

        $this->assertSame(
            "<p>Paragraf pertama.<br>\nBaris kedua.</p>\n<p>Paragraf berikutnya.</p>",
            ArticleContentFormatter::format($content)
        );
    }

    public function test_literal_newline_sequences_are_converted_to_paragraphs(): void
    {
        $content = 'Paragraf pertama.\\n\\nParagraf kedua.';

        $this->assertSame(
            "<p>Paragraf pertama.</p>\n<p>Paragraf kedua.</p>",
            ArticleContentFormatter::format($content)
        );
    }

    public function test_existing_html_is_returned_without_changes(): void
    {
        $content = '<h2>Judul</h2><p>Isi <strong>berita</strong>.</p>';

        $this->assertSame($content, ArticleContentFormatter::format($content));
    }

    public function test_plain_text_is_escaped_before_rendering(): void
    {
        $this->assertSame(
            '<p>Harga 2 &lt; 3 &amp; aman.</p>',
            ArticleContentFormatter::format('Harga 2 < 3 & aman.')
        );
    }
}

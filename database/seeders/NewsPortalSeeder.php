<?php

namespace Database\Seeders;

use App\Models\NewsArticle;
use App\Models\NewsCategory;
use App\Models\NewsTag;
use App\Models\User;
use App\Models\WriterEarning;
use App\Services\LegacyNewsSqlParser;
use App\Services\WriterPaymentService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use RuntimeException;

class NewsPortalSeeder extends Seeder
{
    public function run(): void
    {
        $sqlPath = database_path('import/portal_berita.sql');

        if (! File::exists($sqlPath)) {
            throw new RuntimeException("Sumber berita tidak ditemukan: {$sqlPath}");
        }

        $sql = File::get($sqlPath);
        $parser = app(LegacyNewsSqlParser::class);
        $categories = $parser->table($sql, 'categories');
        $posts = $parser->table($sql, 'posts');
        $tags = $parser->table($sql, 'tags');
        $postTags = collect($parser->table($sql, 'post_tag'))->groupBy('post_id');
        $featuredPostIds = collect($parser->table($sql, 'breaking_news'))->pluck('post_id');
        $authors = $this->seedAuthors();
        $adminId = User::where('role', User::ROLE_ADMIN)->value('id');

        $this->removePreviousDummyArticles();

        $categoryModels = collect($categories)
            ->filter(fn (array $category) => $category['deleted_at'] === null)
            ->mapWithKeys(function (array $category): array {
                $name = $this->cleanPlainText($category['name']);
                $model = NewsCategory::updateOrCreate(
                    ['slug' => $category['slug']],
                    [
                        'name' => $name,
                        'name_en' => $name,
                        'description' => "Berita, informasi, dan pembaruan seputar {$name}.",
                        'description_en' => "News, information, and updates about {$name}.",
                        'accent_color' => $this->categoryColor($category['slug']),
                        'cover_image_url' => $this->categoryCover($category['slug']),
                        'seo_title' => "{$name} - ".config('news.name'),
                        'seo_title_en' => "{$name} - ".config('news.name'),
                        'seo_description' => "Kumpulan berita terbaru dalam kategori {$name}.",
                        'seo_description_en' => "The latest stories in the {$name} category.",
                    ]
                );

                return [(int) $category['id'] => $model];
            });

        $tagModels = collect($tags)->mapWithKeys(function (array $tag): array {
            $name = $this->cleanPlainText($tag['name']);
            $model = NewsTag::updateOrCreate(
                ['slug' => $tag['slug']],
                [
                    'name' => $name,
                    'name_en' => $name,
                    'description' => "Kumpulan berita dengan topik {$name}.",
                    'description_en' => "A collection of stories about {$name}.",
                ]
            );

            return [(int) $tag['id'] => $model];
        });

        collect($posts)
            ->filter(fn (array $post) => $post['deleted_at'] === null)
            ->filter(fn (array $post) => strcasecmp((string) $post['post_status'], 'Published') === 0)
            ->sortBy('id')
            ->values()
            ->each(function (array $post, int $index) use (
                $authors,
                $adminId,
                $categoryModels,
                $tagModels,
                $postTags,
                $featuredPostIds
            ): void {
                $category = $categoryModels->get((int) $post['categories_id']);
                if (! $category) {
                    return;
                }

                $author = $authors->first();
                $title = $this->cleanPlainText($post['post_title']);
                $content = $this->cleanContent($post['post_content']);
                $excerpt = $this->cleanExcerpt($post['post_teaser'], $content);
                $publishedAt = Carbon::parse($post['created_at'] ?: now());
                $coverImage = '/images/news-imported/'.basename(str_replace('\\', '/', $post['post_image']));
                $imageAlt = $this->cleanPlainText($post['post_image_description']);

                $article = NewsArticle::updateOrCreate(
                    ['slug' => $post['slug']],
                    [
                        'category_id' => $category->id,
                        'user_id' => $author->id,
                        'title' => $title,
                        'title_en' => null,
                        'excerpt' => $excerpt,
                        'excerpt_en' => null,
                        'content' => $content,
                        'content_en' => null,
                        'cover_image_url' => $coverImage,
                        'cover_image_alt' => $imageAlt ?: $title,
                        'cover_image_alt_en' => null,
                        'status' => NewsArticle::STATUS_PUBLISHED,
                        'editorial_status' => NewsArticle::EDITORIAL_APPROVED,
                        'fact_check_status' => NewsArticle::FACT_VERIFIED,
                        'review_note' => 'Artikel sumber telah dimigrasikan dan ditinjau untuk Radina News.',
                        'approved_by' => $adminId,
                        'approved_at' => $publishedAt,
                        'fact_checked_by' => $adminId,
                        'fact_checked_at' => $publishedAt,
                        'is_featured' => $featuredPostIds->contains((int) $post['id']),
                        'reading_time' => max(2, (int) ceil(str_word_count(strip_tags($content)) / 180)),
                        'views_count' => 800 + ((int) $post['id'] * 173),
                        'published_at' => $publishedAt,
                        'seo_title' => Str::limit($title.' | '.config('news.name'), 160, ''),
                        'seo_title_en' => null,
                        'seo_description' => Str::limit($excerpt, 255, ''),
                        'seo_description_en' => null,
                        'seo_keywords' => implode(', ', array_filter([
                            $category->name,
                            'berita teknologi',
                            'radina news',
                        ])),
                        'seo_keywords_en' => null,
                        'og_image_url' => $coverImage,
                        'created_at' => $publishedAt,
                        'updated_at' => Carbon::parse($post['updated_at'] ?: $publishedAt),
                    ]
                );

                $articleTagIds = collect($postTags->get((int) $post['id'], []))
                    ->map(fn (array $relation) => $tagModels->get((int) $relation['tag_id'])?->id)
                    ->filter()
                    ->values();

                if ($articleTagIds->isEmpty()) {
                    $categoryTag = NewsTag::firstOrCreate(
                        ['slug' => $category->slug],
                        [
                            'name' => $category->name,
                            'name_en' => $category->name_en,
                            'description' => "Kumpulan berita {$category->name}.",
                            'description_en' => "A collection of {$category->name_en} stories.",
                        ]
                    );
                    $articleTagIds->push($categoryTag->id);
                }

                $article->tags()->sync($articleTagIds->all());
                $earning = app(WriterPaymentService::class)->creditArticleIfEligible($article);

                if ($earning && $earning->user_id !== $article->user_id) {
                    $earning->update(['user_id' => $article->user_id]);
                }
            });

        $this->removeUnusedPreviousCategories();
    }

    private function seedAuthors()
    {
        return collect([
            User::firstOrCreate(
                ['email' => 'shara@radina.net'],
                [
                    'name' => 'Shara',
                    'role' => User::ROLE_WRITER,
                    'article_fee' => 25000,
                    'password' => Hash::make('Editor@12345'),
                    'email_verified_at' => now(),
                ]
            ),
        ])->map(function (User $author): User {
            if (! $author->isWriter()) {
                $author->forceFill(['role' => User::ROLE_WRITER])->save();
            }

            return $author;
        });
    }

    private function removePreviousDummyArticles(): void
    {
        $articleIds = NewsArticle::query()
            ->where('cover_image_url', 'like', '/images/news-dummy/%')
            ->pluck('id');

        if ($articleIds->isEmpty()) {
            return;
        }

        WriterEarning::whereIn('article_id', $articleIds)->delete();
        NewsArticle::whereKey($articleIds)->delete();
    }

    private function removeUnusedPreviousCategories(): void
    {
        NewsCategory::query()
            ->whereIn('slug', ['teknologi', 'bisnis', 'startup', 'data-ai', 'infrastruktur', 'gaya-hidup'])
            ->doesntHave('articles')
            ->delete();
    }

    private function cleanExcerpt(?string $excerpt, string $content): string
    {
        $excerpt = $this->cleanPlainText((string) $excerpt);
        $excerpt = preg_replace('/^[\s\-–—:]+/u', '', $excerpt) ?? $excerpt;

        return Str::limit($excerpt ?: strip_tags($content), 1000, '');
    }

    private function cleanContent(string $content): string
    {
        $content = $this->fixEncoding($content);
        $content = preg_replace('/Al\s*Fatih\s*Dev(?:\.com)?/iu', '', $content) ?? $content;
        $content = preg_replace('/<strong>\s*<\/strong>\s*(?:&ndash;|&#8211;|–|—|-)?\s*/iu', '', $content) ?? $content;
        $content = preg_replace('/<\/?ins\b[^>]*>/iu', '', $content) ?? $content;
        $content = preg_replace('/\sdata-(?:ad|adsbygoogle)[\w-]*="[^"]*"/iu', '', $content) ?? $content;
        $content = str_replace(
            ['class="google-auto-placed ap_container"', 'class="google-auto-placed"'],
            '',
            $content
        );
        $content = preg_replace(
            '#href="(?:\.\./)+posts/([^"]+)"#iu',
            'href="/berita/$1"',
            $content
        ) ?? $content;
        $content = preg_replace('#https?://(?:www\.)?alfatihdev\.com[^\s"<]*#iu', '', $content) ?? $content;
        $content = preg_replace('/<div[^>]*>\s*<\/div>/iu', '', $content) ?? $content;
        $content = preg_replace('/<p[^>]*>\s*<\/p>/iu', '', $content) ?? $content;

        return trim($content);
    }

    private function cleanPlainText(?string $text): string
    {
        $text = html_entity_decode($this->fixEncoding((string) $text), ENT_QUOTES | ENT_HTML5, 'UTF-8');
        $text = preg_replace('/Al\s*Fatih\s*Dev(?:\.com)?/iu', '', $text) ?? $text;
        $text = preg_replace('/\s+/u', ' ', strip_tags($text)) ?? $text;

        return trim($text);
    }

    private function fixEncoding(string $value): string
    {
        return strtr($value, [
            'â€“' => '–',
            'â€”' => '—',
            'â€™' => '’',
            'â€œ' => '“',
            'â€' => '”',
            'Â ' => ' ',
            'Â' => '',
        ]);
    }

    private function categoryColor(string $slug): string
    {
        return match ($slug) {
            'berita' => '#1D4ED8',
            'internet' => '#0F766E',
            'gadget' => '#7C3AED',
            'sains' => '#0369A1',
            'game' => '#B45309',
            'tutorial' => '#475569',
            'video' => '#BE123C',
            default => '#2563EB',
        };
    }

    private function categoryCover(string $slug): string
    {
        return "/images/category-covers/{$slug}.webp";
    }
}

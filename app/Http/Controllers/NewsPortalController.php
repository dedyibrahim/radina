<?php

namespace App\Http\Controllers;

use App\Models\NewsArticle;
use App\Models\NewsCategory;
use App\Models\NewsTag;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Inertia\Inertia;
use Inertia\Response;

class NewsPortalController extends Controller
{
    public function home(): Response
    {
        $isEnglish = app()->isLocale('en');
        $hero = $this->publishedArticles()->featured()->first()
            ?? $this->publishedArticles()->first();

        $heroId = $hero?->id;

        $editorsPick = $this->publishedArticles()
            ->when($heroId, fn ($query) => $query->whereKeyNot($heroId))
            ->featured()
            ->take(4)
            ->get();

        $latest = $this->publishedArticles()
            ->when($heroId, fn ($query) => $query->whereKeyNot($heroId))
            ->take(8)
            ->get();

        $trending = $this->publishedArticles()
            ->orderByDesc('views_count')
            ->take(5)
            ->get();

        $breaking = $this->publishedArticles()
            ->take(6)
            ->get();

        $categories = NewsCategory::query()
            ->withCount(['articles' => fn ($query) => $query->published()])
            ->orderByDesc('articles_count')
            ->take(6)
            ->get();

        $tags = NewsTag::query()
            ->withCount(['articles' => fn ($query) => $query->published()])
            ->orderByDesc('articles_count')
            ->take(12)
            ->get();

        return Inertia::render('News/Home', [
            'seo' => $this->buildSeo([
                'title' => $isEnglish ? 'Latest News and In-Depth Reports' : 'Berita Terkini dan Laporan Mendalam',
                'description' => $isEnglish
                    ? 'Technology, business, AI, startup, and digital infrastructure news from Indonesia in a modern, search-friendly experience.'
                    : 'Berita teknologi, bisnis, AI, startup, dan infrastruktur digital Indonesia dengan tampilan modern dan performa SEO yang kuat.',
                'url' => route('news.home'),
                'keywords' => $isEnglish
                    ? 'news portal, technology news, indonesia startups, digital business, AI indonesia'
                    : 'portal berita, berita teknologi, startup indonesia, berita bisnis digital, AI indonesia',
                'jsonLd' => [
                    $this->websiteSchema(),
                    $this->organizationSchema(),
                ],
            ]),
            'hero' => $hero ? $this->transformArticle($hero, true) : null,
            'breaking' => $breaking->map(fn (NewsArticle $article) => $this->transformHeadline($article))->all(),
            'editorsPick' => $editorsPick->map(fn (NewsArticle $article) => $this->transformArticle($article))->all(),
            'latest' => $latest->map(fn (NewsArticle $article) => $this->transformArticle($article))->all(),
            'trending' => $trending->map(fn (NewsArticle $article) => $this->transformHeadline($article, true))->all(),
            'categories' => $categories->map(function (NewsCategory $category): array {
                $spotlight = $category->articles()
                    ->with(['category', 'author', 'tags'])
                    ->published()
                    ->latest('published_at')
                    ->first();

                return [
                    'name' => $this->localizedField($category, 'name'),
                    'slug' => $category->slug,
                    'description' => $this->localizedField($category, 'description'),
                    'accentColor' => $category->accent_color,
                    'articlesCount' => $category->articles_count,
                    'url' => route('news.category', $category),
                    'spotlight' => $spotlight ? $this->transformHeadline($spotlight) : null,
                ];
            })->all(),
            'popularTags' => $tags->map(fn (NewsTag $tag) => $this->transformTag($tag, true))->all(),
        ]);
    }

    public function index(Request $request): Response
    {
        $isEnglish = app()->isLocale('en');
        $query = trim((string) $request->query('q', ''));

        $articles = $this->publishedArticles()
            ->search($query)
            ->paginate(9)
            ->withQueryString();

        return Inertia::render('News/Archive', [
            'seo' => $this->buildSeo([
                'title' => $query !== ''
                    ? ($isEnglish ? "News search: {$query}" : "Pencarian berita: {$query}")
                    : ($isEnglish ? 'Latest News Archive' : 'Arsip Berita Terkini'),
                'description' => $query !== ''
                    ? ($isEnglish
                        ? "News search results for {$query} on {$this->siteName()}."
                        : "Hasil pencarian berita untuk kata kunci {$query} di {$this->siteName()}.")
                    : ($isEnglish
                        ? 'Latest stories, in-depth analysis, and selected coverage from Radina News.'
                        : 'Kumpulan berita terbaru, analisis mendalam, dan liputan pilihan Radina News.'),
                'url' => $query !== '' ? route('news.index', ['q' => $query]) : route('news.index'),
                'keywords' => $query !== '' ? "pencarian berita {$query}, portal berita" : 'arsip berita, berita terbaru, berita bisnis, berita teknologi',
                'robots' => $query !== '' ? 'noindex,follow' : 'index,follow',
                'jsonLd' => [
                    $this->websiteSchema($query !== '' ? "Hasil pencarian {$query}" : 'Arsip Berita'),
                ],
            ]),
            'pageTitle' => $query !== ''
                ? ($isEnglish ? "Results for \"{$query}\"" : "Hasil untuk \"{$query}\"")
                : ($isEnglish ? 'News Archive' : 'Arsip Berita'),
            'pageDescription' => $query !== ''
                ? ($isEnglish
                    ? 'Use this archive to find the stories most relevant to your search.'
                    : 'Gunakan arsip ini untuk menelusuri artikel yang paling relevan dengan topik yang Anda cari.')
                : ($isEnglish
                    ? 'Our latest coverage, organized by publication time, topic, and popularity.'
                    : 'Semua liputan terbaru kami tersusun rapi berdasarkan waktu terbit, tema, dan popularitas.'),
            'filters' => [
                'q' => $query,
            ],
            'articles' => $this->transformPaginator($articles),
            'highlights' => $this->publishedArticles()->featured()->take(3)->get()->map(fn (NewsArticle $article) => $this->transformHeadline($article, true))->all(),
            'trending' => $this->publishedArticles()->orderByDesc('views_count')->take(5)->get()->map(fn (NewsArticle $article) => $this->transformHeadline($article, true))->all(),
        ]);
    }

    public function category(NewsCategory $category): Response
    {
        $isEnglish = app()->isLocale('en');
        $categoryName = $this->localizedField($category, 'name');
        $categoryDescription = $this->localizedField($category, 'description');
        $articles = $category->articles()
            ->with(['category', 'author', 'tags'])
            ->published()
            ->latest('published_at')
            ->paginate(9)
            ->withQueryString();

        return Inertia::render('News/Archive', [
            'seo' => $this->buildSeo([
                'title' => $this->localizedField($category, 'seo_title')
                    ?: ($isEnglish ? "Category {$categoryName}" : "Kategori {$categoryName}"),
                'description' => $this->localizedField($category, 'seo_description') ?: $categoryDescription,
                'url' => route('news.category', $category),
                'keywords' => $isEnglish
                    ? "{$categoryName}, {$categoryName} news, {$categoryName} news portal"
                    : "{$categoryName}, berita {$categoryName}, portal berita {$categoryName}",
                'jsonLd' => [
                    $this->collectionSchema($categoryName, route('news.category', $category)),
                ],
            ]),
            'pageTitle' => $categoryName,
            'pageDescription' => $categoryDescription,
            'filters' => [
                'q' => '',
            ],
            'context' => [
                'label' => $isEnglish ? 'Category' : 'Kategori',
                'value' => $categoryName,
            ],
            'articles' => $this->transformPaginator($articles),
            'highlights' => $this->publishedArticles()->whereBelongsTo($category, 'category')->featured()->take(3)->get()->map(fn (NewsArticle $article) => $this->transformHeadline($article, true))->all(),
            'trending' => $this->publishedArticles()->orderByDesc('views_count')->take(5)->get()->map(fn (NewsArticle $article) => $this->transformHeadline($article, true))->all(),
        ]);
    }

    public function tag(NewsTag $tag): Response
    {
        $isEnglish = app()->isLocale('en');
        $tagName = $this->localizedField($tag, 'name');
        $tagDescription = $this->localizedField($tag, 'description');
        $articles = $tag->articles()
            ->with(['category', 'author', 'tags'])
            ->published()
            ->latest('published_at')
            ->paginate(9)
            ->withQueryString();

        return Inertia::render('News/Archive', [
            'seo' => $this->buildSeo([
                'title' => $isEnglish ? "Topic {$tagName}" : "Topik {$tagName}",
                'description' => $tagDescription
                    ?: ($isEnglish ? "A collection of stories about {$tagName}." : "Kumpulan berita dengan topik {$tagName}."),
                'url' => route('news.tag', $tag),
                'keywords' => $isEnglish
                    ? "{$tagName}, {$tagName} news, {$tagName} topic"
                    : "{$tagName}, berita {$tagName}, topik {$tagName}",
                'jsonLd' => [
                    $this->collectionSchema($tag->name, route('news.tag', $tag)),
                ],
            ]),
            'pageTitle' => $tagName,
            'pageDescription' => $tagDescription
                ?: ($isEnglish ? "A collection of stories tagged {$tagName}." : "Kumpulan artikel dengan tag {$tagName}."),
            'filters' => [
                'q' => '',
            ],
            'context' => [
                'label' => $isEnglish ? 'Topic' : 'Topik',
                'value' => $tagName,
            ],
            'articles' => $this->transformPaginator($articles),
            'highlights' => $this->publishedArticles()->whereHas('tags', fn ($query) => $query->whereKey($tag->id))->featured()->take(3)->get()->map(fn (NewsArticle $article) => $this->transformHeadline($article, true))->all(),
            'trending' => $this->publishedArticles()->orderByDesc('views_count')->take(5)->get()->map(fn (NewsArticle $article) => $this->transformHeadline($article, true))->all(),
        ]);
    }

    public function show(NewsArticle $article): Response
    {
        abort_unless($article->isPublished(), HttpResponse::HTTP_NOT_FOUND);

        $article->increment('views_count');
        $article->refresh()->load(['category', 'author', 'tags']);

        $related = $this->publishedArticles()
            ->whereKeyNot($article->id)
            ->where(function ($query) use ($article): void {
                $query
                    ->where('category_id', $article->category_id)
                    ->orWhereHas('tags', fn ($tagQuery) => $tagQuery->whereIn('news_tags.id', $article->tags->pluck('id')));
            })
            ->take(4)
            ->get();

        return Inertia::render('News/ArticleShow', [
            'seo' => $this->buildSeo([
                'title' => $this->localizedField($article, 'seo_title') ?: $this->localizedField($article, 'title'),
                'description' => $this->localizedField($article, 'seo_description') ?: $this->localizedField($article, 'excerpt'),
                'url' => route('news.show', $article),
                'image' => $this->absoluteUrl($article->og_image_url ?: $article->cover_image_url),
                'keywords' => $this->localizedField($article, 'seo_keywords'),
                'type' => 'article',
                'publishedAt' => optional($article->published_at)->toIso8601String(),
                'updatedAt' => optional($article->updated_at)->toIso8601String(),
                'jsonLd' => [
                    $this->organizationSchema(),
                    $this->newsArticleSchema($article),
                ],
            ]),
            'article' => $this->transformArticleDetail($article),
            'related' => $related->map(fn (NewsArticle $item) => $this->transformArticle($item))->all(),
            'trending' => $this->publishedArticles()->orderByDesc('views_count')->take(5)->get()->map(fn (NewsArticle $item) => $this->transformHeadline($item, true))->all(),
        ]);
    }

    public function about(): Response
    {
        $isEnglish = app()->isLocale('en');

        return Inertia::render('News/About', [
            'seo' => $this->buildSeo([
                'title' => $isEnglish ? 'About Radina News' : 'Tentang Radina News',
                'description' => $isEnglish
                    ? 'Learn about Radina News, our coverage focus, and our commitment to clear and responsible information.'
                    : 'Mengenal Radina News, fokus liputan, dan komitmen kami dalam menyajikan informasi yang jelas serta bertanggung jawab.',
                'url' => route('news.about'),
                'keywords' => 'tentang radina news, portal berita, media digital, informasi terkini',
                'jsonLd' => [
                    $this->organizationSchema(),
                ],
            ]),
            'stats' => [
                ['label' => $isEnglish ? 'Published stories' : 'Artikel terbit', 'value' => NewsArticle::published()->count()],
                ['label' => $isEnglish ? 'Active categories' : 'Kategori aktif', 'value' => NewsCategory::count()],
                ['label' => $isEnglish ? 'Curated topics' : 'Topik terkurasi', 'value' => NewsTag::count()],
            ],
        ]);
    }

    public function sitemap(): HttpResponse
    {
        $urls = collect([
            [
                'loc' => route('news.home'),
                'changefreq' => 'hourly',
                'priority' => '1.0',
                'lastmod' => now()->toDateString(),
            ],
            [
                'loc' => route('news.index'),
                'changefreq' => 'hourly',
                'priority' => '0.9',
                'lastmod' => now()->toDateString(),
            ],
            [
                'loc' => route('news.about'),
                'changefreq' => 'monthly',
                'priority' => '0.6',
                'lastmod' => now()->toDateString(),
            ],
            [
                'loc' => route('company.profile'),
                'changefreq' => 'monthly',
                'priority' => '0.5',
                'lastmod' => now()->toDateString(),
            ],
        ])
            ->merge(
                NewsCategory::query()->get()->map(fn (NewsCategory $category) => [
                    'loc' => route('news.category', $category),
                    'changefreq' => 'daily',
                    'priority' => '0.8',
                    'lastmod' => optional($category->updated_at)->toDateString() ?: now()->toDateString(),
                ])
            )
            ->merge(
                NewsTag::query()->take(30)->get()->map(fn (NewsTag $tag) => [
                    'loc' => route('news.tag', $tag),
                    'changefreq' => 'daily',
                    'priority' => '0.7',
                    'lastmod' => optional($tag->updated_at)->toDateString() ?: now()->toDateString(),
                ])
            )
            ->merge(
                NewsArticle::query()->published()->latest('published_at')->take(200)->get()->map(fn (NewsArticle $article) => [
                    'loc' => route('news.show', $article),
                    'changefreq' => 'weekly',
                    'priority' => $article->is_featured ? '0.9' : '0.8',
                    'lastmod' => optional($article->updated_at)->toDateString() ?: now()->toDateString(),
                ])
            )
            ->all();

        return response()
            ->view('sitemap', compact('urls'))
            ->header('Content-Type', 'application/xml; charset=UTF-8');
    }

    public function feed(): HttpResponse
    {
        $articles = $this->publishedArticles()->take(20)->get();

        return response()
            ->view('feed', [
                'articles' => $articles,
                'siteName' => $this->siteName(),
                'siteDescription' => config('news.description'),
            ])
            ->header('Content-Type', 'application/rss+xml; charset=UTF-8');
    }

    public function robots(): HttpResponse
    {
        $content = implode("\n", [
            'User-agent: *',
            'Allow: /',
            'Disallow: /dashboard',
            'Disallow: /profile',
            'Disallow: /licenses',
            'Sitemap: '.route('sitemap'),
        ]);

        return response($content, HttpResponse::HTTP_OK, [
            'Content-Type' => 'text/plain; charset=UTF-8',
        ]);
    }

    private function publishedArticles()
    {
        return NewsArticle::query()
            ->with(['category', 'author', 'tags'])
            ->published()
            ->latest('published_at');
    }

    private function transformPaginator(LengthAwarePaginator $paginator): array
    {
        return [
            'data' => $paginator->getCollection()->map(fn (NewsArticle $article) => $this->transformArticle($article))->all(),
            'meta' => [
                'currentPage' => $paginator->currentPage(),
                'lastPage' => $paginator->lastPage(),
                'perPage' => $paginator->perPage(),
                'total' => $paginator->total(),
                'from' => $paginator->firstItem(),
                'to' => $paginator->lastItem(),
            ],
            'links' => $paginator->linkCollection()->map(fn (array $link) => [
                'url' => $link['url'],
                'label' => strip_tags($link['label']),
                'active' => $link['active'],
            ])->all(),
        ];
    }

    private function transformArticle(NewsArticle $article, bool $hero = false): array
    {
        return [
            'title' => $this->localizedField($article, 'title'),
            'slug' => $article->slug,
            'excerpt' => $this->localizedField($article, 'excerpt'),
            'url' => route('news.show', $article),
            'coverImage' => $article->cover_image_url,
            'coverAlt' => $this->localizedField($article, 'cover_image_alt'),
            'publishedAt' => optional($article->published_at)->toIso8601String(),
            'publishedLabel' => optional($article->published_at)->translatedFormat('d M Y'),
            'readingTime' => $article->reading_time,
            'viewsCount' => $article->views_count,
            'isFeatured' => $article->is_featured,
            'category' => $article->category ? [
                'name' => $this->localizedField($article->category, 'name'),
                'slug' => $article->category->slug,
                'url' => route('news.category', $article->category),
                'accentColor' => $article->category->accent_color,
            ] : null,
            'author' => $article->author ? [
                'name' => $article->author->name,
            ] : null,
            'tags' => $article->tags->take($hero ? 4 : 3)->map(fn (NewsTag $tag) => $this->transformTag($tag))->all(),
        ];
    }

    private function transformArticleDetail(NewsArticle $article): array
    {
        return [
            ...$this->transformArticle($article, true),
            'content' => $this->localizedField($article, 'content'),
            'seoDescription' => $this->localizedField($article, 'seo_description'),
            'seoKeywords' => $this->localizedField($article, 'seo_keywords'),
        ];
    }

    private function transformHeadline(NewsArticle $article, bool $withMetrics = false): array
    {
        return [
            'title' => $this->localizedField($article, 'title'),
            'url' => route('news.show', $article),
            'category' => $article->category ? $this->localizedField($article->category, 'name') : null,
            'categoryUrl' => $article->category ? route('news.category', $article->category) : null,
            'publishedLabel' => optional($article->published_at)->translatedFormat('d M Y'),
            'readingTime' => $article->reading_time,
            'viewsCount' => $withMetrics ? $article->views_count : null,
        ];
    }

    private function transformTag(NewsTag $tag, bool $withCount = false): array
    {
        return [
            'name' => $this->localizedField($tag, 'name'),
            'slug' => $tag->slug,
            'url' => route('news.tag', $tag),
            'count' => $withCount ? $tag->articles_count : null,
        ];
    }

    private function buildSeo(array $meta): array
    {
        $defaults = [
            'title' => $this->siteName(),
            'description' => config('news.description'),
            'url' => route('news.home'),
            'image' => $this->absoluteUrl(config('news.default_image')),
            'type' => 'website',
            'keywords' => 'portal berita, berita teknologi, berita bisnis, berita startup',
            'robots' => 'index,follow',
            'publishedAt' => null,
            'updatedAt' => null,
            'jsonLd' => [],
        ];

        return array_merge($defaults, $meta);
    }

    private function siteName(): string
    {
        return config('news.name');
    }

    private function absoluteUrl(?string $value): ?string
    {
        if (! $value) {
            return $value;
        }

        if (str_starts_with($value, 'http://') || str_starts_with($value, 'https://')) {
            return $value;
        }

        return url($value);
    }

    private function localizedField(object $model, string $field): mixed
    {
        if (app()->isLocale('en')) {
            $englishField = "{$field}_en";

            if (! empty($model->{$englishField})) {
                return $model->{$englishField};
            }
        }

        return $model->{$field};
    }

    private function websiteSchema(?string $headline = null): array
    {
        return [
            '@context' => 'https://schema.org',
            '@type' => 'WebSite',
            'name' => $this->siteName(),
            'url' => route('news.home'),
            'description' => config('news.description'),
            'potentialAction' => [
                '@type' => 'SearchAction',
                'target' => route('news.index').'?q={search_term_string}',
                'query-input' => 'required name=search_term_string',
            ],
            'headline' => $headline,
        ];
    }

    private function organizationSchema(): array
    {
        return [
            '@context' => 'https://schema.org',
            '@type' => 'NewsMediaOrganization',
            'name' => $this->siteName(),
            'url' => route('news.home'),
            'logo' => $this->absoluteUrl(config('news.default_image')),
            'sameAs' => array_values(array_filter(config('news.socials', []))),
            'address' => [
                '@type' => 'PostalAddress',
                'streetAddress' => config('news.address'),
                'addressCountry' => 'ID',
            ],
        ];
    }

    private function collectionSchema(string $name, string $url): array
    {
        return [
            '@context' => 'https://schema.org',
            '@type' => 'CollectionPage',
            'name' => $name,
            'url' => $url,
            'isPartOf' => route('news.home'),
        ];
    }

    private function newsArticleSchema(NewsArticle $article): array
    {
        return [
            '@context' => 'https://schema.org',
            '@type' => 'NewsArticle',
            'headline' => $this->localizedField($article, 'title'),
            'description' => $this->localizedField($article, 'seo_description')
                ?: $this->localizedField($article, 'excerpt'),
            'datePublished' => optional($article->published_at)->toIso8601String(),
            'dateModified' => optional($article->updated_at)->toIso8601String(),
            'image' => [$this->absoluteUrl($article->og_image_url ?: $article->cover_image_url)],
            'articleSection' => $article->category ? $this->localizedField($article->category, 'name') : null,
            'keywords' => $this->localizedField($article, 'seo_keywords'),
            'author' => [
                '@type' => 'Person',
                'name' => $article->author?->name,
            ],
            'publisher' => [
                '@type' => 'NewsMediaOrganization',
                'name' => $this->siteName(),
                'logo' => [
                    '@type' => 'ImageObject',
                    'url' => $this->absoluteUrl(config('news.default_image')),
                ],
            ],
            'mainEntityOfPage' => route('news.show', $article),
        ];
    }
}

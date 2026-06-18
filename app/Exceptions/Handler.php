<?php

namespace App\Exceptions;

use App\Models\NewsArticle;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

class Handler extends ExceptionHandler
{
    /**
     * The list of the inputs that are never flashed to the session on validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * Register the exception handling callbacks for the application.
     */
    public function register(): void
    {
        $this->reportable(function (Throwable $e) {
            //
        });
    }

    public function render($request, Throwable $e): Response
    {
        $response = parent::render($request, $e);

        if ($response->getStatusCode() === Response::HTTP_NOT_FOUND && ! $request->expectsJson()) {
            return $this->renderNotFoundPage($request);
        }

        return $response;
    }

    private function renderNotFoundPage(Request $request): Response
    {
        return Inertia::render('News/NotFound', [
            'seo' => [
                'title' => 'Halaman Tidak Ditemukan',
                'description' => 'Halaman yang Anda cari tidak ditemukan. Temukan berita terbaru dan kategori populer di Radina News.',
                'url' => $request->fullUrl(),
                'image' => asset(config('news.social_image')),
                'imageWidth' => 1200,
                'imageHeight' => 630,
                'imageType' => 'image/jpeg',
                'imageAlt' => config('news.name').' - Referensi Digital Indonesia',
                'type' => 'website',
                'keywords' => 'Radina News, berita terbaru, arsip berita, halaman tidak ditemukan',
                'robots' => 'noindex,follow',
                'publishedAt' => null,
                'updatedAt' => null,
                'jsonLd' => [],
            ],
            'latestArticles' => $this->latestArticlesForNotFound(),
        ])->toResponse($request)->setStatusCode(Response::HTTP_NOT_FOUND);
    }

    private function latestArticlesForNotFound(): array
    {
        try {
            return NewsArticle::query()
                ->with(['category', 'author'])
                ->published()
                ->latest('published_at')
                ->limit(6)
                ->get()
                ->map(fn (NewsArticle $article): array => [
                    'title' => $article->title,
                    'slug' => $article->slug,
                    'excerpt' => $article->excerpt,
                    'url' => route('news.show', $article),
                    'coverImage' => $article->cover_image_url,
                    'coverAlt' => $article->cover_image_alt ?: $article->title,
                    'publishedAt' => optional($article->published_at)->toIso8601String(),
                    'publishedLabel' => optional($article->published_at)->translatedFormat('d M Y'),
                    'readingTime' => $article->reading_time,
                    'viewsCount' => $article->views_count,
                    'isFeatured' => $article->is_featured,
                    'category' => $article->category ? [
                        'name' => $article->category->name,
                        'slug' => $article->category->slug,
                        'url' => route('news.category', $article->category),
                        'accentColor' => $article->category->accent_color,
                    ] : null,
                    'author' => $article->author ? [
                        'name' => $article->author->name,
                    ] : null,
                    'tags' => [],
                ])
                ->all();
        } catch (Throwable) {
            return [];
        }
    }

}

<?php

namespace App\Http\Controllers;

use App\Models\NewsArticle;
use App\Models\NewsCategory;
use App\Models\NewsTag;
use App\Services\WriterPaymentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class NewsAdminController extends Controller
{
    public function index(): Response
    {
        return $this->renderPage();
    }

    public function edit(NewsArticle $article): Response
    {
        $article->load(['category', 'tags', 'earning']);

        return $this->renderPage($article);
    }

    public function store(Request $request, WriterPaymentService $paymentService): RedirectResponse
    {
        $payload = $this->validatePayload($request);
        $payload['user_id'] = $request->user()->id;

        if ($request->user()->isWriter()) {
            $payload['status'] = NewsArticle::STATUS_DRAFT;
            $payload['editorial_status'] = NewsArticle::EDITORIAL_PENDING;
            $payload['fact_check_status'] = NewsArticle::FACT_PENDING;
            $payload['is_featured'] = false;
            $payload['published_at'] = null;
        } else {
            $payload = $this->applyReviewState($request, $payload);
        }

        $payload['slug'] = $this->uniqueSlug($payload['title']);
        $payload['cover_image_url'] = $this->resolveCoverImage($request, $payload['cover_image_url'] ?? null);
        $payload['published_at'] = $this->publishedAt($payload);
        $tags = $payload['tags'] ?? '';

        unset($payload['cover_image'], $payload['tags']);

        $article = NewsArticle::create($payload);
        $this->syncTags($article, $tags);
        $paymentService->creditArticleIfEligible($article);

        $redirectRoute = $request->input('redirect_to') === 'dashboard'
            ? redirect()->route('dashboard', ['section' => 'news'])
            : redirect()->route('admin.news.index');

        return $redirectRoute
            ->with('status', 'Berita berhasil dibuat.');
    }

    public function update(
        Request $request,
        NewsArticle $article,
        WriterPaymentService $paymentService
    ): RedirectResponse
    {
        if ($article->earning && (
            $request->input('editorial_status', $article->editorial_status) !== NewsArticle::EDITORIAL_APPROVED
            || $request->input('fact_check_status', $article->fact_check_status) !== NewsArticle::FACT_VERIFIED
        )) {
            return back()->withErrors([
                'editorial_status' => 'Artikel yang sudah menghasilkan honor tidak dapat dibatalkan persetujuannya.',
            ]);
        }

        $payload = $this->validatePayload($request, $article);
        $payload = $this->applyReviewState($request, $payload, $article);
        $payload['slug'] = $this->uniqueSlug($payload['title'], $article);
        $payload['cover_image_url'] = $this->resolveCoverImage(
            $request,
            $payload['cover_image_url'] ?? $article->cover_image_url,
            $article->cover_image_url
        );
        $payload['published_at'] = $this->publishedAt($payload, $article);
        $tags = $payload['tags'] ?? '';

        unset($payload['cover_image'], $payload['tags']);

        $article->update($payload);
        $this->syncTags($article, $tags);
        $paymentService->creditArticleIfEligible($article);

        return redirect()
            ->route('admin.news.index')
            ->with('status', 'Berita berhasil diperbarui.');
    }

    public function review(
        Request $request,
        NewsArticle $article,
        WriterPaymentService $paymentService
    ): RedirectResponse {
        if ($article->earning) {
            return back()->withErrors([
                'review' => 'Artikel ini sudah menghasilkan honor dan status review tidak dapat dibatalkan.',
            ]);
        }

        $payload = $request->validate([
            'editorial_status' => [
                'required',
                Rule::in([
                    NewsArticle::EDITORIAL_PENDING,
                    NewsArticle::EDITORIAL_APPROVED,
                    NewsArticle::EDITORIAL_REJECTED,
                ]),
            ],
            'fact_check_status' => [
                'required',
                Rule::in([
                    NewsArticle::FACT_PENDING,
                    NewsArticle::FACT_VERIFIED,
                    NewsArticle::FACT_REJECTED,
                ]),
            ],
            'review_note' => ['nullable', 'string', 'max:2000'],
        ]);

        $article->update($this->reviewAttributes($payload, $request->user()->id, $article));
        $earning = $paymentService->creditArticleIfEligible($article);

        return back()->with('status', $earning
            ? 'Artikel disetujui, terverifikasi, diterbitkan, dan honor penulis dikreditkan.'
            : 'Status review artikel berhasil diperbarui.');
    }

    public function destroy(NewsArticle $article): RedirectResponse
    {
        $this->deleteUploadedCover($article->cover_image_url);
        $article->delete();

        return redirect()
            ->route('admin.news.index')
            ->with('status', 'Berita berhasil dihapus.');
    }

    private function renderPage(?NewsArticle $editArticle = null): Response
    {
        $articles = NewsArticle::query()
            ->with(['category', 'author', 'earning'])
            ->latest('updated_at')
            ->paginate(12);

        return Inertia::render('Admin/NewsManager', [
            'seo' => [
                'title' => 'Kelola Berita',
                'description' => 'Dashboard pengelolaan berita Radina News.',
                'url' => route('admin.news.index'),
                'robots' => 'noindex,nofollow',
                'type' => 'website',
                'keywords' => 'dashboard berita, admin radina news',
                'jsonLd' => [],
            ],
            'stats' => [
                'total' => NewsArticle::count(),
                'published' => NewsArticle::where('status', NewsArticle::STATUS_PUBLISHED)->count(),
                'draft' => NewsArticle::where('status', NewsArticle::STATUS_DRAFT)->count(),
                'featured' => NewsArticle::where('is_featured', true)->count(),
            ],
            'categories' => NewsCategory::query()
                ->orderBy('name')
                ->get(['id', 'name', 'name_en'])
                ->map(fn (NewsCategory $category) => [
                    'id' => $category->id,
                    'name' => $category->name,
                    'nameEn' => $category->name_en,
                ])
                ->all(),
            'articles' => [
                'data' => $articles->getCollection()
                    ->map(fn (NewsArticle $article) => $this->transformArticle($article))
                    ->all(),
                'links' => $articles->linkCollection()->map(fn (array $link) => [
                    'url' => $link['url'],
                    'label' => strip_tags($link['label']),
                    'active' => $link['active'],
                ])->all(),
            ],
            'editArticle' => $editArticle ? $this->transformArticle($editArticle, true) : null,
            'storeUrl' => route('admin.news.store'),
            'defaultCoverImage' => '/images/news-dummy/technology-lead.png',
        ]);
    }

    private function validatePayload(Request $request, ?NewsArticle $article = null): array
    {
        return $request->validate([
            'category_id' => ['required', 'integer', Rule::exists('news_categories', 'id')],
            'title' => ['required', 'string', 'max:180'],
            'title_en' => ['nullable', 'string', 'max:180'],
            'excerpt' => ['required', 'string', 'max:1000'],
            'excerpt_en' => ['nullable', 'string', 'max:1000'],
            'content' => ['required', 'string'],
            'content_en' => ['nullable', 'string'],
            'cover_image' => ['nullable', 'image', 'max:5120'],
            'cover_image_url' => [$article ? 'nullable' : 'required_without:cover_image', 'nullable', 'string', 'max:2048'],
            'cover_image_alt' => ['nullable', 'string', 'max:180'],
            'cover_image_alt_en' => ['nullable', 'string', 'max:180'],
            'status' => ['required', Rule::in([NewsArticle::STATUS_DRAFT, NewsArticle::STATUS_PUBLISHED])],
            'editorial_status' => [
                'nullable',
                Rule::in([
                    NewsArticle::EDITORIAL_PENDING,
                    NewsArticle::EDITORIAL_APPROVED,
                    NewsArticle::EDITORIAL_REJECTED,
                ]),
            ],
            'fact_check_status' => [
                'nullable',
                Rule::in([
                    NewsArticle::FACT_PENDING,
                    NewsArticle::FACT_VERIFIED,
                    NewsArticle::FACT_REJECTED,
                ]),
            ],
            'review_note' => ['nullable', 'string', 'max:2000'],
            'is_featured' => ['required', 'boolean'],
            'published_at' => ['nullable', 'date'],
            'seo_title' => ['nullable', 'string', 'max:160'],
            'seo_title_en' => ['nullable', 'string', 'max:160'],
            'seo_description' => ['nullable', 'string', 'max:255'],
            'seo_description_en' => ['nullable', 'string', 'max:255'],
            'seo_keywords' => ['nullable', 'string', 'max:255'],
            'seo_keywords_en' => ['nullable', 'string', 'max:255'],
            'tags' => ['nullable', 'string', 'max:500'],
        ]);
    }

    private function applyReviewState(
        Request $request,
        array $payload,
        ?NewsArticle $article = null
    ): array {
        $hasExplicitReview = $request->filled('editorial_status')
            || $request->filled('fact_check_status');

        if ($hasExplicitReview) {
            $review = [
                'editorial_status' => $payload['editorial_status'] ?? $article?->editorial_status ?? NewsArticle::EDITORIAL_PENDING,
                'fact_check_status' => $payload['fact_check_status'] ?? $article?->fact_check_status ?? NewsArticle::FACT_PENDING,
                'review_note' => $payload['review_note'] ?? null,
            ];
        } elseif ($payload['status'] === NewsArticle::STATUS_PUBLISHED) {
            $review = [
                'editorial_status' => NewsArticle::EDITORIAL_APPROVED,
                'fact_check_status' => NewsArticle::FACT_VERIFIED,
                'review_note' => $payload['review_note'] ?? null,
            ];
        } else {
            return [
                ...$payload,
                'editorial_status' => $article?->editorial_status ?? NewsArticle::EDITORIAL_PENDING,
                'fact_check_status' => $article?->fact_check_status ?? NewsArticle::FACT_PENDING,
                'review_note' => $payload['review_note'] ?? $article?->review_note,
                'approved_by' => $article?->approved_by,
                'approved_at' => $article?->approved_at,
                'fact_checked_by' => $article?->fact_checked_by,
                'fact_checked_at' => $article?->fact_checked_at,
            ];
        }

        unset($payload['editorial_status'], $payload['fact_check_status'], $payload['review_note']);

        return [
            ...$payload,
            ...$this->reviewAttributes($review, $request->user()->id, $article),
        ];
    }

    private function reviewAttributes(array $review, int $adminId, ?NewsArticle $article = null): array
    {
        $approved = $review['editorial_status'] === NewsArticle::EDITORIAL_APPROVED;
        $verified = $review['fact_check_status'] === NewsArticle::FACT_VERIFIED;
        $publish = $approved && $verified;

        return [
            'editorial_status' => $review['editorial_status'],
            'fact_check_status' => $review['fact_check_status'],
            'review_note' => $review['review_note'] ?? null,
            'approved_by' => $approved ? ($article?->approved_by ?: $adminId) : null,
            'approved_at' => $approved ? ($article?->approved_at ?: now()) : null,
            'fact_checked_by' => $verified ? ($article?->fact_checked_by ?: $adminId) : null,
            'fact_checked_at' => $verified ? ($article?->fact_checked_at ?: now()) : null,
            'status' => $publish ? NewsArticle::STATUS_PUBLISHED : NewsArticle::STATUS_DRAFT,
            'published_at' => $publish ? ($article?->published_at ?: now()) : null,
        ];
    }

    private function resolveCoverImage(Request $request, ?string $fallback, ?string $oldCover = null): string
    {
        if (! $request->hasFile('cover_image')) {
            return (string) $fallback;
        }

        $directory = public_path('images/news/uploads');
        File::ensureDirectoryExists($directory);

        $file = $request->file('cover_image');
        $filename = now()->format('YmdHis').'-'.Str::uuid().'.'.$file->extension();
        $file->move($directory, $filename);

        $this->deleteUploadedCover($oldCover);

        return "/images/news/uploads/{$filename}";
    }

    private function deleteUploadedCover(?string $cover): void
    {
        if (! $cover || ! str_starts_with($cover, '/images/news/uploads/')) {
            return;
        }

        File::delete(public_path(ltrim($cover, '/')));
    }

    private function publishedAt(array $payload, ?NewsArticle $article = null): mixed
    {
        if ($payload['status'] === NewsArticle::STATUS_DRAFT) {
            return null;
        }

        return ($payload['published_at'] ?? null) ?: $article?->published_at ?: now();
    }

    private function uniqueSlug(string $title, ?NewsArticle $article = null): string
    {
        $baseSlug = Str::slug($title) ?: Str::random(12);
        $slug = $baseSlug;
        $counter = 2;

        while (
            NewsArticle::query()
                ->where('slug', $slug)
                ->when($article, fn ($query) => $query->whereKeyNot($article->id))
                ->exists()
        ) {
            $slug = "{$baseSlug}-{$counter}";
            $counter++;
        }

        return $slug;
    }

    private function syncTags(NewsArticle $article, string $tags): void
    {
        $tagIds = collect(explode(',', $tags))
            ->map(fn (string $tag) => trim($tag))
            ->filter()
            ->unique(fn (string $tag) => Str::lower($tag))
            ->map(function (string $name): int {
                return NewsTag::firstOrCreate(
                    ['slug' => Str::slug($name)],
                    [
                        'name' => $name,
                        'name_en' => $name,
                        'description' => "Kumpulan berita dengan topik {$name}.",
                        'description_en' => "A collection of stories about {$name}.",
                    ]
                )->id;
            })
            ->all();

        $article->tags()->sync($tagIds);
    }

    private function transformArticle(NewsArticle $article, bool $detailed = false): array
    {
        $data = [
            'id' => $article->id,
            'title' => $article->title,
            'titleEn' => $article->title_en,
            'slug' => $article->slug,
            'status' => $article->status,
            'editorialStatus' => $article->editorial_status,
            'factCheckStatus' => $article->fact_check_status,
            'reviewNote' => $article->review_note,
            'earningAmount' => $article->earning?->amount,
            'isFeatured' => $article->is_featured,
            'categoryName' => $article->category?->name,
            'authorName' => $article->author?->name,
            'coverImage' => $article->cover_image_url,
            'publishedAt' => $article->published_at?->format('Y-m-d\TH:i'),
            'updatedAt' => $article->updated_at?->translatedFormat('d M Y H:i'),
            'publicUrl' => route('news.show', $article),
            'editUrl' => route('admin.news.edit', $article),
            'updateUrl' => route('admin.news.update', $article),
            'reviewUrl' => route('admin.news.review', $article),
            'destroyUrl' => route('admin.news.destroy', $article),
        ];

        if (! $detailed) {
            return $data;
        }

        return [
            ...$data,
            'categoryId' => $article->category_id,
            'excerpt' => $article->excerpt,
            'excerptEn' => $article->excerpt_en,
            'content' => $article->content,
            'contentEn' => $article->content_en,
            'coverImageAlt' => $article->cover_image_alt,
            'coverImageAltEn' => $article->cover_image_alt_en,
            'seoTitle' => $article->seo_title,
            'seoTitleEn' => $article->seo_title_en,
            'seoDescription' => $article->seo_description,
            'seoDescriptionEn' => $article->seo_description_en,
            'seoKeywords' => $article->seo_keywords,
            'seoKeywordsEn' => $article->seo_keywords_en,
            'tags' => $article->tags->pluck('name')->implode(', '),
        ];
    }
}

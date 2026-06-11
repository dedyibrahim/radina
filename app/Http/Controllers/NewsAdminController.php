<?php

namespace App\Http\Controllers;

use App\Models\NewsArticle;
use App\Models\NewsArticleImage;
use App\Models\NewsCategory;
use App\Models\NewsTag;
use App\Models\User;
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
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('q', ''));
        $approval = (string) $request->query('approval', 'all');

        $articles = NewsArticle::query()
            ->with(['category', 'author', 'earning'])
            ->when($search !== '', fn ($query) => $query->where(function ($builder) use ($search): void {
                $builder
                    ->where('title', 'like', "%{$search}%")
                    ->orWhere('excerpt', 'like', "%{$search}%")
                    ->orWhereHas('author', fn ($authorQuery) => $authorQuery->where('name', 'like', "%{$search}%"))
                    ->orWhereHas('category', fn ($categoryQuery) => $categoryQuery->where('name', 'like', "%{$search}%"));
            }))
            ->when($approval === 'approved', fn ($query) => $query
                ->where('editorial_status', NewsArticle::EDITORIAL_APPROVED)
                ->where('fact_check_status', NewsArticle::FACT_VERIFIED))
            ->when($approval === 'pending', fn ($query) => $query->where(function ($builder): void {
                $builder
                    ->where('editorial_status', NewsArticle::EDITORIAL_PENDING)
                    ->orWhere('fact_check_status', NewsArticle::FACT_PENDING);
            }))
            ->when($approval === 'rejected', fn ($query) => $query->where(function ($builder): void {
                $builder
                    ->where('editorial_status', NewsArticle::EDITORIAL_REJECTED)
                    ->orWhere('fact_check_status', NewsArticle::FACT_REJECTED);
            }))
            ->latest('updated_at')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Admin/NewsIndex', [
            'seo' => $this->seoData('Daftar Berita', route('admin.news.index')),
            'stats' => $this->newsStats(),
            'filters' => [
                'q' => $search,
                'approval' => $approval,
            ],
            'articles' => $this->transformArticles($articles),
            'articleAuthors' => $this->articleAuthors(),
            'createUrl' => route('admin.news.create'),
        ]);
    }

    public function create(): Response
    {
        return $this->renderForm();
    }

    public function edit(NewsArticle $article): Response
    {
        $article->load(['category', 'tags', 'earning', 'images']);

        return $this->renderForm($article);
    }

    public function store(Request $request, WriterPaymentService $paymentService): RedirectResponse
    {
        $payload = $this->validatePayload($request);
        $payload['user_id'] = $request->user()->isAdmin()
            ? (int) (($payload['assigned_user_id'] ?? null) ?: $request->user()->id)
            : $request->user()->id;
        unset($payload['assigned_user_id']);

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
        $articleImages = $payload['article_images'] ?? [];

        unset($payload['cover_image'], $payload['tags'], $payload['article_images'], $payload['existing_images']);

        $article = NewsArticle::create($payload);
        $this->syncTags($article, $tags);
        $this->storeArticleImages($article, $articleImages);
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
        $payload = $this->validatePayload($request, $article);
        $payload['user_id'] = $article->earning
            ? $article->user_id
            : (int) (($payload['assigned_user_id'] ?? null) ?: $article->user_id);
        unset($payload['assigned_user_id']);

        if ($article->earning) {
            $payload = [
                ...$payload,
                'status' => $article->status,
                'editorial_status' => $article->editorial_status,
                'fact_check_status' => $article->fact_check_status,
                'review_note' => $article->review_note,
                'approved_by' => $article->approved_by,
                'approved_at' => $article->approved_at,
                'fact_checked_by' => $article->fact_checked_by,
                'fact_checked_at' => $article->fact_checked_at,
                'published_at' => $article->published_at,
            ];
        } else {
            $payload = $this->applyReviewState($request, $payload, $article);
        }
        $payload['slug'] = $this->uniqueSlug($payload['title'], $article);
        $payload['cover_image_url'] = $this->resolveCoverImage(
            $request,
            $payload['cover_image_url'] ?? $article->cover_image_url,
            $article->cover_image_url
        );
        $payload['published_at'] = $this->publishedAt($payload, $article);
        $tags = $payload['tags'] ?? '';
        $articleImages = $payload['article_images'] ?? [];
        $existingImages = $payload['existing_images'] ?? [];

        unset($payload['cover_image'], $payload['tags'], $payload['article_images'], $payload['existing_images']);

        $article->update($payload);
        $this->syncTags($article, $tags);
        $this->updateArticleImages($article, $existingImages);
        $this->storeArticleImages($article, $articleImages);
        $paymentService->creditArticleIfEligible($article);

        return redirect()
            ->route('admin.news.index')
            ->with('status', 'Berita berhasil diperbarui.');
    }

    public function reassign(Request $request, NewsArticle $article): RedirectResponse
    {
        if ($article->earning) {
            return back()->withErrors([
                'assigned_user_id' => 'Artikel yang sudah menghasilkan honor tidak dapat dialihkan ke penulis lain.',
            ]);
        }

        $payload = $request->validate([
            'assigned_user_id' => ['required', 'integer', Rule::exists('users', 'id')],
        ]);

        $newAuthor = User::findOrFail($payload['assigned_user_id']);
        $article->update(['user_id' => $newAuthor->id]);

        return back()->with('status', "Artikel berhasil dialihkan kepada {$newAuthor->name}.");
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
        $article->images()->each(fn (NewsArticleImage $image) => $this->deleteUploadedArticleImage($image->image_url));
        $article->delete();

        return redirect()
            ->route('admin.news.index')
            ->with('status', 'Berita berhasil dihapus.');
    }

    public function destroyImage(NewsArticle $article, NewsArticleImage $image): RedirectResponse
    {
        abort_unless($image->article_id === $article->id, 404);

        $this->deleteUploadedArticleImage($image->image_url);
        $image->delete();

        return back()->with('status', 'Gambar isi artikel berhasil dihapus.');
    }

    private function renderForm(?NewsArticle $editArticle = null): Response
    {
        return Inertia::render('Admin/NewsManager', [
            'seo' => $this->seoData($editArticle ? 'Edit Berita' : 'Tambah Berita', $editArticle
                ? route('admin.news.edit', $editArticle)
                : route('admin.news.create')),
            'categories' => NewsCategory::query()
                ->orderBy('name')
                ->get(['id', 'name', 'name_en'])
                ->map(fn (NewsCategory $category) => [
                    'id' => $category->id,
                    'name' => $category->name,
                    'nameEn' => $category->name_en,
                ])
                ->all(),
            'articleAuthors' => $this->articleAuthors(),
            'editArticle' => $editArticle ? $this->transformArticle($editArticle, true) : null,
            'storeUrl' => route('admin.news.store'),
            'indexUrl' => route('admin.news.index'),
            'defaultCoverImage' => '/images/news-dummy/technology-lead.png',
        ]);
    }

    private function newsStats(): array
    {
        return [
            'total' => NewsArticle::count(),
            'approved' => NewsArticle::where('editorial_status', NewsArticle::EDITORIAL_APPROVED)
                ->where('fact_check_status', NewsArticle::FACT_VERIFIED)
                ->count(),
            'pending' => NewsArticle::where(function ($query): void {
                $query
                    ->where('editorial_status', NewsArticle::EDITORIAL_PENDING)
                    ->orWhere('fact_check_status', NewsArticle::FACT_PENDING);
            })->count(),
            'rejected' => NewsArticle::where(function ($query): void {
                $query
                    ->where('editorial_status', NewsArticle::EDITORIAL_REJECTED)
                    ->orWhere('fact_check_status', NewsArticle::FACT_REJECTED);
            })->count(),
        ];
    }

    private function seoData(string $title, string $url): array
    {
        return [
            'title' => $title,
            'description' => 'Dashboard pengelolaan berita Radina News.',
            'url' => $url,
            'robots' => 'noindex,nofollow',
            'type' => 'website',
            'keywords' => 'dashboard berita, admin radina news',
            'jsonLd' => [],
        ];
    }

    private function transformArticles($articles): array
    {
        return [
            'data' => $articles->getCollection()
                ->map(fn (NewsArticle $article) => $this->transformArticle($article))
                ->all(),
            'links' => $articles->linkCollection()->map(fn (array $link) => [
                'url' => $link['url'],
                'label' => strip_tags($link['label']),
                'active' => $link['active'],
            ])->all(),
        ];
    }

    private function validatePayload(Request $request, ?NewsArticle $article = null): array
    {
        return $request->validate([
            'category_id' => ['required', 'integer', Rule::exists('news_categories', 'id')],
            'assigned_user_id' => ['nullable', 'integer', Rule::exists('users', 'id')],
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
            'article_images' => ['nullable', 'array', 'max:20'],
            'article_images.*.file' => ['required', 'image', 'max:5120'],
            'article_images.*.alt_text' => ['nullable', 'string', 'max:180'],
            'article_images.*.caption' => ['nullable', 'string', 'max:500'],
            'article_images.*.position_after_paragraph' => ['nullable', 'integer', 'min:0', 'max:500'],
            'existing_images' => ['nullable', 'array'],
            'existing_images.*.id' => [
                'required',
                'integer',
                Rule::exists('news_article_images', 'id')->where(
                    fn ($query) => $article
                        ? $query->where('article_id', $article->id)
                        : $query->whereRaw('1 = 0')
                ),
            ],
            'existing_images.*.alt_text' => ['nullable', 'string', 'max:180'],
            'existing_images.*.caption' => ['nullable', 'string', 'max:500'],
            'existing_images.*.position_after_paragraph' => ['nullable', 'integer', 'min:0', 'max:500'],
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

    private function storeArticleImages(NewsArticle $article, array $images): void
    {
        if ($images === []) {
            return;
        }

        $directory = public_path('images/news/article-content');
        File::ensureDirectoryExists($directory);
        $nextSortOrder = (int) $article->images()->max('sort_order') + 1;

        foreach ($images as $index => $imageData) {
            $file = $imageData['file'];
            $filename = now()->format('YmdHis').'-'.Str::uuid().'.'.$file->extension();
            $file->move($directory, $filename);

            $article->images()->create([
                'image_url' => "/images/news/article-content/{$filename}",
                'alt_text' => $imageData['alt_text'] ?? null,
                'caption' => $imageData['caption'] ?? null,
                'position_after_paragraph' => (int) ($imageData['position_after_paragraph'] ?? 0),
                'sort_order' => $nextSortOrder + $index,
            ]);
        }
    }

    private function updateArticleImages(NewsArticle $article, array $images): void
    {
        foreach ($images as $index => $imageData) {
            $article->images()
                ->whereKey($imageData['id'])
                ->update([
                    'alt_text' => $imageData['alt_text'] ?? null,
                    'caption' => $imageData['caption'] ?? null,
                    'position_after_paragraph' => (int) ($imageData['position_after_paragraph'] ?? 0),
                    'sort_order' => $index,
                ]);
        }
    }

    private function deleteUploadedArticleImage(?string $imageUrl): void
    {
        if (! $imageUrl || ! str_starts_with($imageUrl, '/images/news/article-content/')) {
            return;
        }

        File::delete(public_path(ltrim($imageUrl, '/')));
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
            'authorId' => $article->user_id,
            'authorRole' => $article->author?->role,
            'coverImage' => $article->cover_image_url,
            'excerpt' => $article->excerpt,
            'publishedAt' => $article->published_at?->format('Y-m-d\TH:i'),
            'publishedLabel' => $article->published_at?->translatedFormat('d M Y H:i'),
            'updatedAt' => $article->updated_at?->translatedFormat('d M Y H:i'),
            'publicUrl' => route('news.show', $article),
            'editUrl' => route('admin.news.edit', $article),
            'updateUrl' => route('admin.news.update', $article),
            'reviewUrl' => route('admin.news.review', $article),
            'reassignUrl' => route('admin.news.reassign', $article),
            'destroyUrl' => route('admin.news.destroy', $article),
        ];

        if (! $detailed) {
            return $data;
        }

        return [
            ...$data,
            'categoryId' => $article->category_id,
            'assignedUserId' => $article->user_id,
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
            'images' => $article->images->map(fn (NewsArticleImage $image) => [
                'id' => $image->id,
                'url' => $image->image_url,
                'altText' => $image->alt_text,
                'caption' => $image->caption,
                'positionAfterParagraph' => $image->position_after_paragraph,
                'destroyUrl' => route('admin.news.images.destroy', [$article, $image]),
            ])->all(),
        ];
    }

    private function articleAuthors(): array
    {
        return User::query()
            ->whereIn('role', [User::ROLE_ADMIN, User::ROLE_WRITER])
            ->orderByRaw("CASE WHEN role = ? THEN 0 ELSE 1 END", [User::ROLE_WRITER])
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'role'])
            ->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'roleLabel' => $user->isWriter() ? 'Penulis' : 'Admin',
                'articleFee' => $user->isWriter() ? $user->articleFee() : null,
            ])
            ->all();
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\License;
use App\Models\NewsArticle;
use App\Models\NewsCategory;
use App\Models\User;
use App\Models\WriterWithdrawal;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $isAdmin = $user->isAdmin();

        $licenses = $isAdmin
            ? License::withCount('activations')->orderByDesc('created_at')->paginate(12)
            : null;

        $editLicense = null;
        $editId = (int) $request->query('edit', 0);
        if ($isAdmin && $editId > 0) {
            $editLicense = License::find($editId);
        }

        $editCategory = null;
        $editCategoryId = (int) $request->query('edit_category', 0);
        if ($isAdmin && $editCategoryId > 0) {
            $editCategory = NewsCategory::find($editCategoryId);
        }

        $editUser = null;
        $editUserId = (int) $request->query('edit_user', 0);
        if ($isAdmin && $editUserId > 0) {
            $editUser = User::withCount('newsArticles')
                ->withSum('writerEarnings', 'amount')
                ->find($editUserId);
        }

        $stats = $isAdmin ? [
            'total' => License::count(),
            'active' => License::where('status', License::STATUS_ACTIVE)->count(),
            'expired' => License::whereDate('expires_at', '<', now()->toDateString())->count(),
            'revoked' => License::where('status', License::STATUS_REVOKED)->count(),
        ] : [
            'total' => 0,
            'active' => 0,
            'expired' => 0,
            'revoked' => 0,
        ];

        $newsQuery = NewsArticle::query();
        if (! $isAdmin) {
            $newsQuery->where('user_id', $user->id);
        }

        $writerEarnings = $isAdmin
            ? collect()
            : $user->writerEarnings()->latest('credited_at')->limit(30)->get();

        $writerWithdrawals = $isAdmin
            ? collect()
            : $user->writerWithdrawals()
                ->with(['writer', 'processor'])
                ->latest('requested_at')
                ->limit(30)
                ->get();

        $adminWithdrawals = $isAdmin
            ? WriterWithdrawal::query()
                ->with(['writer', 'processor'])
                ->latest('requested_at')
                ->limit(50)
                ->get()
            : collect();

        return Inertia::render('Admin/Dashboard', [
            'seo' => [
                'title' => 'Dashboard Radina News',
                'description' => 'Panel pengelolaan konten dan operasional Radina News.',
                'url' => route('dashboard'),
                'robots' => 'noindex,nofollow',
                'type' => 'website',
                'keywords' => 'dashboard radina news, lisensi internal, radina news',
                'jsonLd' => [],
            ],
            'stats' => $stats,
            'newsStats' => [
                'total' => (clone $newsQuery)->count(),
                'published' => (clone $newsQuery)->where('status', NewsArticle::STATUS_PUBLISHED)->count(),
                'draft' => (clone $newsQuery)->where('status', NewsArticle::STATUS_DRAFT)->count(),
            ],
            'categories' => NewsCategory::query()
                ->withCount('articles')
                ->orderBy('name')
                ->get()
                ->map(function (NewsCategory $category) use ($isAdmin): array {
                    $data = [
                        'id' => $category->id,
                        'name' => $category->name,
                    ];

                    if (! $isAdmin) {
                        return $data;
                    }

                    return [
                        ...$data,
                        'nameEn' => $category->name_en,
                        'slug' => $category->slug,
                        'description' => $category->description,
                        'descriptionEn' => $category->description_en,
                        'accentColor' => $category->accent_color,
                        'coverImage' => $category->cover_image_url,
                        'seoTitle' => $category->seo_title,
                        'seoTitleEn' => $category->seo_title_en,
                        'seoDescription' => $category->seo_description,
                        'seoDescriptionEn' => $category->seo_description_en,
                        'articlesCount' => $category->articles_count,
                        'publicUrl' => route('news.category', $category),
                        'editUrl' => route('dashboard', [
                            'section' => 'categories',
                            'edit_category' => $category->id,
                        ]),
                        'updateUrl' => route('admin.categories.update', $category),
                        'destroyUrl' => route('admin.categories.destroy', $category),
                    ];
                })
                ->all(),
            'editCategory' => $editCategory ? [
                'id' => $editCategory->id,
                'name' => $editCategory->name,
                'nameEn' => $editCategory->name_en,
                'description' => $editCategory->description,
                'descriptionEn' => $editCategory->description_en,
                'accentColor' => $editCategory->accent_color,
                'coverImage' => $editCategory->cover_image_url,
                'seoTitle' => $editCategory->seo_title,
                'seoTitleEn' => $editCategory->seo_title_en,
                'seoDescription' => $editCategory->seo_description,
                'seoDescriptionEn' => $editCategory->seo_description_en,
                'updateUrl' => route('admin.categories.update', $editCategory),
            ] : null,
            'storeCategoryUrl' => $isAdmin ? route('admin.categories.store') : null,
            'recentNews' => NewsArticle::query()
                ->with(['category', 'author', 'earning'])
                ->when(! $isAdmin, fn ($query) => $query->where('user_id', $user->id))
                ->latest('updated_at')
                ->limit(6)
                ->get()
                ->map(fn (NewsArticle $article) => [
                    'id' => $article->id,
                    'title' => $article->title,
                    'status' => $article->status,
                    'editorialStatus' => $article->editorial_status,
                    'factCheckStatus' => $article->fact_check_status,
                    'earningAmount' => $article->earning?->amount,
                    'categoryName' => $article->category?->name,
                    'authorName' => $article->author?->name,
                    'coverImage' => $article->cover_image_url,
                    'updatedAt' => $article->updated_at?->translatedFormat('d M Y H:i'),
                    'editUrl' => $isAdmin ? route('admin.news.edit', $article) : null,
                    'publicUrl' => route('news.show', $article),
                ])
                ->all(),
            'storeNewsUrl' => route('admin.news.store'),
            'defaultCoverImage' => '/images/news-dummy/technology-lead.png',
            'activeSection' => ! $isAdmin
                ? (in_array($request->query('section'), ['news', 'earnings', 'bank'], true)
                    ? $request->query('section')
                    : 'news')
                : match (true) {
                $request->query('section') === 'licenses' || $editLicense => 'licenses',
                $request->query('section') === 'categories' || $editCategory => 'categories',
                $request->query('section') === 'users' || $editUser => 'users',
                $request->query('section') === 'payments' => 'payments',
                default => 'news',
                },
            'isAdmin' => $isAdmin,
            'licenses' => $isAdmin ? [
                'data' => $licenses->getCollection()->map(fn (License $license) => $this->transformLicense($license))->all(),
                'links' => $licenses->linkCollection()->map(fn (array $link) => [
                    'url' => $link['url'],
                    'label' => strip_tags($link['label']),
                    'active' => $link['active'],
                ])->all(),
                'meta' => [
                    'currentPage' => $licenses->currentPage(),
                    'lastPage' => $licenses->lastPage(),
                    'total' => $licenses->total(),
                    'from' => $licenses->firstItem(),
                    'to' => $licenses->lastItem(),
                ],
            ] : ['data' => [], 'links' => [], 'meta' => []],
            'editLicense' => $editLicense ? $this->transformLicense($editLicense) : null,
            'formDefaults' => [
                'customer_name' => '',
                'product_name' => config('license.product_name'),
                'max_activations' => 1,
                'expires_at' => '',
                'notes' => '',
            ],
            'users' => $isAdmin
                ? User::query()
                    ->withCount('newsArticles')
                    ->withSum('writerEarnings', 'amount')
                    ->orderBy('name')
                    ->get()
                    ->map(fn (User $account) => $this->transformUser($account))
                    ->all()
                : [],
            'editUser' => $editUser ? $this->transformUser($editUser) : null,
            'storeUserUrl' => $isAdmin ? route('admin.users.store') : null,
            'paymentSummary' => $isAdmin
                ? [
                    'totalEarnings' => (int) \App\Models\WriterEarning::sum('amount'),
                    'pendingWithdrawals' => WriterWithdrawal::where('status', WriterWithdrawal::STATUS_PENDING)->count(),
                    'pendingAmount' => (int) WriterWithdrawal::where('status', WriterWithdrawal::STATUS_PENDING)->sum('amount'),
                    'paidAmount' => (int) WriterWithdrawal::where('status', WriterWithdrawal::STATUS_PAID)->sum('amount'),
                    'defaultArticleFee' => (int) config('writer_payments.default_article_fee'),
                    'minimumWithdrawal' => (int) config('writer_payments.minimum_withdrawal'),
                ]
                : [
                    'totalEarnings' => $user->totalEarnings(),
                    'availableBalance' => $user->availableBalance(),
                    'reservedAmount' => $user->reservedWithdrawals(),
                    'paidAmount' => (int) $user->writerWithdrawals()
                        ->where('status', WriterWithdrawal::STATUS_PAID)
                        ->sum('amount'),
                    'articleFee' => $user->articleFee(),
                    'minimumWithdrawal' => (int) config('writer_payments.minimum_withdrawal'),
                    'bankComplete' => $user->hasBankAccount(),
                ],
            'writerEarnings' => $writerEarnings
                ->map(fn ($earning) => [
                    'id' => $earning->id,
                    'articleTitle' => $earning->article_title,
                    'amount' => $earning->amount,
                    'description' => $earning->description,
                    'creditedAt' => $earning->credited_at?->translatedFormat('d M Y H:i'),
                ])
                ->all(),
            'writerWithdrawals' => $writerWithdrawals
                ->map(fn (WriterWithdrawal $withdrawal) => $this->transformWithdrawal($withdrawal))
                ->all(),
            'adminWithdrawals' => $adminWithdrawals
                ->map(fn (WriterWithdrawal $withdrawal) => $this->transformWithdrawal($withdrawal, true))
                ->all(),
            'bankAccount' => [
                'bankName' => $user->bank_name,
                'accountNumber' => $user->bank_account_number,
                'accountHolder' => $user->bank_account_holder,
                'updateUrl' => route('writer.bank.update'),
            ],
            'withdrawalStoreUrl' => route('writer.withdrawals.store'),
        ]);
    }

    public function store(Request $request)
    {
        $payload = $this->validateLicensePayload($request);

        $payload['status'] = License::STATUS_ACTIVE;
        $payload['key'] = License::generateKey();

        $license = License::create($payload);

        return redirect()
            ->route('dashboard', ['section' => 'licenses'])
            ->with('status', 'Lisensi baru berhasil dibuat.')
            ->with('new_license_key', $license->key);
    }

    public function update(Request $request, License $license)
    {
        $payload = $this->validateLicensePayload($request);
        $license->update($payload);

        return redirect()
            ->route('dashboard', ['section' => 'licenses'])
            ->with('status', 'Lisensi berhasil diperbarui.');
    }

    public function destroy(License $license)
    {
        $licenseKey = $license->key;
        $license->delete();

        return redirect()
            ->route('dashboard', ['section' => 'licenses'])
            ->with('status', "Lisensi {$licenseKey} berhasil dihapus.");
    }

    public function toggleStatus(License $license)
    {
        $license->status = $license->status === License::STATUS_ACTIVE
            ? License::STATUS_REVOKED
            : License::STATUS_ACTIVE;
        $license->save();

        return redirect()
            ->route('dashboard', ['section' => 'licenses'])
            ->with('status', 'Status lisensi berhasil diubah.');
    }

    private function validateLicensePayload(Request $request): array
    {
        return $request->validate([
            'customer_name' => ['required', 'string', 'max:120'],
            'product_name' => ['required', 'string', 'max:120'],
            'max_activations' => ['required', 'integer', 'min:1', 'max:1000'],
            'expires_at' => ['nullable', 'date'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);
    }

    private function transformLicense(License $license): array
    {
        $isExpired = $license->expires_at && $license->expires_at->isPast();

        return [
            'id' => $license->id,
            'key' => $license->key,
            'customerName' => $license->customer_name,
            'productName' => $license->product_name,
            'status' => $license->status,
            'statusLabel' => $isExpired ? 'Expired' : ucfirst($license->status),
            'statusTone' => $isExpired
                ? 'amber'
                : ($license->status === License::STATUS_ACTIVE ? 'emerald' : 'rose'),
            'maxActivations' => $license->max_activations,
            'activationsCount' => $license->activations_count,
            'expiresAt' => $license->expires_at?->format('Y-m-d'),
            'isExpired' => $isExpired,
            'notes' => $license->notes,
            'editUrl' => route('dashboard', ['section' => 'licenses', 'edit' => $license->id, 'page' => request('page')]),
            'toggleUrl' => route('licenses.toggle-status', $license),
            'updateUrl' => route('licenses.update', $license),
            'destroyUrl' => route('licenses.destroy', $license),
        ];
    }

    private function transformUser(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'roleLabel' => $user->isAdmin() ? 'Admin' : 'Penulis',
            'articleFee' => $user->articleFee(),
            'totalEarnings' => (int) ($user->writer_earnings_sum_amount ?? $user->totalEarnings()),
            'articlesCount' => $user->news_articles_count ?? $user->newsArticles()->count(),
            'verified' => $user->email_verified_at !== null,
            'editUrl' => route('dashboard', ['section' => 'users', 'edit_user' => $user->id]),
            'updateUrl' => route('admin.users.update', $user),
            'destroyUrl' => route('admin.users.destroy', $user),
        ];
    }

    private function transformWithdrawal(WriterWithdrawal $withdrawal, bool $admin = false): array
    {
        $statusLabels = [
            WriterWithdrawal::STATUS_PENDING => 'Menunggu',
            WriterWithdrawal::STATUS_APPROVED => 'Disetujui',
            WriterWithdrawal::STATUS_PAID => 'Dibayar',
            WriterWithdrawal::STATUS_REJECTED => 'Ditolak',
        ];

        return [
            'id' => $withdrawal->id,
            'writerName' => $withdrawal->writer?->name,
            'writerEmail' => $withdrawal->writer?->email,
            'amount' => $withdrawal->amount,
            'bankName' => $withdrawal->bank_name,
            'accountNumber' => $withdrawal->bank_account_number,
            'accountHolder' => $withdrawal->bank_account_holder,
            'status' => $withdrawal->status,
            'statusLabel' => $statusLabels[$withdrawal->status] ?? ucfirst($withdrawal->status),
            'adminNote' => $withdrawal->admin_note,
            'requestedAt' => $withdrawal->requested_at?->translatedFormat('d M Y H:i'),
            'processedAt' => $withdrawal->processed_at?->translatedFormat('d M Y H:i'),
            'processorName' => $withdrawal->processor?->name,
            'updateUrl' => $admin ? route('admin.withdrawals.update', $withdrawal) : null,
        ];
    }
}

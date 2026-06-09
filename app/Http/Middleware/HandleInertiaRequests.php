<?php

namespace App\Http\Middleware;

use App\Models\NewsCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): string|null
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                    'role' => $request->user()->role,
                ] : null,
            ],
            'locale' => app()->getLocale(),
            'flash' => [
                'status' => fn () => $request->session()->get('status'),
                'newLicenseKey' => fn () => $request->session()->get('new_license_key'),
            ],
            'portal' => [
                'name' => config('news.name'),
                'tagline' => config('news.tagline'),
                'description' => config('news.description'),
                'baseUrl' => rtrim(config('news.base_url'), '/'),
                'defaultImage' => asset(ltrim(config('news.default_image'), '/')),
                'logo' => asset('images/radina-news-logo.png'),
                'mark' => asset('favicon-192x192.png'),
                'contactPhone' => config('news.contact_phone'),
                'address' => config('news.address'),
                'socials' => config('news.socials'),
            ],
            'navigation' => fn () => [
                'categories' => $this->navigationCategories(),
            ],
        ];
    }

    private function navigationCategories(): array
    {
        if (! Schema::hasTable('news_categories') || ! Schema::hasTable('news_articles')) {
            return [];
        }

        return NewsCategory::query()
            ->withCount(['articles' => fn ($query) => $query->published()])
            ->orderByDesc('articles_count')
            ->orderBy('name')
            ->get()
            ->map(fn (NewsCategory $category) => [
                'name' => app()->isLocale('en') && $category->name_en ? $category->name_en : $category->name,
                'slug' => $category->slug,
                'url' => route('news.category', $category),
            ])
            ->all();
    }
}

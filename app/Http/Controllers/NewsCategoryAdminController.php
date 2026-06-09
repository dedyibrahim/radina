<?php

namespace App\Http\Controllers;

use App\Models\NewsCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class NewsCategoryAdminController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $payload = $this->validatePayload($request);
        $payload['slug'] = $this->uniqueSlug($payload['name']);
        $payload['cover_image_url'] = $this->resolveCoverImage($request, $payload['cover_image_url'] ?? null);

        unset($payload['cover_image']);

        NewsCategory::create($payload);

        return redirect()
            ->route('dashboard', ['section' => 'categories'])
            ->with('status', 'Kategori berhasil dibuat.');
    }

    public function update(Request $request, NewsCategory $category): RedirectResponse
    {
        $payload = $this->validatePayload($request, $category);
        $payload['slug'] = $this->uniqueSlug($payload['name'], $category);
        $payload['cover_image_url'] = $this->resolveCoverImage(
            $request,
            $payload['cover_image_url'] ?? $category->cover_image_url,
            $category->cover_image_url
        );

        unset($payload['cover_image']);

        $category->update($payload);

        return redirect()
            ->route('dashboard', ['section' => 'categories'])
            ->with('status', 'Kategori berhasil diperbarui.');
    }

    public function destroy(NewsCategory $category): RedirectResponse
    {
        if ($category->articles()->exists()) {
            return redirect()
                ->route('dashboard', ['section' => 'categories'])
                ->with('status', 'Kategori tidak dapat dihapus karena masih digunakan oleh berita.');
        }

        $this->deleteUploadedCover($category->cover_image_url);
        $category->delete();

        return redirect()
            ->route('dashboard', ['section' => 'categories'])
            ->with('status', 'Kategori berhasil dihapus.');
    }

    private function validatePayload(Request $request, ?NewsCategory $category = null): array
    {
        return $request->validate([
            'name' => [
                'required',
                'string',
                'max:100',
                Rule::unique('news_categories', 'name')->ignore($category?->id),
            ],
            'name_en' => ['nullable', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:2000'],
            'description_en' => ['nullable', 'string', 'max:2000'],
            'accent_color' => ['required', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'cover_image' => ['nullable', 'image', 'max:5120'],
            'cover_image_url' => ['nullable', 'string', 'max:2048'],
            'seo_title' => ['nullable', 'string', 'max:160'],
            'seo_title_en' => ['nullable', 'string', 'max:160'],
            'seo_description' => ['nullable', 'string', 'max:255'],
            'seo_description_en' => ['nullable', 'string', 'max:255'],
        ]);
    }

    private function uniqueSlug(string $name, ?NewsCategory $category = null): string
    {
        $baseSlug = Str::slug($name) ?: Str::random(12);
        $slug = $baseSlug;
        $counter = 2;

        while (
            NewsCategory::query()
                ->where('slug', $slug)
                ->when($category, fn ($query) => $query->whereKeyNot($category->id))
                ->exists()
        ) {
            $slug = "{$baseSlug}-{$counter}";
            $counter++;
        }

        return $slug;
    }

    private function resolveCoverImage(Request $request, ?string $fallback, ?string $oldCover = null): ?string
    {
        if (! $request->hasFile('cover_image')) {
            return $fallback;
        }

        $directory = public_path('images/news/categories');
        File::ensureDirectoryExists($directory);

        $file = $request->file('cover_image');
        $filename = now()->format('YmdHis').'-'.Str::uuid().'.'.$file->extension();
        $file->move($directory, $filename);

        $this->deleteUploadedCover($oldCover);

        return "/images/news/categories/{$filename}";
    }

    private function deleteUploadedCover(?string $cover): void
    {
        if (! $cover || ! str_starts_with($cover, '/images/news/categories/')) {
            return;
        }

        File::delete(public_path(ltrim($cover, '/')));
    }
}

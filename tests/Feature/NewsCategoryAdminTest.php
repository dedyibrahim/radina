<?php

namespace Tests\Feature;

use App\Models\NewsCategory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NewsCategoryAdminTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed();
    }

    public function test_verified_user_can_create_update_and_delete_empty_category(): void
    {
        $user = User::where('email', 'admin@radina.net')->firstOrFail();

        $this
            ->actingAs($user)
            ->post(route('admin.categories.store'), [
                'name' => 'Nasional',
                'name_en' => 'National',
                'description' => 'Berita nasional terbaru.',
                'description_en' => 'Latest national news.',
                'accent_color' => '#DC2626',
                'cover_image_url' => '/images/news-dummy/business-strategy.png',
                'seo_title' => 'Berita Nasional',
                'seo_description' => 'Kumpulan berita nasional.',
            ])
            ->assertRedirect(route('dashboard', ['section' => 'categories']));

        $category = NewsCategory::where('slug', 'nasional')->firstOrFail();

        $this
            ->get(route('news.home'))
            ->assertInertia(fn ($page) => $page
                ->has('navigation.categories', 7)
                ->where('navigation.categories.6.slug', 'nasional')
            );

        $this
            ->actingAs($user)
            ->patch(route('admin.categories.update', $category), [
                'name' => 'Nasional Indonesia',
                'name_en' => 'Indonesia National',
                'description' => 'Informasi nasional Indonesia.',
                'description_en' => 'Indonesia national information.',
                'accent_color' => '#B91C1C',
                'cover_image_url' => $category->cover_image_url,
            ])
            ->assertRedirect(route('dashboard', ['section' => 'categories']));

        $category->refresh();
        $this->assertSame('Nasional Indonesia', $category->name);
        $this->assertSame('nasional-indonesia', $category->slug);
        $this->assertSame('#B91C1C', $category->accent_color);

        $this
            ->actingAs($user)
            ->delete(route('admin.categories.destroy', $category))
            ->assertRedirect(route('dashboard', ['section' => 'categories']));

        $this->assertDatabaseMissing('news_categories', ['id' => $category->id]);
    }

    public function test_category_with_articles_cannot_be_deleted(): void
    {
        $user = User::where('email', 'admin@radina.net')->firstOrFail();
        $category = NewsCategory::has('articles')->firstOrFail();

        $this
            ->actingAs($user)
            ->delete(route('admin.categories.destroy', $category))
            ->assertRedirect(route('dashboard', ['section' => 'categories']));

        $this->assertDatabaseHas('news_categories', ['id' => $category->id]);
    }

    public function test_dashboard_exposes_dynamic_category_management_data(): void
    {
        $user = User::where('email', 'admin@radina.net')->firstOrFail();

        $this
            ->actingAs($user)
            ->get(route('dashboard', ['section' => 'categories']))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Dashboard')
                ->where('activeSection', 'categories')
                ->has('categories', 6)
                ->has('categories.0.articlesCount')
                ->has('categories.0.editUrl')
                ->has('storeCategoryUrl')
            );
    }
}

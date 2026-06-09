<?php

namespace Tests\Feature;

use App\Models\NewsArticle;
use App\Models\NewsCategory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NewsAdminTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed();
    }

    public function test_guest_cannot_open_news_dashboard(): void
    {
        $this->get(route('admin.news.index'))
            ->assertRedirect(route('login'));
    }

    public function test_verified_user_can_create_news_from_dashboard(): void
    {
        $user = User::where('email', 'admin@radina.net')->firstOrFail();
        $category = NewsCategory::firstOrFail();

        $response = $this
            ->actingAs($user)
            ->post(route('admin.news.store'), [
                'category_id' => $category->id,
                'title' => 'Radina News Merilis Fitur Dashboard Redaksi',
                'title_en' => 'Radina News Launches a Newsroom Dashboard',
                'excerpt' => 'Dashboard baru membantu redaksi membuat dan menerbitkan berita.',
                'excerpt_en' => 'The new dashboard helps the newsroom create and publish stories.',
                'content' => '<p>Konten berita Indonesia.</p>',
                'content_en' => '<p>English news content.</p>',
                'cover_image_url' => '/images/news-dummy/technology-lead.png',
                'cover_image_alt' => 'Dashboard redaksi Radina News',
                'cover_image_alt_en' => 'Radina News newsroom dashboard',
                'status' => NewsArticle::STATUS_PUBLISHED,
                'is_featured' => false,
                'published_at' => null,
                'seo_title' => 'Dashboard Redaksi Radina News',
                'seo_description' => 'Dashboard redaksi untuk membuat berita.',
                'seo_keywords' => 'dashboard berita, radina news',
                'tags' => 'Dashboard, Redaksi',
            ]);

        $response->assertRedirect(route('admin.news.index'));

        $article = NewsArticle::where('title', 'Radina News Merilis Fitur Dashboard Redaksi')->firstOrFail();

        $this->assertSame(NewsArticle::STATUS_PUBLISHED, $article->status);
        $this->assertNotNull($article->published_at);
        $this->assertCount(2, $article->tags);
    }

    public function test_dashboard_exposes_news_and_license_management_data(): void
    {
        $user = User::where('email', 'admin@radina.net')->firstOrFail();

        $this
            ->actingAs($user)
            ->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Dashboard')
                ->has('categories', 7)
                ->has('articleAuthors', 2)
                ->has('recentNews')
                ->has('licenses.data')
                ->where('activeSection', 'news')
            );
    }

    public function test_news_created_from_main_dashboard_returns_to_dashboard(): void
    {
        $user = User::where('email', 'admin@radina.net')->firstOrFail();
        $category = NewsCategory::firstOrFail();

        $this
            ->actingAs($user)
            ->post(route('admin.news.store'), [
                'category_id' => $category->id,
                'title' => 'Berita Dibuat dari Dashboard Utama',
                'excerpt' => 'Ringkasan berita dari dashboard utama.',
                'content' => 'Isi berita dari dashboard utama.',
                'cover_image_url' => '/images/news-dummy/technology-lead.png',
                'status' => NewsArticle::STATUS_DRAFT,
                'is_featured' => false,
                'redirect_to' => 'dashboard',
            ])
            ->assertRedirect(route('dashboard', ['section' => 'news']));

        $this->assertDatabaseHas('news_articles', [
            'title' => 'Berita Dibuat dari Dashboard Utama',
            'status' => NewsArticle::STATUS_DRAFT,
        ]);
    }

    public function test_article_author_is_always_taken_from_authenticated_session(): void
    {
        $sessionAuthor = User::factory()->create([
            'name' => 'Penulis Session',
            'email_verified_at' => now(),
        ]);
        $otherUser = User::factory()->create([
            'name' => 'Penulis Palsu',
            'email_verified_at' => now(),
        ]);
        $category = NewsCategory::firstOrFail();

        $this
            ->actingAs($sessionAuthor)
            ->post(route('admin.news.store'), [
                'category_id' => $category->id,
                'user_id' => $otherUser->id,
                'assigned_user_id' => $otherUser->id,
                'title' => 'Artikel Penulis dari Session',
                'excerpt' => 'Penulis artikel harus mengikuti session login.',
                'content' => 'Isi artikel untuk pengujian penulis.',
                'cover_image_url' => '/images/news-dummy/technology-lead.png',
                'status' => NewsArticle::STATUS_DRAFT,
                'is_featured' => false,
            ])
            ->assertRedirect(route('admin.news.index'));

        $article = NewsArticle::where('title', 'Artikel Penulis dari Session')->firstOrFail();

        $this->assertSame($sessionAuthor->id, $article->user_id);
        $this->assertNotSame($otherUser->id, $article->user_id);
    }

    public function test_admin_can_create_and_reassign_article_to_another_writer(): void
    {
        $admin = User::where('email', 'admin@radina.net')->firstOrFail();
        $firstWriter = User::where('email', 'shara@radina.net')->firstOrFail();
        $secondWriter = User::factory()->create([
            'role' => User::ROLE_WRITER,
            'name' => 'Penulis Kedua',
        ]);
        $category = NewsCategory::firstOrFail();

        $this
            ->actingAs($admin)
            ->post(route('admin.news.store'), [
                'category_id' => $category->id,
                'assigned_user_id' => $firstWriter->id,
                'title' => 'Artikel yang Dapat Dialihkan Admin',
                'excerpt' => 'Artikel draft untuk pengujian pengalihan penulis.',
                'content' => 'Isi artikel yang akan dialihkan kepada penulis lain.',
                'cover_image_url' => '/images/news-dummy/technology-lead.png',
                'status' => NewsArticle::STATUS_DRAFT,
                'is_featured' => false,
            ])
            ->assertRedirect(route('admin.news.index'));

        $article = NewsArticle::where('title', 'Artikel yang Dapat Dialihkan Admin')->firstOrFail();
        $this->assertSame($firstWriter->id, $article->user_id);

        $this
            ->actingAs($admin)
            ->patch(route('admin.news.reassign', $article), [
                'assigned_user_id' => $secondWriter->id,
            ])
            ->assertSessionHasNoErrors();

        $this->assertSame($secondWriter->id, $article->fresh()->user_id);
    }

    public function test_verified_user_can_update_and_delete_news(): void
    {
        $user = User::where('email', 'admin@radina.net')->firstOrFail();
        $article = NewsArticle::with('tags')->firstOrFail();

        $this
            ->actingAs($user)
            ->patch(route('admin.news.update', $article), [
                'category_id' => $article->category_id,
                'title' => 'Judul Berita Diperbarui',
                'title_en' => 'Updated News Title',
                'excerpt' => $article->excerpt,
                'excerpt_en' => $article->excerpt_en,
                'content' => $article->content,
                'content_en' => $article->content_en,
                'cover_image_url' => $article->cover_image_url,
                'cover_image_alt' => $article->cover_image_alt,
                'cover_image_alt_en' => $article->cover_image_alt_en,
                'status' => NewsArticle::STATUS_DRAFT,
                'is_featured' => true,
                'published_at' => null,
                'tags' => 'Update',
            ])
            ->assertRedirect(route('admin.news.index'));

        $article->refresh();
        $this->assertSame('Judul Berita Diperbarui', $article->title);
        $this->assertSame(NewsArticle::STATUS_DRAFT, $article->status);
        $this->assertNull($article->published_at);

        $this
            ->actingAs($user)
            ->delete(route('admin.news.destroy', $article))
            ->assertRedirect(route('admin.news.index'));

        $this->assertDatabaseMissing('news_articles', ['id' => $article->id]);
    }
}

<?php

namespace Tests\Feature;

use App\Models\NewsArticle;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class NewsPortalTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed();
    }

    public function test_homepage_renders_the_inertia_news_portal(): void
    {
        $this->get('/')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('News/Home')
                ->has('hero')
                ->has('latest')
                ->has('seo')
                ->has('navigation.categories', 7)
                ->where('portal.contactPhone', '877-2417-0145')
                ->missing('portal.contactEmail')
                ->missing('navigation.mainLinks')
            );
    }

    public function test_article_detail_page_is_accessible_and_tracks_views(): void
    {
        $article = NewsArticle::published()->firstOrFail();
        $initialViews = $article->views_count;

        $this->get(route('news.show', $article))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('News/ArticleShow')
                ->where('article.slug', $article->slug)
                ->has('related')
            );

        $this->assertSame($initialViews + 1, $article->fresh()->views_count);
    }

    public function test_sitemap_contains_news_and_company_profile_urls(): void
    {
        $response = $this->get('/sitemap.xml');

        $response->assertOk();
        $response->assertSee(route('news.home'), false);
        $response->assertSee(route('company.profile'), false);
    }

    public function test_language_switch_changes_shared_locale_and_article_content(): void
    {
        $article = NewsArticle::published()
            ->featured()
            ->latest('published_at')
            ->firstOrFail();

        $this->post(route('language.update', 'en'))
            ->assertRedirect();

        $this->get('/')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('locale', 'en')
                ->where('hero.title', $article->title_en ?: $article->title)
                ->where('hero.excerpt', $article->excerpt_en ?: $article->excerpt)
            );
    }
}

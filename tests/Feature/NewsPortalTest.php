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
            ->assertSee('<link rel="icon" type="image/png" sizes="192x192" href="'.asset('favicon-192x192.png').'">', false)
            ->assertSee('<meta data-inertia="og-image" property="og:image" content="'.asset('images/radina-news-social.jpg').'">', false)
            ->assertSee('<meta data-inertia="og-image-width" property="og:image:width" content="1200">', false)
            ->assertSee('<meta data-inertia="og-image-height" property="og:image:height" content="630">', false)
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
            ->assertSee('<meta data-inertia="robots" name="robots" content="index,follow">', false)
            ->assertSee('<link data-inertia="canonical" rel="canonical" href="'.route('news.show', $article).'">', false)
            ->assertInertia(fn (Assert $page) => $page
                ->component('News/ArticleShow')
                ->where('article.slug', $article->slug)
                ->has('article.images')
                ->has('related')
            );

        $this->assertSame($initialViews + 1, $article->fresh()->views_count);
    }

    public function test_article_seo_title_does_not_repeat_site_name(): void
    {
        $article = NewsArticle::published()->firstOrFail();
        $article->update(['seo_title' => 'Judul Artikel | Radina News | Radina News']);

        $this->get(route('news.show', $article))
            ->assertOk()
            ->assertSee('<title data-inertia="">Judul Artikel | Radina News</title>', false)
            ->assertDontSee('Radina News | Radina News', false);
    }

    public function test_sitemap_contains_news_and_company_profile_urls(): void
    {
        $response = $this->get('/sitemap.xml');

        $response->assertOk();
        $response->assertHeader('Content-Type', 'application/xml; charset=UTF-8');
        $response->assertSee('<?xml version="1.0" encoding="UTF-8"?>', false);
        $response->assertSee(route('news.home'), false);
        $response->assertSee(route('company.profile'), false);
        $response->assertSee($articleUrl = route('news.show', NewsArticle::published()->firstOrFail()), false);
        $response->assertSee(NewsArticle::published()->firstOrFail()->cover_image_url, false);
    }

    public function test_news_sitemap_only_exposes_recent_published_articles(): void
    {
        $recentArticle = NewsArticle::published()->firstOrFail();
        $recentArticle->update(['published_at' => now()->subHour()]);

        $oldArticle = NewsArticle::published()->whereKeyNot($recentArticle->id)->firstOrFail();
        $oldArticle->update(['published_at' => now()->subDays(3)]);

        $this->get('/news-sitemap.xml')
            ->assertOk()
            ->assertHeader('Content-Type', 'application/xml; charset=UTF-8')
            ->assertSee('<?xml version="1.0" encoding="UTF-8"?>', false)
            ->assertSee(route('news.show', $recentArticle), false)
            ->assertDontSee(route('news.show', $oldArticle), false)
            ->assertSee('<news:publication>', false);
    }

    public function test_rss_feed_returns_valid_xml(): void
    {
        $article = NewsArticle::published()
            ->latest('published_at')
            ->firstOrFail();

        $this->get('/rss.xml')
            ->assertOk()
            ->assertHeader('Content-Type', 'application/rss+xml; charset=UTF-8')
            ->assertSee('<?xml version="1.0" encoding="UTF-8"?>', false)
            ->assertSee('<rss version="2.0">', false)
            ->assertSee(route('news.show', $article), false);
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

<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class GoogleAnalyticsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
        $this->seed();
    }

    public function test_enabled_analytics_supplies_the_existing_id_and_known_template_keys_without_loading_a_tag_in_private_html(): void
    {
        config(['services.google_analytics.enabled' => true, 'services.google_analytics.measurement_id' => 'G-7BZHBM3W8L']);
        $response = $this->get('/templates')->assertOk();
        preg_match('/name="radina-google-analytics" content="([^"]+)"/', $response->getContent(), $matches);
        $config = json_decode(html_entity_decode($matches[1]), true);
        $this->assertSame('G-7BZHBM3W8L', $config['id']);
        $this->assertContains('rosalia-arch', $config['templates']);
        foreach (['/admin/login', '/pelanggan/'.str_repeat('a', 64), '/tamu/00000000-0000-0000-0000-000000000000'] as $url) {
            $this->get($url)->assertOk()->assertDontSee('www.googletagmanager.com', false);
        }
        $this->get('/unknown-page')->assertNotFound()->assertDontSee('radina-google-analytics', false);
    }

    public function test_analytics_switch_and_measurement_id_validation_are_respected(): void
    {
        config(['services.google_analytics.enabled' => false]);
        $this->get('/')->assertOk()->assertDontSee('radina-google-analytics', false);
        config(['services.google_analytics.enabled' => true, 'services.google_analytics.measurement_id' => 'G-BAD"><script>alert(1)</script>']);
        $this->get('/')->assertOk()->assertDontSee('radina-google-analytics', false)->assertDontSee('<script>alert(1)</script>', false);
    }
}

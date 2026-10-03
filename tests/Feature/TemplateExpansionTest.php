<?php

namespace Tests\Feature;

use App\Models\Template;
use App\Models\User;
use App\Models\Wedding;
use App\Services\CustomerPortalService;
use App\Services\DeploymentLicenseGuard;
use App\Services\TemplateCatalog;
use App\Services\TemplateContent;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TemplateExpansionTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
        $this->seed();
        Sanctum::actingAs(User::where('email', config('platform.admin_email'))->first());
    }

    public function test_every_public_category_has_at_least_five_active_working_templates_and_diverse_animation_effects(): void
    {
        config(['platform.api_rate_limit' => 1000]);
        $categories = $this->getJson('/api/categories')->assertOk()->assertJsonCount(11, 'data')->json('data');
        $effects = [];
        $templates = Template::where('status', 'ACTIVE')->get();
        $this->assertCount(56, $templates);
        $this->assertCount(56, TemplateCatalog::KEYS);
        foreach ($categories as $category) {
            $count = $this->getJson('/api/templates?category='.$category['slug'])->assertOk()->json('meta.total');
            $this->assertGreaterThanOrEqual(5, $count, $category['name']);
        }
        foreach ($templates as $template) {
            $animations = TemplateContent::animations($template->template_key);
            $this->assertGreaterThanOrEqual(2, count($animations['effects']));
            $this->assertCount(count($animations['effects']), $animations['labels']);
            $effects = array_merge($effects, $animations['effects']);
            $asset = str_replace('/storage/templates/previews/', '/images/templates/previews/', $template->thumbnail);
            $this->assertFileExists(base_path('frontend/public'.$asset));
            $this->getJson('/api/templates/'.$template->slug.'/preview')->assertOk()->assertJsonPath('data.template.animations.effects', $animations['effects']);
        }
        $this->assertGreaterThanOrEqual(18, count(array_unique($effects)));
        $studio = json_decode(file_get_contents(config_path('template-studio.json')), true);
        $this->assertCount(31, $studio);
        foreach ($studio as $design) {
            $this->assertFileExists(base_path('frontend/public/images/demos/photo-'.$design['hero_photo'].'.webp'));
        }
        $this->assertCount(31, array_unique(array_column($studio, 'layout')));
        $this->assertGreaterThanOrEqual(7, count(array_unique(array_column($studio, 'family'))));
    }

    public function test_reseeding_keeps_existing_customer_content_approval_prices_and_license_records(): void
    {
        $template = Template::where('template_key', 'confetti-club')->first();
        $id = $this->postJson('/api/orders', ['template_id' => $template->id, 'customer_name' => 'Existing Customer', 'whatsapp' => '081234567890', 'bride_name' => 'Actual Bride', 'groom_name' => 'Actual Groom', 'slug' => 'preserved-customer'])->assertCreated()->json('data.id');
        $this->patchJson('/api/admin/orders/'.$id.'/payment')->assertOk();
        $weddingId = $this->postJson('/api/admin/orders/'.$id.'/wedding')->assertCreated()->json('data.id');
        $wedding = Wedding::findOrFail($weddingId);
        $wedding->update(['opening_text' => 'Tulisan asli pelanggan', 'quote' => 'Pesan keluarga pelanggan', 'section_order' => ['home', 'event', 'couple', 'closing']]);
        $template->update(['price' => 345678, 'status' => 'INACTIVE']);
        $before = CustomerPortalService::preview($wedding->fresh());
        $fingerprint = CustomerPortalService::fingerprint($wedding);
        $guard = app(DeploymentLicenseGuard::class);
        $snapshot = $guard->backup(str_repeat('c', 40));
        $this->seed();
        $guard->assertPreserved($snapshot);
        $this->assertSame($before, CustomerPortalService::preview($wedding->fresh()));
        $this->assertSame($fingerprint, CustomerPortalService::fingerprint($wedding->fresh()));
        $this->assertSame(345678, $template->fresh()->price);
        $this->assertSame('INACTIVE', $template->fresh()->status);
    }
}

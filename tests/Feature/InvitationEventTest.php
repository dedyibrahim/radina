<?php

namespace Tests\Feature;

use App\Http\Resources\WeddingResource;
use App\Models\Order;
use App\Models\Template;
use App\Models\User;
use App\Models\Wedding;
use App\Services\CustomerPortalService;
use App\Services\DeploymentLicenseGuard;
use App\Services\InvitationEvent;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class InvitationEventTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
        $this->seed();
        Sanctum::actingAs(User::where('email', config('platform.admin_email'))->first());
    }

    private function booking(string $type, string $slug): array
    {
        return ['template_id' => Template::where('template_key', 'nur-jannah')->first()->id, 'event_type' => $type,
            'customer_name' => 'Dedy Ibrahim', 'whatsapp' => '081234567890', 'event_title' => 'Acara '.$slug,
            'host_name' => 'Keluarga Ibrahim', 'honoree_name' => InvitationEvent::profile($type)['honoree'] ? 'Ahmad Ibrahim' : null, 'slug' => $slug];
    }

    private function invitation(string $type): Wedding
    {
        $id = $this->postJson('/api/orders', $this->booking($type, 'event-'.$type))->assertCreated()->json('data.id');
        $this->patchJson('/api/admin/orders/'.$id.'/payment')->assertOk();
        $wedding = $this->postJson('/api/admin/orders/'.$id.'/wedding')->assertCreated()->json('data.id');

        return Wedding::findOrFail($wedding);
    }

    private function payload(Wedding $wedding): array
    {
        $data = (new WeddingResource($wedding->loadContent()))->resolve(request());
        $data['expected_updated_at'] = $wedding->updated_at->toJSON();
        $data['wedding_date'] = '2026-12-24';
        $data['events'] = [['type' => 'syukuran', 'title' => 'Syukuran Bersama', 'date' => '2026-12-24', 'start_time' => '09:00', 'end_time' => '11:00', 'timezone' => 'Asia/Jakarta', 'venue' => 'Aula Radina', 'address' => 'Jalan Mawar', 'google_maps_url' => 'https://maps.google.com/']];

        return $data;
    }

    public function test_royal_garden_additive_install_preserves_existing_templates_customers_and_licenses(): void
    {
        $key = 'javanese-royal-garden';
        Template::where('template_key', $key)->delete();
        $templates = Template::orderBy('id')->get()->map->getRawOriginal()->all();
        $weddings = Wedding::orderBy('id')->get()->map->getRawOriginal()->all();
        $orders = Order::orderBy('id')->get()->map->getRawOriginal()->all();
        $guard = app(DeploymentLicenseGuard::class);
        $licenses = $guard->backup(str_repeat('f', 40));
        $migration = require database_path('migrations/2026_10_08_000005_add_javanese_royal_garden_template.php');
        $migration->up();
        $template = Template::where('template_key', $key)->firstOrFail();
        $this->assertSame(179000, $template->price);
        $this->assertTrue((bool) $template->is_featured);
        $this->assertFileExists(base_path('frontend/public'.$template->thumbnail));
        $template->update(['price' => 187500]);
        $migration->up(); $migration->up();
        $this->assertSame(187500, $template->fresh()->price);
        $this->assertSame(1, Template::where('template_key', $key)->count());
        $this->assertSame($templates, Template::where('template_key', '!=', $key)->orderBy('id')->get()->map->getRawOriginal()->all());
        $this->assertSame($weddings, Wedding::orderBy('id')->get()->map->getRawOriginal()->all());
        $this->assertSame($orders, Order::orderBy('id')->get()->map->getRawOriginal()->all());
        $guard->assertPreserved($licenses);
        $this->getJson('/api/templates/'.$key.'/preview')->assertOk()
            ->assertJsonPath('data.template.template_key', $key)
            ->assertJsonStructure(['data' => ['bride', 'groom', 'events', 'stories', 'gallery', 'gift_methods', 'settings']]);
        $booking = array_replace($this->booking('wedding', 'royal-cms'), [
            'template_id' => $template->id, 'bride_name' => 'Dewi Maharani', 'groom_name' => 'Bagas Pradana',
        ]);
        $id = $this->postJson('/api/orders', $booking)->assertCreated()->assertJsonPath('data.total', 187500)->json('data.id');
        $this->patchJson('/api/admin/orders/'.$id.'/payment')->assertOk();
        $weddingId = $this->postJson('/api/admin/orders/'.$id.'/wedding')->assertCreated()->json('data.id');
        $this->getJson('/api/admin/weddings/'.$weddingId.'/preview')->assertOk()
            ->assertJsonPath('data.template.template_key', $key)
            ->assertJsonPath('data.bride.full_name', 'Dewi Maharani')
            ->assertJsonPath('data.groom.full_name', 'Bagas Pradana');
    }

    public function test_living_garden_catalog_and_repeat_migration_preserve_existing_content_pricing_and_licenses(): void
    {
        $template = Template::where('template_key', 'melati-senja-cinematic')->firstOrFail();
        $this->assertSame(169000, $template->price);
        $this->assertFileExists(base_path('frontend/public'.$template->thumbnail));
        $this->assertFileExists(base_path('frontend/public/images/cinematic/melati-branch.webp'));
        $demos = Wedding::where('is_demo', true)->get()->map->getRawOriginal()->all();
        $this->getJson('/api/templates/'.$template->slug.'/preview')->assertOk()
            ->assertJsonPath('data.template.template_key', $template->template_key)
            ->assertJsonStructure(['data' => ['events', 'gallery', 'gift_methods', 'settings']]);
        $template->update(['price' => 123456]);
        $guard = app(DeploymentLicenseGuard::class);
        $licenses = $guard->backup(str_repeat('d', 40));
        $migration = require database_path('migrations/2026_10_08_000004_add_melati_senja_cinematic_template.php');
        $migration->up(); $migration->up();
        $this->assertSame(123456, $template->fresh()->price);
        $this->assertSame($demos, Wedding::where('is_demo', true)->get()->map->getRawOriginal()->all());
        $this->assertSame(1, Template::where('template_key', $template->template_key)->count());
        $guard->assertPreserved($licenses);
    }

    public function test_regional_catalog_cleanup_preserves_used_templates_custom_prices_customers_and_licenses(): void
    {
        $jawa = Template::where('template_key', 'jawa-pendopo-pagi')->firstOrFail();
        $sunda = Template::where('template_key', 'sunda-kabut-pegunungan')->firstOrFail();
        $sunda->forceFill(['created_at' => now()->addMinute(), 'price' => 98765])->save();
        $this->getJson('/api/templates')->assertOk()->assertJsonPath('data.0.template_key', $sunda->template_key);
        $this->getJson('/api/templates?sort=newest')->assertOk()->assertJsonPath('data.0.template_key', $sunda->template_key);
        $used = $jawa->replicate();
        $used->fill(['slug' => 'bali-taman-air', 'template_key' => 'bali-taman-air'])->save();
        $unused = $jawa->replicate();
        $unused->fill(['slug' => 'minang-rumah-gadang', 'template_key' => 'minang-rumah-gadang'])->save();
        $wedding = $this->invitation('office');
        $wedding->update(['template_id' => $used->id]);
        $order = Order::findOrFail($wedding->order_id);
        $order->update(['template_id' => $used->id]);
        $weddingSnapshot = $wedding->getRawOriginal();
        $orderSnapshot = $order->getRawOriginal();
        $guard = app(DeploymentLicenseGuard::class);
        $licenses = $guard->backup(str_repeat('f', 40));
        $migration = require database_path('migrations/2026_10_08_000003_focus_cinematic_catalog_on_jawa_and_sunda.php');
        $migration->up(); $migration->up();
        $this->seed(\Database\Seeders\RadinaSeeder::class);
        $this->assertNull($unused->fresh());
        $this->assertSame('DISABLED', $used->fresh()->status);
        $this->assertSame($weddingSnapshot, $wedding->fresh()->getRawOriginal());
        $this->assertSame($orderSnapshot, $order->fresh()->getRawOriginal());
        $this->assertSame(98765, $sunda->fresh()->price);
        $this->getJson('/api/templates?category=regional')->assertOk()->assertJsonPath('meta.total', 4);
        $this->getJson('/api/templates/'.$used->slug.'/preview')->assertNotFound();
        $guard->assertPreserved($licenses);
    }

    public function test_cinematic_catalog_birthday_age_template_switch_and_repeat_migration_preserve_customer_data(): void
    {
        $template = Template::where('template_key', 'jawa-pendopo-pagi')->firstOrFail();
        $beforeDemos = Wedding::where('is_demo', true)->get()->map->getRawOriginal()->all();
        $this->getJson('/api/templates/'.$template->slug.'/preview?event_type=birthday')->assertOk()
            ->assertJsonPath('data.event_type', 'birthday')->assertJsonPath('data.event_details.honoree_age', 7)
            ->assertJsonPath('data.bride', null);
        $this->assertSame($beforeDemos, Wedding::where('is_demo', true)->get()->map->getRawOriginal()->all());

        $booking = array_replace($this->booking('birthday', 'cinematic-birthday'), ['template_id' => $template->id, 'honoree_age' => 7]);
        $this->postJson('/api/orders', array_replace($booking, ['honoree_age' => 999]))->assertUnprocessable()->assertJsonValidationErrors('honoree_age');
        $id = $this->postJson('/api/orders', $booking)->assertCreated()->assertJsonPath('data.honoree_age', 7)->json('data.id');
        $this->patchJson('/api/admin/orders/'.$id.'/payment')->assertOk();
        $weddingId = $this->postJson('/api/admin/orders/'.$id.'/wedding')->assertCreated()->json('data.id');
        $wedding = Wedding::findOrFail($weddingId);
        $this->assertEquals(7, $wedding->event_details['honoree_age']);
        $payload = $this->payload($wedding);
        $payload['template_id'] = Template::where('template_key', 'sunda-kabut-pegunungan')->firstOrFail()->id;
        $payload['event_details']['description'] = 'Pesan asli keluarga, tetap tersimpan.';
        $this->putJson('/api/admin/weddings/'.$weddingId, $payload)->assertOk()
            ->assertJsonPath('data.event_details.honoree_age', 7)
            ->assertJsonPath('data.event_details.description', 'Pesan asli keluarga, tetap tersimpan.');
        $template->update(['price' => 123456, 'status' => 'INACTIVE']);
        $snapshot = $wedding->fresh()->getRawOriginal();
        $guard = app(DeploymentLicenseGuard::class);
        $licenses = $guard->backup(str_repeat('e', 40));
        $migration = require database_path('migrations/2026_10_08_000002_add_cinematic_world_templates.php');
        $migration->up(); $migration->up();
        $guard->assertPreserved($licenses);
        $this->assertSame($snapshot, $wedding->fresh()->getRawOriginal());
        $this->assertSame(123456, $template->fresh()->price);
        $this->assertSame('INACTIVE', $template->fresh()->status);
        $this->assertDatabaseCount('templates', count(\App\Services\TemplateCatalog::keys()));
    }

    public function test_five_new_islamic_themes_have_real_demos_and_generic_previews_do_not_change_saved_weddings(): void
    {
        $this->getJson('/api/templates?category=islamic')->assertOk()->assertJsonPath('meta.total', 11);
        foreach (['nur-jannah', 'mihrab-emerald', 'sahara-gold', 'qamar-blue', 'zahra-ivory'] as $key) {
            $template = Template::where('template_key', $key)->firstOrFail();
            $this->assertFileExists(base_path('frontend/public'.$template->thumbnail));
            $this->getJson('/api/templates/'.$key.'/preview')->assertOk()->assertJsonPath('data.template.template_key', $key)->assertJsonPath('data.event_type', 'wedding');
            $wedding = Wedding::where('slug', 'radina-demo-'.$key)->firstOrFail();
            $before = $wedding->toArray();
            $this->getJson('/api/templates/'.$key.'/preview?event_type=office')->assertOk()->assertJsonPath('data.event_type', 'office')->assertJsonPath('data.title', 'Pertemuan Tahunan Radina')->assertJsonPath('data.event_details.host_name', 'PT Radina Nusantara')->assertJsonPath('data.bride', null)->assertJsonPath('data.groom', null);
            $this->assertSame($before, $wedding->refresh()->toArray());
        }
        $this->getJson('/api/templates/nur-jannah/preview?event_type=invalid')->assertUnprocessable();
    }

    public function test_non_wedding_orders_require_only_relevant_names_and_use_server_prices(): void
    {
        foreach (['khitanan', 'office', 'birthday', 'aqiqah', 'other'] as $type) {
            $data = $this->booking($type, 'booking-'.$type);
            $this->postJson('/api/orders', $data + ['total' => 1])->assertCreated()->assertJsonPath('data.event_type', $type)->assertJsonPath('data.bride_name', '')->assertJsonPath('data.groom_name', '')->assertJsonPath('data.total', (int) Template::findOrFail($data['template_id'])->price);
        }
        $data = $this->booking('khitanan', 'missing-child');
        unset($data['honoree_name']);
        $this->postJson('/api/orders', $data)->assertUnprocessable()->assertJsonValidationErrors('honoree_name');
        $data = $this->booking('office', 'missing-company');
        unset($data['host_name']);
        $this->postJson('/api/orders', $data)->assertUnprocessable()->assertJsonValidationErrors('host_name');
        $data = $this->booking('wedding', 'wedding-names-still-required');
        $this->postJson('/api/orders', $data)->assertUnprocessable()->assertJsonValidationErrors(['bride_name', 'groom_name']);
        $this->postJson('/api/orders', $this->booking('invalid', 'invalid-kind'))->assertUnprocessable()->assertJsonValidationErrors('event_type');
        $this->postJson('/api/orders', array_replace($this->booking('office', 'array-kind'), ['event_type' => ['office']]))->assertUnprocessable()->assertJsonValidationErrors('event_type');
    }

    public function test_all_five_non_wedding_types_can_be_saved_and_published_without_couple_records(): void
    {
        $guard = app(DeploymentLicenseGuard::class);
        $snapshot = $guard->backup(str_repeat('b', 40));
        foreach (['khitanan', 'office', 'birthday', 'aqiqah', 'other'] as $type) {
            $wedding = $this->invitation($type);
            $this->assertSame(0, $wedding->couples()->count());
            $this->assertFalse($wedding->settings->enable_gift);
            $this->putJson('/api/admin/weddings/'.$wedding->id, $this->payload($wedding))->assertOk()->assertJsonPath('data.event_type', $type)->assertJsonPath('data.bride', null);
            $this->postJson('/api/admin/weddings/'.$wedding->id.'/publish')->assertOk()->assertJsonPath('data.status', 'PUBLISHED');
            $this->getJson('/api/weddings/'.$wedding->slug)->assertOk()->assertJsonPath('data.event_type', $type)->assertJsonPath('data.event_details.host_name', 'Keluarga Ibrahim');
            $this->postJson('/api/weddings/'.$wedding->slug.'/rsvp', ['name' => 'Tamu Acara', 'guests' => 2, 'attendance' => 'Hadir', 'message' => 'Sampai bertemu'])->assertSuccessful();
        }
        $guard->assertPreserved($snapshot);
    }

    public function test_khitanan_customer_form_and_review_use_child_and_host_data_with_no_required_bride_or_groom(): void
    {
        $wedding = $this->invitation('khitanan');
        $path = '/api/admin/weddings/'.$wedding->id.'/customer-portal';
        $token = basename($this->postJson($path)->assertOk()->json('data.link'));
        $customer = '/api/customer-portals/'.$token;
        $this->getJson($customer)->assertOk()->assertJsonPath('data.event_type', 'khitanan')->assertJsonPath('data.form.event_details.honoree_name', 'Ahmad Ibrahim');
        $data = app(CustomerPortalService::class)->initial($wedding);
        $data['wedding_date'] = '2026-12-24';
        $data['events'] = $this->payload($wedding)['events'];
        $data['event_details']['father_name'] = 'Dedy Ibrahim';
        $this->putJson($customer, ['data' => $data, 'expected_submission_version' => 0, 'submit' => true])->assertOk()->assertJsonPath('data.status', 'SUBMITTED');
        $this->postJson($path.'/apply', ['expected_updated_at' => $wedding->updated_at->toJSON(), 'expected_submission_version' => 1])->assertOk()->assertJsonPath('data.wedding.event_details.father_name', 'Dedy Ibrahim');
        $this->postJson('/api/admin/weddings/'.$wedding->id.'/publish')->assertUnprocessable();
        $preview = $this->getJson($customer.'/preview')->assertOk()->json('data');
        $this->postJson($customer.'/response', ['decision' => 'approve', 'fingerprint' => $preview['fingerprint']])->assertOk();
        $this->postJson('/api/admin/weddings/'.$wedding->id.'/publish')->assertOk();
        $data['event_type'] = 'wedding';
        $this->putJson($customer, ['data' => $data, 'expected_submission_version' => 1, 'submit' => true])->assertUnprocessable();
    }

    public function test_event_csv_and_guest_link_imports_use_generic_fields_and_preserve_admin_event_type(): void
    {
        $wedding = $this->invitation('office');
        $path = '/api/admin/weddings/'.$wedding->id;
        $this->putJson($path, $this->payload($wedding))->assertOk();
        $wedding->refresh();
        $response = $this->get($path.'/content/template')->assertOk();
        $csv = $response->streamedContent();
        $this->assertStringContainsString('event_details.host_name', $csv);
        $this->assertStringNotContainsString('bride.full_name', $csv);
        $upload = UploadedFile::fake()->createWithContent('office.csv', "kunci;nilai\nevent_details.host_name;PT Radina Indonesia\nevent_details.description;Pertemuan tahunan perusahaan\n");
        $this->postJson($path.'/content/import', ['file' => $upload, 'expected_updated_at' => $wedding->updated_at->toJSON()])->assertOk()->assertJsonPath('data.event_details.host_name', 'PT Radina Indonesia')->assertJsonPath('data.event_type', 'office');
        $this->postJson($path.'/invitees/import', ['file' => UploadedFile::fake()->createWithContent('guests.csv', "nama;alamat\nRekan Kantor;Jakarta\n")])->assertCreated();
        $this->postJson($path.'/publish')->assertOk();
        $this->get($path.'/invitees/export')->assertOk();
    }

    public function test_hidden_event_metadata_does_not_invalidate_wedding_approval_but_visible_non_wedding_data_does(): void
    {
        $wedding = Wedding::where('slug', 'demo-romantic-floral')->first();
        $before = CustomerPortalService::fingerprint($wedding);
        $wedding->update(['event_details' => ['host_name' => 'Invisible wedding metadata']]);
        $this->assertSame($before, CustomerPortalService::fingerprint($wedding->fresh()));
        $wedding = $this->invitation('office');
        $before = CustomerPortalService::fingerprint($wedding);
        $wedding->update(['event_details' => ['host_name' => 'Another company']]);
        $this->assertNotSame($before, CustomerPortalService::fingerprint($wedding->fresh()));
    }
}

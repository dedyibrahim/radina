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

    public function test_five_new_islamic_themes_have_real_demos_and_generic_previews_do_not_change_saved_weddings(): void
    {
        $this->getJson('/api/templates?category=islamic')->assertOk()->assertJsonPath('meta.total', 6);
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
            $this->postJson('/api/orders', $data + ['total' => 1])->assertCreated()->assertJsonPath('data.event_type', $type)->assertJsonPath('data.bride_name', '')->assertJsonPath('data.groom_name', '')->assertJsonPath('data.total', 149000);
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

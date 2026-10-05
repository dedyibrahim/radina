<?php

namespace Tests\Feature;

use App\Models\License;
use App\Models\Order;
use App\Models\Template;
use App\Models\User;
use App\Models\Wedding;
use App\Services\CustomerPortalService;
use App\Services\DeploymentLicenseGuard;
use App\Services\WeddingContentCsv;
use App\Services\WeddingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class EventVisibilityTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
        $this->seed();
        Sanctum::actingAs(User::where('email', config('platform.admin_email'))->first());
    }

    private function wedding(string $slug = 'event-visibility'): Wedding
    {
        $order = Order::create(['template_id' => Template::first()->id, 'order_number' => 'WD-'.$slug, 'customer_name' => 'Pemilik Undangan', 'whatsapp' => '6281234567890', 'bride_name' => 'Alya Putri', 'groom_name' => 'Dedy Ibrahim', 'slug' => $slug, 'total' => 90000, 'status' => 'PAID']);
        $order->payment()->create(['amount' => 90000, 'status' => 'PAID']);
        $id = $this->postJson('/api/admin/orders/'.$order->id.'/wedding')->assertCreated()->json('data.id');
        $wedding = Wedding::findOrFail($id);
        $wedding->update(['wedding_date' => '2026-12-20']);
        foreach (['Akad Nikah', 'Resepsi'] as $index => $title) {
            $wedding->events()->create(['type' => $index === 0 ? 'akad' : 'reception', 'title' => $title, 'date' => '2026-12-20', 'start_time' => $index === 0 ? '09:00' : '11:00', 'end_time' => $index === 0 ? '10:00' : '14:00', 'timezone' => 'Asia/Jakarta', 'venue' => $index === 0 ? 'Rumah Keluarga' : 'Gedung Mawar', 'address' => 'Alamat '.$index, 'google_maps_url' => 'https://maps.google.com/?q=lokasi'.$index, 'sort_order' => $index]);
        }

        return $wedding->fresh();
    }

    private function path(Wedding $wedding): string
    {
        return '/api/admin/weddings/'.$wedding->id;
    }

    private function data(Wedding $wedding): array
    {
        $data = app(WeddingContentCsv::class)->data($wedding->fresh(), Request::create($this->path($wedding)));
        $data['expected_updated_at'] = $data['updated_at'];

        return $data;
    }

    private function token(Wedding $wedding): string
    {
        return basename($this->postJson($this->path($wedding).'/customer-portal')->assertOk()->json('data.link'));
    }

    public function test_upgrade_preserves_old_previews_events_family_display_and_licenses(): void
    {
        $wedding = $this->wedding();
        $other = $this->wedding('legacy-family-hidden');
        $other->settings()->update(['enable_parents' => false, 'enable_family' => false]);
        $this->putJson($this->path($wedding), $this->data($wedding))->assertOk();
        $this->putJson($this->path($other), $this->data($other))->assertOk();
        License::create(['key' => 'ABCDE-FGHIJ-KLMNO-PQRST-UVWXY', 'customer_name' => 'Pemilik Lisensi', 'product_name' => 'Produk', 'status' => 'active', 'max_activations' => 1]);
        $guard = app(DeploymentLicenseGuard::class);
        $backup = $guard->backup(str_repeat('f', 40));
        $migration = require database_path('migrations/2026_10_05_000017_add_event_and_family_visibility.php');
        // MySQL DDL commits the test transaction; rebuild only the isolated test DB afterwards.
        \Illuminate\Foundation\Testing\RefreshDatabaseState::$migrated = false;
        $migration->down();
        $before = CustomerPortalService::fingerprint($wedding->fresh());
        $hiddenBefore = CustomerPortalService::fingerprint($other->fresh());
        $rowsBefore = $wedding->events()->get()->toArray();
        $migration->up();
        $this->assertSame($before, CustomerPortalService::fingerprint($wedding->fresh()));
        $this->assertSame($hiddenBefore, CustomerPortalService::fingerprint($other->fresh()));
        $this->assertTrue($wedding->fresh()->settings->enable_family);
        $this->assertFalse($other->fresh()->settings->enable_family);
        foreach ($wedding->events()->get() as $index => $event) {
            $this->assertSame($rowsBefore[$index], collect($event->toArray())->except(['is_visible', 'show_on_map'])->all());
            $this->assertTrue($event->is_visible);
            $this->assertSame($index === 0, $event->show_on_map);
        }
        $guard->assertPreserved($backup);
    }

    public function test_switches_preserve_event_rows_and_old_clients_keep_selected_locations(): void
    {
        $wedding = $this->wedding();
        $this->putJson($this->path($wedding), $this->data($wedding))->assertOk();
        $before = $wedding->events()->get()->map->only(['id', 'title', 'date', 'start_time', 'end_time', 'venue', 'address', 'google_maps_url', 'created_at'])->all();
        $original = CustomerPortalService::fingerprint($wedding->fresh());
        $data = $this->data($wedding);
        $data['events'][0]['show_on_map'] = false;
        $data['events'][1]['show_on_map'] = true;
        $this->putJson($this->path($wedding), $data)->assertOk()->assertJsonPath('data.events.0.show_on_map', false)->assertJsonPath('data.events.1.show_on_map', true);
        $this->assertNotSame($original, CustomerPortalService::fingerprint($wedding->fresh()));
        $data = $this->data($wedding);
        $data['events'][0]['is_visible'] = false;
        $this->putJson($this->path($wedding), $data)->assertOk()->assertJsonPath('data.events.0.is_visible', false);
        $data = $this->data($wedding);
        foreach ($data['events'] as &$event) unset($event['is_visible'], $event['show_on_map']);
        unset($event);
        $this->putJson($this->path($wedding), $data)->assertOk()->assertJsonPath('data.events.0.is_visible', false)->assertJsonPath('data.events.0.show_on_map', false)->assertJsonPath('data.events.1.show_on_map', true);
        $this->assertEquals($before, $wedding->events()->get()->map->only(['id', 'title', 'date', 'start_time', 'end_time', 'venue', 'address', 'google_maps_url', 'created_at'])->all());
        $data = $this->data($wedding);
        $data['events'][0]['is_visible'] = 'invalid';
        $this->putJson($this->path($wedding), $data)->assertUnprocessable()->assertJsonValidationErrors('events.0.is_visible');
    }

    public function test_location_choices_follow_reordered_events_and_csv_round_trip(): void
    {
        $wedding = $this->wedding();
        $data = $this->data($wedding);
        $data['events'][0]['show_on_map'] = false;
        $data['events'][1]['show_on_map'] = true;
        $data['events'] = array_reverse($data['events']);
        $this->putJson($this->path($wedding), $data)->assertOk()->assertJsonPath('data.events.0.title', 'Resepsi')->assertJsonPath('data.events.0.show_on_map', true)->assertJsonPath('data.events.1.show_on_map', false);
        $file = UploadedFile::fake()->createWithContent('switches.csv', "kunci;nilai\nevents.1.show_on_map;tidak\nevents.2.show_on_map;ya\nevents.2.is_visible;tidak\nsettings.enable_family;tidak\n");
        $this->postJson($this->path($wedding).'/content/import', ['file' => $file, 'expected_updated_at' => $wedding->fresh()->updated_at->toJSON()])->assertOk()->assertJsonPath('data.events.0.show_on_map', false)->assertJsonPath('data.events.1.show_on_map', true)->assertJsonPath('data.events.1.is_visible', false)->assertJsonPath('data.settings.enable_family', false);
        $csv = $this->get($this->path($wedding).'/content/export')->assertOk()->streamedContent();
        $this->assertStringContainsString('events.1.show_on_map;tidak;', $csv);
        $this->assertStringContainsString('events.2.show_on_map;ya;', $csv);
        $this->assertStringContainsString('events.2.is_visible;tidak;', $csv);
        $this->assertStringContainsString('settings.enable_family;tidak;', $csv);
    }

    public function test_customer_submissions_and_old_saved_forms_preserve_event_choices(): void
    {
        $wedding = $this->wedding();
        $wedding->events()->where('sort_order', 0)->update(['show_on_map' => false]);
        $wedding->events()->where('sort_order', 1)->update(['show_on_map' => true]);
        $token = $this->token($wedding);
        $path = '/api/customer-portals/'.$token;
        $form = $this->getJson($path)->assertOk()->assertJsonPath('data.form.events.0.show_on_map', false)->assertJsonPath('data.form.events.1.show_on_map', true)->json('data.form');
        foreach ($form['events'] as &$event) unset($event['is_visible'], $event['show_on_map']);
        unset($event);
        $wedding->customerPortal()->firstOrFail()->update(['submission' => $form, 'submission_version' => 1]);
        $this->getJson($path)->assertOk()->assertJsonPath('data.form.events.0.show_on_map', false)->assertJsonPath('data.form.events.1.show_on_map', true);
        // An old client omitting flags cannot reset the admin's selected reception location.
        $this->putJson($path, ['data' => $form, 'expected_submission_version' => 1, 'submit' => true])->assertOk()->assertJsonPath('data.form.events.1.show_on_map', true);
        $this->postJson($this->path($wedding).'/customer-portal/apply', ['expected_updated_at' => $wedding->fresh()->updated_at->toJSON(), 'expected_submission_version' => 2])->assertOk()->assertJsonPath('data.wedding.events.1.show_on_map', true);
        $form = $this->getJson($path)->json('data.form');
        $form['events'][0]['is_visible'] = false;
        $form['events'][1]['show_on_map'] = false;
        $this->putJson($path, ['data' => $form, 'expected_submission_version' => 2, 'submit' => true])->assertOk()->assertJsonPath('data.form.events.0.is_visible', false);
        $this->postJson($this->path($wedding).'/customer-portal/apply', ['expected_updated_at' => $wedding->fresh()->updated_at->toJSON(), 'expected_submission_version' => 3])->assertOk()->assertJsonPath('data.wedding.events.0.is_visible', false)->assertJsonPath('data.wedding.events.1.show_on_map', false);
    }

    public function test_live_invitation_and_customer_submission_require_a_visible_event(): void
    {
        $wedding = $this->wedding();
        $token = $this->token($wedding);
        $data = $this->data($wedding);
        foreach ($data['events'] as &$event) $event['is_visible'] = false;
        unset($event);
        $wedding->update(['status' => 'PUBLISHED']);
        $data['expected_updated_at'] = $wedding->fresh()->updated_at->toJSON();
        $this->putJson($this->path($wedding), $data)->assertUnprocessable()->assertJsonValidationErrors('events');
        $form = app(CustomerPortalService::class)->initial($wedding->fresh());
        foreach ($form['events'] as &$event) $event['is_visible'] = false;
        unset($event);
        $this->putJson('/api/customer-portals/'.$token, ['data' => $form, 'expected_submission_version' => 0, 'submit' => true])->assertUnprocessable()->assertJsonValidationErrors('data.events');
        $wedding->update(['status' => 'DRAFT']);
        $data['expected_updated_at'] = $wedding->fresh()->updated_at->toJSON();
        $this->putJson($this->path($wedding), $data)->assertOk();
        try {
            app(WeddingService::class)->validateForPublication($wedding->fresh());
            $this->fail('An invitation with no visible event must not publish.');
        } catch (ValidationException $exception) {
            $this->assertArrayHasKey('events', $exception->errors());
        }
    }

    public function test_family_switch_is_independent_and_never_deletes_couple_data(): void
    {
        $wedding = $this->wedding();
        $wedding->couples()->update(['father_name' => 'Bapak Tersimpan', 'mother_name' => 'Ibu Tersimpan', 'family_order' => 'Putri pertama dari', 'instagram' => 'akun_tersimpan']);
        $this->putJson($this->path($wedding), $this->data($wedding))->assertOk();
        $before = CustomerPortalService::fingerprint($wedding->fresh());
        foreach ([[true, false], [false, true], [false, false], [true, true]] as [$parents, $family]) {
            $data = $this->data($wedding);
            $data['settings']['enable_parents'] = $parents;
            $data['settings']['enable_family'] = $family;
            $this->putJson($this->path($wedding), $data)->assertOk()->assertJsonPath('data.settings.enable_parents', $parents)->assertJsonPath('data.settings.enable_family', $family)->assertJsonPath('data.bride.family_order', 'Putri pertama dari')->assertJsonPath('data.bride.father_name', 'Bapak Tersimpan')->assertJsonPath('data.bride.instagram', 'akun_tersimpan');
            $this->assertSame(! ($parents && $family), $before !== CustomerPortalService::fingerprint($wedding->fresh()));
        }
        $data = $this->data($wedding);
        $data['settings']['enable_family'] = false;
        $this->putJson($this->path($wedding), $data)->assertOk();
        $data = $this->data($wedding);
        unset($data['settings']['enable_family']);
        $this->putJson($this->path($wedding), $data)->assertOk()->assertJsonPath('data.settings.enable_family', false);
    }
}

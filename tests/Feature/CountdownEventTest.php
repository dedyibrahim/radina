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
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CountdownEventTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
        $this->seed();
        Sanctum::actingAs(User::where('email', config('platform.admin_email'))->first());
    }

    private function wedding(): Wedding
    {
        $order = Order::create(['template_id' => Template::first()->id, 'order_number' => 'WD-COUNTDOWN', 'customer_name' => 'Pelanggan Countdown', 'whatsapp' => '6281234567890', 'bride_name' => 'Alya Putri', 'groom_name' => 'Dedy Ibrahim', 'slug' => 'countdown-customer', 'total' => 90000, 'status' => 'PAID']);
        $order->payment()->create(['amount' => 90000, 'status' => 'PAID']);
        $id = $this->postJson('/api/admin/orders/'.$order->id.'/wedding')->assertCreated()->json('data.id');
        $wedding = Wedding::findOrFail($id);
        $wedding->update(['wedding_date' => '2026-11-14']);
        foreach (['Akad Nikah', 'Resepsi'] as $index => $title) {
            $wedding->events()->create(['type' => $index === 0 ? 'akad' : 'reception', 'title' => $title, 'date' => $index === 0 ? '2026-11-14' : '2026-11-15', 'start_time' => $index === 0 ? '09:00' : '14:00', 'end_time' => $index === 0 ? '10:00' : '16:00', 'timezone' => $index === 0 ? 'Asia/Jakarta' : 'Asia/Makassar', 'venue' => 'Gedung '.$index, 'address' => 'Alamat '.$index, 'sort_order' => $index]);
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

    public function test_countdown_upgrade_keeps_existing_approvals_content_and_licenses(): void
    {
        $wedding = $this->wedding();
        License::create(['key' => 'ABCDE-FGHIJ-KLMNO-PQRST-UVWXY', 'customer_name' => 'Pemilik Lisensi', 'product_name' => 'Produk', 'status' => 'active', 'max_activations' => 1]);
        $guard = app(DeploymentLicenseGuard::class);
        $backup = $guard->backup(str_repeat('c', 40));
        $migration = require database_path('migrations/2026_10_05_000018_add_countdown_event_selection.php');
        \Illuminate\Foundation\Testing\RefreshDatabaseState::$migrated = false;
        $migration->down();
        $before = CustomerPortalService::fingerprint($wedding->fresh());
        $rows = $wedding->events()->get()->toArray();
        $migration->up();
        $this->assertSame($before, CustomerPortalService::fingerprint($wedding->fresh()));
        foreach ($wedding->events()->get() as $index => $event) {
            $this->assertFalse($event->use_for_countdown);
            $this->assertSame($rows[$index], collect($event->toArray())->except('use_for_countdown')->all());
        }
        $guard->assertPreserved($backup);
    }

    public function test_countdown_source_is_saved_without_recreating_events_and_old_clients_preserve_it(): void
    {
        $wedding = $this->wedding();
        $this->putJson($this->path($wedding), $this->data($wedding))->assertOk();
        $before = $wedding->events()->get()->map->only(['id', 'title', 'date', 'start_time', 'end_time', 'timezone', 'venue', 'address', 'created_at'])->all();
        $fingerprint = CustomerPortalService::fingerprint($wedding->fresh());
        $data = $this->data($wedding);
        $data['events'][1]['use_for_countdown'] = true;
        $this->putJson($this->path($wedding), $data)->assertOk()->assertJsonPath('data.events.0.use_for_countdown', false)->assertJsonPath('data.events.1.use_for_countdown', true);
        $this->assertEquals($before, $wedding->events()->get()->map->only(['id', 'title', 'date', 'start_time', 'end_time', 'timezone', 'venue', 'address', 'created_at'])->all());
        $this->assertNotSame($fingerprint, CustomerPortalService::fingerprint($wedding->fresh()));
        $data = $this->data($wedding);
        foreach ($data['events'] as &$event) unset($event['use_for_countdown']);
        unset($event);
        $this->putJson($this->path($wedding), $data)->assertOk()->assertJsonPath('data.events.1.use_for_countdown', true);
        $data = $this->data($wedding);
        $data['events'] = array_reverse($data['events']);
        $this->putJson($this->path($wedding), $data)->assertOk()->assertJsonPath('data.events.0.title', 'Resepsi')->assertJsonPath('data.events.0.use_for_countdown', true)->assertJsonPath('data.events.1.use_for_countdown', false);
        $data = $this->data($wedding);
        $data['events'][0]['use_for_countdown'] = false;
        $this->putJson($this->path($wedding), $data)->assertOk();
        $this->assertSame(0, $wedding->events()->where('use_for_countdown', true)->count());
    }

    public function test_invalid_multiple_hidden_and_malformed_sources_are_rejected_atomically(): void
    {
        $wedding = $this->wedding();
        $data = $this->data($wedding);
        $data['events'][0]['use_for_countdown'] = true;
        $data['events'][1]['use_for_countdown'] = true;
        $this->putJson($this->path($wedding), $data)->assertUnprocessable()->assertJsonValidationErrors('events');
        $data['events'][0]['use_for_countdown'] = false;
        $data['events'][1]['is_visible'] = false;
        $this->putJson($this->path($wedding), $data)->assertUnprocessable()->assertJsonValidationErrors('events.1.use_for_countdown');
        $data['events'][1]['is_visible'] = true;
        $data['events'][1]['use_for_countdown'] = 'invalid';
        $this->putJson($this->path($wedding), $data)->assertUnprocessable()->assertJsonValidationErrors('events.1.use_for_countdown');
        $this->assertSame(0, $wedding->events()->where('use_for_countdown', true)->count());
        $this->assertSame(2, $wedding->events()->where('is_visible', true)->count());
    }

    public function test_customer_submission_apply_and_csv_export_keep_the_selected_event(): void
    {
        $wedding = $this->wedding();
        $token = basename($this->postJson($this->path($wedding).'/customer-portal')->assertOk()->json('data.link'));
        $customer = '/api/customer-portals/'.$token;
        $form = $this->getJson($customer)->assertOk()->json('data.form');
        $form['events'][1]['use_for_countdown'] = true;
        $this->putJson($customer, ['data' => $form, 'expected_submission_version' => 0, 'submit' => true])->assertOk()->assertJsonPath('data.form.events.1.use_for_countdown', true);
        $this->postJson($this->path($wedding).'/customer-portal/apply', ['expected_updated_at' => $wedding->fresh()->updated_at->toJSON(), 'expected_submission_version' => 1])->assertOk()->assertJsonPath('data.wedding.events.1.use_for_countdown', true);
        $form = $this->getJson($customer)->json('data.form');
        foreach ($form['events'] as &$event) unset($event['use_for_countdown']);
        unset($event);
        $this->putJson($customer, ['data' => $form, 'expected_submission_version' => 1, 'submit' => false])->assertOk()->assertJsonPath('data.form.events.1.use_for_countdown', true);
        $form['events'][0]['use_for_countdown'] = true;
        $form['events'][1]['use_for_countdown'] = true;
        $this->putJson($customer, ['data' => $form, 'expected_submission_version' => 2, 'submit' => true])->assertUnprocessable()->assertJsonValidationErrors('data.events');
        $form['events'][0]['use_for_countdown'] = false;
        $form['events'][1]['is_visible'] = false;
        $this->putJson($customer, ['data' => $form, 'expected_submission_version' => 2, 'submit' => true])->assertUnprocessable()->assertJsonValidationErrors('data.events.1.use_for_countdown');
        $csv = $this->get($this->path($wedding).'/content/export')->assertOk()->streamedContent();
        $this->assertStringContainsString('events.1.use_for_countdown;tidak;', $csv);
        $this->assertStringContainsString('events.2.use_for_countdown;ya;', $csv);
        $file = UploadedFile::fake()->createWithContent('countdown.csv', "kunci;nilai\nevents.1.use_for_countdown;ya\nevents.2.use_for_countdown;tidak\n");
        $this->postJson($this->path($wedding).'/content/import', ['file' => $file, 'expected_updated_at' => $wedding->fresh()->updated_at->toJSON()])->assertOk()->assertJsonPath('data.events.0.use_for_countdown', true)->assertJsonPath('data.events.1.use_for_countdown', false);
    }
}

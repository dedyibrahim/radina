<?php

namespace Tests\Feature;

use App\Models\InvitationAddon;
use App\Models\InvitationPackage;
use App\Models\Order;
use App\Models\OrderReminder;
use App\Models\Template;
use App\Models\User;
use App\Models\Wedding;
use App\Models\WeddingInvitee;
use App\Services\OrderDocumentService;
use App\Services\OrderReminderService;
use App\Services\WeddingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class InvitationBusinessToolsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
        $this->seed();
    }

    private function admin(): User
    {
        $user = User::where('email', config('platform.admin_email'))->firstOrFail();
        Sanctum::actingAs($user);

        return $user;
    }

    private function input(array $extra = []): array
    {
        return array_merge(['template_id' => Template::first()->id, 'customer_name' => 'Pemesan Uji', 'whatsapp' => '081234567890', 'bride_name' => 'Nadia', 'groom_name' => 'Fajar', 'slug' => 'business-'.Str::lower(Str::random(12))], $extra);
    }

    private function realWedding(?array $pricing = null): Wedding
    {
        $demo = Wedding::where('is_demo', true)->first()->loadContent();
        $order = Order::create($this->input() + ['order_number' => 'WD-TEST-'.Str::uuid(), 'status' => 'CONTENT_PROCESS', 'total' => 149000, 'is_demo' => false, 'pricing_snapshot' => $pricing]);
        $order->payment()->create(['amount' => $order->total, 'payment_method' => 'MANUAL_TRANSFER', 'status' => 'PAID', 'confirmed_at' => now()]);
        $wedding = $demo->replicate();
        $wedding->order_id = $order->id;
        $wedding->slug = $order->slug;
        $wedding->status = 'DRAFT';
        $wedding->is_demo = false;
        $wedding->published_at = null;
        $wedding->expires_at = null;
        $wedding->save();
        foreach (['couples', 'events', 'settings'] as $relation) {
            foreach ($demo->{$relation} instanceof \Illuminate\Support\Collection ? $demo->{$relation} : collect([$demo->{$relation}]) as $row) {
                $copy = $row->replicate();
                $copy->wedding_id = $wedding->id;
                $copy->save();
            }
        }

        return app(WeddingService::class)->publish($wedding, User::where('role', 'admin')->firstOrFail()->id);
    }

    private function guest(Wedding $wedding, string $name = 'Tamu Terdaftar'): WeddingInvitee
    {
        return WeddingInvitee::create(['wedding_id' => $wedding->id, 'name' => $name, 'address' => 'Alamat pribadi tamu', 'token' => (string) Str::uuid(), 'fingerprint' => hash('sha256', $name)]);
    }

    public function test_packages_are_ready_and_template_only_orders_use_varied_catalog_prices(): void
    {
        $this->assertSame(3, InvitationPackage::count());
        $this->getJson('/api/packages')->assertOk()->assertJsonCount(3, 'data.packages');
        $this->assertGreaterThan(1, Template::distinct()->count('price'));
        $this->postJson('/api/orders', $this->input(['total' => 1]))->assertCreated()->assertJsonPath('data.total', (int) Template::first()->price)->assertJsonPath('data.pricing.package', null);
        foreach (['basic' => 50000, 'premium' => 90000, 'vip' => 150000] as $slug => $price) {
            $package = InvitationPackage::where('slug', $slug)->firstOrFail();
            $this->assertTrue($package->is_active);
            $this->assertSame('FIXED', $package->pricing_mode);
            $this->postJson('/api/orders', $this->input(['package_id' => $package->id]))->assertCreated()->assertJsonPath('data.total', $price);
        }
        $package->update(['is_active' => false]);
        $this->postJson('/api/orders', $this->input(['package_id' => $package->id]))->assertUnprocessable();
        $this->getJson('/api/admin/packages')->assertUnauthorized();
    }

    public function test_catalog_price_migration_preserves_existing_orders_manual_prices_and_licenses(): void
    {
        $response = $this->postJson('/api/orders', $this->input())->assertCreated();
        $order = Order::findOrFail($response->json('data.id'));
        $before = $order->getRawOriginal();
        $guard = app(\App\Services\DeploymentLicenseGuard::class);
        $backup = $guard->backup(str_repeat('d', 40));
        $template = Template::where('template_key', 'minimalist-white')->firstOrFail();
        $template->update(['price' => 149000]);
        $custom = Template::where('template_key', 'elegant-luxury')->firstOrFail();
        $custom->update(['price' => 175000]);
        $basic = InvitationPackage::where('slug', 'basic')->firstOrFail();
        $basic->update(['price' => null, 'is_active' => false, 'pricing_mode' => 'TEMPLATE_PLUS']);
        $vip = InvitationPackage::where('slug', 'vip')->firstOrFail();
        $vip->update(['price' => 180000, 'is_active' => false]);
        $migration = require database_path('migrations/2026_10_05_000016_set_invitation_catalog_prices.php');
        $migration->up();
        $this->assertSame(50000, (int) $template->fresh()->price);
        $this->assertSame(175000, (int) $custom->fresh()->price);
        $this->assertSame(50000, (int) $basic->fresh()->price);
        $this->assertTrue($basic->fresh()->is_active);
        $this->assertSame('FIXED', $basic->fresh()->pricing_mode);
        $this->assertSame(180000, (int) $vip->fresh()->price);
        $this->assertFalse($vip->fresh()->is_active);
        $template->update(['price' => 55000]);
        $migration->up();
        $this->seed(\Database\Seeders\RadinaSeeder::class);
        $this->assertSame(55000, (int) $template->fresh()->price);
        $this->assertSame($before, $order->fresh()->getRawOriginal());
        $guard->assertPreserved($backup);
        $this->assertEqualsCanonicalizing(\App\Services\TemplateCatalog::KEYS, array_keys(config('invitation-pricing.templates')));
    }

    public function test_package_addons_price_snapshots_and_conflicts_are_enforced(): void
    {
        $package = InvitationPackage::first();
        $package->update(['pricing_mode' => 'TEMPLATE_PLUS', 'price' => 50000, 'is_active' => true, 'duration_days' => 90]);
        $addon = InvitationAddon::create(['name' => 'Tambahan', 'price' => 20000, 'is_active' => true]);
        $this->postJson('/api/orders', $this->input(['package_id' => $package->id, 'addon_ids' => [$addon->id], 'expected_total' => 1]))->assertStatus(409);
        $total = (int) Template::first()->price + 70000;
        $result = $this->postJson('/api/orders', $this->input(['package_id' => $package->id, 'addon_ids' => [$addon->id], 'expected_total' => $total, 'total' => 1]))->assertCreated()->assertJsonPath('data.total', $total);
        $order = Order::findOrFail($result->json('data.id'));
        $package->update(['price' => 999000]);
        $addon->update(['price' => 999000]);
        $this->assertSame($total, (int) $order->fresh()->total);
        $this->assertSame(50000, $order->fresh()->pricing_snapshot['package']['price']);
        $package->update(['pricing_mode' => 'FIXED', 'price' => 300000]);
        $this->postJson('/api/orders', $this->input(['package_id' => $package->id]))->assertCreated()->assertJsonPath('data.total', 300000);
        $addon->update(['is_active' => false]);
        $this->postJson('/api/orders', $this->input(['addon_ids' => [$addon->id]]))->assertUnprocessable();
    }

    public function test_admin_must_supply_price_before_activating_and_cannot_change_old_orders(): void
    {
        $this->admin();
        $package = InvitationPackage::first();
        $input = $package->toArray();
        $input['is_active'] = true;
        $input['price'] = null;
        $input['features'] = [];
        $this->putJson('/api/admin/packages/'.$package->id, $input)->assertUnprocessable()->assertJsonValidationErrors('price');
        $input['price'] = 0;
        $this->putJson('/api/admin/packages/'.$package->id, $input)->assertOk()->assertJsonPath('data.is_active', true);
        $this->postJson('/api/admin/addons', ['name' => 'Layanan opsional', 'price' => 25000, 'is_active' => true])->assertCreated();
    }

    public function test_invoice_authorization_receipt_and_immutable_legacy_total(): void
    {
        $result = $this->postJson('/api/orders', $this->input())->assertCreated();
        $order = Order::findOrFail($result->json('data.id'));
        $auth = ['order_number' => $order->order_number, 'whatsapp' => '081234567890'];
        $this->postJson('/api/order-documents/invoice', $auth + ['irrelevant' => 1])->assertOk()->assertHeader('Content-Type', 'application/pdf');
        $this->postJson('/api/order-documents/receipt', $auth)->assertUnprocessable();
        $this->postJson('/api/order-documents/invoice', array_replace($auth, ['whatsapp' => '089999999999']))->assertNotFound();
        $this->getJson('/api/admin/orders/'.$order->id.'/documents/invoice')->assertUnauthorized();
        $document = app(OrderDocumentService::class)->document($order, 'invoice');
        $this->assertSame((int) $order->total, $document->snapshot['total']);
        $this->assertCount(2, $document->snapshot['banks']);
        $order->template->update(['price' => 999999]);
        $order->update(['customer_name' => 'Nama diubah']);
        $this->assertSame($document->snapshot, app(OrderDocumentService::class)->document($order->fresh(), 'invoice')->snapshot);
        $this->admin();
        $this->patchJson('/api/admin/orders/'.$order->id.'/payment')->assertOk();
        $pdf = $this->postJson('/api/order-documents/receipt', $auth)->assertOk()->assertHeader('Cache-Control', 'no-store, private');
        $this->assertStringStartsWith('%PDF-', $pdf->getContent());
        $legacy = $this->realWedding()->order;
        $legacy->update(['total' => 123456, 'pricing_snapshot' => null]);
        $snapshot = app(OrderDocumentService::class)->document($legacy->fresh(), 'invoice')->snapshot;
        $this->assertSame(123456, $snapshot['total']);
        $this->assertSame(123456, $snapshot['items'][0]['amount']);
    }

    public function test_demo_orders_explain_unavailable_documents_without_issuing_them(): void
    {
        $demo = Order::where('is_demo', true)->firstOrFail();
        $this->postJson('/api/order-documents/invoice', ['order_number' => $demo->order_number, 'whatsapp' => $demo->whatsapp])->assertNotFound();
        $this->admin();
        $this->getJson('/api/admin/orders/'.$demo->id)->assertOk()->assertJsonPath('data.is_demo', true);
        foreach (['invoice', 'receipt'] as $type) {
            $this->getJson('/api/admin/orders/'.$demo->id.'/documents/'.$type)->assertUnprocessable()
                ->assertJsonPath('message', 'Pesanan demo tidak memiliki invoice atau kwitansi. Dokumen tersedia untuk pesanan pelanggan.');
        }
        $this->assertDatabaseMissing('order_documents', ['order_id' => $demo->id]);

        $real = $this->postJson('/api/orders', $this->input())->assertCreated()->assertJsonPath('data.is_demo', false)->json('data.id');
        $this->getJson('/api/admin/orders/'.$real.'/documents/invoice')->assertOk()->assertHeader('Content-Type', 'application/pdf');
        $this->getJson('/api/admin/orders/'.$real.'/documents/receipt')->assertUnprocessable();
        $this->patchJson('/api/admin/orders/'.$real.'/payment')->assertOk();
        $receipt = $this->getJson('/api/admin/orders/'.$real.'/documents/receipt')->assertOk()->assertHeader('Content-Type', 'application/pdf');
        $this->assertStringStartsWith('%PDF-', $receipt->getContent());
    }

    public function test_guest_pass_keeps_private_data_scoped_and_check_in_is_idempotent(): void
    {
        $wedding = $this->realWedding();
        $guest = $this->guest($wedding);
        $other = $this->realWedding();
        $pass = $this->getJson('/api/guest-passes/'.$guest->token)->assertOk()->assertJsonPath('data.name', $guest->name)->assertHeader('Cache-Control', 'no-store, private');
        $this->assertArrayNotHasKey('address', $pass->json('data'));
        $this->assertArrayNotHasKey('whatsapp', $pass->json('data'));
        $path = '/api/admin/weddings/'.$wedding->id.'/check-in';
        $this->postJson($path, ['code' => $guest->token, 'people_count' => 3])->assertUnauthorized();
        $this->admin();
        $this->postJson('/api/admin/weddings/'.$other->id.'/check-in/lookup', ['code' => $guest->token])->assertNotFound();
        $this->postJson($path.'/lookup', ['code' => 'https://evil.test/tamu/'.$guest->token])->assertUnprocessable();
        $this->postJson($path, ['code' => url('/tamu/'.$guest->token), 'people_count' => 3])->assertCreated()->assertJsonPath('already_checked_in', false);
        $this->postJson($path, ['code' => $guest->token, 'people_count' => 9])->assertOk()->assertJsonPath('already_checked_in', true)->assertJsonPath('data.people_count', 3);
        $this->assertDatabaseCount('wedding_check_ins', 1);
        $this->deleteJson('/api/admin/weddings/'.$wedding->id.'/invitees/'.$guest->id)->assertUnprocessable();
        $this->assertDatabaseHas('wedding_invitees', ['id' => $guest->id]);
        $this->getJson('/api/admin/weddings/'.$wedding->id.'/analytics')->assertOk()->assertJsonPath('data.actual_people', 3)->assertJsonPath('data.check_ins', 1);
    }

    public function test_analytics_counts_anonymous_visits_opened_links_and_latest_rsvp(): void
    {
        $wedding = $this->realWedding();
        $guest = $this->guest($wedding);
        $visitor = (string) Str::uuid();
        $path = '/api/weddings/'.$wedding->slug;
        foreach (['view', 'open', 'open', 'view'] as $action) {
            $this->postJson($path.'/visits', ['visitor_id' => $visitor, 'action' => $action, 'guest_token' => $guest->token])->assertNoContent();
        }
        $this->postJson($path.'/rsvp', ['name' => 'Nama bebas', 'attendance' => 'Hadir', 'guests' => 4, 'guest_token' => $guest->token])->assertCreated();
        $this->postJson($path.'/rsvp', ['name' => 'Nama bebas', 'attendance' => 'Tidak Hadir', 'guests' => 1, 'guest_token' => $guest->token])->assertCreated();
        $this->admin();
        $this->getJson('/api/admin/weddings/'.$wedding->id.'/analytics')->assertOk()->assertJsonPath('data.views', 2)->assertJsonPath('data.visitors', 1)->assertJsonPath('data.opens', 1)->assertJsonPath('data.guest_links_opened', 1)->assertJsonPath('data.rsvp.attending', 0)->assertJsonPath('data.rsvp.declined', 1)->assertJsonPath('data.rsvp.people', 0);
        $this->getJson('/api/admin/weddings/'.$wedding->id.'/guest-statistics')->assertOk()->assertJsonPath('data.0.attendance', 'Tidak Hadir');
        $this->assertDatabaseHas('wedding_rsvps', ['wedding_invitee_id' => $guest->id, 'name' => $guest->name]);
        $demo = Wedding::where('is_demo', true)->first();
        $this->postJson('/api/weddings/'.$demo->slug.'/visits', ['visitor_id' => (string) Str::uuid(), 'action' => 'view'])->assertForbidden();
        $this->assertDatabaseCount('invitation_visits', 1);
    }

    public function test_one_browser_can_open_multiple_guest_links_without_losing_guest_statistics(): void
    {
        $wedding = $this->realWedding();
        $visitor = (string) Str::uuid();
        foreach (['First guest', 'Second guest'] as $name) {
            $guest = $this->guest($wedding, $name);
            $this->postJson('/api/weddings/'.$wedding->slug.'/visits', ['visitor_id' => $visitor, 'guest_token' => $guest->token, 'action' => 'open'])->assertNoContent();
        }
        $this->admin();
        $this->getJson('/api/admin/weddings/'.$wedding->id.'/analytics')->assertOk()->assertJsonPath('data.visitors', 1)->assertJsonPath('data.guest_links_opened', 2);
        $guests = $this->getJson('/api/admin/weddings/'.$wedding->id.'/guest-statistics')->assertOk()->json('data');
        foreach ($guests as $guest) {
            $this->assertNotNull($guest['opened_at']);
        }
    }

    public function test_package_duration_begins_at_first_publish_and_legacy_stays_unlimited(): void
    {
        $this->travelTo(now()->startOfSecond());
        $legacy = $this->realWedding();
        $this->assertNull($legacy->expires_at);
        $limited = $this->realWedding(['package' => ['duration_days' => 30]]);
        $expires = $limited->expires_at->toJSON();
        $this->assertTrue($limited->expires_at->equalTo(now()->addDays(30)));
        $this->travel(3)->days();
        app(WeddingService::class)->publish($limited, $this->admin()->id);
        $this->assertSame($expires, $limited->fresh()->expires_at->toJSON());
        $this->travel(28)->days();
        $this->getJson('/api/weddings/'.$limited->slug)->assertStatus(410);
        $this->getJson('/api/weddings/'.$legacy->slug)->assertOk();
        $guest = $this->guest($limited);
        $this->getJson('/api/guest-passes/'.$guest->token)->assertStatus(410);
        $this->postJson('/api/admin/weddings/'.$limited->id.'/check-in', ['code' => $guest->token, 'people_count' => 1])->assertStatus(410);
    }

    public function test_due_reminders_are_deduplicated_snoozed_resolved_and_exclude_demos(): void
    {
        $response = $this->postJson('/api/orders', $this->input())->assertCreated();
        $order = Order::findOrFail($response->json('data.id'));
        $service = app(OrderReminderService::class);
        $service->refresh();
        $service->refresh();
        $this->assertDatabaseCount('order_reminders', 1);
        $this->admin();
        $this->getJson('/api/admin/reminders')->assertOk()->assertJsonPath('due_count', 0);
        $this->travel(25)->hours();
        $result = $this->getJson('/api/admin/reminders')->assertOk()->assertJsonPath('due_count', 1);
        $id = $result->json('reminders.data.0.id');
        $this->patchJson('/api/admin/reminders/'.$id, ['action' => 'snooze'])->assertOk();
        $this->getJson('/api/admin/reminders')->assertJsonPath('due_count', 0);
        $this->travel(25)->hours();
        $this->getJson('/api/admin/reminders')->assertJsonPath('due_count', 1);
        $this->patchJson('/api/admin/reminders/'.$id, ['action' => 'dismiss'])->assertOk();
        $this->getJson('/api/admin/reminders')->assertJsonPath('due_count', 0);
        $this->patchJson('/api/admin/orders/'.$order->id.'/payment')->assertOk();
        $service->refresh();
        $this->assertNotNull(OrderReminder::findOrFail($id)->resolved_at);
        $this->assertSame(1, $service->active()->count());
        $this->patchJson('/api/admin/orders/'.$order->id.'/status', ['status' => 'CANCELLED'])->assertOk();
        $service->refresh();
        $this->assertSame(0, $service->active()->count());
    }

    public function test_portal_documents_reminders_analytics_are_private_and_revocable(): void
    {
        $wedding = $this->realWedding();
        $this->admin();
        $issued = $this->postJson('/api/admin/weddings/'.$wedding->id.'/customer-portal')->assertOk();
        $url = $issued->json('data.link');
        $token = basename(parse_url($url, PHP_URL_PATH));
        foreach (['analytics', 'guest-statistics', 'reminders'] as $part) {
            $this->getJson('/api/customer-portals/'.$token.'/'.$part)->assertOk()->assertHeader('Cache-Control', 'no-store, private');
        }
        $this->get('/api/customer-portals/'.$token.'/documents/receipt')->assertOk()->assertHeader('Content-Type', 'application/pdf');
        $this->deleteJson('/api/admin/weddings/'.$wedding->id.'/customer-portal')->assertOk();
        $this->getJson('/api/customer-portals/'.$token.'/analytics')->assertNotFound();
        $this->getJson('/api/customer-portals/'.$token.'/documents/invoice')->assertNotFound();
    }
}

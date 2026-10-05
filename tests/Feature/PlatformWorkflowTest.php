<?php

namespace Tests\Feature;

use App\Http\Resources\WeddingResource;
use App\Models\Order;
use App\Models\SystemSetting;
use App\Models\Template;
use App\Models\User;
use App\Models\Wedding;
use App\Models\WeddingGiftMethod;
use App\Services\TemplateCatalog;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PlatformWorkflowTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->assertSame('radina_wedding_test', config('database.connections.mysql.database'), 'Tests must use the isolated test database.');
        Storage::fake('public');
        $this->seed();
    }

    private function order(): Order
    {
        $template = Template::first();
        $response = $this->postJson('/api/orders', ['template_id' => $template->id, 'customer_name' => 'Test Customer', 'whatsapp' => '081234567890', 'bride_name' => 'Nadia Test', 'groom_name' => 'Fajar Test', 'slug' => 'new-wedding', 'total' => 1]);
        $response->assertCreated()->assertJsonPath('data.total', (int) $template->price)->assertJsonPath('data.status', 'WAITING_PAYMENT');

        return Order::find($response->json('data.id'));
    }

    private function admin(): void
    {
        Sanctum::actingAs(User::where('email', config('platform.admin_email'))->first());
    }

    public function test_order_price_slug_and_customer_lookup_are_enforced(): void
    {
        $order = $this->order();
        $this->postJson('/api/orders', ['template_id' => $order->template_id, 'customer_name' => 'Test', 'whatsapp' => '081234567890', 'bride_name' => 'Nadia', 'groom_name' => 'Fajar', 'slug' => $order->slug])->assertUnprocessable()->assertJsonValidationErrors('slug');
        $this->postJson('/api/check-order', ['order_number' => $order->order_number, 'whatsapp' => '081234567890'])->assertOk()->assertJsonPath('data.whatsapp', '6281234567890');
        $this->postJson('/api/check-order', ['order_number' => $order->order_number, 'whatsapp' => '089999999999'])->assertNotFound();
    }

    public function test_non_admin_and_unpaid_orders_cannot_access_cms(): void
    {
        $order = $this->order();
        $this->getJson('/api/admin/orders')->assertUnauthorized();
        Sanctum::actingAs(User::factory()->create());
        $this->getJson('/api/admin/orders')->assertForbidden();
        $this->admin();
        $this->postJson('/api/admin/orders/'.$order->id.'/wedding')->assertUnprocessable();
        $this->patchJson('/api/admin/orders/'.$order->id.'/status', ['status' => 'READY'])->assertUnprocessable();
    }

    public function test_payment_is_audited_and_minimum_publish_content_is_required(): void
    {
        $order = $this->order();
        $this->admin();
        $this->patchJson('/api/admin/orders/'.$order->id.'/payment')->assertOk()->assertJsonPath('data.status', 'PAID');
        $this->assertNotNull($order->fresh()->payment->confirmed_at);
        $this->assertNotNull($order->fresh()->payment->confirmed_by);
        $result = $this->postJson('/api/admin/orders/'.$order->id.'/wedding')->assertCreated();
        $id = $result->json('data.id');
        $this->getJson('/api/weddings/'.$order->slug)->assertNotFound();
        $this->postJson('/api/admin/weddings/'.$id.'/publish')->assertUnprocessable()->assertJsonValidationErrors(['events', 'wedding_date']);
        $this->assertDatabaseHas('order_status_histories', ['order_id' => $order->id, 'new_status' => 'CONTENT_PROCESS']);
    }

    public function test_publish_rsvp_wishes_and_disabled_template_behavior(): void
    {
        $order = $this->order();
        $this->admin();
        $this->patchJson('/api/admin/orders/'.$order->id.'/payment');
        $result = $this->postJson('/api/admin/orders/'.$order->id.'/wedding');
        $id = $result->json('data.id');
        $demo = Wedding::where('slug', 'demo-romantic-floral')->first()->loadContent();
        $data = (new WeddingResource($demo))->resolve();
        $wedding = Wedding::find($id);
        $data['slug'] = $order->slug;
        $data['expected_updated_at'] = $wedding->updated_at->toJSON();
        foreach ($data['events'] as $event) {
            $event->start_time = substr($event->start_time, 0, 5);
            $event->end_time = substr($event->end_time, 0, 5);
        }
        $data = json_decode(json_encode($data), true);
        $this->putJson('/api/admin/weddings/'.$id, $data)->assertOk();
        $this->putJson('/api/admin/weddings/'.$id, $data)->assertStatus(409);
        $this->postJson('/api/admin/weddings/'.$id.'/publish')->assertOk()->assertJsonPath('data.status', 'PUBLISHED');
        $data['wedding_date'] = null;
        $this->putJson('/api/admin/weddings/'.$id, $data)->assertUnprocessable()->assertJsonValidationErrors('wedding_date');
        Template::where('id', $order->template_id)->update(['status' => 'DISABLED']);
        $this->getJson('/api/weddings/'.$order->slug)->assertOk();
        $this->getJson('/api/templates/romantic-floral')->assertNotFound();
        $this->postJson('/api/weddings/'.$order->slug.'/rsvp', ['name' => 'Guest Test', 'guests' => 2, 'attendance' => 'Hadir'])->assertCreated();
        $this->postJson('/api/weddings/'.$order->slug.'/wishes', ['name' => 'Guest Test', 'message' => 'Semoga selalu bahagia.'])->assertCreated();
        $this->assertDatabaseHas('wedding_rsvps', ['wedding_id' => $id, 'guests' => 2]);
        $this->assertDatabaseHas('wedding_wishes', ['wedding_id' => $id, 'name' => 'Guest Test']);
        $this->patchJson('/api/admin/orders/'.$order->id.'/status', ['status' => 'CANCELLED'])->assertOk();
        $this->getJson('/api/weddings/'.$order->slug)->assertNotFound();
    }

    public function test_uploads_validate_mime_and_generate_unique_names(): void
    {
        $order = $this->order();
        $this->admin();
        $this->patchJson('/api/admin/orders/'.$order->id.'/payment');
        $id = $this->postJson('/api/admin/orders/'.$order->id.'/wedding')->json('data.id');
        $this->postJson('/api/admin/media', ['wedding_id' => $id, 'collection' => 'gallery', 'files' => [UploadedFile::fake()->create('evil.php', 1, 'application/x-php')]])->assertUnprocessable();
        $result = $this->postJson('/api/admin/media', ['wedding_id' => $id, 'collection' => 'gallery', 'files' => [UploadedFile::fake()->image('photo.jpg', 500, 500)]])->assertCreated();
        $this->assertStringEndsWith('.webp', $result->json('data.0.url'));
        $this->assertStringNotContainsString('photo.jpg', $result->json('data.0.url'));
    }

    public function test_demo_is_read_only_and_preview_is_admin_only(): void
    {
        $demo = Wedding::where('is_demo', true)->first();
        $this->postJson('/api/weddings/'.$demo->slug.'/rsvp', ['name' => 'Test Guest', 'guests' => 1, 'attendance' => 'Hadir'])->assertForbidden();
        $this->postJson('/api/weddings/'.$demo->slug.'/wishes', ['name' => 'Test Guest', 'message' => 'Ucapan testing.'])->assertForbidden();
        $this->getJson('/api/admin/weddings/'.$demo->id.'/preview')->assertUnauthorized();
        $this->getJson('/api/templates/romantic-floral/preview')->assertOk()->assertJsonPath('data.is_demo', true);
    }

    public function test_radina_catalog_and_gift_methods_use_one_contract(): void
    {
        config(['platform.api_rate_limit' => 1000]);
        $this->assertSame(111, Template::count());
        foreach (TemplateCatalog::KEYS as $key) {
            $this->getJson('/api/templates/'.$key.'/preview')->assertOk()->assertJsonPath('data.template.template_key', $key)->assertJsonStructure(['data' => ['bride', 'groom', 'events', 'stories', 'gallery', 'gift_methods', 'settings']]);
        }
        $order = $this->order();
        $this->admin();
        $this->patchJson('/api/admin/orders/'.$order->id.'/payment');
        $id = $this->postJson('/api/admin/orders/'.$order->id.'/wedding')->json('data.id');
        $path = '/api/admin/weddings/'.$id.'/gifts';
        $this->postJson($path, ['type' => 'BANK', 'provider' => 'BCA', 'account_number' => '1234567890', 'account_name' => 'Nadia', 'is_active' => true])->assertCreated();
        $first = WeddingGiftMethod::where('wedding_id', $id)->first();
        $raw = DB::table('wedding_gift_methods')->where('id', $first->id)->value('account_number');
        $this->assertNotSame('1234567890', $raw);
        $this->assertSame('1234567890', $first->account_number);
        $second = $this->postJson($path, ['type' => 'EWALLET', 'provider' => 'DANA', 'account_number' => '081234567890', 'account_name' => 'Nadia', 'is_active' => false])->assertCreated()->json('data.id');
        $this->postJson($path, ['type' => 'QRIS', 'provider' => 'QR Nadia', 'account_name' => 'Nadia', 'is_active' => true])->assertUnprocessable()->assertJsonValidationErrors('qr_image');
        $this->postJson($path, ['type' => 'QRIS', 'provider' => 'QR Nadia', 'account_name' => 'Nadia', 'qr_image' => 'javascript:alert(1)', 'is_active' => true])->assertUnprocessable();
        $this->postJson($path, ['type' => 'PHYSICAL', 'recipient_name' => 'Nadia', 'phone' => '081234567890', 'address' => 'Alamat uji', 'is_active' => true])->assertCreated();
        $ids = WeddingGiftMethod::where('wedding_id', $id)->pluck('id')->reverse()->values()->all();
        $this->patchJson($path.'/reorder', ['ids' => $ids])->assertOk()->assertJsonPath('data.0.id', $ids[0]);
        $this->patchJson($path.'/reorder', ['ids' => [$first->id]])->assertUnprocessable();
        $demo = Wedding::where('is_demo', true)->first();
        $foreign = $demo->giftMethods()->first();
        $this->deleteJson($path.'/'.$foreign->id)->assertNotFound();
        $this->putJson($path.'/'.$first->id, ['type' => 'BANK', 'provider' => 'BCA', 'account_number' => '999888', 'account_name' => 'Nadia', 'is_active' => true])->assertOk();
        $public = (new WeddingResource(Wedding::find($id)->loadContent()))->resolve(Request::create('/api/weddings/test'));
        $this->assertCount(2, $public['gift_methods']);
        $this->putJson($path.'/'.$first->id, ['type' => 'BANK', 'provider' => 'BCA', 'account_number' => '999888', 'account_name' => 'Nadia', 'is_active' => false])->assertOk();
        $filtered = (new WeddingResource(Wedding::find($id)->loadContent()))->resolve(Request::create('/api/weddings/test'));
        $this->assertCount(1, $filtered['gift_methods']);
        $this->assertCount(0, $filtered['gifts']);
        $this->putJson('/api/admin/settings', array_merge(SystemSetting::pluck('value', 'key')->all(), ['logo' => '/brand/radina-logo.svg']))->assertOk();

        $this->deleteJson($path.'/'.$second)->assertOk();
        $this->assertDatabaseMissing('wedding_gift_methods', ['id' => $second]);
    }

    public function test_secondary_payment_account_must_be_complete_and_can_be_disabled(): void
    {
        $this->admin();
        $settings = SystemSetting::pluck('value', 'key')->all();
        $partial = array_replace($settings, ['secondary_bank_account' => '', 'secondary_bank_account_name' => '']);
        $this->putJson('/api/admin/settings', $partial)->assertUnprocessable()->assertJsonValidationErrors(['secondary_bank_account', 'secondary_bank_account_name']);
        $this->getJson('/api/settings')->assertOk()->assertJsonPath('data.secondary_bank_account', '8721354342');
        $this->putJson('/api/admin/settings', $settings)->assertOk()->assertJsonPath('data.bank_account', '1680001279155')->assertJsonPath('data.secondary_bank_account', '8721354342');
        $disabled = array_replace($settings, ['secondary_bank_name' => '', 'secondary_bank_account' => '', 'secondary_bank_account_name' => '']);
        $this->putJson('/api/admin/settings', $disabled)->assertOk()->assertJsonPath('data.secondary_bank_account', null)->assertJsonPath('data.bank_account', '1680001279155');
    }

    public function test_template_switch_preserves_content_guests_gifts_and_payment(): void
    {
        $this->admin();
        $w = Wedding::where('is_demo', true)->first()->loadContent();
        $w->rsvps()->create(['name' => 'Guest', 'guests' => 2, 'attendance' => 'Hadir']);
        $w->wishes()->create(['name' => 'Guest', 'message' => 'Selamat']);
        $before = [$w->couples->pluck('full_name')->all(), $w->events->pluck('id')->all(), $w->gallery->pluck('id')->all(), $w->stories->pluck('id')->all(), $w->giftMethods->pluck('id')->all(), $w->music_url, $w->rsvps()->count(), $w->wishes()->count(), $w->order->payment->amount];
        foreach (['sakinah', 'midnight-romance', 'blush', 'romantic-floral'] as $key) {
            $w = $w->fresh()->loadContent();
            $data = json_decode(json_encode((new WeddingResource($w))->resolve()), true);
            foreach ($data['events'] as &$event) {
                $event['start_time'] = substr($event['start_time'], 0, 5);
                $event['end_time'] = substr($event['end_time'], 0, 5);
            }unset($event);
            $data['template_id'] = Template::where('template_key', $key)->first()->id;
            $data['expected_updated_at'] = $w->updated_at->toJSON();
            $this->putJson('/api/admin/weddings/'.$w->id, $data)->assertOk()->assertJsonPath('data.template.template_key', $key);
            $w = $w->fresh()->loadContent();
            $after = [$w->couples->pluck('full_name')->all(), $w->events->pluck('id')->all(), $w->gallery->pluck('id')->all(), $w->stories->pluck('id')->all(), $w->giftMethods->pluck('id')->all(), $w->music_url, $w->rsvps()->count(), $w->wishes()->count(), $w->order->payment->amount];
            $this->assertSame($before, $after);
        }
    }
}

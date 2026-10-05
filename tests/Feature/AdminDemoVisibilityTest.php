<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\Template;
use App\Models\User;
use App\Models\Wedding;
use App\Services\DeploymentLicenseGuard;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminDemoVisibilityTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
        $this->seed();
        Sanctum::actingAs(User::where('email', config('platform.admin_email'))->first());
    }

    public function test_admin_lists_and_dashboard_exclude_only_flagged_demos_and_keep_all_records_and_previews(): void
    {
        $real = Order::create(['template_id' => Template::first()->id, 'order_number' => 'RADINA-DEMO-CUSTOMER', 'customer_name' => 'Pelanggan Nyata', 'whatsapp' => '6281234567890', 'bride_name' => 'Alya', 'groom_name' => 'Dedy', 'slug' => 'real-customer-demo-name', 'total' => 90000, 'status' => 'PAID', 'is_demo' => false]);
        $real->payment()->create(['status' => 'PAID', 'amount' => 90000]);
        $demo = Order::where('is_demo', true)->firstOrFail();
        $demo->payment()->update(['amount' => 70000]);
        $otherDemo = Order::where('is_demo', true)->where('id', '!=', $demo->id)->firstOrFail();
        $otherDemo->update(['status' => 'PAID']);
        $before = [Order::count(), Wedding::count(), Order::where('is_demo', true)->count(), Wedding::where('is_demo', true)->count()];
        $guard = app(DeploymentLicenseGuard::class);
        $backup = $guard->backup(str_repeat('d', 40));
        foreach (['', '?status=PAID', '?search=RADINA-DEMO', '?template='.$real->template_id, '?date='.today()->format('Y-m-d')] as $query) {
            $this->getJson('/api/admin/orders'.$query)->assertOk()->assertJsonPath('meta.total', 1)->assertJsonPath('data.0.id', $real->id);
        }
        $dashboard = $this->getJson('/api/admin/dashboard')->assertOk()->assertJsonPath('data.total_orders', 1)->assertJsonPath('data.today_orders', 1)->assertJsonPath('data.statuses.PAID', 1)->assertJsonCount(1, 'data.recent_orders')->assertJsonCount(1, 'data.attention_orders')->assertJsonPath('data.recent_orders.0.id', $real->id)->assertJsonPath('data.attention_orders.0.id', $real->id);
        $this->assertSame(90000, (int) $dashboard->json('data.revenue'));
        $this->assertSame($before, [Order::count(), Wedding::count(), Order::where('is_demo', true)->count(), Wedding::where('is_demo', true)->count()]);
        $this->assertDatabaseHas('orders', ['id' => $real->id, 'is_demo' => false, 'status' => 'PAID', 'total' => 90000]);
        $this->getJson('/api/templates/romantic-floral/preview')->assertOk()->assertJsonPath('data.is_demo', true);
        $guard->assertPreserved($backup);
    }

    public function test_empty_production_lists_are_private_and_leave_the_template_catalog_available(): void
    {
        $this->getJson('/api/admin/orders')->assertOk()->assertJsonPath('meta.total', 0)->assertJsonCount(0, 'data');
        $this->getJson('/api/admin/dashboard')->assertOk()->assertJsonPath('data.total_orders', 0)->assertJsonCount(0, 'data.recent_orders')->assertJsonCount(0, 'data.attention_orders');
        $this->assertGreaterThanOrEqual(111, Wedding::where('is_demo', true)->count());
        $this->getJson('/api/templates')->assertOk()->assertJsonPath('meta.total', 111);
        Sanctum::actingAs(User::factory()->create());
        $this->getJson('/api/admin/orders')->assertForbidden();
        $this->getJson('/api/admin/dashboard')->assertForbidden();
    }
}

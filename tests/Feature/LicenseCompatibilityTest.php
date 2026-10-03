<?php

namespace Tests\Feature;

use App\Models\Admin;
use App\Models\License;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class LicenseCompatibilityTest extends TestCase
{
    use RefreshDatabase;

    private function license(array $attributes = []): License
    {
        return License::create($attributes + ['key' => 'ABCDE-FGHIJ-KLMNO-PQRST-UVWXY', 'customer_name' => 'Existing Customer', 'product_name' => 'Existing Product', 'status' => 'active', 'max_activations' => 1]);
    }

    private function activate(array $data = [], array $headers = [])
    {
        return $this->postJson('/api/license/activate', $data + ['license_key' => ' abcde-fghij-klmno-pqrst-uvwxy ', 'machine_id' => ' pc-001 ', 'app_version' => '1.0.0'], $headers);
    }

    public function test_original_activation_contract_normalization_and_device_limit_are_preserved(): void
    {
        config(['license.activation_token' => 'existing-secret']);
        $license = $this->license();
        $this->activate()->assertUnauthorized()->assertJsonPath('valid', false);
        $this->activate([], ['X-LICENSE-TOKEN' => 'existing-secret'])->assertOk()->assertJsonPath('valid', true)->assertJsonPath('license.key', $license->key)->assertJsonPath('license.active_devices', 1)->assertJsonPath('license.max_activations', 1);
        $this->activate(['app_version' => '1.1.0'], ['X-LICENSE-TOKEN' => 'existing-secret'])->assertOk()->assertJsonPath('license.active_devices', 1);
        $this->assertDatabaseHas('license_activations', ['license_id' => $license->id, 'machine_id' => 'PC-001', 'app_version' => '1.1.0']);
        $this->activate(['machine_id' => 'PC-002'], ['X-LICENSE-TOKEN' => 'existing-secret'])->assertForbidden()->assertJsonPath('message', 'Batas aktivasi license sudah penuh.');
    }

    public function test_revoked_expired_and_unknown_licenses_keep_their_status_codes(): void
    {
        config(['license.activation_token' => '']);
        $license = $this->license(['status' => 'revoked']);
        $this->activate()->assertForbidden()->assertJsonPath('valid', false);
        $license->update(['status' => 'active', 'expires_at' => now()->subDay()->toDateString()]);
        $this->activate()->assertForbidden()->assertJsonPath('message', 'License sudah expired.');
        $this->activate(['license_key' => 'UNKNOWN'])->assertNotFound()->assertJsonPath('valid', false);
        $this->assertDatabaseCount('license_activations', 0);
    }

    public function test_wedding_setup_preserves_license_records_activations_and_existing_admin_credentials(): void
    {
        $license = $this->license();
        $license->activations()->create(['machine_id' => 'PC-EXISTING', 'activated_at' => now(), 'last_seen_at' => now()]);
        $admin = User::factory()->create(['role' => 'admin', 'email' => config('platform.admin_email')]);
        $before = [$license->fresh()->getRawOriginal(), $license->activations()->first()->getRawOriginal(), $admin->fresh()->getRawOriginal()];
        $this->seed();
        $this->seed();
        $this->assertSame($before, [$license->fresh()->getRawOriginal(), $license->activations()->first()->getRawOriginal(), $admin->fresh()->getRawOriginal()]);
        $this->assertDatabaseCount('licenses', 1);
        $this->assertDatabaseCount('templates', 25);
        $this->assertTrue($admin->fresh()->admin->active);
    }

    public function test_only_active_administrators_can_manage_licenses_and_key_is_immutable_on_edit(): void
    {
        $license = $this->license();
        $this->getJson('/api/admin/licenses')->assertUnauthorized();
        Sanctum::actingAs(User::factory()->create(['role' => 'writer']));
        $this->getJson('/api/admin/licenses')->assertForbidden();
        $this->patchJson('/api/admin/licenses/'.$license->id.'/toggle-status')->assertForbidden();
        $admin = User::factory()->create(['role' => 'admin']);
        Admin::create(['user_id' => $admin->id, 'active' => false]);
        Sanctum::actingAs($admin);
        $this->getJson('/api/admin/licenses')->assertForbidden();
        $admin->admin->update(['active' => true]);
        Sanctum::actingAs($admin->fresh());
        $this->getJson('/api/admin/licenses')->assertOk()->assertJsonPath('stats.total', 1);
        $this->patchJson('/api/admin/licenses/'.$license->id, ['customer_name' => 'Updated', 'product_name' => 'Existing Product', 'max_activations' => 2, 'key' => 'REPLACE-KEY'])->assertOk()->assertJsonPath('data.key', $license->key);
        $this->patchJson('/api/admin/licenses/'.$license->id.'/toggle-status')->assertOk()->assertJsonPath('data.status', 'revoked');
        $this->deleteJson('/api/admin/licenses/'.$license->id)->assertNoContent();
    }

    public function test_wedding_replaces_news_routes_and_preserves_license_dashboard_link(): void
    {
        $this->seed();
        $this->get('/')->assertOk()->assertSee('Radina')->assertDontSee('Radina News');
        $this->get('/berita/old-article')->assertStatus(410);
        $this->get('/news-sitemap.xml')->assertStatus(410);
        $this->get('/sitemap.xml')->assertOk()->assertSee('/templates/romantic-floral')->assertDontSee('/berita/');
        $this->get('/dashboard?section=licenses')->assertRedirect('/admin/licenses');
        $this->get('/admin/licenses')->assertOk()->assertSee('noindex,nofollow');
    }
}

<?php

namespace Tests\Feature;

use App\Models\License;
use App\Models\User;
use App\Services\DeploymentLicenseGuard;
use Illuminate\Foundation\Testing\RefreshDatabaseState;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ProductionUpgradeTest extends TestCase
{
    public function test_upgrade_from_existing_license_schema_keeps_data_and_admin_password(): void
    {
        // The base TestCase checks the isolated database before these commands run.
        $baseline = array_values(array_filter(glob(database_path('migrations/*.php')), fn ($p) => strcmp(basename($p), '2026_10_03_') < 0));
        $this->artisan('migrate:fresh', ['--path' => $baseline, '--realpath' => true, '--force' => true])->assertSuccessful();
        try {
            Storage::fake('public');
            $admin = User::factory()->create(['email' => config('platform.admin_email'), 'role' => 'admin']);
            $license = License::create(['customer_name' => 'Existing Production Customer', 'product_name' => 'Desktop App', 'status' => 'active', 'max_activations' => 3, 'expires_at' => '2027-12-31']);
            $license->activations()->create(['machine_id' => 'EXISTING-PC', 'activated_at' => now(), 'app_version' => '1.0.0']);
            $before = [];
            foreach (['licenses', 'license_activations', 'users'] as $table) {
                $before[$table] = DB::table($table)->orderBy('id')->get()->map(fn ($row) => (array) $row)->all();
            }
            $guard = new DeploymentLicenseGuard;
            $snapshot = $guard->backup(str_repeat('e', 40));
            $this->artisan('migrate', ['--force' => true])->assertSuccessful();
            $guard->assertPreserved($snapshot);
            $this->artisan('db:seed', ['--force' => true])->assertSuccessful();
            $guard->assertPreserved($snapshot);
            foreach ($before as $table => $rows) {
                $this->assertSame($rows, DB::table($table)->orderBy('id')->get()->map(fn ($row) => (array) $row)->all(), $table);
            }
            $this->assertDatabaseCount('templates', 56);
            $this->assertDatabaseHas('system_settings', ['key' => 'whatsapp_number', 'value' => '6281289903664']);
            $this->getJson('/api/settings')->assertOk()->assertJsonPath('data.whatsapp_number', '6281289903664');
            $this->getJson('/api/settings')->assertOk()
                ->assertJsonPath('data.bank_name', 'Bank Mandiri')
                ->assertJsonPath('data.bank_account', '1680001279155')
                ->assertJsonPath('data.bank_account_name', 'Dedy Ibrahim')
                ->assertJsonPath('data.secondary_bank_name', 'Bank BCA')
                ->assertJsonPath('data.secondary_bank_account', '8721354342')
                ->assertJsonPath('data.secondary_bank_account_name', 'Dedy Ibrahim')
                ->assertJsonPath('data.payment_notice', '');
            $this->assertTrue($admin->fresh()->admin->active);
        } finally {
            $this->artisan('migrate:fresh', ['--force' => true])->assertSuccessful();
            RefreshDatabaseState::$migrated = false;
        }
    }
}

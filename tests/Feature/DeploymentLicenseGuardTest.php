<?php

namespace Tests\Feature;

use App\Models\License;
use App\Models\User;
use App\Services\DeploymentLicenseGuard;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use RuntimeException;
use Tests\TestCase;

class DeploymentLicenseGuardTest extends TestCase
{
    use RefreshDatabase;

    private function records(): License
    {
        User::factory()->create(['role' => 'admin']);
        $license = License::create(['customer_name' => 'Production Customer', 'product_name' => 'Original Product', 'status' => 'active', 'max_activations' => 2]);
        $license->activations()->create(['machine_id' => 'PRODUCTION-PC', 'activated_at' => now()]);
        return $license;
    }

    public function test_deployment_backup_is_encrypted_private_and_preserves_full_records(): void
    {
        $this->records();
        $guard = new DeploymentLicenseGuard;
        $snapshot = $guard->backup(str_repeat('a', 40));
        $guard->assertPreserved($snapshot);
        $disk = Storage::build(['driver' => 'local', 'root' => storage_path('app')]);
        $files = $disk->files('deploy-backups');
        $this->assertNotEmpty($files);
        $encrypted = $disk->get(end($files));
        $this->assertStringNotContainsString('Production Customer', $encrypted);
        $decrypted = json_decode(Crypt::decryptString($encrypted), true, 512, JSON_THROW_ON_ERROR);
        $this->assertSame($snapshot, $decrypted['tables']);
        $this->assertSame(1, count($snapshot['licenses']));
        $this->assertSame(1, count($snapshot['license_activations']));
    }

    public function test_guard_rejects_license_changes(): void
    {
        $license = $this->records();
        $guard = new DeploymentLicenseGuard;
        $snapshot = $guard->backup(str_repeat('b', 40));
        $license->update(['max_activations' => 99]);
        $this->expectException(RuntimeException::class);
        $guard->assertPreserved($snapshot);
    }

    public function test_guard_rejects_deleted_activations(): void
    {
        $license = $this->records();
        $guard = new DeploymentLicenseGuard;
        $snapshot = $guard->backup(str_repeat('c', 40));
        $license->activations()->delete();
        $this->expectException(RuntimeException::class);
        $guard->assertPreserved($snapshot);
    }

    public function test_guard_allows_normal_desktop_activity_during_deployment(): void
    {
        $license = $this->records();
        $guard = new DeploymentLicenseGuard;
        $snapshot = $guard->backup(str_repeat('d', 40));
        $license->update(['last_activated_at' => now()->addSecond()]);
        $license->activations()->update(['last_seen_at' => now(), 'app_version' => '1.2.0']);
        $license->activations()->create(['machine_id' => 'SECOND-PC', 'activated_at' => now()]);
        $guard->assertPreserved($snapshot);
        $this->assertSame(2, $license->activations()->count());
    }

    public function test_public_media_can_be_served_without_a_symlink_and_cannot_read_private_files(): void
    {
        Storage::fake('public');
        Storage::disk('public')->put('templates/test.svg', '<svg xmlns="http://www.w3.org/2000/svg"></svg>');
        $this->get('/storage/templates/test.svg')->assertOk()->assertHeader('X-Content-Type-Options', 'nosniff');
        $this->get('/storage/../.env')->assertNotFound();
        $this->get('/storage/deploy-backups/example.encrypted')->assertNotFound();
        $this->get('/storage/missing.webp')->assertNotFound();
    }
}

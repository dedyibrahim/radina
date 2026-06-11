<?php

namespace Tests\Feature;

use App\Models\License;
use App\Models\NewsArticle;
use App\Models\User;
use App\Models\WriterEarning;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class ProductionSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_production_seeder_does_not_create_demo_licenses(): void
    {
        $originalEnvironment = app()->environment();
        app()->detectEnvironment(fn () => 'production');

        try {
            $this->artisan('db:seed', [
                '--class' => DatabaseSeeder::class,
                '--force' => true,
            ])->assertSuccessful();

            $this->assertSame(0, License::count());
        } finally {
            app()->detectEnvironment(fn () => $originalEnvironment);
        }
    }

    public function test_production_seeder_is_idempotent_and_preserves_existing_accounts(): void
    {
        $this->seed(DatabaseSeeder::class);

        $admin = User::where('email', 'admin@radina.net')->firstOrFail();
        $admin->update([
            'name' => 'Administrator Production',
            'password' => Hash::make('PasswordProduction@123'),
        ]);

        $license = License::firstOrFail();
        $license->update(['customer_name' => 'Pelanggan Production']);

        $articleCount = NewsArticle::count();
        $earningCount = WriterEarning::count();
        $licenseCount = License::count();

        $this->seed(DatabaseSeeder::class);

        $admin->refresh();
        $license->refresh();
        $shara = User::where('email', 'shara@radina.net')->firstOrFail();

        $this->assertSame('Administrator Production', $admin->name);
        $this->assertTrue(Hash::check('PasswordProduction@123', $admin->password));
        $this->assertSame('Pelanggan Production', $license->customer_name);
        $this->assertSame($articleCount, NewsArticle::count());
        $this->assertSame($earningCount, WriterEarning::count());
        $this->assertSame($licenseCount, License::count());
        $this->assertSame(0, NewsArticle::where('user_id', '!=', $shara->id)->count());
        $this->assertSame(0, WriterEarning::where('user_id', '!=', $shara->id)->count());
    }
}

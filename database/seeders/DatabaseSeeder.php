<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $admin = User::firstOrCreate(
            ['email' => 'admin@radina.net'],
            [
                'name' => 'radina.net Admin',
                'role' => User::ROLE_ADMIN,
                'password' => Hash::make('Admin@12345'),
                'email_verified_at' => now(),
            ]
        );

        if (! $admin->isAdmin()) {
            $admin->forceFill(['role' => User::ROLE_ADMIN])->save();
        }

        if (! app()->environment('production')) {
            $this->call(LicenseSeeder::class);
        }

        $this->call(NewsPortalSeeder::class);
    }
}

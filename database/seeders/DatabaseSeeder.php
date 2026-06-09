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
        User::firstOrCreate(
            ['email' => 'admin@radina.net'],
            [
                'name' => 'radina.net Admin',
                'role' => User::ROLE_ADMIN,
                'password' => Hash::make('Admin@12345'),
                'email_verified_at' => now(),
            ]
        );

        $this->call([
            LicenseSeeder::class,
            NewsPortalSeeder::class,
        ]);
    }
}

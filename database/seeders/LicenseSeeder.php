<?php

namespace Database\Seeders;

use App\Models\License;
use Illuminate\Database\Seeder;

class LicenseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $licenses = [
            [
                'key' => 'DST1A-TRIAL-2026A-00001-ABCDE',
                'customer_name' => 'Demo Client A',
                'product_name' => config('license.product_name'),
                'status' => License::STATUS_ACTIVE,
                'max_activations' => 3,
                'expires_at' => now()->addYear()->toDateString(),
                'notes' => 'Lisensi demo aktif untuk pengujian awal.',
            ],
            [
                'key' => 'DST1B-TRIAL-2026B-00002-FGHIJ',
                'customer_name' => 'Demo Client B',
                'product_name' => config('license.product_name'),
                'status' => License::STATUS_REVOKED,
                'max_activations' => 1,
                'expires_at' => now()->addMonths(6)->toDateString(),
                'notes' => 'Contoh lisensi revoked.',
            ],
            [
                'key' => 'DST1C-TRIAL-2024X-00003-KLMNO',
                'customer_name' => 'Demo Client C',
                'product_name' => config('license.product_name'),
                'status' => License::STATUS_ACTIVE,
                'max_activations' => 2,
                'expires_at' => now()->subDays(5)->toDateString(),
                'notes' => 'Contoh lisensi expired.',
            ],
        ];

        foreach ($licenses as $item) {
            License::firstOrCreate(['key' => $item['key']], $item);
        }
    }
}

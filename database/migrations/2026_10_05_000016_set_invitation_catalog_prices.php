<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Read the shipped defaults directly, including when an older config cache exists.
        $prices = require config_path('invitation-pricing.php');
        DB::transaction(function () use ($prices) {
            foreach (['basic' => ['Basic', 50000], 'premium' => ['Premium', 90000], 'vip' => ['VIP', 150000]] as $index => [$name, $price]) {
                $values = [
                    'name' => $name, 'pricing_mode' => 'FIXED', 'price' => $price, 'is_active' => true,
                    'description' => 'Paket undangan digital '.$name.' dengan harga tetap.',
                    'features' => json_encode(['Undangan digital responsif', 'Tautan pribadi untuk tamu', 'RSVP dan ucapan', 'Galeri foto dan musik'], JSON_UNESCAPED_UNICODE),
                    'updated_at' => now(),
                ];
                $package = DB::table('invitation_packages')->where('slug', $index)->first();
                if (! $package) {
                    DB::table('invitation_packages')->insert($values + ['slug' => $index, 'sort_order' => array_search($index, ['basic', 'premium', 'vip']), 'created_at' => now()]);
                } elseif ($package->price === null) {
                    DB::table('invitation_packages')->where('id', $package->id)->whereNull('price')->update($values);
                }
            }
            // Replace the old uniform seed price; keep manually priced templates and every order snapshot.
            foreach ($prices['templates'] as $key => $price) {
                DB::table('templates')->where('template_key', $key)->where('price', 149000)
                    ->update(['price' => $price, 'updated_at' => now()]);
            }
        });
    }

    public function down(): void
    {
        // Catalog prices are editable business data; rolling back code must not reset them.
    }
};

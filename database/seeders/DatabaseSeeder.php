<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Wedding setup never creates, updates, or replaces application licenses.
        $this->call(WeddingPlatformSeeder::class);
    }
}

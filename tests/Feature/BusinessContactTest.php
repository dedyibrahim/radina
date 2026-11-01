<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class BusinessContactTest extends TestCase
{
    use RefreshDatabase;

    public function test_contact_upgrade_updates_the_public_number_and_preserves_other_settings(): void
    {
        DB::table('system_settings')->updateOrInsert(['key' => 'whatsapp_number'], ['value' => '6281289903664']);
        DB::table('system_settings')->updateOrInsert(['key' => 'company_name'], ['value' => 'Nama kantor tetap']);
        $migration = require database_path('migrations/2026_11_01_000001_update_business_whatsapp_contact.php');
        $migration->up();
        $migration->up();
        $this->getJson('/api/settings')->assertOk()->assertJsonPath('data.whatsapp_number', '6287724170145');
        $this->assertDatabaseHas('system_settings', ['key' => 'company_name', 'value' => 'Nama kantor tetap']);
        $migration->down();
        $this->assertDatabaseHas('system_settings', ['key' => 'whatsapp_number', 'value' => '6287724170145']);
    }
}

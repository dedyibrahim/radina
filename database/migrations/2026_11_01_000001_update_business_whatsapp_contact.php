<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('system_settings')->updateOrInsert(['key' => 'whatsapp_number'], [
            'value' => '6287724170145', 'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        // Rolling back code must not restore an obsolete support contact.
    }
};

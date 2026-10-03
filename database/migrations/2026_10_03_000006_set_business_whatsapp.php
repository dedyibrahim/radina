<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('system_settings')->updateOrInsert(['key' => 'whatsapp_number'], [
            'value' => '6281289903664', 'updated_at' => now(),
        ]);
        DB::table('system_settings')->where('key', 'payment_notice')
            ->where('value', 'Rekening dan WhatsApp masih contoh. Hubungi admin dan pastikan detail pembayaran sebelum transfer.')
            ->update(['value' => 'Rekening pembayaran masih contoh. Hubungi admin dan pastikan detail pembayaran sebelum transfer.', 'updated_at' => now()]);
    }

    public function down(): void
    {
        // Keep the configured business contact when rolling back application code.
    }
};

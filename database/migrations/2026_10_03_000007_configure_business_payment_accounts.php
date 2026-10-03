<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::transaction(function () {
            foreach ([
                'bank_name' => 'Bank Mandiri',
                'bank_account' => '1680001279155',
                'bank_account_name' => 'Dedy Ibrahim',
                'secondary_bank_name' => 'Bank BCA',
                'secondary_bank_account' => '8721354342',
                'secondary_bank_account_name' => 'Dedy Ibrahim',
            ] as $key => $value) {
                DB::table('system_settings')->updateOrInsert(['key' => $key], ['value' => $value, 'updated_at' => now()]);
            }
            DB::table('system_settings')->where('key', 'payment_notice')->whereIn('value', [
                'Rekening dan WhatsApp masih contoh. Hubungi admin dan pastikan detail pembayaran sebelum transfer.',
                'Rekening pembayaran masih contoh. Hubungi admin dan pastikan detail pembayaran sebelum transfer.',
            ])->update(['value' => '', 'updated_at' => now()]);
        });
    }

    public function down(): void
    {
        // Keep configured payment details when rolling back application code.
    }
};

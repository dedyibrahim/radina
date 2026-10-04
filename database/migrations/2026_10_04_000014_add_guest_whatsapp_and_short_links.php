<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('wedding_invitees', function (Blueprint $table) {
            $table->string('whatsapp', 15)->nullable();
            $table->char('short_code', 16)->nullable()->unique();
        });
        Schema::table('weddings', function (Blueprint $table) {
            $table->text('guest_message_template')->nullable();
        });
        // Add aliases without replacing tokens, fingerprints, links, or attendance records.
        DB::table('wedding_invitees')->whereNull('short_code')->orderBy('id')->chunkById(250, function ($guests) {
            foreach ($guests as $guest) {
                do {
                    $code = bin2hex(random_bytes(8));
                } while (DB::table('wedding_invitees')->where('short_code', $code)->exists());
                DB::table('wedding_invitees')->where('id', $guest->id)->whereNull('short_code')->update(['short_code' => $code]);
            }
        });
    }

    public function down(): void
    {
        Schema::table('wedding_invitees', fn (Blueprint $table) => $table->dropColumn(['whatsapp', 'short_code']));
        Schema::table('weddings', fn (Blueprint $table) => $table->dropColumn('guest_message_template'));
    }
};

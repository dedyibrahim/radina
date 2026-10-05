<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('wedding_settings', function (Blueprint $table) {
            $table->boolean('enable_parents')->default(true);
            $table->boolean('enable_social')->default(true);
        });
    }

    public function down(): void
    {
        Schema::table('wedding_settings', fn (Blueprint $table) => $table->dropColumn(['enable_parents', 'enable_social']));
    }
};

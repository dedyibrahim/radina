<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('wedding_events', fn (Blueprint $table) => $table->boolean('use_for_countdown')->default(false));
    }

    public function down(): void
    {
        Schema::table('wedding_events', fn (Blueprint $table) => $table->dropColumn('use_for_countdown'));
    }
};

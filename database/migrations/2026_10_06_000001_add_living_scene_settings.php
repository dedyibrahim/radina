<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('wedding_settings', function (Blueprint $table) {
            $table->string('motion_intensity', 12)->default('cinematic');
            $table->boolean('enable_auto_journey')->default(false);
            $table->string('auto_journey_speed', 8)->default('slow');
        });
    }

    public function down(): void
    {
        Schema::table('wedding_settings', fn (Blueprint $table) => $table->dropColumn([
            'motion_intensity', 'enable_auto_journey', 'auto_journey_speed',
        ]));
    }
};

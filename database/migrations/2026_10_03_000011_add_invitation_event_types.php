<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('event_type', 30)->default('wedding')->index();
            $table->string('event_title')->nullable();
            $table->string('host_name', 120)->nullable();
            $table->string('honoree_name', 120)->nullable();
        });
        Schema::table('weddings', function (Blueprint $table) {
            $table->string('event_type', 30)->default('wedding')->index();
            $table->json('event_details')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('weddings', fn (Blueprint $table) => $table->dropColumn(['event_type', 'event_details']));
        Schema::table('orders', fn (Blueprint $table) => $table->dropColumn(['event_type', 'event_title', 'host_name', 'honoree_name']));
    }
};

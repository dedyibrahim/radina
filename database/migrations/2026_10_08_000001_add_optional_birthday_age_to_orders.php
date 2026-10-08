<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('orders', 'honoree_age')) {
            Schema::table('orders', fn (Blueprint $table) => $table->unsignedTinyInteger('honoree_age')->nullable());
        }
    }

    public function down(): void
    {
        // Keep customer-entered birthday ages if the deployment is rolled back.
    }
};

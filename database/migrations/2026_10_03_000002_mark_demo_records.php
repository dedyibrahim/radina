<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        foreach (['orders', 'weddings'] as $table) {
            Schema::table($table, function (Blueprint $t) {
                $t->boolean('is_demo')->default(false)->index();
            });
        }
    }

    public function down(): void
    {
        foreach (['weddings', 'orders'] as $table) {
            Schema::table($table, function (Blueprint $t) {
                $t->dropColumn('is_demo');
            });
        }
    }
};

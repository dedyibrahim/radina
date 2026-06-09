<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('licenses', function (Blueprint $table) {
            $table->id();
            $table->string('key', 64)->unique();
            $table->string('customer_name');
            $table->string('product_name')->default('Radina News License');
            $table->string('status', 20)->default('active')->index();
            $table->unsignedInteger('max_activations')->default(1);
            $table->date('expires_at')->nullable()->index();
            $table->timestamp('last_activated_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('licenses');
    }
};

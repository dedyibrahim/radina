<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('wedding_invitees', function (Blueprint $table) {
            $table->id();
            $table->foreignId('wedding_id')->constrained()->cascadeOnDelete();
            $table->uuid('token')->unique();
            $table->string('name', 120);
            $table->text('address');
            $table->char('fingerprint', 64);
            $table->timestamps();
            $table->unique(['wedding_id', 'fingerprint']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wedding_invitees');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('wedding_customer_portals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('wedding_id')->unique()->constrained()->cascadeOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->char('token_hash', 64)->unique();
            $table->text('token');
            $table->timestamp('expires_at');
            $table->timestamp('revoked_at')->nullable();
            $table->longText('submission')->nullable();
            $table->unsignedInteger('submission_version')->default(0);
            $table->unsignedInteger('applied_version')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->string('status')->default('DRAFT');
            $table->text('revision_notes')->nullable();
            $table->timestamp('revision_requested_at')->nullable();
            $table->char('approved_fingerprint', 64)->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wedding_customer_portals');
    }
};

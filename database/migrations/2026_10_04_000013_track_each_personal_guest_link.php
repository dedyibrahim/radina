<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invitation_guest_visits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('wedding_id')->constrained()->cascadeOnDelete();
            $table->foreignId('wedding_invitee_id')->constrained()->cascadeOnDelete();
            $table->date('visit_date');
            $table->timestamp('last_seen_at');
            $table->timestamp('opened_at')->nullable();
            $table->unique(['wedding_invitee_id', 'visit_date'], 'personal_guest_visit_day');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invitation_guest_visits');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invitation_packages', function (Blueprint $table) {
            $table->id();
            $table->string('name', 120);
            $table->string('slug', 120)->unique();
            $table->text('description')->nullable();
            $table->string('pricing_mode', 20)->default('TEMPLATE_PLUS');
            $table->unsignedInteger('price')->nullable();
            $table->unsignedSmallInteger('duration_days')->nullable();
            $table->json('features')->nullable();
            $table->boolean('is_active')->default(false);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
        });
        Schema::create('invitation_addons', function (Blueprint $table) {
            $table->id();
            $table->string('name', 120);
            $table->text('description')->nullable();
            $table->unsignedInteger('price');
            $table->boolean('is_active')->default(false);
            $table->timestamps();
        });
        Schema::table('orders', function (Blueprint $table) {
            $table->foreignId('invitation_package_id')->nullable()->constrained('invitation_packages')->nullOnDelete();
            $table->json('pricing_snapshot')->nullable();
        });
        Schema::table('weddings', function (Blueprint $table) {
            $table->timestamp('expires_at')->nullable()->index();
        });
        Schema::create('order_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->string('type', 10);
            $table->string('number', 90)->unique();
            $table->json('snapshot');
            $table->timestamp('issued_at');
            $table->timestamps();
            $table->unique(['order_id', 'type']);
        });
        Schema::create('wedding_check_ins', function (Blueprint $table) {
            $table->id();
            $table->foreignId('wedding_id')->constrained()->cascadeOnDelete();
            $table->foreignId('wedding_invitee_id')->unique()->constrained()->cascadeOnDelete();
            $table->unsignedSmallInteger('people_count');
            $table->foreignId('checked_in_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('checked_in_at');
            $table->timestamps();
        });
        Schema::create('invitation_visits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('wedding_id')->constrained()->cascadeOnDelete();
            $table->foreignId('wedding_invitee_id')->nullable()->constrained()->nullOnDelete();
            $table->char('visitor_hash', 64);
            $table->date('visit_date');
            $table->unsignedInteger('view_count')->default(1);
            $table->timestamp('first_seen_at');
            $table->timestamp('last_seen_at');
            $table->timestamp('opened_at')->nullable();
            $table->unique(['wedding_id', 'visitor_hash', 'visit_date'], 'invitation_visit_identity');
        });
        Schema::table('wedding_rsvps', function (Blueprint $table) {
            $table->foreignId('wedding_invitee_id')->nullable()->constrained()->nullOnDelete();
        });
        Schema::create('order_reminders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->string('key', 120)->unique();
            $table->string('kind', 30);
            $table->string('title', 180);
            $table->text('message');
            $table->timestamp('due_at')->index();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamp('dismissed_at')->nullable();
            $table->timestamp('snoozed_until')->nullable();
            $table->timestamps();
        });
        // Catalog skeletons are inactive; no customer's existing price, expiry or content changes.
        foreach (['Basic', 'Premium', 'VIP'] as $index => $name) {
            DB::table('invitation_packages')->insert(['name' => $name, 'slug' => strtolower($name), 'pricing_mode' => 'TEMPLATE_PLUS', 'sort_order' => $index, 'created_at' => now(), 'updated_at' => now()]);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('order_reminders');
        Schema::table('wedding_rsvps', fn (Blueprint $table) => $table->dropConstrainedForeignId('wedding_invitee_id'));
        Schema::dropIfExists('invitation_visits');
        Schema::dropIfExists('wedding_check_ins');
        Schema::dropIfExists('order_documents');
        Schema::table('weddings', fn (Blueprint $table) => $table->dropColumn('expires_at'));
        Schema::table('orders', function (Blueprint $table) {
            $table->dropConstrainedForeignId('invitation_package_id');
            $table->dropColumn('pricing_snapshot');
        });
        Schema::dropIfExists('invitation_addons');
        Schema::dropIfExists('invitation_packages');
    }
};

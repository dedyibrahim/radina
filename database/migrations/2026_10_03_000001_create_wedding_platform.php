<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('admins', function (Blueprint $t) {
            $t->id();
            $t->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $t->boolean('active')->default(true);
            $t->timestamps();
        });
        Schema::create('template_categories', function (Blueprint $t) {
            $t->id();
            $t->string('name');
            $t->string('slug')->unique();
            $t->timestamps();
        });
        Schema::create('templates', function (Blueprint $t) {
            $t->id();
            $t->foreignId('category_id')->constrained('template_categories');
            $t->string('name');
            $t->string('slug')->unique();
            $t->text('description');
            $t->string('thumbnail', 2048)->nullable();
            $t->string('preview_image', 2048)->nullable();
            $t->unsignedInteger('price');
            $t->string('component_name');
            $t->string('status')->default('ACTIVE')->index();
            $t->boolean('is_featured')->default(false);
            $t->json('features')->nullable();
            $t->timestamps();
        });
        Schema::create('orders', function (Blueprint $t) {
            $t->id();
            $t->string('order_number')->unique();
            $t->foreignId('template_id')->constrained();
            $t->string('customer_name');
            $t->string('whatsapp', 20)->index();
            $t->string('email')->nullable();
            $t->string('bride_name');
            $t->string('groom_name');
            $t->string('slug')->unique();
            $t->unsignedInteger('total');
            $t->string('status')->default('WAITING_PAYMENT')->index();
            $t->timestamps();
            $t->index(['created_at', 'status']);
        });
        Schema::create('payments', function (Blueprint $t) {
            $t->id();
            $t->foreignId('order_id')->unique()->constrained()->cascadeOnDelete();
            $t->string('payment_method')->default('MANUAL_TRANSFER');
            $t->unsignedInteger('amount');
            $t->string('status')->default('PENDING')->index();
            $t->string('reference')->nullable();
            $t->foreignId('confirmed_by')->nullable()->constrained('users')->nullOnDelete();
            $t->timestamp('confirmed_at')->nullable();
            $t->timestamps();
        });
        Schema::create('order_status_histories', function (Blueprint $t) {
            $t->id();
            $t->foreignId('order_id')->constrained()->cascadeOnDelete();
            $t->string('old_status')->nullable();
            $t->string('new_status');
            $t->foreignId('changed_by')->nullable()->constrained('users')->nullOnDelete();
            $t->timestamp('created_at')->useCurrent();
        });
        Schema::create('weddings', function (Blueprint $t) {
            $t->id();
            $t->foreignId('order_id')->unique()->constrained();
            $t->foreignId('template_id')->constrained();
            $t->string('slug')->unique();
            $t->string('status')->default('DRAFT')->index();
            $t->string('title')->nullable();
            $t->date('wedding_date')->nullable();
            $t->text('quote')->nullable();
            $t->string('quote_source')->nullable();
            $t->text('opening_text')->nullable();
            $t->text('closing_text')->nullable();
            $t->string('hashtag')->nullable();
            $t->string('cover_image', 2048)->nullable();
            $t->string('hero_image', 2048)->nullable();
            $t->string('closing_image', 2048)->nullable();
            $t->string('video_url', 2048)->nullable();
            $t->string('music_url', 2048)->nullable();
            $t->unsignedTinyInteger('volume')->default(40);
            $t->boolean('autoplay_after_open')->default(true);
            $t->string('livestream_platform')->nullable();
            $t->string('livestream_url', 2048)->nullable();
            $t->json('shipping_gift')->nullable();
            $t->timestamp('published_at')->nullable();
            $t->timestamp('publish_at')->nullable();
            $t->timestamps(6);
        });
        Schema::create('wedding_couples', function (Blueprint $t) {
            $t->id();
            $t->foreignId('wedding_id')->constrained()->cascadeOnDelete();
            $t->string('role');
            $t->string('full_name');
            $t->string('nickname')->nullable();
            $t->string('father_name')->nullable();
            $t->string('mother_name')->nullable();
            $t->string('photo', 2048)->nullable();
            $t->string('instagram')->nullable();
            $t->string('family_order')->nullable();
            $t->timestamps();
            $t->unique(['wedding_id', 'role']);
        });
        Schema::create('wedding_events', function (Blueprint $t) {
            $t->id();
            $t->foreignId('wedding_id')->constrained()->cascadeOnDelete();
            $t->string('type');
            $t->string('title');
            $t->date('date');
            $t->time('start_time');
            $t->time('end_time');
            $t->string('timezone')->default('Asia/Jakarta');
            $t->string('venue');
            $t->text('address')->nullable();
            $t->string('google_maps_url', 2048)->nullable();
            $t->unsignedInteger('sort_order')->default(0);
            $t->timestamps();
        });
        Schema::create('wedding_stories', function (Blueprint $t) {
            $t->id();
            $t->foreignId('wedding_id')->constrained()->cascadeOnDelete();
            $t->string('date_label');
            $t->string('title');
            $t->text('description');
            $t->string('image', 2048)->nullable();
            $t->unsignedInteger('sort_order')->default(0);
            $t->timestamps();
        });
        Schema::create('wedding_galleries', function (Blueprint $t) {
            $t->id();
            $t->foreignId('wedding_id')->constrained()->cascadeOnDelete();
            $t->string('image', 2048);
            $t->string('caption')->nullable();
            $t->unsignedInteger('sort_order')->default(0);
            $t->timestamps();
        });
        Schema::create('wedding_gifts', function (Blueprint $t) {
            $t->id();
            $t->foreignId('wedding_id')->constrained()->cascadeOnDelete();
            $t->string('bank');
            $t->string('account_number', 60);
            $t->string('account_name');
            $t->string('logo', 2048)->nullable();
            $t->unsignedInteger('sort_order')->default(0);
            $t->timestamps();
        });
        Schema::create('wedding_settings', function (Blueprint $t) {
            $t->id();
            $t->foreignId('wedding_id')->unique()->constrained()->cascadeOnDelete();
            foreach (['music', 'gallery', 'story', 'rsvp', 'wishes', 'gift', 'livestream', 'countdown', 'video', 'maps'] as $feature) {
                $t->boolean('enable_'.$feature)->default(true);
            }
            $t->timestamps();
        });
        Schema::create('wedding_rsvps', function (Blueprint $t) {
            $t->id();
            $t->foreignId('wedding_id')->constrained()->cascadeOnDelete();
            $t->string('name', 120);
            $t->unsignedTinyInteger('guests');
            $t->string('attendance');
            $t->text('message')->nullable();
            $t->timestamps();
            $t->index(['wedding_id', 'created_at']);
        });
        Schema::create('wedding_wishes', function (Blueprint $t) {
            $t->id();
            $t->foreignId('wedding_id')->constrained()->cascadeOnDelete();
            $t->string('name', 120);
            $t->text('message');
            $t->boolean('visible')->default(true);
            $t->timestamps();
            $t->index(['wedding_id', 'visible', 'created_at']);
        });
        Schema::create('media', function (Blueprint $t) {
            $t->id();
            $t->foreignId('wedding_id')->nullable()->constrained()->cascadeOnDelete();
            $t->foreignId('uploaded_by')->constrained('users');
            $t->string('collection');
            $t->string('disk')->default('public');
            $t->string('path')->unique();
            $t->string('mime_type');
            $t->unsignedBigInteger('size');
            $t->timestamps();
        });
        Schema::create('system_settings', function (Blueprint $t) {
            $t->id();
            $t->string('key')->unique();
            $t->text('value')->nullable();
            $t->timestamps();
        });
    }

    public function down(): void
    {
        foreach (['system_settings', 'media', 'wedding_wishes', 'wedding_rsvps', 'wedding_settings', 'wedding_gifts', 'wedding_galleries', 'wedding_stories', 'wedding_events', 'wedding_couples', 'weddings', 'order_status_histories', 'payments', 'orders', 'templates', 'template_categories', 'admins'] as $table) {
            Schema::dropIfExists($table);
        }
    }
};

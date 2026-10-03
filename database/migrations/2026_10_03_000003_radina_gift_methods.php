<?php

use App\Models\WeddingGiftMethod;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('templates', function (Blueprint $table) {
            $table->string('template_key', 80)->default('romantic-floral');
        });
        Schema::create('wedding_gift_methods', function (Blueprint $table) {
            $table->id();
            $table->foreignId('wedding_id')->constrained()->cascadeOnDelete();
            $table->string('type', 16);
            $table->string('provider', 120)->nullable();
            $table->text('account_number')->nullable();
            $table->string('account_name', 120)->nullable();
            $table->text('logo')->nullable();
            $table->text('qr_image')->nullable();
            $table->string('recipient_name', 120)->nullable();
            $table->text('phone')->nullable();
            $table->text('address')->nullable();
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
            $table->index(['wedding_id', 'is_active', 'sort_order']);
        });
        foreach (DB::table('wedding_gifts')->orderBy('id')->get() as $gift) {
            WeddingGiftMethod::create(['wedding_id' => $gift->wedding_id, 'type' => 'BANK', 'provider' => $gift->bank, 'account_number' => $gift->account_number, 'account_name' => $gift->account_name, 'logo' => $gift->logo, 'is_active' => true, 'sort_order' => $gift->sort_order]);
        }
        foreach (DB::table('weddings')->whereNotNull('shipping_gift')->get() as $w) {
            $gift = json_decode($w->shipping_gift, true);
            if (! empty($gift['address'])) {
                WeddingGiftMethod::create(['wedding_id' => $w->id, 'type' => 'PHYSICAL', 'recipient_name' => $gift['recipient'] ?? null, 'phone' => $gift['phone'] ?? null, 'address' => $gift['address'], 'is_active' => true, 'sort_order' => 100]);
            }
        }
        foreach (['company_name' => 'Radina', 'seo_title' => 'Radina — Abadikan Momen Bahagia Anda', 'seo_description' => 'Radina membantu Anda membuat undangan pernikahan digital yang elegan, modern, personal, dan mudah dibagikan.', 'footer' => 'Abadikan Momen Bahagia Anda', 'logo' => '/brand/radina-logo.svg'] as $key => $value) {
            DB::table('system_settings')->updateOrInsert(['key' => $key], ['value' => $value]);
        }
        DB::table('system_settings')->where('key', 'email')->where('value', 'hello@everafter.test')->update(['value' => 'hello@radina.test']);
    }

    public function down(): void
    {
        Schema::dropIfExists('wedding_gift_methods');
        Schema::table('templates', fn (Blueprint $table) => $table->dropColumn('template_key'));
    }
};

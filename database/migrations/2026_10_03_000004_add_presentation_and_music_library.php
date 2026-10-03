<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('music_library', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('artist')->nullable();
            $table->text('file_url');
            $table->text('cover_image')->nullable();
            $table->string('category');
            $table->unsignedInteger('duration')->nullable();
            $table->boolean('is_active')->default(true);
            $table->boolean('is_featured')->default(false);
            $table->timestamps();
            $table->index(['is_active', 'category']);
        });
        Schema::table('weddings', function (Blueprint $table) {
            $table->json('section_content')->nullable();
            $table->json('section_order')->nullable();
            $table->json('music_playlist')->nullable();
            $table->boolean('music_shuffle')->default(false);
            $table->boolean('music_repeat')->default(true);
        });
    }

    public function down(): void
    {
        Schema::table('weddings', fn (Blueprint $table) => $table->dropColumn(['section_content', 'section_order', 'music_playlist', 'music_shuffle', 'music_repeat']));
        Schema::dropIfExists('music_library');
    }
};

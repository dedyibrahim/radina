<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('news_article_images')) {
            return;
        }

        Schema::create('news_article_images', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('article_id')->constrained('news_articles')->cascadeOnDelete();
            $table->string('image_url', 2048);
            $table->string('alt_text', 180)->nullable();
            $table->string('caption', 500)->nullable();
            $table->unsignedSmallInteger('position_after_paragraph')->default(0);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index(['article_id', 'sort_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('news_article_images');
    }
};

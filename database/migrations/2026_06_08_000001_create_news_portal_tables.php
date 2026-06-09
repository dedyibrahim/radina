<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('news_categories', function (Blueprint $table): void {
            $table->id();
            $table->string('name', 100);
            $table->string('slug', 120)->unique();
            $table->text('description')->nullable();
            $table->string('accent_color', 20)->default('#F97316');
            $table->string('cover_image_url', 2048)->nullable();
            $table->string('seo_title', 160)->nullable();
            $table->string('seo_description', 255)->nullable();
            $table->timestamps();
        });

        Schema::create('news_tags', function (Blueprint $table): void {
            $table->id();
            $table->string('name', 100);
            $table->string('slug', 120)->unique();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('news_articles', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('category_id')->constrained('news_categories')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('title', 180);
            $table->string('slug', 220)->unique();
            $table->text('excerpt');
            $table->longText('content');
            $table->string('cover_image_url', 2048);
            $table->string('cover_image_alt', 180)->nullable();
            $table->string('status', 20)->default('draft')->index();
            $table->boolean('is_featured')->default(false)->index();
            $table->unsignedSmallInteger('reading_time')->default(4);
            $table->unsignedBigInteger('views_count')->default(0)->index();
            $table->timestamp('published_at')->nullable()->index();
            $table->string('seo_title', 160)->nullable();
            $table->string('seo_description', 255)->nullable();
            $table->string('seo_keywords', 255)->nullable();
            $table->string('og_image_url', 2048)->nullable();
            $table->timestamps();
        });

        Schema::create('news_article_tag', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('article_id')->constrained('news_articles')->cascadeOnDelete();
            $table->foreignId('tag_id')->constrained('news_tags')->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['article_id', 'tag_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('news_article_tag');
        Schema::dropIfExists('news_articles');
        Schema::dropIfExists('news_tags');
        Schema::dropIfExists('news_categories');
    }
};

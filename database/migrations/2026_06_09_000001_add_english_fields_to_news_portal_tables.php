<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('news_categories', function (Blueprint $table): void {
            $table->string('name_en', 100)->nullable()->after('name');
            $table->text('description_en')->nullable()->after('description');
            $table->string('seo_title_en', 160)->nullable()->after('seo_title');
            $table->string('seo_description_en', 255)->nullable()->after('seo_description');
        });

        Schema::table('news_tags', function (Blueprint $table): void {
            $table->string('name_en', 100)->nullable()->after('name');
            $table->text('description_en')->nullable()->after('description');
        });

        Schema::table('news_articles', function (Blueprint $table): void {
            $table->string('title_en', 180)->nullable()->after('title');
            $table->text('excerpt_en')->nullable()->after('excerpt');
            $table->longText('content_en')->nullable()->after('content');
            $table->string('cover_image_alt_en', 180)->nullable()->after('cover_image_alt');
            $table->string('seo_title_en', 160)->nullable()->after('seo_title');
            $table->string('seo_description_en', 255)->nullable()->after('seo_description');
            $table->string('seo_keywords_en', 255)->nullable()->after('seo_keywords');
        });
    }

    public function down(): void
    {
        Schema::table('news_articles', function (Blueprint $table): void {
            $table->dropColumn([
                'title_en',
                'excerpt_en',
                'content_en',
                'cover_image_alt_en',
                'seo_title_en',
                'seo_description_en',
                'seo_keywords_en',
            ]);
        });

        Schema::table('news_tags', function (Blueprint $table): void {
            $table->dropColumn(['name_en', 'description_en']);
        });

        Schema::table('news_categories', function (Blueprint $table): void {
            $table->dropColumn([
                'name_en',
                'description_en',
                'seo_title_en',
                'seo_description_en',
            ]);
        });
    }
};

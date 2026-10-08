<?php

use App\Services\TemplateCatalog;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        $now = now();
        foreach (TemplateCatalog::worlds() as $key => $world) {
            $categorySlug = Str::slug($world['category']);
            $categoryId = DB::table('template_categories')->where('slug', $categorySlug)->value('id');
            if (! $categoryId) {
                $categoryId = DB::table('template_categories')->insertGetId([
                    'name' => $world['category'], 'slug' => $categorySlug, 'created_at' => $now, 'updated_at' => $now,
                ]);
            }
            if (DB::table('templates')->where('template_key', $key)->orWhere('slug', $key)->exists()) {
                continue;
            }
            DB::table('templates')->insert([
                'category_id' => $categoryId,
                'name' => $world['name'],
                'slug' => $key,
                'description' => $world['description'],
                'thumbnail' => $world['thumbnail'] ?? '/images/templates/cinematic-worlds/'.$key.'.svg',
                'preview_image' => $world['thumbnail'] ?? '/images/templates/cinematic-worlds/'.$key.'.svg',
                'price' => config('invitation-pricing.templates.'.$key, $world['price']),
                'component_name' => TemplateCatalog::worldComponent($key),
                'template_key' => $key,
                'status' => 'ACTIVE',
                'is_featured' => false,
                'features' => json_encode(['Cinematic world', 'RSVP & ucapan', 'Galeri foto', 'Musik latar', 'CMS bersama', 'Responsive'], JSON_THROW_ON_ERROR),
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }
    }

    public function down(): void
    {
        // Catalog entries may already be referenced by orders, so rollback never removes them.
    }
};

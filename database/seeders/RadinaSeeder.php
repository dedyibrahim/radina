<?php

namespace Database\Seeders;

use App\Models\Template;
use App\Models\TemplateCategory;
use App\Services\TemplateCatalog;
use Illuminate\Database\Seeder;

class RadinaSeeder extends Seeder
{
    public function run(): void
    {
        $catalog = [['romantic-floral', 'RomanticFloral', 'Romantic Floral', 'Romantic', 'Bunga watercolor, botanical halus, ivory dan dusty rose.'], ['elegant-luxury', 'ElegantLuxury', 'Elegant Luxury', 'Elegant', 'Editorial mewah, monogram emas dan bingkai garis klasik.'], ['minimalist-white', 'MinimalistWhite', 'Minimalist White', 'Minimalist', 'White space, tipografi minimal dan fotografi yang jernih.'], ['nusantara-heritage', 'NusantaraHeritage', 'Nusantara Heritage', 'Traditional', 'Motif geometris terinspirasi Nusantara, maroon dan emas.'], ['garden-dream', 'GardenDream', 'Garden Dream', 'Romantic', 'Arch taman, daun sage dan suasana outdoor yang hangat.'], ['classic-vintage', 'ClassicVintage', 'Classic Vintage', 'Elegant', 'Tekstur kertas, foto sepia dan bingkai kartu pos klasik.'], ['midnight-romance', 'MidnightRomance', 'Midnight Romance', 'Modern', 'Burgundy, charcoal dan fotografi kontras dalam layout modern.'], ['sakinah', 'Sakinah', 'Sakinah', 'Traditional', 'Bingkai arch, pola geometris halus dan palet ivory hijau.'], ['eternal-story', 'EternalStory', 'Eternal Story', 'Modern', 'Foto layar penuh dan bab cerita cinta bergaya sinematik.'], ['blush', 'Blush', 'Blush', 'Modern', 'Gradient pink lavender, kartu lembut dan tipografi modern.']];
        foreach ($catalog as [$key,$folder,$name,$category,$description]) {
            $cat = TemplateCategory::firstOrCreate(['slug' => strtolower($category)], ['name' => $category]);
            $template = Template::firstOrCreate(['slug' => $key], ['category_id' => $cat->id, 'name' => $name, 'description' => $description, 'price' => config('invitation-pricing.templates.'.$key, 149000), 'component_name' => $folder.'.vue', 'template_key' => $key, 'status' => 'ACTIVE', 'is_featured' => in_array($key, ['romantic-floral', 'elegant-luxury', 'garden-dream']), 'thumbnail' => '/images/templates/'.$key.'.svg', 'preview_image' => '/images/templates/'.$key.'.svg', 'features' => ['Musik latar', 'RSVP & ucapan', 'Galeri foto', 'Wedding gift', 'CMS bersama', 'Responsive']]);
            if ($template->template_key === 'romantic-floral' && $key !== 'romantic-floral') {
                $template->update(['template_key' => $key]);
            }
        }
        foreach (TemplateCatalog::demos() as $entry) {
            $category = TemplateCategory::firstOrCreate(['slug' => strtolower($entry['category'])], ['name' => $entry['category']]);
            Template::firstOrCreate(['slug' => $entry['key']], [
                'template_key' => $entry['key'], 'component_name' => $entry['folder'].'.vue',
                'name' => $entry['name'], 'category_id' => $category->id,
                'description' => $entry['quote'], 'price' => config('invitation-pricing.templates.'.$entry['key'], 149000), 'status' => 'ACTIVE',
                'is_featured' => false, 'thumbnail' => $entry['thumbnail'] ?? '/storage/templates/previews/'.$entry['key'].'.webp',
                'preview_image' => $entry['thumbnail'] ?? '/storage/templates/previews/'.$entry['key'].'.webp',
                'features' => ['Playlist musik', 'RSVP & ucapan', 'Wedding gift', 'CMS bersama', 'Galeri interaktif', 'Responsive'],
            ]);
        }
        foreach (TemplateCatalog::availableWorlds() as $key => $entry) {
            $category = TemplateCategory::firstOrCreate(['slug' => strtolower(str_replace(' & ', '-', $entry['category']))], ['name' => $entry['category']]);
            Template::firstOrCreate(['slug' => $key], [
                'template_key' => $key, 'component_name' => TemplateCatalog::worldComponent($key),
                'name' => $entry['name'], 'category_id' => $category->id,
                'description' => $entry['description'], 'price' => config('invitation-pricing.templates.'.$key, $entry['price']),
                'status' => 'ACTIVE', 'is_featured' => false,
                'thumbnail' => $entry['thumbnail'] ?? '/images/templates/cinematic-worlds/'.$key.'.svg',
                'preview_image' => $entry['thumbnail'] ?? '/images/templates/cinematic-worlds/'.$key.'.svg',
                'features' => ['Cinematic world', 'RSVP & ucapan', 'Galeri foto', 'Musik latar', 'CMS bersama', 'Responsive'],
            ]);
        }
        // Catalog taxonomy changes presentation metadata, never wedding content or prices.
        $taxonomy = ['romantic-floral' => 'Romantic', 'elegant-luxury' => 'Luxury', 'minimalist-white' => 'Minimalist', 'nusantara-heritage' => 'Traditional', 'garden-dream' => 'Garden', 'classic-vintage' => 'Vintage', 'midnight-romance' => 'Modern', 'sakinah' => 'Islamic', 'eternal-story' => 'Cinematic', 'blush' => 'Creative', 'celestial' => 'Romantic'];
        foreach (['Romantic', 'Luxury', 'Minimalist', 'Traditional', 'Garden', 'Islamic', 'Cinematic', 'Vintage', 'Destination', 'Creative', 'Modern'] as $name) {
            TemplateCategory::firstOrCreate(['slug' => strtolower($name)], ['name' => $name]);
        }
        foreach ($taxonomy as $key => $name) {
            Template::where('template_key', $key)->update(['category_id' => TemplateCategory::where('slug', strtolower($name))->value('id')]);
        }
    }
}

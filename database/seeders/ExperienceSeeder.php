<?php

namespace Database\Seeders;

use App\Models\MusicTrack;
use App\Models\Order;
use App\Models\Template;
use App\Models\Wedding;
use App\Services\TemplateContent;
use App\Services\MusicCatalogService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;

class ExperienceSeeder extends Seeder
{
    public function run(): void
    {
        $public = base_path('frontend/public');
        foreach (File::glob($public.'/images/demos/*.webp') as $path) {
            Storage::disk('public')->put('templates/experiences/'.basename($path), File::get($path));
        }
        app(MusicCatalogService::class)->installFiles();
        foreach (File::glob($public.'/images/templates/previews/*.webp') as $path) {
            $key = pathinfo($path, PATHINFO_FILENAME);
            Storage::disk('public')->put('templates/previews/'.basename($path), File::get($path));
            $template = Template::where('template_key', $key)->first();
            if ($template && (str_ends_with($template->thumbnail ?? '', '.svg') || str_contains($template->thumbnail ?? '', '/templates/demo/') || str_contains($template->thumbnail ?? '', '/templates/previews/'))) {
                $template->update(['thumbnail' => '/storage/templates/previews/'.basename($path), 'preview_image' => '/storage/templates/previews/'.basename($path)]);
            }
        }
        $source = Wedding::where('is_demo', true)->where('slug', 'demo-romantic-floral')->first() ?? Wedding::where('is_demo', true)->first();
        if (! $source) {
            return;
        }
        $source->loadContent();
        $demos = [['romantic-floral', 'Alya', 'Rizky', 'A garden full of promises', 'Taman Senja'], ['elegant-luxury', 'Salsabila', 'Damar', 'Elegance in every moment', 'The Grand Atelier'], ['minimalist-white', 'Nadia', 'Raka', 'The beauty of choosing each other', 'White Pavilion'], ['nusantara-heritage', 'Sekar', 'Bagas', 'Kasih yang tumbuh dalam tradisi', 'Pendopo Kencana'], ['garden-dream', 'Amara', 'Reza', 'Like wildflowers, we grew together', 'The Greenhouse'], ['classic-vintage', 'Clara', 'Daniel', 'A letter that became a lifetime', 'Heritage House'], ['midnight-romance', 'Keisha', 'Arga', 'We found our light after dark', 'Midnight Terrace'], ['sakinah', 'Aisyah', 'Farhan', 'Dan dijadikan-Nya di antaramu rasa kasih dan sayang.', 'Bale Sakinah'], ['eternal-story', 'Nara', 'Adrian', 'Every frame led me back to you', 'The Cinema Garden'], ['blush', 'Celine', 'Evan', 'A thousand little joys, shared with you', 'Daydream Studio']];
        foreach (json_decode(File::get(config_path('additional-template-demos.json')), true) as $entry) {
            $demos[] = [$entry['key'], $entry['bride'], $entry['groom'], $entry['quote'], $entry['venue']];
        }
        foreach ($demos as $i => [$key,$bride,$groom,$quote,$venue]) {
            DB::transaction(function () use ($i, $key, $bride, $groom, $quote, $venue, $source) {
                $template = Template::where('template_key', $key)->first();
                if (! $template) {
                    return;
                }
                $preset = TemplateContent::preset($key);
                $demoDefinition = collect(json_decode(File::get(config_path('additional-template-demos.json')), true))->firstWhere('key', $key);
                $heroPhotos = [1, 16, 4, 13, 11, 10, 15, 0, 2, -1, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 1, 4, 13, 21, 22];
                $photoNumber = $demoDefinition['hero_photo'] ?? ($heroPhotos[$i] ?? (($i % 30) + 1));
                $heroPhoto = $photoNumber > 0 ? '/storage/templates/experiences/photo-'.$photoNumber.'.webp' : ($photoNumber === 0 ? $source->hero_image : $source->closing_image);
                // Existing customer prices, visibility, featured flags, and CMS data are preserved.
                $template->update(['name' => $preset['name'], 'description' => $quote.' · '.$preset['name']]);
                $slug = 'radina-demo-'.$key;
                if (Wedding::where('slug', $slug)->where('is_demo', false)->exists()) {
                    return;
                }
                $existing = Wedding::where('slug', $slug)->where('is_demo', true)->first();
                if ($existing) {
                    if ($demoDefinition && data_get($existing->section_content, 'home.heading') === $preset['name']) {
                        $content = $existing->section_content;
                        $content['home']['heading'] = $preset['sections']['home']['heading'];
                        $existing->update(['section_content' => $content]);
                    }
                    $defaultStoryText = ['Sebuah pertemuan kecil mempertemukan '.$bride.' dan '.$groom.'.', 'Percakapan panjang dan perjalanan sederhana menjadi kenangan favorit kami.', 'Di '.$venue.', kami memutuskan untuk menulis bab berikutnya bersama.', 'Kini kami mengundang Anda menjadi bagian dari awal perjalanan '.$bride.' & '.$groom.'.'];
                    if ($demoDefinition && $existing->stories()->orderBy('sort_order')->pluck('description')->all() === $defaultStoryText) {
                        foreach ($existing->stories()->orderBy('sort_order')->get() as $j => $story) {
                            $story->update(['title' => $demoDefinition['story'][$j]['title'], 'description' => $demoDefinition['story'][$j]['text']]);
                        }
                    }
                    if ($demoDefinition && $existing->gallery()->orderBy('sort_order')->pluck('image')->all() === array_map(fn ($j) => '/storage/templates/experiences/photo-'.((($i * 2 + $j) % 19) + 1).'.webp', range(0, 5))) {
                        foreach ($existing->gallery()->orderBy('sort_order')->get() as $j => $photo) {
                            $photo->update(['image' => '/storage/templates/experiences/photo-'.(21 + (($i - 10 + $j) % 10)).'.webp']);
                        }
                    }
                    if ($existing->hero_image === '/storage/templates/experiences/photo-'.($i + 11).'.webp' || $existing->hero_image === $source->hero_image) {
                        $existing->update(['cover_image' => $heroPhoto, 'hero_image' => $heroPhoto, 'closing_image' => $heroPhoto]);
                        $existing->couples()->update(['photo' => $heroPhoto]);
                    }
                    if (! $existing->music_playlist) {
                        $tracks = MusicTrack::where('category', $preset['mood'][0])->get()->take(1);
                        if ($tracks->isEmpty()) {
                            $tracks = MusicTrack::limit(1)->get();
                        }
                        $extra = MusicTrack::whereNotIn('id', $tracks->pluck('id'))->first();
                        if ($extra) {
                            $tracks->push($extra);
                        }
                        if ($tracks->isNotEmpty()) {
                            $existing->update(['music_playlist' => $tracks->map(fn ($t) => ['library_id' => $t->id, 'title' => $t->title, 'artist' => $t->artist, 'url' => $t->file_url, 'duration' => $t->duration])->values()->all()]);
                        }
                    }

                    return;
                }
                $order = Order::create(['order_number' => 'RADINA-DEMO-'.strtoupper($key), 'template_id' => $template->id, 'customer_name' => 'Radina Demo', 'whatsapp' => '6281234567890', 'bride_name' => $bride, 'groom_name' => $groom, 'slug' => $slug, 'total' => 0, 'status' => 'PUBLISHED', 'is_demo' => true]);
                $order->payment()->create(['amount' => 0, 'status' => 'PAID', 'payment_method' => 'MANUAL_TRANSFER', 'confirmed_at' => now()]);
                $order->histories()->create(['old_status' => null, 'new_status' => 'PUBLISHED']);
                $photo = function ($number) use ($source) {
                    $path = 'templates/experiences/photo-'.$number.'.webp';

                    return Storage::disk('public')->exists($path) ? '/storage/'.$path : $source->hero_image;
                };
                $availableMusic = MusicTrack::where('is_active', true)->orderBy('id')->get();
                $music = $availableMusic->isNotEmpty() ? $availableMusic[$i % $availableMusic->count()] : null;
                $next = $availableMusic->count() > 1 ? $availableMusic[($i + 1) % $availableMusic->count()] : null;
                $playlist = app(MusicCatalogService::class)->playlist(collect([$music, $next])->filter()->all());
                $w = Wedding::create(['order_id' => $order->id, 'template_id' => $template->id, 'slug' => $slug, 'status' => 'PUBLISHED', 'title' => 'The Wedding of '.$bride.' & '.$groom, 'wedding_date' => '2026-12-12', 'is_demo' => true, 'published_at' => now(), 'cover_image' => $photo($i + 1), 'hero_image' => $photo($i + 11), 'closing_image' => $photo($i + 1), 'hashtag' => '#'.$bride.$groom.'Wedding', 'quote' => $quote, 'quote_source' => $key === 'sakinah' ? 'QS. Ar-Rum: 21' : 'Our promise', 'opening_text' => $preset['opening_text'], 'closing_text' => 'Dengan penuh cinta, '.$bride.' & '.$groom.' berterima kasih atas setiap doa dan kenangan yang Anda bagikan.', 'section_content' => $preset['sections'], 'music_url' => $music?->file_url ?? $source->music_url, 'music_playlist' => $playlist, 'music_repeat' => true, 'autoplay_after_open' => true, 'volume' => 40]);
                $w->update(['cover_image' => $heroPhoto, 'hero_image' => $heroPhoto, 'closing_image' => $heroPhoto]);
                foreach (['bride' => $bride, 'groom' => $groom] as $role => $name) {
                    $original = $source->couples->firstWhere('role', $role);
                    $w->couples()->create(['role' => $role, 'full_name' => $name, 'nickname' => $name, 'father_name' => $original?->father_name, 'mother_name' => $original?->mother_name, 'family_order' => $role === 'bride' ? 'Putri tercinta dari' : 'Putra tercinta dari', 'photo' => $photo($role === 'bride' ? $i + 1 : $i + 11)]);
                }
                $w->couples()->update(['photo' => $heroPhoto]);
                foreach ($source->events as $index => $event) {
                    $values = $event->only(['type', 'title', 'date', 'start_time', 'end_time', 'timezone', 'address', 'google_maps_url']);
                    if ($i >= 10) {
                        $values['title'] = $index ? $preset['name'].' · Celebration' : $preset['name'].' · Ceremony';
                        $values['start_time'] = $index ? '11:30' : '09:00';
                        $values['end_time'] = $index ? '14:30' : '10:30';
                        $values['address'] = 'Lokasi ilustrasi '.$venue.' — alamat demo, bukan informasi acara nyata.';
                        $values['google_maps_url'] = 'https://www.google.com/maps/search/?api=1&query='.rawurlencode($venue);
                    }
                    $w->events()->create($values + ['venue' => $venue.' · lokasi demo', 'sort_order' => $index]);
                }
                $chapters = [['2022', 'An unexpected hello', 'Sebuah pertemuan kecil mempertemukan '.$bride.' dan '.$groom.'.'], ['2023', 'A little closer', 'Percakapan panjang dan perjalanan sederhana menjadi kenangan favorit kami.'], ['2025', 'The promise', 'Di '.$venue.', kami memutuskan untuk menulis bab berikutnya bersama.'], ['2026', 'Our next chapter', 'Kini kami mengundang Anda menjadi bagian dari awal perjalanan '.$bride.' & '.$groom.'.']];
                foreach ($chapters as $j => [$year,$title,$text]) {
                    if ($demoDefinition) {
                        $title = $demoDefinition['story'][$j]['title'];
                        $text = $demoDefinition['story'][$j]['text'];
                    }
                    $w->stories()->create(['date_label' => $year, 'title' => $title, 'description' => $text, 'image' => $photo((($i * 2 + $j) % 19) + 1), 'sort_order' => $j]);
                }
                for ($j = 0; $j < 6; $j++) {
                    $w->gallery()->create(['image' => $photo($i >= 10 ? 21 + (($i - 10 + $j) % 10) : (($i * 2 + $j) % 19) + 1), 'caption' => $bride.' & '.$groom.' · Memory '.($j + 1), 'sort_order' => $j]);
                }
                foreach ($source->giftMethods as $method) {
                    $values = $method->only(['type', 'provider', 'account_number', 'account_name', 'logo', 'qr_image', 'recipient_name', 'phone', 'address', 'description', 'is_active', 'sort_order']);
                    if ($method->type === 'BANK') {
                        $values['account_name'] = $bride;
                    }if ($method->type === 'PHYSICAL') {
                        $values['recipient_name'] = $bride.' & '.$groom;
                    }$w->giftMethods()->create($values);
                }
                foreach ($source->gifts as $gift) {
                    $w->gifts()->create($gift->only(['bank', 'account_number', 'logo', 'sort_order']) + ['account_name' => $bride]);
                }
                $w->settings()->create(['enable_livestream' => false, 'enable_video' => false]);
            });
        }
    }
}

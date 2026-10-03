<?php

namespace Database\Seeders;

use App\Models\Admin;
use App\Models\Media;
use App\Models\Order;
use App\Models\SystemSetting;
use App\Models\Template;
use App\Models\TemplateCategory;
use App\Models\User;
use App\Models\Wedding;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class WeddingPlatformSeeder extends Seeder
{
    public function run(): void
    {
        $email = config('platform.admin_email');
        $password = config('platform.admin_password');
        $admin = $email ? User::where('email', $email)->first() : User::where('role', User::ROLE_ADMIN)->first();
        if (! $admin) {
            if (! $email || ! $password) {
                throw new \RuntimeException('Configure ADMIN_EMAIL and ADMIN_PASSWORD for a new installation. Existing administrator credentials are preserved.');
            }
            $admin = User::create(['email' => $email, 'name' => 'Administrator', 'role' => User::ROLE_ADMIN, 'password' => Hash::make($password), 'email_verified_at' => now()]);
        }
        if (! $admin->isAdmin()) {
            throw new \RuntimeException('The configured ADMIN_EMAIL belongs to a non-administrator.');
        }
        foreach (User::where('role', User::ROLE_ADMIN)->get() as $account) {
            Admin::firstOrCreate(['user_id' => $account->id], ['active' => true]);
        }
        $categories = [];
        foreach (['Romantic', 'Elegant', 'Minimalist', 'Traditional', 'Modern'] as $name) {
            $categories[$name] = TemplateCategory::firstOrCreate(['slug' => strtolower($name)], ['name' => $name]);
        }
        $template = Template::firstOrCreate(['slug' => 'romantic-floral'], [
            'category_id' => $categories['Romantic']->id, 'name' => 'Romantic Floral', 'description' => 'Sebuah cerita cinta dalam balutan ivory, bunga dusty rose, dan aksen champagne. Intim, romantis, dan indah di setiap layar.',
            'thumbnail' => '/storage/templates/demo/cover.webp', 'preview_image' => '/storage/templates/demo/hero.webp', 'price' => 149000, 'component_name' => 'RomanticFloralTemplate.vue', 'status' => 'ACTIVE', 'is_featured' => true,
            'features' => ['Bunga bergerak', 'Musik latar', 'RSVP & ucapan', 'Galeri foto', 'Countdown', 'Google Maps', 'Kalender digital', 'Wedding gift'],
        ]);
        foreach (['company_name' => 'Radina', 'whatsapp_number' => '6281234567890', 'email' => 'hello@radina.test', 'bank_name' => 'BCA', 'bank_account' => '1234567890', 'bank_account_name' => 'Nama pemilik rekening — contoh', 'instagram' => 'https://www.instagram.com/', 'footer' => 'Made for your once-in-a-lifetime moment.', 'seo_title' => 'Radina — Undangan Digital, Cerita Cinta Anda', 'seo_description' => 'Undangan pernikahan digital yang personal, elegan, dan mudah dibagikan. Pilih template, pesan, dan rayakan cerita cinta Anda.', 'logo' => '/brand/radina-logo.svg', 'payment_notice' => 'Rekening dan WhatsApp masih contoh. Hubungi admin dan pastikan detail pembayaran sebelum transfer.'] as $key => $value) {
            SystemSetting::firstOrCreate(['key' => $key], ['value' => $value]);
        }
        foreach (File::files(base_path('frontend/public/images')) as $file) {
            Storage::disk('public')->put('templates/demo/'.$file->getFilename(), File::get($file));
        }
        Storage::disk('public')->put('templates/demo/wedding-song.mp3', File::get(base_path('frontend/public/music/wedding-song.mp3')));
        Storage::disk('public')->put('templates/demo/our-story.mp4', File::get(base_path('frontend/public/video/our-story.mp4')));
        $this->call(RadinaSeeder::class);
        $existing = Order::where('order_number', 'WD-DEMO-0001')->first();
        if ($existing?->wedding) {
            $existing->update(['is_demo' => true]);
            $existing->wedding->update(['is_demo' => true]);
            $this->call(ExperienceSeeder::class);

            return;
        }
        DB::transaction(function () use ($admin, $template) {
            $order = Order::create(['order_number' => 'WD-DEMO-0001', 'template_id' => $template->id, 'customer_name' => 'Demo Radina', 'whatsapp' => '6281234567890', 'bride_name' => 'Alya Putri Ramadhani', 'groom_name' => 'Rizky Pratama', 'slug' => 'demo-romantic-floral', 'total' => 0, 'status' => 'PUBLISHED']);
            $order->update(['is_demo' => true]);
            $order->payment()->create(['amount' => 0, 'status' => 'PAID', 'confirmed_by' => $admin->id, 'confirmed_at' => now()]);
            $order->histories()->create(['old_status' => null, 'new_status' => 'PUBLISHED', 'changed_by' => $admin->id]);
            $w = Wedding::create(['order_id' => $order->id, 'template_id' => $template->id, 'slug' => $order->slug, 'status' => 'PUBLISHED', 'title' => 'The Wedding of Alya & Rizky', 'wedding_date' => '2026-12-12',
                'quote' => 'Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu pasangan hidup dari jenismu sendiri, supaya kamu merasa tenteram kepadanya, dan dijadikan-Nya di antaramu rasa kasih dan sayang.',
                'quote_source' => 'QS. Ar-Rum: 21', 'opening_text' => 'Dengan memohon rahmat dan ridho Allah SWT, kami bermaksud menyelenggarakan pernikahan kami.',
                'closing_text' => 'Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.',
                'hashtag' => '#AlyaRizkyWedding', 'cover_image' => '/storage/templates/demo/cover.webp', 'hero_image' => '/storage/templates/demo/hero.webp', 'closing_image' => '/storage/templates/demo/closing.webp',
                'music_url' => '/storage/templates/demo/wedding-song.mp3', 'video_url' => '/storage/templates/demo/our-story.mp4', 'volume' => 40, 'published_at' => now(),
                'shipping_gift' => ['recipient' => 'Alya Putri Ramadhani', 'address' => 'Alamat pengiriman contoh — konfirmasi dengan pasangan.', 'phone' => ''],
            ]);
            $w->update(['is_demo' => true]);
            foreach ([
                ['role' => 'bride', 'full_name' => 'Alya Putri Ramadhani', 'nickname' => 'Alya', 'father_name' => 'Bapak Ahmad', 'mother_name' => 'Ibu Siti', 'photo' => '/storage/templates/demo/bride.webp', 'instagram' => 'alyaputri', 'family_order' => 'Putri pertama dari'],
                ['role' => 'groom', 'full_name' => 'Rizky Pratama', 'nickname' => 'Rizky', 'father_name' => 'Bapak Budi', 'mother_name' => 'Ibu Rina', 'photo' => '/storage/templates/demo/groom.webp', 'instagram' => 'rizkypratama', 'family_order' => 'Putra pertama dari'],
            ] as $person) {
                $w->couples()->create($person);
            }
            foreach ([['Akad Nikah', '08:00', '10:00'], ['Resepsi', '11:00', '14:00']] as $i => $event) {
                $w->events()->create(['type' => $i ? 'reception' : 'akad', 'title' => $event[0], 'date' => '2026-12-12', 'start_time' => $event[1], 'end_time' => $event[2], 'timezone' => 'Asia/Jakarta', 'venue' => 'Grand Ballroom', 'address' => 'Jl. M.H. Thamrin No. 1, Menteng, Jakarta Pusat, DKI Jakarta', 'google_maps_url' => 'https://www.google.com/maps/search/?api=1&query=Grand+Hyatt+Jakarta', 'sort_order' => $i]);
            }
            foreach ([['2022', 'First Meet', 'Pertemuan sederhana yang menjadi awal dari cerita kami.'], ['2023', 'Getting Closer', 'Kami mulai mengenal satu sama lain lebih dalam.'], ['2025', 'Engagement', 'Kami memutuskan membawa hubungan menuju perjalanan yang lebih serius.'], ['2026', 'Our Wedding', 'Hari di mana perjalanan baru kami dimulai.']] as $i => $story) {
                $w->stories()->create(['date_label' => $story[0], 'title' => $story[1], 'description' => $story[2], 'sort_order' => $i]);
            }
            $w->giftMethods()->create(['type' => 'PHYSICAL', 'recipient_name' => 'Alya Putri Ramadhani', 'address' => 'Alamat pengiriman contoh ? konfirmasi dengan pasangan.', 'phone' => '081234567890', 'sort_order' => 2, 'is_active' => true]);
            for ($i = 1; $i <= 6; $i++) {
                $w->gallery()->create(['image' => '/storage/templates/demo/moment-'.$i.'.webp', 'caption' => 'Momen penuh cinta '.$i, 'sort_order' => $i - 1]);
            }
            foreach ([['BCA', '1234567890', 'Alya Putri Ramadhani'], ['MANDIRI', '9876543210', 'Rizky Pratama']] as $i => $gift) {
                $w->gifts()->create(['bank' => $gift[0], 'account_number' => $gift[1], 'account_name' => $gift[2], 'sort_order' => $i]);
                $w->giftMethods()->create(['type' => 'BANK', 'provider' => $gift[0], 'account_number' => $gift[1], 'account_name' => $gift[2], 'sort_order' => $i, 'is_active' => true]);
            }
            $w->settings()->create(['enable_livestream' => false]);
            $w->wishes()->create(['name' => 'Andi', 'message' => 'Selamat menempuh hidup baru. Semoga menjadi keluarga yang selalu diberikan kebahagiaan.']);
            foreach (Storage::disk('public')->files('templates/demo') as $path) {
                Media::firstOrCreate(['path' => $path], ['wedding_id' => $w->id, 'uploaded_by' => $admin->id, 'collection' => 'templates', 'mime_type' => Storage::disk('public')->mimeType($path), 'size' => Storage::disk('public')->size($path)]);
            }
        });
        $this->call(ExperienceSeeder::class);
    }
}

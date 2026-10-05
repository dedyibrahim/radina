<?php

namespace App\Services;

use App\Http\Requests\SaveGiftRequest;
use App\Http\Requests\SaveWeddingRequest;
use App\Http\Resources\WeddingResource;
use App\Models\Wedding;
use App\Support\ImportCsv;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Validator;

class WeddingContentCsv
{
    private function fields(string $eventType = 'wedding'): array
    {
        $fields = [];
        $add = function ($prefix, $section, $items) use (&$fields) {
            foreach ($items as $key => $label) {
                $fields[$prefix.$key] = [$section, $label];
            }
        };
        $add('', 'Informasi dasar', ['title' => 'Judul undangan', 'slug' => 'Alamat undangan: huruf kecil dan tanda -; kosongkan untuk mempertahankan', 'wedding_date' => 'Tanggal: YYYY-MM-DD', 'hashtag' => 'Hashtag', 'opening_text' => 'Kalimat pembuka', 'quote' => 'Kutipan', 'quote_source' => 'Sumber kutipan', 'closing_text' => 'Kalimat penutup', 'cover_image' => 'URL foto cover', 'hero_image' => 'URL foto utama', 'closing_image' => 'URL foto penutup', 'video_url' => 'URL video MP4/YouTube']);
        foreach ($eventType === 'wedding' ? ['bride' => 'Pengantin wanita', 'groom' => 'Pengantin pria'] : [] as $role => $label) {
            $add($role.'.', $label, ['full_name' => 'Nama lengkap', 'nickname' => 'Nama panggilan', 'father_name' => 'Nama ayah', 'mother_name' => 'Nama ibu', 'family_order' => 'Keterangan anak dalam keluarga', 'instagram' => 'Username Instagram tanpa @', 'photo' => 'URL foto pengantin']);
        }
        if ($eventType !== 'wedding') {
            $profile = InvitationEvent::profile($eventType);
            $add('event_details.', 'Data acara', ['host_name' => $profile['host_label'], 'honoree_name' => $profile['honoree_label'] ?? 'Nama tokoh acara (opsional)', 'father_name' => 'Nama ayah (opsional)', 'mother_name' => 'Nama ibu (opsional)', 'description' => 'Deskripsi penyelenggara / acara', 'photo' => 'URL foto atau logo']);
        }
        $add('music.', 'Musik', ['music_url' => 'URL audio', 'volume' => 'Volume 0-100', 'autoplay_after_open' => 'Putar otomatis: ya/tidak', 'shuffle' => 'Acak lagu: ya/tidak', 'repeat' => 'Ulangi lagu: ya/tidak']);
        $add('livestream.', 'Live streaming', ['platform' => 'Platform', 'url' => 'URL siaran']);
        $add('shipping_gift.', 'Alamat hadiah', ['recipient' => 'Penerima', 'address' => 'Alamat', 'phone' => 'Nomor telepon: format kolom sebagai Teks']);
        foreach (['music', 'gallery', 'story', 'rsvp', 'wishes', 'gift', 'livestream', 'countdown', 'video', 'maps', 'parents', 'social', 'family'] as $key) {
            $fields['settings.enable_'.$key] = ['Fitur', 'Aktifkan '.$key.': ya/tidak'];
        }

        return $fields;
    }

    private function groups(): array
    {
        return [
            'events' => ['Acara', 20, ['type' => 'Jenis agenda: other, ceremony, syukuran, meeting, seminar, gathering, celebration, akad, reception, ngunduh, afterparty', 'title' => 'Nama acara', 'date' => 'Tanggal: YYYY-MM-DD', 'start_time' => 'Jam mulai: HH:MM', 'end_time' => 'Jam selesai: HH:MM', 'timezone' => 'Asia/Jakarta, Asia/Makassar, atau Asia/Jayapura', 'venue' => 'Nama lokasi', 'address' => 'Alamat lokasi', 'google_maps_url' => 'URL Google Maps', 'is_visible' => 'Tampilkan acara di undangan: ya/tidak', 'show_on_map' => 'Tampilkan lokasi di Meet us here: ya/tidak', 'use_for_countdown' => 'Jadikan sumber countdown: ya/tidak; pilih hanya satu acara']],
            'stories' => ['Cerita / informasi acara', 30, ['date_label' => 'Tanggal/tahun cerita', 'title' => 'Judul cerita', 'description' => 'Isi cerita', 'image' => 'URL foto cerita']],
            'gallery' => ['Galeri', 50, ['image' => 'URL foto', 'caption' => 'Keterangan foto']],
            'music.playlist' => ['Playlist', 10, ['title' => 'Judul lagu', 'artist' => 'Artis', 'url' => 'URL audio', 'cover' => 'URL cover', 'duration' => 'Durasi dalam detik']],
            'gift_methods' => ['Hadiah', 30, ['type' => 'BANK/EWALLET/QRIS/PHYSICAL', 'provider' => 'Nama bank/e-wallet', 'account_number' => 'Nomor rekening: format kolom sebagai Teks', 'account_name' => 'Nama pemilik rekening', 'logo' => 'URL logo', 'qr_image' => 'URL gambar QRIS', 'recipient_name' => 'Penerima hadiah fisik', 'phone' => 'Nomor telepon: format kolom sebagai Teks', 'address' => 'Alamat hadiah fisik', 'description' => 'Catatan', 'is_active' => 'Aktif: ya/tidak']],
        ];
    }

    public function data(Wedding $wedding, Request $request): array
    {
        $data = json_decode(json_encode((new WeddingResource($wedding->loadContent()))->resolve($request)), true);
        foreach ($data['events'] as &$event) {
            $event['start_time'] = substr($event['start_time'], 0, 5);
            $event['end_time'] = substr($event['end_time'], 0, 5);
        }

        return $data;
    }

    public function rows(?array $data = null, string $eventType = 'wedding'): array
    {
        $rows = [];
        foreach ($this->fields($data['event_type'] ?? $eventType) as $key => [$section, $label]) {
            $rows[] = [$section, $key, $this->cell(Arr::get($data ?? [], $key)), $label];
        }
        foreach ($this->groups() as $group => [$section, $max, $fields]) {
            $count = $data === null ? match ($group) {
                'gallery' => 3, 'music.playlist' => 1, default => 2
            } : max(1, count(Arr::get($data, $group, [])));
            for ($i = 0; $i < $count; $i++) {
                foreach ($fields as $field => $label) {
                    $rows[] = [$section.' '.($i + 1), $group.'.'.($i + 1).'.'.$field, $this->cell(Arr::get($data ?? [], $group.'.'.$i.'.'.$field)), $label];
                }
            }
        }

        return $rows;
    }

    private function cell($value): string
    {
        return is_bool($value) ? ($value ? 'ya' : 'tidak') : (string) ($value ?? '');
    }

    public function parse(Request $request, Wedding $wedding): array
    {
        $request->validate(['file' => 'required|file|max:2048']);
        abort_unless(strtolower($request->file('file')->getClientOriginalExtension()) === 'csv', 422, 'Gunakan file .csv, bukan .xlsx.');
        $rows = ImportCsv::read($request->file('file'), ['kunci', 'nilai'], 1500);
        $data = $this->data($wedding, $request);
        $changes = [];
        $seen = [];
        $giftUpdates = [];
        foreach ($rows as $row) {
            $key = $row['kunci'];
            $value = $row['nilai'];
            if ($value === '') {
                continue;
            }
            if (isset($seen[$key])) {
                ImportCsv::fail('Baris '.$row['_row'].': kunci '.$key.' berulang.');
            }
            $seen[$key] = true;
            $path = $key;
            $label = $this->fields($wedding->event_type ?? 'wedding')[$key][1] ?? null;
            foreach ($this->groups() as $group => [$section, $max, $fields]) {
                if (preg_match('/^'.preg_quote($group, '/').'\.([1-9][0-9]*)\.([a-z_]+)$/', $key, $match) && isset($fields[$match[2]]) && (int) $match[1] <= $max) {
                    $index = (int) $match[1] - 1;
                    $path = $group.'.'.$index.'.'.$match[2];
                    $label = $section.' '.$match[1].': '.$fields[$match[2]];
                    if (! Arr::has($data, $group.'.'.$index)) {
                        if ($index > count(Arr::get($data, $group, []))) {
                            ImportCsv::fail('Baris '.$row['_row'].': nomor '.$section.' harus berurutan mulai 1.');
                        }
                        Arr::set($data, $group.'.'.$index, match ($group) {
                            'events' => ['type' => $wedding->event_type === 'wedding' ? 'reception' : 'other', 'timezone' => 'Asia/Jakarta', 'address' => '', 'google_maps_url' => '', 'is_visible' => true, 'show_on_map' => $index === 0, 'use_for_countdown' => false],
                            'gift_methods' => ['type' => 'BANK', 'is_active' => true],
                            default => [],
                        });
                    }
                    if ($group === 'gift_methods') {
                        $giftUpdates[$index] = true;
                    }
                    break;
                }
            }
            if ($label === null) {
                ImportCsv::fail('Baris '.$row['_row'].': kunci tidak dikenal: '.$key);
            }
            // Reverse the formula protection added when exporting CSV text.
            $value = ImportCsv::text($value);
            if (str_starts_with($path, 'settings.') || preg_match('/\.(autoplay_after_open|shuffle|repeat|is_active|is_visible|show_on_map|use_for_countdown)$/', $path)) {
                $value = match (mb_strtolower($value)) {
                    'ya', 'true', '1' => true, 'tidak', 'false', '0' => false, default => null
                };
                if ($value === null) {
                    ImportCsv::fail('Baris '.$row['_row'].': gunakan ya atau tidak.');
                }
            } elseif ($path === 'music.volume' || str_ends_with($path, '.duration')) {
                if (! ctype_digit($value)) {
                    ImportCsv::fail('Baris '.$row['_row'].': gunakan angka bulat.');
                }
                $value = (int) $value;
            }
            $previous = Arr::get($data, $path);
            if ($this->cell($previous) !== $this->cell($value)) {
                $changes[] = ['key' => $key, 'label' => $label, 'before' => $this->cell($previous), 'after' => $this->cell($value)];
            }
            Arr::set($data, $path, $value);
        }
        if (! $changes) {
            ImportCsv::fail('Tidak ada perubahan. Isi kolom nilai pada template terlebih dahulu.');
        }
        $data['expected_updated_at'] = $wedding->updated_at->toJSON();
        $form = SaveWeddingRequest::create($request->url(), 'PUT', $data);
        $form->setRouteResolver($request->getRouteResolver());
        $validator = Validator::make($data, $form->rules());
        foreach ($form->after() as $after) {
            $validator->after($after);
        }
        $validated = $validator->validate();
        $gifts = [];
        foreach (array_keys($giftUpdates) as $index) {
            $gift = $data['gift_methods'][$index];
            $form = SaveGiftRequest::create($request->url(), 'POST', $gift);
            $giftValidator = Validator::make($gift, $form->rules());
            if ($giftValidator->fails()) {
                ImportCsv::fail('Hadiah '.($index + 1).': '.implode(' ', $giftValidator->errors()->all()));
            }
            $form->setValidator($giftValidator);
            $gifts[] = ['id' => $gift['id'] ?? null, 'data' => $form->giftData() + ['sort_order' => $index]];
        }

        return ['data' => $validated, 'changes' => $changes, 'gifts' => $gifts];
    }
}

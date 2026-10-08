<?php

namespace App\Services;

use App\Rules\SafeMediaUrl;

class InvitationEvent
{
    public static function types(): array
    {
        return json_decode(file_get_contents(config_path('invitation-events.json')), true, 512, JSON_THROW_ON_ERROR);
    }

    public static function profile(?string $type): array
    {
        return self::types()[$type ?? 'wedding'] ?? self::types()['wedding'];
    }

    public static function details(?array $details = null): array
    {
        return array_merge(array_fill_keys(['host_name', 'honoree_name', 'honoree_age', 'father_name', 'mother_name', 'description', 'photo'], ''), $details ?? []);
    }

    public static function rules(string $prefix, string $type, bool $required = true): array
    {
        $profile = self::profile($type);
        $need = $required && $type !== 'wedding';

        return [$prefix => ($need ? 'required' : 'sometimes').'|array:host_name,honoree_name,honoree_age,father_name,mother_name,description,photo',
            $prefix.'.host_name' => ($need ? 'required' : 'nullable').'|string|min:2|max:120',
            $prefix.'.honoree_name' => ($need && $profile['honoree'] ? 'required' : 'nullable').'|string|min:2|max:120',
            $prefix.'.honoree_age' => 'nullable|integer|min:1|max:120',
            $prefix.'.father_name' => 'nullable|string|max:120', $prefix.'.mother_name' => 'nullable|string|max:120',
            $prefix.'.description' => 'nullable|string|max:3000', $prefix.'.photo' => ['nullable', 'string', 'max:2048', new SafeMediaUrl]];
    }

    public static function initial(string $type): array
    {
        $profile = self::profile($type);

        return ['opening_text' => $profile['opening'], 'closing_text' => $profile['closing'], 'quote' => null, 'quote_source' => null,
            'section_content' => ['home' => ['heading' => $profile['label']], 'couple' => ['heading' => $profile['honoree'] ? 'Yang Berbahagia' : 'Penyelenggara'],
                'story' => ['heading' => 'Tentang Acara'], 'event' => ['heading' => 'Waktu & Tempat'], 'gallery' => ['heading' => 'Dokumentasi'],
                'gift' => ['heading' => 'Tanda Kasih'], 'rsvp' => ['heading' => 'Konfirmasi Kehadiran'], 'wishes' => ['heading' => 'Ucapan & Pesan'],
                'closing' => ['heading' => 'Sampai Bertemu'], 'quote' => ['heading' => 'Pesan untuk Anda']]];
    }

    public static function agendaTypes(): array
    {
        return ['akad', 'reception', 'ngunduh', 'afterparty', 'ceremony', 'syukuran', 'meeting', 'seminar', 'gathering', 'celebration', 'other'];
    }
}

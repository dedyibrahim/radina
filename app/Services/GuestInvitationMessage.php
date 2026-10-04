<?php

namespace App\Services;

use App\Models\Wedding;
use App\Models\WeddingInvitee;

class GuestInvitationMessage
{
    public static function defaultTemplate(): string
    {
        return "Kepada Yth.\n{nama_tamu}\n\nDengan penuh rasa syukur dan hormat, kami mengundang Anda untuk berkenan hadir dalam acara:\n\n{nama_acara}\n{tanggal_acara}\n\nInformasi waktu, lokasi, dan konfirmasi kehadiran tersedia melalui undangan berikut:\n{link_undangan}\n\nKehadiran serta doa baik Anda akan menjadi kebahagiaan dan kehormatan bagi kami. Apabila berkenan, mohon mengisi konfirmasi kehadiran pada undangan agar kami dapat menyambut Anda dengan sebaik-baiknya.\n\nTerima kasih atas perhatian dan kesediaan Anda. Kami berharap dapat berbagi momen istimewa ini bersama Anda.";
    }

    public static function settings(Wedding $wedding): array
    {
        $title = $wedding->title;
        if (($wedding->event_type ?? 'wedding') === 'wedding') {
            $names = $wedding->couples->map(fn ($person) => trim($person->full_name ?? '') ?: $person->nickname)->filter()->implode(' & ');
            if ($names !== '') {
                $title = 'Pernikahan '.$names;
            }
        }

        return ['message_template' => $wedding->guest_message_template ?? self::defaultTemplate(), 'default_message_template' => self::defaultTemplate(), 'event_title' => $title, 'event_date' => $wedding->wedding_date?->locale('id')->translatedFormat('l, d F Y') ?? ''];
    }

    public static function render(Wedding $wedding, WeddingInvitee $guest): string
    {
        $settings = self::settings($wedding);

        return strtr($settings['message_template'], ['{nama_tamu}' => $guest->name, '{nama_acara}' => $settings['event_title'], '{tanggal_acara}' => $settings['event_date'], '{link_undangan}' => $guest->invitationUrl($wedding)]);
    }

    public static function normalizePhone(?string $value): ?string
    {
        $value = trim($value ?? '');
        if ($value === '') {
            return null;
        }
        if (! preg_match('/^\+?[0-9][0-9\s().-]*$/D', $value)) {
            return '';
        }
        $value = preg_replace('/\D/', '', $value);
        if (str_starts_with($value, '00')) {
            $value = substr($value, 2);
        } elseif (str_starts_with($value, '0')) {
            $value = '62'.substr($value, 1);
        } elseif (str_starts_with($value, '8')) {
            $value = '62'.$value;
        }

        return preg_match('/^[1-9][0-9]{7,14}$/D', $value) ? $value : '';
    }
}

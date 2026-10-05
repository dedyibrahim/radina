<?php

namespace App\Services;

class EventCountdown
{
    public static function errors(array $events, string $prefix = 'events'): array
    {
        $selected = array_filter($events, fn ($event) => is_array($event) && in_array($event['use_for_countdown'] ?? false, [true, 1, '1'], true));
        $errors = [];
        if (count($selected) > 1) {
            $errors[$prefix] = 'Pilih hanya satu acara sebagai sumber countdown.';
        }
        foreach ($selected as $index => $event) {
            if (! in_array($event['is_visible'] ?? true, [true, 1, '1'], true)) {
                $errors[$prefix.'.'.$index.'.use_for_countdown'] = 'Acara sumber countdown harus ditampilkan di undangan. Aktifkan acara ini atau pilih sumber countdown lain.';
            }
        }

        return $errors;
    }
}

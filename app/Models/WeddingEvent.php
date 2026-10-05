<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WeddingEvent extends Model
{
    protected $table = 'wedding_events';

    protected $fillable = ['wedding_id', 'type', 'title', 'date', 'start_time', 'end_time', 'timezone', 'venue', 'address', 'google_maps_url', 'sort_order', 'is_visible', 'show_on_map'];

    protected $casts = ['is_visible' => 'boolean', 'show_on_map' => 'boolean'];

    public static function withVisibility(array $events, ?\Illuminate\Support\Collection $saved = null): array
    {
        foreach ($events as $index => &$event) {
            if (! is_array($event)) continue;
            $current = $saved?->get($index);
            $event['is_visible'] ??= $current?->is_visible ?? true;
            $event['show_on_map'] ??= $current?->show_on_map ?? ($index === 0);
        }

        return $events;
    }
}

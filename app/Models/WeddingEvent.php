<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WeddingEvent extends Model
{
    protected $table = 'wedding_events';

    protected $fillable = ['wedding_id', 'type', 'title', 'date', 'start_time', 'end_time', 'timezone', 'venue', 'address', 'google_maps_url', 'sort_order'];
}

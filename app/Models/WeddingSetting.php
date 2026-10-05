<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WeddingSetting extends Model
{
    protected $table = 'wedding_settings';

    protected $fillable = ['wedding_id', 'enable_music', 'enable_gallery', 'enable_story', 'enable_rsvp', 'enable_wishes', 'enable_gift', 'enable_livestream', 'enable_countdown', 'enable_video', 'enable_maps', 'enable_parents', 'enable_social', 'enable_family'];

    protected $casts = ['enable_music' => 'boolean', 'enable_gallery' => 'boolean', 'enable_story' => 'boolean', 'enable_rsvp' => 'boolean', 'enable_wishes' => 'boolean', 'enable_gift' => 'boolean', 'enable_livestream' => 'boolean', 'enable_countdown' => 'boolean', 'enable_video' => 'boolean', 'enable_maps' => 'boolean', 'enable_parents' => 'boolean', 'enable_social' => 'boolean', 'enable_family' => 'boolean'];
}

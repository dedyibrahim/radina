<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WeddingRsvp extends Model
{
    protected $table = 'wedding_rsvps';

    protected $fillable = ['wedding_id', 'name', 'guests', 'attendance', 'message'];
}

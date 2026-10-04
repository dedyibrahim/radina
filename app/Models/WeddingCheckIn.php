<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WeddingCheckIn extends Model
{
    protected $fillable = ['wedding_id', 'wedding_invitee_id', 'people_count', 'checked_in_by', 'checked_in_at'];

    protected $casts = ['people_count' => 'integer', 'checked_in_at' => 'datetime'];
}

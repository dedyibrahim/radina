<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WeddingWish extends Model
{
    protected $table = 'wedding_wishes';

    protected $fillable = ['wedding_id', 'name', 'message', 'visible'];

    protected $casts = ['visible' => 'boolean'];
}

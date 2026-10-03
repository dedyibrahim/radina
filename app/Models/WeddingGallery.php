<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WeddingGallery extends Model
{
    protected $table = 'wedding_galleries';

    protected $fillable = ['wedding_id', 'image', 'caption', 'sort_order'];
}

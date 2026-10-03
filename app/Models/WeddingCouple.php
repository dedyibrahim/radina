<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WeddingCouple extends Model
{
    protected $table = 'wedding_couples';

    protected $fillable = ['wedding_id', 'role', 'full_name', 'nickname', 'father_name', 'mother_name', 'photo', 'instagram', 'family_order'];
}

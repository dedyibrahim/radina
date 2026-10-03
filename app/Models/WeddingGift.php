<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WeddingGift extends Model
{
    protected $table = 'wedding_gifts';

    protected $fillable = ['wedding_id', 'bank', 'account_number', 'account_name', 'logo', 'sort_order'];
}

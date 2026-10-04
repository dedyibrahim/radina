<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderDocument extends Model
{
    protected $fillable = ['order_id', 'type', 'number', 'snapshot', 'issued_at'];

    protected $casts = ['snapshot' => 'array', 'issued_at' => 'datetime'];
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $table = 'payments';

    protected $fillable = ['order_id', 'payment_method', 'amount', 'status', 'reference', 'confirmed_by', 'confirmed_at'];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    protected $casts = ['confirmed_at' => 'datetime'];
}

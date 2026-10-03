<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderStatusHistory extends Model
{
    protected $table = 'order_status_histories';

    protected $fillable = ['order_id', 'old_status', 'new_status', 'changed_by', 'created_at'];

    public $timestamps = false;
}

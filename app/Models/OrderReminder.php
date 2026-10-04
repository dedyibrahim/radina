<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderReminder extends Model
{
    protected $fillable = ['order_id', 'key', 'kind', 'title', 'message', 'due_at', 'resolved_at', 'dismissed_at', 'snoozed_until'];

    protected $casts = ['due_at' => 'datetime', 'resolved_at' => 'datetime', 'dismissed_at' => 'datetime', 'snoozed_until' => 'datetime'];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}

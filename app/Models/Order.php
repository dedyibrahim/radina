<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = ['order_number', 'template_id', 'customer_name', 'whatsapp', 'email', 'bride_name', 'groom_name', 'slug', 'total', 'status', 'is_demo', 'event_type', 'event_title', 'host_name', 'honoree_name'];

    protected $casts = ['is_demo' => 'boolean'];

    public function template()
    {
        return $this->belongsTo(Template::class);
    }

    public function payment()
    {
        return $this->hasOne(Payment::class);
    }

    public function wedding()
    {
        return $this->hasOne(Wedding::class);
    }

    public function histories()
    {
        return $this->hasMany(OrderStatusHistory::class)->orderBy('id');
    }
}

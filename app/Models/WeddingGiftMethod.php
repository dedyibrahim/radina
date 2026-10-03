<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WeddingGiftMethod extends Model
{
    protected $fillable = ['wedding_id', 'type', 'provider', 'account_number', 'account_name', 'logo', 'qr_image', 'recipient_name', 'phone', 'address', 'description', 'is_active', 'sort_order'];

    protected $casts = ['is_active' => 'boolean', 'sort_order' => 'integer', 'account_number' => 'encrypted', 'phone' => 'encrypted', 'address' => 'encrypted'];

    public function wedding()
    {
        return $this->belongsTo(Wedding::class);
    }
}

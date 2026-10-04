<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InvitationPackage extends Model
{
    protected $fillable = ['name', 'slug', 'description', 'pricing_mode', 'price', 'duration_days', 'features', 'is_active', 'sort_order'];

    protected $casts = ['price' => 'integer', 'duration_days' => 'integer', 'features' => 'array', 'is_active' => 'boolean'];
}

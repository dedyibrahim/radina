<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InvitationAddon extends Model
{
    protected $fillable = ['name', 'description', 'price', 'is_active'];

    protected $casts = ['price' => 'integer', 'is_active' => 'boolean'];
}

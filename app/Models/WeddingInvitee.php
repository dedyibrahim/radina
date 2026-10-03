<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WeddingInvitee extends Model
{
    protected $fillable = ['wedding_id', 'token', 'name', 'address', 'fingerprint'];

    protected $hidden = ['fingerprint'];
}

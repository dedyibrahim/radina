<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WeddingCustomerPortal extends Model
{
    protected $guarded = ['id'];

    protected $hidden = ['token', 'token_hash', 'submission', 'revision_notes'];

    protected $casts = ['token' => 'encrypted', 'submission' => 'encrypted:array', 'revision_notes' => 'encrypted', 'expires_at' => 'datetime', 'revoked_at' => 'datetime', 'submitted_at' => 'datetime', 'revision_requested_at' => 'datetime', 'approved_at' => 'datetime', 'submission_version' => 'integer', 'applied_version' => 'integer'];

    public function wedding()
    {
        return $this->belongsTo(Wedding::class);
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WriterEarning extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'article_id',
        'amount',
        'article_title',
        'description',
        'credited_at',
    ];

    protected $casts = [
        'amount' => 'integer',
        'credited_at' => 'datetime',
    ];

    public function writer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function article(): BelongsTo
    {
        return $this->belongsTo(NewsArticle::class, 'article_id');
    }
}

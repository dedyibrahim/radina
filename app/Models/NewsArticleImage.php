<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NewsArticleImage extends Model
{
    protected $fillable = [
        'article_id',
        'image_url',
        'alt_text',
        'caption',
        'position_after_paragraph',
        'sort_order',
    ];

    protected $casts = [
        'position_after_paragraph' => 'integer',
        'sort_order' => 'integer',
    ];

    public function article(): BelongsTo
    {
        return $this->belongsTo(NewsArticle::class, 'article_id');
    }
}

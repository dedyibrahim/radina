<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class NewsArticle extends Model
{
    use HasFactory;

    public const STATUS_DRAFT = 'draft';
    public const STATUS_PUBLISHED = 'published';
    public const EDITORIAL_PENDING = 'pending';
    public const EDITORIAL_APPROVED = 'approved';
    public const EDITORIAL_REJECTED = 'rejected';
    public const FACT_PENDING = 'pending';
    public const FACT_VERIFIED = 'verified';
    public const FACT_REJECTED = 'rejected';

    protected $fillable = [
        'category_id',
        'user_id',
        'title',
        'title_en',
        'slug',
        'excerpt',
        'excerpt_en',
        'content',
        'content_en',
        'cover_image_url',
        'cover_image_alt',
        'cover_image_alt_en',
        'status',
        'editorial_status',
        'fact_check_status',
        'review_note',
        'approved_by',
        'approved_at',
        'fact_checked_by',
        'fact_checked_at',
        'is_featured',
        'reading_time',
        'views_count',
        'published_at',
        'seo_title',
        'seo_title_en',
        'seo_description',
        'seo_description_en',
        'seo_keywords',
        'seo_keywords_en',
        'og_image_url',
    ];

    protected $casts = [
        'is_featured' => 'boolean',
        'published_at' => 'datetime',
        'approved_at' => 'datetime',
        'fact_checked_at' => 'datetime',
    ];

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query
            ->where('status', self::STATUS_PUBLISHED)
            ->where('editorial_status', self::EDITORIAL_APPROVED)
            ->where('fact_check_status', self::FACT_VERIFIED)
            ->whereNotNull('published_at')
            ->where('published_at', '<=', now());
    }

    public function scopeFeatured(Builder $query): Builder
    {
        return $query->where('is_featured', true);
    }

    public function scopeSearch(Builder $query, ?string $term): Builder
    {
        $term = trim((string) $term);

        if ($term === '') {
            return $query;
        }

        return $query->where(function (Builder $builder) use ($term): void {
            $builder
                ->where('title', 'like', "%{$term}%")
                ->orWhere('title_en', 'like', "%{$term}%")
                ->orWhere('excerpt', 'like', "%{$term}%")
                ->orWhere('excerpt_en', 'like', "%{$term}%")
                ->orWhere('content', 'like', "%{$term}%")
                ->orWhere('content_en', 'like', "%{$term}%")
                ->orWhere('seo_keywords', 'like', "%{$term}%")
                ->orWhere('seo_keywords_en', 'like', "%{$term}%");
        });
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(NewsCategory::class, 'category_id');
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(NewsTag::class, 'news_article_tag', 'article_id', 'tag_id')
            ->withTimestamps();
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function factChecker(): BelongsTo
    {
        return $this->belongsTo(User::class, 'fact_checked_by');
    }

    public function earning(): HasOne
    {
        return $this->hasOne(WriterEarning::class, 'article_id');
    }

    public function images(): HasMany
    {
        return $this->hasMany(NewsArticleImage::class, 'article_id')
            ->orderBy('sort_order')
            ->orderBy('id');
    }

    public function isApprovedAndVerified(): bool
    {
        return $this->editorial_status === self::EDITORIAL_APPROVED
            && $this->fact_check_status === self::FACT_VERIFIED;
    }

    public function isPublished(): bool
    {
        return $this->status === self::STATUS_PUBLISHED
            && $this->published_at !== null
            && $this->published_at->lte(now());
    }
}

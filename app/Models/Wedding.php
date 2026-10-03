<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Wedding extends Model
{
    protected $dateFormat = 'Y-m-d H:i:s.u';

    protected $fillable = ['order_id', 'template_id', 'slug', 'status', 'title', 'wedding_date', 'quote', 'quote_source', 'opening_text', 'closing_text', 'hashtag', 'cover_image', 'hero_image', 'closing_image', 'video_url', 'music_url', 'volume', 'autoplay_after_open', 'livestream_platform', 'livestream_url', 'shipping_gift', 'published_at', 'publish_at', 'is_demo', 'section_content', 'section_order', 'music_playlist', 'music_shuffle', 'music_repeat'];

    protected $casts = ['section_content' => 'array', 'section_order' => 'array', 'music_playlist' => 'array', 'music_shuffle' => 'boolean', 'music_repeat' => 'boolean', 'wedding_date' => 'date:Y-m-d', 'shipping_gift' => 'array', 'autoplay_after_open' => 'boolean', 'is_demo' => 'boolean', 'published_at' => 'datetime', 'publish_at' => 'datetime'];

    public function template()
    {
        return $this->belongsTo(Template::class);
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function couples()
    {
        return $this->hasMany(WeddingCouple::class);
    }

    public function events()
    {
        return $this->hasMany(WeddingEvent::class)->orderBy('sort_order');
    }

    public function stories()
    {
        return $this->hasMany(WeddingStory::class)->orderBy('sort_order');
    }

    public function gallery()
    {
        return $this->hasMany(WeddingGallery::class)->orderBy('sort_order');
    }

    public function giftMethods()
    {
        return $this->hasMany(WeddingGiftMethod::class)->orderBy('sort_order')->orderBy('id');
    }

    public function gifts()
    {
        return $this->hasMany(WeddingGift::class)->orderBy('sort_order');
    }

    public function settings()
    {
        return $this->hasOne(WeddingSetting::class);
    }

    public function rsvps()
    {
        return $this->hasMany(WeddingRsvp::class)->latest();
    }

    public function wishes()
    {
        return $this->hasMany(WeddingWish::class)->latest();
    }

    public function media()
    {
        return $this->hasMany(Media::class);
    }

    public function loadContent()
    {
        return $this->load(['template.category', 'couples', 'events', 'stories', 'gallery', 'gifts', 'giftMethods', 'settings']);
    }
}

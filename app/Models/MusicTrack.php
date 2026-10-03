<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MusicTrack extends Model
{
    protected $table = 'music_library';

    protected $fillable = ['title', 'artist', 'file_url', 'cover_image', 'category', 'duration', 'is_active', 'is_featured'];

    public const CATEGORIES = ['Romantic', 'Instrumental', 'Piano', 'Acoustic', 'Classic', 'Islamic', 'Traditional', 'Cinematic', 'Modern', 'Upbeat', 'Ambient', 'Jazz', 'Folk', 'Orchestral', 'Tropical', 'Electronic Chill'];

    protected $casts = ['is_active' => 'boolean', 'is_featured' => 'boolean', 'duration' => 'integer'];
}

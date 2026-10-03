<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WeddingStory extends Model
{
    protected $table = 'wedding_stories';

    protected $fillable = ['wedding_id', 'date_label', 'title', 'description', 'image', 'sort_order'];
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Template extends Model
{
    protected $fillable = ['category_id', 'name', 'slug', 'description', 'thumbnail', 'preview_image', 'price', 'component_name', 'template_key', 'status', 'is_featured', 'features'];

    protected $casts = ['is_featured' => 'boolean', 'price' => 'integer', 'features' => 'array'];

    public function category()
    {
        return $this->belongsTo(TemplateCategory::class);
    }
}

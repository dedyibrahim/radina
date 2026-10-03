<?php

namespace App\Http\Resources;

use App\Services\TemplateContent;
use App\Services\InvitationEvent;
use Illuminate\Http\Resources\Json\JsonResource;

class TemplateResource extends JsonResource
{
    public function toArray($request): array
    {
        $preset = TemplateContent::preset($this->template_key);

        return [
            'style' => $preset['style'] ?? $preset['category'] ?? $this->category?->name,
            'event_types' => array_keys(InvitationEvent::types()),
            'music_style' => $preset['mood'] ?? [],
            'gallery_style' => $preset['gallery_style'] ?? 'Photography collection',
            'id' => $this->id, 'name' => $this->name, 'slug' => $this->slug, 'description' => $this->description, 'thumbnail' => $this->thumbnail, 'preview_image' => $this->preview_image,
            'price' => $this->price, 'category_id' => $this->category_id, 'category' => $this->category, 'component_name' => $this->component_name, 'template_key' => $this->template_key, 'status' => $this->status, 'is_featured' => $this->is_featured, 'features' => $this->features ?? [],
        ];
    }
}

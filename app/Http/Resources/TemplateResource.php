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
        $thumbnail = $this->catalogCover($this->thumbnail);
        $previewImage = $this->catalogCover($this->preview_image);

        return [
            'style' => $preset['style'] ?? $preset['category'] ?? $this->category?->name,
            'event_types' => array_keys(InvitationEvent::types()),
            'animations' => TemplateContent::animations($this->template_key),
            'music_style' => $preset['mood'] ?? [],
            'gallery_style' => $preset['gallery_style'] ?? 'Photography collection',
            'id' => $this->id, 'name' => $this->name, 'slug' => $this->slug, 'description' => $this->description, 'thumbnail' => $thumbnail, 'preview_image' => $previewImage,
            'price' => $this->price, 'category_id' => $this->category_id, 'category' => $this->category, 'component_name' => $this->component_name, 'template_key' => $this->template_key, 'status' => $this->status, 'is_featured' => $this->is_featured, 'features' => $this->features ?? [],
        ];
    }

    private function catalogCover(?string $current): ?string
    {
        $key = $this->template_key;
        if (! preg_match('/\A[a-z0-9-]+\z/', $key ?? '')) {
            return $current;
        }
        $cover = '/images/templates/previews/'.$key.'.webp';
        $defaults = [$cover, '/images/templates/'.$key.'.svg', '/storage/templates/previews/'.$key.'.webp'];
        if (in_array($current, $defaults, true) &&
            (is_file(public_path(ltrim($cover, '/'))) || is_file(base_path('frontend/public'.$cover)))) {
            return $cover;
        }
        // Keep custom admin images and dedicated cinematic artwork as saved.
        return $current;
    }
}

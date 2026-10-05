<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
use App\Services\InvitationEvent;

class WeddingResource extends JsonResource
{
    public function toArray($request): array
    {
        $couples = $this->couples->keyBy('role');
        $isAdmin = $request->is('api/admin/*');
        $methods = $isAdmin ? $this->giftMethods : $this->giftMethods->where('is_active', true)->values();
        $physical = $methods->firstWhere('type', 'PHYSICAL');
        $legacyBanks = $methods->where('type', 'BANK')->map(fn ($gift) => ['id' => $gift->id, 'bank' => $gift->provider, 'account_number' => $gift->account_number, 'account_name' => $gift->account_name, 'logo' => $gift->logo, 'sort_order' => $gift->sort_order])->values();
        $events = \App\Models\WeddingEvent::withVisibility($this->events->toArray());

        return [
            'id' => $this->id, 'order_id' => $this->order_id, 'template_id' => $this->template_id, 'slug' => $this->slug, 'status' => $this->status,
            ...($isAdmin ? ['customer_whatsapp' => $this->order?->whatsapp] : []),
            'publish_at' => $this->publish_at, 'published_at' => $this->published_at, 'updated_at' => $this->updated_at,
            'title' => $this->title, 'wedding_date' => $this->wedding_date?->format('Y-m-d'), 'is_demo' => $this->is_demo,
            'event_type' => $this->event_type ?? 'wedding', 'event_details' => InvitationEvent::details($this->event_details),
            'bride' => $couples->get('bride'), 'groom' => $couples->get('groom'),
            'quote' => $this->quote, 'quote_source' => $this->quote_source, 'opening_text' => $this->opening_text, 'closing_text' => $this->closing_text, 'hashtag' => $this->hashtag,
            'cover_image' => $this->cover_image, 'hero_image' => $this->hero_image, 'closing_image' => $this->closing_image, 'video_url' => $this->video_url,
            'section_content' => $this->section_content, 'section_order' => $this->section_order,
            'music' => ['playlist' => $this->music_playlist ?? [], 'shuffle' => $this->music_shuffle, 'repeat' => $this->music_repeat, 'music_url' => $this->music_url, 'volume' => $this->volume, 'autoplay_after_open' => $this->autoplay_after_open],
            'livestream' => ['platform' => $this->livestream_platform, 'url' => $this->livestream_url],
            'shipping_gift' => $isAdmin ? $this->shipping_gift : ($physical ? ['recipient' => $physical->recipient_name, 'address' => $physical->address, 'phone' => $physical->phone] : null), 'events' => $events, 'stories' => $this->stories, 'gallery' => $this->gallery, 'gifts' => $isAdmin ? $this->gifts : $legacyBanks, 'settings' => $this->settings,
            'gift_methods' => $methods,
            'template' => new TemplateResource($this->template),
        ];
    }
}

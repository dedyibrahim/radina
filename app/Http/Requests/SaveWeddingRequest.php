<?php

namespace App\Http\Requests;

use App\Rules\SafeMediaUrl;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Services\InvitationEvent;

class SaveWeddingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->admin?->active;
    }

    public function rules(): array
    {
        $wedding = $this->route('wedding');
        $media = ['nullable', 'string', 'max:2048', new SafeMediaUrl];
        $eventType = $this->input('event_type', $wedding?->event_type ?? 'wedding');
        $eventType = is_string($eventType) ? $eventType : 'wedding';
        $rules = [
            'expected_updated_at' => 'required|date', 'title' => 'required|string|max:255',
            'event_type' => ['sometimes', Rule::in(array_keys(InvitationEvent::types()))],
            'slug' => ['required', 'string', 'min:3', 'max:80', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/', Rule::unique('weddings', 'slug')->ignore($wedding?->id), Rule::unique('orders', 'slug')->ignore($wedding?->order_id)],
            'template_id' => ['required', 'integer', Rule::exists('templates', 'id')], 'wedding_date' => 'nullable|date_format:Y-m-d',
            'quote' => 'nullable|string|max:5000', 'quote_source' => 'nullable|string|max:255', 'opening_text' => 'nullable|string|max:5000', 'closing_text' => 'nullable|string|max:5000', 'hashtag' => 'nullable|string|max:120',
            'cover_image' => $media, 'hero_image' => $media, 'closing_image' => $media, 'video_url' => $media,
            'music' => 'required|array', 'music.music_url' => $media, 'music.volume' => 'required|integer|min:0|max:100', 'music.autoplay_after_open' => 'required|boolean',
            'livestream' => 'required|array', 'livestream.platform' => 'nullable|string|max:60', 'livestream.url' => ['nullable', 'url:http,https', 'max:2048'],
            'shipping_gift' => 'nullable|array', 'shipping_gift.recipient' => 'nullable|string|max:120', 'shipping_gift.address' => 'nullable|string|max:1000', 'shipping_gift.phone' => 'nullable|string|max:30',
            'events' => 'present|array|max:20', 'events.*.type' => 'required|string|max:60', 'events.*.title' => 'required|string|max:120',
            'events.*.is_visible' => 'sometimes|boolean', 'events.*.show_on_map' => 'sometimes|boolean',
            'events.*.use_for_countdown' => 'sometimes|boolean',
            'events.*.date' => 'required|date_format:Y-m-d', 'events.*.start_time' => 'required|date_format:H:i', 'events.*.end_time' => 'required|date_format:H:i',
            'events.*.timezone' => ['required', Rule::in(['Asia/Jakarta', 'Asia/Makassar', 'Asia/Jayapura'])],
            'events.*.venue' => 'required|string|max:255', 'events.*.address' => 'nullable|string|max:1000', 'events.*.google_maps_url' => ['nullable', 'url:http,https', 'max:2048'],
            'stories' => 'present|array|max:30', 'stories.*.date_label' => 'required|string|max:60', 'stories.*.title' => 'required|string|max:120', 'stories.*.description' => 'required|string|max:3000', 'stories.*.image' => $media,
            'gallery' => 'present|array|max:50', 'gallery.*.image' => ['required', 'string', 'max:2048', new SafeMediaUrl], 'gallery.*.caption' => 'nullable|string|max:255',
            'gifts' => 'present|array|max:10', 'gifts.*.bank' => 'required|string|max:60', 'gifts.*.account_number' => 'required|string|max:60', 'gifts.*.account_name' => 'required|string|max:120', 'gifts.*.logo' => $media,
            'settings' => 'required|array',
            'section_content' => 'nullable|array:opening,home,couple,parents,quote,date,story,event,gallery,video,location,gift,rsvp,wishes,livestream,closing',
            'section_content.*' => 'array:enabled,heading,subheading,content',
            'section_content.*.enabled' => 'sometimes|boolean', 'section_content.*.heading' => 'nullable|string|max:255',
            'section_content.*.subheading' => 'nullable|string|max:1000', 'section_content.*.content' => 'nullable|string|max:5000',
            'section_order' => 'nullable|array|max:15',
            'section_order.*' => ['required', 'distinct', Rule::in(['home', 'couple', 'quote', 'date', 'story', 'event', 'gallery', 'video', 'location', 'gift', 'rsvp', 'wishes', 'livestream', 'closing'])],
            'music.playlist' => 'sometimes|array|max:10', 'music.playlist.*' => 'array:library_id,title,artist,url,cover,duration',
            'music.playlist.*.library_id' => 'nullable|integer|min:1', 'music.playlist.*.title' => 'required|string|max:255',
            'music.playlist.*.artist' => 'nullable|string|max:255', 'music.playlist.*.url' => ['required', 'string', 'max:2048', new SafeMediaUrl],
            'music.playlist.*.cover' => $media, 'music.playlist.*.duration' => 'nullable|integer|min:0|max:7200',
            'music.shuffle' => 'sometimes|boolean', 'music.repeat' => 'sometimes|boolean',
        ];
        foreach (['bride', 'groom'] as $role) {
            $rules[$role] = ($eventType === 'wedding' ? 'required' : 'nullable').'|array';
            $rules[$role.'.full_name'] = ($eventType === 'wedding' ? 'required' : 'nullable').'|string|min:2|max:120';
            foreach (['nickname', 'father_name', 'mother_name', 'family_order'] as $field) {
                $rules[$role.'.'.$field] = 'nullable|string|max:120';
            }
            $rules[$role.'.instagram'] = 'nullable|regex:/^[a-zA-Z0-9_.]{1,30}$/';
            $rules[$role.'.photo'] = $media;
        }
        $rules += InvitationEvent::rules('event_details', $eventType);
        foreach (['music', 'gallery', 'story', 'rsvp', 'wishes', 'gift', 'livestream', 'countdown', 'video', 'maps'] as $feature) {
            $rules['settings.enable_'.$feature] = 'required|boolean';
        }
        foreach (['parents', 'social', 'family'] as $feature) {
            $rules['settings.enable_'.$feature] = 'sometimes|boolean';
        }
        if ($wedding?->status === 'PUBLISHED') {
            $rules['wedding_date'] = 'required|date_format:Y-m-d';
            $rules['events'] = 'required|array|min:1|max:20';
        }

        return $rules;
    }

    public function after(): array
    {
        return [function ($validator) {
            $events = $this->input('events', []);
            $events = is_array($events) ? $events : [];
            $wedding = $this->route('wedding');
            $events = \App\Models\WeddingEvent::withVisibility($events, $wedding?->events()->get());
            foreach (\App\Services\EventCountdown::errors($events) as $key => $message) {
                $validator->errors()->add($key, $message);
            }
            if ($wedding?->status === 'PUBLISHED') {
                if (! collect($events)->contains(fn ($event) => is_array($event) && in_array($event['is_visible'] ?? true, [true, 1, '1'], true))) {
                    $validator->errors()->add('events', 'Aktifkan minimal satu acara untuk ditampilkan di undangan.');
                }
            }
            foreach ($events as $index => $event) {
                if (! is_array($event)) continue;
                if (($event['end_time'] ?? '') <= ($event['start_time'] ?? '')) {
                    $validator->errors()->add("events.$index.end_time", 'Waktu selesai harus setelah waktu mulai.');
                }
            }
        }];
    }
}

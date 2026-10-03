<?php

namespace App\Services;

use App\Http\Requests\SaveGiftRequest;
use App\Http\Requests\SaveWeddingRequest;
use App\Http\Resources\WeddingResource;
use App\Models\Wedding;
use App\Models\WeddingCustomerPortal;
use App\Rules\SafeMediaUrl;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class CustomerPortalService
{
    public const FIELDS = ['title', 'wedding_date', 'hashtag', 'opening_text', 'quote', 'quote_source', 'closing_text', 'cover_image', 'hero_image', 'closing_image', 'video_url', 'bride', 'groom', 'events', 'stories', 'gallery', 'gift_methods', 'event_details'];

    public static function preview(Wedding $wedding): array
    {
        return json_decode(json_encode((new WeddingResource($wedding->loadContent()))->resolve(Request::create('/api/weddings/'.$wedding->slug))), true);
    }

    public static function fingerprint(Wedding $wedding): string
    {
        $data = self::preview($wedding);
        $data = collect($data)->except(['id', 'order_id', 'status', 'published_at', 'publish_at', 'updated_at', 'is_demo'])->all();
        // Preserve unchanged wedding approvals when invisible metadata is added.
        if (($data['event_type'] ?? 'wedding') === 'wedding') unset($data['event_type'], $data['event_details']);
        $data['template'] = ['template_key' => $data['template']['template_key'], 'name' => $data['template']['name']];
        $clean = function ($value) use (&$clean) {
            if (! is_array($value)) {
                return $value;
            }
            $result = [];
            foreach ($value as $key => $entry) {
                if (in_array($key, ['id', 'wedding_id', 'created_at', 'updated_at', 'sort_order'], true)) {
                    continue;
                }
                $result[$key] = $clean($entry);
            }

            return $result;
        };

        return hash('sha256', json_encode($clean($data), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
    }

    public static function assertApproved(Wedding $wedding): void
    {
        $portal = WeddingCustomerPortal::where('wedding_id', $wedding->id)->whereNull('revoked_at')->first();
        if ($portal && ($portal->status !== 'APPROVED' || ! hash_equals($portal->approved_fingerprint ?? '', self::fingerprint($wedding)))) {
            throw ValidationException::withMessages(['customer_approval' => 'Pelanggan harus menyetujui preview terbaru sebelum publish. Buka tab Pelanggan.']);
        }
    }

    public function status(WeddingCustomerPortal $portal): string
    {
        return $portal->status === 'APPROVED' && ! hash_equals($portal->approved_fingerprint ?? '', self::fingerprint($portal->wedding)) ? 'IN_REVIEW' : $portal->status;
    }

    public function initial(Wedding $wedding): array
    {
        $data = self::preview($wedding);
        $form = collect($data)->only(self::FIELDS)->all();
        foreach (['bride', 'groom'] as $role) {
            $form[$role] = collect($form[$role] ?? [])->only(['full_name', 'nickname', 'father_name', 'mother_name', 'family_order', 'instagram', 'photo'])->all();
        }
        foreach (['events' => ['type', 'title', 'date', 'start_time', 'end_time', 'timezone', 'venue', 'address', 'google_maps_url'], 'stories' => ['date_label', 'title', 'description', 'image'], 'gallery' => ['image', 'caption'], 'gift_methods' => ['type', 'provider', 'account_number', 'account_name', 'logo', 'qr_image', 'recipient_name', 'phone', 'address', 'description', 'is_active']] as $group => $fields) {
            $form[$group] = array_map(fn ($entry) => collect($entry)->only($fields)->all(), $data[$group] ?? []);
        }
        foreach ($form['events'] as &$event) {
            $event['start_time'] = substr($event['start_time'], 0, 5);
            $event['end_time'] = substr($event['end_time'], 0, 5);
        }

        return $form;
    }

    public function validate(array $data, Wedding $wedding, bool $submit): array
    {
        $required = $submit ? 'required' : 'nullable';
        $media = ['nullable', 'string', 'max:2048', new SafeMediaUrl];
        $rules = [
            'data' => 'required|array:'.implode(',', self::FIELDS), 'data.title' => 'nullable|string|max:255', 'data.wedding_date' => $required.'|date_format:Y-m-d',
            'data.hashtag' => 'nullable|string|max:120', 'data.quote_source' => 'nullable|string|max:255',
            'data.events' => ($submit ? 'required|array|min:1|max:20' : 'present|array|max:20'), 'data.stories' => 'present|array|max:30', 'data.gallery' => 'present|array|max:50', 'data.gift_methods' => 'present|array|max:30',
            'data.events.*' => 'array:type,title,date,start_time,end_time,timezone,venue,address,google_maps_url',
            'data.events.*.type' => ['required', Rule::in(InvitationEvent::agendaTypes())],
            'data.events.*.title' => $required.'|string|max:120', 'data.events.*.date' => $required.'|date_format:Y-m-d',
            'data.events.*.start_time' => $required.'|date_format:H:i', 'data.events.*.end_time' => $required.'|date_format:H:i',
            'data.events.*.timezone' => ['required', Rule::in(['Asia/Jakarta', 'Asia/Makassar', 'Asia/Jayapura'])], 'data.events.*.venue' => $required.'|string|max:255', 'data.events.*.address' => 'nullable|string|max:1000', 'data.events.*.google_maps_url' => 'nullable|url:http,https|max:2048',
            'data.stories.*' => 'array:date_label,title,description,image', 'data.stories.*.date_label' => $required.'|string|max:60', 'data.stories.*.title' => $required.'|string|max:120', 'data.stories.*.description' => $required.'|string|max:3000', 'data.stories.*.image' => $media,
            'data.gallery.*' => 'array:image,caption', 'data.gallery.*.image' => ['required', 'string', 'max:2048', new SafeMediaUrl], 'data.gallery.*.caption' => 'nullable|string|max:255',
            'data.gift_methods.*' => 'array:type,provider,account_number,account_name,logo,qr_image,recipient_name,phone,address,description,is_active',
        ];
        foreach (['opening_text', 'quote', 'closing_text'] as $key) {
            $rules['data.'.$key] = 'nullable|string|max:5000';
        }
        foreach (['cover_image', 'hero_image', 'closing_image', 'video_url'] as $key) {
            $rules['data.'.$key] = $media;
        }
        foreach (['bride', 'groom'] as $role) {
            $rules['data.'.$role] = ($wedding->event_type === 'wedding' ? 'required' : 'present').'|array:full_name,nickname,father_name,mother_name,family_order,instagram,photo';
            $rules['data.'.$role.'.full_name'] = ($wedding->event_type === 'wedding' ? $required : 'nullable').'|string|min:2|max:120';
            foreach (['nickname', 'father_name', 'mother_name', 'family_order'] as $key) {
                $rules['data.'.$role.'.'.$key] = 'nullable|string|max:120';
            }
            $rules['data.'.$role.'.instagram'] = 'nullable|regex:/^[a-zA-Z0-9_.]{1,30}$/';
            $rules['data.'.$role.'.photo'] = $media;
        }
        $rules += InvitationEvent::rules('data.event_details', $wedding->event_type ?? 'wedding', $submit);
        if ($submit && $wedding->event_type !== 'wedding') $rules['data.title'] = 'required|string|min:2|max:255';
        $validator = Validator::make(['data' => $data], $rules);
        $validator->after(function ($validator) use ($data, $wedding) {
            foreach (is_array($data['events'] ?? null) ? $data['events'] : [] as $index => $event) {
                if (! empty($event['start_time']) && ! empty($event['end_time']) && $event['end_time'] <= $event['start_time']) {
                    $validator->errors()->add("data.events.$index.end_time", 'Waktu selesai harus setelah waktu mulai.');
                }
            }
            $check = function ($value) use (&$check, $validator, $wedding) {
                if (is_array($value)) {
                    foreach ($value as $entry) {
                        $check($entry);
                    }
                } elseif (is_string($value) && preg_match('~^/storage/weddings/([0-9]+)/~', $value, $match) && (int) $match[1] !== $wedding->id) {
                    $validator->errors()->add('data', 'Foto harus berasal dari undangan ini.');
                }
            };
            $check($data);
        });
        $validated = $validator->validate()['data'];
        $gifts = [];
        foreach ($validated['gift_methods'] as $index => $gift) {
            $form = SaveGiftRequest::create('/', 'POST', $gift);
            $giftValidator = Validator::make($gift, $form->rules());
            if ($giftValidator->fails()) {
                throw ValidationException::withMessages(['data.gift_methods.'.$index => implode(' ', $giftValidator->errors()->all())]);
            }
            $form->setValidator($giftValidator);
            $gifts[] = $form->giftData();
        }
        $validated['gift_methods'] = $gifts;

        return $validated;
    }

    public function apply(Wedding $wedding, array $submission, Request $request): array
    {
        $data = app(WeddingContentCsv::class)->data($wedding, Request::create('/api/admin/weddings/'.$wedding->id));
        foreach (collect($submission)->except('gift_methods') as $key => $value) {
            $data[$key] = $value;
        }
        $data['title'] = $data['title'] ?: ($wedding->event_type === 'wedding' ? 'The Wedding of '.$data['bride']['full_name'].' & '.$data['groom']['full_name'] : $wedding->title);
        $data['expected_updated_at'] = $request->input('expected_updated_at');
        $form = SaveWeddingRequest::create($request->url(), 'PUT', $data);
        $form->setRouteResolver($request->getRouteResolver());
        $validator = Validator::make($data, $form->rules());
        foreach ($form->after() as $after) {
            $validator->after($after);
        }

        return $validator->validate();
    }
}

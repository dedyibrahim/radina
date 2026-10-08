<?php

namespace App\Http\Controllers;

use App\Http\Requests\GuestSubmissionRequest;
use App\Http\Requests\StoreOrderRequest;
use App\Http\Resources\OrderResource;
use App\Http\Resources\TemplateResource;
use App\Http\Resources\WeddingResource;
use App\Models\Order;
use App\Models\Template;
use App\Models\TemplateCategory;
use App\Models\Wedding;
use App\Services\InvitationEvent;
use App\Services\OrderWorkflow;
use App\Services\PlatformSettings;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PublicController extends Controller
{
    public function settings(PlatformSettings $settings)
    {
        return response()->json(['data' => $settings->all()]);
    }

    public function categories()
    {
        return response()->json(['data' => TemplateCategory::whereIn('id', Template::where('status', 'ACTIVE')->whereNotIn('template_key', \App\Services\TemplateCatalog::retiredKeys())->select('category_id'))->orderBy('id')->get()]);
    }

    public function templates(Request $request)
    {
        $query = Template::with('category')->where('status', 'ACTIVE')->whereNotIn('template_key', \App\Services\TemplateCatalog::retiredKeys());
        if ($request->boolean('favorites')) {
            $data = $request->validate(['favorite_keys' => 'sometimes|array|max:100', 'favorite_keys.*' => 'string|max:80']);
            $query->whereIn('template_key', $data['favorite_keys'] ?? []);
        }
        if ($request->filled('search')) {
            $term = '%'.mb_substr($request->string('search'), 0, 120).'%';
            $query->where(fn ($q) => $q->where('name', 'like', $term)->orWhere('description', 'like', $term));
        }
        if ($request->filled('category')) {
            $query->whereHas('category', fn ($q) => $q->where('slug', $request->string('category')));
        }
        if ($request->boolean('featured')) {
            $query->where('is_featured', true);
        }
        match ($request->input('sort')) {
            'popular' => $query->orderByDesc(Order::selectRaw('count(*)')->whereColumn('template_id', 'templates.id')->where('is_demo', false)->where('status', '!=', 'CANCELLED')->whereHas('payment', fn ($p) => $p->where('status', 'PAID')))->orderByDesc('is_featured')->orderBy('id'),
            'newest' => $query->latest()->orderByDesc('id'),
            'price-asc' => $query->orderBy('price'),'price-desc' => $query->orderByDesc('price'),default => $query->latest()->orderByDesc('id')
        };

        return TemplateResource::collection($query->paginate(9));
    }

    public function template(string $slug)
    {
        return new TemplateResource(Template::with('category')->where('slug', $slug)->where('status', 'ACTIVE')->whereNotIn('template_key', \App\Services\TemplateCatalog::retiredKeys())->firstOrFail());
    }

    public function demo(Request $request, string $slug)
    {
        $request->validate(['event_type' => ['sometimes', \Illuminate\Validation\Rule::in(array_keys(InvitationEvent::types()))]]);
        $template = Template::with('category')->where('slug', $slug)->where('status', 'ACTIVE')->whereNotIn('template_key', \App\Services\TemplateCatalog::retiredKeys())->firstOrFail();
        $wedding = (Wedding::where('is_demo', true)->where('slug', 'radina-demo-'.$template->template_key)->first()
            ?? Wedding::where('is_demo', true)->firstOrFail())->loadContent();
        $wedding->setRelation('template', $template);
        $wedding->setAttribute('template_id', $template->id);
        $world = \App\Services\TemplateCatalog::worlds()[$template->template_key] ?? null;
        $type = $request->input('event_type', ($world['category'] ?? '') === 'Kids & Birthday' ? 'birthday' : 'wedding');
        // A fallback demo supplies photographs and events, not another template's copy.
        if ($world) $wedding->fill(\App\Services\TemplateContent::initial($template->template_key));
        if ($type !== 'wedding') {
            $profile = InvitationEvent::profile($type);
            $wedding->event_type = $type;
            $wedding->title = match ($type) {
                'khitanan' => 'Syukuran Khitanan Ahmad', 'office' => 'Pertemuan Tahunan Radina',
                'birthday' => 'Ulang Tahun Naila', 'aqiqah' => 'Syukuran Aqiqah Amina', default => 'Silaturahmi Keluarga Radina',
            };
            $wedding->event_details = InvitationEvent::details(['host_name' => $type === 'office' ? 'PT Radina Nusantara' : 'Keluarga Ibrahim',
                'honoree_name' => match ($type) {
                    'khitanan' => 'Ahmad Ibrahim', 'birthday' => 'Naila Ibrahim', 'aqiqah' => 'Amina Ibrahim', default => ''
                },
                'honoree_age' => $type === 'birthday' ? 7 : '',
                'father_name' => $profile['honoree'] ? 'Bapak Ibrahim' : '', 'mother_name' => $profile['honoree'] ? 'Ibu Siti' : '',
                'description' => 'Pratinjau contoh. Seluruh nama, jadwal, dan lokasi dapat disesuaikan dengan acara Anda.']);
            $wedding->fill(InvitationEvent::initial($type));
            $wedding->cover_image = null;
            $wedding->hero_image = null;
            $wedding->closing_image = null;
            $wedding->video_url = null;
            $wedding->hashtag = null;
            $wedding->livestream_platform = null;
            $wedding->livestream_url = null;
            $wedding->shipping_gift = null;
            $wedding->setRelation('couples', collect());
            $wedding->setRelation('gallery', collect());
            $wedding->setRelation('stories', collect());
            $wedding->setRelation('giftMethods', collect());
            $wedding->setRelation('gifts', collect());
            $wedding->events->each(function ($event, $index) use ($type) {
                $event->title = $index ? 'Ramah Tamah' : ($type === 'office' ? 'Sesi Utama' : 'Pembukaan & Doa');
                $event->type = $type === 'office' ? 'meeting' : 'syukuran';
                $event->venue = 'Aula Radina (Lokasi Demo)';
                $event->address = 'Alamat contoh; ubah sesuai lokasi acara Anda.';
                $event->google_maps_url = null;
            });
        }

        return new WeddingResource($wedding);
    }

    public function storeOrder(StoreOrderRequest $request)
    {
        $order = DB::transaction(function () use ($request) {
            $data = $request->validated();
            if ($data['event_type'] !== 'wedding') {
                $data['bride_name'] = '';
                $data['groom_name'] = '';
            }
            $template = Template::lockForUpdate()->findOrFail($data['template_id']);
            abort_unless($template->status === 'ACTIVE' && ! in_array($template->template_key, \App\Services\TemplateCatalog::retiredKeys(), true), 422, 'Template sudah tidak aktif.');
            $pricing = app(\App\Services\OrderPricingService::class)->calculate($template, $data['package_id'] ?? null, $data['addon_ids'] ?? []);
            abort_if(isset($data['expected_total']) && (int) $data['expected_total'] !== $pricing['total'], 409, 'Harga berubah. Periksa kembali ringkasan pesanan.');
            $packageId = $data['package_id'] ?? null;
            unset($data['package_id'], $data['addon_ids'], $data['expected_total']);
            // Auto-increment identity provides uniqueness even for simultaneous requests.
            $order = Order::create($data + ['order_number' => 'TEMP-'.Str::uuid(), 'total' => $pricing['total'], 'pricing_snapshot' => $pricing, 'invitation_package_id' => $packageId, 'status' => 'WAITING_PAYMENT']);
            $order->update(['order_number' => 'WD-'.now()->format('Ymd').'-'.str_pad((string) $order->id, 4, '0', STR_PAD_LEFT)]);
            $order->payment()->create(['amount' => $order->total, 'payment_method' => 'MANUAL_TRANSFER', 'status' => 'PENDING']);
            $order->histories()->create(['old_status' => null, 'new_status' => 'WAITING_PAYMENT']);

            return $order->load(['template.category', 'payment', 'wedding']);
        });

        return (new OrderResource($order))->response()->setStatusCode(201);
    }

    public function checkOrder(Request $request)
    {
        $data = $request->validate(['order_number' => 'required|string|max:60', 'whatsapp' => 'required|string|max:30']);
        $number = preg_replace('/[^0-9]/', '', $data['whatsapp']);
        if (str_starts_with($number, '0')) {
            $number = '62'.substr($number, 1);
        }
        $order = Order::with(['template.category', 'payment', 'wedding'])->where('order_number', $data['order_number'])->where('whatsapp', $number)->first();
        abort_unless($order, 404, 'Pesanan tidak ditemukan. Periksa Order ID dan nomor WhatsApp.');

        return new OrderResource($order);
    }

    public function reviewPayment(Request $request, OrderWorkflow $workflow)
    {
        $data = $request->validate(['order_number' => 'required|string|max:60', 'whatsapp' => 'required|string|max:20']);
        DB::transaction(function () use ($data, $workflow) {
            $order = Order::where('order_number', $data['order_number'])->where('whatsapp', $data['whatsapp'])->lockForUpdate()->firstOrFail();
            if ($order->status === 'WAITING_PAYMENT') {
                $workflow->transition($order, 'PAYMENT_REVIEW');
            }
        });

        return response()->json(['message' => 'Permintaan pengecekan dicatat. Kirim bukti transfer melalui WhatsApp.']);
    }

    private function published(string $slug): Wedding
    {
        return app(\App\Services\InvitationAccess::class)->published($slug);
    }

    public function wedding(string $slug)
    {
        return new WeddingResource($this->published($slug)->loadContent());
    }

    public function wishes(string $slug)
    {
        $w = $this->published($slug);
        abort_unless($w->settings?->enable_wishes, 403);

        return response()->json($w->wishes()->where('visible', true)->select(['id', 'name', 'message', 'created_at'])->paginate(20));
    }

    public function rsvp(GuestSubmissionRequest $request, string $slug)
    {
        $w = $this->published($slug);
        abort_if($w->is_demo, 403, 'Demo tidak menerima RSVP.');
        abort_unless($w->settings?->enable_rsvp, 403);
        $data = $request->validated();
        $guestToken = $data['guest_token'] ?? null;
        unset($data['guest_token']);
        if ($guestToken) {
            $guest = \App\Models\WeddingInvitee::where('wedding_id', $w->id)->where('token', $guestToken)->firstOrFail();
            $data['wedding_invitee_id'] = $guest->id;
            $data['name'] = $guest->name;
        }
        $w->rsvps()->create($data);

        return response()->json(['message' => 'Terkirim! Terima kasih atas konfirmasinya.'], 201);
    }

    public function wish(GuestSubmissionRequest $request, string $slug)
    {
        $w = $this->published($slug);
        abort_if($w->is_demo, 403, 'Demo tidak menerima ucapan.');
        abort_unless($w->settings?->enable_wishes, 403);
        $wish = $w->wishes()->create($request->validated());

        return response()->json(['data' => $wish->only(['id', 'name', 'message', 'created_at'])], 201);
    }
}

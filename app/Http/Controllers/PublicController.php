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
        return response()->json(['data' => TemplateCategory::whereIn('slug', ['romantic', 'luxury', 'minimalist', 'traditional', 'garden', 'islamic', 'cinematic', 'vintage', 'destination', 'creative', 'modern'])->get()]);
    }

    public function templates(Request $request)
    {
        $query = Template::with('category')->where('status', 'ACTIVE');
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
            'newest' => $query->latest(),
            'price-asc' => $query->orderBy('price'),'price-desc' => $query->orderByDesc('price'),default => $query->orderByDesc('is_featured')->latest()
        };

        return TemplateResource::collection($query->paginate(9));
    }

    public function template(string $slug)
    {
        return new TemplateResource(Template::with('category')->where('slug', $slug)->where('status', 'ACTIVE')->firstOrFail());
    }

    public function demo(string $slug)
    {
        $template = Template::with('category')->where('slug', $slug)->where('status', 'ACTIVE')->firstOrFail();
        $wedding = (Wedding::where('is_demo', true)->where('slug', 'radina-demo-'.$template->template_key)->first()
            ?? Wedding::where('is_demo', true)->firstOrFail())->loadContent();
        $wedding->setRelation('template', $template);
        $wedding->setAttribute('template_id', $template->id);

        return new WeddingResource($wedding);
    }

    public function storeOrder(StoreOrderRequest $request)
    {
        $order = DB::transaction(function () use ($request) {
            $data = $request->validated();
            $template = Template::lockForUpdate()->findOrFail($data['template_id']);
            abort_unless($template->status === 'ACTIVE', 422, 'Template sudah tidak aktif.');
            // Auto-increment identity provides uniqueness even for simultaneous requests.
            $order = Order::create($data + ['order_number' => 'TEMP-'.Str::uuid(), 'total' => $template->price, 'status' => 'WAITING_PAYMENT']);
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
        return Wedding::where('slug', $slug)->where('status', 'PUBLISHED')->whereHas('order', fn ($q) => $q->where('status', 'PUBLISHED')->whereHas('payment', fn ($p) => $p->where('status', 'PAID')))->firstOrFail();
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
        $w->rsvps()->create($request->validated());

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

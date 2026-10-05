<?php

namespace App\Http\Controllers;

use App\Http\Resources\OrderResource;
use App\Http\Resources\WeddingResource;
use App\Models\Order;
use App\Services\OrderWorkflow;
use App\Services\PaymentService;
use App\Services\WeddingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class AdminOrderController extends Controller
{
    public function dashboard()
    {
        $counts = Order::where('is_demo', false)->selectRaw('status, COUNT(*) AS count')->groupBy('status')->pluck('count', 'status');

        return response()->json(['data' => ['total_orders' => Order::where('is_demo', false)->count(), 'today_orders' => Order::where('is_demo', false)->whereDate('created_at', today())->count(), 'statuses' => $counts,
            'revenue' => DB::table('payments')->join('orders', 'orders.id', '=', 'payments.order_id')->where('orders.is_demo', false)->where('payments.status', 'PAID')->sum('payments.amount'), 'recent_orders' => OrderResource::collection(Order::with(['template.category', 'payment', 'wedding'])->where('is_demo', false)->latest()->limit(6)->get()),
            'attention_orders' => OrderResource::collection(Order::with(['template.category', 'payment', 'wedding'])->where('is_demo', false)->whereIn('status', ['PAYMENT_REVIEW', 'PAID', 'CONTENT_PROCESS'])->oldest()->limit(6)->get())]]);
    }

    public function index(Request $request)
    {
        $q = Order::with(['template.category', 'payment', 'wedding'])->where('is_demo', false)->latest();
        if ($request->filled('status')) {
            $q->where('status', $request->string('status'));
        }
        if ($request->filled('template')) {
            $q->where('template_id', $request->integer('template'));
        }
        if ($request->filled('date')) {
            $request->validate(['date' => 'date_format:Y-m-d']);
            $q->whereDate('created_at', $request->input('date'));
        }
        if ($request->filled('search')) {
            $search = '%'.mb_substr($request->string('search'), 0, 120).'%';
            $q->where(fn ($s) => $s->where('order_number', 'like', $search)->orWhere('customer_name', 'like', $search)->orWhere('whatsapp', 'like', $search));
        }

        return OrderResource::collection($q->paginate(15));
    }

    public function show(Order $order)
    {
        return new OrderResource($order->load(['template.category', 'payment', 'wedding', 'histories']));
    }

    public function payment(Request $request, Order $order, PaymentService $payments)
    {
        $data = $request->validate(['reference' => 'nullable|string|max:255']);

        return new OrderResource($payments->confirm($order, $request->user()->id, $data['reference'] ?? null)->load(['template.category', 'payment', 'wedding', 'histories']));
    }

    public function status(Request $request, Order $order, OrderWorkflow $workflow)
    {
        $data = $request->validate(['status' => ['required', Rule::in(['PAYMENT_REVIEW', 'CONTENT_PROCESS', 'READY', 'CANCELLED'])]]);
        DB::transaction(function () use ($order, $data, $workflow, $request) {
            $order = Order::lockForUpdate()->findOrFail($order->id);
            if (in_array($data['status'], ['CONTENT_PROCESS', 'READY'], true)) {
                abort_unless($order->payment->status === 'PAID', 422, 'Pembayaran belum dikonfirmasi.');
            }
            if ($data['status'] === 'READY') {
                abort_unless($order->wedding, 422, 'Buat dan lengkapi undangan terlebih dahulu.');
            }
            $workflow->transition($order, $data['status'], $request->user()->id);
            if ($data['status'] === 'CANCELLED') {
                $order->wedding?->update(['status' => 'DRAFT']);
                if ($order->payment->status === 'PENDING') {
                    $order->payment->update(['status' => 'CANCELLED']);
                }
            }
        });

        return $this->show($order->fresh());
    }

    public function wedding(Request $request, Order $order, WeddingService $service)
    {
        return new WeddingResource($service->create($order, $request->user()->id));
    }
}

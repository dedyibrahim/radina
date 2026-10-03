<?php

namespace App\Services;

use App\Models\Order;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PaymentService
{
    public function __construct(private OrderWorkflow $workflow) {}

    public function confirm(Order $order, int $adminId, ?string $reference = null): Order
    {
        return DB::transaction(function () use ($order, $adminId, $reference) {
            $order = Order::lockForUpdate()->findOrFail($order->id);
            if ($order->status === 'CANCELLED') {
                throw ValidationException::withMessages(['payment' => 'Pesanan telah dibatalkan.']);
            }
            if ($order->payment->status === 'PAID') {
                return $order;
            }
            if ($order->status === 'WAITING_PAYMENT') {
                $this->workflow->transition($order, 'PAYMENT_REVIEW', $adminId);
            }
            $order->payment->update(['status' => 'PAID', 'confirmed_by' => $adminId, 'confirmed_at' => now(), 'reference' => $reference]);
            $this->workflow->transition($order, 'PAID', $adminId);

            return $order->fresh(['payment', 'template', 'histories']);
        });
    }
}

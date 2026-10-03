<?php

namespace App\Services;

use App\Models\Order;
use Illuminate\Validation\ValidationException;

class OrderWorkflow
{
    private const TRANSITIONS = [
        'WAITING_PAYMENT' => ['PAYMENT_REVIEW', 'CANCELLED'], 'PAYMENT_REVIEW' => ['PAID', 'CANCELLED'],
        'PAID' => ['CONTENT_PROCESS', 'CANCELLED'], 'CONTENT_PROCESS' => ['READY', 'CANCELLED'],
        'READY' => ['CONTENT_PROCESS', 'PUBLISHED', 'CANCELLED'], 'PUBLISHED' => ['CANCELLED'], 'CANCELLED' => [],
    ];

    public function transition(Order $order, string $next, ?int $adminId = null): void
    {
        $old = $order->status;
        if ($old === $next) {
            return;
        }
        if (! in_array($next, self::TRANSITIONS[$old] ?? [], true)) {
            throw ValidationException::withMessages(['status' => 'Perubahan status ini tidak diizinkan.']);
        }
        $order->update(['status' => $next]);
        $order->histories()->create(['old_status' => $old, 'new_status' => $next, 'changed_by' => $adminId]);
    }
}

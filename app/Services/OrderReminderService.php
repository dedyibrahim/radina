<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderReminder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class OrderReminderService
{
    public function refresh(?int $orderId = null): void
    {
        $orders = Order::with(['payment', 'wedding.customerPortal'])->where('is_demo', false);
        if ($orderId) {
            $orders->whereKey($orderId);
        }
        $orders->chunkById(100, function ($batch) {
            foreach ($batch as $order) {
                DB::transaction(function () use ($order) {
                    $planned = [];
                    $add = function ($key, $kind, $title, $message, $due) use (&$planned, $order) {
                        $planned['order-'.$order->id.'-'.$key] = ['order_id' => $order->id, 'kind' => $kind, 'title' => $title, 'message' => $message, 'due_at' => $due];
                    };
                    if ($order->status !== 'CANCELLED') {
                        if (in_array($order->status, ['WAITING_PAYMENT', 'PAYMENT_REVIEW'], true) && $order->payment?->status !== 'PAID') {
                            $add('payment', 'PAYMENT', 'Pembayaran pesanan', 'Pembayaran belum dikonfirmasi. Siapkan bukti transfer dan hubungi admin.', $order->created_at->copy()->addDay());
                        }
                        if ($order->payment?->status === 'PAID') {
                            $wedding = $order->wedding;
                            $portal = $wedding?->customerPortal;
                            $incomplete = ! $wedding || ! $wedding->wedding_date || ! $wedding->events()->exists() || ($portal && in_array($portal->status, ['DRAFT', 'CHANGES_REQUESTED'], true));
                            if ($incomplete && $order->status !== 'PUBLISHED') {
                                $add('content', 'CONTENT', 'Lengkapi data undangan', 'Data acara masih perlu dilengkapi. Isi portal pelanggan atau hubungi admin.', ($order->payment->confirmed_at ?? $order->created_at)->copy()->addDays(2));
                            }
                            if ($portal && $portal->status === 'IN_REVIEW') {
                                $add('approval-'.$portal->applied_version, 'APPROVAL', 'Tinjau pratinjau undangan', 'Pratinjau menunggu persetujuan pelanggan sebelum undangan dipublish.', $portal->updated_at->copy()->addDay());
                            }
                            if ($wedding?->status === 'PUBLISHED' && $order->status === 'PUBLISHED') {
                                if ($wedding->wedding_date) {
                                    foreach ([7, 1] as $days) {
                                        $add('event-'.$wedding->wedding_date->format('Ymd').'-'.$days, 'EVENT', 'Acara H-'.$days, 'Periksa tautan, RSVP, dan QR tamu untuk persiapan acara.', Carbon::parse($wedding->wedding_date->toDateString().' 09:00:00', 'Asia/Jakarta')->subDays($days)->utc());
                                    }
                                }
                                if ($wedding->expires_at) {
                                    foreach ([7, 1] as $days) {
                                        $add('expiry-'.$wedding->expires_at->timestamp.'-'.$days, 'EXPIRY', 'Masa aktif undangan', 'Masa aktif undangan berakhir pada '.$wedding->expires_at->copy()->timezone('Asia/Jakarta')->format('d/m/Y').'. Hubungi admin untuk perpanjangan.', $wedding->expires_at->copy()->subDays($days));
                                    }
                                }
                            }
                        }
                    }
                    // Reopening a phase reactivates its reminder without overwriting a dismissal or snooze.
                    foreach ($planned as $key => $data) {
                        OrderReminder::updateOrCreate(['key' => $key], $data + ['resolved_at' => null]);
                    }
                    OrderReminder::where('order_id', $order->id)->whereNull('resolved_at')->whereNotIn('key', array_keys($planned))->update(['resolved_at' => now()]);
                    if ($order->wedding?->wedding_date && $order->wedding->wedding_date->copy()->timezone('Asia/Jakarta')->endOfDay()->isPast()) {
                        OrderReminder::where('order_id', $order->id)->where('kind', 'EVENT')->whereNull('resolved_at')->update(['resolved_at' => now()]);
                    }
                });
            }
        });
    }

    public function active(?int $orderId = null)
    {
        $query = OrderReminder::whereNull('resolved_at')->whereNull('dismissed_at');
        if ($orderId) {
            $query->where('order_id', $orderId);
        }

        return $query;
    }
}

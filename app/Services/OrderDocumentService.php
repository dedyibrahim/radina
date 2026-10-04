<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderDocument;
use Dompdf\Dompdf;
use Dompdf\Options;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class OrderDocumentService
{
    public function document(Order $order, string $type): OrderDocument
    {
        abort_unless(in_array($type, ['invoice', 'receipt'], true), 404);

        return DB::transaction(function () use ($order, $type) {
            $order = Order::lockForUpdate()->findOrFail($order->id);
            abort_if($order->is_demo, 404);
            abort_if($type === 'receipt' && $order->payment?->status !== 'PAID', 422, 'Kwitansi tersedia setelah pembayaran dikonfirmasi.');
            $existing = OrderDocument::where('order_id', $order->id)->where('type', $type)->first();
            if ($existing) {
                return $existing;
            }
            $settings = app(PlatformSettings::class)->all();
            $items = $order->pricing_snapshot['items'] ?? [['description' => 'Undangan digital — '.($order->template?->name ?? $order->slug), 'amount' => (int) $order->total]];

            return OrderDocument::create(['order_id' => $order->id, 'type' => $type, 'number' => ($type === 'invoice' ? 'INV-' : 'KWT-').$order->order_number,
                'issued_at' => $type === 'receipt' ? ($order->payment->confirmed_at ?? now()) : $order->created_at,
                'snapshot' => ['order_number' => $order->order_number, 'customer_name' => $order->customer_name, 'whatsapp' => $order->whatsapp, 'email' => $order->email,
                    'items' => $items, 'total' => (int) $order->total, 'currency' => 'IDR', 'company' => $settings['company_name'] ?? 'Radina',
                    'contact' => $settings['whatsapp_number'] ?? '6281289903664', 'banks' => collect(['', 'secondary_'])->map(fn ($prefix) => ['bank' => $settings[$prefix.'bank_name'] ?? '', 'account_number' => $settings[$prefix.'bank_account'] ?? '', 'account_name' => $settings[$prefix.'bank_account_name'] ?? ''])->filter(fn ($bank) => $bank['account_number'] !== '')->values()->all(),
                    'payment_method' => $order->payment?->payment_method, 'reference' => $type === 'receipt' ? $order->payment?->reference : null]]);
        });
    }

    public function download(Order $order, string $type)
    {
        $document = $this->document($order, $type);
        $fontCache = storage_path('app/pdf-fonts');
        File::ensureDirectoryExists($fontCache);
        $options = new Options(['isRemoteEnabled' => false, 'isPhpEnabled' => false, 'isJavascriptEnabled' => false, 'defaultFont' => 'DejaVu Sans',
            'fontCache' => $fontCache, 'fontDir' => $fontCache, 'tempDir' => $fontCache, 'chroot' => [base_path('vendor/dompdf/dompdf/lib/fonts'), $fontCache]]);
        $pdf = new Dompdf($options);
        $pdf->loadHtml(view('documents.order', ['document' => $document, 'data' => $document->snapshot, 'paid' => $order->payment?->status === 'PAID', 'cancelled' => $order->status === 'CANCELLED'])->render(), 'UTF-8');
        $pdf->setPaper('A4');
        $pdf->render();

        return response($pdf->output())->header('Content-Type', 'application/pdf')->header('Content-Disposition', 'attachment; filename="'.$document->number.'.pdf"')
            ->header('Cache-Control', 'private, no-store')->header('Referrer-Policy', 'no-referrer')->header('X-Robots-Tag', 'noindex, nofollow');
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Services\OrderDocumentService;
use Illuminate\Http\Request;

class OrderDocumentController extends Controller
{
    public function admin(Order $order, string $type, OrderDocumentService $documents)
    {
        return $documents->download($order, $type);
    }

    public function customer(Request $request, string $type, OrderDocumentService $documents)
    {
        $data = $request->validate(['order_number' => 'required|string|max:60', 'whatsapp' => 'required|string|max:30']);
        $number = preg_replace('/[^0-9]/', '', $data['whatsapp']);
        if (str_starts_with($number, '0')) {
            $number = '62'.substr($number, 1);
        }
        $order = Order::where('is_demo', false)->where('order_number', $data['order_number'])->where('whatsapp', $number)->firstOrFail();

        return $documents->download($order, $type);
    }
}

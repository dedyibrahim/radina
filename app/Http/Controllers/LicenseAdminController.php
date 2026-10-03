<?php

namespace App\Http\Controllers;

use App\Models\License;
use Illuminate\Http\Request;

class LicenseAdminController extends Controller
{
    public function index()
    {
        $licenses = License::withCount('activations')->latest()->paginate(12);
        $licenses->getCollection()->transform(function (License $license) {
            $license->setAttribute('is_expired', (bool) ($license->expires_at && $license->expires_at->isPast()));
            return $license;
        });
        return response()->json([
            'data' => $licenses,
            'stats' => ['total' => License::count(), 'active' => License::where('status', License::STATUS_ACTIVE)->count(), 'expired' => License::whereDate('expires_at', '<', now()->toDateString())->count(), 'revoked' => License::where('status', License::STATUS_REVOKED)->count()],
            'defaults' => ['product_name' => config('license.product_name'), 'max_activations' => 1],
        ]);
    }

    public function store(Request $request)
    {
        $payload = $this->payload($request);
        $payload['status'] = License::STATUS_ACTIVE;
        $payload['key'] = License::generateKey();
        return response()->json(['data' => License::create($payload)], 201);
    }

    public function update(Request $request, License $license)
    {
        $license->update($this->payload($request));
        return response()->json(['data' => $license->fresh()]);
    }

    public function toggleStatus(License $license)
    {
        $license->status = $license->status === License::STATUS_ACTIVE ? License::STATUS_REVOKED : License::STATUS_ACTIVE;
        $license->save();
        return response()->json(['data' => $license]);
    }

    public function destroy(License $license)
    {
        $license->delete();
        return response()->noContent();
    }

    private function payload(Request $request): array
    {
        return $request->validate(['customer_name' => ['required', 'string', 'max:120'], 'product_name' => ['required', 'string', 'max:120'], 'max_activations' => ['required', 'integer', 'min:1', 'max:1000'], 'expires_at' => ['nullable', 'date'], 'notes' => ['nullable', 'string', 'max:1000']]);
    }
}

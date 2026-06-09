<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\License;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class LicenseActivationController extends Controller
{
    public function activate(Request $request)
    {
        $requiredToken = (string) config('license.activation_token', '');
        $requestToken = (string) $request->header('X-LICENSE-TOKEN', '');

        if ($requiredToken !== '' && !hash_equals($requiredToken, $requestToken)) {
            return response()->json([
                'valid' => false,
                'message' => 'Token aplikasi tidak valid.',
            ], Response::HTTP_UNAUTHORIZED);
        }

        $payload = $request->validate([
            'license_key' => ['required', 'string', 'max:64'],
            'machine_id' => ['required', 'string', 'max:128'],
            'app_version' => ['nullable', 'string', 'max:32'],
        ]);

        $license = License::with('activations')->where('key', strtoupper(trim($payload['license_key'])))->first();
        if (!$license) {
            return response()->json([
                'valid' => false,
                'message' => 'License tidak ditemukan.',
            ], Response::HTTP_NOT_FOUND);
        }

        if ($license->status !== License::STATUS_ACTIVE) {
            return response()->json([
                'valid' => false,
                'message' => 'License tidak aktif/revoked.',
            ], Response::HTTP_FORBIDDEN);
        }

        if ($license->isExpired()) {
            return response()->json([
                'valid' => false,
                'message' => 'License sudah expired.',
                'expires_at' => optional($license->expires_at)->toDateString(),
            ], Response::HTTP_FORBIDDEN);
        }

        $machineId = strtoupper(trim($payload['machine_id']));
        $activation = $license->activations->firstWhere('machine_id', $machineId);

        if (!$activation && $license->activations->count() >= $license->max_activations) {
            return response()->json([
                'valid' => false,
                'message' => 'Batas aktivasi license sudah penuh.',
                'max_activations' => $license->max_activations,
            ], Response::HTTP_FORBIDDEN);
        }

        if ($activation) {
            $activation->forceFill([
                'last_seen_at' => now(),
                'app_version' => $payload['app_version'] ?? $activation->app_version,
                'ip_address' => (string) $request->ip(),
                'user_agent' => (string) substr((string) $request->userAgent(), 0, 255),
            ])->save();
        } else {
            $license->activations()->create([
                'machine_id' => $machineId,
                'app_version' => $payload['app_version'] ?? null,
                'ip_address' => (string) $request->ip(),
                'user_agent' => (string) substr((string) $request->userAgent(), 0, 255),
                'activated_at' => now(),
                'last_seen_at' => now(),
            ]);
        }

        $license->forceFill(['last_activated_at' => now()])->save();
        $activeDevices = $license->activations()->count();

        return response()->json([
            'valid' => true,
            'message' => 'License valid dan aktivasi berhasil.',
            'license' => [
                'key' => $license->key,
                'customer_name' => $license->customer_name,
                'product_name' => $license->product_name,
                'status' => $license->status,
                'expires_at' => optional($license->expires_at)->toDateString(),
                'max_activations' => $license->max_activations,
                'active_devices' => $activeDevices,
            ],
        ]);
    }
}

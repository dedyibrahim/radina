<?php
namespace App\Http\Controllers;
use App\Models\License;
use Illuminate\Http\Request;
class DashboardController extends Controller
{
    public function store(Request $request)
    {
        $payload = $this->validateLicensePayload($request);

        $payload['status'] = License::STATUS_ACTIVE;
        $payload['key'] = License::generateKey();

        $license = License::create($payload);

        return redirect()
            ->route('dashboard', ['section' => 'licenses'])
            ->with('status', 'Lisensi baru berhasil dibuat.')
            ->with('new_license_key', $license->key);
    }

    public function update(Request $request, License $license)
    {
        $payload = $this->validateLicensePayload($request);
        $license->update($payload);

        return redirect()
            ->route('dashboard', ['section' => 'licenses'])
            ->with('status', 'Lisensi berhasil diperbarui.');
    }

    public function destroy(License $license)
    {
        $licenseKey = $license->key;
        $license->delete();

        return redirect()
            ->route('dashboard', ['section' => 'licenses'])
            ->with('status', "Lisensi {$licenseKey} berhasil dihapus.");
    }

    public function toggleStatus(License $license)
    {
        $license->status = $license->status === License::STATUS_ACTIVE
            ? License::STATUS_REVOKED
            : License::STATUS_ACTIVE;
        $license->save();

        return redirect()
            ->route('dashboard', ['section' => 'licenses'])
            ->with('status', 'Status lisensi berhasil diubah.');
    }

    private function validateLicensePayload(Request $request): array
    {
        return $request->validate([
            'customer_name' => ['required', 'string', 'max:120'],
            'product_name' => ['required', 'string', 'max:120'],
            'max_activations' => ['required', 'integer', 'min:1', 'max:1000'],
            'expires_at' => ['nullable', 'date'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);
    }

    private function transformLicense(License $license): array
    {
        $isExpired = $license->expires_at && $license->expires_at->isPast();

        return [
            'id' => $license->id,
            'key' => $license->key,
            'customerName' => $license->customer_name,
            'productName' => $license->product_name,
            'status' => $license->status,
            'statusLabel' => $isExpired ? 'Expired' : ucfirst($license->status),
            'statusTone' => $isExpired
                ? 'amber'
                : ($license->status === License::STATUS_ACTIVE ? 'emerald' : 'rose'),
            'maxActivations' => $license->max_activations,
            'activationsCount' => $license->activations_count,
            'expiresAt' => $license->expires_at?->format('Y-m-d'),
            'isExpired' => $isExpired,
            'notes' => $license->notes,
            'editUrl' => route('dashboard', ['section' => 'licenses', 'edit' => $license->id, 'page' => request('page')]),
            'toggleUrl' => route('licenses.toggle-status', $license),
            'updateUrl' => route('licenses.update', $license),
            'destroyUrl' => route('licenses.destroy', $license),
        ];
    }

}

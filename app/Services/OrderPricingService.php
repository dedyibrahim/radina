<?php

namespace App\Services;

use App\Models\InvitationAddon;
use App\Models\InvitationPackage;
use App\Models\Template;
use Illuminate\Validation\ValidationException;

class OrderPricingService
{
    public function calculate(Template $template, ?int $packageId, array $addonIds = []): array
    {
        $package = $packageId ? InvitationPackage::lockForUpdate()->findOrFail($packageId) : null;
        if ($package && (! $package->is_active || $package->price === null)) {
            throw ValidationException::withMessages(['package_id' => 'Paket sudah tidak tersedia. Pilih kembali paket Anda.']);
        }
        $addons = InvitationAddon::whereIn('id', $addonIds)->orderBy('id')->lockForUpdate()->get();
        if ($addons->count() !== count(array_unique($addonIds)) || $addons->contains(fn ($a) => ! $a->is_active)) {
            throw ValidationException::withMessages(['addon_ids' => 'Layanan tambahan sudah tidak tersedia.']);
        }
        $items = [];
        if ($package?->pricing_mode === 'FIXED') {
            $items[] = ['description' => 'Paket '.$package->name.' · '.$template->name, 'amount' => $package->price];
        } else {
            $items[] = ['description' => 'Undangan digital · '.$template->name, 'amount' => (int) $template->price];
            if ($package) {
                $items[] = ['description' => 'Paket '.$package->name, 'amount' => $package->price];
            }
        }
        foreach ($addons as $addon) {
            $items[] = ['description' => $addon->name, 'amount' => $addon->price];
        }

        return ['template' => ['id' => $template->id, 'name' => $template->name, 'price' => (int) $template->price],
            'package' => $package?->only(['id', 'name', 'pricing_mode', 'price', 'duration_days', 'features']),
            'addons' => $addons->map(fn ($a) => $a->only(['id', 'name', 'description', 'price']))->all(),
            'items' => $items, 'total' => array_sum(array_column($items, 'amount'))];
    }
}

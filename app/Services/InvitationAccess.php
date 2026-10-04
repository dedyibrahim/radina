<?php

namespace App\Services;

use App\Models\Wedding;

class InvitationAccess
{
    public function published(string $slug): Wedding
    {
        $wedding = Wedding::where('slug', $slug)->where('status', 'PUBLISHED')->whereHas('order', fn ($q) => $q->where('status', 'PUBLISHED')->whereHas('payment', fn ($p) => $p->where('status', 'PAID')))->firstOrFail();
        abort_if($wedding->expires_at?->isPast(), 410, 'Masa aktif undangan telah berakhir. Hubungi admin untuk perpanjangan.');

        return $wedding;
    }
}

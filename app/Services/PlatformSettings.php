<?php

namespace App\Services;

use App\Models\SystemSetting;

class PlatformSettings
{
    public function all(): array
    {
        return SystemSetting::pluck('value', 'key')->all();
    }
}

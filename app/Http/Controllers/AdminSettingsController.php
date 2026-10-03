<?php

namespace App\Http\Controllers;

use App\Models\SystemSetting;
use App\Rules\SafeMediaUrl;
use App\Services\PlatformSettings;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminSettingsController extends Controller
{
    public function show(PlatformSettings $settings)
    {
        return response()->json(['data' => $settings->all()]);
    }

    public function update(Request $request, PlatformSettings $settings)
    {
        $data = $request->validate([
            'company_name' => 'required|string|max:120', 'whatsapp_number' => 'required|regex:/^[1-9][0-9]{8,14}$/', 'email' => 'required|email|max:255',
            'bank_name' => 'required|string|max:60', 'bank_account' => 'required|string|max:60', 'bank_account_name' => 'required|string|max:120',
            'instagram' => 'nullable|url:http,https|max:2048', 'footer' => 'nullable|string|max:500', 'seo_title' => 'nullable|string|max:120', 'seo_description' => 'nullable|string|max:500',
            'logo' => ['nullable', 'string', 'max:2048', new SafeMediaUrl],
            'payment_notice' => 'nullable|string|max:1000',
        ]);
        DB::transaction(function () use ($data) {
            foreach ($data as $key => $value) {
                SystemSetting::updateOrCreate(['key' => $key], ['value' => $value]);
            }
        });

        return response()->json(['data' => $settings->all()]);
    }
}

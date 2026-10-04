<?php

namespace App\Http\Controllers;

use App\Models\InvitationAddon;
use App\Models\InvitationPackage;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class PackageController extends Controller
{
    public function index(Request $request)
    {
        $admin = $request->is('api/admin/*');

        return response()->json(['data' => [
            'packages' => InvitationPackage::when(! $admin, fn ($q) => $q->where('is_active', true)->whereNotNull('price'))->orderBy('sort_order')->orderBy('id')->get(),
            'addons' => InvitationAddon::when(! $admin, fn ($q) => $q->where('is_active', true))->orderBy('id')->get(),
        ]]);
    }

    public function savePackage(Request $request, ?InvitationPackage $package = null)
    {
        $data = $request->validate(['name' => 'required|string|max:120', 'slug' => ['required', 'string', 'max:120', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/', Rule::unique('invitation_packages')->ignore($package?->id)],
            'description' => 'nullable|string|max:1500', 'pricing_mode' => ['required', Rule::in(['TEMPLATE_PLUS', 'FIXED'])],
            'price' => 'nullable|required_if:is_active,1,true|integer|min:0|max:100000000', 'duration_days' => 'nullable|integer|min:1|max:3650',
            'features' => 'present|array|max:30', 'features.*' => 'string|max:180', 'is_active' => 'required|boolean', 'sort_order' => 'required|integer|min:0|max:1000']);
        $package ??= new InvitationPackage;
        $package->fill($data)->save();

        return response()->json(['data' => $package], $package->wasRecentlyCreated ? 201 : 200);
    }

    public function saveAddon(Request $request, ?InvitationAddon $addon = null)
    {
        $data = $request->validate(['name' => 'required|string|max:120', 'description' => 'nullable|string|max:1500', 'price' => 'required|integer|min:0|max:10000000', 'is_active' => 'required|boolean']);
        $addon ??= new InvitationAddon;
        $addon->fill($data)->save();

        return response()->json(['data' => $addon], $addon->wasRecentlyCreated ? 201 : 200);
    }
}

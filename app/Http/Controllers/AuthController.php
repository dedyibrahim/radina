<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $data = $request->validate(['email' => 'required|email', 'password' => 'required|string']);
        if (! Auth::attempt($data)) {
            throw ValidationException::withMessages(['email' => 'Email atau kata sandi tidak sesuai.']);
        }
        if (! $request->user()->isAdmin() || ! $request->user()->admin?->active) {
            Auth::logout();
            throw ValidationException::withMessages(['email' => 'Akun ini tidak memiliki akses administrator.']);
        }
        $request->session()->regenerate();

        return response()->json(['data' => ['id' => $request->user()->id, 'name' => $request->user()->name, 'email' => $request->user()->email]]);
    }

    public function me(Request $request)
    {
        return response()->json(['data' => ['id' => $request->user()->id, 'name' => $request->user()->name, 'email' => $request->user()->email]]);
    }

    public function logout(Request $request)
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->noContent();
    }
}

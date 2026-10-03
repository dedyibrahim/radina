<?php

namespace App\Http\Controllers;

use App\Support\LoginCaptcha;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function captcha(Request $request)
    {
        return response()->json(['data' => ['question' => LoginCaptcha::generate($request->session())]])
            ->header('Cache-Control', 'no-store, private');
    }

    public function login(Request $request)
    {
        $data = $request->validate(['email' => 'required|email', 'password' => 'required|string', 'captcha' => 'required|integer']);
        if (! LoginCaptcha::matches($request->session(), $data['captcha'])) {
            throw ValidationException::withMessages(['captcha' => 'Jawaban CAPTCHA salah atau sudah kedaluwarsa. Silakan coba soal yang baru.']);
        }
        if (! Auth::guard('web')->attempt(['email' => $data['email'], 'password' => $data['password']])) {
            throw ValidationException::withMessages(['email' => 'Email atau kata sandi tidak sesuai.']);
        }
        if (! $request->user()->isAdmin() || ! $request->user()->admin?->active) {
            Auth::guard('web')->logout();
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

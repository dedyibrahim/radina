<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class UserAdminController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $payload = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'role' => ['required', Rule::in([User::ROLE_ADMIN, User::ROLE_WRITER])],
            'article_fee' => ['nullable', 'integer', 'min:0', 'max:100000000'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        User::create([
            ...$payload,
            'password' => Hash::make($payload['password']),
            'email_verified_at' => now(),
        ]);

        return redirect()
            ->route('dashboard', ['section' => 'users'])
            ->with('status', 'Akun pengguna berhasil dibuat.');
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $payload = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'role' => ['required', Rule::in([User::ROLE_ADMIN, User::ROLE_WRITER])],
            'article_fee' => ['nullable', 'integer', 'min:0', 'max:100000000'],
            'password' => ['nullable', 'confirmed', Password::defaults()],
        ]);

        if ($request->user()->is($user) && $payload['role'] !== User::ROLE_ADMIN) {
            return back()->withErrors(['role' => 'Admin tidak dapat menurunkan level akunnya sendiri.']);
        }

        $user->fill([
            'name' => $payload['name'],
            'email' => $payload['email'],
            'role' => $payload['role'],
            'article_fee' => $payload['article_fee'] ?? null,
        ]);

        if (! empty($payload['password'])) {
            $user->password = Hash::make($payload['password']);
        }

        $user->email_verified_at ??= now();
        $user->save();

        return redirect()
            ->route('dashboard', ['section' => 'users'])
            ->with('status', 'Akun pengguna berhasil diperbarui.');
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        if ($request->user()->is($user)) {
            return redirect()
                ->route('dashboard', ['section' => 'users'])
                ->with('status', 'Akun yang sedang digunakan tidak dapat dihapus.');
        }

        if ($user->newsArticles()->exists()) {
            return redirect()
                ->route('dashboard', ['section' => 'users'])
                ->with('status', 'Akun tidak dapat dihapus karena masih memiliki artikel.');
        }

        if ($user->writerEarnings()->exists() || $user->writerWithdrawals()->exists()) {
            return redirect()
                ->route('dashboard', ['section' => 'users'])
                ->with('status', 'Akun tidak dapat dihapus karena memiliki riwayat pembayaran.');
        }

        $user->delete();

        return redirect()
            ->route('dashboard', ['section' => 'users'])
            ->with('status', 'Akun pengguna berhasil dihapus.');
    }
}

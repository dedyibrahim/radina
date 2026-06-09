<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\WriterWithdrawal;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class WriterFinanceController extends Controller
{
    public function updateBank(Request $request): RedirectResponse
    {
        $payload = $request->validate([
            'bank_name' => ['required', 'string', 'max:100'],
            'bank_account_number' => ['required', 'string', 'regex:/^[0-9]{5,30}$/'],
            'bank_account_holder' => ['required', 'string', 'max:150'],
        ]);

        $request->user()->update($payload);

        return redirect()
            ->route('dashboard', ['section' => 'bank'])
            ->with('status', 'Rekening pencairan berhasil diperbarui.');
    }

    public function requestWithdrawal(Request $request): RedirectResponse
    {
        $minimum = (int) config('writer_payments.minimum_withdrawal');
        $payload = $request->validate([
            'amount' => ['required', 'integer', 'min:'.$minimum],
        ]);

        DB::transaction(function () use ($request, $payload): void {
            $writer = User::query()->lockForUpdate()->findOrFail($request->user()->id);

            if (! $writer->isWriter()) {
                abort(403);
            }

            if (! $writer->hasBankAccount()) {
                throw ValidationException::withMessages([
                    'amount' => 'Lengkapi rekening pencairan sebelum mengajukan withdrawal.',
                ]);
            }

            if ((int) $payload['amount'] > $writer->availableBalance()) {
                throw ValidationException::withMessages([
                    'amount' => 'Nominal withdrawal melebihi saldo yang tersedia.',
                ]);
            }

            WriterWithdrawal::create([
                'user_id' => $writer->id,
                'amount' => (int) $payload['amount'],
                'bank_name' => $writer->bank_name,
                'bank_account_number' => $writer->bank_account_number,
                'bank_account_holder' => $writer->bank_account_holder,
                'status' => WriterWithdrawal::STATUS_PENDING,
                'requested_at' => now(),
            ]);
        });

        return redirect()
            ->route('dashboard', ['section' => 'earnings'])
            ->with('status', 'Permintaan withdrawal berhasil diajukan.');
    }
}

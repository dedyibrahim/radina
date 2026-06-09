<?php

namespace App\Http\Controllers;

use App\Models\WriterWithdrawal;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class WithdrawalAdminController extends Controller
{
    public function update(Request $request, WriterWithdrawal $withdrawal): RedirectResponse
    {
        $payload = $request->validate([
            'status' => [
                'required',
                Rule::in([
                    WriterWithdrawal::STATUS_APPROVED,
                    WriterWithdrawal::STATUS_PAID,
                    WriterWithdrawal::STATUS_REJECTED,
                ]),
            ],
            'admin_note' => ['nullable', 'string', 'max:1000'],
        ]);

        if ($withdrawal->status === WriterWithdrawal::STATUS_PAID) {
            throw ValidationException::withMessages([
                'status' => 'Withdrawal yang sudah dibayar tidak dapat diubah.',
            ]);
        }

        if (
            $payload['status'] === WriterWithdrawal::STATUS_PAID
            && $withdrawal->status !== WriterWithdrawal::STATUS_APPROVED
        ) {
            throw ValidationException::withMessages([
                'status' => 'Withdrawal harus disetujui sebelum ditandai sudah dibayar.',
            ]);
        }

        $withdrawal->update([
            'status' => $payload['status'],
            'admin_note' => $payload['admin_note'] ?? null,
            'processed_by' => $request->user()->id,
            'processed_at' => now(),
        ]);

        return redirect()
            ->route('dashboard', ['section' => 'payments'])
            ->with('status', 'Status withdrawal berhasil diperbarui.');
    }
}

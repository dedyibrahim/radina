<x-app-layout>
    <x-slot name="header">
        <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
                <h2 class="text-xl font-bold leading-tight text-slate-800">Manajemen Lisensi</h2>
                <p class="text-sm text-slate-500">Halaman pembuatan, pembaruan, dan penghapusan lisensi online untuk operasional internal Radina News.</p>
            </div>
            <span class="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold tracking-wide text-sky-700">
                {{ now()->format('d M Y') }}
            </span>
        </div>
    </x-slot>

    <div class="py-8">
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            @if (session('status'))
                <div class="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                    {{ session('status') }}@if (session('new_license_key')) Key: <span class="font-mono">{{ session('new_license_key') }}</span>@endif
                </div>
            @endif

            @if (session('new_license_key'))
                <div class="mb-6 rounded-2xl border border-sky-200 bg-gradient-to-r from-sky-50 to-cyan-50 p-5 shadow-sm">
                    <div class="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <p class="text-sm font-semibold uppercase tracking-wide text-sky-700">Lisensi Baru Berhasil Dibuat</p>
                            <p class="mt-2 font-mono text-base font-bold text-slate-800">{{ session('new_license_key') }}</p>
                        </div>
                        <button
                            type="button"
                            class="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
                            onclick="navigator.clipboard.writeText('{{ session('new_license_key') }}')"
                        >
                            Copy Key
                        </button>
                    </div>
                </div>
            @endif

            <div class="grid gap-4 md:grid-cols-4">
                <div class="rounded-2xl border border-white/80 bg-gradient-to-br from-white to-slate-50 p-5 shadow-sm">
                    <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Total Lisensi</p>
                    <p class="mt-3 text-3xl font-bold text-slate-900">{{ $stats['total'] }}</p>
                </div>
                <div class="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-sm">
                    <p class="text-xs font-semibold uppercase tracking-wide text-emerald-700">Active</p>
                    <p class="mt-3 text-3xl font-bold text-emerald-700">{{ $stats['active'] }}</p>
                </div>
                <div class="rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm">
                    <p class="text-xs font-semibold uppercase tracking-wide text-amber-700">Expired</p>
                    <p class="mt-3 text-3xl font-bold text-amber-700">{{ $stats['expired'] }}</p>
                </div>
                <div class="rounded-2xl border border-rose-100 bg-gradient-to-br from-rose-50 to-white p-5 shadow-sm">
                    <p class="text-xs font-semibold uppercase tracking-wide text-rose-700">Revoked</p>
                    <p class="mt-3 text-3xl font-bold text-rose-700">{{ $stats['revoked'] }}</p>
                </div>
            </div>

            <div class="mt-6 grid gap-6 lg:grid-cols-12">
                @php
                    $isEditMode = isset($editLicense) && $editLicense;
                @endphp
                <div class="lg:col-span-4 rounded-2xl border border-white/80 bg-white/85 p-6 shadow-sm backdrop-blur">
                    <h3 class="text-lg font-bold text-slate-900">{{ $isEditMode ? 'Edit Lisensi' : 'Tambah Lisensi' }}</h3>
                    <p class="text-sm text-slate-500">
                        {{ $isEditMode ? 'Perbarui data lisensi yang dipilih.' : 'Isi data customer, lalu sistem otomatis generate key lisensi baru.' }}
                    </p>
                    @if ($isEditMode)
                        <p class="mt-2 rounded-xl bg-slate-100 px-3 py-2 text-xs text-slate-700">
                            Key: <span class="font-mono font-semibold">{{ $editLicense->key }}</span>
                        </p>
                    @endif

                    <form method="POST" action="{{ $isEditMode ? route('licenses.update', $editLicense) : route('licenses.store') }}" class="mt-5 space-y-4">
                        @csrf
                        @if ($isEditMode)
                            @method('PATCH')
                        @endif

                        <div>
                            <label class="mb-1 block text-sm font-semibold text-slate-700">Nama Customer</label>
                            <input name="customer_name" value="{{ old('customer_name', $isEditMode ? $editLicense->customer_name : '') }}" required class="w-full rounded-xl border-slate-200 bg-white text-slate-800 shadow-sm focus:border-sky-500 focus:ring-sky-500" placeholder="Contoh: PT Maju Jaya" />
                            @error('customer_name')
                                <p class="mt-1 text-sm text-rose-600">{{ $message }}</p>
                            @enderror
                        </div>

                        <div>
                            <label class="mb-1 block text-sm font-semibold text-slate-700">Nama Produk</label>
                            <input name="product_name" value="{{ old('product_name', $isEditMode ? $editLicense->product_name : config('license.product_name')) }}" required class="w-full rounded-xl border-slate-200 bg-white text-slate-800 shadow-sm focus:border-sky-500 focus:ring-sky-500" />
                            @error('product_name')
                                <p class="mt-1 text-sm text-rose-600">{{ $message }}</p>
                            @enderror
                        </div>

                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="mb-1 block text-sm font-semibold text-slate-700">Maks Aktivasi</label>
                                <input type="number" name="max_activations" min="1" max="1000" value="{{ old('max_activations', $isEditMode ? $editLicense->max_activations : 1) }}" required class="w-full rounded-xl border-slate-200 bg-white text-slate-800 shadow-sm focus:border-sky-500 focus:ring-sky-500" />
                                @error('max_activations')
                                    <p class="mt-1 text-sm text-rose-600">{{ $message }}</p>
                                @enderror
                            </div>
                            <div>
                                <label class="mb-1 block text-sm font-semibold text-slate-700">Expired At</label>
                                <input type="date" name="expires_at" value="{{ old('expires_at', $isEditMode && $editLicense->expires_at ? $editLicense->expires_at->format('Y-m-d') : '') }}" class="w-full rounded-xl border-slate-200 bg-white text-slate-800 shadow-sm focus:border-sky-500 focus:ring-sky-500" />
                                @error('expires_at')
                                    <p class="mt-1 text-sm text-rose-600">{{ $message }}</p>
                                @enderror
                            </div>
                        </div>

                        <div>
                            <label class="mb-1 block text-sm font-semibold text-slate-700">Notes</label>
                            <textarea name="notes" rows="3" class="w-full rounded-xl border-slate-200 bg-white text-slate-800 shadow-sm focus:border-sky-500 focus:ring-sky-500">{{ old('notes', $isEditMode ? $editLicense->notes : '') }}</textarea>
                            @error('notes')
                                <p class="mt-1 text-sm text-rose-600">{{ $message }}</p>
                            @enderror
                        </div>

                        <div class="flex gap-2">
                            <button type="submit" class="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-sky-700 hover:to-cyan-600">
                                {{ $isEditMode ? 'Simpan Perubahan' : 'Tambah Lisensi' }}
                            </button>
                            @if ($isEditMode)
                                <a href="{{ route('dashboard') }}" class="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                                    Batal
                                </a>
                            @endif
                        </div>
                    </form>
                </div>

                <div class="lg:col-span-8 rounded-2xl border border-white/80 bg-white/85 p-6 shadow-sm backdrop-blur">
                    <div class="mb-4 flex items-center justify-between">
                        <h3 class="text-lg font-bold text-slate-900">Daftar Lisensi</h3>
                        <p class="text-xs text-slate-500">API: <code class="rounded bg-slate-100 px-2 py-1 font-mono">POST /api/license/activate</code></p>
                    </div>

                    <div class="overflow-x-auto">
                        <table class="min-w-full text-left text-sm text-slate-700">
                            <thead class="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                                <tr>
                                    <th class="px-3 py-3">Key Lisensi</th>
                                    <th class="px-3 py-3">Customer</th>
                                    <th class="px-3 py-3">Status</th>
                                    <th class="px-3 py-3">Aktivasi</th>
                                    <th class="px-3 py-3">Expired</th>
                                    <th class="px-3 py-3">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                @forelse ($licenses as $license)
                                    @php
                                        $isExpired = $license->expires_at && $license->expires_at->isPast();
                                    @endphp
                                    <tr class="border-b border-slate-100">
                                        <td class="px-3 py-3">
                                            <div class="flex items-center gap-2">
                                                <span class="font-mono text-xs">{{ $license->key }}</span>
                                                <button
                                                    type="button"
                                                    onclick="navigator.clipboard.writeText('{{ $license->key }}')"
                                                    class="rounded-lg border border-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-100"
                                                >
                                                    Copy
                                                </button>
                                            </div>
                                        </td>
                                        <td class="px-3 py-3">
                                            <p class="font-medium text-slate-800">{{ $license->customer_name }}</p>
                                            <p class="text-xs text-slate-500">{{ $license->product_name }}</p>
                                        </td>
                                        <td class="px-3 py-3">
                                            @if ($isExpired)
                                                <span class="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700">Expired</span>
                                            @elseif ($license->status === 'active')
                                                <span class="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">Active</span>
                                            @else
                                                <span class="rounded-full bg-rose-100 px-2 py-1 text-xs font-semibold text-rose-700">Revoked</span>
                                            @endif
                                        </td>
                                        <td class="px-3 py-3 font-semibold text-slate-700">{{ $license->activations_count }} / {{ $license->max_activations }}</td>
                                        <td class="px-3 py-3">
                                            @if ($license->expires_at)
                                                <span class="{{ $isExpired ? 'text-rose-600' : 'text-slate-700' }}">
                                                    {{ $license->expires_at->format('Y-m-d') }}
                                                </span>
                                            @else
                                                <span class="text-slate-400">Never</span>
                                            @endif
                                        </td>
                                        <td class="px-3 py-3">
                                            <div class="flex flex-wrap gap-2">
                                                <form method="POST" action="{{ route('licenses.toggle-status', $license) }}">
                                                    @csrf
                                                    @method('PATCH')
                                                    <button type="submit" class="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-900">
                                                        {{ $license->status === 'active' ? 'Nonaktifkan' : 'Aktifkan' }}
                                                    </button>
                                                </form>
                                                <a href="{{ route('dashboard', array_filter(['edit' => $license->id, 'page' => request('page')])) }}" class="rounded-lg border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-700 transition hover:bg-sky-100">
                                                    Edit
                                                </a>
                                                <form method="POST" action="{{ route('licenses.destroy', $license) }}" onsubmit="return confirm('Hapus lisensi {{ $license->key }}? Tindakan ini tidak bisa dibatalkan.');">
                                                    @csrf
                                                    @method('DELETE')
                                                    <button type="submit" class="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100">
                                                        Hapus
                                                    </button>
                                                </form>
                                            </div>
                                        </td>
                                    </tr>
                                @empty
                                    <tr>
                                        <td colspan="6" class="px-3 py-8 text-center text-slate-400">Belum ada data lisensi.</td>
                                    </tr>
                                @endforelse
                            </tbody>
                        </table>
                    </div>

                    <div class="mt-5">
                        {{ $licenses->links() }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</x-app-layout>

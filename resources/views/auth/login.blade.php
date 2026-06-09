<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">
        <x-favicon />

        <title>Login Dashboard | Radina News</title>
        <meta name="robots" content="noindex,nofollow">

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600,700&display=swap" rel="stylesheet">

        @vite(['resources/css/app.css', 'resources/js/blade.js'])
    </head>
    <body class="bg-white font-sans text-slate-900 antialiased">
        <main class="grid min-h-screen lg:grid-cols-[minmax(0,1fr)_minmax(420px,560px)]">
            <section class="hidden bg-[#020617] p-12 text-white lg:flex lg:flex-col lg:justify-between">
                <a href="{{ route('news.home') }}" class="inline-flex items-center gap-4">
                    <img src="{{ asset('favicon-192x192.png') }}" alt="Radina News" class="h-20 w-20 rounded-xl bg-white object-contain">
                    <div>
                        <p class="text-2xl font-bold">Radina News</p>
                        <p class="mt-1 text-xs font-semibold uppercase tracking-[0.22em] text-blue-300">Portal Berita</p>
                    </div>
                </a>

                <div class="max-w-xl">
                    <p class="text-sm font-semibold uppercase tracking-[0.2em] text-blue-300">Panel Pengelola</p>
                    <h1 class="mt-5 !text-white text-5xl font-bold leading-tight">
                        Kelola berita dan operasional dalam satu tempat.
                    </h1>
                    <p class="mt-6 max-w-lg text-base font-medium leading-8 text-slate-200">
                        Masuk menggunakan akun pengelola untuk membuat berita, memverifikasi artikel, mengatur pembayaran penulis, dan mengelola lisensi aplikasi.
                    </p>
                </div>

                <p class="text-sm text-slate-400">&copy; {{ date('Y') }} Radina News</p>
            </section>

            <section class="flex min-h-screen items-center bg-white px-6 py-12 sm:px-12 lg:px-16">
                <div class="mx-auto w-full max-w-md">
                    <a href="{{ route('news.home') }}" class="mb-10 inline-flex items-center gap-3 lg:hidden">
                        <img src="{{ asset('favicon-192x192.png') }}" alt="Radina News" class="h-16 w-16 rounded-xl object-contain">
                        <span class="text-xl font-bold">Radina News</span>
                    </a>

                    <p class="text-sm font-bold uppercase tracking-[0.18em] text-blue-700">Login Dashboard</p>
                    <h2 class="mt-3 text-3xl font-bold tracking-tight text-slate-950">Masuk ke akun Anda</h2>
                    <p class="mt-3 text-sm font-medium leading-6 text-slate-600">Gunakan email dan password akun pengelola Radina News.</p>

                    @if (session('status'))
                        <div class="mt-6 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                            {{ session('status') }}
                        </div>
                    @endif

                    <form method="POST" action="{{ route('login') }}" class="mt-8 space-y-5">
                        @csrf

                        <div>
                            <label for="email" class="mb-2 block text-sm font-bold text-slate-800">Email</label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                value="{{ old('email') }}"
                                required
                                autofocus
                                autocomplete="username"
                                class="block w-full rounded-xl border-2 border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm placeholder:text-slate-500 hover:border-slate-400 focus:border-blue-700 focus:ring-2 focus:ring-blue-200"
                                placeholder="nama@email.com"
                            >
                            @error('email')
                                <p class="mt-2 text-sm text-rose-600">{{ $message }}</p>
                            @enderror
                        </div>

                        <div>
                            <div class="mb-2 flex items-center justify-between gap-4">
                                <label for="password" class="block text-sm font-bold text-slate-800">Password</label>
                                @if (Route::has('password.request'))
                                    <a href="{{ route('password.request') }}" class="text-xs font-bold text-blue-700 underline-offset-4 hover:text-blue-900 hover:underline">
                                        Lupa password?
                                    </a>
                                @endif
                            </div>
                            <input
                                id="password"
                                type="password"
                                name="password"
                                required
                                autocomplete="current-password"
                                class="block w-full rounded-xl border-2 border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm placeholder:text-slate-500 hover:border-slate-400 focus:border-blue-700 focus:ring-2 focus:ring-blue-200"
                                placeholder="Masukkan password"
                            >
                            @error('password')
                                <p class="mt-2 text-sm text-rose-600">{{ $message }}</p>
                            @enderror
                        </div>

                        <div>
                            <div class="mb-2 flex items-center justify-between gap-4">
                                <label for="captcha" class="block text-sm font-bold text-slate-800">Verifikasi keamanan</label>
                                <button
                                    type="button"
                                    onclick="window.location.reload()"
                                    class="text-xs font-bold text-blue-700 underline-offset-4 hover:text-blue-900 hover:underline"
                                >
                                    Ganti soal
                                </button>
                            </div>
                            <div class="grid grid-cols-[130px_minmax(0,1fr)] gap-3">
                                <div class="flex items-center justify-center rounded-xl border-2 border-blue-200 bg-blue-50 px-4 py-3 text-lg font-black tracking-wider text-blue-950" aria-label="Soal CAPTCHA">
                                    {{ $captchaQuestion }} = ?
                                </div>
                                <input
                                    id="captcha"
                                    type="number"
                                    name="captcha"
                                    required
                                    inputmode="numeric"
                                    autocomplete="off"
                                    class="block w-full rounded-xl border-2 border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm placeholder:text-slate-500 hover:border-slate-400 focus:border-blue-700 focus:ring-2 focus:ring-blue-200"
                                    placeholder="Jawaban"
                                >
                            </div>
                            @error('captcha')
                                <p class="mt-2 text-sm font-medium text-rose-600">{{ $message }}</p>
                            @enderror
                        </div>

                        <label for="remember_me" class="flex cursor-pointer items-center gap-3 text-sm font-medium text-slate-700">
                            <input id="remember_me" type="checkbox" name="remember" class="rounded border-2 border-slate-400 text-blue-700 focus:ring-blue-600">
                            Ingat saya
                        </label>

                        <button
                            type="submit"
                            class="w-full rounded-xl bg-blue-700 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-700/20 transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                        >
                            Masuk Dashboard
                        </button>
                    </form>

                    <a href="{{ route('news.home') }}" class="mt-8 inline-flex text-sm font-bold text-slate-600 transition hover:text-blue-700">
                        &larr; Kembali ke portal berita
                    </a>
                </div>
            </section>
        </main>
    </body>
</html>

<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">
        <x-favicon />
        <x-google-analytics />

        <title>{{ config('app.name', 'Radina News') }}</title>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

        <!-- Scripts -->
        @vite(['resources/css/app.css', 'resources/js/blade.js'])
    </head>
    <body class="font-sans text-gray-900 antialiased">
        <div class="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-100 via-sky-100 to-cyan-100 px-4 py-8 sm:pt-0">
            <div>
                <a href="/" class="flex flex-col items-center gap-2">
                    <x-application-logo class="h-20 w-20 rounded-2xl shadow-sm ring-1 ring-white/70" />
                    <span class="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">Radina News</span>
                </a>
            </div>

            <div class="mt-6 w-full overflow-hidden rounded-2xl border border-white/80 bg-white/90 px-6 py-5 shadow-lg backdrop-blur sm:max-w-md">
                {{ $slot }}
            </div>
        </div>
    </body>
</html>

<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <x-favicon />
        <x-google-analytics />
        <x-google-adsense />
        <title>Profil Radina News | Media Digital Indonesia</title>
        <meta name="description" content="Radina News menyajikan berita terkini dan laporan mendalam dari beragam sektor untuk pembaca Indonesia." />
        <meta name="keywords" content="Radina News, media digital Indonesia, berita terkini, portal berita" />
        <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" />
        <meta name="author" content="Radina News" />
        <link rel="canonical" href="{{ url()->current() }}" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Radina News" />
        <meta property="og:title" content="Profil Radina News" />
        <meta property="og:description" content="Informasi terkini, tepercaya, dan relevan untuk pembaca Indonesia." />
        <meta property="og:url" content="{{ url()->current() }}" />
        <meta property="og:image" content="{{ asset('images/radina-news-logo.png') }}" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Profil Radina News" />
        <meta name="twitter:description" content="Informasi terkini, tepercaya, dan relevan untuk pembaca Indonesia." />
        <meta name="twitter:image" content="{{ asset('images/radina-news-logo.png') }}" />

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=plus-jakarta-sans:400,500,600,700,800&display=swap" rel="stylesheet" />
        @vite(['resources/css/app.css', 'resources/js/blade.js'])

        @php
            $schema = [
                '@context' => 'https://schema.org',
                '@type' => 'NewsMediaOrganization',
                'name' => config('news.name'),
                'url' => url('/'),
                'logo' => asset('images/radina-news-logo.png'),
                'description' => config('news.description'),
                'telephone' => config('news.contact_phone'),
                'sameAs' => array_values(array_filter(config('news.socials'))),
            ];
        @endphp
        <script type="application/ld+json">{!! json_encode($schema, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) !!}</script>

        <style>
            body { font-family: "Plus Jakarta Sans", "Segoe UI", sans-serif; }
        </style>
    </head>
    <body class="bg-white text-slate-900 antialiased">
        <header class="border-b border-slate-200 bg-white">
            <div class="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 lg:px-10">
                <a href="{{ route('news.home') }}" class="flex items-center gap-3">
                    <img src="{{ asset('favicon-192x192.png') }}" alt="Radina News" class="h-14 w-14 object-contain">
                    <div>
                        <p class="text-xl font-extrabold">Radina News</p>
                        <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-700">Referensi Digital Indonesia</p>
                    </div>
                </a>
                <a href="{{ route('news.home') }}" class="rounded-full bg-blue-700 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-800">
                    Buka Portal
                </a>
            </div>
        </header>

        <main>
            <section class="relative overflow-hidden bg-slate-950 text-white">
                <div class="absolute -right-24 top-0 h-96 w-96 rounded-full bg-blue-600/25 blur-3xl"></div>
                <div class="relative mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-10 lg:py-28">
                    <div>
                        <p class="text-xs font-bold uppercase tracking-[0.22em] text-blue-300">Tentang Radina News</p>
                        <h1 class="mt-5 max-w-3xl text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
                            Informasi yang jernih untuk memahami dunia yang terus bergerak.
                        </h1>
                        <p class="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                            Radina News menyajikan berita terkini, laporan mendalam, dan perspektif yang relevan dari beragam sektor untuk pembaca Indonesia.
                        </p>
                    </div>
                    <div class="rounded-3xl border border-white/10 bg-white/5 p-7 backdrop-blur">
                        <img src="{{ asset('images/radina-news-logo.png') }}" alt="Radina News" class="w-full rounded-2xl bg-white object-contain">
                    </div>
                </div>
            </section>

            <section class="mx-auto max-w-7xl px-5 py-16 lg:px-10 lg:py-20">
                <div class="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
                    <div>
                        <p class="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">Komitmen Kami</p>
                        <h2 class="mt-3 text-3xl font-extrabold leading-tight text-slate-950 sm:text-4xl">
                            Berita yang relevan, mudah dipahami, dan bertanggung jawab.
                        </h2>
                    </div>
                    <p class="text-base leading-8 text-slate-600">
                        Kami percaya informasi yang baik harus memberikan konteks, bukan sekadar menyampaikan peristiwa.
                        Karena itu, setiap liputan diarahkan untuk membantu pembaca memahami perkembangan penting dan dampaknya dalam kehidupan sehari-hari.
                    </p>
                </div>

                <div class="mt-12 grid gap-5 md:grid-cols-3">
                    <article class="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                        <p class="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">01</p>
                        <h3 class="mt-4 text-xl font-bold">Tepercaya</h3>
                        <p class="mt-3 text-sm leading-7 text-slate-600">Mengutamakan ketepatan informasi, sumber yang jelas, dan penyajian yang bertanggung jawab.</p>
                    </article>
                    <article class="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                        <p class="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">02</p>
                        <h3 class="mt-4 text-xl font-bold">Relevan</h3>
                        <p class="mt-3 text-sm leading-7 text-slate-600">Mengangkat perkembangan yang berdampak pada masyarakat, bisnis, teknologi, dan gaya hidup.</p>
                    </article>
                    <article class="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                        <p class="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">03</p>
                        <h3 class="mt-4 text-xl font-bold">Jernih</h3>
                        <p class="mt-3 text-sm leading-7 text-slate-600">Menggunakan bahasa yang lugas agar informasi penting dapat dipahami dengan cepat.</p>
                    </article>
                </div>
            </section>

            <section class="bg-blue-50">
                <div class="mx-auto grid max-w-7xl gap-10 px-5 py-16 lg:grid-cols-[1fr_0.9fr] lg:items-center lg:px-10">
                    <div>
                        <p class="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">Fokus Liputan</p>
                        <h2 class="mt-3 text-3xl font-extrabold text-slate-950">Beragam topik dalam satu sumber informasi.</h2>
                        <p class="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
                            Radina News meliput teknologi, bisnis, startup, data, infrastruktur, gaya hidup, dan topik lain yang berkembang di tengah masyarakat.
                        </p>
                    </div>
                    <div class="flex flex-wrap gap-3">
                        @foreach (['Teknologi', 'Bisnis', 'Startup', 'Data & AI', 'Infrastruktur', 'Gaya Hidup'] as $topic)
                            <span class="rounded-full border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">{{ $topic }}</span>
                        @endforeach
                    </div>
                </div>
            </section>

            <section class="mx-auto max-w-7xl px-5 py-16 lg:px-10">
                <div class="rounded-3xl bg-gradient-to-r from-slate-950 to-blue-900 px-6 py-10 text-white sm:px-10">
                    <div class="flex flex-col gap-7 md:flex-row md:items-center md:justify-between">
                        <div>
                            <p class="text-xs font-bold uppercase tracking-[0.2em] text-blue-300">Tetap Terhubung</p>
                            <h2 class="mt-3 text-3xl font-extrabold">Ikuti perkembangan terbaru bersama Radina News.</h2>
                            <p class="mt-3 text-sm text-slate-300">{{ config('news.contact_phone') }} · {{ config('news.address') }}</p>
                        </div>
                        <a href="{{ route('news.home') }}" class="shrink-0 rounded-full bg-white px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-blue-50">
                            Baca Berita
                        </a>
                    </div>
                </div>
            </section>
        </main>

        <footer class="border-t border-slate-200 bg-white">
            <div class="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between lg:px-10">
                <p>&copy; {{ now()->year }} Radina News. Seluruh hak cipta dilindungi.</p>
                <p>Informasi terkini untuk pembaca Indonesia.</p>
            </div>
        </footer>
    </body>
</html>

<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    @php
        $initialSeo = $page['props']['seo'] ?? [];
        $siteName = config('news.name', config('app.name', 'Radina News'));
        $initialTitle = $initialSeo['title'] ?? $siteName;
        $initialDescription = $initialSeo['description'] ?? config('news.description');
        $initialUrl = $initialSeo['url'] ?? url()->current();
        $initialImage = $initialSeo['image'] ?? url(config('news.default_image'));
        $initialRobots = $initialSeo['robots'] ?? 'index,follow';
        $initialType = $initialSeo['type'] ?? 'website';
    @endphp
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">
        <x-favicon />
        <x-google-analytics />
        <x-google-adsense />

        <title data-inertia="">{{ $initialTitle }}{{ $initialTitle !== $siteName ? " | {$siteName}" : '' }}</title>
        <meta data-inertia="description" name="description" content="{{ $initialDescription }}">
        <meta data-inertia="robots" name="robots" content="{{ $initialRobots }}">
        @if (! empty($initialSeo['keywords']))
            <meta data-inertia="keywords" name="keywords" content="{{ $initialSeo['keywords'] }}">
        @endif
        <link data-inertia="canonical" rel="canonical" href="{{ $initialUrl }}">
        <meta data-inertia="og-site-name" property="og:site_name" content="{{ $siteName }}">
        <meta data-inertia="og-title" property="og:title" content="{{ $initialTitle }}">
        <meta data-inertia="og-description" property="og:description" content="{{ $initialDescription }}">
        <meta data-inertia="og-type" property="og:type" content="{{ $initialType }}">
        <meta data-inertia="og-url" property="og:url" content="{{ $initialUrl }}">
        <meta data-inertia="og-image" property="og:image" content="{{ $initialImage }}">
        <meta data-inertia="twitter-card" name="twitter:card" content="summary_large_image">
        <meta data-inertia="twitter-title" name="twitter:title" content="{{ $initialTitle }}">
        <meta data-inertia="twitter-description" name="twitter:description" content="{{ $initialDescription }}">
        <meta data-inertia="twitter-image" name="twitter:image" content="{{ $initialImage }}">
        @if (! empty($initialSeo['publishedAt']))
            <meta data-inertia="article-published-at" property="article:published_time" content="{{ $initialSeo['publishedAt'] }}">
        @endif
        @if (! empty($initialSeo['updatedAt']))
            <meta data-inertia="article-updated-at" property="article:modified_time" content="{{ $initialSeo['updatedAt'] }}">
        @endif
        @foreach (($initialSeo['jsonLd'] ?? []) as $schemaIndex => $schema)
            <script data-inertia="schema-{{ $schemaIndex }}" type="application/ld+json">@json($schema, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)</script>
        @endforeach

        @vite(['resources/css/app.css', 'resources/js/app.js', "resources/js/Pages/{$page['component']}.vue"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>

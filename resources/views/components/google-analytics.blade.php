@if (config('services.google_analytics.enabled') && config('services.google_analytics.measurement_id'))
    <meta name="google-analytics-id" content="{{ config('services.google_analytics.measurement_id') }}">
    <script async src="https://www.googletagmanager.com/gtag/js?id={{ config('services.google_analytics.measurement_id') }}"></script>
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', @json(config('services.google_analytics.measurement_id')));
    </script>
@endif

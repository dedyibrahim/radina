@if (config('services.google_adsense.enabled') && config('services.google_adsense.client_id'))
    <script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client={{ config('services.google_adsense.client_id') }}"
        crossorigin="anonymous"
    ></script>
@endif

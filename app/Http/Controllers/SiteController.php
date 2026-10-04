<?php

namespace App\Http\Controllers;

use App\Models\Template;
use App\Models\Wedding;
use App\Services\PlatformSettings;
use App\Services\TemplateCatalog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SiteController extends Controller
{
    public function index(Request $request, PlatformSettings $settings)
    {
        $known = preg_match('~^(?:/|/buket|/pelanggan/[a-f0-9]{64}(?:/preview)?|/tamu/[a-f0-9-]{36}|/templates(?:/[^/]+(?:/preview)?)?|/order/(?:success/)?[^/]+|/check-order|/admin(?:/.*)?|/preview/wedding/[^/]+)$~', '/'.$request->path()) || $request->path() === '/';
        $metadata = $settings->all();
        if ($request->is('buket')) {
            $metadata['seo_title'] = 'Buket Custom Mulai Rp100.000 | Radina';
            $metadata['seo_description'] = 'Buket untuk wisuda, ulang tahun, dan momen istimewa. Mulai Rp100.000, bisa custom. Pesan melalui WhatsApp 081289903664.';
            $metadata['seo_image'] = '/images/bouquets/buket-05.jpg';
        }
        $response = $this->html($metadata, null, $known ? 200 : 404);
        if ($request->is('pelanggan/*', 'tamu/*')) {
            $response->header('Cache-Control', 'private, no-store')->header('Referrer-Policy', 'no-referrer')->header('X-Robots-Tag', 'noindex, nofollow');
        }

        return $response;
    }

    public function retired(PlatformSettings $settings)
    {
        return $this->html($settings->all(), null, 410);
    }

    public function sitemap()
    {
        $urls = [url('/'), url('/templates'), url('/buket')];
        foreach (Template::where('status', 'ACTIVE')->pluck('slug') as $slug) {
            $urls[] = url('/templates/'.$slug);
        }
        foreach (Wedding::where('is_demo', false)->where(fn ($q) => $q->whereNull('expires_at')->orWhere('expires_at', '>', now()))->where('status', 'PUBLISHED')->whereHas('order', fn ($q) => $q->where('status', 'PUBLISHED')->whereHas('payment', fn ($p) => $p->where('status', 'PAID')))->pluck('slug') as $slug) {
            $urls[] = url('/w/'.$slug);
        }
        $xml = '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
        foreach ($urls as $url) {
            $xml .= '<url><loc>'.htmlspecialchars($url, ENT_XML1 | ENT_QUOTES, 'UTF-8').'</loc></url>';
        }

        return response($xml.'</urlset>')->header('Content-Type', 'application/xml');
    }

    public function robots()
    {
        return response("User-agent: *\nDisallow: /admin\nDisallow: /api\nDisallow: /preview\nDisallow: /order\nDisallow: /check-order\nDisallow: /pelanggan\nDisallow: /tamu\nSitemap: ".url('/sitemap.xml')."\n")->header('Content-Type', 'text/plain');
    }

    public function wedding(Request $request, string $slug, PlatformSettings $settings)
    {
        $w = Wedding::where('slug', $slug)->where('status', 'PUBLISHED')->whereHas('order', fn ($q) => $q->where('status', 'PUBLISHED')->whereHas('payment', fn ($p) => $p->where('status', 'PAID')))->first();
        if (! $w) {
            return $this->html($settings->all(), null, 404);
        }

        if ($w->expires_at?->isPast()) {
            return $this->html($settings->all(), null, 410);
        }

        return $this->html($settings->all(), $w);
    }

    private function html(array $settings, ?Wedding $w = null, int $status = 200)
    {
        $path = base_path('frontend/dist/index.html');
        if (! file_exists($path)) {
            return response('Build frontend with npm run build, or use the Vite development server.', 503);
        }
        $html = file_get_contents($path);
        $title = $w?->title ?? $settings['seo_title'] ?? $settings['company_name'] ?? 'Wedding Invitation';
        $description = $w ? ($w->wedding_date?->format('d F Y').' — '.$w->opening_text) : ($settings['seo_description'] ?? '');
        $image = $w?->cover_image ?? ($settings['seo_image'] ?? '');
        if (str_starts_with($image, '/')) {
            $image = rtrim(config('app.url'), '/').$image;
        }
        $html = preg_replace_callback('#<title>.*?</title>#s', fn () => '<title>'.e($title).'</title>', $html);
        foreach (['description' => $description, 'og:title' => $title, 'og:description' => $description, 'og:image' => $image] as $name => $value) {
            $attribute = str_starts_with($name, 'og:') ? 'property' : 'name';
            $tag = '<meta '.$attribute.'="'.$name.'" content="'.e($value).'" />';
            $pattern = '#<meta '.$attribute.'="'.preg_quote($name, '#').'"[^>]*>#';
            if (preg_match($pattern, $html)) {
                $html = preg_replace_callback($pattern, fn () => $tag, $html);
            } else {
                $html = str_replace('</head>', $tag.'</head>', $html);
            }
        }
        $html = str_replace('</head>', '<link rel="canonical" href="'.e($w ? url('/w/'.$w->slug) : request()->url()).'" /></head>', $html);
        if ($status >= 400 || request()->is('admin*', 'pelanggan/*', 'tamu/*', 'preview/*', 'order/*', 'check-order')) {
            $html = str_replace('</head>', '<meta name="robots" content="noindex,nofollow" /></head>', $html);
        }

        $analyticsId = config('services.google_analytics.measurement_id');
        if ($status === 200 && config('services.google_analytics.enabled') && is_string($analyticsId) && preg_match('/^G-[A-Z0-9]+$/D', $analyticsId)) {
            // The Vue router loads the tag only on public marketing pages.
            $analytics = json_encode(['id' => $analyticsId, 'templates' => TemplateCatalog::KEYS], JSON_THROW_ON_ERROR);
            $html = str_replace('</head>', '<meta name="radina-google-analytics" content="'.e($analytics).'" /></head>', $html);
        }

        return response($html, $status)->header('Content-Type', 'text/html; charset=UTF-8')->header('X-Content-Type-Options', 'nosniff');
    }

    public function brand(string $file)
    {
        return $this->publicSvg('brand', $file);
    }

    public function thumbnail(string $file)
    {
        return $this->publicSvg('images/templates', $file);
    }

    private function publicSvg(string $directory, string $file)
    {
        abort_unless(preg_match('/^[a-z0-9-]+\.svg$/', $file), 404);
        $path = base_path('frontend/public/'.$directory.'/'.$file);
        abort_unless(is_file($path), 404);

        return response()->file($path, ['Content-Type' => 'image/svg+xml', 'Cache-Control' => 'public, max-age=3600', 'X-Content-Type-Options' => 'nosniff']);
    }

    public function asset(string $file)
    {
        abort_unless(preg_match('/^[a-zA-Z0-9_\-.]+\.(js|css|woff2|svg)$/', $file), 404);
        $path = base_path('frontend/dist/assets/'.$file);
        abort_unless(is_file($path), 404);
        $type = match (pathinfo($file, PATHINFO_EXTENSION)) {
            'js' => 'application/javascript','css' => 'text/css','woff2' => 'font/woff2',default => 'image/svg+xml'
        };

        return response()->file($path, ['Content-Type' => $type, 'Cache-Control' => 'public, max-age=31536000, immutable', 'X-Content-Type-Options' => 'nosniff']);
    }

    public function bouquetImage(string $file)
    {
        abort_unless(preg_match('/^buket-[0-9]{2}\.jpg$/', $file), 404);
        $path = base_path('frontend/public/images/bouquets/'.$file);
        abort_unless(is_file($path), 404);

        return response()->file($path, ['Content-Type' => 'image/jpeg', 'Cache-Control' => 'public, max-age=86400', 'X-Content-Type-Options' => 'nosniff']);
    }

    public function media(string $file)
    {
        // Shared hosting need not support symlinks to serve the public media disk.
        abort_unless(preg_match('~^[a-zA-Z0-9/_\-.]+\.(?:webp|jpg|jpeg|png|gif|avif|svg|mp3|wav|ogg|mp4)$~i', $file) && ! str_contains($file, '..'), 404);
        $root = realpath(Storage::disk('public')->path(''));
        $path = realpath(Storage::disk('public')->path($file));
        abort_unless($root && $path && str_starts_with($path, $root.DIRECTORY_SEPARATOR) && is_file($path), 404);

        return response()->file($path, ['Cache-Control' => 'public, max-age=3600', 'X-Content-Type-Options' => 'nosniff']);
    }
}

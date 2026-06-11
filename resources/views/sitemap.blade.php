<?xml version="1.0" encoding="UTF-8"?>
<urlset
    xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
    xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
>
@foreach ($urls as $item)
    <url>
        <loc>{{ $item['loc'] }}</loc>
        <lastmod>{{ $item['lastmod'] }}</lastmod>
        <changefreq>{{ $item['changefreq'] }}</changefreq>
        <priority>{{ $item['priority'] }}</priority>
@foreach ($item['images'] ?? [] as $image)
        <image:image>
            <image:loc>{{ $image }}</image:loc>
        </image:image>
@endforeach
    </url>
@endforeach
</urlset>

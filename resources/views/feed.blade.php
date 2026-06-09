<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
    <channel>
        <title><![CDATA[{{ $siteName }}]]></title>
        <link>{{ route('news.home') }}</link>
        <description><![CDATA[{{ $siteDescription }}]]></description>
        <language>id-ID</language>
        @foreach ($articles as $article)
            <item>
                <title><![CDATA[{{ $article->title }}]]></title>
                <link>{{ route('news.show', $article) }}</link>
                <guid>{{ route('news.show', $article) }}</guid>
                <pubDate>{{ optional($article->published_at)->toRssString() }}</pubDate>
                <description><![CDATA[{{ $article->excerpt }}]]></description>
            </item>
        @endforeach
    </channel>
</rss>

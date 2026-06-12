<?php

return [
    'name' => env('NEWS_SITE_NAME', 'Radina News'),
    'tagline' => env('NEWS_SITE_TAGLINE', 'Referensi Digital Indonesia'),
    'description' => env('NEWS_SITE_DESCRIPTION', 'Radina News menyajikan berita terkini, laporan mendalam, dan informasi relevan dari Indonesia maupun dunia.'),
    'base_url' => env('APP_URL', 'http://localhost'),
    'contact_phone' => env('NEWS_CONTACT_PHONE', '877-2417-0145'),
    'address' => env('NEWS_ADDRESS', 'Jakarta, Indonesia'),
    'socials' => [
        'instagram' => env('NEWS_INSTAGRAM', 'https://instagram.com/radina.net'),
        'linkedin' => env('NEWS_LINKEDIN', 'https://linkedin.com/company/radina-net'),
        'youtube' => env('NEWS_YOUTUBE', 'https://youtube.com/@radinanet'),
        'x' => env('NEWS_X', 'https://x.com/radinanet'),
    ],
    'default_image' => env('NEWS_DEFAULT_IMAGE', '/images/radina-news-logo.png'),
    'social_image' => env('NEWS_SOCIAL_IMAGE', '/images/radina-news-social.jpg'),
];

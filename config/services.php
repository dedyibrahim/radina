<?php

return [

    'google_analytics' => [
        'measurement_id' => env('GOOGLE_ANALYTICS_ID', 'G-7BZHBM3W8L'),
        'enabled' => env('GOOGLE_ANALYTICS_ENABLED', env('APP_ENV') === 'production'),
    ],

    'google_adsense' => [
        'client_id' => env('GOOGLE_ADSENSE_CLIENT_ID', 'ca-pub-4867094357641504'),
        'enabled' => env('GOOGLE_ADSENSE_ENABLED', env('APP_ENV') === 'production'),
    ],

    'google_publisher_center' => [
        'product_id' => env('GOOGLE_PUBLISHER_CENTER_PRODUCT_ID', 'CAow7_rGDA:openaccess'),
        'language' => env('GOOGLE_PUBLISHER_CENTER_LANGUAGE', 'id'),
        'enabled' => env('GOOGLE_PUBLISHER_CENTER_ENABLED', env('APP_ENV') === 'production'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'mailgun' => [
        'domain' => env('MAILGUN_DOMAIN'),
        'secret' => env('MAILGUN_SECRET'),
        'endpoint' => env('MAILGUN_ENDPOINT', 'api.mailgun.net'),
        'scheme' => 'https',
    ],

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

];

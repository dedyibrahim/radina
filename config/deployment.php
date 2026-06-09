<?php

return [
    'hook_enabled' => env('DEPLOY_HOOK_ENABLED', false),
    'hook_secret' => env('DEPLOY_HOOK_SECRET'),
    'signature_ttl' => (int) env('DEPLOY_HOOK_SIGNATURE_TTL', 300),
];


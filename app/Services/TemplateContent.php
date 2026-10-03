<?php

namespace App\Services;

class TemplateContent
{
    public static function preset(?string $key): array
    {
        $presets = json_decode(file_get_contents(config_path('template-presets.json')), true, 512, JSON_THROW_ON_ERROR);

        return $presets[$key ?? 'romantic-floral'] ?? $presets['romantic-floral'];
    }

    public static function initial(?string $key): array
    {
        $preset = self::preset($key);

        return ['opening_text' => $preset['opening_text'], 'section_content' => $preset['sections'],
            'closing_text' => $preset['closing_text'], 'quote' => $preset['quote'], 'quote_source' => $preset['quote_source']];
        // section_order remains null until an admin explicitly reorders it; changing templates adopts its recommended order.
    }
}

<?php

namespace App\Services;

class TemplateContent
{
    public static function preset(?string $key): array
    {
        $presets = json_decode(file_get_contents(config_path('template-presets.json')), true, 512, JSON_THROW_ON_ERROR);
        $floral = json_decode(file_get_contents(config_path('floral-presets.json')), true, 512, JSON_THROW_ON_ERROR);

        return $floral[$key ?? ''] ?? $presets[$key ?? 'romantic-floral'] ?? $presets['romantic-floral'];
    }

    public static function initial(?string $key): array
    {
        $preset = self::preset($key);

        return ['opening_text' => $preset['opening_text'], 'section_content' => $preset['sections'],
            'closing_text' => $preset['closing_text'], 'quote' => $preset['quote'], 'quote_source' => $preset['quote_source']];
        // section_order remains null until an admin explicitly reorders it; changing templates adopts its recommended order.
    }

    public static function animations(?string $key): array
    {
        $labels = json_decode(file_get_contents(config_path('motion-effects.json')), true, 512, JSON_THROW_ON_ERROR);
        $effects = self::preset($key)['motion'] ?? ['sparkles'];

        return ['effects' => $effects, 'labels' => array_map(fn ($effect) => $labels[$effect], $effects)];
    }
}

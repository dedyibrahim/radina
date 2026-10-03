<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class SafeMediaUrl implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (preg_match('#^/(storage|images|music|video|brand)/[a-zA-Z0-9/_%.\-]+$#', $value) && ! str_contains(rawurldecode($value), '..')) {
            return;
        }
        if (filter_var($value, FILTER_VALIDATE_URL) && in_array(strtolower(parse_url($value, PHP_URL_SCHEME) ?? ''), ['http', 'https'], true)) {
            return;
        }
        $fail('Gunakan URL http/https atau file media yang diunggah.');
    }
}

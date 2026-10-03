<?php

namespace App\Support;

use Illuminate\Contracts\Session\Session;

class LoginCaptcha
{
    public const SESSION_KEY = 'login_captcha_answer';
    public const EXPIRES_KEY = 'login_captcha_expires_at';

    public static function generate(Session $session): string
    {
        $firstNumber = random_int(2, 9);
        $secondNumber = random_int(1, 9);

        $session->put(self::SESSION_KEY, $firstNumber + $secondNumber);
        $session->put(self::EXPIRES_KEY, now()->addMinutes(5)->timestamp);

        return "{$firstNumber} + {$secondNumber}";
    }

    public static function matches(Session $session, mixed $answer): bool
    {
        $expectedAnswer = $session->pull(self::SESSION_KEY);
        $expiresAt = $session->pull(self::EXPIRES_KEY);

        if ($expectedAnswer === null || $expiresAt === null || now()->timestamp >= $expiresAt || ! is_numeric($answer)) {
            return false;
        }

        return hash_equals((string) $expectedAnswer, (string) $answer);
    }
}

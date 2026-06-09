<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Model;

class License extends Model
{
    use HasFactory;

    public const STATUS_ACTIVE = 'active';
    public const STATUS_REVOKED = 'revoked';

    protected $fillable = [
        'key',
        'customer_name',
        'product_name',
        'status',
        'max_activations',
        'expires_at',
        'last_activated_at',
        'notes',
    ];

    protected $casts = [
        'expires_at' => 'date',
        'last_activated_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::creating(function (License $license): void {
            if (!$license->key) {
                $license->key = self::generateKey();
            }
        });
    }

    public static function generateKey(): string
    {
        $alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        $compact = '';
        for ($i = 0; $i < 25; $i++) {
            $compact .= $alphabet[random_int(0, strlen($alphabet) - 1)];
        }
        $chunks = [];
        for ($i = 0; $i < strlen($compact); $i += 5) {
            $chunks[] = substr($compact, $i, 5);
        }

        return implode('-', $chunks);
    }

    public function activations(): HasMany
    {
        return $this->hasMany(LicenseActivation::class);
    }

    public function isExpired(): bool
    {
        return $this->expires_at !== null && $this->expires_at->isPast();
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WeddingInvitee extends Model
{
    protected $fillable = ['wedding_id', 'token', 'name', 'address', 'fingerprint', 'whatsapp', 'short_code'];

    protected $hidden = ['fingerprint'];

    protected static function booted(): void
    {
        static::creating(function ($guest) {
            $guest->short_code ??= self::newShortCode();
        });
    }

    public static function newShortCode(): string
    {
        do {
            $code = bin2hex(random_bytes(8));
        } while (self::where('short_code', $code)->exists());

        return $code;
    }

    public function invitationUrl(?Wedding $wedding = null): string
    {
        if ($this->short_code) {
            return url('/i/'.$this->short_code);
        }
        $wedding ??= Wedding::findOrFail($this->wedding_id);

        return url('/w/'.$wedding->slug).'?'.http_build_query(['to' => $this->name, 'guest' => $this->token], '', '&', PHP_QUERY_RFC3986);
    }
}

<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    public const ROLE_ADMIN = 'admin';
    public const ROLE_WRITER = 'writer';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'role',
        'article_fee',
        'bank_name',
        'bank_account_number',
        'bank_account_holder',
        'password',
        'email_verified_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'article_fee' => 'integer',
        'password' => 'hashed',
    ];

    public function newsArticles(): HasMany
    {
        return $this->hasMany(NewsArticle::class, 'user_id');
    }

    public function writerEarnings(): HasMany
    {
        return $this->hasMany(WriterEarning::class);
    }

    public function writerWithdrawals(): HasMany
    {
        return $this->hasMany(WriterWithdrawal::class);
    }

    public function articleFee(): int
    {
        return $this->article_fee ?? (int) config('writer_payments.default_article_fee');
    }

    public function totalEarnings(): int
    {
        return (int) $this->writerEarnings()->sum('amount');
    }

    public function reservedWithdrawals(): int
    {
        return (int) $this->writerWithdrawals()->reserved()->sum('amount');
    }

    public function availableBalance(): int
    {
        return max(0, $this->totalEarnings() - $this->reservedWithdrawals());
    }

    public function hasBankAccount(): bool
    {
        return filled($this->bank_name)
            && filled($this->bank_account_number)
            && filled($this->bank_account_holder);
    }

    public function isAdmin(): bool
    {
        return $this->role === self::ROLE_ADMIN;
    }

    public function isWriter(): bool
    {
        return $this->role === self::ROLE_WRITER;
    }
}

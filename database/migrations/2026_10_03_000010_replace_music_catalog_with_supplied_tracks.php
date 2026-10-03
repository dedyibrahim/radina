<?php

use App\Services\MusicCatalogService;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        app(MusicCatalogService::class)->replace();
    }

    public function down(): void
    {
        // Restore the encrypted music-catalog backup explicitly if a rollback is needed.
        // Do not erase subsequent music edits or reinstate old tracks automatically.
    }
};

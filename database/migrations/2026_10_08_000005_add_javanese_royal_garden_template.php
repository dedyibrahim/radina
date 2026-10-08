<?php

use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        // Only missing approved templates are inserted; existing rows remain intact.
        (require __DIR__.'/2026_10_08_000002_add_cinematic_world_templates.php')->up();
    }

    public function down(): void
    {
        // Keep purchased invitation and order references intact.
    }
};

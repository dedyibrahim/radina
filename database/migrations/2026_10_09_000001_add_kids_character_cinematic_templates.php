<?php

use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        // Insert only missing catalog entries; keep custom prices, licenses and customer content.
        (require __DIR__.'/2026_10_08_000002_add_cinematic_world_templates.php')->up();
    }

    public function down(): void
    {
        // Keep templates that may already be referenced by purchased invitations.
    }
};

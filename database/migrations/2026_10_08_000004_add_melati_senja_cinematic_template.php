<?php

use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        // The existing additive catalog migration inserts only missing approved worlds.
        // It never updates customer content, licenses or administrator pricing.
        (require __DIR__.'/2026_10_08_000002_add_cinematic_world_templates.php')->up();
    }

    public function down(): void
    {
        // A purchased template must keep its order and invitation references.
    }
};

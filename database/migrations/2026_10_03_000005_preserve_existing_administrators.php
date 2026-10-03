<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        foreach (DB::table('users')->where('role', 'admin')->pluck('id') as $id) {
            DB::table('admins')->insertOrIgnore(['user_id' => $id, 'active' => true, 'created_at' => now(), 'updated_at' => now()]);
        }
    }

    public function down(): void
    {
        // Existing account access is not revoked during a rollback.
    }
};

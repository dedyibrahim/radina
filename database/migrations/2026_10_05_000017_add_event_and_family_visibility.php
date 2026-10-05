<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('wedding_events', function (Blueprint $table) {
            $table->boolean('is_visible')->default(true);
            // Null supports older clients that used the first event as the map location.
            $table->boolean('show_on_map')->nullable();
        });
        DB::table('wedding_events')->select('wedding_id')->distinct()->orderBy('wedding_id')->chunk(500, function ($weddings) {
            foreach ($weddings as $wedding) {
                $first = DB::table('wedding_events')->where('wedding_id', $wedding->wedding_id)->orderBy('sort_order')->orderBy('id')->value('id');
                DB::table('wedding_events')->where('wedding_id', $wedding->wedding_id)->update(['show_on_map' => false]);
                DB::table('wedding_events')->where('id', $first)->update(['show_on_map' => true]);
            }
        });
        Schema::table('wedding_settings', fn (Blueprint $table) => $table->boolean('enable_family')->default(true));
        // Keep the existing family display until its new independent switch is changed.
        DB::table('wedding_settings')->where('enable_parents', false)->update(['enable_family' => false]);
    }

    public function down(): void
    {
        Schema::table('wedding_events', fn (Blueprint $table) => $table->dropColumn(['is_visible', 'show_on_map']));
        Schema::table('wedding_settings', fn (Blueprint $table) => $table->dropColumn('enable_family'));
    }
};

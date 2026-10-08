<?php

use App\Services\TemplateCatalog;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::transaction(function () {
            foreach (DB::table('templates')->whereIn('template_key', TemplateCatalog::retiredKeys())->lockForUpdate()->get() as $template) {
                $used = DB::table('orders')->where('template_id', $template->id)->exists()
                    || DB::table('weddings')->where('template_id', $template->id)->exists();
                if ($used) {
                    DB::table('templates')->where('id', $template->id)->update(['status' => 'DISABLED']);
                } else {
                    DB::table('templates')->where('id', $template->id)->delete();
                }
            }
            foreach (TemplateCatalog::availableWorlds() as $key => $world) {
                // Replace shipped placeholders; preserve any administrator-uploaded preview.
                DB::table('templates')->where('template_key', $key)
                    ->where('thumbnail', '/images/templates/cinematic-worlds/'.$key.'.svg')
                    ->update(['thumbnail' => $world['thumbnail']]);
                DB::table('templates')->where('template_key', $key)
                    ->where('preview_image', '/images/templates/cinematic-worlds/'.$key.'.svg')
                    ->update(['preview_image' => $world['thumbnail']]);
            }
        });
    }

    public function down(): void
    {
        // Keep customer references and administrator edits intact.
    }
};

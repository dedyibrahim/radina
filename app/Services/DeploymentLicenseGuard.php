<?php

namespace App\Services;

use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use RuntimeException;

class DeploymentLicenseGuard
{
    private const LIVE_FIELDS = [
        'licenses' => ['updated_at', 'last_activated_at'],
        'license_activations' => ['updated_at', 'last_seen_at', 'app_version', 'ip_address', 'user_agent'],
        'users' => ['updated_at'],
    ];

    public function backup(string $commit): array
    {
        if (! preg_match('/^[a-f0-9]{40}$/i', $commit)) {
            throw new RuntimeException('Invalid deployment commit.');
        }
        $snapshot = [];
        foreach (self::LIVE_FIELDS as $table => $ignored) {
            if (Schema::hasTable($table)) {
                $snapshot[$table] = DB::table($table)->orderBy('id')->get()->map(fn ($row) => (array) $row)->all();
            }
        }
        // This disk is private and outside storage/app/public. Encrypt keys and account data.
        $path = 'deploy-backups/'.gmdate('Ymd-His').'-'.$commit.'-'.bin2hex(random_bytes(4)).'.encrypted';
        $contents = Crypt::encryptString(json_encode(['commit' => $commit, 'tables' => $snapshot], JSON_THROW_ON_ERROR));
        $disk = Storage::build(['driver' => 'local', 'root' => storage_path('app'), 'throw' => true]);
        if (! $disk->put($path, $contents) || ! hash_equals(hash('sha256', $contents), hash('sha256', $disk->get($path)))) {
            throw new RuntimeException('License backup could not be verified; deployment stopped.');
        }
        return $snapshot;
    }

    public function assertPreserved(array $snapshot): void
    {
        foreach ($snapshot as $table => $rows) {
            if (! array_key_exists($table, self::LIVE_FIELDS) || ! Schema::hasTable($table)) {
                throw new RuntimeException('A protected database table is missing; deployment stopped.');
            }
            $columns = Schema::getColumnListing($table);
            foreach ($rows as $before) {
                $after = DB::table($table)->where('id', $before['id'])->first();
                if (! $after) {
                    throw new RuntimeException('A protected database record was removed; deployment stopped.');
                }
                $after = (array) $after;
                foreach ($before as $column => $value) {
                    if (! in_array($column, $columns, true)) {
                        throw new RuntimeException('A protected database column was removed; deployment stopped.');
                    }
                    if (! in_array($column, self::LIVE_FIELDS[$table], true) && $value !== ($after[$column] ?? null)) {
                        throw new RuntimeException('Protected license or account data changed; deployment stopped.');
                    }
                }
            }
        }
    }
}

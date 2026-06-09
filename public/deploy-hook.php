<?php

declare(strict_types=1);

use Dotenv\Dotenv;
use Illuminate\Contracts\Console\Kernel;

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, private');

function respond(int $status, array $payload): never
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_SLASHES);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    respond(405, ['message' => 'Method not allowed.']);
}

$applicationRoot = is_dir(__DIR__.'/_app')
    ? __DIR__.'/_app'
    : dirname(__DIR__);

$autoload = $applicationRoot.'/vendor/autoload.php';
$environmentFile = $applicationRoot.'/.env';

if (! is_file($autoload) || ! is_file($environmentFile)) {
    respond(503, ['message' => 'Application is not ready.']);
}

require $autoload;

Dotenv::createImmutable($applicationRoot)->safeLoad();

$enabled = filter_var($_ENV['DEPLOY_HOOK_ENABLED'] ?? false, FILTER_VALIDATE_BOOL);
$secret = (string) ($_ENV['DEPLOY_HOOK_SECRET'] ?? '');
$ttl = max(60, (int) ($_ENV['DEPLOY_HOOK_SIGNATURE_TTL'] ?? 300));
$timestamp = (string) ($_SERVER['HTTP_X_DEPLOY_TIMESTAMP'] ?? '');
$commit = (string) ($_SERVER['HTTP_X_DEPLOY_COMMIT'] ?? '');
$signature = (string) ($_SERVER['HTTP_X_DEPLOY_SIGNATURE'] ?? '');

if (! $enabled) {
    respond(404, ['message' => 'Not found.']);
}

if (
    $secret === ''
    || ! ctype_digit($timestamp)
    || ! preg_match('/^[a-f0-9]{40}$/i', $commit)
    || abs(time() - (int) $timestamp) > $ttl
) {
    respond(401, ['message' => 'Deployment signature is invalid.']);
}

$expectedSignature = hash_hmac('sha256', "{$timestamp}\n{$commit}", $secret);

if (! hash_equals($expectedSignature, $signature)) {
    respond(401, ['message' => 'Deployment signature is invalid.']);
}

$lockPath = $applicationRoot.'/storage/framework/deploy.lock';
$lockHandle = fopen($lockPath, 'c');

if ($lockHandle === false || ! flock($lockHandle, LOCK_EX | LOCK_NB)) {
    respond(409, ['message' => 'Another deployment is running.']);
}

try {
    foreach (glob($applicationRoot.'/bootstrap/cache/*.php') ?: [] as $cacheFile) {
        if (! in_array(basename($cacheFile), ['packages.php', 'services.php'], true)) {
            @unlink($cacheFile);
        }
    }

    $app = require $applicationRoot.'/bootstrap/app.php';
    $kernel = $app->make(Kernel::class);
    $kernel->bootstrap();

    $migrationExitCode = $kernel->call('migrate', [
        '--force' => true,
        '--no-interaction' => true,
    ]);

    if ($migrationExitCode !== 0) {
        respond(500, [
            'message' => 'Database migration failed.',
            'commit' => $commit,
        ]);
    }

    $seederExitCode = $kernel->call('db:seed', [
        '--class' => 'Database\\Seeders\\DatabaseSeeder',
        '--force' => true,
        '--no-interaction' => true,
    ]);

    if ($seederExitCode !== 0) {
        respond(500, [
            'message' => 'Database seeding failed.',
            'commit' => $commit,
        ]);
    }

    respond(200, [
        'message' => 'Database migration and seeding completed.',
        'commit' => $commit,
    ]);
} catch (Throwable $exception) {
    error_log(sprintf(
        'Radina deployment failed for %s: %s',
        $commit,
        $exception->getMessage()
    ));

    respond(500, [
        'message' => 'Deployment database operation failed.',
        'commit' => $commit,
    ]);
} finally {
    flock($lockHandle, LOCK_UN);
    fclose($lockHandle);
}

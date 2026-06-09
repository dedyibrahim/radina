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

function safeError(Throwable $exception): string
{
    $message = preg_replace(
        [
            '/password=[^;\s)]+/i',
            '/(DB_PASSWORD|DEPLOY_HOOK_SECRET)=\S+/i',
            '/mysql:[^"\']+/i',
        ],
        [
            'password=[hidden]',
            '$1=[hidden]',
            'mysql:[hidden]',
        ],
        $exception->getMessage()
    );

    return mb_substr((string) $message, 0, 1000);
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

try {
    Dotenv::createImmutable($applicationRoot)->safeLoad();
} catch (Throwable $exception) {
    respond(500, [
        'message' => 'Production .env file is invalid.',
        'phase' => 'environment',
        'error' => safeError($exception),
    ]);
}

$enabled = filter_var($_ENV['DEPLOY_HOOK_ENABLED'] ?? false, FILTER_VALIDATE_BOOL);
$secret = (string) ($_ENV['DEPLOY_HOOK_SECRET'] ?? '');
$ttl = max(60, (int) ($_ENV['DEPLOY_HOOK_SIGNATURE_TTL'] ?? 300));
$timestamp = (string) ($_SERVER['HTTP_X_DEPLOY_TIMESTAMP'] ?? '');
$commit = (string) ($_SERVER['HTTP_X_DEPLOY_COMMIT'] ?? '');
$seedSqlSha256 = (string) ($_SERVER['HTTP_X_SEED_SQL_SHA256'] ?? '');
$releaseManifestSha256 = (string) ($_SERVER['HTTP_X_RELEASE_MANIFEST_SHA256'] ?? '');
$signature = (string) ($_SERVER['HTTP_X_DEPLOY_SIGNATURE'] ?? '');
$releaseCommitPath = __DIR__.'/.radina-release-commit';
$releaseManifestPath = __DIR__.'/.radina-release-manifest.json';
$seedSqlPath = $applicationRoot.'/database/import/portal_berita.sql';

if (! $enabled) {
    respond(503, [
        'message' => 'Deployment hook is not enabled in production .env.',
        'phase' => 'environment',
        'required_variable' => 'DEPLOY_HOOK_ENABLED=true',
    ]);
}

if (
    $secret === ''
    || ! ctype_digit($timestamp)
    || ! preg_match('/^[a-f0-9]{40}$/i', $commit)
    || ! preg_match('/^[a-f0-9]{64}$/i', $seedSqlSha256)
    || ! preg_match('/^[a-f0-9]{64}$/i', $releaseManifestSha256)
    || abs(time() - (int) $timestamp) > $ttl
) {
    respond(401, ['message' => 'Deployment signature is invalid.']);
}

$expectedSignature = hash_hmac(
    'sha256',
    "{$timestamp}\n{$commit}\n{$seedSqlSha256}\n{$releaseManifestSha256}",
    $secret
);

if (! hash_equals($expectedSignature, $signature)) {
    respond(401, ['message' => 'Deployment signature is invalid.']);
}

if (! is_file($releaseCommitPath)) {
    respond(409, [
        'message' => 'Deployment files were uploaded to the wrong directory.',
        'phase' => 'upload-path',
        'expected_file' => '.radina-release-commit',
    ]);
}

$uploadedCommit = trim((string) file_get_contents($releaseCommitPath));

if (! hash_equals(strtolower($commit), strtolower($uploadedCommit))) {
    respond(409, [
        'message' => 'The deployed files do not match the requested commit.',
        'phase' => 'upload-version',
        'expected_commit' => $commit,
        'uploaded_commit' => $uploadedCommit,
    ]);
}

if (! is_file($releaseManifestPath)) {
    respond(409, [
        'message' => 'Release manifest is missing.',
        'phase' => 'release-files',
    ]);
}

$uploadedManifestSha256 = hash_file('sha256', $releaseManifestPath);

if (! hash_equals(strtolower($releaseManifestSha256), strtolower($uploadedManifestSha256))) {
    respond(409, [
        'message' => 'Release manifest is incomplete or corrupted.',
        'phase' => 'release-files',
    ]);
}

$releaseManifest = json_decode((string) file_get_contents($releaseManifestPath), true);

if (
    ! is_array($releaseManifest)
    || ($releaseManifest['commit'] ?? null) !== $commit
    || ! is_array($releaseManifest['files'] ?? null)
) {
    respond(409, [
        'message' => 'Release manifest is invalid.',
        'phase' => 'release-files',
    ]);
}

foreach ($releaseManifest['files'] as $relativePath => $metadata) {
    if (
        ! is_string($relativePath)
        || str_contains($relativePath, '..')
        || str_starts_with($relativePath, '/')
        || ! is_array($metadata)
    ) {
        respond(409, [
            'message' => 'Release manifest contains an invalid path.',
            'phase' => 'release-files',
        ]);
    }

    $deployedFile = __DIR__.'/'.str_replace('/', DIRECTORY_SEPARATOR, $relativePath);
    $expectedBytes = (int) ($metadata['bytes'] ?? -1);
    $expectedSha256 = (string) ($metadata['sha256'] ?? '');

    if (
        ! is_file($deployedFile)
        || filesize($deployedFile) !== $expectedBytes
        || ! preg_match('/^[a-f0-9]{64}$/i', $expectedSha256)
        || ! hash_equals(strtolower($expectedSha256), strtolower(hash_file('sha256', $deployedFile)))
    ) {
        respond(409, [
            'message' => 'A deployed file is incomplete or corrupted.',
            'phase' => 'release-files',
            'file' => $relativePath,
        ]);
    }
}

if (! is_file($seedSqlPath)) {
    respond(409, [
        'message' => 'Seeder SQL source is missing.',
        'phase' => 'seed-source',
    ]);
}

$uploadedSeedSqlSha256 = hash_file('sha256', $seedSqlPath);

if (! hash_equals(strtolower($seedSqlSha256), strtolower($uploadedSeedSqlSha256))) {
    respond(409, [
        'message' => 'Seeder SQL source is incomplete or corrupted.',
        'phase' => 'seed-source',
        'expected_sha256' => $seedSqlSha256,
        'uploaded_sha256' => $uploadedSeedSqlSha256,
        'uploaded_bytes' => filesize($seedSqlPath),
    ]);
}

$lockPath = $applicationRoot.'/storage/framework/deploy.lock';
$lockHandle = fopen($lockPath, 'c');

if ($lockHandle === false || ! flock($lockHandle, LOCK_EX | LOCK_NB)) {
    respond(409, ['message' => 'Another deployment is running.']);
}

try {
    $phase = 'cache';

    foreach (glob($applicationRoot.'/bootstrap/cache/*.php') ?: [] as $cacheFile) {
        if (! in_array(basename($cacheFile), ['packages.php', 'services.php'], true)) {
            @unlink($cacheFile);
        }
    }

    foreach (glob($applicationRoot.'/storage/framework/views/*.php') ?: [] as $compiledView) {
        @unlink($compiledView);
    }

    $phase = 'bootstrap';
    $app = require $applicationRoot.'/bootstrap/app.php';
    $kernel = $app->make(Kernel::class);
    $kernel->bootstrap();

    $phase = 'migration';
    $migrationExitCode = $kernel->call('migrate', [
        '--force' => true,
        '--no-interaction' => true,
    ]);

    if ($migrationExitCode !== 0) {
        respond(500, [
            'message' => 'Database migration failed.',
            'phase' => $phase,
            'output' => mb_substr(trim($kernel->output()), 0, 2000),
            'commit' => $commit,
        ]);
    }

    $phase = 'seeder';
    $seederExitCode = $kernel->call('db:seed', [
        '--class' => 'Database\\Seeders\\DatabaseSeeder',
        '--force' => true,
        '--no-interaction' => true,
    ]);

    if ($seederExitCode !== 0) {
        respond(500, [
            'message' => 'Database seeding failed.',
            'phase' => $phase,
            'output' => mb_substr(trim($kernel->output()), 0, 2000),
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
        'phase' => $phase ?? 'initialization',
        'error' => safeError($exception),
        'commit' => $commit,
    ]);
} finally {
    flock($lockHandle, LOCK_UN);
    fclose($lockHandle);
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

class DeploymentController extends Controller
{
    public function migrate(Request $request): JsonResponse
    {
        abort_unless(config('deployment.hook_enabled'), Response::HTTP_NOT_FOUND);

        $secret = (string) config('deployment.hook_secret');
        $timestamp = (string) $request->header('X-Deploy-Timestamp');
        $commit = (string) $request->header('X-Deploy-Commit');
        $signature = (string) $request->header('X-Deploy-Signature');

        if (
            $secret === ''
            || ! ctype_digit($timestamp)
            || ! preg_match('/^[a-f0-9]{40}$/i', $commit)
            || abs(now()->timestamp - (int) $timestamp) > config('deployment.signature_ttl')
        ) {
            return response()->json(['message' => 'Deployment signature is invalid.'], Response::HTTP_UNAUTHORIZED);
        }

        $expectedSignature = hash_hmac('sha256', "{$timestamp}\n{$commit}", $secret);

        if (! hash_equals($expectedSignature, $signature)) {
            return response()->json(['message' => 'Deployment signature is invalid.'], Response::HTTP_UNAUTHORIZED);
        }

        try {
            return Cache::lock('deployment:migrate', 600)->block(5, function () use ($commit): JsonResponse {
                $exitCode = Artisan::call('migrate', [
                    '--force' => true,
                    '--no-interaction' => true,
                ]);

                if ($exitCode !== 0) {
                    Log::error('Production migration failed.', [
                        'commit' => $commit,
                        'output' => Artisan::output(),
                    ]);

                    return response()->json([
                        'message' => 'Database migration failed.',
                        'commit' => $commit,
                    ], Response::HTTP_INTERNAL_SERVER_ERROR);
                }

                Log::info('Production migration completed.', ['commit' => $commit]);

                return response()->json([
                    'message' => 'Database migration completed.',
                    'commit' => $commit,
                ]);
            });
        } catch (Throwable $exception) {
            Log::error('Deployment migration hook failed.', [
                'commit' => $commit,
                'exception' => $exception,
            ]);

            return response()->json([
                'message' => 'Deployment migration hook failed.',
                'commit' => $commit,
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}

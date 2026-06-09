<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Artisan;
use Tests\TestCase;

class DeploymentHookTest extends TestCase
{
    public function test_deployment_hook_rejects_invalid_signature(): void
    {
        config()->set('deployment.hook_enabled', true);
        config()->set('deployment.hook_secret', 'test-deployment-secret');

        $this->postJson('/api/deploy/migrate', [], [
            'X-Deploy-Timestamp' => (string) now()->timestamp,
            'X-Deploy-Commit' => str_repeat('a', 40),
            'X-Deploy-Signature' => 'invalid',
        ])->assertUnauthorized();
    }

    public function test_deployment_hook_runs_migrations_with_valid_signature(): void
    {
        config()->set('deployment.hook_enabled', true);
        config()->set('deployment.hook_secret', 'test-deployment-secret');

        Artisan::shouldReceive('call')
            ->once()
            ->with('migrate', [
                '--force' => true,
                '--no-interaction' => true,
            ])
            ->andReturn(0);

        $timestamp = (string) now()->timestamp;
        $commit = str_repeat('b', 40);
        $signature = hash_hmac('sha256', "{$timestamp}\n{$commit}", 'test-deployment-secret');

        $this->postJson('/api/deploy/migrate', [], [
            'X-Deploy-Timestamp' => $timestamp,
            'X-Deploy-Commit' => $commit,
            'X-Deploy-Signature' => $signature,
        ])
            ->assertOk()
            ->assertJsonPath('commit', $commit);
    }
}

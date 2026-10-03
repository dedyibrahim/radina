<?php

namespace Tests\Feature;

use App\Models\Admin;
use App\Models\User;
use App\Support\LoginCaptcha;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AdminLoginTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Reproduce hosting with a missing/mismatched Sanctum domain configuration.
        config(['sanctum.stateful' => []]);
    }

    private function admin(bool $active = true): User
    {
        $user = User::factory()->create(['role' => 'admin', 'password' => Hash::make('AdminPassword!2026')]);
        Admin::create(['user_id' => $user->id, 'active' => $active]);

        return $user;
    }

    private function challenge(): int
    {
        $response = $this->getJson('/api/admin/captcha')->assertOk();
        $this->assertStringContainsString('no-store', $response->headers->get('Cache-Control'));
        $this->assertMatchesRegularExpression('/^[2-9] \+ [1-9]$/', $response->json('data.question'));
        $this->assertArrayNotHasKey('answer', $response->json('data'));

        return $this->app['session.store']->get(LoginCaptcha::SESSION_KEY);
    }

    private function credentials(User $user, int $answer): array
    {
        return ['email' => $user->email, 'password' => 'AdminPassword!2026', 'captcha' => $answer];
    }

    public function test_login_session_restore_and_logout_work_without_stateful_domains(): void
    {
        $admin = $this->admin();
        $answer = $this->challenge();
        $sessionId = $this->app['session.store']->getId();
        $this->postJson('/api/admin/login', $this->credentials($admin, $answer))->assertOk()->assertJsonPath('data.id', $admin->id);
        $this->assertNotSame($sessionId, $this->app['session.store']->getId());
        $this->assertAuthenticatedAs($admin, 'web');
        $this->getJson('/api/admin/me')->assertOk()->assertJsonPath('data.email', $admin->email);
        $this->getJson('/api/admin/licenses')->assertOk();
        $this->postJson('/api/admin/logout')->assertNoContent();
        $this->assertGuest('web');
    }

    public function test_missing_wrong_and_expired_captchas_cannot_authenticate(): void
    {
        $admin = $this->admin();
        $answer = $this->challenge();
        $this->postJson('/api/admin/login', ['email' => $admin->email, 'password' => 'AdminPassword!2026'])->assertUnprocessable()->assertJsonValidationErrors('captcha');
        $this->postJson('/api/admin/login', $this->credentials($admin, $answer + 1))->assertUnprocessable()->assertJsonValidationErrors('captcha');
        $this->assertGuest('web');
        $answer = $this->challenge();
        $this->travel(5)->minutes();
        $this->postJson('/api/admin/login', $this->credentials($admin, $answer))->assertUnprocessable()->assertJsonValidationErrors('captcha');
        $this->assertGuest('web');
    }

    public function test_captcha_is_bound_to_the_session_and_consumed_after_an_attempt(): void
    {
        $admin = $this->admin();
        $answer = $this->challenge();
        $this->postJson('/api/admin/login', array_replace($this->credentials($admin, $answer), ['password' => 'incorrect']))->assertUnprocessable()->assertJsonValidationErrors('email');
        $this->postJson('/api/admin/login', $this->credentials($admin, $answer))->assertUnprocessable()->assertJsonValidationErrors('captcha');
        $this->assertGuest('web');
        $answer = $this->challenge();
        $this->app['session.store']->flush();
        $this->postJson('/api/admin/login', $this->credentials($admin, $answer))->assertUnprocessable()->assertJsonValidationErrors('captcha');
    }

    public function test_only_active_administrators_can_login_with_a_valid_captcha(): void
    {
        $admin = $this->admin(false);
        $this->postJson('/api/admin/login', $this->credentials($admin, $this->challenge()))->assertUnprocessable()->assertJsonValidationErrors('email');
        $this->assertGuest('web');
        $user = User::factory()->create(['role' => 'writer', 'password' => Hash::make('AdminPassword!2026')]);
        $this->postJson('/api/admin/login', $this->credentials($user, $this->challenge()))->assertUnprocessable()->assertJsonValidationErrors('email');
        $this->assertGuest('web');
    }

    public function test_csrf_remains_required_when_the_production_domain_is_not_configured(): void
    {
        $admin = $this->admin();
        $answer = $this->challenge();
        // Enable real CSRF verification after the isolated database setup completes.
        $this->app->instance('env', 'production');
        $this->postJson('/api/admin/login', $this->credentials($admin, $answer))->assertStatus(419);
        $this->assertGuest('web');
    }

    public function test_login_rate_limit_is_preserved(): void
    {
        $admin = $this->admin();
        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/admin/login', $this->credentials($admin, 0))->assertUnprocessable();
        }
        $this->postJson('/api/admin/login', $this->credentials($admin, 0))->assertStatus(429);
        $this->assertGuest('web');
    }

    public function test_refreshing_captcha_does_not_use_the_login_attempt_limit(): void
    {
        $admin = $this->admin();
        for ($i = 0; $i < 6; $i++) {
            $answer = $this->challenge();
        }
        $this->postJson('/api/admin/login', $this->credentials($admin, $answer))->assertOk();
        $this->assertAuthenticatedAs($admin, 'web');
    }
}

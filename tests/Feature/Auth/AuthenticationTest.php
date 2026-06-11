<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use App\Providers\RouteServiceProvider;
use App\Support\LoginCaptcha;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_screen_can_be_rendered(): void
    {
        $response = $this->get('/login');

        $response
            ->assertStatus(200)
            ->assertHeader('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet')
            ->assertSee('<title>Login | Radina News</title>', false)
            ->assertSee('<meta name="robots" content="noindex,nofollow,noarchive,nosnippet">', false)
            ->assertSee('Verifikasi keamanan')
            ->assertSessionHas(LoginCaptcha::SESSION_KEY);
    }

    public function test_inertia_login_visit_is_forced_to_full_page_navigation(): void
    {
        $this
            ->withHeader('X-Inertia', 'true')
            ->get('/login')
            ->assertStatus(409)
            ->assertHeader('X-Inertia-Location', route('login'));
    }

    public function test_users_can_authenticate_using_the_login_screen(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->withSession([LoginCaptcha::SESSION_KEY => 12])
            ->post('/login', [
                'email' => $user->email,
                'password' => 'password',
                'captcha' => 12,
            ]);

        $this->assertAuthenticated();
        $response->assertRedirect(RouteServiceProvider::HOME);
    }

    public function test_users_can_not_authenticate_with_invalid_password(): void
    {
        $user = User::factory()->create();

        $this
            ->withSession([LoginCaptcha::SESSION_KEY => 12])
            ->post('/login', [
                'email' => $user->email,
                'password' => 'wrong-password',
                'captcha' => 12,
            ]);

        $this->assertGuest();
    }

    public function test_users_cannot_authenticate_with_invalid_captcha(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->withSession([LoginCaptcha::SESSION_KEY => 12])
            ->post('/login', [
                'email' => $user->email,
                'password' => 'password',
                'captcha' => 11,
            ]);

        $this->assertGuest();
        $response->assertSessionHasErrors('captcha');
    }

    public function test_users_can_logout(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post('/logout');

        $this->assertGuest();
        $response->assertRedirect('/');
    }
}

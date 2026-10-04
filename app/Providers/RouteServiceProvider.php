<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Foundation\Support\Providers\RouteServiceProvider as ServiceProvider;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Route;

class RouteServiceProvider extends ServiceProvider
{
    /**
     * The path to your application's "home" route.
     *
     * Typically, users are redirected here after authentication.
     *
     * @var string
     */
    public const HOME = '/dashboard';

    /**
     * Define your route model bindings, pattern filters, and other route configuration.
     */
    public function boot(): void
    {
        RateLimiter::for('admin-login', fn (Request $request) => Limit::perMinute(5)->by($request->ip()));
        RateLimiter::for('admin-captcha', fn (Request $request) => Limit::perMinute(30)->by($request->ip()));

        foreach (['preview' => 20, 'import' => 10, 'message' => 20, 'phone' => 30] as $action => $limit) {
            RateLimiter::for('customer-guests-'.$action, fn (Request $request) => Limit::perMinute($limit)->by($request->ip().'|'.hash('sha256', (string) $request->route('token'))));
        }

        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(max(1, config('platform.api_rate_limit', 60)))->by($request->user()?->id ?: $request->ip());
        });

        $this->routes(function () {
            Route::middleware('api')
                ->prefix('api')
                ->group(base_path('routes/api.php'));

            Route::middleware('web')
                ->group(base_path('routes/web.php'));
        });
    }
}

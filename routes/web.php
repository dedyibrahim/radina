<?php

use App\Http\Controllers\AdminGiftController;
use App\Http\Controllers\AdminMusicController;
use App\Http\Controllers\AdminOrderController;
use App\Http\Controllers\AdminSettingsController;
use App\Http\Controllers\AdminTemplateController;
use App\Http\Controllers\AdminWeddingController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\MediaController;
use App\Http\Controllers\LicenseAdminController;
use App\Http\Controllers\SiteController;
use App\Http\Controllers\DashboardController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Administrator endpoints always use web sessions and CSRF, independent of Sanctum's domain list.
Route::prefix('api/admin')->middleware('throttle:api')->group(function () {
    Route::get('/captcha', [AuthController::class, 'captcha'])->middleware('throttle:admin-captcha');
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:admin-login');
    Route::middleware(['auth:sanctum', 'admin'])->group(function () {
        Route::get('/licenses', [LicenseAdminController::class, 'index']);
        Route::post('/licenses', [LicenseAdminController::class, 'store']);
        Route::patch('/licenses/{license}', [LicenseAdminController::class, 'update']);
        Route::patch('/licenses/{license}/toggle-status', [LicenseAdminController::class, 'toggleStatus']);
        Route::delete('/licenses/{license}', [LicenseAdminController::class, 'destroy']);
        Route::get('/me', [AuthController::class, 'me']);
        Route::get('/music', [AdminMusicController::class, 'index']);
        Route::post('/music', [AdminMusicController::class, 'store']);
        Route::put('/music/{music}', [AdminMusicController::class, 'update']);
        Route::delete('/music/{music}', [AdminMusicController::class, 'destroy']);
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/dashboard', [AdminOrderController::class, 'dashboard']);
        Route::get('/orders', [AdminOrderController::class, 'index']);
        Route::get('/orders/{order}', [AdminOrderController::class, 'show']);
        Route::patch('/orders/{order}/payment', [AdminOrderController::class, 'payment']);
        Route::patch('/orders/{order}/status', [AdminOrderController::class, 'status']);
        Route::post('/orders/{order}/wedding', [AdminOrderController::class, 'wedding']);
        Route::get('/weddings/{wedding}', [AdminWeddingController::class, 'show']);
        Route::put('/weddings/{wedding}', [AdminWeddingController::class, 'update']);
        Route::get('/weddings/{wedding}/preview', [AdminWeddingController::class, 'show']);
        Route::post('/weddings/{wedding}/publish', [AdminWeddingController::class, 'publish']);
        Route::get('/weddings/{wedding}/gifts', [AdminGiftController::class, 'index']);
        Route::post('/weddings/{wedding}/gifts', [AdminGiftController::class, 'store']);
        Route::patch('/weddings/{wedding}/gifts/reorder', [AdminGiftController::class, 'reorder']);
        Route::put('/weddings/{wedding}/gifts/{gift}', [AdminGiftController::class, 'update']);
        Route::delete('/weddings/{wedding}/gifts/{gift}', [AdminGiftController::class, 'destroy']);
        Route::get('/weddings/{wedding}/rsvps', [AdminWeddingController::class, 'rsvps']);
        Route::get('/weddings/{wedding}/wishes', [AdminWeddingController::class, 'wishes']);
        Route::patch('/weddings/{wedding}/wishes/{wish}', [AdminWeddingController::class, 'moderate']);
        Route::post('/media', [MediaController::class, 'store']);
        Route::get('/templates', [AdminTemplateController::class, 'index']);
        Route::post('/templates', [AdminTemplateController::class, 'store']);
        Route::put('/templates/{template}', [AdminTemplateController::class, 'update']);
        Route::get('/settings', [AdminSettingsController::class, 'show']);
        Route::put('/settings', [AdminSettingsController::class, 'update']);
    });
});

Route::get('/assets/{file}', [SiteController::class, 'asset']);
Route::get('/storage/{file}', [SiteController::class, 'media'])->where('file', '.*');
Route::get('/favicon.svg', fn () => response()->file(base_path('frontend/public/favicon.svg'), ['Content-Type' => 'image/svg+xml']));
Route::get('/login', fn () => redirect('/admin/login'))->name('login');
Route::get('/dashboard', fn (Request $request) => redirect($request->query('section') === 'licenses' ? '/admin/licenses' : '/admin'))->name('dashboard');
Route::middleware(['auth', 'admin'])->group(function () {
    Route::post('/licenses', [DashboardController::class, 'store'])->name('licenses.store');
    Route::patch('/licenses/{license}', [DashboardController::class, 'update'])->name('licenses.update');
    Route::delete('/licenses/{license}', [DashboardController::class, 'destroy'])->name('licenses.destroy');
    Route::patch('/licenses/{license}/toggle-status', [DashboardController::class, 'toggleStatus'])->name('licenses.toggle-status');
});
Route::get('/sitemap.xml', [SiteController::class, 'sitemap']);
Route::get('/robots.txt', [SiteController::class, 'robots']);
Route::get('/berita/{any?}', [SiteController::class, 'retired'])->where('any', '.*');
Route::get('/kategori/{any?}', [SiteController::class, 'retired'])->where('any', '.*');
Route::get('/topik/{any?}', [SiteController::class, 'retired'])->where('any', '.*');
Route::get('/news-sitemap.xml', [SiteController::class, 'retired']);
Route::get('/rss.xml', [SiteController::class, 'retired']);
Route::get('/brand/{file}', [SiteController::class, 'brand']);
Route::get('/images/templates/{file}', [SiteController::class, 'thumbnail']);
Route::get('/w/{slug}', [SiteController::class, 'wedding']);
Route::get('/{any?}', [SiteController::class, 'index'])->where('any', '^(?!api(?:/|$)|storage(?:/|$)|sanctum(?:/|$)|assets(?:/|$)).*');

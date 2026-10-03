<?php

use App\Http\Controllers\SiteController;
use App\Http\Controllers\DashboardController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

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

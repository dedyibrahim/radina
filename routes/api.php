<?php

use App\Http\Controllers\PublicController;
use App\Http\Controllers\Api\LicenseActivationController;
use Illuminate\Support\Facades\Route;

Route::get('/settings', [PublicController::class, 'settings']);
Route::get('/categories', [PublicController::class, 'categories']);
Route::get('/templates', [PublicController::class, 'templates']);
Route::get('/templates/{slug}', [PublicController::class, 'template']);
Route::get('/templates/{slug}/preview', [PublicController::class, 'demo']);
Route::post('/orders', [PublicController::class, 'storeOrder'])->middleware('throttle:12,1');
Route::post('/check-order', [PublicController::class, 'checkOrder'])->middleware('throttle:20,1');
Route::post('/orders/payment-review', [PublicController::class, 'reviewPayment'])->middleware('throttle:10,1');
Route::get('/weddings/{slug}', [PublicController::class, 'wedding']);
Route::get('/weddings/{slug}/wishes', [PublicController::class, 'wishes']);
Route::post('/weddings/{slug}/rsvp', [PublicController::class, 'rsvp'])->middleware('throttle:10,1');
Route::post('/weddings/{slug}/wishes', [PublicController::class, 'wish'])->middleware('throttle:10,1');
Route::post('/license/activate', [LicenseActivationController::class, 'activate'])
    ->withoutMiddleware(\Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class);

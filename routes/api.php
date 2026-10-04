<?php

use App\Http\Controllers\Api\LicenseActivationController;
use App\Http\Controllers\PublicController;
use Illuminate\Support\Facades\Route;

Route::get('/packages', [\App\Http\Controllers\PackageController::class, 'index']);
Route::post('/order-documents/{type}', [\App\Http\Controllers\OrderDocumentController::class, 'customer'])->whereIn('type', ['invoice', 'receipt'])->middleware('throttle:10,1');
Route::get('/guest-passes/{token}', [\App\Http\Controllers\InvitationToolsController::class, 'pass'])->middleware('throttle:60,1');
Route::post('/weddings/{slug}/visits', [\App\Http\Controllers\InvitationToolsController::class, 'visit'])->middleware('throttle:60,1');
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

<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LanguageController;
use App\Http\Controllers\NewsAdminController;
use App\Http\Controllers\NewsCategoryAdminController;
use App\Http\Controllers\NewsPortalController;
use App\Http\Controllers\UserAdminController;
use App\Http\Controllers\WithdrawalAdminController;
use App\Http\Controllers\WriterFinanceController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

Route::get('/', [NewsPortalController::class, 'home'])->name('news.home');
Route::get('/berita', [NewsPortalController::class, 'index'])->name('news.index');
Route::get('/berita/{article:slug}', [NewsPortalController::class, 'show'])->name('news.show');
Route::get('/kategori/{category:slug}', [NewsPortalController::class, 'category'])->name('news.category');
Route::get('/topik/{tag:slug}', [NewsPortalController::class, 'tag'])->name('news.tag');
Route::get('/tentang', [NewsPortalController::class, 'about'])->name('news.about');
Route::view('/company-profile', 'company-profile')->name('company.profile');
Route::get('/sitemap.xml', [NewsPortalController::class, 'sitemap'])->name('sitemap');
Route::get('/news-sitemap.xml', [NewsPortalController::class, 'newsSitemap'])->name('news.sitemap');
Route::get('/rss.xml', [NewsPortalController::class, 'feed'])->name('news.feed');
Route::get('/robots.txt', [NewsPortalController::class, 'robots'])->name('robots');
Route::post('/language/{locale}', [LanguageController::class, 'update'])->name('language.update');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::post('/dashboard/berita', [NewsAdminController::class, 'store'])->name('admin.news.store');
    Route::middleware('role:writer')->group(function () {
        Route::patch('/dashboard/rekening', [WriterFinanceController::class, 'updateBank'])->name('writer.bank.update');
        Route::post('/dashboard/withdrawals', [WriterFinanceController::class, 'requestWithdrawal'])->name('writer.withdrawals.store');
    });

    Route::middleware('role:admin')->group(function () {
        Route::post('/licenses', [DashboardController::class, 'store'])->name('licenses.store');
        Route::patch('/licenses/{license}', [DashboardController::class, 'update'])->name('licenses.update');
        Route::delete('/licenses/{license}', [DashboardController::class, 'destroy'])->name('licenses.destroy');
        Route::patch('/licenses/{license}/toggle-status', [DashboardController::class, 'toggleStatus'])->name('licenses.toggle-status');
        Route::get('/dashboard/berita', [NewsAdminController::class, 'index'])->name('admin.news.index');
        Route::get('/dashboard/berita/tambah', [NewsAdminController::class, 'create'])->name('admin.news.create');
        Route::get('/dashboard/berita/{article:slug}/edit', [NewsAdminController::class, 'edit'])->name('admin.news.edit');
        Route::patch('/dashboard/berita/{article:slug}', [NewsAdminController::class, 'update'])->name('admin.news.update');
        Route::patch('/dashboard/berita/{article:slug}/review', [NewsAdminController::class, 'review'])->name('admin.news.review');
        Route::patch('/dashboard/berita/{article:slug}/penulis', [NewsAdminController::class, 'reassign'])->name('admin.news.reassign');
        Route::delete('/dashboard/berita/{article:slug}/gambar/{image}', [NewsAdminController::class, 'destroyImage'])->name('admin.news.images.destroy');
        Route::delete('/dashboard/berita/{article:slug}', [NewsAdminController::class, 'destroy'])->name('admin.news.destroy');
        Route::post('/dashboard/kategori', [NewsCategoryAdminController::class, 'store'])->name('admin.categories.store');
        Route::patch('/dashboard/kategori/{category:slug}', [NewsCategoryAdminController::class, 'update'])->name('admin.categories.update');
        Route::delete('/dashboard/kategori/{category:slug}', [NewsCategoryAdminController::class, 'destroy'])->name('admin.categories.destroy');
        Route::post('/dashboard/users', [UserAdminController::class, 'store'])->name('admin.users.store');
        Route::patch('/dashboard/users/{user}', [UserAdminController::class, 'update'])->name('admin.users.update');
        Route::delete('/dashboard/users/{user}', [UserAdminController::class, 'destroy'])->name('admin.users.destroy');
        Route::patch('/dashboard/withdrawals/{withdrawal}', [WithdrawalAdminController::class, 'update'])->name('admin.withdrawals.update');
    });
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';

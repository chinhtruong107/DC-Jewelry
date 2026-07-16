<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DonHangController;
use App\Http\Controllers\FavoriteController;
use App\Http\Controllers\LocationController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProductReviewController;
use App\Http\Controllers\VnpayPaymentController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;

Route::post('register', [AuthController::class, 'register']);
Route::post('login', [AuthController::class, 'login']);
Route::post('forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:5,1');
Route::post('admin/login', [AdminController::class, 'login']);
Route::get('locations/provinces', [LocationController::class, 'provinces']);
Route::get('locations/provinces/{provinceCode}/wards', [LocationController::class, 'wards']);

Route::get('product-images/{path}', function (string $path) {
    abort_unless(Storage::disk('public')->exists($path), 404);

    return response(Storage::disk('public')->get($path), 200, [
        'Content-Type' => Storage::disk('public')->mimeType($path) ?: 'image/jpeg',
        'Access-Control-Allow-Origin' => '*',
        'Cache-Control' => 'no-cache, no-store, must-revalidate',
        'Pragma' => 'no-cache',
        'Expires' => '0',
    ]);
})->where('path', '.*');

Route::get('products', [ProductController::class, 'index']);
Route::get('products/{id}', [ProductController::class, 'show']);
Route::get('products/{product}/reviews', [ProductReviewController::class, 'index']);
Route::apiResource('don_hangs', DonHangController::class);
Route::post('orders', [OrderController::class, 'store']);
Route::get('orders/{order}', [OrderController::class, 'show']);
Route::get('payments/vnpay/return', [VnpayPaymentController::class, 'handleReturn']);
Route::get('payments/vnpay/ipn', [VnpayPaymentController::class, 'ipn']);

Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::get('admin/dashboard', [AdminController::class, 'dashboard']);
    Route::patch('admin/orders/{order}/status', [AdminController::class, 'updateOrderStatus']);
    Route::post('products', [ProductController::class, 'store']);
    Route::put('products/{id}', [ProductController::class, 'update']);
    Route::patch('products/{id}', [ProductController::class, 'update']);
    Route::delete('products/{id}', [ProductController::class, 'destroy']);
});

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::post('change-password', [AuthController::class, 'changePassword']);
    Route::post('logout', [AuthController::class, 'logout']);

    Route::middleware('password.changed')->group(function () {
        Route::patch('/user', [AuthController::class, 'updateProfile']);

        Route::get('orders', [OrderController::class, 'index']);
        Route::patch('orders/{order}/cancel', [OrderController::class, 'cancel']);
        Route::patch('orders/{order}/status', [OrderController::class, 'updateStatus']);
        Route::post('reviews', [ProductReviewController::class, 'store']);
        Route::get('favorites', [FavoriteController::class, 'index']);
        Route::post('favorites/{product}', [FavoriteController::class, 'store']);
        Route::delete('favorites/{product}', [FavoriteController::class, 'destroy']);
    });
});

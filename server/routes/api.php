<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BookController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\BorrowController;
use App\Http\Controllers\AdminController;


// ── Public routes ──────────────────────────────────────────────────────────────
Route::post('/signup',         [AuthController::class, 'signup']);

Route::post('/login',          [AuthController::class, 'login']);
Route::post('/pay-fee',        [AuthController::class, 'payFee']);
Route::post('/auth/google',    [AuthController::class, 'googleAuth']);


Route::get('/books',      [BookController::class, 'index']);
Route::get('/books/{id}', [BookController::class, 'show']);
Route::get('/categories', [CategoryController::class, 'index']);

// ── Protected routes ───────────────────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::get('/user',     [AuthController::class, 'getUser']);   // ← single /user route
    Route::get('/dashboard',[AuthController::class, 'dashboard']);
    Route::post('/logout',  [AuthController::class, 'logout']);

    // Books (admin actions)
    Route::post('/books',         [BookController::class, 'store']);
    Route::delete('/books/{id}',  [BookController::class, 'destroy']);

    // Borrow
    Route::post('/borrow/{bookId}', [BorrowController::class, 'borrow']);
    Route::get('/my-borrows',       [BorrowController::class, 'myBorrows']);
    Route::post('/return/{borrowId}',[BorrowController::class, 'returnBook']);

    // Admin
    Route::get('/admin/stats',   [AdminController::class, 'stats']);
    Route::get('/admin/borrows', [AdminController::class, 'borrows']);

    // Add inside auth:sanctum group:
    Route::put('/books/{id}',                              [BookController::class,   'update']);
    Route::get('/admin/logs',                              [AdminController::class,  'logs']);
Route::post('/admin/borrows/{id}/confirm-fine',        [AdminController::class,  'confirmFine']);
Route::post('/borrows/{id}/pay-fine',                  [BorrowController::class, 'payFine']);
});
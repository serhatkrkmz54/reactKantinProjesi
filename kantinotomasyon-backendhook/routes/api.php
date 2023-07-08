<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\StockController;
use App\Http\Controllers\BasketController;
use App\Http\Controllers\SaleController;

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

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});
//Kullanıcı işlemleri
Route::post('login', [AuthController::class, 'login']);
Route::post('register', [AuthController::class, 'register']);
Route::group(['middleware' => 'auth:sanctum'], function () {
    Route::get('logout', [AuthController::class, 'logout']);
    Route::get('user', [AuthController::class, 'user']);
});
//Barkoda Göre Ürün Listeleme
Route::get('/barcode', 'App\Http\Controllers\ProductController@barcode')/*->middleware('auth:sanctum', 'role:admin')*/;

//Ürün Listeleme
Route::/*middleware('auth:sanctum', 'role:admin')->*/resource('product', ProductController::class);

//Satış
Route::resource('sale', SaleController::class)/*->middleware('auth')*/;

//Stok işlemleri
Route::resource('stock', StockController::class);

//Sepet İşlemleri
Route::resource('basket', BasketController::class);


Route::get('stock/product/{id}', [StockController::class, 'productGet']);
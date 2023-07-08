<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Basket;
use Illuminate\Http\Request;
use App\Models\Product;
use App\Models\Sale;
use App\Models\Stock;

class BasketController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {

        // validasyon
        $request->validate([
            'basket_items' => 'required|array',
            'basket_items.*.product_id' => 'required|integer|exists:products,id',
            'basket_items.*.stock_id' => 'required|integer|exists:stocks,id',
            'basket_items.*.piece' => 'required|integer|min:1',
        ]);

        // requestten gelen verileri al
        $basketItems = (array)$request->input('basket_items');

        // satış için hazırlık
        $productPriceList = [];

        // stok kontrolü
        foreach ($basketItems as $item) {
            $stock = Stock::query()->find($item['stock_id']);

            if ($stock->quantity < $item['piece']) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Stokta yeterli ürün yok.',
                    'product_id' => $item['product_id'],
                ], 400);
            }

            $productPriceList[$item['stock_id']] = [
                'product_id' => $item['product_id'], // baskets tablosunda karşılığı => product_id
                'stock_price' => $stock->stock_price, // baskets tablosunda karşılığı => product_price
                'piece' => $item['piece'], // baskets tablosunda karşılığı => piece
                'total_price' => $stock->stock_price * $item['piece'], // baskets tablosunda karşılığı => total_price
                'stock_id' => $item['stock_id'],
            ];

        }

        // $productPriceList dizisini içerisindeki total_price değerlerini topla
        $totalPrice = array_sum(array_column($productPriceList, 'total_price'));

        // Satış oluştur
        // Sale modelinin içerisinde sadece total_price eklenecek ve kaydedilecek ve geriye sale_id döndürülecek
        $sale = Sale::query()->create([
            'total_price' => $totalPrice,
            'sale_date' => date('Y-m-d H:i:s'),
        ]);

        // Sepet kaydı oluştur
        foreach ($productPriceList as $item) {

            // Ürün şatışa hazırlanıyor
            Basket::query()->create([
                'sale_id' => $sale->id,
                'product_id' => $item['product_id'],
                'product_price' => $item['stock_price'],
                'piece' => $item['piece'],
                'total_price' => $item['total_price'],
            ]);

            // Ürün stoklarını güncelle
            $stock = Stock::query()->find($item['stock_id']);
            $stock->quantity = $stock->quantity - $item['piece'];
            $stock->save();

            // ürünü ürün tablosundaki stoktan düş
            $product = Product::query()->find($item['product_id']);
            $product->stock_quantity = $product->stock_quantity - $item['piece'];
            $product->save();
        }


        return response()->json([
            'status' => 'success',
            'message' => 'Satış başarılı.',
            'sale_id' => $sale->id,
        ], 201);

    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\Stock;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class StockController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {

        return response()->json([
            'message' => 'success',
            'data' => Stock::all()
        ]);
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
        $validator = Validator::make($request->all(), [

            'product_id' => 'required',
            'quantity' => 'required',
            'stock_price' => 'required',


        ]);
        $product = Product::find($request->input('product_id'));
        $product->stock_quantity += $request->input('quantity');
        $product->save();

        $new_stock = new Stock();
        $new_stock->product_id = $product->id;
        $new_stock->quantity = $request->input('quantity');
        $new_stock->stock_price = $request->input('stock_price');
        $new_stock->invoice_date = date('Y-m-d H:i:s');

        $new_stock->save();
        return response()->json([
            'status' => 'success'
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(stock $stock)
    {
        $stock->load('Product');
        return response()->json([
            "status" => "success",
            "data" => $stock,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Stock $stock)
    {
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {

        $validator = Validator::make($request->all(), [
            'product_id' => 'required',
            'quantity' => 'required',

        ]);

        if ($validator->fails()) {
            return response()->json([
                "status" => "warning",
                "message" => $validator->errors()
            ]);
        }

        $stock = Stock::find($id);

        $old_quantity = $stock->quantity;
        $stock->quantity = $request->input('quantity');
        $stock->stock_price = $request->input('stock_price');
        $stock->save();

        $product = Product::find($request->input('product_id'));
        $product->stock_quantity -= $old_quantity;
        $product->stock_quantity += $request->input('quantity');

        $product->save();

        return response()->json([
            'status' => 'success'
        ], 200);

    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Stock $stock, Request $request)
    {
        $product = Product::find($stock->product_id);

        if (!$stock) {
            return response()->json([
                "status" => "warning",
                "message" => "Ürün bulunamadı"
            ], 404);
        }

        // Ürün stoğunu azalt
        $product->stock_quantity -= $stock->quantity;
        $product->save();

        // Stok kaydını sil
        $stock->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Ürün silindi',
        ], 200);
    }
    public function productGet($id) {

        return response()->json([
            'status' => 'success',
            'data' => Stock::where(['product_id' => $id, ['quantity', '>', 0]])->get()
        ], 200);
    }
}

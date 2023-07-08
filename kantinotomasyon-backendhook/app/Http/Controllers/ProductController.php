<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Sale;
use App\Models\Stock;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\AuthController;
use App\Models\User;


class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function barcode(Request $request)
    {

        $barcode_no = $request->input('barcode_no');
        $validatedData = $request->validate([
            'barcode_no' => 'required|string|max:255',
        ]);
        $products = Product::query()->where('barcode_no', '=', $barcode_no)->limit(1)->get();

        if (count($products) == 0) {
            return response()->json([
                "message" => "Ürün bulunamadı"
            ], 404);
        }

        $product = $products[0];

        $stocks = Stock::query()
            ->where('product_id', '=', $product->id)
            ->where('quantity', '>', 0)
            ->get();

        $product->stocks = $stocks;

        return response()->json([
            "data" => $product
        ]);
    }

    public function index(Request $request)
    {
        // $userId = Auth::id(); // mevcut kullanıcının id'sini alın

        // if (Auth::AuthController()->isAdmin()) {
        //     $examples = User::withTrashed()->get(); // admin kullanıcısı, tüm öğeleri görüntüler
        // } else {
        //     $examples = User::where('user_id', $userId)->withTrashed()->get(); // diğer kullanıcılar, sadece kendi öğelerini görüntüler
        // }

        // return Product::collection($examples); // API Resource kullanarak öğeleri JSON olarak döndürür
        return response()->json([
            "status" => "success",
            "data" => Product::all()
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
        try {
            $product = new Product;
            $product->barcode_no = $request->input('barcode_no');
            $product->product_name = $request->input('product_name');
            $product->product_date = date('Y-m-d H:i:s');
            $product->stock_quantity = '0';
            $product->save();

            return response()->json([
                "status" => "success",
                "data" => $product
            ], 201);
        } catch (\Exception $e) {

            return response()->json([
                "status" => "error",
                "message" => $e->getMessage()
            ]);
        }

    }

    public function show(Product $product)
    {
        $product->load('stocks');
        return response()->json([
            "status" => "success",
            "data" => $product,
        ]);
    }



    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Product $product)
    {
        $validator = Validator::make($request->all(), [

            'product_name' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json([
                "status" => "warning",
                "message" => $validator->errors()
            ]);
        }

        $product->update($request->all());

        return response()->json([
            "status" => "success"
        ], 200);
    }
    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $product = Product::find($id);
        $product->delete(); // öğeyi silmek yerine Soft Deleting kullanarak silinmiş olarak işaretler ve deleted_at sütununa tarih ekler
        return response()->json([
            "status" => "success",
            "message" => "Ürün Başarıyla Silindi"
        ]);
    }
}

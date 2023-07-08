<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;


class Product extends Model
{
    use HasFactory;
    protected $table = 'Products';
    protected $guarded = [];

    use SoftDeletes;
    protected $dates = ['deleted_at'];


    public function stocks()
    {
        return $this->hasMany('App\Models\Stock');
    }

    public function getSale()
    {
        return $this->hasMany('Sale::class');
    }
    public function getStockPrice()
    {
        $lowestPrice = $this->stocks->min('stock_price');
        return $lowestPrice ?? 0;
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Sale extends Model
{
    use HasFactory;
    protected $table = 'sales';

    protected $fillable = ['id', 'total_price', 'sale_date'];
    protected $attributes = ['total_price' => 0];


    public function getBasket(){
        return $this->hasMany('App\Models\Basket');
    }
}

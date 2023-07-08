<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Stock extends Model
{
    use HasFactory;
    protected $table = 'stocks';

    protected $guarded = [];


    public function Product()
    {
        return $this->belongsTo('App\Models\Product');
    }
    public function sıfır($value)
    {
        $this->attributes['quantity'] = max(0, $value);
    }
}

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {

        Schema::create('Products', function (Blueprint $table) {
            $table->id();
            $table->string('barcode_no')->unique();
            $table->string('product_name');
            $table->integer('stock_quantity')->default(0)->nullable();
            $table->timestamp('product_date');
            $table->timestamp('deleted_at')->default(null)->nullable();;
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('Products');
    }
};

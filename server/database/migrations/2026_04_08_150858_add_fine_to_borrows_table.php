<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddFineToBorrowsTable extends Migration
{
    public function up(): void
{
    Schema::table('borrows', function (Blueprint $table) {
        if (!Schema::hasColumn('borrows', 'fine_amount')) {
            $table->decimal('fine_amount', 10, 2)->default(0);
        }
        if (!Schema::hasColumn('borrows', 'fine_paid')) {
            $table->boolean('fine_paid')->default(false);
        }
        if (!Schema::hasColumn('borrows', 'payment_method')) {
            $table->string('payment_method')->nullable();
        }
        if (!Schema::hasColumn('borrows', 'paid_at')) {
            $table->timestamp('paid_at')->nullable();
        }
    });
}

    public function down()
    {
        Schema::table('borrows', function (Blueprint $table) {
            $table->dropColumn(['fine_amount', 'fine_paid', 'payment_method', 'paid_at']);
        });
    }
}

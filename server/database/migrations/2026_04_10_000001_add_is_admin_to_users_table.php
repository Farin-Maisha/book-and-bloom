<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Add is_admin column if it doesn't exist
        if (!Schema::hasColumn('users', 'is_admin')) {
            Schema::table('users', function (Blueprint $table) {
                $table->boolean('is_admin')->default(false)->after('email');
            });
        }

        // 2. Make sultanaanika131@gmail.com an admin (upsert so it works even if user doesn't exist yet)
       DB::table('users')->updateOrInsert(
    ['email' => 'sultanaanika131@gmail.com'],
    [
        'name'       => 'Anika',
        'password'   => Hash::make('admin123'),
        'is_admin'   => true,
        'created_at' => now(),
        'updated_at' => now(),
    ]
);
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('is_admin');
        });
    }
};
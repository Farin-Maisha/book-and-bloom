<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Book extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'author',
        'cover_image',
        'genre',
        'description',
        'pdf_url',
        'available_copies',
    ];

    
    public function borrows()
    {
        return $this->hasMany(Borrow::class);
    }
}
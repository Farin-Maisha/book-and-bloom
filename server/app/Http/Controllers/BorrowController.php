<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\Borrow;
use Illuminate\Http\Request;

class BorrowController extends Controller
{
    public function borrow(Request $request, $bookId)
    {
        $user = $request->user();
        $book = Book::find($bookId);

        if (!$book) {
            return response()->json([
                'success' => false,
                'message' => 'Book not found'
            ], 404);
        }

        if ($book->available_copies < 1) {
            return response()->json([
                'success' => false,
                'message' => 'No copies available'
            ], 400);
        }

        $existing = Borrow::where('user_id', $user->id)
            ->where('book_id', $bookId)
            ->whereNull('returned_at')
            ->first();

        if ($existing) {
            return response()->json([
                'success' => false,
                'message' => 'You already borrowed this book'
            ], 400);
        }

        $borrow = Borrow::create([
            'user_id' => $user->id,
            'book_id' => $bookId,
            'borrowed_at' => now(),
        ]);

        $book->decrement('available_copies');

        return response()->json([
            'success' => true,
            'message' => 'Book borrowed successfully',
            'borrow' => $borrow
        ]);
    }

    public function myBorrows(Request $request)
    {
        $borrows = Borrow::with('book.category')
            ->where('user_id', $request->user()->id)
            ->get();

        return response()->json([
            'success' => true,
            'borrows' => $borrows
        ]);
    }
}
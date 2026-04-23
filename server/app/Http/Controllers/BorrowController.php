<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\Borrow;
use Illuminate\Http\Request;
use Carbon\Carbon;

class BorrowController extends Controller
{
    // POST /api/borrow/{bookId}
    public function borrow(Request $request, $bookId)
    {
        $user = $request->user();
        $book = Book::find($bookId);

        if (!$book) {
            return response()->json(['success' => false, 'message' => 'Book not found'], 404);
        }

        if ($book->available_copies < 1) {
            return response()->json(['success' => false, 'message' => 'No copies available'], 400);
        }

        $existing = Borrow::where('user_id', $user->id)
            ->where('book_id', $bookId)
            ->whereNull('returned_at')
            ->first();

        if ($existing) {
            return response()->json(['success' => false, 'message' => 'You already borrowed this book'], 400);
        }

        $borrow = Borrow::create([
            'user_id'     => $user->id,
            'book_id'     => $bookId,
            'borrowed_at' => now(),
        ]);

        $book->decrement('available_copies');

        return response()->json([
            'success' => true,
            'message' => 'Book borrowed successfully',
            'borrow'  => $borrow,
        ]);
    }

    // GET /api/my-borrows
    public function myBorrows(Request $request)
    {
        $borrows = Borrow::with('book')
            ->where('user_id', $request->user()->id)
            ->orderByDesc('borrowed_at')
            ->get()
            ->map(function ($borrow) {
                $borrowedAt = Carbon::parse($borrow->borrowed_at);
                $dueDate    = $borrowedAt->copy()->addDays(14);

                if ($borrow->returned_at) {
                    $status = 'returned';
                } elseif (now()->gt($dueDate)) {
                    $status = 'overdue';
                } else {
                    $status = 'borrowed';
                }

                // Auto-calculate fine for display (not saved yet)
                $fineAmount = $borrow->fine_amount;
                if ($status === 'overdue' && $fineAmount == 0) {
                    $daysOverdue = now()->diffInDays($dueDate);
                    $fineAmount  = $daysOverdue * 5; // ৳5 per day
                }

                return [
                    'id'             => $borrow->id,
                    'book'           => [
                        'id'          => $borrow->book->id,
                        'title'       => $borrow->book->title,
                        'cover_image' => $borrow->book->cover_image ?? '',
                    ],
                    'issue_date'     => $borrow->borrowed_at,
                    'due_date'       => $dueDate->toDateTimeString(),
                    'return_date'    => $borrow->returned_at,
                    'status'         => $status,
                    'fine_amount'    => $fineAmount,
                    'fine_paid'      => (bool) $borrow->fine_paid,
                    'payment_method' => $borrow->payment_method,
                    'paid_at'        => $borrow->paid_at,
                ];
            });

        return response()->json([
            'success' => true,
            'borrows' => $borrows,
        ]);
    }

    // POST /api/return/{borrowId}
    public function returnBook(Request $request, $borrowId)
    {
        $borrow = Borrow::where('id', $borrowId)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        if ($borrow->returned_at) {
            return response()->json(['success' => false, 'message' => 'Already returned'], 400);
        }

        $dueDate    = Carbon::parse($borrow->borrowed_at)->addDays(14);
        $fineAmount = 0;

        if (now()->gt($dueDate)) {
            $daysOverdue = now()->diffInDays($dueDate);
            $fineAmount  = $daysOverdue * 5;
        }

        $borrow->update([
            'returned_at' => now(),
            'fine_amount' => $fineAmount,
        ]);

        $borrow->book->increment('available_copies');

        return response()->json([
            'success'     => true,
            'message'     => 'Book returned successfully',
            'fine_amount' => $fineAmount,
        ]);
    }

    // POST /api/borrows/{id}/pay-fine
    public function payFine(Request $request, $id)
    {
        $request->validate([
            'payment_method' => 'required|string|in:bkash,nagad',
        ]);

        $borrow = Borrow::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        if ($borrow->fine_paid) {
            return response()->json(['success' => false, 'message' => 'Fine already paid'], 400);
        }

        if ($borrow->paid_at) {
            return response()->json(['success' => false, 'message' => 'Payment already submitted, awaiting confirmation'], 400);
        }

        // Persist fine amount to DB if not already saved
        if ($borrow->fine_amount == 0) {
            $dueDate     = Carbon::parse($borrow->borrowed_at)->addDays(14);
            $daysOverdue = (int) now()->diffInDays($dueDate);
            if (now()->gt($dueDate) && $daysOverdue > 0) {
                $borrow->fine_amount = $daysOverdue * 5;
            }
        }

        $borrow->payment_method = $request->payment_method;
        $borrow->paid_at        = now();
        $borrow->save();

        return response()->json([
            'success'        => true,
            'message'        => 'Payment submitted. Awaiting admin confirmation.',
            'fine_amount'    => $borrow->fine_amount,
            'payment_method' => $borrow->payment_method,
            'paid_at'        => $borrow->paid_at,
        ]);
    }
}
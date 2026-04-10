<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\User;
use App\Models\Borrow;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    // ── Guard ──────────────────────────────────────────────────────────────────
    private function ensureAdmin(Request $request)
    {
        if (!$request->user()?->is_admin) {
            abort(403, 'Admin access only.');
        }
    }

    // GET /api/admin/stats
    public function stats(Request $request)
    {
        $this->ensureAdmin($request);

        // active_borrows = not yet returned
        $activeBorrows = Borrow::whereNull('returned_at')->count();

        // total fines collected (confirmed paid)
        $totalFines = Borrow::where('fine_paid', true)->sum('fine_amount');

        // pending = user submitted payment but admin hasn't confirmed yet
        $pendingFines = Borrow::where('fine_paid', false)
            ->whereNotNull('payment_method')
            ->whereNotNull('paid_at')
            ->count();

        return response()->json([
            'total_books'    => Book::count(),
            'total_users'    => User::count(),
            'active_borrows' => $activeBorrows,
            'total_fines'    => $totalFines,
            'pending_fines'  => $pendingFines,
        ]);
    }

    // GET /api/admin/borrows
    public function borrows(Request $request)
    {
        $this->ensureAdmin($request);

        $borrows = Borrow::with(['user:id,name', 'book:id,title'])
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($borrow) {
                // Calculate due_date as 14 days after borrowed_at
                $borrowedAt = \Carbon\Carbon::parse($borrow->borrowed_at);
                $dueDate    = $borrowedAt->copy()->addDays(14);

                // Derive status
                if ($borrow->returned_at) {
                    $status = 'returned';
                } elseif (now()->gt($dueDate)) {
                    $status = 'overdue';
                } else {
                    $status = 'borrowed';
                }

                // Auto-calculate fine if overdue and not returned
                $fineAmount = $borrow->fine_amount;
                if ($status === 'overdue' && $fineAmount == 0) {
                    $daysOverdue = now()->diffInDays($dueDate);
                    $fineAmount  = $daysOverdue * 5; // ৳5 per day
                }

                return [
                    'id'             => $borrow->id,
                    'user'           => $borrow->user,
                    'book'           => $borrow->book,
                    'issue_date'     => $borrow->borrowed_at,
                    'due_date'       => $dueDate->toDateTimeString(),
                    'status'         => $status,
                    'fine_amount'    => $fineAmount,
                    'fine_paid'      => (bool) $borrow->fine_paid,
                    'payment_method' => $borrow->payment_method,
                    'paid_at'        => $borrow->paid_at,
                ];
            });

        return response()->json(['borrows' => $borrows]);
    }

    // GET /api/admin/logs
    public function logs(Request $request)
    {
        $this->ensureAdmin($request);

        $logs = DB::table('audit_logs')
            ->orderByDesc('created_at')
            ->limit(100)
            ->get();

        return response()->json(['logs' => $logs]);
    }

    // POST /api/admin/borrows/{id}/confirm-fine
    public function confirmFine(Request $request, $id)
    {
        $this->ensureAdmin($request);

        $borrow = Borrow::findOrFail($id);

        // Save the fine amount if it wasn't saved yet
        if ($borrow->fine_amount == 0) {
            $dueDate     = \Carbon\Carbon::parse($borrow->borrowed_at)->addDays(14);
            $daysOverdue = now()->diffInDays($dueDate);
            $borrow->fine_amount = $daysOverdue * 5;
        }

        $borrow->fine_paid = true;
        $borrow->save();

        return response()->json(['success' => true]);
    }
}
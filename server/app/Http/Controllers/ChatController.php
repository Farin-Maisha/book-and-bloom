<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ChatController extends Controller
{
    public function reply(Request $request)
    {
        $request->validate(['message' => 'required|string|max:500']);
        $userText = strtolower(trim($request->input('message')));
        $reply = $this->getBotReply($userText);
        return response()->json(['reply' => $reply]);
    }

    private function getBotReply(string $text): string
    {
        // ── Opening hours ─────────────────────────────────────────────────────
        if ($this->matches($text, ['hour', 'opening', 'open', 'close', 'schedule', 'time'])) {
            return "We're open Saturday–Thursday, 9 AM – 8 PM. Friday is our day off! 🕘";
        }

        // ── Location ──────────────────────────────────────────────────────────
        if ($this->matches($text, ['location', 'address', 'where', 'direction'])) {
            return "We're at 42 Banani Road, Dhaka 1213 — right next to Banani park! 📍";
        }

        // ── Contact ───────────────────────────────────────────────────────────
        if ($this->matches($text, ['contact', 'phone', 'email', 'call', 'reach'])) {
            return "📞 +880 1700-123456\n📧 hello@bookandbloom.com\nWe'd love to hear from you!";
        }

        // ── Borrow / Return / Fine ────────────────────────────────────────────
        if ($this->matches($text, ['borrow', 'return', 'fine', 'due', 'late', 'penalty'])) {
            return "📚 Borrow up to 3 books for 14 days.\n⚠️ Late returns: ৳10/day fine.\nReturn at the front desk or drop-box!";
        }

        // ── Membership ────────────────────────────────────────────────────────
        if ($this->matches($text, ['membership', 'member', 'fee', 'join', 'subscription', 'cost', 'price'])) {
            $totalMembers = DB::table('users')->where('is_admin', 0)->count();
            return "Annual membership is just ৳500! 🎉\nBorrow up to 3 books at a time for 14 days.\nJoin our {$totalMembers} happy members today!";
        }

        // ── Upcoming events ───────────────────────────────────────────────────
        if ($this->matches($text, ['event', 'upcoming', 'program', 'session', 'workshop', 'activity'])) {
            $events = DB::table('events')
                ->where('event_date', '>=', Carbon::today())
                ->where('status', 'published')
                ->orderBy('event_date')
                ->orderBy('event_time')
                ->select('title', 'event_date', 'event_time', 'max_seats')
                ->limit(4)
                ->get();

            if ($events->isEmpty()) {
                return "No upcoming events right now. Check back soon or visit our Events page! 🗓️";
            }

            $result = "Upcoming events at Book&Bloom 🗓️\n\n";
            foreach ($events as $event) {
                $date = Carbon::parse($event->event_date)->format('D, M j');
                $time = Carbon::parse($event->event_time)->format('g:i A');
                $result .= "📅 {$event->title}\n   {$date} at {$time} · {$event->max_seats} seats\n\n";
            }
            $result .= "Visit our Events page to register!";
            return trim($result);
        }

        // ── New arrivals ──────────────────────────────────────────────────────
        if ($this->matches($text, ['new arrival', 'latest', 'recent', 'newly added', 'new book'])) {
            $books = DB::table('books')
                ->orderBy('created_at', 'desc')
                ->select('title', 'author', 'available_copies')
                ->limit(5)
                ->get();

            if ($books->isEmpty()) {
                return "No books in our collection yet. Check back soon!";
            }

            $result = "Our latest arrivals 🆕📚\n\n";
            foreach ($books as $book) {
                $status = $book->available_copies > 0 ? "✅" : "❌";
                $result .= "{$status} {$book->title} — {$book->author}\n";
            }
            return trim($result);
        }

        // ── Total books count ─────────────────────────────────────────────────
        if ($this->matches($text, ['how many book', 'total book', 'count book'])) {
            $total = DB::table('books')->count();
            $available = DB::table('books')->where('available_copies', '>', 0)->count();
            return "We have {$total} books in our collection! 📚\n{$available} books are currently available to borrow.";
        }

        // ── Categories ────────────────────────────────────────────────────────
        if ($this->matches($text, ['categor', 'genre', 'section'])) {
            $categories = DB::table('categories')->select('name')->get();
            if ($categories->isEmpty()) {
                return "We're still setting up our categories. Check back soon!";
            }
            $names = $categories->pluck('name')->join(', ');
            return "We have books in these categories 📖\n{$names}\n\nAsk me to search for a specific one!";
        }

        // ── Rooms ─────────────────────────────────────────────────────────────
        if ($this->matches($text, ['room', 'space', 'hall', 'venue', 'reserve'])) {
            $rooms = DB::table('rooms')->select('name')->get();
            if ($rooms->isEmpty()) {
                return "Room info isn't available right now. Please contact us directly!";
            }
            $names = $rooms->pluck('name')->join(', ');
            return "We have these spaces available 🏛️\n{$names}\n\nContact us at +880 1700-123456 to reserve!";
        }

        // ── Book search ───────────────────────────────────────────────────────
        // This runs LAST so specific keywords above take priority.
        // Any message with 2+ chars that didn't match above = treat as book search.
        $books = DB::table('books')
            ->where('title', 'like', "%{$text}%")
            ->orWhere('author', 'like', "%{$text}%")
            ->select('title', 'author', 'available_copies')
            ->limit(3)
            ->get();

        if ($books->isNotEmpty()) {
            $result = "Here's what I found 📚\n\n";
            foreach ($books as $book) {
                $status = $book->available_copies > 0
                    ? "✅ {$book->available_copies} copy available"
                    : "❌ Not available";
                $result .= "• {$book->title} by {$book->author} — {$status}\n";
            }
            return trim($result);
        }

        // ── Greetings (after everything else) ────────────────────────────────
        if ($this->matches($text, ['hello', 'hi', 'hey', 'salaam'])) {
            return "Hey! Welcome to Book&Bloom 👋 Ask me about books, events, membership, or anything else!";
        }

        // ── Thanks ────────────────────────────────────────────────────────────
        if ($this->matches($text, ['thank', 'thanks'])) {
            return "You're welcome! Happy reading! 📖";
        }

        // ── Fallback ──────────────────────────────────────────────────────────
        return "Hmm, I'm not sure about that one 🤔\nYou can ask me about:\n• 📚 Books & new arrivals\n• 🗓️ Upcoming events\n• 💳 Membership\n• ⏰ Opening hours\n• 📍 Location & contact";
    }

    private function matches(string $text, array $keywords): bool
    {
        foreach ($keywords as $keyword) {
            if (str_contains($text, $keyword)) {
                return true;
            }
        }
        return false;
    }
}
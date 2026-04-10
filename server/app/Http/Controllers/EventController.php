<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class EventController extends Controller
{
    // GET /api/events
    public function index()
    {
        $events = DB::select("
            SELECT 
                e.id,
                e.title,
                e.description,
                CONVERT(VARCHAR, e.event_date, 23) AS date,
                CONVERT(VARCHAR, e.event_time, 108) AS time,
                r.name AS location,
                ec.name AS tag,
                e.max_seats AS seats,
                e.max_seats - ISNULL((
                    SELECT COUNT(*) FROM event_registrations er 
                    WHERE er.event_id = e.id AND er.status = 'confirmed'
                ), 0) AS seatsLeft
            FROM events e
            JOIN event_categories ec ON e.event_category_id = ec.id
            JOIN rooms r ON e.room_id = r.id
            WHERE e.status = 'published'
            ORDER BY e.event_date ASC
        ");

        // Add tagColor based on tag name
        $colorMap = [
            'Book Club'   => '#C8B8E8',
            'Workshop'    => '#B8D8B8',
            'Author Talk' => '#F0D8A8',
            'Kids'        => '#FAC8C8',
        ];

        $iconMap = [
            'Book Club'   => '📖',
            'Workshop'    => '✍️',
            'Author Talk' => '🎤',
            'Kids'        => '🧒',
        ];

        $events = array_map(function($event) use ($colorMap, $iconMap) {
            $event->tagColor = $colorMap[$event->tag] ?? '#E0D0C0';
            $event->icon     = $iconMap[$event->tag]  ?? '📅';
            $event->seats    = (int)$event->seats;
            $event->seatsLeft = (int)$event->seatsLeft;
            $event->id       = (int)$event->id;
            return $event;
        }, $events);

        return response()->json(['success' => true, 'events' => $events]);
    }

    // GET /api/events/:id
    public function show($id)
    {
        $events = DB::select("
            SELECT 
                e.id,
                e.title,
                e.description,
                CONVERT(VARCHAR, e.event_date, 23) AS date,
                CONVERT(VARCHAR, e.event_time, 108) AS time,
                r.name AS location,
                ec.name AS tag,
                e.max_seats AS seats,
                e.max_seats - ISNULL((
                    SELECT COUNT(*) FROM event_registrations er 
                    WHERE er.event_id = e.id AND er.status = 'confirmed'
                ), 0) AS seatsLeft
            FROM events e
            JOIN event_categories ec ON e.event_category_id = ec.id
            JOIN rooms r ON e.room_id = r.id
            WHERE e.id = ?
        ", [$id]);

        if (empty($events)) {
            return response()->json(['success' => false, 'message' => 'Event not found'], 404);
        }

        $event = $events[0];
        $colorMap = [
            'Book Club'   => '#C8B8E8',
            'Workshop'    => '#B8D8B8',
            'Author Talk' => '#F0D8A8',
            'Kids'        => '#FAC8C8',
        ];
        $iconMap = [
            'Book Club'   => '📖',
            'Workshop'    => '✍️',
            'Author Talk' => '🎤',
            'Kids'        => '🧒',
        ];
        $event->tagColor  = $colorMap[$event->tag] ?? '#E0D0C0';
        $event->icon      = $iconMap[$event->tag]  ?? '📅';
        $event->seats     = (int)$event->seats;
        $event->seatsLeft = (int)$event->seatsLeft;
        $event->id        = (int)$event->id;

        return response()->json(['success' => true, 'event' => $event]);
    }

    // POST /api/events/:id/register
    public function register(Request $request, $id)
    {
        $user = $request->user();

        // Check if already registered
        $existing = DB::select("
            SELECT id FROM event_registrations 
            WHERE user_id = ? AND event_id = ?
        ", [$user->id, $id]);

        if (!empty($existing)) {
            return response()->json(['success' => false, 'message' => 'Already registered'], 400);
        }

        // Check seats
        $events = DB::select("
            SELECT max_seats - ISNULL((
                SELECT COUNT(*) FROM event_registrations er 
                WHERE er.event_id = e.id AND er.status = 'confirmed'
            ), 0) AS seatsLeft
            FROM events e WHERE e.id = ?
        ", [$id]);

        if (empty($events) || $events[0]->seatsLeft <= 0) {
            return response()->json(['success' => false, 'message' => 'No seats available'], 400);
        }

        // Register
        DB::insert("
            INSERT INTO event_registrations (user_id, event_id, status, registered_at, created_at, updated_at)
            VALUES (?, ?, 'confirmed', GETDATE(), GETDATE(), GETDATE())
        ", [$user->id, $id]);

        $registration = DB::select("
            SELECT TOP 1 * FROM event_registrations 
            WHERE user_id = ? AND event_id = ?
            ORDER BY id DESC
        ", [$user->id, $id]);

        return response()->json([
            'success'      => true,
            'message'      => 'Registered successfully',
            'registration' => $registration[0]
        ]);
    }
}
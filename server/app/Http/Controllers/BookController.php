<?php

namespace App\Http\Controllers;

use App\Models\Book;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BookController extends Controller
{
    // GET /api/books
    public function index(Request $request)
    {
        $query = Book::query(); // ✅ removed ->with('category')

        if ($request->has('genre')) { // ✅ filter by genre instead of category_id
            $query->where('genre', $request->genre);
        }

        if ($request->has('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('title',  'like', '%' . $request->search . '%')
                  ->orWhere('author', 'like', '%' . $request->search . '%');
            });
        }

        return response()->json([
            'success' => true,
            'books'   => $query->get(),
        ]);
    }

    // GET /api/books/{id}
    public function show($id)
    {
        $book = Book::find($id); // ✅ removed ->with('category')

        if (!$book) {
            return response()->json(['success' => false, 'message' => 'Book not found'], 404);
        }

        return response()->json(['success' => true, 'book' => $book]);
    }

    // POST /api/books  (admin)
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'            => 'required|string|max:255',
            'author'           => 'required|string|max:255',
            'genre'            => 'nullable|string|max:100',
            'available_copies' => 'required|integer|min:0',
            'cover_image'      => 'nullable|string',
            'description'      => 'nullable|string',
        ]);

        $book = Book::create([
            'title'            => $request->title,
            'author'           => $request->author,
            'available_copies' => $request->available_copies,
            'cover_image'      => $request->cover_image  ?? null,
            'description'      => $request->description  ?? null,
            'genre'            => $request->genre         ?? null,
        ]);

        DB::table('audit_logs')->insert([
            'action'            => 'book_added',
            'entity_type'       => 'book',
            'entity_id'         => $book->id,
            'entity_name'       => $book->title,
            'changes'           => json_encode([
                'title'            => $book->title,
                'author'           => $book->author,
                'available_copies' => $book->available_copies,
            ]),
            'performed_by'      => $request->user()->id,
            'performed_by_name' => $request->user()->name,
            'created_at'        => now(),
            'updated_at'        => now(),
        ]);

        return response()->json(['success' => true, 'book' => $book], 201); // ✅ removed ->load('category')
    }

    // PUT /api/books/{id}  (admin)
    public function update(Request $request, $id)
    {
        $book = Book::findOrFail($id);
        $old  = $book->only(['title', 'author', 'available_copies', 'genre']);

        $request->validate([
            'title'            => 'required|string|max:255',
            'author'           => 'required|string|max:255',
            'available_copies' => 'required|integer|min:0',
            'genre'            => 'nullable|string|max:100', // ✅ added
        ]);

        $book->update($request->only(['title', 'author', 'available_copies', 'genre'])); // ✅ added genre

        $changes = [];
        foreach (['title', 'author', 'available_copies', 'genre'] as $field) { // ✅ added genre
            if ((string) $old[$field] !== (string) $book->$field) {
                $changes[$field] = ['from' => $old[$field], 'to' => $book->$field];
            }
        }

        DB::table('audit_logs')->insert([
            'action'            => 'book_edited',
            'entity_type'       => 'book',
            'entity_id'         => $book->id,
            'entity_name'       => $book->title,
            'changes'           => json_encode($changes),
            'performed_by'      => $request->user()->id,
            'performed_by_name' => $request->user()->name,
            'created_at'        => now(),
            'updated_at'        => now(),
        ]);

        return response()->json(['success' => true, 'book' => $book]); // ✅ removed ->load('category')
    }

    // DELETE /api/books/{id}  (admin)
    public function destroy(Request $request, $id)
    {
        $book = Book::findOrFail($id);
        $title = $book->title;
        $book->delete();

        DB::table('audit_logs')->insert([
            'action'            => 'book_deleted',
            'entity_type'       => 'book',
            'entity_id'         => $id,
            'entity_name'       => $title,
            'changes'           => json_encode([]),
            'performed_by'      => $request->user()->id,
            'performed_by_name' => $request->user()->name,
            'created_at'        => now(),
            'updated_at'        => now(),
        ]);

        return response()->json(['success' => true, 'message' => 'Book deleted']);
    }
}
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\Book;

class DatabaseSeeder extends Seeder
{
    public function run()
    {
        $categories = [
            'Fiction', 'Non-Fiction', 'Mystery & Thriller',
            'Romance', 'Fantasy', 'Science Fiction',
            'Historical', 'Poetry', 'Self-Help & Wellness',
            'Travel & Adventure', 'Biography', "Children's Books",
        ];

        foreach ($categories as $name) {
            Category::create(['name' => $name]);
        }

        $books = [
            ['title' => 'Harry Potter and the Sorcerer Stone', 'author' => 'J.K. Rowling', 'cover_image' => 'https://covers.openlibrary.org/b/id/10110415-M.jpg', 'category_id' => 5],
            ['title' => 'Harry Potter and the Chamber of Secrets', 'author' => 'J.K. Rowling', 'cover_image' => 'https://covers.openlibrary.org/b/id/8234464-M.jpg', 'category_id' => 5],
            ['title' => 'Atomic Habits', 'author' => 'James Clear', 'cover_image' => 'https://covers.openlibrary.org/b/id/10521300-M.jpg', 'category_id' => 9],
            ['title' => 'The Kite Runner', 'author' => 'Khaled Hosseini', 'cover_image' => 'https://covers.openlibrary.org/b/id/8231432-M.jpg', 'category_id' => 1],
            ['title' => 'The Alchemist', 'author' => 'Paulo Coelho', 'cover_image' => 'https://covers.openlibrary.org/b/id/8299276-M.jpg', 'category_id' => 1],
            ['title' => 'Dune', 'author' => 'Frank Herbert', 'cover_image' => 'https://covers.openlibrary.org/b/id/10921904-M.jpg', 'category_id' => 6],
            ['title' => 'Pride and Prejudice', 'author' => 'Jane Austen', 'cover_image' => 'https://covers.openlibrary.org/b/id/9309929-M.jpg', 'category_id' => 4],
            ['title' => '1984', 'author' => 'George Orwell', 'cover_image' => 'https://covers.openlibrary.org/b/id/11083374-M.jpg', 'category_id' => 6],
            ['title' => 'Gone Girl', 'author' => 'Gillian Flynn', 'cover_image' => 'https://covers.openlibrary.org/b/id/8392949-M.jpg', 'category_id' => 3],
            ['title' => 'Sapiens', 'author' => 'Yuval Noah Harari', 'cover_image' => 'https://covers.openlibrary.org/b/id/8739192-M.jpg', 'category_id' => 2],
            ['title' => 'The Hobbit', 'author' => 'J.R.R. Tolkien', 'cover_image' => 'https://covers.openlibrary.org/b/id/8406789-M.jpg', 'category_id' => 5],
            ['title' => 'Becoming', 'author' => 'Michelle Obama', 'cover_image' => 'https://covers.openlibrary.org/b/id/8740698-M.jpg', 'category_id' => 11],
            ['title' => 'The Silent Patient', 'author' => 'Alex Michaelides', 'cover_image' => 'https://covers.openlibrary.org/b/id/8740694-M.jpg', 'category_id' => 3],
            ['title' => 'The Book Thief', 'author' => 'Markus Zusak', 'cover_image' => 'https://covers.openlibrary.org/b/id/8406801-M.jpg', 'category_id' => 1],
        ];

        foreach ($books as $book) {
            Book::create(array_merge($book, ['available_copies' => 3]));
        }
    }
}
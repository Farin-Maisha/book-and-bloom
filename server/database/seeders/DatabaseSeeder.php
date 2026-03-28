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
    ['title' => 'Harry Potter and the Sorcerer Stone', 'author' => 'J.K. Rowling', 'cover_image' => 'https://books.google.com/books/content?id=wrOQLV6xB-wC&printsec=frontcover&img=1&zoom=1', 'category_id' => 5],
    ['title' => 'Harry Potter and the Chamber of Secrets', 'author' => 'J.K. Rowling', 'cover_image' => 'https://books.google.com/books/content?id=5iTebBW_-XAC&printsec=frontcover&img=1&zoom=1', 'category_id' => 5],
    ['title' => 'Atomic Habits', 'author' => 'James Clear', 'cover_image' => 'https://books.google.com/books/content?id=XfFvDwAAQBAJ&printsec=frontcover&img=1&zoom=1', 'category_id' => 9],
    ['title' => 'The Kite Runner', 'author' => 'Khaled Hosseini', 'cover_image' => 'https://books.google.com/books/content?id=CFteNgAACAAJ&printsec=frontcover&img=1&zoom=1', 'category_id' => 1],
    ['title' => 'The Alchemist', 'author' => 'Paulo Coelho', 'cover_image' => 'https://books.google.com/books/content?id=FzVjBgAAQBAJ&printsec=frontcover&img=1&zoom=1', 'category_id' => 1],
    ['title' => 'Dune', 'author' => 'Frank Herbert', 'cover_image' => 'https://books.google.com/books/content?id=B5UFEAAAQBAJ&printsec=frontcover&img=1&zoom=1', 'category_id' => 6],
    ['title' => 'Pride and Prejudice', 'author' => 'Jane Austen', 'cover_image' => 'https://books.google.com/books/content?id=J4a6AAAAMAAJ&printsec=frontcover&img=1&zoom=1', 'category_id' => 4],
    ['title' => '1984', 'author' => 'George Orwell', 'cover_image' => 'https://books.google.com/books/content?id=kotPYEqx7kMC&printsec=frontcover&img=1&zoom=1', 'category_id' => 6],
    ['title' => 'Gone Girl', 'author' => 'Gillian Flynn', 'cover_image' => 'https://books.google.com/books/content?id=btkMMzEBuIAC&printsec=frontcover&img=1&zoom=1', 'category_id' => 3],
    ['title' => 'Sapiens', 'author' => 'Yuval Noah Harari', 'cover_image' => 'https://books.google.com/books/content?id=1EiJAwAAQBAJ&printsec=frontcover&img=1&zoom=1', 'category_id' => 2],
    ['title' => 'The Hobbit', 'author' => 'J.R.R. Tolkien', 'cover_image' => 'https://books.google.com/books/content?id=pD6arNyKyi8C&printsec=frontcover&img=1&zoom=1', 'category_id' => 5],
    ['title' => 'Becoming', 'author' => 'Michelle Obama', 'cover_image' => 'https://books.google.com/books/content?id=4XFvDwAAQBAJ&printsec=frontcover&img=1&zoom=1', 'category_id' => 11],
    ['title' => 'The Silent Patient', 'author' => 'Alex Michaelides', 'cover_image' => 'https://books.google.com/books/content?id=s9ZEDwAAQBAJ&printsec=frontcover&img=1&zoom=1', 'category_id' => 3],
    ['title' => 'The Book Thief', 'author' => 'Markus Zusak', 'cover_image' => 'https://books.google.com/books/content?id=mfNbH80ZRDMC&printsec=frontcover&img=1&zoom=1', 'category_id' => 1],
    ['title' => 'The Midnight Library', 'author' => 'Matt Haig', 'cover_image' => 'https://books.google.com/books/content?id=vOXmDwAAQBAJ&printsec=frontcover&img=1&zoom=1', 'category_id' => 1],
    ['title' => 'Little Women', 'author' => 'Louisa May Alcott', 'cover_image' => 'https://books.google.com/books/content?id=R3NZAAAAYAAJ&printsec=frontcover&img=1&zoom=1', 'category_id' => 1],
    ['title' => 'To Kill a Mockingbird', 'author' => 'Harper Lee', 'cover_image' => 'https://books.google.com/books/content?id=PGR2AwAAQBAJ&printsec=frontcover&img=1&zoom=1', 'category_id' => 1],
    ['title' => 'The Great Gatsby', 'author' => 'F. Scott Fitzgerald', 'cover_image' => 'https://books.google.com/books/content?id=iXn5U2IziiYC&printsec=frontcover&img=1&zoom=1', 'category_id' => 1],
    ['title' => 'The Hunger Games', 'author' => 'Suzanne Collins', 'cover_image' => 'https://books.google.com/books/content?id=sazytgAACAAJ&printsec=frontcover&img=1&zoom=1', 'category_id' => 6],
    ['title' => 'Brave New World', 'author' => 'Aldous Huxley', 'cover_image' => 'https://books.google.com/books/content?id=FeNbAAAAMAAJ&printsec=frontcover&img=1&zoom=1', 'category_id' => 6],
    ['title' => 'Circe', 'author' => 'Madeline Miller', 'cover_image' => 'https://books.google.com/books/content?id=XdZEDwAAQBAJ&printsec=frontcover&img=1&zoom=1', 'category_id' => 5],
    ['title' => 'Normal People', 'author' => 'Sally Rooney', 'cover_image' => 'https://books.google.com/books/content?id=s9hsDwAAQBAJ&printsec=frontcover&img=1&zoom=1', 'category_id' => 4],
];
        foreach ($books as $book) {
            Book::create(array_merge($book, ['available_copies' => 3]));
        }
    }
}
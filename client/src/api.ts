import axios, { AxiosInstance } from 'axios';
import { secrets }              from './secrets';
import toast                    from 'react-hot-toast';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: secrets.backendEndpoint,
      headers: { 'Content-Type': 'application/json' },
    });

    // ── Request interceptor ────────────────────────────────────────────────
    // Runs before EVERY request. Reads the token saved by Login.tsx and adds it.
    // This means every page automatically sends auth without extra code.
    this.client.interceptors.request.use(config => {
      const token = localStorage.getItem('token');
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // AUTH
  // ══════════════════════════════════════════════════════════════════════════

  // POST /api/signup
  async signup(name: string, email: string, password: string) {
    try {
      const response = await this.client.post('/api/signup', { name, email, password });
      return response.data;
    } catch (error) { this.handleError(error); }
  }

  // POST /api/login  →  returns { token, user }
  async login(email: string, password: string) {
    try {
      const response = await this.client.post('/api/login', { email, password });
      return response.data;
    } catch (error) { this.handleError(error); }
  }

  // GET /api/user  →  returns { user: { id, name, email, is_admin, ... } }
  // Used by Admin.tsx to verify the user is an admin before showing the page.
  async getUser() {
    try {
      const response = await this.client.get('/api/user');
      return response.data;
    } catch (error) { this.handleError(error); }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // BOOKS
  // ══════════════════════════════════════════════════════════════════════════

  // GET /api/books  →  returns { books: [...] }
  async getBooks() {
    try {
      const response = await this.client.get('/api/books');
      return response.data;
    } catch (error) { this.handleError(error); }
  }

  // GET /api/books/{id}  →  returns { book: {...} }
  async getBook(id: number) {
    try {
      const response = await this.client.get(`/api/books/${id}`);
      return response.data;
    } catch (error) { this.handleError(error); }
  }

  // POST /api/books  →  add a book (admin only, protected by CheckAdminCredentials)
  // Body: { title, author, cover_image, category_id, description, available_copies }
  async addBook(book: {
    title: string;
    author: string;
    cover_image?: string;
    category_id?: number | string;
    description?: string;
    available_copies: number;
  }) {
    try {
      const response = await this.client.post('/api/books', book);
      return response.data;
    } catch (error) { this.handleError(error); }
  }

  // DELETE /api/books/{id}  →  delete a book (admin only)
  async deleteBook(id: number) {
    try {
      const response = await this.client.delete(`/api/books/${id}`);
      return response.data;
    } catch (error) { this.handleError(error); }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // CATEGORIES
  // ══════════════════════════════════════════════════════════════════════════

  // GET /api/categories  →  returns { categories: [...] }
  async getCategories() {
    try {
      const response = await this.client.get('/api/categories');
      return response.data;
    } catch (error) { this.handleError(error); }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // BORROWS — USER
  // ══════════════════════════════════════════════════════════════════════════

  // POST /api/borrow/{bookId}  →  borrow a book
  async borrowBook(bookId: number) {
    try {
      const response = await this.client.post(`/api/borrow/${bookId}`);
      return response.data;
    } catch (error) { this.handleError(error); }
  }

  // GET /api/my-borrows  →  returns { borrows: [...] }  (current user's borrows)
  // Used by MyLibrary.tsx
  async getMyBorrows() {
    try {
      const response = await this.client.get('/api/my-borrows');
      return response.data;
    } catch (error) { this.handleError(error); }
  }

  // POST /api/return/{borrowId}  →  return a borrowed book
  // Used by the "Return / Renew" button in MyLibrary.tsx
  // NOTE: Ask your backend dev to create this route in api.php pointing
  //       to BorrowController@return, protected by 'auth:sanctum' middleware.
  async returnBook(borrowId: number) {
    try {
      const response = await this.client.post(`/api/return/${borrowId}`);
      return response.data;
    } catch (error) { this.handleError(error); }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // ADMIN  (all routes protected by CheckAdminCredentials middleware)
  // ══════════════════════════════════════════════════════════════════════════

  // GET /api/admin/stats  →  { total_books, total_users, active_borrows }
  // Gives the three big numbers shown at the top of the Admin dashboard.
  async getAdminStats() {
    try {
      const response = await this.client.get('/api/admin/stats');
      return response.data;
    } catch (error) { this.handleError(error); }
  }

  // GET /api/admin/borrows  →  { borrows: [...] }  (ALL users' borrows, not just current user)
  // Different from getMyBorrows() which is user-scoped.
  async getAllBorrows() {
    try {
      const response = await this.client.get('/api/admin/borrows');
      return response.data;
    } catch (error) { this.handleError(error); }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // ERROR HANDLING
  // ══════════════════════════════════════════════════════════════════════════

  // Centralised error handler — called in every catch block above.
  // Shows a toast to the user and logs details to the console for debugging.
  handleError(error: any) {
    const message = error?.response?.data?.message || error?.message || 'Something went wrong';

    // Log the full error for devs
    if (error?.response) {
      console.error(`API Error ${error.response.status}:`, error.response.data);
    } else {
      console.error('API Error:', message);
    }

    // Show toast to the user
    toast.error(message);
  }
}

export default ApiClient;

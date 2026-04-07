// api.ts
// Updated: registerForEvent accepts form data (name, mobile, email, note)
// Added: getEvent (single event), getMyEventRegistrations
// All endpoints documented with expected backend routes and response shapes.

import axios, { AxiosInstance } from 'axios';
import { secrets } from './secrets';
import toast from 'react-hot-toast';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: secrets.backendEndpoint,
      headers: { 'Content-Type': 'application/json' },
    });

    // Auto-attach Bearer token to every request
    this.client.interceptors.request.use(config => {
      const token = localStorage.getItem('token');
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
  }

  // ── Auth ─────────────────────────────────────────────────────────────────────
  // POST /api/signup  → { token, user }
  async signup(name: string, email: string, password: string) {
    try {
      const res = await this.client.post('/api/signup', { name, email, password });
      return res.data;
    } catch (e) { this.handleError(e); }
  }

  // POST /api/login  → { token, user }
  async login(email: string, password: string) {
    try {
      const res = await this.client.post('/api/login', { email, password });
      return res.data;
    } catch (e) { this.handleError(e); }
  }

  // GET /api/user  → { user: { id, name, email, is_admin } }
  async getUser() {
    try {
      const res = await this.client.get('/api/user');
      return res.data;
    } catch (e) { this.handleError(e); }
  }

  // ── Books ─────────────────────────────────────────────────────────────────────
  // GET /api/books?category_id=1  → { books: [...] }
  async getBooks(params?: Record<string, any>) {
    try {
      const query = params && Object.keys(params).length
        ? '?' + new URLSearchParams(params).toString()
        : '';
      const res = await this.client.get(`/api/books${query}`);
      return res.data;
    } catch (e) { this.handleError(e); }
  }

  // GET /api/books/:id  → { success: true, book: { id, title, author, cover_image, description, available_copies, category } }
  async getBook(id: number) {
    try {
      const res = await this.client.get(`/api/books/${id}`);
      return res.data;
    } catch (e) { this.handleError(e); }
  }

  // POST /api/books  (admin only)
  // Body: { title, author, cover_image?, category_id?, description?, available_copies }
  // → { book: { id, title, author, available_copies, ... } }
  async addBook(book: {
    title: string; author: string; cover_image?: string;
    category_id?: number | string; description?: string; available_copies: number;
  }) {
    try {
      const res = await this.client.post('/api/books', book);
      return res.data;
    } catch (e) { this.handleError(e); }
  }

  // DELETE /api/books/:id  (admin only)  → { success: true }
  async deleteBook(id: number) {
    try {
      const res = await this.client.delete(`/api/books/${id}`);
      return res.data;
    } catch (e) { this.handleError(e); }
  }

  // ── Categories ────────────────────────────────────────────────────────────────
  // GET /api/categories  → { categories: [{ id, name }] }
  async getCategories() {
    try {
      const res = await this.client.get('/api/categories');
      return res.data;
    } catch (e) { this.handleError(e); }
  }

  // ── Borrow ────────────────────────────────────────────────────────────────────
  // POST /api/borrow/:bookId  → { borrow: { id, book_id, user_id, issue_date, due_date, status } }
  async borrowBook(bookId: number) {
    try {
      const res = await this.client.post(`/api/borrow/${bookId}`);
      return res.data;
    } catch (e) { this.handleError(e); }
  }

  // GET /api/my-borrows
  // → { borrows: [{ id, book: { id, title, cover_image }, issue_date, due_date, return_date, pickup_deadline, status }] }
  async getMyBorrows() {
    try {
      const res = await this.client.get('/api/my-borrows');
      return res.data;
    } catch (e) { this.handleError(e); }
  }

  // ── Reservations ──────────────────────────────────────────────────────────────
  // POST /api/reserve/:bookId
  // → { reservation: { id, book_id, user_id, status: "reserved", pickup_deadline, issue_date, due_date } }
  async reserveBook(bookId: number) {
    try {
      const res = await this.client.post(`/api/reserve/${bookId}`);
      return res.data;
    } catch (e) { this.handleError(e); }
  }

  // POST /api/reserve/:id/cancel  → { success: true }
  async cancelReservation(reservationId: number) {
    try {
      const res = await this.client.post(`/api/reserve/${reservationId}/cancel`);
      return res.data;
    } catch (e) { this.handleError(e); }
  }

  // POST /api/reserve/:id/confirm-pickup  (admin)  → { success: true, status: "issued" }
  async confirmPickup(reservationId: number) {
    try {
      const res = await this.client.post(`/api/reserve/${reservationId}/confirm-pickup`);
      return res.data;
    } catch (e) { this.handleError(e); }
  }

  // GET /api/my-reservations  → { reservations: [...] }
  async getMyReservations() {
    try {
      const res = await this.client.get('/api/my-reservations');
      return res.data;
    } catch (e) { this.handleError(e); }
  }

  // ── Return ────────────────────────────────────────────────────────────────────
  // POST /api/return/:borrowId  → { success: true, status: "returned" }
  async returnBook(borrowId: number) {
    try {
      const res = await this.client.post(`/api/return/${borrowId}`);
      return res.data;
    } catch (e) { this.handleError(e); }
  }

  // ── Events ────────────────────────────────────────────────────────────────────
  // GET /api/events
  // → { events: [{ id, title, description, date, time, location, tag, tagColor, seats, seatsLeft }] }
  async getEvents() {
    try {
      const res = await this.client.get('/api/events');
      return res.data;
    } catch (e) { this.handleError(e); }
  }

  // GET /api/events/:id
  // → { event: { id, title, description, date, time, location, tag, seats, seatsLeft } }
  async getEvent(eventId: number) {
    try {
      const res = await this.client.get(`/api/events/${eventId}`);
      return res.data;
    } catch (e) { this.handleError(e); }
  }

  // POST /api/events/:id/register
  // Body: { name, mobile, email?, note? }
  // → { registration: { id, event_id, user_id, name, mobile, status: "confirmed", created_at } }
  async registerForEvent(
    eventId: number,
    data?: { name: string; mobile: string; email?: string; note?: string },
  ) {
    try {
      const res = await this.client.post(`/api/events/${eventId}/register`, data ?? {});
      return res.data;
    } catch (e) { this.handleError(e); }
  }

  // DELETE /api/events/:id/register  → { success: true }
  async cancelEventRegistration(eventId: number) {
    try {
      const res = await this.client.delete(`/api/events/${eventId}/register`);
      return res.data;
    } catch (e) { this.handleError(e); }
  }

  // GET /api/my-event-registrations
  // → { registrations: [{ id, event: { id, title, date, time, location, tag }, status, created_at }] }
  async getMyEventRegistrations() {
    try {
      const res = await this.client.get('/api/my-event-registrations');
      return res.data;
    } catch (e) { this.handleError(e); }
  }

  // ── Admin ─────────────────────────────────────────────────────────────────────
  // GET /api/admin/stats  → { total_books, total_users, active_borrows }
  async getAdminStats() {
    try {
      const res = await this.client.get('/api/admin/stats');
      return res.data;
    } catch (e) { this.handleError(e); }
  }

  // GET /api/admin/borrows  → { borrows: [{ id, user: { name }, book: { title }, issue_date, due_date, status }] }
  async getAllBorrows() {
    try {
      const res = await this.client.get('/api/admin/borrows');
      return res.data;
    } catch (e) { this.handleError(e); }
  }

  // ── Error handler ─────────────────────────────────────────────────────────────
  handleError(error: any) {
    const msg =
      error?.response?.data?.message ||
      error?.message ||
      'Something went wrong';
    console.error('API Error:', msg, error);
    toast.error(msg);
  }
}

export default ApiClient;
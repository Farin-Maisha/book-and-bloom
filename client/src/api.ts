import axios, { AxiosInstance } from 'axios';
import { secrets } from './secrets';
import toast from 'react-hot-toast';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: secrets.backendEndpoint,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.request.use(config => {
      const token = localStorage.getItem('token');
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
  }

  // ── Auth ────────────────────────────────────────────────────────────────────

  async signup(name: string, email: string, password: string) {
    try {
      const response = await this.client.post('/api/signup', { name, email, password });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async login(email: string, password: string) {
    try {
      const response = await this.client.post('/api/login', { email, password });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async verifyEmail(userId: number, code: string) {
    try {
      const response = await this.client.post('/api/verify-email', { user_id: userId, code });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async resendCode(userId: number) {
    try {
      const response = await this.client.post('/api/resend-code', { user_id: userId });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async googleAuth(idToken: string) {
    try {
      const response = await this.client.post('/api/auth/google', { id_token: idToken });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async payFee(userId: number) {
    try {
      const response = await this.client.post('/api/pay-fee', { user_id: userId });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getUser() {
    try {
      const response = await this.client.get('/api/user');
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ── Books ───────────────────────────────────────────────────────────────────

  async getBooks(params?: Record<string, any>) {
    try {
      const query = params && Object.keys(params).length
        ? "?" + new URLSearchParams(params).toString()
        : "";
      const response = await this.client.get(`/api/books${query}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getBook(id: number) {
    try {
      const response = await this.client.get(`/api/books/${id}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ── Categories ──────────────────────────────────────────────────────────────

  async getCategories() {
    try {
      const response = await this.client.get('/api/categories');
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ── Borrow ──────────────────────────────────────────────────────────────────

  async borrowBook(bookId: number) {
    try {
      const response = await this.client.post(`/api/borrow/${bookId}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getMyBorrows() {
    try {
      const response = await this.client.get('/api/my-borrows');
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ── Return ──────────────────────────────────────────────────────────────────

  async returnBook(borrowId: number) {
    try {
      const response = await this.client.post(`/api/return/${borrowId}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ── Fine Payment ─────────────────────────────────────────────────────────────

  // Called after OTP verified — submits payment to backend (pending admin confirm)
  async submitFinePayment(borrowId: number, method: string) {
    try {
      const response = await this.client.post(`/api/borrows/${borrowId}/pay-fine`, {
        payment_method: method, // 'bkash' or 'nagad'
      });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ── Admin ────────────────────────────────────────────────────────────────────

  async getAdminStats() {
    try {
      const response = await this.client.get('/api/admin/stats');
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getAllBorrows() {
    try {
      const response = await this.client.get('/api/admin/borrows');
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async addBook(book: {
    title: string; author: string; cover_image?: string;
    category_id?: number | string; description?: string; available_copies: number;
  }) {
    try {
      const response = await this.client.post('/api/books', book);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async deleteBook(id: number) {
    try {
      const response = await this.client.delete(`/api/books/${id}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async updateBook(id: number, data: { title: string; author: string; available_copies: number }) {
    try {
      const response = await this.client.put(`/api/books/${id}`, data);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getAuditLogs() {
    try {
      const response = await this.client.get('/api/admin/logs');
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async confirmFine(borrowId: number) {
    try {
      const response = await this.client.post(`/api/admin/borrows/${borrowId}/confirm-fine`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ── Error handler ───────────────────────────────────────────────────────────

  handleError(error: any): any {
    if (error.response) {
      console.error(`API Error: ${error.response.status} - ${error.response.data?.message}`);
      const data = error.response.data;

      const isSilent = data?.needs_payment || data?.needs_verify;
      if (!isSilent) {
        toast.error(data?.message || 'Something went wrong');
      }

      return data;
    }

    if (error.request) {
      console.error('API Error: No response received', error.request);
      toast.error('No response from server. Please check your connection.');
    } else {
      console.error('API Error:', error.message);
      toast.error(error.message || 'Something went wrong');
    }

    return null;
  }
}

export default ApiClient;
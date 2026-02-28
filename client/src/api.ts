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

    // Auto-attach token to every request
    this.client.interceptors.request.use(config => {
      const token = localStorage.getItem('token');
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
  }

  async signup(name: string, email: string, password: string) {
    try {
      const response = await this.client.post('/api/signup', { name, email, password });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async login(email: string, password: string) {
    try {
      const response = await this.client.post('/api/login', { email, password });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getUser() {
    try {
      const response = await this.client.get('/api/user');
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  handleError(error: any) {
    if (error.response) {
      console.error(`API Error: ${error.response.status} - ${error.response.data.message}`);
    } else if (error.request) {
      console.error('API Error: No response received', error.request);
    } else {
      console.error('API Error:', error.message);
    }
    toast.error(error.response?.data?.message || error.message || 'Something went wrong');
  }
}

export default ApiClient;
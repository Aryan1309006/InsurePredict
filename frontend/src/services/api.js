import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'https://insurepredict-s1d6.onrender.com';

const client = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  withCredentials: true, // Enables sending and receiving HttpOnly cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach Bearer token if present (for cross-domain environments)
client.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('insurepredict_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (err) {
    // LocalStorage unavailable
  }
  return config;
});

function formatErrorMessage(error, defaultMessage = 'An unexpected error occurred.') {
  if (error.response) {
    const errorDetail = error.response.data?.detail || error.response.data?.message;
    if (Array.isArray(errorDetail)) {
      // Pydantic validation error array
      return errorDetail.map((err) => `${err.loc?.slice(-1)[0] || 'field'}: ${err.msg}`).join(', ');
    }
    if (typeof errorDetail === 'string') {
      return errorDetail;
    }
    return defaultMessage;
  } else if (error.request) {
    return 'Unable to reach the server. Please check your network connection or verify that the backend is running.';
  }
  return error.message || defaultMessage;
}

export const apiService = {
  // System / Model
  async checkHealth() {
    try {
      const response = await client.get('/api/health');
      return response.data;
    } catch (error) {
      console.warn('Backend health check failed:', error);
      throw new Error(formatErrorMessage(error, 'Health check failed.'));
    }
  },

  async getModelInfo() {
    try {
      const response = await client.get('/api/model-info');
      return response.data;
    } catch (error) {
      console.warn('Failed to fetch model info:', error);
      throw new Error(formatErrorMessage(error, 'Failed to fetch model specifications.'));
    }
  },

  // Authentication
  async register({ name, email, password, confirm_password }) {
    try {
      const response = await client.post('/api/auth/register', {
        name,
        email,
        password,
        confirm_password,
      });
      if (response.data?.access_token) {
        localStorage.setItem('insurepredict_token', response.data.access_token);
      }
      return response.data;
    } catch (error) {
      throw new Error(formatErrorMessage(error, 'Registration failed.'));
    }
  },

  async login({ email, password }) {
    try {
      const response = await client.post('/api/auth/login', {
        email,
        password,
      });
      if (response.data?.access_token) {
        localStorage.setItem('insurepredict_token', response.data.access_token);
      }
      return response.data;
    } catch (error) {
      throw new Error(formatErrorMessage(error, 'Login failed.'));
    }
  },

  async logout() {
    try {
      localStorage.removeItem('insurepredict_token');
      const response = await client.post('/api/auth/logout');
      return response.data;
    } catch (error) {
      localStorage.removeItem('insurepredict_token');
      console.warn('Logout error:', error);
      return { message: 'Logged out.' };
    }
  },

  async getMe() {
    try {
      const response = await client.get('/api/auth/me');
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem('insurepredict_token');
      }
      throw new Error(formatErrorMessage(error, 'Session expired or invalid.'));
    }
  },

  // Predictions (Authenticated)
  async predictCost(payload) {
    try {
      const response = await client.post('/api/predict', payload);
      return response.data;
    } catch (error) {
      throw new Error(formatErrorMessage(error, 'Failed to generate prediction.'));
    }
  },

  async getWhatIf(payload) {
    try {
      const response = await client.post('/api/what-if', payload);
      return response.data;
    } catch (error) {
      console.warn('What-If simulation API failed:', error);
      throw new Error(formatErrorMessage(error, 'Failed to calculate simulations.'));
    }
  },

  async getPredictions() {
    try {
      const response = await client.get('/api/predictions');
      return response.data;
    } catch (error) {
      throw new Error(formatErrorMessage(error, 'Failed to fetch prediction history.'));
    }
  },

  async getStats() {
    try {
      const response = await client.get('/api/predictions/stats');
      return response.data;
    } catch (error) {
      throw new Error(formatErrorMessage(error, 'Failed to load dashboard metrics.'));
    }
  },

  async deletePrediction(id) {
    try {
      const response = await client.delete(`/api/predictions/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(formatErrorMessage(error, 'Failed to delete prediction record.'));
    }
  },

  async clearPredictions() {
    try {
      const response = await client.delete('/api/predictions');
      return response.data;
    } catch (error) {
      throw new Error(formatErrorMessage(error, 'Failed to clear prediction history.'));
    }
  },
};

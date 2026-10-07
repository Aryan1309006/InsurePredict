import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const client = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiService = {
  async checkHealth() {
    try {
      const response = await client.get('/api/health');
      return response.data;
    } catch (error) {
      console.warn('Backend health check failed:', error);
      throw error;
    }
  },

  async predictCost(payload) {
    try {
      const response = await client.post('/api/predict', payload);
      return response.data;
    } catch (error) {
      if (error.response) {
        const errorDetail = error.response.data?.detail || error.response.data?.message;
        if (Array.isArray(errorDetail)) {
          // Pydantic validation error array
          const messages = errorDetail.map((err) => `${err.loc?.join(' -> ')}: ${err.msg}`).join(', ');
          throw new Error(`Validation failed: ${messages}`);
        }
        throw new Error(errorDetail || 'Server rejected the calculation request.');
      } else if (error.request) {
        throw new Error(
          'Unable to reach backend server. Please make sure the FastAPI server is running on http://localhost:8000 and try again.'
        );
      } else {
        throw new Error(error.message || 'An unexpected error occurred while predicting cost.');
      }
    }
  },

  async getWhatIf(payload) {
    try {
      const response = await client.post('/api/what-if', payload);
      return response.data;
    } catch (error) {
      console.warn('What-If simulation API failed:', error);
      throw error;
    }
  },

  async getModelInfo() {
    try {
      const response = await client.get('/api/model-info');
      return response.data;
    } catch (error) {
      console.warn('Failed to fetch model info:', error);
      throw error;
    }
  },
};

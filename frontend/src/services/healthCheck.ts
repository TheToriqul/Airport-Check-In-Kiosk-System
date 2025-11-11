import api from './api';

/**
 * Check if backend is available
 */
export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const response = await api.get('/health');
    return response.data.success === true;
  } catch (error) {
    console.error('Backend health check failed:', error);
    return false;
  }
};


import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
});

// Configurar Axios para enviar cookies (HttpOnly session cookie) en todas las peticiones
api.defaults.withCredentials = true;

// Interceptor para atrapar 401 Unauthorized globalmente
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        // Redirigir al login si falla la auth
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

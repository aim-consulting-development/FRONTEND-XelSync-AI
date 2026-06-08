import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
});

// Interceptor para inyectar el token en cada petición
api.interceptors.request.use(
  (config) => {
    // Solo accedemos a localStorage en el cliente
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para atrapar 401 Unauthorized globalmente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        // Redirigir al login si falla la auth
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRedirecting = false;

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Não redirecionar em rotas de autenticação para permitir exibir mensagens de erro
    const url = error.config?.url || '';
    const isAuthRoute = url.startsWith('/auth/login') || url.startsWith('/auth/primeiro-acesso') || url.startsWith('/auth/esqueci-senha') || url.startsWith('/auth/redefinir-senha');
    if (error.response?.status === 401 && !isAuthRoute && !isRedirecting) {
      isRedirecting = true;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;


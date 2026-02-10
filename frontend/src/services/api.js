import axios from 'axios';

// Configuração base da API
const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token de autenticação (se existir)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Erro de resposta do servidor
      console.error('Erro na resposta:', error.response.data);
      
      // Se for erro 401 (não autorizado), redirecionar para login
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    } else if (error.request) {
      // Erro de requisição (sem resposta)
      console.error('Erro na requisição:', error.request);
    } else {
      // Outro tipo de erro
      console.error('Erro:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;

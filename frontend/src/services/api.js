import axios from 'axios';
import { toast } from 'react-toastify';

// Configuração base da API
const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Controle para evitar múltiplas tentativas de refresh simultâneas
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

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

// Interceptor para tratamento de erros com auto-renovação de token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Se for erro 401 e não for a própria requisição de refresh/login, tenta renovar
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/autenticacao/login') &&
      !originalRequest.url?.includes('/autenticacao/refresh')
    ) {
      if (isRefreshing) {
        // Se já está renovando, enfileira a requisição
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');

      if (!refreshToken) {
        // Sem refresh token, redireciona para login
        isRefreshing = false;
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        toast.error("Sessão expirada. Faça login novamente.");
        return Promise.reject(error);
      }

      try {
        const response = await axios.post('http://localhost:8080/api/autenticacao/refresh', {
          refreshToken,
        });

        const { token: newToken, refreshToken: newRefreshToken } = response.data;

        localStorage.setItem('token', newToken);
        if (newRefreshToken) {
          localStorage.setItem('refreshToken', newRefreshToken);
        }
        localStorage.setItem('user', JSON.stringify({
          id: response.data.id,
          nome: response.data.nome,
          email: response.data.email,
          role: response.data.role,
        }));

        api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        processQueue(null, newToken);

        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        toast.error("Sessão expirada. Faça login novamente.");
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Mensagem de erro padrão
    let errorMessage = "Ocorreu um erro inesperado. Tente novamente mais tarde.";

    if (error.response) {
      // Erro de resposta do servidor
      console.error('Erro na resposta:', error.response.data);

      // Tenta extrair mensagem de erro do backend (formato padronizado: { erro: "..." })
      errorMessage = error.response.data?.erro || error.response.data?.message || errorMessage;
    } else if (error.request) {
      // Erro de requisição (sem resposta)
      console.error('Erro na requisição:', error.request);
      errorMessage = "Erro de conexão com o servidor. Verifique sua internet.";
    } else {
      // Outro tipo de erro
      console.error('Erro:', error.message);
      errorMessage = error.message;
    }

    // Exibe o toast com a mensagem de erro (exceto se for tratado especificamente)
    toast.error(errorMessage);

    return Promise.reject(error);
  }
);

export default api;

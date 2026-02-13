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
    // Mensagem de erro padrão
    let errorMessage = "Ocorreu um erro inesperado. Tente novamente mais tarde.";

    if (error.response) {
      // Erro de resposta do servidor
      console.error('Erro na resposta:', error.response.data);

      // Tenta extrair mensagem de erro do backend (formato padronizado: { erro: "..." })
      errorMessage = error.response.data?.erro || error.response.data?.message || errorMessage;

      // Se for erro 401 (não autorizado), redirecionar para login
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        errorMessage = "Sessão expirada. Faça login novamente.";
      }
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

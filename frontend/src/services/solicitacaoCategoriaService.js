import api from './api';

const solicitacaoCategoriaService = {
  solicitar: async (dados) => {
    const response = await api.post('/solicitacoes-categorias', dados);
    return response.data;
  },

  getAll: async (status) => {
    const params = status ? { status } : {};
    const response = await api.get('/solicitacoes-categorias', { params });
    return response.data;
  },

  getMinhas: async () => {
    const response = await api.get('/solicitacoes-categorias/minhas');
    return response.data;
  },

  aprovar: async (id) => {
    const response = await api.patch(`/solicitacoes-categorias/${id}/aprovar`);
    return response.data;
  },

  rejeitar: async (id) => {
    const response = await api.patch(`/solicitacoes-categorias/${id}/rejeitar`);
    return response.data;
  },
};

export default solicitacaoCategoriaService;

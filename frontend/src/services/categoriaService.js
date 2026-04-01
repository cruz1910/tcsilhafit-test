import api from './api';

const categoriaService = {
  listarTodas: async () => {
    const response = await api.get('/categorias');
    return response.data;
  },
  
  buscarPorId: async (id) => {
    const response = await api.get(`/categorias/${id}`);
    return response.data;
  },

  criar: async (dados) => {
    const response = await api.post('/categorias', dados);
    return response.data;
  },

  atualizar: async (id, dados) => {
    const response = await api.put(`/categorias/${id}`, dados);
    return response.data;
  },

  excluir: async (id) => {
    const response = await api.delete(`/categorias/${id}`);
    return response.data;
  }
};

export default categoriaService;

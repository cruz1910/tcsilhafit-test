import api from './api';

const gradeService = {
  // --- Leitura ---
  listarPorProfissional: async (profissionalId) => {
    const response = await api.get(`/grade-atividades/profissional/${profissionalId}`);
    return response.data;
  },

  listarPorEstabelecimento: async (estabelecimentoId) => {
    const response = await api.get(`/grade-atividades/estabelecimento/${estabelecimentoId}`);
    return response.data;
  },

  // --- Escrita ---
  adicionarAoProfissional: async (profissionalId, dados) => {
    const response = await api.post(`/grade-atividades/profissional/${profissionalId}`, dados);
    return response.data;
  },

  adicionarAoEstabelecimento: async (estabelecimentoId, dados) => {
    const response = await api.post(`/grade-atividades/estabelecimento/${estabelecimentoId}`, dados);
    return response.data;
  },

  atualizar: async (id, dados) => {
    const response = await api.put(`/grade-atividades/${id}`, dados);
    return response.data;
  },

  excluir: async (id) => {
    const response = await api.delete(`/grade-atividades/${id}`);
    return response.data;
  }
};

export default gradeService;

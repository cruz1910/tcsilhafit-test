import api from './api';

// ==================== AUTH ====================

export const authService = {
    // Login
    login: async (email, password) => {
        const response = await api.post('/autenticacao/login', { email, senha: password });
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            // Salva os dados básicos do usuário para uso imediato no layout
            localStorage.setItem('user', JSON.stringify({
                id: response.data.id,
                nome: response.data.nome,
                email: response.data.email,
                role: response.data.role
            }));
        }
        return response.data;
    },

    // Recuperar info do usuário logado
    getUserInfo: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    // Registro (Centralizado no service para facilitar chamadas do front)
    register: async (formData, type) => {
        let endpoint = '/usuarios/registrar';
        let payload = {
            nome: formData.nome,
            email: formData.email,
            senha: formData.senha
        };

        if (type === 'aluno') {
            payload.cpf = "00000000000"; // Dummy CPF to satisfy Backend @NotBlank
        } else if (type === 'estabelecimento') {
            endpoint = '/estabelecimentos/registrar';
            payload = {
                ...payload,
                cnpj: formData.cnpj,
                nomeFantasia: formData.nomeFantasia || formData.nome,
                razaoSocial: formData.razaoSocial || formData.nome,
                telefone: formData.telefone,
                atividadesOferecidas: formData.atividadesOferecidas,
                exclusivoMulheres: formData.exclusivoMulheres,
                fotoUrl: formData.fotoUrl,
                endereco: formData.endereco ? {
                    ...formData.endereco,
                    rua: formData.endereco.logradouro
                } : null
            };
        } else if (type === 'profissional') {
            endpoint = '/profissionais/registrar';
            payload = {
                ...payload,
                cpf: formData.cpf,
                telefone: formData.telefone,
                especializacao: formData.atividadesOferecidas.join(", "),
                registroCref: formData.registroCref,
                descricao: formData.descricao,
                atividadesOferecidas: formData.atividadesOferecidas,
                exclusivoMulheres: formData.exclusivoMulheres,
                fotoUrl: formData.fotoUrl,
                endereco: formData.endereco ? {
                    ...formData.endereco,
                    rua: formData.endereco.logradouro
                } : null
            };
        } else if (type === 'admin') {
            endpoint = '/administradores/registrar';
            payload.cpf = "00000000000";
        }

        const response = await api.post(endpoint, payload);
        return response.data;
    },

    // Logout
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
    },

    // Verificar se está autenticado
    isAuthenticated: () => {
        return !!localStorage.getItem('token');
    },
};

// ==================== USUÁRIOS ====================

export const userService = {
    // Buscar todos os usuários
    getAll: async () => {
        const response = await api.get('/usuarios');
        return response.data;
    },

    // Buscar usuário por ID
    getById: async (id) => {
        const response = await api.get(`/usuarios/${id}`);
        return response.data;
    },

    // Criar usuário
    create: async (userData) => {
        const response = await api.post('/usuarios/registrar', userData);
        return response.data;
    },

    // Atualizar usuário
    update: async (id, userData) => {
        const response = await api.put(`/usuarios/${id}`, userData);
        return response.data;
    },

    // Deletar usuário
    delete: async (id) => {
        const response = await api.delete(`/usuarios/${id}`);
        return response.data;
    },
};

// ==================== ESTABELECIMENTOS ====================

export const estabelecimentoService = {
    // Buscar todos os estabelecimentos
    getAll: async () => {
        const response = await api.get('/estabelecimentos');
        return response.data;
    },

    // Buscar estabelecimento por ID
    getById: async (id) => {
        const response = await api.get(`/estabelecimentos/${id}`);
        return response.data;
    },

    // Criar estabelecimento
    create: async (estabelecimentoData) => {
        const response = await api.post('/estabelecimentos', estabelecimentoData);
        return response.data;
    },

    // Atualizar estabelecimento
    update: async (id, estabelecimentoData) => {
        const response = await api.put(`/estabelecimentos/${id}`, estabelecimentoData);
        return response.data;
    },

    // Deletar estabelecimento
    delete: async (id) => {
        const response = await api.delete(`/estabelecimentos/${id}`);
        return response.data;
    },
};

// ==================== PROFISSIONAIS ====================

export const profissionalService = {
    // Buscar todos os profissionais
    getAll: async () => {
        const response = await api.get('/profissionais');
        return response.data;
    },

    // Buscar profissional por ID
    getById: async (id) => {
        const response = await api.get(`/profissionais/${id}`);
        return response.data;
    },

    // Criar profissional
    create: async (profissionalData) => {
        const response = await api.post('/profissionais', profissionalData);
        return response.data;
    },

    // Atualizar profissional
    update: async (id, profissionalData) => {
        const response = await api.put(`/profissionais/${id}`, profissionalData);
        return response.data;
    },

    // Deletar profissional
    delete: async (id) => {
        const response = await api.delete(`/profissionais/${id}`);
        return response.data;
    },
};

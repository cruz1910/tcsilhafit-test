import api from './api';
import categoriaService from './categoriaService';
import gradeService from './gradeService';
import solicitacaoCategoriaService from './solicitacaoCategoriaService';

// ==================== AUTH ====================

export const authService = {
    // Login
    login: async (email, password) => {
        const response = await api.post('/autenticacao/login', { email, senha: password });
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            if (response.data.refreshToken) {
                localStorage.setItem('refreshToken', response.data.refreshToken);
            }
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

    // Esqueci a senha
    esqueciSenha: async (email) => {
        const response = await api.post('/autenticacao/esqueci-senha', { email });
        return response.data;
    },

    // Redefinir senha
    redefinirSenha: async (token, novaSenha) => {
        const response = await api.post('/autenticacao/redefinir-senha', { token, novaSenha });
        return response.data;
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
            payload.cpf = null;
        } else if (type === 'estabelecimento') {
            endpoint = '/estabelecimentos/registrar';
            payload = {
                ...payload,
                cnpj: formData.cnpj,
                nomeFantasia: formData.nomeFantasia || formData.nome,
                razaoSocial: formData.razaoSocial || formData.nome,
                telefone: formData.telefone,
                categoriaIds: formData.categoriaIds || [],
                outrosAtividade: formData.outrosAtividade || null,
                exclusivoMulheres: formData.exclusivoMulheres,
                fotosUrl: formData.fotosUrl,
                instagram: formData.instagram || null,
                facebook: formData.facebook || null,
                website: formData.website || null,
                endereco: formData.endereco ? {
                    ...formData.endereco,
                    rua: formData.endereco.rua,
                    latitude: formData.endereco.latitude,
                    longitude: formData.endereco.longitude
                } : null
            };
        } else if (type === 'profissional') {
            endpoint = '/profissionais/registrar';
            payload = {
                ...payload,
                cpf: formData.cpf,
                telefone: formData.telefone,
                especializacao: formData.descricao || "", // Provisório se a UI n enviou nada melhor
                registroCref: formData.registroCref,
                descricao: formData.descricao,
                categoriaIds: formData.categoriaIds || [],
                outrosAtividade: formData.outrosAtividade || null,
                exclusivoMulheres: formData.exclusivoMulheres,
                fotoUrl: formData.fotoUrl,
                instagram: formData.instagram || null,
                facebook: formData.facebook || null,
                website: formData.website || null,
                endereco: formData.endereco ? {
                    ...formData.endereco,
                    rua: formData.endereco.rua,
                    latitude: formData.endereco.latitude,
                    longitude: formData.endereco.longitude
                } : null
            };
        } else if (type === 'admin') {
            endpoint = '/administradores/registrar';
            payload.cpf = "00000000000";
        }

        const response = await api.post(endpoint, payload);
        return response.data;
    },

    // Renovar token usando refresh token
    refresh: async () => {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
            throw new Error('Sem refresh token');
        }
        const response = await api.post('/autenticacao/refresh', { refreshToken });
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            if (response.data.refreshToken) {
                localStorage.setItem('refreshToken', response.data.refreshToken);
            }
            localStorage.setItem('user', JSON.stringify({
                id: response.data.id,
                nome: response.data.nome,
                email: response.data.email,
                role: response.data.role
            }));
        }
        return response.data;
    },

    // Logout
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/';
    },

    // Decodificar payload do JWT (base64)
    _decodeToken: (token) => {
        try {
            const payload = token.split('.')[1];
            return JSON.parse(atob(payload));
        } catch {
            return null;
        }
    },

    // Verificar se o token está expirado
    isTokenExpired: (token) => {
        if (!token) return true;
        const decoded = authService._decodeToken(token);
        if (!decoded || !decoded.exp) return true;
        // Considera expirado se faltam menos de 60 segundos
        return decoded.exp * 1000 < Date.now() + 60000;
    },

    // Verificar se está autenticado (com validação de expiração)
    isAuthenticated: () => {
        const token = localStorage.getItem('token');
        if (!token) return false;
        return !authService.isTokenExpired(token);
    },
};

// ==================== UPLOAD DE IMAGENS ====================

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

export const uploadService = {
    // Validar arquivo no frontend antes de enviar
    validate: (file) => {
        if (!file) return { valid: false, error: 'Nenhum arquivo selecionado.' };
        if (!ALLOWED_TYPES.includes(file.type)) {
            return { valid: false, error: 'Formato não permitido. Aceitos: JPEG, PNG, WebP.' };
        }
        if (file.size > MAX_FILE_SIZE) {
            return { valid: false, error: `Arquivo muito grande (${(file.size / 1024 / 1024).toFixed(1)}MB). Máximo: 2MB.` };
        }
        return { valid: true, error: null };
    },

    // Upload de uma imagem com progresso
    uploadImagem: async (file, onProgress) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post('/upload/imagem', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (progressEvent) => {
                if (onProgress && progressEvent.total) {
                    const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    onProgress(percent);
                }
            }
        });
        return response.data;
    },

    // Upload de múltiplas imagens com progresso
    uploadImagens: async (files, onProgress) => {
        const formData = new FormData();
        files.forEach(file => formData.append('files', file));
        const response = await api.post('/upload/imagens', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (progressEvent) => {
                if (onProgress && progressEvent.total) {
                    const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    onProgress(percent);
                }
            }
        });
        return response.data;
    },

    // Deletar imagem
    deleteImagem: async (fileName) => {
        const response = await api.delete(`/upload/imagem?fileName=${encodeURIComponent(fileName)}`);
        return response.data;
    },

    // Extrair nome do arquivo a partir da URL
    getFileNameFromUrl: (url) => {
        if (!url) return null;
        const parts = url.split('/');
        return parts[parts.length - 1];
    }
};

// ==================== MEU PERFIL (usuário autenticado) ====================

export const meService = {
    // Buscar dados do próprio usuário autenticado
    get: async () => {
        const response = await api.get('/me');
        return response.data;
    },

    // Atualizar dados do próprio usuário (USER)
    update: async (data) => {
        const response = await api.put('/me', data);
        return response.data;
    },

    // Atualizar dados do próprio estabelecimento
    updateEstabelecimento: async (data) => {
        const response = await api.put('/me/estabelecimento', data);
        return response.data;
    },

    // Atualizar dados do próprio profissional
    updateProfissional: async (data) => {
        const response = await api.put('/me/profissional', data);
        return response.data;
    },

    // Deletar a própria conta
    delete: async () => {
        const response = await api.delete('/me');
        return response.data;
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
        const payload = {
            ...estabelecimentoData,
            nomeFantasia: estabelecimentoData.nomeFantasia || estabelecimentoData.nome,
            razaoSocial: estabelecimentoData.razaoSocial || estabelecimentoData.nome,
        };
        const response = await api.put(`/estabelecimentos/${id}`, payload);
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
        const payload = {
            ...profissionalData,
            especializacao: (profissionalData.gradeAtividades || []).map(g => g.atividade).join(", "),
        };
        const response = await api.put(`/profissionais/${id}`, payload);
        return response.data;
    },

    // Deletar profissional
    delete: async (id) => {
        const response = await api.delete(`/profissionais/${id}`);
        return response.data;
    },
};

// ==================== ADMINISTRADORES ====================

export const administradorService = {
    // Buscar todos os administradores
    getAll: async () => {
        const response = await api.get('/administradores');
        return response.data;
    },

    // Buscar administrador por ID
    getById: async (id) => {
        const response = await api.get(`/administradores/${id}`);
        return response.data;
    },

    // Criar administrador
    create: async (adminData) => {
        const response = await api.post('/administradores', adminData);
        return response.data;
    },

    // Atualizar administrador
    update: async (id, adminData) => {
        const response = await api.put(`/administradores/${id}`, adminData);
        return response.data;
    },

    // Deletar administrador
    delete: async (id) => {
        const response = await api.delete(`/administradores/${id}`);
        return response.data;
    },
};

// ==================== ADMIN (PAINEL ADMINISTRATIVO) ====================

export const adminService = {
    // Buscar TODOS os usuários de todos os tipos
    getAllUsers: async () => {
        try {
            const [usuarios, profissionais, estabelecimentos, administradores] = await Promise.all([
                userService.getAll(),
                profissionalService.getAll(),
                estabelecimentoService.getAll(),
                administradorService.getAll(),
            ]);

            // Normalizar e adicionar tipo
            const allUsers = [
                ...usuarios.map(u => ({ ...u, tipo: 'aluno' })),
                ...profissionais.map(p => ({ ...p, tipo: 'profissional' })),
                ...estabelecimentos.map(e => ({ ...e, tipo: 'estabelecimento' })),
                ...administradores.map(a => ({ ...a, tipo: 'admin' })),
            ];

            return allUsers;
        } catch (error) {
            console.error('Erro ao buscar todos os usuários:', error);
            throw error;
        }
    },

    // Deletar usuário de qualquer tipo
    deleteUser: async (id, tipo) => {
        switch (tipo) {
            case 'aluno':
                return await userService.delete(id);
            case 'profissional':
                return await profissionalService.delete(id);
            case 'estabelecimento':
                return await estabelecimentoService.delete(id);
            case 'admin':
                return await administradorService.delete(id);
            default:
                throw new Error(`Tipo de usuário inválido: ${tipo}`);
        }
    },

    // Atualizar usuário de qualquer tipo
    updateUser: async (id, data, tipo) => {
        switch (tipo) {
            case 'aluno':
                return await userService.update(id, data);
            case 'profissional':
                return await profissionalService.update(id, data);
            case 'estabelecimento':
                return await estabelecimentoService.update(id, data);
            case 'admin':
                return await administradorService.update(id, data);
            default:
                throw new Error(`Tipo de usuário inválido: ${tipo}`);
        }
    },

    // Buscar usuário por ID e tipo
    getUser: async (id, tipo) => {
        switch (tipo) {
            case 'aluno':
                return await userService.getById(id);
            case 'profissional':
                return await profissionalService.getById(id);
            case 'estabelecimento':
                return await estabelecimentoService.getById(id);
            case 'admin':
                return await administradorService.getById(id);
            default:
                throw new Error(`Tipo de usuário inválido: ${tipo}`);
        }
    },
};
// ==================== AVALIAÇÕES ====================

export const avaliacaoService = {
    // Listar avaliações de um estabelecimento
    getByEstabelecimento: async (id) => {
        const response = await api.get(`/avaliacoes/estabelecimento/${id}`);
        return response.data;
    },

    // Listar avaliações de um profissional
    getByProfissional: async (id) => {
        const response = await api.get(`/avaliacoes/profissional/${id}`);
        return response.data;
    },

    // Enviar nova avaliação
    avaliar: async (data) => {
        const response = await api.post('/avaliacoes', data);
        return response.data;
    },

    // Excluir avaliação (autor ou admin)
    delete: async (id) => {
        const response = await api.delete(`/avaliacoes/${id}`);
        return response.data;
    },
};

export const denunciaService = {
    // Criar denúncia (qualquer usuário autenticado)
    criar: async (data) => {
        const response = await api.post('/denuncias', data);
        return response.data;
    },

    // Listar todas as denúncias (admin)
    getAll: async (status) => {
        const params = status ? { status } : {};
        const response = await api.get('/denuncias', { params });
        return response.data;
    },

    // Atualizar status da denúncia (admin)
    atualizarStatus: async (id, status) => {
        const response = await api.put(`/denuncias/${id}/status`, { status });
        return response.data;
    },

    // Excluir avaliação denunciada (admin)
    excluirAvaliacao: async (id) => {
        const response = await api.delete(`/denuncias/${id}/avaliacao`);
        return response.data;
    },
};

export { categoriaService, gradeService, solicitacaoCategoriaService };

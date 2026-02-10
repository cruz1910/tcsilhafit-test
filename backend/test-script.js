const axios = require('axios');

const API_URL = 'http://localhost:8080/api';

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

async function runTests() {
    console.log('🚀 Iniciando Testes de API IlhaFit (Versão Refatorada PT-BR)...\n');

    try {
        // 1. Teste de Registro de Usuário (Novo endpoint descentralizado)
        console.log('1. Testando Registro de Usuário (/usuarios/registrar)...');
        const userPayload = {
            nome: 'Teste Usuario',
            email: 'usuario@teste.com',
            senha: 'Password123!',
            cpf: '05423871037'
        };
        const userReg = await api.post('/usuarios/registrar', userPayload);
        console.log('✅ Usuário registrado:', userReg.data.id);

        // 2. Teste de Login (Nova rota em português)
        console.log('\n2. Testando Login (/autenticacao/login)...');
        const loginPayload = {
            email: 'usuario@teste.com',
            senha: 'Password123!'
        };
        const loginRes = await api.post('/autenticacao/login', loginPayload);
        console.log('✅ Login efetuado com sucesso:', loginRes.data.nome, `(${loginRes.data.role})`);

        // 3. Teste de CRUD Usuário
        console.log('\n3. Testando CRUD Usuários...');
        const userId = userReg.data.id;

        // Listar
        const listUsers = await api.get('/usuarios');
        console.log('✅ Listagem de usuários (contagem):', listUsers.data.length);

        // Buscar por ID
        const getUser = await api.get(`/usuarios/${userId}`);
        console.log('✅ Busca por ID:', getUser.data.nome);

        // Atualizar
        const updatePayload = { ...userPayload, nome: 'Usuario Atualizado' };
        const updatedUser = await api.put(`/usuarios/${userId}`, updatePayload);
        console.log('✅ Usuário atualizado:', updatedUser.data.nome);

        // 4. Teste de Registro de Estabelecimento
        console.log('\n4. Testando Registro de Estabelecimento (/estabelecimentos/registrar)...');
        const estPayload = {
            nome: 'Academia Teste',
            email: 'academia@teste.com',
            senha: 'Password123!',
            telefone: '11999999999',
            cnpj: '85353153000109',
            endereco: {
                logradouro: 'Rua das Flores',
                numero: '123',
                bairro: 'Centro',
                cidade: 'São Paulo',
                estado: 'SP',
                cep: '01234567'
            }
        };
        const estReg = await api.post('/estabelecimentos/registrar', estPayload);
        console.log('✅ Estabelecimento registrado:', estReg.data.id);

        // Deletar usuário de teste para limpar o banco
        await api.delete(`/usuarios/${userId}`);
        console.log('✅ Usuário deletado com sucesso');

        console.log('\n✨ Todos os testes da nova estrutura concluídos com sucesso!');

    } catch (error) {
        console.error('\n❌ Erro nos testes:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Dados:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Mensagem:', error.message);
        }
    }
}

runTests();

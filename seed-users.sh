#!/bin/bash
API="http://localhost:8080/api"
SENHA="Teste@123"

echo "=== Criando 10 Alunos (USER) ==="
for i in 1 2 3 4 5 6 7 8 9 10; do
  NOMES=("Ana Silva" "Bruno Costa" "Carla Oliveira" "Diego Santos" "Elena Ferreira" "Felipe Souza" "Gabriela Lima" "Hugo Pereira" "Isabela Rocha" "João Cardoso")
  NOME="${NOMES[$((i-1))]}"
  EMAIL="aluno${i}@teste.com"
  echo "  -> $NOME ($EMAIL)"
  curl -s -X POST "$API/usuarios/registrar" \
    -H "Content-Type: application/json" \
    -d "{
      \"nome\": \"$NOME\",
      \"email\": \"$EMAIL\",
      \"senha\": \"$SENHA\"
    }" > /dev/null
done

echo ""
echo "=== Criando 8 Estabelecimentos ==="

curl -s -X POST "$API/estabelecimentos/registrar" -H "Content-Type: application/json" -d '{
  "nome": "Academia PowerFit", "nomeFantasia": "PowerFit", "razaoSocial": "PowerFit Ltda",
  "email": "powerfit@teste.com", "senha": "Teste@123", "telefone": "48991001001", "cnpj": "11111111000101",
  "instagram": "@powerfitfloripa", "facebook": "powerfitfloripa", "website": "www.powerfit.com.br",
  "exclusivoMulheres": false,
  "endereco": {"rua": "Rua Lauro Linhares", "numero": "500", "bairro": "Trindade", "cidade": "Florianópolis", "estado": "SC", "cep": "88036-001"},
  "gradeAtividades": [{"atividade": "Academia", "diasSemana": ["Seg","Ter","Qua","Qui","Sex","Sab"], "periodos": ["Manhã","Tarde","Noite"]},{"atividade": "CrossFit", "diasSemana": ["Seg","Qua","Sex"], "periodos": ["Manhã","Noite"]}]
}' > /dev/null && echo "  -> PowerFit"

curl -s -X POST "$API/estabelecimentos/registrar" -H "Content-Type: application/json" -d '{
  "nome": "Studio Bella Forma", "nomeFantasia": "Bella Forma", "razaoSocial": "Bella Forma ME",
  "email": "bellaforma@teste.com", "senha": "Teste@123", "telefone": "48991002002", "cnpj": "22222222000102",
  "instagram": "@bellaformastudio", "website": "www.bellaforma.com.br",
  "exclusivoMulheres": true,
  "endereco": {"rua": "Rua Bocaiúva", "numero": "1200", "bairro": "Centro", "cidade": "Florianópolis", "estado": "SC", "cep": "88015-530"},
  "gradeAtividades": [{"atividade": "Pilates", "diasSemana": ["Seg","Ter","Qua","Qui","Sex"], "periodos": ["Manhã","Tarde"]},{"atividade": "Yoga", "diasSemana": ["Ter","Qui","Sab"], "periodos": ["Manhã"]}]
}' > /dev/null && echo "  -> Bella Forma"

curl -s -X POST "$API/estabelecimentos/registrar" -H "Content-Type: application/json" -d '{
  "nome": "Arena CrossFit Ilha", "nomeFantasia": "CrossFit Ilha", "razaoSocial": "Arena CF Ltda",
  "email": "crossfitilha@teste.com", "senha": "Teste@123", "telefone": "48991003003", "cnpj": "33333333000103",
  "instagram": "@crossfitilha", "facebook": "crossfitilhafloripa",
  "exclusivoMulheres": false,
  "endereco": {"rua": "Rua Delminda da Silveira", "numero": "300", "bairro": "Agronômica", "cidade": "Florianópolis", "estado": "SC", "cep": "88025-500"},
  "gradeAtividades": [{"atividade": "CrossFit", "diasSemana": ["Seg","Ter","Qua","Qui","Sex","Sab"], "periodos": ["Manhã","Tarde","Noite"]}]
}' > /dev/null && echo "  -> CrossFit Ilha"

curl -s -X POST "$API/estabelecimentos/registrar" -H "Content-Type: application/json" -d '{
  "nome": "Centro de Lutas Floripa", "nomeFantasia": "Floripa Fight", "razaoSocial": "Floripa Fight ME",
  "email": "floripafight@teste.com", "senha": "Teste@123", "telefone": "48991004004", "cnpj": "44444444000104",
  "facebook": "floripafight",
  "exclusivoMulheres": false,
  "endereco": {"rua": "Rua Vidal Ramos", "numero": "80", "bairro": "Centro", "cidade": "Florianópolis", "estado": "SC", "cep": "88020-010"},
  "gradeAtividades": [{"atividade": "Jiu-Jitsu", "diasSemana": ["Seg","Qua","Sex"], "periodos": ["Noite"]},{"atividade": "Muay Thai", "diasSemana": ["Ter","Qui","Sab"], "periodos": ["Tarde","Noite"]},{"atividade": "Boxe", "diasSemana": ["Seg","Qua","Sex"], "periodos": ["Manhã"]}]
}' > /dev/null && echo "  -> Floripa Fight"

curl -s -X POST "$API/estabelecimentos/registrar" -H "Content-Type: application/json" -d '{
  "nome": "Natação Ilha Sul", "nomeFantasia": "Ilha Sul Natação", "razaoSocial": "Ilha Sul Esportes SA",
  "email": "ilhasul@teste.com", "senha": "Teste@123", "telefone": "48991005005", "cnpj": "55555555000105",
  "website": "www.ilhasulnatacao.com.br",
  "exclusivoMulheres": false,
  "endereco": {"rua": "Rua João Pinto", "numero": "210", "bairro": "Centro", "cidade": "Florianópolis", "estado": "SC", "cep": "88010-420"},
  "gradeAtividades": [{"atividade": "Natação", "diasSemana": ["Seg","Ter","Qua","Qui","Sex"], "periodos": ["Manhã","Tarde","Noite"]}]
}' > /dev/null && echo "  -> Ilha Sul Natação"

curl -s -X POST "$API/estabelecimentos/registrar" -H "Content-Type: application/json" -d '{
  "nome": "Espaço Dança Viva", "nomeFantasia": "Dança Viva", "razaoSocial": "Dança Viva Ltda",
  "email": "dancaviva@teste.com", "senha": "Teste@123", "telefone": "48991006006", "cnpj": "66666666000106",
  "instagram": "@dancavivafloripa",
  "exclusivoMulheres": false,
  "endereco": {"rua": "Rua Tenente Silveira", "numero": "45", "bairro": "Centro", "cidade": "Florianópolis", "estado": "SC", "cep": "88010-300"},
  "gradeAtividades": [{"atividade": "Dança", "diasSemana": ["Seg","Ter","Qua","Qui","Sex"], "periodos": ["Tarde","Noite"]},{"atividade": "Balé", "diasSemana": ["Ter","Qui","Sab"], "periodos": ["Manhã","Tarde"]}]
}' > /dev/null && echo "  -> Dança Viva"

curl -s -X POST "$API/estabelecimentos/registrar" -H "Content-Type: application/json" -d '{
  "nome": "FisioVida Clínica", "nomeFantasia": "FisioVida", "razaoSocial": "FisioVida Saúde Ltda",
  "email": "fisiovida@teste.com", "senha": "Teste@123", "telefone": "48991007007", "cnpj": "77777777000107",
  "instagram": "@fisiovidafloripa", "website": "www.fisiovida.com.br",
  "exclusivoMulheres": false,
  "endereco": {"rua": "Av. Madre Benvenuta", "numero": "1400", "bairro": "Santa Mônica", "cidade": "Florianópolis", "estado": "SC", "cep": "88035-001"},
  "gradeAtividades": [{"atividade": "Fisioterapia", "diasSemana": ["Seg","Ter","Qua","Qui","Sex"], "periodos": ["Manhã","Tarde"]}]
}' > /dev/null && echo "  -> FisioVida"

curl -s -X POST "$API/estabelecimentos/registrar" -H "Content-Type: application/json" -d '{
  "nome": "Bike & Fit Floripa", "nomeFantasia": "Bike & Fit", "razaoSocial": "Bike Fit SC Ltda",
  "email": "bikefit@teste.com", "senha": "Teste@123", "telefone": "48991008008", "cnpj": "88888888000108",
  "instagram": "@bikefitfloripa", "facebook": "bikefitfloripa", "website": "www.bikefit.com.br",
  "exclusivoMulheres": false,
  "endereco": {"rua": "Rua Deputado Antônio Edu Vieira", "numero": "800", "bairro": "Pantanal", "cidade": "Florianópolis", "estado": "SC", "cep": "88040-001"},
  "gradeAtividades": [{"atividade": "Ciclismo", "diasSemana": ["Seg","Qua","Sex","Sab","Dom"], "periodos": ["Manhã"]},{"atividade": "Funcional", "diasSemana": ["Ter","Qui"], "periodos": ["Tarde","Noite"]}]
}' > /dev/null && echo "  -> Bike & Fit"

echo ""
echo "=== Criando 7 Profissionais ==="

curl -s -X POST "$API/profissionais/registrar" -H "Content-Type: application/json" -d '{
  "nome": "Rafael Mendes", "email": "rafael@teste.com", "senha": "Teste@123",
  "telefone": "48992001001", "cpf": "11122233344",
  "especializacao": "Personal Trainer, CrossFit", "registroCref": "012345-G/SC",
  "instagram": "@rafaelpersonal", "website": "www.rafaelmendes.com.br",
  "exclusivoMulheres": false,
  "endereco": {"rua": "Rua Lauro Linhares", "numero": "600", "bairro": "Trindade", "cidade": "Florianópolis", "estado": "SC", "cep": "88036-001"},
  "gradeAtividades": [{"atividade": "Academia", "diasSemana": ["Seg","Ter","Qua","Qui","Sex"], "periodos": ["Manhã","Tarde"]},{"atividade": "CrossFit", "diasSemana": ["Seg","Qua","Sex"], "periodos": ["Noite"]}]
}' > /dev/null && echo "  -> Rafael Mendes"

curl -s -X POST "$API/profissionais/registrar" -H "Content-Type: application/json" -d '{
  "nome": "Mariana Alves", "email": "mariana@teste.com", "senha": "Teste@123",
  "telefone": "48992002002", "cpf": "22233344455",
  "especializacao": "Pilates, Yoga", "registroCref": "067890-G/SC",
  "instagram": "@maripilates", "facebook": "marianaalvespilates",
  "exclusivoMulheres": true,
  "endereco": {"rua": "Rua Bocaiúva", "numero": "800", "bairro": "Centro", "cidade": "Florianópolis", "estado": "SC", "cep": "88015-530"},
  "gradeAtividades": [{"atividade": "Pilates", "diasSemana": ["Seg","Ter","Qua","Qui","Sex"], "periodos": ["Manhã","Tarde"]},{"atividade": "Yoga", "diasSemana": ["Ter","Qui","Sab"], "periodos": ["Manhã"]}]
}' > /dev/null && echo "  -> Mariana Alves"

curl -s -X POST "$API/profissionais/registrar" -H "Content-Type: application/json" -d '{
  "nome": "Lucas Ferreira", "email": "lucas@teste.com", "senha": "Teste@123",
  "telefone": "48992003003", "cpf": "33344455566",
  "especializacao": "Jiu-Jitsu, Muay Thai",
  "instagram": "@lucasfight",
  "exclusivoMulheres": false,
  "endereco": {"rua": "Rua Vidal Ramos", "numero": "90", "bairro": "Centro", "cidade": "Florianópolis", "estado": "SC", "cep": "88020-010"},
  "gradeAtividades": [{"atividade": "Jiu-Jitsu", "diasSemana": ["Seg","Qua","Sex"], "periodos": ["Noite"]},{"atividade": "Muay Thai", "diasSemana": ["Ter","Qui"], "periodos": ["Noite"]}]
}' > /dev/null && echo "  -> Lucas Ferreira"

curl -s -X POST "$API/profissionais/registrar" -H "Content-Type: application/json" -d '{
  "nome": "Patrícia Gomes", "email": "patricia@teste.com", "senha": "Teste@123",
  "telefone": "48992004004", "cpf": "44455566677",
  "especializacao": "Natação", "registroCref": "112233-G/SC",
  "facebook": "patriciagomesnatacao", "website": "www.patriciagomes.com.br",
  "exclusivoMulheres": false,
  "endereco": {"rua": "Rua João Pinto", "numero": "200", "bairro": "Centro", "cidade": "Florianópolis", "estado": "SC", "cep": "88010-420"},
  "gradeAtividades": [{"atividade": "Natação", "diasSemana": ["Seg","Ter","Qua","Qui","Sex"], "periodos": ["Manhã","Tarde"]}]
}' > /dev/null && echo "  -> Patrícia Gomes"

curl -s -X POST "$API/profissionais/registrar" -H "Content-Type: application/json" -d '{
  "nome": "Thiago Ribeiro", "email": "thiago@teste.com", "senha": "Teste@123",
  "telefone": "48992005005", "cpf": "55566677788",
  "especializacao": "Funcional, Academia", "registroCref": "445566-G/SC",
  "instagram": "@thiagofuncional",
  "exclusivoMulheres": false,
  "endereco": {"rua": "Av. Madre Benvenuta", "numero": "1500", "bairro": "Santa Mônica", "cidade": "Florianópolis", "estado": "SC", "cep": "88035-001"},
  "gradeAtividades": [{"atividade": "Funcional", "diasSemana": ["Seg","Ter","Qua","Qui","Sex","Sab"], "periodos": ["Manhã","Tarde","Noite"]},{"atividade": "Academia", "diasSemana": ["Seg","Qua","Sex"], "periodos": ["Manhã"]}]
}' > /dev/null && echo "  -> Thiago Ribeiro"

curl -s -X POST "$API/profissionais/registrar" -H "Content-Type: application/json" -d '{
  "nome": "Camila Duarte", "email": "camila@teste.com", "senha": "Teste@123",
  "telefone": "48992006006", "cpf": "66677788899",
  "especializacao": "Dança, Balé",
  "instagram": "@camiladanca", "facebook": "camiladuartedanca",
  "exclusivoMulheres": false,
  "endereco": {"rua": "Rua Tenente Silveira", "numero": "50", "bairro": "Centro", "cidade": "Florianópolis", "estado": "SC", "cep": "88010-300"},
  "gradeAtividades": [{"atividade": "Dança", "diasSemana": ["Seg","Ter","Qua","Qui","Sex"], "periodos": ["Tarde","Noite"]},{"atividade": "Balé", "diasSemana": ["Ter","Qui"], "periodos": ["Manhã"]}]
}' > /dev/null && echo "  -> Camila Duarte"

curl -s -X POST "$API/profissionais/registrar" -H "Content-Type: application/json" -d '{
  "nome": "André Machado", "email": "andre@teste.com", "senha": "Teste@123",
  "telefone": "48992007007", "cpf": "77788899900",
  "especializacao": "Fisioterapia Esportiva",
  "website": "www.andremachado.com.br",
  "exclusivoMulheres": false,
  "endereco": {"rua": "Rua Deputado Antônio Edu Vieira", "numero": "900", "bairro": "Pantanal", "cidade": "Florianópolis", "estado": "SC", "cep": "88040-001"},
  "gradeAtividades": [{"atividade": "Fisioterapia", "diasSemana": ["Seg","Ter","Qua","Qui","Sex"], "periodos": ["Manhã","Tarde"]}]
}' > /dev/null && echo "  -> André Machado"

echo ""
echo "=== Criando 1 Admin ==="
curl -s -X POST "$API/administradores/registrar" -H "Content-Type: application/json" -d '{
  "nome": "Admin IlhaFit", "email": "admin@ilhafit.com", "senha": "Teste@123", "cpf": "00000000000"
}' > /dev/null && echo "  -> Admin IlhaFit (admin@ilhafit.com)"

echo ""
echo "========================================="
echo " 26 contas criadas com sucesso!"
echo " Senha padrão: Teste@123"
echo ""
echo " Alunos: aluno1@teste.com ... aluno10@teste.com"
echo " Estabelecimentos: powerfit@teste.com, bellaforma@teste.com, crossfitilha@teste.com,"
echo "   floripafight@teste.com, ilhasul@teste.com, dancaviva@teste.com,"
echo "   fisiovida@teste.com, bikefit@teste.com"
echo " Profissionais: rafael@teste.com, mariana@teste.com, lucas@teste.com,"
echo "   patricia@teste.com, thiago@teste.com, camila@teste.com, andre@teste.com"
echo " Admin: admin@ilhafit.com"
echo "========================================="

import React, { useState } from "react";
import {
    Box,
    Typography,
    TextField,
    Button,
    Grid,
    Paper,
    ToggleButton,
    ToggleButtonGroup,
    Checkbox,
    FormControlLabel,
    IconButton,
    Avatar,
    useTheme,
    Divider,
    Collapse,
    Autocomplete,
    Chip,
    InputAdornment
} from "@mui/material";
import { FaTimes, FaUpload, FaWhatsapp, FaUser, FaBuilding, FaUserTie, FaEye, FaEyeSlash, FaChevronDown } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { authService } from "../../services";



const Cadastro = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const isDark = theme.palette.mode === 'dark';

    const [accountType, setAccountType] = useState("aluno");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [step, setStep] = useState(1);
    const initialFormData = {
        nome: "",
        email: "",
        senha: "",
        confirmarSenha: "",
        endereco: {
            rua: "",
            numero: "",
            complemento: "",
            bairro: "",
            cidade: "",
            estado: "",
            cep: "",
            latitude: null,
            longitude: null
        },
        telefone: "",
        cnpj: "",
        cpf: "",
        sexo: "",
        especializacao: "",
        registroCref: "",
        descricao: "",
        gradeAtividades: [], // [{ atividade, diasSemana: [], periodos: [], exclusivoMulheres: false }]
        exclusivoMulheres: false,
        fotoUrl: "",
        fotosUrl: [],
        outrosAtividade: "", // Texto personalizado para "Outros"
    };

    const [formData, setFormData] = useState(initialFormData);

    const [expandedActivities, setExpandedActivities] = useState(new Set());

    const handleTypeChange = (event, newType) => {
        if (newType !== null && newType !== accountType) {
            setAccountType(newType);
            setFormData(initialFormData);
            setStep(1);
            setExpandedActivities(new Set());
        }
    };

    const convertToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    };


    // Funções de máscara
    const maskCPF = (value) => {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})/, '$1-$2')
            .replace(/(-\d{2})\d+?$/, '$1');
    };

    const maskCNPJ = (value) => {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{2})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1/$2')
            .replace(/(\d{4})(\d)/, '$1-$2')
            .replace(/(-\d{2})\d+?$/, '$1');
    };

    const maskPhone = (value) => {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{2})(\d)/, '($1) $2')
            .replace(/(\d{5})(\d)/, '$1-$2')
            .replace(/(-\d{4})\d+?$/, '$1');
    };

    const maskCEP = (value) => {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{5})(\d)/, '$1-$2')
            .replace(/(-\d{3})\d+?$/, '$1');
    };

    const maskCREF = (value) => {
        return value
            .toUpperCase()
            .replace(/[^0-9A-Z/-]/g, '')
            .replace(/^(\d{6})([a-zA-Z])/, '$1-$2')
            .replace(/(-[a-zA-Z])([a-zA-Z]{2})/, '$1/$2')
            .substring(0, 11);
    };

    const validatePassword = (password) => {
        const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return regex.test(password);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        let newValue = value;

        // Aplicar máscaras
        if (name === "cpf") {
            newValue = maskCPF(value);
        } else if (name === "cnpj") {
            newValue = maskCNPJ(value);
        } else if (name === "telefone") {
            newValue = maskPhone(value);
        } else if (name === "endereco.cep") {
            newValue = maskCEP(value);
        } else if (name === "registroCref") {
            newValue = maskCREF(value);
        }

        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: { ...prev[parent], [child]: newValue }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: newValue }));
        }
    };

    const handleAtividadeToggle = (atividade) => {
        setFormData(prev => {
            const exists = prev.gradeAtividades.find(g => g.atividade === atividade);
            let nextGrade;
            let nextExpanded = new Set(expandedActivities);

            if (exists) {
                nextGrade = prev.gradeAtividades.filter(g => g.atividade !== atividade);
                nextExpanded.delete(atividade);
            } else {
                nextGrade = [...prev.gradeAtividades, { atividade, diasSemana: [], periodos: [], exclusivoMulheres: false }];
                nextExpanded.add(atividade);
            }
            setExpandedActivities(nextExpanded);
            return { ...prev, gradeAtividades: nextGrade };
        });
    };

    const handleExpandToggle = (atividade) => {
        setExpandedActivities(prev => {
            const next = new Set(prev);
            if (next.has(atividade)) next.delete(atividade);
            else next.add(atividade);
            return next;
        });
    };

    const handleGradeUpdate = (atividade, field, value) => {
        setFormData(prev => ({
            ...prev,
            gradeAtividades: prev.gradeAtividades.map(g =>
                g.atividade === atividade ? { ...g, [field]: value } : g
            )
        }));
    };

    const handleFileChange = async (e) => {
        if (e.target.files && e.target.files.length > 0) {
            try {
                if (accountType === "estabelecimento") {
                    const files = Array.from(e.target.files);
                    const base64Files = await Promise.all(files.map(file => convertToBase64(file)));
                    setFormData(prev => ({
                        ...prev,
                        fotosUrl: [...(prev.fotosUrl || []), ...base64Files]
                    }));
                } else {
                    const file = e.target.files[0];
                    const base64 = await convertToBase64(file);
                    setFormData(prev => ({ ...prev, fotoUrl: base64 }));
                }
            } catch (error) {
                console.error("Erro ao converter imagem:", error);
                toast.error("Erro ao processar a imagem. Tente novamente.");
            }
        }
    };

    const handleRemoveFoto = (index) => {
        setFormData(prev => ({
            ...prev,
            fotosUrl: prev.fotosUrl.filter((_, i) => i !== index)
        }));
    };

    const handleCepBlur = async (e) => {
        const cep = e.target.value.replace(/\D/g, "");
        if (cep.length === 8) {
            try {
                const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                const data = await response.json();
                if (!data.erro) {
                    const cidade = data.localidade;

                    setFormData(prev => ({
                        ...prev,
                        endereco: {
                            ...prev.endereco,
                            rua: data.logradouro,
                            bairro: data.bairro,
                            cidade: cidade,
                            estado: data.uf,
                            cep: data.cep
                        }
                    }));
                } else {
                    toast.error("CEP não encontrado.");
                }
            } catch (error) {
                console.error("Erro ao buscar CEP:", error);
            }
        }
    };

    const fetchCoordinates = async (address) => {
        try {
            // Se não tiver rua ou cidade, não buscamos
            if (!address.rua || !address.cidade) return null;

            // Usando MapTiler Geocoding para maior precisão, forçando Brasil
            const query = `${address.rua}, ${address.numero || ''}, ${address.bairro || ''}, ${address.cidade} - ${address.estado}, ${address.cep}, Brasil`;
            const apiKey = "MFouw8iASb0sVoPbhqsk";
            // Adicionado country=br para restringir resultados ao Brasil
            const url = `https://api.maptiler.com/geocoding/${encodeURIComponent(query)}.json?key=${apiKey}&country=br`;

            const response = await fetch(url);
            const data = await response.json();

            if (data.features && data.features.length > 0) {
                const feature = data.features[0];
                const [lon, lat] = feature.center;
                return { lat, lon };
            }
        } catch (error) {
            console.error("Erro ao buscar coordenadas no MapTiler:", error);
        }
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (step === 1) {
            if (formData.senha !== formData.confirmarSenha) {
                toast.error("As senhas não coincidem!");
                return;
            }
            if (!validatePassword(formData.senha)) {
                toast.error("Senha deve ter no mínimo 8 dígitos, 1 maiúscula, 1 caractere especial e 1 número.");
                return;
            }
            if (accountType === "aluno") {
                // Aluno doesn't have Step 2
                performRegistration();
            } else {
                setStep(2);
                window.scrollTo(0, 0);
            }
            return;
        }

        performRegistration();
    };

    const performRegistration = async () => {
        try {
            const dataToSend = { ...formData };

            // Sanitização de campos (remover caracteres não numéricos)
            if (dataToSend.telefone) dataToSend.telefone = dataToSend.telefone.replace(/\D/g, "");
            if (dataToSend.cpf) dataToSend.cpf = dataToSend.cpf.replace(/\D/g, "");
            if (dataToSend.cnpj) dataToSend.cnpj = dataToSend.cnpj.replace(/\D/g, "");
            if (dataToSend.endereco && dataToSend.endereco.cep) {
                dataToSend.endereco.cep = dataToSend.endereco.cep.replace(/\D/g, "");
            }

            // Geocoding para Estabelecimentos
            if (accountType === "estabelecimento" && dataToSend.endereco) {

                toast.info("Garantindo sua localização exata no mapa...", { autoClose: 2000 });
                const coords = await fetchCoordinates(dataToSend.endereco);
                if (coords) {
                    dataToSend.endereco = {
                        ...dataToSend.endereco,
                        latitude: coords.lat,
                        longitude: coords.lon
                    };
                } else {
                    toast.error("Não conseguimos validar seu endereço. Verifique os dados.");
                    return;
                }
            }

            await authService.register(dataToSend, accountType);

            try {
                const loginData = await authService.login(formData.email, formData.senha);
                toast.success(`Cadastro realizado! Bem-vindo(a), ${loginData.nome}! 🚀`);
                window.dispatchEvent(new Event('storage'));
            } catch (loginErr) {
                console.warn("Erro no login automático:", loginErr);
                toast.success("Cadastro realizado com sucesso! Faça login para continuar.");
            }

            // Força o recarregamento da página para atualizar o estado de autenticação (NavBar)
            window.location.href = "/";
        } catch (error) {
            console.error("Erro no cadastro:", error);
        }
    };

    const atividadesList = [
        "Academia", "CrossFit", "Funcional",
        "Pilates", "Yoga", "Dança",
        "Balé", "Basquete", "Futebol",
        "Natação", "Vôlei", "Jiu-Jitsu",
        "Boxe", "Muay Thai", "Kung Fu",
        "Ciclismo", "Circo", "Fisioterapia",
        "Outros"
    ];

    const crefRequiredActivities = [
        "Academia", "CrossFit", "Funcional",
        "Natação", "Basquete", "Futebol",
        "Vôlei", "Boxe", "Muay Thai",
        "Kung Fu", "Jiu-Jitsu", "Ciclismo"
    ];

    const showCref = accountType === "profissional" &&
        formData.gradeAtividades.some(g => crefRequiredActivities.includes(g.atividade));

    const inputStyles = {
        "& .MuiOutlinedInput-root": {
            bgcolor: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(16, 185, 129, 0.05)",
            borderRadius: 2,
            "& fieldset": { borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(16, 185, 129, 0.2)" },
            "&:hover fieldset": { borderColor: theme.palette.primary.main },
        },
        mb: 2
    };

    return (
        <Box sx={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "background.default",
            py: 4,
            px: 2
        }}>
            <Paper elevation={0} sx={{
                width: "100%",
                maxWidth: 600,
                p: 4,
                borderRadius: 4,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
                position: "relative"
            }}>
                <IconButton
                    onClick={() => navigate("/")}
                    sx={{ position: "absolute", top: 16, right: 16, color: "text.secondary" }}
                >
                    <FaTimes size={20} />
                </IconButton>

                <Typography variant="h4" fontWeight={800} sx={{ mb: 3, color: "text.primary" }}>
                    Criar Conta
                </Typography>

                <Box sx={{ mb: 4 }}>
                    <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5, color: "text.secondary" }}>
                        Tipo de conta
                    </Typography>
                    <ToggleButtonGroup
                        value={accountType}
                        exclusive
                        onChange={handleTypeChange}
                        fullWidth
                        sx={{
                            gap: 1,
                            "& .MuiToggleButton-root": {
                                border: "1px solid !important",
                                borderColor: "divider !important",
                                borderRadius: "12px !important",
                                color: "text.secondary",
                                textTransform: "none",
                                fontWeight: 600,
                                py: 1.5,
                                "&.Mui-selected": {
                                    bgcolor: "primary.main",
                                    color: "white",
                                    "&:hover": { bgcolor: "primary.dark" }
                                }
                            }
                        }}
                    >
                        <ToggleButton value="aluno">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <FaUser size={14} /> Aluno
                            </Box>
                        </ToggleButton>
                        <ToggleButton value="estabelecimento">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <FaBuilding size={14} /> Estabelecimento
                            </Box>
                        </ToggleButton>
                        <ToggleButton value="profissional">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <FaUserTie size={14} /> Profissional
                            </Box>
                        </ToggleButton>
                    </ToggleButtonGroup>
                </Box>

                <form onSubmit={handleSubmit}>
                    {step === 1 ? (
                        <>
                            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5, color: "text.secondary" }}>
                                {accountType === "estabelecimento" ? "Nome do Estabelecimento" : "Nome Completo"}
                            </Typography>
                            <TextField
                                fullWidth
                                name="nome"
                                value={formData.nome}
                                onChange={handleInputChange}
                                placeholder={accountType === "estabelecimento" ? "Ex: Academia Fit" : "Seu nome completo"}
                                sx={inputStyles}
                                required
                            />

                            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5, color: "text.secondary" }}>
                                Email
                            </Typography>
                            <TextField
                                fullWidth
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="seu@email.com"
                                sx={inputStyles}
                                required
                            />

                            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5, color: "text.secondary" }}>
                                        Senha
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        name="senha"
                                        type={showPassword ? "text" : "password"}
                                        value={formData.senha}
                                        onChange={handleInputChange}
                                        placeholder="••••••••"
                                        required
                                        sx={{
                                            "& .MuiOutlinedInput-root": {
                                                bgcolor: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(16, 185, 129, 0.05)",
                                                borderRadius: 2,
                                                "& fieldset": { borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(16, 185, 129, 0.2)" },
                                                "&:hover fieldset": { borderColor: theme.palette.primary.main },
                                            }
                                        }}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        edge="end"
                                                        size="small"
                                                    >
                                                        {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5, color: "text.secondary" }}>
                                        Confirmar Senha
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        name="confirmarSenha"
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={formData.confirmarSenha}
                                        onChange={handleInputChange}
                                        placeholder="••••••••"
                                        required
                                        sx={{
                                            "& .MuiOutlinedInput-root": {
                                                bgcolor: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(16, 185, 129, 0.05)",
                                                borderRadius: 2,
                                                "& fieldset": { borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(16, 185, 129, 0.2)" },
                                                "&:hover fieldset": { borderColor: theme.palette.primary.main },
                                            }
                                        }}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                        edge="end"
                                                        size="small"
                                                    >
                                                        {showConfirmPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Box>
                            </Box>

                            {accountType === "estabelecimento" && (
                                <>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={4}>
                                            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5, color: "text.secondary" }}>
                                                CEP
                                            </Typography>
                                            <TextField
                                                fullWidth
                                                name="endereco.cep"
                                                value={formData.endereco.cep}
                                                onChange={handleInputChange}
                                                onBlur={handleCepBlur}
                                                placeholder="00000-000"
                                                sx={inputStyles}
                                                required
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={8}>
                                            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5, color: "text.secondary" }}>
                                                Rua
                                            </Typography>
                                            <TextField
                                                fullWidth
                                                name="endereco.rua"
                                                value={formData.endereco.rua}
                                                onChange={handleInputChange}
                                                placeholder="Nome da rua"
                                                sx={inputStyles}
                                                required
                                            />
                                        </Grid>
                                    </Grid>

                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={4}>
                                            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5, color: "text.secondary" }}>
                                                Número
                                            </Typography>
                                            <TextField
                                                fullWidth
                                                name="endereco.numero"
                                                value={formData.endereco.numero}
                                                onChange={handleInputChange}
                                                placeholder="Ex: 123"
                                                sx={inputStyles}
                                                required
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={8}>
                                            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5, color: "text.secondary" }}>
                                                Bairro
                                            </Typography>
                                            <TextField
                                                fullWidth
                                                name="endereco.bairro"
                                                value={formData.endereco.bairro}
                                                onChange={handleInputChange}
                                                placeholder="Nome do bairro"
                                                sx={inputStyles}
                                                required
                                            />
                                        </Grid>
                                    </Grid>

                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5, color: "text.secondary" }}>
                                            Cidade
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            name="endereco.cidade"
                                            value={formData.endereco.cidade}
                                            onChange={handleInputChange}
                                            placeholder="Ex: Florianópolis"
                                            sx={inputStyles}
                                            required
                                        />
                                    </Box>
                                </>
                            )}

                            {accountType !== "aluno" && (
                                <Grid container spacing={2} sx={{ mb: 2 }}>
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5, color: "text.secondary" }}>
                                            WhatsApp / Telefone
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            name="telefone"
                                            value={formData.telefone}
                                            onChange={handleInputChange}
                                            placeholder="5548999999999"
                                            sx={inputStyles}
                                            required
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5, color: "text.secondary" }}>
                                            {accountType === "estabelecimento" ? "CNPJ" : "CPF"}
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            name={accountType === "estabelecimento" ? "cnpj" : "cpf"}
                                            value={accountType === "estabelecimento" ? formData.cnpj : formData.cpf}
                                            onChange={handleInputChange}
                                            placeholder={accountType === "estabelecimento" ? "00.000.000/0000-00" : "000.000.000-00"}
                                            sx={inputStyles}
                                            required
                                        />
                                    </Grid>
                                </Grid>
                            )}

                            {accountType !== "aluno" && (
                                <>
                                    <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1, color: "text.secondary" }}>
                                        {accountType === "estabelecimento" ? "Fotos do Estabelecimento" : "Foto de Perfil"}
                                    </Typography>
                                    <Box sx={{ mb: 3 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                            <Avatar
                                                src={accountType === "estabelecimento" ? (formData.fotosUrl && formData.fotosUrl[0]) : formData.fotoUrl}
                                                sx={{
                                                    width: 80,
                                                    height: 80,
                                                    border: '2px solid',
                                                    borderColor: 'primary.main',
                                                }}
                                            />
                                            <Button
                                                variant="outlined"
                                                component="label"
                                                startIcon={<FaUpload />}
                                                sx={{ textTransform: 'none', borderRadius: 2 }}
                                            >
                                                {accountType === "estabelecimento" ? "Adicionar Mais Fotos" : "Upload"}
                                                <input
                                                    type="file"
                                                    hidden
                                                    accept="image/*"
                                                    multiple={accountType === "estabelecimento"}
                                                    onChange={handleFileChange}
                                                />
                                            </Button>
                                        </Box>

                                        {accountType === "estabelecimento" && formData.fotosUrl?.length > 1 && (
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mt: 2 }}>
                                                {formData.fotosUrl.slice(1, 6).map((url, i) => (
                                                    <Box key={i + 1} sx={{ position: 'relative' }}>
                                                        <Avatar
                                                            src={url}
                                                            sx={{
                                                                width: 60,
                                                                height: 60,
                                                                border: '1px solid',
                                                                borderColor: 'divider',
                                                                opacity: i === 4 && formData.fotosUrl.length > 6 ? 0.5 : 1
                                                            }}
                                                        />
                                                        {i === 4 && formData.fotosUrl.length > 6 && (
                                                            <Box sx={{
                                                                position: 'absolute',
                                                                top: 0,
                                                                left: 0,
                                                                width: '100%',
                                                                height: '100%',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                bgcolor: 'rgba(0,0,0,0.5)',
                                                                color: 'white',
                                                                borderRadius: '50%',
                                                                fontSize: '0.8rem',
                                                                fontWeight: 700,
                                                                pointerEvents: 'none'
                                                            }}>
                                                                +{formData.fotosUrl.length - 6}
                                                            </Box>
                                                        )}
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleRemoveFoto(i + 1)}
                                                            sx={{
                                                                position: 'absolute',
                                                                top: -8,
                                                                right: -8,
                                                                bgcolor: 'error.main',
                                                                color: 'white',
                                                                width: 20,
                                                                height: 20,
                                                                zIndex: 2,
                                                                '&:hover': { bgcolor: 'error.dark' }
                                                            }}
                                                        >
                                                            <FaTimes size={10} />
                                                        </IconButton>
                                                    </Box>
                                                ))}
                                            </Box>
                                        )}
                                    </Box>
                                </>
                            )}
                        </>
                    ) : (
                        <>
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
                                    Quase lá! 🏋️‍♀️
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Agora defina suas atividades e horários de disponibilidade.
                                </Typography>
                            </Box>

                            {showCref && (
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5, color: "text.secondary" }}>
                                        Registro CREF (Opcional)
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        name="registroCref"
                                        value={formData.registroCref}
                                        onChange={handleInputChange}
                                        placeholder="000000-G/SC"
                                        sx={inputStyles}
                                    />
                                </Box>
                            )}

                            {accountType === "profissional" && (
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5, color: "text.secondary" }}>
                                        Sexo
                                    </Typography>
                                    <ToggleButtonGroup
                                        value={formData.sexo}
                                        exclusive
                                        onChange={(e, val) => val && setFormData(prev => ({ ...prev, sexo: val }))}
                                        fullWidth
                                        sx={{
                                            gap: 1,
                                            "& .MuiToggleButton-root": {
                                                border: "1px solid !important",
                                                borderColor: "divider !important",
                                                borderRadius: "12px !important",
                                                color: "text.secondary",
                                                textTransform: "none",
                                                fontWeight: 600,
                                                py: 1,
                                                "&.Mui-selected": {
                                                    bgcolor: "primary.main",
                                                    color: "white",
                                                    "&:hover": { bgcolor: "primary.dark" }
                                                }
                                            }
                                        }}
                                    >
                                        <ToggleButton value="Feminino">Feminino</ToggleButton>
                                        <ToggleButton value="Masculino">Masculino</ToggleButton>
                                    </ToggleButtonGroup>
                                </Box>
                            )}

                            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1, color: "text.secondary" }}>
                                {accountType === "estabelecimento" ? "Atividades Oferecidas *" : "Sua Especialidade/Profissão *"}
                            </Typography>

                            <Autocomplete
                                multiple
                                options={atividadesList.sort()}
                                value={formData.gradeAtividades.map(g => g.atividade)}
                                onChange={(event, newValue) => {
                                    // Sincronizar gradeAtividades com a seleção
                                    const currentActivities = formData.gradeAtividades.map(g => g.atividade);

                                    // Adicionados novos
                                    const added = newValue.filter(v => !currentActivities.includes(v));
                                    // Removidos
                                    const removed = currentActivities.filter(v => !newValue.includes(v));

                                    let newGrade = [...formData.gradeAtividades];

                                    // Adicionar novos modelos de grade
                                    added.forEach(atividade => {
                                        newGrade.push({ atividade, diasSemana: [], periodos: [], exclusivoMulheres: false });
                                        setExpandedActivities(prev => new Set(prev).add(atividade));
                                    });

                                    // Remover os que saíram
                                    if (removed.length > 0) {
                                        newGrade = newGrade.filter(g => !removed.includes(g.atividade));
                                        setExpandedActivities(prev => {
                                            const next = new Set(prev);
                                            removed.forEach(r => next.delete(r));
                                            return next;
                                        });
                                    }

                                    setFormData(prev => ({ ...prev, gradeAtividades: newGrade }));
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        placeholder="Selecione as atividades..."
                                        sx={inputStyles}
                                    />
                                )}
                                renderTags={() => null} // Oculta as tags dentro do input
                                sx={{ mb: 2 }}
                            />

                            {/* Tags fora do input */}
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                                {formData.gradeAtividades.map((g, index) => (
                                    <Chip
                                        key={index}
                                        label={g.atividade}
                                        onDelete={() => {
                                            const newGrade = formData.gradeAtividades.filter(item => item.atividade !== g.atividade);
                                            setFormData(prev => ({ ...prev, gradeAtividades: newGrade }));
                                        }}
                                        sx={{ borderRadius: 1.5, fontWeight: 700, bgcolor: 'primary.main', color: 'white' }}
                                    />
                                ))}
                            </Box>

                            {formData.gradeAtividades.some(g => g.atividade === "Outros") && (
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5, color: "text.secondary" }}>
                                        Especifique a outra atividade
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        name="outrosAtividade"
                                        value={formData.outrosAtividade}
                                        onChange={handleInputChange}
                                        placeholder="Ex: Tênis de Mesa, Surf..."
                                        sx={inputStyles}
                                        required
                                    />
                                </Box>
                            )}

                            {formData.gradeAtividades.length > 0 && (
                                <>
                                    <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1, color: "text.secondary" }}>
                                        Configurar Horários
                                    </Typography>
                                    <Paper variant="outlined" sx={{
                                        p: 2, mb: 3, borderRadius: 2, overflow: 'hidden',
                                        bgcolor: isDark ? "rgba(255, 255, 255, 0.02)" : "rgba(16, 185, 129, 0.02)",
                                    }}>
                                        <Grid container spacing={1}>
                                            {formData.gradeAtividades.map((grade) => {
                                                const atividade = grade.atividade;
                                                return (
                                                    <Grid item xs={12} key={atividade} sx={{ mb: 1 }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                            <Typography variant="body2" fontWeight={700} sx={{ color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main' }} />
                                                                {atividade === "Outros" ? `Outros (${formData.outrosAtividade || '...'})` : atividade}
                                                            </Typography>
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleExpandToggle(atividade)}
                                                                sx={{
                                                                    transition: 'transform 0.3s',
                                                                    transform: expandedActivities.has(atividade) ? 'rotate(180deg)' : 'rotate(0deg)'
                                                                }}
                                                            >
                                                                <FaChevronDown size={14} />
                                                            </IconButton>
                                                        </Box>

                                                        <Collapse in={expandedActivities.has(atividade)}>
                                                            <Box sx={{ ml: 2, mt: 1, pb: 2 }}>
                                                                <Typography variant="caption" color="text.secondary" fontWeight={700}>Dias da Semana:</Typography>
                                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1, mt: 0.5 }}>
                                                                    {["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"].map(dia => (
                                                                        <ToggleButton
                                                                            key={dia}
                                                                            value={dia}
                                                                            selected={grade.diasSemana?.includes(dia)}
                                                                            onChange={() => {
                                                                                const newDias = grade.diasSemana?.includes(dia)
                                                                                    ? grade.diasSemana.filter(d => d !== dia)
                                                                                    : [...(grade.diasSemana || []), dia];
                                                                                handleGradeUpdate(atividade, 'diasSemana', newDias);
                                                                            }}
                                                                            size="small"
                                                                            sx={{ borderRadius: 1.5, px: 1, py: 0.2, fontSize: '0.65rem' }}
                                                                        >
                                                                            {dia}
                                                                        </ToggleButton>
                                                                    ))}
                                                                </Box>
                                                                <Typography variant="caption" color="text.secondary" fontWeight={700}>Período:</Typography>
                                                                <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                                                                    {["Manhã", "Tarde", "Noite"].map(periodo => (
                                                                        <ToggleButton
                                                                            key={periodo}
                                                                            value={periodo}
                                                                            selected={grade.periodos?.includes(periodo)}
                                                                            onChange={() => {
                                                                                const newPeriodos = grade.periodos?.includes(periodo)
                                                                                    ? grade.periodos.filter(p => p !== periodo)
                                                                                    : [...(grade.periodos || []), periodo];
                                                                                handleGradeUpdate(atividade, 'periodos', newPeriodos);
                                                                            }}
                                                                            size="small"
                                                                            sx={{ borderRadius: 1.5, px: 1, py: 0.2, fontSize: '0.65rem' }}
                                                                        >
                                                                            {periodo}
                                                                        </ToggleButton>
                                                                    ))}
                                                                </Box>

                                                                {/* Novo: Opção exclusiva mulheres por atividade */}
                                                                {(accountType === "estabelecimento" || formData.sexo === "Feminino") && (
                                                                    <Box sx={{ mt: 1.5 }}>
                                                                        <FormControlLabel
                                                                            control={
                                                                                <Checkbox
                                                                                    size="small"
                                                                                    checked={grade.exclusivoMulheres || false}
                                                                                    onChange={(e) => handleGradeUpdate(atividade, 'exclusivoMulheres', e.target.checked)}
                                                                                />
                                                                            }
                                                                            label={<Typography variant="caption" fontWeight={600}>Oferecer aula apenas para mulheres</Typography>}
                                                                        />
                                                                    </Box>
                                                                )}
                                                            </Box>
                                                        </Collapse>
                                                        <Divider sx={{ mt: 1, opacity: 0.3 }} />
                                                    </Grid>
                                                );
                                            })}
                                        </Grid>
                                    </Paper>
                                </>
                            )}

                            <Button onClick={() => setStep(1)} sx={{ mb: 2, textTransform: 'none' }}>
                                Voltar para dados básicos
                            </Button>
                        </>
                    )}

                    <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        sx={{
                            py: 1.5,
                            borderRadius: 3,
                            fontWeight: 700,
                            fontSize: "1rem",
                            textTransform: "none",
                            boxShadow: `0 8px 16px ${isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.3)'}`,
                            "&:hover": {
                                bgcolor: "primary.dark",
                                transform: "translateY(-2px)",
                                transition: "all 0.2s ease"
                            }
                        }}
                    >
                        {step === 1 && accountType !== "aluno" ? "Continuar" : "Cadastrar"}
                    </Button>

                    {step === 1 && (
                        <Box sx={{ mt: 3, textAlign: "center" }}>
                            <Typography variant="body2" color="text.secondary">
                                Já tem conta?{" "}
                                <Typography
                                    component="span"
                                    variant="body2"
                                    fontWeight={700}
                                    color="primary.main"
                                    sx={{ cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
                                    onClick={() => navigate("/login")}
                                >
                                    Entre
                                </Typography>
                            </Typography>
                        </Box>
                    )}
                </form>
            </Paper>
        </Box>
    );
};

export default Cadastro;

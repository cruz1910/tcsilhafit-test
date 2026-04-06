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
    InputAdornment,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Tooltip,
} from "@mui/material";
import { FaTimes, FaUpload, FaWhatsapp, FaUser, FaBuilding, FaUserTie, FaEye, FaEyeSlash, FaChevronDown, FaInstagram, FaFacebook, FaGlobe } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { authService, categoriaService } from "../../services";
import { useEffect } from "react";const Cadastro = () => {
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
        categoriaIds: [], // array de IDs unificados para o DTO
        exclusivoMulheres: false,
        fotoUrl: "",
        fotosUrl: [],
        outrosAtividade: "", // Texto personalizado para "Outros"
        instagram: "",
        facebook: "",
        website: "",
    };

    const [formData, setFormData] = useState(initialFormData);
    const [categoriasDb, setCategoriasDb] = useState([]);
    const [sugestaoModal, setSugestaoModal] = useState(false);
    const [sugestaoNome, setSugestaoNome] = useState("");

    useEffect(() => {
        const carregarCategorias = async () => {
            try {
                const data = await categoriaService.listarTodas();
                setCategoriasDb(data);
            } catch (error) {
                console.error("Erro ao carregar categorias:", error);
            }
        };
        carregarCategorias();
    }, []);

    const handleTypeChange = (event, newType) => {
        if (newType !== null && newType !== accountType) {
            setAccountType(newType);
            setFormData(initialFormData);
            setStep(1);
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



    const crefRequiredActivities = [
        "Academia", "CrossFit", "Funcional",
        "Natação", "Basquete", "Futebol",
        "Vôlei", "Boxe", "Muay Thai",
        "Kung Fu", "Jiu-Jitsu", "Ciclismo"
    ];

    const showCref = accountType === "profissional" &&
        formData.categoriaIds.some(id => {
            const cat = categoriasDb.find(c => c.id === id);
            return cat && crefRequiredActivities.includes(cat.nome);
        });

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
        <>
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

                            {/* Redes Sociais & Contatos */}
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1, color: "text.secondary" }}>
                                Redes Sociais & Contatos (Opcional)
                            </Typography>
                            <Grid container spacing={2} sx={{ mb: 2 }}>
                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        fullWidth
                                        name="instagram"
                                        value={formData.instagram}
                                        onChange={handleInputChange}
                                        placeholder="@seuperfil"
                                        sx={inputStyles}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <FaInstagram size={16} color="#E4405F" />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        fullWidth
                                        name="facebook"
                                        value={formData.facebook}
                                        onChange={handleInputChange}
                                        placeholder="facebook.com/seuperfil"
                                        sx={inputStyles}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <FaFacebook size={16} color="#1877F2" />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        fullWidth
                                        name="website"
                                        value={formData.website}
                                        onChange={handleInputChange}
                                        placeholder="www.seusite.com"
                                        sx={inputStyles}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <FaGlobe size={16} color={theme.palette.primary.main} />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Grid>
                            </Grid>
                        </>
                    ) : (
                        <>
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
                                    Quase lá! 🏋️‍♀️
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Agora selecione as categorias em que você atua.
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
                                {accountType === "estabelecimento" ? "Categorias de Atividades *" : "Suas Categorias de Atuação *"}
                            </Typography>

                            <Autocomplete
                                multiple
                                options={categoriasDb}
                                getOptionLabel={(option) => option.nome}
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                value={categoriasDb.filter(c => formData.categoriaIds.includes(c.id))}
                                onChange={(event, newValue) => {
                                    const ids = newValue.map(item => item.id);
                                    setFormData(prev => ({ ...prev, categoriaIds: ids }));
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        placeholder="Selecione as categorias..."
                                        sx={inputStyles}
                                    />
                                )}
                                renderTags={() => null} // Oculta as tags dentro do input
                                sx={{ mb: 2 }}
                            />

                            {/* Tags fora do input */}
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                                {categoriasDb.filter(c => formData.categoriaIds.includes(c.id)).map((cat, index) => (
                                    <Chip
                                        key={index}
                                        label={cat.nome}
                                        onDelete={() => {
                                            const newIds = formData.categoriaIds.filter(id => id !== cat.id);
                                            setFormData(prev => ({ ...prev, categoriaIds: newIds }));
                                        }}
                                        sx={{ borderRadius: 1.5, fontWeight: 700, bgcolor: 'primary.main', color: 'white' }}
                                    />
                                ))}
                            </Box>
                            {/* Chip de sugestão pendente */}
                            {formData.outrosAtividade && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                    <Chip
                                        label={`Sugestão enviada: "${formData.outrosAtividade}"`}
                                        onDelete={() => setFormData(prev => ({ ...prev, outrosAtividade: "" }))}
                                        sx={{ borderRadius: 1.5, fontWeight: 600, bgcolor: 'warning.main', color: 'white' }}
                                    />
                                </Box>
                            )}

                            {/* Botão sugerir nova categoria */}
                            <Tooltip title={formData.outrosAtividade ? "Você já fez uma sugestão. Remova-a para enviar outra." : ""}>
                                <span>
                                    <Button
                                        variant="text"
                                        size="small"
                                        disabled={!!formData.outrosAtividade}
                                        onClick={() => { setSugestaoNome(""); setSugestaoModal(true); }}
                                        sx={{ mb: 2, textTransform: 'none', color: 'text.secondary', fontWeight: 600,
                                            '&:hover': { color: 'primary.main' } }}
                                    >
                                        Não encontrei minha área de atuação →
                                    </Button>
                                </span>
                            </Tooltip>

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

        {/* Dialog: Sugerir nova categoria */}
        <Dialog
            open={sugestaoModal}
            onClose={() => setSugestaoModal(false)}
            PaperProps={{ sx: { borderRadius: 4, p: 1, minWidth: 360 } }}
        >
            <DialogTitle sx={{ fontWeight: 800 }}>Sugerir nova categoria</DialogTitle>
            <DialogContent>
                <DialogContentText sx={{ mb: 2, fontWeight: 500 }}>
                    Informe o nome da área de atuação que não encontrou na lista.
                    Sua sugestão será analisada pelo administrador e, se aprovada,
                    estará disponível para seleção.
                </DialogContentText>
                <TextField
                    autoFocus
                    fullWidth
                    label="Nome da categoria"
                    value={sugestaoNome}
                    onChange={e => setSugestaoNome(e.target.value)}
                    onKeyDown={e => {
                        if (e.key === 'Enter' && sugestaoNome.trim()) {
                            setFormData(prev => ({ ...prev, outrosAtividade: sugestaoNome.trim() }));
                            setSugestaoModal(false);
                        }
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                />
            </DialogContent>
            <DialogActions sx={{ p: 2.5, pt: 0 }}>
                <Button onClick={() => setSugestaoModal(false)} sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 700 }}>
                    Cancelar
                </Button>
                <Button
                    variant="contained"
                    disabled={!sugestaoNome.trim()}
                    onClick={() => {
                        setFormData(prev => ({ ...prev, outrosAtividade: sugestaoNome.trim() }));
                        setSugestaoModal(false);
                    }}
                    sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 700 }}
                >
                    Enviar Sugestão
                </Button>
            </DialogActions>
        </Dialog>
        </>
    );
};

export default Cadastro;

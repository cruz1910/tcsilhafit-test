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
    Select,
    MenuItem,
    FormControl,
} from "@mui/material";
import { FaTimes, FaUpload, FaWhatsapp, FaUser, FaBuilding, FaUserTie } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { authService } from "../../services";

const Cadastro = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const isDark = theme.palette.mode === 'dark';

    const [accountType, setAccountType] = useState("aluno");
    const [formData, setFormData] = useState({
        nome: "",
        email: "",
        senha: "",
        confirmarSenha: "",
        endereco: {
            logradouro: "",
            numero: "",
            bairro: "",
            cidade: "",
            estado: "",
            cep: ""
        },
        telefone: "",
        cnpj: "",
        cpf: "",
        especializacao: "",
        registroCref: "",
        descricao: "",
        atividadesOferecidas: [],
        exclusivoMulheres: false,
        fotoUrl: "",
    });

    const handleTypeChange = (event, newType) => {
        if (newType !== null) {
            setAccountType(newType);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: { ...prev[parent], [child]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleCheckboxChange = (atividade) => {
        setFormData(prev => ({
            ...prev,
            atividadesOferecidas: prev.atividadesOferecidas.includes(atividade)
                ? prev.atividadesOferecidas.filter(a => a !== atividade)
                : [...prev.atividadesOferecidas, atividade]
        }));
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFormData(prev => ({ ...prev, fotoUrl: URL.createObjectURL(e.target.files[0]) }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.senha !== formData.confirmarSenha) {
            toast.error("As senhas não coincidem!");
            return;
        }

        try {
            // Realiza o cadastro
            await authService.register(formData, accountType);

            // Login Automático para que as informações apareçam no NavBar imediatamente
            try {
                const loginData = await authService.login(formData.email, formData.senha);
                toast.success(`Cadastro realizado! Bem-vindo(a), ${loginData.nome}! 🚀`);
                // Dispara evento de storage para sincronizar estados (NavBar, etc)
                window.dispatchEvent(new Event('storage'));
            } catch (loginErr) {
                console.warn("Erro no login automático:", loginErr);
                toast.success("Cadastro realizado com sucesso! Faça login para continuar.");
            }

            navigate("/");
        } catch (error) {
            console.error("Erro no cadastro:", error);
            const errorMsg = error.response?.data?.erro || error.message || "Erro desconhecido";
            toast.error("Erro ao cadastrar: " + errorMsg);
        }
    };

    const atividadesList = [
        "Academia", "CrossFit", "Funcional",
        "Pilates", "Yoga", "Dança",
        "Balé", "Basquete", "Futebol",
        "Natação", "Vôlei", "Jiu-Jitsu",
        "Boxe", "Muay Thai", "Kung Fu",
        "Ciclismo", "Circo", "Fisioterapia"
    ];

    const crefRequiredActivities = [
        "Academia", "CrossFit", "Funcional",
        "Natação", "Basquete", "Futebol",
        "Vôlei", "Boxe", "Muay Thai",
        "Kung Fu", "Jiu-Jitsu", "Ciclismo"
    ];

    const showCref = accountType === "profissional" &&
        formData.atividadesOferecidas.some(a => crefRequiredActivities.includes(a));

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
                    />

                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5, color: "text.secondary" }}>
                                Senha
                            </Typography>
                            <TextField
                                fullWidth
                                name="senha"
                                type="password"
                                value={formData.senha}
                                onChange={handleInputChange}
                                placeholder="••••••••"
                                sx={inputStyles}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5, color: "text.secondary" }}>
                                Confirmar Senha
                            </Typography>
                            <TextField
                                fullWidth
                                name="confirmarSenha"
                                type="password"
                                value={formData.confirmarSenha}
                                onChange={handleInputChange}
                                placeholder="••••••••"
                                sx={inputStyles}
                            />
                        </Grid>
                    </Grid>

                    {(accountType === "estabelecimento" || accountType === "profissional") && (
                        <>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5, color: "text.secondary" }}>
                                        Endereço (Logradouro)
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        name="endereco.logradouro"
                                        value={formData.endereco.logradouro}
                                        onChange={handleInputChange}
                                        placeholder="Rua e número"
                                        sx={inputStyles}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5, color: "text.secondary" }}>
                                        Bairro
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        name="endereco.bairro"
                                        value={formData.endereco.bairro}
                                        onChange={handleInputChange}
                                        placeholder="Bairro"
                                        sx={inputStyles}
                                    />
                                </Grid>
                            </Grid>

                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
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
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
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
                                    />
                                </Grid>
                            </Grid>

                            {showCref && (
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5, color: "text.secondary" }}>
                                        Registro CREF
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

                            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5, color: "text.secondary" }}>
                                Descrição
                            </Typography>
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                name="descricao"
                                value={formData.descricao}
                                onChange={handleInputChange}
                                placeholder={accountType === "estabelecimento" ? "Descreva seu estabelecimento..." : "Descreva suas especialidades..."}
                                sx={inputStyles}
                            />

                            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1, color: "text.secondary" }}>
                                {accountType === "estabelecimento" ? "Atividades Oferecidas *" : "Especializações *"}
                            </Typography>
                            <Paper variant="outlined" sx={{
                                p: 2,
                                mb: 3,
                                maxHeight: 250,
                                overflowY: 'auto',
                                borderRadius: 2,
                                bgcolor: isDark ? "rgba(255, 255, 255, 0.02)" : "rgba(16, 185, 129, 0.02)",
                                borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(16, 185, 129, 0.1)",
                            }}>
                                <Grid container spacing={0.5}>
                                    {atividadesList.sort().map((atividade) => (
                                        <Grid item xs={12} sm={4} md={4} key={atividade}>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        size="small"
                                                        checked={formData.atividadesOferecidas.includes(atividade)}
                                                        onChange={() => handleCheckboxChange(atividade)}
                                                        sx={{ p: 0.5 }}
                                                    />
                                                }
                                                label={
                                                    <Typography variant="caption" sx={{
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        display: 'block',
                                                        fontSize: '0.75rem'
                                                    }}>
                                                        {atividade}
                                                    </Typography>
                                                }
                                                sx={{
                                                    m: 0,
                                                    width: '100%',
                                                    '& .MuiFormControlLabel-label': { width: '100%' }
                                                }}
                                            />
                                        </Grid>
                                    ))}
                                </Grid>
                            </Paper>

                            <Paper variant="outlined" sx={{
                                p: 1,
                                mb: 3,
                                borderRadius: 2,
                                bgcolor: isDark ? "rgba(255, 255, 255, 0.02)" : "rgba(16, 185, 129, 0.02)",
                                borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(16, 185, 129, 0.1)",
                            }}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={formData.exclusivoMulheres}
                                            onChange={(e) => setFormData(prev => ({ ...prev, exclusivoMulheres: e.target.checked }))}
                                        />
                                    }
                                    label={<Typography variant="body2" fontWeight={600}>Oferece aulas exclusivas para mulheres</Typography>}
                                />
                            </Paper>

                            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1, color: "text.secondary" }}>
                                {accountType === "estabelecimento" ? "Foto do Estabelecimento" : "Foto de Perfil"}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                                <Avatar
                                    src={formData.fotoUrl}
                                    variant={accountType === "estabelecimento" ? "rounded" : "circular"}
                                    sx={{
                                        width: 80,
                                        height: 80,
                                        border: '2px solid',
                                        borderColor: 'primary.main',
                                        borderRadius: accountType === "estabelecimento" ? 2 : "50%"
                                    }}
                                />
                                <Button
                                    variant="outlined"
                                    component="label"
                                    startIcon={<FaUpload />}
                                    sx={{ textTransform: 'none', borderRadius: 2 }}
                                >
                                    Upload
                                    <input type="file" hidden accept="image/*" onChange={handleFileChange} />
                                </Button>
                            </Box>
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
                        Criar Conta
                    </Button>

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
                </form>
            </Paper>
        </Box>
    );
};

export default Cadastro;

import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Paper,
    TextField,
    Button,
    Grid,
    Divider,
    useTheme,
    alpha,
    Tab,
    Tabs,
    InputAdornment,
    IconButton,
    DialogActions,
    FormControlLabel,
    Checkbox,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText
} from "@mui/material";
import {
    FaUser,
    FaEnvelope,
    FaTrash,
    FaSave,
    FaLock,
    FaPhoneAlt,
    FaMapMarkerAlt,
    FaExclamationTriangle,
    FaBriefcase,
    FaClock,
    FaChevronDown,
    FaUpload,
    FaTimes,
    FaBuilding,
    FaWhatsapp,
    FaRoad,
    FaCity,
    FaHashtag,
    FaInfoCircle,
    FaHome
} from "react-icons/fa";
import {
    Collapse,
    ToggleButton,
    Avatar,
    Autocomplete,
    Chip
} from "@mui/material";
import { authService, userService, estabelecimentoService, profissionalService } from "../../services";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

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

const GRANDE_FLORIANOPOLIS = [
    "Florianópolis", "São José", "Palhoça", "Biguaçu",
    "Santo Amaro da Imperatriz", "Governador Celso Ramos",
    "Antônio Carlos", "Águas Mornas", "São Pedro de Alcântara"
];
const Perfil = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const user = authService.getUserInfo();
    if (!user) return null;

    const [loading, setLoading] = useState(true);
    const [selectedTab, setSelectedTab] = useState(0);
    const [openDelete, setOpenDelete] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        telefone: '',
        cpf: '',
        cnpj: '',
        descricao: '',
        endereco: {
            rua: "",
            numero: "",
            complemento: "",
            bairro: "",
            cidade: "Florianópolis",
            estado: "SC",
            cep: "",
            latitude: null,
            longitude: null
        },
        gradeAtividades: [],
        exclusivoMulheres: false,
        registroCref: '',
        fotoUrl: '',
        fotosUrl: [],
        nomeFantasia: '',
        razaoSocial: '',
        outrosAtividade: '',
    });

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

    const [crefOriginal, setCrefOriginal] = useState('');

    const [expandedActivities, setExpandedActivities] = useState(new Set());
    const isDark = theme.palette.mode === 'dark';

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            let data;
            if (user.role === 'USER') {
                data = await userService.getById(user.id);
            } else if (user.role === 'ESTABELECIMENTO') {
                data = await estabelecimentoService.getById(user.id);
            } else if (user.role === 'PROFISSIONAL') {
                data = await profissionalService.getById(user.id);
            } else {
                data = { nome: user.nome, email: user.email };
            }

            setFormData({
                ...formData,
                nome: data.nome || data.nomeFantasia || '',
                email: data.email || '',
                telefone: data.telefone || '',
                cpf: data.cpf || '',
                cnpj: data.cnpj || '',
                descricao: data.descricao || '',
                endereco: data.endereco || {
                    rua: "",
                    numero: "",
                    complemento: "",
                    bairro: "",
                    cidade: data.cidade || "Florianópolis",
                    estado: "SC",
                    cep: "",
                    latitude: null,
                    longitude: null
                },
                gradeAtividades: data.gradeAtividades || [],
                exclusivoMulheres: data.exclusivoMulheres || false,
                registroCref: data.registroCref || '',
                fotoUrl: data.fotoUrl || '',
                fotosUrl: data.fotosUrl || [],
                nomeFantasia: data.nomeFantasia || data.nome || '',
                razaoSocial: data.razaoSocial || '',
                outrosAtividade: data.outrosAtividade || '',
            });
            if (data.registroCref) setCrefOriginal(data.registroCref);
        } catch (error) {
            toast.error("Erro ao carregar dados do perfil");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
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

    const handleCepBlur = async (e) => {
        const cep = e.target.value.replace(/\D/g, "");
        if (cep.length === 8) {
            try {
                const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                const data = await response.json();
                if (!data.erro) {
                    const cidade = data.localidade;
                    if (!GRANDE_FLORIANOPOLIS.includes(cidade)) {
                        toast.error(`Atendemos apenas a região da Grande Florianópolis. ${cidade} não é permitido.`);
                        return;
                    }

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

    const handleAtividadeToggle = (atividade) => {
        const exists = formData.gradeAtividades.find(g => g.atividade === atividade);
        let nextGrade;
        let nextExpanded = new Set(expandedActivities);

        if (exists) {
            nextGrade = formData.gradeAtividades.filter(g => g.atividade !== atividade);
            nextExpanded.delete(atividade);
        } else {
            nextGrade = [...formData.gradeAtividades, { atividade, diasSemana: [], periodos: [] }];
            nextExpanded.add(atividade);
        }
        setExpandedActivities(nextExpanded);
        setFormData(prev => ({ ...prev, gradeAtividades: nextGrade }));
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

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            if (user.role === 'ESTABELECIMENTO') {
                const newPhotos = Array.from(e.target.files).map(file => URL.createObjectURL(file));
                setFormData(prev => ({
                    ...prev,
                    fotosUrl: [...(prev.fotosUrl || []), ...newPhotos]
                }));
            } else {
                const file = e.target.files[0];
                const url = URL.createObjectURL(file);
                setFormData(prev => ({ ...prev, fotoUrl: url }));
            }
            toast.info("Foto(s) selecionada(s). Clique em 'Salvar' para confirmar.");
        }
    };

    const handleSave = async () => {
        try {
            const needsCref = formData.gradeAtividades.some(g => crefRequiredActivities.includes(g.atividade));
            if (user.role === 'PROFISSIONAL' && needsCref && !formData.registroCref) {
                toast.error("O registro CREF é obrigatório para as atividades selecionadas!");
                setSelectedTab(1); // Mudar para aba de atividades
                return;
            }

            const payload = { ...formData };

            if (user.role === 'USER') {
                await userService.update(user.id, payload);
            } else if (user.role === 'ESTABELECIMENTO') {
                await estabelecimentoService.update(user.id, payload);
            } else if (user.role === 'PROFISSIONAL') {
                await profissionalService.update(user.id, payload);
            }

            const updatedUser = { ...user, nome: formData.nome };
            localStorage.setItem('user', JSON.stringify(updatedUser));

            toast.success("Perfil atualizado com sucesso! ✨");
            setIsEditing(false);
        } catch (error) {
            console.error("Erro ao atualizar perfil:", error);
            toast.error("Erro ao atualizar perfil");
        }
    };

    const toggleEdit = () => {
        if (isEditing) {
            handleSave();
        } else {
            setIsEditing(true);
            toast.info("Modo de edição ativado.");
        }
    };

    const handleDeleteAccount = async () => {
        try {
            if (user.role === 'USER') {
                await userService.delete(user.id);
            } else if (user.role === 'ESTABELECIMENTO') {
                await estabelecimentoService.delete(user.id);
            } else if (user.role === 'PROFISSIONAL') {
                await profissionalService.delete(user.id);
            }

            toast.success("Conta excluída. Até logo!");
            authService.logout();
        } catch (error) {
            toast.error("Erro ao excluir conta");
        }
    };

    if (loading) return null;

    return (
        <Container maxWidth="xl" sx={{ py: 6, px: { xs: 2, md: 3 } }}>
            {/* Header */}
            <Box mb={5} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" fontWeight={900} sx={{
                        color: 'text.primary',
                        mb: 1,
                        letterSpacing: '-0.02em',
                        background: theme.palette.mode === 'dark'
                            ? 'linear-gradient(45deg, #10B981 30%, #34D399 90%)'
                            : 'linear-gradient(45deg, #059669 30%, #10B981 90%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        Configurações
                    </Typography>
                    <Typography variant="body1" color="text.secondary" fontWeight={500}>
                        Personalize sua experiência e gerencie seus dados no IlhaFit.
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={isEditing ? <FaSave /> : <FaUser />}
                    onClick={toggleEdit}
                    sx={{
                        bgcolor: isEditing ? 'success.main' : 'primary.main',
                        '&:hover': { bgcolor: isEditing ? 'success.dark' : 'primary.dark', transform: 'translateY(-2px)' },
                        borderRadius: 4,
                        px: 4,
                        py: 1.5,
                        fontWeight: 800,
                        textTransform: 'none',
                        fontSize: '1rem',
                        boxShadow: '0 8px 16px rgba(16, 185, 129, 0.2)',
                        transition: 'all 0.3s'
                    }}
                >
                    {isEditing ? "Salvar" : "Editar"}
                </Button>
            </Box>

            {/* Custom Tabs */}
            <Box sx={{ mb: 4, display: 'flex', gap: 2 }}>
                <Button
                    onClick={() => setSelectedTab(0)}
                    startIcon={<FaUser size={14} />}
                    sx={{
                        borderRadius: 10,
                        textTransform: 'none',
                        px: 3,
                        fontWeight: 700,
                        bgcolor: selectedTab === 0 ? 'primary.main' : 'transparent',
                        color: selectedTab === 0 ? 'white' : 'text.primary',
                        border: '1px solid',
                        borderColor: selectedTab === 0 ? 'primary.main' : 'divider',
                        '&:hover': {
                            bgcolor: selectedTab === 0 ? 'primary.main' : alpha(theme.palette.divider, 0.1),
                        }
                    }}
                >
                    Perfil
                </Button>
                {(user?.role === 'PROFISSIONAL' || user?.role === 'ESTABELECIMENTO') && (
                    <Button
                        onClick={() => setSelectedTab(1)}
                        startIcon={<FaBriefcase size={14} />}
                        sx={{
                            borderRadius: 10,
                            textTransform: 'none',
                            px: 3,
                            fontWeight: 700,
                            bgcolor: selectedTab === 1 ? 'primary.main' : 'transparent',
                            color: selectedTab === 1 ? 'white' : 'text.primary',
                            border: '1px solid',
                            borderColor: selectedTab === 1 ? 'primary.main' : 'divider',
                            '&:hover': {
                                bgcolor: selectedTab === 1 ? 'primary.main' : alpha(theme.palette.divider, 0.1),
                            }
                        }}
                    >
                        {user?.role === 'PROFISSIONAL' ? 'Especialidades & Horários' : 'Atividades & Horários'}
                    </Button>
                )}
                <Button
                    onClick={() => setSelectedTab(2)}
                    startIcon={<FaUpload size={14} />}
                    sx={{
                        borderRadius: 10,
                        textTransform: 'none',
                        px: 3,
                        fontWeight: 700,
                        bgcolor: selectedTab === 2 ? 'primary.main' : 'transparent',
                        color: selectedTab === 2 ? 'white' : 'text.primary',
                        border: '1px solid',
                        borderColor: selectedTab === 2 ? 'primary.main' : 'divider',
                        '&:hover': {
                            bgcolor: selectedTab === 2 ? 'primary.main' : alpha(theme.palette.divider, 0.1),
                        }
                    }}
                >
                    Fotos
                </Button>

            </Box>

            {/* Main Content Card */}
            <Paper
                elevation={0}
                sx={{
                    borderRadius: 6,
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                    minHeight: 400,
                    width: '100%',
                    overflow: 'hidden',
                    boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.5)' : '0 10px 30px rgba(16, 185, 129, 0.05)',
                }}
            >
                {selectedTab === 0 && (
                    <Box sx={{ p: { xs: 3, md: 6 } }}>
                        <Typography variant="h6" fontWeight={800} sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box sx={{ width: 4, height: 24, bgcolor: 'primary.main', borderRadius: 2 }} />
                            Informações Básicas
                        </Typography>

                        <Grid container spacing={2}>
                            <Grid item xs={12} md={4}>
                                <TextField
                                    fullWidth
                                    variant="outlined"
                                    label={user.role === 'ESTABELECIMENTO' ? "Nome Fantasia" : "Nome Completo"}
                                    name={user.role === 'ESTABELECIMENTO' ? 'nomeFantasia' : 'nome'}
                                    value={(user.role === 'ESTABELECIMENTO' ? formData.nomeFantasia : formData.nome) || ''}
                                    onChange={handleChange}
                                    placeholder={user.role === 'ESTABELECIMENTO' ? "Ex: Academia Fit" : "Seu nome"}
                                    autoComplete="off"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <FaUser size={14} color={theme.palette.primary.main} />
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                                    disabled={!isEditing}
                                />
                            </Grid>

                            {user.role === 'ESTABELECIMENTO' && (
                                <Grid item xs={12} md={4}>
                                    <TextField
                                        fullWidth
                                        variant="outlined"
                                        label="Razão Social"
                                        name="razaoSocial"
                                        value={formData.razaoSocial || ''}
                                        onChange={handleChange}
                                        autoComplete="off"
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <FaBuilding size={14} color={theme.palette.primary.main} />
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                                        disabled={!isEditing}
                                    />
                                </Grid>
                            )}

                            <Grid item xs={12} md={4}>
                                <TextField
                                    fullWidth
                                    variant="outlined"
                                    label="Email"
                                    name="email"
                                    value={formData.email || ''}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    autoComplete="off"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <FaEnvelope size={14} color={theme.palette.primary.main} />
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                                />
                            </Grid>

                            {user.role !== 'USER' && (
                                <>
                                    <Grid item xs={12} md={4}>
                                        <TextField
                                            fullWidth
                                            variant="outlined"
                                            label={user.role === 'ESTABELECIMENTO' ? 'CNPJ' : 'CPF'}
                                            name={user.role === 'ESTABELECIMENTO' ? 'cnpj' : 'cpf'}
                                            value={(user.role === 'ESTABELECIMENTO' ? (formData.cnpj || '') : (formData.cpf || ''))}
                                            onChange={handleChange}
                                            autoComplete="off"
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <FaBriefcase size={14} color={theme.palette.primary.main} />
                                                    </InputAdornment>
                                                ),
                                            }}
                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                                            disabled={!isEditing}
                                        />
                                    </Grid>

                                    <Grid item xs={12} md={4}>
                                        <TextField
                                            fullWidth
                                            variant="outlined"
                                            label="Telefone / WhatsApp"
                                            name="telefone"
                                            value={formData.telefone || ''}
                                            onChange={handleChange}
                                            autoComplete="off"
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <FaWhatsapp size={14} color={theme.palette.success.main} />
                                                    </InputAdornment>
                                                ),
                                            }}
                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                                            disabled={!isEditing}
                                        />
                                    </Grid>
                                </>
                            )}
                        </Grid>


                        {user.role === 'ESTABELECIMENTO' && (
                            <>
                                <Typography variant="h6" fontWeight={800} sx={{ mt: 6, mb: 4, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Box sx={{ width: 4, height: 24, bgcolor: 'primary.main', borderRadius: 2 }} />
                                    Localização
                                </Typography>

                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={4}>
                                        <TextField
                                            fullWidth
                                            variant="outlined"
                                            label="CEP"
                                            name="endereco.cep"
                                            value={formData.endereco.cep || ''}
                                            onChange={handleChange}
                                            onBlur={handleCepBlur}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <FaMapMarkerAlt size={14} color={theme.palette.primary.main} />
                                                    </InputAdornment>
                                                ),
                                            }}
                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                                            disabled={!isEditing}
                                        />
                                    </Grid>

                                    <Grid item xs={12} md={4}>
                                        <TextField
                                            fullWidth
                                            variant="outlined"
                                            label="Rua"
                                            name="endereco.rua"
                                            value={formData.endereco.rua || ''}
                                            onChange={handleChange}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <FaRoad size={14} color={theme.palette.primary.main} />
                                                    </InputAdornment>
                                                ),
                                            }}
                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                                            disabled={!isEditing}
                                        />
                                    </Grid>

                                    <Grid item xs={12} md={4}>
                                        <TextField
                                            fullWidth
                                            variant="outlined"
                                            label="Bairro"
                                            name="endereco.bairro"
                                            value={formData.endereco.bairro || ''}
                                            onChange={handleChange}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <FaHome size={14} color={theme.palette.primary.main} />
                                                    </InputAdornment>
                                                ),
                                            }}
                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                                            disabled={!isEditing}
                                        />
                                    </Grid>

                                    <Grid item xs={12} md={4}>
                                        <TextField
                                            fullWidth
                                            variant="outlined"
                                            label="Número"
                                            name="endereco.numero"
                                            value={formData.endereco.numero || ''}
                                            onChange={handleChange}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <FaHashtag size={14} color={theme.palette.primary.main} />
                                                    </InputAdornment>
                                                ),
                                            }}
                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                                            disabled={!isEditing}
                                        />
                                    </Grid>

                                    <Grid item xs={12} md={4}>
                                        <TextField
                                            fullWidth
                                            variant="outlined"
                                            label="Complemento"
                                            name="endereco.complemento"
                                            value={formData.endereco.complemento || ''}
                                            onChange={handleChange}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <FaInfoCircle size={14} color={theme.palette.primary.main} />
                                                    </InputAdornment>
                                                ),
                                            }}
                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                                            disabled={!isEditing}
                                        />
                                    </Grid>

                                    <Grid item xs={12} md={4}>
                                        <TextField
                                            fullWidth
                                            variant="outlined"
                                            label="Cidade"
                                            name="endereco.cidade"
                                            value={formData.endereco.cidade || ''}
                                            onChange={handleChange}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <FaCity size={14} color={theme.palette.primary.main} />
                                                    </InputAdornment>
                                                ),
                                            }}
                                            disabled={!isEditing}
                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                                        />
                                    </Grid>
                                </Grid>
                            </>
                        )}

                        <Box sx={{ mt: 8, display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid', borderColor: 'divider', pt: 4 }}>
                            <Button
                                color="error"
                                onClick={() => setOpenDelete(true)}
                                startIcon={<FaTrash />}
                                sx={{
                                    textTransform: 'none',
                                    fontWeight: 700,
                                    borderRadius: 3,
                                    color: 'error.main',
                                    '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.05) }
                                }}
                            >
                                Excluir minha conta
                            </Button>
                        </Box>
                    </Box>
                )}


                {selectedTab === 1 && (
                    <Box sx={{ p: { xs: 3, md: 6 } }}>
                        <Typography variant="h6" fontWeight={800} sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box sx={{ width: 4, height: 24, bgcolor: 'primary.main', borderRadius: 2 }} />
                            Atividades & Especialidades
                        </Typography>

                        {user.role === "PROFISSIONAL" && (
                            <Box sx={{ mb: 5 }}>
                                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5, color: "text.secondary" }}>
                                    Registro CREF (Opcional)
                                </Typography>
                                <TextField
                                    fullWidth
                                    name="registroCref"
                                    value={formData.registroCref}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    placeholder="000000-G/SC"
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                                />
                            </Box>
                        )}

                        <Box sx={{ mb: 5 }}>
                            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1, color: "text.secondary" }}>
                                {user?.role === 'ESTABELECIMENTO' ? 'Selecione as Atividades Oferecidas' : 'Selecione suas Especialidades / Profissão'}
                            </Typography>
                            <Autocomplete
                                multiple
                                options={atividadesList}
                                value={formData.gradeAtividades.map(g => g.atividade)}
                                onChange={handleAtividadeToggle}
                                disabled={!isEditing}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        placeholder="Selecione as atividades"
                                        sx={{
                                            '& .MuiOutlinedInput-root': { borderRadius: 3 }
                                        }}
                                    />
                                )}
                                renderTags={() => null} // Oculta as tags dentro do input
                            />

                            {/* Tags fora do input */}
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                                {formData.gradeAtividades.map((g, index) => (
                                    <Chip
                                        key={index}
                                        label={g.atividade}
                                        onDelete={isEditing ? () => {
                                            const newGrade = formData.gradeAtividades.filter(item => item.atividade !== g.atividade);
                                            setFormData(prev => ({ ...prev, gradeAtividades: newGrade }));
                                        } : undefined}
                                        sx={{ borderRadius: 1.5, fontWeight: 700, bgcolor: 'primary.main', color: 'white' }}
                                    />
                                ))}
                            </Box>
                        </Box>

                        {formData.gradeAtividades.some(g => g.atividade === 'Outros') && (
                            <Box sx={{ mb: 5 }}>
                                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1, color: "text.secondary" }}>
                                    Especifique a outra atividade
                                </Typography>
                                <TextField
                                    fullWidth
                                    name="outrosAtividade"
                                    value={formData.outrosAtividade}
                                    onChange={handleChange}
                                    placeholder="Ex: Tênis de Mesa, Surf..."
                                    autoComplete="off"
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                                />
                            </Box>
                        )}

                        {formData.gradeAtividades.length > 0 && (
                            <>
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="subtitle2" fontWeight={700} sx={{ color: "text.secondary" }}>
                                        Configurar Horários e Modalidades
                                    </Typography>
                                </Box>
                                <Paper variant="outlined" sx={{
                                    p: 0, mb: 5, borderRadius: 5, overflow: 'hidden',
                                    borderColor: 'divider',
                                    bgcolor: isDark ? alpha('#fff', 0.01) : alpha(theme.palette.primary.main, 0.01),
                                    width: '100%',
                                    mx: 0
                                }}>
                                    <Grid container sx={{ width: '100%', m: 0 }}>
                                        {formData.gradeAtividades.map((grade, index) => {
                                            const atividade = grade.atividade;
                                            return (
                                                <Grid item xs={12} key={atividade} sx={{
                                                    borderBottom: index === formData.gradeAtividades.length - 1 ? 'none' : '1px solid',
                                                    borderColor: 'divider',
                                                    transition: 'all 0.2s',
                                                    width: '100%',
                                                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.02) }
                                                }}>
                                                    <Box sx={{ p: 2, pl: 2, pr: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                                        <Typography variant="body1" fontWeight={800} sx={{ color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'primary.main', boxShadow: '0 0 8px rgba(16, 185, 129, 0.4)' }} />
                                                            {atividade === 'Outros' ? `Outros (${formData.outrosAtividade || '...'})` : atividade}
                                                        </Typography>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleExpandToggle(atividade)}
                                                            sx={{
                                                                bgcolor: expandedActivities.has(atividade) ? 'primary.main' : alpha(theme.palette.primary.main, 0.1),
                                                                color: expandedActivities.has(atividade) ? 'white' : 'primary.main',
                                                                '&:hover': { bgcolor: 'primary.main', color: 'white' },
                                                                transition: 'all 0.3s',
                                                                width: 32,
                                                                height: 32
                                                            }}
                                                        >
                                                            <FaChevronDown size={14} style={{ transform: expandedActivities.has(atividade) ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }} />
                                                        </IconButton>
                                                    </Box>

                                                    <Collapse in={expandedActivities.has(atividade)}>
                                                        <Box sx={{ pl: 2, pr: 0, pb: 3, width: '100%' }}>
                                                            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', gap: 3, width: '100%' }}>
                                                                <Box sx={{ flex: 1 }}>
                                                                    <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ mb: 1.5, display: 'block', letterSpacing: 0.5 }}>DIAS DA SEMANA</Typography>
                                                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                                                        {["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"].map(dia => (
                                                                            <ToggleButton
                                                                                key={dia}
                                                                                value={dia}
                                                                                selected={grade?.diasSemana?.includes(dia)}
                                                                                disabled={!isEditing}
                                                                                onChange={() => {
                                                                                    const newDias = (grade.diasSemana || []).includes(dia)
                                                                                        ? grade.diasSemana.filter(d => d !== dia)
                                                                                        : [...(grade.diasSemana || []), dia];
                                                                                    handleGradeUpdate(atividade, 'diasSemana', newDias);
                                                                                }}
                                                                                size="small"
                                                                                sx={{
                                                                                    borderRadius: 2.5,
                                                                                    px: 2,
                                                                                    minWidth: 48,
                                                                                    border: '1px solid',
                                                                                    borderColor: 'divider',
                                                                                    '&.Mui-selected': { bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } }
                                                                                }}
                                                                            >
                                                                                {dia}
                                                                            </ToggleButton>
                                                                        ))}
                                                                    </Box>
                                                                </Box>
                                                                <Box sx={{ textAlign: { xs: 'left', md: 'right' }, minWidth: { md: 300 } }}>
                                                                    <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ mb: 1.5, display: 'block', letterSpacing: 0.5, pr: 1 }}>PERÍODOS</Typography>
                                                                    <Box sx={{ display: 'flex', gap: 1, justifyContent: { xs: 'flex-start', md: 'flex-end' }, pr: 0.5 }}>
                                                                        {["Manhã", "Tarde", "Noite"].map(periodo => (
                                                                            <ToggleButton
                                                                                key={periodo}
                                                                                value={periodo}
                                                                                selected={grade?.periodos?.includes(periodo)}
                                                                                disabled={!isEditing}
                                                                                onChange={() => {
                                                                                    const newPeriodos = (grade.periodos || []).includes(periodo)
                                                                                        ? grade.periodos.filter(p => p !== periodo)
                                                                                        : [...(grade.periodos || []), periodo];
                                                                                    handleGradeUpdate(atividade, 'periodos', newPeriodos);
                                                                                }}
                                                                                size="small"
                                                                                sx={{
                                                                                    borderRadius: 2.5,
                                                                                    px: 2,
                                                                                    flex: 1,
                                                                                    maxWidth: 90,
                                                                                    border: '1px solid',
                                                                                    borderColor: 'divider',
                                                                                    '&.Mui-selected': { bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } }
                                                                                }}
                                                                            >
                                                                                {periodo}
                                                                            </ToggleButton>
                                                                        ))}
                                                                    </Box>
                                                                </Box>
                                                            </Box>

                                                            <Box sx={{ mt: 3, pt: 2, borderTop: '1px dashed', borderColor: 'divider' }}>
                                                                <FormControlLabel
                                                                    control={
                                                                        <Checkbox
                                                                            checked={grade.exclusivoMulheres || false}
                                                                            onChange={(e) => handleGradeUpdate(atividade, 'exclusivoMulheres', e.target.checked)}
                                                                            disabled={!isEditing}
                                                                            sx={{ color: 'primary.main', '&.Mui-checked': { color: 'primary.main' } }}
                                                                        />
                                                                    }
                                                                    label={
                                                                        <Typography variant="body2" fontWeight={700} sx={{ color: 'primary.main' }}>
                                                                            Oferecer aula para mulheres nesta atividade
                                                                        </Typography>
                                                                    }
                                                                />
                                                            </Box>
                                                        </Box>
                                                    </Collapse>
                                                </Grid>
                                            );
                                        })}
                                    </Grid>
                                </Paper>
                            </>
                        )}
                    </Box>
                )}

                {/* Nova Aba de Fotos */}
                {selectedTab === 2 && (
                    <Box sx={{ p: { xs: 3, md: 6 }, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Typography variant="h6" fontWeight={800} sx={{ mb: 4, alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box sx={{ width: 4, height: 24, bgcolor: 'primary.main', borderRadius: 2 }} />
                            Gerenciar Fotos
                        </Typography>
                        <Box sx={{ position: 'relative', mb: 4 }}>
                            <Box sx={{
                                p: 0.5,
                                borderRadius: '50%',
                                background: 'linear-gradient(45deg, #10B981, #34D399)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 8px 16px rgba(16, 185, 129, 0.2)'
                            }}>
                                <Avatar
                                    src={user?.role === 'ESTABELECIMENTO' ? formData.fotosUrl[0] : formData.fotoUrl}
                                    sx={{
                                        width: 200,
                                        height: 200,
                                        border: '4px solid',
                                        borderColor: 'background.paper'
                                    }}
                                />
                            </Box>
                            <input
                                type="file"
                                id="photo-upload-tab"
                                hidden
                                accept="image/*"
                                multiple={user.role === 'ESTABELECIMENTO'}
                                onChange={handleFileChange}
                                disabled={!isEditing}
                            />
                            <label htmlFor="photo-upload-tab">
                                <Button
                                    component="span"
                                    disabled={!isEditing}
                                    variant="contained"
                                    startIcon={<FaUpload />}
                                    sx={{
                                        mt: 3,
                                        borderRadius: 3,
                                        textTransform: 'none',
                                        fontWeight: 700
                                    }}
                                >
                                    Carregar Nova Foto
                                </Button>
                            </label>
                        </Box>

                        {user.role === 'ESTABELECIMENTO' && (
                            <Box sx={{ width: '100%', mt: 4 }}>
                                <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 2 }}>Galeria de Fotos</Typography>
                                {formData.fotosUrl.length > 0 ? (
                                    <Grid container spacing={2}>
                                        {formData.fotosUrl.map((url, idx) => (
                                            <Grid item xs={6} sm={4} md={3} key={idx}>
                                                <Box sx={{ position: 'relative', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
                                                    <Avatar
                                                        src={url}
                                                        variant="rounded"
                                                        sx={{ width: '100%', height: 150, border: '2px solid', borderColor: 'divider' }}
                                                    />
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => setFormData(prev => ({ ...prev, fotosUrl: prev.fotosUrl.filter((_, i) => i !== idx) }))}
                                                        disabled={!isEditing}
                                                        sx={{
                                                            position: 'absolute',
                                                            top: 5,
                                                            right: 5,
                                                            bgcolor: isEditing ? 'error.main' : alpha(theme.palette.text.disabled, 0.5),
                                                            color: 'white',
                                                            '&:hover': { bgcolor: 'error.dark' },
                                                        }}
                                                    >
                                                        <FaTimes size={14} />
                                                    </IconButton>
                                                </Box>
                                            </Grid>
                                        ))}
                                    </Grid>
                                ) : (
                                    <Typography color="text.secondary">Nenhuma foto adicional cadastrada.</Typography>
                                )}
                            </Box>
                        )}
                    </Box>
                )}
            </Paper>

            {/* Modal de Confirmação de Exclusão */}
            <Dialog
                open={openDelete}
                onClose={() => setOpenDelete(false)}
                PaperProps={{ sx: { borderRadius: 4, p: 1 } }}
            >
                <DialogTitle sx={{ fontWeight: 800 }}>Deseja excluir sua conta?</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ fontWeight: 500 }}>
                        Você tem certeza que deseja excluir sua conta? Esta ação é irreversível e removerá todos os seus dados do IlhaFit.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 0 }}>
                    <Button
                        onClick={() => setOpenDelete(false)}
                        sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 700, px: 3 }}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleDeleteAccount}
                        color="error"
                        variant="contained"
                        sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 800, px: 3 }}
                    >
                        Sim, Excluir Conta
                    </Button>
                </DialogActions>
            </Dialog>
        </Container >
    );
};

export default Perfil;

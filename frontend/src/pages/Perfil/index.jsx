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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
} from "@mui/material";
import {
    FaUser,
    FaEnvelope,
    FaTrash,
    FaSave,
    FaLock,
    FaPhoneAlt,
    FaMapMarkerAlt,
    FaExclamationTriangle
} from "react-icons/fa";
import { authService, userService, estabelecimentoService, profissionalService } from "../../services";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Perfil = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const user = authService.getUserInfo();

    const [loading, setLoading] = useState(true);
    const [selectedTab, setSelectedTab] = useState(0);
    const [openDelete, setOpenDelete] = useState(false);

    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        telefone: '',
        cidade: 'Florianópolis', // Padrão conforme imagem ou banco
        cpf: '',
        cnpj: '',
        descricao: '',
    });

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
                cidade: data.cidade || 'Florianópolis',
                cpf: data.cpf || '',
                cnpj: data.cnpj || '',
                descricao: data.descricao || '',
            });
        } catch (error) {
            toast.error("Erro ao carregar dados do perfil");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        try {
            if (user.role === 'USER') {
                await userService.update(user.id, formData);
            } else if (user.role === 'ESTABELECIMENTO') {
                await estabelecimentoService.update(user.id, formData);
            } else if (user.role === 'PROFISSIONAL') {
                await profissionalService.update(user.id, formData);
            }

            const updatedUser = { ...user, nome: formData.nome };
            localStorage.setItem('user', JSON.stringify(updatedUser));

            toast.success("Perfil atualizado com sucesso! ✨");
        } catch (error) {
            toast.error("Erro ao atualizar perfil");
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
        <Container maxWidth="lg" sx={{ py: 6 }}>
            {/* Header */}
            <Box mb={4}>
                <Typography variant="h4" fontWeight={800} sx={{ color: 'text.primary', mb: 0.5 }}>
                    Meu Perfil
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Gerencie suas informações pessoais
                </Typography>
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
                <Button
                    onClick={() => setSelectedTab(1)}
                    startIcon={<FaLock size={14} />}
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
                    Senha
                </Button>
                <Button
                    onClick={() => setSelectedTab(2)}
                    startIcon={<FaExclamationTriangle size={14} />}
                    sx={{
                        borderRadius: 10,
                        textTransform: 'none',
                        px: 3,
                        fontWeight: 700,
                        bgcolor: selectedTab === 2 ? 'primary.main' : 'transparent',
                        color: selectedTab === 2 ? '#334155' : 'text.primary',
                        border: '1px solid',
                        borderColor: 'divider',
                        '&:hover': {
                            bgcolor: alpha(theme.palette.error.main, 0.05),
                            borderColor: theme.palette.error.main,
                            color: theme.palette.error.main
                        }
                    }}
                >
                    Zona Perigosa
                </Button>
            </Box>

            {/* Main Content Card */}
            <Paper
                elevation={0}
                sx={{
                    p: { xs: 3, md: 5 },
                    borderRadius: 4,
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                    minHeight: 300
                }}
            >
                {selectedTab === 0 && (
                    <>
                        <Grid container spacing={4}>
                            {/* Nome Completo */}
                            <Grid item xs={12} md={6}>
                                <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <FaUser size={14} color={theme.palette.text.secondary} />
                                    <Typography variant="body2" fontWeight={700} color="text.secondary">
                                        Nome Completo
                                    </Typography>
                                </Box>
                                <TextField
                                    fullWidth
                                    name="nome"
                                    value={formData.nome}
                                    onChange={handleChange}
                                    placeholder="Seu nome"
                                    variant="outlined"
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                />
                            </Grid>

                            {/* Email */}
                            <Grid item xs={12} md={6}>
                                <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <FaEnvelope size={14} color={theme.palette.text.secondary} />
                                    <Typography variant="body2" fontWeight={700} color="text.secondary">
                                        Email
                                    </Typography>
                                </Box>
                                <TextField
                                    fullWidth
                                    name="email"
                                    value={formData.email}
                                    placeholder="seu@email.com"
                                    disabled
                                    variant="outlined"
                                    sx={{
                                        '& .MuiOutlinedInput-root': { borderRadius: 2 },
                                        '& .MuiOutlinedInput-input.Mui-disabled': {
                                            WebkitTextFillColor: theme.palette.text.secondary,
                                        }
                                    }}
                                />
                            </Grid>

                            {/* Telefone */}
                            <Grid item xs={12} md={6}>
                                <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <FaPhoneAlt size={14} color={theme.palette.text.secondary} />
                                    <Typography variant="body2" fontWeight={700} color="text.secondary">
                                        Telefone
                                    </Typography>
                                </Box>
                                <TextField
                                    fullWidth
                                    name="telefone"
                                    value={formData.telefone}
                                    onChange={handleChange}
                                    placeholder="(48) 99999-9999"
                                    variant="outlined"
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                />
                            </Grid>

                            {/* Cidade */}
                            <Grid item xs={12} md={6}>
                                <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <FaMapMarkerAlt size={14} color={theme.palette.text.secondary} />
                                    <Typography variant="body2" fontWeight={700} color="text.secondary">
                                        Cidade
                                    </Typography>
                                </Box>
                                <TextField
                                    fullWidth
                                    name="cidade"
                                    value={formData.cidade}
                                    onChange={handleChange}
                                    placeholder="Sua cidade"
                                    variant="outlined"
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                />
                            </Grid>

                            {/* Adicionais conforme Role se necessário, mas mantendo o modelo enxuto */}
                        </Grid>

                        <Box sx={{ mt: 5, display: 'flex', justifyContent: 'flex-end' }}>
                            <Button
                                variant="contained"
                                startIcon={<FaSave />}
                                onClick={handleSave}
                                sx={{
                                    bgcolor: 'primary.main',
                                    '&:hover': { bgcolor: '#0D9488' },
                                    borderRadius: 2,
                                    px: 4,
                                    py: 1.5,
                                    fontWeight: 700,
                                    textTransform: 'none',
                                    fontSize: '1rem'
                                }}
                            >
                                Salvar Alterações
                            </Button>
                        </Box>
                    </>
                )}

                {selectedTab === 1 && (
                    <Box sx={{ maxWidth: 400 }}>
                        <Typography variant="h6" fontWeight={700} mb={3}>Alterar Senha</Typography>
                        <TextField
                            fullWidth
                            label="Senha Atual"
                            type="password"
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label="Nova Senha"
                            type="password"
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label="Confirmar Nova Senha"
                            type="password"
                            margin="normal"
                        />
                        <Button
                            variant="contained"
                            sx={{ mt: 3, borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
                        >
                            Atualizar Senha
                        </Button>
                    </Box>
                )}

                {selectedTab === 2 && (
                    <Box>
                        <Typography variant="h6" fontWeight={700} color="error" mb={2}>Exclusão de Conta</Typography>
                        <Typography variant="body2" color="text.secondary" mb={4}>
                            Ao excluir sua conta, todos os seus dados serão removidos permanentemente. Esta ação não pode ser desfeita.
                        </Typography>
                        <Button
                            variant="contained"
                            color="error"
                            startIcon={<FaTrash />}
                            onClick={() => setOpenDelete(true)}
                            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
                        >
                            Excluir Minha Conta Permanentemente
                        </Button>
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
                    <DialogContentText>
                        Esta ação é irreversível. Todos os seus dados, avaliações e histórico serão removidos permanentemente do IlhaFit.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 2, gap: 1 }}>
                    <Button
                        onClick={() => setOpenDelete(false)}
                        sx={{ fontWeight: 700, textTransform: 'none', color: 'text.secondary' }}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleDeleteAccount}
                        variant="contained"
                        color="error"
                        sx={{ fontWeight: 700, textTransform: 'none', borderRadius: 2 }}
                    >
                        Sim, Excluir Conta
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default Perfil;

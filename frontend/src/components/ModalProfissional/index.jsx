import {
    Dialog,
    DialogContent,
    IconButton,
    Avatar,
    Typography,
    Box,
    Chip,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableRow,
    Button,
    useTheme,
    alpha,
    Divider
} from "@mui/material";
import {
    FaStar,
    FaPhone,
    FaEnvelope,
    FaMapMarkerAlt,
    FaClock,
    FaChevronLeft,
    FaWhatsapp
} from "react-icons/fa";

const ModalProfissional = ({ open, onClose, profissional }) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    if (!profissional) return null;

    const handleWhatsApp = () => {
        const message = encodeURIComponent(`Olá ${profissional?.nome || ''}, vi seu perfil no IlhaFit e gostaria de saber mais sobre seu trabalho como Personal Trainer.`);
        const phone = profissional?.telefone?.replace(/\D/g, '') || "5548999999999";
        window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="lg"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    bgcolor: 'background.paper',
                    overflow: 'hidden',
                    maxHeight: '90vh'
                }
            }}
        >
            {/* Cabeçalho Fixo com Banner/Fundo */}
            <Box sx={{
                position: 'relative',
                width: '100%',
                height: { xs: 150, md: 250 },
                flexShrink: 0,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
            }}>
                {/* Imagem de Fundo (opcional ou placeholder premium) */}
                <Box
                    sx={{
                        width: '100%',
                        height: '100%',
                        backgroundImage: `url("https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1470&auto=format&fit=crop")`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        filter: 'brightness(0.7)'
                    }}
                />

                <IconButton
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        top: 20,
                        right: 20,
                        bgcolor: 'rgba(255,255,255,0.9)',
                        boxShadow: 3,
                        width: 44,
                        height: 44,
                        zIndex: 10,
                        '&:hover': { bgcolor: '#fff' }
                    }}
                >
                    <FaChevronLeft size={18} color="#000" />
                </IconButton>

                {/* Avatar Sobreposto ao Banner */}
                <Avatar
                    src={profissional?.Imagem || profissional?.fotoUrl}
                    sx={{
                        position: 'absolute',
                        bottom: -50,
                        left: 48,
                        width: { xs: 100, md: 150 },
                        height: { xs: 100, md: 150 },
                        border: '6px solid',
                        borderColor: 'background.paper',
                        boxShadow: 4,
                        bgcolor: 'background.paper'
                    }}
                />
            </Box>

            <DialogContent sx={{ p: { xs: 3, md: 6 }, pt: { xs: 8, md: 10 }, overflowY: 'auto' }}>
                {/* Conteúdo Principal */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
                    <Box>
                        <Typography variant="h3" fontWeight={800} color="text.primary" sx={{ mb: 1, letterSpacing: '-0.02em' }}>
                            {profissional?.nome || 'Profissional'}
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: '#FEF3C7', px: 1.5, py: 0.5, borderRadius: 2 }}>
                                <FaStar color="#F59E0B" size={16} />
                                <Typography variant="h6" fontWeight={800} color="#92400E" sx={{ lineHeight: 1 }}>
                                    {profissional?.avaliacao || "5.0"}
                                </Typography>
                            </Box>
                            <Chip
                                label="Personal Trainer"
                                color="primary"
                                size="small"
                                sx={{ fontWeight: 700, borderRadius: 1.5 }}
                            />
                        </Box>
                    </Box>

                    <Button
                        variant="contained"
                        startIcon={<FaWhatsapp size={20} />}
                        onClick={handleWhatsApp}
                        sx={{
                            bgcolor: '#10B981',
                            '&:hover': { bgcolor: '#059669' },
                            borderRadius: 3,
                            px: 4,
                            py: 1.5,
                            textTransform: 'none',
                            fontWeight: 800,
                            fontSize: '1rem',
                            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
                        }}
                    >
                        Entrar em Contato
                    </Button>
                </Box>

                <Grid container spacing={8}>
                    {/* Coluna da Esquerda */}
                    <Grid item xs={12} lg={7}>
                        <Box sx={{ mb: 6 }}>
                            <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>Sobre</Typography>
                            <Typography color="text.secondary" variant="body1" sx={{ lineHeight: 1.8, fontSize: '1.1rem' }}>
                                {profissional?.descricao || "Especialista em transformação física e saúde. Com anos de experiência ajudando pessoas a alcançarem sua melhor versão através de treinos personalizados e acompanhamento constante."}
                            </Typography>
                        </Box>

                        <Box sx={{ mb: 6 }}>
                            <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>Especialidades</Typography>
                            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                                {profissional?.especialidades?.map((esp, i) => (
                                    <Chip
                                        key={i}
                                        label={esp}
                                        variant="outlined"
                                        sx={{
                                            fontWeight: 700,
                                            borderRadius: 2,
                                            px: 1,
                                            color: 'primary.main',
                                            borderColor: alpha(theme.palette.primary.main, 0.3),
                                            bgcolor: alpha(theme.palette.primary.main, 0.05)
                                        }}
                                    />
                                ))}
                            </Box>
                        </Box>

                        <Box sx={{ mb: 6 }}>
                            <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>Contato e Localização</Typography>
                            <Grid container spacing={3}>
                                <Grid item xs={12} sm={6}>
                                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                        <FaEnvelope color={theme.palette.primary.main} size={20} />
                                        <Typography variant="body1" fontWeight={600}>{profissional?.email}</Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                        <FaPhone color={theme.palette.primary.main} size={20} />
                                        <Typography variant="body1" fontWeight={600}>{profissional?.telefone}</Typography>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Box>
                    </Grid>

                    {/* Coluna da Direita */}
                    <Grid item xs={12} lg={5}>
                        <Box sx={{ mb: 6 }}>
                            <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>Horário de Atendimento</Typography>
                            <Paper variant="outlined" sx={{ p: 4, borderRadius: 4, bgcolor: '#F8FAFC', border: 'none' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                                    <FaClock color="#FF0000" size={20} />
                                    <Box>
                                        <Typography variant="body1" fontWeight={700}>Segunda a Sexta</Typography>
                                        <Typography variant="h6" fontWeight={800} color="primary">06:00 - 22:00</Typography>
                                    </Box>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                                    <FaClock color="#FF0000" size={20} />
                                    <Box>
                                        <Typography variant="body1" fontWeight={700}>Sábado</Typography>
                                        <Typography variant="h6" fontWeight={800} color="primary">08:00 - 18:00</Typography>
                                    </Box>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <FaClock color="#FF0000" size={20} />
                                    <Box>
                                        <Typography variant="body1" fontWeight={700}>Domingo</Typography>
                                        <Typography variant="h6" fontWeight={800} color="primary">08:00 - 14:00</Typography>
                                    </Box>
                                </Box>
                            </Paper>
                        </Box>
                    </Grid>
                </Grid>
            </DialogContent>
        </Dialog>
    );
};

export default ModalProfissional;

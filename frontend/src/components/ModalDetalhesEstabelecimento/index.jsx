import React from 'react';
import {
    Dialog,
    DialogContent,
    Box,
    Typography,
    IconButton,
    Button,
    Chip,
    Divider,
    Paper,
    Grid,
    useTheme,
    alpha,
} from "@mui/material";
import {
    FaArrowLeft,
    FaWhatsapp,
    FaStar,
    FaMapMarkerAlt,
    FaRegClock,
    FaInfoCircle
} from "react-icons/fa";
import { authService } from "../../services";

const ModalDetalhesEstabelecimento = ({ open, onClose, estabelecimento }) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const isLoggedIn = authService.isAuthenticated();

    if (!estabelecimento) return null;

    const handleWhatsApp = () => {
        const message = encodeURIComponent(`Olá, vi seu estabelecimento no IlhaFit e gostaria de mais informações.`);
        const phone = estabelecimento.telefone || "5548999999999";
        window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="md"
            PaperProps={{
                sx: {
                    borderRadius: 4,
                    overflow: 'hidden',
                    bgcolor: theme.palette.background.paper,
                }
            }}
        >
            <Box sx={{ position: 'relative' }}>
                {/* Banner Image */}
                <Box
                    component="img"
                    src={estabelecimento.Imagem}
                    alt={estabelecimento.nome}
                    sx={{
                        width: '100%',
                        height: { xs: 200, md: 350 },
                        objectFit: 'cover',
                    }}
                />

                {/* Close Button */}
                <IconButton
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        top: 16,
                        left: 16,
                        bgcolor: 'rgba(255, 255, 255, 0.9)',
                        '&:hover': { bgcolor: '#fff' },
                        boxShadow: 2,
                    }}
                >
                    <FaArrowLeft size={18} color="#334155" />
                </IconButton>
            </Box>

            <DialogContent sx={{ p: { xs: 2, md: 4 } }}>
                {/* Header: Title and WhatsApp */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                        <Typography variant="h4" fontWeight={800} sx={{ color: theme.palette.text.primary, mb: 1 }}>
                            {estabelecimento.nome || "Estabelecimento"}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: '#FEF3C7', px: 1, py: 0.5, borderRadius: 1.5 }}>
                                <FaStar color="#F59E0B" size={14} />
                                <Typography variant="subtitle2" fontWeight={700} color="#92400E">
                                    {estabelecimento.avaliacao}
                                </Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                                (0 avaliações)
                            </Typography>
                        </Box>
                    </Box>

                    <Button
                        variant="contained"
                        startIcon={<FaWhatsapp />}
                        onClick={handleWhatsApp}
                        sx={{
                            bgcolor: '#10B981',
                            '&:hover': { bgcolor: '#059669' },
                            borderRadius: 2,
                            px: 3,
                            py: 1,
                            textTransform: 'none',
                            fontWeight: 700,
                            display: { xs: 'none', sm: 'flex' }
                        }}
                    >
                        WhatsApp
                    </Button>
                </Box>

                {/* Tags */}
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
                    {estabelecimento.categorias?.map((cat) => (
                        <Chip
                            key={cat}
                            label={cat}
                            variant="outlined"
                            sx={{
                                borderColor: alpha(theme.palette.primary.main, 0.3),
                                color: theme.palette.primary.main,
                                fontWeight: 600,
                                borderRadius: 1.5
                            }}
                        />
                    ))}
                    {estabelecimento.exclusivoMulheres && (
                        <Chip
                            label="Aulas Femininas"
                            variant="outlined"
                            sx={{
                                borderColor: '#F472B6',
                                color: '#DB2777',
                                fontWeight: 600,
                                borderRadius: 1.5
                            }}
                        />
                    )}
                </Box>

                <Grid container spacing={4}>
                    <Grid item xs={12} md={7}>
                        {/* About */}
                        <Typography variant="h6" fontWeight={700} sx={{ mb: 1.5 }}>Sobre</Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, lineHeight: 1.7 }}>
                            {estabelecimento.descricao || "Sem descrição disponível."}
                        </Typography>

                        {/* Location */}
                        <Typography variant="h6" fontWeight={700} sx={{ mb: 1.5 }}>Localização</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <FaMapMarkerAlt color={theme.palette.primary.main} />
                            <Typography variant="body2" color="text.primary" fontWeight={500}>
                                {estabelecimento.endereco?.rua || "Endereço não informado"}
                            </Typography>
                        </Box>

                        {/* Map Placeholder */}
                        <Paper
                            variant="outlined"
                            sx={{
                                height: 200,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: isDark ? alpha(theme.palette.text.primary, 0.02) : '#f8fafc',
                                borderRadius: 3,
                                borderStyle: 'dashed',
                                borderColor: 'divider',
                                mb: 4
                            }}
                        >
                            <FaMapMarkerAlt size={40} color={theme.palette.primary.main} style={{ opacity: 0.5, marginBottom: 8 }} />
                            <Typography variant="subtitle2" color="text.secondary" fontWeight={700}>Mapa integrado aqui</Typography>
                            <Typography variant="caption" color="text.secondary">(Google Maps ou OpenStreetMap)</Typography>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={5}>
                        {/* Hours */}
                        <Typography variant="h6" fontWeight={700} sx={{ mb: 1.5 }}>Horário de Funcionamento</Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 4 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <FaRegClock color={theme.palette.primary.main} />
                                <Box>
                                    <Typography variant="body2" fontWeight={600}>Segunda a Sexta:</Typography>
                                    <Typography variant="body2" color="text.secondary">05:30 - 23:30</Typography>
                                </Box>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <FaRegClock color={theme.palette.primary.main} />
                                <Box>
                                    <Typography variant="body2" fontWeight={600}>Sábado e Domingo:</Typography>
                                    <Typography variant="body2" color="text.secondary">08:00 - 20:00</Typography>
                                </Box>
                            </Box>
                        </Box>

                        {/* Mobile WhatsApp Button */}
                        <Button
                            variant="contained"
                            fullWidth
                            startIcon={<FaWhatsapp />}
                            onClick={handleWhatsApp}
                            sx={{
                                bgcolor: '#10B981',
                                '&:hover': { bgcolor: '#059669' },
                                borderRadius: 2,
                                py: 1.5,
                                textTransform: 'none',
                                fontWeight: 700,
                                display: { xs: 'flex', sm: 'none' },
                                mb: 4
                            }}
                        >
                            WhatsApp
                        </Button>
                    </Grid>
                </Grid>

                <Divider sx={{ my: 4 }} />

                {/* Reviews */}
                <Typography variant="h5" fontWeight={800} sx={{ mb: 3 }}>Avaliações</Typography>

                {!isLoggedIn ? (
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            textAlign: 'center',
                            bgcolor: isDark ? alpha(theme.palette.text.primary, 0.02) : '#f8fafc',
                            borderRadius: 3,
                            border: '1px solid',
                            borderColor: 'divider',
                        }}
                    >
                        <Typography variant="body2" color="text.secondary" fontWeight={600}>
                            Faça login para deixar uma avaliação
                        </Typography>
                    </Paper>
                ) : (
                    <Box sx={{ mb: 4 }}>
                        {/* Evaluation form could go here */}
                        <Typography variant="body2" color="text.secondary">
                            Você está logado. Implementar formulário de avaliação em breve.
                        </Typography>
                    </Box>
                )}

                <Box sx={{ mt: 4, textAlign: 'center' }}>
                    <Typography variant="body1" color="text.secondary" sx={{ opacity: 0.7 }}>
                        Ainda não há avaliações. Seja o primeiro!
                    </Typography>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default ModalDetalhesEstabelecimento;

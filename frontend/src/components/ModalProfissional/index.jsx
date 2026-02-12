import React, { useState, useEffect } from 'react';
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
    Avatar,
    useTheme,
    alpha,
} from "@mui/material";
import {
    FaChevronLeft,
    FaStar,
    FaPhone,
    FaEnvelope,
    FaMapMarkerAlt,
    FaClock,
    FaWhatsapp,
} from "react-icons/fa";
import MapComponent from "../MapComponent";

const ModalProfissional = ({ open, onClose, profissional }) => {
    const theme = useTheme();

    if (!profissional) return null;

    const handleWhatsApp = () => {
        const message = encodeURIComponent(`Olá, vi seu perfil no IlhaFit e gostaria de mais informações.`);
        const phone = profissional.telefone?.replace(/\D/g, '') || "5548999999999";
        window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
    };

    // Dados seguros
    const nome = profissional.nome || "Profissional";
    const foto = profissional.Imagem || profissional.fotoUrl || "";
    const especialidades = Array.isArray(profissional.especialidades) ? profissional.especialidades : [];
    const gradeAtividades = Array.isArray(profissional.gradeAtividades) ? profissional.gradeAtividades : [];

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
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
            {/* Header inspirado no Estabelecimento */}
            <Box sx={{ p: 4, pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                    <Typography variant="h4" fontWeight={800} color="text.primary">
                        Perfil do Profissional
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Informações completas do selecionado
                    </Typography>
                </Box>
                <IconButton
                    onClick={onClose}
                    sx={{
                        bgcolor: alpha(theme.palette.divider, 0.1),
                        '&:hover': { bgcolor: alpha(theme.palette.divider, 0.2) }
                    }}
                >
                    <FaChevronLeft size={18} />
                </IconButton>
            </Box>

            <DialogContent sx={{ p: 4, overflowY: 'auto' }}>
                {/* Perfil Principal */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
                    <Avatar
                        src={foto}
                        sx={{
                            width: 100,
                            height: 100,
                            border: '4px solid',
                            borderColor: theme.palette.primary.main,
                        }}
                    >
                        {nome.charAt(0)}
                    </Avatar>
                    <Box>
                        <Typography variant="h5" fontWeight={800} sx={{ mb: 0.5 }}>
                            {nome}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                            <FaStar color="#FBBF24" size={16} />
                            <Typography variant="body2" fontWeight={800} color="#92400E">
                                {profissional.avaliacao || "4.8"}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                (127 avaliações)
                            </Typography>
                        </Box>
                        <Chip
                            label="Personal Trainer"
                            color="primary"
                            size="small"
                            sx={{ fontWeight: 800, borderRadius: 1.5 }}
                        />
                    </Box>
                </Box>

                {/* Especialidades */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>Especialidades</Typography>
                    <Grid container spacing={1}>
                        {especialidades.map((esp, i) => (
                            <Grid item key={i}>
                                <Chip
                                    label={esp}
                                    variant="outlined"
                                    sx={{ fontWeight: 700, borderRadius: 2 }}
                                />
                            </Grid>
                        ))}
                    </Grid>
                </Box>

                {/* Contatos */}
                <Grid container spacing={2} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6}>
                        <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                            <FaEnvelope color={theme.palette.primary.main} />
                            <Box sx={{ overflow: 'hidden' }}>
                                <Typography variant="caption" color="text.secondary" fontWeight={700}>Email</Typography>
                                <Typography variant="body2" fontWeight={800} noWrap>
                                    {profissional.email}
                                </Typography>
                            </Box>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                            <FaPhone color={theme.palette.primary.main} />
                            <Box>
                                <Typography variant="caption" color="text.secondary" fontWeight={700}>Telefone</Typography>
                                <Typography variant="body2" fontWeight={800}>{profissional.telefone}</Typography>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>

                {/* Localização Simplificada */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>Localização</Typography>
                    <Box
                        sx={{
                            width: '100%',
                            height: 200,
                            borderRadius: 4,
                            bgcolor: '#F1F5F9',
                            overflow: 'hidden',
                            border: '1px solid',
                            borderColor: 'divider'
                        }}
                    >
                        <MapComponent
                            lat={-27.5948}
                            lng={-48.5482}
                            markerTitle={profissional.nome}
                        />
                    </Box>
                </Box>

                {/* Horários */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>Horários de Atendimento</Typography>
                    <Paper
                        variant="outlined"
                        sx={{
                            p: 3,
                            borderRadius: 4,
                            bgcolor: '#F8FAFC',
                            border: 'none'
                        }}
                    >
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {gradeAtividades.length > 0 ? (
                                gradeAtividades.map((grade, idx) => (
                                    <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="body2" fontWeight={700} color="text.secondary">
                                            {grade.atividade}
                                        </Typography>
                                        <Typography variant="body2" fontWeight={900}>
                                            {Array.isArray(grade.periodos) ? grade.periodos.join(", ") : "06:00 - 22:00"}
                                        </Typography>
                                    </Box>
                                ))
                            ) : (
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2" fontWeight={700}>Horários Padrão</Typography>
                                    <Typography variant="body2" fontWeight={900}>06:00 - 22:00</Typography>
                                </Box>
                            )}
                        </Box>
                    </Paper>
                </Box>

                {/* Botão de Contato */}
                <Button
                    fullWidth
                    variant="contained"
                    startIcon={<FaWhatsapp size={20} />}
                    onClick={handleWhatsApp}
                    sx={{
                        borderRadius: 3,
                        py: 2,
                        textTransform: 'none',
                        fontWeight: 800,
                        fontSize: '1rem',
                        bgcolor: '#10B981',
                        '&:hover': { bgcolor: '#059669' }
                    }}
                >
                    Entrar em Contato
                </Button>
            </DialogContent>
        </Dialog>
    );
};

export default ModalProfissional;

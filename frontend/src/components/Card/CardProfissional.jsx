import {
    Card,
    CardContent,
    Typography,
    Box,
    Avatar,
    Chip,
    Button,
    useTheme,
} from "@mui/material";

import { FaStar, FaPhone, FaEnvelope, FaCalendarAlt, FaWhatsapp, FaInstagram, FaFacebook, FaGlobe } from "react-icons/fa";
import { alpha } from "@mui/material/styles";
import { IconButton, Tooltip } from "@mui/material";

const CardProfissional = ({ profissional, onVisualizar }) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    return (
        <Card
            onClick={() => onVisualizar(profissional)}
            sx={{
                width: "100%",
                maxWidth: 450,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                borderRadius: 3,
                boxShadow: theme.shadows[3],
                transition: "all 0.3s ease",
                border: "1px solid",
                borderColor: isDark ? "divider" : "#e0e0e0",
                overflow: "hidden",
                bgcolor: "background.paper",
                cursor: "pointer",
                "&:hover": {
                    boxShadow: theme.shadows[6],
                    transform: "translateY(-4px)",
                },
            }}
        >
            {/* Header com gradiente */}
            <Box
                sx={{
                    height: 120,
                    background: isDark
                        ? `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.background.default} 100%)`
                        : "linear-gradient(135deg, #e0f2f1 0%, #b2dfdb 100%)",
                }}
            />

            <CardContent
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    flexGrow: 1,
                    pt: 0,
                    px: 3,
                    pb: 3,
                }}
            >
                {/* Avatar circular sobreposto */}
                <Avatar
                    src={profissional.Imagem || profissional.fotoUrl || ''}
                    alt={profissional.nome}
                    sx={{
                        width: 120,
                        height: 120,
                        border: "4px solid",
                        borderColor: "background.paper",
                        boxShadow: theme.shadows[3],
                        mt: -8,
                        mb: 2,
                        bgcolor: alpha(theme.palette.primary.main, 0.15),
                        color: 'primary.main',
                        fontSize: '2.5rem',
                        fontWeight: 700,
                    }}
                >
                    {!(profissional.Imagem || profissional.fotoUrl) && profissional.nome?.charAt(0)?.toUpperCase()}
                </Avatar>

                {/* Nome do profissional */}
                <Typography
                    variant="h6"
                    fontWeight={700}
                    textAlign="center"
                    sx={{ mb: 0.5, color: "text.primary" }}
                >
                    {profissional.nome}
                </Typography>

                {/* Avaliação */}
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        mb: 2,
                    }}
                >
                    <FaStar size={16} color="#FBBF24" />
                    <Typography
                        variant="body2"
                        sx={{ color: "#FBBF24", fontWeight: 600 }}
                    >
                        {profissional.avaliacao}
                    </Typography>
                </Box>

                {/* Especialidades */}
                <Box
                    sx={{
                        display: "flex",
                        gap: 1,
                        flexWrap: "wrap",
                        justifyContent: "center",
                        mb: 2,
                    }}
                >
                    {profissional.especialidades?.map((esp) => (
                        <Chip
                            key={esp}
                            label={esp}
                            size="small"
                            sx={{
                                bgcolor: "primary.main",
                                color: "white",
                                fontWeight: 500,
                                fontSize: "0.75rem",
                            }}
                        />
                    ))}
                </Box>

                {/* Telefone */}
                {profissional.telefone && (
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mb: 1,
                        }}
                    >
                        <FaPhone size={14} color={theme.palette.primary.main} />
                        <Typography variant="body2" color="text.secondary">{profissional.telefone}</Typography>
                    </Box>
                )}

                {/* Email */}
                {profissional.email && (
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mb: 1,
                        }}
                    >
                        <FaEnvelope size={14} color={theme.palette.primary.main} />
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.875rem" }}>
                            {profissional.email}
                        </Typography>
                    </Box>
                )}

                {/* Redes Sociais - Exibição Condicional */}
                {(profissional.telefone || profissional.instagram || profissional.facebook || profissional.website) && (
                    <Box sx={{ display: "flex", gap: 0.5, mb: 2.5 }}>
                        {profissional.telefone && (
                            <Tooltip title="WhatsApp">
                                <IconButton
                                    size="small"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const phone = profissional.telefone.replace(/\D/g, '');
                                        window.open(`https://wa.me/${phone}`, '_blank');
                                    }}
                                    sx={{ bgcolor: alpha('#25D366', 0.1), color: '#25D366', '&:hover': { bgcolor: alpha('#25D366', 0.2) }, width: 32, height: 32 }}
                                >
                                    <FaWhatsapp size={14} />
                                </IconButton>
                            </Tooltip>
                        )}
                        {profissional.instagram && (
                            <Tooltip title="Instagram">
                                <IconButton
                                    size="small"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const handle = profissional.instagram.replace('@', '');
                                        window.open(`https://instagram.com/${handle}`, '_blank');
                                    }}
                                    sx={{ bgcolor: alpha('#E4405F', 0.1), color: '#E4405F', '&:hover': { bgcolor: alpha('#E4405F', 0.2) }, width: 32, height: 32 }}
                                >
                                    <FaInstagram size={14} />
                                </IconButton>
                            </Tooltip>
                        )}
                        {profissional.facebook && (
                            <Tooltip title="Facebook">
                                <IconButton
                                    size="small"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const url = profissional.facebook.startsWith('http') ? profissional.facebook : `https://facebook.com/${profissional.facebook}`;
                                        window.open(url, '_blank');
                                    }}
                                    sx={{ bgcolor: alpha('#1877F2', 0.1), color: '#1877F2', '&:hover': { bgcolor: alpha('#1877F2', 0.2) }, width: 32, height: 32 }}
                                >
                                    <FaFacebook size={14} />
                                </IconButton>
                            </Tooltip>
                        )}
                        {profissional.website && (
                            <Tooltip title="Website">
                                <IconButton
                                    size="small"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const url = profissional.website.startsWith('http') ? profissional.website : `https://${profissional.website}`;
                                        window.open(url, '_blank');
                                    }}
                                    sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }, width: 32, height: 32 }}
                                >
                                    <FaGlobe size={14} />
                                </IconButton>
                            </Tooltip>
                        )}
                    </Box>
                )}

                {/* Botão Visualizar */}
                <Button
                    variant="contained"
                    fullWidth
                    startIcon={<FaCalendarAlt />}
                    onClick={(e) => {
                        e.stopPropagation();
                        onVisualizar(profissional);
                    }}
                    sx={{
                        mt: "auto",
                        bgcolor: "primary.main",
                        color: "white",
                        textTransform: "none",
                        fontWeight: 600,
                        py: 1.2,
                        borderRadius: 3,
                        "&:hover": {
                            bgcolor: theme.palette.custom.primaryHover,
                            boxShadow: `0 4px 12px ${isDark ? 'rgba(52, 211, 153, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
                        },
                    }}
                >
                    Visualizar
                </Button>
            </CardContent>
        </Card>
    );
};

export default CardProfissional;

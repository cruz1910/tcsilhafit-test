import {
    Dialog,
    DialogTitle,
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
} from "@mui/material";
import { FaStar, FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaTimes, FaWhatsapp } from "react-icons/fa";

const ModalProfissional = ({ open, onClose, profissional }) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    if (!profissional) return null;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            scroll="body"
            PaperProps={{
                sx: {
                    borderRadius: `${theme.shape.borderRadius * 1.5}px`,
                    padding: '8px',
                    bgcolor: 'background.paper',
                    backgroundImage: 'none',
                    border: isDark ? '1px solid' : 'none',
                    borderColor: 'divider',
                }
            }}
        >
            <DialogTitle sx={{
                m: 0,
                p: 1.5,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start'
            }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant="h6" fontWeight={700} color="text.primary">
                        Perfil do Personal Trainer
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Detalhes completos sobre o personal trainer selecionado
                    </Typography>
                </Box>
                <IconButton onClick={onClose} sx={{ color: 'text.secondary', p: 0.5 }}>
                    <FaTimes size={18} />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: '16px 24px !important' }}>
                {/* Profile Section */}
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                    mb: 3
                }}>
                    <Avatar
                        src={profissional.Imagem}
                        sx={{
                            width: 120,
                            height: 120,
                            border: '3px solid',
                            borderColor: isDark ? 'primary.dark' : theme.palette.background.default,
                            boxShadow: theme.shadows[2]
                        }}
                    />
                    <Box>
                        <Typography variant="h5" sx={{ mb: 0.25, fontWeight: 700 }}>
                            {profissional.nome}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                            <FaStar color="#FBBF24" size={16} />
                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#FBBF24' }}>
                                {profissional.avaliacao}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                                • 127 avaliações
                            </Typography>
                        </Box>
                        <Chip
                            label="Personal Trainer"
                            size="small"
                            sx={{
                                bgcolor: isDark ? 'rgba(16, 185, 129, 0.1)' : '#ecfdf5',
                                color: isDark ? theme.palette.custom.primaryHover : theme.palette.primary.main,
                                fontWeight: 600,
                                height: 20,
                                fontSize: '0.7rem'
                            }}
                        />
                    </Box>
                </Box>

                {/* Specialties */}
                <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Box sx={{ color: 'primary.main', display: 'flex' }}>
                            <FaStar size={16} />
                        </Box>
                        <Typography variant="subtitle2" fontWeight={700}>
                            Especialidades
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {profissional.especialidades?.map(esp => (
                            <Chip
                                key={esp}
                                label={esp}
                                variant="outlined"
                                size="medium"
                                sx={{
                                    color: isDark ? theme.palette.custom.primaryHover : theme.palette.primary.main,
                                    borderColor: isDark ? 'primary.dark' : '#d1fae5',
                                    bgcolor: isDark ? 'rgba(16, 185, 129, 0.05)' : '#f0fdf4',
                                    fontWeight: 500
                                }}
                            />
                        ))}
                    </Box>
                </Box>

                {/* Contact info */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6}>
                        <Box sx={{
                            p: 1.5,
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 2,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            bgcolor: isDark ? 'background.default' : '#f9fafb'
                        }}>
                            <Box sx={{
                                bgcolor: isDark ? 'rgba(16, 185, 129, 0.1)' : '#ecfdf5',
                                p: 1,
                                borderRadius: 1.5,
                                display: 'flex',
                                color: 'primary.main'
                            }}>
                                <FaEnvelope size={16} />
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                                    Email
                                </Typography>
                                <Typography variant="body2" fontWeight={600} color="text.primary">
                                    {profissional.email}
                                </Typography>
                            </Box>
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Box sx={{
                            p: 1.5,
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 2,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            bgcolor: isDark ? 'background.default' : '#f9fafb'
                        }}>
                            <Box sx={{
                                bgcolor: isDark ? 'rgba(16, 185, 129, 0.1)' : '#ecfdf5',
                                p: 1,
                                borderRadius: 1.5,
                                display: 'flex',
                                color: 'primary.main'
                            }}>
                                <FaPhone size={16} />
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                                    Telefone
                                </Typography>
                                <Typography variant="body2" fontWeight={600} color="text.primary">
                                    {profissional.telefone}
                                </Typography>
                            </Box>
                        </Box>
                    </Grid>
                </Grid>

                {/* Location */}
                <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Box sx={{ color: 'primary.main', display: 'flex' }}>
                            <FaMapMarkerAlt size={16} />
                        </Box>
                        <Typography variant="subtitle2" fontWeight={700}>
                            Localização
                        </Typography>
                    </Box>
                    <Box sx={{
                        height: 180,
                        bgcolor: isDark ? 'background.default' : '#f3f4f6',
                        borderRadius: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid',
                        borderColor: 'divider',
                        backgroundImage: 'url("https://maps.googleapis.com/maps/api/staticmap?center=-27.5948,-48.5482&zoom=13&size=600x300&sensor=false")',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <Box sx={{
                            position: 'absolute',
                            top: 0, left: 0, right: 0, bottom: 0,
                            bgcolor: isDark ? 'rgba(15, 23, 42, 0.6)' : 'rgba(255, 255, 255, 0.4)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Typography variant="h6" fontWeight={700} color="text.secondary">
                                Mapa
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                {/* Hours */}
                <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Box sx={{ color: 'primary.main', display: 'flex' }}>
                            <FaClock size={16} />
                        </Box>
                        <Typography variant="subtitle2" fontWeight={700}>
                            Horários de Atendimento
                        </Typography>
                    </Box>
                    <Box sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 3,
                        overflow: 'hidden',
                        bgcolor: isDark ? 'background.default' : '#f9fafb'
                    }}>
                        <Table size="medium">
                            <TableBody>
                                <TableRow>
                                    <TableCell sx={{ borderBottomColor: 'divider', color: 'text.secondary' }}>
                                        Segunda - Sexta
                                    </TableCell>
                                    <TableCell align="right" sx={{ borderBottomColor: 'divider', fontWeight: 700 }}>
                                        06:00 - 22:00
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell sx={{ borderBottomColor: 'divider', color: 'text.secondary' }}>
                                        Sábado
                                    </TableCell>
                                    <TableCell align="right" sx={{ borderBottomColor: 'divider', fontWeight: 700 }}>
                                        08:00 - 18:00
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell sx={{ borderBottom: 'none', color: 'text.secondary' }}>
                                        Domingo
                                    </TableCell>
                                    <TableCell align="right" sx={{ borderBottom: 'none', fontWeight: 700 }}>
                                        08:00 - 14:00
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </Box>
                </Box>

                {/* Footer Button */}
                <Button
                    fullWidth
                    variant="contained"
                    startIcon={<FaWhatsapp size={18} />}
                    sx={{
                        bgcolor: 'primary.main',
                        py: 1.5,
                        borderRadius: 3,
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        textTransform: 'none',
                        boxShadow: '0 4px 14px 0 rgba(16, 185, 129, 0.39)',
                        '&:hover': {
                            bgcolor: theme.palette.custom.primaryHover,
                        }
                    }}
                >
                    Entrar em Contato
                </Button>
            </DialogContent>
        </Dialog>
    );
};

export default ModalProfissional;

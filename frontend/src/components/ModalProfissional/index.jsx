import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogActions,
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
    TextField,
    Tooltip,
} from "@mui/material";
import {
    FaChevronLeft,
    FaStar,
    FaPhone,
    FaEnvelope,
    FaMapMarkerAlt,
    FaClock,
    FaWhatsapp,
    FaPaperPlane,
    FaTrash,
    FaExclamationTriangle,
    FaFlag,
    FaInstagram,
    FaFacebook,
    FaGlobe,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { authService, avaliacaoService } from "../../services";
import { toast } from "react-toastify";
import MapComponent from "../MapComponent";
import ModalDenuncia from "../ModalDenuncia";

const ModalProfissional = ({ open, onClose, profissional }) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [avaliacoes, setAvaliacoes] = useState([]);
    const [novaAvaliacao, setNovaAvaliacao] = useState({ nota: 5, comentario: "" });
    const [loading, setLoading] = useState(false);
    const [deleteAvaliacaoDialog, setDeleteAvaliacaoDialog] = useState({ open: false, avaliacao: null });
    const [denunciaDialog, setDenunciaDialog] = useState({ open: false, avaliacaoId: null });
    const isAuthenticated = authService.isAuthenticated();
    const userInfo = authService.getUserInfo();
    const isAdmin = userInfo?.role === 'ADMIN';
    const isUser = userInfo?.role === 'USER';
    const isDark = theme.palette.mode === 'dark';

    useEffect(() => {
        if (open && profissional?.id) {
            loadAvaliacoes();
        }
    }, [open, profissional]);

    const loadAvaliacoes = async () => {
        try {
            const data = await avaliacaoService.getByProfissional(profissional.id);
            setAvaliacoes(data);
        } catch (error) {
            console.error("Erro ao carregar avaliações:", error);
        }
    };

    const handleEnviarAvaliacao = async () => {
        if (!novaAvaliacao.comentario.trim()) {
            toast.warning("Por favor, escreva um comentário.");
            return;
        }
        setLoading(true);
        try {
            await avaliacaoService.avaliar({
                ...novaAvaliacao,
                profissionalId: profissional.id
            });
            toast.success("Avaliação enviada com sucesso!");
            setNovaAvaliacao({ nota: 5, comentario: "" });
            loadAvaliacoes();
        } catch (error) {
            const msg = error.response?.data?.erro || "Erro ao enviar avaliação.";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAvaliacao = async () => {
        if (!deleteAvaliacaoDialog.avaliacao) return;
        try {
            await avaliacaoService.delete(deleteAvaliacaoDialog.avaliacao.id);
            toast.success("Avaliação excluída com sucesso!");
            setDeleteAvaliacaoDialog({ open: false, avaliacao: null });
            loadAvaliacoes();
        } catch (error) {
            console.error("Erro ao excluir avaliação:", error);
            toast.error("Erro ao excluir avaliação");
        }
    };

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

    return (<>
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
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
                    <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 0.5 }}>
                            <Typography variant="h5" fontWeight={800}>
                                {nome}
                            </Typography>
                            <IconButton
                                onClick={handleWhatsApp}
                                sx={{
                                    bgcolor: '#25D366',
                                    color: 'white',
                                    '&:hover': { bgcolor: '#20BA5A' },
                                    width: 40,
                                    height: 40,
                                    marginLeft: 'auto',
                                    marginRight: 1
                                }}
                            >
                                <FaWhatsapp size={20} />
                            </IconButton>
                        </Box>
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

                {/* Redes Sociais - Exibição Condicional */}
                {(profissional.instagram || profissional.facebook || profissional.website) && (
                    <Box sx={{ display: 'flex', gap: 1.5, mb: 4 }}>
                        {profissional.instagram && (
                            <IconButton
                                onClick={() => {
                                    const handle = profissional.instagram.replace('@', '');
                                    window.open(`https://instagram.com/${handle}`, '_blank');
                                }}
                                sx={{
                                    bgcolor: alpha('#E4405F', 0.1),
                                    color: '#E4405F',
                                    '&:hover': { bgcolor: alpha('#E4405F', 0.2) },
                                    width: 44, height: 44
                                }}
                            >
                                <FaInstagram size={20} />
                            </IconButton>
                        )}
                        {profissional.facebook && (
                            <IconButton
                                onClick={() => {
                                    const url = profissional.facebook.startsWith('http') ? profissional.facebook : `https://facebook.com/${profissional.facebook}`;
                                    window.open(url, '_blank');
                                }}
                                sx={{
                                    bgcolor: alpha('#1877F2', 0.1),
                                    color: '#1877F2',
                                    '&:hover': { bgcolor: alpha('#1877F2', 0.2) },
                                    width: 44, height: 44
                                }}
                            >
                                <FaFacebook size={20} />
                            </IconButton>
                        )}
                        {profissional.website && (
                            <IconButton
                                onClick={() => {
                                    const url = profissional.website.startsWith('http') ? profissional.website : `https://${profissional.website}`;
                                    window.open(url, '_blank');
                                }}
                                sx={{
                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                    color: 'primary.main',
                                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) },
                                    width: 44, height: 44
                                }}
                            >
                                <FaGlobe size={20} />
                            </IconButton>
                        )}
                    </Box>
                )}

                {/* Horários */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>Horários de Atendimento</Typography>
                    <Paper
                        variant="outlined"
                        sx={{
                            p: 3,
                            borderRadius: 4,
                            bgcolor: isDark ? alpha(theme.palette.common.white, 0.05) : '#F8FAFC',
                            border: 'none'
                        }}
                    >
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                            {gradeAtividades.length > 0 ? (
                                gradeAtividades.map((grade, idx) => (
                                    <Box key={idx}>
                                        <Typography variant="body2" fontWeight={700} color="text.secondary" sx={{ mb: 1 }}>
                                            {grade.atividade}
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                            {Array.isArray(grade.periodos) ? grade.periodos.map((p, i) => (
                                                <Chip
                                                    key={i}
                                                    label={p}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                                                        color: theme.palette.primary.main,
                                                        fontWeight: 700,
                                                        borderRadius: 1.5,
                                                        border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
                                                    }}
                                                />
                                            )) : (
                                                <Chip
                                                    label="06:00 - 22:00"
                                                    size="small"
                                                    sx={{
                                                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                                                        color: theme.palette.primary.main,
                                                        fontWeight: 700,
                                                        borderRadius: 1.5
                                                    }}
                                                />
                                            )}
                                        </Box>
                                    </Box>
                                ))
                            ) : (
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="body2" fontWeight={700}>Horários Padrão</Typography>
                                    <Chip
                                        label="06:00 - 22:00"
                                        size="small"
                                        sx={{
                                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                                            color: theme.palette.primary.main,
                                            fontWeight: 700,
                                            borderRadius: 1.5
                                        }}
                                    />
                                </Box>
                            )}
                        </Box>
                    </Paper>
                </Box>

                {/* Seção de Avaliações */}
                <Divider sx={{ my: 4 }} />

                <Typography variant="h6" fontWeight={800} sx={{ mb: 3 }}>Avaliações</Typography>

                {isAuthenticated && isUser ? (
                    <Paper elevation={0} sx={{ mb: 4, p: 4, bgcolor: isDark ? alpha(theme.palette.background.paper, 0.6) : '#F8FAFC', borderRadius: 4 }}>
                        <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>Sua avaliação</Typography>
                        <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <FaStar
                                    key={star}
                                    size={28}
                                    color={star <= novaAvaliacao.nota ? "#FFD700" : "#E2E8F0"}
                                    style={{ cursor: 'pointer', transition: '0.2s' }}
                                    onClick={() => setNovaAvaliacao({ ...novaAvaliacao, nota: star })}
                                />
                            ))}
                        </Box>
                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            placeholder="Como foi sua experiência com este profissional?"
                            value={novaAvaliacao.comentario}
                            onChange={(e) => setNovaAvaliacao({ ...novaAvaliacao, comentario: e.target.value })}
                            sx={{
                                mb: 3,
                                bgcolor: isDark ? alpha(theme.palette.common.white, 0.05) : 'white',
                                '& .MuiOutlinedInput-root': { borderRadius: 3 }
                            }}
                        />
                        <Button
                            fullWidth
                            variant="contained"
                            onClick={handleEnviarAvaliacao}
                            disabled={loading}
                            sx={{
                                borderRadius: 3,
                                textTransform: 'none',
                                fontWeight: 800,
                                bgcolor: theme.palette.primary.main,
                                '&:hover': { bgcolor: theme.palette.primary.dark },
                                height: 56,
                                fontSize: '1.1rem',
                                boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.2)}`
                            }}
                        >
                            {loading ? "Enviando..." : "Enviar avaliação"}
                        </Button>
                    </Paper>
                ) : isAuthenticated ? (
                    <Paper elevation={0} sx={{ mb: 4, p: 3, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="body1" color="text.secondary" fontWeight={600} sx={{ textAlign: 'center' }}>
                            {isAdmin ? 'Modo moderador — você pode excluir avaliações inadequadas.' : 'Apenas alunos podem enviar avaliações.'}
                        </Typography>
                    </Paper>
                ) : (
                    <Paper elevation={0} sx={{ mb: 4, p: 4, bgcolor: isDark ? alpha(theme.palette.background.paper, 0.6) : '#F8FAFC', borderRadius: 4, textAlign: 'center' }}>
                        <Box sx={{ mb: 3 }}>
                            <FaStar size={48} color={alpha(theme.palette.primary.main, 0.3)} />
                        </Box>
                        <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
                            Cadastre-se para avaliar
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Faça parte da comunidade IlhaFit e compartilhe sua experiência com este profissional
                        </Typography>
                        <Button
                            fullWidth
                            variant="contained"
                            startIcon={<FaPaperPlane />}
                            onClick={() => navigate('/cadastro')}
                            sx={{
                                borderRadius: 3,
                                textTransform: 'none',
                                fontWeight: 800,
                                bgcolor: theme.palette.primary.main,
                                '&:hover': { bgcolor: theme.palette.primary.dark },
                                height: 56,
                                fontSize: '1.1rem',
                                boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.3)}`
                            }}
                        >
                            Cadastrar-se para avaliar
                        </Button>
                    </Paper>
                )}

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 4 }}>
                    {avaliacoes.length > 0 ? (
                        avaliacoes.map((av) => (
                            <Paper key={av.id} elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: isDark ? alpha(theme.palette.common.white, 0.03) : 'background.paper' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="subtitle1" fontWeight={800}>{av.nomeAutor}</Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                                            {[...Array(5)].map((_, i) => (
                                                <FaStar key={i} size={14} color={i < av.nota ? "#FFD700" : "#E2E8F0"} />
                                            ))}
                                        </Box>
                                        {(isAdmin || (userInfo?.nome === av.nomeAutor)) && (
                                            <Tooltip title="Excluir avaliação">
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => setDeleteAvaliacaoDialog({ open: true, avaliacao: av })}
                                                    sx={{ bgcolor: alpha(theme.palette.error.main, 0.08), '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.2), color: 'white' } }}
                                                >
                                                    <FaTrash size={12} />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                        {isAuthenticated && userInfo?.nome !== av.nomeAutor && (
                                            <Tooltip title="Denunciar avaliação">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => setDenunciaDialog({ open: true, avaliacaoId: av.id })}
                                                    sx={{ color: 'text.secondary', '&:hover': { color: 'warning.main', bgcolor: alpha(theme.palette.warning.main, 0.1) } }}
                                                >
                                                    <FaFlag size={11} />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                    </Box>
                                </Box>
                                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                                    {av.comentario}
                                </Typography>
                            </Paper>
                        ))
                    ) : (
                        <Box sx={{ py: 6, textAlign: 'center', bgcolor: isDark ? alpha(theme.palette.common.white, 0.03) : '#F8FAFC', borderRadius: 4, border: '1px dashed', borderColor: 'divider' }}>
                            <Typography variant="body1" color="text.secondary" fontWeight={500}>
                                Seja o primeiro a avaliar!
                            </Typography>
                        </Box>
                    )}
                </Box>

            </DialogContent>
        </Dialog>

        {/* Dialog de Confirmação de Exclusão de Avaliação */}
        <Dialog open={deleteAvaliacaoDialog.open} onClose={() => setDeleteAvaliacaoDialog({ open: false, avaliacao: null })}>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FaExclamationTriangle color={theme.palette.error.main} />
                Excluir Avaliação
            </DialogTitle>
            <DialogContent>
                <Typography>
                    Tem certeza que deseja excluir a avaliação de <strong>{deleteAvaliacaoDialog.avaliacao?.nomeAutor}</strong>?
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Esta ação não pode ser desfeita.
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setDeleteAvaliacaoDialog({ open: false, avaliacao: null })}>Cancelar</Button>
                <Button onClick={handleDeleteAvaliacao} color="error" variant="contained">Excluir</Button>
            </DialogActions>
        </Dialog>

        {/* Modal de Denúncia */}
        <ModalDenuncia
            open={denunciaDialog.open}
            onClose={() => setDenunciaDialog({ open: false, avaliacaoId: null })}
            avaliacaoId={denunciaDialog.avaliacaoId}
        />
    </>);
};

export default ModalProfissional;

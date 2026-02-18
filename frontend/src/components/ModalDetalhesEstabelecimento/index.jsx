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
    useTheme,
    alpha,
    TextField,
} from "@mui/material";
import {
    FaChevronLeft,
    FaChevronRight,
    FaStar,
    FaMapMarkerAlt,
    FaClock,
    FaWhatsapp,
    FaPaperPlane
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { authService, avaliacaoService } from "../../services";
import { toast } from "react-toastify";
import MapComponent from "../MapComponent";

const ModalDetalhesEstabelecimento = ({ open, onClose, estabelecimento }) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [avaliacoes, setAvaliacoes] = useState([]);
    const [novaAvaliacao, setNovaAvaliacao] = useState({ nota: 5, comentario: "" });
    const [loading, setLoading] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const isAuthenticated = authService.isAuthenticated();

    useEffect(() => {
        if (open && estabelecimento?.id) {
            loadAvaliacoes();
            setCurrentImageIndex(0);
        }
    }, [open, estabelecimento]);

    const loadAvaliacoes = async () => {
        try {
            const data = await avaliacaoService.getByEstabelecimento(estabelecimento.id);
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
                estabelecimentoId: estabelecimento.id
            });
            toast.success("Avaliação enviada com sucesso!");
            setNovaAvaliacao({ nota: 5, comentario: "" });
            loadAvaliacoes();
        } catch (error) {
            toast.error("Erro ao enviar avaliação.");
        } finally {
            setLoading(false);
        }
    };

    const handleWhatsApp = () => {
        const message = encodeURIComponent(`Olá, vi seu estabelecimento no IlhaFit e gostaria de mais informações.`);
        const phone = estabelecimento.telefone?.replace(/\D/g, '') || "5548999999999";
        window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
    };

    if (!estabelecimento) return null;

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
                    maxHeight: '95vh'
                }
            }}
        >
            <DialogContent sx={{ p: 0, overflowY: 'auto', position: 'relative' }}>
                {/* Botão Fechar Flutuante */}
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

                {/* Cabeçalho com Carrossel de Imagens - Agora dentro do DialogContent para rolar */}
                <Box sx={{ position: 'relative', width: '100%', height: { xs: 300, md: 500 }, bgcolor: 'black' }}>
                    <Box
                        sx={{
                            width: '100%',
                            height: '100%',
                            backgroundImage: `url(${estabelecimento.fotosUrl?.[currentImageIndex] || estabelecimento.Imagem || "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop"})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            transition: 'background-image 0.5s ease-in-out'
                        }}
                    />

                    {/* Setas de Navegação do Carrossel */}
                    {(estabelecimento.fotosUrl?.length > 1 || (estabelecimento.Imagens?.length > 0)) && (
                        <>
                            <IconButton
                                onClick={(e) => {
                                    e.stopPropagation();
                                    const allImages = estabelecimento.fotosUrl || estabelecimento.Imagens || [];
                                    setCurrentImageIndex(prev => prev === 0 ? allImages.length - 1 : prev - 1);
                                }}
                                sx={{
                                    position: 'absolute',
                                    left: 16,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    bgcolor: 'rgba(0,0,0,0.5)',
                                    color: 'white',
                                    '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
                                    zIndex: 5
                                }}
                            >
                                <FaChevronLeft size={24} />
                            </IconButton>
                            <IconButton
                                onClick={(e) => {
                                    e.stopPropagation();
                                    const allImages = estabelecimento.fotosUrl || estabelecimento.Imagens || [];
                                    setCurrentImageIndex(prev => prev === allImages.length - 1 ? 0 : prev + 1);
                                }}
                                sx={{
                                    position: 'absolute',
                                    right: 16,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    bgcolor: 'rgba(0,0,0,0.5)',
                                    color: 'white',
                                    '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
                                    zIndex: 5
                                }}
                            >
                                <FaChevronRight size={24} />
                            </IconButton>

                            {/* Indicadores (Dots) */}
                            <Box sx={{
                                position: 'absolute',
                                bottom: 16,
                                left: '50%',
                                transform: 'translateX(-50%)',
                                display: 'flex',
                                gap: 1
                            }}>
                                {(estabelecimento.fotosUrl || estabelecimento.Imagens || []).map((_, idx) => (
                                    <Box
                                        key={idx}
                                        sx={{
                                            width: 8,
                                            height: 8,
                                            borderRadius: '50%',
                                            bgcolor: idx === currentImageIndex ? 'primary.main' : 'rgba(255,255,255,0.5)',
                                            transition: 'all 0.3s'
                                        }}
                                    />
                                ))}
                            </Box>
                        </>
                    )}
                </Box>

                <Box sx={{ p: { xs: 3, md: 6 } }}>
                    {/* Cabeçalho de Informações: Título */}
                    <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                            <Typography variant="h3" fontWeight={800} color="text.primary" sx={{ letterSpacing: '-0.02em' }}>
                                {estabelecimento.nome}
                            </Typography>
                            <IconButton
                                onClick={handleWhatsApp}
                                sx={{
                                    bgcolor: '#25D366',
                                    color: 'white',
                                    '&:hover': { bgcolor: '#20BA5A' },
                                    width: 48,
                                    height: 48,
                                    marginLeft: 'auto',
                                    marginRight: 1
                                }}
                            >
                                <FaWhatsapp size={24} />
                            </IconButton>
                        </Box>

                        {/* Avaliação e Categorias */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: alpha(theme.palette.primary.main, 0.1), px: 1.5, py: 0.5, borderRadius: 2 }}>
                                <FaStar color={theme.palette.primary.main} size={16} />
                                <Typography variant="h6" fontWeight={800} color="primary.main" sx={{ lineHeight: 1 }}>
                                    {estabelecimento.avaliacao || "0.0"}
                                </Typography>
                            </Box>
                            <Typography variant="body1" color="text.secondary" fontWeight={500}>
                                ({avaliacoes.length} avaliações)
                            </Typography>
                        </Box>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 5 }}>
                        {estabelecimento.categorias?.map((cat, i) => (
                            <Chip
                                key={i}
                                label={cat}
                                variant="outlined"
                                sx={{
                                    fontWeight: 700,
                                    borderRadius: 2,
                                    px: 1,
                                    height: 32,
                                    fontSize: '0.85rem',
                                    color: 'error.main',
                                    borderColor: alpha(theme.palette.error.main, 0.3)
                                }}
                            />
                        ))}
                        {estabelecimento.exclusivoMulheres && (
                            <Chip
                                label="Aulas Femininas"
                                variant="outlined"
                                sx={{
                                    fontWeight: 700,
                                    borderRadius: 2,
                                    px: 1,
                                    height: 32,
                                    fontSize: '0.85rem',
                                    color: '#DB2777',
                                    borderColor: alpha('#F472B6', 0.3)
                                }}
                            />
                        )}
                    </Box>


                    {/* Vertical Layout - All sections stacked */}
                    <Box>
                        {/* Sobre */}
                        <Box sx={{ mb: 6 }}>
                            <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>Sobre</Typography>
                            <Typography color="text.secondary" variant="body1" sx={{ lineHeight: 1.8, fontSize: '1.1rem' }}>
                                {estabelecimento.descricao || "A Bio Ritmo Premium oferece uma experi\u00eancia \u00fanica de treinamento com equipamentos de \u00faltima gera\u00e7\u00e3o e atendimento personalizado."}
                            </Typography>
                        </Box>

                        {/* Galeria */}
                        {estabelecimento.Imagens && estabelecimento.Imagens.length > 0 && (
                            <Box sx={{ mb: 6 }}>
                                <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>Galeria</Typography>
                                <Grid container spacing={2}>
                                    {estabelecimento.Imagens.map((img, index) => (
                                        <Grid item xs={6} sm={4} md={3} lg={2} key={index}>
                                            <Box
                                                component="img"
                                                src={img}
                                                alt={`Foto ${index + 1}`}
                                                sx={{
                                                    width: '100%',
                                                    height: 120,
                                                    objectFit: 'cover',
                                                    borderRadius: 2,
                                                    cursor: 'pointer',
                                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                                    border: currentImageIndex === index ? '3px solid' : 'none',
                                                    borderColor: 'primary.main',
                                                    '&:hover': {
                                                        transform: 'scale(1.05)',
                                                        boxShadow: 3
                                                    }
                                                }}
                                                onClick={() => setCurrentImageIndex(index)}
                                            />
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                        )}

                        {/* Hor\u00e1rio de Funcionamento */}
                        <Box sx={{ mb: 6 }}>
                            <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>Hor\u00e1rio de Funcionamento</Typography>
                            <Paper variant="outlined" sx={{ p: 4, borderRadius: 4, bgcolor: '#F8FAFC', border: 'none' }}>
                                {Array.isArray(estabelecimento?.gradeAtividades) && estabelecimento.gradeAtividades.length > 0 ? (
                                    estabelecimento.gradeAtividades.map((grade, idx) => (
                                        <Box key={idx} sx={{ mb: idx !== estabelecimento.gradeAtividades.length - 1 ? 3 : 0 }}>
                                            <Typography variant="subtitle1" fontWeight={800} color="primary" sx={{ mb: 0.5 }}>
                                                {grade.atividade}
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                                                <FaClock color={theme.palette.primary.main} size={16} />
                                                <Typography variant="body2" fontWeight={700}>
                                                    {grade.diasSemana?.join(", ") || "Todos os dias"}
                                                </Typography>
                                            </Box>
                                            <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                                                Per\u00edodos: {grade.periodos?.join(", ") || "Indeterminado"}
                                            </Typography>
                                            {idx !== estabelecimento.gradeAtividades.length - 1 && <Divider sx={{ mt: 2, opacity: 0.5 }} />}
                                        </Box>
                                    ))
                                ) : (
                                    <Typography color="text.secondary">Hor\u00e1rios n\u00e3o informados.</Typography>
                                )}
                            </Paper>
                        </Box>

                        {/* Localiza\u00e7\u00e3o */}
                        <Box sx={{ mb: 6 }}>
                            <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>Localiza\u00e7\u00e3o</Typography>
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', mb: 3 }}>
                                <Box sx={{ mt: 0.5 }}>
                                    <FaMapMarkerAlt color={theme.palette.primary.main} size={22} />
                                </Box>
                                <Box>
                                    <Typography variant="h6" fontWeight={700}>
                                        {estabelecimento.endereco?.rua}, {estabelecimento.endereco?.numero}
                                    </Typography>
                                    <Typography color="text.secondary" variant="body1">
                                        {estabelecimento.endereco?.bairro}, {estabelecimento.endereco?.cidade}
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Mapa Real com MapTiler */}
                            <Paper sx={{
                                width: '100%',
                                height: 350,
                                bgcolor: '#F8FAFC',
                                borderRadius: 4,
                                overflow: 'hidden',
                                border: '1px solid',
                                borderColor: 'divider',
                            }} elevation={0}>
                                <MapComponent
                                    lat={estabelecimento.endereco?.latitude || -27.5948}
                                    lng={estabelecimento.endereco?.longitude || -48.5482}
                                    markerTitle={estabelecimento.nome}
                                />
                            </Paper>
                        </Box>

                        <Divider sx={{ my: 6 }} />

                        {/* Se\u00e7\u00e3o de Avalia\u00e7\u00f5es */}
                        <Typography variant="h5" fontWeight={800} sx={{ mb: 3 }}>Avalia\u00e7\u00f5es</Typography>

                        {isAuthenticated ? (
                            <Paper elevation={0} sx={{ mb: 4, p: 4, bgcolor: '#F8FAFC', borderRadius: 4 }}>
                                <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>Sua avalia\u00e7\u00e3o</Typography>
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
                                    placeholder="Como foi sua experi\u00eancia neste local?"
                                    value={novaAvaliacao.comentario}
                                    onChange={(e) => setNovaAvaliacao({ ...novaAvaliacao, comentario: e.target.value })}
                                    sx={{
                                        mb: 3,
                                        bgcolor: 'white',
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
                                        boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.3)}`
                                    }}
                                >
                                    {loading ? "Enviando..." : "Enviar avalia\u00e7\u00e3o"}
                                </Button>
                            </Paper>
                        ) : (
                            <Paper elevation={0} sx={{ mb: 4, p: 4, bgcolor: '#F8FAFC', borderRadius: 4, textAlign: 'center' }}>
                                <Box sx={{ mb: 3 }}>
                                    <FaStar size={48} color={alpha(theme.palette.primary.main, 0.3)} />
                                </Box>
                                <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
                                    Cadastre-se para avaliar
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                    Fa\u00e7a parte da comunidade IlhaFit e compartilhe sua experi\u00eancia neste estabelecimento
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

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            {avaliacoes.length > 0 ? (
                                avaliacoes.map((av) => (
                                    <Paper key={av.id} elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                            <Typography variant="subtitle1" fontWeight={800}>{av.nomeAutor}</Typography>
                                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                {[...Array(5)].map((_, i) => (
                                                    <FaStar key={i} size={14} color={i < av.nota ? "#FFD700" : "#E2E8F0"} />
                                                ))}
                                            </Box>
                                        </Box>
                                        <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                                            {av.comentario}
                                        </Typography>
                                    </Paper>
                                ))
                            ) : (
                                <Box sx={{ py: 6, textAlign: 'center', bgcolor: '#F8FAFC', borderRadius: 4, border: '1px dashed', borderColor: 'divider' }}>
                                    <Typography variant="body1" color="text.secondary" fontWeight={500}>
                                        Seja o primeiro a avaliar!
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </Box>
                </Box>
            </DialogContent>
        </Dialog >
    );
};

export default ModalDetalhesEstabelecimento;

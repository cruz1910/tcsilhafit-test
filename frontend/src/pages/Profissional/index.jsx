import { Box, Container, Typography, CircularProgress, Pagination, Button, Snackbar, Alert, Tooltip, TextField, InputAdornment, Chip, IconButton, Paper, Collapse } from "@mui/material";
import { useState, useEffect, useCallback, useMemo } from "react";
import { FaLocationArrow, FaSearch, FaStar, FaFilter, FaTimes } from "react-icons/fa";
import { alpha, useTheme } from "@mui/material/styles";
import CardProfissional from "../../components/Card/CardProfissional";
import ModalProfissional from "../../components/ModalProfissional";
import { profissionalService, categoriaService } from "../../services";

const FLORIPA_COORDS = { lat: -27.5948, lng: -48.5482 };

const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};


const Profissional = () => {
    const theme = useTheme();
    const [selectedProfissional, setSelectedProfissional] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [profissionais, setProfissionais] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const itemsPerPage = 16;
    const [userLocation, setUserLocation] = useState(FLORIPA_COORDS);
    const [geoStatus, setGeoStatus] = useState('pending');
    const [geoSnackbar, setGeoSnackbar] = useState({ open: false, message: '', severity: 'info' });

    // Filtros
    const [search, setSearch] = useState("");
    const [selectedEspecialidades, setSelectedEspecialidades] = useState([]);
    const [minRating, setMinRating] = useState(0);
    const [showFilters, setShowFilters] = useState(false);
    const [categorias, setCategorias] = useState([]);

    const requestUserLocation = useCallback(() => {
        if (!navigator.geolocation) {
            setGeoStatus('unavailable');
            setGeoSnackbar({ open: true, message: 'Geolocalização não disponível. Usando Florianópolis como referência.', severity: 'warning' });
            return;
        }
        setGeoStatus('pending');
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
                setGeoStatus('granted');
                setGeoSnackbar({ open: true, message: 'Localização obtida! Ordenando por proximidade.', severity: 'success' });
            },
            (error) => {
                setGeoStatus('denied');
                const msgs = {
                    1: 'Permissão negada. Usando Florianópolis como referência.',
                    2: 'Localização indisponível. Usando Florianópolis.',
                    3: 'Tempo esgotado. Usando Florianópolis.',
                };
                setGeoSnackbar({ open: true, message: msgs[error.code] || msgs[2], severity: 'warning' });
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
        );
    }, []);

    useEffect(() => {
        requestUserLocation();
    }, [requestUserLocation]);

    useEffect(() => {
        categoriaService.listarTodas().then(setCategorias).catch(console.error);
    }, []);

    useEffect(() => {
        const fetchProfissionais = async () => {
            try {
                const data = await profissionalService.getAll();
                const mappedData = data.map(item => ({
                    ...item,
                    Imagem: item.fotoUrl || "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500&auto=format&fit=crop&q=60",
                    especialidades: (item.categorias || []).map(c => c.nome),
                    atividades: (item.categorias || []).map(c => c.nome),
                    avaliacao: item.avaliacao || 0.0,
                }));
                setProfissionais(mappedData);
            } catch (error) {
                console.error("Erro ao buscar profissionais:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfissionais();
    }, []);

    const handleOpenModal = (profissional) => {
        setSelectedProfissional(profissional);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedProfissional(null);
    };

    const handleChangePage = (_event, value) => {
        setPage(value);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const toggleEspecialidade = (esp) => {
        setSelectedEspecialidades(prev =>
            prev.includes(esp) ? prev.filter(e => e !== esp) : [...prev, esp]
        );
        setPage(1);
    };

    const clearFilters = () => {
        setSearch("");
        setSelectedEspecialidades([]);
        setMinRating(0);
        setPage(1);
    };

    const hasActiveFilters = search.length > 0 || selectedEspecialidades.length > 0 || minRating > 0;

    const filteredAndSorted = useMemo(() => {
        return [...profissionais].map(p => {
            const lat = p.endereco?.latitude;
            const lng = p.endereco?.longitude;
            const dist = (lat && lng) ? haversineDistance(userLocation.lat, userLocation.lng, lat, lng) : 999;
            return { ...p, distancia: dist };
        }).filter(p => {
            const searchLower = search.toLowerCase();
            const matchesSearch = !search || p.nome?.toLowerCase().includes(searchLower)
                || p.especializacao?.toLowerCase().includes(searchLower)
                || p.endereco?.bairro?.toLowerCase().includes(searchLower)
                || p.atividades?.some(a => a.toLowerCase().includes(searchLower));
            const matchesEspecialidade = selectedEspecialidades.length === 0
                || p.atividades?.some(a => selectedEspecialidades.includes(a));
            const matchesRating = p.avaliacao >= minRating;
            return matchesSearch && matchesEspecialidade && matchesRating;
        }).sort((a, b) => a.distancia - b.distancia);
    }, [profissionais, userLocation, search, selectedEspecialidades, minRating]);

    // Reset page quando filtros mudam
    useEffect(() => {
        setPage(1);
    }, [search, selectedEspecialidades, minRating]);

    const paginatedProfissionais = filteredAndSorted.slice(
        (page - 1) * itemsPerPage,
        page * itemsPerPage
    );

    return (
        <Container maxWidth="lg" sx={{ py: 6 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h3" fontWeight={900} mb={1} sx={{ letterSpacing: '-0.02em' }}>
                    Nossos <span style={{ color: "#10B981" }}>Profissionais</span>
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <Typography color="text.secondary" variant="h6" fontWeight={500}>
                        Especialistas prontos para ajudar na sua jornada fitness
                    </Typography>
                    <Tooltip title={geoStatus === 'granted' ? 'Localização ativa — clique para atualizar' : 'Ordenar por proximidade'}>
                        <Button
                            variant={geoStatus === 'granted' ? "contained" : "outlined"}
                            startIcon={<FaLocationArrow />}
                            onClick={requestUserLocation}
                            size="small"
                            sx={{
                                borderRadius: 3, textTransform: 'none', fontWeight: 700,
                                ...(geoStatus === 'granted' ? {
                                    bgcolor: '#10B981', '&:hover': { bgcolor: '#059669' },
                                } : {
                                    borderColor: '#10B981', color: '#10B981',
                                })
                            }}
                        >
                            {geoStatus === 'granted' ? 'Próximos de mim' : 'Usar minha localização'}
                        </Button>
                    </Tooltip>
                </Box>
            </Box>

            {/* Barra de busca e filtros */}
            <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                    <TextField
                        placeholder="Buscar por nome, especialidade ou bairro..."
                        size="small"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <FaSearch color={theme.palette.primary.main} />
                                </InputAdornment>
                            ),
                        }}
                        sx={{
                            flex: 1, minWidth: 280,
                            '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: 'background.paper' }
                        }}
                    />
                    <Button
                        variant="outlined"
                        startIcon={showFilters ? <FaTimes /> : <FaFilter />}
                        onClick={() => setShowFilters(!showFilters)}
                        size="small"
                        sx={{
                            borderRadius: 3, textTransform: 'none', fontWeight: 700,
                            borderColor: theme.palette.primary.main, color: theme.palette.primary.main,
                            '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) }
                        }}
                    >
                        {showFilters ? "Fechar" : "Filtros"}
                        {hasActiveFilters && !showFilters && (
                            <Box component="span" sx={{ ml: 1, width: 8, height: 8, borderRadius: '50%', bgcolor: '#EF4444', display: 'inline-block' }} />
                        )}
                    </Button>
                    {hasActiveFilters && (
                        <Button size="small" color="error" onClick={clearFilters} startIcon={<FaTimes />} sx={{ textTransform: 'none', fontWeight: 600 }}>
                            Limpar
                        </Button>
                    )}
                </Box>

                {/* Chips de especialidades */}
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip
                        label="Todos"
                        onClick={() => setSelectedEspecialidades([])}
                        sx={{
                            borderRadius: 2.5, fontWeight: 600,
                            bgcolor: selectedEspecialidades.length === 0 ? theme.palette.primary.main : 'background.paper',
                            color: selectedEspecialidades.length === 0 ? 'white' : 'text.primary',
                            border: '1px solid',
                            borderColor: selectedEspecialidades.length === 0 ? theme.palette.primary.main : 'divider',
                            cursor: 'pointer',
                            '&:hover': { bgcolor: selectedEspecialidades.length === 0 ? theme.palette.primary.dark : alpha(theme.palette.primary.main, 0.1) },
                        }}
                    />
                    {categorias.map((cat) => (
                        <Chip
                            key={cat.id}
                            label={cat.nome}
                            onClick={() => toggleEspecialidade(cat.nome)}
                            sx={{
                                borderRadius: 2.5, fontWeight: 600,
                                bgcolor: selectedEspecialidades.includes(cat.nome) ? theme.palette.primary.main : 'background.paper',
                                color: selectedEspecialidades.includes(cat.nome) ? 'white' : 'text.primary',
                                border: '1px solid',
                                borderColor: selectedEspecialidades.includes(cat.nome) ? theme.palette.primary.main : 'divider',
                                cursor: 'pointer',
                                '&:hover': { bgcolor: selectedEspecialidades.includes(cat.nome) ? theme.palette.primary.dark : alpha(theme.palette.primary.main, 0.1) },
                            }}
                        />
                    ))}
                </Box>

                {/* Filtros avançados */}
                <Collapse in={showFilters}>
                    <Paper elevation={0} sx={{
                        p: 3, borderRadius: 4, border: '1px solid', borderColor: 'divider',
                        bgcolor: alpha(theme.palette.background.paper, 0.8),
                    }}>
                        <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-end', flexWrap: 'wrap', justifyContent: 'center' }}>
                            <Box>
                                <Typography variant="subtitle2" fontWeight={700} mb={1.5}>Avaliação Mínima</Typography>
                                <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <IconButton
                                            key={star}
                                            onClick={() => setMinRating(star === minRating ? 0 : star)}
                                            size="small"
                                            sx={{ color: star <= minRating ? '#FBBF24' : '#E5E7EB', '&:hover': { color: '#FBBF24' } }}
                                        >
                                            <FaStar size={22} />
                                        </IconButton>
                                    ))}
                                </Box>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 0.5 }}>
                                    {minRating > 0 ? `${minRating}+ estrelas` : 'Qualquer avaliação'}
                                </Typography>
                            </Box>
                        </Box>
                    </Paper>
                </Collapse>

                {/* Contador de resultados */}
                <Typography variant="body2" color="text.secondary" fontWeight={600}>
                    {filteredAndSorted.length} {filteredAndSorted.length === 1 ? 'profissional encontrado' : 'profissionais encontrados'}
                    {hasActiveFilters && ' com os filtros aplicados'}
                </Typography>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                    <CircularProgress color="primary" />
                </Box>
            ) : filteredAndSorted.length > 0 ? (
                <>
                    <Box
                        sx={{
                            display: "grid",
                            gap: 3,
                            mb: 6,
                            gridTemplateColumns: {
                                xs: "1fr",
                                sm: "repeat(2, 1fr)",
                                md: "repeat(3, 1fr)",
                                lg: "repeat(4, 1fr)",
                            },
                            justifyItems: "center",
                        }}
                    >
                        {paginatedProfissionais.map((item) => (
                            <CardProfissional
                                key={item.id}
                                profissional={item}
                                onVisualizar={() => handleOpenModal(item)}
                            />
                        ))}
                    </Box>

                    {filteredAndSorted.length > itemsPerPage && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                            <Pagination
                                count={Math.ceil(filteredAndSorted.length / itemsPerPage)}
                                page={page}
                                onChange={handleChangePage}
                                color="primary"
                                size="large"
                            />
                        </Box>
                    )}
                </>
            ) : (
                <Box sx={{ textAlign: 'center', py: 10 }}>
                    <Typography variant="h6" color="text.secondary">
                        {hasActiveFilters ? 'Nenhum profissional encontrado para os filtros selecionados.' : 'Nenhum profissional encontrado no momento.'}
                    </Typography>
                    {hasActiveFilters && (
                        <Button onClick={clearFilters} variant="outlined" sx={{ mt: 2, borderRadius: 3, textTransform: 'none' }}>
                            Limpar Filtros
                        </Button>
                    )}
                </Box>
            )}

            <ModalProfissional
                open={modalOpen}
                onClose={handleCloseModal}
                profissional={selectedProfissional}
            />

            <Snackbar
                open={geoSnackbar.open}
                autoHideDuration={4000}
                onClose={() => setGeoSnackbar(prev => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setGeoSnackbar(prev => ({ ...prev, open: false }))}
                    severity={geoSnackbar.severity}
                    variant="filled"
                    sx={{ borderRadius: 3, fontWeight: 600 }}
                >
                    {geoSnackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default Profissional;

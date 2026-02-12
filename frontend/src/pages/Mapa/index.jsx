import { useState, useMemo, useEffect } from "react";
import {
    Box,
    Typography,
    TextField,
    InputAdornment,
    Chip,
    Paper,
    Avatar,
    Rating,
    IconButton,
    Tooltip,
    Slider,
    FormControlLabel,
    Switch,
    Button,
    Collapse,
    useTheme,
    useMediaQuery,
    CircularProgress,
} from "@mui/material";
import { FaSearch, FaMapMarkerAlt, FaPhone, FaClock, FaChevronRight, FaStar, FaFilter, FaTimes } from "react-icons/fa";
import { estabelecimentoService } from "../../services";
import MapComponent from "../../components/MapComponent";

const categories = ["Academy", "CrossFit", "Funcional", "Pilates", "Yoga", "Dança", "Basquete", "Natação"];

const Mapa = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

    const [loading, setLoading] = useState(true);
    const [dbEstablishments, setDbEstablishments] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [search, setSearch] = useState("");
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [minRating, setMinRating] = useState(0);
    const [maxDistance, setMaxDistance] = useState(10);
    const [onlyOpen, setOnlyOpen] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const data = await estabelecimentoService.getAll();

                const mapped = data.map(est => {
                    // Coordenadas reais ou fallback para Florianópolis centro
                    const lat = est.endereco?.latitude || (-27.59 + (Math.random() - 0.5) * 0.1);
                    const lng = est.endereco?.longitude || (-48.54 + (Math.random() - 0.5) * 0.1);

                    return {
                        id: est.id,
                        nome: est.nomeFantasia || est.nome,
                        categoria: est.atividadesOferecidas?.[0] || "Academia",
                        lat,
                        lng,
                        avaliacao: est.avaliacao || 0,
                        distancia: (Math.random() * 5).toFixed(1), // Simulated distance
                        imagem: est.fotosUrl?.[0] || "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&auto=format&fit=crop&q=60",
                        telefone: est.telefone,
                        horario: "06:00 - 22:00",
                        aberto: true,
                        atividades: est.atividadesOferecidas || []
                    };
                });
                setDbEstablishments(mapped);
            } catch (err) {
                console.error("Erro ao buscar dados do mapa:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    const toggleCategory = (cat) => {
        setSelectedCategories(prev =>
            prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
        );
    };

    const clearFilters = () => {
        setSearch("");
        setSelectedCategories([]);
        setMinRating(0);
        setMaxDistance(10);
        setOnlyOpen(false);
    };

    const filteredEstablishments = useMemo(() => {
        return dbEstablishments.filter((e) => {
            const matchesSearch = e.nome.toLowerCase().includes(search.toLowerCase());
            const matchesCategory = selectedCategories.length === 0 || e.atividades.some(a => selectedCategories.includes(a));
            const matchesRating = e.avaliacao >= minRating;
            const matchesDistance = parseFloat(e.distancia) <= maxDistance;
            const matchesStatus = !onlyOpen || e.aberto;
            return matchesSearch && matchesCategory && matchesRating && matchesDistance && matchesStatus;
        });
    }, [search, selectedCategories, minRating, maxDistance, onlyOpen, dbEstablishments]);

    const selectedEstablishment = dbEstablishments.find((e) => e.id === selectedId);

    return (
        <Box sx={{
            p: 3,
            height: 'calc(100vh - 80px)',
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
            bgcolor: 'background.default'
        }}>
            {/* Header Section */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                        <Typography variant="h4" fontWeight={700} sx={{ color: 'text.primary' }}>
                            Mapa de Academias
                        </Typography>
                        <Typography color="text.secondary">
                            Encontre os melhores lugares para treinar perto de você
                        </Typography>
                    </Box>
                    <Button
                        variant="outlined"
                        startIcon={showFilters ? <FaTimes /> : <FaFilter />}
                        onClick={() => setShowFilters(!showFilters)}
                        sx={{
                            borderRadius: 3,
                            textTransform: 'none',
                            fontWeight: 700,
                            borderColor: theme.palette.primary.main,
                            color: theme.palette.primary.main,
                            '&:hover': {
                                bgcolor: alpha(theme.palette.primary.main, 0.05),
                                borderColor: theme.palette.primary.dark,
                            }
                        }}
                    >
                        {showFilters ? "Fechar Filtros" : "Filtros Avançados"}
                    </Button>
                </Box>

                <Collapse in={showFilters}>
                    <Paper elevation={0} sx={{
                        mt: 2,
                        p: 3,
                        borderRadius: 5,
                        bgcolor: alpha(theme.palette.background.paper, 0.7),
                        backdropFilter: 'blur(10px)',
                        border: '1px solid',
                        borderColor: alpha(theme.palette.primary.main, 0.2)
                    }}>
                        <Box sx={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: 3,
                            alignItems: 'flex-end'
                        }}>
                            <Box>
                                <Typography variant="subtitle2" fontWeight={700} mb={1}>Avaliação Mínima</Typography>
                                <Box sx={{ px: 1 }}>
                                    <Slider
                                        value={minRating}
                                        onChange={(_, v) => setMinRating(v)}
                                        min={0}
                                        max={5}
                                        step={0.5}
                                        marks
                                        valueLabelDisplay="auto"
                                        color="primary"
                                    />
                                </Box>
                            </Box>
                            <Box>
                                <Typography variant="subtitle2" fontWeight={700} mb={1}>Distância Máxima ({maxDistance}km)</Typography>
                                <Box sx={{ px: 1 }}>
                                    <Slider
                                        value={maxDistance}
                                        onChange={(_, v) => setMaxDistance(v)}
                                        min={1}
                                        max={10}
                                        step={1}
                                        valueLabelDisplay="auto"
                                        color="primary"
                                    />
                                </Box>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <FormControlLabel
                                    control={<Switch checked={onlyOpen} onChange={(e) => setOnlyOpen(e.target.checked)} color="primary" />}
                                    label={<Typography variant="subtitle2" fontWeight={700}>Aberto Agora</Typography>}
                                />
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                                <Button size="small" color="error" onClick={clearFilters} startIcon={<FaTimes />}>
                                    Limpar Filtros
                                </Button>
                            </Box>
                        </Box>
                    </Paper>
                </Collapse>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, flexWrap: 'wrap' }}>
                    <TextField
                        placeholder="Buscar por nome..."
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
                            minWidth: 300,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 3,
                                bgcolor: 'background.paper',
                            }
                        }}
                    />
                    <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 0.5 }}>
                        <Chip
                            label="Todos"
                            onClick={() => setSelectedCategories([])}
                            sx={{
                                borderRadius: 2.5,
                                fontWeight: 600,
                                transition: 'all 0.2s ease',
                                bgcolor: selectedCategories.length === 0 ? theme.palette.primary.main : 'background.paper',
                                color: selectedCategories.length === 0 ? 'white' : 'text.primary',
                                border: '1px solid',
                                borderColor: selectedCategories.length === 0 ? theme.palette.primary.main : 'divider',
                                cursor: 'pointer',
                                '&:hover': {
                                    bgcolor: selectedCategories.length === 0 ? theme.palette.primary.dark : alpha(theme.palette.primary.main, 0.1),
                                },
                                boxShadow: selectedCategories.length === 0 ? `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}` : 'none'
                            }}
                        />
                        {categories.map((cat) => (
                            <Chip
                                key={cat}
                                label={cat}
                                onClick={() => toggleCategory(cat)}
                                sx={{
                                    borderRadius: 2.5,
                                    fontWeight: 600,
                                    transition: 'all 0.2s ease',
                                    bgcolor: selectedCategories.includes(cat) ? theme.palette.primary.main : 'background.paper',
                                    color: selectedCategories.includes(cat) ? 'white' : 'text.primary',
                                    border: '1px solid',
                                    borderColor: selectedCategories.includes(cat) ? theme.palette.primary.main : 'divider',
                                    cursor: 'pointer',
                                    '&:hover': {
                                        bgcolor: selectedCategories.includes(cat) ? theme.palette.primary.dark : alpha(theme.palette.primary.main, 0.1),
                                    },
                                    boxShadow: selectedCategories.includes(cat) ? `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}` : 'none'
                                }}
                            />
                        ))}
                    </Box>
                </Box>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <CircularProgress color="primary" />
                </Box>
            ) : (
                <Box sx={{
                    display: 'flex',
                    gap: 3,
                    flex: 1,
                    minHeight: 0,
                    flexDirection: isMobile ? 'column' : 'row'
                }}>
                    {/* Map Area */}
                    <Box sx={{
                        flex: 1,
                        bgcolor: 'background.paper',
                        borderRadius: 6,
                        overflow: 'hidden',
                        position: 'relative',
                        border: '1px solid',
                        borderColor: 'divider',
                        boxShadow: 'inset 0 2px 10px rgba(0, 0, 0, 0.05)',
                        height: isMobile ? 400 : '100%',
                        flexShrink: 0
                    }}>
                        <MapComponent
                            markers={filteredEstablishments.map(e => ({
                                id: e.id,
                                lat: e.lat,
                                lng: e.lng,
                                title: e.nome
                            }))}
                            onMarkerClick={(id) => setSelectedId(id)}
                        />
                    </Box>

                    {/* Sidebar Area */}
                    <Box sx={{
                        width: isMobile ? '100%' : (isTablet ? 300 : 380),
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2.5
                    }}>
                        {/* Detail Card */}
                        <Paper elevation={4} sx={{
                            p: 2.5,
                            borderRadius: 5,
                            minHeight: 200,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            transition: 'all 0.3s ease',
                            bgcolor: alpha(theme.palette.background.paper, 0.8),
                            backdropFilter: 'blur(10px)',
                            border: '1px solid',
                            borderColor: alpha(theme.palette.common.white, 0.3),
                            opacity: selectedId ? 1 : 0.8
                        }}>
                            {selectedEstablishment ? (
                                <>
                                    <Box sx={{ display: 'flex', gap: 2, mb: 2.5 }}>
                                        <Avatar
                                            src={selectedEstablishment.imagem}
                                            variant="rounded"
                                            sx={{ width: 60, height: 60, borderRadius: 3 }}
                                        />
                                        <Box>
                                            <Typography variant="h6" fontWeight={700}>
                                                {selectedEstablishment.nome}
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                                <Rating value={selectedEstablishment.avaliacao} readOnly size="small" precision={0.1} />
                                                <Typography variant="caption" sx={{ ml: 1, fontWeight: 600 }}>
                                                    {selectedEstablishment.avaliacao}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Box>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2.5 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: 'text.secondary' }}>
                                            <FaMapMarkerAlt color={theme.palette.primary.main} />
                                            <Typography variant="body2">{selectedEstablishment.distancia}km de você</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: 'text.secondary' }}>
                                            <FaPhone color={theme.palette.primary.main} />
                                            <Typography variant="body2">{selectedEstablishment.telefone}</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: 'text.secondary' }}>
                                            <FaClock color={theme.palette.primary.main} />
                                            <Typography variant="body2">{selectedEstablishment.horario}</Typography>
                                        </Box>
                                    </Box>
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        sx={{
                                            py: 1.5,
                                            borderRadius: 3,
                                            fontWeight: 700,
                                            textTransform: 'none',
                                            bgcolor: 'primary.main',
                                            boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.4)}`,
                                            '&:hover': {
                                                bgcolor: 'primary.dark',
                                                transform: 'translateY(-2px)',
                                                boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.5)}`,
                                            }
                                        }}
                                    >
                                        Ver Perfil Completo
                                    </Button>
                                </>
                            ) : (
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <FaMapMarkerAlt size={40} color={theme.palette.primary.main} style={{ opacity: 0.5, marginBottom: 16 }} />
                                    <Typography variant="body2" color="text.secondary" textAlign="center">
                                        Clique em um marcador no mapa para ver os detalhes do estabelecimento
                                    </Typography>
                                </Box>
                            )}
                        </Paper>

                        {/* All Establishments List */}
                        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                            <Typography variant="subtitle1" fontWeight={700} mb={2}>
                                Resultados ({filteredEstablishments.length})
                            </Typography>
                            <Box sx={{
                                overflowY: 'auto',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 1.5,
                                pr: 1
                            }}>
                                {filteredEstablishments.map((est) => (
                                    <Box
                                        key={est.id}
                                        onClick={() => setSelectedId(est.id)}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1.5,
                                            p: 1.5,
                                            borderRadius: 4,
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            border: '1px solid',
                                            borderColor: selectedId === est.id ? alpha(theme.palette.primary.main, 0.3) : 'transparent',
                                            bgcolor: selectedId === est.id ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                                            '&:hover': {
                                                bgcolor: alpha(theme.palette.primary.main, 0.05),
                                            }
                                        }}
                                    >
                                        <Avatar src={est.imagem} variant="rounded" sx={{ width: 48, height: 48, borderRadius: 2 }} />
                                        <Box sx={{ flexGrow: 1 }}>
                                            <Typography variant="body2" fontWeight={700}>
                                                {est.nome}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {est.categoria} • {est.distancia}km
                                            </Typography>
                                        </Box>
                                        <FaChevronRight size={12} color={theme.palette.text.secondary} />
                                    </Box>
                                ))}
                                {filteredEstablishments.length === 0 && (
                                    <Box sx={{ p: 4, textAlign: 'center' }}>
                                        <Typography variant="body2" color="text.secondary">
                                            Nenhum resultado encontrado para os filtros selecionados.
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        </Box>
                    </Box>
                </Box>
            )}
        </Box>
    );
};

import { alpha } from "@mui/material/styles";

export default Mapa;

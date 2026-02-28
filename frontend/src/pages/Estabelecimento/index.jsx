import { Box, Container, Typography, CircularProgress, Pagination, Button, Snackbar, Alert, Tooltip, TextField, InputAdornment, Chip, IconButton, Slider, Paper, Collapse, Rating } from "@mui/material";
import { useState, useEffect, useCallback, useMemo } from "react";
import { FaLocationArrow, FaSearch, FaStar, FaFilter, FaTimes } from "react-icons/fa";
import { alpha, useTheme } from "@mui/material/styles";
import CardEstabelecimento from "../../components/Card/CardEstabelecimento";
import ModalDetalhesEstabelecimento from "../../components/ModalDetalhesEstabelecimento";
import { estabelecimentoService } from "../../services";

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

const allCategories = [
    "Academia", "CrossFit", "Funcional", "Pilates", "Yoga", "Dança",
    "Balé", "Basquete", "Futebol", "Natação", "Vôlei", "Jiu-Jitsu",
    "Boxe", "Muay Thai", "Kung Fu", "Ciclismo", "Circo", "Fisioterapia", "Outros"
];

const Estabelecimento = () => {
  const theme = useTheme();
  const [selectedEstab, setSelectedEstab] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [estabelecimentos, setEstabelecimentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const itemsPerPage = 12;
  const [userLocation, setUserLocation] = useState(FLORIPA_COORDS);
  const [geoStatus, setGeoStatus] = useState('pending');
  const [geoSnackbar, setGeoSnackbar] = useState({ open: false, message: '', severity: 'info' });

  // Filtros
  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [minRating, setMinRating] = useState(0);
  const [maxDistance, setMaxDistance] = useState(50);
  const [showFilters, setShowFilters] = useState(false);
  const [exclusivoMulheres, setExclusivoMulheres] = useState(false);

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
    const fetchEstabelecimentos = async () => {
      try {
        const data = await estabelecimentoService.getAll();
        const mappedData = data.map(item => ({
          ...item,
          Imagem: (item.fotosUrl && item.fotosUrl.length > 0) ? item.fotosUrl[0] : "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop",
          Imagens: item.fotosUrl || [],
          categorias: (item.gradeAtividades || []).map(g => g.atividade),
          avaliacao: item.avaliacao || 0.0,
          aberto: true,
          descricao: item.descricao || "Um ótimo local para treinar e cuidar da sua saúde.",
        }));
        setEstabelecimentos(mappedData);
      } catch (error) {
        console.error("Erro ao buscar estabelecimentos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEstabelecimentos();
  }, []);

  const handleOpenModal = (estab) => {
    setSelectedEstab(estab);
    setIsModalOpen(true);
  };

  const handleChangePage = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleCategory = (cat) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
    setPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedCategories([]);
    setMinRating(0);
    setMaxDistance(50);
    setExclusivoMulheres(false);
    setPage(1);
  };

  const hasActiveFilters = search.length > 0 || selectedCategories.length > 0 || minRating > 0 || maxDistance < 50 || exclusivoMulheres;

  const filteredAndSorted = useMemo(() => {
    return [...estabelecimentos].map(e => {
      const lat = e.endereco?.latitude;
      const lng = e.endereco?.longitude;
      const dist = (lat && lng) ? haversineDistance(userLocation.lat, userLocation.lng, lat, lng) : 999;
      return { ...e, distancia: dist };
    }).filter(e => {
      const searchLower = search.toLowerCase();
      const matchesSearch = !search || e.nome?.toLowerCase().includes(searchLower)
        || e.nomeFantasia?.toLowerCase().includes(searchLower)
        || e.endereco?.bairro?.toLowerCase().includes(searchLower)
        || e.categorias.some(c => c.toLowerCase().includes(searchLower));
      const matchesCategory = selectedCategories.length === 0 || e.categorias.some(c => selectedCategories.includes(c));
      const matchesRating = e.avaliacao >= minRating;
      const matchesDistance = e.distancia <= maxDistance;
      const matchesMulheres = !exclusivoMulheres || e.exclusivoMulheres;
      return matchesSearch && matchesCategory && matchesRating && matchesDistance && matchesMulheres;
    }).sort((a, b) => a.distancia - b.distancia);
  }, [estabelecimentos, userLocation, search, selectedCategories, minRating, maxDistance, exclusivoMulheres]);

  // Reset page quando filtros mudam
  useEffect(() => {
    setPage(1);
  }, [search, selectedCategories, minRating, maxDistance, exclusivoMulheres]);

  const paginatedEstabelecimentos = filteredAndSorted.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" fontWeight={900} mb={1} sx={{ letterSpacing: '-0.02em' }}>
          Descubra os Melhores <span style={{ color: "#10B981" }}>Locais</span>
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Typography color="text.secondary" variant="h6" fontWeight={500}>
            Explore academias e centros de saúde em Florianópolis
          </Typography>
          <Tooltip title={geoStatus === 'granted' ? 'Localização ativa — clique para atualizar' : 'Ordenar por proximidade'}>
            <Button
              variant={geoStatus === 'granted' ? "contained" : "outlined"}
              startIcon={<FaLocationArrow />}
              onClick={requestUserLocation}
              size="small"
              sx={{
                borderRadius: 3,
                textTransform: 'none',
                fontWeight: 700,
                ...(geoStatus === 'granted' ? {
                  bgcolor: '#10B981',
                  '&:hover': { bgcolor: '#059669' },
                } : {
                  borderColor: '#10B981',
                  color: '#10B981',
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
            placeholder="Buscar por nome, bairro ou atividade..."
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
              flex: 1,
              minWidth: 280,
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

        {/* Chips de categorias */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            label="Todos"
            onClick={() => setSelectedCategories([])}
            sx={{
              borderRadius: 2.5, fontWeight: 600,
              bgcolor: selectedCategories.length === 0 ? theme.palette.primary.main : 'background.paper',
              color: selectedCategories.length === 0 ? 'white' : 'text.primary',
              border: '1px solid',
              borderColor: selectedCategories.length === 0 ? theme.palette.primary.main : 'divider',
              cursor: 'pointer',
              '&:hover': { bgcolor: selectedCategories.length === 0 ? theme.palette.primary.dark : alpha(theme.palette.primary.main, 0.1) },
            }}
          />
          {allCategories.map((cat) => (
            <Chip
              key={cat}
              label={cat}
              onClick={() => toggleCategory(cat)}
              sx={{
                borderRadius: 2.5, fontWeight: 600,
                bgcolor: selectedCategories.includes(cat) ? theme.palette.primary.main : 'background.paper',
                color: selectedCategories.includes(cat) ? 'white' : 'text.primary',
                border: '1px solid',
                borderColor: selectedCategories.includes(cat) ? theme.palette.primary.main : 'divider',
                cursor: 'pointer',
                '&:hover': { bgcolor: selectedCategories.includes(cat) ? theme.palette.primary.dark : alpha(theme.palette.primary.main, 0.1) },
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
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 3, alignItems: 'flex-end' }}>
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
              <Box>
                <Typography variant="subtitle2" fontWeight={700} mb={1}>Distância Máxima ({maxDistance}km)</Typography>
                <Box sx={{ px: 1 }}>
                  <Slider value={maxDistance} onChange={(_, v) => setMaxDistance(v)} min={1} max={50} step={1} valueLabelDisplay="auto" color="primary" />
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Chip
                  label="Exclusivo Mulheres"
                  onClick={() => setExclusivoMulheres(!exclusivoMulheres)}
                  sx={{
                    borderRadius: 2.5, fontWeight: 600,
                    bgcolor: exclusivoMulheres ? '#EC4899' : 'background.paper',
                    color: exclusivoMulheres ? 'white' : 'text.primary',
                    border: '1px solid',
                    borderColor: exclusivoMulheres ? '#EC4899' : 'divider',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: exclusivoMulheres ? '#DB2777' : alpha('#EC4899', 0.1) },
                  }}
                />
              </Box>
            </Box>
          </Paper>
        </Collapse>

        {/* Contador de resultados */}
        <Typography variant="body2" color="text.secondary" fontWeight={600}>
          {filteredAndSorted.length} {filteredAndSorted.length === 1 ? 'estabelecimento encontrado' : 'estabelecimentos encontrados'}
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
              gap: 4,
              mb: 6,
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(3, 1fr)",
              },
            }}
          >
            {paginatedEstabelecimentos.map((item) => (
              <CardEstabelecimento
                key={item.id}
                estabelecimento={item}
                onClickDetail={handleOpenModal}
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
            {hasActiveFilters ? 'Nenhum estabelecimento encontrado para os filtros selecionados.' : 'Nenhum estabelecimento encontrado. Seja o primeiro a cadastrar!'}
          </Typography>
          {hasActiveFilters && (
            <Button onClick={clearFilters} variant="outlined" sx={{ mt: 2, borderRadius: 3, textTransform: 'none' }}>
              Limpar Filtros
            </Button>
          )}
        </Box>
      )}

      <ModalDetalhesEstabelecimento
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        estabelecimento={selectedEstab}
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

export default Estabelecimento;

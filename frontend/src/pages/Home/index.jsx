import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  TextField,
  InputAdornment,
  Button,
  Select,
  MenuItem,
  Slider,
  Chip,
  Paper,
  useTheme,
  alpha,
  CircularProgress,
} from "@mui/material";
import { FaSearch, FaFilter, FaMapMarkerAlt, FaMagic } from "react-icons/fa";
import ModalChatIA from "../../components/ModalChatIA";
import CardEstabelecimento from "../../components/Card/CardEstabelecimento";
import ModalDetalhesEstabelecimento from "../../components/ModalDetalhesEstabelecimento";
import { Link } from "react-router-dom";
import { estabelecimentoService } from "../../services";

const Home = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [distance, setDistance] = useState(10);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const [estabelecimentos, setEstabelecimentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEstab, setSelectedEstab] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchEstabelecimentos = async () => {
      try {
        const data = await estabelecimentoService.getAll();
        const mappedData = data.slice(0, 3).map(item => ({
          ...item,
          Imagem: item.fotoUrl || "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500&auto=format&fit=crop&q=60",
          categorias: item.atividadesOferecidas || [],
          avaliacao: 4.8,
          aberto: true,
          descricao: item.descricao || "Um ótimo local para treinar e cuidar da sua saúde.",
        }));
        setEstabelecimentos(mappedData);
      } catch (error) {
        console.error("Erro ao buscar estabelecimentos na Home:", error);
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

  return (
    <Box sx={{
      minHeight: '100vh',
      background: isDark
        ? `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`
        : `linear-gradient(135deg, ${theme.palette.background.default} 0%, #ffffff 100%)`,
      pt: 8,
      pb: 8
    }}>
      <Container maxWidth="lg">
        {/* Badge Section */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <Chip
            label="Mais de 80 locais disponíveis"
            icon={<Box sx={{ color: theme.palette.primary.main, display: 'flex', ml: 1 }}><FaMapMarkerAlt size={14} /></Box>}
            sx={{
              bgcolor: isDark ? alpha(theme.palette.primary.main, 0.1) : '#dcfce7',
              color: isDark ? theme.palette.primary.main : '#065f46',
              fontWeight: 700,
              borderRadius: '12px',
              border: '1px solid',
              borderColor: isDark ? alpha(theme.palette.primary.main, 0.2) : '#b9f6ca',
              '& .MuiChip-label': { px: 2 }
            }}
          />
        </Box>

        {/* Hero Section */}
        <Typography
          variant="h1"
          align="center"
          sx={{
            fontSize: { xs: '2.5rem', md: '4.5rem' },
            fontWeight: 900,
            mb: 2,
            color: theme.palette.text.primary,
            letterSpacing: '-0.02em',
            lineHeight: 1.1
          }}
        >
          Transforme sua <span style={{ color: theme.palette.primary.main }}>saúde hoje</span>
        </Typography>

        <Typography
          variant="h6"
          align="center"
          color="text.secondary"
          sx={{
            maxWidth: 700,
            mx: 'auto',
            mb: 8,
            fontWeight: 500,
            lineHeight: 1.6
          }}
        >
          Encontre academias, aulas e instrutores perfeitos para seus objetivos. Seu bem-estar está a um clique de distância.
        </Typography>

        {/* Search Card Section */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, md: 4 },
            borderRadius: 8,
            boxShadow: isDark
              ? '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)'
              : '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            border: '1px solid',
            borderColor: 'divider',
            maxWidth: 800,
            mx: 'auto',
            bgcolor: theme.palette.background.paper,
            mb: 10
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Search Input */}
            <TextField
              fullWidth
              placeholder="Buscar por nome, tipo ou localização..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FaSearch color={theme.palette.text.secondary} />
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: 4,
                  bgcolor: isDark ? alpha(theme.palette.text.primary, 0.05) : '#f8fafc',
                  height: 56,
                  fontSize: '1rem'
                }
              }}
            />

            {/* Filters and Buttons Row */}
            <Box sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              gap: 2,
              alignItems: 'center'
            }}>
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                flex: { xs: '1 1 auto', md: '0 0 200px' },
                width: '100%'
              }}>
                <FaFilter color={theme.palette.primary.main} />
                <Select
                  fullWidth
                  defaultValue="Todas"
                  size="small"
                  sx={{
                    borderRadius: 3,
                    bgcolor: isDark ? alpha(theme.palette.text.primary, 0.05) : '#f8fafc'
                  }}
                >
                  <MenuItem value="Todas">Todas</MenuItem>
                  <MenuItem value="CrossFit">CrossFit</MenuItem>
                  <MenuItem value="Pilates">Pilates</MenuItem>
                  <MenuItem value="Musculação">Musculação</MenuItem>
                </Select>
              </Box>

              <Button
                component={Link}
                to="/mapa"
                variant="outlined"
                startIcon={<FaMapMarkerAlt />}
                sx={{
                  flex: 1,
                  width: '100%',
                  borderRadius: 3,
                  py: 1.5,
                  textTransform: 'none',
                  fontWeight: 700,
                  borderColor: theme.palette.primary.main,
                  color: theme.palette.primary.main,
                }}
              >
                Ver no Mapa
              </Button>

              <Button
                variant="contained"
                startIcon={<FaMagic />}
                onClick={() => setIsChatOpen(true)}
                sx={{
                  flex: 1,
                  width: '100%',
                  borderRadius: 3,
                  py: 1.5,
                  textTransform: 'none',
                  fontWeight: 700,
                  bgcolor: theme.palette.primary.main,
                  boxShadow: `0 4px 14px 0 ${alpha(theme.palette.primary.main, 0.39)}`,
                }}
              >
                Busca com IA
              </Button>
            </Box>

            {/* Distance Slider */}
            <Box sx={{ px: 2, pt: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FaMapMarkerAlt size={16} color={theme.palette.primary.main} />
                  <Typography variant="subtitle2" fontWeight={700} color="text.secondary">
                    Distância máxima
                  </Typography>
                </Box>
                <Chip
                  label={`${distance} km`}
                  size="small"
                  sx={{ bgcolor: theme.palette.primary.main, color: 'white', fontWeight: 700 }}
                />
              </Box>
              <Slider
                value={distance}
                onChange={(_, v) => setDistance(v)}
                min={1}
                max={50}
                sx={{
                  color: theme.palette.primary.main,
                }}
              />
            </Box>
          </Box>
        </Paper>

        {/* Dynamic Content Section */}
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.02em' }}>
              Parceiros <span style={{ color: "#10B981" }}>Recentes</span>
            </Typography>
            <Button component={Link} to="/estabelecimento" color="primary" sx={{ fontWeight: 700, textTransform: 'none' }}>
              Ver todos
            </Button>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
              <CircularProgress color="primary" />
            </Box>
          ) : estabelecimentos.length > 0 ? (
            <Box
              sx={{
                display: "grid",
                gap: 4,
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                  md: "repeat(3, 1fr)",
                },
              }}
            >
              {estabelecimentos.map((item) => (
                <CardEstabelecimento
                  key={item.id}
                  estabelecimento={item}
                  onClickDetail={handleOpenModal}
                />
              ))}
            </Box>
          ) : (
            <Typography color="text.secondary" align="center" py={5}>
              Nenhum estabelecimento cadastrado ainda.
            </Typography>
          )}
        </Box>
      </Container>

      <ModalChatIA open={isChatOpen} onClose={() => setIsChatOpen(false)} />
      <ModalDetalhesEstabelecimento
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        estabelecimento={selectedEstab}
      />
    </Box>
  );
};

export default Home;
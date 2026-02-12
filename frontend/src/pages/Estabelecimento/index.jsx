import { Box, Container, Typography, CircularProgress } from "@mui/material";
import { useState, useEffect } from "react";
import CardEstabelecimento from "../../components/Card/CardEstabelecimento";
import ModalDetalhesEstabelecimento from "../../components/ModalDetalhesEstabelecimento";
import { estabelecimentoService } from "../../services";

const Estabelecimento = () => {
  const [selectedEstab, setSelectedEstab] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [estabelecimentos, setEstabelecimentos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEstabelecimentos = async () => {
      try {
        const data = await estabelecimentoService.getAll();
        const mappedData = data.map(item => ({
          ...item,
          Imagem: (item.fotosUrl && item.fotosUrl.length > 0) ? item.fotosUrl[0] : "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop",
          Imagens: item.fotosUrl || [],
          categorias: item.atividadesOferecidas || [],
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

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box sx={{ mb: 6 }}>
        <Typography variant="h3" fontWeight={900} mb={1} sx={{ letterSpacing: '-0.02em' }}>
          Descubra os Melhores <span style={{ color: "#10B981" }}>Locais</span>
        </Typography>
        <Typography color="text.secondary" variant="h6" fontWeight={500}>
          Explore academias e centros de saúde em Florianópolis
        </Typography>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
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
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <Typography variant="h6" color="text.secondary">
            Nenhum estabelecimento encontrado. Seja o primeiro a cadastrar!
          </Typography>
        </Box>
      )}

      <ModalDetalhesEstabelecimento
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        estabelecimento={selectedEstab}
      />
    </Container>
  );
};

export default Estabelecimento;

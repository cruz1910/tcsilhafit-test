import { Box, Container, Typography, CircularProgress, Pagination } from "@mui/material";
import { useState, useEffect } from "react";
import CardProfissional from "../../components/Card/CardProfissional";
import ModalProfissional from "../../components/ModalProfissional";
import { profissionalService } from "../../services";

const Profissional = () => {
    const [selectedProfissional, setSelectedProfissional] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [profissionais, setProfissionais] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const itemsPerPage = 16;

    useEffect(() => {
        const fetchProfissionais = async () => {
            try {
                const data = await profissionalService.getAll();
                const mappedData = data.map(item => ({
                    ...item,
                    Imagem: item.fotoUrl || "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500&auto=format&fit=crop&q=60",
                    especialidades: item.especializacao ? item.especializacao.split(", ") : (Array.isArray(item.atividadesOferecidas) ? item.atividadesOferecidas : []),
                    gradeAtividades: Array.isArray(item.gradeAtividades) ? item.gradeAtividades : [],
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

    const handleChangePage = (event, value) => {
        setPage(value);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const paginatedProfissionais = profissionais.slice(
        (page - 1) * itemsPerPage,
        page * itemsPerPage
    );

    return (
        <Container maxWidth="lg" sx={{ py: 6 }}>
            <Box sx={{ mb: 6 }}>
                <Typography variant="h3" fontWeight={900} mb={1} sx={{ letterSpacing: '-0.02em' }}>
                    Nossos <span style={{ color: "#10B981" }}>Profissionais</span>
                </Typography>
                <Typography color="text.secondary" variant="h6" fontWeight={500}>
                    Especialistas prontos para ajudar na sua jornada fitness
                </Typography>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                    <CircularProgress color="primary" />
                </Box>
            ) : profissionais.length > 0 ? (
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

                    {profissionais.length > itemsPerPage && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                            <Pagination
                                count={Math.ceil(profissionais.length / itemsPerPage)}
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
                        Nenhum profissional encontrado no momento.
                    </Typography>
                </Box>
            )}

            <ModalProfissional
                open={modalOpen}
                onClose={handleCloseModal}
                profissional={selectedProfissional}
            />
        </Container>
    );
};

export default Profissional;

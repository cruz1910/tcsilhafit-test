import React, { useState, useEffect } from "react";
import {
    Box,
    Paper,
    Typography,
    Grid,
    Card,
    CardContent,
    CardMedia,
    CardActions,
    IconButton,
    Chip,
    Button,
    TextField,
    InputAdornment,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress,
    Tooltip,
} from "@mui/material";
import {
    FaTrash,
    FaSearch,
    FaPhone,
    FaEnvelope,
    FaMapMarkerAlt,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { estabelecimentoService } from "../../../services";

const EstabelecimentosTab = () => {
    const [estabelecimentos, setEstabelecimentos] = useState([]);
    const [filteredEstabelecimentos, setFilteredEstabelecimentos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [deleteDialog, setDeleteDialog] = useState({ open: false, estabelecimento: null });

    useEffect(() => {
        loadEstabelecimentos();
    }, []);

    useEffect(() => {
        filterEstabelecimentos();
    }, [searchTerm, estabelecimentos]);

    const loadEstabelecimentos = async () => {
        try {
            setLoading(true);
            const data = await estabelecimentoService.getAll();
            setEstabelecimentos(data);
        } catch (error) {
            console.error("Erro ao carregar estabelecimentos:", error);
            toast.error("Erro ao carregar estabelecimentos");
        } finally {
            setLoading(false);
        }
    };

    const filterEstabelecimentos = () => {
        let filtered = estabelecimentos;

        if (searchTerm) {
            filtered = filtered.filter(
                (e) =>
                    e.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    e.nomeFantasia?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    e.email?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredEstabelecimentos(filtered);
    };

    const handleDelete = async () => {
        if (!deleteDialog.estabelecimento) return;

        try {
            await estabelecimentoService.delete(deleteDialog.estabelecimento.id);
            toast.success("Estabelecimento excluído com sucesso!");
            loadEstabelecimentos();
            setDeleteDialog({ open: false, estabelecimento: null });
        } catch (error) {
            console.error("Erro ao excluir estabelecimento:", error);
            toast.error("Erro ao excluir estabelecimento");
        }
    };

    return (
        <Box>
            {/* Stats e Busca */}
            <Box sx={{ mb: 4, display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
                <Paper sx={{ p: 2, display: "flex", alignItems: "center", gap: 2, flex: 1 }}>
                    <TextField
                        placeholder="Buscar por nome, fantasia ou email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        fullWidth
                        variant="outlined"
                        size="small"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <FaSearch size={16} />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Paper>
                <Chip
                    label={`${filteredEstabelecimentos.length} encontrados`}
                    color="primary"
                    variant="outlined"
                    sx={{ fontWeight: 'bold' }}
                />
            </Box>

            {/* Grid de Cards */}
            {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
                    <CircularProgress />
                </Box>
            ) : filteredEstabelecimentos.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: "center" }}>
                    <Typography color="text.secondary">Nenhum estabelecimento encontrado</Typography>
                </Paper>
            ) : (
                <Grid container spacing={3}>
                    {filteredEstabelecimentos.map((estab) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={estab.id}>
                            <Card sx={{ height: "100%", display: "flex", flexDirection: "column", position: "relative" }}>
                                <CardMedia
                                    component="img"
                                    height="140"
                                    image={estab.fotoUrl || "https://via.placeholder.com/300x140?text=Sem+Imagem"}
                                    alt={estab.nomeFantasia}
                                    sx={{ bgcolor: "grey.200" }}
                                />
                                {estab.exclusivoMulheres && (
                                    <Chip
                                        label="Feminino"
                                        color="secondary"
                                        size="small"
                                        sx={{ position: "absolute", top: 10, right: 10 }}
                                    />
                                )}
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Typography gutterBottom variant="h6" component="div" noWrap title={estab.nomeFantasia || estab.nome}>
                                        {estab.nomeFantasia || estab.nome || "Sem Nome"}
                                    </Typography>

                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5, color: "text.secondary" }}>
                                        <FaEnvelope size={12} />
                                        <Typography variant="body2" noWrap title={estab.email}>
                                            {estab.email}
                                        </Typography>
                                    </Box>

                                    {estab.telefone && (
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5, color: "text.secondary" }}>
                                            <FaPhone size={12} />
                                            <Typography variant="body2">
                                                {estab.telefone}
                                            </Typography>
                                        </Box>
                                    )}

                                    {/* Exemplo de endereço se existir no objeto */}
                                    {estab.endereco && (
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1, color: "text.secondary" }}>
                                            <FaMapMarkerAlt size={12} />
                                            <Typography variant="caption" noWrap>
                                                {estab.endereco.cidade || "Localização não inf."}
                                            </Typography>
                                        </Box>
                                    )}
                                </CardContent>
                                <CardActions sx={{ justifyContent: "flex-end", p: 2, pt: 0 }}>
                                    <Tooltip title="Excluir">
                                        <IconButton
                                            size="small"
                                            color="error"
                                            onClick={() => setDeleteDialog({ open: true, estabelecimento: estab })}
                                            sx={{ bgcolor: 'error.lighter', '&:hover': { bgcolor: 'error.light', color: 'white' } }}
                                        >
                                            <FaTrash size={16} />
                                        </IconButton>
                                    </Tooltip>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Dialog de Confirmação */}
            <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, estabelecimento: null })}>
                <DialogTitle>Confirmar Exclusão</DialogTitle>
                <DialogContent>
                    <Typography>
                        Tem certeza que deseja excluir <strong>{deleteDialog.estabelecimento?.nomeFantasia || deleteDialog.estabelecimento?.nome}</strong>?
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Esta ação não pode ser desfeita.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialog({ open: false, estabelecimento: null })}>Cancelar</Button>
                    <Button onClick={handleDelete} color="error" variant="contained">Excluir</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default EstabelecimentosTab;

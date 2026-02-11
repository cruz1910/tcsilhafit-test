import React, { useState, useEffect } from "react";
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Chip,
    Button,
    TextField,
    InputAdornment,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    useTheme,
} from "@mui/material";
import {
    FaTrash,
    FaEye,
    FaSearch,
    FaArrowLeft,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { estabelecimentoService, authService } from "../../services";
import { useNavigate } from "react-router-dom";

const AdminEstabelecimentos = () => {
    const theme = useTheme();
    const navigate = useNavigate();

    const [estabelecimentos, setEstabelecimentos] = useState([]);
    const [filteredEstabelecimentos, setFilteredEstabelecimentos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [deleteDialog, setDeleteDialog] = useState({ open: false, estabelecimento: null });

    useEffect(() => {
        // Verificar se é admin
        const userInfo = authService.getUserInfo();
        if (!userInfo || userInfo.role !== "ADMIN") {
            toast.error("Acesso negado!");
            navigate("/");
            return;
        }

        loadEstabelecimentos();
    }, [navigate]);

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
        <Box sx={{ minHeight: "100vh", bgcolor: "background.default", py: 4, px: 2 }}>
            <Box sx={{ maxWidth: 1400, mx: "auto" }}>
                {/* Header */}
                <Box sx={{ mb: 4 }}>
                    <Button
                        startIcon={<FaArrowLeft />}
                        onClick={() => navigate("/admin")}
                        sx={{ mb: 2, textTransform: "none" }}
                    >
                        Voltar ao Painel
                    </Button>
                    <Typography variant="h4" fontWeight={800} color="text.primary" gutterBottom>
                        Gerenciar Estabelecimentos
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Visualize e gerencie os estabelecimentos cadastrados
                    </Typography>
                </Box>

                {/* Stats */}
                <Box sx={{ display: "flex", gap: 2, mb: 4, flexWrap: "wrap" }}>
                    <Paper sx={{ flex: 1, p: 2, minWidth: 150 }}>
                        <Typography variant="body2" color="text.secondary">
                            Total de Estabelecimentos
                        </Typography>
                        <Typography variant="h4" fontWeight={700} color="warning.main">
                            {estabelecimentos.length}
                        </Typography>
                    </Paper>
                    <Paper sx={{ flex: 1, p: 2, minWidth: 150 }}>
                        <Typography variant="body2" color="text.secondary">
                            Filtrados
                        </Typography>
                        <Typography variant="h4" fontWeight={700}>
                            {filteredEstabelecimentos.length}
                        </Typography>
                    </Paper>
                </Box>

                {/* Busca */}
                <Paper sx={{ p: 3, mb: 3 }}>
                    <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                        <TextField
                            placeholder="Buscar por nome ou email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            sx={{ flex: 1 }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <FaSearch size={16} />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Box>
                </Paper>

                {/* Tabela */}
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell><strong>ID</strong></TableCell>
                                <TableCell><strong>Nome Fantasia</strong></TableCell>
                                <TableCell><strong>Email</strong></TableCell>
                                <TableCell><strong>Telefone</strong></TableCell>
                                <TableCell><strong>Exclusivo Mulheres</strong></TableCell>
                                <TableCell align="right"><strong>Ações</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">
                                        Carregando...
                                    </TableCell>
                                </TableRow>
                            ) : filteredEstabelecimentos.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">
                                        Nenhum estabelecimento encontrado
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredEstabelecimentos.map((estab) => (
                                    <TableRow key={estab.id} hover>
                                        <TableCell>{estab.id}</TableCell>
                                        <TableCell>{estab.nomeFantasia || estab.nome || "N/A"}</TableCell>
                                        <TableCell>{estab.email || "N/A"}</TableCell>
                                        <TableCell>{estab.telefone || "N/A"}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={estab.exclusivoMulheres ? "Sim" : "Não"}
                                                color={estab.exclusivoMulheres ? "secondary" : "default"}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            <IconButton size="small" color="error" onClick={() => setDeleteDialog({ open: true, estabelecimento: estab })}>
                                                <FaTrash size={14} />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>

            {/* Dialog de Confirmação de Exclusão */}
            <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, estabelecimento: null })}>
                <DialogTitle>Confirmar Exclusão</DialogTitle>
                <DialogContent>
                    <Typography>
                        Tem certeza que deseja excluir o estabelecimento <strong>{deleteDialog.estabelecimento?.nomeFantasia || deleteDialog.estabelecimento?.nome}</strong>?
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Esta ação não pode ser desfeita.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialog({ open: false, estabelecimento: null })}>Cancelar</Button>
                    <Button onClick={handleDelete} color="error" variant="contained">
                        Excluir
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AdminEstabelecimentos;

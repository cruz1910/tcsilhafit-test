import React, { useState, useEffect } from "react";
import {
    Box,
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
    Typography,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
} from "@mui/material";
import {
    FaTrash,
    FaSearch,
    FaPlus,
    FaUser,
    FaBuilding,
    FaUserTie,
    FaUserShield,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { adminService } from "../../../services";
import { useNavigate } from "react-router-dom";

const UsuariosTab = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState("todos");
    const [deleteDialog, setDeleteDialog] = useState({ open: false, user: null });

    useEffect(() => {
        loadUsers();
    }, []);

    useEffect(() => {
        filterUsers();
    }, [searchTerm, filterType, users]);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const data = await adminService.getAllUsers();
            setUsers(data);
        } catch (error) {
            console.error("Erro ao carregar usuários:", error);
            toast.error("Erro ao carregar usuários");
        } finally {
            setLoading(false);
        }
    };

    const filterUsers = () => {
        let filtered = users;

        if (filterType !== "todos") {
            filtered = filtered.filter((u) => u.tipo === filterType);
        }

        if (searchTerm) {
            filtered = filtered.filter(
                (u) =>
                    u.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredUsers(filtered);
    };

    const handleDelete = async () => {
        if (!deleteDialog.user) return;

        try {
            await adminService.deleteUser(deleteDialog.user.id, deleteDialog.user.tipo);
            toast.success("Usuário excluído com sucesso!");
            loadUsers();
            setDeleteDialog({ open: false, user: null });
        } catch (error) {
            console.error("Erro ao excluir usuário:", error);
            toast.error("Erro ao excluir usuário");
        }
    };

    const getTipoIcon = (tipo) => {
        switch (tipo) {
            case "aluno": return <FaUser size={14} />;
            case "profissional": return <FaUserTie size={14} />;
            case "estabelecimento": return <FaBuilding size={14} />;
            case "admin": return <FaUserShield size={14} />;
            default: return null;
        }
    };

    const getTipoColor = (tipo) => {
        switch (tipo) {
            case "aluno": return "primary";
            case "profissional": return "secondary";
            case "estabelecimento": return "warning";
            case "admin": return "error";
            default: return "default";
        }
    };

    const getTipoLabel = (tipo) => {
        switch (tipo) {
            case "aluno": return "Aluno";
            case "profissional": return "Profissional";
            case "estabelecimento": return "Estabelecimento";
            case "admin": return "Admin";
            default: return tipo;
        }
    };

    const stats = {
        total: users.length,
        alunos: users.filter((u) => u.tipo === "aluno").length,
        profissionais: users.filter((u) => u.tipo === "profissional").length,
        estabelecimentos: users.filter((u) => u.tipo === "estabelecimento").length,
        admins: users.filter((u) => u.tipo === "admin").length,
    };

    return (
        <Box>
            {/* Stats */}
            <Box sx={{ display: "flex", gap: 2, mb: 4, flexWrap: "wrap" }}>
                <Paper sx={{ flex: 1, p: 2, minWidth: 150 }}>
                    <Typography variant="body2" color="text.secondary">Total de Usuários</Typography>
                    <Typography variant="h4" fontWeight={700}>{stats.total}</Typography>
                </Paper>
                <Paper sx={{ flex: 1, p: 2, minWidth: 150 }}>
                    <Typography variant="body2" color="text.secondary">Alunos</Typography>
                    <Typography variant="h4" fontWeight={700} color="primary.main">{stats.alunos}</Typography>
                </Paper>
                <Paper sx={{ flex: 1, p: 2, minWidth: 150 }}>
                    <Typography variant="body2" color="text.secondary">Profissionais</Typography>
                    <Typography variant="h4" fontWeight={700} color="secondary.main">{stats.profissionais}</Typography>
                </Paper>
                <Paper sx={{ flex: 1, p: 2, minWidth: 150 }}>
                    <Typography variant="body2" color="text.secondary">Estabelecimentos</Typography>
                    <Typography variant="h4" fontWeight={700} color="warning.main">{stats.estabelecimentos}</Typography>
                </Paper>
            </Box>

            {/* Filtros e Busca */}
            <Paper sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
                    <TextField
                        placeholder="Buscar por nome ou email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        sx={{ flex: 1, minWidth: 250 }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <FaSearch size={16} />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <FormControl sx={{ minWidth: 200 }}>
                        <InputLabel>Tipo de Usuário</InputLabel>
                        <Select value={filterType} onChange={(e) => setFilterType(e.target.value)} label="Tipo de Usuário">
                            <MenuItem value="todos">Todos</MenuItem>
                            <MenuItem value="aluno">Alunos</MenuItem>
                            <MenuItem value="profissional">Profissionais</MenuItem>
                            <MenuItem value="estabelecimento">Estabelecimentos</MenuItem>
                            <MenuItem value="admin">Administradores</MenuItem>
                        </Select>
                    </FormControl>
                    <Button
                        variant="contained"
                        startIcon={<FaPlus />}
                        onClick={() => navigate("/cadastro")}
                        sx={{ textTransform: "none" }}
                    >
                        Novo Usuário
                    </Button>
                </Box>
            </Paper>

            {/* Tabela */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell><strong>ID</strong></TableCell>
                            <TableCell><strong>Tipo</strong></TableCell>
                            <TableCell><strong>Nome</strong></TableCell>
                            <TableCell><strong>Email</strong></TableCell>
                            <TableCell align="right"><strong>Ações</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center">Carregando...</TableCell>
                            </TableRow>
                        ) : filteredUsers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center">Nenhum usuário encontrado</TableCell>
                            </TableRow>
                        ) : (
                            filteredUsers.map((user) => (
                                <TableRow key={`${user.tipo}-${user.id}`} hover>
                                    <TableCell>{user.id}</TableCell>
                                    <TableCell>
                                        <Chip
                                            icon={getTipoIcon(user.tipo)}
                                            label={getTipoLabel(user.tipo)}
                                            color={getTipoColor(user.tipo)}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>{user.nome || "N/A"}</TableCell>
                                    <TableCell>{user.email || "N/A"}</TableCell>
                                    <TableCell align="right">
                                        <IconButton size="small" color="error" onClick={() => setDeleteDialog({ open: true, user })}>
                                            <FaTrash size={14} />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Dialog de Confirmação */}
            <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, user: null })}>
                <DialogTitle>Confirmar Exclusão</DialogTitle>
                <DialogContent>
                    <Typography>
                        Tem certeza que deseja excluir o usuário <strong>{deleteDialog.user?.nome}</strong>?
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Esta ação não pode ser desfeita.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialog({ open: false, user: null })}>Cancelar</Button>
                    <Button onClick={handleDelete} color="error" variant="contained">Excluir</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default UsuariosTab;

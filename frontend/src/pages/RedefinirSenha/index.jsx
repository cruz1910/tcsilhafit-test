import React, { useState } from "react";
import {
    Box,
    Typography,
    TextField,
    Button,
    Paper,
    IconButton,
    useTheme,
    InputAdornment
} from "@mui/material";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate, useSearchParams } from "react-router-dom";
import { authService } from "../../services";
import { toast } from "react-toastify";

const RedefinirSenha = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const isDark = theme.palette.mode === 'dark';

    const [senha, setSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!token) {
            toast.error("Token inválido ou ausente.");
            return;
        }

        if (!senha.trim() || !confirmarSenha.trim()) {
            toast.error("Preencha todos os campos");
            return;
        }

        if (senha !== confirmarSenha) {
            toast.error("As senhas não coincidem");
            return;
        }

        setLoading(true);
        try {
            await authService.redefinirSenha(token, senha);
            toast.success("Senha redefinida com sucesso!");
            setTimeout(() => navigate("/login"), 3000);
        } catch (error) {
            console.error("Erro ao redefinir senha:", error);
            const errorMsg = error.response?.data?.erro || "Erro ao redefinir senha";
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const inputStyles = {
        "& .MuiOutlinedInput-root": {
            bgcolor: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(16, 185, 129, 0.05)",
            borderRadius: 2,
            "& fieldset": { borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(16, 185, 129, 0.2)" },
            "&:hover fieldset": { borderColor: theme.palette.primary.main },
        },
        mb: 2
    };

    return (
        <Box sx={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "background.default",
            py: 4,
            px: 2
        }}>
            <Paper elevation={0} sx={{
                width: "100%",
                maxWidth: 500,
                p: 4,
                borderRadius: 4,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
                position: "relative"
            }}>

                <Typography variant="h5" fontWeight={800} sx={{ mb: 3, color: "text.primary", textAlign: "center" }}>
                    Nova Senha
                </Typography>

                <form onSubmit={handleSubmit}>
                    <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5, color: "text.secondary" }}>
                        Nova Senha
                    </Typography>
                    <TextField
                        fullWidth
                        name="senha"
                        type={showPassword ? "text" : "password"}
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        placeholder="••••••••"
                        sx={inputStyles}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() => setShowPassword(!showPassword)}
                                        edge="end"
                                        size="small"
                                    >
                                        {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />

                    <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5, color: "text.secondary" }}>
                        Confirmar Senha
                    </Typography>
                    <TextField
                        fullWidth
                        name="confirmarSenha"
                        type={showPassword ? "text" : "password"}
                        value={confirmarSenha}
                        onChange={(e) => setConfirmarSenha(e.target.value)}
                        placeholder="••••••••"
                        sx={inputStyles}
                    />

                    <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        disabled={loading}
                        sx={{
                            py: 1.5,
                            borderRadius: 3,
                            fontWeight: 700,
                            fontSize: "1rem",
                            textTransform: "none",
                            boxShadow: `0 8px 16px ${isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.3)'}`,
                            "&:hover": {
                                bgcolor: "primary.dark",
                                transform: "translateY(-2px)",
                                transition: "all 0.2s ease"
                            }
                        }}
                    >
                        {loading ? "Salvando..." : "Redefinir Senha"}
                    </Button>
                </form>
            </Paper>
        </Box>
    );
};

export default RedefinirSenha;

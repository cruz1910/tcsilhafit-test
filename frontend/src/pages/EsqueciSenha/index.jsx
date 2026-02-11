import React, { useState } from "react";
import {
    Box,
    Typography,
    TextField,
    Button,
    Paper,
    IconButton,
    useTheme,
} from "@mui/material";
import { FaTimes, FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { authService } from "../../services";
import { toast } from "react-toastify";

const EsqueciSenha = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const isDark = theme.palette.mode === 'dark';

    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email.trim()) {
            toast.error("Preencha o email");
            return;
        }

        setLoading(true);
        try {
            await authService.esqueciSenha(email);
            toast.success("Email de recuperação enviado! Verifique sua caixa de entrada.");
            setTimeout(() => navigate("/login"), 3000);
        } catch (error) {
            console.error("Erro ao solicitar recuperação:", error);
            const errorMsg = error.response?.data?.erro || "Erro ao processar solicitação";
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
                <IconButton
                    onClick={() => navigate("/login")}
                    sx={{ position: "absolute", top: 16, left: 16, color: "text.secondary" }}
                >
                    <FaArrowLeft size={20} />
                </IconButton>

                <Typography variant="h5" fontWeight={800} sx={{ mb: 1, color: "text.primary", textAlign: "center", mt: 2 }}>
                    Recuperar Senha
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 4, textAlign: "center" }}>
                    Digite seu email para receber um link de redefinição de senha.
                </Typography>

                <form onSubmit={handleSubmit}>
                    <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5, color: "text.secondary" }}>
                        Email
                    </Typography>
                    <TextField
                        fullWidth
                        name="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="seu@email.com"
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
                        {loading ? "Enviando..." : "Enviar Link"}
                    </Button>
                </form>
            </Paper>
        </Box>
    );
};

export default EsqueciSenha;

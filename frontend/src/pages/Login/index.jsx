import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  IconButton,
  useTheme,
  InputAdornment,
} from "@mui/material";
import { FaTimes, FaEnvelope, FaLock, FaArrowRight } from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "../../services";
import { toast } from "react-toastify";

const Login = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isLight = theme.palette.mode === 'light';

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim() || !senha.trim()) {
      toast.error("Preencha todos os campos");
      return;
    }

    setLoading(true);
    try {
      const data = await authService.login(email, senha);
      toast.success(`Bem-vindo, ${data.nome}!`);
      window.dispatchEvent(new Event('storage'));
      navigate("/");
    } catch (error) {
      console.error("Erro no login:", error);
      const errorMsg = error.response?.data?.erro || "Credenciais inválidas";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      py: 10,
      px: 2,
      bgcolor: "background.default"
    }}>
      <Paper elevation={0} sx={{
        width: "100%",
        maxWidth: 450,
        p: { xs: 4, sm: 6 },
        borderRadius: 4,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        position: "relative"
      }}>
        <IconButton
          onClick={() => navigate("/")}
          sx={{ position: "absolute", top: 16, right: 16 }}
        >
          <FaTimes size={18} />
        </IconButton>

        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" fontWeight={900} gutterBottom>
            Entrar no <span style={{ color: "#10B981" }}>IlhaFit</span>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Acesse sua conta para continuar
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FaEnvelope size={14} opacity={0.5} />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            label="Senha"
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            margin="normal"
            sx={{ mb: 4 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FaLock size={14} opacity={0.5} />
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            sx={{
              py: 1.5,
              borderRadius: 2,
              fontWeight: 700,
              textTransform: "none",
              bgcolor: "#10B981",
              "&:hover": { bgcolor: "#0D9488" }
            }}
          >
            {loading ? "Entrando..." : "Entrar"}
          </Button>

          <Box sx={{ mt: 3, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              Não tem uma conta?{" "}
              <Link to="/cadastro" style={{ color: "#10B981", fontWeight: 700, textDecoration: 'none' }}>
                Cadastre-se
              </Link>
            </Typography>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default Login;

import { Button, FormControl, FormLabel, Input, Typography, Box, useTheme } from "@mui/material";
import { Link } from "react-router-dom";

const FormLogin = ({ email, setEmail, senha, setSenha, login, onClose }) => {
  const theme = useTheme();
  return (
    <>
      <FormControl fullWidth required sx={{ mb: 3 }}>
        <FormLabel color="primary">Email</FormLabel>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Digite seu email"
        />
      </FormControl>

      <FormControl fullWidth required sx={{ mb: 3 }}>
        <FormLabel color="primary">Senha</FormLabel>
        <Input
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          placeholder="Digite sua senha"
        />
      </FormControl>

      <Button
        fullWidth
        variant="contained"
        onClick={login}
        sx={{
          mt: 2,
          py: 1.5,
          bgcolor: "primary.main",
          "&:hover": {
            bgcolor: "custom.primaryHover",
          },
        }}
      >
        Logar
      </Button>

      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Não tem uma conta?{" "}
          <Link
            to="/cadastro"
            onClick={onClose}
            style={{
              color: theme.palette.primary.main,
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Cadastre-se agora
          </Link>
        </Typography>
      </Box>
    </>
  );
};

export default FormLogin;

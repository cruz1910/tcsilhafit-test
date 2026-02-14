import { useState, useEffect } from "react";
import {
  AppBar,
  Container,
  Toolbar,
  Typography,
  ListItemButton,
  Box,
  Avatar,
  Menu as MuiMenu,
  MenuItem,
  ListItemIcon,
  Divider,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import Menu from "./Menu";
import LoginButton from "./AuthButtons/Login";
import CadastroButton from "./AuthButtons/Cadastro";
import ToggleThemeButton from "../ToggleThemeButton";
import { authService } from "../../services";
import { FaUserCircle, FaSignOutAlt, FaCog, FaUserShield } from "react-icons/fa";
import { useTheme, alpha } from "@mui/material/styles";


const NavBar = () => {
  const [user, setUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    const checkUser = () => {
      setUser(authService.getUserInfo());
    };
    checkUser();
    window.addEventListener('storage', checkUser);
    return () => window.removeEventListener('storage', checkUser);
  }, []);

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setAnchorEl(null);
    navigate("/");
  };

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  return (
    <AppBar elevation={1} color="default" sx={{ bgcolor: 'background.paper' }}>
      <Container maxWidth="xl">
        <Toolbar sx={{ py: 1 }}>
          {/* Logo e Nome */}
          <Box
            component={Link}
            to="/"
            sx={{
              display: "flex",
              alignItems: "center",
              textDecoration: 'none',
              color: 'inherit',
              '&:hover': { opacity: 0.8 }
            }}
          >
            <Box
              component="img"
              src="src/assets/logo.svg"
              alt="Logo IlhaFit"
              sx={{ width: 48, borderRadius: theme.shape.borderRadius / 4, mr: 3 }}
            />
            <Box>
              <Typography variant="h6" fontWeight={900} lineHeight={1.1}>
                IlhaFit
              </Typography>
              <Typography variant="caption" sx={{ color: "primary.main", fontWeight: 700 }}>
                Seu bem-estar começa aqui
              </Typography>
            </Box>
          </Box>

          {/* Menu Central */}
          <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center" }}>
            <Menu />
          </Box>

          {/* Lado Direito: Tema e Usuário */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <ToggleThemeButton />

            {user ? (
              <>
                <Box
                  onClick={handleMenuOpen}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    cursor: 'pointer',
                    ml: 2,
                    p: 0.5,
                    pr: 1.5,
                    borderRadius: 10,
                    '&:hover': { bgcolor: theme.palette.action.hover }
                  }}
                >
                  <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 32, height: 32 }}>
                    {user.nome?.charAt(0).toUpperCase() || "U"}
                  </Avatar>
                  <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                    <Typography variant="subtitle2" fontWeight={700} sx={{ lineHeight: 1 }}>
                      {user.nome?.split(' ')[0] || "Usuário"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {user.role}
                    </Typography>
                  </Box>
                </Box>

                <MuiMenu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                  PaperProps={{
                    sx: {
                      mt: 1.5,
                      borderRadius: theme.shape.borderRadius >= 8 ? 3 : 2,
                      minWidth: 180,
                      boxShadow: theme.shadows[3]
                    }
                  }}
                >
                  {user.role === 'ADMIN' && (
                    <MenuItem component={Link} to="/admin" onClick={handleMenuClose}>
                      <ListItemIcon><FaUserShield size={18} /></ListItemIcon>
                      Painel Admin
                    </MenuItem>
                  )}
                  <MenuItem component={Link} to="/perfil" onClick={handleMenuClose}>
                    <ListItemIcon><FaCog size={18} /></ListItemIcon>
                    Configurações
                  </MenuItem>
                  <Divider sx={{ my: 1 }} />
                  <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                    <ListItemIcon><FaSignOutAlt size={18} color="inherit" /></ListItemIcon>
                    Sair
                  </MenuItem>
                </MuiMenu>
              </>
            ) : (
              <Box sx={{ display: 'flex', gap: 1.5, ml: 2 }}>
                <LoginButton onClick={() => navigate("/login")} />
                <CadastroButton onClick={() => navigate("/cadastro")} />
              </Box>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default NavBar;

import { Box, List, ListItem, ListItemButton, ListItemText } from "@mui/material";
import { Link } from "react-router-dom";
import { authService } from "../../../services";
import { useState, useEffect } from "react";

const Menu = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkUser = () => {
      setUser(authService.getUserInfo());
    };
    checkUser();
    window.addEventListener('storage', checkUser);
    return () => window.removeEventListener('storage', checkUser);
  }, []);

  const links = [
    { name: "Estabelecimento", path: "/estabelecimento" },
    { name: "Profissional", path: "/profissional" },
    { name: "Mapa", path: "/mapa" },
    ...(user?.role === 'ADMIN' ? [{ name: "Admin", path: "/admin" }] : []),
  ];

  return (
    <Box sx={{ display: { xs: "none", md: "flex" } }}>
      <List sx={{ display: "flex" }}>
        {links.map((link) => (
          <ListItem key={link.path} disablePadding>
            <ListItemButton
              component={Link}
              to={link.path}
              sx={{
                color: "text.primary",
                "&:hover": {
                  color: "primary.main",
                  bgcolor: "action.hover",
                  borderRadius: "12px",
                },
              }}
            >
              <ListItemText primary={link.name} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default Menu;

import {
  Card,
  CardContent,
  Typography,
  Box,
  CardMedia,
  Chip,
  Divider,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { CiTimer } from "react-icons/ci";
import { FaArrowRight, FaStar, FaWhatsapp, FaInstagram, FaFacebook, FaGlobe } from "react-icons/fa";
import { IconButton, Tooltip } from "@mui/material";

const PLACEHOLDER_IMG = "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop";

const CardEstabelecimento = ({ estabelecimento, onClickDetail }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  return (
    <Card
      onClick={() => onClickDetail && onClickDetail(estabelecimento)}
      sx={{
        width: "100%",
        maxWidth: 450,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 4,
        boxShadow: 3,
        transition: "all 0.3s ease",
        border: "1px solid",
        borderColor: isDark ? 'divider' : 'transparent',
        bgcolor: 'background.paper',
        cursor: "pointer",

        "&:hover": {
          boxShadow: 6,
          transform: "translateY(-4px)",
          borderColor: "primary.main",
        },
      }}
    >
      <Box sx={{ position: "relative" }}>
        <CardMedia
          component="img"
          height="240"
          image={estabelecimento.Imagem || (estabelecimento.fotosUrl && estabelecimento.fotosUrl.length > 0 ? estabelecimento.fotosUrl[0] : PLACEHOLDER_IMG)}
          alt="Estabelecimento"
          sx={{ objectFit: 'cover' }}
        />
        <Box
          sx={{
            position: "absolute",
            top: 15,
            right: 15,
            bgcolor: 'background.paper',
            display: "flex",
            alignItems: "center",
            gap: "4px",
            px: 1,
            py: "2px",
            borderRadius: 1.5,
            boxShadow: 2,
          }}
        >
          <FaStar size={14} color="#FBBF24" />
          <Typography
            variant="caption"
            sx={{ color: 'text.primary', fontWeight: 600 }}
          >
            {estabelecimento.avaliacao}
          </Typography>
        </Box>
      </Box>

      <CardContent
        sx={{
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
        }}
      >
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1 }}>
          {estabelecimento.categorias?.map((cat) => (
            <Chip
              key={cat}
              label={cat}
              size="small"
              sx={{
                bgcolor: alpha(theme.palette.primary.main, isDark ? 0.2 : 0.12),
                color: 'primary.main',
                fontWeight: 500,
              }}
            />
          ))}
        </Box>
        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5 }}>
          {estabelecimento.nomeFantasia || estabelecimento.nome}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 1.5,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {estabelecimento.descricao}
        </Typography>

        {/* Contatos - Exibição Condicional */}
        {(estabelecimento.telefone || estabelecimento.instagram || estabelecimento.facebook || estabelecimento.website) && (
          <Box sx={{ display: "flex", gap: 0.5, mb: 1.5 }}>
            {estabelecimento.telefone && (
              <Tooltip title="WhatsApp">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    const phone = estabelecimento.telefone.replace(/\D/g, '');
                    window.open(`https://wa.me/${phone}`, '_blank');
                  }}
                  sx={{ bgcolor: alpha('#25D366', 0.1), color: '#25D366', '&:hover': { bgcolor: alpha('#25D366', 0.2) }, width: 32, height: 32 }}
                >
                  <FaWhatsapp size={14} />
                </IconButton>
              </Tooltip>
            )}
            {estabelecimento.instagram && (
              <Tooltip title="Instagram">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    const handle = estabelecimento.instagram.replace('@', '');
                    window.open(`https://instagram.com/${handle}`, '_blank');
                  }}
                  sx={{ bgcolor: alpha('#E4405F', 0.1), color: '#E4405F', '&:hover': { bgcolor: alpha('#E4405F', 0.2) }, width: 32, height: 32 }}
                >
                  <FaInstagram size={14} />
                </IconButton>
              </Tooltip>
            )}
            {estabelecimento.facebook && (
              <Tooltip title="Facebook">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    const url = estabelecimento.facebook.startsWith('http') ? estabelecimento.facebook : `https://facebook.com/${estabelecimento.facebook}`;
                    window.open(url, '_blank');
                  }}
                  sx={{ bgcolor: alpha('#1877F2', 0.1), color: '#1877F2', '&:hover': { bgcolor: alpha('#1877F2', 0.2) }, width: 32, height: 32 }}
                >
                  <FaFacebook size={14} />
                </IconButton>
              </Tooltip>
            )}
            {estabelecimento.website && (
              <Tooltip title="Website">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    const url = estabelecimento.website.startsWith('http') ? estabelecimento.website : `https://${estabelecimento.website}`;
                    window.open(url, '_blank');
                  }}
                  sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }, width: 32, height: 32 }}
                >
                  <FaGlobe size={14} />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        )}

        <Divider sx={{ mb: 1.5 }} />
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <CiTimer size={18} color={theme.palette.text.secondary} />
            <Typography
              variant="caption"
              sx={{ color: "text.secondary", fontWeight: 500 }}
            >
              {estabelecimento.aberto ? "Aberto agora" : "Fechado"}
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              color: "primary.main",
              fontSize: 14,
              fontWeight: 500,
              "&:hover": {
                textDecoration: "underline",
              },
            }}
          >
            Ver detalhes
            <FaArrowRight size={14} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CardEstabelecimento;

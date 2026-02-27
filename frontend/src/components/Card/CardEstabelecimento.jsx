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
import { FaArrowRight, FaStar } from "react-icons/fa";

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
          image={estabelecimento.Imagem || (estabelecimento.fotosUrl && estabelecimento.fotosUrl.length > 0 ? estabelecimento.fotosUrl[0] : "")}
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
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2,
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {estabelecimento.descricao}
        </Typography>
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

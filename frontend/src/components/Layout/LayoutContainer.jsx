import { Container } from "@mui/material";

const LayoutContainer = ({ children, maxWidth = "xl" }) => {
  return (
    <Container
      maxWidth={maxWidth}
      sx={{
        px: { xs: 2, sm: 3, md: 4 },
      }}
    >
      {children}
    </Container>
  );
};

export default LayoutContainer;

import React from "react";
import { Button } from "@mui/material";

const Entrar = React.forwardRef((props, ref) => {
  return (
    <Button
      ref={ref}
      variant="contained"
      {...props}
      sx={{
        ml: 2,
        height: 40,
        px: 3,
        borderRadius: "12px",
        bgcolor: "primary.main",
        color: "primary.contrastText",
        textTransform: "none",
        fontWeight: 700,
        "&:hover": {
          bgcolor: "#10B981",
          opacity: 0.9
        },
        ...props.sx
      }}
    >
      Entrar
    </Button>
  );
});

Entrar.displayName = 'Entrar';

export default Entrar;

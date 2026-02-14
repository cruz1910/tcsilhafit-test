import { Box } from "@mui/material";
import LayoutContainer from "./LayoutContainer";

const AppLayout = ({ children, ...props }) => {
  return (
    <Box sx={{ bgcolor: "background.default", flex: 1 }}>
      <LayoutContainer {...props}>
        <Box sx={{ pt: 14 }}>
          {children}
        </Box>
      </LayoutContainer>
    </Box>
  );
};

export default AppLayout;

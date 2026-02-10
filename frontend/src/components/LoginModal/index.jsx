import { Modal, Box, IconButton } from "@mui/material";
import { IoCloseCircleOutline } from "react-icons/io5";
import FormLogin from "../FormLogin";

const LoginModal = ({ open, onClose, email, setEmail, senha, setSenha, login }) => {
  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          bgcolor: "background.paper",
          color: "text.primary",
          borderRadius: 4,
          boxShadow: 24,
          width: { xs: "95%", sm: 500 },
          p: 4,
          outline: "none",
        }}
      >
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", top: 12, right: 12 }}
        >
          <IoCloseCircleOutline size={22} />
        </IconButton>

        <FormLogin
          email={email}
          setEmail={setEmail}
          senha={senha}
          setSenha={setSenha}
          login={login}
          onClose={onClose}
        />
      </Box>
    </Modal>
  );
};

export default LoginModal;

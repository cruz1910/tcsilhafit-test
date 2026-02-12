import React, { useEffect, useState } from "react";
import {
    Box,
    Typography,
    Paper,
    Button
} from "@mui/material";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../services/api";

const ConfirmarEmail = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const navigate = useNavigate();
    const [status, setStatus] = useState("verificando"); 

    useEffect(() => {
        if (token) {
            confirmar(token);
        } else {
            setStatus("erro");
        }
    }, [token]);

    const confirmar = async (token) => {
        try {
            await api.post('/autenticacao/confirmar-email', { token });
            setStatus("sucesso");
            toast.success("Email confirmado com sucesso!");
        } catch (error) {
            console.error("Erro ao confirmar:", error);
            setStatus("erro");
        }
    };

    return (
        <Box sx={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "background.default",
            p: 2
        }}>
            <Paper elevation={0} sx={{
                p: 4,
                borderRadius: 4,
                border: "1px solid",
                borderColor: "divider",
                maxWidth: 400,
                width: "100%",
                textAlign: "center"
            }}>
                {status === "verificando" && (
                    <Typography>Verificando seu email...</Typography>
                )}

                {status === "sucesso" && (
                    <>
                        <Typography variant="h5" color="success.main" gutterBottom fontWeight={700}>
                            Email Confirmado!
                        </Typography>
                        <Typography color="text.secondary" sx={{ mb: 3 }}>
                            Sua conta foi verificada com sucesso.
                        </Typography>
                        <Button variant="contained" onClick={() => navigate("/login")}>
                            Ir para Login
                        </Button>
                    </>
                )}

                {status === "erro" && (
                    <>
                        <Typography variant="h5" color="error.main" gutterBottom fontWeight={700}>
                            Falha na Verificação
                        </Typography>
                        <Typography color="text.secondary" sx={{ mb: 3 }}>
                            O link é inválido ou expirou.
                        </Typography>
                        <Button variant="outlined" onClick={() => navigate("/login")}>
                            Voltar ao Login
                        </Button>
                    </>
                )}
            </Paper>
        </Box>
    );
};

export default ConfirmarEmail;

import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import { FaStar } from "react-icons/fa";

const AvaliacoesTab = () => {
    return (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", py: 8 }}>
            <Paper sx={{ p: 4, textAlign: "center", maxWidth: 500 }}>
                <FaStar size={48} color="#FFB400" style={{ marginBottom: 16 }} />
                <Typography variant="h5" gutterBottom fontWeight={700}>
                    Avaliações
                </Typography>
                <Typography color="text.secondary">
                    O módulo de gerenciamento de avaliações está em desenvolvimento.
                    <br />
                    Em breve você poderá moderar e visualizar as avaliações do sistema aqui.
                </Typography>
            </Paper>
        </Box>
    );
};

export default AvaliacoesTab;

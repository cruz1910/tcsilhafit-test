import React, { useState, useEffect } from "react";
import {
    Box,
    Typography,
    Tabs,
    Tab,
    useTheme,
    Paper,
} from "@mui/material";
import {
    FaUsers,
    FaStore,
    FaStar,
    FaChartLine,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { authService } from "../../services";
import { useNavigate } from "react-router-dom";

import UsuariosTab from "./Tabs/UsuariosTab";
import EstabelecimentosTab from "./Tabs/EstabelecimentosTab";
import AvaliacoesTab from "./Tabs/AvaliacoesTab";
import DashboardTab from "./Tabs/DashboardTab";

function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`admin-tabpanel-${index}`}
            aria-labelledby={`admin-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ py: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

const Admin = () => {
    const navigate = useNavigate();
    const [tabValue, setTabValue] = useState(0);

    useEffect(() => {
        // Verificação de admin removida temporariamente para visualização
        /*
        const userInfo = authService.getUserInfo();
        if (!userInfo || userInfo.role !== "ADMIN") {
            toast.error("Acesso negado! Apenas administradores podem acessar esta página.");
            navigate("/");
            return;
        }
        */
    }, [navigate]);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    return (
        <Box sx={{ minHeight: "100vh", bgcolor: "background.default", py: 4, px: 2 }}>
            <Box sx={{ maxWidth: 1400, mx: "auto" }}>
                {/* Header */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" fontWeight={800} color="text.primary" gutterBottom>
                        Painel de Administração
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Gerencie usuários, estabelecimentos e avaliações do sistema.
                    </Typography>
                </Box>

                {/* Tabs */}
                <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
                    <Tabs
                        value={tabValue}
                        onChange={handleTabChange}
                        aria-label="admin tabs"
                        variant="scrollable"
                        scrollButtons="auto"
                    >
                        <Tab
                            icon={<FaStore />}
                            iconPosition="start"
                            label="Visão Geral"
                            id="admin-tab-0"
                        />
                        <Tab
                            icon={<FaUsers />}
                            iconPosition="start"
                            label="Usuários"
                            id="admin-tab-1"
                        />
                        <Tab
                            icon={<FaStore />}
                            iconPosition="start"
                            label="Estabelecimentos"
                            id="admin-tab-2"
                        />
                        <Tab
                            icon={<FaStar />}
                            iconPosition="start"
                            label="Avaliações"
                            id="admin-tab-3"
                        />
                    </Tabs>
                </Box>

                <TabPanel value={tabValue} index={0}>
                    <DashboardTab />
                </TabPanel>
                <TabPanel value={tabValue} index={1}>
                    <UsuariosTab />
                </TabPanel>
                <TabPanel value={tabValue} index={2}>
                    <EstabelecimentosTab />
                </TabPanel>
                <TabPanel value={tabValue} index={3}>
                    <AvaliacoesTab />
                </TabPanel>
            </Box>
        </Box>
    );
};

export default Admin;

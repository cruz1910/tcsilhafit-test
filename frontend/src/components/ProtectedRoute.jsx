import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authService } from '../services';

const ProtectedRoute = ({ children, adminOnly = false }) => {
    const location = useLocation();
    const [checking, setChecking] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);
    const userInfo = authService.getUserInfo();

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');

            if (!token) {
                setAuthenticated(false);
                setChecking(false);
                return;
            }

            // Se o token ainda é válido, ok
            if (!authService.isTokenExpired(token)) {
                setAuthenticated(true);
                setChecking(false);
                return;
            }

            // Token expirado, tenta renovar via refresh token
            try {
                await authService.refresh();
                setAuthenticated(true);
            } catch {
                setAuthenticated(false);
            } finally {
                setChecking(false);
            }
        };

        checkAuth();
    }, [location.pathname]);

    if (checking) {
        return null;
    }

    if (!authenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (adminOnly && userInfo?.role !== 'ADMIN') {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;

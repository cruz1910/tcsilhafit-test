import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authService } from '../services';

const ProtectedRoute = ({ children, adminOnly = false }) => {
    const location = useLocation();
    const isAuthenticated = authService.isAuthenticated();
    const userInfo = authService.getUserInfo();

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (adminOnly && userInfo?.role !== 'ADMIN') {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;

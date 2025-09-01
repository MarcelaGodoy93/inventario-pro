import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Box, Typography, Paper } from '@mui/material';
import LoadingSpinner from '../common/LoadingSpinner';

const ProtectedRoute = ({ children, roles = [] }) => {
  const { user, loading, hasPermission } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles.length > 0 && !hasPermission(roles)) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" color="error" gutterBottom>
            Acceso Denegado
          </Typography>
          <Typography variant="body1" color="textSecondary">
            No tienes permisos para acceder a esta página
          </Typography>
        </Paper>
      </Box>
    );
  }

  return children;
};

export default ProtectedRoute;

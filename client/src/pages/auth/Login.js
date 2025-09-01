import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Business
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { showSuccess, showError } = useNotification();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.email || !formData.password) {
      setError('Por favor completa todos los campos');
      setLoading(false);
      return;
    }

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      showSuccess('¡Bienvenido al sistema!');
      navigate('/dashboard');
    } else {
      setError(result.message);
      showError(result.message);
    }
    
    setLoading(false);
  };

  const demoUsers = [
    { email: 'admin@inventario.com', password: 'admin123', role: 'Administrador' },
    { email: 'gerente@inventario.com', password: 'gerente123', role: 'Gerente' },
    { email: 'empleado@inventario.com', password: 'empleado123', role: 'Empleado' }
  ];

  const handleDemoLogin = (email, password) => {
    setFormData({ email, password });
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2
      }}
    >
      <Card
        sx={{
          maxWidth: 400,
          width: '100%',
          borderRadius: 3,
          boxShadow: '0 20px 60px rgba(0,0,0,0.1)'
        }}
      >
        <CardContent sx={{ p: 4 }}>
          {/* Logo y título */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Business sx={{ fontSize: 48, color: '#1976d2', mb: 1 }} />
            <Typography variant="h4" component="h1" sx={{ fontWeight: 700, color: '#1976d2' }}>
              InventarioPro
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Sistema Profesional de Inventario
            </Typography>
          </Box>

          {/* Error alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              name="email"
              label="Correo Electrónico"
              type="email"
              value={formData.email}
              onChange={handleChange}
              margin="normal"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              name="password"
              label="Contraseña"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              margin="normal"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ 
                mt: 3, 
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 600
              }}
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </form>

          {/* Demo users */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2, textAlign: 'center' }}>
              Usuarios de demostración:
            </Typography>
            {demoUsers.map((user, index) => (
              <Button
                key={index}
                fullWidth
                variant="outlined"
                size="small"
                onClick={() => handleDemoLogin(user.email, user.password)}
                sx={{ 
                  mb: 1, 
                  justifyContent: 'flex-start',
                  textTransform: 'none'
                }}
              >
                <Box sx={{ textAlign: 'left' }}>
                  <Typography variant="caption" display="block">
                    {user.role}
                  </Typography>
                  <Typography variant="body2">
                    {user.email}
                  </Typography>
                </Box>
              </Button>
            ))}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;

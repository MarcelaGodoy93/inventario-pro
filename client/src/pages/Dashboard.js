import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Avatar,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress
} from '@mui/material';
import {
  TrendingUp,
  Inventory,
  People,
  Warning,
  AttachMoney,
  Refresh
} from '@mui/icons-material';
import { Doughnut, Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement
} from 'chart.js';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import axios from 'axios';

// Registrar componentes de Chart.js
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement
);

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    overview: {
      totalProducts: 0,
      lowStockProducts: 0,
      totalUsers: 0,
      recentMovements: 0,
      inventoryValue: 0
    },
    topProducts: [],
    categoryStats: []
  });
  const [recentProducts, setRecentProducts] = useState([]);

  const { user } = useAuth();
  const { showError } = useNotification();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Cargar estadísticas del dashboard
      const dashboardResponse = await axios.get('/reports/dashboard');
      setDashboardData(dashboardResponse.data);

      // Cargar productos recientes
      const productsResponse = await axios.get('/products?limit=5&page=1');
      setRecentProducts(productsResponse.data.docs || []);

    } catch (error) {
      console.error('Error loading dashboard:', error);
      showError('Error al cargar el dashboard');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(value);
  };

  // Datos para gráfico de categorías
  const categoryChartData = {
    labels: dashboardData.categoryStats.map(cat => cat.category?.name || 'Sin categoría'),
    datasets: [
      {
        data: dashboardData.categoryStats.map(cat => cat.count),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40'
        ],
        borderWidth: 0
      }
    ]
  };

  // Datos simulados para gráfico de ventas
  const salesChartData = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Ventas',
        data: [12, 19, 3, 5, 2, 3],
        borderColor: '#1976d2',
        backgroundColor: 'rgba(25, 118, 210, 0.1)',
        tension: 0.4
      }
    ]
  };

  // Componente de tarjeta de estadística
  const StatCard = ({ title, value, icon, color, subtitle, trend }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="h2" sx={{ fontWeight: 700 }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography color="textSecondary" variant="body2">
                {subtitle}
              </Typography>
            )}
            {trend && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <TrendingUp sx={{ fontSize: 16, color: 'success.main', mr: 0.5 }} />
                <Typography variant="caption" color="success.main">
                  {trend}
                </Typography>
              </Box>
            )}
          </Box>
          <Avatar sx={{ bgcolor: color, width: 56, height: 56 }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>Dashboard</Typography>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            ¡Bienvenido, {user?.name}! 👋
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Aquí tienes un resumen de tu inventario
          </Typography>
        </Box>
        <IconButton onClick={loadDashboardData} color="primary">
          <Refresh />
        </IconButton>
      </Box>

      <Grid container spacing={3}>
        {/* Tarjetas de estadísticas */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Productos"
            value={dashboardData.overview.totalProducts}
            icon={<Inventory />}
            color="#1976d2"
            trend="+12% este mes"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Valor Inventario"
            value={formatCurrency(dashboardData.overview.inventoryValue)}
            icon={<AttachMoney />}
            color="#2e7d32"
            trend="+8% este mes"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Stock Bajo"
            value={dashboardData.overview.lowStockProducts}
            icon={<Warning />}
            color="#ed6c02"
            subtitle="Requieren atención"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Usuarios Activos"
            value={dashboardData.overview.totalUsers}
            icon={<People />}
            color="#9c27b0"
            trend="+2 este mes"
          />
        </Grid>

        {/* Gráficos */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Tendencia de Ventas
            </Typography>
            <Box sx={{ height: 300 }}>
              <Line 
                data={salesChartData} 
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false }
                  }
                }} 
              />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Productos por Categoría
            </Typography>
            <Box sx={{ height: 300 }}>
              <Doughnut 
                data={categoryChartData} 
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: false 
                }} 
              />
            </Box>
          </Paper>
        </Grid>

        {/* Productos recientes */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Productos Agregados Recientemente
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Producto</TableCell>
                    <TableCell>SKU</TableCell>
                    <TableCell>Categoría</TableCell>
                    <TableCell>Stock</TableCell>
                    <TableCell>Precio</TableCell>
                    <TableCell>Estado</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentProducts.map((product) => (
                    <TableRow key={product._id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {product.name}
                        </Typography>
                      </TableCell>
                      <TableCell>{product.sku}</TableCell>
                      <TableCell>
                        <Chip 
                          label={product.category?.name || 'Sin categoría'} 
                          size="small"
                          sx={{ 
                            bgcolor: product.category?.color || '#e0e0e0',
                            color: 'white'
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography 
                          color={product.quantity <= product.minStock ? 'error' : 'textPrimary'}
                        >
                          {product.quantity}
                        </Typography>
                      </TableCell>
                      <TableCell>{formatCurrency(product.price)}</TableCell>
                      <TableCell>
                        <Chip 
                          label={product.status === 'active' ? 'Activo' : 'Inactivo'}
                          color={product.status === 'active' ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;

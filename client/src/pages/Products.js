import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Fab
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Search,
  FilterList,
  Visibility
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import axios from 'axios';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalProducts, setTotalProducts] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    sku: '',
    category: '',
    price: '',
    cost: '',
    quantity: '',
    minStock: '',
    unit: 'piezas'
  });

  const { user, isManager } = useAuth();
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, [page, rowsPerPage, searchTerm, filterCategory]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        search: searchTerm,
        category: filterCategory
      };

      const response = await axios.get('/products', { params });
      setProducts(response.data.docs || []);
      setTotalProducts(response.data.total || 0);
    } catch (error) {
      console.error('Error loading products:', error);
      showError('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await axios.get('/categories');
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleOpenDialog = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        name: product.name || '',
        description: product.description || '',
        sku: product.sku || '',
        category: product.category?._id || '',
        price: product.price || '',
        cost: product.cost || '',
        quantity: product.quantity || '',
        minStock: product.minStock || '',
        unit: product.unit || 'piezas'
      });
    } else {
      setEditingProduct(null);
      setProductForm({
        name: '',
        description: '',
        sku: '',
        category: '',
        price: '',
        cost: '',
        quantity: '',
        minStock: '',
        unit: 'piezas'
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingProduct(null);
    setProductForm({
      name: '',
      description: '',
      sku: '',
      category: '',
      price: '',
      cost: '',
      quantity: '',
      minStock: '',
      unit: 'piezas'
    });
  };

  const handleFormChange = (e) => {
    setProductForm({
      ...productForm,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async () => {
    try {
      if (!productForm.name || !productForm.category || !productForm.price) {
        showError('Por favor completa los campos obligatorios');
        return;
      }

      const productData = {
        ...productForm,
        price: parseFloat(productForm.price),
        cost: parseFloat(productForm.cost || 0),
        quantity: parseInt(productForm.quantity || 0),
        minStock: parseInt(productForm.minStock || 5)
      };

      if (editingProduct) {
        await axios.put(`/products/${editingProduct._id}`, productData);
        showSuccess('Producto actualizado correctamente');
      } else {
        await axios.post('/products', productData);
        showSuccess('Producto creado correctamente');
      }

      handleCloseDialog();
      loadProducts();
    } catch (error) {
      const message = error.response?.data?.message || 'Error al guardar producto';
      showError(message);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('¿Estás seguro de eliminar este producto?')) return;

    try {
      await axios.delete(`/products/${productId}`);
      showSuccess('Producto eliminado correctamente');
      loadProducts();
    } catch (error) {
      const message = error.response?.data?.message || 'Error al eliminar producto';
      showError(message);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(value);
  };

  const getStockStatus = (quantity, minStock) => {
    if (quantity <= 0) return { label: 'Agotado', color: 'error' };
    if (quantity <= minStock) return { label: 'Stock Bajo', color: 'warning' };
    return { label: 'Disponible', color: 'success' };
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Gestión de Productos
        </Typography>
        {isManager && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
            sx={{ borderRadius: 2 }}
          >
            Nuevo Producto
          </Button>
        )}
      </Box>

      {/* Filtros */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel>Categoría</InputLabel>
              <Select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                label="Categoría"
              >
                <MenuItem value="">Todas las categorías</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category._id} value={category._id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button
              variant="outlined"
              startIcon={<FilterList />}
              onClick={() => {
                setSearchTerm('');
                setFilterCategory('');
              }}
            >
              Limpiar
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabla de productos */}
      <Paper>
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
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((product) => {
                const stockStatus = getStockStatus(product.quantity, product.minStock);
                return (
                  <TableRow key={product._id}>
                    <TableCell>
                      <Box>
                        <Typography variant="body1" fontWeight={500}>
                          {product.name}
                        </Typography>
                        {product.description && (
                          <Typography variant="caption" color="textSecondary">
                            {product.description}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>{product.sku}</TableCell>
                    <TableCell>
                      {product.category && (
                        <Chip
                          label={product.category.name}
                          size="small"
                          sx={{
                            bgcolor: product.category.color || '#e0e0e0',
                            color: 'white'
                          }}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography>{product.quantity}</Typography>
                        <Chip
                          label={stockStatus.label}
                          color={stockStatus.color}
                          size="small"
                        />
                      </Box>
                    </TableCell>
                    <TableCell>{formatCurrency(product.price)}</TableCell>
                    <TableCell>
                      <Chip
                        label={product.status === 'active' ? 'Activo' : 'Inactivo'}
                        color={product.status === 'active' ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" color="primary">
                        <Visibility />
                      </IconButton>
                      {isManager && (
                        <>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleOpenDialog(product)}
                          >
                            <Edit />
                          </IconButton>
                          {user?.role === 'admin' && (
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDelete(product._id)}
                            >
                              <Delete />
                            </IconButton>
                          )}
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalProducts}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Paper>

      {/* Dialog para crear/editar producto */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="name"
                label="Nombre del Producto *"
                value={productForm.name}
                onChange={handleFormChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="sku"
                label="SKU"
                value={productForm.sku}
                onChange={handleFormChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="description"
                label="Descripción"
                multiline
                rows={2}
                value={productForm.description}
                onChange={handleFormChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Categoría *</InputLabel>
                <Select
                  name="category"
                  value={productForm.category}
                  onChange={handleFormChange}
                  label="Categoría *"
                >
                  {categories.map((category) => (
                    <MenuItem key={category._id} value={category._id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Unidad</InputLabel>
                <Select
                  name="unit"
                  value={productForm.unit}
                  onChange={handleFormChange}
                  label="Unidad"
                >
                  <MenuItem value="piezas">Piezas</MenuItem>
                  <MenuItem value="kg">Kilogramos</MenuItem>
                  <MenuItem value="litros">Litros</MenuItem>
                  <MenuItem value="metros">Metros</MenuItem>
                  <MenuItem value="cajas">Cajas</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                name="price"
                label="Precio (CLP) *"
                type="number"
                value={productForm.price}
                onChange={handleFormChange}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                name="cost"
                label="Costo (CLP)"
                type="number"
                value={productForm.cost}
                onChange={handleFormChange}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                name="quantity"
                label="Cantidad Inicial"
                type="number"
                value={productForm.quantity}
                onChange={handleFormChange}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                name="minStock"
                label="Stock Mínimo"
                type="number"
                value={productForm.minStock}
                onChange={handleFormChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingProduct ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* FAB para móvil */}
      {isManager && (
        <Fab
          color="primary"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            display: { xs: 'flex', sm: 'none' }
          }}
          onClick={() => handleOpenDialog()}
        >
          <Add />
        </Fab>
      )}
    </Box>
  );
};

export default Products;

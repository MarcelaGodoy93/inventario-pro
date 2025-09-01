const express = require('express');
const { body, validationResult } = require('express-validator');
const Product = require('../models/Product');
const Movement = require('../models/Movement');
const auth = require('../middleware/auth');
const { checkRole, managerOrAdmin } = require('../middleware/roles');

const router = express.Router();

// @route   GET /api/products
// @desc    Obtener todos los productos con filtros
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      status = 'active',
      lowStock
    } = req.query;

    const query = { status };

    // Filtro por búsqueda
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Filtro por categoría
    if (category) {
      query.category = category;
    }

    // Filtro por stock bajo
    if (lowStock === 'true') {
      query.$expr = { $lte: ['$quantity', '$minStock'] };
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      populate: [
        { path: 'category', select: 'name color' },
        { path: 'createdBy', select: 'name' },
        { path: 'updatedBy', select: 'name' }
      ],
      sort: { createdAt: -1 }
    };

    const products = await Product.paginate(query, options);
    
    res.json(products);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Error del servidor');
  }
});

// @route   GET /api/products/:id
// @desc    Obtener producto por ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name color')
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name');

    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.json(product);
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    res.status(500).send('Error del servidor');
  }
});

// @route   POST /api/products
// @desc    Crear nuevo producto
// @access  Private (Manager/Admin)
router.post('/', [
  auth,
  managerOrAdmin,
  body('name', 'El nombre es obligatorio').not().isEmpty(),
  body('category', 'La categoría es obligatoria').not().isEmpty(),
  body('price', 'El precio debe ser un número positivo').isFloat({ min: 0 }),
  body('cost', 'El costo debe ser un número positivo').isFloat({ min: 0 }),
  body('quantity', 'La cantidad debe ser un número positivo').isInt({ min: 0 }),
  body('minStock', 'El stock mínimo debe ser un número positivo').isInt({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const productData = {
      ...req.body,
      createdBy: req.user.id
    };

    // Verificar SKU único si se proporciona
    if (req.body.sku) {
      const existingSku = await Product.findOne({ sku: req.body.sku.toUpperCase() });
      if (existingSku) {
        return res.status(400).json({ message: 'El SKU ya existe' });
      }
    }

    const product = new Product(productData);
    await product.save();

    // Registrar movimiento inicial si hay cantidad
    if (product.quantity > 0) {
      const movement = new Movement({
        product: product._id,
        type: 'entrada',
        quantity: product.quantity,
        previousQuantity: 0,
        newQuantity: product.quantity,
        reason: 'ajuste_inventario',
        reference: 'Inventario inicial',
        user: req.user.id,
        cost: product.cost
      });
      await movement.save();
    }

    await product.populate([
      { path: 'category', select: 'name color' },
      { path: 'createdBy', select: 'name' }
    ]);

    res.status(201).json(product);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Error del servidor');
  }
});

// @route   PUT /api/products/:id
// @desc    Actualizar producto
// @access  Private (Manager/Admin)
router.put('/:id', [
  auth,
  managerOrAdmin,
  body('name', 'El nombre es obligatorio').not().isEmpty(),
  body('price', 'El precio debe ser un número positivo').isFloat({ min: 0 }),
  body('cost', 'El costo debe ser un número positivo').isFloat({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    // Verificar SKU único si se está actualizando
    if (req.body.sku && req.body.sku !== product.sku) {
      const existingSku = await Product.findOne({ 
        sku: req.body.sku.toUpperCase(),
        _id: { $ne: req.params.id }
      });
      if (existingSku) {
        return res.status(400).json({ message: 'El SKU ya existe' });
      }
    }

    const updateData = {
      ...req.body,
      updatedBy: req.user.id
    };

    product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate([
      { path: 'category', select: 'name color' },
      { path: 'updatedBy', select: 'name' }
    ]);

    res.json(product);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Error del servidor');
  }
});

// @route   DELETE /api/products/:id
// @desc    Eliminar producto (cambiar estado a inactive)
// @access  Private (Admin only)
router.delete('/:id', [auth, checkRole('admin')], async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    product.status = 'inactive';
    product.updatedBy = req.user.id;
    await product.save();

    res.json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Error del servidor');
  }
});

module.exports = router;

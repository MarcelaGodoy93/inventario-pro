const express = require('express');
const Product = require('../models/Product');
const Movement = require('../models/Movement');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { managerOrAdmin } = require('../middleware/roles');

const router = express.Router();

// @route   GET /api/reports/dashboard
// @desc    Estadísticas del dashboard
// @access  Private
router.get('/dashboard', auth, async (req, res) => {
  try {
    const [
      totalProducts,
      lowStockProducts,
      totalUsers,
      recentMovements,
      topProducts,
      categoryStats
    ] = await Promise.all([
      // Total de productos activos
      Product.countDocuments({ status: 'active' }),
      
      // Productos con stock bajo
      Product.countDocuments({
        status: 'active',
        $expr: { $lte: ['$quantity', '$minStock'] }
      }),
      
      // Total de usuarios activos
      User.countDocuments({ isActive: true }),
      
      // Movimientos recientes (últimos 7 días)
      Movement.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      }),
      
      // Productos más vendidos (últimos 30 días)
      Movement.aggregate([
        {
          $match: {
            type: 'salida',
            reason: 'venta',
            createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
          }
        },
        {
          $group: {
            _id: '$product',
            totalSold: { $sum: '$quantity' },
            totalRevenue: { $sum: { $multiply: ['$quantity', '$cost'] } }
          }
        },
        { $sort: { totalSold: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: '_id',
            as: 'product'
          }
        },
        { $unwind: '$product' }
      ]),
      
      // Estadísticas por categoría
      Product.aggregate([
        { $match: { status: 'active' } },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            totalValue: { $sum: { $multiply: ['$quantity', '$price'] } }
          }
        },
        {
          $lookup: {
            from: 'categories',
            localField: '_id',
            foreignField: '_id',
            as: 'category'
          }
        },
        { $unwind: '$category' }
      ])
    ]);

    // Calcular valor total del inventario
    const inventoryValue = await Product.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: null,
          totalValue: { $sum: { $multiply: ['$quantity', '$price'] } }
        }
      }
    ]);

    res.json({
      overview: {
        totalProducts,
        lowStockProducts,
        totalUsers,
        recentMovements,
        inventoryValue: inventoryValue[0]?.totalValue || 0
      },
      topProducts,
      categoryStats
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Error del servidor');
  }
});

// @route   GET /api/reports/inventory
// @desc    Reporte de inventario
// @access  Private (Manager/Admin)
router.get('/inventory', [auth, managerOrAdmin], async (req, res) => {
  try {
    const { category, status = 'active', lowStock } = req.query;

    const matchStage = { status };
    if (category) matchStage.category = mongoose.Types.ObjectId(category);
    if (lowStock === 'true') {
      matchStage.$expr = { $lte: ['$quantity', '$minStock'] };
    }

    const products = await Product.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'category'
        }
      },
      { $unwind: '$category' },
      {
        $project: {
          name: 1,
          sku: 1,
          category: '$category.name',
          quantity: 1,
          minStock: 1,
          price: 1,
          cost: 1,
          totalValue: { $multiply: ['$quantity', '$price'] },
          isLowStock: { $lte: ['$quantity', '$minStock'] },
          createdAt: 1
        }
      },
      { $sort: { name: 1 } }
    ]);

    const summary = {
      totalProducts: products.length,
      lowStockItems: products.filter(p => p.isLowStock).length,
      totalValue: products.reduce((sum, p) => sum + p.totalValue, 0)
    };

    res.json({ summary, products });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Error del servidor');
  }
});

// @route   GET /api/reports/movements
// @desc    Reporte de movimientos
// @access  Private (Manager/Admin)
router.get('/movements', [auth, managerOrAdmin], async (req, res) => {
  try {
    const { 
      startDate, 
      endDate, 
      type, 
      product,
      page = 1, 
      limit = 50 
    } = req.query;

    const matchStage = {};

    // Filtro por fechas
    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = new Date(startDate);
      if (endDate) matchStage.createdAt.$lte = new Date(endDate);
    }

    if (type) matchStage.type = type;
    if (product) matchStage.product = mongoose.Types.ObjectId(product);

    const movements = await Movement.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: 'products',
          localField: 'product',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      { $sort: { createdAt: -1 } },
      { $skip: (parseInt(page) - 1) * parseInt(limit) },
      { $limit: parseInt(limit) }
    ]);

    res.json(movements);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Error del servidor');
  }
});

module.exports = router;

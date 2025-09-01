const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre del producto es obligatorio'],
    trim: true,
    maxlength: [100, 'El nombre no puede exceder 100 caracteres']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'La descripción no puede exceder 500 caracteres']
  },
  sku: {
    type: String,
    required: [true, 'El SKU es obligatorio'],
    unique: true,
    uppercase: true,
    trim: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'La categoría es obligatoria']
  },
  price: {
    type: Number,
    required: [true, 'El precio es obligatorio'],
    min: [0, 'El precio no puede ser negativo']
  },
  cost: {
    type: Number,
    required: [true, 'El costo es obligatorio'],
    min: [0, 'El costo no puede ser negativo']
  },
  quantity: {
    type: Number,
    required: [true, 'La cantidad es obligatoria'],
    min: [0, 'La cantidad no puede ser negativa'],
    default: 0
  },
  minStock: {
    type: Number,
    required: [true, 'El stock mínimo es obligatorio'],
    min: [0, 'El stock mínimo no puede ser negativo'],
    default: 5
  },
  maxStock: {
    type: Number,
    min: [0, 'El stock máximo no puede ser negativo']
  },
  unit: {
    type: String,
    required: [true, 'La unidad de medida es obligatoria'],
    enum: ['piezas', 'kg', 'litros', 'metros', 'cajas'],
    default: 'piezas'
  },
  barcode: {
    type: String,
    unique: true,
    sparse: true // Permite valores null únicos
  },
  images: [{
    url: String,
    alt: String
  }],
  supplier: {
    type: String,
    trim: true
  },
  location: {
    warehouse: String,
    shelf: String,
    position: String
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'discontinued'],
    default: 'active'
  },
  tags: [String],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Índices para mejorar performance
ProductSchema.index({ name: 'text', description: 'text' });
ProductSchema.index({ category: 1, status: 1 });
ProductSchema.index({ sku: 1 });
ProductSchema.index({ barcode: 1 });

// Virtual para calcular el valor total del stock
ProductSchema.virtual('totalValue').get(function() {
  return this.quantity * this.price;
});

// Virtual para verificar si está en stock bajo
ProductSchema.virtual('isLowStock').get(function() {
  return this.quantity <= this.minStock;
});

// Middleware para generar SKU automáticamente si no se proporciona
ProductSchema.pre('save', function(next) {
  if (!this.sku) {
    const timestamp = Date.now().toString().slice(-4);
    const nameCode = this.name.substring(0, 3).toUpperCase();
    this.sku = `${nameCode}${timestamp}`;
  }
  next();
});

module.exports = mongoose.model('Product', ProductSchema);

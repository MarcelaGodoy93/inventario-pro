const mongoose = require('mongoose');

const MovementSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'El producto es obligatorio']
  },
  type: {
    type: String,
    required: [true, 'El tipo de movimiento es obligatorio'],
    enum: ['entrada', 'salida', 'ajuste', 'transferencia']
  },
  quantity: {
    type: Number,
    required: [true, 'La cantidad es obligatoria'],
    min: [1, 'La cantidad debe ser mayor a 0']
  },
  previousQuantity: {
    type: Number,
    required: true
  },
  newQuantity: {
    type: Number,
    required: true
  },
  reason: {
    type: String,
    required: [true, 'El motivo es obligatorio'],
    enum: [
      'compra',
      'venta', 
      'devolucion',
      'ajuste_inventario',
      'producto_dañado',
      'producto_vencido',
      'transferencia_entrada',
      'transferencia_salida'
    ]
  },
  reference: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [300, 'Las notas no pueden exceder 300 caracteres']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El usuario es obligatorio']
  },
  cost: {
    type: Number,
    min: [0, 'El costo no puede ser negativo']
  }
}, {
  timestamps: true
});

// Índices para mejorar consultas
MovementSchema.index({ product: 1, createdAt: -1 });
MovementSchema.index({ type: 1, createdAt: -1 });
MovementSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Movement', MovementSchema);

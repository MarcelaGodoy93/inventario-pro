const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { checkRole, adminOnly } = require('../middleware/roles');

const router = express.Router();

// @route   GET /api/users
// @desc    Obtener todos los usuarios
// @access  Private (Admin only)
router.get('/', [auth, adminOnly], async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Error del servidor');
  }
});

// @route   GET /api/users/:id
// @desc    Obtener usuario por ID
// @access  Private (Admin or self)
router.get('/:id', auth, async (req, res) => {
  try {
    // Solo admin puede ver cualquier usuario, otros solo a sí mismos
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
      return res.status(403).json({ message: 'No autorizado' });
    }

    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Error del servidor');
  }
});

// @route   PUT /api/users/:id
// @desc    Actualizar usuario
// @access  Private (Admin or self for basic info)
router.put('/:id', [
  auth,
  body('name', 'El nombre es obligatorio').not().isEmpty(),
  body('email', 'Email debe ser válido').isEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, role, isActive } = req.body;
    
    // Solo admin puede cambiar role y isActive
    if ((role || isActive !== undefined) && req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Solo administradores pueden cambiar roles o estado' 
      });
    }

    // Solo admin puede editar otros usuarios
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
      return res.status(403).json({ message: 'No autorizado' });
    }

    let user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Verificar email único
    if (email !== user.email) {
      const existingUser = await User.findOne({ 
        email, 
        _id: { $ne: req.params.id } 
      });
      if (existingUser) {
        return res.status(400).json({ message: 'El email ya está en uso' });
      }
    }

    const updateData = { name, email };
    if (req.user.role === 'admin') {
      if (role) updateData.role = role;
      if (isActive !== undefined) updateData.isActive = isActive;
    }

    user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Error del servidor');
  }
});

// @route   PUT /api/users/:id/password
// @desc    Cambiar contraseña
// @access  Private (Admin or self)
router.put('/:id/password', [
  auth,
  body('currentPassword', 'La contraseña actual es obligatoria').exists(),
  body('newPassword', 'La nueva contraseña debe tener mínimo 6 caracteres').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Solo admin puede cambiar contraseña de otros usuarios sin contraseña actual
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
      return res.status(403).json({ message: 'No autorizado' });
    }

    const { currentPassword, newPassword } = req.body;

    let user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Verificar contraseña actual (excepto admin cambiando otros usuarios)
    if (req.user.id === req.params.id) {
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ message: 'Contraseña actual incorrecta' });
      }
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Error del servidor');
  }
});

module.exports = router;

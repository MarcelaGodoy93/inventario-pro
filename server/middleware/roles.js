// Middleware para verificar roles específicos
const checkRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'No autorizado' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'No tienes permisos para realizar esta acción'
      });
    }

    next();
  };
};

// Middleware específicos por rol
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      message: 'Solo administradores pueden realizar esta acción' 
    });
  }
  next();
};

const managerOrAdmin = (req, res, next) => {
  if (!['admin', 'manager'].includes(req.user.role)) {
    return res.status(403).json({ 
      message: 'Necesitas permisos de administrador o gerente' 
    });
  }
  next();
};

module.exports = {
  checkRole,
  adminOnly,
  managerOrAdmin
};

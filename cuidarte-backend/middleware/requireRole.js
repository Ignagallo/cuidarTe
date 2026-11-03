module.exports = function requireRole(...roles) {
  const authorize = (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    const userRoles = req.user.rol === "superadmin"
      ? ["superadmin", "admin"]
      : [req.user.rol];

    if (!roles.some((role) => userRoles.includes(role))) {
      return res.status(403).json({ message: 'No autorizado' });
    }

    next();
  };
  authorize.allowedRoles = [...roles];
  return authorize;
};


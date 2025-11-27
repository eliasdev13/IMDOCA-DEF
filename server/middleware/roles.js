module.exports.checkRole = (rolesPermitidos) => (req, res, next) => {
  const role = req.user?.roleId;

  if (!role) {
    return res.status(403).json("Rol no encontrado en token");
  }

  if (!rolesPermitidos.includes(role)) {
    return res.status(403).json("No autorizado");
  }

  next();
};

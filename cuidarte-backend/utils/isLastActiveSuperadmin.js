module.exports = function isLastActiveSuperadmin(usuario, activeCount) {
  return usuario?.rol === "superadmin" && usuario.activo && activeCount <= 1;
};

module.exports = function recalcularCobertura(cobertura) {
  const totalPagado = cobertura.pagos
    .filter((p) => !p.anulado)
    .reduce((sum, p) => sum + (Number(p.monto) || 0), 0);

  cobertura.totalPagado = totalPagado;

  if (totalPagado <= 0) cobertura.estado = "impago";
  else if (totalPagado < cobertura.totalServicio) cobertura.estado = "parcial";
  else cobertura.estado = "pago";
};

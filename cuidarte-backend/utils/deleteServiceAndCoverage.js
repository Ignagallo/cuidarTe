async function deleteServiceAndCoverage({ serviceId, session, Servicio, Cobertura }) {
  const servicio = await Servicio.findById(serviceId).session(session);
  if (!servicio) {
    return { status: 404, error: "Servicio no encontrado" };
  }

  const cobertura = await Cobertura.findOne({ servicio: servicio._id }).session(session);
  if (cobertura?.pagos?.length) {
    return {
      status: 409,
      error: "No se puede eliminar: la cobertura conserva pagos y auditoría",
    };
  }

  if (cobertura) {
    return {
      status: 409,
      error: "El servicio tiene una cobertura asociada. Eliminá la cobertura explícitamente primero; las coberturas con pagos no se pueden eliminar.",
    };
  }

  const result = await Servicio.deleteOne({ _id: servicio._id }, { session });
  if (result.deletedCount !== 1) {
    throw new Error("No se pudo eliminar el servicio dentro de la transacción");
  }

  return { status: 200, body: { ok: true } };
}

module.exports = deleteServiceAndCoverage;

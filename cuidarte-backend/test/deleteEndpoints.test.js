const test = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");
const Usuario = require("../models/Usuario");
const Cliente = require("../models/Cliente");
const Profesional = require("../models/Profesional");
const Servicio = require("../models/Servicio");
const Cobertura = require("../models/Cobertura");
const Asignacion = require("../models/Asignacion");
const usuariosRouter = require("../routes/usuarios");
const profesionalesRouter = require("../routes/profesionales");
const coberturasRouter = require("../routes/coberturas");

function getHandler(router, method, path) {
  const route = router.stack.find((layer) =>
    layer.route?.path === path && layer.route.methods[method.toLowerCase()],
  );
  assert.ok(route, `${method} ${path} route should exist`);
  return route.route.stack.at(-1).handle;
}

function responseRecorder() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}

async function withStubs(stubs, callback) {
  const models = { Usuario, Cliente, Profesional, Servicio, Cobertura, Asignacion };
  const restorers = [];
  for (const [modelName, methods] of Object.entries(stubs)) {
    for (const [methodName, implementation] of Object.entries(methods)) {
      const model = models[modelName];
      const original = model[methodName];
      model[methodName] = implementation;
      restorers.push(() => { model[methodName] = original; });
    }
  }
  try {
    await callback();
  } finally {
    restorers.reverse().forEach((restore) => restore());
  }
}

test("permanent user deletion succeeds only when no dependency exists", async () => {
  const userId = new mongoose.Types.ObjectId();
  const currentUser = {
    _id: userId,
    rol: "cliente",
    activo: true,
    clienteRef: null,
    profesionalRef: null,
  };
  let deleted = false;

  await withStubs({
    Usuario: {
      findById: async () => currentUser,
      countDocuments: async () => 2,
      deleteOne: async () => { deleted = true; return { deletedCount: 1 }; },
    },
    Cliente: { exists: async () => false },
    Profesional: { exists: async () => false },
    Servicio: { exists: async () => false },
    Cobertura: { exists: async () => false },
  }, async () => {
    const response = responseRecorder();
    await getHandler(usuariosRouter, "DELETE", "/:id/permanent")({
      params: { id: userId.toString() },
      user: { _id: new mongoose.Types.ObjectId(), rol: "admin" },
    }, response);

    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.body, { ok: true });
  });

  assert.equal(deleted, true);
});

test("permanent user deletion is blocked by profile or payment-audit dependencies", async () => {
  const userId = new mongoose.Types.ObjectId();
  const currentUser = {
    _id: userId,
    rol: "cliente",
    activo: true,
    clienteRef: null,
    profesionalRef: null,
  };
  let deleted = false;

  await withStubs({
    Usuario: {
      findById: async () => currentUser,
      countDocuments: async () => 2,
      deleteOne: async () => { deleted = true; return { deletedCount: 1 }; },
    },
    Cliente: { exists: async () => false },
    Profesional: { exists: async () => false },
    Servicio: { exists: async () => false },
    Cobertura: { exists: async () => true },
  }, async () => {
    const response = responseRecorder();
    await getHandler(usuariosRouter, "DELETE", "/:id/permanent")({
      params: { id: userId.toString() },
      user: { _id: new mongoose.Types.ObjectId(), rol: "superadmin" },
    }, response);

    assert.equal(response.statusCode, 409);
    assert.match(response.body.error, /perfiles o referencias de auditoría/);
  });

  assert.equal(deleted, false);
});

test("permanent user deletion protects the last active superadmin", async () => {
  const userId = new mongoose.Types.ObjectId();
  const currentUser = { _id: userId, rol: "superadmin", activo: true };
  let deleted = false;

  await withStubs({
    Usuario: {
      findById: async () => currentUser,
      countDocuments: async () => 1,
      deleteOne: async () => { deleted = true; return { deletedCount: 1 }; },
    },
  }, async () => {
    const response = responseRecorder();
    await getHandler(usuariosRouter, "DELETE", "/:id/permanent")({
      params: { id: userId.toString() },
      user: { _id: new mongoose.Types.ObjectId(), rol: "superadmin" },
    }, response);

    assert.equal(response.statusCode, 409);
    assert.match(response.body.error, /último superadmin activo/);
  });

  assert.equal(deleted, false);
});

test("an admin cannot permanently delete another administrative account", async () => {
  const userId = new mongoose.Types.ObjectId();
  let deleted = false;

  await withStubs({
    Usuario: {
      findById: async () => ({ _id: userId, rol: "admin", activo: true }),
      deleteOne: async () => { deleted = true; return { deletedCount: 1 }; },
    },
  }, async () => {
    const response = responseRecorder();
    await getHandler(usuariosRouter, "DELETE", "/:id/permanent")({
      params: { id: userId.toString() },
      user: { _id: new mongoose.Types.ObjectId(), rol: "admin" },
    }, response);

    assert.equal(response.statusCode, 403);
    assert.match(response.body.error, /Solo un superadmin/);
  });

  assert.equal(deleted, false);
});

test("permanent professional deletion is blocked when services depend on it", async () => {
  const professionalId = new mongoose.Types.ObjectId();
  let deleted = false;

  await withStubs({
    Profesional: {
      findById: async () => ({ _id: professionalId, usuario: null }),
      deleteOne: async () => { deleted = true; return { deletedCount: 1 }; },
    },
    Servicio: { exists: async () => true },
    Asignacion: { exists: async () => false },
    Usuario: { exists: async () => false },
  }, async () => {
    const response = responseRecorder();
    await getHandler(profesionalesRouter, "DELETE", "/:id/permanent")({
      params: { id: professionalId.toString() },
    }, response);

    assert.equal(response.statusCode, 409);
    assert.match(response.body.error, /servicios, asignaciones o una cuenta vinculada/);
  });

  assert.equal(deleted, false);
});

test("an unpaid coverage can be explicitly deleted without deleting its service", async () => {
  const coverageId = new mongoose.Types.ObjectId();
  let coverageDeleted = false;
  const coverage = {
    _id: coverageId,
    servicio: new mongoose.Types.ObjectId(),
    totalServicio: 0,
    totalPagado: 0,
    pagos: [],
  };

  await withStubs({
    Cobertura: {
      findById: async () => coverage,
      deleteOne: async () => { coverageDeleted = true; return { deletedCount: 1 }; },
    },
  }, async () => {
    const response = responseRecorder();
    await getHandler(coberturasRouter, "DELETE", "/:id/permanent")({
      params: { id: coverageId.toString() },
    }, response);

    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.body, { ok: true });
  });

  assert.equal(coverageDeleted, true);
});

test("coverage deletion is blocked while an unpaid financial balance remains", async () => {
  const coverageId = new mongoose.Types.ObjectId();
  let coverageDeleted = false;
  const coverage = {
    _id: coverageId,
    servicio: new mongoose.Types.ObjectId(),
    totalServicio: 200000,
    totalPagado: 0,
    pagos: [],
  };

  await withStubs({
    Cobertura: {
      findById: async () => coverage,
      deleteOne: async () => { coverageDeleted = true; return { deletedCount: 1 }; },
    },
  }, async () => {
    const response = responseRecorder();
    await getHandler(coberturasRouter, "DELETE", "/:id/permanent")({
      params: { id: coverageId.toString() },
    }, response);

    assert.equal(response.statusCode, 409);
    assert.match(response.body.error, /conserva importes financieros/);
  });

  assert.equal(coverageDeleted, false);
  assert.equal(coverage.totalServicio, 200000);
});

test("coverage deletion preserves all payment history, including annulled payments", async () => {
  const coverageId = new mongoose.Types.ObjectId();
  let coverageDeleted = false;
  const coverage = {
    _id: coverageId,
    servicio: new mongoose.Types.ObjectId(),
    pagos: [{ _id: "payment-1", monto: 100, anulado: true }],
  };

  await withStubs({
    Cobertura: {
      findById: async () => coverage,
      deleteOne: async () => { coverageDeleted = true; return { deletedCount: 1 }; },
    },
  }, async () => {
    const response = responseRecorder();
    await getHandler(coberturasRouter, "DELETE", "/:id/permanent")({
      params: { id: coverageId.toString() },
    }, response);

    assert.equal(response.statusCode, 409);
    assert.match(response.body.error, /conserva pagos y auditoría/);
  });

  assert.equal(coverageDeleted, false);
  assert.equal(coverage.pagos.length, 1);
});

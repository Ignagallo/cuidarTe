const test = require("node:test");
const assert = require("node:assert/strict");
const Servicio = require("../models/Servicio");
const Cobertura = require("../models/Cobertura");
const Cliente = require("../models/Cliente");
const Profesional = require("../models/Profesional");
const serviciosRouter = require("../routes/servicios");

function getHandler(method, path) {
  const route = serviciosRouter.stack.find((layer) =>
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
  const originals = Object.entries(stubs).map(([objectName, methods]) => {
    const target = { Servicio, Cobertura, Cliente, Profesional }[objectName];
    return Object.entries(methods).map(([name, implementation]) => {
      const original = target[name];
      target[name] = implementation;
      return () => { target[name] = original; };
    });
  }).flat();

  try {
    await callback();
  } finally {
    originals.reverse().forEach((restore) => restore());
  }
}

test("creating a $200,000 service creates its linked coverage at the same amount", async () => {
  const newService = { _id: "service-1", importe: 200000 };
  let createdCoverage;

  await withStubs({
    Cliente: { findById: async () => ({ _id: "client-1" }) },
    Profesional: { findById: async () => ({ _id: "professional-1" }) },
    Servicio: { create: async (body) => {
      assert.equal(body.importe, 200000);
      return newService;
    } },
    Cobertura: { create: async (body) => { createdCoverage = body; return body; } },
  }, async () => {
    const response = responseRecorder();
    await getHandler("POST", "/")({
      body: { cliente: "client-1", profesional: "professional-1", importe: 200000 },
      user: { _id: "admin-1" },
    }, response);

    assert.equal(response.statusCode, 201);
    assert.equal(response.body, newService);
  });

  assert.deepEqual(createdCoverage, { servicio: "service-1", totalServicio: 200000 });
});

test("changing a service from $200,000 to $300,000 updates only its linked coverage", async () => {
  const currentService = { _id: "service-1", cliente: "client-1", importe: 200000 };
  const otherCoverage = { servicio: "service-other", totalServicio: 450000, pagos: [], save: async () => assert.fail("other coverage must not be saved") };
  const relatedCoverage = {
    servicio: "service-1",
    totalServicio: 200000,
    totalPagado: 0,
    estado: "impago",
    pagos: [],
    save: async () => {},
  };
  let coverageFilter;

  await withStubs({
    Servicio: {
      findById: async () => currentService,
      findByIdAndUpdate: async (_id, updates) => ({ ...currentService, ...updates }),
    },
    Cobertura: {
      findOne: async (filter) => {
        coverageFilter = filter;
        return filter.servicio === relatedCoverage.servicio ? relatedCoverage : otherCoverage;
      },
    },
  }, async () => {
    const response = responseRecorder();
    await getHandler("PUT", "/:id")({
      params: { id: "service-1" },
      body: { importe: 300000, tipoServicio: "caregiver-type" },
    }, response);

    assert.equal(response.statusCode, 200);
    assert.equal(response.body.importe, 300000);
  });

  assert.deepEqual(coverageFilter, { servicio: "service-1" });
  assert.equal(relatedCoverage.totalServicio, 300000);
  assert.equal(relatedCoverage.totalPagado, 0);
  assert.equal(relatedCoverage.estado, "impago");
  assert.equal(otherCoverage.totalServicio, 450000);
});

test("editing other service fields does not alter an already synchronized coverage", async () => {
  const currentService = { _id: "service-2", importe: 300000 };
  let coverageSaves = 0;
  const coverage = {
    servicio: "service-2",
    totalServicio: 300000,
    totalPagado: 100000,
    estado: "parcial",
    pagos: [{ _id: "payment-1", monto: 100000, anulado: false }],
    async save() { coverageSaves += 1; },
  };

  await withStubs({
    Servicio: {
      findById: async () => currentService,
      findByIdAndUpdate: async (_id, updates) => ({ ...currentService, ...updates }),
    },
    Cobertura: { findOne: async () => coverage },
  }, async () => {
    const response = responseRecorder();
    await getHandler("PUT", "/:id")({
      params: { id: "service-2" },
      body: { indicaciones: "Actualización administrativa" },
    }, response);
    assert.equal(response.statusCode, 200);
  });

  assert.equal(coverageSaves, 0);
  assert.equal(coverage.totalServicio, 300000);
  assert.equal(coverage.totalPagado, 100000);
  assert.equal(coverage.estado, "parcial");
  assert.deepEqual(coverage.pagos, [{ _id: "payment-1", monto: 100000, anulado: false }]);
});

test("increasing a partially paid service preserves payment history and recalculates balance", async () => {
  const currentService = { _id: "service-3", cliente: "client-3", importe: 200000 };
  const payments = [
    { _id: "payment-1", monto: 120000, anulado: false },
    { _id: "payment-2", monto: 20000, anulado: true },
  ];
  const coverage = {
    servicio: "service-3",
    totalServicio: 200000,
    totalPagado: 120000,
    estado: "parcial",
    pagos: structuredClone(payments),
    async save() {},
  };

  await withStubs({
    Servicio: {
      findById: async () => currentService,
      findByIdAndUpdate: async (_id, updates) => ({ ...currentService, ...updates }),
    },
    Cobertura: { findOne: async () => coverage },
  }, async () => {
    const response = responseRecorder();
    await getHandler("PUT", "/:id")({
      params: { id: "service-3" },
      body: { importe: 300000 },
    }, response);
    assert.equal(response.statusCode, 200);
  });

  assert.equal(coverage.totalServicio, 300000);
  assert.equal(coverage.totalPagado, 120000);
  assert.equal(coverage.totalServicio - coverage.totalPagado, 180000);
  assert.equal(coverage.estado, "parcial");
  assert.deepEqual(coverage.pagos, payments);
});

test("reconciles a stale linked coverage during a non-price service edit", async () => {
  const currentService = { _id: "service-4", importe: 300000 };
  const coverage = {
    servicio: "service-4",
    totalServicio: 200000,
    totalPagado: 50000,
    estado: "parcial",
    pagos: [{ _id: "payment-1", monto: 50000, anulado: false }],
    async save() {},
  };

  await withStubs({
    Servicio: {
      findById: async () => currentService,
      findByIdAndUpdate: async (_id, updates) => ({ ...currentService, ...updates }),
    },
    Cobertura: { findOne: async () => coverage },
  }, async () => {
    const response = responseRecorder();
    await getHandler("PUT", "/:id")({
      params: { id: "service-4" },
      body: { indicaciones: "Ajuste sin editar importe" },
    }, response);
    assert.equal(response.statusCode, 200);
  });

  assert.equal(coverage.totalServicio, 300000);
  assert.equal(coverage.totalPagado, 50000);
  assert.equal(coverage.estado, "parcial");
});

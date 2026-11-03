const test = require("node:test");
const assert = require("node:assert/strict");
const deleteServiceAndCoverage = require("../utils/deleteServiceAndCoverage");

function createModels({ servicio = { _id: "servicio-1" }, cobertura = null } = {}) {
  const session = { id: "test-session" };
  const calls = [];
  const query = (value) => ({
    session: async (receivedSession) => {
      assert.equal(receivedSession, session);
      return value;
    },
  });
  const Servicio = {
    findById: () => query(servicio),
    deleteOne: async (_filter, options) => {
      assert.equal(options.session, session);
      calls.push("delete-service");
      return { deletedCount: 1 };
    },
  };
  const Cobertura = {
    findOne: () => query(cobertura),
    deleteOne: async (_filter, options) => {
      assert.equal(options.session, session);
      calls.push("delete-coverage");
      return { deletedCount: 1 };
    },
  };
  return { session, calls, Servicio, Cobertura };
}

test("preserves a service and its coverage if any payment history exists", async () => {
  const models = createModels({
    cobertura: { _id: "cobertura-1", pagos: [{ monto: 10, anulado: true }] },
  });

  const result = await deleteServiceAndCoverage({ serviceId: "servicio-1", ...models });

  assert.equal(result.status, 409);
  assert.deepEqual(models.calls, []);
});

test("does not cascade-delete an unpaid coverage when deleting its service", async () => {
  const models = createModels({
    cobertura: { _id: "cobertura-1", pagos: [] },
  });

  const result = await deleteServiceAndCoverage({ serviceId: "servicio-1", ...models });

  assert.equal(result.status, 409);
  assert.match(result.error, /Eliminá la cobertura explícitamente primero/);
  assert.deepEqual(models.calls, []);
});

test("deletes a service only after its coverage was explicitly removed", async () => {
  const models = createModels({ cobertura: null });

  const result = await deleteServiceAndCoverage({ serviceId: "servicio-1", ...models });

  assert.equal(result.status, 200);
  assert.deepEqual(models.calls, ["delete-service"]);
});

test("does not delete a service without a matching record", async () => {
  const models = createModels({ servicio: null });

  const result = await deleteServiceAndCoverage({ serviceId: "missing", ...models });

  assert.equal(result.status, 404);
  assert.deepEqual(models.calls, []);
});

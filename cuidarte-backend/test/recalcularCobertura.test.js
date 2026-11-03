const test = require("node:test");
const assert = require("node:assert/strict");
const recalcularCobertura = require("../utils/recalcularCobertura");

test("recalculates coverage against the current service total and preserves payment records", () => {
  const payments = [
    { _id: "pago-1", monto: 40, anulado: false },
    { _id: "pago-2", monto: 10, anulado: true },
  ];
  const cobertura = { totalServicio: 60, pagos: payments };

  cobertura.totalServicio = 35;
  recalcularCobertura(cobertura);

  assert.equal(cobertura.totalPagado, 40);
  assert.equal(cobertura.estado, "pago");
  assert.deepEqual(cobertura.pagos, payments);
});

test("keeps a partially paid coverage partial when its current amount increases", () => {
  const cobertura = {
    totalServicio: 90,
    pagos: [{ monto: 40, anulado: false }],
  };

  recalcularCobertura(cobertura);

  assert.equal(cobertura.totalPagado, 40);
  assert.equal(cobertura.estado, "parcial");
});

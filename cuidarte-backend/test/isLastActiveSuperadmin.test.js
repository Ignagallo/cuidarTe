const test = require("node:test");
const assert = require("node:assert/strict");
const isLastActiveSuperadmin = require("../utils/isLastActiveSuperadmin");

test("protects an active superadmin when it is the last one", () => {
  assert.equal(isLastActiveSuperadmin({ rol: "superadmin", activo: true }, 1), true);
  assert.equal(isLastActiveSuperadmin({ rol: "superadmin", activo: true }, 0), true);
});

test("allows changes when another active superadmin exists", () => {
  assert.equal(isLastActiveSuperadmin({ rol: "superadmin", activo: true }, 2), false);
});

test("does not apply the last-superadmin rule to inactive or other roles", () => {
  assert.equal(isLastActiveSuperadmin({ rol: "superadmin", activo: false }, 0), false);
  assert.equal(isLastActiveSuperadmin({ rol: "admin", activo: true }, 1), false);
});

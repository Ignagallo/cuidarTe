const test = require("node:test");
const assert = require("node:assert/strict");
const requireRole = require("../middleware/requireRole");

function runMiddleware(role, allowedRoles) {
  const req = { user: role ? { rol: role } : null };
  const res = {
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
  let nextCalled = false;

  requireRole(...allowedRoles)(req, res, () => {
    nextCalled = true;
  });

  return { res, nextCalled };
}

test("allows an admin for admin routes", () => {
  const { res, nextCalled } = runMiddleware("admin", ["admin"]);
  assert.equal(nextCalled, true);
  assert.equal(res.statusCode, 200);
});

test("allows a superadmin for admin routes", () => {
  const { res, nextCalled } = runMiddleware("superadmin", ["admin"]);
  assert.equal(nextCalled, true);
  assert.equal(res.statusCode, 200);
});

test("does not allow an admin for superadmin-only routes", () => {
  const { res, nextCalled } = runMiddleware("admin", ["superadmin"]);
  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 403);
});

test("rejects unauthenticated requests", () => {
  const { res, nextCalled } = runMiddleware(null, ["admin"]);
  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 401);
});

test("denies client and professional roles for administrative routes", () => {
  for (const role of ["cliente", "profesional"]) {
    const { res, nextCalled } = runMiddleware(role, ["admin"]);
    assert.equal(nextCalled, false);
    assert.equal(res.statusCode, 403);
  }
});

test("applies admin and superadmin policies to every coverage endpoint", () => {
  const coberturaRouter = require("../routes/coberturas");
  const expected = new Map([
    ["GET /", ["admin"]],
    ["PUT /:id", ["admin"]],
    ["POST /:servicioId/pagos", ["admin"]],
    ["PUT /:coberturaId/pagos/:pagoId", ["admin"]],
    ["DELETE /:coberturaId/pagos/:pagoId", ["admin"]],
    ["DELETE /:id/permanent", ["admin"]],
  ]);

  const actual = new Map();
  for (const layer of coberturaRouter.stack) {
    if (!layer.route) continue;
    for (const method of Object.keys(layer.route.methods)) {
      const policy = layer.route.stack.find((item) => item.handle.allowedRoles);
      assert.ok(policy, method.toUpperCase() + " " + layer.route.path + " must declare a role policy");
      assert.equal(layer.route.stack[0].handle.name, "auth");
      actual.set(method.toUpperCase() + " " + layer.route.path, policy.handle.allowedRoles);
    }
  }
  assert.deepEqual(actual, expected);
});

test("service creation and permanent deletion have distinct role policies", () => {
  const servicioRouter = require("../routes/servicios");
  const findPolicy = (method, path) => {
    const layer = servicioRouter.stack.find((item) =>
      item.route?.path === path && item.route.methods[method.toLowerCase()],
    );
    return layer?.route.stack.find((item) => item.handle.allowedRoles)?.handle.allowedRoles;
  };

  assert.deepEqual(findPolicy("POST", "/"), ["admin"]);
  assert.deepEqual(findPolicy("DELETE", "/:id/permanent"), ["admin"]);
});

test("permanent deletion of users and professionals is authenticated and admin-only", () => {
  const routes = [
    [require("../routes/usuarios"), "users"],
    [require("../routes/profesionales"), "professionals"],
  ];

  for (const [router, resource] of routes) {
    const route = router.stack.find((layer) =>
      layer.route?.path === "/:id/permanent" && layer.route.methods.delete,
    );
    assert.ok(route, `${resource} permanent deletion route should exist`);
    assert.equal(route.route.stack[0].handle.name, "auth");
    const policy = route.route.stack.find((layer) => layer.handle.allowedRoles);
    assert.deepEqual(policy?.handle.allowedRoles, ["admin"]);
  }
});

test("protects the legacy agenda coverage endpoint as admin-only", () => {
  const agendaRouter = require("../routes/agenda");
  const route = agendaRouter.stack.find((layer) =>
    layer.route?.path === "/" && layer.route.methods.get,
  );

  assert.ok(route);
  assert.equal(route.route.stack[0].handle.name, "auth");
  const policy = route.route.stack.find((layer) => layer.handle.allowedRoles);
  assert.deepEqual(policy?.handle.allowedRoles, ["admin"]);
});

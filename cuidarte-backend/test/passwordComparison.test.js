const test = require("node:test");
const assert = require("node:assert/strict");
const bcrypt = require("bcryptjs");
const Usuario = require("../models/Usuario");
const userRouter = require("../routes/usuarios");

async function makeUser(passwordHash) {
  return new Usuario({
    nombre: "Cuenta de prueba",
    email: "login@example.com",
    password: passwordHash,
    rol: "admin",
    activo: true,
    tokenVersion: 4,
  });
}

function responseRecorder() {
  return {
    statusCode: 200,
    body: null,
    cookieSet: false,
    status(code) {
      this.statusCode = code;
      return this;
    },
    cookie(name) {
      assert.equal(name, "token");
      this.cookieSet = true;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}

test("compares passwords against existing bcrypt hashes", async () => {
  const hash = await bcrypt.hash("clave-existente", await bcrypt.genSalt(10));
  const user = await makeUser(hash);

  assert.equal(await user.compararPassword("clave-existente"), true);
  assert.equal(await user.compararPassword("otra-clave"), false);
});

test("returns false for malformed, missing, or non-string hashes and passwords", async () => {
  const invalidHashUser = await makeUser("not-a-bcrypt-hash");
  const missingHashUser = await makeUser("placeholder");
  missingHashUser.password = undefined;

  assert.equal(await invalidHashUser.compararPassword("clave-existente"), false);
  assert.equal(await missingHashUser.compararPassword("clave-existente"), false);
  assert.equal(await invalidHashUser.compararPassword(undefined), false);
});

test("login handler authenticates with the model comparator and preserves role response", async (t) => {
  const loginRoute = userRouter.stack.find((layer) =>
    layer.route?.path === "/login" && layer.route.methods.post,
  );
  assert.ok(loginRoute);
  const loginHandler = loginRoute.route.stack.at(-1).handle;
  const hash = await bcrypt.hash("clave-existente", await bcrypt.genSalt(10));
  const user = await makeUser(hash);
  const previousSecret = process.env.JWT_SECRET;
  const originalFindOne = Usuario.findOne;
  process.env.JWT_SECRET = "test-secret-only";
  Usuario.findOne = async () => user;

  try {
    const response = responseRecorder();
    await loginHandler({ body: { email: user.email, password: "clave-existente" } }, response);

    assert.equal(response.statusCode, 200);
    assert.equal(response.cookieSet, true);
    assert.equal(response.body.rol, "admin");
    assert.equal(response.body.requiereCambioPassword, true);
  } finally {
    Usuario.findOne = originalFindOne;
    if (previousSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = previousSecret;
  }
});

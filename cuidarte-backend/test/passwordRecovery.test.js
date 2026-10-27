const test = require("node:test");
const assert = require("node:assert/strict");
const bcrypt = require("bcryptjs");
const isTokenVersionCurrent = require("../utils/isTokenVersionCurrent");
const {
  PASSWORD_RESET_TTL_MS,
  hashPasswordResetToken,
} = require("../utils/passwordRecovery");
const {
  createPasswordRecoveryHandlers,
  GENERIC_REQUEST_RESPONSE,
  SERVICE_UNAVAILABLE_RESPONSE,
  INVALID_TOKEN_RESPONSE,
} = require("../utils/passwordRecoveryHandlers");

const FIXED_NOW = Date.parse("2026-10-26T12:00:00Z");

function responseRecorder() {
  return {
    statusCode: 200,
    body: null,
    clearedCookie: false,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
    clearCookie(name) {
      assert.equal(name, "token");
      this.clearedCookie = true;
      return this;
    },
  };
}

function harness({ activeUser = true, emailConfigured = true, sendRecoveryEmail } = {}) {
  const user = activeUser
    ? { _id: "user-1", email: "person@example.com", nombre: "Persona", activo: true, tokenVersion: 2 }
    : null;
  const state = { user, stored: null, consumed: false, sent: [], lookupCount: 0 };
  const users = {
    async findActiveByEmail(email) {
      state.lookupCount += 1;
      assert.equal(email, "person@example.com");
      return state.user;
    },
    async storeResetToken(foundUser, tokenHash, expiresAt) {
      assert.equal(foundUser, user);
      state.stored = { tokenHash, expiresAt };
    },
    async clearResetToken(_userId, tokenHash) {
      if (state.stored?.tokenHash === tokenHash) state.stored = null;
    },
    async consumeResetToken(tokenHash, passwordHash, now) {
      if (
        state.consumed ||
        !state.user ||
        state.stored?.tokenHash !== tokenHash ||
        state.stored.expiresAt <= now
      ) return null;

      state.consumed = true;
      state.stored = null;
      state.user.password = passwordHash;
      state.user.tokenVersion += 1;
      state.user.requiereCambioPassword = false;
      return state.user;
    },
  };
  const send = sendRecoveryEmail || (async (message) => state.sent.push(message));
  const handlers = createPasswordRecoveryHandlers({
    users,
    emailConfigured,
    sendRecoveryEmail: send,
    frontendBaseUrl: "https://cuidarte.example",
    now: () => FIXED_NOW,
  });

  return { handlers, state };
}

test("registered and unregistered recovery requests have equivalent responses", async () => {
  const registered = harness({ activeUser: true });
  const unregistered = harness({ activeUser: false });
  const registeredResponse = responseRecorder();
  const unregisteredResponse = responseRecorder();

  await registered.handlers.requestReset({ body: { email: " Person@Example.com " } }, registeredResponse);
  await unregistered.handlers.requestReset({ body: { email: "person@example.com" } }, unregisteredResponse);

  assert.equal(registeredResponse.statusCode, 202);
  assert.deepEqual(registeredResponse.body, GENERIC_REQUEST_RESPONSE);
  assert.deepEqual(unregisteredResponse.body, registeredResponse.body);
  assert.equal(registered.state.sent.length, 1);
  assert.equal(unregistered.state.sent.length, 0);

  const resetUrl = new URL(registered.state.sent[0].resetUrl);
  const rawToken = resetUrl.searchParams.get("token");
  assert.match(rawToken, /^[a-f0-9]{64}$/);
  assert.equal(registered.state.stored.tokenHash, hashPasswordResetToken(rawToken));
  assert.notEqual(registered.state.stored.tokenHash, rawToken);
  assert.equal(JSON.stringify(registeredResponse.body).includes(rawToken), false);
  assert.equal(registered.state.stored.expiresAt.getTime(), FIXED_NOW + PASSWORD_RESET_TTL_MS);
});

test("unconfigured email returns the same unavailable response without account lookup", async () => {
  const known = harness({ activeUser: true, emailConfigured: false });
  const unknown = harness({ activeUser: false, emailConfigured: false });
  const knownResponse = responseRecorder();
  const unknownResponse = responseRecorder();

  await known.handlers.requestReset({ body: { email: "person@example.com" } }, knownResponse);
  await unknown.handlers.requestReset({ body: { email: "person@example.com" } }, unknownResponse);

  assert.equal(knownResponse.statusCode, 503);
  assert.deepEqual(knownResponse.body, SERVICE_UNAVAILABLE_RESPONSE);
  assert.deepEqual(unknownResponse.body, knownResponse.body);
  assert.equal(known.state.lookupCount, 0);
  assert.equal(unknown.state.lookupCount, 0);
  assert.equal(known.state.stored, null);
});

test("rejects invalid and expired reset tokens", async () => {
  const invalid = harness();
  const invalidResponse = responseRecorder();
  await invalid.handlers.resetPassword({ body: { token: "invalid", password: "nueva123" } }, invalidResponse);
  assert.equal(invalidResponse.statusCode, 400);
  assert.deepEqual(invalidResponse.body, INVALID_TOKEN_RESPONSE);

  const expired = harness();
  expired.state.stored = {
    tokenHash: hashPasswordResetToken("a".repeat(64)),
    expiresAt: new Date(FIXED_NOW - 1),
  };
  const expiredResponse = responseRecorder();
  await expired.handlers.resetPassword({ body: { token: "a".repeat(64), password: "nueva123" } }, expiredResponse);
  assert.equal(expiredResponse.statusCode, 400);
  assert.deepEqual(expiredResponse.body, INVALID_TOKEN_RESPONSE);
});

test("rejects passwords shorter than the shared minimum", async () => {
  const { handlers, state } = harness();
  const response = responseRecorder();
  await handlers.resetPassword({ body: { token: "a".repeat(64), password: "12345" } }, response);

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.error, "La contraseña debe tener al menos 6 caracteres");
  assert.equal(state.consumed, false);
});

test("successfully resets password, consumes token once, and invalidates sessions", async () => {
  const { handlers, state } = harness();
  const rawToken = "b".repeat(64);
  state.stored = {
    tokenHash: hashPasswordResetToken(rawToken),
    expiresAt: new Date(FIXED_NOW + PASSWORD_RESET_TTL_MS),
  };
  const response = responseRecorder();

  await handlers.resetPassword({ body: { token: rawToken, password: "correcta123" } }, response);

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.body, { ok: true });
  assert.equal(response.clearedCookie, true);
  assert.equal(await bcrypt.compare("correcta123", state.user.password), true);
  assert.equal(state.user.tokenVersion, 3);
  assert.equal(isTokenVersionCurrent(2, state.user.tokenVersion), false);
  assert.equal(state.stored, null);

  const reusedResponse = responseRecorder();
  await handlers.resetPassword({ body: { token: rawToken, password: "otra1234" } }, reusedResponse);
  assert.equal(reusedResponse.statusCode, 400);
  assert.deepEqual(reusedResponse.body, INVALID_TOKEN_RESPONSE);
});

test("does not claim delivery when the email provider fails", async () => {
  const { handlers, state } = harness({ sendRecoveryEmail: async () => { throw new Error("transport failure"); } });
  const response = responseRecorder();
  await handlers.requestReset({ body: { email: "person@example.com" } }, response);

  assert.equal(response.statusCode, 202);
  assert.deepEqual(response.body, GENERIC_REQUEST_RESPONSE);
  assert.equal(state.stored, null);
});

const test = require("node:test");
const assert = require("node:assert/strict");
const isTokenVersionCurrent = require("../utils/isTokenVersionCurrent");

test("keeps legacy tokens valid while existing users have the default version", () => {
  assert.equal(isTokenVersionCurrent(undefined, undefined), true);
  assert.equal(isTokenVersionCurrent(undefined, 0), true);
});

test("rejects tokens after the user's session version changes", () => {
  assert.equal(isTokenVersionCurrent(0, 1), false);
  assert.equal(isTokenVersionCurrent(2, 2), true);
});

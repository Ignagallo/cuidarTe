const { createHash, randomBytes } = require("node:crypto");

const PASSWORD_RESET_TTL_MS = 15 * 60 * 1000;

function createPasswordResetToken() {
  return randomBytes(32).toString("hex");
}

function hashPasswordResetToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

module.exports = {
  PASSWORD_RESET_TTL_MS,
  createPasswordResetToken,
  hashPasswordResetToken,
};

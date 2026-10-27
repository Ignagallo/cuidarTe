const bcrypt = require("bcryptjs");

const MIN_PASSWORD_LENGTH = 6;

function validatePassword(password) {
  return typeof password === "string" && password.length >= MIN_PASSWORD_LENGTH;
}

async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

async function comparePassword(password, storedHash) {
  if (typeof password !== "string" || typeof storedHash !== "string" || !storedHash) {
    return false;
  }

  try {
    return await bcrypt.compare(password, storedHash);
  } catch (_error) {
    return false;
  }
}

module.exports = {
  MIN_PASSWORD_LENGTH,
  validatePassword,
  hashPassword,
  comparePassword,
};

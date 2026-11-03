const {
  PASSWORD_RESET_TTL_MS,
  createPasswordResetToken,
  hashPasswordResetToken,
} = require("./passwordRecovery");
const { hashPassword, validatePassword } = require("./password");

const GENERIC_REQUEST_RESPONSE = {
  message: "Solicitud recibida. Por privacidad, no confirmamos si existe una cuenta asociada. Si la cuenta está activa y el servicio de correo está disponible, recibirás instrucciones.",
};
const SERVICE_UNAVAILABLE_RESPONSE = {
  error: "La recuperación por correo no está configurada. Contactá al administrador del sistema.",
};
const INVALID_TOKEN_RESPONSE = {
  error: "El enlace de recuperación no es válido o venció.",
};

function createPasswordRecoveryHandlers({
  users,
  emailConfigured,
  sendRecoveryEmail,
  frontendBaseUrl,
  now = Date.now,
}) {
  async function requestReset(req, res) {
    const email = typeof req.body?.email === "string"
      ? req.body.email.trim().toLowerCase()
      : "";
    if (!email) {
      return res.status(400).json({ error: "Ingresá un email válido" });
    }

    // Check provider availability before looking up the account, so an
    // unconfigured installation responds identically for every address.
    if (!emailConfigured) {
      return res.status(503).json(SERVICE_UNAVAILABLE_RESPONSE);
    }

    const user = await users.findActiveByEmail(email);
    if (!user) {
      return res.status(202).json(GENERIC_REQUEST_RESPONSE);
    }

    const token = createPasswordResetToken();
    const tokenHash = hashPasswordResetToken(token);
    const expiresAt = new Date(now() + PASSWORD_RESET_TTL_MS);
    await users.storeResetToken(user, tokenHash, expiresAt);

    try {
      const resetUrl = new URL("/restablecer-password", frontendBaseUrl);
      resetUrl.searchParams.set("token", token);
      await sendRecoveryEmail({
        email: user.email,
        name: user.nombre,
        resetUrl: resetUrl.toString(),
        expiresAt,
      });
    } catch (_error) {
      await users.clearResetToken(user._id, tokenHash);
      // Keep status and body independent of account existence on delivery errors.
    }

    return res.status(202).json(GENERIC_REQUEST_RESPONSE);
  }

  async function resetPassword(req, res) {
    const { token, password } = req.body || {};
    if (!validatePassword(password)) {
      return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres" });
    }
    if (typeof token !== "string" || !/^[a-f0-9]{64}$/i.test(token)) {
      return res.status(400).json(INVALID_TOKEN_RESPONSE);
    }

    const passwordHash = await hashPassword(password);
    const user = await users.consumeResetToken(
      hashPasswordResetToken(token),
      passwordHash,
      new Date(now()),
    );
    if (!user) {
      return res.status(400).json(INVALID_TOKEN_RESPONSE);
    }

    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
    return res.json({ ok: true });
  }

  return { requestReset, resetPassword };
}

module.exports = {
  createPasswordRecoveryHandlers,
  GENERIC_REQUEST_RESPONSE,
  SERVICE_UNAVAILABLE_RESPONSE,
  INVALID_TOKEN_RESPONSE,
};

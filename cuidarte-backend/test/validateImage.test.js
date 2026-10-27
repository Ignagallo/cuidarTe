const test = require("node:test");
const assert = require("node:assert/strict");
const validateImage = require("../utils/validateImage");

test("accepts supported image signatures and derives a safe extension", () => {
  assert.equal(validateImage("image/jpeg", Buffer.from([0xff, 0xd8, 0xff, 0x00])), ".jpg");
  assert.equal(validateImage("image/png", Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])), ".png");
  const webp = Buffer.alloc(12);
  webp.write("RIFF", 0, "ascii");
  webp.write("WEBP", 8, "ascii");
  assert.equal(validateImage("image/webp", webp), ".webp");
});

test("rejects MIME spoofing and unsupported formats", () => {
  assert.equal(validateImage("image/png", Buffer.from("not an image")), null);
  assert.equal(validateImage("image/svg+xml", Buffer.from("<svg />")), null);
});

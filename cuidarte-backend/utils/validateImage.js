const imageTypes = {
  "image/jpeg": {
    extension: ".jpg",
    matches: (buffer) => buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff,
  },
  "image/png": {
    extension: ".png",
    matches: (buffer) => buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])),
  },
  "image/webp": {
    extension: ".webp",
    matches: (buffer) => buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP",
  },
};

module.exports = function validateImage(mimetype, buffer) {
  const type = imageTypes[mimetype];
  return type && type.matches(buffer) ? type.extension : null;
};

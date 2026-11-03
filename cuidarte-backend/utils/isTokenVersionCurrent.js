module.exports = function isTokenVersionCurrent(payloadVersion, userVersion) {
  return (payloadVersion ?? 0) === (userVersion ?? 0);
};

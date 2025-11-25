// middleware/blacklist.js
const blacklistedTokens = new Map(); // token -> exp (seconds)

function add(token, exp) {
  blacklistedTokens.set(token, exp);
}

function isBlacklisted(token) {
  const exp = blacklistedTokens.get(token);
  if (!exp) return false;
  if (Date.now() > exp * 1000) {
    blacklistedTokens.delete(token);
    return false;
  }
  return true;
}

module.exports = { blacklistedTokens, add, isBlacklisted };

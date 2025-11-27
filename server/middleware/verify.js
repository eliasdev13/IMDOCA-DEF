const jwt = require("jsonwebtoken");
const { blacklistedTokens } = require("./blacklist");

module.exports.verify = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json("No estás autenticado");
  }

  const token = authHeader.split(" ")[1];

  // 1️⃣ Revisar blacklist
  if (blacklistedTokens.has(token)) {
    return res.status(403).json("Token revocado");
  }

  // 2️⃣ Verificar token
  jwt.verify(token, process.env.JWT_ACCESS, (err, decoded) => {
    if (err) {
      return res.status(403).json("Token inválido o expirado");
    }

    // 🔥 NORMALIZAR CAMPOS
    req.user = {
      uid: decoded.user_id ?? decoded.uid,
      roleId: decoded.rol_id ?? decoded.roleId
    };

    if (!req.user.uid || !req.user.roleId) {
      return res.status(403).json("Token mal formado");
    }

    next();
  });
};

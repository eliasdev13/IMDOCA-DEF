const jwt = require('jsonwebtoken');
const { blacklistedTokens } = require('./blacklist'); // importamos la blacklist

module.exports.verify = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json("No estás autenticado");
    }

    const token = authHeader.split(" ")[1];

    // 1️⃣ Revisar si el token está en la blacklist
    if (blacklistedTokens.has(token)) {
        return res.status(403).json("Token revocado");
    }

    // 2️⃣ Verificar la validez del token
    jwt.verify(token, process.env.JWT_ACCESS, (err, decoded) => {
        if (err) {
            return res.status(403).json("Token inválido o expirado");
        }
        req.user = decoded; // guarda la info del payload (id, name, roleId, etc.)
        next();
    });
};

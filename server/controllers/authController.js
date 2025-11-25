// controllers/authController.js
const pool = require('../models/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { add: addBlacklist } = require('../middleware/blacklist');
const { generateAccessToken, generateRefreshToken } = require('../helpers/generateTokens');

module.exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await pool.query("SELECT * FROM usuario WHERE email=?", [email]);
    if (!rows.length) return res.status(404).json({ message: "Usuario no encontrado" });

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Contraseña incorrecta" });

    const accessToken = generateAccessToken({ user_id: user.user_id, rol_id: user.rol_id });
    generateRefreshToken(user.user_id, res); // cookie httpOnly

    res.json({
      message: "Usuario logueado correctamente",
      user: { user_id: user.user_id, name: user.name, email: user.email, rol_id: user.rol_id },
      accessToken
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error del servidor" });
  }
};

module.exports.logout = (req, res) => {
  res.clearCookie('refreshToken', { 
    httpOnly: true, 
    secure: process.env.MODO !== 'developer', 
    sameSite: 'strict' 
  });

  const authHeader = req.headers['authorization'];
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.decode(token) || {};
      const exp = decoded.exp || Math.floor(Date.now() / 1000) + 3600;
      addBlacklist(token, exp);
    } catch (err) {
      console.error('logout blacklist error', err);
    }
  }
  res.json({ message: "Sesión cerrada correctamente" });
};

module.exports.refresh = (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) return res.status(401).json({ message: "No hay token de refresco" });

  try {
    const payload = jwt.verify(token, process.env.JWT_REFRESH);
    // Cambiado payload.uid y payload.roleId → payload.user_id y payload.rol_id
    const accessToken = generateAccessToken({ user_id: payload.user_id, rol_id: payload.rol_id });
    res.json({ accessToken });
  } catch (err) {
    res.status(403).json({ message: "Refresh token inválido o expirado" });
  }
};

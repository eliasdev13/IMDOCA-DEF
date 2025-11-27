// controllers/authController.js
const pool = require('../models/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { add: addBlacklist } = require('../middleware/blacklist');

// 🔥 IMPORTACIÓN CORRECTA
const { generateAccessToken, generateRefreshToken } = require('../middleware/token');

module.exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await pool.query("SELECT * FROM usuario WHERE email=?", [email]);
    if (!rows.length) return res.status(404).json({ message: "Usuario no encontrado" });

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Contraseña incorrecta" });

    const accessToken = generateAccessToken({ user_id: user.user_id, rol_id: user.rol_id });
    generateRefreshToken(user.user_id, res);

    res.json({
      message: "Usuario logueado correctamente",
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        rol_id: user.rol_id
      },
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

  const authHeader = req.headers.authorization;
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

module.exports.refresh = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken)
      return res.status(401).json("No hay refresh token");

    jwt.verify(refreshToken, process.env.JWT_REFRESH, async (err, decoded) => {
      if (err)
        return res.status(403).json("Refresh token inválido o expirado");

      const userId = decoded.uid;

      const [[user]] = await pool.query(
        "SELECT rol_id FROM usuario WHERE user_id = ?",
        [userId]
      );

      if (!user)
        return res.status(404).json("Usuario no existe");

      const newAccessToken = generateAccessToken({
        user_id: userId,
        rol_id: user.rol_id
      });

      return res.json({ accessToken: newAccessToken });
    });

  } catch (err) {
    console.error(err);
    res.status(500).json("Error en refresh token");
  }
};

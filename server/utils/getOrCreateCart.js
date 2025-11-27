const pool = require("../models/db");

exports.getOrCreateCart = async (userId) => {
  const [rows] = await pool.query(
    "SELECT carrito_id FROM carrito WHERE user_id = ? LIMIT 1",
    [userId]
  );

  if (rows.length > 0) return rows[0].carrito_id;

  const [result] = await pool.query(
    "INSERT INTO carrito (user_id) VALUES (?)",
    [userId]
  );

  return result.insertId;
};

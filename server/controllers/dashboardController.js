const pool = require("../models/db");

// -----------------------------
// PEDIDOS HOY
// -----------------------------
exports.getPedidosHoy = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT COUNT(*) AS total
      FROM pedido
      WHERE DATE(fecha_creacion) = CURDATE();
    `);

    return res.json(rows[0]);
  } catch (err) {
    console.error("Error pedidos hoy:", err);
    res.status(500).json({ error: "Error obteniendo pedidos hoy" });
  }
};

// -----------------------------
// CLIENTES ACTIVOS
// -----------------------------
exports.getClientesActivos = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT COUNT(*) AS total FROM cliente;
    `);

    return res.json(rows[0]);
  } catch (err) {
    console.error("Error clientes activos:", err);
    res.status(500).json({ error: "Error obteniendo clientes activos" });
  }
};

// -----------------------------
// TOTAL PRODUCTOS
// -----------------------------
exports.getProductosTotal = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT COUNT(*) AS total FROM producto;
    `);

    return res.json(rows[0]);
  } catch (err) {
    console.error("Error total productos:", err);
    res.status(500).json({ error: "Error obteniendo productos" });
  }
};

// -----------------------------
// ÚLTIMOS PEDIDOS
// -----------------------------
exports.getUltimosPedidos = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT pedido_id, estado_pedido, fecha_creacion
      FROM pedido
      ORDER BY pedido_id DESC
      LIMIT 5;
    `);

    return res.json(rows);
  } catch (err) {
    console.error("Error últimos pedidos:", err);
    res.status(500).json({ error: "Error obteniendo últimos pedidos" });
  }
};

// -----------------------------
// STOCK BAJO (<= 5 cajas)
// -----------------------------
exports.getStockBajo = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        pb.nombre AS producto,
        i.stock_cajas
      FROM inventario i
      JOIN batch b ON b.batch_id = i.batch_id
      JOIN producto_presentacion_codigo ppc ON ppc.producto_presentacion_codigo_id = b.producto_presentacion_codigo_id
      JOIN producto_presentacion pp ON pp.producto_presentacion_id = ppc.producto_presentacion_id
      JOIN producto p ON p.producto_id = pp.producto_id
      JOIN producto_base pb ON pb.producto_base_id = p.producto_base_id
      WHERE i.stock_cajas <= 5
      ORDER BY i.stock_cajas ASC;
    `);

    return res.json(rows);
  } catch (err) {
    console.error("Error stock bajo:", err);
    res.status(500).json({ error: "Error obteniendo stock bajo" });
  }
};


const pool = require("../models/db");

exports.getAllInventory = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        i.batch_id,
        i.stock_cajas,
        b.codigo_lote,
        b.fecha_vencimiento,

        -- Producto
        p.producto_id,
        pb.nombre AS producto_base,
        v.nombre AS variante,
        p.imagen,  -- 👈 IMPORTANTE
        c.codigo AS ean14

      FROM inventario i
      INNER JOIN batch b ON b.batch_id = i.batch_id
      INNER JOIN producto_presentacion_codigo ppc 
        ON ppc.producto_presentacion_codigo_id = b.producto_presentacion_codigo_id
      INNER JOIN codigo c ON c.codigo_id = ppc.codigo_id
      INNER JOIN producto_presentacion pp ON pp.producto_presentacion_id = ppc.producto_presentacion_id
      INNER JOIN producto p ON p.producto_id = pp.producto_id
      INNER JOIN producto_base pb ON pb.producto_base_id = p.producto_base_id
      INNER JOIN variante v ON v.variante_id = p.variante_id

      ORDER BY p.producto_id ASC, b.batch_id ASC;
    `);

    res.json(rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al obtener inventario", error: err });
  }
};


exports.addStock = async (req, res) => {
  try {
    const { batch_id, cantidad } = req.body;

    await pool.query(
      `UPDATE inventario SET stock_cajas = stock_cajas + ? WHERE batch_id = ?`,
      [cantidad, batch_id]
    );

    res.json({ message: "Stock actualizado correctamente" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al actualizar stock", error: err });
  }
};


exports.removeStock = async (req, res) => {
  try {
    const { batch_id, cantidad } = req.body;

    // Evitar stock negativo
    const [[stock]] = await pool.query(
      `SELECT stock_cajas FROM inventario WHERE batch_id = ?`,
      [batch_id]
    );

    if (!stock) {
      return res.status(404).json({ message: "Batch no encontrado" });
    }

    if (stock.stock_cajas < cantidad) {
      return res.status(400).json({ message: "Stock insuficiente" });
    }

    await pool.query(
      `UPDATE inventario SET stock_cajas = stock_cajas - ? WHERE batch_id = ?`,
      [cantidad, batch_id]
    );

    res.json({ message: "Stock descontado correctamente" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al descontar stock", error: err });
  }
};
